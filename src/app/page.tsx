import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardChart } from './DashboardChart'

function SVGGrid() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function SVGUsers() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function SVGTrending() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function SVGSparkle() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>; }
function SVGBell() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function SVGUpload() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>; }
function SVGTarget() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>; }
function SVGGear() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function SVGLogout() { return <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function SVGSearch() { return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function SVGBell2() { return <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function SVGChevron() { return <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>; }

function Sidebar() {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text" style={{marginLeft: '10px'}}>
          <span className="brand">aginnova</span>
          <span className="tagline">Transformación Digital</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">Principal</div>
        <a href="#" className="sidebar-item active"><SVGGrid /><span>Dashboard</span></a>
        <a href="#" className="sidebar-item"><SVGUsers /><span>Gestión de Clientes</span></a>
        
        <div className="sidebar-section">Gestión</div>
        <a href="#" className="sidebar-item"><SVGTrending /><span>Panel ROI</span></a>
        <a href="#" className="sidebar-item"><SVGSparkle /><span>Recomendaciones IA</span></a>
        <a href="#" className="sidebar-item"><SVGBell /><span>Alertas</span><span className="sidebar-badge">3</span></a>
        <a href="#" className="sidebar-item"><SVGUpload /><span>Carga de Datos</span></a>
        <a href="#" className="sidebar-item"><SVGTarget /><span>Prospecto Demo</span></a>

        <div className="sidebar-section">Sistema</div>
        <a href="#" className="sidebar-item"><SVGGear /><span>Configuración</span></a>
      </nav>
      <div className="sidebar-bottom">
        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/login')
        }}>
          <button type="submit" className="sidebar-item w-full text-left" style={{ background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
            <SVGLogout /><span>Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

function Header({ email }: { email: string }) {
  return (
    <header className="header">
      <div className="header-title">Dashboard</div>
      <div className="header-search">
        <SVGSearch />
        <input type="text" placeholder="Buscar cliente o dato..." />
      </div>
      <div className="header-actions">
        <div className="lang-toggle"><span className="active">ES</span><span className="lang-sep">|</span><span>EN</span></div>
        <button className="icon-btn" title="Notificaciones">
          <SVGBell2 /><span className="dot-badge">3</span>
        </button>
        <div className="user-chip">
          <div className="user-avatar">{email.substring(0,2).toUpperCase()}</div>
          <div><div className="user-name">{email}</div><div className="user-role">Autenticado</div></div>
          <SVGChevron />
        </div>
      </div>
    </header>
  )
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header email={user.email || 'Usuario'} />
        <div className="content">

          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Panel Principal
          </div>

          {/* KPI CARDS */}
          <div className="kpi-grid">
            <div className="kpi-card blue">
              <div className="kpi-icon blue">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="kpi-label">Clientes Activos</div>
              <div className="kpi-value">12</div>
              <div className="kpi-trend up">↑ 2 este mes</div>
            </div>
            <div className="kpi-card green">
              <div className="kpi-icon green">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="kpi-label">Ventas del Mes</div>
              <div className="kpi-value" style={{fontSize: '22px'}}>$1.24M</div>
              <div className="kpi-trend up">↑ 18.3% vs mes ant.</div>
            </div>
            <div className="kpi-card yellow">
              <div className="kpi-icon yellow">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="kpi-label">Comisión Pendiente</div>
              <div className="kpi-value" style={{fontSize: '22px'}}>$38,420</div>
              <div className="kpi-trend flat">→ 5 clientes contribuyen</div>
            </div>
            <div className="kpi-card orange">
              <div className="kpi-icon orange">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <div className="kpi-label">Alertas Sin Resolver</div>
              <div className="kpi-value">3</div>
              <div className="kpi-trend down">↑ 1 crítica nueva hoy</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="section-title" style={{marginBottom: 0}}>Portfolio de Clientes</div>
            <a href="#" className="btn btn-secondary btn-sm">Ver todos</a>
          </div>

          <div className="portfolio-grid mb-6">
            <div className="client-card">
              <div className="client-card-header">
                <div>
                  <div className="client-name">NALUA</div>
                  <div className="client-sector">Retail · B2C</div>
                </div>
                <div className="semaforo green" title="En camino a meta"></div>
              </div>
              <div className="client-kpis">
                <div className="client-kpi">
                  <div className="client-kpi-label">Ventas mes</div>
                  <div className="client-kpi-val">$58,500</div>
                </div>
                <div className="client-kpi">
                  <div className="client-kpi-label">vs. Meta</div>
                  <div className="client-kpi-val" style={{color: 'var(--success)'}}>96.3%</div>
                </div>
                <div className="client-kpi">
                  <div className="client-kpi-label">Actualiz.</div>
                  <div className="client-kpi-val">Hoy</div>
                </div>
              </div>
              <div className="client-card-actions">
                <a href="#" className="btn btn-primary btn-sm flex-1 justify-center">Ver Dashboard</a>
              </div>
            </div>

            <div className="client-card">
              <div className="client-card-header">
                <div>
                  <div className="client-name">KAWDOBA</div>
                  <div className="client-sector">Manufactura · B2B</div>
                </div>
                <div className="semaforo yellow" title="Atención requerida"></div>
              </div>
              <div className="client-kpis">
                <div className="client-kpi">
                  <div className="client-kpi-label">Ventas mes</div>
                  <div className="client-kpi-val">$165,000</div>
                </div>
                <div className="client-kpi">
                  <div className="client-kpi-label">vs. Meta</div>
                  <div className="client-kpi-val" style={{color: '#b07b0f'}}>91.7%</div>
                </div>
                <div className="client-kpi">
                  <div className="client-kpi-label">Actualiz.</div>
                  <div className="client-kpi-val">Hoy</div>
                </div>
              </div>
              <div className="client-card-actions">
                <a href="#" className="btn btn-primary btn-sm flex-1 justify-center">Ver Dashboard</a>
              </div>
            </div>

            <div className="client-card">
              <div className="client-card-header">
                <div>
                  <div className="client-name">FERREX</div>
                  <div className="client-sector">Ferretería · B2B</div>
                </div>
                <div className="semaforo green" title="En camino a meta"></div>
              </div>
              <div className="client-kpis">
                <div className="client-kpi">
                  <div className="client-kpi-label">Ventas mes</div>
                  <div className="client-kpi-val">$92,300</div>
                </div>
                <div className="client-kpi">
                  <div className="client-kpi-label">vs. Meta</div>
                  <div className="client-kpi-val" style={{color: 'var(--success)'}}>103.2%</div>
                </div>
                <div className="client-kpi">
                  <div className="client-kpi-label">Actualiz.</div>
                  <div className="client-kpi-val">Ayer</div>
                </div>
              </div>
              <div className="client-card-actions">
                <a href="#" className="btn btn-primary btn-sm flex-1 justify-center">Ver Dashboard</a>
              </div>
            </div>
          </div>

          <div className="grid-60-40" style={{marginBottom: '24px'}}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Tendencia de Ventas — Portafolio</div>
                <span className="chip blue">Últimas 12 semanas</span>
              </div>
              <div className="card-body">
                <div className="chart-wrap" style={{height: '220px'}}>
                  <DashboardChart />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Acciones Pendientes</div>
                <span className="chip orange">3 urgentes</span>
              </div>
              <div className="card-body" style={{padding: '12px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>

                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--danger-lt)'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', flexShrink: 0}}></div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--gray-dark)'}}>SOLTEK sin datos — 3 días</div>
                      <div style={{fontSize: '11.5px', color: 'var(--gray-mid)'}}>Última carga: 4 Jun 2026</div>
                    </div>
                    <a href="#" className="btn btn-danger btn-sm">Cargar</a>
                  </div>

                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--warning-lt)'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', flexShrink: 0}}></div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--gray-dark)'}}>KAWDOBA — meta en riesgo</div>
                      <div style={{fontSize: '11.5px', color: 'var(--gray-mid)'}}>91.7% · necesita +$15,000</div>
                    </div>
                    <a href="#" className="btn btn-sm" style={{background: 'var(--warning)', color: '#fff'}}>IA</a>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
