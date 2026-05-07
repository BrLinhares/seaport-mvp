import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Settings, LogOut, Ship,
  ClipboardList, CheckSquare, UserCheck, BookOpen,
  Droplets, Navigation2, Plus, ChevronLeft, ChevronRight, X, FileText,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSidebar } from '../../context/SidebarContext'

// ── Configuração de navegação por perfil ────────────────────────────────────
const NAV_CONFIG = {
  ROLE_GERENTE: [
    {
      section: 'Principal',
      items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      section: 'Gestão',
      items: [
        { to: '/dashboard/embarcacoes',       icon: Ship,          label: 'Embarcações' },
        { to: '/dashboard/tripulantes',        icon: UserCheck,     label: 'Tripulantes' },
        { to: '/dashboard/registros',          icon: ClipboardList, label: 'Registros' },
        { to: '/dashboard/manobras/gerencia',  icon: Navigation2,   label: 'Manobras' },
        { to: '/dashboard/sondagens/gerencia', icon: Droplets,      label: 'Sondagens' },
        { to: '/dashboard/procedimentos',      icon: BookOpen,      label: 'Procedimentos' },
        { to: '/dashboard/users',              icon: Users,         label: 'Usuários' },
        { to: '/dashboard/requisicoes',        icon: FileText,      label: 'Requisições' },
      ],
    },
    {
      section: 'Sistema',
      items: [{ to: '/dashboard/settings', icon: Settings, label: 'Configurações' }],
    },
  ],
  ROLE_DIRETORIA: [
    {
      section: 'Principal',
      items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      section: 'Relatórios',
      items: [
        { to: '/dashboard/embarcacoes',         icon: Ship,        label: 'Embarcações' },
        { to: '/dashboard/registros/aprovados', icon: CheckSquare, label: 'Registros Aprovados' },
        { to: '/dashboard/procedimentos',       icon: BookOpen,    label: 'Procedimentos' },
      ],
    },
  ],
  ROLE_TRIPULACAO: [
    {
      section: 'Principal',
      items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      section: 'Operacional',
      items: [
        { to: '/dashboard/novo-registro',  icon: Plus,        label: 'Novo Registro' },
        { to: '/dashboard/manobras',       icon: Navigation2, label: 'Manobras' },
        { to: '/dashboard/sondagens',      icon: Droplets,    label: 'Sondagem de Tanques' },
        { to: '/dashboard/registros/meus', icon: CheckSquare, label: 'Meus Registros' },
        { to: '/dashboard/procedimentos',  icon: BookOpen,    label: 'Procedimentos' },
      ],
    },
  ],
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { isCollapsed, isMobileOpen, isMobile, toggleCollapse, closeMobile } = useSidebar()

  // No mobile nunca entra em modo collapsed — só abre/fecha como drawer
  const collapsed = !isMobile && isCollapsed

  const navItems = NAV_CONFIG[user?.role] ?? NAV_CONFIG.ROLE_TRIPULACAO

  const handleLogout = () => { logout(); navigate('/login') }
  const handleNavClick = () => { if (isMobile) closeMobile() }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const roleLabel = {
    ROLE_GERENTE:    'Gerente',
    ROLE_DIRETORIA:  'Diretoria',
    ROLE_TRIPULACAO: 'Tripulação',
  }[user?.role] ?? 'Usuário'

  const sidebarClass = [
    'sidebar',
    collapsed    ? 'sidebar--collapsed'    : '',
    isMobileOpen ? 'sidebar--mobile-open'  : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* Overlay escuro no mobile */}
      {isMobile && isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile} aria-hidden="true" />
      )}

      <aside className={sidebarClass} aria-label="Menu lateral">

        {/* ── Topo: logo + botão de toggle ─────────────────────────── */}
        <div className="sidebar-brand">
          {!collapsed && (
            <img src="/logo-seaport.png" alt="Seaport" className="sidebar-logo-img" />
          )}

          {/* Desktop: recolher / expandir */}
          {!isMobile && (
            <button
              className="sidebar-toggle-btn"
              onClick={toggleCollapse}
              title={collapsed ? 'Expandir menu' : 'Recolher menu'}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

          {/* Mobile: fechar drawer */}
          {isMobile && (
            <button
              className="sidebar-toggle-btn"
              onClick={closeMobile}
              title="Fechar menu"
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Navegação ─────────────────────────────────────────────── */}
        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.section}>
              {collapsed
                ? <div className="sidebar-section-divider" />
                : <div className="sidebar-section-label">{group.section}</div>
              }

              {group.items.map((item) => {
                // Item com sub-menu (children)
                if (item.children) {
                  const ParentIcon = item.icon
                  if (collapsed) {
                    return (
                      <div key={item.label} className="nav-item nav-item--disabled" title={item.label}>
                        <ParentIcon size={18} />
                      </div>
                    )
                  }
                  return (
                    <div key={item.label}>
                      <div className="nav-item nav-item--disabled">
                        <ParentIcon size={18} />
                        <span>{item.label}</span>
                      </div>
                      {item.children.map(({ to, icon: Icon, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          className={({ isActive }) => `nav-item nav-item--child ${isActive ? 'active' : ''}`}
                          onClick={handleNavClick}
                        >
                          <Icon size={15} />
                          <span style={{ fontSize: 13 }}>{label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )
                }

                // Item normal
                const { to, icon: Icon, label } = item
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/dashboard'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={handleNavClick}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Rodapé: usuário + sair ───────────────────────────────── */}
        <div className="sidebar-footer">
          <div
            className={`sidebar-user ${collapsed ? 'sidebar-user--collapsed' : ''}`}
            title={collapsed ? `${user?.name} · ${roleLabel}` : undefined}
          >
            <div className="sidebar-user-avatar">{initials}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-role">{roleLabel}</div>
              </div>
            )}
          </div>

          <button
            className={`nav-item nav-item--logout ${collapsed ? 'nav-item--icon-only' : ''}`}
            onClick={handleLogout}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>

      </aside>
    </>
  )
}
