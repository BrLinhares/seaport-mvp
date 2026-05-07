import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileDown, Eye, Trash2, Loader2, AlertCircle, Package, Wrench, FileText
} from 'lucide-react'
import { requisicoesApi } from '../../../api/requisicoesApi'

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtData(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return `${day}/${m}/${y}`
}

function UrgBadge({ urgencia }) {
  return urgencia
    ? <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>⚡ Urgente</span>
    : <span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>Normal</span>
}

function ModalConfirm({ msg, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Confirmar exclusão</h2>
        <p className="modal-text">{msg}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="btn btn-danger" style={{ width: 'auto' }} onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={14} className="spin" /> : null} Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers PDF ───────────────────────────────────────────────────────────────
async function fetchPdfBlob(apiFn, id) {
  const res = await apiFn(id)
  return new Blob([res.data], { type: 'application/pdf' })
}

// ── Tab: Requisições de Material ──────────────────────────────────────────────
function TabMaterial({ navigate }) {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setLista(await requisicoesApi.listarMateriais()) }
    catch { setError('Erro ao carregar requisições de material.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handlePdf = async (id, numero, mode) => {
    setPdfLoading(`${id}-${mode}`)
    try {
      const blob = await fetchPdfBlob(requisicoesApi.baixarPdfMaterial, id)
      const url = URL.createObjectURL(blob)
      if (mode === 'view') {
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      } else {
        const a = document.createElement('a')
        a.href = url; a.download = `${numero}.pdf`; a.click()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }
    } catch { alert('Erro ao gerar PDF. Verifique o console do servidor.') }
    finally { setPdfLoading(null) }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try { await requisicoesApi.deletarMaterial(confirm.id); load(); setConfirm(null) }
    catch { alert('Erro ao excluir.') }
    finally { setDelLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Loader2 size={28} className="spin" color="var(--color-primary)" />
    </div>
  )

  return (
    <>
      {confirm && (
        <ModalConfirm
          msg={`Excluir a requisição ${confirm.numero}?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={delLoading}
        />
      )}
      {error && <div className="alert alert-error"><AlertCircle size={14} /> {error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-accent" style={{ width: 'auto' }}
          onClick={() => navigate('/dashboard/requisicoes/material/nova')}>
          <Plus size={15} /> Nova Requisição de Material
        </button>
      </div>
      {lista.length === 0 ? (
        <div className="placeholder-page">
          <Package size={40} color="var(--color-border)" />
          <h3>Nenhuma requisição de material</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            Crie a primeira requisição usando o botão acima.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Setor</th>
                <th>Solicitante</th>
                <th>Embarcação</th>
                <th>Itens</th>
                <th>Urgência</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(rm => (
                <tr key={rm.id}>
                  <td><strong style={{ color: 'var(--color-primary)' }}>{rm.numero}</strong></td>
                  <td>{fmtData(rm.data)}</td>
                  <td>{rm.setor}</td>
                  <td>
                    <div>{rm.solicitanteNome}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{rm.solicitanteCargo}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{rm.embarcacaoNome || '—'}</td>
                  <td>
                    <span className="badge badge-blue">{rm.itens?.length ?? 0} {rm.itens?.length === 1 ? 'item' : 'itens'}</span>
                  </td>
                  <td><UrgBadge urgencia={rm.urgencia} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn" title="Visualizar PDF"
                        onClick={() => handlePdf(rm.id, rm.numero, 'view')}
                        disabled={!!pdfLoading}>
                        {pdfLoading === `${rm.id}-view`
                          ? <Loader2 size={14} className="spin" />
                          : <Eye size={14} />}
                      </button>
                      <button className="action-btn" title="Baixar PDF"
                        onClick={() => handlePdf(rm.id, rm.numero, 'download')}
                        disabled={!!pdfLoading}>
                        {pdfLoading === `${rm.id}-download`
                          ? <Loader2 size={14} className="spin" />
                          : <FileDown size={14} />}
                      </button>
                      <button className="action-btn danger" title="Excluir"
                        onClick={() => setConfirm({ id: rm.id, numero: rm.numero })}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Tab: Requisições de Serviço ────────────────────────────────────────────────
function TabServico({ navigate }) {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setLista(await requisicoesApi.listarServicos()) }
    catch { setError('Erro ao carregar requisições de serviço.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handlePdf = async (id, numero, mode) => {
    setPdfLoading(`${id}-${mode}`)
    try {
      const blob = await fetchPdfBlob(requisicoesApi.baixarPdfServico, id)
      const url = URL.createObjectURL(blob)
      if (mode === 'view') {
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      } else {
        const a = document.createElement('a')
        a.href = url; a.download = `${numero}.pdf`; a.click()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }
    } catch { alert('Erro ao gerar PDF. Verifique o console do servidor.') }
    finally { setPdfLoading(null) }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try { await requisicoesApi.deletarServico(confirm.id); load(); setConfirm(null) }
    catch { alert('Erro ao excluir.') }
    finally { setDelLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Loader2 size={28} className="spin" color="var(--color-primary)" />
    </div>
  )

  return (
    <>
      {confirm && (
        <ModalConfirm
          msg={`Excluir a requisição ${confirm.numero}?`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={delLoading}
        />
      )}
      {error && <div className="alert alert-error"><AlertCircle size={14} /> {error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-accent" style={{ width: 'auto' }}
          onClick={() => navigate('/dashboard/requisicoes/servico/nova')}>
          <Plus size={15} /> Nova Requisição de Serviço
        </button>
      </div>
      {lista.length === 0 ? (
        <div className="placeholder-page">
          <Wrench size={40} color="var(--color-border)" />
          <h3>Nenhuma requisição de serviço</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
            Crie a primeira requisição usando o botão acima.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Setor</th>
                <th>Solicitante</th>
                <th>Embarcação</th>
                <th>Serviço Solicitado</th>
                <th>Local</th>
                <th>Urgência</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(rs => (
                <tr key={rs.id}>
                  <td><strong style={{ color: 'var(--color-primary)' }}>{rs.numero}</strong></td>
                  <td>{fmtData(rs.data)}</td>
                  <td>{rs.setor}</td>
                  <td>
                    <div>{rs.solicitanteNome}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>{rs.solicitanteCargo}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{rs.embarcacaoNome || '—'}</td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rs.servicoSolicitado}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-light)' }}>{rs.localExecucao}</td>
                  <td><UrgBadge urgencia={rs.urgencia} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn" title="Visualizar PDF"
                        onClick={() => handlePdf(rs.id, rs.numero, 'view')}
                        disabled={!!pdfLoading}>
                        {pdfLoading === `${rs.id}-view`
                          ? <Loader2 size={14} className="spin" />
                          : <Eye size={14} />}
                      </button>
                      <button className="action-btn" title="Baixar PDF"
                        onClick={() => handlePdf(rs.id, rs.numero, 'download')}
                        disabled={!!pdfLoading}>
                        {pdfLoading === `${rs.id}-download`
                          ? <Loader2 size={14} className="spin" />
                          : <FileDown size={14} />}
                      </button>
                      <button className="action-btn danger" title="Excluir"
                        onClick={() => setConfirm({ id: rs.id, numero: rs.numero })}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function RequisicoesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('material')

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} /> Requisições Operacionais
        </span>
      </div>
      <div className="card-body">
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button
            className={`tab-btn ${tab === 'material' ? 'active' : ''}`}
            onClick={() => setTab('material')}
          >
            <Package size={14} style={{ marginRight: 5 }} />
            Requisição de Material
          </button>
          <button
            className={`tab-btn ${tab === 'servico' ? 'active' : ''}`}
            onClick={() => setTab('servico')}
          >
            <Wrench size={14} style={{ marginRight: 5 }} />
            Requisição de Serviço
          </button>
        </div>

        {tab === 'material' && <TabMaterial navigate={navigate} />}
        {tab === 'servico' && <TabServico navigate={navigate} />}
      </div>
    </div>
  )
}
