import { useAuthStore } from '../../store/authStore'
import DashboardGerente from './DashboardGerente'
import DashboardDiretoria from './DashboardDiretoria'
import DashboardTripulacao from './DashboardTripulacao'

export default function DashboardHome() {
  const { user } = useAuthStore()

  switch (user?.role) {
    case 'ROLE_GERENTE':
      return <DashboardGerente />
    case 'ROLE_DIRETORIA':
      return <DashboardDiretoria />
    case 'ROLE_TRIPULACAO':
    default:
      return <DashboardTripulacao />
  }
}
