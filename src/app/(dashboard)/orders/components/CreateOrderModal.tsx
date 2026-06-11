'use client'

import { useState } from 'react'
import { createOrder } from '@/app/actions/orders'
import { X, Loader } from 'lucide-react'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  tenant: string
  onOrderCreated: (order: any) => void
}

export default function CreateOrderModal({ isOpen, onClose, tenant, onOrderCreated }: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    source: 'whatsapp' as 'manual' | 'whatsapp' | 'instagram',
    total_amount: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'MX'
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      tenant_id: tenant,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || undefined,
      customer_phone: formData.customer_phone || undefined,
      source: formData.source,
      total_amount: parseFloat(formData.total_amount) || 0,
      shipping_address: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country
      }
    }

    const res = await createOrder(payload)

    setLoading(false)
    if (res.success && res.order) {
      onOrderCreated(res.order)
      onClose()
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        source: 'whatsapp',
        total_amount: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'MX'
      })
    } else {
      setError(res.error || 'Ocurrió un error al crear el pedido.')
    }
  }

  return (
    <div className="modal-overlay open">
      <div className="modal max-w-lg">
        <div className="modal-header">
          <h3 className="modal-title">Registrar Pedido Manual</h3>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body max-h-[70vh] overflow-y-auto flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group col-span-2">
                <label className="form-label">Nombre del Cliente *</label>
                <input 
                  type="text" 
                  name="customer_name" 
                  required 
                  value={formData.customer_name} 
                  onChange={handleChange}
                  placeholder="ej. Sofía Rodríguez"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="customer_email" 
                  value={formData.customer_email} 
                  onChange={handleChange}
                  placeholder="sofia@ejemplo.com"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input 
                  type="text" 
                  name="customer_phone" 
                  value={formData.customer_phone} 
                  onChange={handleChange}
                  placeholder="5512345678"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canal de Venta</label>
                <select name="source" value={formData.source} onChange={handleChange} className="form-select">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="manual">Venta Directa / Local</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monto de Venta ($ MXN) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="total_amount" 
                  required 
                  value={formData.total_amount} 
                  onChange={handleChange}
                  placeholder="ej. 850.00"
                  className="form-input" 
                />
              </div>
            </div>

            <hr className="divider" />
            <h4 className="section-title">Dirección de Envío</h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="form-group col-span-2">
                <label className="form-label">Calle *</label>
                <input 
                  type="text" 
                  name="street" 
                  required 
                  value={formData.street} 
                  onChange={handleChange}
                  placeholder="Avenida Reforma"
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Número *</label>
                <input 
                  type="text" 
                  name="number" 
                  required 
                  value={formData.number} 
                  onChange={handleChange}
                  placeholder="123"
                  className="form-input" 
                />
              </div>

              <div className="form-group col-span-2">
                <label className="form-label">Colonia / Asentamiento *</label>
                <input 
                  type="text" 
                  name="neighborhood" 
                  required 
                  value={formData.neighborhood} 
                  onChange={handleChange}
                  placeholder="Roma Norte"
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">C.P. (5 dígitos) *</label>
                <input 
                  type="text" 
                  name="postal_code" 
                  required 
                  maxLength={5}
                  value={formData.postal_code} 
                  onChange={handleChange}
                  placeholder="06700"
                  className="form-input" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad *</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleChange}
                  placeholder="CDMX"
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado *</label>
                <input 
                  type="text" 
                  name="state" 
                  required 
                  value={formData.state} 
                  onChange={handleChange}
                  placeholder="CDMX"
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">País</label>
                <input 
                  type="text" 
                  name="country" 
                  disabled 
                  value={formData.country} 
                  className="form-input opacity-70 bg-gray-100" 
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary min-w-[100px]">
              {loading ? <Loader size={16} className="animate-spin" /> : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
