import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getRoiData } from '@/app/actions/roi'
import RoiClient from './components/RoiClient'

export default async function RoiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar datos reales y calculados de comisiones
  const roiData = await getRoiData()

  return (
    <RoiClient roiData={roiData} />
  )
}
