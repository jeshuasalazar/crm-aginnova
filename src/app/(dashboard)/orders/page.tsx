import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getOrders } from '@/app/actions/orders'
import OrdersClient from './components/OrdersClient'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Determinar Tenant (en producción vendría de metadata/perfil; aquí permitimos demo por email o default NALUA)
  const tenant = user.email?.toLowerCase().includes('kawdoba') ? 'KAWDOBA' : 'NALUA'

  const orders = await getOrders(tenant)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Bandeja de Pedidos</h1>
          <p className="text-sm text-gray-500">Gestiona las ventas de e-commerce y genera guías de envío.</p>
        </div>
      </div>

      <OrdersClient initialOrders={orders} tenant={tenant} />
    </div>
  )
}
