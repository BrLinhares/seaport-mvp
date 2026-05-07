import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'

import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import UsersPage from './pages/dashboard/UsersPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import ProtectedRoute from './components/common/ProtectedRoute'

import EmbarcacoesPage from './pages/dashboard/embarcacoes/EmbarcacoesPage'
import EmbarcacaoFormPage from './pages/dashboard/embarcacoes/EmbarcacaoFormPage'
import EmbarcacaoDetailPage from './pages/dashboard/embarcacoes/EmbarcacaoDetailPage'
import DiretoriaEmbarcacoesPage from './pages/dashboard/embarcacoes/DiretoriaEmbarcacoesPage'
import EmbarcacaoDashboardPage from './pages/dashboard/embarcacoes/EmbarcacaoDashboardPage'

import RegistrosPage from './pages/dashboard/registros/RegistrosPage'
import NovoRegistroPage from './pages/dashboard/registros/NovoRegistroPage'

import TripulantesPage from './pages/dashboard/tripulantes/TripulantesPage'
import TripulanteFormPage from './pages/dashboard/tripulantes/TripulanteFormPage'
import EscalaPage from './pages/dashboard/escala/EscalaPage'

import ProcedimentosPage from './pages/dashboard/procedimentos/ProcedimentosPage'
import ProcedimentoFormPage from './pages/dashboard/procedimentos/ProcedimentoFormPage'

import SondagemPage from './pages/dashboard/sondagens/SondagemPage'
import SondagensGerenciaPage from './pages/dashboard/sondagens/SondagensGerenciaPage'

import ManobraPage from './pages/dashboard/manobras/ManobraPage'
import ManobraGerenciaPage from './pages/dashboard/manobras/ManobraGerenciaPage'

import NovoRegistroHubPage from './pages/dashboard/NovoRegistroHubPage'

import RequisicoesPage from './pages/dashboard/requisicoes/RequisicoesPage'
import RequisicaoMaterialFormPage from './pages/dashboard/requisicoes/RequisicaoMaterialFormPage'
import RequisicaoServicoFormPage from './pages/dashboard/requisicoes/RequisicaoServicoFormPage'

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function EmbarcacoesRoute() {
  const { user } = useAuthStore()
  return user?.role === 'ROLE_DIRETORIA' ? <DiretoriaEmbarcacoesPage /> : <EmbarcacoesPage />
}

// Rota que exige login E que a senha já foi trocada
function AppRoute({ children }) {
  const { isAuthenticated, mustChangePassword } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (mustChangePassword) return <Navigate to="/change-password" replace />
  return children
}

// Rota exclusiva para quem DEVE trocar a senha
function ChangePasswordRoute({ children }) {
  const { isAuthenticated, mustChangePassword } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!mustChangePassword) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotas públicas */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Troca de senha obrigatória — fora do dashboard */}
        <Route path="/change-password" element={
          <ChangePasswordRoute><ChangePasswordPage /></ChangePasswordRoute>
        } />

        {/* Rotas protegidas (exigem login + senha já trocada) */}
        <Route path="/dashboard" element={
          <AppRoute><DashboardLayout /></AppRoute>
        }>
          <Route index element={<DashboardHome />} />

          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="embarcacoes" element={<EmbarcacoesRoute />} />
          <Route path="embarcacoes/nova" element={<EmbarcacaoFormPage />} />
          <Route path="embarcacoes/:id" element={<EmbarcacaoDetailPage />} />
          <Route path="embarcacoes/:id/editar" element={<EmbarcacaoFormPage />} />
          <Route path="embarcacoes/:id/painel" element={<EmbarcacaoDashboardPage />} />

          <Route path="novo-registro" element={<NovoRegistroHubPage />} />

          <Route path="registros" element={<RegistrosPage />} />
          <Route path="registros/novo" element={<NovoRegistroPage />} />
          <Route path="registros/meus" element={<RegistrosPage />} />
          <Route path="registros/aprovados" element={<RegistrosPage />} />

          <Route path="tripulantes" element={<TripulantesPage />} />
          <Route path="tripulantes/novo" element={<TripulanteFormPage />} />
          <Route path="tripulantes/:id/editar" element={<TripulanteFormPage />} />
          <Route path="embarcacoes/:id/escala" element={<EscalaPage />} />

          <Route path="procedimentos" element={<ProcedimentosPage />} />
          <Route path="procedimentos/novo" element={<ProcedimentoFormPage />} />
          <Route path="procedimentos/:id/editar" element={<ProcedimentoFormPage />} />

          <Route path="sondagens" element={<SondagemPage />} />
          <Route path="sondagens/gerencia" element={<SondagensGerenciaPage />} />

          <Route path="manobras" element={<ManobraPage />} />
          <Route path="manobras/gerencia" element={<ManobraGerenciaPage />} />

          <Route path="requisicoes" element={<RequisicoesPage />} />
          <Route path="requisicoes/material/nova" element={<RequisicaoMaterialFormPage />} />
          <Route path="requisicoes/servico/nova" element={<RequisicaoServicoFormPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
