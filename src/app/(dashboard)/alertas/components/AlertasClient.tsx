'use client'

import { useState } from 'react'
import { Alert, resolveAlertAction, triggerMockAlert } from '@/app/actions/alerts'
import { Bell, Check, AlertTriangle, ShieldAlert, Send, Settings, Smartphone, MessageSquare } from 'lucide-react'

interface AlertasClientProps {
  initialAlerts: Alert[]
}

export default function AlertasClient({ initialAlerts }: AlertasClientProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [whatsappLogs, setWhatsappLogs] = useState<Array<{
    timestamp: string
    to: string
    template: string
    status: 'delivered' | 'read'
    message: string
  }>>([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString(),
      to: '+52 55 1234 5678',
      template: 'sales_drop_alert',
      status: 'read',
      message: '[Aginnova] Alerta: Se detectó una caída del 25% en las ventas de NALUA hoy vs el baseline.'
    }
  ])

  const [thresholds, setThresholds] = useState({
    salesDropPct: 20,
    lowStockQty: 15,
    expiryDays: 14,
    whatsappRecipient: '+52 55 1234 5678'
  })

  const [settingsMsg, setSettingsMsg] = useState(false)

  const activeAlerts = alerts.filter(a => !a.resolved)
  const resolvedAlerts = alerts.filter(a => a.resolved)

  const handleResolve = async (id: string) => {
    const res = await resolveAlertAction(id)
    if (res.success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a))
      
      // Log resolve in WhatsApp simulator
      const resolvedAlert = alerts.find(a => a.id === id)
      if (resolvedAlert) {
        setWhatsappLogs(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            to: thresholds.whatsappRecipient,
            template: 'alert_resolved',
            status: 'delivered',
            message: `[Aginnova] Alerta Resuelta: "${resolvedAlert.message}" ha sido marcada como resuelta.`
          },
          ...prev
        ])
      }
    }
  }

  const handleSimulateAlert = async (type: 'SALES_DROP' | 'INVENTORY_LOW' | 'EXPIRY_WARNING') => {
    let message = ''
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'

    if (type === 'SALES_DROP') {
      message = `Caída repentina del ${thresholds.salesDropPct}% en ventas de canal Web hoy.`
      severity = 'critical'
    } else if (type === 'INVENTORY_LOW') {
      message = `El stock de SKU SK-NALUA-01 está por debajo del límite (${thresholds.lowStockQty} unidades).`
      severity = 'high'
    } else if (type === 'EXPIRY_WARNING') {
      message = `Lote de mercancía caducará en menos de ${thresholds.expiryDays} días.`
      severity = 'medium'
    }

    const res = await triggerMockAlert(type, severity, message)
    if (res.success && res.alert) {
      setAlerts(prev => [res.alert as Alert, ...prev])

      // Push logs to WhatsApp Simulator
      setWhatsappLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          to: thresholds.whatsappRecipient,
          template: type.toLowerCase(),
          status: 'delivered',
          message: `[Aginnova] ALERTA (${severity.toUpperCase()}): ${message}`
        },
        ...prev
      ])
    }
  }

  const saveThresholds = (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsMsg(true)
    setTimeout(() => setSettingsMsg(false), 3000)
  }

  return (
    <div className="grid-60-40 gap-6">
      {/* BANDEJA DE ALERTAS */}
      <div className="flex flex-col gap-6">
        {/* Activas */}
        <div className="card">
          <div className="card-header border-b pb-3 mb-4 flex justify-between items-center">
            <h2 className="card-title text-base font-bold text-gray-800 flex items-center gap-2">
              <Bell size={18} className="text-red-500" />
              Alertas Activas ({activeAlerts.length})
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSimulateAlert('SALES_DROP')}
                className="btn btn-secondary btn-sm text-[10px] bg-red-50 border-red-200 text-red-700 font-bold"
              >
                + Caída Ventas
              </button>
              <button 
                onClick={() => handleSimulateAlert('INVENTORY_LOW')}
                className="btn btn-secondary btn-sm text-[10px] bg-orange-50 border-orange-200 text-orange-700 font-bold"
              >
                + Stock Bajo
              </button>
            </div>
          </div>

          <div className="card-body flex flex-col gap-3">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex gap-3 items-start pr-4">
                    <div className="mt-1 shrink-0">
                      {alert.severity === 'critical' ? <ShieldAlert className="text-red-600" size={18} /> : 
                       <AlertTriangle className="text-yellow-600" size={18} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {alert.tenantName} · {alert.type}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{alert.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Emitido: {new Date(alert.created_at).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(alert.id)}
                    className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold flex items-center gap-1 shrink-0"
                  >
                    <Check size={14} className="text-green-600" />
                    <span>Resolver</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-12">No hay alertas activas en este momento.</div>
            )}
          </div>
        </div>

        {/* Resueltas */}
        <div className="card">
          <div className="card-header border-b pb-3 mb-4">
            <h2 className="card-title text-base font-bold text-gray-700">Historial de Alertas Resueltas</h2>
          </div>
          <div className="card-body flex flex-col gap-3 max-h-64 overflow-y-auto">
            {resolvedAlerts.length > 0 ? (
              resolvedAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border bg-gray-50/50 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-500 uppercase">{alert.tenantName} · {alert.type}</span>
                    <p className="text-gray-600 font-medium mt-0.5">{alert.message}</p>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Resuelta: {new Date(alert.resolved_at!).toLocaleString('es-MX')}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 font-bold rounded">Resuelta</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 text-center py-8">Historial de alertas vacío.</div>
            )}
          </div>
        </div>
      </div>

      {/* WHATSAPP LOGS & UMBRALES */}
      <div className="flex flex-col gap-6">
        {/* WhatsApp Terminal */}
        <div className="card border bg-slate-900 rounded-xl overflow-hidden shadow-lg" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div className="bg-slate-800 p-3 flex items-center gap-2 text-white border-b border-slate-700">
            <Smartphone size={16} className="text-green-400" />
            <span className="text-xs font-bold font-mono text-gray-200">Consola de Notificaciones WhatsApp (Simulado)</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] flex flex-col gap-3 text-green-400">
            {whatsappLogs.map((log, i) => (
              <div key={i} className="border-b border-slate-800 pb-2 flex flex-col gap-1">
                <div className="flex justify-between text-gray-400 text-[10px]">
                  <span>Destino: {log.to}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-[10px] text-blue-400">Template: {log.template}</div>
                <div className="text-gray-100 font-semibold">{log.message}</div>
                <div className="text-[9px] text-right text-gray-500">Status: {log.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuración Umbrales */}
        <div className="card">
          <div className="card-header border-b pb-3 mb-4">
            <h2 className="card-title text-base font-bold text-gray-800 flex items-center gap-2">
              <Settings size={18} className="text-[#4A7BB5]" />
              Umbrales de Notificación
            </h2>
          </div>
          <form onSubmit={saveThresholds} className="card-body flex flex-col gap-3 text-sm">
            {settingsMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded text-xs">
                ¡Umbrales actualizados correctamente!
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Caída de Ventas (%)</label>
              <input 
                type="number" 
                className="border rounded p-2 text-xs" 
                value={thresholds.salesDropPct}
                onChange={(e) => setThresholds({ ...thresholds, salesDropPct: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Límite Stock Bajo (Unidades)</label>
              <input 
                type="number" 
                className="border rounded p-2 text-xs" 
                value={thresholds.lowStockQty}
                onChange={(e) => setThresholds({ ...thresholds, lowStockQty: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Alerta Expiración Lotes (Días antes)</label>
              <input 
                type="number" 
                className="border rounded p-2 text-xs" 
                value={thresholds.expiryDays}
                onChange={(e) => setThresholds({ ...thresholds, expiryDays: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Número de WhatsApp del Consultor</label>
              <input 
                type="text" 
                className="border rounded p-2 text-xs" 
                value={thresholds.whatsappRecipient}
                onChange={(e) => setThresholds({ ...thresholds, whatsappRecipient: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm justify-center w-full mt-2 font-bold">
              Guardar Configuración
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
