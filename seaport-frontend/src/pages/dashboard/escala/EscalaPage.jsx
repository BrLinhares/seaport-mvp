import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, XCircle, Loader2, AlertCircle, Clock, Archive } from 'lucide-react'
import { listarAtivasPorEmbarcacao, listarHistoricoPorEmbarcacao, criar, encerrar } from '../../../api/escalaApi'
import { listarPorEmbarcacao } from '../../../api/tripulantesApi'
import { listar as listarEmbarcacoes } from '../../../api/embarcacoesApi'

const TURNOS = [
  { value: 'TURNO_1', label: 'Turno 1' },
  { value: 'TURNO_2', label: 'Turno 2' },
  { value: 'TURNO_3', label: 'Turno 3' },
]

const FUNCOES_SUGESTAO = ['Comandante', 'Imediato', 'Mestre', 'Contramestre', 'Marinheiro', 'Moço de Convés', 'Mecânico', 'Eletricista']

function TurnoBadge({ turno }) {
  const colors = { TURNO_1: '#dbeafe #1e40af', TURNO_2: '#d1fae5 #065f46', TURNO_3: '#fef3c7 #92400e' }
  const [bg, color] = (colors[turno] ?? '#f3f4f6 #374151').split(' ')
  return (
    <span style={{ background: bg, color, padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
      {turno?.replace('_', ' ')}
    </span>
  )
}

const today = new Date().toISOString().split('T')[0]

export default function EscalaPage() {
  const { id: embarcacaoId } = useParams()
  const navigate = useNavigate()

  const [ativas, setAtivas] = useState([])
  const [historico, setHistorico] = useState([])
  const [tripulantes, setTripulantes] = useState([])
  const [embarcacaoNome, setEmbarcacaoNome] = useState('')
  const [tab, setTab] = useState('ativa')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ tripulanteId: '', funcao: '', turno: '', dataInicio: today })
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [encerrando, setEncerrando] = useState(null)

  const carregar = async () => {
    setLoading(true)
    try {
      const [a, h, t, embs] = await Promise.all([
        listarAtivasPorEmbarcacao(embarcacaoId),
        listarHistoricoPorEmbarcacao(embarcacaoId),
        listarPorEmbarcacao(embarcacaoId),
        listarEmbarcacoes(),
      ])
      setAtivas(a)
      setHistorico(h)
      setTripulantes(t.filter(x => x.ativo))
      const emb = embs.find(e => String(e.id) === String(embarcacaoId))
      setEmbarcacaoNome(emb?.nome ?? '')
    } catch {
      // ignored — will show empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [embarcacaoId])

  const handleCriar = async () => {
    setFormError(null)
    if (!form.tripulanteId || !form.funcao || !form.turno || !form.dataInicio) {
      setFormError('Todos os campos são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      await criar({
        tripulanteId: Number(form.tripulanteId),
        embarcacaoId: Number(embarcacaoId),
        funcao: form.funcao,
        turno: form.turno,
        dataInicio: form.dataInicio,
      })
      setShowModal(false)
      setForm({ tripulanteId: '', funcao: '', turno: '', dataInicio: today })
      carregar()
    } catch (e) {
      setFormError(e?.response?.data?.error ?? 'Erro ao adicionar à escala.')
    } finally {
      setSaving(false)
    }
  }

  const handleEncerrar = async (escalaId) => {
    setEncerrando(escalaId)
    try {
      await encerrar(escalaId)
      carregar()
    } catch (e) {
      alert(e?.response?.data?.error ?? 'Erro ao encerrar turno.')
    } finally {
      setEncerrando(null)
    }
  }

  const lista = tab === 'ativa' ? ativas : historico

  return (
    <div>
      <button
        className="btn btn-ghost"
        style={{ width: 'auto', marginBottom: 20, padding: '8px 16px', display: 'inline-flex', gap: 6 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
            Escala — {embarcacaoNome}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
            Controle de funções e turnos a bordo
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} /> Adicionar à Escala
        </button>
      </div>

      {/* Abas */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab-btn${tab === 'ativa' ? ' active' : ''}`} onClick={() => setTab('ativa')}>
          <Clock size={14} /> Turno Ativo ({ativas.length})
        </button>
        <button className={`tab-btn${tab === 'historico' ? ' active' : ''}`} onClick={() => setTab('historico')}>
          <Archive size={14} /> Histórico ({historico.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 size={28} className="spin" color="var(--color-primary)" />
        </div>
      ) : lista.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>
            Nenhum registro encontrado.
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tripulante</th>
                  <th>CIR</th>
                  <th>Função</th>
                  <th>Turno</th>
                  <th>Início</th>
                  <th>Fim</th>
                  {tab === 'ativa' && <th>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {lista.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.tripulanteNome}</td>
                    <td>{e.tripulanteCIR ?? '—'}</td>
                    <td>
                      {'Comandante'.toLowerCase() === e.funcao?.toLowerCase()
                        ? <span className="badge badge-tanque-comb">{e.funcao}</span>
                        : e.funcao}
                    </td>
                    <td><TurnoBadge turno={e.turno} /></td>
                    <td>{e.dataInicio ? new Date(e.dataInicio).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>{e.dataFim ? new Date(e.dataFim).toLocaleDateString('pt-BR') : <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Em vigor</span>}</td>
                    {tab === 'ativa' && (
                      <td>
                        <button
                          className="action-btn danger"
                          title="Encerrar turno"
                          disabled={encerrando === e.id}
                          onClick={() => handleEncerrar(e.id)}
                        >
                          {encerrando === e.id ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal adicionar escala */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <p className="modal-title">Adicionar à Escala</p>

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tripulante *</label>
              <select
                className="form-input"
                value={form.tripulanteId}
                onChange={e => setForm(f => ({ ...f, tripulanteId: e.target.value }))}
              >
                <option value="">Selecione…</option>
                {tripulantes.map(t => (
                  <option key={t.id} value={t.id}>{t.nomeCompleto}{t.numeroCIR ? ` — ${t.numeroCIR}` : ''}</option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Função *</label>
                <input
                  className="form-input"
                  list="funcoes-list"
                  placeholder="Ex: Comandante"
                  value={form.funcao}
                  onChange={e => setForm(f => ({ ...f, funcao: e.target.value }))}
                />
                <datalist id="funcoes-list">
                  {FUNCOES_SUGESTAO.map(f => <option key={f} value={f} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Turno *</label>
                <select
                  className="form-input"
                  value={form.turno}
                  onChange={e => setForm(f => ({ ...f, turno: e.target.value }))}
                >
                  <option value="">Selecione…</option>
                  {TURNOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Início *</label>
              <input
                type="date"
                className="form-input"
                value={form.dataInicio}
                onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ width: 'auto' }} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ width: 'auto', minWidth: 100 }} onClick={handleCriar} disabled={saving}>
                {saving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
