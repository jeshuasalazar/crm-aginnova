# Prompt Detallado para Prototipo CRM Aginnova en Claude Design

## 📋 CONTEXTO EJECUTIVO

**Proyecto:** CRM Inteligente Multi-Tenant Aginnova  
**Propietario:** Aginnova (Agencia de Transformación Digital, CDMX)  
**Estado:** Diseño de Prototipo de Alta Fidelidad  
**Audiencia:** Presentación a stakeholders, referencia para desarrollo frontend

---

## 🎯 OBJETIVO DEL DISEÑO

Crear un **prototipo visual completo y funcional** (wireframes + diseño) del CRM Aginnova que:

1. **Represente fielmente** la arquitectura de 12 módulos descritos en el PRD.
2. **Demuestre la experiencia de usuario** para 3 roles principales:
   - Consultor de Aginnova (vista operativa completa)
   - Director General de Aginnova (vista ejecutiva)
   - Cliente MIPYME (vista de dashboard con su plan)
3. **Comunique el valor diferencial** del producto mediante:
   - Panel ROI que justifica comisiones
   - Sistema de alertas en tiempo real
   - Recomendaciones de IA aprobadas
4. **Sea responsive** y funcione en desktop y móvil.
5. **Siga el brand identity** de Aginnova (logo, colores, tipografía).

---

## 📐 ESPECIFICACIONES TÉCNICAS DEL DISEÑO

### 1. Resoluciones Objetivo
- **Desktop:** 1920×1080 (primary), 1440×900 (secondary)
- **Tablet:** 1024×768 (iPad en landscape)
- **Mobile:** 375×667 (iPhone SE) y 414×896 (iPhone 12)

### 2. Estructura de Navegación

**Sitio Map Conceptual:**
```
CRM Aginnova Dashboard
├── PANEL PRINCIPAL (Home)
│   ├── Contador de clientes activos
│   ├── KPIs globales (ventas, comisiones, alertas)
│   └── Portfolio de clientes (tarjetas)
│
├── MÓDULO 1: Gestión de Clientes (Tenants)
│   ├── Listado de clientes con estado (semáforo)
│   ├── Ficha de cliente (baseline, meta, plan, asignación de consultor)
│   └── Onboarding asistido
│
├── MÓDULO 3: Dashboard de KPIs
│   ├── Vista Consultor (todas las áreas)
│   ├── Vista Director (resumen ejecutivo)
│   └── Vista Cliente MIPYME (solo sus datos)
│
├── MÓDULO 4: Panel ROI
│   ├── Gráfica baseline vs. actual
│   ├── Cálculo de comisión
│   └── Exportar reporte
│
├── MÓDULO 5: IA y Recomendaciones
│   ├── Centro de recomendaciones
│   ├── Flujo de aprobación (Generar → Revisar → Enviar)
│   └── Historial
│
├── MÓDULO 6: Sistema de Alertas
│   ├── Panel de notificaciones
│   ├── Configuración de umbrales
│   └── Historial de alertas
│
├── MÓDULO 2: Ingesta de Datos
│   ├── Carga de Excel (drag-and-drop)
│   ├── Validación de columnas
│   └── Historial de cargas
│
├── MÓDULO 8: Panel de Prospecto
│   ├── Crear tenant temporal
│   ├── Dashboard prospecto
│   └── Proyección de resultados
│
└── CONFIGURACIÓN
    ├── Perfil de usuario
    ├── Preferencias
    └── Integraciones
```

---

## 🎨 GUÍA VISUAL Y BRANDING

### Paleta de Colores
**Brand Aginnova (extraída del logo oficial):**
- **Primario:** #1C3F6E (Azul acero oscuro) — identidad de marca, navbar, headers, CTAs principales
- **Secundario:** #4A7BB5 (Azul medio) — íconos activos, links, estados hover
- **Acento gris:** #5A6472 (Gris grafito) — tipografía secundaria, subtítulos, bordes
- **Fondo claro:** #F4F6F9 (Gris muy claro) — background de páginas
- **Blanco:** #FFFFFF — cards, paneles, modales
- **Alerta/Urgente:** #E65100 (Naranja quemado) — alertas altas, acciones críticas

**⚠️ IMPORTANTE:** El brand de Aginnova es AZUL + GRIS. NO usar verde como color primario.

### Indicadores de Estado (Semáforo)
- **Verde (✓):** #2E7D32 — Meta en camino, estado normal (solo para KPIs positivos)
- **Amarillo (!):** #F9A825 — Atención, desviación <15%
- **Rojo (✗):** #C62828 — Alerta crítica, desviación >15%

### Tipografía
- **Headlines:** "Inter Bold" o "Montserrat Bold" (18px–32px) — moderna, legible
- **Body:** "Inter Regular" o "Roboto Regular" (14px–16px) — limpia, profesional
- **Monospace / Datos:** "Roboto Mono" (12px–13px) — para cifras financieras, KPIs

### Logo
- **Posición:** Esquina superior izquierda del navbar (sidebar o topbar).
- **Tamaño:** 40px altura en desktop; 32px en móvil.
- **Descripción:** Logo con isotipo (letra "A" con flecha ascendente en azul acero + gris) + wordmark "aginnova" en gris grafito + tagline "Agencia de Transformación Digital" en gris claro.
- **Sobre fondo oscuro (navbar):** Usar versión blanca/negativa del logo.
- **Archivo adjunto:** logo_aginnova.png (imagen proporcionada).

---

## 📱 PANTALLAS CLAVE A DISEÑAR

### PANTALLA 1: Landing / Login
- **Contexto:** Entrada al sistema.
- **Elementos:**
  - Logo de Aginnova prominente (centro superior).
  - Formulario de login: Email + Contraseña + Botón "Ingresar".
  - Link "¿Olvidaste tu contraseña?" (gris, subrayado).
  - Mención de idioma (ES | EN) esquina superior derecha.
  - Fondo subtle con motivo del sector tecnológico / datos (degradado sutil).
  - Copy: "CRM Inteligente para Aginnova — Gestiona el crecimiento de tus clientes en tiempo real."

---

### PANTALLA 2: Dashboard Principal (Consultor)
**Descripción:** Vista home del consultor una vez logueado.

**Secciones (scrolleable en móvil):**

1. **Header Global**
   - Logo Aginnova + Título "Dashboard"
   - Buscador (buscar cliente por nombre)
   - Notificaciones (icono campana con badge rojo si hay alertas sin leer)
   - Perfil usuario (nombre, rol, dropdown menu [perfil, salir])
   - Selector de idioma (EN/ES)

2. **KPI Cards (4 columnas desktop, 2 en tablet, 1 en móvil)**
   - Card 1: Clientes Activos (número grande en verde, ícono de usuarios)
   - Card 2: Ventas del Mes (número + % vs. mes anterior, ícono $)
   - Card 3: Comisión Pendiente (número + estado, ícono documento)
   - Card 4: Alertas Sin Resolver (número + icono alerta, fondo naranja si >0)

3. **Portfolio de Clientes (Grid de tarjetas)**
   - Tarjeta por cliente con:
     - Nombre cliente (NALUA / KAWDOBA / etc.)
     - Logo cliente (pequeño)
     - Semáforo estado (verde/amarillo/rojo)
     - 3 KPIs rápidos (ventas mes, % vs. meta, última actualización)
     - Botón "Ver Dashboard"
     - Botón "Alertas" (badge con número si las hay)
   - Mínimo 6 tarjetas en vista; scroll horizontal si hay más

4. **Gráfica de Tendencia (50% ancho desktop)**
   - Ventas totales últimas 12 semanas (línea)
   - Línea puntada para baseline y meta
   - Hover: tooltip con valores exactos

5. **Próximas Acciones / Pendientes (50% ancho desktop)**
   - Lista: Clientes sin datos >7 días, metas en riesgo, lotes por caducar
   - Cada item: nombre + urgencia + botón acción rápida

---

### PANTALLA 3: Dashboard de Clientes (Ficha Individual)
**Descripción:** Vista de un cliente específico con todos sus KPIs.

**Layout:**
1. **Header de Cliente**
   - Nombre cliente + Logo + Semáforo estado (grande, 40px)
   - Breadcrumb: Dashboard > [Nombre Cliente]
   - Botones: "Editar", "Alertas", "Exportar reporte"

2. **Tabs (navegación horizontal)**
   - **Tab 1: KPIs Generales** (default abierto)
   - **Tab 2: Ventas**
   - **Tab 3: Marketing**
   - **Tab 4: Inventario**
   - **Tab 5: Logística**

3. **Tab 1: KPIs Generales (cuadrícula 2×3)**
   ```
   [Score del Negocio]  [Tendencia Semanal]  [Próximos Vencimientos]
   [Alertas Activas]    [Última carga datos] [Plan CRM activo]
   ```
   - Cada card con valor, icono, tendencia (↑/↓/→).

4. **Tab 2: Ventas (ejemplo)**
   - Gráfica de línea: Ventas diarias últimas 4 semanas
   - 4 KPIs principales: Ventas totales, % vs. baseline, Ticket promedio, Conversión
   - Tabla de Top 3 productos (nombre, ventas, % del total)
   - Proyección de cierre: "Proyectado cerrar en $XX,XXX si la tendencia continúa"

5. **Tab 3–5:** Estructura similar, pero con datos específicos de cada área.

---

### PANTALLA 4: Panel ROI (Modal / Page)
**Descripción:** Vista detallada del cálculo de comisiones.

**Elemento visual central: Gráfica dual**
- Eje Y: Monto de ventas (en pesos)
- Eje X: Semanas del período
- Línea 1: Baseline (puntada, color gris)
- Línea 2: Ventas actuales (sólida, verde si va bien)
- Área entre líneas: Ventas incrementales (relleno verde translúcido)

**Cuadrante inferior:**
- 4 cards en fila:
  1. Baseline acordado: $XX,XXX
  2. Ventas actuales: $YY,YYY
  3. Incrementales: $ZZ,ZZZ (color verde)
  4. Comisión ganada: $CC,CCC (color naranja, grande)

- Detalles de comisión escalonada:
  ```
  ≤ Baseline: 0%
  Cumple meta (+XX%): 10% → $A,AAA
  Dobla meta (+YY%): 15% → $B,BBB
  ```

- Tabla histórica: Mes a mes con valores de comisión acumulada
- Botón "Descargar reporte PDF"

---

### PANTALLA 5: Centro de Recomendaciones IA
**Descripción:** Hub de generación, revisión y aprobación de recomendaciones.

**Layout:**
1. **Header:** "Recomendaciones de IA — [Cliente Name]"
2. **Selector de estado (radio buttons):**
   - Pendientes (número destacado)
   - Aprobadas
   - Descartadas
   - Historial

3. **Cada recomendación (tarjeta):**
   ```
   ┌─────────────────────────────────┐
   │ 📊 [Tipo: Ventas/Marketing/etc.] │
   │ Recomendación: "Las ventas..."   │ ← Texto de IA
   │ Área: Ventas                     │
   │ Confianza: 92%  📊 (barra)       │
   │                                 │
   │ [Ver contexto] [Editar] [Enviar] │ ← Botones acciones
   │ [Descartar con motivo...] [Más]  │
   └─────────────────────────────────┘
   ```

4. **Modal de edición:**
   - Textarea para editar texto (si el consultor quiere personalizarlo).
   - Preview del mensaje antes de enviar al cliente.
   - Botones: "Enviar", "Guardar como borrador", "Cancelar".

5. **Historial (tab):**
   - Timeline de recomendaciones (fecha, consultor, decisión, resultado).

---

### PANTALLA 6: Panel de Alertas
**Descripción:** Centro de notificaciones y gestión de alertas.

**Layout:**
1. **Selector de filtros (horizontal):**
   - Todas | Ventas | Inventario | Marketing | Logística | Retención
   - Urgencia: Alta | Media | Baja
   - Estado: Sin resolver | Resueltas

2. **Cada alerta (lista):**
   ```
   ┌────────────────────────────────────┐
   │ [🔴 ALTA] [14:32]                 │
   │ Ventas cayeron 22% vs. semana ant. │
   │ Cliente: NALUA                     │
   │ Mensaje: "Las ventas de..."        │
   │ [Ver en dashboard] [Marcar resuelta] │
   └────────────────────────────────────┘
   ```

3. **Configuración de umbrales (gear icon):**
   - Modal para ajustar triggers por cliente.

---

### PANTALLA 7: Carga de Datos (Excel)
**Descripción:** Módulo de ingesta drag-and-drop.

**Layout:**
1. **Área de Drop (prominente):**
   ```
   ┌─────────────────────────────────┐
   │  📁 Arrastra tu archivo Excel   │
   │     o haz clic para seleccionar │
   │  .xlsx / .csv soportados        │
   └─────────────────────────────────┘
   ```

2. **Validación en tiempo real:**
   - Columnas detectadas vs. esperadas (tabla).
   - Checkmarks verdes para columnas válidas.
   - Advertencias naranjas para columnas faltantes.

3. **Previsualización (10 filas):**
   - Tabla con datos del Excel.

4. **Botones finales:**
   - "Importar" (verde, grande)
   - "Cancelar"

---

### PANTALLA 8: Gestión de Clientes (Admin)
**Descripción:** Tabla / Lista de todos los clientes para agregar, editar, eliminar.

**Layout:**
1. **Barra de acciones:**
   - Botón "+ Nuevo cliente" (verde, prominent)
   - Búsqueda por nombre
   - Filtros: Estado (activo/inactivo), Plan (Base/Pro/etc.)

2. **Tabla (responsive a móvil como scroll horizontal):**
   ```
   | Nombre | Sector | Plan | Consultor asignado | Estado | Acciones |
   |--------|--------|------|--------------------|--------|----------|
   | NALUA  | Retail | Pro  | Juan Pérez         | Activo | [...]   |
   | ... 
   ```

3. **Acciones (botones por fila):**
   - Ver ficha (ojo)
   - Editar (lápiz)
   - Eliminar (papelera) — con confirmación

4. **Modal de creación/edición:**
   - Nombre, sector, giro, RFC, plan, consultor asignado
   - Campos de baseline y meta
   - Guardar/Cancelar

---

### PANTALLA 9: Panel de Prospecto (Demo en vivo)
**Descripción:** Dashboard temporal para cierre de ventas.

**Similar a PANTALLA 3 (Dashboard de Cliente), pero:**
- Con banner amarillo superior: "Panel de prospecto (acceso expira en X días)"
- Datos ficticios de diagnóstico exprés cargados.
- Gráficas proyectadas: "Si contratas, tus ventas podrían crecer así..."
- Botón destacado: "¿Interesado? Empecemos hoy" → Convierte a cliente activo.

---

### PANTALLA 10: Configuración / Perfil
**Descripción:** Ajustes de usuario.

**Secciones:**
1. **Perfil de usuario**
   - Nombre, email, avatar
   - Rol (solo lectura)
   - Contraseña (editar)

2. **Preferencias**
   - Idioma (ES/EN)
   - Zona horaria
   - Notificaciones (toggles): email, WhatsApp, in-app

3. **Integraciones (para fase futura)**
   - Estado de WhatsApp Business
   - Estado de Meta Ads API
   - etc.

---

## 📊 DATOS MOCK / EJEMPLOS PARA PROTOTIPO

### Cliente 1: NALUA (B2C — Retail)
- Baseline: $45,000 MXN/mes
- Ventas actuales (semana 3): $58,500 MXN
- Incrementales: $13,500
- Meta: +35% ($60,750)
- Comisión: $1,350 (10%)
- KPIs:
  - Tasa de conversión: 3.2% (benchmark: 2.8%) ✓
  - CTR Instagram: 1.1% (benchmark: 0.9%) ✓
  - Ticket promedio: $520 (vs. $480 semana anterior)

### Cliente 2: KAWDOBA (B2B — Manufactura)
- Baseline: $120,000 MXN/mes
- Ventas actuales (semana 3): $165,000 MXN
- Incrementales: $45,000
- Meta: +50% ($180,000)
- Comisión: $6,750 (15%)
- KPIs:
  - Rotación de inventario: 2.3x/mes (benchmark: 2.0x)
  - % lotes liquidados a tiempo: 98% (meta: >95%) ✓
  - SLA pedidos: 10h promedio (meta: <12h) ✓

---

## 🎭 VARIANTES POR ROL

### Consultor Aginnova
- ✓ Ve todos los clientes
- ✓ Recibe y aprueba recomendaciones de IA
- ✓ Gestiona alertas
- ✓ Exporta reportes

### Director General
- ✓ Dashboard ejecutiva con KPIs globales
- ✓ Portfolio consolidado
- ✓ Panel de comisiones (suma de todos los clientes)
- ✓ Acceso a toda la configuración

### Cliente MIPYME (Vista restringida)
- ✓ Solo ve sus datos
- ✓ Dashboard simplificado (sin datos operativos de Aginnova)
- ✓ Recibe recomendaciones aprobadas (como sugerencias)
- ✓ Descarga sus reportes
- ✓ Plan Pro Premium: ve benchmarks sectoriales anónimos

---

## 🔐 Consideraciones de UX/Seguridad

1. **Aislamiento visual:** Diferentes acentos por tenant manteniendo el azul base de Aginnova (NALUA = acento teal/verde agua, KAWDOBA = acento azul profundo). El navbar principal siempre en #1C3F6E.
2. **Confirmaciones críticas:** Eliminar cliente, descartar recomendación = modal de confirmación.
3. **Estados de carga:** Spinners mientras se cargan datos / dashboards.
4. **Mensajes de error:** Toasts notificaciones (top right) en rojo para errores.
5. **Mensajes de éxito:** Toasts en verde.
6. **Accesibilidad:** Contraste AA WCAG 2.1, navegación por teclado.

---

## 📐 ESPECIFICACIONES DE COMPONENTES

### Botones
- **Primario:** Azul acero (#1C3F6E), texto blanco, 44px altura (mobile-friendly).
- **Secundario:** Gris (#757575), texto oscuro, con borde.
- **Peligro:** Rojo (#C62828), para acciones destructivas.
- **Hover/Focus:** Oscurecer 10%; outline azul en focus.

### Inputs
- **Altura:** 40px (mobile-friendly).
- **Border:** 1px #E0E0E0, redondeado 4px.
- **Focus:** Border verde #2E7D32, shadow sutil.
- **Label:** Roboto 14px, gris #424242.

### Cards
- **Sombra:** 0px 2px 4px rgba(0,0,0,0.1) (subtle).
- **Padding:** 16px.
- **Border-radius:** 8px.

### Gráficas
- Usar Chart.js o Recharts.
- Colores: Verde para positivo, Rojo para negativo, Azul para información.

---

## 📦 ENTREGABLES ESPERADOS

1. **Wireframes de todas las 10 pantallas clave** (en escala de grises, estructura).
2. **Diseño de alta fidelidad** de las 10 pantallas (con colores, tipografía, componentes finales).
3. **Variantes de responsive:** Desktop + Tablet + Mobile para al menos 3 pantallas clave.
4. **Guía de estilos / Design System** (componentes reutilizables).
5. **Prototipo interactivo** (clickeable) con flujos básicos:
   - Login → Dashboard → Ver cliente → Panel ROI
   - Login → Centro de recomendaciones → Aprobar/editar → Enviar
6. **Exportación en formato accesible** para handoff a desarrollo (specs de medidas, tipografía, colores).

---

## 🎬 FLUJOS INTERACTIVOS A PROTOTIPAR

1. **Login → Home → Ver cliente → Detalle KPIs**
2. **Home → Centro Recomendaciones → Revisar → Editar → Enviar**
3. **Dashboard → Alerta click → Ver en contexto → Marcar resuelta**
4. **Admin clientes → Crear nuevo → Cargar Excel → Validar → Confirmar**
5. **Panel ROI → Exportar PDF** (mostrar preview)

---

## 📝 NOTAS FINALES

- **Brand consistency:** El prototipo debe "respirar" Aginnova; azul acero (#1C3F6E) y gris grafito (#5A6472) predominan. El verde se reserva SOLO para indicadores de éxito/KPIs positivos.
- **Datos realistas:** Usar números de NALUA y KAWDOBA para que se sienta auténtico.
- **Simplicidad visual:** Evitar sobrecarga. Jerarquía clara: título > secciones > detalles.
- **Mobile-first:** Diseñar pensando en móvil; expandir a desktop.
- **Feedback visual:** Toda acción debe tener respuesta inmediata (loader, toast, cambio de estado).
- **Documentación:** Incluir notas explicativas en cada pantalla para desarrolladores.

---

## 📎 ADJUNTOS ESPERADOS DEL CLIENTE

1. **Logo Aginnova** (.png / .svg) — [archivo: logo_aginnova]
2. **PRD completo** — [Archivo: PRD_CRM_Aginnova.md] ✓
3. **Datos de clientes piloto** — NALUA y KAWDOBA (para mock data).
4. **Preferencias de color adicionales** (si las hay).
5. **Ejemplos de pantallas existentes** (si el cliente tiene referentes).

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Todas las 10 pantallas diseñadas.
- [ ] Colores según paleta Aginnova.
- [ ] Logo de Aginnova en header de todas las vistas.
- [ ] Datos mock de NALUA y KAWDOBA integrados.
- [ ] Responsive en mobile/tablet/desktop.
- [ ] Componentes reutilizables documentados.
- [ ] Prototipo interactivo con al menos 5 flujos.
- [ ] Exportación lista para handoff a desarrollo.
- [ ] Notas de UX en cada pantalla.

---

**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Contacto:** Sus (mysuscrew@gmail.com)  
**Estado:** Listo para enviar a Claude Design.
