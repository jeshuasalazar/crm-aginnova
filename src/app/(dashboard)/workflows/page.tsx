import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getWorkflows } from '@/app/actions/workflows'
import WorkflowsClient from './components/WorkflowsClient'

export default async function WorkflowsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar automatizaciones comerciales activas para este tenant
  const workflows = await getWorkflows()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Motor de Automatizaciones</h1>
        <p className="text-sm text-gray-500">Configura triggers comerciales (carrito abandonado, caducidad, NPS, etc.) y gatilla acciones instantáneas de WhatsApp, Email y asignación de tareas.</p>
      </div>

      <WorkflowsClient initialWorkflows={workflows} />
    </div>
  )
}
