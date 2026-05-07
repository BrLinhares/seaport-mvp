import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
  Users, Plus, Pencil, KeyRound, ToggleLeft, ToggleRight,
  Loader2, AlertCircle, UserCheck, UserX
} from 'lucide-react'
import { usersApi } from '../../api/usersApi'
import api from '../../api/axios'

const ROLES = [
  { value: 'ROLE_GERENTE', label: 'Gerente' },
  { value: 'ROLE_DIRETORIA', label: 'Diretoria' },
  { value: 'ROLE_TRIPULACAO', label: 'Tripulação' },
]

function RoleBadge({ role }) {
  const map = {
    ROLE_GERENTE: { cls: 'role-gerente', label: 'Gerente' },
    ROLE_DIRETORIA: { cls: 'role-diretoria', label: 'Diretoria' },
    ROLE_TRIPULACAO: { cls: 'role-tripulacao', label: 'Tripulação' },
  }
  const entry = map[role] ?? { cls: 'badge-blue', label: role }
  return <span className={`role-badge ${entry.cls}`}>{entry.label}</span>
}

function StatusBadge({ enabled }) {
  return enabled
    ? <span className="status-badge status-active"><UserCheck size={11} /> Ativo</span>
    : <span className="status-badge status-inactive"><UserX size={11} /> Inativo</span>
}

function ModalCreateUser({ embarcacoes, onClose, onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')
  const role = watch('role')

  async function onSubmit(data) {
    setError('')
    try {
      await usersApi.criar(data)
      onSuccess()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Erro ao criar usuário.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Novo Usuário</h2>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className={`form-input${errors.name ? ' error' : ''}`}
              {...register('name', { required: 'Nome obrigatório' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              {...register('email', { required: 'Email obrigatório' })}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Senha temporária *</label>
            <input
              type="password"
              className={`form-input${errors.password ? ' error' : ''}`}
              {...register('password', { required: 'Senha obrigatória', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Perfil *</label>
            <select
              className={`form-input${errors.role ? ' error' : ''}`}
              {...register('role', { required: 'Perfil obrigatório' })}
            >
              <option value="">Selecione...</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>
          {role === 'ROLE_TRIPULACAO' && (
            <div className="form-group">
              <label className="form-label">Embarcação</label>
              <select className="form-input" {...register('embarcacaoId')}>
                <option value="">Nenhuma</option>
                {embarcacoes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          )}
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-accent" disabled={isSubmitting} style={{ width: 'auto' }}>
              {isSubmitting ? <Loader2 size={15} className="spin" /> : null}
              Criar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalEditUser({ user, embarcacoes, onClose, onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user.name,
      role: user.role,
      embarcacaoId: user.embarcacaoId ?? '',
      enabled: user.enabled,
    }
  })
  const [error, setError] = useState('')
  const role = watch('role')

  async function onSubmit(data) {
    setError('')
    try {
      await usersApi.atualizar(user.id, {
        name: data.name,
        role: data.role,
        embarcacaoId: data.role === 'ROLE_TRIPULACAO' ? (data.embarcacaoId || null) : null,
        enabled: data.enabled,
      })
      onSuccess()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Erro ao atualizar usuário.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Editar Usuário</h2>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className={`form-input${errors.name ? ' error' : ''}`}
              {...register('name', { required: 'Nome obrigatório' })}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Perfil *</label>
            <select
              className={`form-input${errors.role ? ' error' : ''}`}
              {...register('role', { required: 'Perfil obrigatório' })}
            >
              <option value="">Selecione...</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {errors.role && <p className="form-error">{errors.role.message}</p>}
          </div>
          {role === 'ROLE_TRIPULACAO' && (
            <div className="form-group">
              <label className="form-label">Embarcação</label>
              <select className="form-input" {...register('embarcacaoId')}>
                <option value="">Nenhuma</option>
                {embarcacoes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          )}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="enabled" {...register('enabled')} style={{ width: 16, height: 16 }} />
            <label htmlFor="enabled" className="form-label" style={{ marginBottom: 0 }}>Usuário habilitado</label>
          </div>
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: 'auto' }}>
              {isSubmitting ? <Loader2 size={15} className="spin" /> : null}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalResetPassword({ user, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  async function onSubmit(data) {
    setError('')
    try {
      await usersApi.resetarSenha(user.id, data.newPassword)
      onSuccess()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Erro ao resetar senha.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Resetar Senha</h2>
        <p className="modal-text">
          Definir nova senha temporária para <strong>{user.name}</strong>.
          O usuário deverá trocar a senha no próximo login.
        </p>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Nova senha temporária *</label>
            <input
              type="password"
              className={`form-input${errors.newPassword ? ' error' : ''}`}
              {...register('newPassword', {
                required: 'Senha obrigatória',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' }
              })}
            />
            {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: 'auto' }}>
              {isSubmitting ? <Loader2 size={15} className="spin" /> : null}
              Resetar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalToggleConfirm({ user, onClose, onConfirm, loading }) {
  const action = user.enabled ? 'desativar' : 'ativar'
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Confirmar ação</h2>
        <p className="modal-text">
          Deseja {action} o usuário <strong>{user.name}</strong>?
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button
            type="button"
            className={`btn ${user.enabled ? 'btn-danger' : 'btn-accent'}`}
            onClick={onConfirm}
            disabled={loading}
            style={{ width: 'auto' }}
          >
            {loading ? <Loader2 size={15} className="spin" /> : null}
            {user.enabled ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [embarcacoes, setEmbarcacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await usersApi.listar()
      setUsers(data)
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
    api.get('/embarcacoes').then(r => setEmbarcacoes(r.data)).catch(() => {})
  }, [loadUsers])

  function openEdit(user) {
    setSelectedUser(user)
    setModal('edit')
  }

  function openResetPassword(user) {
    setSelectedUser(user)
    setModal('reset-password')
  }

  function openToggleConfirm(user) {
    setSelectedUser(user)
    setModal('toggle-confirm')
  }

  function closeModal() {
    setModal(null)
    setSelectedUser(null)
  }

  async function handleToggle() {
    setToggleLoading(true)
    try {
      await usersApi.toggleEnabled(selectedUser.id)
      closeModal()
      await loadUsers()
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Erro ao alterar status.')
      closeModal()
    } finally {
      setToggleLoading(false)
    }
  }

  function handleSuccess() {
    closeModal()
    loadUsers()
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Usuários
          </span>
          <button
            className="btn btn-accent"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={() => setModal('create')}
          >
            <Plus size={15} /> Novo Usuário
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {error && (
            <div className="alert alert-error" style={{ margin: '16px 22px' }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Loader2 size={28} className="spin" color="var(--color-primary)" />
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                    <th>Embarcação</th>
                    <th>Status</th>
                    <th>Senha</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: 32 }}>
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>{u.embarcacaoNome ?? '—'}</td>
                      <td><StatusBadge enabled={u.enabled} /></td>
                      <td>
                        {u.mustChangePassword
                          ? <span className="temp-badge">⚠ Temp</span>
                          : '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn"
                            title="Editar"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="action-btn"
                            title={u.enabled ? 'Desativar' : 'Ativar'}
                            onClick={() => openToggleConfirm(u)}
                          >
                            {u.enabled
                              ? <ToggleRight size={14} color="var(--color-accent)" />
                              : <ToggleLeft size={14} />}
                          </button>
                          <button
                            className="action-btn"
                            title="Resetar Senha"
                            onClick={() => openResetPassword(u)}
                          >
                            <KeyRound size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal === 'create' && (
        <ModalCreateUser
          embarcacoes={embarcacoes}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {modal === 'edit' && selectedUser && (
        <ModalEditUser
          user={selectedUser}
          embarcacoes={embarcacoes}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {modal === 'reset-password' && selectedUser && (
        <ModalResetPassword
          user={selectedUser}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {modal === 'toggle-confirm' && selectedUser && (
        <ModalToggleConfirm
          user={selectedUser}
          onClose={closeModal}
          onConfirm={handleToggle}
          loading={toggleLoading}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.7s linear infinite; }
      `}</style>
    </>
  )
}
