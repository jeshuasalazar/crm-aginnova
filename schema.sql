-- Schema for Skydropx Integration in CRM Aginova

-- 1. CONFIGURACIÓN DE SKYDROPX POR TENANT
CREATE TABLE IF NOT EXISTS public.skydropx_config (
    tenant_id TEXT PRIMARY KEY,
    api_key TEXT NOT NULL,
    default_origin_address JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en skydropx_config
ALTER TABLE public.skydropx_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for verified tenant" 
    ON public.skydropx_config 
    FOR SELECT 
    USING (true); -- En un entorno real, vincular con auth.uid() y perfiles de tenant.

CREATE POLICY "Allow insert/update for verified tenant" 
    ON public.skydropx_config 
    FOR ALL 
    USING (true);

-- 2. TABLA DE ÓRDENES (E-commerce y Manuales)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    shipping_address JSONB NOT NULL, -- { street, number, neighborhood, city, state, postal_code, country }
    source TEXT NOT NULL CHECK (source IN ('ecommerce', 'manual', 'whatsapp', 'instagram')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read orders by tenant" 
    ON public.orders 
    FOR SELECT 
    USING (true); -- En producción, restringir por tenant_id del usuario actual.

CREATE POLICY "Allow mutate orders by tenant" 
    ON public.orders 
    FOR ALL 
    USING (true);

-- 3. TABLA DE ENVÍOS (Shipments)
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    skydropx_shipment_id TEXT NOT NULL,
    rate_id TEXT,
    tracking_number TEXT,
    label_url TEXT,
    carrier TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'rates_retrieved', 'labeled', 'in_transit', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en shipments
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read shipments by tenant" 
    ON public.shipments 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow mutate shipments by tenant" 
    ON public.shipments 
    FOR ALL 
    USING (true);

-- Seed de configuración para pruebas (NALUA y KAWDOBA)
-- Nota: Para pruebas, se usará un token simulado de Skydropx (o sandbox)
INSERT INTO public.skydropx_config (tenant_id, api_key, default_origin_address)
VALUES 
('NALUA', 'skydropx_sandbox_token_here', '{
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
('KAWDOBA', 'skydropx_sandbox_token_here', '{
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

-- Seed de Órdenes de prueba para NALUA y KAWDOBA
INSERT INTO public.orders (tenant_id, customer_name, customer_email, customer_phone, shipping_address, source, status, total_amount)
VALUES
('NALUA', 'Sofía Rodríguez', 'sofia@example.com', '5511223344', '{
    "street": "Paseo de la Reforma",
    "number": "222",
    "neighborhood": "Juárez",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postal_code": "06600",
    "country": "MX"
}', 'ecommerce', 'pending', 1450.00),
('NALUA', 'Mariana López', 'mariana@example.com', '5522334455', '{
    "street": "Avenida Chapultepec",
    "number": "350",
    "neighborhood": "Roma Norte",
    "city": "Ciudad de México",
    "state": "CDMX",
    "postal_code": "06700",
    "country": "MX"
}', 'whatsapp', 'pending', 890.00),
('KAWDOBA', 'Distribuidora del Norte', 'compras@distnorte.com', '8188889999', '{
    "street": "Avenida Eugenio Garza Sada",
    "number": "1234",
    "neighborhood": "Tecnológico",
    "city": "Monterrey",
    "state": "Nuevo León",
    "postal_code": "64700",
    "country": "MX"
}', 'manual', 'pending', 15400.00)
ON CONFLICT DO NOTHING;
