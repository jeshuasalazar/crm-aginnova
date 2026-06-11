import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { getShipments } from '@/app/actions/orders'
import { Download, ExternalLink, RefreshCw, Truck } from 'lucide-react'

export default async function ShipmentsPage() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect('/login')
  }

  const tenantId = profile.tenant_id
  const tenantName = profile.tenant?.name || 'NALUA'

  const shipments = await getShipments(tenantId)

  // Calcs
  const totalShipments = shipments.length
  const transitCount = shipments.filter(s => s.status === 'in_transit' || s.status === 'labeled').length
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Historial de Envíos</h1>
          <p className="text-sm text-gray-500">Rastrea guías generadas y descarga etiquetas en PDF.</p>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue">
            <Truck size={20} />
          </div>
          <span className="kpi-label">Total Guías Generadas</span>
          <span className="kpi-value">{totalShipments}</span>
        </div>

        <div className="kpi-card yellow">
          <div className="kpi-icon yellow">
            <RefreshCw size={20} />
          </div>
          <span className="kpi-label">En Tránsito / Activos</span>
          <span className="kpi-value">{transitCount}</span>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon green">
            <Truck size={20} />
          </div>
          <span className="kpi-label">Entregados</span>
          <span className="kpi-value">{deliveredCount}</span>
        </div>
      </div>

      {/* SHIPMENTS LIST */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Envíos de {tenantName}</h3>
        </div>


        <div className="table-wrap">
          <table className="dtable">
            <thead>
              <tr>
                <th>Paquetería</th>
                <th>Cliente Destinatario</th>
                <th>Número de Rastreo</th>
                <th>Estatus</th>
                <th>Fecha Generación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Aún no se han generado envíos para {tenantName}
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => {
                  const customer = shipment.order?.customer_name || 'Desconocido'
                  const tracking = shipment.tracking_number || 'Sin rastreo'
                  const statusLabel = 
                    shipment.status === 'labeled' ? 'ETIQUETADO' :
                    shipment.status === 'in_transit' ? 'EN TRÁNSITO' :
                    shipment.status === 'delivered' ? 'ENTREGADO' : 'BORRADOR'

                  return (
                    <tr key={shipment.id}>
                      <td className="font-extrabold text-gray-800">{shipment.carrier || 'N/A'}</td>
                      <td>
                        <div className="font-semibold text-gray-900">{customer}</div>
                        <div className="text-xs text-gray-500">Orden: {shipment.order_id.substring(0, 8)}...</div>
                      </td>
                      <td className="font-mono text-xs text-gray-700">{tracking}</td>
                      <td>
                        <span className={`chip ${
                          shipment.status === 'delivered' ? 'green' :
                          shipment.status === 'labeled' ? 'blue' : 'yellow'
                        }`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">
                        {new Date(shipment.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {shipment.label_url ? (
                            <a
                              href={shipment.label_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-success flex items-center gap-1"
                              title="Descargar Guía PDF"
                            >
                              <Download size={13} />
                              <span>Guía</span>
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 font-semibold italic">Sin etiqueta</span>
                          )}

                          <a
                            href={`https://track.skydropx.com/${tracking}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-ghost flex items-center gap-1"
                            title="Rastreo externo"
                          >
                            <ExternalLink size={13} />
                            <span>Rastrear</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
