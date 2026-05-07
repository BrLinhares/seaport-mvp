import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Download, Eye, Ban, Loader2,
  AlertCircle, BookOpen, ChevronDown, ChevronUp,
} from 'lucide-react'
import { listar, inativar, baixarArquivo } from '../../../api/procedimentosApi'
import { useAuthStore } from '../../../store/authStore'

// Mapa de cores por parte
const PARTE_STYLE = {
  ADM: { bg: '#ede9fe', color: '#5b21b6', label: 'ADM' },
  COM: { bg: '#dbeafe', color: '#1e40af', label: 'COM' },
  EMB: { bg: '#d1fae5', color: '#065f46', label: 'EMB' },
  SMS: { bg: '#fef3c7', color: '#92400e', label: 'SMS' },
  EME: { bg: '#fee2e2', color: '#991b1b', label: 'EME' },
}

const PARTE_LABELS = {
  ADM: 'Administração — Procedimentos Sistêmicos',
  COM: 'Companhia — Procedimentos Sistêmicos',
  EMB: 'Embarcação — Procedimentos Operacionais',
  SMS: 'Segurança, Meio Ambiente e Saúde Ocupacional',
  EME: 'Emergências — Procedimentos Operacionais',
}

const ROLE_LABEL = {
  ROLE_GERENTE: 'Gerente',
  ROLE_TRIPULACAO: 'Tripulação',
  ROLE_DIRETORIA: 'Diretoria',
}

function ParteBadge({ parte }) {
  const s = PARTE_STYLE[parte] ?? { bg: '#f3f4f6', color: '#374151', label: parte }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {s.label}
    </span>
  )
}

function GrupoSection({ parte, procedimentos, isGerente, onInativar }) {
  const [aberto, setAberto] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(null)
  const style = PARTE_STYLE[parte] ?? {}

  const abrirPdf = async (id) => {
    setPdfLoading(`v${id}`)
    try {
      const { data } = await baixarArquivo(id, 'inline')
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      alert('Não foi possível abrir o arquivo PDF.')
    } finally {
      setPdfLoading(null)
    }
  }

  const downloadPdf = async (id, codigo) => {
    setPdfLoading(`d${id}`)
    try {
      const { data } = await baixarArquivo(id, 'download')
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${codigo ?? 'procedimento'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Não foi possível fazer o download.')
    } finally {
      setPdfLoading(null)
    }
  }

  return (
    <div className="proc-group" style={{ borderLeftColor: style.color ?? 'var(--color-primary)' }}>
      <button
        className="proc-group-header"
        onClick={() => setAberto(a => !a)}
        aria-expanded={aberto}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ParteBadge parte={parte} />
          <span className="proc-group-title">{PARTE_LABELS[parte] ?? parte}</span>
          <span className="proc-group-count">{procedimentos.length}</span>
        </span>
        {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {aberto && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Rev.</th>
                <th>Emissão</th>
                {isGerente && <th>Perfis</th>}
                <th>Arquivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {procedimentos.map(p => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{p.codigo}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.titulo}</td>
                  <td>{p.revisao ?? '—'}</td>
                  <td>
                    {p.dataEmissao
                      ? new Date(p.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  {isGerente && (
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.rolesPermitidas?.length === 0 ? (
                          <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>Nenhum</span>
                        ) : (
                          p.rolesPermitidas.map(r => (
                            <span key={r} style={{
                              background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                              padding: '1px 7px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                            }}>
                              {ROLE_LABEL[r] ?? r}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  )}
                  <td>
                    {p.temArquivo ? (
                      <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 12 }}>
                        <FileText size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        PDF
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      {p.temArquivo && (
                        <>
                          <button
                            className="action-btn"
                            title="Visualizar PDF"
                            disabled={pdfLoading !== null}
                            onClick={() => abrirPdf(p.id)}
                          >
                            {pdfLoading === `v${p.id}`
                              ? <Loader2 size={14} className="spin" />
                              : <Eye size={14} />}
                          </button>
                          <button
                            className="action-btn"
                            title="Download PDF"
                            disabled={pdfLoading !== null}
                            onClick={() => downloadPdf(p.id, p.codigo)}
                          >
                            {pdfLoading === `d${p.id}`
                              ? <Loader2 size={14} className="spin" />
                              : <Download size={14} />}
                          </button>
                        </>
                      )}
                      {isGerente && (
                        <>
                          <button
                            className="action-btn"
                            title="Editar"
                            onClick={() => window.location.href = `/dashboard/procedimentos/${p.id}/editar`}
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn danger"
                            title="Inativar"
                            onClick={() => onInativar(p)}
                          >
                            <Ban size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ProcedimentosPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isGerente = user?.role === 'ROLE_GERENTE'

  const [procedimentos, setProcedimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({ parte: '', busca: '' })
  const [confirmInativar, setConfirmInativar] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const carregar = async () => {
    setLoading(true)
    setError(null)
    try {
      setProcedimentos(await listar())
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        setError('Sessão expirada. Faça login novamente.')
      } else if (status === 403) {
        setError('Você não tem permissão para ver os procedimentos.')
      } else {
        setError('Não foi possível carregar os procedimentos.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const handleInativar = async (id) => {
    setActionLoading(true)
    try {
      await inativar(id)
      setConfirmInativar(null)
      carregar()
    } catch (e) {
      alert(e?.response?.data?.error ?? 'Erro ao inativar procedimento.')
    } finally {
      setActionLoading(false)
    }
  }

  // Filtragem e agrupamento
  const agrupado = useMemo(() => {
    const filtrado = procedimentos.filter(p => {
      if (filtros.parte && p.parte !== filtros.parte) return false
      if (filtros.busca) {
        const q = filtros.busca.toLowerCase()
        return p.titulo.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
      }
      return true
    })

    // Agrupar por parte, na ordem definida
    const ordem = ['ADM', 'COM', 'EMB', 'SMS', 'EME']
    const grupos = {}
    filtrado.forEach(p => {
      if (!grupos[p.parte]) grupos[p.parte] = []
      grupos[p.parte].push(p)
    })
    return ordem.filter(k => grupos[k]?.length > 0).map(k => ({ parte: k, items: grupos[k] }))
  }, [procedimentos, filtros])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Procedimentos Operacionais</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
            Manual de procedimentos — acesso conforme perfil
          </p>
        </div>
        {isGerente && (
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => navigate('/dashboard/procedimentos/novo')}
          >
            <Plus size={16} /> Novo Procedimento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Parte</label>
              <select
                className="form-input"
                value={filtros.parte}
                onChange={e => setFiltros(f => ({ ...f, parte: e.target.value }))}
              >
                <option value="">Todas as partes</option>
                {Object.entries(PARTE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{k} — {v.split('—')[0].trim()}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Busca (título ou código)</label>
              <input
                className="form-input"
                placeholder="Ex: PROC-001, Procedimento de…"
                value={filtros.busca}
                onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={28} className="spin" color="var(--color-primary)" />
        </div>
      ) : agrupado.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
            <BookOpen size={40} color="var(--color-text-light)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-light)' }}>Nenhum procedimento disponível.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {agrupado.map(({ parte, items }) => (
            <GrupoSection
              key={parte}
              parte={parte}
              procedimentos={items}
              isGerente={isGerente}
              onInativar={setConfirmInativar}
            />
          ))}
        </div>
      )}

      {/* Modal confirmar inativação */}
      {confirmInativar && (
        <div className="modal-overlay" onClick={() => setConfirmInativar(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <p className="modal-title">Inativar Procedimento</p>
            <p className="modal-text">
              Confirma a inativação de <strong>{confirmInativar.codigo} — {confirmInativar.titulo}</strong>?
              O registro será preservado no histórico.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" style={{ width: 'auto' }} onClick={() => setConfirmInativar(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                disabled={actionLoading}
                onClick={() => handleInativar(confirmInativar.id)}
              >
                {actionLoading ? <Loader2 size={14} className="spin" /> : <Ban size={14} />}
                Inativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
