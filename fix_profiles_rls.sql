-- ============================================================
-- FIX URGENTE: RLS de tabla profiles
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Descripción: Corrige el error "permission denied for table profiles"
-- ============================================================

-- 1. Eliminar políticas antiguas conflictivas
DROP POLICY IF EXISTS "Allow read profiles for tenant" ON public.profiles;
DROP POLICY IF EXISTS "Allow mutate profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- 2. Asegurar que RLS esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Política de lectura: cualquier usuario autenticado puede leer perfiles
--    (necesario para que el director vea perfiles de consultores)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Política de inserción: solo puede crear su PROPIO perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Política de actualización: solo puede modificar su PROPIO perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Asegurar que la tabla tenants es legible para usuarios autenticados
DROP POLICY IF EXISTS "Allow read tenants" ON public.tenants;
CREATE POLICY "Allow read tenants" ON public.tenants
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 7. Verificar que la función get_current_tenant_id existe
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 8. Insertar tenants semilla si no existen
INSERT INTO public.tenants (id, name, sector, plan, status)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'NALUA',   'Retail · B2C',      'growth',     'active'),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'KAWDOBA', 'Manufactura · B2B', 'enterprise', 'active'),
  ('d1a1b2c3-0000-0000-0000-000000000003', 'FERREX',  'Ferretería · B2B',  'startup',    'active')
ON CONFLICT (name) DO NOTHING;

-- ✅ Listo. Después de ejecutar esto:
--    1. Abre el CRM en el navegador
--    2. Inicia sesión con tu correo
--    3. El perfil se creará automáticamente en el primer login
