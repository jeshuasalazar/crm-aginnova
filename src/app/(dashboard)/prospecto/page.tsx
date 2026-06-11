'use client'

import { useState } from 'react'
import { Play, RotateCcw, Smartphone, Cpu, Box, Truck, Check } from 'lucide-react'

export default function ProspectoDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<'NALUA' | 'KAWDOBA'>('NALUA')
  const [logs, setLogs] = useState<Array<{
    time: string
    type: 'info' | 'success' | 'warn' | 'system'
    msg: string
  }>>([
    {
      time: new Date().toLocaleTimeString(),
      type: 'system',
      msg: 'Entorno de Demostración Inicializado. Listo para simulaciones.'
    }
  ])

  const [simState, setSimState] = useState({
    activeUsers: 45,
    todaySales: 12400,
    activeShipments: 8,
    activeAlerts: 1
  })

  const logMsg = (msg: string, type: 'info' | 'success' | 'warn' | 'system' = 'info') => {
    setLogs(prev => [
      {
        time: new Date().toLocaleTimeString(),
        type,
        msg
      },
      ...prev
    ])
  }

  const runSimulation = (action: string) => {
    if (action === 'SALE_ECOMMERCE') {
      logMsg(`[E-Commerce] Nueva compra detectada en canal Web (Sofía Rodríguez - $1,450.00 MXN)`, 'info')
      setSimState(prev => ({ ...prev, todaySales: prev.todaySales + 1450 }))
      
      setTimeout(() => {
        logMsg(`[Logística] Solicitando cotizaciones en Skydropx para CP 06600 (CDMX)...`, 'system')
      }, 800)

      setTimeout(() => {
        logMsg(`[Skydropx] Tarifas obtenidas: FedEx ($120.00, 2 días) | DHL ($145.00, 1 día) | Estafeta ($98.00, 5 días).`, 'info')
      }, 1600)

      setTimeout(() => {
        logMsg(`[Automatización] Seleccionando FedEx automáticamente (Algoritmo menor costo/SLA).`, 'success')
      }, 2400)

      setTimeout(() => {
        logMsg(`[Skydropx] Guía emitida con éxito. Tracking: SKDX-992834-MX. Estado de orden: SHIPPED.`, 'success')
        setSimState(prev => ({ ...prev, activeShipments: prev.activeShipments + 1 }))
      }, 3200)

      setTimeout(() => {
        logMsg(`[WhatsApp] Notificación enviada a cliente: "Tu pedido de NALUA está en camino. Rastreo: SKDX-992834-MX"`, 'success')
      }, 4000)

    } else if (action === 'LOW_STOCK') {
      logMsg(`[Inventario] Sensor de stock activado: Camisa Algodón Orgánico cayó a 12 unidades (Punto de reorden: 20)`, 'warn')
      setSimState(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }))

      setTimeout(() => {
        logMsg(`[Alertas] Alerta INVENTORY_LOW registrada en base de datos. Gravedad: ALTA.`, 'system')
      }, 800)

      setTimeout(() => {
        logMsg(`[WhatsApp] Mensaje enviado al consultor: "Alerta: Stock crítico detectado en NALUA para Camisa Algodón."`, 'success')
      }, 1600)

      setTimeout(() => {
        logMsg(`[Motor IA] Generando recomendación de reposición automática...`, 'system')
      }, 2400)

      setTimeout(() => {
        logMsg(`[Motor IA] Recomendación emitida: "Ordenar 50 unidades con Textiles del Sur para prevenir quiebre en 5 días."`, 'success')
      }, 3200)

    } else if (action === 'EXPIRY_ALERT') {
      logMsg(`[Inventario] Lote de mercancía (Resina Epóxica - 10 unidades) caduca en menos de 14 días (2026-06-25)`, 'warn')
      setSimState(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }))

      setTimeout(() => {
        logMsg(`[Automatización] Disparando workflow comercial: "EXPIRY_LIQUIDATION".`, 'system')
      }, 800)

      setTimeout(() => {
        logMsg(`[Campañas] Generando cupón 35% de descuento para liquidación de stock próximo a vencer.`, 'info')
      }, 1600)

      setTimeout(() => {
        logMsg(`[Email Engine] Correo masivo enviado a 8 distribuidores de KAWDOBA ofreciendo descuento de liquidación.`, 'success')
      }, 2400)
    }
  }

  const resetSimulation = () => {
    setLogs([
      {
        time: new Date().toLocaleTimeString(),
        type: 'system',
        msg: 'Entorno restablecido. Consola de simulación limpia.'
      }
    ])
    setSimState({
      activeUsers: selectedDemo === 'NALUA' ? 45 : 12,
      todaySales: selectedDemo === 'NALUA' ? 12400 : 85000,
      activeShipments: selectedDemo === 'NALUA' ? 8 : 3,
      activeAlerts: selectedDemo === 'NALUA' ? 1 : 2
    })
  }

  return (
    <div className="grid-60-40 gap-6">
      {/* SIMULADOR CONTROL PANEL */}
      <div className="flex flex-col gap-6">
        <div className="card">
          <div className="card-header border-b pb-3 mb-4 flex justify-between items-center">
            <h2 className="card-title text-base font-bold text-gray-800 flex items-center gap-2">
              <Cpu size={18} className="text-blue-600 animate-spin" />
              Consola del Demostrador
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => { setSelectedDemo('NALUA'); resetSimulation() }}
                className={`btn btn-sm text-[10px] font-bold ${selectedDemo === 'NALUA' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Demo B2C (NALUA)
              </button>
              <button 
                onClick={() => { setSelectedDemo('KAWDOBA'); resetSimulation() }}
                className={`btn btn-sm text-[10px] font-bold ${selectedDemo === 'KAWDOBA' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Demo B2B (KAWDOBA)
              </button>
            </div>
          </div>

          <div className="card-body flex flex-col gap-6">
            {/* KPI Cards de Demostración */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Ventas Simulación hoy</div>
                <div className="text-lg font-bold text-gray-800">${simState.todaySales.toLocaleString('es-MX')}</div>
              </div>
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Envíos Activos</div>
                <div className="text-lg font-bold text-gray-800">{simState.activeShipments}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Disparadores de Eventos de Demostración</h3>
              
              {selectedDemo === 'NALUA' ? (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => runSimulation('SALE_ECOMMERCE')}
                    className="btn btn-secondary text-sm flex items-center gap-2 border-blue-200 text-blue-700 bg-blue-50/50 py-2.5"
                  >
                    <Play size={14} />
                    <span>Simular Compra E-Commerce (Logística Skydropx Automática)</span>
                  </button>
                  <button 
                    onClick={() => runSimulation('LOW_STOCK')}
                    className="btn btn-secondary text-sm flex items-center gap-2 border-orange-200 text-orange-700 bg-orange-50/50 py-2.5"
                  >
                    <Play size={14} />
                    <span>Simular Stock Bajo (Disparador de Alerta & WhatsApp IA)</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => runSimulation('EXPIRY_ALERT')}
                    className="btn btn-secondary text-sm flex items-center gap-2 border-red-200 text-red-700 bg-red-50/50 py-2.5"
                  >
                    <Play size={14} />
                    <span>Simular Caducidad Lote (Disparador de Campaña Liquidación)</span>
                  </button>
                </div>
              )}

              <button 
                onClick={resetSimulation}
                className="btn btn-secondary text-xs flex items-center justify-center gap-1 mt-4 py-2 border-gray-200 text-gray-600"
              >
                <RotateCcw size={12} />
                <span>Restablecer Demostración</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EVENT STREAMS TERMINAL */}
      <div className="flex flex-col gap-6">
        <div className="card border bg-slate-900 rounded-xl overflow-hidden shadow-lg flex flex-col" style={{ height: '480px' }}>
          <div className="bg-slate-800 p-3 flex items-center gap-2 text-white border-b border-slate-700 justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-green-400" />
              <span className="text-xs font-bold font-mono text-gray-200">Terminal de Eventos y Trazabilidad CRM</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] flex flex-col gap-2 text-gray-200">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2 items-start leading-relaxed">
                <span className="text-gray-500 shrink-0 select-none">[{log.time}]</span>
                <span className={`font-semibold ${
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'warn' ? 'text-yellow-400 font-bold' :
                  log.type === 'system' ? 'text-blue-400' : 'text-gray-100'
                }`}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
