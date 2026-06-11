import { createClient } from './server'

export interface Profile {
  id: string
  tenant_id: string
  user_id: string
  role: 'director' | 'consultor' | 'finanzas' | 'operaciones' | 'marketing' | 'success' | 'cliente_mipyme'
  created_at: string
  tenant?: {
    id: string
    name: string
    sector: string
    plan: 'startup' | 'growth' | 'enterprise'
    status: string
  }
}

/**
 * Obtiene el perfil y el tenant del usuario actualmente autenticado.
 * Si el perfil no existe, intenta crearlo automáticamente mapeando el correo del usuario
 * a los tenants semilla (NALUA, KAWDOBA, FERREX) para facilitar pruebas y desarrollo.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. Intentar leer el perfil existente de la base de datos
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*, tenant:tenants(*)')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.warn('Error al buscar perfil, intentando auto-creación:', error.message)
    }

    // 2. Si no existe, crear un perfil por defecto basado en el dominio de correo
    if (!profile && user.email) {
      let tenantName = 'NALUA'
      const emailLower = user.email.toLowerCase()
      
      if (emailLower.includes('kawdoba')) {
        tenantName = 'KAWDOBA'
      } else if (emailLower.includes('ferrex')) {
        tenantName = 'FERREX'
      }

      // Buscar el tenant correspondiente en la base de datos
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('name', tenantName)
        .maybeSingle()

      if (tenant) {
        // Determinar rol por defecto (director/consultor si es aginnova/admin, de lo contrario cliente)
        const isStaff = emailLower.includes('aginnova') || emailLower.includes('admin')
        const defaultRole = isStaff ? 'consultor' : 'cliente_mipyme'

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            user_id: user.id,
            tenant_id: tenant.id,
            role: defaultRole
          })
          .select('*, tenant:tenants(*)')
          .single()

        if (insertError) {
          console.error('Error al auto-crear perfil:', insertError.message)
        } else if (newProfile) {
          console.log(`Perfil auto-creado exitosamente para el usuario ${user.email} con tenant ${tenantName}`)
          profile = newProfile
        }
      }
    }

    return profile as Profile | null
  } catch (error) {
    console.error('Error en getCurrentUserProfile:', error)
    return null
  }
}
