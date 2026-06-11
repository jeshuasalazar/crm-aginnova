'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { revalidatePath } from 'next/cache'

export interface Workflow {
  id: string
  tenant_id: string
  name: string
  trigger: string
  actions: Array<{ tipo: string; template?: string; delay_hours?: number; message?: string }>
  status: 'active' | 'inactive'
  created_at: string
}

/**
 * Obtiene las automatizaciones del tenant actual. Si no existen, auto-crea
 * las 6 automatizaciones comerciales predefinidas para el piloto (B2C, B2B, Aginnova).
 */
export async function getWorkflows(): Promise<Workflow[]> {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()
  const tenantId = profile.tenant_id

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Si no hay workflows cargados, poblar los 6 workflows de la fase piloto
  if (!data || data.length === 0) {
    const defaultWorkflows = []

    if (profile.tenant?.name === 'NALUA') {
      defaultWorkflows.push(
        {
          tenant_id: tenantId,
          name: 'B2C: Recuperación de Carrito Abandonado',
          trigger: 'cart_abandoned AND dias_sin_actividad >= 1',
          actions: [
            { tipo: 'email', template: 'cart_recovery_d1', delay_hours: 24 },
            { tipo: 'email', template: 'cart_recovery_d3', delay_hours: 72 }
          ],
          status: 'active'
        },
        {
          tenant_id: tenantId,
          name: 'B2C: Encuesta NPS de Satisfacción',
          trigger: 'order_delivered AND dias_desde_entrega = 2',
          actions: [
            { tipo: 'whatsapp', message: '¿Cómo fue tu experiencia de compra con NALUA? Responde de 1 a 10.' }
          ],
          status: 'active'
        },
        {
          tenant_id: tenantId,
          name: 'B2C: Segmentación Dinámica (Tagging)',
          trigger: 'purchase_completed',
          actions: [
            { tipo: 'tag', message: 'Etiquetar como Cliente VIP si compras acumuladas ≥ 5' }
          ],
          status: 'active'
        }
      )
    } else if (profile.tenant?.name === 'KAWDOBA') {
      defaultWorkflows.push(
        {
          tenant_id: tenantId,
          name: 'B2B: Liquidación de Stock por Caducidad Próxima',
          trigger: 'batch.dias_hasta_caducidad <= 30',
          actions: [
            { tipo: 'email', template: 'wholesale_liquidation', message: 'Notificar 35% de descuento en lote de Resina Epóxica a distribuidores.' }
          ],
          status: 'active'
        }
      )
    }

    // Agregar workflows genéricos de Aginnova
    defaultWorkflows.push(
      {
        tenant_id: tenantId,
        name: 'Aginnova: Bienvenida y Onboarding de Cliente',
        trigger: 'tenant.status = "onboarding"',
        actions: [
          { tipo: 'email', template: 'welcome_onboarding' },
          { tipo: 'task', message: 'Solicitar firma de Baseline Agreement' }
        ],
        status: 'active'
      },
      {
        tenant_id: tenantId,
        name: 'Aginnova: Cierre y Reporte ROI Mensual',
        trigger: 'end_of_month',
        actions: [
          { tipo: 'generate_report', template: 'monthly_roi_report' },
          { tipo: 'email', template: 'monthly_report_delivery' }
        ],
        status: 'active'
      }
    )

    const { data: inserted, error: insertError } = await supabase
      .from('workflows')
      .insert(defaultWorkflows)
      .select()

    if (insertError) {
      console.error('Error al poblar workflows semilla:', insertError.message)
    } else if (inserted) {
      return inserted as Workflow[]
    }
  }

  return data || []
}

/**
 * Activa o desactiva un workflow.
 */
export async function toggleWorkflowStatus(id: string, currentStatus: 'active' | 'inactive') {
  try {
    const supabase = await createClient()
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    const { error } = await supabase
      .from('workflows')
      .update({ status: nextStatus })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/workflows')
    return { success: true }
  } catch (error: any) {
    console.error('Error al togglear workflow:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Crea un workflow comercial personalizado.
 */
export async function createWorkflowRecord(data: {
  name: string
  trigger: string
  actions: any[]
}) {
  try {
    const profile = await getCurrentUserProfile()
    if (!profile) throw new Error('Usuario no autenticado')

    const supabase = await createClient()
    const { data: wf, error } = await supabase
      .from('workflows')
      .insert({
        tenant_id: profile.tenant_id,
        name: data.name,
        trigger: data.trigger,
        actions: data.actions,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/workflows')
    return { success: true, wf }
  } catch (error: any) {
    console.error('Error al crear workflow:', error)
    return { success: false, error: error.message }
  }
}
