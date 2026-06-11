'use client'

import { useState } from 'react'
import { Workflow, toggleWorkflowStatus, createWorkflowRecord } from '@/app/actions/workflows'
import { Zap, Play, Check, X, ShieldAlert, Plus, ToggleLeft, ToggleRight, Trash2, Cpu } from 'lucide-react'

interface WorkflowsClientProps {
  initialWorkflows: Workflow[]
}

export default function WorkflowsClient({ initialWorkflows }: WorkflowsClientProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState('')
  const [actions, setActions] = useState<Array<{ tipo: string; message: string }>>([
    { tipo: 'email', message: '' }
  ])

  // Simulated Logs
  const [activityLogs, setActivityLogs] = useState<Array<{
    timestamp: string
    workflowName: string
    action: string
    status: 'success' | 'running'
  }>>([
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
      workflowName: 'Bienvenida y Onboarding',
      action: 'Enviar correo "welcome_onboarding" a nuevo cliente.',
      status: 'success'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
      workflowName: 'Reporte ROI Mensual',
      action: 'Generar reporte PDF y enviar correo de cierre a Director.',
      status: 'success'
    }
  ])

  const handleToggle = async (id: string, currentStatus: 'active' | 'inactive') => {
    const res = await toggleWorkflowStatus(id, currentStatus)
    if (res.success) {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: nextStatus } : w))
      
      const wfName = workflows.find(w => w.id === id)?.name || 'Workflow'
      setActivityLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          workflowName: wfName,
          action: `Estado del workflow cambiado a: ${nextStatus.toUpperCase()}`,
          status: 'success'
        },
        ...prev
      ])
    }
  }

  const handleAddAction = () => {
    setActions(prev => [...prev, { tipo: 'email', message: '' }])
  }

  const handleRemoveAction = (idx: number) => {
    setActions(prev => prev.filter((_, i) => i !== idx))
  }

  const handleActionChange = (idx: number, field: 'tipo' | 'message', val: string) => {
    setActions(prev => prev.map((act, i) => i === idx ? { ...act, [field]: val } : act))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !trigger) {
      setErrorMsg('El nombre y el desencadenador (trigger) son obligatorios.')
      return
    }
    setErrorMsg('')
    setSuccessMsg('')

    const res = await createWorkflowRecord({ name, trigger, actions })
    if (res.success && res.wf) {
      setSuccessMsg('¡Workflow creado y activado!')
      setWorkflows(prev => [res.wf as Workflow, ...prev])
      
      setActivityLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          workflowName: name,
          action: 'Nuevo workflow registrado y en escucha de eventos.',
          status: 'success'
        },
        ...prev
      ])

      setTimeout(() => {
        setIsModalOpen(false)
        setName('')
        setTrigger('')
        setActions([{ tipo: 'email', message: '' }])
        setSuccessMsg('')
      }, 1500)
    } else {
      setErrorMsg(res.error || 'Ocurrió un error al guardar el workflow.')
    }
  }

  const triggerManualExecution = (wfName: string, actionsList: any[]) => {
    // Simulate immediate run
    setActivityLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        workflowName: wfName,
        action: `Gatillado manual: Ejecutando ${actionsList.length} acciones...`,
        status: 'running'
      },
      ...actionsList.map((act, idx) => ({
        timestamp: new Date(Date.now() + (idx + 1) * 500).toLocaleTimeString(),
        workflowName: wfName,
        action: `[Acción ${idx+1}/${actionsList.length}] ${act.tipo.toUpperCase()}: ${act.message || act.template || 'Ejecutando'}`,
        status: 'success' as const
      })),
      ...prev
    ])
  }

  return (
    <div className="grid-60-40 gap-6">
      {/* BANDEJA DE WORKFLOWS */}
      <div className="flex flex-col gap-6">
        <div className="card">
          <div className="card-header border-b pb-3 mb-4 flex justify-between items-center">
            <h2 className="card-title text-base font-bold text-gray-800 flex items-center gap-2">
              <Zap size={18} className="text-blue-500" />
              Workflows Activos ({workflows.length})
            </h2>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
              <Plus size={14} />
              <span>Crear Workflow</span>
            </button>
          </div>

          <div className="card-body flex flex-col gap-4">
            {workflows.map((wf) => (
              <div 
                key={wf.id} 
                className={`p-4 rounded-xl border flex flex-col gap-3 bg-white hover:shadow-sm transition ${
                  wf.status === 'active' ? 'border-blue-100' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{wf.name}</h3>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                      Trigger: {wf.trigger}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleToggle(wf.id, wf.status)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    {wf.status === 'active' ? (
                      <ToggleRight size={28} className="text-blue-600" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-300" />
                    )}
                  </button>
                </div>

                <div className="border-t pt-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pasos de ejecución:</span>
                  {wf.actions.map((act, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="font-bold uppercase text-[10px] text-gray-500">{act.tipo}:</span>
                      <span>{act.message || act.template || 'Acción automática'}</span>
                    </div>
                  ))}
                </div>

                {wf.status === 'active' && (
                  <div className="flex justify-end border-t pt-2">
                    <button 
                      onClick={() => triggerManualExecution(wf.name, wf.actions)}
                      className="btn btn-secondary btn-sm text-[10px] py-1 px-2.5 flex items-center gap-1 border-blue-200 text-blue-700 bg-blue-50/50"
                    >
                      <Play size={10} />
                      <span>Ejecutar Ahora</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COGNITIVE ACTIVITY TERMINAL */}
      <div className="flex flex-col gap-6">
        <div className="card border bg-slate-900 rounded-xl overflow-hidden shadow-lg" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <div className="bg-slate-800 p-3 flex items-center gap-2 text-white border-b border-slate-700">
            <Cpu size={16} className="text-blue-400" />
            <span className="text-xs font-bold font-mono text-gray-200">Terminal de Automatizaciones (Logs de IA/Workflows)</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] flex flex-col gap-3 text-blue-400">
            {activityLogs.map((log, i) => (
              <div key={i} className="border-b border-slate-800 pb-2 flex flex-col gap-1">
                <div className="flex justify-between text-gray-400 text-[10px]">
                  <span>Módulo: {log.workflowName}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="text-gray-100 font-semibold">{log.action}</div>
                <div className="text-[9px] text-right">
                  <span className={log.status === 'success' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}>
                    Status: {log.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL CREAR WORKFLOW */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-[#1C3F6E] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-base">Crear Automatización (Workflow)</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-xs flex gap-1 items-center">
                  <ShieldAlert size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded text-xs flex gap-1 items-center">
                  <Check size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Nombre de la Automatización</label>
                <input 
                  type="text" 
                  className="border rounded p-2 text-xs" 
                  placeholder="Ej. B2C: Recuperación de Carritos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Desencadenador (Trigger)</label>
                <input 
                  type="text" 
                  className="border rounded p-2 text-xs" 
                  placeholder="Ej. cart_abandoned OR order_completed"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 border-t pt-3 mt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-600">Acciones de Ejecución</label>
                  <button 
                    type="button" 
                    onClick={handleAddAction}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Agregar Acción
                  </button>
                </div>

                {actions.map((act, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border rounded-lg flex flex-col gap-2 relative">
                    {actions.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveAction(idx)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Tipo de Acción</label>
                      <select
                        className="border rounded p-1.5 text-xs bg-white"
                        value={act.tipo}
                        onChange={(e) => handleActionChange(idx, 'tipo', e.target.value)}
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="task">Tarea del Consultor</option>
                        <option value="tag">Etiquetar Cliente</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Mensaje / Parámetro</label>
                      <input 
                        type="text"
                        className="border rounded p-1.5 text-xs bg-white"
                        placeholder="Ej. Enviar correo de bienvenida o Mensaje de alerta"
                        value={act.message}
                        onChange={(e) => handleActionChange(idx, 'message', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary justify-center mt-3 py-2.5 font-bold text-xs">
                Guardar y Activar Automatización
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
