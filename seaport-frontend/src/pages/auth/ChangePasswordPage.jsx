import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { KeyRound, AlertCircle, CheckCircle, LogOut } from 'lucide-react'
import { usersApi } from '../../api/usersApi'
import { useAuthStore } from '../../store/authStore'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { clearMustChangePassword, logout, user } = useAuthStore()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const newPassword = watch('newPassword')

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError('')
    setLoading(true)
    try {
      await usersApi.changePassword(currentPassword, newPassword)
      clearMustChangePassword()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.error ?? 'Erro ao alterar senha. Verifique a senha atual.'
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

        <div style={{
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 24,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <KeyRound size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
              Troca de senha obrigatória
            </p>
            <p style={{ fontSize: 13, color: '#78350f', marginTop: 2 }}>
              Por segurança, você precisa definir uma nova senha antes de continuar.
            </p>
          </div>
        </div>

        <h2 className="auth-title">Criar nova senha</h2>
        <p className="auth-subtitle">Olá, <strong>{user?.name}</strong>. Escolha uma senha segura.</p>

        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Senha temporária atual</label>
            <input
              type="password"
              className={`form-input ${errors.currentPassword ? 'error' : ''}`}
              placeholder="Senha que você recebeu"
              autoComplete="current-password"
              {...register('currentPassword', { required: 'Senha atual é obrigatória' })}
            />
            {errors.currentPassword && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.currentPassword.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Nova senha</label>
            <input
              type="password"
              className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              {...register('newPassword', {
                required: 'Nova senha é obrigatória',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
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
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Confirmação é obrigatória',
                validate: (v) => v === newPassword || 'As senhas não coincidem',
              })}
            />
            {errors.confirmPassword && (
              <span className="form-error">
                <AlertCircle size={12} />{errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : <CheckCircle size={16} />}
            Salvar nova senha
          </button>
        </form>

        <div className="auth-links" style={{ marginTop: 16 }}>
          <button
            className="auth-link"
            onClick={() => { logout(); navigate('/login') }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <LogOut size={13} /> Sair e entrar com outra conta
          </button>
        </div>
      </div>
    </div>
  )
}
