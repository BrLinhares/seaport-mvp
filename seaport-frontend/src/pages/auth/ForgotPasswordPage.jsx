import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { authApi } from '../../api/authApi'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setServerError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch {
      setServerError('Erro ao enviar email. Tente novamente.')
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

        {sent ? (
          <>
            <div className="alert alert-success">
              <CheckCircle size={16} />
              Email enviado! Verifique sua caixa de entrada e spam.
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-light)', marginBottom: 20 }}>
              Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha em até alguns minutos.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'flex' }}>
              <ArrowLeft size={16} />
              Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <h2 className="auth-title">Recuperar senha</h2>
            <p className="auth-subtitle">
              Informe seu email e enviaremos as instruções
            </p>

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

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Enviar instruções'}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/login">
                <ArrowLeft size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
