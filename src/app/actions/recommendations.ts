'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { revalidatePath } from 'next/cache'

export interface Recommendation {
  id: string
  tenant_id: string
  area: string
  content: string
  impact_estimate?: string
  confidence?: number
  actions?: string[]
  status: 'pending' | 'approved' | 'edited' | 'dismissed'
  created_at: string
}

/**
 * Obtiene las recomendaciones de IA. Los consultores ven todas (incluidas pendientes);
 * los clientes ven únicamente aquellas aprobadas por su consultor.
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Usuario no autenticado')

  const supabase = await createClient()
  const tenantId = profile.tenant_id
  const isStaff = profile.role === 'director' || profile.role === 'consultor'

  let query = supabase
    .from('recommendations')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (!isStaff) {
    query = query.eq('status', 'approved')
  }

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((r) => {
    let parsedActions: string[] = []
    if (Array.isArray(r.actions)) {
      parsedActions = r.actions
    } else if (typeof r.actions === 'string') {
      try {
        parsedActions = JSON.parse(r.actions)
      } catch {
        parsedActions = [r.actions]
      }
    }
    return {
      ...r,
      actions: parsedActions
    }
  })
}

/**
 * Actualiza el estado de aprobación de una recomendación (Aprobar, Rechazar, Editar).
 */
export async function updateRecommendationStatus(
  id: string,
  status: 'approved' | 'dismissed' | 'edited',
  content?: string
) {
  try {
    const supabase = await createClient()
    const updatePayload: any = { status }
    if (content) {
      updatePayload.content = content
      if (status === 'edited') {
        updatePayload.status = 'approved' // Al editar, se marca aprobada directamente
      }
    }

    const { error } = await supabase
      .from('recommendations')
      .update(updatePayload)
      .eq('id', id)

    if (error) throw error
    
    revalidatePath('/recomendaciones')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Error al actualizar recomendación:', error)
    return { success: false, error: error.message }
  }
}
