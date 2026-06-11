import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardStats } from '@/app/actions/dashboard'
import { DashboardChart } from '../DashboardChart'
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats()
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    redirect('/login')
  }

  const isStaff = stats.role === 'director' || stats.role === 'consultor'

  return (
    <div className="flex flex-col gap-6">
      {/* BREADCRUMB */}
      <div className="breadcrumb flex items-center gap-2 text-sm text-gray-500">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Panel Principal</span>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon blue">
            <Users size={20} />
          </div>
          <div className="kpi-label">
            {isStaff ? 'Clientes Activos' : 'Mi Plan Activo'}
          </div>
          <div className="kpi-value text-2xl font-bold">
            {isStaff ? stats.activeClientsCount : stats.clients[0]?.plan.toUpperCase() || 'GROWTH'}
          </div>
          <div className="kpi-trend up text-xs text-gray-500">
            {isStaff ? '↑ Activos en CRM' : 'Plan asignado por Aginnova'}
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon green">
            <DollarSign size={20} />
          </div>
          <div className="kpi-label">Ventas del Mes (Junio)</div>
          <div className="kpi-value text-2xl font-bold" style={{ fontSize: '22px' }}>
            ${stats.totalSalesMonth.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-trend up text-xs text-green-600">
            {isStaff ? 'Suma total portafolio' : 'Ventas acumuladas en el período'}
          </div>
        </div>

        <div className="kpi-card yellow">
          <div className="kpi-icon yellow">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-label">
            {isStaff ? 'Comisiones Acumuladas' : 'Comisión a Pagar'}
          </div>
          <div className="kpi-value text-2xl font-bold" style={{ fontSize: '22px' }}>
            ${stats.pendingCommission.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-trend flat text-xs text-gray-500">
            Calculado sobre ROI incremental
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon orange">
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-label">Alertas Operativas</div>
          <div className="kpi-value text-2xl font-bold">
            {stats.unresolvedAlertsCount}
          </div>
          <div className="kpi-trend down text-xs text-red-500">
            {stats.unresolvedAlertsCount > 0 ? 'Atención requerida inmediata' : 'Sin alertas activas'}
          </div>
        </div>
      </div>

      {/* PORTFOLIO DE CLIENTES */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold text-[#1C3F6E]">
          {isStaff ? 'Portfolio de Clientes' : 'Resumen de mi Cuenta'}
        </h2>
        {isStaff && (
          <Link href="/clientes" className="btn btn-secondary btn-sm">
            Gestionar Clientes
          </Link>
        )}
      </div>

      <div className="portfolio-grid mb-4">
        {stats.clients.map((client) => (
          <div className="client-card" key={client.id}>
            <div className="client-card-header flex justify-between items-start">
              <div>
                <div className="client-name font-bold text-lg text-gray-800">{client.name}</div>
                <div className="client-sector text-xs text-gray-500">{client.sector} · Plan {client.plan.toUpperCase()}</div>
              </div>
              <div 
                className={`semaforo ${client.color}`} 
                title={client.color === 'green' ? 'En camino a meta' : client.color === 'yellow' ? 'Atención requerida' : 'Crítico'}
              ></div>
            </div>
            <div className="client-kpis my-4 flex gap-4 text-sm">
              <div className="client-kpi flex-1">
                <div className="client-kpi-label text-xs text-gray-400">Ventas mes</div>
                <div className="client-kpi-val font-semibold text-gray-700">${client.salesCurrent.toLocaleString('es-MX')}</div>
              </div>
              <div className="client-kpi flex-1">
                <div className="client-kpi-label text-xs text-gray-400">vs. Baseline</div>
                <div className="client-kpi-val font-semibold" style={{ color: client.color === 'green' ? 'var(--success)' : client.color === 'yellow' ? '#b07b0f' : 'var(--danger)' }}>
                  {client.baseline > 0 ? `${((client.salesCurrent / client.baseline) * 100).toFixed(1)}%` : '100%'}
                </div>
              </div>
              <div className="client-kpi flex-1">
                <div className="client-kpi-label text-xs text-gray-400">Comisión</div>
                <div className="client-kpi-val font-semibold text-gray-700">${client.commission.toLocaleString('es-MX')}</div>
              </div>
            </div>
            <div className="client-card-actions">
              <Link href={isStaff ? `/clientes/${client.id}` : `/roi`} className="btn btn-primary btn-sm w-full text-center block">
                Ver Detalles
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* DASHBOARD CHARTS AND PENDING ACTIONS */}
      <div className="grid-60-40 gap-6">
        <div className="card">
          <div className="card-header flex justify-between items-center mb-4">
            <h3 className="card-title text-base font-bold text-gray-800">Tendencia de Ventas — Portafolio</h3>
            <span className="chip blue text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Últimas 12 semanas</span>
          </div>
          <div className="card-body">
            <div className="chart-wrap" style={{ height: '220px' }}>
              <DashboardChart />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex justify-between items-center mb-4">
            <h3 className="card-title text-base font-bold text-gray-800">Acciones Pendientes</h3>
            <span className="chip orange text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              {stats.pendingActions.length} pendientes
            </span>
          </div>
          <div className="card-body flex flex-col gap-3">
            {stats.pendingActions.length > 0 ? (
              stats.pendingActions.map((action) => (
                <div 
                  key={action.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    action.severity === 'critical' || action.severity === 'high'
                      ? 'bg-red-50 border-red-100'
                      : 'bg-yellow-50 border-yellow-100'
                  }`}
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      action.severity === 'critical' || action.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    } shrink-0`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{action.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{action.desc}</div>
                  </div>
                  <Link href={action.actionHref} className="btn btn-sm shrink-0 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200">
                    {action.actionLabel}
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">No hay alertas ni acciones críticas pendientes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
