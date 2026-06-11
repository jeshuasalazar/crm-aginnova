'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'

const NALUA_ID = 'd1a1b2c3-0000-0000-0000-000000000001'
const KAWDOBA_ID = 'd1a1b2c3-0000-0000-0000-000000000002'
const FERREX_ID = 'd1a1b2c3-0000-0000-0000-000000000003'

export interface ClientDetails {
  id: string
  name: string
  sector: string
  plan: string
  status: string
  baselineAmount: number
  targetAmount: number
  commissionRate: number
  commissionAmount: number
  salesCurrent: number
  salesIncremental: number
  commissionBracket: 'none' | 'on_target' | 'double_target'
  history: Array<{
    period: string
    actual: number
    baseline: number
    commission: number
  }>
  skus: Array<{
    id: string
    sku: string
    name: string
    category: string
    unit_cost: number
    unit_price: number
    reorder_point: number
    margin_percent: number
    stock: number
  }>
  batches: Array<{
    id: string
    sku: string
    sku_name: string
    quantity: number
    received_at: string
    expiry_date?: string
    status: string
    dias_hasta_caducidad?: number
    life_percent?: number
    alert_60_pct?: boolean
  }>
  alerts: Array<{
    id: string
    type: string
    severity: string
    message: string
    created_at: string
  }>
  recommendations: Array<{
    id: string
    area: string
    content: string
    impact_estimate?: string
    confidence: number
    actions: string[]
    status: string
  }>
  leads: Array<{
    id: string
    name: string
    source: string
    contact: string
    interest_level: string
    stage: string
  }>
  workflows: Array<{
    id: string
    name: string
    trigger: string
    actions: any[]
    status: string
  }>
  logistics: {
    slaOrders: number // in hours
    onTimeRate: number // in %
    activeOrders: number
    returnRate: number // in %
  }
  marketing: {
    ctr: number // in %
    reach: number
    cpc: number // in MXN
    roas: number
    chartData: Array<{ label: string; values: Record<string, number> }>
  }
}

export async function getClientDetails(clientId: string): Promise<ClientDetails | null> {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()

  // 1. Obtener información básica del tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', clientId)
    .maybeSingle()

  if (tenantError || !tenant) {
    console.error('Error fetching tenant details:', tenantError)
    return null
  }

  const currentPeriod = '2026-06'
  const startDate = '2026-06-01'
  const endDate = '2026-06-30'

  // 2. Obtener baseline financiero
  const { data: baseline } = await supabase
    .from('sales_baselines')
    .select('*')
    .eq('tenant_id', clientId)
    .eq('period', currentPeriod)
    .maybeSingle()

  const baselineAmount = baseline ? Number(baseline.baseline_amount) : 40000.00
  const targetAmount = baseline ? Number(baseline.target_amount) : 60000.00
  const tiers = baseline?.commission_tiers as any || {
    without_improvement: 0,
    on_target: 10,
    double_target: 15
  }

  // 3. Obtener ventas del mes (Junio 2026)
  const { data: sales } = await supabase
    .from('sales_data')
    .select('amount')
    .eq('tenant_id', clientId)
    .gte('date', startDate)
    .lte('date', endDate)

  const salesCurrent = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0

  // 4. Calcular comisiones escalonadas
  let commissionRate = 0
  let commissionAmount = 0
  let commissionBracket: 'none' | 'on_target' | 'double_target' = 'none'
  const salesIncremental = Math.max(0, salesCurrent - baselineAmount)

  if (salesCurrent > baselineAmount) {
    if (salesCurrent >= targetAmount * 2) {
      commissionRate = Number(tiers.double_target || 15)
      commissionBracket = 'double_target'
    } else if (salesCurrent >= targetAmount) {
      commissionRate = Number(tiers.on_target || 10)
      commissionBracket = 'on_target'
    } else {
      commissionRate = Number(tiers.without_improvement || 0)
      commissionBracket = 'none'
    }
    commissionAmount = (salesIncremental * commissionRate) / 100
  }

  // 5. Historial de comisiones (últimos 3 meses)
  const periods = ['2026-04', '2026-05', '2026-06']
  const history = []

  for (const p of periods) {
    let actual = 0
    let base = baselineAmount
    let comm = 0

    const { data: pBaseline } = await supabase
      .from('sales_baselines')
      .select('*')
      .eq('tenant_id', clientId)
      .eq('period', p)
      .maybeSingle()

    if (pBaseline) {
      base = Number(pBaseline.baseline_amount)
    }

    const pStart = `${p}-01`
    const pEnd = `${p}-30`
    const { data: pSales } = await supabase
      .from('sales_data')
      .select('amount')
      .eq('tenant_id', clientId)
      .gte('date', pStart)
      .lte('date', pEnd)

    const dbSalesSum = pSales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0

    if (dbSalesSum === 0) {
      // Fallbacks para datos vacíos históricos
      if (p === '2026-04') {
        actual = base + (clientId === FERREX_ID ? 5000 : 8000)
        comm = ((actual - base) * 10) / 100
      } else if (p === '2026-05') {
        actual = base + (clientId === FERREX_ID ? 11000 : 14000)
        comm = ((actual - base) * (clientId === KAWDOBA_ID ? 8 : 10)) / 100
      } else {
        actual = salesCurrent
        comm = commissionAmount
      }
    } else {
      actual = dbSalesSum
      const pIncremental = actual - base
      if (actual > base && pIncremental > 0) {
        const pTarget = pBaseline ? Number(pBaseline.target_amount) : targetAmount
        const pTiers = pBaseline?.commission_tiers as any || tiers
        let pRate = 0

        if (actual >= pTarget * 2) {
          pRate = Number(pTiers.double_target || 15)
        } else if (actual >= pTarget) {
          pRate = Number(pTiers.on_target || 10)
        } else {
          pRate = Number(pTiers.without_improvement || 0)
        }
        comm = (pIncremental * pRate) / 100
      }
    }

    history.push({
      period: p,
      actual,
      baseline: base,
      commission: comm
    })
  }

  // 6. Obtener SKUs e inventario
  const { data: skus, error: skusError } = await supabase
    .from('inventory_skus')
    .select('*')
    .eq('tenant_id', clientId)

  if (skusError) throw skusError

  // Obtener lotes
  const { data: dbBatches } = await supabase
    .from('inventory_batches')
    .select('*, sku:inventory_skus(*)')

  const tenantBatches = (dbBatches || []).filter((b: any) => b.sku?.tenant_id === clientId)

  const formattedBatches = tenantBatches.map((b: any) => {
    const received = new Date(b.received_at)
    const expiry = b.expiry_date ? new Date(b.expiry_date) : null
    let dias_hasta_caducidad = undefined
    let alert_60_pct = false
    let life_percent = 0

    if (expiry) {
      const diffTime = expiry.getTime() - Date.now()
      dias_hasta_caducidad = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const totalLife = expiry.getTime() - received.getTime()
      const elapsedLife = Date.now() - received.getTime()

      if (totalLife > 0) {
        life_percent = Math.min(100, Math.max(0, Math.round((elapsedLife / totalLife) * 100)))
        if (elapsedLife / totalLife >= 0.6) {
          alert_60_pct = true
        }
      }
    }

    return {
      id: b.id,
      sku: b.sku?.sku || '',
      sku_name: b.sku?.name || '',
      quantity: b.quantity,
      received_at: b.received_at,
      expiry_date: b.expiry_date || undefined,
      status: b.status,
      dias_hasta_caducidad,
      life_percent,
      alert_60_pct
    }
  })

  const formattedSkus = (skus || []).map((s: any) => {
    const skuBatches = formattedBatches.filter(b => b.sku === s.sku)
    const stock = skuBatches.reduce((sum, b) => sum + b.quantity, 0)
    return {
      id: s.id,
      sku: s.sku,
      name: s.name,
      category: s.category || 'General',
      unit_cost: Number(s.unit_cost),
      unit_price: Number(s.unit_price),
      reorder_point: Number(s.reorder_point),
      margin_percent: Number(s.unit_price) > 0 ? ((Number(s.unit_price) - Number(s.unit_cost)) / Number(s.unit_price)) * 100 : 0,
      stock
    }
  })

  // 7. Alertas
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('tenant_id', clientId)
    .eq('resolved', false)

  const formattedAlerts = (alerts || []).map((a: any) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    message: a.message,
    created_at: a.created_at
  }))

  // 8. Recomendaciones
  const { data: recs } = await supabase
    .from('recommendations')
    .select('*')
    .eq('tenant_id', clientId)

  const formattedRecs = (recs || []).map((r: any) => ({
    id: r.id,
    area: r.area,
    content: r.content,
    impact_estimate: r.impact_estimate || undefined,
    confidence: Number(r.confidence || 0.9),
    actions: Array.isArray(r.actions) ? r.actions : [],
    status: r.status
  }))

  // 9. Leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('tenant_id', clientId)

  const formattedLeads = (leads || []).map((l: any) => ({
    id: l.id,
    name: l.name,
    source: l.source || 'Desconocido',
    contact: l.contact || '',
    interest_level: l.interest_level || 'medium',
    stage: l.stage || 'prospect'
  }))

  // 10. Workflows
  const { data: workflows } = await supabase
    .from('workflows')
    .select('*')
    .eq('tenant_id', clientId)

  const formattedWorkflows = (workflows || []).map((w: any) => ({
    id: w.id,
    name: w.name,
    trigger: w.trigger,
    actions: Array.isArray(w.actions) ? w.actions : [],
    status: w.status
  }))

  // 11. Logistics metrics (simulation/aggregation)
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', clientId)

  const activeOrders = orders?.filter(o => o.status === 'pending').length || 0

  let slaOrders = 8.2
  let onTimeRate = 96
  let returnRate = 2.1

  if (clientId === KAWDOBA_ID) {
    slaOrders = 11.2 // B2B manufactura es un poco más alta
    onTimeRate = 94
    returnRate = 0.5
  } else if (clientId === FERREX_ID) {
    slaOrders = 6.8
    onTimeRate = 97
    returnRate = 1.2
  }

  const logistics = {
    slaOrders,
    onTimeRate,
    activeOrders,
    returnRate
  }

  // 12. Marketing metrics (simulation)
  let ctr = 1.1
  let reach = 42300
  let cpc = 4.80
  let roas = 4.2

  if (clientId === KAWDOBA_ID) {
    ctr = 0.8
    reach = 12500
    cpc = 12.50
    roas = 5.5
  } else if (clientId === FERREX_ID) {
    ctr = 0.95
    reach = 23000
    cpc = 7.20
    roas = 3.8
  }

  const marketingChart = [
    { label: 'Sem 1', values: { Instagram: 1.0, Facebook: 0.7, GoogleAds: 0.9 } },
    { label: 'Sem 2', values: { Instagram: 1.05, Facebook: 0.72, GoogleAds: 0.95 } },
    { label: 'Sem 3', values: { Instagram: 1.08, Facebook: 0.75, GoogleAds: 0.98 } },
    { label: 'Sem 4', values: { Instagram: 1.1, Facebook: 0.73, GoogleAds: 1.02 } }
  ]

  const marketing = {
    ctr,
    reach,
    cpc,
    roas,
    chartData: marketingChart
  }

  return {
    id: tenant.id,
    name: tenant.name,
    sector: tenant.sector || 'General',
    plan: tenant.plan || 'growth',
    status: tenant.status || 'active',
    baselineAmount,
    targetAmount,
    commissionRate,
    commissionAmount,
    salesCurrent,
    salesIncremental,
    commissionBracket,
    history,
    skus: formattedSkus,
    batches: formattedBatches,
    alerts: formattedAlerts,
    recommendations: formattedRecs,
    leads: formattedLeads,
    workflows: formattedWorkflows,
    logistics,
    marketing
  }
}
