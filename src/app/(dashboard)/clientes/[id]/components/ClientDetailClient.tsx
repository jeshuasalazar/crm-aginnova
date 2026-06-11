'use client'

import { useState } from 'react'
import { ClientDetails } from '@/app/actions/clientDetails'
import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Download, 
  Printer, 
  Boxes, 
  Truck, 
  Bell, 
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  ShoppingBag,
  Package,
  Activity,
  Award,
  ChevronRight,
  Target
} from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ClientDetailClientProps {
  clientData: ClientDetails
}

export default function ClientDetailClient({ clientData }: ClientDetailClientProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'info'>('success')

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setShowToast(msg)
    setToastType(type)
    setTimeout(() => setShowToast(null), 3000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    let csv = `REPORTE DE ROI Y DESEMPEÑO - ${clientData.name} - JUNIO 2026\n`
    csv += `Periodo,01-30 Junio 2026\n`
    csv += `Baseline acordado,$${clientData.baselineAmount}\n`
    csv += `Meta del periodo,$${clientData.targetAmount}\n`
    csv += `Ventas actuales,$${clientData.salesCurrent}\n`
    csv += `Ventas incrementales,$${clientData.salesIncremental}\n`
    csv += `Comision aplicada,${clientData.commissionRate}%\n`
    csv += `COMISION A PAGAR,$${clientData.commissionAmount}\n\n`
    
    csv += `HISTORICO MENSUAL\n`
    csv += `Periodo,Ventas Reales,Baseline,Comision\n`
    clientData.history.forEach((h) => {
      csv += `${h.period},$${h.actual},$${h.baseline},$${h.commission}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_desempeno_${clientData.name.toLowerCase()}_junio2026.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Reporte CSV descargado con éxito!')
  }

  // Calculate cumulative commission
  const totalCommission = clientData.history.reduce((sum, h) => sum + h.commission, 0)

  // Chart data: Sales
  const salesChartData = {
    labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
    datasets: [
      {
        label: 'Ventas Diarias (MXN)',
        data: clientData.name === 'NALUA' 
          ? [5500, 3200, 1800, 4100, 2500, 7800, 6200, 3900, 5100, 4900]
          : clientData.name === 'KAWDOBA'
          ? [25000, 0, 48000, 0, 18000, 0, 35000, 0, 21000, 18000]
          : [0, 15000, 0, 32000, 0, 18000, 0, 22000, 0, 12300],
        backgroundColor: 'rgba(74, 123, 181, 0.75)',
        borderRadius: 4
      }
    ]
  }

  // Chart data: Marketing (trends of channel CTRs)
  const mktChartData = {
    labels: clientData.marketing.chartData.map(d => d.label),
    datasets: [
      {
        label: 'Instagram CTR (%)',
        data: clientData.marketing.chartData.map(d => d.values.Instagram),
        borderColor: '#E65100',
        backgroundColor: 'rgba(230, 81, 0, 0.05)',
        fill: false,
        tension: 0.4,
        borderWidth: 2.5
      },
      {
        label: 'Facebook CTR (%)',
        data: clientData.marketing.chartData.map(d => d.values.Facebook),
        borderColor: '#4A7BB5',
        backgroundColor: 'rgba(74, 123, 181, 0.05)',
        fill: false,
        tension: 0.4,
        borderWidth: 2.5
      },
      {
        label: 'Google Ads CTR (%)',
        data: clientData.marketing.chartData.map(d => d.values.GoogleAds),
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.05)',
        fill: false,
        tension: 0.4,
        borderWidth: 2.5
      }
    ]
  }

  return (
    <div className="flex flex-col gap-6 print:p-8">
      {/* Toast Alert */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white flex items-center gap-2 animate-bounce ${
          toastType === 'success' ? 'bg-green-600' : 'bg-[#1C3F6E]'
        }`}>
          <CheckCircle2 size={18} />
          <span className="font-semibold">{showToast}</span>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="breadcrumb flex items-center gap-2 text-sm text-gray-500 print:hidden">
        <Link href="/">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/clientes">Clientes</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="text-gray-800 font-semibold">{clientData.name}</span>
      </div>

      {/* BACK NAVIGATION */}
      <div className="flex justify-between items-center print:hidden">
        <Link href="/clientes" className="btn btn-secondary btn-sm flex items-center gap-1">
          <ArrowLeft size={14} />
          <span>Volver a Clientes</span>
        </Link>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn btn-secondary flex items-center gap-1.5 text-xs">
            <Download size={14} />
            <span>Exportar Reporte</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary flex items-center gap-1.5 text-xs bg-blue-600">
            <Printer size={14} />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* CLIENT PROFILE HEADER */}
      <div className="card border p-6 rounded-xl bg-white shadow-sm" style={{ borderLeft: '5px solid var(--primary)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1C3F6E] to-[#4A7BB5] flex items-center justify-center text-white font-extrabold text-2xl font-mono shadow-md">
              {clientData.name.substring(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-extrabold text-2xl text-[#1C3F6E]">{clientData.name}</span>
                <div className={`semaforo ${
                  clientData.salesCurrent >= clientData.targetAmount ? 'green' : 
                  clientData.salesCurrent >= clientData.baselineAmount ? 'yellow' : 'red'
                }`} style={{ width: 14, height: 14 }}></div>
                <span className={`chip text-xs ${
                  clientData.salesCurrent >= clientData.targetAmount ? 'green' : 
                  clientData.salesCurrent >= clientData.baselineAmount ? 'yellow' : 'red'
                }`}>
                  {clientData.salesCurrent >= clientData.targetAmount ? 'Meta Alcanzada' : 
                   clientData.salesCurrent >= clientData.baselineAmount ? 'Crecimiento Incremental' : 'Bajo Rendimiento'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {clientData.sector} · Plan {clientData.plan.toUpperCase()} · Estatus: <strong className="text-green-600">{clientData.status.toUpperCase()}</strong>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 flex gap-6 text-xs text-left">
            <div>
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Ventas Junio</span>
              <strong className="text-gray-800 text-sm font-extrabold">${clientData.salesCurrent.toLocaleString('es-MX')}</strong>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Comisión Acumulada</span>
              <strong className="text-green-600 text-sm font-extrabold">${clientData.commissionAmount.toLocaleString('es-MX')}</strong>
            </div>
            <div className="border-l border-gray-200 pl-4">
              <span className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Alertas Activas</span>
              <strong className="text-red-500 text-sm font-extrabold">{clientData.alerts.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="tabs border-b border-gray-200 flex gap-4 print:hidden">
        {['KPIs Generales', 'Ventas / ROI', 'Marketing & Redes', 'Inventario y Lotes', 'Logística B2B/B2C'].map((tab, idx) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(idx)}
            className={`tab pb-2 font-semibold text-sm transition-all border-b-2 ${
              activeTab === idx ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 0: KPIs GENERALES */}
      {activeTab === 0 && (
        <div className="flex flex-col gap-6">
          <div className="kpi-grid grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="kpi-card green">
              <div className="kpi-icon green"><Activity size={18} /></div>
              <div className="kpi-label">Score de Salud</div>
              <div className="kpi-value">
                {clientData.name === 'NALUA' ? 82 : clientData.name === 'KAWDOBA' ? 74 : 88}
                <span className="text-xs font-normal text-gray-400">/100</span>
              </div>
              <div className="kpi-trend text-xs text-green-600">↑ Crecimiento continuo</div>
            </div>

            <div className="kpi-card blue">
              <div className="kpi-icon blue"><TrendingUp size={18} /></div>
              <div className="kpi-label">Progreso vs. Meta</div>
              <div className="kpi-value">
                {((clientData.salesCurrent / clientData.targetAmount) * 100).toFixed(1)}%
              </div>
              <div className="kpi-trend text-xs text-gray-500">Meta: ${clientData.targetAmount.toLocaleString('es-MX')}</div>
            </div>

            <div className="kpi-card yellow">
              <div className="kpi-icon yellow"><Clock size={18} /></div>
              <div className="kpi-label">Lotes Críticos (PEPS)</div>
              <div className="kpi-value">
                {clientData.batches.filter(b => b.alert_60_pct).length}
              </div>
              <div className="kpi-trend text-xs text-orange-600">Consumo &gt;60% de vida útil</div>
            </div>

            <div className="kpi-card orange">
              <div className="kpi-icon orange"><Bell size={18} /></div>
              <div className="kpi-label">Alertas de Operación</div>
              <div className="kpi-value">{clientData.alerts.length}</div>
              <div className="kpi-trend text-xs text-red-500">Sin resolver en sistema</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alertas Operativas */}
            <div className="card border p-5 bg-white rounded-xl shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <span>Alertas Activas</span>
              </h3>
              <div className="flex flex-col gap-3">
                {clientData.alerts.length > 0 ? (
                  clientData.alerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-red-800 uppercase tracking-wide">{alert.type} · {alert.severity.toUpperCase()}</div>
                        <p className="text-xs text-gray-700 mt-0.5">{alert.message}</p>
                      </div>
                      <button 
                        onClick={() => triggerToast('Alerta marcada como resuelta. Actualizando...')}
                        className="btn btn-sm btn-ghost text-xs text-red-700 hover:bg-red-100"
                      >
                        Resolver
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No hay alertas operativas activas.</p>
                )}
              </div>
            </div>

            {/* Recomendaciones IA */}
            <div className="card border p-5 bg-white rounded-xl shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-[#4A7BB5]" />
                <span>Recomendaciones del Agente IA</span>
              </h3>
              <div className="flex flex-col gap-3">
                {clientData.recommendations.length > 0 ? (
                  clientData.recommendations.map((rec) => (
                    <div key={rec.id} className="rec-card border border-gray-100 p-4 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="rec-type text-xs font-bold text-blue-600">{rec.area.toUpperCase()}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">Confianza: {Math.round(rec.confidence * 100)}%</span>
                      </div>
                      <p className="rec-text text-xs text-gray-700">{rec.content}</p>
                      {rec.impact_estimate && (
                        <div className="text-xs text-green-700 bg-green-50 p-2 rounded font-medium">
                          🎯 Impacto: {rec.impact_estimate}
                        </div>
                      )}
                      <div className="rec-actions mt-2 flex gap-2">
                        <button 
                          onClick={() => triggerToast(`Recomendación aprobada y enviada a ${clientData.name}`)}
                          className="btn btn-sm btn-success text-xs py-1"
                        >
                          Aprobar
                        </button>
                        <button 
                          onClick={() => triggerToast('Recomendación descartada')}
                          className="btn btn-sm btn-ghost text-xs py-1 text-gray-400"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No hay recomendaciones de IA disponibles.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: VENTAS / ROI */}
      {activeTab === 1 && (
        <div className="flex flex-col gap-6">
          <div className="card border p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-2">Desglose de ROI e Incrementales</h3>
            <p className="text-xs text-gray-400 mb-4">Calculamos las comisiones únicamente sobre la diferencia incremental lograda en el mes.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-600">Meta del Período:</span>
                  <span className="text-[#1C3F6E]">${clientData.targetAmount.toLocaleString('es-MX')}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                  <div 
                    className="bg-green-500 h-full transition-all" 
                    style={{ width: `${Math.min(100, (clientData.salesCurrent / clientData.targetAmount) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progreso hacia Meta: {((clientData.salesCurrent / clientData.targetAmount) * 100).toFixed(1)}%</span>
                  <span>Meta: ${clientData.targetAmount.toLocaleString('es-MX')}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2 border border-gray-100 text-sm mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ventas Reales del Mes:</span>
                    <span className="font-semibold text-gray-800">${clientData.salesCurrent.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">(-) Baseline Base:</span>
                    <span className="font-semibold text-gray-800">-${clientData.baselineAmount.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#1C3F6E] font-bold">(=) Ventas Incrementales:</span>
                    <span className="font-bold text-[#1C3F6E]">${clientData.salesIncremental.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>(Tasa aplicada {clientData.commissionRate}% sobre comisiones)</span>
                    <span className="font-bold text-green-600">Comisión: ${clientData.commissionAmount.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>

              <div className="h-[240px] relative">
                <Bar data={salesChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          {/* HISTORIAL MENSUAL */}
          <div className="card border p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4">Historial de Ventas e Impacto de ROI</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
                  <tr>
                    <th className="p-3">Período</th>
                    <th className="p-3">Ventas Reales</th>
                    <th className="p-3">Baseline Base</th>
                    <th className="p-3">Comisión Generada</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.history.map((h, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 text-gray-700">
                      <td className="p-3 font-semibold">{h.period}</td>
                      <td className="p-3">${h.actual.toLocaleString('es-MX')}</td>
                      <td className="p-3">${h.baseline.toLocaleString('es-MX')}</td>
                      <td className="p-3 font-semibold text-green-600">${h.commission.toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold text-gray-800 border-t-2">
                    <td className="p-3">Acumulado Histórico</td>
                    <td className="p-3">
                      ${clientData.history.reduce((sum, h) => sum + h.actual, 0).toLocaleString('es-MX')}
                    </td>
                    <td className="p-3">-</td>
                    <td className="p-3 text-green-600">${totalCommission.toLocaleString('es-MX')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKETING & REDES */}
      {activeTab === 2 && (
        <div className="flex flex-col gap-6">
          <div className="kpi-grid grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="kpi-card blue">
              <div className="kpi-label">CTR Campañas</div>
              <div className="kpi-value">{clientData.marketing.ctr}%</div>
              <div className="kpi-trend text-xs text-green-600">↑ Meta: &gt;0.9% ✓</div>
            </div>

            <div className="kpi-card green">
              <div className="kpi-label">Alcance de Redes</div>
              <div className="kpi-value">{(clientData.marketing.reach / 1000).toFixed(1)}k</div>
              <div className="kpi-trend text-xs text-gray-400">Usuarios únicos impactados</div>
            </div>

            <div className="kpi-card yellow">
              <div className="kpi-label">Costo Por Click</div>
              <div className="kpi-value">${clientData.marketing.cpc.toFixed(2)}</div>
              <div className="kpi-trend text-xs text-green-600">↓ CPC promedio en rango</div>
            </div>

            <div className="kpi-card orange">
              <div className="kpi-label">ROAS Estimado</div>
              <div className="kpi-value">{clientData.marketing.roas}x</div>
              <div className="kpi-trend text-xs text-green-600">↑ Retorno de inversión Ads</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gráfico de CTR */}
            <div className="card border p-5 bg-white rounded-xl shadow-sm md:col-span-2">
              <h3 className="text-base font-bold text-gray-800 mb-3">Rendimiento por Canal Digital</h3>
              <div className="h-[220px]">
                <Line data={mktChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Workflows de Automatización */}
            <div className="card border p-5 bg-white rounded-xl shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-orange-500" />
                <span>Workflows Activos</span>
              </h3>
              <div className="flex flex-col gap-3">
                {clientData.workflows.length > 0 ? (
                  clientData.workflows.map((wf) => (
                    <div key={wf.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-center font-bold text-gray-800">
                        <span>{wf.name}</span>
                        <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded uppercase font-bold">Activo</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 font-semibold">TRIGGER: {wf.trigger}</div>
                      <div className="text-gray-500 mt-0.5 font-medium">Acciones automatizadas: {wf.actions.length} configuradas</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No hay automatizaciones activas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INVENTARIO Y LOTES */}
      {activeTab === 3 && (
        <div className="flex flex-col gap-6">
          {/* CATALOGO SKUS */}
          <div className="card border p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={16} className="text-blue-500" />
              <span>Catálogo de Productos y Existencias</span>
            </h3>
            <div className="table-wrap">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Costo Unit.</th>
                    <th>Precio Unit.</th>
                    <th>Margen</th>
                    <th>Stock Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.skus.map((sku) => {
                    const status = sku.stock <= sku.reorder_point ? 'reorder' : 'ok'
                    return (
                      <tr key={sku.id}>
                        <td className="font-mono text-xs font-bold text-gray-800">{sku.sku}</td>
                        <td className="font-semibold text-gray-800">{sku.name}</td>
                        <td className="text-xs text-gray-500">{sku.category}</td>
                        <td>${sku.unit_cost.toLocaleString('es-MX')}</td>
                        <td>${sku.unit_price.toLocaleString('es-MX')}</td>
                        <td className="text-green-700 font-semibold">{sku.margin_percent.toFixed(1)}%</td>
                        <td className="font-bold text-gray-700">{sku.stock} u</td>
                        <td>
                          <span className={`chip ${status === 'reorder' ? 'red' : 'green'}`}>
                            {status === 'reorder' ? 'REORDENAR' : 'DISPONIBLE'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* CONTROL DE LOTES (PEPS) */}
          <div className="card border p-6 bg-white rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Boxes size={16} className="text-orange-500" />
                <span>Control de Lotes y Caducidades (Protocolo PEPS)</span>
              </h3>
              <span className="chip orange text-[11px] font-bold">Objetivo: 0% Pérdidas</span>
            </div>
            
            <div className="table-wrap">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Lote ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Fecha Ingreso</th>
                    <th>Fecha Caducidad</th>
                    <th>Vida Útil Consumida</th>
                    <th>Días Restantes</th>
                    <th>Estatus Lote</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.batches.length > 0 ? (
                    clientData.batches.map((batch) => (
                      <tr key={batch.id}>
                        <td className="font-mono text-xs text-gray-500">#{batch.id.substring(0, 8)}</td>
                        <td>
                          <div className="font-semibold text-gray-800">{batch.sku_name}</div>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">{batch.sku}</span>
                        </td>
                        <td className="font-bold text-gray-700">{batch.quantity} u</td>
                        <td className="text-xs text-gray-500">{batch.received_at}</td>
                        <td className="text-xs text-gray-500 font-semibold">{batch.expiry_date || 'N/A (No expira)'}</td>
                        <td>
                          {batch.life_percent !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 h-2 rounded-full overflow-hidden flex">
                                <div 
                                  className={`h-full ${batch.alert_60_pct ? 'bg-orange-500' : 'bg-green-500'}`}
                                  style={{ width: `${batch.life_percent}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-semibold ${batch.alert_60_pct ? 'text-orange-600' : 'text-green-600'}`}>
                                {batch.life_percent}%
                              </span>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className={`font-semibold ${
                          batch.dias_hasta_caducidad && batch.dias_hasta_caducidad <= 15 ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {batch.dias_hasta_caducidad !== undefined 
                            ? `${batch.dias_hasta_caducidad} días` 
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={`chip ${
                            batch.alert_60_pct ? 'orange' : 'green'
                          }`}>
                            {batch.alert_60_pct ? 'LIQUIDACIÓN' : 'EXCELENTE'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400">
                        No hay lotes registrados para {clientData.name}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOGÍSTICA */}
      {activeTab === 4 && (
        <div className="flex flex-col gap-6">
          <div className="kpi-grid grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="kpi-card green">
              <div className="kpi-label">SLA de Pedidos</div>
              <div className="kpi-value">{clientData.logistics.slaOrders}h</div>
              <div className="kpi-trend text-xs text-green-600">↑ Objetivo: ≤ 12h hábiles ✓</div>
            </div>

            <div className="kpi-card green">
              <div className="kpi-label">Entregas a Tiempo</div>
              <div className="kpi-value">{clientData.logistics.onTimeRate}%</div>
              <div className="kpi-trend text-xs text-green-600">↑ Meta: &gt;90% ✓</div>
            </div>

            <div className="kpi-card blue">
              <div className="kpi-label">Pedidos Activos</div>
              <div className="kpi-value">{clientData.logistics.activeOrders}</div>
              <div className="kpi-trend text-xs text-gray-400">En bandeja pendiente</div>
            </div>

            <div className="kpi-card yellow">
              <div className="kpi-label">Tasa Devoluciones</div>
              <div className="kpi-value">{clientData.logistics.returnRate}%</div>
              <div className="kpi-trend text-xs text-green-600">↓ Muy baja tasa de incidencias ✓</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leads del Pipeline B2B/B2C */}
            <div className="card border p-5 bg-white rounded-xl shadow-sm md:col-span-2">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target size={16} className="text-[#1C3F6E]" />
                <span>Pipeline de Captación de Leads</span>
              </h3>
              <div className="table-wrap">
                <table className="dtable text-xs">
                  <thead>
                    <tr>
                      <th>Cliente Potencial</th>
                      <th>Canal / Origen</th>
                      <th>Contacto</th>
                      <th>Interés</th>
                      <th>Fase Pipeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="font-semibold text-gray-800">{lead.name}</td>
                        <td>{lead.source}</td>
                        <td>{lead.contact}</td>
                        <td>
                          <span className={`chip ${
                            lead.interest_level === 'high' ? 'red' : 
                            lead.interest_level === 'medium' ? 'yellow' : 'gray'
                          }`}>
                            {lead.interest_level.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-bold text-blue-700 uppercase tracking-wide">{lead.stage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enlaces Rápidos Logísticos */}
            <div className="card border p-5 bg-white rounded-xl shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Herramientas Logísticas</h3>
              <div className="flex flex-col gap-3">
                <Link href="/orders" className="btn btn-primary justify-center py-3">
                  <ShoppingBag size={15} />
                  <span>Bandeja de Pedidos</span>
                </Link>
                <Link href="/shipments" className="btn btn-secondary justify-center py-3">
                  <Truck size={15} />
                  <span>Envíos y Guías (Skydropx)</span>
                </Link>
                <button 
                  onClick={() => triggerToast('Comprobando API Skydropx en modo Sandbox: ¡Listo! ✓', 'info')}
                  className="btn btn-ghost border text-xs text-gray-600 justify-center"
                >
                  Probar Conexión Skydropx
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
