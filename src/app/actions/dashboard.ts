'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'

export interface DashboardStats {
  activeClientsCount: number
  totalSalesMonth: number
  pendingCommission: number
  unresolvedAlertsCount: number
  role: string
  tenantName: string
  clients: Array<{
    id: string
    name: string
    sector: string
    plan: string
    status: string
    salesCurrent: number
    baseline: number
    target: number
    commission: number
    color: 'green' | 'yellow' | 'red'
  }>
  pendingActions: Array<{
    id: string
    title: string
    desc: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    actionLabel: string
    actionHref: string
  }>
}

/**
 * Obtiene las métricas clave para el panel del Dashboard, adaptándolas
 * según el rol del usuario autenticado (Director/Consultor ve todo; Cliente ve solo lo suyo).
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const profile = await getCurrentUserProfile()
  if (!profile) {
    throw new Error('Usuario no autenticado')
  }

  const supabase = await createClient()
  const tenantId = profile.tenant_id
  const isStaff = profile.role === 'director' || profile.role === 'consultor'

  // 1. Obtener lista de tenants aplicables
  let activeClientsCount = 0
  let tenantsList: any[] = []

  if (isStaff) {
    const { data: tenants } = await supabase
      .from('tenants')
      .select('*')
      .eq('status', 'active')
    activeClientsCount = tenants?.length || 0
    tenantsList = tenants || []
  } else {
    activeClientsCount = 1
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle()
    if (tenant) tenantsList = [tenant]
  }

  // 2. Calcular ventas del mes y comisiones pendientes (Junio 2026)
  const startDate = '2026-06-01'
  const endDate = '2026-06-30'
  const currentPeriod = '2026-06'

  const clientsData = []
  let totalSalesAll = 0
  let totalCommissionAll = 0

  for (const t of tenantsList) {
    // Obtener suma de ventas en sales_data para el período actual
    const { data: sales } = await supabase
      .from('sales_data')
      .select('amount')
      .eq('tenant_id', t.id)
      .gte('date', startDate)
      .lte('date', endDate)
    
    const salesCurrent = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
    totalSalesAll += salesCurrent

    // Obtener baseline
    const { data: baseline } = await supabase
      .from('sales_baselines')
      .select('*')
      .eq('tenant_id', t.id)
      .eq('period', currentPeriod)
      .maybeSingle()

    const baselineAmount = baseline ? Number(baseline.baseline_amount) : 0
    const targetAmount = baseline ? Number(baseline.target_amount) : 0
    const tiers = baseline?.commission_tiers as any || { without_improvement: 0, on_target: 10, double_target: 15 }

    // Calcular comisiones del período
    let commission = 0
    let color: 'green' | 'yellow' | 'red' = 'yellow'
    
    if (salesCurrent > baselineAmount) {
      const incremental = salesCurrent - baselineAmount
      let rate = Number(tiers.without_improvement || 0)
      
      if (salesCurrent >= targetAmount * 2) {
        rate = Number(tiers.double_target || 15)
        color = 'green'
      } else if (salesCurrent >= targetAmount) {
        rate = Number(tiers.on_target || 10)
        color = 'green'
      } else {
        rate = Number(tiers.without_improvement || 0)
        color = 'yellow'
      }
      
      commission = (incremental * rate) / 100
    } else {
      color = 'red'
    }

    totalCommissionAll += commission

    clientsData.push({
      id: t.id,
      name: t.name,
      sector: t.sector || 'General',
      plan: t.plan || 'growth',
      status: t.status || 'active',
      salesCurrent,
      baseline: baselineAmount,
      target: targetAmount,
      commission,
      color
    })
  }

  // 3. Obtener conteo de alertas sin resolver
  let alertsCountQuery = supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false)
    
  if (!isStaff) {
    alertsCountQuery = alertsCountQuery.eq('tenant_id', tenantId)
  }
  
  const { count: alertsCount } = await alertsCountQuery
  const unresolvedAlertsCount = alertsCount || 0

  // 4. Obtener las últimas 3 acciones/alertas pendientes
  let alertsListQuery = supabase
    .from('alerts')
    .select('*, tenant:tenants(name)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!isStaff) {
    alertsListQuery = alertsListQuery.eq('tenant_id', tenantId)
  }

  const { data: rawAlerts } = await alertsListQuery

  const pendingActions = (rawAlerts || []).map((alert: any) => ({
    id: alert.id,
    title: alert.type === 'INVENTORY_LOW' 
      ? `Stock Bajo: ${alert.tenant?.name || 'Cliente'}` 
      : alert.type === 'EXPIRY_WARNING' 
      ? `Caducidad Próxima: ${alert.tenant?.name || 'Cliente'}`
      : `Meta en Riesgo: ${alert.tenant?.name || 'Cliente'}`,
    desc: alert.message,
    severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
    actionLabel: alert.type === 'INVENTORY_LOW' ? 'Cargar' : 'IA',
    actionHref: alert.type === 'INVENTORY_LOW' ? '/inventario' : '/recomendaciones'
  }))

  return {
    activeClientsCount,
    totalSalesMonth: totalSalesAll,
    pendingCommission: totalCommissionAll,
    unresolvedAlertsCount,
    role: profile.role,
    tenantName: profile.tenant?.name || 'Aginnova',
    clients: clientsData,
    pendingActions
  }
}
