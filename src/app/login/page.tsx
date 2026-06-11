import Image from 'next/image'
import { login } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F4F6F9]">
      {/* LEFT: Brand panel */}
      <div className="hidden md:flex flex-col justify-center items-start px-16 py-16 relative overflow-hidden text-white bg-gradient-to-br from-[#1C3F6E] via-[#0f2540] to-[#1a3560]">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#4A7BB5] opacity-20 -top-[120px] -right-[160px]"></div>
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[#4A7BB5] opacity-10 -bottom-[80px] -left-[60px]"></div>
        
        <div className="relative z-10 mb-12">
          {/* Fallback image path, assuming it will be public/uploads/Logo.jpg soon */}
          <div className="text-3xl font-extrabold tracking-tight">aginnova</div>
          <div className="text-sm text-white/60 mt-1">Agencia de Transformación Digital</div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight text-white mb-4">
            CRM Inteligente<br />
            <span className="text-white/60">para el crecimiento</span><br />
            de tus clientes.
          </h1>
          <p className="text-white/70 text-base max-w-[380px] leading-relaxed">
            Gestiona KPIs, comisiones y recomendaciones de IA en tiempo real. Toda tu cartera de clientes, en un solo lugar.
          </p>
        </div>
        
        <div className="relative z-10 mt-10 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="w-2 h-2 rounded-full bg-white/50 shrink-0"></div>
            Panel ROI con cálculo automático de comisiones
          </div>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="w-2 h-2 rounded-full bg-white/50 shrink-0"></div>
            Recomendaciones de IA aprobadas por consultor
          </div>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="w-2 h-2 rounded-full bg-white/50 shrink-0"></div>
            Alertas en tiempo real por área y cliente
          </div>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <div className="w-2 h-2 rounded-full bg-white/50 shrink-0"></div>
            Multi-tenant seguro para cada MIPYME
          </div>
        </div>

        {/* Decorative Grid Dots */}
        <div className="absolute bottom-10 right-10 z-10 grid grid-cols-6 gap-2">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white/20"></div>
          ))}
        </div>
      </div>

      {/* RIGHT: Login form */}
      <div className="flex items-center justify-center bg-white p-12 md:p-16">
        <div className="w-full max-w-[400px]">
          <h2 className="text-[26px] font-extrabold text-[#1C3F6E] mb-1">Bienvenido</h2>
          <p className="text-sm text-[#718096] mb-9">Ingresa tus credenciales para continuar</p>

          {searchParams?.message && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-200">
              {searchParams.message}
            </div>
          )}

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-semibold text-[#5A6472]">Correo electrónico</label>
              <input 
                name="email"
                type="email" 
                required
                className="h-12 px-4 text-[14.5px] rounded-lg border-2 border-[#e2e8f0] bg-[#f7f9fc] focus:bg-white focus:border-[#4A7BB5] focus:ring-4 focus:ring-[#4A7BB5]/10 outline-none transition-all"
                placeholder="consultor@aginnova.mx" 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[12.5px] font-semibold text-[#5A6472]">Contraseña</label>
              <input 
                name="password"
                type="password" 
                required
                className="h-12 px-4 text-[14.5px] rounded-lg border-2 border-[#e2e8f0] bg-[#f7f9fc] focus:bg-white focus:border-[#4A7BB5] focus:ring-4 focus:ring-[#4A7BB5]/10 outline-none transition-all"
                placeholder="••••••••" 
              />
            </div>

            <button 
              formAction={login}
              className="mt-4 w-full h-[50px] bg-[#1C3F6E] hover:bg-[#142e52] text-white rounded-lg font-bold text-[15px] transition-colors active:scale-[0.99] tracking-wide"
            >
              Ingresar al CRM
            </button>
          </form>

          <a href="#" className="block text-center mt-5 text-[13px] text-[#718096] hover:text-[#4A7BB5] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>

          <div className="mt-10 mb-8 flex items-center text-xs text-[#b0bec5]">
            <div className="flex-1 h-px bg-[#e2e8f0]"></div>
            <div className="px-3">acceso de demostración</div>
            <div className="flex-1 h-px bg-[#e2e8f0]"></div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 border-2 border-[#e2e8f0] rounded-lg text-xs font-semibold bg-[#f7f9fc] text-[#5A6472] hover:bg-gray-100 transition-colors">
              Consultor
            </button>
            <button className="flex-1 py-2.5 border-2 border-[#e2e8f0] rounded-lg text-xs font-semibold bg-[#f7f9fc] text-[#5A6472] hover:bg-gray-100 transition-colors">
              Director
            </button>
            <button className="flex-1 py-2.5 border-2 border-[#e2e8f0] rounded-lg text-xs font-semibold bg-[#f7f9fc] text-[#5A6472] hover:bg-gray-100 transition-colors">
              Cliente
            </button>
          </div>

          <div className="mt-10 text-[11.5px] text-[#b0bec5] text-center">
            CRM Aginnova v1.0 · © 2026 Aginnova · Todos los derechos reservados
          </div>
        </div>
      </div>
    </div>
  )
}
