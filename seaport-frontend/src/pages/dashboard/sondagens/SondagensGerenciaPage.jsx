import { useEffect, useState } from 'react'
import {
  CheckCircle, XCircle, Clock, Loader2,
  AlertCircle, Droplets,
} from 'lucide-react'
import { listarTodas, aprovar, rejeitar } from '../../../api/sondagensApi'

const TIPO_LABELS = { COMBUSTIVEL: 'Combustível', AGUA: 'Água Potável' }
const TIPO_CORES  = { COMBUSTIVEL: '#d97706', AGUA: '#0284c7' }

const STATUS_CONFIG = {
  PENDENTE:  { label: 'Pendente',  bg: '#fef3c7', color: '#92400e' },
  APROVADO:  { label: 'Aprovado',  bg: '#d1fae5', color: '#065f46' },
  REJEITADO: { label: 'Rejeitado', bg: '#fee2e2', color: '#991b1b' },
}

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

function PercentualBar({ pct, tipo }) {
  if (pct == null) return <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>—</span>
  const cor = tipo === 'COMBUSTIVEL'
    ? (pct < 30 ? '#dc2626' : pct < 70 ? '#d97706' : '#059669')
    : (pct < 30 ? '#0c4a6e' : pct < 70 ? '#0369a1' : '#0284c7')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 80, height: 8, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cor, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: cor }}>{pct}%</span>
    </div>
  )
}

const ABAS = ['PENDENTE', 'APROVADO', 'REJEITADO']

export default function SondagensGerenciaPage() {
  const [sondagens, setSondagens] = useState([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('PENDENTE')

  // Modal rejeição
  const [modalRejeitar, setModalRejeitar] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const carregar = async () => {
    setLoading(true)
    try {
      setSondagens(await listarTodas())
    } catch {
      // ignored
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const filtradas = sondagens.filter(s => s.status === abaAtiva)

  const handleAprovar = async (id) => {
    setActionLoading(id)
    try {
      await aprovar(id)
      carregar()
    } catch (e) {
      alert(e?.response?.data?.error ?? 'Erro ao aprovar sondagem.')
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
      setActionError(e?.response?.data?.error ?? 'Erro ao rejeitar sondagem.')
    } finally {
      setActionLoading(null)
    }
  }

  const contagens = ABAS.reduce((acc, s) => {
    acc[s] = sondagens.filter(x => x.status === s).length
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
          Sondagens de Tanques
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
          Analise e aprove medições enviadas pela tripulação
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
            <Droplets size={36} color="var(--color-text-light)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-light)' }}>
              Nenhuma sondagem {STATUS_CONFIG[abaAtiva].label.toLowerCase()}.
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
                  <th>Tanque</th>
                  <th>Tipo</th>
                  <th>Volume</th>
                  <th>Nível</th>
                  <th>Data/Hora</th>
                  <th>Registrado por</th>
                  <th>Status</th>
                  {abaAtiva === 'PENDENTE' && <th>Ações</th>}
                  {abaAtiva === 'REJEITADO' && <th>Motivo</th>}
                  {abaAtiva === 'APROVADO' && <th>Aprovado por</th>}
                </tr>
              </thead>
              <tbody>
                {filtradas.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.embarcacaoNome}</td>
                    <td>{s.tanqueNome}</td>
                    <td>
                      <span style={{ color: TIPO_CORES[s.tipo] ?? 'inherit', fontWeight: 600, fontSize: 13 }}>
                        {TIPO_LABELS[s.tipo] ?? s.tipo}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {Number(s.volumeLitros).toLocaleString('pt-BR')} L
                      <br />
                      <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                        cap. {Number(s.tanqueCapacidade).toLocaleString('pt-BR')} L
                      </span>
                    </td>
                    <td><PercentualBar pct={s.percentual} tipo={s.tipo} /></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {new Date(s.dataHora).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td>{s.usuarioNome}</td>
                    <td><StatusBadge status={s.status} /></td>

                    {abaAtiva === 'PENDENTE' && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn success"
                            title="Aprovar"
                            disabled={actionLoading === s.id}
                            onClick={() => handleAprovar(s.id)}
                          >
                            {actionLoading === s.id
                              ? <Loader2 size={14} className="spin" />
                              : <CheckCircle size={14} />}
                          </button>
                          <button
                            className="action-btn danger"
                            title="Rejeitar"
                            disabled={actionLoading === s.id}
                            onClick={() => { setModalRejeitar(s.id); setMotivo(''); setActionError(null) }}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    )}

                    {abaAtiva === 'REJEITADO' && (
                      <td style={{ fontSize: 12, color: '#991b1b', maxWidth: 200 }}>
                        {s.motivoRejeicao ?? '—'}
                      </td>
                    )}

                    {abaAtiva === 'APROVADO' && (
                      <td style={{ fontSize: 13 }}>
                        {s.aprovadoPorNome ?? '—'}
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
            <p className="modal-title">Rejeitar Sondagem</p>
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
                placeholder="Ex: Valor inconsistente com a última medição…"
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
