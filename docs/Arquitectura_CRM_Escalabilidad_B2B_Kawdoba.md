# Arquitectura del CRM y Estrategia de Escalabilidad B2B

**Aprobado por:** Dirección de Tecnología (CTO)
**Enfoque:** Automatización B2B, Inteligencia Artificial Agéntica y Arquitectura Multi-tenant.

## 1. Visión General del Sistema
Para que el nuevo CRM soporte eficazmente las estrategias implementadas en Kawdoba (y clientes futuros de servicios o manufactura boutique), el sistema no debe ser solo un repositorio de contactos. Se requiere una plataforma de orquestación operativa que integre ventas, control de producción por lotes y automatización de marketing bajo un modelo de "Agent-as-a-Service".

## 2. Soporte a las Estrategias de Kawdoba (Casos de Uso)

### A. Gestión de Vida Útil y Protocolo PEPS (T1-S2)
* **Módulo de Trazabilidad:** El CRM debe incluir un submódulo de inventario donde cada unidad producida se registre como un "Lote" con su fecha de caducidad.
* **Automatización con IA Agéntica:** Se configurarán agentes de monitoreo continuo (mediante frameworks como ReAct). Cuando el sistema detecte que un lote de chocolate ha superado el 60% de su vida útil, el agente detonará automáticamente:
  1. Una alerta visual en el dashboard del equipo.
  2. La creación de una campaña automatizada de promociones/descuentos aplicable en el canal de e-commerce.

### B. Consolidación de Pedidos Omnicanal (T1-S3 & T2-S3)
* **Unificación de Fuentes:** El CRM actuará como el *backend* que recibe la información del storefront. Los pedidos que ingresen por la página web deben inyectarse directamente al funnel del CRM.
* **Control de SLAs:** El sistema medirá el tiempo exacto desde la recepción del pedido hasta la confirmación, garantizando el cumplimiento del KPI de ≤ 12 horas hábiles en T2.

### C. Analítica de Demanda (T1-S1)
* **Regla 80/20 Integrada:** Paneles de inteligencia de negocio (BI) dentro del CRM que calculen automáticamente la concentración de ventas por SKU, ayudando a planificar la producción y evitar el exceso de inventario.

## 3. Arquitectura Técnica y Escalabilidad (Futuros Clientes)

Para garantizar la viabilidad a largo plazo y la fácil integración de nuevos clientes B2B, la infraestructura técnica deberá seguir estos lineamientos:

* **Arquitectura Multi-tenant:** Una base de datos estructurada donde cada instancia de cliente (Tenant) opere de manera aislada y segura, permitiendo ofrecer el CRM como un producto SaaS para otras Pymes.
* **Stack Tecnológico Recomendado:** 
  * **Frontend/Backend:** Next.js para asegurar un rendimiento óptimo tanto en el portal del administrador del CRM como en las integraciones web del cliente.
  * **Infraestructura:** Despliegues ágiles utilizando Railway o un VPS gestionado (ej. IONOS) para mantener costos predecibles durante el escalamiento y manejar tareas asíncronas de manera eficiente.
* **Orquestación de Tareas y Desarrollo:** Todo el ciclo de desarrollo, requerimientos de nuevas features y corrección de bugs para este CRM será gestionado y priorizado a través de Linear, garantizando ciclos de entrega rápidos y documentados.

## 4. Onboarding de Futuros Clientes
El diseño del sistema permitirá aplicar el mismo marco de trabajo de Kawdoba a nuevas empresas. Al registrar un nuevo cliente, el CRM solicitará:
1. Definición de la ventana de vida útil de sus productos.
2. Integración de su catálogo.
3. Conexión de webhooks para sus plataformas de venta digital.

La IA orquestadora ajustará las alertas operativas a los parámetros de cada nuevo modelo de negocio, permitiendo un crecimiento acelerado del portafolio B2B de la agencia.
