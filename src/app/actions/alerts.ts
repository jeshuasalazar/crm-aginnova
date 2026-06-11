'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { revalidatePath } from 'next/cache'

export interface Alert {
  id: string
  tenant_id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  resolved: boolean
  created_at: string
  resolved_at?: string
  tenantName?: string
}

/**
 * Obtiene todas las alertas para el tenant correspondiente (o todas si es consultor).
 */
export async function getAlerts(): Promise<Alert[]> {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()
  const tenantId = profile.tenant_id
  const isStaff = profile.role === 'director' || profile.role === 'consultor'

  let query = supabase
    .from('alerts')
    .select('*, tenant:tenants(name)')
    .order('created_at', { ascending: false })

  if (!isStaff) {
    query = query.eq('tenant_id', tenantId)
  }

  const { data, error } = await query
  if (error) throw error

  return (data || []).map(a => ({
    ...a,
    tenantName: a.tenant?.name || 'Cliente'
  }))
}

/**
 * Marca una alerta operativa como resuelta.
 */
export async function resolveAlertAction(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
    
    revalidatePath('/alertas')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Error al resolver alerta:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Gatilla una alerta simulada e imprime el log del envío de WhatsApp.
 */
export async function triggerMockAlert(
  type: string, 
  severity: 'low' | 'medium' | 'high' | 'critical', 
  message: string
) {
  try {
    const profile = await getCurrentUserProfile()
    if (!profile) throw new Error('Usuario no autenticado')

    const supabase = await createClient()
    const tenantId = profile.tenant_id

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        tenant_id: tenantId,
        type,
        severity,
        message,
        resolved: false
      })
      .select('*, tenant:tenants(name)')
      .single()

    if (error) throw error

    revalidatePath('/alertas')
    revalidatePath('/')
    return { 
      success: true, 
      alert: {
        ...alert,
        tenantName: alert.tenant?.name || 'Cliente'
      }
    }
  } catch (error: any) {
    console.error('Error al gatillar alerta:', error)
    return { success: false, error: error.message }
  }
}
