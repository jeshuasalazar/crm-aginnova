# Documentación de Funcionamiento y Cambios del CRM Aginova

Este documento describe la arquitectura técnica, la estructura de la base de datos, el flujo de los módulos implementados (incluyendo la integración de Skydropx) y los pasos para el desarrollo y despliegue del **CRM Inteligente de Aginova**.

---

## 1. Arquitectura y Stack Tecnológico

El CRM ha sido migrado de un prototipo HTML/JS estático a una plataforma robusta y escalable de nivel empresarial:

*   **Frontend & Backend:** **Next.js (App Router)** usando TypeScript. Unifica la interfaz de usuario con APIs del servidor de alto rendimiento.
*   **Base de Datos y Auth:** **Supabase (PostgreSQL)**. Permite el aislamiento de datos seguro mediante Row-Level Security (RLS) y autenticación robusta mediante cookies de sesión del servidor.
*   **Estilos y Diseño:** **Tailwind CSS v4** integrado con el sistema de diseño premium del CRM (`crm-styles.css`), proporcionando una interfaz responsive, moderna, y adaptada a la identidad visual de Aginova.
*   **Integración Logística:** **Skydropx API v1**. Conexión directa para cotizar envíos multicarrier (FedEx, DHL, Estafeta, etc.) y generar guías en PDF.

---

## 2. Base de Datos (Esquema de Supabase)

El script [schema.sql](file:///Users/MAC/Documents/V&J/Vivi/Aginova/CRM%20Aginova/repo/schema.sql) define la estructura relacional del módulo logístico con soporte para multi-tenant (aislamiento por cliente):

### Tabla: `skydropx_config`
Almacena las credenciales de Skydropx y la dirección de origen para los envíos de cada tenant.
*   `tenant_id` (TEXT, PK): Identificador del cliente (ej. `'NALUA'`, `'KAWDOBA'`).
*   `api_key` (TEXT): Token de autenticación de Skydropx.
*   `default_origin_address` (JSONB): Dirección física del remitente (calle, número, colonia, CP, etc.).

### Tabla: `orders`
Almacena las ventas de e-commerce e ingresos manuales.
*   `id` (UUID, PK): Identificador único de la órden.
*   `tenant_id` (TEXT): Cliente dueño de la orden.
*   `customer_name` (TEXT): Nombre del cliente final.
*   `customer_email` / `customer_phone` (TEXT): Datos de contacto.
*   `shipping_address` (JSONB): Dirección de entrega estructurada.
*   `source` (TEXT): Canal de origen (`'ecommerce'`, `'manual'`, `'whatsapp'`, `'instagram'`).
*   `status` (TEXT): Estatus del flujo (`'pending'`, `'shipped'`, `'delivered'`, `'cancelled'`).
*   `total_amount` (NUMERIC): Valor total de la venta.

### Tabla: `shipments`
Vincula los envíos generados por Skydropx a sus respectivas órdenes.
*   `id` (UUID, PK): ID del envío en el CRM.
*   `tenant_id` (TEXT): Cliente dueño del envío.
*   `order_id` (UUID, FK): Relación con la tabla `orders`.
*   `skydropx_shipment_id` (TEXT): ID de la cotización devuelta por Skydropx.
*   `rate_id` (TEXT): ID de la tarifa seleccionada para la guía.
*   `tracking_number` (TEXT): Número de guía/rastreo oficial.
*   `label_url` (TEXT): URL pública del PDF de la guía generado por Skydropx.
*   `carrier` (TEXT): Paquetería encargada del envío (ej. `'DHL'`, `'FEDEX'`).
*   `status` (TEXT): Estatus del envío (`'draft'`, `'rates_retrieved'`, `'labeled'`, `'in_transit'`).

---

## 3. Módulos y Funcionalidades del CRM

### 3.1 Autenticación y Multi-Tenant Dinámico
*   **Inicio de Sesión Seguro:** Controlado por Supabase Auth a través de [login/actions.ts](file:///Users/MAC/Documents/V&J/Vivi/Aginova/CRM%20Aginova/repo/src/app/login/actions.ts).
*   **Ruteo Protegido:** El Middleware de Next.js verifica si el usuario tiene una sesión activa; de lo contrario, lo redirige al login de manera automática.
*   **Aislamiento de Clientes:** En el layout principal, el sistema detecta el dominio del correo del usuario logueado (ej. si contiene `kawdoba`, activa automáticamente el tenant `'KAWDOBA'`, de lo contrario inicializa en `'NALUA'`), filtrando dinámicamente toda la información mostrada.

### 3.2 Bandeja de Pedidos (`/orders`)
Permite visualizar la lista de compras del e-commerce o canales directos de forma consolidada:
*   **Buscador y Filtros:** Permite buscar clientes en tiempo real y filtrar órdenes por estado (Pendientes de envío vs Enviados).
*   **KPIs en Tiempo Real:** Muestra contadores rápidos del total de pedidos, órdenes pendientes por surtir, guías generadas y el ticket promedio de compra.
*   **Pedidos Manuales:** Modal interactivo para capturar compras concretadas en redes sociales o WhatsApp, recopilando nombre, total y dirección física validada.

### 3.3 Módulo Logístico Skydropx
Integrado dentro de la bandeja de pedidos para simplificar la operación diaria de NALUA y KAWDOBA:
1.  **Cotización de Envíos:** Al hacer clic en "Generar Envío" en un pedido pendiente, se abre un asistente.
2.  **Cajas Pre-configuradas:** El usuario puede seleccionar plantillas de paquetes estándar (ej. bolsa de e-commerce para NALUA, caja grande industrial para KAWDOBA) para cotizar con un solo clic sin tener que ingresar medidas manualmente en cada envío. También se soporta dimensiones personalizadas.
3.  **Tarifas Multicarrier:** Se consultan las tarifas en tiempo real de Skydropx y se muestran ordenadas por precio, indicando paquetería, tipo de servicio y tiempo estimado de entrega.
4.  **Generación de Guías:** Al seleccionar la tarifa y confirmar, la API de Skydropx genera la guía de envío. El CRM actualiza el estado de la órden a `'shipped'`, asocia el número de rastreo y provee un botón directo de descarga del PDF.
5.  **Entorno Sandbox Integrado:** El sistema detecta si la credencial del cliente es de pruebas (`skydropx_sandbox_token_here`). De ser así, se activa un **modo de simulación** que devuelve tarifas realistas y guías de prueba sin costo, ideal para demostraciones con clientes potenciales.

### 3.4 Historial de Envíos (`/shipments`)
Bandeja de seguimiento logístico:
*   Muestra todos los paquetes en camino y entregados.
*   Permite descargar la etiqueta en PDF en cualquier momento a través de un botón rápido.
*   Incluye enlaces directos al portal de rastreo de Skydropx utilizando el número de guía correspondiente.

---

## 4. Despliegue y Flujo de Trabajo

### 4.1 Entorno Local
Para correr el CRM localmente y realizar pruebas de desarrollo:
1.  Instala las dependencias en la carpeta `repo/`:
    ```bash
    npm install
    ```
2.  Asegúrate de tener el archivo `.env.local` con las credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://ywxzrfzcmmrncawbigag.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
    ```
3.  Corre el servidor de desarrollo:
    ```bash
    npm run dev
    ```

### 4.2 Despliegue Continuo (CI/CD)
El flujo de despliegue está automatizado con Railway:
*   Cualquier cambio confirmado en la rama `main` del repositorio de GitHub (`jeshuasalazar/crm-aginnova`) dispara una acción en Railway.
*   Railway compila el proyecto Next.js (`npm run build`) y lo distribuye a producción automáticamente.
