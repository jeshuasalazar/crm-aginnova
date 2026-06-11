-- Seed Data for CRM Aginnova
-- Inserta los tenants piloto con UUIDs predecibles
INSERT INTO public.tenants (id, name, sector, plan, status)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'NALUA', 'Retail · B2C', 'growth', 'active'),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'KAWDOBA', 'Manufactura · B2B', 'enterprise', 'active'),
  ('d1a1b2c3-0000-0000-0000-000000000003', 'FERREX', 'Ferretería · B2B', 'startup', 'active')
ON CONFLICT (name) DO UPDATE SET 
  sector = EXCLUDED.sector,
  plan = EXCLUDED.plan,
  status = EXCLUDED.status;

-- Inserta las configuraciones por defecto de Skydropx para los tenants
INSERT INTO public.skydropx_config (tenant_id, api_key, default_origin_address)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'skydropx_sandbox_token_here', '{
    "name": "NALUA Oficial",
    "phone": "5512345678",
    "street": "Avenida Álvaro Obregón",
    "number": "120",
    "neighborhood": "Roma Norte",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postal_code": "06700",
    "country": "MX"
  }'),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'skydropx_sandbox_token_here', '{
    "name": "KAWDOBA Industrial",
    "phone": "5587654321",
    "street": "Calle Industrial",
    "number": "45",
    "neighborhood": "Vallejo",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postal_code": "02300",
    "country": "MX"
  }')
ON CONFLICT (tenant_id) DO NOTHING;

-- Seed de Baselines para el cálculo de ROI/comisiones (Junio 2026)
INSERT INTO public.sales_baselines (tenant_id, baseline_amount, target_amount, commission_tiers, period)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 40000.00, 60000.00, '{"without_improvement": 0, "on_target": 10, "double_target": 15}', '2026-06'),
  ('d1a1b2c3-0000-0000-0000-000000000002', 150000.00, 180000.00, '{"without_improvement": 0, "on_target": 8, "double_target": 12}', '2026-06'),
  ('d1a1b2c3-0000-0000-0000-000000000003', 80000.00, 95000.00, '{"without_improvement": 0, "on_target": 10, "double_target": 15}', '2026-06')
ON CONFLICT (tenant_id, period) DO NOTHING;

-- Seed de Datos de Ventas históricos (los últimos 30 días)
INSERT INTO public.sales_data (tenant_id, date, channel, amount, units, source)
VALUES
  -- NALUA (Ventas B2C)
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-01', 'web', 5500.00, 11, 'Google'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-02', 'web', 3200.00, 7, 'Meta'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-03', 'whatsapp', 1800.00, 3, 'instagram'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-04', 'web', 4100.00, 8, 'Google'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-05', 'whatsapp', 2500.00, 5, 'newsletter'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-06', 'web', 7800.00, 15, 'Meta'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-07', 'web', 6200.00, 12, 'Google'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-08', 'whatsapp', 3900.00, 8, 'instagram'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-09', 'web', 5100.00, 10, 'Google'),
  ('d1a1b2c3-0000-0000-0000-000000000001', '2026-06-10', 'web', 4900.00, 9, 'Meta'),

  -- KAWDOBA (Ventas B2B)
  ('d1a1b2c3-0000-0000-0000-000000000002', '2026-06-01', 'punto_venta', 25000.00, 5, 'tienda_fisica'),
  ('d1a1b2c3-0000-0000-0000-000000000002', '2026-06-03', 'email', 48000.00, 10, 'wholesale'),
  ('d1a1b2c3-0000-0000-0000-000000000002', '2026-06-05', 'punto_venta', 18000.00, 3, 'tienda_fisica'),
  ('d1a1b2c3-0000-0000-0000-000000000002', '2026-06-07', 'email', 35000.00, 7, 'wholesale'),
  ('d1a1b2c3-0000-0000-0000-000000000002', '2026-06-09', 'punto_venta', 21000.00, 4, 'tienda_fisica'),
  ('d1a1b2c3-0000-0000-0000-000000000002', '2026-06-10', 'email', 18000.00, 3, 'wholesale'),

  -- FERREX (Ferretería B2B)
  ('d1a1b2c3-0000-0000-0000-000000000003', '2026-06-02', 'punto_venta', 15000.00, 150, 'tienda_fisica'),
  ('d1a1b2c3-0000-0000-0000-000000000003', '2026-06-04', 'web', 32000.00, 320, 'Google'),
  ('d1a1b2c3-0000-0000-0000-000000000003', '2026-06-06', 'punto_venta', 18000.00, 180, 'tienda_fisica'),
  ('d1a1b2c3-0000-0000-0000-000000000003', '2026-06-08', 'web', 22000.00, 220, 'Google'),
  ('d1a1b2c3-0000-0000-0000-000000000003', '2026-06-10', 'punto_venta', 12300.00, 120, 'tienda_fisica')
ON CONFLICT DO NOTHING;

-- Seed de Proveedores (Suppliers)
INSERT INTO public.suppliers (id, tenant_id, name, contact, lead_time_days, reliability_score, last_order_date, average_delivery_time)
VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001', 'd1a1b2c3-0000-0000-0000-000000000001', 'Textiles del Sur', 'proveedor1@nalua.com', 5, 0.95, '2026-05-25', 4.8),
  ('a1b2c3d4-0002-0000-0000-000000000001', 'd1a1b2c3-0000-0000-0000-000000000001', 'Empaques Premium', 'ventas@premium.com', 3, 0.98, '2026-06-01', 2.9),
  ('a1b2c3d4-0001-0000-0000-000000000002', 'd1a1b2c3-0000-0000-0000-000000000002', 'Acero del Norte', 'aceronorte@kawdoba.com', 12, 0.88, '2026-05-20', 11.5),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'd1a1b2c3-0000-0000-0000-000000000002', 'Químicos y Resinas', 'quimicos@kawdoba.com', 7, 0.92, '2026-06-05', 7.1)
ON CONFLICT (id) DO NOTHING;

-- Seed de SKUs de Inventario (UUIDs corregidos a formato hex válido)
INSERT INTO public.inventory_skus (id, tenant_id, sku, name, category, unit_cost, unit_price, reorder_point, supplier_id)
VALUES
  -- NALUA SKUs
  ('e1f2a3b4-0001-0000-0000-000000000001', 'd1a1b2c3-0000-0000-0000-000000000001', 'SK-NALUA-01', 'Vestido Lino Verano', 'Vestuario B2C', 250.00, 750.00, 30, 'a1b2c3d4-0001-0000-0000-000000000001'),
  ('e1f2a3b4-0002-0000-0000-000000000001', 'd1a1b2c3-0000-0000-0000-000000000001', 'SK-NALUA-02', 'Camisa Algodón Orgánico', 'Vestuario B2C', 180.00, 520.00, 20, 'a1b2c3d4-0001-0000-0000-000000000001'),
  ('e1f2a3b4-0003-0000-0000-000000000001', 'd1a1b2c3-0000-0000-0000-000000000001', 'SK-NALUA-03', 'Bolsa E-Commerce Kraft', 'Empaque', 2.50, 8.00, 100, 'a1b2c3d4-0002-0000-0000-000000000001'),

  -- KAWDOBA SKUs
  ('e1f2a3b4-0001-0000-0000-000000000002', 'd1a1b2c3-0000-0000-0000-000000000002', 'SK-KAW-STEEL-10', 'Placa de Acero Reforzado 10mm', 'Materia Prima B2B', 1200.00, 2500.00, 15, 'a1b2c3d4-0001-0000-0000-000000000002'),
  ('e1f2a3b4-0002-0000-0000-000000000002', 'd1a1b2c3-0000-0000-0000-000000000002', 'SK-KAW-CHEM-05', 'Resina Industrial Epóxica 5L', 'Químicos B2B', 450.00, 950.00, 8, 'a1b2c3d4-0002-0000-0000-000000000002')
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- Seed de Lotes de Inventario
INSERT INTO public.inventory_batches (sku_id, quantity, received_at, expiry_date, status)
VALUES
  -- Vestidos de Lino
  ('e1f2a3b4-0001-0000-0000-000000000001', 50, '2026-05-15', '2027-05-15', 'active'),
  -- Camisas de Algodón
  ('e1f2a3b4-0002-0000-0000-000000000001', 12, '2026-06-01', '2027-06-01', 'active'),
  -- Placas de Acero
  ('e1f2a3b4-0001-0000-0000-000000000002', 30, '2026-05-10', NULL, 'active'),
  -- Resina Industrial
  ('e1f2a3b4-0002-0000-0000-000000000002', 10, '2026-04-10', '2026-06-25', 'active')
ON CONFLICT DO NOTHING;

-- Seed de Alertas Operativas activas
INSERT INTO public.alerts (tenant_id, type, severity, message, resolved)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'INVENTORY_LOW', 'medium', 'Stock bajo para SKU SK-NALUA-02 (Camisa Algodón Orgánico). Quedan 12 unidades.', false),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'EXPIRY_WARNING', 'high', 'Resina Industrial Epóxica 5L (SKU: SK-KAW-CHEM-05) caduca en menos de 15 días (2026-06-25).', false),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'TARGET_AT_RISK', 'high', 'Meta de ventas en riesgo para KAWDOBA: Proyectado $153,000, meta $180,000.', false)
ON CONFLICT DO NOTHING;

-- Seed de Recomendaciones IA Prefabricadas
INSERT INTO public.recommendations (tenant_id, area, content, impact_estimate, confidence, actions, status)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'Ventas', 'Aumentar presupuesto publicitario en Meta Ads un 20% para el Vestido Lino Verano, debido a que el ROAS observado se mantiene en 3.4x durante la última semana.', '+$4,500 en ventas incrementales en 10 días', 0.90, '["Incrementar presupuesto diario de $50 a $60 USD", "Optimizar audiencias interesadas en Moda Sustentable"]', 'pending'),
  ('d1a1b2c3-0000-0000-0000-000000000001', 'Inventario', 'Realizar órden de reposición inmediata para el SKU SK-NALUA-02 (Camisa Algodón Orgánico) con Textiles del Sur, dado que el stock de seguridad se ha visto superado por demanda acumulada.', 'Prevenir quiebre de stock por 12 días', 0.95, '["Emitir orden de compra por 50 unidades", "Coordinar entrega rápida (lead time 5 días)"]', 'pending'),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'Ventas', 'Crear una campaña de liquidación al por mayor del lote de Resina Epóxica que expira el 25 de Junio, ofreciendo un 35% de descuento a distribuidores para reducir pérdidas al 0%.', 'Recuperación de $6,175 en costo de inventario', 0.85, '["Generar plantilla de correo a distribuidores clave", "Ofrecer 35% off por compras mayores a 5 unidades"]', 'pending')
ON CONFLICT DO NOTHING;

-- Seed de Leads para el pipeline
INSERT INTO public.leads (tenant_id, name, source, contact, interest_level, stage, converted)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'Estudio Creativo Nómada', 'Recomendado', 'contacto@nomada.com', 'high', 'proposal', false),
  ('d1a1b2c3-0000-0000-0000-000000000001', 'Boutique Flor de Mayo', 'Instagram', 'admin@flordemayo.com', 'medium', 'contacted', false),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'Constructoras del Centro', 'Feria Comercial', 'proyectos@centrocon.mx', 'high', 'negotiation', false),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'Herramientas y Perfiles', 'Google Search', 'compras@herramientasyperfiles.com', 'low', 'prospect', false)
ON CONFLICT DO NOTHING;
