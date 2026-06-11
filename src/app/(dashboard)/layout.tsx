import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { 
  Grid, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  Upload, 
  Target, 
  Settings, 
  LogOut, 
  Package, 
  Truck 
} from 'lucide-react'

// Menú del Sidebar
const SIDEBAR_ITEMS = [
  { section: 'Principal' },
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: Grid },
  { id: 'clientes', label: 'Gestión de Clientes', href: '#', icon: Users },
  { section: 'Logística (Skydropx)' },
  { id: 'orders', label: 'Órdenes / Pedidos', href: '/orders', icon: Package },
  { id: 'shipments', label: 'Envíos y Guías', href: '/shipments', icon: Truck },
  { section: 'Gestión' },
  { id: 'roi', label: 'Panel ROI', href: '#', icon: TrendingUp },
  { id: 'ia', label: 'Recomendaciones IA', href: '#', icon: Sparkles },
  { id: 'alertas', label: 'Alertas', href: '#', icon: Bell, badge: 3 },
  { id: 'datos', label: 'Carga de Datos', href: '#', icon: Upload },
  { id: 'prospecto', label: 'Prospecto Demo', href: '#', icon: Target },
  { section: 'Sistema' },
  { id: 'config', label: 'Configuración', href: '#', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Determinar Tenant (en producción vendría de metadata/perfil; aquí permitimos demo por email o default NALUA)
  let tenant = 'NALUA'
  if (user.email?.toLowerCase().includes('kawdoba')) {
    tenant = 'KAWDOBA'
  }

  const userEmail = user.email || 'usuario@aginnova.mx'
  const userName = userEmail.split('@')[0].toUpperCase()
  const userInitials = userName.substring(0, 2)

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          {/* Logo Aginova */}
          <div className="sidebar-logo-text">
            <span className="brand">aginnova</span>
            <span className="tagline">Transformación Digital</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item, idx) => {
            if ('section' in item) {
              return (
                <div key={`sec-${idx}`} className="sidebar-section">
                  {item.section}
                </div>
              )
            }

            const linkItem = item as { id: string; label: string; href: string; icon: any; badge?: number }
            const Icon = linkItem.icon
            const isOrders = linkItem.id === 'orders'
            const isShipments = linkItem.id === 'shipments'
            const isActive = isOrders || isShipments

            return (
              <Link
                key={linkItem.id}
                href={linkItem.href}
                className={`sidebar-item ${isActive ? 'text-white bg-white/10' : ''}`}
              >
                {Icon && <Icon size={17} className="opacity-80" />}
                <span>{linkItem.label}</span>
                {linkItem.badge && (
                  <span className="sidebar-badge">{linkItem.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <button className="sidebar-item w-full text-left bg-transparent border-none">
              <LogOut size={17} />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        {/* HEADER */}
        <header className="header">
          <div className="header-title flex items-center gap-3">
            <span>CRM Inteligente</span>
            <span className="px-2.5 py-0.5 bg-[#4A7BB5]/10 text-[#4A7BB5] text-[11px] font-bold rounded-full border border-[#4A7BB5]/20">
              Tenant: {tenant}
            </span>
          </div>
          
          <div className="header-actions">
            <div className="lang-toggle">
              <span className="active">ES</span>
              <span className="lang-sep">|</span>
              <span>EN</span>
            </div>
            
            <button className="icon-btn" title="Notificaciones">
              <Bell size={20} />
              <span className="dot-badge">3</span>
            </button>
            
            <div className="user-chip">
              <div className="user-avatar">{userInitials}</div>
              <div>
                <div className="user-name">{userName}</div>
                <div className="user-role">{tenant} Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
