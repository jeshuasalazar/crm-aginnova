#!/bin/bash
# Ejecutar desde la carpeta repo/
# chmod +x git_push.sh && ./git_push.sh

cd "$(dirname "$0")"

echo "🔓 Limpiando git lock..."
rm -f .git/index.lock

echo "📦 Verificando estado..."
git status

echo "➕ Agregando archivos modificados..."
git add src/app/login/page.tsx \
        src/utils/supabase/middleware.ts \
        src/utils/supabase/profile.ts \
        src/utils/supabase/admin.ts \
        verify_supabase_state.sql

echo "💾 Commit..."
git commit -m "fix: repara login y protección de rutas

- login/page.tsx: window.location.href='/' reemplaza router.push()+refresh()
  Fuerza recarga completa para que el servidor lea cookies de sesión frescas
- middleware.ts: añade protección de rutas (redirect /login si no auth,
  redirect / si ya autenticado y visita /login)
- admin.ts: nuevo cliente Supabase con service_role para bypass RLS
- profile.ts: usa admin client para leer/crear perfiles (evita permission denied)
- verify_supabase_state.sql: script de diagnóstico del schema en Supabase"

echo "🚀 Push a main → Railway desplegará automáticamente..."
git push origin main

echo "✅ Listo."
