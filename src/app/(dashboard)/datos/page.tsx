import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUploadsHistory } from '@/app/actions/data'
import DatosClient from './components/DatosClient'

export default async function DatosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar historial de uploads del tenant actual
  const history = await getUploadsHistory()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Ingesta de Datos</h1>
        <p className="text-sm text-gray-500">Carga plantillas Estándar de Ventas, Inventario y Campañas en CSV para alimentar la IA y los dashboards.</p>
      </div>

      <DatosClient initialHistory={history} />
    </div>
  )
}
