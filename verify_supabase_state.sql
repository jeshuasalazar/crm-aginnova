-- ============================================================
-- SCRIPT DE VERIFICACIÓN — CRM Aginnova
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Muestra el estado actual del schema sin modificar nada
-- ============================================================

-- 1. Tablas existentes
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS col_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Tenants semilla (deben existir 3)
SELECT id, name, sector, plan, status FROM public.tenants ORDER BY name;

-- 3. Perfiles existentes
SELECT p.id, p.user_id, p.role, t.name AS tenant
FROM public.profiles p
LEFT JOIN public.tenants t ON t.id = p.tenant_id;

-- 4. RLS habilitado en tablas críticas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tenants', 'orders', 'shipments', 'sales_data', 'alerts')
ORDER BY tablename;

-- 5. Políticas RLS activas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Función get_current_tenant_id existe
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'get_current_tenant_id';

-- 7. Usuarios de Supabase Auth (demo accounts)
-- NOTA: Descomentar solo si tienes permisos de service_role en el SQL Editor
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at;
