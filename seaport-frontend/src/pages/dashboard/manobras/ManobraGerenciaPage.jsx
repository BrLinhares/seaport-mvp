import { useEffect, useState } from 'react'
import {
  CheckCircle, XCircle, Loader2, AlertCircle, Navigation2,
} from 'lucide-react'
import { listarTodas, aprovar, rejeitar } from '../../../api/manobraApi'

const STATUS_CONFIG = {
  PENDENTE:  { label: 'Pendente',  bg: '#fef3c7', color: '#92400e' },
  APROVADO:  { label: 'Aprovado',  bg: '#d1fae5', color: '#065f46' },
  REJEITADO: { label: 'Rejeitado', bg: '#fee2e2', color: '#991b1b' },
}

const ABAS = ['PENDENTE', 'APROVADO', 'REJEITADO']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  )
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function duracaoHoras(inicio, fim) {
  if (!inicio || !fim) return null
  const diff = (new Date(fim) - new Date(inicio)) / 60000
  if (diff <= 0) return null
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export default function ManobraGerenciaPage() {
  const [manobras, setManobras] = useState([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('PENDENTE')

  const [modalRejeitar, setModalRejeitar] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState(null)

  const carregar = async () => {
    setLoading(true)
    try {
      setManobras(await listarTodas())
    } catch {
      // ignored
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const filtradas = manobras.filter(m => m.status === abaAtiva)

  const handleAprovar = async (id) => {
    setActionLoading(id)
    try {
      await aprovar(id)
      carregar()
    } catch (e) {
      alert(e?.response?.data?.error ?? 'Erro ao aprovar manobra.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejeitar = async () => {
    if (!motivo.trim()) { setActionError('Motivo é obrigatório.'); return }
    setActionLoading(modalRejeitar)
    setActionError(null)
    try {
      await rejeitar(modalRejeitar, motivo)
      setModalRejeitar(null)
      setMotivo('')
      carregar()
    } catch (e) {
      setActionError(e?.response?.data?.error ?? 'Erro ao rejeitar manobra.')
    } finally {
      setActionLoading(null)
    }
  }

  const contagens = ABAS.reduce((acc, s) => {
    acc[s] = manobras.filter(x => x.status === s).length
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
          Manobras Realizadas
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
          Analise e aprove manobras enviadas pela tripulação
        </p>
      </div>

      {/* Abas */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        {ABAS.map(aba => {
          const cfg = STATUS_CONFIG[aba]
          return (
            <button
              key={aba}
              className={`tab-btn${abaAtiva === aba ? ' active' : ''}`}
              onClick={() => setAbaAtiva(aba)}
            >
              {cfg.label}
              {contagens[aba] > 0 && (
                <span style={{
                  marginLeft: 6, background: abaAtiva === aba ? 'white' : cfg.bg,
                  color: cfg.color, padding: '0 6px', borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {contagens[aba]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={28} className="spin" color="var(--color-primary)" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
            <Navigation2 size={36} color="var(--color-text-light)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-light)' }}>
              Nenhuma manobra {STATUS_CONFIG[abaAtiva].label.toLowerCase()}.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Embarcação</th>
                  <th>Tipo</th>
                  <th>Local</th>
                  <th>Navio / Cliente</th>
                  <th>Início</th>
                  <th>Fim / Duração</th>
                  <th>Consumo (L)</th>
                  <th>Registrado por</th>
                  <th>Status</th>
                  {abaAtiva === 'PENDENTE' && <th>Ações</th>}
                  {abaAtiva === 'REJEITADO' && <th>Motivo</th>}
                  {abaAtiva === 'APROVADO' && <th>Aprovado por</th>}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.embarcacaoNome}</td>
                    <td style={{ fontWeight: 600 }}>{m.tipoManobra}</td>
                    <td>{m.localManobra}</td>
                    <td>{m.navioOuCliente}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{fmt(m.dataHoraInicio)}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {fmt(m.dataHoraFim)}
                      {m.dataHoraInicio && m.dataHoraFim && (
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--color-text-light)' }}>
                          {duracaoHoras(m.dataHoraInicio, m.dataHoraFim)}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {Number(m.consumoCombustivel).toLocaleString('pt-BR')}
                    </td>
                    <td>{m.usuarioNome}</td>
                    <td><StatusBadge status={m.status} /></td>

                    {abaAtiva === 'PENDENTE' && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn success"
                            title="Aprovar"
                            disabled={actionLoading === m.id}
                            onClick={() => handleAprovar(m.id)}
                          >
                            {actionLoading === m.id
                              ? <Loader2 size={14} className="spin" />
                              : <CheckCircle size={14} />}
                          </button>
                          <button
                            className="action-btn danger"
                            title="Rejeitar"
                            disabled={actionLoading === m.id}
                            onClick={() => { setModalRejeitar(m.id); setMotivo(''); setActionError(null) }}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    )}

                    {abaAtiva === 'REJEITADO' && (
                      <td style={{ fontSize: 12, color: '#991b1b', maxWidth: 200 }}>
                        {m.motivoRejeicao ?? '—'}
                      </td>
                    )}

                    {abaAtiva === 'APROVADO' && (
                      <td style={{ fontSize: 13 }}>
                        {m.aprovadoPorNome ?? '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal rejeição */}
      {modalRejeitar && (
        <div className="modal-overlay" onClick={() => setModalRejeitar(null)}>
          <div className="modal-card" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <p className="modal-title">Rejeitar Manobra</p>
            <p className="modal-text">Informe o motivo da rejeição para que a tripulação seja orientada.</p>

            {actionError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>
                <AlertCircle size={13} /> {actionError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Motivo *</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Ex: Dados inconsistentes — horário não confere com o diário de bordo…"
                style={{ resize: 'vertical' }}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                style={{ width: 'auto' }}
                onClick={() => setModalRejeitar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                disabled={actionLoading === modalRejeitar}
                onClick={handleRejeitar}
              >
                {actionLoading === modalRejeitar
                  ? <Loader2 size={14} className="spin" />
                  : <XCircle size={14} />}
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
