export default function TerminosPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px', color: '#1a2d4a', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #1C3F6E', paddingBottom: 20, marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1C3F6E', margin: '0 0 6px' }}>
          Términos y Condiciones de Uso
        </h1>
        <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
          Plataforma CRM Aginova · INNOVATECH S.A.S. (<strong>AGINNOVA</strong>) · Última actualización: 11 de junio de 2026
        </p>
      </div>

      {/* Cláusula 1 */}
      <Clausula numero="1" titulo="Partes y Definiciones">
        <p>
          El presente documento establece los Términos y Condiciones (en lo sucesivo, los <strong>&ldquo;Términos&rdquo;</strong>) que regulan el acceso y uso de la plataforma <strong>CRM Aginova</strong> (en lo sucesivo, la <strong>&ldquo;Plataforma&rdquo;</strong>), propiedad y operada por <strong>INNOVATECH S.A.S.</strong> (comercialmente conocida como <strong>AGINNOVA</strong>), con domicilio en Avenida Océano Pacífico número exterior 94, interior 6A, Colonia Lomas Lindas, Municipio de Atizapán de Zaragoza, Estado de México.
        </p>
        <TermTable rows={[
          ['Plataforma', 'La aplicación web CRM Aginova, accesible a través de su URL de producción y cualquier subdominio o dominio personalizado asociado.'],
          ['Responsable', 'INNOVATECH S.A.S. (AGINNOVA), persona moral responsable del desarrollo, operación y mantenimiento de la Plataforma.'],
          ['Usuario', 'Toda persona física que accede a la Plataforma mediante credenciales de autenticación para utilizar sus funcionalidades.'],
          ['Tenant', 'La empresa u organización cliente de AGINNOVA cuyos datos operativos y comerciales son gestionados dentro de la Plataforma.'],
          ['Administrador del Tenant', 'El usuario con rol de director que posee los máximos privilegios de gestión dentro de su Tenant.'],
          ['Contenido del Usuario', 'Todos los datos, archivos, información comercial, registros de clientes, inventarios y cualquier otro material que el Usuario o el Tenant introduzcan, carguen o generen en la Plataforma.'],
          ['Servicios de Terceros', 'Los servicios externos integrados: Supabase (base de datos), Railway (hosting), Skydropx (logística) y los carriers de paquetería.'],
        ]} />
      </Clausula>

      {/* Cláusula 2 */}
      <Clausula numero="2" titulo="Aceptación de los Términos">
        <Item n="2.1">Al acceder, registrarse o utilizar la Plataforma, el Usuario declara que ha leído, entendido y aceptado la totalidad de estos Términos, así como el Aviso de Privacidad Integral disponible en la sección <code>/privacidad</code>.</Item>
        <Item n="2.2">Si el Usuario no está de acuerdo con alguno de estos Términos, deberá abstenerse de utilizar la Plataforma.</Item>
        <Item n="2.3">El uso continuado de la Plataforma tras la publicación de modificaciones constituirá la aceptación tácita de dichas modificaciones.</Item>
      </Clausula>

      {/* Cláusula 3 */}
      <Clausula numero="3" titulo="Descripción del Servicio">
        <Item n="3.1">La Plataforma CRM Aginova es una herramienta de gestión de relaciones con clientes (Customer Relationship Management) diseñada para MiPyMEs, que ofrece los siguientes módulos funcionales:</Item>
        <ul style={ulStyle}>
          <li>Dashboard ejecutivo con KPIs consolidados</li>
          <li>Gestión de clientes y onboarding (Wizard)</li>
          <li>Administración de pedidos (órdenes de venta)</li>
          <li>Integración logística con Skydropx para cotización y generación de guías de envío</li>
          <li>Historial y seguimiento de envíos</li>
          <li>Panel de ROI y comisiones escalonadas</li>
          <li>Sistema de alertas inteligentes</li>
          <li>Gestión de inventario con análisis ABC y control de caducidad</li>
          <li>Recomendaciones estratégicas generadas por IA</li>
          <li>Motor de automatización y workflows</li>
          <li>Gestión de prospectos (pipeline comercial)</li>
          <li>Importación masiva de datos vía CSV</li>
        </ul>
        <Item n="3.2">La Plataforma opera bajo un modelo <strong>SaaS (Software as a Service)</strong> multi-tenant con aislamiento de datos mediante Row-Level Security.</Item>
      </Clausula>

      {/* Cláusula 4 */}
      <Clausula numero="4" titulo="Registro y Cuenta de Usuario">
        <Item n="4.1">Para utilizar la Plataforma, el Usuario deberá crear una cuenta proporcionando una dirección de correo electrónico válida y una contraseña segura.</Item>
        <Item n="4.2">El dominio del correo electrónico determinará la asignación automática del Tenant correspondiente:
          <ul style={{ ...ulStyle, marginTop: 8 }}>
            <li>Correos con dominio <code>@kawdoba</code> → Tenant KAWDOBA</li>
            <li>Correos con dominio <code>@ferrex</code> → Tenant FERREX</li>
            <li>Cualquier otro dominio → Tenant NALUA (o el tenant predeterminado vigente)</li>
          </ul>
        </Item>
        <Item n="4.3">El Usuario es responsable de:
          <ul style={{ ...ulStyle, marginTop: 8 }}>
            <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            <li>Todas las actividades realizadas desde su cuenta.</li>
            <li>Notificar de inmediato a AGINNOVA sobre cualquier uso no autorizado de su cuenta.</li>
          </ul>
        </Item>
        <Item n="4.4">AGINNOVA se reserva el derecho de suspender o cancelar cuentas que incumplan estos Términos, sin responsabilidad alguna.</Item>
      </Clausula>

      {/* Cláusula 5 */}
      <Clausula numero="5" titulo="Propiedad Intelectual">
        <Item n="5.1">La Plataforma, su código fuente, diseño, arquitectura, marcas, logotipos, textos y demás elementos son propiedad exclusiva de INNOVATECH S.A.S. y están protegidos por las leyes mexicanas e internacionales de propiedad intelectual e industrial.</Item>
        <Item n="5.2">AGINNOVA otorga al Usuario una <strong>licencia limitada, no exclusiva, intransferible y revocable</strong> para utilizar la Plataforma conforme a estos Términos, durante la vigencia de la relación comercial con el Tenant correspondiente.</Item>
        <Item n="5.3">El <strong>Contenido del Usuario</strong> es y seguirá siendo propiedad del Usuario y/o del Tenant. AGINNOVA no adquiere derechos de propiedad sobre él, salvo la licencia necesaria para alojar, procesar y mostrar dicho contenido dentro de la Plataforma.</Item>
      </Clausula>

      {/* Cláusula 6 */}
      <Clausula numero="6" titulo="Uso Aceptable">
        <Item n="6.1">El Usuario se compromete a utilizar la Plataforma de manera lícita, ética y conforme a estos Términos. Queda estrictamente <strong>prohibido</strong>:</Item>
        <ul style={{ ...ulStyle, marginTop: 8 }}>
          <li>Utilizar la Plataforma para actividades ilícitas, fraudulentas o contrarias a la legislación mexicana vigente.</li>
          <li>Intentar acceder a datos, cuentas o recursos de otros Tenants mediante ingeniería inversa, manipulación de URL, inyección SQL o cualquier otro método.</li>
          <li>Compartir credenciales de acceso con terceros no autorizados.</li>
          <li>Cargar archivos que contengan virus, malware, código malicioso o contenido ilegal.</li>
          <li>Realizar actividades que comprometan la seguridad, estabilidad o rendimiento de la Plataforma.</li>
          <li>Reproducir, distribuir, modificar o crear obras derivadas de la Plataforma sin autorización escrita.</li>
          <li>Utilizar la Plataforma para enviar spam, comunicaciones comerciales no solicitadas o contenido difamatorio.</li>
          <li>Almacenar datos personales sensibles (salud, origen étnico, creencias religiosas, etc.) sin el consentimiento expreso de AGINNOVA.</li>
        </ul>
      </Clausula>

      {/* Cláusula 7 */}
      <Clausula numero="7" titulo="Infraestructura de Terceros y Limitación de Responsabilidad">
        <p style={{ fontWeight: 700, marginBottom: 8 }}>7.1 Declaración de infraestructura</p>
        <p>El Usuario reconoce y acepta que la Plataforma CRM Aginova:</p>
        <ul style={ulStyle}>
          <li><strong>No opera en servidores propios de AGINNOVA.</strong> El alojamiento y ejecución se realizan mediante la infraestructura de <strong>Railway Corp.</strong>, con sede en Estados Unidos.</li>
          <li>La <strong>base de datos</strong> y el <strong>sistema de autenticación</strong> son proporcionados por <strong>Supabase Inc.</strong>, que opera sobre Amazon Web Services (AWS).</li>
          <li>Los servicios de <strong>logística y generación de guías de envío</strong> son proporcionados por <strong>Skydropx S.A.P.I. de C.V.</strong>, con sede en México.</li>
          <li>El <strong>código fuente</strong> de la Plataforma se aloja en un repositorio de <strong>GitHub Inc.</strong> (subsidiaria de Microsoft Corp.).</li>
        </ul>

        <p style={{ fontWeight: 700, margin: '16px 0 8px' }}>7.2 Limitación de responsabilidad por servicios de terceros</p>
        <p>AGINNOVA <strong>no será responsable</strong> por:</p>
        <ul style={ulStyle}>
          <li>Caídas, interrupciones o indisponibilidad causadas por fallas en la infraestructura de Railway, Supabase, AWS, Skydropx o cualquier otro proveedor.</li>
          <li>Pérdida de datos derivada de fallos técnicos en los servicios de Supabase/AWS, siempre que AGINNOVA haya implementado las medidas razonables de respaldo.</li>
          <li>Errores en cotizaciones o generación de guías de envío proporcionados por la API de Skydropx o los carriers.</li>
          <li>Cambios unilaterales en las políticas, precios, términos de servicio o disponibilidad de los Servicios de Terceros.</li>
          <li>Vulnerabilidades de seguridad en la infraestructura de terceros no atribuibles a AGINNOVA.</li>
        </ul>

        <p style={{ fontWeight: 700, margin: '16px 0 8px' }}>7.3 Nivel de servicio (SLA indicativo)</p>
        <p>AGINNOVA realizará esfuerzos comercialmente razonables para mantener una disponibilidad de al menos <strong>99.5% mensual</strong>, excluyendo ventanas de mantenimiento programado y fallas atribuibles a Servicios de Terceros. Este compromiso es indicativo y no constituye una garantía contractual vinculante, salvo que se pacte lo contrario mediante un SLA específico por escrito.</p>

        <p style={{ fontWeight: 700, margin: '16px 0 8px' }}>7.4 Mantenimiento programado</p>
        <p>AGINNOVA notificará los mantenimientos programados con al menos <strong>48 horas</strong> de anticipación a través de la Plataforma o por correo electrónico.</p>
      </Clausula>

      {/* Cláusula 8 */}
      <Clausula numero="8" titulo="Exclusión de Garantías">
        <Item n="8.1">La Plataforma se proporciona <strong>&ldquo;TAL CUAL&rdquo; (AS IS)</strong> y <strong>&ldquo;SEGÚN DISPONIBILIDAD&rdquo; (AS AVAILABLE)</strong>, sin garantías de ningún tipo, incluyendo:
          <ul style={{ ...ulStyle, marginTop: 8 }}>
            <li>Garantías de comerciabilidad o idoneidad para un propósito particular.</li>
            <li>Garantías de que la Plataforma operará sin interrupciones ni errores.</li>
            <li>Garantías de exactitud, integridad o actualidad de los datos procesados.</li>
            <li>Garantías de compatibilidad con todos los dispositivos, navegadores o sistemas operativos.</li>
          </ul>
        </Item>
        <Item n="8.2">AGINNOVA no garantiza que las recomendaciones generadas por el módulo de IA sean precisas o adecuadas para la toma de decisiones comerciales. El Usuario asume la responsabilidad total de las decisiones basadas en dichas recomendaciones.</Item>
      </Clausula>

      {/* Cláusula 9 */}
      <Clausula numero="9" titulo="Limitación de Responsabilidad">
        <Item n="9.1">En la máxima medida permitida por la legislación mexicana aplicable, la responsabilidad total acumulada de AGINNOVA frente al Usuario y/o al Tenant no excederá el monto total pagado por el Tenant a AGINNOVA durante los <strong>tres (3) meses</strong> inmediatamente anteriores al evento que originó la reclamación.</Item>
        <Item n="9.2">En ningún caso AGINNOVA será responsable por:
          <ul style={{ ...ulStyle, marginTop: 8 }}>
            <li>Daños indirectos, incidentales, especiales, consecuenciales o punitivos.</li>
            <li>Lucro cesante, pérdida de negocios o pérdida de oportunidades comerciales.</li>
            <li>Pérdida de datos del Usuario cuando ésta sea atribuible a la conducta del propio Usuario o a los Servicios de Terceros.</li>
            <li>Daños derivados de caso fortuito o fuerza mayor.</li>
          </ul>
        </Item>
      </Clausula>

      {/* Cláusula 10 */}
      <Clausula numero="10" titulo="Datos y Respaldo">
        <Item n="10.1">AGINNOVA realizará respaldos periódicos conforme a las políticas de retención de Supabase. Sin embargo, el Usuario reconoce que la responsabilidad primaria de mantener copias de seguridad de su Contenido recae en el propio Usuario y/o Tenant.</Item>
        <Item n="10.2">En caso de terminación de la relación comercial, el Tenant podrá solicitar la exportación de sus datos en formato CSV o JSON dentro de los <strong>30 días naturales</strong> siguientes a la fecha de terminación. Transcurrido dicho plazo, AGINNOVA procederá a la eliminación definitiva de los datos conforme a la LFPDPPP.</Item>
      </Clausula>

      {/* Cláusula 11 */}
      <Clausula numero="11" titulo="Confidencialidad">
        <Item n="11.1">Ambas partes se comprometen a mantener la confidencialidad de toda información sensible, técnica, comercial o estratégica a la que tengan acceso con motivo de la relación derivada del uso de la Plataforma.</Item>
        <Item n="11.2">Esta obligación de confidencialidad subsistirá durante un periodo de <strong>dos (2) años</strong> posteriores a la terminación de la relación comercial.</Item>
      </Clausula>

      {/* Cláusula 12 */}
      <Clausula numero="12" titulo="Modificaciones">
        <Item n="12.1">AGINNOVA se reserva el derecho de modificar los presentes Términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en la Plataforma.</Item>
        <Item n="12.2">Se notificará a los Usuarios sobre cambios sustanciales mediante un aviso visible al iniciar sesión. El uso continuado de la Plataforma tras dicha notificación constituirá la aceptación de los Términos modificados.</Item>
      </Clausula>

      {/* Cláusula 13 */}
      <Clausula numero="13" titulo="Legislación Aplicable y Jurisdicción">
        <Item n="13.1">Los presentes Términos se regirán e interpretarán conforme a las leyes vigentes de los <strong>Estados Unidos Mexicanos</strong>.</Item>
        <Item n="13.2">Para cualquier controversia derivada de la interpretación, cumplimiento o ejecución de estos Términos, las partes se someten a la jurisdicción de los <strong>Tribunales competentes de la Ciudad de México</strong>, renunciando expresamente a cualquier otro fuero que por razón de domicilio presente o futuro pudiera corresponderles.</Item>
      </Clausula>

      {/* Cláusula 14 */}
      <Clausula numero="14" titulo="Disposiciones Generales">
        <Item n="14.1">Si alguna disposición de estos Términos fuera declarada nula o inaplicable, las disposiciones restantes mantendrán plena vigencia y efecto.</Item>
        <Item n="14.2">La omisión de AGINNOVA en ejercer cualquier derecho previsto en estos Términos no constituirá una renuncia al mismo.</Item>
        <Item n="14.3">Estos Términos, junto con el Aviso de Privacidad Integral y cualquier Acuerdo de Nivel de Servicio específico, constituyen el acuerdo completo entre las partes en relación con el uso de la Plataforma.</Item>
      </Clausula>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 40, paddingTop: 16, fontSize: 12, color: '#a0aec0', textAlign: 'center' }}>
        INNOVATECH S.A.S. · CRM Aginnova · Folio SAS-1.7-205101-45754 · Versión 1.0 · Junio 2026
      </div>
    </div>
  )
}

// ─── Componentes internos ───────────────────────────────────────────────────

function Clausula({ numero, titulo, children }: { numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 16, fontWeight: 800, color: '#1C3F6E',
        borderLeft: '4px solid #4A7BB5', paddingLeft: 12,
        margin: '0 0 16px', lineHeight: 1.4,
      }}>
        Cláusula {numero}. {titulo}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: '#2d3748' }}>{children}</div>
    </section>
  )
}

function Item({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 10px' }}>
      <strong style={{ color: '#4a5568' }}>{n}.</strong> {children}
    </p>
  )
}

function TermTable({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ overflowX: 'auto', margin: '12px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={thStyle}>Término</th>
            <th style={thStyle}>Definición</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([term, def], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F7FAFC' }}>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#1C3F6E', whiteSpace: 'nowrap' }}>{term}</td>
              <td style={tdStyle}>{def}</td>
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

const thStyle: React.CSSProperties = {
  background: '#EBF4FF', color: '#1C3F6E', fontWeight: 700,
  padding: '10px 14px', textAlign: 'left', border: '1px solid #BEE3F8',
}

const tdStyle: React.CSSProperties = {
  padding: '9px 14px', border: '1px solid #e2e8f0',
  color: '#4a5568', verticalAlign: 'top', fontSize: 13,
}
