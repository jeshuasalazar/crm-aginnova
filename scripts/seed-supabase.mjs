// Script para inicializar datos semilla en Supabase usando service_role key
// Ejecutar con: node scripts/seed-supabase.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ywxzrfzcmmrncawbigag.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eHpyZnpjbW1ybmNhd2JpZ2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEzOTM0MCwiZXhwIjoyMDk2NzE1MzQwfQ._KNXBdPWlrh8DkF3NT8u_I989_3jGpgVCFWjEGiCDxo'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log('🌱 Iniciando seed de Supabase...\n')

  // 1. Insertar tenants semilla
  console.log('📦 Insertando tenants...')
  const { data: tenants, error: tenantsError } = await admin
    .from('tenants')
    .upsert([
      { id: 'd1a1b2c3-0000-0000-0000-000000000001', name: 'NALUA',   sector: 'Retail · B2C',      plan: 'growth',     status: 'active' },
      { id: 'd1a1b2c3-0000-0000-0000-000000000002', name: 'KAWDOBA', sector: 'Manufactura · B2B', plan: 'enterprise', status: 'active' },
      { id: 'd1a1b2c3-0000-0000-0000-000000000003', name: 'FERREX',  sector: 'Ferretería · B2B',  plan: 'startup',    status: 'active' },
    ], { onConflict: 'name', ignoreDuplicates: true })
    .select()

  if (tenantsError) {
    console.error('❌ Error insertando tenants:', tenantsError.message)
    process.exit(1)
  }
  console.log(`✅ Tenants insertados: ${tenants?.length || 0}`)

  // 2. Insertar baselines de ventas para Junio 2026
  console.log('\n📊 Insertando baselines de ventas (Junio 2026)...')
  const { error: baselinesError } = await admin
    .from('sales_baselines')
    .upsert([
      {
        tenant_id: 'd1a1b2c3-0000-0000-0000-000000000001',
        period: '2026-06',
        baseline_amount: 40000.00,
        target_amount: 60000.00,
        commission_tiers: { without_improvement: 0, on_target: 10, double_target: 15 }
      },
      {
        tenant_id: 'd1a1b2c3-0000-0000-0000-000000000002',
        period: '2026-06',
        baseline_amount: 80000.00,
        target_amount: 120000.00,
        commission_tiers: { without_improvement: 0, on_target: 10, double_target: 15 }
      },
      {
        tenant_id: 'd1a1b2c3-0000-0000-0000-000000000003',
        period: '2026-06',
        baseline_amount: 20000.00,
        target_amount: 30000.00,
        commission_tiers: { without_improvement: 0, on_target: 10, double_target: 15 }
      },
    ], { onConflict: 'tenant_id,period', ignoreDuplicates: true })

  if (baselinesError) {
    console.error('❌ Error insertando baselines:', baselinesError.message)
  } else {
    console.log('✅ Baselines insertados')
  }

  // 3. Insertar datos de ventas demo para el dashboard
  console.log('\n💰 Insertando datos de ventas demo...')
  const salesData = []
  const channels = ['web', 'punto_venta', 'email', 'marketplace']
  const tenantIds = [
    'd1a1b2c3-0000-0000-0000-000000000001',
    'd1a1b2c3-0000-0000-0000-000000000002',
  ]

  for (const tenantId of tenantIds) {
    const base = tenantId.includes('000000000001') ? 1400 : 2700
    for (let day = 1; day <= 10; day++) {
      salesData.push({
        tenant_id: tenantId,
        date: `2026-06-${String(day).padStart(2, '0')}`,
        channel: channels[day % channels.length],
        amount: (base + Math.floor(Math.random() * 800)).toFixed(2),
        units: Math.floor(Math.random() * 20) + 5,
        source: 'demo_seed',
      })
    }
  }

  const { error: salesError } = await admin.from('sales_data').insert(salesData)
  if (salesError) {
    console.error('❌ Error insertando ventas:', salesError.message)
  } else {
    console.log(`✅ ${salesData.length} registros de ventas insertados`)
  }

  // 4. Insertar alertas demo
  console.log('\n🔔 Insertando alertas demo...')
  const { error: alertsError } = await admin
    .from('alerts')
    .insert([
      {
        tenant_id: 'd1a1b2c3-0000-0000-0000-000000000001',
        type: 'TARGET_AT_RISK',
        severity: 'medium',
        message: 'Proyección de ventas NALUA está 15% por debajo de la meta mensual.',
        resolved: false,
      },
      {
        tenant_id: 'd1a1b2c3-0000-0000-0000-000000000002',
        type: 'INVENTORY_LOW',
        severity: 'high',
        message: 'SKU-001 tiene stock por debajo del punto de reorden (8 unidades).',
        resolved: false,
      },
    ])

  if (alertsError) {
    console.error('❌ Error insertando alertas:', alertsError.message)
  } else {
    console.log('✅ Alertas demo insertadas')
  }

  // 5. Verificación final
  console.log('\n🔍 Verificando datos...')
  const { data: finalTenants } = await admin.from('tenants').select('id, name, plan, status')
  console.log('Tenants en DB:', finalTenants)

  console.log('\n✅ Seed completado exitosamente!')
  console.log('ℹ️  Ahora puedes iniciar sesión en el CRM.')
}

seed().catch(console.error)
