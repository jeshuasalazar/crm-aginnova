import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { getOrders } from '@/app/actions/orders'
import OrdersClient from './components/OrdersClient'

export default async function OrdersPage() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect('/login')
  }

  const tenantId = profile.tenant_id
  const tenantName = profile.tenant?.name || 'NALUA'

  const orders = await getOrders(tenantId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Bandeja de Pedidos</h1>
          <p className="text-sm text-gray-500">Gestiona las ventas de e-commerce y genera guías de envío.</p>
        </div>
      </div>

      <OrdersClient initialOrders={orders} tenantId={tenantId} tenantName={tenantName} />
    </div>
  )
}

