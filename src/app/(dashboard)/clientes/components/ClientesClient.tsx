'use client'

import { useState } from 'react'
import { Client, createClientRecord, updateClientStatus } from '@/app/actions/clients'
import { Plus, Search, HelpCircle, Check, X, ShieldAlert, Settings } from 'lucide-react'

interface ClientesClientProps {
  initialClients: Client[]
}

export default function ClientesClient({ initialClients }: ClientesClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado del Wizard
  const [step, setStep] = useState(1)
  const [newClient, setNewClient] = useState({
    name: '',
    sector: '',
    plan: 'growth' as 'startup' | 'growth' | 'enterprise',
    baseline_amount: 50000,
    target_amount: 75000,
    commission_without_improvement: 0,
    commission_on_target: 10,
    commission_double_target: 15,
    methodology_phase: 1,
    assigned_consultant: 'Claude Advisor',
    skydropx_key: 'skydropx_sandbox_token_here',
    status: 'active' as 'active' | 'inactive' | 'onboarding' | 'paused'
  })
  
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.sector.toLowerCase().includes(search.toLowerCase())
  )

  const handleNextStep = () => {
    if (step === 1 && !newClient.name) {
      setErrorMsg('El nombre de la empresa es obligatorio.')
      return
    }
    if (step === 2 && newClient.baseline_amount >= newClient.target_amount) {
      setErrorMsg('El valor de baseline debe ser menor a la meta del período.')
      return
    }
    setErrorMsg('')
    setStep(prev => Math.min(prev + 1, 8))
  }

  const handlePrevStep = () => {
    setErrorMsg('')
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const payload = {
      name: newClient.name,
      sector: newClient.sector,
      plan: newClient.plan,
      baseline_amount: newClient.baseline_amount,
      target_amount: newClient.target_amount,
      commission_tiers: {
        without_improvement: newClient.commission_without_improvement,
        on_target: newClient.commission_on_target,
        double_target: newClient.commission_double_target
      },
      status: newClient.status
    }

    const res = await createClientRecord(payload)
    if (res.success && res.tenant) {
      setSuccessMsg(`¡Cliente ${newClient.name} creado exitosamente!`)
      // Refresh list locally
      setClients(prev => [...prev, {
        id: res.tenant.id,
        name: newClient.name,
        sector: newClient.sector,
        plan: newClient.plan,
        status: newClient.status,
        created_at: new Date().toISOString(),
        baseline_amount: newClient.baseline_amount,
        target_amount: newClient.target_amount,
        commission_tiers: {
          without_improvement: newClient.commission_without_improvement,
          on_target: newClient.commission_on_target,
          double_target: newClient.commission_double_target
        },
        kpi_health: 'yellow'
      }])
      setTimeout(() => {
        setIsModalOpen(false)
        resetWizard()
      }, 2000)
    } else {
      setErrorMsg(res.error || 'Ocurrió un error al guardar el cliente.')
    }
  }

  const resetWizard = () => {
    setStep(1)
    setNewClient({
      name: '',
      sector: '',
      plan: 'growth',
      baseline_amount: 50000,
      target_amount: 75000,
      commission_without_improvement: 0,
      commission_on_target: 10,
      commission_double_target: 15,
      methodology_phase: 1,
      assigned_consultant: 'Claude Advisor',
      skydropx_key: 'skydropx_sandbox_token_here',
      status: 'active'
    })
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active'
    const res = await updateClientStatus(id, nextStatus)
    if (res.success) {
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center gap-4">
        <div className="header-search flex-1 max-w-md">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o sector..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => { resetWizard(); setIsModalOpen(true) }}>
          <Plus size={16} />
          <span>Registrar Cliente</span>
        </button>
      </div>

      <div className="portfolio-grid">
        {filteredClients.map((client) => (
          <div className="client-card" key={client.id}>
            <div className="client-card-header flex justify-between items-start">
              <div>
                <div className="client-name font-bold text-lg text-gray-800">{client.name}</div>
                <div className="client-sector text-xs text-gray-500">{client.sector} · Plan {client.plan.toUpperCase()}</div>
              </div>
              <div className="flex gap-2 items-center">
                <div className={`semaforo ${client.kpi_health || 'yellow'}`} title={`Salud: ${client.kpi_health}`}></div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  client.status === 'active' ? 'bg-green-100 text-green-800' : 
                  client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {client.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="client-kpis my-4 flex gap-4 text-sm border-t border-b border-gray-100 py-3">
              <div className="client-kpi flex-1">
                <div className="client-kpi-label text-xs text-gray-400">Baseline</div>
                <div className="client-kpi-val font-semibold text-gray-700">${client.baseline_amount?.toLocaleString('es-MX')}</div>
              </div>
              <div className="client-kpi flex-1">
                <div className="client-kpi-label text-xs text-gray-400">Meta</div>
                <div className="client-kpi-val font-semibold text-gray-700">${client.target_amount?.toLocaleString('es-MX')}</div>
              </div>
              <div className="client-kpi flex-1">
                <div className="client-kpi-label text-xs text-gray-400">Tasa Meta</div>
                <div className="client-kpi-val font-semibold text-gray-700">{client.commission_tiers?.on_target}%</div>
              </div>
            </div>

            <div className="client-card-actions flex gap-2">
              <button 
                onClick={() => handleStatusToggle(client.id, client.status)}
                className={`btn btn-sm flex-1 text-center justify-center border ${
                  client.status === 'active' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 'border-green-200 text-green-700 bg-green-50'
                }`}
              >
                {client.status === 'active' ? 'Pausar' : 'Reactivar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ONBOARDING WIZARD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh' }}>
            <div className="bg-[#1C3F6E] p-4 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-lg">Asistente de Onboarding Aginnova</h3>
                <p className="text-xs text-blue-200">Paso {step} de 8</p>
              </div>
              <button className="text-white/80 hover:text-white" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {/* Progreso Visual */}
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full ${i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex gap-2 items-center">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm flex gap-2 items-center">
                  <Check size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* PASO 1: INFORMACIÓN GENERAL */}
              {step === 1 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 1: Información General</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Nombre de la Empresa</label>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      placeholder="Ej. NALUA, KAWDOBA"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Sector Industrial</label>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      placeholder="Ej. Moda B2C, Metalúrgica B2B"
                      value={newClient.sector}
                      onChange={(e) => setNewClient({...newClient, sector: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Plan CRM</label>
                    <select 
                      className="border border-gray-300 rounded p-2 text-sm"
                      value={newClient.plan}
                      onChange={(e) => setNewClient({...newClient, plan: e.target.value as any})}
                    >
                      <option value="startup">Startup</option>
                      <option value="growth">Growth</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PASO 2: CONFIGURACIÓN FINANCIERA */}
              {step === 2 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 2: Baseline e Incrementales</h4>
                  <p className="text-xs text-gray-500">Define los ingresos base actuales y la meta de ventas sobre la cual se calcularán las comisiones.</p>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Ventas de Baseline (Base Mensual MXN)</label>
                    <input 
                      type="number" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.baseline_amount}
                      onChange={(e) => setNewClient({...newClient, baseline_amount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Meta del Período (Meta de Ventas MXN)</label>
                    <input 
                      type="number" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.target_amount}
                      onChange={(e) => setNewClient({...newClient, target_amount: Number(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              {/* PASO 3: COMISIONES */}
              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 3: Esquema de Comisiones Escalonadas</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Comisión por defecto (sin mejora - %)</label>
                    <input 
                      type="number" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.commission_without_improvement}
                      onChange={(e) => setNewClient({...newClient, commission_without_improvement: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Comisión al cumplir meta (%)</label>
                    <input 
                      type="number" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.commission_on_target}
                      onChange={(e) => setNewClient({...newClient, commission_on_target: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Comisión al doblar meta (%)</label>
                    <input 
                      type="number" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.commission_double_target}
                      onChange={(e) => setNewClient({...newClient, commission_double_target: Number(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              {/* PASO 4: METODOLOGÍA AGINNOVA */}
              {step === 4 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 4: Fase de Madurez Aginnova</h4>
                  <p className="text-xs text-gray-500">Mapea la madurez digital del cliente según nuestro pipeline estratégico de 5 fases.</p>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Fase Actual</label>
                    <select 
                      className="border border-gray-300 rounded p-2 text-sm"
                      value={newClient.methodology_phase}
                      onChange={(e) => setNewClient({...newClient, methodology_phase: Number(e.target.value)})}
                    >
                      <option value={1}>Fase 1: Onboarding y Diagnóstico Inicial</option>
                      <option value={2}>Fase 2: Estructuración y Conexión Operativa</option>
                      <option value={3}>Fase 3: Inteligencia de Datos y Dashboards</option>
                      <option value={4}>Fase 4: Automatizaciones Comerciales</option>
                      <option value={5}>Fase 5: Escalamiento e IA predictiva</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PASO 5: ASIGNACIÓN DE EQUIPO */}
              {step === 5 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 5: Consultor y Responsables</h4>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Consultor Principal Asignado</label>
                    <input 
                      type="text" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.assigned_consultant}
                      onChange={(e) => setNewClient({...newClient, assigned_consultant: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* PASO 6: INTEGRACIONES */}
              {step === 6 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 6: Conexión Logística (Skydropx API)</h4>
                  <p className="text-xs text-gray-500">Proporciona el token de acceso para cotizar envíos y emitir guías automatizadas.</p>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Skydropx API Token</label>
                    <input 
                      type="password" 
                      className="border border-gray-300 rounded p-2 text-sm" 
                      value={newClient.skydropx_key}
                      onChange={(e) => setNewClient({...newClient, skydropx_key: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* PASO 7: RESUMEN Y VALIDACIÓN */}
              {step === 7 && (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-gray-800">Paso 7: Resumen del Acuerdo Comercial</h4>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2 text-sm border border-gray-100">
                    <div><strong>Empresa:</strong> {newClient.name}</div>
                    <div><strong>Sector:</strong> {newClient.sector}</div>
                    <div><strong>Plan:</strong> {newClient.plan.toUpperCase()}</div>
                    <div><strong>Baseline de Ventas:</strong> ${newClient.baseline_amount.toLocaleString('es-MX')}</div>
                    <div><strong>Meta del Período:</strong> ${newClient.target_amount.toLocaleString('es-MX')}</div>
                    <div><strong>Esquema Comisión:</strong> {newClient.commission_without_improvement}% base / {newClient.commission_on_target}% en meta / {newClient.commission_double_target}% doble meta</div>
                    <div><strong>Consultor:</strong> {newClient.assigned_consultant}</div>
                  </div>
                </div>
              )}

              {/* PASO 8: CONFIRMACIÓN Y ALTA */}
              {step === 8 && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                    <Check size={36} />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800">¿Deseas dar de alta al cliente?</h4>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Al confirmar, se creará el tenant del cliente y se habilitarán los módulos operativos y de comisiones inmediatamente.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 flex justify-between border-t border-gray-100">
              {step > 1 && (
                <button className="btn btn-secondary text-sm" onClick={handlePrevStep} disabled={!!successMsg}>
                  Atrás
                </button>
              )}
              <div className="ml-auto flex gap-2">
                {step < 8 ? (
                  <button className="btn btn-primary text-sm" onClick={handleNextStep}>
                    Siguiente
                  </button>
                ) : (
                  <button className="btn btn-primary text-sm" onClick={handleSubmit} disabled={!!successMsg}>
                    Confirmar Alta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
