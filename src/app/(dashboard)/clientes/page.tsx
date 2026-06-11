import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getClients } from '@/app/actions/clients'
import ClientesClient from './components/ClientesClient'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener los clientes mediante server action
  const clients = await getClients()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Gestión de Clientes</h1>
        <p className="text-sm text-gray-500">Administra los tenants de tu cartera, configura sus parámetros financieros y completa el onboarding wizard.</p>
      </div>

      <ClientesClient initialClients={clients} />
    </div>
  )
}
