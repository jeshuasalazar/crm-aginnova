import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAlerts } from '@/app/actions/alerts'
import AlertasClient from './components/AlertasClient'

export default async function AlertasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar las alertas activas y resueltas
  const alerts = await getAlerts()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Sistema de Alertas Operativas</h1>
        <p className="text-sm text-gray-500">Monitorea desviaciones de ventas, stock crítico, caducidades de lotes y visualiza las notificaciones emitidas por WhatsApp.</p>
      </div>

      <AlertasClient initialAlerts={alerts} />
    </div>
  )
}
