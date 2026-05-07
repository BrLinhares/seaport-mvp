import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Ban, CheckCircle, Eye,
  Loader2, AlertCircle, Users, FileText,
} from 'lucide-react'
import { listar, inativar, ativar, urlDocumento } from '../../../api/tripulantesApi'
import { listar as listarEmbarcacoes } from '../../../api/embarcacoesApi'

// ── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ ativo }) {
  return (
    <span className={`badge ${ativo ? 'badge-ativo' : 'badge-inativo'}`}>
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function VencimentoBadge({ data }) {
  if (!data) return <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>—</span>

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(data + 'T00:00:00')
  const diff = Math.floor((venc - hoje) / 86400000)

  const [bg, color, label] = diff < 0
    ? ['#fee2e2', '#dc2626', `Vencida · ${venc.toLocaleDateString('pt-BR')}`]
    : diff <= 30
    ? ['#fef3c7', '#d97706', `${venc.toLocaleDateString('pt-BR')} · ${diff}d`]
    : ['#d1fae5', '#065f46', venc.toLocaleDateString('pt-BR')]

  return (
    <span style={{
      background: bg, color,
      padding: '2px 8px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function TripulantesPage() {
  const navigate = useNavigate()
  const [tripulantes, setTripulantes] = useState([])
  const [embarcacoes, setEmbarcacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({ embarcacaoId: '', ativo: '', nome: '' })

  // Modal de confirmação (inativar ou ativar)
  const [confirm, setConfirm] = useState(null)  // { tripulante, acao: 'inativar'|'ativar' }
  const [actionLoading, setActionLoading] = useState(false)

  // Modal visualização da CIR
  const [cirModal, setCirModal] = useState(null)

  const carregarTripulantes = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtros.embarcacaoId) params.embarcacaoId = filtros.embarcacaoId
      if (filtros.ativo !== '') params.ativo = filtros.ativo
      if (filtros.nome) params.nome = filtros.nome
      const page = await listar(params)
      setTripulantes(page.content ?? [])
    } catch {
      setError('Não foi possível carregar os tripulantes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listarEmbarcacoes().then(setEmbarcacoes).catch(() => {})
  }, [])

  useEffect(() => { carregarTripulantes() }, [filtros])

  const handleConfirmar = async () => {
    if (!confirm) return
    setActionLoading(true)
    try {
      if (confirm.acao === 'inativar') {
        await inativar(confirm.tripulante.id)
      } else {
        await ativar(confirm.tripulante.id)
      }
      setConfirm(null)
      carregarTripulantes()
    } catch (e) {
      alert(e?.response?.data?.error ?? `Erro ao ${confirm.acao} tripulante`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Tripulantes</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
            Cadastro e controle de tripulação
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => navigate('/dashboard/tripulantes/novo')}
        >
          <Plus size={16} /> Novo Tripulante
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Embarcação</label>
              <select
                className="form-input"
                value={filtros.embarcacaoId}
                onChange={e => setFiltros(f => ({ ...f, embarcacaoId: e.target.value }))}
              >
                <option value="">Todas</option>
                {embarcacoes.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={filtros.ativo}
                onChange={e => setFiltros(f => ({ ...f, ativo: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome</label>
              <input
                className="form-input"
                placeholder="Buscar por nome…"
                value={filtros.nome}
                onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={28} className="spin" color="var(--color-primary)" />
        </div>
      ) : tripulantes.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
            <Users size={40} color="var(--color-text-light)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-light)' }}>Nenhum tripulante encontrado.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CIR</th>
                  <th>Vencimento CIR</th>
                  <th>Embarcação</th>
                  <th>Categoria / Função</th>
                  <th>Entrada</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tripulantes.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.nomeCompleto}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{t.numeroCIR ?? '—'}</td>
                    <td><VencimentoBadge data={t.dataVencimentoCIR} /></td>
                    <td>{t.embarcacaoNome ?? '—'}</td>
                    <td>
                      {t.categoria || t.funcaoBase
                        ? <>{t.categoria ?? ''}{t.categoria && t.funcaoBase ? ' · ' : ''}{t.funcaoBase ?? ''}</>
                        : '—'}
                    </td>
                    <td>
                      {t.dataEntradaEmpresa
                        ? new Date(t.dataEntradaEmpresa + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td><StatusBadge ativo={t.ativo} /></td>
                    <td>
                      <div className="table-actions">
                        {/* Ver CIR (só se tem documento) */}
                        {t.documentoUrl && (
                          <button
                            className="action-btn"
                            title="Visualizar CIR"
                            onClick={() => setCirModal(t)}
                          >
                            <Eye size={14} />
                          </button>
                        )}

                        {/* Editar */}
                        <button
                          className="action-btn"
                          title="Editar"
                          onClick={() => navigate(`/dashboard/tripulantes/${t.id}/editar`)}
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Inativar ou Reativar */}
                        {t.ativo ? (
                          <button
                            className="action-btn danger"
                            title="Inativar"
                            onClick={() => setConfirm({ tripulante: t, acao: 'inativar' })}
                          >
                            <Ban size={14} />
                          </button>
                        ) : (
                          <button
                            className="action-btn success"
                            title="Reativar"
                            onClick={() => setConfirm({ tripulante: t, acao: 'ativar' })}
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal confirmar inativar / ativar */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <p className="modal-title">
              {confirm.acao === 'inativar' ? 'Inativar' : 'Reativar'} Tripulante
            </p>
            <p className="modal-text">
              Confirma a {confirm.acao === 'inativar' ? 'inativação' : 'reativação'} de{' '}
              <strong>{confirm.tripulante.nomeCompleto}</strong>?
              {confirm.acao === 'inativar' && ' O registro será preservado no histórico.'}
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                style={{ width: 'auto' }}
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{
                  width: 'auto',
                  background: confirm.acao === 'inativar' ? 'var(--color-error)' : 'var(--color-success)',
                  borderColor: confirm.acao === 'inativar' ? 'var(--color-error)' : 'var(--color-success)',
                }}
                disabled={actionLoading}
                onClick={handleConfirmar}
              >
                {actionLoading
                  ? <Loader2 size={14} className="spin" />
                  : confirm.acao === 'inativar' ? <Ban size={14} /> : <CheckCircle size={14} />}
                {confirm.acao === 'inativar' ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal visualização CIR */}
      {cirModal && (
        <div className="modal-overlay" onClick={() => setCirModal(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="modal-title">
              CIR — {cirModal.nomeCompleto}
              {cirModal.numeroCIR && (
                <span style={{ fontWeight: 400, color: 'var(--color-text-light)', marginLeft: 8, fontSize: 14 }}>
                  #{cirModal.numeroCIR}
                </span>
              )}
            </p>

            {cirModal.dataVencimentoCIR && (
              <div style={{ marginBottom: 16 }}>
                <VencimentoBadge data={cirModal.dataVencimentoCIR} />
              </div>
            )}

            {cirModal.tipoDocumento === 'IMAGEM' ? (
              <img
                src={urlDocumento(cirModal.documentoUrl)}
                alt="CIR"
                style={{
                  width: '100%', borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <FileText size={52} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--color-text-light)', fontSize: 14, marginBottom: 4 }}>
                  Documento em PDF
                </p>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                className="btn btn-ghost"
                style={{ width: 'auto' }}
                onClick={() => setCirModal(null)}
              >
                Fechar
              </button>
              <a
                href={urlDocumento(cirModal.documentoUrl)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: 'auto', textDecoration: 'none' }}
              >
                <Eye size={14} /> Abrir documento
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
