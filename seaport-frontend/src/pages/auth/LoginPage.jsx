import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setServerError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      login(data)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.error || 'Erro ao conectar com o servidor'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo-seaport.png" alt="Seaport" className="auth-logo-img" />
        </div>

        <h2 className="auth-title">Bem-vindo de volta</h2>
        <p className="auth-subtitle">Entre com suas credenciais para acessar</p>

        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' }
              })}
            />
            {errors.email && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.email.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password', { required: 'Senha é obrigatória' })}
            />
            {errors.password && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.password.message}
              </span>
            )}
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password" className="auth-link">
              Esqueceu a senha?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          Não tem conta?{' '}
          <Link to="/register">Criar conta</Link>
        </div>
      </div>
    </div>
  )
}
