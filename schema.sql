-- Complete Schema for CRM Aginnova with Migrations
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PREPARACIÓN Y LIQUIDACIÓN DE ESQUEMA ANTERIOR
-- ==========================================

-- Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Allow select for verified tenant" ON public.skydropx_config;
DROP POLICY IF EXISTS "Allow insert/update for verified tenant" ON public.skydropx_config;
DROP POLICY IF EXISTS "Allow read orders by tenant" ON public.orders;
DROP POLICY IF EXISTS "Allow mutate orders by tenant" ON public.orders;
DROP POLICY IF EXISTS "Allow read shipments by tenant" ON public.shipments;
DROP POLICY IF EXISTS "Allow mutate shipments by tenant" ON public.shipments;

-- Crear tabla tenants si no existe
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  sector VARCHAR(100),
  plan VARCHAR(50) DEFAULT 'growth' CHECK (plan IN ('startup', 'growth', 'enterprise')),
  consultant_user_id UUID,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'onboarding', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow insert/update tenants for authenticated" ON public.tenants;
CREATE POLICY "Allow read tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Allow insert/update tenants for authenticated" ON public.tenants FOR ALL USING (true);

-- ==========================================
-- 2. MIGRACIÓN DE DATOS EXISTENTES A UUID
-- ==========================================

-- Insertar tenants semilla si no existen para garantizar mapeo
INSERT INTO public.tenants (id, name, sector, plan, status)
VALUES
  ('d1a1b2c3-0000-0000-0000-000000000001', 'NALUA', 'Retail · B2C', 'growth', 'active'),
  ('d1a1b2c3-0000-0000-0000-000000000002', 'KAWDOBA', 'Manufactura · B2B', 'enterprise', 'active'),
  ('d1a1b2c3-0000-0000-0000-000000000003', 'FERREX', 'Ferretería · B2B', 'startup', 'active')
ON CONFLICT (name) DO NOTHING;

-- Si la columna tenant_id en orders es del tipo TEXT, realizar mapeo y conversión
DO $$
BEGIN
  -- Comprobar si orders.tenant_id es de tipo character varying o text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'tenant_id' 
      AND data_type IN ('character varying', 'text')
  ) THEN
    -- Mapear TEXT a UUID
    UPDATE public.orders SET tenant_id = 'd1a1b2c3-0000-0000-0000-000000000001' WHERE tenant_id = 'NALUA';
    UPDATE public.orders SET tenant_id = 'd1a1b2c3-0000-0000-0000-000000000002' WHERE tenant_id = 'KAWDOBA';
    -- Convertir columna a UUID
    ALTER TABLE public.orders ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
  END IF;

  -- Comprobar si shipments.tenant_id es de tipo character varying o text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'shipments' 
      AND column_name = 'tenant_id' 
      AND data_type IN ('character varying', 'text')
  ) THEN
    UPDATE public.shipments SET tenant_id = 'd1a1b2c3-0000-0000-0000-000000000001' WHERE tenant_id = 'NALUA';
    UPDATE public.shipments SET tenant_id = 'd1a1b2c3-0000-0000-0000-000000000002' WHERE tenant_id = 'KAWDOBA';
    ALTER TABLE public.shipments ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
  END IF;

  -- Comprobar si skydropx_config.tenant_id es de tipo character varying o text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'skydropx_config' 
      AND column_name = 'tenant_id' 
      AND data_type IN ('character varying', 'text')
  ) THEN
    UPDATE public.skydropx_config SET tenant_id = 'd1a1b2c3-0000-0000-0000-000000000001' WHERE tenant_id = 'NALUA';
    UPDATE public.skydropx_config SET tenant_id = 'd1a1b2c3-0000-0000-0000-000000000002' WHERE tenant_id = 'KAWDOBA';
    ALTER TABLE public.skydropx_config ALTER COLUMN tenant_id TYPE UUID USING tenant_id::UUID;
  END IF;
END $$;

-- ==========================================
-- 3. RECREAR TABLAS EXISTENTES CON RESTRICCIONES
-- ==========================================

-- Agregar FKs a tablas migradas si no existen
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS fk_orders_tenant;
ALTER TABLE public.orders ADD CONSTRAINT fk_orders_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS fk_shipments_tenant;
ALTER TABLE public.shipments ADD CONSTRAINT fk_shipments_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.skydropx_config DROP CONSTRAINT IF EXISTS fk_skydropx_config_tenant;
ALTER TABLE public.skydropx_config ADD CONSTRAINT fk_skydropx_config_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 4. NUEVAS TABLAS DE LA ONTOLOGÍA
-- ==========================================

-- Tabla de perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('director', 'consultor', 'finanzas', 'operaciones', 'marketing', 'success', 'cliente_mipyme')),
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Función de contexto de tenant
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Habilitar RLS en perfiles
-- IMPORTANTE: las políticas de profiles NO pueden usar get_current_tenant_id()
-- porque esa función lee profiles (deadlock circular). Usar auth.uid() directamente.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read profiles for tenant" ON public.profiles;
DROP POLICY IF EXISTS "Allow mutate profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
-- Cualquier usuario autenticado puede leer perfiles (necesario para que el director vea otros consultores)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
-- Solo puede insertar/actualizar su propio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Habilitar RLS en tablas existentes con la nueva función RLS
ALTER TABLE public.skydropx_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_skydropx_config" ON public.skydropx_config;
CREATE POLICY "tenant_isolation_skydropx_config" ON public.skydropx_config
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_orders" ON public.orders;
CREATE POLICY "tenant_isolation_orders" ON public.orders
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_shipments" ON public.shipments;
CREATE POLICY "tenant_isolation_shipments" ON public.shipments
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  lead_time_days INT DEFAULT 7,
  reliability_score DECIMAL(3, 2) DEFAULT 1.00,
  last_order_date DATE,
  average_delivery_time DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_suppliers" ON public.suppliers;
CREATE POLICY "tenant_isolation_suppliers" ON public.suppliers
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de inventario SKUs
CREATE TABLE IF NOT EXISTS public.inventory_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  reorder_point INT DEFAULT 10,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, sku)
);

ALTER TABLE public.inventory_skus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_inventory_skus" ON public.inventory_skus;
CREATE POLICY "tenant_isolation_inventory_skus" ON public.inventory_skus
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de lotes/batches
CREATE TABLE IF NOT EXISTS public.inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES public.inventory_skus(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  received_at DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'partial', 'expired', 'liquidation')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_inventory_batches" ON public.inventory_batches;
CREATE POLICY "tenant_isolation_inventory_batches" ON public.inventory_batches
  USING (sku_id IN (SELECT id FROM public.inventory_skus WHERE tenant_id = public.get_current_tenant_id()))
  WITH CHECK (sku_id IN (SELECT id FROM public.inventory_skus WHERE tenant_id = public.get_current_tenant_id()));

-- Tabla de baselines de ventas
CREATE TABLE IF NOT EXISTS public.sales_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  baseline_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  target_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  commission_tiers JSONB NOT NULL DEFAULT '{"without_improvement": 0, "on_target": 10, "double_target": 15}'::jsonb,
  period VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, period)
);

ALTER TABLE public.sales_baselines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sales_baselines" ON public.sales_baselines;
CREATE POLICY "tenant_isolation_sales_baselines" ON public.sales_baselines
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de datos de ventas
CREATE TABLE IF NOT EXISTS public.sales_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  channel VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  units INT DEFAULT 1,
  source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_sales_data" ON public.sales_data;
CREATE POLICY "tenant_isolation_sales_data" ON public.sales_data
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_alerts" ON public.alerts;
CREATE POLICY "tenant_isolation_alerts" ON public.alerts
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de recomendaciones
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  area VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  impact_estimate TEXT,
  confidence DECIMAL(3, 2),
  actions JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_recommendations" ON public.recommendations;
CREATE POLICY "tenant_isolation_recommendations" ON public.recommendations
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(100),
  contact VARCHAR(255),
  interest_level VARCHAR(50) CHECK (interest_level IN ('low', 'medium', 'high')),
  stage VARCHAR(50) CHECK (stage IN ('prospect', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_leads" ON public.leads;
CREATE POLICY "tenant_isolation_leads" ON public.leads
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de historial de uploads
CREATE TABLE IF NOT EXISTS public.data_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('ventas', 'inventario', 'campañas')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'error')),
  rows_imported INT DEFAULT 0,
  errors_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.data_uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_data_uploads" ON public.data_uploads;
CREATE POLICY "tenant_isolation_data_uploads" ON public.data_uploads
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Tabla de workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  trigger VARCHAR(255) NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation_workflows" ON public.workflows;
CREATE POLICY "tenant_isolation_workflows" ON public.workflows
  USING (tenant_id = public.get_current_tenant_id())
  WITH CHECK (tenant_id = public.get_current_tenant_id());

-- Indices de optimización
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant ON public.shipments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_tenant_date ON public.sales_data(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant_resolved ON public.alerts(tenant_id, resolved);
CREATE INDEX IF NOT EXISTS idx_inventory_skus_tenant ON public.inventory_skus(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON public.leads(tenant_id);
