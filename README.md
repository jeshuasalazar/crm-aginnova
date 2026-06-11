# CRM Aginnova — Sistema Inteligente para MIPYMES

> **CRM inteligente multi-tenant** construido con Next.js 16, Supabase y Tailwind CSS v4. Diseñado para gestionar clientes MIPYME con análisis de ROI, panel de comisiones escalonadas, alertas operativas y módulos de IA.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend / Backend | Next.js 16 (App Router) · TypeScript |
| Base de datos | Supabase (PostgreSQL) + RLS Multi-tenant |
| Estilos | Tailwind CSS v4 |
| Logística | Skydropx API v1 |
| Despliegue | Railway (CI/CD automático desde `main`) |

---

## 📦 Módulos Implementados

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Dashboard** | KPIs en tiempo real, portfolio de clientes, semáforo de salud | ✅ Completo |
| **Gestión de Clientes (M1)** | CRUD de tenants, onboarding wizard, semáforo inteligente | ✅ Completo |
| **Panel ROI / Comisiones (M4)** | Comisiones escalonadas (0%/10%/15%), histórico mes a mes, proyección | ✅ Completo |
| **Alertas (M6)** | 8 tipos de alerta, resolución, historial, badges en sidebar | ✅ Completo |
| **Inventario (M9)** | SKUs, lotes, análisis 80/20, control de caducidad | ✅ Completo |
| **Carga de Datos (M2)** | Upload CSV/Excel, validación, historial de importaciones | ✅ Completo |
| **Recomendaciones IA (M5)** | Agentes por área, flujo de aprobación, historial de decisiones | ✅ Completo |
| **Automatizaciones (M7)** | Workflows B2C/B2B/Aginnova, motor de triggers | ✅ Completo |
| **Logística Skydropx** | Pedidos, cotización de envíos, generación de guías multi-carrier | ✅ Completo |
| **Prospecto Demo (M8)** | Panel de cierre de ventas con propuesta de valor | ✅ Completo |

---

## 🏗️ Arquitectura Multi-Tenant

- **Tenants semilla:** NALUA · KAWDOBA · FERREX
- **RLS (Row Level Security):** Aislamiento total por `tenant_id` vía función `get_current_tenant_id()`
- **RBAC:** Roles: `director`, `consultor`, `finanzas`, `operaciones`, `marketing`, `success`, `cliente_mipyme`
- **Auto-provisioning:** El perfil se crea automáticamente al primer login según dominio de email

---

## ⚡ Inicio Rápido (Local)

```bash
# 1. Clonar el repositorio
git clone https://github.com/jeshuasalazar/crm-aginnova.git
cd crm-aginnova

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# → Agregar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗃️ Base de Datos

El archivo [`schema.sql`](./schema.sql) contiene el esquema completo con:
- 14 tablas con RLS habilitado
- Función `get_current_tenant_id()` para aislamiento de tenants
- Índices de optimización
- Datos semilla (3 tenants)

Para aplicarlo: pega el contenido en el **SQL Editor de Supabase**.

---

## 🚢 Despliegue (Railway)

El proyecto está configurado para despliegue automático en Railway:
- **Trigger:** Push a rama `main`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Variables requeridas:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (dashboard)/          ← Rutas protegidas del CRM
│   │   ├── page.tsx          ← Dashboard principal
│   │   ├── clientes/         ← Gestión de clientes (M1)
│   │   ├── roi/              ← Panel ROI y comisiones (M4)
│   │   ├── alertas/          ← Sistema de alertas (M6)
│   │   ├── inventario/       ← Inventario y lotes (M9)
│   │   ├── datos/            ← Carga de datos CSV (M2)
│   │   ├── recomendaciones/  ← IA y recomendaciones (M5)
│   │   ├── workflows/        ← Automatizaciones (M7)
│   │   ├── orders/           ← Pedidos (Skydropx)
│   │   ├── shipments/        ← Envíos y guías
│   │   └── prospecto/        ← Demo de ventas (M8)
│   ├── actions/              ← Server Actions (lógica de negocio)
│   └── login/                ← Autenticación Supabase
├── utils/supabase/           ← Clientes Supabase (server/client/middleware)
└── schema.sql                ← Schema completo de la BD
```

---

## 🔐 Seguridad

- `.env.local` y `CONTEXTO_CLAVES.md` están en `.gitignore` (nunca se suben al repo)
- Los tokens de Skydropx viven en la tabla `skydropx_config` de Supabase, no en variables de entorno
- RLS habilitado en todas las tablas con aislamiento estricto por tenant

---

**Desarrollado por Aginnova · Transformación Digital para MIPYMES**
