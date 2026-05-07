import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async ({ name, email, password }) => {
    setServerError('')
    setLoading(true)
    try {
      const { data } = await authApi.register(name, email, password)
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.error ||
        err.response?.data?.fields?.email ||
        'Erro ao criar conta'
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

        <h2 className="auth-title">Criar conta</h2>
        <p className="auth-subtitle">Preencha os dados para se cadastrar</p>

        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Seu nome"
              autoComplete="name"
              {...register('name', {
                required: 'Nome é obrigatório',
                minLength: { value: 2, message: 'Nome muito curto' }
              })}
            />
            {errors.name && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.name.message}
              </span>
            )}
          </div>

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
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' }
              })}
            />
            {errors.password && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.password.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar senha</label>
            <input
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repita a senha"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Confirme a senha',
                validate: (v) => v === password || 'As senhas não coincidem'
              })}
            />
            {errors.confirmPassword && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Criar conta'}
          </button>
        </form>

        <div className="auth-links">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  )
}
