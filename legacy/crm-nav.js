// crm-nav.js — Shared navigation, sidebar, header, toasts, modals

const CRM_NAV = [
  { section: 'Principal' },
  { id:'dashboard',  label:'Dashboard',          href:'crm-dashboard.html',       icon:'grid' },
  { id:'clientes',   label:'Gestión de Clientes', href:'crm-clientes-admin.html',  icon:'users' },
  { section: 'Gestión' },
  { id:'roi',        label:'Panel ROI',           href:'crm-roi.html',             icon:'trending' },
  { id:'ia',         label:'Recomendaciones IA',  href:'crm-recomendaciones.html', icon:'sparkle' },
  { id:'alertas',    label:'Alertas',             href:'crm-alertas.html',         icon:'bell',    badge:3 },
  { id:'datos',      label:'Carga de Datos',      href:'crm-datos.html',           icon:'upload' },
  { id:'prospecto',  label:'Prospecto Demo',      href:'crm-prospecto.html',       icon:'target' },
  { section: 'Sistema' },
  { id:'config',     label:'Configuración',       href:'crm-config.html',          icon:'gear' },
];

const SVG = {
  grid:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  users:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  trending:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  sparkle:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
  bell:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  upload:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  target:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  gear:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout:`<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  search:`<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  bell2:`<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  chevron:`<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`,
  x:`<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

function renderSidebar(activeId) {
  let items = '';
  CRM_NAV.forEach(item => {
    if (item.section) {
      items += `<div class="sidebar-section">${item.section}</div>`;
    } else {
      const active = item.id === activeId ? ' active' : '';
      const badge  = item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : '';
      items += `<a href="${item.href}" class="sidebar-item${active}">${SVG[item.icon]}<span>${item.label}</span>${badge}</a>`;
    }
  });
  return `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <img src="uploads/Logo.jpg" alt="Aginnova" onerror="this.style.display='none'">
    <div class="sidebar-logo-text">
      <span class="brand">aginnova</span>
      <span class="tagline">Transformación Digital</span>
    </div>
  </div>
  <nav class="sidebar-nav">${items}</nav>
  <div class="sidebar-bottom">
    <a href="CRM Aginnova.html" class="sidebar-item">${SVG.logout}<span>Cerrar Sesión</span></a>
  </div>
</aside>`;
}

function renderHeader(title, opts = {}) {
  const { user = 'Juan Pérez', role = 'Consultor', alerts = 3, showSearch = true } = opts;
  const initials = user.split(' ').map(n => n[0]).join('').toUpperCase();
  return `
<header class="header">
  <div class="header-title">${title}</div>
  ${showSearch ? `<div class="header-search">${SVG.search}<input type="text" placeholder="Buscar cliente o dato..."></div>` : ''}
  <div class="header-actions">
    <div class="lang-toggle"><span class="active">ES</span><span class="lang-sep">|</span><span>EN</span></div>
    <button class="icon-btn" title="Notificaciones" onclick="window.location.href='crm-alertas.html'">
      ${SVG.bell2}${alerts > 0 ? `<span class="dot-badge">${alerts}</span>` : ''}
    </button>
    <div class="user-chip">
      <div class="user-avatar">${initials}</div>
      <div><div class="user-name">${user}</div><div class="user-role">${role}</div></div>
      ${SVG.chevron}
    </div>
  </div>
</header>`;
}

function mountNav(activeId, title, opts) {
  const sb = document.getElementById('sidebar-mount');
  const hd = document.getElementById('header-mount');
  if (sb) sb.innerHTML = renderSidebar(activeId);
  if (hd) hd.innerHTML = renderHeader(title, opts);
}

// ─── TOASTS ───────────────────────────────────────
function initToasts() {
  const c = document.createElement('div');
  c.className = 'toast-container';
  c.id = 'toast-container';
  document.body.appendChild(c);
}

function showToast(msg, type = '', duration = 3200) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span style="font-weight:700;font-size:15px">${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(110%)'; t.style.transition='.3s'; setTimeout(()=>t.remove(),320); }, duration);
}

// ─── MODALS ───────────────────────────────────────
function openModal(id)  { const el=document.getElementById(id); if(el) el.classList.add('open'); }
function closeModal(id) { const el=document.getElementById(id); if(el) el.classList.remove('open'); }

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initToasts);
