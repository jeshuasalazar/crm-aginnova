import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con Service Role Key.
 * - Bypasea RLS completamente.
 * - SOLO usar en Server Actions / Server Components (nunca en cliente).
 * - Necesario para operaciones admin: leer/crear profiles, etc.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
