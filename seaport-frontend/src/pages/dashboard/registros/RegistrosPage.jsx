import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardList, CheckSquare, XCircle, Loader2, Filter } from 'lucide-react'
import { registrosApi } from '../../../api/registrosApi'
import { useAuthStore } from '../../../store/authStore'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REJEITADO', label: 'Rejeitado' },
]

function RejeicaoModal({ onClose, onConfirm, loading }) {
  const [motivo, setMotivo] = useState('')
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-title">Rejeitar Registro</div>
        <div className="form-group">
          <label className="form-label">Motivo da rejeição *</label>
          <textarea
            className="form-input"
            rows={3}
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Descreva o motivo..."
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading} style={{ width: 'auto' }}>
            Cancelar
          </button>
          <button className="btn btn-danger" style={{ width: 'auto' }}
            onClick={() => motivo.trim() && onConfirm(motivo)}
            disabled={loading || !motivo.trim()}>
            {loading ? <Loader2 size={16} /> : <XCircle size={16} />}
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RegistrosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState({ content: [], totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejeicaoTarget, setRejeicaoTarget] = useState(null)
  const [error, setError] = useState(null)

  const { user } = useAuthStore()
  const isTripulacao = user?.role === 'ROLE_TRIPULACAO'
  const statusFilter = searchParams.get('status') ?? ''

  async function load() {
    setLoading(true)
    setError(null)
    try {
      if (isTripulacao) {
        // Tripulação só pode ver registros da sua embarcação
        const lista = await registrosApi.listarMinhaEmbarcacao()
        setData({ content: lista, totalElements: lista.length })
      } else {
        const result = await registrosApi.listarTodos({
          status: statusFilter || undefined,
          size: 20,
        })
        setData(result)
      }
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) {
        setError('Você não tem permissão para acessar os registros.')
      } else if (status === 401) {
        setError('Sessão expirada. Faça login novamente.')
      } else {
        setError('Erro ao carregar registros.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, isTripulacao])

  async function handleAprovar(id) {
    setActionLoading(id)
    try {
      await registrosApi.aprovar(id)
      await load()
    } catch (e) {
      alert(e.response?.data?.error ?? 'Erro ao aprovar')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejeitar(id, motivo) {
    setActionLoading(id)
    try {
      await registrosApi.rejeitar(id, motivo)
      setRejeicaoTarget(null)
      await load()
    } catch (e) {
      alert(e.response?.data?.error ?? 'Erro ao rejeitar')
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (s) => {
    const map = {
      PENDENTE: { color: '#f59e0b', bg: '#fffbeb' },
      APROVADO: { color: '#16a34a', bg: '#f0fdf4' },
      REJEITADO: { color: '#dc2626', bg: '#fef2f2' },
    }
    const c = map[s] ?? map.PENDENTE
    return (
      <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
        {s}
      </span>
    )
  }

  return (
    <div>
      {rejeicaoTarget && (
        <RejeicaoModal
          loading={!!actionLoading}
          onClose={() => setRejeicaoTarget(null)}
          onConfirm={(motivo) => handleRejeitar(rejeicaoTarget, motivo)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          {isTripulacao ? 'Meus Registros' : 'Registros Operacionais'}
          <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--color-text-light)', marginLeft: 8 }}>
            ({data.totalElements} total)
          </span>
        </h2>
        {!isTripulacao && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="var(--color-text-light)" />
            <select
              className="form-input"
              style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
              value={statusFilter}
              onChange={e => setSearchParams(e.target.value ? { status: e.target.value } : {})}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div className="placeholder-page" style={{ height: 160 }}>
              <span className="spinner spinner-dark" />
            </div>
          ) : data.content.length === 0 ? (
            <div className="placeholder-page" style={{ height: 160 }}>
              <ClipboardList size={36} strokeWidth={1.5} />
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Embarcação</th>
                  <th>Tipo</th>
                  <th>Criado por</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.embarcacaoNome}</td>
                    <td><span className="badge badge-blue">{r.tipo}</span></td>
                    <td style={{ fontSize: 13 }}>{r.criadorNome}</td>
                    <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {r.descricao}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                      {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      {!isTripulacao && r.status === 'PENDENTE' && (
                        <div className="table-actions">
                          <button
                            className="action-btn"
                            title="Aprovar"
                            style={{ color: '#16a34a' }}
                            disabled={actionLoading === r.id}
                            onClick={() => handleAprovar(r.id)}
                          >
                            {actionLoading === r.id ? <Loader2 size={15} /> : <CheckSquare size={15} />}
                          </button>
                          <button
                            className="action-btn danger"
                            title="Rejeitar"
                            disabled={actionLoading === r.id}
                            onClick={() => setRejeicaoTarget(r.id)}
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      )}
                      {r.status === 'REJEITADO' && r.motivoRejeicao && (
                        <span style={{ fontSize: 11, color: '#dc2626' }} title={r.motivoRejeicao}>
                          ⚠ {r.motivoRejeicao.slice(0, 30)}…
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
