import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { requisicoesApi } from '../../../api/requisicoesApi'
import { useAuthStore } from '../../../store/authStore'
import { listar as listarEmbarcacoes } from '../../../api/embarcacoesApi'

const ITEM_VAZIO = { descricaoMaterial: '', quantidade: '', especificacaoTecnica: '', justificativa: '' }

export default function RequisicaoMaterialFormPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    setor: 'Operações',
    solicitanteNome: user?.name ?? '',
    solicitanteCargo: '',
    urgencia: false,
    encaminhadoPara: '',
    observacoes: '',
    embarcacaoId: '',
  })
  const [itens, setItens] = useState([{ ...ITEM_VAZIO }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [embarcacoes, setEmbarcacoes] = useState([])

  useEffect(() => {
    listarEmbarcacoes().then(setEmbarcacoes).catch(() => {})
  }, [])

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const setItem = (idx, k, v) => {
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [k]: v } : it))
  }

  const addItem = () => setItens(p => [...p, { ...ITEM_VAZIO }])
  const removeItem = (idx) => setItens(p => p.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (itens.length === 0) { setError('Adicione ao menos um item.'); return }
    const emptyItem = itens.find(it => !it.descricaoMaterial.trim() || !it.quantidade.trim())
    if (emptyItem) { setError('Preencha Descrição e Quantidade em todos os itens.'); return }

    setLoading(true); setError(null)
    try {
      const payload = { ...form, itens, embarcacaoId: form.embarcacaoId ? Number(form.embarcacaoId) : null }
      const res = await requisicoesApi.criarMaterial(payload)
      setSuccess(res.numero)
    } catch (e) {
      const d = e?.response?.data
      setError(d?.message ?? d?.error ?? 'Erro ao criar requisição.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <div className="alert alert-success">
            <CheckCircle size={18} />
            Requisição <strong>{success}</strong> criada com sucesso!
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" style={{ width: 'auto' }}
              onClick={() => navigate('/dashboard/requisicoes')}>
              Ver Requisições
            </button>
            <button className="btn btn-ghost" style={{ width: 'auto' }}
              onClick={() => { setSuccess(null); setItens([{ ...ITEM_VAZIO }]) }}>
              Nova Requisição
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Nova Requisição de Material</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>Código: RG.PS.ADM 4.03.1</span>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-error"><AlertCircle size={15} /> {error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Dados gerais */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Setor *</label>
                <input className="form-input" value={form.setor}
                  onChange={e => setField('setor', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Urgência</label>
                <select className="form-input" value={form.urgencia ? 'sim' : 'nao'}
                  onChange={e => setField('urgencia', e.target.value === 'sim')}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Solicitante *</label>
                <input className="form-input" value={form.solicitanteNome}
                  onChange={e => setField('solicitanteNome', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cargo / Função *</label>
                <input className="form-input" placeholder="Ex.: Coordenador de Operações"
                  value={form.solicitanteCargo}
                  onChange={e => setField('solicitanteCargo', e.target.value)} required />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Encaminhado para aprovação de *</label>
                <input className="form-input" placeholder="Ex.: Victor da Ponte – Diretor"
                  value={form.encaminhadoPara}
                  onChange={e => setField('encaminhadoPara', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Embarcação</label>
                <select className="form-input" value={form.embarcacaoId}
                  onChange={e => setField('embarcacaoId', e.target.value)}>
                  <option value="">— Nenhuma —</option>
                  {embarcacoes.map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Itens */}
            <div style={{ margin: '20px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Itens da Requisição</span>
              <button type="button" className="btn btn-accent" style={{ width: 'auto', padding: '7px 14px', fontSize: 13 }}
                onClick={addItem}>
                <Plus size={14} /> Adicionar Item
              </button>
            </div>

            {itens.map((item, idx) => (
              <div key={idx} style={{
                border: '1px solid var(--color-border)', borderRadius: 8,
                padding: 14, marginBottom: 10, background: 'var(--color-background)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-light)' }}>
                    ITEM {idx + 1}
                  </span>
                  {itens.length > 1 && (
                    <button type="button" className="action-btn danger" onClick={() => removeItem(idx)} title="Remover item">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Descrição do Material *</label>
                    <input className="form-input" value={item.descricaoMaterial}
                      onChange={e => setItem(idx, 'descricaoMaterial', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Quantidade *</label>
                    <input className="form-input" placeholder="Ex.: 10 Litros"
                      value={item.quantidade}
                      onChange={e => setItem(idx, 'quantidade', e.target.value)} />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Especificação Técnica</label>
                    <textarea className="form-input" rows={2} style={{ resize: 'vertical' }}
                      value={item.especificacaoTecnica}
                      onChange={e => setItem(idx, 'especificacaoTecnica', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Justificativa</label>
                    <textarea className="form-input" rows={2} style={{ resize: 'vertical' }}
                      value={item.justificativa}
                      onChange={e => setItem(idx, 'justificativa', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Observações</label>
              <textarea className="form-input" rows={3} style={{ resize: 'vertical' }}
                value={form.observacoes}
                onChange={e => setField('observacoes', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" className="btn btn-ghost" style={{ width: 'auto' }}
                onClick={() => navigate('/dashboard/requisicoes')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '11px 28px' }}
                disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : null}
                Criar Requisição
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
