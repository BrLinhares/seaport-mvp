import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { buscarPorId, criar, atualizar } from '../../../api/embarcacoesApi'

const TABS = [
  'Identificação',
  'Armador',
  'Construtor',
  'Engenheiro',
  'Casco',
  'Estrutura',
  'Propulsão',
  'Tripulação',
  'Tanques',
]

const TIPO_TANQUE_OPTIONS = [
  { value: 'COMBUSTIVEL', label: 'Combustível' },
  { value: 'AGUA', label: 'Água' },
]

const LOCALIZACAO_OPTIONS = [
  { value: 'BORESTE', label: 'Boreste (BB)' },
  { value: 'BOMBORDO', label: 'Bombordo (BE)' },
  { value: 'CENTRO', label: 'Centro' },
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'OUTRO', label: 'Outro' },
]

function Field({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}
      </label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  )
}

function Input({ registration, error, ...props }) {
  return (
    <input
      className={`form-input${error ? ' error' : ''}`}
      {...registration}
      {...props}
    />
  )
}

function Textarea({ registration, error, ...props }) {
  return (
    <textarea
      className={`form-input${error ? ' error' : ''}`}
      rows={4}
      style={{ resize: 'vertical' }}
      {...registration}
      {...props}
    />
  )
}

export default function EmbarcacaoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      propulsoes: [],
      tanques: [],
    },
  })

  const { fields: propulsaoFields, append: appendPropulsao, remove: removePropulsao } = useFieldArray({
    control,
    name: 'propulsoes',
  })

  const { fields: tanqueFields, append: appendTanque, remove: removeTanque } = useFieldArray({
    control,
    name: 'tanques',
  })

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      setLoadingData(true)
      try {
        const data = await buscarPorId(id)
        reset(data)
      } catch {
        setApiError('Erro ao carregar dados da embarcação.')
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [id, isEdit, reset])

  async function onSubmit(data) {
    setSubmitLoading(true)
    setApiError(null)
    try {
      if (isEdit) {
        await atualizar(id, data)
      } else {
        await criar(data)
      }
      navigate('/dashboard/embarcacoes')
    } catch (err) {
      setApiError(err?.response?.data?.error ?? err?.response?.data?.message ?? 'Erro ao salvar. Tente novamente.')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
        {isEdit ? 'Editar Embarcação' : 'Nova Embarcação'}
      </h2>

      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {apiError}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="tabs">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn${activeTab === idx ? ' active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {activeTab === 0 && (
              <div>
                <div className="form-grid-2">
                  <Field label="Nome" required error={errors.nome?.message}>
                    <Input
                      registration={register('nome', { required: 'Nome é obrigatório' })}
                      error={errors.nome}
                      placeholder="Nome da embarcação"
                    />
                  </Field>
                  <Field label="Ano de Construção" error={errors.anoConstrucao?.message}>
                    <Input
                      registration={register('anoConstrucao', { valueAsNumber: true })}
                      type="number"
                      placeholder="Ex: 2010"
                    />
                  </Field>
                </div>
                <div className="form-grid-2">
                  <Field label="Tipo de Embarcação" error={errors.tipoEmbarcacao?.message}>
                    <Input
                      registration={register('tipoEmbarcacao')}
                      placeholder="Ex: Navio-tanque"
                    />
                  </Field>
                  <Field label="Área de Navegação" error={errors.areaNavegacao?.message}>
                    <Input
                      registration={register('areaNavegacao')}
                      placeholder="Ex: Longo Curso"
                    />
                  </Field>
                </div>
                <div className="form-grid-3">
                  <Field label="Porto de Registro" error={errors.portoRegistro?.message}>
                    <Input registration={register('portoRegistro')} placeholder="Ex: Santos" />
                  </Field>
                  <Field label="Porte Bruto (TPB)" error={errors.porteBruto?.message}>
                    <Input registration={register('porteBruto', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                  <Field label="Arqueação Bruta" error={errors.arqueacaoBruta?.message}>
                    <Input registration={register('arqueacaoBruta', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                </div>
                <div className="form-grid-2">
                  <Field label="Arqueação Líquida" error={errors.arqueacaoLiquida?.message}>
                    <Input registration={register('arqueacaoLiquida', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                </div>
                <Field label="URL da Imagem" error={errors.imagem?.message}>
                  <Input
                    registration={register('imagem')}
                    placeholder="https://… (link público da foto da embarcação)"
                  />
                </Field>
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <div className="form-grid-2">
                  <Field label="Nome do Armador">
                    <Input registration={register('armador.nome')} placeholder="Razão social ou nome" />
                  </Field>
                  <Field label="Nacionalidade">
                    <Input registration={register('armador.nacionalidade')} placeholder="Ex: Brasileira" />
                  </Field>
                </div>
                <Field label="Endereço">
                  <Input registration={register('armador.endereco')} placeholder="Endereço completo" />
                </Field>
                <div className="form-grid-2">
                  <Field label="CEP">
                    <Input registration={register('armador.cep')} placeholder="00000-000" />
                  </Field>
                  <Field label="CNPJ">
                    <Input registration={register('armador.cnpj')} placeholder="00.000.000/0000-00" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <div className="form-grid-2">
                  <Field label="Nome do Construtor">
                    <Input registration={register('construtor.nome')} placeholder="Razão social ou nome" />
                  </Field>
                  <Field label="Nacionalidade">
                    <Input registration={register('construtor.nacionalidade')} placeholder="Ex: Brasileira" />
                  </Field>
                </div>
                <Field label="Endereço">
                  <Input registration={register('construtor.endereco')} placeholder="Endereço completo" />
                </Field>
                <div className="form-grid-2">
                  <Field label="CEP">
                    <Input registration={register('construtor.cep')} placeholder="00000-000" />
                  </Field>
                  <Field label="CNPJ">
                    <Input registration={register('construtor.cnpj')} placeholder="00.000.000/0000-00" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <div className="form-grid-2">
                  <Field label="Nome do Engenheiro">
                    <Input registration={register('engenheiro.nome')} placeholder="Nome completo" />
                  </Field>
                  <Field label="Nacionalidade">
                    <Input registration={register('engenheiro.nacionalidade')} placeholder="Ex: Brasileira" />
                  </Field>
                </div>
                <div className="form-grid-2">
                  <Field label="CREA">
                    <Input registration={register('engenheiro.crea')} placeholder="Número do CREA" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div>
                <div className="form-grid-3">
                  <Field label="Comprimento Total (m)">
                    <Input registration={register('caracteristicasCasco.comprimentoTotal', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                  <Field label="Comprimento Entre Perpendiculares (m)">
                    <Input registration={register('caracteristicasCasco.comprimentoEntrePerpendiculares', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                  <Field label="Boca (m)">
                    <Input registration={register('caracteristicasCasco.boca', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                </div>
                <div className="form-grid-3">
                  <Field label="Pontal (m)">
                    <Input registration={register('caracteristicasCasco.pontal', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                  <Field label="Calado (m)">
                    <Input registration={register('caracteristicasCasco.calado', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                  <Field label="Deslocamento Leve (t)">
                    <Input registration={register('caracteristicasCasco.deslocamentoLeve', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                </div>
                <div className="form-grid-2">
                  <Field label="Deslocamento Carregado (t)">
                    <Input registration={register('caracteristicasCasco.deslocamentoCarregado', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 5 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Materiais
                </p>
                <div className="form-grid-2">
                  <Field label="Material do Casco">
                    <Input registration={register('estrutura.materialCasco')} placeholder="Ex: Aço" />
                  </Field>
                  <Field label="Material do Convés">
                    <Input registration={register('estrutura.materialConves')} placeholder="Ex: Aço" />
                  </Field>
                </div>
                <div className="form-grid-2">
                  <Field label="Material das Anteparas">
                    <Input registration={register('estrutura.materialAnteparas')} placeholder="Ex: Aço" />
                  </Field>
                  <Field label="Material da Superestrutura">
                    <Input registration={register('estrutura.materialSuperestrutura')} placeholder="Ex: Alumínio" />
                  </Field>
                </div>
                <div className="form-grid-2">
                  <Field label="Tipo de Estrutura">
                    <Input registration={register('estrutura.tipoEstrutura')} placeholder="Ex: Longitudinal" />
                  </Field>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', margin: '20px 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Compartimentagem
                </p>
                <div className="form-grid-2">
                  <Field label="Local da Superestrutura">
                    <Input registration={register('compartimentagem.localSuperestrutura')} placeholder="Ex: Popa" />
                  </Field>
                  <Field label="Local da Praça de Máquinas">
                    <Input registration={register('compartimentagem.localPracaMaquinas')} placeholder="Ex: Popa" />
                  </Field>
                </div>
                <div className="form-grid-3">
                  <Field label="Nº de Anteparas Transversais">
                    <Input registration={register('compartimentagem.numeroAnteparasTransversais', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                  <Field label="Nº de Conveses">
                    <Input registration={register('compartimentagem.numeroConveses', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                  <Field label="Nº de Casarias">
                    <Input registration={register('compartimentagem.numeroCasarias', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 6 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Propulsões
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '8px 14px', fontSize: 13 }}
                    onClick={() => appendPropulsao({ tipo: '', quantidade: '', marca: '', potencia: '', rpm: '' })}
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                </div>

                {propulsaoFields.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-light)', marginBottom: 20 }}>
                    Nenhuma propulsão adicionada.
                  </p>
                )}

                {propulsaoFields.map((field, idx) => (
                  <div key={field.id} className="propulsao-item">
                    <div className="propulsao-item-header">
                      <span>Propulsão {idx + 1}</span>
                      <button
                        type="button"
                        className="action-btn danger"
                        onClick={() => removePropulsao(idx)}
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-grid-3">
                      <Field label="Tipo">
                        <Input registration={register(`propulsoes.${idx}.tipo`)} placeholder="Ex: Hélice" />
                      </Field>
                      <Field label="Quantidade">
                        <Input registration={register(`propulsoes.${idx}.quantidade`, { valueAsNumber: true })} type="number" placeholder="0" />
                      </Field>
                      <Field label="Marca">
                        <Input registration={register(`propulsoes.${idx}.marca`)} placeholder="Ex: MAN" />
                      </Field>
                    </div>
                    <div className="form-grid-2">
                      <Field label="Potência (CV)">
                        <Input registration={register(`propulsoes.${idx}.potencia`, { valueAsNumber: true })} type="number" placeholder="0" />
                      </Field>
                      <Field label="RPM">
                        <Input registration={register(`propulsoes.${idx}.rpm`, { valueAsNumber: true })} type="number" placeholder="0" />
                      </Field>
                    </div>
                  </div>
                ))}

                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', margin: '20px 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Energia
                </p>
                <div className="form-grid-3">
                  <Field label="Tipo de Motor">
                    <Input registration={register('energia.tipoMotor')} placeholder="Ex: Diesel" />
                  </Field>
                  <Field label="Potência do Gerador (kW)">
                    <Input registration={register('energia.potenciaGerador', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                  <Field label="Quantidade de Geradores">
                    <Input registration={register('energia.quantidadeGeradores', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 7 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Tripulação e Passageiros
                </p>
                <div className="form-grid-2">
                  <Field label="Quantidade de Tripulantes">
                    <Input registration={register('tripulacao.quantidadeTripulantes', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                  <Field label="Quantidade de Passageiros">
                    <Input registration={register('tripulacao.quantidadePassageiros', { valueAsNumber: true })} type="number" placeholder="0" />
                  </Field>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', margin: '20px 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Equipamentos
                </p>
                <Field label="Equipamentos de Navegação">
                  <Textarea registration={register('equipamentos.navegacao')} placeholder="Liste os equipamentos de navegação..." />
                </Field>
                <Field label="Equipamentos de Comunicação">
                  <Textarea registration={register('equipamentos.comunicacao')} placeholder="Liste os equipamentos de comunicação..." />
                </Field>
                <Field label="Equipamentos de Segurança">
                  <Textarea registration={register('equipamentos.seguranca')} placeholder="Liste os equipamentos de segurança..." />
                </Field>

                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', margin: '20px 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Observações
                </p>
                <Field label="Observações Gerais">
                  <Textarea registration={register('observacoes')} rows={6} placeholder="Informações adicionais..." />
                </Field>
              </div>
            )}

            {activeTab === 8 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Tanques ({tanqueFields.length})
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '8px 14px', fontSize: 13 }}
                      onClick={() => appendTanque({ nome: '', tipo: '', capacidade: '', unidade: 'L', localizacao: '' })}
                    >
                      <Plus size={14} /> Combustível / Água
                    </button>
                  </div>
                </div>

                {tanqueFields.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-light)', fontSize: 13 }}>
                    <p style={{ marginBottom: 12 }}>Nenhum tanque adicionado.</p>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ width: 'auto', padding: '10px 20px' }}
                      onClick={() => appendTanque({ nome: '', tipo: '', capacidade: '', unidade: 'L', localizacao: '' })}
                    >
                      <Plus size={14} /> Adicionar primeiro tanque
                    </button>
                  </div>
                )}

                {tanqueFields.map((field, idx) => (
                  <div key={field.id} className="propulsao-item">
                    <div className="propulsao-item-header">
                      <span>Tanque {idx + 1}</span>
                      <button
                        type="button"
                        className="action-btn danger"
                        onClick={() => removeTanque(idx)}
                        title="Remover tanque"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="form-grid-2">
                      <Field
                        label="Tipo"
                        required
                        error={errors.tanques?.[idx]?.tipo?.message}
                      >
                        <select
                          className={`form-input${errors.tanques?.[idx]?.tipo ? ' error' : ''}`}
                          {...register(`tanques.${idx}.tipo`, { required: 'Tipo é obrigatório' })}
                        >
                          <option value="">Selecione…</option>
                          {TIPO_TANQUE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Nome / Identificação">
                        <Input
                          registration={register(`tanques.${idx}.nome`)}
                          placeholder="Ex: Tanque BB, Tanque Serviço"
                        />
                      </Field>
                    </div>

                    <div className="form-grid-3">
                      <Field
                        label="Capacidade"
                        required
                        error={errors.tanques?.[idx]?.capacidade?.message}
                      >
                        <Input
                          registration={register(`tanques.${idx}.capacidade`, {
                            required: 'Capacidade é obrigatória',
                            valueAsNumber: true,
                            min: { value: 0.01, message: 'Deve ser maior que zero' },
                          })}
                          type="number"
                          step="0.001"
                          placeholder="0"
                          error={errors.tanques?.[idx]?.capacidade}
                        />
                      </Field>
                      <Field label="Unidade">
                        <select
                          className="form-input"
                          {...register(`tanques.${idx}.unidade`)}
                        >
                          <option value="L">L (litros)</option>
                          <option value="m³">m³ (metros cúbicos)</option>
                          <option value="t">t (toneladas)</option>
                          <option value="gal">gal (galões)</option>
                        </select>
                      </Field>
                      <Field label="Localização">
                        <select
                          className="form-input"
                          {...register(`tanques.${idx}.localizacao`)}
                        >
                          <option value="">Selecione…</option>
                          {LOCALIZACAO_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/dashboard/embarcacoes')}
                disabled={submitLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-accent"
                style={{ minWidth: 110 }}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                ) : null}
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
