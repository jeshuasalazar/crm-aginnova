import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserProfile } from '@/utils/supabase/profile'
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
  Truck,
  Boxes,
  Zap
} from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentUserProfile()
  if (!profile) {
    // Sign out before redirecting to break the middleware redirect loop
    // (authenticated user without a valid profile would loop: / → /login → /)
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  const supabase = await createClient()
  const isStaff = profile.role === 'director' || profile.role === 'consultor'
  const tenant = profile.tenant?.name || 'Aginnova'
  const roleName = profile.role.toUpperCase().replace('_', ' ')

  const userEmail = (await supabase.auth.getUser()).data.user?.email || 'usuario@aginnova.mx'
  const userName = userEmail.split('@')[0].toUpperCase()
  const userInitials = userName.substring(0, 2)

  // Consultar cantidad de alertas sin resolver en tiempo real para el badge del Sidebar
  let alertsQuery = supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false)
    
  if (!isStaff) {
    alertsQuery = alertsQuery.eq('tenant_id', profile.tenant_id)
  }
  
  const { count: alertsCount } = await alertsQuery
  const badgeCount = alertsCount || 0

  // Definir ítems del Sidebar dinámicamente
  const SIDEBAR_ITEMS = [
    { section: 'Principal' },
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: Grid },
    ...(isStaff ? [{ id: 'clientes', label: 'Gestión de Clientes', href: '/clientes', icon: Users }] : []),
    
    { section: 'Logística (Skydropx)' },
    { id: 'orders', label: 'Órdenes / Pedidos', href: '/orders', icon: Package },
    { id: 'shipments', label: 'Envíos y Guías', href: '/shipments', icon: Truck },
    
    { section: 'Gestión' },
    { id: 'roi', label: 'Panel ROI / Comisiones', href: '/roi', icon: TrendingUp },
    { id: 'inventario', label: 'Inventario y Lotes', href: '/inventario', icon: Boxes },
    { id: 'ia', label: 'Recomendaciones IA', href: '/recomendaciones', icon: Sparkles },
    { id: 'alertas', label: 'Alertas', href: '/alertas', icon: Bell, badge: badgeCount },
    { id: 'datos', label: 'Carga de Datos', href: '/datos', icon: Upload },
    { id: 'workflows', label: 'Automatizaciones', href: '/workflows', icon: Zap },
    { id: 'prospecto', label: 'Prospecto Demo', href: '/prospecto', icon: Target },
    
    { section: 'Sistema' },
    { id: 'config', label: 'Configuración', href: '#', icon: Settings },
  ]

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
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

            return (
              <Link
                key={linkItem.id}
                href={linkItem.href}
                className="sidebar-item"
              >
                {Icon && <Icon size={17} className="opacity-80" />}
                <span>{linkItem.label}</span>
                {linkItem.badge !== undefined && linkItem.badge > 0 && (
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
            <button className="sidebar-item w-full text-left bg-transparent border-none cursor-pointer flex items-center gap-2">
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
              Tenant: {tenant} ({roleName})
            </span>
          </div>
          
          <div className="header-actions">
            <div className="lang-toggle">
              <span className="active">ES</span>
              <span className="lang-sep">|</span>
              <span>EN</span>
            </div>
            
            <button className="icon-btn relative" title="Notificaciones">
              <Bell size={20} />
              {badgeCount > 0 && <span className="dot-badge">{badgeCount}</span>}
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
