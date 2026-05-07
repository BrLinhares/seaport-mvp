import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '../../api/authApi'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('newPassword')

  const onSubmit = async ({ newPassword }) => {
    if (!token) {
      setServerError('Token inválido ou ausente. Solicite um novo link.')
      return
    }
    setServerError('')
    setLoading(true)
    try {
      await authApi.resetPassword(token, newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setServerError(
        err.response?.data?.error || 'Token inválido ou expirado. Solicite um novo link.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="alert alert-error">
            <AlertCircle size={16} />
            Link inválido. Solicite um novo email de recuperação.
          </div>
          <Link to="/forgot-password" className="btn btn-primary" style={{ display: 'flex' }}>
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo-seaport.png" alt="Seaport" className="auth-logo-img" />
        </div>

        {success ? (
          <>
            <div className="alert alert-success">
              <CheckCircle size={16} />
              Senha redefinida com sucesso!
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-light)', marginBottom: 20 }}>
              Você será redirecionado para o login em instantes…
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'flex' }}>
              Ir para o login
            </Link>
          </>
        ) : (
          <>
            <h2 className="auth-title">Nova senha</h2>
            <p className="auth-subtitle">Crie uma nova senha para sua conta</p>

            {serverError && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Nova senha</label>
                <input
                  type="password"
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...register('newPassword', {
                    required: 'Nova senha é obrigatória',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                  })}
                />
                {errors.newPassword && (
                  <span className="form-error">
                    <AlertCircle size={12} />{errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar nova senha</label>
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
                {loading ? <span className="spinner" /> : 'Redefinir senha'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
