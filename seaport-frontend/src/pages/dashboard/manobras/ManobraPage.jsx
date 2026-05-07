import { useEffect, useState } from 'react'
import { Plus, Loader2, AlertCircle, Navigation2 } from 'lucide-react'
import { criar, listarMinhaEmbarcacao } from '../../../api/manobraApi'
import api from '../../../api/axios'

const TIPOS_MANOBRA = [
  'Atracação',
  'Desatracação',
  'Fundeio',
  'Desfundeio',
  'Saída do Porto',
  'Entrada no Porto',
  'Reboque',
  'Manobra em Área',
  'Transferência de Berço',
  'Outro',
]

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

const FORM_INICIAL = {
  localManobra: '',
  navioOuCliente: '',
  tipoManobra: '',
  dataHoraInicio: '',
  dataHoraFim: '',
  consumoCombustivel: '',
  observacoes: '',
}

export default function ManobraPage() {
  const [embarcacaoId, setEmbarcacaoId] = useState(null)
  const [embarcacaoNome, setEmbarcacaoNome] = useState('')

  const [historico, setHistorico] = useState([])
  const [loadingHist, setLoadingHist] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const agora = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  useEffect(() => {
    api.get('/users/me').then(({ data }) => {
      setEmbarcacaoId(data.embarcacaoId || null)
      setEmbarcacaoNome(data.embarcacaoNome || '')
    }).catch(() => {})
  }, [])

  const carregarHistorico = async () => {
    if (!embarcacaoId) return
    setLoadingHist(true)
    try {
      setHistorico(await listarMinhaEmbarcacao())
    } catch {
      // ignored
    } finally {
      setLoadingHist(false)
    }
  }

  useEffect(() => { if (embarcacaoId) carregarHistorico() }, [embarcacaoId])

  const abrirForm = () => {
    setForm({ ...FORM_INICIAL, dataHoraInicio: agora() })
    setFormError(null)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!form.localManobra || !form.navioOuCliente || !form.tipoManobra ||
        !form.dataHoraInicio || !form.dataHoraFim || form.consumoCombustivel === '') {
      setFormError('Todos os campos obrigatórios devem ser preenchidos.')
      return
    }

    const consumo = parseFloat(form.consumoCombustivel)
    if (isNaN(consumo) || consumo < 0) {
      setFormError('Consumo de combustível deve ser um número não negativo.')
      return
    }

    if (new Date(form.dataHoraFim) <= new Date(form.dataHoraInicio)) {
      setFormError('Data/hora de fim deve ser posterior ao início.')
      return
    }

    setSaving(true)
    try {
      await criar({
        embarcacaoId: Number(embarcacaoId),
        localManobra: form.localManobra,
        navioOuCliente: form.navioOuCliente,
        tipoManobra: form.tipoManobra,
        dataHoraInicio: new Date(form.dataHoraInicio).toISOString().replace('Z', ''),
        dataHoraFim: new Date(form.dataHoraFim).toISOString().replace('Z', ''),
        consumoCombustivel: consumo,
        observacoes: form.observacoes || null,
      })
      setShowForm(false)
      setForm(FORM_INICIAL)
      carregarHistorico()
    } catch (err) {
      setFormError(err?.response?.data?.error ?? 'Erro ao registrar manobra.')
    } finally {
      setSaving(false)
    }
  }

  if (!embarcacaoId) {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
          <AlertCircle size={36} color="var(--color-warning)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-light)' }}>
            Você não está vinculado a nenhuma embarcação.
            Solicite ao gerente que faça o vínculo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Manobras Realizadas</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
            {embarcacaoNome ? `Embarcação: ${embarcacaoNome}` : 'Registre as manobras realizadas'}
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={abrirForm}
          >
            <Plus size={16} /> Nova Manobra
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderTop: '3px solid var(--color-primary)' }}>
          <div className="card-header"><span className="card-title">Registrar Manobra</span></div>
          <div className="card-body">
            {formError && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}>
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Local da Manobra *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Porto de Santos — Berço 12"
                    value={form.localManobra}
                    onChange={e => set('localManobra', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Navio ou Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Navio MSC Aurora"
                    value={form.navioOuCliente}
                    onChange={e => set('navioOuCliente', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipo de Manobra *</label>
                  <select
                    className="form-input"
                    value={form.tipoManobra}
                    onChange={e => set('tipoManobra', e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {TIPOS_MANOBRA.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Consumo de Combustível (L) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    className="form-input"
                    placeholder="Ex: 500"
                    value={form.consumoCombustivel}
                    onChange={e => set('consumoCombustivel', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Data/Hora de Início *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.dataHoraInicio}
                    onChange={e => set('dataHoraInicio', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data/Hora de Fim *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.dataHoraFim}
                    onChange={e => set('dataHoraFim', e.target.value)}
                  />
                  {form.dataHoraInicio && form.dataHoraFim && (
                    <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
                      Duração: <strong>{duracaoHoras(form.dataHoraInicio, form.dataHoraFim) ?? '—'}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Informações adicionais sobre a manobra…"
                  style={{ resize: 'vertical' }}
                  value={form.observacoes}
                  onChange={e => set('observacoes', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ width: 'auto' }}
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto', minWidth: 130 }}
                  disabled={saving}
                >
                  {saving ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                  Enviar para Aprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Navigation2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Histórico de Manobras
          </span>
        </div>
        {loadingHist ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 size={24} className="spin" color="var(--color-primary)" />
          </div>
        ) : historico.length === 0 ? (
          <div className="card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>
            Nenhuma manobra registrada ainda.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Local</th>
                  <th>Navio / Cliente</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Consumo (L)</th>
                  <th>Status</th>
                  <th>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(m => (
                  <tr key={m.id}>
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
                    <td><StatusBadge status={m.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-light)', maxWidth: 200 }}>
                      {m.status === 'REJEITADO' && m.motivoRejeicao
                        ? <span style={{ color: '#991b1b' }}>Rejeitado: {m.motivoRejeicao}</span>
                        : m.aprovadoPorNome
                        ? `Aprovado por ${m.aprovadoPorNome}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 12, background: 'var(--color-primary-light)', border: '1px solid #bae6f5' }}>
        <div className="card-body" style={{ padding: '12px 18px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>ℹ️ Fluxo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 3 }}>
            Manobras ficam <strong>Pendentes</strong> até o gerente aprovar.
            Após aprovação, aparecem no painel da embarcação.
          </p>
        </div>
      </div>
    </div>
  )
}
