import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getInventoryData } from '@/app/actions/inventory'
import InventarioClient from './components/InventarioClient'

export default async function InventarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar datos consolidados de inventario
  const inventoryData = await getInventoryData()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Gestión de Inventario y Lotes</h1>
        <p className="text-sm text-gray-500">Supervisa catálogo de productos, caducidades de lotes activos (meta: 0% pérdidas), analiza Pareto 80/20 y recibe sugerencias de reposición.</p>
      </div>

      <InventarioClient initialData={inventoryData} />
    </div>
  )
}
