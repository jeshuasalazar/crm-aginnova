import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUploadsHistory } from '@/app/actions/data'
import DatosClient from './components/DatosClient'

export default async function DatosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar historial de uploads del tenant actual
  const history = await getUploadsHistory()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Ingesta de Datos</h1>
        <p className="text-sm text-gray-500">Carga plantillas Estándar de Ventas, Inventario y Campañas en CSV para alimentar la IA y los dashboards.</p>
      </div>

      {/* ── AVISO DE PRIVACIDAD SIMPLIFICADO (LFPDPPP) ─────────────────────── */}
      <div style={{
        background: '#FFFBEB',
        border: '1px solid #F6D860',
        borderLeft: '4px solid #D69E2E',
        borderRadius: 8,
        padding: '14px 18px',
        fontSize: 13,
        color: '#744210',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 700, margin: '0 0 4px' }}>Aviso de Privacidad — Carga de Archivos CSV</p>
          <p style={{ margin: '0 0 6px', lineHeight: 1.6 }}>
            Los archivos que cargues pueden contener datos personales de terceros (clientes, destinatarios, empleados).
            Conforme a la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>,
            eres responsable de contar con el consentimiento de los titulares antes de cargar sus datos en esta plataforma.
          </p>
          <p style={{ margin: '0 0 4px', lineHeight: 1.6 }}>
            <strong>Queda estrictamente prohibido cargar:</strong> datos de salud, origen étnico, creencias religiosas,
            orientación sexual, datos biométricos o cualquier otro dato personal sensible (Art. 3, Fr. VI LFPDPPP).
            En caso de detectarse, serán eliminados de inmediato.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#92680a' }}>
            Al cargar un archivo confirmas que cuentas con las autorizaciones necesarias. Consulta el{' '}
            <a href="/privacidad" style={{ color: '#1C3F6E', fontWeight: 600 }}>Aviso de Privacidad Integral</a>{' '}
            para más información.
          </p>
        </div>
      </div>
      {/* ──────────────────────────────────────────────────────────────────────── */}

      <DatosClient initialHistory={history} />
    </div>
  )
}
