import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { requisicoesApi } from '../../../api/requisicoesApi'
import { useAuthStore } from '../../../store/authStore'
import { listar as listarEmbarcacoes } from '../../../api/embarcacoesApi'

export default function RequisicaoServicoFormPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    setor: 'Operações',
    solicitanteNome: user?.name ?? '',
    solicitanteCargo: '',
    urgencia: false,
    servicoSolicitado: '',
    descricaoDetalhada: '',
    localExecucao: '',
    justificativa: '',
    encaminhadoPara: '',
    observacoes: '',
    embarcacaoId: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [embarcacoes, setEmbarcacoes] = useState([])

  useEffect(() => {
    listarEmbarcacoes().then(setEmbarcacoes).catch(() => {})
  }, [])

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const payload = { ...form, embarcacaoId: form.embarcacaoId ? Number(form.embarcacaoId) : null }
      const res = await requisicoesApi.criarServico(payload)
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
              onClick={() => setSuccess(null)}>
              Nova Requisição
            </button>
          </div>
        </div>
      </div>
    )
  }

  const F = ({ label, k, required, placeholder, textarea, rows = 3 }) => (
    <div className="form-group">
      <label className="form-label">{label}{required ? ' *' : ''}</label>
      {textarea
        ? <textarea className="form-input" rows={rows} style={{ resize: 'vertical' }}
            placeholder={placeholder} value={form[k]}
            onChange={e => setField(k, e.target.value)} />
        : <input className="form-input" placeholder={placeholder}
            value={form[k]} onChange={e => setField(k, e.target.value)} />
      }
    </div>
  )

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Nova Requisição de Serviço</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>Código: RG.PS.ADM 4.03.1</span>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-error"><AlertCircle size={15} /> {error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Cabeçalho */}
            <div className="form-grid-2">
              <F label="Setor" k="setor" required />
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
              <F label="Solicitante" k="solicitanteNome" required />
              <F label="Cargo / Função" k="solicitanteCargo" required
                placeholder="Ex.: Coordenador de Operações" />
            </div>

            {/* Serviço */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '6px 0 16px' }} />

            <F label="Serviço solicitado" k="servicoSolicitado" required
              placeholder="Resumo do serviço solicitado" />

            <F label="Descrição detalhada do serviço" k="descricaoDetalhada" required
              textarea rows={4} placeholder="Descreva em detalhes o escopo do serviço..." />

            <F label="Local de execução" k="localExecucao" required
              placeholder="Ex.: Oficina mecânica autorizada" />

            <F label="Justificativa" k="justificativa" required
              textarea rows={3} placeholder="Justifique a necessidade do serviço..." />

            <div className="form-grid-2">
              <F label="Encaminhado para aprovação de" k="encaminhadoPara" required
                placeholder="Ex.: Victor da Ponte – Diretor" />
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

            <F label="Observações" k="observacoes" textarea rows={2} />

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
