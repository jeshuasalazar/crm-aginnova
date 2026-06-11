# 📜 Plan Legal — CRM Aginova
## Registro y Cumplimiento de Datos (Legal Tech)

**Fecha de elaboración:** 11 de junio de 2026  
**Responsable Legal:** Viviana Jiménez Luis — Administradora Única / Representante Legal  
**Razón Social:** INNOVATECH S.A.S. (operando comercialmente como **AGINNOVA**)  
**Folio de Constitución:** SAS-1.7-205101-45754  
**Domicilio Fiscal:** Av. Océano Pacífico Ext. 94 Int. 6A, Col. Lomas Lindas, Atizapán de Zaragoza, Estado de México  
**Contacto de Socios:** mysuscrew@gmail.com  
**Repositorio del CRM:** [jeshuasalazar/crm-aginnova](https://github.com/jeshuasalazar/crm-aginnova)  
**Despliegue Productivo:** Railway (CI/CD enlazado a la rama `main`)

---

## Índice

1. [Fundamento y Alcance](#1-fundamento-y-alcance)
2. [Marco Jurídico Aplicable](#2-marco-jurídico-aplicable)
3. [Aviso de Privacidad Integral](#3-aviso-de-privacidad-integral)
4. [Términos y Condiciones de Uso](#4-términos-y-condiciones-de-uso)
5. [Plan de Implementación Técnica](#5-plan-de-implementación-técnica)
6. [Anexos y Referencias](#6-anexos-y-referencias)

---

## 1. Fundamento y Alcance

### 1.1 Propósito del presente documento

El CRM Aginova es una plataforma SaaS multi-tenant que procesa de forma masiva bases de datos de **clientes, prospectos, órdenes de venta, envíos, inventarios y datos financieros** de múltiples empresas (tenants). Dado el volumen y sensibilidad de los datos personales tratados, es obligación legal de INNOVATECH S.A.S. contar con:

1. Un **Aviso de Privacidad Integral** conforme a la LFPDPPP y su Reglamento.
2. **Términos y Condiciones de Uso** que regulen la relación contractual con los usuarios de la plataforma.

### 1.2 Datos personales tratados en el CRM

Con base en el esquema de base de datos documentado en `CONTEXTO_CRM.md`, la plataforma trata las siguientes categorías de datos:

| Tabla / Módulo | Datos Personales Recopilados | Clasificación |
|:---|:---|:---|
| `profiles` | Nombre, email, rol, tenant asociado | Identificación |
| `orders` | Nombre del cliente final, dirección de envío, teléfono, email, monto de compra | Identificación + Patrimonial |
| `shipments` | Dirección de destino, número de guía, carrier, tracking URL | Identificación + Logístico |
| `leads` | Nombre, email, teléfono, empresa, pipeline comercial | Identificación + Comercial |
| `inventory_skus` / `inventory_batches` | Datos de productos, costos, precios | Patrimonial (del tenant) |
| `sales_data` / `sales_baselines` | Ingresos diarios por canal, márgenes, comisiones | Financiero / Patrimonial |
| `skydropx_config` | API Keys de terceros, dirección de origen de envíos | Técnico / Comercial |
| `data_uploads` | Archivos CSV con datos importados por el usuario | Variable (puede incluir datos sensibles) |

### 1.3 Tenants y modelo multi-inquilino

El CRM opera bajo un modelo de aislamiento estricto mediante **Row-Level Security (RLS)** en Supabase (PostgreSQL). Cada tenant (NALUA, KAWDOBA, FERREX y futuros) únicamente accede a sus propios registros. La detección de tenant se realiza dinámicamente mediante el dominio del correo electrónico del usuario autenticado.

### 1.4 Infraestructura de terceros involucrada

| Servicio | Proveedor | Función | Jurisdicción |
|:---|:---|:---|:---|
| Base de Datos | Supabase Inc. | PostgreSQL gestionado con Auth y RLS | EE.UU. (AWS) |
| Despliegue / Hosting | Railway Corp. | CI/CD y servidor de producción | EE.UU. |
| Logística / Envíos | Skydropx S.A.P.I. de C.V. | Cotización y generación de guías | México |
| Repositorio de Código | GitHub Inc. (Microsoft) | Control de versiones | EE.UU. |

> **⚠️ Nota Importante:** La transferencia internacional de datos personales a servidores ubicados en Estados Unidos requiere el consentimiento del titular y el cumplimiento de las obligaciones establecidas en los artículos 36 y 37 de la LFPDPPP.

---

## 2. Marco Jurídico Aplicable

### 2.1 Legislación federal obligatoria

| Instrumento Legal | Relevancia para el CRM |
|:---|:---|
| **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** — DOF 05/07/2010 | Regula la recopilación, uso, almacenamiento y transferencia de datos personales por particulares. Aplica directamente a INNOVATECH S.A.S. como responsable del tratamiento. |
| **Reglamento de la LFPDPPP** — DOF 21/12/2011 | Detalla los requisitos del aviso de privacidad, medidas de seguridad, ejercicio de derechos ARCO y procedimientos. |
| **Lineamientos del Aviso de Privacidad** — DOF 17/01/2013 (INAI) | Especifica el contenido mínimo obligatorio del aviso de privacidad integral, simplificado y corto. |
| **Ley General de Sociedades Mercantiles** | Marco societario bajo el cual opera INNOVATECH S.A.S. (arts. 260-274, Título Séptimo). |
| **Código de Comercio** | Regulación general de actos mercantiles, contratos electrónicos y comercio digital (arts. 89-94 Bis). |
| **Ley Federal del Consumidor** | Protección al consumidor en transacciones comerciales digitales (si el CRM interactúa con consumidores finales). |
| **Código Fiscal de la Federación** | Obligaciones de facturación electrónica (CFDI) y conservación de registros. |

### 2.2 Principios rectores de la LFPDPPP (Art. 6)

El tratamiento de datos personales en el CRM Aginova deberá observar en todo momento los siguientes principios:

1. **Licitud** — Tratamiento conforme a la ley y con consentimiento.
2. **Consentimiento** — Previo, informado, libre e inequívoco.
3. **Información** — Aviso de privacidad completo y accesible.
4. **Calidad** — Datos exactos, completos, pertinentes, correctos y actualizados.
5. **Finalidad** — Uso limitado a los fines informados.
6. **Lealtad** — Prevaleciendo la expectativa razonable de privacidad.
7. **Proporcionalidad** — Solo datos estrictamente necesarios.
8. **Responsabilidad** — Medidas para garantizar el cumplimiento.

---

## 3. Aviso de Privacidad Integral

> **Nota:** El siguiente aviso deberá publicarse de manera visible y permanente en la plataforma CRM Aginova (página de login, footer y sección dedicada `/privacidad`), así como proporcionarse a cada nuevo usuario al momento de su registro.

---

### AVISO DE PRIVACIDAD INTEGRAL

**Última actualización:** 11 de junio de 2026

#### I. Identidad y Domicilio del Responsable

**INNOVATECH S.A.S.** (en lo sucesivo, **"AGINNOVA"** o el **"Responsable"**), con domicilio en Avenida Océano Pacífico número exterior 94, interior 6A, Colonia Lomas Lindas, Municipio de Atizapán de Zaragoza, Estado de México, C.P. 52999, es responsable del tratamiento de los datos personales que recaba a través de la plataforma **CRM Aginova** (en lo sucesivo, la **"Plataforma"**).

**Representante Legal:** Viviana Jiménez Luis  
**Contacto para asuntos de privacidad:** mysuscrew@gmail.com  

#### II. Datos Personales que se Recaban

Para las finalidades descritas en el presente aviso, AGINNOVA podrá recabar las siguientes categorías de datos personales:

**a) Datos de identificación:**
- Nombre completo
- Correo electrónico corporativo
- Domicilio comercial y/o de envío
- Número telefónico de contacto
- Nombre de la empresa u organización (razón social)

**b) Datos patrimoniales y financieros:**
- Información de órdenes de venta (montos, productos, precios)
- Datos de ingresos y ventas por canal
- Márgenes de comisión y cuotas de venta
- Costos de inventario y precios de catálogo
- Información de envíos y guías de paquetería (tarifas, carriers)

**c) Datos técnicos y de uso de la Plataforma:**
- Dirección IP
- Tipo de navegador y dispositivo
- Cookies de sesión y preferencias de autenticación
- Registros de actividad dentro de la Plataforma (logs)
- Archivos CSV u otros documentos cargados por el usuario

**d) Datos de terceros (clientes finales del Tenant):**
- Nombre, dirección de envío, teléfono y correo electrónico de los destinatarios de pedidos registrados en el módulo de Órdenes y Envíos.

> **⚠️ AGINNOVA no recaba datos personales sensibles** (origen étnico, estado de salud, creencias religiosas, orientación sexual, datos biométricos, entre otros). En caso de que algún usuario cargue inadvertidamente información sensible mediante archivos CSV u otro medio, AGINNOVA procederá a su eliminación inmediata una vez detectada.

#### III. Finalidades del Tratamiento

**Finalidades primarias (necesarias para la relación jurídica):**

1. Crear y administrar la cuenta de usuario en la Plataforma.
2. Asignar el perfil del usuario al Tenant correspondiente y aplicar los permisos de acceso basados en su rol.
3. Procesar y gestionar órdenes de venta, incluyendo la generación de cotizaciones de envío y guías de paquetería a través de Skydropx.
4. Administrar el inventario, catálogo de productos y lotes del Tenant.
5. Calcular indicadores financieros (ROI, comisiones, cumplimiento de metas) en el panel de análisis.
6. Generar alertas operativas automatizadas (desabasto, caducidad, pedidos atrasados).
7. Procesar la importación masiva de datos mediante archivos CSV.
8. Ejecutar flujos de automatización (workflows) configurados por el usuario.
9. Cumplir con obligaciones legales, fiscales y contractuales aplicables.

**Finalidades secundarias (no indispensables):**

10. Generar recomendaciones estratégicas mediante inteligencia artificial para la toma de decisiones del Tenant.
11. Elaborar estadísticas agregadas y análisis de tendencias para mejorar la Plataforma.
12. Enviar comunicaciones informativas sobre actualizaciones, nuevas funcionalidades o mantenimientos programados de la Plataforma.
13. Realizar análisis ABC de inventario para optimizar esfuerzos comerciales.

> Si usted no desea que sus datos personales sean tratados para las finalidades secundarias, podrá comunicarlo al correo electrónico **mysuscrew@gmail.com** en cualquier momento. La negativa para el tratamiento de finalidades secundarias no será motivo para negar los servicios de la Plataforma.

#### IV. Transferencias de Datos Personales

AGINNOVA podrá realizar las siguientes transferencias de datos personales **sin requerir consentimiento adicional**, conforme al artículo 37 de la LFPDPPP:

| Destinatario | Finalidad | País |
|:---|:---|:---|
| **Supabase Inc.** | Almacenamiento y procesamiento de la base de datos en infraestructura PostgreSQL gestionada. | Estados Unidos |
| **Railway Corp.** | Alojamiento y despliegue de la aplicación web del CRM. | Estados Unidos |
| **GitHub Inc. (Microsoft)** | Almacenamiento del código fuente en repositorio de control de versiones (no incluye datos personales de usuarios finales). | Estados Unidos |

AGINNOVA podrá realizar las siguientes transferencias **que requieren consentimiento del titular**:

| Destinatario | Finalidad | País |
|:---|:---|:---|
| **Skydropx S.A.P.I. de C.V.** | Cotización de tarifas de envío y generación de guías de paquetería, lo cual implica compartir la dirección de destino del envío y datos del destinatario. | México |
| **Carriers de paquetería** (DHL, FedEx, Estafeta, etc., a través de Skydropx) | Ejecución del servicio de transporte de mercancía. | México / Internacional |

> **Consentimiento:** Al utilizar el módulo de Órdenes y Envíos de la Plataforma, el usuario Tenant acepta que los datos de dirección y contacto del destinatario de cada envío sean compartidos con Skydropx y los carriers correspondientes para la ejecución del servicio logístico.

#### V. Mecanismos de Seguridad

AGINNOVA implementa las siguientes medidas de seguridad técnicas, administrativas y físicas para proteger los datos personales:

**Medidas técnicas:**
- **Row-Level Security (RLS):** Aislamiento estricto de datos entre tenants a nivel de base de datos. Cada usuario solo puede acceder a registros de su propio tenant.
- **Autenticación segura:** Supabase Auth con Email/Password, manejo de sesiones del lado del servidor mediante middleware y cookies seguras (HttpOnly, Secure, SameSite).
- **Cifrado en tránsito:** Todas las comunicaciones entre el navegador del usuario, el servidor y la base de datos se realizan mediante TLS/HTTPS.
- **Cifrado en reposo:** Los datos almacenados en Supabase cuentan con cifrado AES-256 en reposo.
- **Separación de claves:** La Service Role Key de Supabase (bypass de RLS) se utiliza exclusivamente en el servidor backend (`admin.ts`) y nunca se expone al frontend.
- **Variables de entorno protegidas:** Las credenciales sensibles se almacenan en archivos `.env.local` excluidos del repositorio público mediante `.gitignore`.
- **Almacenamiento aislado de API Keys:** Los tokens de Skydropx se almacenan en la base de datos (`skydropx_config`) con aislamiento por tenant, no en variables de entorno globales.

**Medidas administrativas:**
- Acceso restringido a datos de producción únicamente al equipo técnico autorizado.
- Revisión periódica de permisos y roles de acceso.
- Capacitación interna sobre manejo de datos personales.

**Medidas físicas:**
- Infraestructura de terceros certificada (AWS/Supabase, Railway) con controles de acceso físico a centros de datos.

#### VI. Derechos ARCO

Conforme a los artículos 28 a 35 de la LFPDPPP, usted tiene derecho a:

| Derecho | Descripción |
|:---|:---|
| **Acceso** | Conocer qué datos personales tenemos sobre usted y para qué los utilizamos. |
| **Rectificación** | Solicitar la corrección de datos personales inexactos o incompletos. |
| **Cancelación** | Solicitar la eliminación de sus datos cuando considere que no están siendo tratados conforme a los principios y deberes de la Ley. |
| **Oposición** | Oponerse al tratamiento de sus datos para finalidades específicas. |

**Procedimiento para ejercer derechos ARCO:**

1. Enviar solicitud al correo electrónico: **mysuscrew@gmail.com**
2. La solicitud deberá contener:
   - Nombre completo del titular y correo electrónico registrado en la Plataforma.
   - Descripción clara del derecho que desea ejercer y los datos personales involucrados.
   - Documentos que acrediten su identidad (copia de identificación oficial vigente).
   - Cualquier documento o información que facilite la localización de los datos personales.
3. AGINNOVA responderá en un plazo máximo de **20 días hábiles** contados a partir de la recepción de la solicitud completa.
4. De ser procedente, la resolución se hará efectiva dentro de los **15 días hábiles** siguientes a la comunicación de la respuesta.

#### VII. Uso de Cookies y Tecnologías de Rastreo

La Plataforma utiliza **cookies de sesión** estrictamente necesarias para:
- Mantener la sesión de autenticación del usuario.
- Identificar el tenant activo durante la navegación.
- Garantizar el correcto funcionamiento del middleware de protección de rutas.

AGINNOVA **no utiliza** cookies de rastreo publicitario, cookies de terceros con fines de marketing, ni tecnologías similares para la elaboración de perfiles de comportamiento.

#### VIII. Cambios al Aviso de Privacidad

AGINNOVA se reserva el derecho de modificar el presente Aviso de Privacidad en cualquier momento. Las modificaciones estarán disponibles en la Plataforma en la sección `/privacidad` y se notificará a los usuarios mediante un banner informativo al iniciar sesión.

Se recomienda revisar periódicamente este aviso para estar informado sobre cómo protegemos sus datos personales.

#### IX. Autoridad Competente

Si usted considera que su derecho a la protección de datos personales ha sido vulnerado, puede interponer una queja o denuncia ante el **Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)**:

- **Sitio web:** [https://home.inai.org.mx](https://home.inai.org.mx)
- **Teléfono:** 800 835 4324 (INAI)
- **Dirección:** Insurgentes Sur 3211, Col. Insurgentes Cuicuilco, Alcaldía Coyoacán, C.P. 04530, Ciudad de México.

#### X. Consentimiento

Al registrarse y utilizar la Plataforma CRM Aginova, el usuario manifiesta haber leído, entendido y aceptado los términos del presente Aviso de Privacidad Integral, otorgando su consentimiento tácito para el tratamiento de sus datos personales conforme a las finalidades primarias aquí descritas.

Para las finalidades secundarias y las transferencias que requieren consentimiento, el usuario podrá manifestar su negativa en cualquier momento mediante el correo electrónico **mysuscrew@gmail.com**.

---

## 4. Términos y Condiciones de Uso

> **Nota:** Los siguientes Términos y Condiciones deberán publicarse de manera visible y permanente en la plataforma CRM Aginova (enlace accesible desde el footer, la página de registro y la sección dedicada `/terminos`).

---

### TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA CRM AGINOVA

**Última actualización:** 11 de junio de 2026

#### Cláusula 1. Partes y Definiciones

**1.1.** El presente documento establece los Términos y Condiciones (en lo sucesivo, los **"Términos"**) que regulan el acceso y uso de la plataforma **CRM Aginova** (en lo sucesivo, la **"Plataforma"**), propiedad y operada por **INNOVATECH S.A.S.** (comercialmente conocida como **AGINNOVA**), con domicilio en Avenida Océano Pacífico número exterior 94, interior 6A, Colonia Lomas Lindas, Municipio de Atizapán de Zaragoza, Estado de México.

**1.2. Definiciones:**

| Término | Definición |
|:---|:---|
| **Plataforma** | La aplicación web CRM Aginova, accesible a través de su URL de producción y cualquier subdominio o dominio personalizado asociado. |
| **Responsable** | INNOVATECH S.A.S. (AGINNOVA), persona moral responsable del desarrollo, operación y mantenimiento de la Plataforma. |
| **Usuario** | Toda persona física que accede a la Plataforma mediante credenciales de autenticación (email y contraseña) para utilizar sus funcionalidades. |
| **Tenant** | La empresa u organización cliente de AGINNOVA cuyos datos operativos y comerciales son gestionados dentro de la Plataforma. Cada Tenant opera en un espacio aislado dentro del sistema multi-inquilino. |
| **Administrador del Tenant** | El usuario con rol de `director` que posee los máximos privilegios de gestión dentro de su Tenant. |
| **Contenido del Usuario** | Todos los datos, archivos, información comercial, registros de clientes, inventarios y cualquier otro material que el Usuario o el Tenant introduzcan, carguen o generen en la Plataforma. |
| **Servicios de Terceros** | Los servicios externos integrados a la Plataforma, incluyendo pero no limitados a: Supabase (base de datos), Railway (hosting), Skydropx (logística) y los carriers de paquetería. |

#### Cláusula 2. Aceptación de los Términos

**2.1.** Al acceder, registrarse o utilizar la Plataforma, el Usuario declara que ha leído, entendido y aceptado la totalidad de estos Términos, así como el Aviso de Privacidad Integral disponible en la sección `/privacidad`.

**2.2.** Si el Usuario no está de acuerdo con alguno de estos Términos, deberá abstenerse de utilizar la Plataforma.

**2.3.** El uso continuado de la Plataforma tras la publicación de modificaciones a los presentes Términos constituirá la aceptación tácita de dichas modificaciones.

#### Cláusula 3. Descripción del Servicio

**3.1.** La Plataforma CRM Aginova es una herramienta de gestión de relaciones con clientes (Customer Relationship Management) diseñada para MiPyMEs, que ofrece los siguientes módulos funcionales:

- Dashboard ejecutivo con KPIs consolidados
- Gestión de clientes y onboarding (Wizard)
- Administración de pedidos (órdenes de venta)
- Integración logística con Skydropx para cotización y generación de guías de envío
- Historial y seguimiento de envíos
- Panel de ROI y comisiones escalonadas
- Sistema de alertas inteligentes
- Gestión de inventario con análisis ABC y control de caducidad
- Recomendaciones estratégicas generadas por IA
- Motor de automatización y workflows
- Gestión de prospectos (pipeline comercial)
- Importación masiva de datos vía CSV

**3.2.** La Plataforma opera bajo un modelo **SaaS (Software as a Service)** multi-tenant con aislamiento de datos mediante Row-Level Security.

#### Cláusula 4. Registro y Cuenta de Usuario

**4.1.** Para utilizar la Plataforma, el Usuario deberá crear una cuenta proporcionando una dirección de correo electrónico válida y una contraseña segura.

**4.2.** El dominio del correo electrónico determinará la asignación automática del Tenant correspondiente:
- Correos con dominio `@kawdoba` → Tenant KAWDOBA
- Correos con dominio `@ferrex` → Tenant FERREX
- Cualquier otro dominio → Tenant NALUA (o el tenant predeterminado vigente)

**4.3.** El Usuario es responsable de:
- Mantener la confidencialidad de sus credenciales de acceso.
- Todas las actividades realizadas desde su cuenta.
- Notificar de inmediato a AGINNOVA sobre cualquier uso no autorizado de su cuenta.

**4.4.** AGINNOVA se reserva el derecho de suspender o cancelar cuentas que incumplan estos Términos, sin responsabilidad alguna.

#### Cláusula 5. Propiedad Intelectual

**5.1.** La Plataforma, su código fuente, diseño, arquitectura, marcas, logotipos, textos y demás elementos que la componen son propiedad exclusiva de INNOVATECH S.A.S. y están protegidos por las leyes mexicanas e internacionales de propiedad intelectual e industrial.

**5.2.** AGINNOVA otorga al Usuario una **licencia limitada, no exclusiva, intransferible y revocable** para utilizar la Plataforma conforme a estos Términos, durante la vigencia de la relación comercial con el Tenant correspondiente.

**5.3.** El **Contenido del Usuario** es y seguirá siendo propiedad del Usuario y/o del Tenant. AGINNOVA no adquiere derechos de propiedad sobre el Contenido del Usuario, salvo la licencia necesaria para alojar, procesar y mostrar dicho contenido dentro de la Plataforma.

#### Cláusula 6. Uso Aceptable

**6.1.** El Usuario se compromete a utilizar la Plataforma de manera lícita, ética y conforme a estos Términos. Queda estrictamente prohibido:

a) Utilizar la Plataforma para actividades ilícitas, fraudulentas o contrarias a la legislación mexicana vigente.  
b) Intentar acceder a datos, cuentas o recursos de otros Tenants mediante ingeniería inversa, manipulación de la URL, inyección SQL o cualquier otro método.  
c) Compartir credenciales de acceso con terceros no autorizados.  
d) Cargar archivos que contengan virus, malware, código malicioso o contenido ilegal.  
e) Realizar actividades que comprometan la seguridad, estabilidad o rendimiento de la Plataforma.  
f) Reproducir, distribuir, modificar o crear obras derivadas de la Plataforma sin autorización escrita.  
g) Utilizar la Plataforma para enviar spam, comunicaciones comerciales no solicitadas o contenido difamatorio.  
h) Almacenar datos personales sensibles (datos de salud, origen étnico, creencias religiosas, etc.) sin el consentimiento expreso de AGINNOVA.

#### Cláusula 7. Infraestructura de Terceros y Limitación de Responsabilidad

**7.1. Declaración de infraestructura:**

El Usuario reconoce y acepta que la Plataforma CRM Aginova:

a) **No opera en servidores propios de AGINNOVA.** El alojamiento, despliegue y ejecución de la aplicación se realizan mediante la infraestructura de **Railway Corp.**, un proveedor de servicios de hosting en la nube con sede en Estados Unidos.

b) La **base de datos** y el sistema de **autenticación** son proporcionados por **Supabase Inc.**, que opera sobre infraestructura de Amazon Web Services (AWS).

c) Los servicios de **logística y generación de guías de envío** son proporcionados por **Skydropx S.A.P.I. de C.V.**, un intermediario de paquetería multi-carrier con sede en México.

d) El **código fuente** de la Plataforma se aloja en un repositorio de **GitHub Inc.** (subsidiaria de Microsoft Corp.).

**7.2. Limitación de responsabilidad por servicios de terceros:**

AGINNOVA **no será responsable** por:

a) **Caídas, interrupciones o indisponibilidad** del servicio causadas por fallas en la infraestructura de Railway, Supabase, AWS, Skydropx o cualquier otro proveedor de servicios de terceros.

b) **Pérdida de datos** derivada de fallos técnicos en los servicios de almacenamiento o base de datos de Supabase/AWS, siempre que AGINNOVA haya implementado las medidas razonables de respaldo.

c) **Errores en cotizaciones o generación de guías** de envío proporcionados por la API de Skydropx o los carriers de paquetería (DHL, FedEx, Estafeta, etc.).

d) **Cambios unilaterales** en las políticas, precios, términos de servicio o disponibilidad de los Servicios de Terceros.

e) **Vulnerabilidades de seguridad** en la infraestructura de terceros que no sean atribuibles a AGINNOVA.

**7.3. Nivel de servicio (SLA indicativo):**

AGINNOVA realizará esfuerzos comercialmente razonables para mantener una disponibilidad de la Plataforma de al menos **99.5% mensual** (excluyendo ventanas de mantenimiento programado y fallas atribuibles a Servicios de Terceros). Este compromiso es indicativo y no constituye una garantía contractual vinculante, salvo que se pacte lo contrario mediante un Acuerdo de Nivel de Servicio (SLA) específico por escrito.

**7.4. Mantenimiento programado:**

AGINNOVA se reserva el derecho de realizar mantenimientos programados que puedan requerir la interrupción temporal del servicio. Dichos mantenimientos serán notificados con al menos **48 horas** de anticipación a través de la Plataforma o por correo electrónico.

#### Cláusula 8. Exclusión de Garantías

**8.1.** La Plataforma se proporciona **"TAL CUAL" (AS IS)** y **"SEGÚN DISPONIBILIDAD" (AS AVAILABLE)**, sin garantías de ningún tipo, ya sean expresas o implícitas, incluyendo, sin limitación:

a) Garantías de comerciabilidad o idoneidad para un propósito particular.  
b) Garantías de que la Plataforma operará sin interrupciones ni errores.  
c) Garantías de exactitud, integridad o actualidad de los datos procesados.  
d) Garantías de compatibilidad con todos los dispositivos, navegadores o sistemas operativos.

**8.2.** AGINNOVA no garantiza que las recomendaciones generadas por el módulo de IA de la Plataforma sean precisas, completas o adecuadas para la toma de decisiones comerciales. El Usuario asume la responsabilidad total de las decisiones basadas en dichas recomendaciones.

#### Cláusula 9. Limitación de Responsabilidad

**9.1.** En la máxima medida permitida por la legislación mexicana aplicable, la responsabilidad total acumulada de AGINNOVA frente al Usuario y/o al Tenant por cualquier concepto derivado del uso de la Plataforma no excederá el monto total pagado por el Tenant a AGINNOVA durante los **tres (3) meses** inmediatamente anteriores al evento que originó la reclamación.

**9.2.** En ningún caso AGINNOVA será responsable por:

a) Daños indirectos, incidentales, especiales, consecuenciales o punitivos.  
b) Lucro cesante, pérdida de negocios o pérdida de oportunidades comerciales.  
c) Pérdida de datos del Usuario cuando ésta sea atribuible a la conducta del propio Usuario o a los Servicios de Terceros.  
d) Daños derivados de caso fortuito o fuerza mayor.

#### Cláusula 10. Datos y Respaldo

**10.1.** AGINNOVA realizará respaldos periódicos de la base de datos conforme a las políticas de retención de Supabase. Sin embargo, el Usuario reconoce que la responsabilidad primaria de mantener copias de seguridad de su Contenido recae en el propio Usuario y/o Tenant.

**10.2.** En caso de terminación de la relación comercial, el Tenant podrá solicitar la exportación de sus datos en formato CSV o JSON dentro de los **30 días naturales** siguientes a la fecha de terminación. Transcurrido dicho plazo, AGINNOVA procederá a la eliminación definitiva de los datos del Tenant conforme a la LFPDPPP.

#### Cláusula 11. Confidencialidad

**11.1.** Ambas partes se comprometen a mantener la confidencialidad de toda información sensible, técnica, comercial o estratégica a la que tengan acceso con motivo de la relación derivada del uso de la Plataforma.

**11.2.** Esta obligación de confidencialidad subsistirá durante un periodo de **dos (2) años** posteriores a la terminación de la relación comercial.

#### Cláusula 12. Modificaciones

**12.1.** AGINNOVA se reserva el derecho de modificar los presentes Términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en la Plataforma.

**12.2.** Se notificará a los Usuarios sobre cambios sustanciales a estos Términos mediante un aviso visible al iniciar sesión en la Plataforma. El uso continuado de la Plataforma tras dicha notificación constituirá la aceptación de los Términos modificados.

#### Cláusula 13. Legislación Aplicable y Jurisdicción

**13.1.** Los presentes Términos se regirán e interpretarán conforme a las leyes vigentes de los Estados Unidos Mexicanos.

**13.2.** Para cualquier controversia derivada de la interpretación, cumplimiento o ejecución de estos Términos, las partes se someten a la jurisdicción de los **Tribunales competentes de la Ciudad de México**, renunciando expresamente a cualquier otro fuero que por razón de domicilio presente o futuro pudiera corresponderles.

#### Cláusula 14. Disposiciones Generales

**14.1.** Si alguna disposición de estos Términos fuera declarada nula o inaplicable, las disposiciones restantes mantendrán plena vigencia y efecto.

**14.2.** La omisión de AGINNOVA en ejercer cualquier derecho previsto en estos Términos no constituirá una renuncia al mismo.

**14.3.** Estos Términos, junto con el Aviso de Privacidad Integral y cualquier Acuerdo de Nivel de Servicio específico, constituyen el acuerdo completo entre las partes en relación con el uso de la Plataforma.

---

## 5. Plan de Implementación Técnica

### 5.1 Acciones requeridas en el CRM

| # | Acción | Ubicación / Ruta | Prioridad | Estado |
|:---|:---|:---|:---|:---|
| 1 | Crear página `/privacidad` con el Aviso de Privacidad Integral completo | `src/app/(dashboard)/privacidad/page.tsx` | 🔴 Alta | ⬜ Pendiente |
| 2 | Crear página `/terminos` con los Términos y Condiciones | `src/app/(dashboard)/terminos/page.tsx` | 🔴 Alta | ⬜ Pendiente |
| 3 | Agregar enlaces a "Aviso de Privacidad" y "Términos y Condiciones" en el **footer** del layout principal | `src/app/layout.tsx` | 🔴 Alta | ⬜ Pendiente |
| 4 | Agregar checkbox de aceptación de Aviso de Privacidad y Términos en la **página de login/registro** | `src/app/login/page.tsx` | 🔴 Alta | ⬜ Pendiente |
| 5 | Implementar banner de notificación de cambios en el aviso de privacidad al iniciar sesión | `src/app/(dashboard)/layout.tsx` o middleware | 🟡 Media | ⬜ Pendiente |
| 6 | Agregar campo `privacy_accepted_at` (timestamp) en la tabla `profiles` para registrar el consentimiento | `schema.sql` / Supabase | 🔴 Alta | ⬜ Pendiente |
| 7 | Configurar correo electrónico dedicado para solicitudes ARCO (reemplazar mysuscrew@gmail.com por uno corporativo tipo privacidad@aginnova.com) | Configuración externa | 🟡 Media | ⬜ Pendiente |
| 8 | Agregar enlace al Aviso de Privacidad en los correos de confirmación de Supabase Auth | Supabase Dashboard → Auth → Email Templates | 🟡 Media | ⬜ Pendiente |
| 9 | Crear aviso de privacidad simplificado para el módulo de carga CSV con advertencia sobre datos sensibles | `src/app/(dashboard)/datos/page.tsx` | 🟡 Media | ⬜ Pendiente |

### 5.2 Documentos legales complementarios recomendados

| Documento | Propósito | Prioridad |
|:---|:---|:---|
| **Contrato de Prestación de Servicios (SLA)** | Acuerdo formal con cada Tenant sobre niveles de servicio, tiempos de respuesta y penalizaciones. | 🟡 Media |
| **Acuerdo de Confidencialidad (NDA)** | Proteger información comercial sensible compartida entre AGINNOVA y cada Tenant. | 🟡 Media |
| **Política de Cookies** | Documento específico sobre el uso de cookies de sesión (aun siendo mínimo, incrementa la confianza). | 🟢 Baja |
| **Contrato de Encargado de Tratamiento** | Formalizar la relación con Supabase, Railway y Skydropx como encargados/subencargados del tratamiento de datos. | 🔴 Alta |
| **Protocolo de Respuesta a Incidentes de Seguridad** | Procedimiento documentado para actuar ante vulneraciones de datos personales (obligatorio según art. 20 LFPDPPP). | 🔴 Alta |

### 5.3 Cronograma sugerido

| Fase | Actividad | Plazo |
|:---|:---|:---|
| **Fase 1** | Publicación del Aviso de Privacidad y Términos en la Plataforma (páginas `/privacidad` y `/terminos`, footer, login) | Semana 1-2 |
| **Fase 2** | Implementación del registro de consentimiento (`privacy_accepted_at`) y checkbox en login | Semana 2-3 |
| **Fase 3** | Configuración de correo ARCO dedicado y actualización de templates de Supabase Auth | Semana 3 |
| **Fase 4** | Elaboración de NDA, SLA y Contrato de Encargado de Tratamiento | Semana 4-6 |
| **Fase 5** | Auditoría de cumplimiento y ajustes finales | Semana 6-8 |

---

## 6. Anexos y Referencias

### 6.1 Referencias legales

| Instrumento | Enlace |
|:---|:---|
| LFPDPPP | [https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf) |
| Reglamento de la LFPDPPP | [https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LFPDPPP.pdf](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LFPDPPP.pdf) |
| Lineamientos del Aviso de Privacidad (INAI) | [https://home.inai.org.mx](https://home.inai.org.mx) |
| Ley General de Sociedades Mercantiles | [https://www.diputados.gob.mx/LeyesBiblio/pdf/LGSM.pdf](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGSM.pdf) |
| Código de Comercio | [https://www.diputados.gob.mx/LeyesBiblio/pdf_mov/Codigo_de_Comercio.pdf](https://www.diputados.gob.mx/LeyesBiblio/pdf_mov/Codigo_de_Comercio.pdf) |
| Código Fiscal de la Federación | [https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf](https://www.diputados.gob.mx/LeyesBiblio/pdf/CFF.pdf) |

### 6.2 Documentos internos de referencia

| Documento | Ubicación |
|:---|:---|
| Contexto General de Aginova | `/Users/MAC/Documents/V&J/Vivi/Aginova/Contexto.md` |
| Memoria Aginova | `/Users/MAC/Documents/V&J/Vivi/Aginova/MEMORIA_AGINOVA.md` |
| Contexto Técnico del CRM | `/Users/MAC/Documents/V&J/Vivi/Aginova/CRM Aginova/CONTEXTO_CRM.md` |
| Acta Constitutiva | `/Users/MAC/Documents/V&J/Vivi/Aginova/Legal/Acta_constitutiva_Aginova.md` |

### 6.3 Datos de la empresa responsable

| Atributo | Valor |
|:---|:---|
| **Razón Social** | INNOVATECH S.A.S. |
| **Nombre Comercial** | AGINNOVA — Agencia de Transformación Digital |
| **Folio de Constitución** | SAS-1.7-205101-45754 |
| **Representante Legal** | Viviana Jiménez Luis |
| **Tipo Jurídico** | Sociedad por Acciones Simplificada |
| **Socios** | 6 socios capitalistas (Viviana Jiménez Luis, Miranda Rojas Torres, Emmanuel Alejandro Díaz Rivas, Alexandra Naomi Suárez Pérez, Ilse Susana Sánchez Arroyo, Paola Vianey Zaga Moreno) |
| **Domicilio Fiscal** | Av. Océano Pacífico Ext. 94 Int. 6A, Col. Lomas Lindas, Atizapán de Zaragoza, Edo. Méx. |
| **Contacto** | mysuscrew@gmail.com |
| **Régimen Fiscal** | Régimen General (ISR 30%, IVA 16%) |
| **Límite de Ingresos SAS** | $5,000,000 MXN anuales |

---

> **⚠️ AVISO IMPORTANTE:** El presente documento ha sido elaborado como herramienta de referencia y planificación legal. Se recomienda encarecidamente que tanto el Aviso de Privacidad como los Términos y Condiciones sean revisados y validados por un **abogado especialista en protección de datos personales y derecho digital** antes de su publicación oficial en la Plataforma, para garantizar el pleno cumplimiento de la legislación vigente y la protección jurídica de INNOVATECH S.A.S. y sus socios.

---

*Documento elaborado con base en CONTEXTO_CRM.md, Contexto.md y MEMORIA_AGINOVA.md*  
*Fecha: 11 de junio de 2026*  
*Versión: 1.0*
