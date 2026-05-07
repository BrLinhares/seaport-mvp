import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, AlertCircle,
  Upload, FileText, Image, X,
} from 'lucide-react'
import { criar, atualizar, buscarPorId, urlDocumento } from '../../../api/tripulantesApi'
import { listar as listarEmbarcacoes } from '../../../api/embarcacoesApi'

// Retorna status de vencimento do CIR com cor e rótulo
function statusVencimento(dataStr) {
  if (!dataStr) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataStr + 'T00:00:00')
  const diffDias = Math.floor((venc - hoje) / 86400000)
  if (diffDias < 0)
    return { label: `⚠ Vencida há ${Math.abs(diffDias)} dia${Math.abs(diffDias) !== 1 ? 's' : ''}`, cor: '#dc2626' }
  if (diffDias === 0)
    return { label: '⚠ Vence hoje', cor: '#dc2626' }
  if (diffDias <= 30)
    return { label: `⚠ Vence em ${diffDias} dia${diffDias !== 1 ? 's' : ''}`, cor: '#d97706' }
  return { label: `✓ Válida por mais ${diffDias} dias`, cor: '#059669' }
}

export default function TripulanteFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [embarcacoes, setEmbarcacoes] = useState([])
  const [loadingData, setLoadingData] = useState(isEdit)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const [campos, setCampos] = useState({
    embarcacaoId: '',
    nomeCompleto: '',
    numeroCIR: '',
    dataVencimentoCIR: '',
    categoria: '',
    funcaoBase: '',
    dataEntradaEmpresa: '',
  })

  // Documento CIR existente (somente em edit)
  const [docUrl, setDocUrl] = useState(null)
  const [docTipo, setDocTipo] = useState(null)

  // Arquivo novo selecionado pelo usuário (criação ou substituição)
  const [arquivoNovo, setArquivoNovo] = useState(null)

  const set = (key, val) => setCampos(f => ({ ...f, [key]: val }))

  useEffect(() => {
    listarEmbarcacoes().then(setEmbarcacoes).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    buscarPorId(id)
      .then(d => {
        setCampos({
          embarcacaoId: d.embarcacaoId ?? '',
          nomeCompleto: d.nomeCompleto ?? '',
          numeroCIR: d.numeroCIR ?? '',
          dataVencimentoCIR: d.dataVencimentoCIR ?? '',
          categoria: d.categoria ?? '',
          funcaoBase: d.funcaoBase ?? '',
          dataEntradaEmpresa: d.dataEntradaEmpresa ?? '',
        })
        setDocUrl(d.documentoUrl ? urlDocumento(d.documentoUrl) : null)
        setDocTipo(d.tipoDocumento)
      })
      .catch(() => setApiError('Erro ao carregar tripulante.'))
      .finally(() => setLoadingData(false))
  }, [id, isEdit])

  const validar = () => {
    const e = {}
    if (!campos.nomeCompleto.trim()) e.nomeCompleto = 'Nome é obrigatório'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)
    if (!validar()) return
    setSubmitLoading(true)
    try {
      if (isEdit) {
        await atualizar(id, campos, arquivoNovo)
      } else {
        await criar(campos, arquivoNovo)
      }
      navigate('/dashboard/tripulantes')
    } catch (err) {
      setApiError(err?.response?.data?.error ?? 'Erro ao salvar tripulante.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleArquivo = (e) => {
    const file = e.target.files[0]
    if (file) setArquivoNovo(file)
  }

  const removerArquivoNovo = () => {
    setArquivoNovo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const vencStatus = statusVencimento(campos.dataVencimentoCIR)

  if (loadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Loader2 size={32} className="spin" color="var(--color-primary)" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ width: 'auto', marginBottom: 20, padding: '8px 16px', display: 'inline-flex', gap: 6 }}
        onClick={() => navigate('/dashboard/tripulantes')}
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
        {isEdit ? 'Editar Tripulante' : 'Novo Tripulante'}
      </h2>

      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} /> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Dados pessoais ── */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">Dados Pessoais</span></div>
          <div className="card-body">

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Nome Completo <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className={`form-input${fieldErrors.nomeCompleto ? ' error' : ''}`}
                  placeholder="Nome completo do tripulante"
                  value={campos.nomeCompleto}
                  onChange={e => set('nomeCompleto', e.target.value)}
                />
                {fieldErrors.nomeCompleto && (
                  <div className="form-error">
                    <AlertCircle size={12} /> {fieldErrors.nomeCompleto}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Embarcação</label>
                <select
                  className="form-input"
                  value={campos.embarcacaoId}
                  onChange={e => set('embarcacaoId', e.target.value)}
                >
                  <option value="">Nenhuma (sem vínculo)</option>
                  {embarcacoes.map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <input
                  className="form-input"
                  placeholder="Ex: Marinheiro, Mestre, Moço de Convés…"
                  value={campos.categoria}
                  onChange={e => set('categoria', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Função Base</label>
                <input
                  className="form-input"
                  placeholder="Ex: Comandante, Imediato, Marinheiro…"
                  value={campos.funcaoBase}
                  onChange={e => set('funcaoBase', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Data de Entrada na Empresa</label>
              <input
                type="date"
                className="form-input"
                value={campos.dataEntradaEmpresa}
                onChange={e => set('dataEntradaEmpresa', e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* ── CIR ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">Caderneta de Inscrição e Registro (CIR)</span>
          </div>
          <div className="card-body">

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Número do CIR</label>
                <input
                  className="form-input"
                  placeholder="Número da caderneta"
                  value={campos.numeroCIR}
                  onChange={e => set('numeroCIR', e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Vencimento da CIR</label>
                <input
                  type="date"
                  className="form-input"
                  value={campos.dataVencimentoCIR}
                  onChange={e => set('dataVencimentoCIR', e.target.value)}
                />
                {vencStatus && (
                  <p style={{ fontSize: 12, fontWeight: 600, color: vencStatus.cor, marginTop: 5 }}>
                    {vencStatus.label}
                  </p>
                )}
              </div>
            </div>

            {/* Documento já salvo (edit) */}
            {isEdit && docUrl && !arquivoNovo && (
              <div className="tripulante-doc-preview" style={{ marginTop: 4 }}>
                {docTipo === 'IMAGEM' ? (
                  <a href={docUrl} target="_blank" rel="noreferrer">
                    <img src={docUrl} alt="CIR" className="tripulante-doc-img" />
                  </a>
                ) : (
                  <a href={docUrl} target="_blank" rel="noreferrer" className="tripulante-doc-link">
                    <FileText size={28} />
                    <span>Visualizar PDF da CIR</span>
                  </a>
                )}
              </div>
            )}

            {/* Novo arquivo selecionado */}
            {arquivoNovo && (
              <div className="proc-file-current" style={{ marginTop: 12 }}>
                {arquivoNovo.type.includes('pdf')
                  ? <FileText size={18} color="var(--color-primary)" />
                  : <Image size={18} color="var(--color-primary)" />}
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{arquivoNovo.name}</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
                  onClick={removerArquivoNovo}
                  title="Remover"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Botão upload */}
            <div style={{ marginTop: 14 }}>
              <label
                className="btn btn-ghost"
                style={{ width: 'auto', cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' }}
              >
                <Upload size={16} />
                {isEdit && docUrl && !arquivoNovo
                  ? 'Substituir documento CIR'
                  : 'Anexar foto ou PDF da CIR'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleArquivo}
                />
              </label>
              <p style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 6 }}>
                PDF, JPG ou PNG — máximo 10 MB
              </p>
            </div>

          </div>
        </div>

        {/* ── Ações ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: 'auto' }}
            onClick={() => navigate('/dashboard/tripulantes')}
            disabled={submitLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: 'auto', minWidth: 110 }}
            disabled={submitLoading}
          >
            {submitLoading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            Salvar
          </button>
        </div>

      </form>
    </div>
  )
}
