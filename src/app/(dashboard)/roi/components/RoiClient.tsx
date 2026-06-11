'use client'

import { RoiData } from '@/app/actions/roi'
import { FileDown, Percent, DollarSign, TrendingUp, Printer } from 'lucide-react'

interface RoiClientProps {
  roiData: RoiData
}

export default function RoiClient({ roiData }: RoiClientProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    // Generate CSV format
    let csv = `REPORTE DE ROI - ${roiData.tenantName} - JUNIO 2026\n`
    csv += `Periodo,01-30 Junio 2026\n`
    csv += `Baseline acordado,$${roiData.baselineAmount}\n`
    csv += `Meta del periodo,$${roiData.targetAmount}\n`
    csv += `Ventas actuales,$${roiData.salesCurrent}\n`
    csv += `Ventas incrementales,$${roiData.salesIncremental}\n`
    csv += `Comision aplicada,${roiData.commissionRate}%\n`
    csv += `COMISION A PAGAR,$${roiData.commissionAmount}\n\n`
    
    csv += `HISTORICO MENSUAL\n`
    csv += `Periodo,Ventas Reales,Baseline,Comision\n`
    roiData.history.forEach((h) => {
      csv += `${h.period},$${h.actual},$${h.baseline},$${h.commission}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_roi_${roiData.tenantName.toLowerCase()}_junio2026.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate cumulative commission
  const totalCommission = roiData.history.reduce((sum, h) => sum + h.commission, 0)

  return (
    <div className="flex flex-col gap-6 print:p-8">
      {/* HEADER ACCIONES (Se oculta al imprimir) */}
      <div className="flex justify-between items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Panel de ROI e Incrementales</h1>
          <p className="text-sm text-gray-500">Visualiza las ventas base, los incrementos alcanzados y el cobro de comisiones del mes.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn btn-secondary flex items-center gap-1.5 text-xs">
            <FileDown size={14} />
            <span>Exportar CSV</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary flex items-center gap-1.5 text-xs bg-blue-600">
            <Printer size={14} />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* REPORTE PARA IMPRESIÓN (Visible al imprimir) */}
      <div className="hidden print:block border-b pb-4 mb-4 border-gray-300">
        <h1 className="text-2xl font-bold text-gray-900">REPORTE OFICIAL DE ROI & COMISIONES</h1>
        <p className="text-xs text-gray-500 mt-1">Generado por CRM Aginnova · Fecha: {new Date().toLocaleDateString('es-MX')}</p>
        <p className="text-sm font-semibold text-gray-700 mt-2">Cliente: {roiData.tenantName}</p>
      </div>

      {/* METRICAS PRINCIPALES */}
      <div className="kpi-grid grid cols-1 md:grid-cols-4 gap-4">
        <div className="kpi-card blue">
          <div className="kpi-icon blue"><DollarSign size={18} /></div>
          <div className="kpi-label">Baseline Acordado</div>
          <div className="kpi-value text-xl font-bold">${roiData.baselineAmount.toLocaleString('es-MX')}</div>
          <div className="kpi-trend text-xs text-gray-400">Piso de ventas acordado</div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon green"><TrendingUp size={18} /></div>
          <div className="kpi-label">Ventas Actuales</div>
          <div className="kpi-value text-xl font-bold">${roiData.salesCurrent.toLocaleString('es-MX')}</div>
          <div className="kpi-trend text-xs text-green-600">
            {roiData.salesCurrent > roiData.baselineAmount 
              ? `+${((roiData.salesCurrent / roiData.baselineAmount - 1) * 100).toFixed(1)}% vs base` 
              : 'Sin incremento'}
          </div>
        </div>

        <div className="kpi-card yellow animate-pulse">
          <div className="kpi-icon yellow"><Percent size={18} /></div>
          <div className="kpi-label">Tasa Comisión Aplicada</div>
          <div className="kpi-value text-xl font-bold">{roiData.commissionRate}%</div>
          <div className="kpi-trend text-xs text-gray-500">
            {roiData.commissionBracket === 'double_target' ? 'Escalón máximo (Meta x2)' :
             roiData.commissionBracket === 'on_target' ? 'Escalón intermedio (Meta cumplida)' :
             'Escalón base (Sin mejora)'}
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon orange"><DollarSign size={18} /></div>
          <div className="kpi-label">Comisión a Pagar</div>
          <div className="kpi-value text-xl font-bold">${roiData.commissionAmount.toLocaleString('es-MX')}</div>
          <div className="kpi-trend text-xs text-gray-500">Calculado sobre incrementales</div>
        </div>
      </div>

      {/* COMPARATIVA DE METAS */}
      <div className="card border p-6 rounded-xl bg-white shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-2">Desglose de ROI e Incrementales</h3>
        <p className="text-xs text-gray-400 mb-4">Calculamos las comisiones únicamente sobre la diferencia incremental lograda en el mes.</p>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-gray-600">Meta del Período:</span>
            <span className="text-[#1C3F6E]">${roiData.targetAmount.toLocaleString('es-MX')}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
            <div 
              className="bg-green-500 h-full transition-all" 
              style={{ width: `${Math.min(100, (roiData.salesCurrent / roiData.targetAmount) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progreso hacia Meta: {((roiData.salesCurrent / roiData.targetAmount) * 100).toFixed(1)}%</span>
            <span>Meta: ${roiData.targetAmount.toLocaleString('es-MX')}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2 border border-gray-100 text-sm mt-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Ventas Reales del Mes:</span>
              <span className="font-semibold text-gray-800">${roiData.salesCurrent.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">(-) Baseline Base:</span>
              <span className="font-semibold text-gray-800">-${roiData.baselineAmount.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#1C3F6E] font-bold">(=) Ventas Incrementales:</span>
              <span className="font-bold text-[#1C3F6E]">${roiData.salesIncremental.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>(Tasa aplicada {roiData.commissionRate}% sobre comisiones)</span>
              <span className="font-bold text-green-600">Comisión: ${roiData.commissionAmount.toLocaleString('es-MX')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETALLES DE ESCALONES DE COMISIÓN */}
      <div className="card border p-6 rounded-xl bg-white shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-4">Esquema de Comisiones Escalonadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border text-center flex flex-col gap-1 ${
            roiData.commissionBracket === 'none' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
          }`}>
            <span className="text-xs text-gray-400 font-bold">Escalón Base</span>
            <span className="text-xl font-bold text-gray-800">0%</span>
            <span className="text-[11px] text-gray-500 mt-1">Sin incremento sobre baseline</span>
          </div>

          <div className={`p-4 rounded-lg border text-center flex flex-col gap-1 ${
            roiData.commissionBracket === 'on_target' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
          }`}>
            <span className="text-xs text-gray-400 font-bold">Meta Cumplida</span>
            <span className="text-xl font-bold text-green-700">10%</span>
            <span className="text-[11px] text-gray-500 mt-1">Ventas ≥ ${roiData.targetAmount.toLocaleString('es-MX')}</span>
          </div>

          <div className={`p-4 rounded-lg border text-center flex flex-col gap-1 ${
            roiData.commissionBracket === 'double_target' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
          }`}>
            <span className="text-xs text-gray-400 font-bold">Doble Meta Cumplida</span>
            <span className="text-xl font-bold text-green-700">15%</span>
            <span className="text-[11px] text-gray-500 mt-1">Ventas ≥ ${(roiData.targetAmount * 2).toLocaleString('es-MX')}</span>
          </div>
        </div>
      </div>

      {/* TABLA HISTÓRICA MES A MES */}
      <div className="card border p-6 rounded-xl bg-white shadow-sm mb-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">Historial de Ventas e Impacto de ROI</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-100 text-xs text-gray-700 uppercase border-b">
              <tr>
                <th className="p-3">Período</th>
                <th className="p-3">Ventas Reales</th>
                <th className="p-3">Baseline Base</th>
                <th className="p-3">Comisión Pagada / Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {roiData.history.map((h, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="p-3 font-semibold">{h.period}</td>
                  <td className="p-3">${h.actual.toLocaleString('es-MX')}</td>
                  <td className="p-3">${h.baseline.toLocaleString('es-MX')}</td>
                  <td className="p-3 font-semibold text-green-600">${h.commission.toLocaleString('es-MX')}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold text-gray-800 border-t-2">
                <td className="p-3">Acumulado Histórico</td>
                <td className="p-3">
                  ${roiData.history.reduce((sum, h) => sum + h.actual, 0).toLocaleString('es-MX')}
                </td>
                <td className="p-3">-</td>
                <td className="p-3 text-green-600">${totalCommission.toLocaleString('es-MX')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
