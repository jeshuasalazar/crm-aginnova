import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { LogOut } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
        <h1 className="text-3xl font-extrabold text-[#1C3F6E] mb-2">¡Bienvenido al Dashboard!</h1>
        <p className="text-gray-500 mb-8">Has iniciado sesión correctamente como <span className="font-semibold text-gray-700">{user.email}</span></p>
        
        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/login')
        }}>
          <button className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
