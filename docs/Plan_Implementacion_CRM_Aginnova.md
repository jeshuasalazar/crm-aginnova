# CRM AGINNOVA - Plan de Implementación Ejecutable

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Confidencial  
**Preparado por:** Claude

---

## 📊 DIAGNÓSTICO DEL ESTADO ACTUAL

### ✅ Lo que funciona (40-85% PRD)

| Componente | Estado | Cobertura |
|-----------|--------|-----------|
| Auth + Login (Supabase) | Rutas protegidas, middleware funcional | 40% |
| Multi-tenant | Detectado por regex de email (NALUA/KAWDOBA) | Parcial |
| Módulo Logístico (Skydropx) | /orders y /shipments: cotización, guías multi-carrier | ~85% |
| UI / Design System | crm-styles.css robusto, responsive | Listo |
| CI/CD Railway | push a main → build → deploy automático | Listo |
| Prototipos HTML | 10 pantallas diseñadas | Referencia |

### ❌ Gaps críticos (0% - BLOQUEANTES)

| Módulo | Estado | Impacto |
|--------|--------|--------|
| M1 - Gestión de Clientes | 0% | No se puede agregar/gestionar clientes |
| M2 - Ingesta de Datos (Excel/CSV) | 0% | Sin datos, sin dashboards ni IA |
| M3 - Dashboard de KPIs | 5% | Datos hardcodeados, no refleja clientes reales |
| M4 - Panel ROI / Comisiones | 0% | No se pueden cobrar comisiones (negocio central) |
| M5 - Motor de IA | 0% | Diferenciador clave ausente |
| M6 - Sistema de Alertas | 0% | Consultores sin notificaciones reales |
| M7 - Automatizaciones B2C/B2B | 0% | Workflows justificadores del modelo ausentes |
| M8 - Panel Prospecto Demo | 0% | Sin herramienta de cierre de ventas |
| M9 - Inventario y Lotes | 0% | Crítico para KAWDOBA (0% pérdidas) |
| M10 - Pipeline de Leads | 0% | Sin trazabilidad del customer journey |
| M11 - Reportes PDF/Excel | 0% | Sin evidencia descargable del ROI |
| M12 - Onboarding | 0% | Meta: <1 semana, actualmente no existe |

### 🔴 Deuda técnica urgente (BLOQUEANTES Fase 0)

| Issue | Descripción | Riesgo |
|-------|-------------|--------|
| **RLS USING(true)** | Cualquier usuario autenticado lee/escribe en cualquier tenant | **CRÍTICO** |
| **Multi-tenant por regex** | Agregar 3er cliente rompe el sistema | ALTO |
| **Sin RBAC (roles)** | Director, consultor, cliente MIPYME tienen acceso idéntico | ALTO |
| **Dashboard duplica layout** | Ruta / duplica sidebar/header | MEDIO |
| **Sin schema de negocio** | Solo 3 tablas, falta ontología de 12 módulos | **CRÍTICO** |
| **package.json name=temp-app** | Proyecto nombrado como prototipo | BAJO |

---

## 🎯 PLAN DE IMPLEMENTACIÓN POR FASES

### **FASE 0: Fundamentos de Seguridad y Arquitectura** ⏱️ ~5 días

**Objetivo:** Convertir prototipo en base production-ready. **BLOQUEANTE para todas las fases.**

#### 0.1 Reparar Multi-tenancy y RLS

```sql
-- 1. Crear tabla profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('director', 'consultor', 'finanzas', 'operaciones', 'marketing', 'success', 'cliente_mipyme')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- 2. Crear función para obtener tenant actual
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- 3. Reescribir RLS en todas las tablas
ALTER TABLE sales_baselines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_sales_baselines" ON sales_baselines
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_sales_data" ON sales_data
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- Aplicar a todas las tablas...
```

**Entregables:**
- [ ] Tabla `profiles` creada con roles RBAC
- [ ] Función `get_current_tenant_id()` en Supabase
- [ ] RLS reescrito en 3 tablas existentes
- [ ] Middleware Next.js actualizado para leer tenant de DB

---

#### 0.2 Schema de Base de Datos Completo

```sql
-- Tabla tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  plan VARCHAR(50),
  consultant_user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(name)
);

-- Tabla de baselines de ventas
CREATE TABLE sales_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  baseline_amount DECIMAL(12, 2) NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  commission_tiers JSONB,
  period VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, period)
);

-- Tabla de datos de ventas
CREATE TABLE sales_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  channel VARCHAR(100),
  amount DECIMAL(12, 2) NOT NULL,
  units INT,
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT now(),
  INDEX idx_tenant_date (tenant_id, date)
);

-- Tabla de alertas
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP
);

-- Tabla de recomendaciones IA
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  area VARCHAR(100),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'dismissed')),
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla de inventario SKUs
CREATE TABLE inventory_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit_cost DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  reorder_point INT,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla de lotes/batches
CREATE TABLE inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES inventory_skus(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  received_at DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla de leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  interest_level VARCHAR(50),
  stage VARCHAR(50),
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla de uploads de datos
CREATE TABLE data_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  rows_imported INT,
  errors_json JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices en tenant_id para todas las tablas
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_sales_baselines_tenant ON sales_baselines(tenant_id);
CREATE INDEX idx_sales_data_tenant ON sales_data(tenant_id);
CREATE INDEX idx_alerts_tenant ON alerts(tenant_id);
CREATE INDEX idx_recommendations_tenant ON recommendations(tenant_id);
CREATE INDEX idx_inventory_skus_tenant ON inventory_skus(tenant_id);
CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_data_uploads_tenant ON data_uploads(tenant_id);
```

**Entregables:**
- [ ] 9 tablas creadas con FK y índices
- [ ] RLS habilitado en todas las tablas
- [ ] Constraints y validaciones en lugar
- [ ] Backups configurados

---

#### 0.3 Correcciones Técnicas

```json
// package.json
{
  "name": "crm-aginnova",
  "version": "1.0.0",
  "description": "CRM Inteligente para MIPYMES - Aginnova"
}
```

**Tareas:**
- [ ] Renombrar `package.json` name a `crm-aginnova`
- [ ] Unificar layout: ruta `/` debe usar `DashboardLayout`
- [ ] Remover duplicación de sidebar/header
- [ ] Validar que todos los índices existan

**Entregables Fase 0:**
| Entregable | Días | Quién |
|-----------|------|-------|
| RLS + tabla profiles | 2 días | Tec. Tecnología |
| Función `get_current_tenant_id()` | 0.5 días | Tec. Tecnología |
| Migraciones SQL completas | 2 días | Tec. Tecnología |
| Middleware actualizado | 0.5 días | Tec. Tecnología |
| **TOTAL FASE 0** | **~5 días** | |

---

### **FASE 1: MVP Operativo** ⏱️ ~14 días (Semanas 2-5)

**Objetivo:** Sistema gestiona 2 clientes piloto (NALUA, KAWDOBA) con datos reales. Consultores trabajan 100% desde el CRM.

#### 1.1 M1 Gestión de Clientes + M12 Onboarding (4 días)

**Rutas a implementar:**

```
/clientes
├── GET /api/clientes                    → Listar tenants por director
├── POST /api/clientes                   → Crear tenant + usuario consultor
├── GET /api/clientes/[id]               → Portfolio de un cliente
├── PUT /api/clientes/[id]               → Modificar baseline, plan, status
├── DELETE /api/clientes/[id]            → Soft delete (inactivar)
└── GET /api/clientes/[id]/onboarding    → Estado del wizard de onboarding

/dashboard/clientes
├── Vista portfolio: tarjetas de cada tenant
├── Semáforo real: calculado desde sales_baselines vs sales_data
├── CRUD: alta, baja, modificación de consultor asignado
├── Registro de plan activo, baseline, meta del período
├── Wizard onboarding: 8 pasos integrados
└── Historial de fases Aginnova (Fase 1-5)
```

**Especificación Técnica:**

```typescript
// Modelo Cliente
interface ClienteAginnova {
  id: UUID;
  name: string;
  sector: string;
  plan: 'startup' | 'growth' | 'enterprise';
  consultant_user_id: UUID;
  baseline_amount: decimal;
  target_amount: decimal;
  commission_tiers: {
    without_improvement: 0,
    on_target: 10,
    double_target: 15
  };
  status: 'active' | 'inactive' | 'onboarding' | 'paused';
  kpi_health: 'green' | 'yellow' | 'red'; // Calculado
  onboarding_step: 0-8;
  created_at: timestamp;
}

// API Response: Semáforo Inteligente
{
  tenant_id: UUID,
  sales_current: 50000,
  baseline: 40000,
  incremental_sales: 10000, // 50k - 40k
  target: 60000,
  % vs baseline: 25%, // (10k/40k)*100
  commission_percentage: 15%, // dobla meta
  commission_amount: 1500, // 10k * 15%
  color: 'green'
}
```

**Checklist:**
- [ ] CRUD de tenants con permisos (director solo puede ver asignados)
- [ ] Portfolio view con tarjetas de semáforo
- [ ] Wizard onboarding de 8 pasos (nombre, sector, baseline, meta, metodología, equipo, integraciones, confirmación)
- [ ] Validación: baseline < target
- [ ] Historial de cambios (audit log)

---

#### 1.2 M2 Ingesta de Datos (Excel/CSV) (3 días)

**Rutas a implementar:**

```
/datos
├── GET /api/datos/plantillas             → Descargar templates (ventas, inventario, campañas)
├── POST /api/datos/upload                → Upload drag-and-drop Excel/CSV
├── GET /api/datos/validar                → Validar columnas vs. plantilla estándar
├── POST /api/datos/procesar              → Normalizar, deduplicar, importar a sales_data
├── GET /api/datos/historial              → Versioning en data_uploads
└── GET /api/datos/errores/[upload_id]   → JSON de errores de importación

/dashboard/datos
├── Drag-and-drop zone para archivos
├── Preview de primeras 5 filas
├── Validación en tiempo real de columnas
├── Botón "Importar" (normaliza, deduplica)
├── Historial de uploads con status
└── Descarga de templates estándar
```

**Plantillas Estándar Aginnova:**

```csv
# Template Ventas
fecha,canal,monto,unidades,fuente
2026-06-01,web,5000,10,Google
2026-06-02,punto_venta,3000,5,tienda_fisica
2026-06-03,email,2000,4,newsletter

# Template Inventario
sku,nombre,categoria,costo_unitario,precio_unitario,punto_reorden
SK-001,Producto A,Electrónica,100,250,50
SK-002,Producto B,Hogar,50,120,30

# Template Campañas
fecha,canal,costo,alcance,ctr,conversiones
2026-06-01,Meta Ads,500,10000,0.05,50
2026-06-02,Google Ads,750,15000,0.03,45
```

**Especificación Técnica:**

```typescript
// Normalización automática
{
  tipo: 'ventas' | 'inventario' | 'campañas',
  validacion: {
    columnas_requeridas: string[],
    tipos_dato: Record<string, 'date' | 'decimal' | 'int' | 'string'>,
    rangos: { monto: [0, 999999], unidades: [0, 100000] }
  },
  normalizacion: {
    deduplicacion: true,           // Detecta duplicados por fecha+canal
    tipado: true,                  // Convierte a tipos correctos
    outliers: 'log',               // Registra valores > 3 sigma
    trimming: true                 // Quita espacios en blanco
  }
}

// Respuesta de procesamiento
{
  upload_id: UUID,
  filas_totales: 150,
  filas_importadas: 148,
  filas_error: 2,
  errores: [
    { fila: 15, columna: 'monto', error: 'valor negativo' },
    { fila: 42, columna: 'fecha', error: 'formato inválido' }
  ],
  timestamp: 'ISO8601'
}
```

**Checklist:**
- [ ] 3 templates descargables (ventas, inventario, campañas)
- [ ] Validación de columnas vs. plantilla
- [ ] Normalización: tipos, deduplicación, outliers
- [ ] Versionado en `data_uploads` table
- [ ] Errores capturados en JSON
- [ ] UI: drag-and-drop + preview + importar

---

#### 1.3 M3 Dashboard de KPIs Real (4 días)

**Rutas a implementar:**

```
/dashboard
├── GET /api/dashboard/kpis/[tenant_id]  → Datos de KPIs en tiempo real
├── GET /api/dashboard/filtros            → Períodos, canales, clientes disponibles
└── POST /api/dashboard/guardar-vista     → Guardar filtros personalizados

/dashboard/kpis
├── Vista Consultor: ventas vs baseline vs meta, ticket promedio, CAC, proyección mes
├── Vista Marketing: alcance, CTR, conversiones, costo por lead
├── Vista Operaciones: inventario, SLA entregas, devoluciones
├── Vista Salud: score compuesto, tendencia semanal, alertas activas
├── Vista Cliente MIPYME: versión simplificada con semáforos
└── Filtros: período, canal, cliente
```

**KPIs por Rol:**

```typescript
// Consultor
{
  ventas_actuales: 50000,
  baseline: 40000,
  meta: 60000,
  variacion_baseline: 25%, // (50k-40k)/40k
  ticket_promedio: 500,
  cac: 50,
  proyeccion_cierre: 55000, // Basado en tendencia
  alertas_activas: 3
}

// Marketing
{
  alcance: 100000,
  ctr: 0.05,
  conversiones: 50,
  costo_por_lead: 10,
  roas: 2.5,
  top_canal: 'Meta Ads',
  tendencia: 'up' | 'down' | 'flat'
}

// Operaciones
{
  inventario_total: 500 unidades,
  rotacion_30d: 250 unidades,
  dias_inventario: 60,
  sla_entregas: 95%,
  tasa_devoluciones: 2%,
  skus_bajo_stock: 5
}

// Salud (Compuesto)
{
  score: 75, // 0-100
  tendencia: 'up',
  factores: {
    ventas: 85,
    inventario: 70,
    alertas: 65,
    roi: 80
  }
}
```

**Checklist:**
- [ ] Queries optimizadas (< 1s cada una)
- [ ] 5 vistas de rol (Consultor, Marketing, Ops, Salud, Cliente MIPYME)
- [ ] Gráficas: trending, KPI cards, mini-tabla
- [ ] Filtros por período, canal, cliente
- [ ] Cálculos automáticos (baseline-actual = incremental)
- [ ] Datos actualizados cada 15 minutos

---

#### 1.4 M4 Panel ROI / Motor de Comisiones (3 días)

**CRÍTICO para modelo de negocio de Aginnova.**

```
/roi
├── GET /api/roi/[tenant_id]/actual       → Calculado automáticamente desde DB
├── GET /api/roi/[tenant_id]/historico    → Mes a mes desde inicio de contrato
├── GET /api/roi/[tenant_id]/proyeccion   → Proyección de cierre de período
└── POST /api/roi/[tenant_id]/exportar    → Genera PDF/Excel

/dashboard/roi
├── Ventas actuales - baseline = ventas incrementales (calculado)
├── Comisión escalonada: 0% | 10% (cumple meta) | 15% (dobla meta)
├── Gráfica de tendencia: baseline vs. actual desde inicio
├── Acumulado histórico mes a mes
├── Exportación PDF y Excel
└── Permisos: consultor asignado, Director, Finanzas, cliente (solo suyo)
```

**Motor de Comisiones:**

```typescript
// Cálculo automático
{
  ventas_actuales: 50000,
  baseline: 40000,
  target: 60000,
  ventas_incrementales: 10000, // 50k - 40k
  
  // Comisión escalonada
  commission_rate: 15%, // porque dobla target (60k es el 100%)
  commission_amount: 1500, // 10k * 15%
  
  // Breakdown
  commission_bracket: 'double_target', // 0% | 10% | 15%
  desde_inicio_contrato: {
    mes_1: { actual: 40000, baseline: 40000, comision: 0 },
    mes_2: { actual: 50000, baseline: 40000, comision: 1500 },
    mes_3: { actual: 65000, baseline: 40000, comision: 3750 },
    total_acumulado: 5250
  }
}

// Proyección (tendencia lineal)
{
  dias_en_periodo: 30,
  dias_restantes: 5,
  velocidad_diaria: 1666.67,
  proyeccion_cierre: 55000,
  proyeccion_comision: 2250
}
```

**PDF/Excel Template:**

```
┌─────────────────────────────────────────────┐
│ REPORTE DE ROI - NALUA - JUNIO 2026         │
├─────────────────────────────────────────────┤
│ Período: 01-30 Junio 2026                   │
│ Baseline acordado: $40,000                  │
│ Meta del período: $60,000                   │
├─────────────────────────────────────────────┤
│ Ventas actuales: $50,000 (+25% vs base)     │
│ Ventas incrementales: $10,000               │
│ Comisión aplicada: 15% (dobla meta)         │
│ COMISIÓN A PAGAR: $1,500                    │
├─────────────────────────────────────────────┤
│ Histórico:                                  │
│ Mes 1: $0 | Mes 2: $1,500 | Mes 3: $3,750  │
│ TOTAL ACUMULADO: $5,250                     │
└─────────────────────────────────────────────┘
```

**Checklist:**
- [ ] Tabla `sales_baselines` + `sales_data` vinculadas
- [ ] Fórmula: actual - baseline = incremental
- [ ] Cálculo de comisión escalonada (0%, 10%, 15%)
- [ ] Gráfica de tendencia con proyección
- [ ] Histórico mes a mes desde inicio
- [ ] Exportación a PDF (usando pdfkit) y Excel (xlsx)
- [ ] Permisos: leer propio (consultor), leer todos (Director/Finanzas)
- [ ] Validación: baseline < actual ≤ target*2

---

**Entregables Fase 1:**

| Entregable | Días | Módulos |
|-----------|------|---------|
| M1 + M12: CRUD clientes + onboarding wizard | 4 días | M1, M12 |
| M2: Upload Excel/CSV + validación + templates | 3 días | M2 |
| M3: Dashboard KPIs 5 vistas reales | 4 días | M3 |
| M4: Comisiones escalonadas + PDF/Excel | 3 días | M4 |
| **TOTAL FASE 1** | **~14 días** | |

---

### **FASE 2: Inteligencia y Automatización** ⏱️ ~19 días (Semanas 6-10)

**Objetivo:** Activar diferenciadores que permiten gestionar 10+ clientes sin aumentar equipo operativo.

#### 2.1 M6 Sistema de Alertas (4 días)

```
/alertas
├── GET /api/alertas/[tenant_id]          → Listar alertas activas
├── PUT /api/alertas/[id]/resolver        → Marcar como resuelta
├── POST /api/alertas/config              → Configurar umbrales por cliente
└── GET /api/alertas/historial            → Histórico de todas las alertas

/dashboard/alertas
├── Engine: evaluación cada 15 min (8 tipos de alerta)
├── Badge real en sidebar + panel con historial
├── Notificaciones WhatsApp Business API
└── Configuración de umbrales personalizables por cliente
```

**8 Tipos de Alerta Implementados:**

```typescript
const ALERT_TYPES = {
  SALES_DROP: {
    condition: 'ventas_hoy < baseline * 0.8',
    severity: 'high',
    message: 'Caída de ventas detectada',
    whatsapp_template: 'sales_drop_alert'
  },
  INVENTORY_LOW: {
    condition: 'inventario < reorder_point * 1.2',
    severity: 'medium',
    message: 'Stock bajo para SKU {sku}',
    whatsapp_template: 'inventory_low'
  },
  EXPIRY_WARNING: {
    condition: 'dias_hasta_caducidad < 14',
    severity: 'high',
    message: 'Producto {sku} caduca en {dias} días',
    whatsapp_template: 'expiry_warning'
  },
  TARGET_AT_RISK: {
    condition: 'dias_restantes_periodo > 0 AND proyeccion < meta * 0.9',
    severity: 'medium',
    message: 'Meta en riesgo: proyectado $X, meta $Y',
    whatsapp_template: 'target_at_risk'
  },
  HIGH_CAC: {
    condition: 'cac > cac_promedio_sector * 1.5',
    severity: 'low',
    message: 'CAC elevado en canal {canal}',
    whatsapp_template: 'high_cac'
  },
  ROI_THRESHOLD: {
    condition: 'roi_actual < 1.0',
    severity: 'high',
    message: 'ROI por debajo de break-even',
    whatsapp_template: 'low_roi'
  },
  CONVERSION_DROP: {
    condition: 'conversion_rate_hoy < conversion_rate_promedio * 0.7',
    severity: 'medium',
    message: 'Tasa de conversión baja',
    whatsapp_template: 'conversion_drop'
  },
  ANOMALY_DETECTED: {
    condition: 'value > media + (3 * sigma)',
    severity: 'medium',
    message: 'Anomalía detectada en {metrica}',
    whatsapp_template: 'anomaly_detected'
  }
};
```

**WhatsApp Business API Integration:**

```typescript
// Modelo de notificación
{
  alert_id: UUID,
  tenant_id: UUID,
  consultant_phone: '+57XXXXXXXXX',
  whatsapp_template_name: 'sales_drop_alert',
  template_params: {
    producto: 'NALUA',
    caida_porcentaje: '25%',
    monto_esperado: '$40,000',
    monto_actual: '$30,000'
  },
  status: 'pending' | 'sent' | 'failed',
  sent_at: timestamp,
  retry_count: 0
}

// Envío automático (cron cada 15 min)
async function evaluateAlertsForAllTenants() {
  for (const tenant of activeTenants) {
    for (const alertType of ALERT_TYPES) {
      if (evaluateCondition(alertType, tenant)) {
        const alert = createAlert(alertType, tenant);
        await sendWhatsAppNotification(alert);
      }
    }
  }
}
```

**Checklist:**
- [ ] Tabla `alerts` con campos: type, severity, resolved, created_at
- [ ] Función cron cada 15 min para evaluar condiciones
- [ ] WhatsApp Business API integrada
- [ ] 8 tipos de alerta implementados
- [ ] Panel de historial con estado (resuelto/no resuelto)
- [ ] Umbrales configurables por cliente
- [ ] Fallback a email si WhatsApp falla

---

#### 2.2 M5 Motor de IA + Recomendaciones (6 días)

```
/recomendaciones
├── GET /api/recomendaciones/[tenant_id]  → Pendientes de aprobación
├── PUT /api/recomendaciones/[id]/aprobar → Consultor aprueba/rechaza
├── PUT /api/recomendaciones/[id]/editar  → Consultor edita antes de aplicar
├── GET /api/recomendaciones/historial    → Todas las recomendaciones con decisión
└── POST /api/recomendaciones/cron        → Ejecución manual (normalmente cron 24h)

/dashboard/recomendaciones
├── Flujo: IA genera → Consultor aprueba/edita/descarta → Cliente ve solo aprobadas
├── 5 agentes ReAct: Ventas, Inventario, Marketing, Retención, ROI
├── Historial completo de recomendaciones y decisiones
└── Cliente MIPYME nunca ve recomendaciones no aprobadas
```

**Arquitectura: 5 Agentes ReAct**

```typescript
// Agente de Ventas
const AGENT_SALES = {
  nombre: 'Sales Advisor',
  inputs: ['sales_data', 'baseline', 'sales_baselines_historico'],
  prompt: `
    Analiza los datos de ventas de los últimos 30 días.
    - Si hay caída: recomienda acciones para recuperar
    - Si hay pico: identifica qué funcionó y cómo escalar
    - Compara con benchmark sectorial (si disponible)
    
    Responde SIEMPRE en JSON:
    {
      "categoria": "sales",
      "recomendacion": "Aumentar presupuesto en Meta Ads porque tuvo 3x ROAS",
      "impacto_estimado": "$5,000 incrementales en 2 semanas",
      "confianza": 0.85,
      "acciones": [
        "Crear campaña con presupuesto $500",
        "Audience: visitantes de último mes",
        "Target: conversión a venta"
      ]
    }
  `
};

// Agente de Inventario
const AGENT_INVENTORY = {
  nombre: 'Inventory Optimizer',
  inputs: ['inventory_skus', 'inventory_batches', 'sales_data'],
  prompt: `
    Analiza inventario y pronóstico de demanda.
    - Identifica SKUs bajo stock
    - Detecta productos cerca de caducidad
    - Recomienda reposición basada en demanda proyectada
    
    JSON: { categoria: 'inventory', recomendacion: '...', acciones: [] }
  `
};

// Similar para Marketing, Retención, ROI...

// Orquestador
async function generateRecommendations(tenant_id) {
  const agents = [AGENT_SALES, AGENT_INVENTORY, AGENT_MARKETING, AGENT_RETENTION, AGENT_ROI];
  
  for (const agent of agents) {
    const inputs = await fetchInputData(agent.inputs, tenant_id);
    const recommendation = await callClaudeAPI({
      model: 'claude-opus-4.0',
      prompt: agent.prompt,
      context: inputs
    });
    
    await saveRecommendation({
      tenant_id,
      area: agent.nombre,
      content: recommendation,
      status: 'pending',
      created_at: now()
    });
  }
}

// Cron: ejecutar cada 24h
schedule.every('1 day').do(() => {
  for (const tenant of activeTenants) {
    generateRecommendations(tenant.id);
  }
});
```

**Flujo de Aprobación UI:**

```
┌─────────────────────────────────────────────────────────┐
│ Recomendación Pendiente                                 │
├─────────────────────────────────────────────────────────┤
│ [Sales Advisor] Aumentar presupuesto Meta Ads           │
│                                                          │
│ "Tuvo 3x ROAS. Recomiendo +$500 presupuesto"           │
│                                                          │
│ Impacto estimado: $5,000 incrementales en 2 semanas    │
│ Confianza: 85%                                          │
│                                                          │
│ Acciones sugeridas:                                     │
│ 1. Crear campaña con $500                              │
│ 2. Audience: visitantes último mes                     │
│ 3. Target: conversión a venta                          │
│                                                          │
│ [Rechazar] [Editar] [Aprobar]                         │
└─────────────────────────────────────────────────────────┘

// Si Editar: abre textarea con recomendación para edición
// Si Aprobar: cambia status a 'approved' → aparece en dashboard del cliente
// Si Rechazar: cambia status a 'dismissed'
```

**Checklist:**
- [ ] Tabla `recommendations` con status tracking
- [ ] 5 agentes implementados (Ventas, Inventario, Marketing, Retención, ROI)
- [ ] Integración Claude API (o similar LLM)
- [ ] Cron cada 24h para ejecutar agentes
- [ ] UI para aprobar/rechazar/editar
- [ ] Historial completo con decisión del consultor
- [ ] Cliente MIPYME ve solo aprobadas en su dashboard

---

#### 2.3 M9 Inventario y Cadena de Suministro (5 días)

**Crítico para KAWDOBA (meta: 0% pérdidas por caducidad).**

```
/inventario
├── GET /api/inventario/skus              → Catálogo completo
├── POST /api/inventario/skus              → Crear nuevo SKU
├── PUT /api/inventario/skus/[id]         → Actualizar (precio, costo, etc)
├── GET /api/inventario/lotes             → Lotes activos por SKU
├── POST /api/inventario/lotes             → Agregar nuevo lote (recepción)
├── GET /api/inventario/80-20             → Análisis Pareto de SKUs
├── GET /api/inventario/pronostico        → Demanda proyectada 4 semanas
├── GET /api/inventario/proveedores       → Directorio con ratings
└── POST /api/inventario/sugerencias      → Reposición automática

/dashboard/inventario
├── Catálogo de SKUs: precio, costo, margen, categoría
├── Control de lotes: fecha caducidad, alertas 60% vida útil
├── Regla 80/20 automática: SKUs que generan 80% ingresos
├── Pronóstico demanda 4 semanas basado en histórico
├── Directorio proveedores con calificación y tiempos
└── Sugerencia automática de reposición
```

**Modelo de Datos:**

```sql
-- SKUs con margen calculado
CREATE TABLE inventory_skus (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(255),
  category VARCHAR(100),
  unit_cost DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  reorder_point INT,
  supplier_id UUID REFERENCES suppliers(id),
  margin_percent GENERATED AS (
    ((unit_price - unit_cost) / unit_price) * 100
  ) STORED
);

-- Lotes/batches con alertas automáticas
CREATE TABLE inventory_batches (
  id UUID PRIMARY KEY,
  sku_id UUID REFERENCES inventory_skus(id),
  quantity INT,
  received_at DATE,
  expiry_date DATE,
  status VARCHAR(50), -- 'active' | 'partial' | 'expired' | 'liquidation'
  dias_hasta_caducidad GENERATED AS (
    EXTRACT(DAY FROM expiry_date - CURRENT_DATE)
  ) STORED,
  alert_60_pct GENERATED AS CASE 
    WHEN dias_hasta_caducidad < (EXTRACT(DAY FROM expiry_date - received_at) * 0.4) 
    THEN true 
  END STORED
);

-- Proveedores
CREATE TABLE suppliers (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  name VARCHAR(255),
  contact VARCHAR(255),
  lead_time_days INT,
  reliability_score DECIMAL(3, 2), -- 0-1
  last_order_date DATE,
  average_delivery_time DECIMAL(5, 2)
);
```

**Análisis 80/20 y Pronóstico:**

```typescript
// Análisis Pareto
async function analyze8020(tenant_id) {
  const salesByProduct = await query(`
    SELECT 
      sku_id,
      SUM(amount) as total_revenue,
      SUM(units) as total_units
    FROM sales_data
    WHERE tenant_id = $1 AND date >= NOW() - INTERVAL '90 days'
    GROUP BY sku_id
    ORDER BY total_revenue DESC
  `, [tenant_id]);
  
  const totalRevenue = salesByProduct.reduce((sum, row) => sum + row.total_revenue, 0);
  let cumulativeRevenue = 0;
  const result80 = [];
  
  for (const product of salesByProduct) {
    cumulativeRevenue += product.total_revenue;
    result80.push(product);
    if (cumulativeRevenue >= totalRevenue * 0.8) break;
  }
  
  return {
    count_80pct: result80.length,
    total_products: salesByProduct.length,
    revenue_concentration: (result80.length / salesByProduct.length),
    products: result80
  };
}

// Pronóstico 4 semanas (simple moving average)
async function forecast4Weeks(sku_id) {
  const last30Days = await query(`
    SELECT DATE_TRUNC('day', date) as day, SUM(units) as units
    FROM sales_data
    WHERE sku_id = $1 AND date >= NOW() - INTERVAL '30 days'
    GROUP BY day
  `, [sku_id]);
  
  const avgDaily = last30Days.reduce((sum, row) => sum + row.units, 0) / 30;
  
  return {
    forecast_week_1: avgDaily * 7,
    forecast_week_2: avgDaily * 7,
    forecast_week_3: avgDaily * 7,
    forecast_week_4: avgDaily * 7,
    confidence: 0.75 // Ajustar según varianza
  };
}

// Sugerencia de reposición
async function suggestReplenishment(sku_id) {
  const sku = await getSKU(sku_id);
  const forecast = await forecast4Weeks(sku_id);
  const currentStock = await getStockLevel(sku_id);
  const supplier = await getSupplier(sku.supplier_id);
  
  const demandaNext4w = forecast.forecast_week_1 + forecast.forecast_week_2 
                        + forecast.forecast_week_3 + forecast.forecast_week_4;
  
  if (currentStock < demandaNext4w + sku.reorder_point) {
    return {
      sku_id,
      quantity_to_order: Math.ceil(demandaNext4w * 1.2), // Buffer 20%
      supplier_id: sku.supplier_id,
      estimated_arrival: addDays(now(), supplier.lead_time_days),
      estimated_cost: Math.ceil(demandaNext4w * 1.2) * sku.unit_cost
    };
  }
  
  return null;
}
```

**Checklist:**
- [ ] Tabla SKUs con margen calculado
- [ ] Tabla lotes con alertas automáticas
- [ ] Tabla proveedores con lead_time y reliability_score
- [ ] Análisis 80/20: identifica top 20% SKUs que generan 80% revenue
- [ ] Pronóstico demanda 4 semanas (moving average)
- [ ] Sugerencia automática de reposición
- [ ] Alertas: stock bajo, próximo a caducar (60% vida útil)
- [ ] UI con historial de reposiciones

---

#### 2.4 M7 Automatizaciones Comerciales (4 días)

```
/workflows
├── GET /api/workflows/[tenant_id]        → Listar workflows activos
├── POST /api/workflows/                  → Crear workflow (B2C, B2B, Aginnova)
├── PUT /api/workflows/[id]               → Editar triggers y acciones
├── DELETE /api/workflows/[id]            → Desactivar
└── GET /api/workflows/historial          → Ejecuciones y resultados

/dashboard/workflows
├── B2C (NALUA): Recuperación carrito (D1, D3, D7), NPS, tagging
├── B2B (KAWDOBA): Alerta caducidad → liquidación, consolidación pedidos
└── Aginnova: Nuevo cliente → baseline, cierre mes → reporte, etc.
```

**Workflows Predefinidos:**

```typescript
const WORKFLOWS = {
  // B2C: NALUA
  CART_RECOVERY: {
    trigger: 'abandoned_cart AND dias_sin_actividad >= 1',
    actions: [
      {
        tipo: 'email',
        template: 'cart_recovery_d1',
        delay_hours: 24
      },
      {
        tipo: 'email',
        template: 'cart_recovery_d3',
        delay_hours: 72
      },
      {
        tipo: 'email',
        template: 'cart_recovery_d7',
        delay_hours: 168
      }
    ],
    condition_exit: 'compra OR dias_sin_actividad >= 14'
  },
  
  NPS_SURVEY: {
    trigger: 'order_delivered AND dias_desde_entrega = 2',
    actions: [
      {
        tipo: 'whatsapp',
        template: 'nps_survey',
        message: '¿Cómo fue tu experiencia? 1-10'
      }
    ]
  },
  
  DYNAMIC_TAGGING: {
    trigger: 'event_cualquier',
    rules: [
      { if: 'purchase_count >= 5', tag: 'VIP_Customer' },
      { if: 'purchase_value >= 1000', tag: 'High_Value' },
      { if: 'dias_sin_compra >= 90', tag: 'At_Risk' }
    ]
  },
  
  // B2B: KAWDOBA
  EXPIRY_LIQUIDATION: {
    trigger: 'batch.dias_hasta_caducidad <= 30',
    actions: [
      {
        tipo: 'alert',
        template: 'expiry_alert'
      },
      {
        tipo: 'campaign',
        template: 'liquidation_campaign',
        discount: 30,
        message: 'Stock limitado - 30% off por caducidad próxima'
      },
      {
        tipo: 'email',
        template: 'wholesale_liquidation',
        recipients: 'distribution_partners'
      }
    ]
  },
  
  // Aginnova
  NEW_CLIENT_ONBOARDING: {
    trigger: 'tenant.status = "onboarding"',
    actions: [
      {
        tipo: 'email',
        template: 'welcome_onboarding'
      },
      {
        tipo: 'task',
        task: 'Solicitar baseline agreement'
      },
      {
        tipo: 'scheduler',
        at: 'Week 1',
        action: 'Enviar template de datos de ventas'
      }
    ]
  },
  
  END_OF_MONTH_REPORT: {
    trigger: 'date = "último día del mes" AND hora = "18:00"',
    actions: [
      {
        tipo: 'generate_report',
        template: 'monthly_kpi_report'
      },
      {
        tipo: 'export',
        format: ['pdf', 'xlsx']
      },
      {
        tipo: 'email',
        template: 'monthly_report',
        recipients: ['director', 'consultant', 'client']
      }
    ]
  },
  
  HIGH_ALERT_ESCALATION: {
    trigger: 'dias_en_periodo >= 20 AND proyeccion < meta * 0.9',
    actions: [
      {
        tipo: 'alert',
        severity: 'critical'
      },
      {
        tipo: 'whatsapp',
        recipients: ['director'],
        message: 'ALERTA CRÍTICA: Meta en riesgo. Contacta consultor.'
      },
      {
        tipo: 'task',
        assign_to: 'director',
        task: 'Revisar performance y estrategia con consultor'
      }
    ]
  }
};

// Engine de ejecución
async function executeWorkflows() {
  const workflows = await getAllActiveWorkflows();
  
  for (const workflow of workflows) {
    const triggersMatched = await evaluateTrigger(workflow.trigger);
    
    if (triggersMatched) {
      for (const action of workflow.actions) {
        if (action.tipo === 'email') {
          await sendEmail(action.template);
        } else if (action.tipo === 'whatsapp') {
          await sendWhatsApp(action.template);
        } else if (action.tipo === 'task') {
          await createTask(action.task);
        }
        // ... etc
      }
    }
  }
}

// Cron: ejecutar cada 1 hora
schedule.every('1 hour').do(executeWorkflows);
```

**Checklist:**
- [ ] Tabla `workflows` con fields: trigger, actions (JSON), status
- [ ] Motor de evaluación de triggers (cron cada 1 hora)
- [ ] 6 workflows predefinidos (3 B2C, 1 B2B, 2 Aginnova)
- [ ] Integración con email, WhatsApp, alertas
- [ ] Historial de ejecuciones
- [ ] UI para crear/editar workflows
- [ ] Logs de cada ejecución

---

**Entregables Fase 2:**

| Entregable | Días | Módulo |
|-----------|------|--------|
| M6: Alertas 8 tipos + WhatsApp | 4 días | M6 |
| M5: 5 agentes IA + aprobación | 6 días | M5 |
| M9: SKUs, lotes, 80/20, pronóstico | 5 días | M9 |
| M7: 6 workflows B2C/B2B/Aginnova | 4 días | M7 |
| **TOTAL FASE 2** | **~19 días** | |

---

### **FASE 3: Escala y Diferenciadores Comerciales** ⏱️ ~23 días (Semanas 11-18)

#### 3.1 M10 Pipeline de Leads (5 días)
#### 3.2 M11 Reportes PDF/Excel (4 días)
#### 3.3 M8 Panel Prospecto Demo (3 días)
#### 3.4 Integraciones API (8 días)

*[Detalles completos en documento original]*

---

## 📈 ROADMAP TEMPORAL

| Semana | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 |
|--------|----|----|----|----|----|----|----|----|----|----|-----|-----|
| **S1** | - | - | - | - | - | - | - | - | - | - | - | - |
| **S2-3** | ✅ | ✅ | ✅ | - | - | - | - | - | - | - | - | ✅ |
| **S4-5** | - | - | ✅ | ✅ | - | - | - | - | - | - | - | - |
| **S6** | - | - | - | - | - | ✅ | - | - | - | - | - | - |
| **S7-8** | - | - | - | - | ✅ | - | - | - | - | - | - | - |
| **S9** | - | - | - | - | - | - | - | - | ✅ | - | - | - |
| **S10** | - | - | - | - | - | - | ✅ | - | - | - | - | - |
| **S11-12** | - | - | - | - | - | - | - | - | - | ✅ | - | - |
| **S13-14** | - | - | - | - | - | - | - | ✅ | - | - | ✅ | - |
| **S15-18** | - | - | - | - | - | - | - | - | - | - | - | APIs |

---

## ✅ CRITERIOS DE ACEPTACIÓN & MÉTRICAS

| Métrica | Actual | Meta MVP (Fase 1) | Meta Escala (mes 12) |
|---------|--------|-------------------|----------------------|
| Clientes MIPYME en CRM real | 0 | 2 (NALUA, KAWDOBA) | 10+ |
| Módulos PRD funcionales | 2/12 (17%) | 6/12 (50%) | 12/12 (100%) |
| Comisiones justificadas vía ROI | 0% | 100% | 100% |
| Tiempo de onboarding | N/A | <1 semana | <3 días |
| RLS real por tenant | NO | SÍ | SÍ |
| Dashboard <3s carga | Hardcoded | <3s datos reales | <3s |
| Recomendaciones IA aprobadas | 0% | N/A | >70% |
| Alertas resueltas <4h | 0% | N/A | >80% |

---

## 📋 PRÓXIMOS PASOS ESTA SEMANA

| # | Acción | Responsable | Fecha límite |
|---|--------|-------------|--------------|
| **1** | Crear tabla `profiles` + RLS reescrito (BLOQUEANTE) | Tec. Tecnología | Día 1-2 |
| **2** | Ejecutar migraciones SQL schema completo | Tec. Tecnología | Día 2-3 |
| **3** | Solicitar acceso WhatsApp Business API | Dir. General | Día 1 |
| **4** | Validar plantillas Excel con NALUA + KAWDOBA | Customer Success | Día 3-4 |
| **5** | Documentar baselines acordados en DB | Consultor | Día 4-5 |
| **6** | Configurar .env reales en Railway | Tec. Tecnología | Día 1 |

---

## 🚨 RIESGOS PRINCIPALES

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Fase 0 omitida/pospuesta | CRÍTICO | Base insegura = deuda irreversible. Fase 0 es bloqueante obligatorio. |
| Datos ventas no homogéneos | ALTO | Definir plantillas estándar antes de M2; validar con clientes. |
| WhatsApp API aprobación (3-5 días) | MEDIO | Iniciar solicitud en paralelo; email como fallback. |
| Motor IA baja tasa aprobación | MEDIO | Logging cada recomendación desde inicio; iterar prompts semanalmente. |
| Capacidad técnica insuficiente | ALTO | Evaluar freelance/agencia para Fases 0-1. |
| LGPD: datos personales clientes | ALTO | Revisión legal pre-go-live; NDA con cada cliente. |

---

## 🎯 REGLA DE ORO

**La Fase 0 no es opcional.** Cada día que el sistema opera con `RLS USING(true)` es riesgo de fuga de datos entre tenants. **Antes de cualquier módulo nuevo: resolver fundamentos.**

---

**Documento preparado por:** Claude  
**Organización:** Aginnova  
**Fecha:** Junio 2026  
**Clasificación:** Confidencial

