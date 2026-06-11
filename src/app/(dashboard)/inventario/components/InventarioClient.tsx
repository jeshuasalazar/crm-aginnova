'use client'

import { useState } from 'react'
import { SKU, Batch, Supplier, createSKURecord, createBatchRecord } from '@/app/actions/inventory'
import { Plus, Boxes, Package, Calendar, AlertTriangle, ShieldAlert, Award, FileText, X } from 'lucide-react'

interface InventarioClientProps {
  initialData: {
    skus: SKU[]
    batches: Batch[]
    suppliers: Supplier[]
    pareto: Array<{ sku: string; name: string; share: number }>
  }
}

export default function InventarioClient({ initialData }: InventarioClientProps) {
  const [activeTab, setActiveTab] = useState<'skus' | 'lotes' | 'proveedores' | 'pareto'>('skus')
  const [skus, setSkus] = useState<SKU[]>(initialData.skus)
  const [batches, setBatches] = useState<Batch[]>(initialData.batches)
  const [suppliers] = useState<Supplier[]>(initialData.suppliers)
  const [pareto] = useState(initialData.pareto)

  // Modals state
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false)
  const [isLoteModalOpen, setIsLoteModalOpen] = useState(false)

  // Forms state
  const [newSku, setNewSku] = useState({
    sku: '',
    name: '',
    category: 'General',
    unit_cost: 0,
    unit_price: 0,
    reorder_point: 10,
    supplier_id: ''
  })
  const [newLote, setNewLote] = useState({
    sku_id: '',
    quantity: 0,
    expiry_date: ''
  })

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleCreateSku = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSku.sku || !newSku.name) return
    setMsg(null)

    const res = await createSKURecord(newSku)
    if (res.success && res.sku) {
      setMsg({ type: 'success', text: `SKU ${newSku.sku} creado con éxito.` })
      const selectedSupName = suppliers.find(s => s.id === newSku.supplier_id)?.name || 'Sin Proveedor'
      setSkus(prev => [...prev, {
        id: res.sku.id,
        sku: newSku.sku.toUpperCase(),
        name: newSku.name,
        category: newSku.category,
        unit_cost: newSku.unit_cost,
        unit_price: newSku.unit_price,
        reorder_point: newSku.reorder_point,
        supplier_id: newSku.supplier_id || undefined,
        margin_percent: newSku.unit_price > 0 ? ((newSku.unit_price - newSku.unit_cost) / newSku.unit_price) * 100 : 0,
        supplier_name: selectedSupName
      }])
      setNewSku({ sku: '', name: '', category: 'General', unit_cost: 0, unit_price: 0, reorder_point: 10, supplier_id: '' })
      setTimeout(() => { setIsSkuModalOpen(false); setMsg(null) }, 1500)
    } else {
      setMsg({ type: 'error', text: res.error || 'Error al guardar SKU.' })
    }
  }

  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLote.sku_id || newLote.quantity <= 0) return
    setMsg(null)

    const res = await createBatchRecord(newLote)
    if (res.success && res.batch) {
      setMsg({ type: 'success', text: 'Lote registrado con éxito.' })
      const selectedSku = skus.find(s => s.id === newLote.sku_id)
      
      setBatches(prev => [{
        id: res.batch.id,
        sku_id: newLote.sku_id,
        quantity: newLote.quantity,
        received_at: new Date().toISOString().split('T')[0],
        expiry_date: newLote.expiry_date || undefined,
        status: 'active',
        dias_hasta_caducidad: newLote.expiry_date ? Math.ceil((new Date(newLote.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined,
        alert_60_pct: false,
        sku_name: selectedSku?.name || '',
        sku: selectedSku?.sku || ''
      }, ...prev])

      setNewLote({ sku_id: '', quantity: 0, expiry_date: '' })
      setTimeout(() => { setIsLoteModalOpen(false); setMsg(null) }, 1500)
    } else {
      setMsg({ type: 'error', text: res.error || 'Error al guardar lote.' })
    }
  }

  // Calculate overall stock per SKU
  const getStockForSku = (skuId: string) => {
    return batches
      .filter(b => b.sku_id === skuId && b.status === 'active')
      .reduce((sum, b) => sum + b.quantity, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* TABS HEADER */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button 
            className={`px-4 py-2 text-xs font-bold rounded-md ${activeTab === 'skus' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveTab('skus')}
          >
            Catálogo SKUs
          </button>
          <button 
            className={`px-4 py-2 text-xs font-bold rounded-md ${activeTab === 'lotes' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveTab('lotes')}
          >
            Lotes y Caducidades
          </button>
          <button 
            className={`px-4 py-2 text-xs font-bold rounded-md ${activeTab === 'proveedores' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveTab('proveedores')}
          >
            Proveedores
          </button>
          <button 
            className={`px-4 py-2 text-xs font-bold rounded-md ${activeTab === 'pareto' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pareto')}
          >
            Pareto 80/20
          </button>
        </div>

        <div className="flex gap-2">
          {activeTab === 'skus' && (
            <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={() => setIsSkuModalOpen(true)}>
              <Plus size={14} />
              <span>Nuevo SKU</span>
            </button>
          )}
          {activeTab === 'lotes' && (
            <button className="btn btn-primary btn-sm flex items-center gap-1.5" onClick={() => setIsLoteModalOpen(true)}>
              <Plus size={14} />
              <span>Recibir Lote</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: SKU CATALOGUE */}
      {activeTab === 'skus' && (
        <div className="card border rounded-xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Costo</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Margen</th>
                <th className="p-3">Stock Disponible</th>
                <th className="p-3">Reorden</th>
                <th className="p-3">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => {
                const stock = getStockForSku(sku.id)
                const isUnderStock = stock <= sku.reorder_point
                return (
                  <tr key={sku.id} className="border-b hover:bg-gray-50 text-gray-700">
                    <td className="p-3 font-mono font-bold text-[#1C3F6E]">{sku.sku}</td>
                    <td className="p-3 font-semibold">{sku.name}</td>
                    <td className="p-3 text-xs">{sku.category}</td>
                    <td className="p-3">${sku.unit_cost.toFixed(2)}</td>
                    <td className="p-3">${sku.unit_price.toFixed(2)}</td>
                    <td className="p-3 font-semibold text-green-600">{sku.margin_percent.toFixed(1)}%</td>
                    <td className={`p-3 font-bold ${isUnderStock ? 'text-red-500 bg-red-50/50' : 'text-gray-700'}`}>
                      {stock} unidades {isUnderStock && '⚠️'}
                    </td>
                    <td className="p-3 text-gray-400">{sku.reorder_point}</td>
                    <td className="p-3 text-xs">{sku.supplier_name}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: BATCHES & EXPIRY */}
      {activeTab === 'lotes' && (
        <div className="card border rounded-xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Recibido</th>
                <th className="p-3">Fecha Caducidad</th>
                <th className="p-3">Estado Lote</th>
                <th className="p-3">Días Restantes</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => {
                const isExpired = batch.dias_hasta_caducidad !== undefined && batch.dias_hasta_caducidad <= 0
                const isSoonExpiring = batch.dias_hasta_caducidad !== undefined && batch.dias_hasta_caducidad <= 14 && batch.dias_hasta_caducidad > 0
                return (
                  <tr key={batch.id} className="border-b hover:bg-gray-50 text-gray-700">
                    <td className="p-3 font-mono font-bold">{batch.sku}</td>
                    <td className="p-3 font-semibold">{batch.sku_name}</td>
                    <td className="p-3 font-bold">{batch.quantity}</td>
                    <td className="p-3 text-xs">{new Date(batch.received_at).toLocaleDateString('es-MX')}</td>
                    <td className="p-3 text-xs">
                      {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('es-MX') : 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        isExpired ? 'bg-red-100 text-red-800' :
                        isSoonExpiring ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {isExpired ? 'EXPIRADO' : isSoonExpiring ? 'LIQUIDACIÓN' : 'ACTIVO'}
                      </span>
                    </td>
                    <td className={`p-3 font-bold ${
                      isExpired ? 'text-red-600' :
                      isSoonExpiring ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {batch.dias_hasta_caducidad !== undefined ? `${batch.dias_hasta_caducidad} días` : 'Ilimitado'}
                      {batch.alert_60_pct && !isExpired && <span className="text-[10px] block font-normal text-orange-400">Vida útil al 60%+</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUPPLIERS */}
      {activeTab === 'proveedores' && (
        <div className="card border rounded-xl bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
              <tr>
                <th className="p-3">Nombre Proveedor</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Lead Time Promedio</th>
                <th className="p-3">Score Confiabilidad</th>
                <th className="p-3">Último Pedido</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id} className="border-b hover:bg-gray-50 text-gray-700">
                  <td className="p-3 font-bold">{sup.name}</td>
                  <td className="p-3 text-xs">{sup.contact || 'Sin datos'}</td>
                  <td className="p-3">{sup.lead_time_days} días</td>
                  <td className="p-3 font-semibold text-blue-600">{Math.round(sup.reliability_score * 100)}%</td>
                  <td className="p-3 text-xs">
                    {sup.last_order_date ? new Date(sup.last_order_date).toLocaleDateString('es-MX') : 'Sin pedidos'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PARETO 80/20 & SUGESTIONES */}
      {activeTab === 'pareto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pareto Card */}
          <div className="card border p-6 rounded-xl bg-white shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-1">
              <Award size={18} className="text-yellow-500" />
              Regla 80/20: SKUs Estratégicos
            </h3>
            <p className="text-xs text-gray-400 mb-4">Productos prioritarios que representan el 80% del valor total de inventario/ventas estimadas.</p>
            <div className="flex flex-col gap-3">
              {pareto.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <span className="font-mono font-bold text-gray-600 mr-2">{item.sku}</span>
                    <span className="text-gray-800 font-semibold">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-green-600">Representa: {item.share.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sugerencias Reposición */}
          <div className="card border p-6 rounded-xl bg-white shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <FileText size={18} className="text-blue-500" />
              Reposición Automatizada de Stock
            </h3>
            <p className="text-xs text-gray-400 mb-4">Sugerencias inteligentes basadas en el pronóstico de demanda de 4 semanas y puntos de reorden.</p>
            
            <div className="flex flex-col gap-4">
              {skus.filter(s => getStockForSku(s.id) <= s.reorder_point).map((sku) => {
                const currentStock = getStockForSku(sku.id)
                const suggestQty = sku.reorder_point * 3
                return (
                  <div key={sku.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-red-800 text-xs font-mono">{sku.sku}</span>
                      <span className="text-xs font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-100">STOCK CRÍTICO: {currentStock} un.</span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold">{sku.name}</p>
                    <div className="text-xs text-gray-500 border-t pt-2 mt-1">
                      <strong>Recomendación:</strong> Ordenar <span className="font-bold text-blue-700">{suggestQty} unidades</span> con {sku.supplier_name}.
                    </div>
                  </div>
                )
              })}
              {skus.filter(s => getStockForSku(s.id) <= s.reorder_point).length === 0 && (
                <div className="text-sm text-gray-500 text-center py-12">No hay alertas de reposición activa. Todos los SKUs tienen stock saludable.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR SKU */}
      {isSkuModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-[#1C3F6E] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-base">Registrar Nuevo SKU en Catálogo</h3>
              <button onClick={() => setIsSkuModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSku} className="p-6 flex flex-col gap-3">
              {msg && (
                <div className={`p-2 rounded text-xs ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {msg.text}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Código SKU</label>
                <input 
                  type="text" 
                  className="border rounded p-2 text-xs" 
                  placeholder="Ej. SK-NALUA-04"
                  value={newSku.sku}
                  onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Nombre de Producto</label>
                <input 
                  type="text" 
                  className="border rounded p-2 text-xs" 
                  placeholder="Ej. Pantalón de Lino Cargo"
                  value={newSku.name}
                  onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Categoría</label>
                <input 
                  type="text" 
                  className="border rounded p-2 text-xs" 
                  value={newSku.category}
                  onChange={(e) => setNewSku({ ...newSku, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Costo Unitario ($)</label>
                  <input 
                    type="number" 
                    className="border rounded p-2 text-xs" 
                    value={newSku.unit_cost}
                    onChange={(e) => setNewSku({ ...newSku, unit_cost: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Precio Unitario ($)</label>
                  <input 
                    type="number" 
                    className="border rounded p-2 text-xs" 
                    value={newSku.unit_price}
                    onChange={(e) => setNewSku({ ...newSku, unit_price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Punto Reorden (un.)</label>
                  <input 
                    type="number" 
                    className="border rounded p-2 text-xs" 
                    value={newSku.reorder_point}
                    onChange={(e) => setNewSku({ ...newSku, reorder_point: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600">Proveedor</label>
                  <select
                    className="border rounded p-2 text-xs"
                    value={newSku.supplier_id}
                    onChange={(e) => setNewSku({ ...newSku, supplier_id: e.target.value })}
                  >
                    <option value="">Selecciona Proveedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary justify-center mt-3 py-2 font-bold text-xs">
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR LOTE */}
      {isLoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-[#1C3F6E] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-base">Ingresar Lote de Mercancía Recibida</h3>
              <button onClick={() => setIsLoteModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateLote} className="p-6 flex flex-col gap-3">
              {msg && (
                <div className={`p-2 rounded text-xs ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {msg.text}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Seleccionar SKU</label>
                <select
                  className="border rounded p-2 text-xs"
                  value={newLote.sku_id}
                  onChange={(e) => setNewLote({ ...newLote, sku_id: e.target.value })}
                >
                  <option value="">Elige un Producto</option>
                  {skus.map(s => <option key={s.id} value={s.id}>{s.sku} - {s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Cantidad Recibida (unidades)</label>
                <input 
                  type="number" 
                  className="border rounded p-2 text-xs" 
                  value={newLote.quantity}
                  onChange={(e) => setNewLote({ ...newLote, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">Fecha de Expiración (Opcional)</label>
                <input 
                  type="date" 
                  className="border rounded p-2 text-xs" 
                  value={newLote.expiry_date}
                  onChange={(e) => setNewLote({ ...newLote, expiry_date: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary justify-center mt-3 py-2 font-bold text-xs">
                Guardar Entrada de Lote
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
