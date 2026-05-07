import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Loader2, AlertCircle, Upload,
  FileText, X, CheckSquare, Square,
} from 'lucide-react'
import { criar, atualizar, buscar, baixarArquivo } from '../../../api/procedimentosApi'

const PARTES = [
  { value: 'ADM', label: 'ADM — Administração - Procedimentos Sistêmicos' },
  { value: 'COM', label: 'COM — Companhia - Procedimentos Sistêmicos' },
  { value: 'EMB', label: 'EMB — Embarcação - Procedimentos Operacionais' },
  { value: 'SMS', label: 'SMS — Segurança, Meio Ambiente e Saúde Ocupacional' },
  { value: 'EME', label: 'EME — Emergências - Procedimentos Operacionais' },
]

const ROLES_DISPONIVEIS = [
  { value: 'ROLE_TRIPULACAO', label: 'Tripulação' },
  { value: 'ROLE_GERENTE', label: 'Gerente' },
]

function RoleCheckbox({ role, checked, onChange }) {
  return (
    <button
      type="button"
      className={`proc-role-chip${checked ? ' active' : ''}`}
      onClick={() => onChange(role.value, !checked)}
    >
      {checked ? <CheckSquare size={14} /> : <Square size={14} />}
      {role.label}
    </button>
  )
}

export default function ProcedimentoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const abrirPdfAtual = async () => {
    setPdfLoading(true)
    try {
      const { data } = await baixarArquivo(id, 'inline')
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
      alert('Não foi possível abrir o arquivo PDF.')
    } finally {
      setPdfLoading(false)
    }
  }
  const [apiError, setApiError] = useState(null)
  const [arquivoAtual, setArquivoAtual] = useState(false)   // se já tem PDF
  const [arquivoNovo, setArquivoNovo] = useState(null)      // File selecionado
  const [form, setForm] = useState({
    titulo: '',
    codigo: '',
    revisao: '',
    dataEmissao: '',
    parte: '',
    rolesPermitidas: [],
  })

  useEffect(() => {
    if (!isEdit) return
    buscar(id)
      .then(d => {
        setForm({
          titulo: d.titulo ?? '',
          codigo: d.codigo ?? '',
          revisao: d.revisao ?? '',
          dataEmissao: d.dataEmissao ?? '',
          parte: d.parte ?? '',
          rolesPermitidas: d.rolesPermitidas ?? [],
        })
        setArquivoAtual(d.temArquivo)
      })
      .catch(() => setApiError('Erro ao carregar procedimento.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const toggleRole = (roleValue, checked) => {
    setForm(f => ({
      ...f,
      rolesPermitidas: checked
        ? [...f.rolesPermitidas, roleValue]
        : f.rolesPermitidas.filter(r => r !== roleValue),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!form.titulo.trim() || !form.codigo.trim() || !form.parte) {
      setApiError('Título, código e parte são obrigatórios.')
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await atualizar(id, form, arquivoNovo)
      } else {
        await criar(form, arquivoNovo)
      }
      navigate('/dashboard/procedimentos')
    } catch (e) {
      setApiError(e?.response?.data?.error ?? 'Erro ao salvar procedimento.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
        onClick={() => navigate('/dashboard/procedimentos')}
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
        {isEdit ? 'Editar Procedimento' : 'Novo Procedimento'}
      </h2>

      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} /> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Identificação */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">Identificação</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Título <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="Título do procedimento"
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Código <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Ex: PROC-ADM-001"
                  value={form.codigo}
                  onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Revisão</label>
                <input
                  className="form-input"
                  placeholder="Ex: Rev. 01"
                  value={form.revisao}
                  onChange={e => setForm(f => ({ ...f, revisao: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Parte <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={form.parte}
                  onChange={e => setForm(f => ({ ...f, parte: e.target.value }))}
                >
                  <option value="">Selecione…</option>
                  {PARTES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data de Emissão</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dataEmissao}
                  onChange={e => setForm(f => ({ ...f, dataEmissao: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Permissões */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title">Controle de Acesso</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginBottom: 14 }}>
              Selecione quais perfis podem visualizar este procedimento.
              A <strong>Diretoria</strong> sempre tem acesso independente desta configuração.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ROLES_DISPONIVEIS.map(r => (
                <RoleCheckbox
                  key={r.value}
                  role={r}
                  checked={form.rolesPermitidas.includes(r.value)}
                  onChange={toggleRole}
                />
              ))}
            </div>
            {form.rolesPermitidas.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 10 }}>
                ⚠️ Nenhum perfil selecionado — apenas GERENTE e DIRETORIA poderão visualizar.
              </p>
            )}
          </div>
        </div>

        {/* Upload PDF */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">Arquivo PDF</span>
          </div>
          <div className="card-body">
            {/* Preview do arquivo atual (edit mode) */}
            {isEdit && arquivoAtual && !arquivoNovo && (
              <div className="proc-file-current">
                <FileText size={18} color="var(--color-primary)" />
                <span>Arquivo PDF salvo</span>
                <button
                  type="button"
                  disabled={pdfLoading}
                  onClick={abrirPdfAtual}
                  style={{
                    marginLeft: 'auto', fontSize: 13, color: 'var(--color-primary)',
                    fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {pdfLoading ? <Loader2 size={13} className="spin" /> : null}
                  Visualizar →
                </button>
              </div>
            )}

            {/* Arquivo novo selecionado */}
            {arquivoNovo && (
              <div className="proc-file-current" style={{ background: '#d1fae5', borderColor: '#a7f3d0' }}>
                <FileText size={18} color="#065f46" />
                <span style={{ color: '#065f46', fontWeight: 600 }}>{arquivoNovo.name}</span>
                <button
                  type="button"
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
                  onClick={() => { setArquivoNovo(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <label
              className="btn btn-ghost"
              style={{ width: 'auto', cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 8 }}
            >
              <Upload size={16} />
              {arquivoAtual && !arquivoNovo ? 'Substituir PDF' : 'Selecionar PDF'}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={e => setArquivoNovo(e.target.files[0] ?? null)}
              />
            </label>
            <p style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 8 }}>
              Apenas PDF — máximo 10 MB
            </p>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: 'auto' }}
            onClick={() => navigate('/dashboard/procedimentos')}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: 'auto', minWidth: 120 }}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {isEdit ? 'Salvar Alterações' : 'Criar Procedimento'}
          </button>
        </div>
      </form>
    </div>
  )
}
