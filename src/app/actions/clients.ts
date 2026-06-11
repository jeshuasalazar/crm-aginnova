'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { revalidatePath } from 'next/cache'

export interface Client {
  id: string
  name: string
  sector: string
  plan: 'startup' | 'growth' | 'enterprise'
  consultant_user_id?: string
  status: 'active' | 'inactive' | 'onboarding' | 'paused'
  created_at: string
  baseline_amount?: number
  target_amount?: number
  commission_tiers?: {
    without_improvement: number
    on_target: number
    double_target: number
  }
  kpi_health?: 'green' | 'yellow' | 'red'
}

/**
 * Obtiene todos los clientes (tenants) junto con sus parámetros financieros del baseline para el consultor.
 */
export async function getClients(): Promise<Client[]> {
  const profile = await getCurrentUserProfile()
  if (!profile || (profile.role !== 'director' && profile.role !== 'consultor')) {
    throw new Error('No autorizado para ver clientes')
  }

  const supabase = await createClient()
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  const clients: Client[] = []
  const currentPeriod = '2026-06'
  const startDate = '2026-06-01'
  const endDate = '2026-06-30'

  for (const tenant of tenants || []) {
    // Obtener baseline
    const { data: baseline } = await supabase
      .from('sales_baselines')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('period', currentPeriod)
      .maybeSingle()

    // Obtener ventas reales para semáforo
    const { data: sales } = await supabase
      .from('sales_data')
      .select('amount')
      .eq('tenant_id', tenant.id)
      .gte('date', startDate)
      .lte('date', endDate)

    const salesCurrent = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
    const baselineAmount = baseline ? Number(baseline.baseline_amount) : 0
    const targetAmount = baseline ? Number(baseline.target_amount) : 0

    let color: 'green' | 'yellow' | 'red' = 'yellow'
    if (salesCurrent > baselineAmount) {
      if (salesCurrent >= targetAmount) {
        color = 'green'
      } else {
        color = 'yellow'
      }
    } else {
      color = 'red'
    }

    clients.push({
      ...tenant,
      baseline_amount: baselineAmount,
      target_amount: targetAmount,
      commission_tiers: baseline?.commission_tiers || {
        without_improvement: 0,
        on_target: 10,
        double_target: 15
      },
      kpi_health: color
    })
  }

  return clients
}

/**
 * Crea un nuevo cliente (tenant) y su baseline financiero mediante el asistente de onboarding.
 */
export async function createClientRecord(data: {
  name: string
  sector: string
  plan: 'startup' | 'growth' | 'enterprise'
  baseline_amount: number
  target_amount: number
  commission_tiers: {
    without_improvement: number
    on_target: number
    double_target: number
  }
  status: 'active' | 'inactive' | 'onboarding' | 'paused'
}) {
  try {
    const supabase = await createClient()
    
    // 1. Insertar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: data.name,
        sector: data.sector,
        plan: data.plan,
        status: data.status
      })
      .select()
      .single()

    if (tenantError) throw tenantError

    // 2. Insertar baseline de ventas inicial para Junio 2026
    const { error: baselineError } = await supabase
      .from('sales_baselines')
      .insert({
        tenant_id: tenant.id,
        baseline_amount: data.baseline_amount,
        target_amount: data.target_amount,
        commission_tiers: data.commission_tiers,
        period: '2026-06'
      })

    if (baselineError) throw baselineError

    revalidatePath('/clientes')
    revalidatePath('/')
    return { success: true, tenant }
  } catch (error: any) {
    console.error('Error creating client:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Actualiza el estatus de un cliente (tenant).
 */
export async function updateClientStatus(id: string, status: 'active' | 'inactive' | 'onboarding' | 'paused') {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('tenants')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/clientes')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating client status:', error)
    return { success: false, error: error.message }
  }
}
