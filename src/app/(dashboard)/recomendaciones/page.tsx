import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
import { getRecommendations } from '@/app/actions/recommendations'
import RecomendacionesClient from './components/RecomendacionesClient'

export default async function RecomendacionesPage() {
  const profile = await getCurrentUserProfile()
  if (!profile) {
    redirect('/login')
  }

  // Cargar recomendaciones aplicables
  const recommendations = await getRecommendations()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C3F6E]">Recomendaciones de IA</h1>
        <p className="text-sm text-gray-500">
          {profile.role === 'director' || profile.role === 'consultor'
            ? 'Revisa, edita y aprueba las recomendaciones de la IA antes de que sean publicadas en el panel del cliente.'
            : 'Recomendaciones y planes de acción estratégicos elaborados por tu consultor y la IA de Aginova.'}
        </p>
      </div>

      <RecomendacionesClient initialRecommendations={recommendations} role={profile.role} />
    </div>
  )
}
