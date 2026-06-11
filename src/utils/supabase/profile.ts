import { createClient } from './server'
import { createAdminClient } from './admin'

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
 *
 * Usa el cliente normal para verificar la sesión (anon key + cookies)
 * y el cliente admin (service_role) para leer/crear perfiles,
 * bypaseando RLS y evitando el error "permission denied for table profiles".
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    // 1. Verificar sesión con el cliente normal (usa cookies de sesión)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return null

    // 2. Leer el perfil con el cliente admin (bypasea RLS)
    const admin = createAdminClient()

    let { data: profile } = await admin
      .from('profiles')
      .select('*, tenant:tenants(*)')
      .eq('user_id', user.id)
      .maybeSingle()

    // 3. Si no existe el perfil, crearlo automáticamente según el email
    if (!profile && user.email) {
      const emailLower = user.email.toLowerCase()

      // Determinar tenant por dominio de correo
      let tenantName = 'NALUA'
      if (emailLower.includes('kawdoba')) {
        tenantName = 'KAWDOBA'
      } else if (emailLower.includes('ferrex')) {
        tenantName = 'FERREX'
      }

      // Determinar rol: aginnova/admin → consultor, resto → cliente_mipyme
      // Si contiene "director" → director
      let defaultRole: Profile['role'] = 'cliente_mipyme'
      if (emailLower.includes('director')) {
        defaultRole = 'director'
      } else if (emailLower.includes('aginnova') || emailLower.includes('admin') || emailLower.includes('consultor')) {
        defaultRole = 'consultor'
      }

      // Buscar tenant en la base de datos
      const { data: tenant } = await admin
        .from('tenants')
        .select('*')
        .eq('name', tenantName)
        .maybeSingle()

      if (tenant) {
        const { data: newProfile, error: insertError } = await admin
          .from('profiles')
          .insert({
            id: user.id,
            user_id: user.id,
            tenant_id: tenant.id,
            role: defaultRole,
          })
          .select('*, tenant:tenants(*)')
          .single()

        if (insertError) {
          console.error('Error al auto-crear perfil:', insertError.message)
        } else if (newProfile) {
          console.log(`✅ Perfil auto-creado: ${user.email} → ${tenantName} (${defaultRole})`)
          profile = newProfile
        }
      } else {
        console.error(`Tenant "${tenantName}" no encontrado en la base de datos.`)
      }
    }

    return profile as Profile | null
  } catch (error) {
    console.error('Error en getCurrentUserProfile:', error)
    return null
  }
}
