'use client'

import { useState } from 'react'
import { Order } from '@/app/actions/orders'
import { Plus, Search, Truck, Download, AlertCircle, ShoppingBag } from 'lucide-react'
import CreateOrderModal from './CreateOrderModal'
import CreateShipmentModal from './CreateShipmentModal'

interface OrdersClientProps {
  initialOrders: Order[]
  tenantId: string
  tenantName: string
}

export default function OrdersClient({ initialOrders, tenantId, tenantName }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'shipped'>('all')
  
  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrderForShipment, setSelectedOrderForShipment] = useState<Order | null>(null)

  // Calculations
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Filtered list
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (order.customer_phone && order.customer_phone.includes(search))
    
    const matchesStatus = 
      statusFilter === 'all' || 
      order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOrderCreated = (newOrder: Order) => {
    setOrders([newOrder, ...orders])
  }

  const handleShipmentCompleted = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI METRICS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue">
            <ShoppingBag size={20} />
          </div>
          <span className="kpi-label">Total Pedidos ({tenantName})</span>
          <span className="kpi-value">{totalOrders}</span>
        </div>

        <div className="kpi-card yellow">
          <div className="kpi-icon yellow">
            <AlertCircle size={20} />
          </div>
          <span className="kpi-label">Pendientes</span>
          <span className="kpi-value">{pendingOrders}</span>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon green">
            <Truck size={20} />
          </div>
          <span className="kpi-label">Enviados</span>
          <span className="kpi-value">{shippedOrders}</span>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon orange">
            <span className="font-bold text-lg">$</span>
          </div>
          <span className="kpi-label">Ticket Promedio</span>
          <span className="kpi-value">${averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStatusFilter('all')} 
              className={`tab ${statusFilter === 'all' ? 'active' : ''}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setStatusFilter('pending')} 
              className={`tab ${statusFilter === 'pending' ? 'active' : ''}`}
            >
              Pendientes ({pendingOrders})
            </button>
            <button 
              onClick={() => setStatusFilter('shipped')} 
              className={`tab ${statusFilter === 'shipped' ? 'active' : ''}`}
            >
              Enviados ({shippedOrders})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="header-search !w-64">
              <Search size={15} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none text-sm text-gray-700 bg-transparent w-full"
              />
            </div>

            {/* Create Manual Order */}
            <button 
              onClick={() => setIsOrderModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Nuevo Pedido Manual</span>
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="dtable">
            <thead>
              <tr>
                <th>Cliente / ID</th>
                <th>Origen / Canal</th>
                <th>Monto</th>
                <th>Dirección de Envío</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const addr = order.shipping_address
                  const fullAddress = `${addr.street} ${addr.number}, Col. ${addr.neighborhood}, ${addr.city}, ${addr.state}, CP ${addr.postal_code}`

                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="font-semibold text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone || order.customer_email || 'Sin contacto'}</div>
                      </td>
                      <td>
                        <span className={`chip ${
                          order.source === 'ecommerce' ? 'blue' : 
                          order.source === 'whatsapp' ? 'green' : 
                          order.source === 'instagram' ? 'orange' : 'gray'
                        }`}>
                          {order.source.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-bold text-gray-800">
                        ${Number(order.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="max-w-xs truncate text-xs text-gray-600" title={fullAddress}>
                        {fullAddress}
                      </td>
                      <td>
                        <span className={`chip ${order.status === 'shipped' ? 'green' : 'yellow'}`}>
                          {order.status === 'shipped' ? 'ENVIADO' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        {order.status === 'pending' ? (
                          <button 
                            onClick={() => setSelectedOrderForShipment(order)}
                            className="btn btn-sm btn-success flex items-center gap-1.5"
                          >
                            <Truck size={14} />
                            <span>Generar Envío</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold italic">Listo</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      <CreateOrderModal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        tenant={tenantId}
        onOrderCreated={handleOrderCreated}
      />

      {/* CREATE SHIPMENT / SKYDROPX MODAL */}
      {selectedOrderForShipment && (
        <CreateShipmentModal 
          isOpen={!!selectedOrderForShipment}
          onClose={() => setSelectedOrderForShipment(null)}
          order={selectedOrderForShipment}
          tenant={tenantId}
          onShipmentCompleted={handleShipmentCompleted}
        />
      )}
    </div>
  )
}
