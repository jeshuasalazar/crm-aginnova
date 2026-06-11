# PRD — CRM Inteligente Aginnova
**Versión:** 1.0  
**Fecha:** 2026-06-07  
**Propietario del producto:** Aginnova - Agencia de Transformación Digital  
**Destinatario de implementación:** Claude Code (plan de implementación técnica)

---

## 1. Contexto y Problema

Aginnova opera como Growth Partner de MiPyMEs en México (CDMX), brindando consultoría en marketing, ventas y logística bajo un modelo de **pago por resultados**. Actualmente el negocio tiene 2 clientes piloto (NALUA y KAWDOBA) y proyecta escalar a 10 en 12 meses.

**Problemas actuales:**
- La información de los clientes vive en archivos Excel dispersos y documentos de trabajo sin centralización.
- No existe una forma sistemática de demostrar el ROI que Aginnova genera a cada cliente (crítico para el cobro de comisiones sobre ventas incrementales).
- Los consultores no tienen visibilidad en tiempo real del estado de cada negocio.
- No hay mecanismos de alerta automática cuando algo sale mal.
- La gestión manual de 10+ clientes simultáneos es inviable sin infraestructura digital.

---

## 2. Objetivo del Producto

Construir un CRM inteligente propio de Aginnova que:

1. **Centralice** la información operativa de cada cliente MIPYME (ventas, campañas, inventario, logística).
2. **Demuestre en tiempo real** el impacto económico generado por Aginnova (ROI panel para justificar comisiones).
3. **Genere recomendaciones de IA** que el consultor revisa y aprueba antes de enviar al cliente.
4. **Alerte automáticamente** al consultor vía plataforma y WhatsApp ante anomalías.
5. **Escale** de 2 a 10+ clientes sin aumentar proporcionalmente la carga operativa del equipo.
6. **Sirva como argumento de cierre de ventas** al mostrar datos reales del prospecto durante el diagnóstico.

---

## 3. Usuarios y Roles

### 3.1 Equipo Aginnova (6 personas)

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| Director General | Admin total | Ve todos los clientes, configuración de la plataforma, métricas globales del negocio |
| Especialista Tecnología | Admin operativo | Configura integraciones, gestiona el CRM, supervisa automatizaciones |
| Especialista Marketing | Consultor | Ve clientes asignados + todos los clientes, gestiona campañas y embudos |
| Especialista Operaciones | Consultor | Ve clientes asignados + todos, gestiona inventario y logística |
| Especialista Finanzas | Consultor | Ve panel de ROI, comisiones, proyecciones financieras de todos los clientes |
| Customer Success | Consultor | Gestión de cuentas, coordinación, reportes mensuales |

**Regla de asignación:** Cualquier consultor puede ver todos los clientes, pero cada cliente tiene un consultor asignado como responsable principal. Las alertas y recomendaciones de IA llegan primero al consultor asignado.

### 3.2 Cliente MIPYME (acceso individual por empresa)

| Plan CRM | Acceso |
|----------|--------|
| Base (Nivel 1) | Dashboard de solo lectura — KPIs propios, avance del setup, reportes descargables |
| Pro (Nivel 2) | Dashboard en tiempo real + alertas + recomendaciones aprobadas por consultor |
| Standalone | Dashboard en tiempo real + alertas básicas (sin recomendaciones IA) |
| Pro Premium (+costo) | Todo lo anterior + benchmarks anónimos del sector para comparar su desempeño |

**Regla de aislamiento:** Cada cliente MIPYME solo ve su propia información. El acceso a benchmarks sectoriales anónimos es un add-on de pago (ver sección 8).

---

## 4. Arquitectura General

### 4.1 Modelo Multi-Tenant

El sistema debe implementarse con arquitectura **multi-tenant** donde cada cliente MIPYME es un tenant aislado. Esto permite:
- Seguridad y privacidad total entre clientes.
- Escalabilidad lineal al incorporar nuevos clientes.
- Eventual oferta del CRM como producto SaaS independiente.

### 4.2 Stack Tecnológico Recomendado

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | Next.js (React) | Rendimiento web + móvil, SSR para dashboards, ecosistema robusto |
| Backend / API | Next.js API Routes o Node.js (Express/Fastify) | Unificación del stack, tipado compartido |
| Base de datos | PostgreSQL con Row-Level Security | Multi-tenant nativo, relacional para datos financieros |
| IA / Agentes | Python (FastAPI) + LLM vía API (OpenAI/Claude) con framework ReAct | Agentes autónomos para monitoreo y recomendaciones |
| Automatización | Webhooks + tareas programadas (cron) | Alertas en tiempo real y sincronización de datos |
| Hosting | Railway o VPS gestionado (IONOS) | Costos predecibles, región México/LATAM |
| Almacenamiento datos | AWS S3 o equivalente mexicano (Telmex Claro Cloud) | Datos en territorio nacional (LGPD) |
| WhatsApp | WhatsApp Business API (vía Twilio o 360dialog) | Notificaciones al consultor |
| Gestión de proyecto | Linear | Tickets, features, bugs del CRM |
| CI/CD | GitHub Actions | Despliegues automatizados |

### 4.3 Idiomas

La plataforma debe soportar **español e inglés** con selector de idioma por usuario. El idioma por defecto es español.

### 4.4 Dispositivos

La aplicación debe funcionar correctamente en **escritorio y móvil** (responsive design). Ambos son de igual prioridad. No se requiere app nativa en primera versión.

### 4.5 Hosting y Cumplimiento

- **Servidores:** En territorio mexicano o con garantía contractual de residencia de datos en México.
- **Ley aplicable:** LGPD (Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados).
- **SLA objetivo:** 99.5% de uptime mensual.

---

## 5. Módulos Funcionales

### Módulo 1 — Gestión de Clientes (Tenants)

**Descripción:** Panel central de Aginnova para administrar todos sus clientes MIPYME.

**Funcionalidades:**
- Alta, baja y modificación de clientes (tenants).
- Asignación de consultor responsable por cliente.
- Registro del plan CRM activo (Base, Pro, Standalone, Pro Premium).
- Visualización de estado general de cada cliente: semáforo (verde/amarillo/rojo) basado en KPIs clave.
- Registro del **baseline de ventas** acordado al inicio del Nivel 1 (punto de referencia para cálculo de comisiones).
- Registro de la **meta acordada** para el Nivel 2 (ej. +35% sobre baseline en 3 meses).
- Vista tipo "portfolio" — tarjetas de cada cliente con KPIs rápidos y alertas pendientes.
- Historial de fases de la metodología Aginnova por cliente (Fase 1 a 5).

---

### Módulo 2 — Ingesta y Gestión de Datos

**Descripción:** Motor que recibe, procesa y almacena los datos operativos de cada cliente MIPYME.

**Fuente de datos inicial (MVP):**
- Carga manual de archivos Excel (ventas, inventario, campañas).
- Interfaz de carga drag-and-drop con validación automática de columnas.
- Plantillas Excel descargables con formato estándar Aginnova.

**Fuentes de datos futuras (roadmap post-MVP):**
- Redes sociales: Instagram, TikTok, Facebook (via API).
- Plataformas de e-commerce: Shopify, WooCommerce (webhooks).
- Puntos de venta físicos: integración genérica vía CSV/API.
- Facturación electrónica CFDI (SAT).
- Google Analytics / Meta Ads (vía conectores).
- Pasarelas de pago: MercadoPago, Stripe.

**Procesamiento:**
- Normalización automática de datos al ingerir.
- Detección de duplicados y valores atípicos.
- Versionado de datos: cada carga queda registrada con timestamp y fuente.
- Sincronización en tiempo real cuando la fuente lo permite; polling cada 15 minutos para fuentes que no tienen webhooks.

---

### Módulo 3 — Dashboard de KPIs

**Descripción:** Tablero visual adaptado a cada tipo de usuario (consultor Aginnova vs. dueño MIPYME).

#### Vista Consultor Aginnova

**Área de Ventas:**
- Ventas totales del período vs. baseline vs. meta acordada.
- Ventas incrementales generadas (base para comisión).
- Tasa de conversión por canal.
- Ticket promedio.
- CAC (Costo de Adquisición de Cliente) del cliente MIPYME.
- LTV estimado de los clientes del MIPYME.
- Top 3 productos/servicios por volumen de ventas (regla 80/20).
- Proyección de cierre de mes.

**Área de Marketing:**
- Alcance y engagement por campaña.
- CTR y conversiones atribuidas a cada canal digital.
- Leads generados vs. leads convertidos.
- Costo por lead por canal.
- Estado de cada campaña activa.

**Área de Logística / Operaciones:**
- Nivel de inventario por SKU.
- Alertas de stock bajo o sobre-stock.
- Tasa de cumplimiento de pedidos (SLA de entrega).
- Devoluciones y motivos.
- Control de lotes con fecha de caducidad (aplica para productos perecederos como KAWDOBA).
- Pronóstico de demanda por SKU (próximas 4 semanas).

**Área de Salud del Negocio:**
- Score general del negocio (índice compuesto: ventas + operaciones + marketing).
- Tendencia semana a semana.
- Alertas activas sin resolver.
- Próximos vencimientos (lotes, pagos, renovaciones).

#### Vista Cliente MIPYME

- Versión simplificada del dashboard anterior (sin datos internos de Aginnova).
- Solo ve sus propios datos.
- Indicadores semáforo (verde/amarillo/rojo) en lugar de números crudos para facilitar la lectura.
- Plan Pro Premium: sección adicional con benchmarks anónimos del sector (promedio de empresas similares sin revelar identidad).

---

### Módulo 4 — Panel de ROI (Motor de Comisiones)

**Descripción:** Panel crítico para el modelo de negocio de Aginnova. Demuestra de forma transparente e incuestionable el valor generado.

**Funcionalidades:**
- Muestra el **baseline** de ventas acordado al inicio del contrato.
- Muestra las ventas actuales del período.
- Calcula automáticamente las **ventas incrementales** (actual − baseline).
- Aplica la comisión escalonada según los umbrales del contrato:
  - Sin mejora (≤ baseline): 0%
  - Cumple meta acordada: 10% sobre incrementales
  - Dobla la meta: 15% sobre incrementales
- Muestra el monto de comisión generado en el período.
- Acumulado histórico de comisiones mes a mes.
- Exporta reporte de comisiones en PDF/Excel para cobro o presentación al cliente.
- Gráfica de tendencia: ventas baseline vs. ventas actuales desde el inicio del contrato.
- Visible para: consultor asignado, Director General, Especialista Finanzas, y el cliente MIPYME (solo su propio panel).

**Regla de negocio crítica:** La comisión se calcula **solo sobre ventas incrementales verificables** (facturación o reporte de plataforma), no sobre el total de ventas brutas.

---

### Módulo 5 — Motor de IA y Recomendaciones

**Descripción:** Sistema de inteligencia artificial que monitorea continuamente los datos de cada cliente y genera recomendaciones accionables.

#### 5.1 Tipos de Recomendaciones

| Área | Ejemplo de recomendación generada por IA |
|------|------------------------------------------|
| Ventas | "Las ventas de [Producto X] cayeron 22% esta semana. Considera una promoción del 15% antes del viernes." |
| Marketing | "La campaña de Meta Ads tiene un CTR de 0.4% (benchmark: 1.2%). Pausar el conjunto de anuncios B y reasignar presupuesto al A." |
| Inventario | "El SKU [Y] tiene stock para 4 días al ritmo actual. Hacer pedido a proveedor hoy." |
| Logística | "El lote [Z] alcanza el 60% de su vida útil el miércoles. Activar campaña de liquidación con 20% de descuento." |
| Retención | "Este cliente MIPYME lleva 2 meses sin crecer. Agendar sesión estratégica de revisión antes del día 15." |

#### 5.2 Flujo de Aprobación

```
IA genera recomendación
  → Notificación al consultor asignado (plataforma + WhatsApp)
    → Consultor revisa en la plataforma
      → Opción A: Aprobar y enviar al cliente MIPYME (aparece en su dashboard como sugerencia)
      → Opción B: Editar y enviar
      → Opción C: Descartar (con motivo opcional)
        → Historial de recomendaciones y decisiones queda registrado
```

**El cliente MIPYME nunca ve una recomendación que el consultor no haya aprobado.**

#### 5.3 Agentes de Monitoreo Continuo

Implementados con framework ReAct (Reason + Act):

- **Agente de Ventas:** Detecta caídas o picos anómalos en ventas diarias/semanales.
- **Agente de Inventario:** Monitorea niveles de stock, caducidades y sobre-stock.
- **Agente de Marketing:** Analiza rendimiento de campañas vs. benchmarks del sector.
- **Agente de Retención:** Evalúa tendencia del cliente MIPYME y señala riesgo de churn del lado de Aginnova.
- **Agente de ROI:** Proyecta al día actual si el cliente va a alcanzar o superar la meta del período.

#### 5.4 Benchmarks Sectoriales (Feature Premium)

- La IA agrega datos anónimos de todos los clientes del mismo sector para calcular promedios.
- Estos benchmarks están disponibles como feature de pago adicional en el plan Pro.
- Los datos individuales nunca se revelan; solo se muestran agregados con mínimo 3 empresas en el sector.

---

### Módulo 6 — Sistema de Alertas

**Descripción:** Notificaciones automáticas que no requieren que nadie vaya a revisar la plataforma.

**Canales:**
- Notificación interna en la plataforma (badge + panel de notificaciones).
- WhatsApp Business al consultor asignado (vía API).

**Tipos de alerta:**

| Trigger | Receptor | Urgencia |
|---------|----------|----------|
| Ventas caen >15% vs. semana anterior | Consultor asignado | Alta |
| Stock de un SKU < umbral definido | Consultor asignado | Alta |
| Lote supera 60% de vida útil | Consultor asignado | Media |
| Campaña con CTR < 50% del benchmark | Consultor asignado | Media |
| Cliente MIPYME no sube datos en >7 días | Consultor asignado | Baja |
| Nueva recomendación de IA generada | Consultor asignado | Según tipo |
| Meta del mes en riesgo (proyección < 80%) | Consultor + Director | Alta |
| Comisión del mes calculada disponible | Director + Finanzas | Informativa |

**Configuración:** El consultor puede ajustar umbrales de alerta por cliente (ej. cambiar el umbral de caída de ventas de 15% a 20% para un cliente con alta estacionalidad).

---

### Módulo 7 — Automatizaciones Comerciales (Workflows)

**Descripción:** Flujos de trabajo automáticos para los clientes MIPYME según su tipo de negocio.

**Workflows B2C (tipo NALUA):**
- Secuencia de recuperación de carrito abandonado:
  - Día 1: Notificación "pocas piezas disponibles".
  - Día 3: Código de descuento dinámico 10% válido 48h.
  - Día 7: Oferta final de fidelización.
- Envío automático de encuesta NPS/CSAT 48h después de entrega confirmada.
- Tagging dinámico de clientes del MIPYME: Cliente Nuevo, Cliente Activo, Cliente Leal, Cliente Embajador (basado en frecuencia de compra).
- SLA de respuesta al cliente: alerta si un ticket no es atendido en >10 min en horario operativo.

**Workflows B2B (tipo KAWDOBA):**
- Alerta de caducidad de lote → creación automática de campaña de liquidación.
- Consolidación de pedidos omnicanal (web + físico + WhatsApp) en un solo pipeline.
- Control de SLA de pedido: alerta si se supera el tiempo de confirmación acordado (ej. 12h hábiles).

**Workflows Aginnova:**
- Al agregar nuevo cliente: solicitar definición de baseline, meta y KPIs objetivo.
- Al cerrar mes: generar borrador de reporte mensual de KPIs automáticamente.
- Al alcanzar 80% del período sin alcanzar meta: disparar alerta a consultor + Director.

---

### Módulo 8 — Panel de Prospecto (Demo en Vivo)

**Descripción:** Herramienta de cierre de ventas. Permite cargar datos de un prospecto y mostrar un dashboard en vivo durante la reunión.

**Funcionalidades:**
- Crear un "tenant prospecto" temporal con los datos del diagnóstico exprés.
- Generar dashboard con KPIs actuales del prospecto vs. benchmark del sector.
- Proyección de resultados potenciales si contrata Nivel 1 + 2 (estimación basada en casos similares).
- El acceso de prospecto expira automáticamente a los 7 días o al convertirse en cliente.
- Al convertirse en cliente, el tenant prospecto migra a cliente activo sin perder datos.

---

### Módulo 9 — Gestión de Inventario y Cadena de Suministro

**Descripción:** Módulo operativo para clientes con productos físicos.

**Funcionalidades:**
- Catálogo de SKUs con precio, costo, margen y categoría.
- Control de lotes con:
  - Fecha de ingreso.
  - Fecha de caducidad (configurable por tipo de producto).
  - Cantidad disponible.
  - Alerta automática al 60% de vida útil consumida.
- Regla 80/20 automática: identificar qué SKUs generan el 80% de los ingresos.
- Pronóstico de demanda a 4 semanas basado en histórico.
- Directorio de proveedores con variables de calificación (precio, calidad, tiempos).
- Cálculo automático de costo promedio ponderado y margen de utilidad por lote.
- Sugerencia de pedido de reposición basada en demanda proyectada.

---

### Módulo 10 — Captación y Gestión de Leads (del MIPYME)

**Descripción:** Pipeline de ventas del cliente MIPYME gestionado desde el CRM.

**Funcionalidades:**
- Fuentes de captación: web, redes sociales, punto de venta físico, WhatsApp.
- Clasificación automática de interés:
  - Alto: compras previas, carrito, apertura de emails.
  - Medio: visitas web, consultas sin compra.
  - Bajo: registros únicos sin interacción.
- Pipeline Kanban por etapa del embudo (AIDA).
- Asignación de leads a agentes de ventas del MIPYME.
- Trazabilidad completa del journey del cliente final.
- Métricas: tasa de conversión por fuente, volumen de leads, costo por lead.

---

### Módulo 11 — Reportes y Exportación

**Funcionalidades:**
- Reporte mensual de KPIs (generado automáticamente al cierre de mes).
- Reporte de comisiones exportable en PDF y Excel.
- Reporte de desempeño por campaña.
- Reporte de inventario y rotación.
- Todos los reportes son descargables por el cliente MIPYME (según su plan).
- Los reportes del consultor incluyen sección adicional con contexto estratégico y recomendaciones aprobadas del período.

---

### Módulo 12 — Onboarding de Nuevos Clientes

**Descripción:** Flujo guiado para incorporar un nuevo cliente MIPYME al sistema.

**Pasos del onboarding:**
1. Datos generales de la empresa (nombre, sector, giro, RFC, contacto principal).
2. Definición de baseline de ventas (promedio 2-3 meses previos).
3. Definición de meta acordada para el período.
4. Definición de KPIs prioritarios a monitorear.
5. Configuración de fuentes de datos (inicio con Excel, fuentes adicionales opcionales).
6. Definición de umbrales de alerta personalizados.
7. Para productos físicos: carga de catálogo de SKUs y configuración de reglas de inventario.
8. Invitación al usuario del cliente MIPYME (email de acceso).

---

## 6. Requisitos No Funcionales

| Requisito | Especificación |
|-----------|---------------|
| **Disponibilidad** | SLA 99.5% de uptime mensual |
| **Rendimiento** | Dashboards cargan en < 3 segundos; alertas se disparan en < 1 minuto tras detectar la condición |
| **Seguridad** | Aislamiento multi-tenant estricto (Row-Level Security en DB); autenticación con MFA opcional |
| **Privacidad** | Cumplimiento LGPD; datos almacenados en servidores en México |
| **Escalabilidad** | Arquitectura que soporte de 2 a 50+ tenants sin rediseño |
| **Idiomas** | Español (default) + Inglés; selector por usuario |
| **Dispositivos** | Responsive web (desktop + móvil); no se requiere app nativa en MVP |
| **Backups** | Respaldo diario automático con retención de 30 días |
| **Auditoría** | Log de acciones de usuario (quién vio, editó o exportó qué y cuándo) |

---

## 7. Planes de Acceso y Monetización del CRM

*(Detalle completo en `planes_crm.md`)*

| Plan | Precio | Incluido en | Funciones clave |
|------|--------|-------------|-----------------|
| Vista Prospecto | Gratis | Diagnóstico Exprés | Dashboard temporal con datos del prospecto para demo de cierre |
| Base | Incluido en Nivel 1 ($7,500 MXN) | Setup / Estabilización | Dashboard solo lectura, KPIs, reportes descargables |
| Pro | Incluido en Nivel 2 ($3,500 MXN/mes) | Growth Partner | Tiempo real, alertas WhatsApp, IA vía consultor, Panel ROI |
| Standalone | $2,500 MXN/mes | Autónomo | Dashboard + alertas básicas, sin IA ni consultoría |
| Pro Premium (add-on) | +costo a definir | Sobre Plan Pro | Benchmarks sectoriales anónimos |

---

## 8. Integraciones

### MVP (Lanzamiento)
- Carga de Excel (.xlsx, .csv) — ventas, inventario, campañas.
- WhatsApp Business API (alertas al consultor).
- Exportación PDF/Excel de reportes.

### Fase 2 (post-MVP, primeros 6 meses)
- Meta Ads API (campañas y métricas).
- Google Analytics 4.
- Shopify / WooCommerce (webhooks de pedidos e inventario).
- MercadoPago / Stripe (datos de transacciones).

### Fase 3 (6–18 meses)
- CFDI / SAT (facturación electrónica para verificación de ventas brutas).
- Instagram / TikTok Business (métricas orgánicas).
- Puntos de venta físicos (integración genérica vía API o CSV automático).
- Odoo / HubSpot (migración o sincronización si el cliente ya tiene CRM).

---

## 9. Casos de Uso Piloto

### NALUA (B2C — Retail de productos)
**Configuración especial:**
- Fuentes: Instagram, TikTok, sitio web, bazares físicos.
- Módulos activos: Leads, Workflows (carritos abandonados), Inventario, Fidelización (NPS), Dashboard Marketing.
- KPIs clave: Tasa de conversión web, CTR redes sociales, ticket promedio, devoluciones.
- Meta: ↑ conversión 20-30%, ↓ costo inventario 15%.

### KAWDOBA (B2B — Productos especializados / manufactura boutique)
**Configuración especial:**
- Fuentes: Página web, canal de ventas directo, posibles marketplaces.
- Módulos activos: Inventario con control de lotes y caducidades, Pipeline B2B, Analítica de demanda (80/20), Automatización de liquidación por caducidad.
- KPIs clave: Rotación de inventario, % lotes liquidados a tiempo, SLA de pedidos, leads generados.
- Meta: ↑ tráfico 200%, ↑ leads 150%, 0% pérdidas por caducidad.

---

## 10. Métricas de Éxito del CRM (desde el lado de Aginnova)

| Métrica | Meta MVP (mes 3) | Meta escala (mes 12) |
|---------|-----------------|---------------------|
| Clientes MIPYME activos en el CRM | 2 | 10 |
| % de comisiones cobradas justificadas via Panel ROI | 100% | 100% |
| Churn de clientes Aginnova | < 10% | < 5% |
| Tiempo de onboarding de nuevo cliente | < 1 semana | < 3 días |
| Recomendaciones IA aprobadas por consultor | — | > 70% |
| Tiempo de respuesta promedio del consultor a alertas | — | < 4 horas |
| NPS de clientes MIPYME sobre el CRM | — | > 40 |

---

## 11. Fuera del Alcance (MVP)

- App nativa iOS/Android.
- Módulo de contabilidad o nómina.
- Integración directa con SAT para CFDI (Fase 3).
- Chatbot para el cliente final del MIPYME.
- Módulo de CRM para los propios prospectos de Aginnova (gestión de ventas de la agencia).
- Integraciones con redes sociales (Fase 2).
- Multi-idioma (implementar en Fase 2 — MVP en español únicamente).

---

## 12. Supuestos y Dependencias

- Aginnova obtiene acceso a WhatsApp Business API antes del lanzamiento del MVP.
- Los clientes piloto (NALUA, KAWDOBA) aceptan ser los primeros en usar el sistema.
- Los datos de ventas actuales en Excel de NALUA y KAWDOBA se pueden importar al sistema con limpieza manual inicial.
- El baseline de ventas de cada cliente piloto está documentado y acordado contractualmente.
- El equipo de Aginnova (6 personas) puede dedicar tiempo para el onboarding y pruebas del MVP.
- Se selecciona un proveedor de hosting con infraestructura en México antes de iniciar el desarrollo.

---

## 13. Riesgos

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Clientes MIPYME no suben datos consistentemente | Alto | Recordatorios automáticos + consultor asignado hace seguimiento |
| WhatsApp Business API tiene restricciones de mensajes | Medio | Usar plantillas aprobadas; canal alternativo: email |
| Datos insuficientes para benchmarks sectoriales (< 3 clientes por sector) | Medio | Lanzar feature premium solo cuando haya mínimo 3 clientes en el mismo sector |
| Recomendaciones de IA con baja tasa de aprobación | Medio | Ajuste iterativo de los prompts y modelos; feedback del consultor registrado |
| LGPD: manejo inadecuado de datos sensibles | Alto | Revisión legal previa al lanzamiento; NDA con cada cliente |

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| **Tenant** | Instancia aislada de un cliente MIPYME dentro del sistema multi-tenant |
| **Baseline** | Promedio de ventas de los 2-3 meses previos al inicio del contrato, punto de referencia para calcular incrementales |
| **Ventas incrementales** | Ventas actuales menos el baseline; base de cálculo para las comisiones de Aginnova |
| **Meta acordada** | Objetivo de ventas establecido contractualmente al inicio del Nivel 2 (rango: +25% a +50% sobre baseline) |
| **Panel ROI** | Dashboard que muestra en tiempo real el impacto económico generado por Aginnova sobre el baseline |
| **Agente ReAct** | Agente de IA que razona sobre los datos y ejecuta acciones (alertas, recomendaciones) de forma autónoma y continua |
| **Benchmark sectorial** | Promedio anónimo de métricas de empresas del mismo sector; disponible como feature premium |
| **SKU** | Unidad de mantenimiento de existencias; identificador único de un producto |
| **SLA** | Acuerdo de nivel de servicio; tiempo máximo para cumplir un compromiso operativo |
| **LGPD** | Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (México) |

---

*Archivos relacionados:*  
- `estrategia_de_costos.md` — Modelo de precios de consultoría (Niveles 0, 1 y 2)  
- `planes_crm.md` — Planes de acceso al CRM y estrategia de monetización  
- `Contexto_General_Aginova.md` — Contexto empresarial completo  
- `Arquitectura_CRM_Escalabilidad_B2B_Kawdoba.md` — Casos de uso B2B  
- `Arquitectura_CRM_Escalable_Nalua.md` — Casos de uso B2C  
