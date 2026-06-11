import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en las variables de entorno.')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const NALUA_ID = 'd1a1b2c3-0000-0000-0000-000000000001'
const KAWDOBA_ID = 'd1a1b2c3-0000-0000-0000-000000000002'
const FERREX_ID = 'd1a1b2c3-0000-0000-0000-000000000003'
const TENANTS = [NALUA_ID, KAWDOBA_ID, FERREX_ID]

async function cleanAndSeed() {
  console.log('🌱 Iniciando limpieza y repoblación de base de datos para NALUA, KAWDOBA y FERREX...\n')

  // 1. Eliminar datos existentes en orden de dependencias para evitar violaciones de FK
  console.log('🗑️  Limpiando tablas antiguas...')
  
  await admin.from('shipments').delete().in('tenant_id', TENANTS)
  await admin.from('orders').delete().in('tenant_id', TENANTS)
  await admin.from('workflows').delete().in('tenant_id', TENANTS)
  await admin.from('data_uploads').delete().in('tenant_id', TENANTS)
  await admin.from('leads').delete().in('tenant_id', TENANTS)
  await admin.from('recommendations').delete().in('tenant_id', TENANTS)
  await admin.from('alerts').delete().in('tenant_id', TENANTS)
  await admin.from('sales_data').delete().in('tenant_id', TENANTS)
  await admin.from('sales_baselines').delete().in('tenant_id', TENANTS)
  
  // Para borrar lotes, primero eliminamos por SKU id
  const { data: skuIds } = await admin.from('inventory_skus').select('id').in('tenant_id', TENANTS)
  if (skuIds && skuIds.length > 0) {
    const ids = skuIds.map(s => s.id)
    await admin.from('inventory_batches').delete().in('sku_id', ids)
  }
  await admin.from('inventory_skus').delete().in('tenant_id', TENANTS)
  await admin.from('suppliers').delete().in('tenant_id', TENANTS)
  await admin.from('skydropx_config').delete().in('tenant_id', TENANTS)

  console.log('✅ Tablas limpias.')

  // 2. Insertar / Actualizar Tenants
  console.log('\n📦 Insertando tenants...')
  const { data: tenantsRes, error: tenantsError } = await admin
    .from('tenants')
    .upsert([
      { id: NALUA_ID, name: 'NALUA', sector: 'Retail · B2C', plan: 'growth', status: 'active' },
      { id: KAWDOBA_ID, name: 'KAWDOBA', sector: 'Manufactura · B2B', plan: 'enterprise', status: 'active' },
      { id: FERREX_ID, name: 'FERREX', sector: 'Ferretería · B2B', plan: 'startup', status: 'active' }
    ], { onConflict: 'name' })
    .select()

  if (tenantsError) throw tenantsError
  console.log('✅ Tenants listos:', tenantsRes.map(t => t.name).join(', '))

  // 3. Insertar Skydropx Config
  console.log('📦 Configurando origen de Skydropx...')
  const { error: skydropxError } = await admin
    .from('skydropx_config')
    .insert([
      {
        tenant_id: NALUA_ID,
        api_key: 'skydropx_sandbox_token_here',
        default_origin_address: {
          name: "NALUA Oficial",
          phone: "5512345678",
          street: "Avenida Álvaro Obregón",
          number: "120",
          neighborhood: "Roma Norte",
          city: "Ciudad de México",
          state: "CDMX",
          postal_code: "06700",
          country: "MX"
        }
      },
      {
        tenant_id: KAWDOBA_ID,
        api_key: 'skydropx_sandbox_token_here',
        default_origin_address: {
          name: "KAWDOBA Industrial",
          phone: "5587654321",
          street: "Calle Industrial",
          number: "45",
          neighborhood: "Vallejo",
          city: "Ciudad de México",
          state: "CDMX",
          postal_code: "02300",
          country: "MX"
        }
      },
      {
        tenant_id: FERREX_ID,
        api_key: 'skydropx_sandbox_token_here',
        default_origin_address: {
          name: "FERREX Principal",
          phone: "5533221100",
          street: "Calzada de Tlalpan",
          number: "840",
          neighborhood: "Niños Héroes de Chapultepec",
          city: "Ciudad de México",
          state: "CDMX",
          postal_code: "03440",
          country: "MX"
        }
      }
    ])
  if (skydropxError) console.error('❌ Error Skydropx config:', skydropxError.message)
  else console.log('✅ Configuración de Skydropx insertada.')

  // 4. Insertar Baselines de Ventas (Junio 2026)
  console.log('📊 Insertando baselines financieros...')
  const { error: baselinesError } = await admin
    .from('sales_baselines')
    .insert([
      { tenant_id: NALUA_ID, baseline_amount: 40000.00, target_amount: 60000.00, commission_tiers: { without_improvement: 0, on_target: 10, double_target: 15 }, period: '2026-06' },
      { tenant_id: KAWDOBA_ID, baseline_amount: 150000.00, target_amount: 180000.00, commission_tiers: { without_improvement: 0, on_target: 8, double_target: 12 }, period: '2026-06' },
      { tenant_id: FERREX_ID, baseline_amount: 80000.00, target_amount: 95000.00, commission_tiers: { without_improvement: 0, on_target: 10, double_target: 15 }, period: '2026-06' }
    ])
  if (baselinesError) console.error('❌ Error Baselines:', baselinesError.message)
  else console.log('✅ Baselines financieros insertados.')

  // 5. Insertar Datos de Ventas diarios
  console.log('💰 Insertando histórico de ventas (Junio 2026)...')
  const sales = [
    // NALUA B2C
    { tenant_id: NALUA_ID, date: '2026-06-01', channel: 'web', amount: 5500.00, units: 11, source: 'Google' },
    { tenant_id: NALUA_ID, date: '2026-06-02', channel: 'web', amount: 3200.00, units: 7, source: 'Meta' },
    { tenant_id: NALUA_ID, date: '2026-06-03', channel: 'whatsapp', amount: 1800.00, units: 3, source: 'instagram' },
    { tenant_id: NALUA_ID, date: '2026-06-04', channel: 'web', amount: 4100.00, units: 8, source: 'Google' },
    { tenant_id: NALUA_ID, date: '2026-06-05', channel: 'whatsapp', amount: 2500.00, units: 5, source: 'newsletter' },
    { tenant_id: NALUA_ID, date: '2026-06-06', channel: 'web', amount: 7800.00, units: 15, source: 'Meta' },
    { tenant_id: NALUA_ID, date: '2026-06-07', channel: 'web', amount: 6200.00, units: 12, source: 'Google' },
    { tenant_id: NALUA_ID, date: '2026-06-08', channel: 'whatsapp', amount: 3900.00, units: 8, source: 'instagram' },
    { tenant_id: NALUA_ID, date: '2026-06-09', channel: 'web', amount: 5100.00, units: 10, source: 'Google' },
    { tenant_id: NALUA_ID, date: '2026-06-10', channel: 'web', amount: 4900.00, units: 9, source: 'Meta' },
    // KAWDOBA B2B
    { tenant_id: KAWDOBA_ID, date: '2026-06-01', channel: 'punto_venta', amount: 25000.00, units: 5, source: 'tienda_fisica' },
    { tenant_id: KAWDOBA_ID, date: '2026-06-03', channel: 'email', amount: 48000.00, units: 10, source: 'wholesale' },
    { tenant_id: KAWDOBA_ID, date: '2026-06-05', channel: 'punto_venta', amount: 18000.00, units: 3, source: 'tienda_fisica' },
    { tenant_id: KAWDOBA_ID, date: '2026-06-07', channel: 'email', amount: 35000.00, units: 7, source: 'wholesale' },
    { tenant_id: KAWDOBA_ID, date: '2026-06-09', channel: 'punto_venta', amount: 21000.00, units: 4, source: 'tienda_fisica' },
    { tenant_id: KAWDOBA_ID, date: '2026-06-10', channel: 'email', amount: 18000.00, units: 3, source: 'wholesale' },
    // FERREX B2B
    { tenant_id: FERREX_ID, date: '2026-06-02', channel: 'punto_venta', amount: 15000.00, units: 150, source: 'tienda_fisica' },
    { tenant_id: FERREX_ID, date: '2026-06-04', channel: 'web', amount: 32000.00, units: 320, source: 'Google' },
    { tenant_id: FERREX_ID, date: '2026-06-06', channel: 'punto_venta', amount: 18000.00, units: 180, source: 'tienda_fisica' },
    { tenant_id: FERREX_ID, date: '2026-06-08', channel: 'web', amount: 22000.00, units: 220, source: 'Google' },
    { tenant_id: FERREX_ID, date: '2026-06-10', channel: 'punto_venta', amount: 12300.00, units: 120, source: 'tienda_fisica' }
  ]
  const { error: salesError } = await admin.from('sales_data').insert(sales)
  if (salesError) console.error('❌ Error Ventas:', salesError.message)
  else console.log('✅ Ventas insertadas.')

  // 6. Insertar Proveedores
  console.log('📦 Insertando proveedores...')
  const { error: suppliersError } = await admin
    .from('suppliers')
    .insert([
      { id: 'a1b2c3d4-0001-0000-0000-000000000001', tenant_id: NALUA_ID, name: 'Textiles del Sur', contact: 'proveedor1@nalua.com', lead_time_days: 5, reliability_score: 0.95, last_order_date: '2026-05-25', average_delivery_time: 4.8 },
      { id: 'a1b2c3d4-0002-0000-0000-000000000001', tenant_id: NALUA_ID, name: 'Empaques Premium', contact: 'ventas@premium.com', lead_time_days: 3, reliability_score: 0.98, last_order_date: '2026-06-01', average_delivery_time: 2.9 },
      { id: 'a1b2c3d4-0001-0000-0000-000000000002', tenant_id: KAWDOBA_ID, name: 'Cacao Fino Tabasco', contact: 'ventas@cacaotabasco.com', lead_time_days: 6, reliability_score: 0.94, last_order_date: '2026-05-28', average_delivery_time: 5.9 },
      { id: 'a1b2c3d4-0002-0000-0000-000000000002', tenant_id: KAWDOBA_ID, name: 'Moldes y Plásticos', contact: 'produccion@moldes.com', lead_time_days: 10, reliability_score: 0.90, last_order_date: '2026-06-02', average_delivery_time: 9.8 },
      { id: 'a1b2c3d4-0001-0000-0000-000000000003', tenant_id: FERREX_ID, name: 'Ferretera Nacional S.A.', contact: 'distribucion@ferreteranacional.mx', lead_time_days: 4, reliability_score: 0.96, last_order_date: '2026-06-01', average_delivery_time: 3.8 },
      { id: 'a1b2c3d4-0002-0000-0000-000000000003', tenant_id: FERREX_ID, name: 'Aceros y Perfiles Méx', contact: 'ventas@acerosperfiles.mx', lead_time_days: 8, reliability_score: 0.91, last_order_date: '2026-05-22', average_delivery_time: 7.9 }
    ])
  if (suppliersError) console.error('❌ Error Proveedores:', suppliersError.message)
  else console.log('✅ Proveedores insertados.')

  // 7. Insertar SKUs de Inventario
  console.log('📦 Insertando catálogo de SKUs...')
  const { error: skusError } = await admin
    .from('inventory_skus')
    .insert([
      // NALUA
      { id: 'e1f2a3b4-0001-0000-0000-000000000001', tenant_id: NALUA_ID, sku: 'SK-NALUA-01', name: 'Vestido Lino Verano', category: 'Vestuario B2C', unit_cost: 250.00, unit_price: 750.00, reorder_point: 30, supplier_id: 'a1b2c3d4-0001-0000-0000-000000000001' },
      { id: 'e1f2a3b4-0002-0000-0000-000000000001', tenant_id: NALUA_ID, sku: 'SK-NALUA-02', name: 'Camisa Algodón Orgánico', category: 'Vestuario B2C', unit_cost: 180.00, unit_price: 520.00, reorder_point: 20, supplier_id: 'a1b2c3d4-0001-0000-0000-000000000001' },
      { id: 'e1f2a3b4-0003-0000-0000-000000000001', tenant_id: NALUA_ID, sku: 'SK-NALUA-03', name: 'Bolsa E-Commerce Kraft', category: 'Empaque', unit_cost: 2.50, unit_price: 8.00, reorder_point: 100, supplier_id: 'a1b2c3d4-0002-0000-0000-000000000001' },
      // KAWDOBA
      { id: 'e1f2a3b4-0001-0000-0000-000000000002', tenant_id: KAWDOBA_ID, sku: 'SK-KAW-CHOCO-01', name: 'Trufa Chocolate Oscuro 70%', category: 'Alimentos B2B', unit_cost: 15.00, unit_price: 35.00, reorder_point: 50, supplier_id: 'a1b2c3d4-0001-0000-0000-000000000002' },
      { id: 'e1f2a3b4-0002-0000-0000-000000000002', tenant_id: KAWDOBA_ID, sku: 'SK-KAW-CHEM-05', name: 'Resina Epóxica de Brillo 5L', category: 'Empaque B2B', unit_cost: 450.00, unit_price: 950.00, reorder_point: 8, supplier_id: 'a1b2c3d4-0002-0000-0000-000000000002' },
      // FERREX
      { id: 'e1f2a3b4-0001-0000-0000-000000000003', tenant_id: FERREX_ID, sku: 'SK-FER-ROD-38', name: 'Varilla Corrugada 3/8"', category: 'Materiales', unit_cost: 85.00, unit_price: 150.00, reorder_point: 100, supplier_id: 'a1b2c3d4-0001-0000-0000-000000000003' },
      { id: 'e1f2a3b4-0002-0000-0000-000000000003', tenant_id: FERREX_ID, sku: 'SK-FER-CEMENT-50', name: 'Cemento Gris Cruz Azul 50kg', category: 'Materiales', unit_cost: 120.00, unit_price: 210.00, reorder_point: 15, supplier_id: 'a1b2c3d4-0001-0000-0000-000000000003' },
      { id: 'e1f2a3b4-0003-0000-0000-000000000003', tenant_id: FERREX_ID, sku: 'SK-FER-HAMMER', name: 'Martillo Truper de Uña 16oz', category: 'Herramientas', unit_cost: 95.00, unit_price: 180.00, reorder_point: 10, supplier_id: 'a1b2c3d4-0002-0000-0000-000000000003' }
    ])
  if (skusError) console.error('❌ Error SKUs:', skusError.message)
  else console.log('✅ Catálogo de SKUs listo.')

  // 8. Insertar Lotes de Inventario
  console.log('📦 Recibiendo lotes de mercancía en almacén...')
  const { error: batchesError } = await admin
    .from('inventory_batches')
    .insert([
      // NALUA
      { sku_id: 'e1f2a3b4-0001-0000-0000-000000000001', quantity: 60, received_at: '2026-05-15', expiry_date: '2027-05-15', status: 'active' },
      { sku_id: 'e1f2a3b4-0002-0000-0000-000000000001', quantity: 12, received_at: '2026-06-01', expiry_date: '2027-06-01', status: 'active' }, // Stock bajo!
      { sku_id: 'e1f2a3b4-0003-0000-0000-000000000001', quantity: 500, received_at: '2026-06-01', expiry_date: null, status: 'active' },
      // KAWDOBA
      { sku_id: 'e1f2a3b4-0001-0000-0000-000000000002', quantity: 200, received_at: '2026-05-20', expiry_date: '2026-07-20', status: 'active' }, // Trufas (corta vida útil)
      { sku_id: 'e1f2a3b4-0002-0000-0000-000000000002', quantity: 10, received_at: '2026-04-10', expiry_date: '2026-06-25', status: 'active' }, // Caducidad inminente (alerta PEPS >60% vida consumida)
      // FERREX
      { sku_id: 'e1f2a3b4-0001-0000-0000-000000000003', quantity: 250, received_at: '2026-05-20', expiry_date: null, status: 'active' },
      { sku_id: 'e1f2a3b4-0002-0000-0000-000000000003', quantity: 8, received_at: '2026-06-01', expiry_date: '2026-09-01', status: 'active' }, // Stock bajo (8 u)
      { sku_id: 'e1f2a3b4-0003-0000-0000-000000000003', quantity: 35, received_at: '2026-06-05', expiry_date: null, status: 'active' }
    ])
  if (batchesError) console.error('❌ Error Lotes:', batchesError.message)
  else console.log('✅ Lotes de inventario insertados.')

  // 9. Insertar Alertas Operativas
  console.log('🔔 Insertando alertas operativas...')
  const { error: alertsError } = await admin
    .from('alerts')
    .insert([
      { tenant_id: NALUA_ID, type: 'INVENTORY_LOW', severity: 'medium', message: 'Stock bajo para SKU SK-NALUA-02 (Camisa Algodón Orgánico). Quedan 12 unidades (Punto reorden: 20).', resolved: false },
      { tenant_id: KAWDOBA_ID, type: 'EXPIRY_WARNING', severity: 'high', message: 'Resina Epóxica de Brillo 5L (SK-KAW-CHEM-05) ha superado el 60% de su vida útil. Caduca el 25-Jun-2026.', resolved: false },
      { tenant_id: KAWDOBA_ID, type: 'TARGET_AT_RISK', severity: 'high', message: 'Meta mensual en riesgo: Proyección actual $165,000, meta $180,000.', resolved: false },
      { tenant_id: FERREX_ID, type: 'INVENTORY_LOW', severity: 'high', message: 'Stock crítico para Cemento Gris Cruz Azul 50kg (SK-FER-CEMENT-50). Quedan 8 bultos (Punto reorden: 15).', resolved: false }
    ])
  if (alertsError) console.error('❌ Error Alertas:', alertsError.message)
  else console.log('✅ Alertas operativas insertadas.')

  // 10. Insertar Recomendaciones IA
  console.log('🧠 Generando recomendaciones de IA...')
  const { error: recsError } = await admin
    .from('recommendations')
    .insert([
      {
        tenant_id: NALUA_ID,
        area: 'Ventas',
        content: 'Aumentar presupuesto publicitario en Meta Ads un 20% para el Vestido Lino Verano, debido a que el ROAS observado se mantiene en 3.4x durante la última semana.',
        impact_estimate: '+$4,500 en ventas incrementales en 10 días',
        confidence: 0.90,
        actions: ['Incrementar presupuesto diario de $50 a $60 USD', 'Optimizar audiencias interesadas en Moda Sustentable'],
        status: 'pending'
      },
      {
        tenant_id: NALUA_ID,
        area: 'Inventario',
        content: 'Realizar orden de reposición inmediata para el SKU SK-NALUA-02 (Camisa Algodón Orgánico) con Textiles del Sur, dado que el stock está por debajo del límite mínimo.',
        impact_estimate: 'Evitar quiebre de inventario por 12 días',
        confidence: 0.95,
        actions: ['Generar orden de compra de 40 piezas', 'Coordinar con Textiles del Sur (lead time 5 días)'],
        status: 'pending'
      },
      {
        tenant_id: KAWDOBA_ID,
        area: 'Ventas',
        content: 'Lanzar campaña de liquidación con 35% de descuento para distribuidores del lote de Resina Epóxica que vence el 25 de Junio, minimizando mermas operativas.',
        impact_estimate: 'Recuperar $6,175 en costo de inventario y evitar pérdidas por caducidad.',
        confidence: 0.88,
        actions: ['Enviar correo masivo a distribuidores registrados', 'Activar cupón liquidación-35 en portal mayorista'],
        status: 'pending'
      },
      {
        tenant_id: FERREX_ID,
        area: 'Inventario',
        content: 'Ordenar 50 bultos de Cemento Gris 50kg con Ferretera Nacional. El stock actual de 8 bultos durará solo 4 días al ritmo de venta registrado.',
        impact_estimate: 'Reponer inventario antes del quiebre. Costo estimado: $6,000 MXN.',
        confidence: 0.97,
        actions: ['Confirmar orden de compra con Ferretera Nacional', 'Solicitar entrega para el día lunes'],
        status: 'pending'
      }
    ])
  if (recsError) console.error('❌ Error Recomendaciones IA:', recsError.message)
  else console.log('✅ Recomendaciones de IA insertadas.')

  // 11. Insertar Leads
  console.log('👥 Creando leads comerciales...')
  const { error: leadsError } = await admin
    .from('leads')
    .insert([
      { tenant_id: NALUA_ID, name: 'Boutique Flor de Mayo', source: 'Instagram', contact: 'admin@flordemayo.com', interest_level: 'medium', stage: 'contacted', converted: false },
      { tenant_id: NALUA_ID, name: 'Estudio Creativo Nómada', source: 'Recomendado', contact: 'contacto@nomada.com', interest_level: 'high', stage: 'proposal', converted: false },
      { tenant_id: KAWDOBA_ID, name: 'Constructoras del Centro', source: 'Feria Comercial', contact: 'proyectos@centrocon.mx', interest_level: 'high', stage: 'negotiation', converted: false },
      { tenant_id: KAWDOBA_ID, name: 'Herramientas y Perfiles', source: 'Google Search', contact: 'compras@herramientas.com', interest_level: 'low', stage: 'prospect', converted: false },
      { tenant_id: FERREX_ID, name: 'Desarrollos Inmobiliarios del Bajío', source: 'Venta Directa', contact: 'compras@desarrollosbajio.mx', interest_level: 'high', stage: 'proposal', converted: false },
      { tenant_id: FERREX_ID, name: 'Constructora Alfa CDMX', source: 'Recomendado', contact: 'proyectos@constructoralfa.com', interest_level: 'medium', stage: 'contacted', converted: false }
    ])
  if (leadsError) console.error('❌ Error Leads:', leadsError.message)
  else console.log('✅ Leads insertados.')

  // 12. Insertar Workflows
  console.log('⚡ Configurando workflows de automatización...')
  const { error: workflowsError } = await admin
    .from('workflows')
    .insert([
      // NALUA
      { tenant_id: NALUA_ID, name: 'B2C: Recuperación de Carrito Abandonado', trigger: 'cart_abandoned AND dias_sin_actividad >= 1', actions: [{ tipo: 'email', template: 'cart_recovery_d1', delay_hours: 24 }, { tipo: 'email', template: 'cart_recovery_d3', delay_hours: 72 }], status: 'active' },
      { tenant_id: NALUA_ID, name: 'B2C: Encuesta NPS de Satisfacción', trigger: 'order_delivered AND dias_desde_entrega = 2', actions: [{ tipo: 'whatsapp', message: '¿Cómo fue tu experiencia de compra con NALUA? Responde de 1 a 10.' }], status: 'active' },
      // KAWDOBA
      { tenant_id: KAWDOBA_ID, name: 'B2B: Alerta de Caducidad de Lote (PEPS)', trigger: 'expiry_date_days <= 15', actions: [{ tipo: 'alert', message: 'Crear campaña de liquidación automatizada para el lote por vencer.' }], status: 'active' },
      { tenant_id: KAWDOBA_ID, name: 'B2B: Control de SLA de Confirmación', trigger: 'order_created AND hours_elapsed >= 12 AND status = "pending"', actions: [{ tipo: 'alert_critical', message: 'SLA de 12 horas superado en pedido pendiente.' }], status: 'active' },
      // FERREX
      { tenant_id: FERREX_ID, name: 'B2B: Notificación de Stock Crítico', trigger: 'sku_stock <= reorder_point', actions: [{ tipo: 'alert', message: 'Emitir borrador de orden de compra automática al proveedor asignado.' }], status: 'active' }
    ])
  if (workflowsError) console.error('❌ Error Workflows:', workflowsError.message)
  else console.log('✅ Workflows de automatización creados.')

  // 13. Insertar Órdenes y Envíos
  console.log('📦 Creando bandeja de órdenes y pedidos piloto...');
  const orderSeeds = [
    // NALUA
    { id: '1c6a9f77-9980-4459-8601-14adb2eef5f2', tenant_id: NALUA_ID, customer_name: 'Sofía Rodríguez', customer_email: 'sofia@example.com', customer_phone: '5511223344', shipping_address: { street: 'Paseo de la Reforma', number: '222', neighborhood: 'Juárez', city: 'Ciudad de México', state: 'CDMX', postal_code: '06600', country: 'MX' }, source: 'ecommerce', status: 'pending', total_amount: 1450.00 },
    { id: 'd1582387-8c47-4aa5-82e1-ea8a3e8fdcbe', tenant_id: NALUA_ID, customer_name: 'Mariana López', customer_email: 'mariana@example.com', customer_phone: '5522334455', shipping_address: { street: 'Avenida Chapultepec', number: '350', neighborhood: 'Roma Norte', city: 'Ciudad de México', state: 'CDMX', postal_code: '06700', country: 'MX' }, source: 'whatsapp', status: 'pending', total_amount: 890.00 },
    { id: '3f6c8d7e-1111-0000-0000-000000000001', tenant_id: NALUA_ID, customer_name: 'Carlos Gómez', customer_email: 'carlos@example.com', customer_phone: '5533445566', shipping_address: { street: 'Calle Madero', number: '15', neighborhood: 'Centro', city: 'Ciudad de México', state: 'CDMX', postal_code: '06000', country: 'MX' }, source: 'instagram', status: 'shipped', total_amount: 2100.00 },
    
    // KAWDOBA
    { id: 'ecf6432a-17cf-4e03-8da1-8af4499e34bf', tenant_id: KAWDOBA_ID, customer_name: 'Distribuidora del Norte', customer_email: 'compras@distnorte.com', customer_phone: '8188889999', shipping_address: { street: 'Avenida Eugenio Garza Sada', number: '1234', neighborhood: 'Tecnológico', city: 'Monterrey', state: 'Nuevo León', postal_code: '64700', country: 'MX' }, source: 'manual', status: 'pending', total_amount: 15400.00 },
    { id: '3f6c8d7e-2222-0000-0000-000000000002', tenant_id: KAWDOBA_ID, customer_name: 'Metales y Perfiles Monterrey', customer_email: 'ventas@metalesperfiles.mx', customer_phone: '8199998888', shipping_address: { street: 'Constitución', number: '450', neighborhood: 'Centro', city: 'Monterrey', state: 'Nuevo León', postal_code: '64000', country: 'MX' }, source: 'manual', status: 'shipped', total_amount: 28000.00 },

    // FERREX
    { id: '3f6c8d7e-3333-0000-0000-000000000003', tenant_id: FERREX_ID, customer_name: 'Constructora Delta Bajío', customer_email: 'proyectos@deltabajio.mx', customer_phone: '4421234567', shipping_address: { street: 'Prolongación Bernardo Quintana', number: '100', neighborhood: 'Centro', city: 'Querétaro', state: 'Querétaro', postal_code: '76000', country: 'MX' }, source: 'manual', status: 'pending', total_amount: 32000.00 },
    { id: '3f6c8d7e-4444-0000-0000-000000000003', tenant_id: FERREX_ID, customer_name: 'Ferretería Central Querétaro', customer_email: 'contacto@ferreteriace.mx', customer_phone: '4429876543', shipping_address: { street: 'Zaragoza', number: '54', neighborhood: 'San Francisquito', city: 'Querétaro', state: 'Querétaro', postal_code: '76040', country: 'MX' }, source: 'manual', status: 'shipped', total_amount: 12300.00 }
  ]

  const { error: ordersError } = await admin.from('orders').insert(orderSeeds)
  if (ordersError) {
    console.error('❌ Error Órdenes:', ordersError.message)
    return
  }
  console.log('✅ Órdenes de prueba creadas.')

  // 14. Insertar Envíos Labeled para las órdenes shipped
  console.log('🚚 Creando registros de envíos y guías...');
  const shipmentSeeds = [
    {
      tenant_id: NALUA_ID,
      order_id: '3f6c8d7e-1111-0000-0000-000000000001',
      skydropx_shipment_id: 'mock_ship_uuid_nalua_101',
      rate_id: 'mock_rate_fedex_101',
      tracking_number: 'MOCKTRK1122334455',
      label_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      carrier: 'FEDEX',
      status: 'labeled'
    },
    {
      tenant_id: KAWDOBA_ID,
      order_id: '3f6c8d7e-2222-0000-0000-000000000002',
      skydropx_shipment_id: 'mock_ship_uuid_kaw_202',
      rate_id: 'mock_rate_dhl_202',
      tracking_number: 'MOCKTRK9988776655',
      label_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      carrier: 'DHL',
      status: 'delivered'
    },
    {
      tenant_id: FERREX_ID,
      order_id: '3f6c8d7e-4444-0000-0000-000000000003',
      skydropx_shipment_id: 'mock_ship_uuid_fer_303',
      rate_id: 'mock_rate_estafeta_303',
      tracking_number: 'MOCKTRK5566778899',
      label_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      carrier: 'ESTAFETA',
      status: 'delivered'
    }
  ]
  const { error: shipmentsError } = await admin.from('shipments').insert(shipmentSeeds)
  if (shipmentsError) console.error('❌ Error Envíos:', shipmentsError.message)
  else console.log('✅ Envíos y guías creadas.')

  console.log('\n🌟 ¡Limpieza y Repoblación de Base de Datos completada exitosamente!')
}

cleanAndSeed().catch(console.error)
