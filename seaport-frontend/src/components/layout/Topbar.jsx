import { Bell, Search, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/users': 'Usuários',
  '/dashboard/settings': 'Configurações',
  '/dashboard/embarcacoes': 'Embarcações',
  '/dashboard/embarcacoes/nova': 'Nova Embarcação',
  '/dashboard/registros': 'Registros Operacionais',
  '/dashboard/registros/novo': 'Novo Registro',
  '/dashboard/registros/meus': 'Meus Registros',
  '/dashboard/registros/aprovados': 'Registros Aprovados',
  '/dashboard/tripulantes': 'Tripulantes',
  '/dashboard/tripulantes/novo': 'Novo Tripulante',
  '/dashboard/procedimentos': 'Procedimentos Operacionais',
  '/dashboard/procedimentos/novo': 'Novo Procedimento',
  '/dashboard/sondagens': 'Sondagem de Tanques',
  '/dashboard/sondagens/gerencia': 'Sondagens de Tanques',
  '/dashboard/novo-registro': 'Novo Registro',
  '/dashboard/manobras': 'Manobras Realizadas',
  '/dashboard/manobras/gerencia': 'Manobras Realizadas',
  '/dashboard/requisicoes': 'Requisições Operacionais',
  '/dashboard/requisicoes/material/nova': 'Nova Requisição de Material',
  '/dashboard/requisicoes/servico/nova': 'Nova Requisição de Serviço',
}

const patternTitles = [
  { pattern: /^\/dashboard\/embarcacoes\/\d+\/painel$/, title: 'Painel da Embarcação' },
  { pattern: /^\/dashboard\/embarcacoes\/\d+\/editar$/, title: 'Editar Embarcação' },
  { pattern: /^\/dashboard\/embarcacoes\/\d+\/escala$/, title: 'Escala de Tripulação' },
  { pattern: /^\/dashboard\/embarcacoes\/\d+$/,         title: 'Detalhes da Embarcação' },
  { pattern: /^\/dashboard\/tripulantes\/\d+\/editar$/, title: 'Editar Tripulante' },
  { pattern: /^\/dashboard\/procedimentos\/\d+\/editar$/, title: 'Editar Procedimento' },
]

export default function Topbar() {
  const { pathname } = useLocation()
  const { toggleMobile, isMobile } = useSidebar()

  const title =
    pageTitles[pathname]
    ?? patternTitles.find(({ pattern }) => pattern.test(pathname))?.title
    ?? 'Seaport'

  return (
    <header className="topbar">
      {/* Botão hamburger — visível apenas no mobile */}
      {isMobile && (
        <button
          className="icon-btn topbar-hamburger"
          aria-label="Abrir menu"
          onClick={toggleMobile}
        >
          <Menu size={20} />
        </button>
      )}

      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Pesquisar">
          <Search size={18} />
        </button>
        <button className="icon-btn" aria-label="Notificações">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
