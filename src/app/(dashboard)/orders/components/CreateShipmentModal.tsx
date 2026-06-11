'use client'

import { useState } from 'react'
import { Order, createShipmentRecord, completeShipment } from '@/app/actions/orders'
import { quoteShipment, createLabel, SkydropxRate } from '@/app/actions/skydropx'
import { X, Loader, Truck, CheckCircle2, Download, Package } from 'lucide-react'

interface CreateShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order
  tenant: string
  onShipmentCompleted: (orderId: string) => void
}

const PACKAGE_PRESETS = [
  { name: 'Bolsa E-commerce / Sobre (Hasta 0.5kg)', weight: 0.5, length: 25, width: 18, height: 3, id: 'bag' },
  { name: 'Caja Calzado / Ropa Chica (Hasta 1.5kg)', weight: 1.5, length: 30, width: 20, height: 12, id: 'box_sm' },
  { name: 'Caja Mediana (Hasta 3.5kg)', weight: 3.5, length: 35, width: 28, height: 18, id: 'box_md' },
  { name: 'Caja Grande B2B (Hasta 8.0kg)', weight: 8.0, length: 45, width: 35, height: 28, id: 'box_lg' },
  { name: 'Personalizado', weight: 1.0, length: 15, width: 15, height: 15, id: 'custom' }
]

export default function CreateShipmentModal({
  isOpen,
  onClose,
  order,
  tenant,
  onShipmentCompleted
}: CreateShipmentModalProps) {
  const [step, setStep] = useState<'dims' | 'quoting' | 'rates' | 'success'>('dims')
  const [error, setError] = useState<string | null>(null)
  
  // Package selection
  const [selectedPreset, setSelectedPreset] = useState(PACKAGE_PRESETS[0])
  const [customDims, setCustomDims] = useState({
    weight: 1.0,
    length: 15,
    width: 15,
    height: 15
  })

  // API states
  const [rates, setRates] = useState<SkydropxRate[]>([])
  const [skydropxShipmentId, setSkydropxShipmentId] = useState('')
  const [selectedRate, setSelectedRate] = useState<SkydropxRate | null>(null)
  const [labelResult, setLabelResult] = useState<{
    trackingNumber: string
    labelUrl: string
    carrier: string
  } | null>(null)

  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleCustomDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDims({
      ...customDims,
      [e.target.name]: parseFloat(e.target.value) || 0
    })
  }

  const handleQuote = async () => {
    setLoading(true)
    setError(null)
    setStep('quoting')

    const parcel = selectedPreset.id === 'custom' 
      ? customDims 
      : {
          weight: selectedPreset.weight,
          length: selectedPreset.length,
          width: selectedPreset.width,
          height: selectedPreset.height
        }

    try {
      // 1. Quoting API call
      const recipientAddress = {
        name: order.customer_name,
        phone: order.customer_phone || '5500000000',
        ...order.shipping_address
      }
      const quoteRes = await quoteShipment(tenant, recipientAddress, parcel)
      setRates(quoteRes.rates.sort((a, b) => a.amount - b.amount))
      setSkydropxShipmentId(quoteRes.shipmentId)

      // 2. Save shipment record as rates_retrieved
      await createShipmentRecord({
        tenant_id: tenant,
        order_id: order.id,
        skydropx_shipment_id: quoteRes.shipmentId,
        status: 'rates_retrieved'
      })

      setStep('rates')
    } catch (err: any) {
      setError(err.message || 'Error al cotizar el envío.')
      setStep('dims')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLabel = async () => {
    if (!selectedRate) return
    setLoading(true)
    setError(null)

    try {
      // 1. Create label API call
      const labelRes = await createLabel(tenant, skydropxShipmentId, selectedRate.id)
      setLabelResult(labelRes)

      // 2. Update DB record to complete shipment and mark order as shipped
      await completeShipment(
        order.id,
        skydropxShipmentId,
        selectedRate.id,
        labelRes.trackingNumber,
        labelRes.labelUrl,
        labelRes.carrier
      )

      onShipmentCompleted(order.id)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Error al generar la etiqueta de envío.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-lg">
        {/* HEADER */}
        <div className="modal-header">
          <h3 className="modal-title flex items-center gap-2">
            <Truck size={18} />
            <span>Generar Envío (Skydropx)</span>
          </h3>
          <button onClick={onClose} disabled={loading} className="close-btn"><X size={18} /></button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs mb-4">
              {error}
            </div>
          )}

          {/* STEP 1: Dimensions Selection */}
          {step === 'dims' && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-gray-400">Destinatario</span>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{order.customer_name}</p>
                <p className="text-xs text-gray-500">
                  {order.shipping_address.street} {order.shipping_address.number}, {order.shipping_address.neighborhood}, {order.shipping_address.city}, {order.shipping_address.state}, CP {order.shipping_address.postal_code}
                </p>
              </div>

              <hr className="divider" />

              <div className="form-group">
                <label className="form-label">Tamaño del Paquete</label>
                <select 
                  className="form-select"
                  value={selectedPreset.id}
                  onChange={(e) => {
                    const preset = PACKAGE_PRESETS.find(p => p.id === e.target.value)
                    if (preset) setSelectedPreset(preset)
                  }}
                >
                  {PACKAGE_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPreset.id === 'custom' ? (
                <div className="grid grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="form-group">
                    <label className="form-label text-[11px]">Peso (KG)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      name="weight"
                      value={customDims.weight}
                      onChange={handleCustomDimChange}
                      className="form-input text-xs" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-[11px]">Largo (CM)</label>
                    <input 
                      type="number" 
                      name="length"
                      value={customDims.length}
                      onChange={handleCustomDimChange}
                      className="form-input text-xs" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-[11px]">Ancho (CM)</label>
                    <input 
                      type="number" 
                      name="width"
                      value={customDims.width}
                      onChange={handleCustomDimChange}
                      className="form-input text-xs" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-[11px]">Alto (CM)</label>
                    <input 
                      type="number" 
                      name="height"
                      value={customDims.height}
                      onChange={handleCustomDimChange}
                      className="form-input text-xs" 
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#4A7BB5]/5 text-xs text-[#2a5590] p-3 rounded-lg flex items-center gap-2.5 border border-[#4A7BB5]/10">
                  <Package size={16} />
                  <span>
                    Medidas predeterminadas: <strong>{selectedPreset.weight}kg</strong> de peso y <strong>{selectedPreset.length}x{selectedPreset.width}x{selectedPreset.height}cm</strong> de volumen.
                  </span>
                </div>
              )}

              <button 
                onClick={handleQuote}
                className="btn btn-primary w-full justify-center py-3 mt-2"
              >
                <span>Cotizar Envío</span>
              </button>
            </div>
          )}

          {/* STEP 2: Quoting Progress */}
          {step === 'quoting' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader size={36} className="animate-spin text-[#1C3F6E]" />
              <p className="font-semibold text-gray-700">Cotizando tarifas con Skydropx...</p>
              <p className="text-xs text-gray-400">Consultando FedEx, DHL, Estafeta y más</p>
            </div>
          )}

          {/* STEP 3: Rates List */}
          {step === 'rates' && (
            <div className="flex flex-col gap-4">
              <div className="text-sm font-semibold text-gray-800">Tarifas Disponibles</div>
              
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {rates.map((rate) => (
                  <div 
                    key={rate.id}
                    onClick={() => setSelectedRate(rate)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedRate?.id === rate.id 
                        ? 'border-[#1C3F6E] bg-[#1C3F6E]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{rate.provider}</div>
                      <div className="text-xs text-gray-500">{rate.serviceLevel} · Entrega en {rate.days} {rate.days === 1 ? 'día' : 'días'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-[#1C3F6E]">${rate.amount.toFixed(2)}</div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{rate.currency}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setStep('dims')} 
                  disabled={loading}
                  className="btn btn-secondary flex-1 justify-center"
                >
                  Atrás
                </button>
                <button 
                  onClick={handleGenerateLabel}
                  disabled={!selectedRate || loading}
                  className="btn btn-primary flex-1 justify-center"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : 'Generar Guía'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success confirmation */}
          {step === 'success' && labelResult && (
            <div className="flex flex-col items-center py-6 gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-1">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-gray-900">¡Guía Generada Exitosamente!</h4>
                <p className="text-sm text-gray-500 mt-1">El envío ha sido asignado a la órden de {order.customer_name}.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full grid grid-cols-2 gap-3 text-left my-2 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block uppercase">Paquetería</span>
                  <strong className="text-gray-800 text-sm font-extrabold">{labelResult.carrier}</strong>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block uppercase">Número de Rastreo</span>
                  <strong className="text-gray-800 text-sm font-mono">{labelResult.trackingNumber}</strong>
                </div>
              </div>

              <a 
                href={labelResult.labelUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-success w-full justify-center py-3 flex items-center gap-2"
              >
                <Download size={18} />
                <span>Descargar Guía (PDF)</span>
              </a>

              <button 
                onClick={onClose}
                className="btn btn-secondary w-full justify-center py-2.5 mt-1"
              >
                Cerrar Ventana
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
