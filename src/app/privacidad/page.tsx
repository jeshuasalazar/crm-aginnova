export default function PrivacidadPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px', color: '#1a2d4a', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #1C3F6E', paddingBottom: 20, marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1C3F6E', margin: '0 0 6px' }}>
          Aviso de Privacidad Integral
        </h1>
        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
          INNOVATECH S.A.S. · Operando comercialmente como <strong>AGINNOVA</strong> · Última actualización: 11 de junio de 2026
        </p>
      </div>

      {/* I. Identidad del Responsable */}
      <Section title="I. Identidad y Domicilio del Responsable">
        <p>
          <strong>INNOVATECH S.A.S.</strong> (en lo sucesivo, <strong>&ldquo;AGINNOVA&rdquo;</strong> o el <strong>&ldquo;Responsable&rdquo;</strong>), con domicilio en Avenida Océano Pacífico número exterior 94, interior 6A, Colonia Lomas Lindas, Municipio de Atizapán de Zaragoza, Estado de México, C.P. 52999, es responsable del tratamiento de los datos personales que recaba a través de la plataforma <strong>CRM Aginova</strong> (en lo sucesivo, la <strong>&ldquo;Plataforma&rdquo;</strong>).
        </p>
        <InfoRow label="Representante Legal" value="Viviana Jiménez Luis" />
        <InfoRow label="Contacto para asuntos de privacidad" value="mysuscrew@gmail.com" />
        <InfoRow label="Folio de Constitución" value="SAS-1.7-205101-45754" />
      </Section>

      {/* II. Datos que se recaban */}
      <Section title="II. Datos Personales que se Recaban">
        <SubSection title="a) Datos de identificación">
          <ul style={ulStyle}>
            <li>Nombre completo</li>
            <li>Correo electrónico corporativo</li>
            <li>Domicilio comercial y/o de envío</li>
            <li>Número telefónico de contacto</li>
            <li>Nombre de la empresa u organización (razón social)</li>
          </ul>
        </SubSection>
        <SubSection title="b) Datos patrimoniales y financieros">
          <ul style={ulStyle}>
            <li>Información de órdenes de venta (montos, productos, precios)</li>
            <li>Datos de ingresos y ventas por canal</li>
            <li>Márgenes de comisión y cuotas de venta</li>
            <li>Costos de inventario y precios de catálogo</li>
            <li>Información de envíos y guías de paquetería (tarifas, carriers)</li>
          </ul>
        </SubSection>
        <SubSection title="c) Datos técnicos y de uso de la Plataforma">
          <ul style={ulStyle}>
            <li>Dirección IP</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Cookies de sesión y preferencias de autenticación</li>
            <li>Registros de actividad dentro de la Plataforma (logs)</li>
            <li>Archivos CSV u otros documentos cargados por el usuario</li>
          </ul>
        </SubSection>
        <SubSection title="d) Datos de terceros (clientes finales del Tenant)">
          <ul style={ulStyle}>
            <li>Nombre, dirección de envío, teléfono y correo electrónico de los destinatarios de pedidos registrados en el módulo de Órdenes y Envíos.</li>
          </ul>
        </SubSection>
        <AlertBox>
          AGINNOVA <strong>no recaba datos personales sensibles</strong> (origen étnico, estado de salud, creencias religiosas, orientación sexual, datos biométricos, entre otros). En caso de que algún usuario cargue inadvertidamente información sensible mediante archivos CSV u otro medio, AGINNOVA procederá a su eliminación inmediata una vez detectada.
        </AlertBox>
      </Section>

      {/* III. Finalidades */}
      <Section title="III. Finalidades del Tratamiento">
        <SubSection title="Finalidades primarias (necesarias para la relación jurídica)">
          <ol style={olStyle}>
            <li>Crear y administrar la cuenta de usuario en la Plataforma.</li>
            <li>Asignar el perfil del usuario al Tenant correspondiente y aplicar los permisos de acceso basados en su rol.</li>
            <li>Procesar y gestionar órdenes de venta, incluyendo la generación de cotizaciones de envío y guías de paquetería a través de Skydropx.</li>
            <li>Administrar el inventario, catálogo de productos y lotes del Tenant.</li>
            <li>Calcular indicadores financieros (ROI, comisiones, cumplimiento de metas) en el panel de análisis.</li>
            <li>Generar alertas operativas automatizadas (desabasto, caducidad, pedidos atrasados).</li>
            <li>Procesar la importación masiva de datos mediante archivos CSV.</li>
            <li>Ejecutar flujos de automatización (workflows) configurados por el usuario.</li>
            <li>Cumplir con obligaciones legales, fiscales y contractuales aplicables.</li>
          </ol>
        </SubSection>
        <SubSection title="Finalidades secundarias (no indispensables)">
          <ol style={olStyle} start={10}>
            <li>Generar recomendaciones estratégicas mediante inteligencia artificial para la toma de decisiones del Tenant.</li>
            <li>Elaborar estadísticas agregadas y análisis de tendencias para mejorar la Plataforma.</li>
            <li>Enviar comunicaciones informativas sobre actualizaciones, nuevas funcionalidades o mantenimientos programados.</li>
            <li>Realizar análisis ABC de inventario para optimizar esfuerzos comerciales.</li>
          </ol>
        </SubSection>
        <p style={{ fontSize: 13, color: '#5a6472', marginTop: 12, fontStyle: 'italic' }}>
          Si no desea que sus datos sean tratados para las finalidades secundarias, puede comunicarlo en cualquier momento a <strong>mysuscrew@gmail.com</strong>. La negativa no impedirá el uso de la Plataforma.
        </p>
      </Section>

      {/* IV. Transferencias */}
      <Section title="IV. Transferencias de Datos Personales">
        <SubSection title="Sin requerir consentimiento adicional (Art. 37 LFPDPPP)">
          <Table
            headers={['Destinatario', 'Finalidad', 'País']}
            rows={[
              ['Supabase Inc.', 'Almacenamiento y procesamiento de la base de datos (PostgreSQL gestionado).', 'Estados Unidos'],
              ['Railway Corp.', 'Alojamiento y despliegue de la aplicación web del CRM.', 'Estados Unidos'],
              ['GitHub Inc. (Microsoft)', 'Almacenamiento del código fuente en repositorio de control de versiones (no incluye datos de usuarios finales).', 'Estados Unidos'],
            ]}
          />
        </SubSection>
        <SubSection title="Que requieren consentimiento del titular">
          <Table
            headers={['Destinatario', 'Finalidad', 'País']}
            rows={[
              ['Skydropx S.A.P.I. de C.V.', 'Cotización de tarifas de envío y generación de guías de paquetería. Implica compartir dirección de destino y datos del destinatario.', 'México'],
              ['Carriers de paquetería (DHL, FedEx, Estafeta, etc. vía Skydropx)', 'Ejecución del servicio de transporte de mercancía.', 'México / Internacional'],
            ]}
          />
        </SubSection>
        <AlertBox>
          <strong>Consentimiento:</strong> Al utilizar el módulo de Órdenes y Envíos, el usuario Tenant acepta que los datos del destinatario sean compartidos con Skydropx y los carriers correspondientes para la ejecución del servicio logístico.
        </AlertBox>
      </Section>

      {/* V. Mecanismos de Seguridad */}
      <Section title="V. Mecanismos de Seguridad">
        <SubSection title="Medidas técnicas">
          <ul style={ulStyle}>
            <li><strong>Row-Level Security (RLS):</strong> Aislamiento estricto de datos entre tenants a nivel de base de datos.</li>
            <li><strong>Autenticación segura:</strong> Supabase Auth con manejo de sesiones mediante cookies HttpOnly, Secure y SameSite.</li>
            <li><strong>Cifrado en tránsito:</strong> Todas las comunicaciones se realizan mediante TLS/HTTPS.</li>
            <li><strong>Cifrado en reposo:</strong> Los datos almacenados en Supabase cuentan con cifrado AES-256.</li>
            <li><strong>Separación de claves:</strong> La Service Role Key se usa exclusivamente en el servidor backend y nunca se expone al frontend.</li>
            <li><strong>Variables de entorno protegidas:</strong> Credenciales en <code>.env.local</code>, excluidas del repositorio público.</li>
            <li><strong>API Keys aisladas:</strong> Tokens de Skydropx almacenados con aislamiento por tenant en base de datos.</li>
          </ul>
        </SubSection>
        <SubSection title="Medidas administrativas">
          <ul style={ulStyle}>
            <li>Acceso restringido a datos de producción al equipo técnico autorizado.</li>
            <li>Revisión periódica de permisos y roles.</li>
            <li>Capacitación interna sobre manejo de datos personales.</li>
          </ul>
        </SubSection>
        <SubSection title="Medidas físicas">
          <ul style={ulStyle}>
            <li>Infraestructura certificada (AWS/Supabase, Railway) con controles de acceso físico a centros de datos.</li>
          </ul>
        </SubSection>
      </Section>

      {/* VI. Derechos ARCO */}
      <Section title="VI. Derechos ARCO">
        <Table
          headers={['Derecho', 'Descripción']}
          rows={[
            ['Acceso', 'Conocer qué datos personales tenemos sobre usted y para qué los utilizamos.'],
            ['Rectificación', 'Solicitar la corrección de datos personales inexactos o incompletos.'],
            ['Cancelación', 'Solicitar la eliminación de sus datos cuando no estén siendo tratados conforme a la Ley.'],
            ['Oposición', 'Oponerse al tratamiento de sus datos para finalidades específicas.'],
          ]}
        />
        <SubSection title="Procedimiento para ejercer derechos ARCO">
          <ol style={olStyle}>
            <li>Enviar solicitud al correo electrónico: <strong>mysuscrew@gmail.com</strong></li>
            <li>La solicitud deberá incluir: nombre completo y correo registrado, descripción del derecho a ejercer, documentos que acrediten identidad, y cualquier información que facilite la localización de los datos.</li>
            <li>AGINNOVA responderá en un plazo máximo de <strong>20 días hábiles</strong> a partir de la recepción de la solicitud completa.</li>
            <li>De ser procedente, la resolución se hará efectiva en los <strong>15 días hábiles</strong> siguientes a la comunicación de la respuesta.</li>
          </ol>
        </SubSection>
      </Section>

      {/* VII. Cookies */}
      <Section title="VII. Uso de Cookies y Tecnologías de Rastreo">
        <p>La Plataforma utiliza <strong>cookies de sesión estrictamente necesarias</strong> para:</p>
        <ul style={ulStyle}>
          <li>Mantener la sesión de autenticación del usuario.</li>
          <li>Identificar el tenant activo durante la navegación.</li>
          <li>Garantizar el correcto funcionamiento del middleware de protección de rutas.</li>
        </ul>
        <p>AGINNOVA <strong>no utiliza</strong> cookies de rastreo publicitario, cookies de terceros con fines de marketing, ni tecnologías similares para la elaboración de perfiles de comportamiento.</p>
      </Section>

      {/* VIII. Cambios al aviso */}
      <Section title="VIII. Cambios al Aviso de Privacidad">
        <p>
          AGINNOVA se reserva el derecho de modificar el presente Aviso en cualquier momento. Las modificaciones estarán disponibles en la Plataforma en la sección <code>/privacidad</code> y se notificará a los usuarios mediante un banner informativo al iniciar sesión.
        </p>
      </Section>

      {/* IX. Autoridad Competente */}
      <Section title="IX. Autoridad Competente">
        <p>Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede interponer una queja ante el <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong>:</p>
        <InfoRow label="Sitio web" value="https://home.inai.org.mx" />
        <InfoRow label="Teléfono" value="800 835 4324 (INAI)" />
        <InfoRow label="Dirección" value="Insurgentes Sur 3211, Col. Insurgentes Cuicuilco, Alcaldía Coyoacán, C.P. 04530, CDMX" />
      </Section>

      {/* X. Consentimiento */}
      <Section title="X. Consentimiento">
        <p>
          Al registrarse y utilizar la Plataforma CRM Aginova, el usuario manifiesta haber leído, entendido y aceptado los términos del presente Aviso de Privacidad Integral, otorgando su consentimiento tácito para el tratamiento de sus datos personales conforme a las finalidades primarias aquí descritas.
        </p>
        <p>
          Para las finalidades secundarias y las transferencias que requieren consentimiento, el usuario podrá manifestar su negativa en cualquier momento mediante el correo electrónico <strong>mysuscrew@gmail.com</strong>.
        </p>
      </Section>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 40, paddingTop: 16, fontSize: 12, color: '#a0aec0', textAlign: 'center' }}>
        INNOVATECH S.A.S. · CRM Aginnova · Folio SAS-1.7-205101-45754 · Versión 1.0 · Junio 2026
      </div>
    </div>
  )
}

// ─── Componentes internos ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontSize: 16, fontWeight: 800, color: '#1C3F6E',
        borderLeft: '4px solid #4A7BB5', paddingLeft: 12,
        margin: '0 0 16px', lineHeight: 1.4,
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: '#2d3748' }}>{children}</div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#2d3748', margin: '12px 0 8px' }}>{title}</h3>
      {children}
    </div>
  )
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#EBF4FF', border: '1px solid #BEE3F8', borderRadius: 8,
      padding: '12px 16px', fontSize: 13, color: '#2c5282', margin: '16px 0',
    }}>
      ⚠️ {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 14 }}>
      <span style={{ fontWeight: 600, minWidth: 240, color: '#4a5568' }}>{label}:</span>
      <span style={{ color: '#2d3748' }}>{value}</span>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', margin: '12px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                background: '#EBF4FF', color: '#1C3F6E', fontWeight: 700,
                padding: '10px 14px', textAlign: 'left',
                border: '1px solid #BEE3F8',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#F7FAFC' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '9px 14px', border: '1px solid #e2e8f0',
                  color: '#4a5568', verticalAlign: 'top',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ulStyle: React.CSSProperties = {
  margin: '8px 0', paddingLeft: 20,
  display: 'flex', flexDirection: 'column', gap: 5,
}

const olStyle: React.CSSProperties = {
  margin: '8px 0', paddingLeft: 20,
  display: 'flex', flexDirection: 'column', gap: 5,
}
