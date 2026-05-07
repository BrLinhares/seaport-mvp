import { useEffect, useState } from 'react'
import {
  Plus, Loader2, AlertCircle, CheckCircle,
  Clock, XCircle, Droplets,
} from 'lucide-react'
import { criar, listarMinhaEmbarcacao } from '../../../api/sondagensApi'
import { listarPorEmbarcacao } from '../../../api/tanquesApi'
import api from '../../../api/axios'

const TIPO_OPTIONS = [
  { value: 'COMBUSTIVEL', label: 'Combustível', cor: '#d97706' },
  { value: 'AGUA', label: 'Água Potável', cor: '#0284c7' },
]

const STATUS_CONFIG = {
  PENDENTE:  { label: 'Pendente',  bg: '#fef3c7', color: '#92400e', Icon: Clock },
  APROVADO:  { label: 'Aprovado',  bg: '#d1fae5', color: '#065f46', Icon: CheckCircle },
  REJEITADO: { label: 'Rejeitado', bg: '#fee2e2', color: '#991b1b', Icon: XCircle },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE
  const { Icon } = cfg
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
    }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

function PercentualBar({ pct, tipo }) {
  if (pct == null) return '—'
  const cor = tipo === 'COMBUSTIVEL'
    ? (pct < 30 ? '#dc2626' : pct < 70 ? '#d97706' : '#059669')
    : (pct < 30 ? '#0c4a6e' : pct < 70 ? '#0369a1' : '#0284c7')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
      <div style={{
        flex: 1, height: 8, borderRadius: 99,
        background: '#e5e7eb', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: cor, borderRadius: 99,
          transition: 'width 0.4s',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: cor, minWidth: 34 }}>
        {pct}%
      </span>
    </div>
  )
}

export default function SondagemPage() {
  // Auth + user info
  const [embarcacaoId, setEmbarcacaoId] = useState(null)
  const [embarcacaoNome, setEmbarcacaoNome] = useState('')

  // Tanques filtrados por tipo
  const [tanques, setTanques] = useState([])
  const [tanquesFiltrados, setTanquesFiltrados] = useState([])

  // Histórico
  const [historico, setHistorico] = useState([])
  const [loadingHist, setLoadingHist] = useState(true)

  // Formulário
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tipo: '', tanqueId: '', volumeLitros: '', dataHora: '' })
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tanqueSelecionado, setTanqueSelecionado] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Busca embarcacaoId do usuário logado
  useEffect(() => {
    api.get('/users/me').then(({ data }) => {
      setEmbarcacaoId(data.embarcacaoId || null)
      setEmbarcacaoNome(data.embarcacaoNome || '')
    }).catch(() => {})
  }, [])

  // Carrega tanques quando embarcacaoId disponível
  useEffect(() => {
    if (!embarcacaoId) return
    listarPorEmbarcacao(embarcacaoId).then(setTanques).catch(() => {})
  }, [embarcacaoId])

  // Filtra tanques por tipo selecionado
  useEffect(() => {
    if (!form.tipo) {
      setTanquesFiltrados([])
    } else {
      setTanquesFiltrados(tanques.filter(t => t.tipo === form.tipo))
    }
    set('tanqueId', '')
    setTanqueSelecionado(null)
  }, [form.tipo, tanques])

  // Atualiza tanque selecionado para exibir capacidade
  useEffect(() => {
    const t = tanques.find(t => String(t.id) === String(form.tanqueId))
    setTanqueSelecionado(t ?? null)
  }, [form.tanqueId, tanques])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!form.tipo || !form.tanqueId || !form.volumeLitros || !form.dataHora) {
      setFormError('Todos os campos são obrigatórios.')
      return
    }

    const volume = parseFloat(form.volumeLitros)
    if (isNaN(volume) || volume < 0) {
      setFormError('Volume deve ser um número não negativo.')
      return
    }
    if (tanqueSelecionado && volume > parseFloat(tanqueSelecionado.capacidade)) {
      setFormError(`Volume (${volume} L) excede a capacidade do tanque (${tanqueSelecionado.capacidade} L).`)
      return
    }

    setSaving(true)
    try {
      await criar({
        embarcacaoId: Number(embarcacaoId),
        tanqueId: Number(form.tanqueId),
        tipo: form.tipo,
        volumeLitros: volume,
        dataHora: new Date(form.dataHora).toISOString().replace('Z', ''),
      })
      setShowForm(false)
      setForm({ tipo: '', tanqueId: '', volumeLitros: '', dataHora: '' })
      carregarHistorico()
    } catch (err) {
      setFormError(err?.response?.data?.error ?? 'Erro ao registrar sondagem.')
    } finally {
      setSaving(false)
    }
  }

  const agoraLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)

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
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Sondagem de Tanques</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>
            {embarcacaoNome ? `Embarcação: ${embarcacaoNome}` : 'Registre a medição dos tanques a bordo'}
          </p>
        </div>
        {!showForm && (
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => {
              setShowForm(true)
              setForm({ tipo: '', tanqueId: '', volumeLitros: '', dataHora: agoraLocal })
              setFormError(null)
            }}
          >
            <Plus size={16} /> Nova Sondagem
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, borderTop: '3px solid var(--color-primary)' }}>
          <div className="card-header"><span className="card-title">Registrar Sondagem</span></div>
          <div className="card-body">
            {formError && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}>
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid-2">
                {/* Tipo */}
                <div className="form-group">
                  <label className="form-label">Tipo de Tanque *</label>
                  <select
                    className="form-input"
                    value={form.tipo}
                    onChange={e => set('tipo', e.target.value)}
                  >
                    <option value="">Selecione…</option>
                    {TIPO_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tanque */}
                <div className="form-group">
                  <label className="form-label">Tanque *</label>
                  <select
                    className="form-input"
                    value={form.tanqueId}
                    onChange={e => set('tanqueId', e.target.value)}
                    disabled={!form.tipo}
                  >
                    <option value="">
                      {!form.tipo ? 'Selecione o tipo primeiro' : tanquesFiltrados.length === 0 ? 'Nenhum tanque disponível' : 'Selecione…'}
                    </option>
                    {tanquesFiltrados.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nome} — {t.capacidade} {t.unidade ?? 'L'}
                      </option>
                    ))}
                  </select>
                  {tanqueSelecionado && (
                    <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
                      Capacidade: <strong>{tanqueSelecionado.capacidade} {tanqueSelecionado.unidade ?? 'L'}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="form-grid-2">
                {/* Volume */}
                <div className="form-group">
                  <label className="form-label">Volume Medido (litros) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max={tanqueSelecionado ? tanqueSelecionado.capacidade : undefined}
                    className="form-input"
                    placeholder="Ex: 3200"
                    value={form.volumeLitros}
                    onChange={e => set('volumeLitros', e.target.value)}
                  />
                  {tanqueSelecionado && form.volumeLitros && (
                    <PercentualBar
                      pct={Math.round((parseFloat(form.volumeLitros) / parseFloat(tanqueSelecionado.capacidade)) * 100)}
                      tipo={form.tipo}
                    />
                  )}
                </div>

                {/* Data/hora */}
                <div className="form-group">
                  <label className="form-label">Data e Hora da Medição *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={form.dataHora}
                    onChange={e => set('dataHora', e.target.value)}
                  />
                </div>
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
            <Droplets size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Histórico de Sondagens
          </span>
        </div>
        {loadingHist ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 size={24} className="spin" color="var(--color-primary)" />
          </div>
        ) : historico.length === 0 ? (
          <div className="card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-light)' }}>
            Nenhuma sondagem registrada ainda.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanque</th>
                  <th>Tipo</th>
                  <th>Volume</th>
                  <th>Nível</th>
                  <th>Data/Hora</th>
                  <th>Status</th>
                  <th>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(s => {
                  const tipoCfg = TIPO_OPTIONS.find(t => t.value === s.tipo)
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.tanqueNome}</td>
                      <td>
                        <span style={{ color: tipoCfg?.cor ?? 'inherit', fontWeight: 600, fontSize: 13 }}>
                          {tipoCfg?.label ?? s.tipo}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {Number(s.volumeLitros).toLocaleString('pt-BR')} L
                      </td>
                      <td><PercentualBar pct={s.percentual} tipo={s.tipo} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(s.dataHora).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td><StatusBadge status={s.status} /></td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-light)', maxWidth: 200 }}>
                        {s.status === 'REJEITADO' && s.motivoRejeicao
                          ? <span style={{ color: '#991b1b' }}>Rejeitado: {s.motivoRejeicao}</span>
                          : s.aprovadoPorNome
                          ? `Aprovado por ${s.aprovadoPorNome}`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card" style={{ marginTop: 12, background: 'var(--color-primary-light)', border: '1px solid #bae6f5' }}>
        <div className="card-body" style={{ padding: '12px 18px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>ℹ️ Fluxo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 3 }}>
            Sondagens ficam <strong>Pendentes</strong> até o gerente aprovar.
            Após aprovação, alimentam automaticamente o painel da embarcação.
          </p>
        </div>
      </div>
    </div>
  )
}
