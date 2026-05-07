import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { registrosApi } from '../../../api/registrosApi'

const TIPOS = ['CHECKLIST', 'CONSUMO', 'OCORRENCIA', 'MANUTENCAO']

const TIPO_LABELS = {
  CHECKLIST: 'Checklist',
  CONSUMO: 'Consumo de Combustível',
  OCORRENCIA: 'Ocorrência',
  MANUTENCAO: 'Manutenção',
}

export default function NovoRegistroPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      dataRegistro: new Date().toISOString().slice(0, 16),
    }
  })
  const tipoSelecionado = watch('tipo')

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError(null)
    try {
      await registrosApi.criar({
        ...data,
        dataRegistro: new Date(data.dataRegistro).toISOString(),
      })
      setSuccess(true)
      reset()
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (e) {
      setApiError(e.response?.data?.error ?? 'Erro ao enviar registro')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card" style={{ maxWidth: 540 }}>
        <div className="card-body">
          <div className="alert alert-success">
            <CheckCircle size={18} />
            Registro enviado com sucesso! Aguardando aprovação do gerente.
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-light)' }}>
            Redirecionando para o dashboard…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Novo Registro Operacional</span>
        </div>
        <div className="card-body">
          {apiError && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label">
                Tipo de Registro <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <select
                className={`form-input ${errors.tipo ? 'error' : ''}`}
                {...register('tipo', { required: 'Selecione o tipo' })}
              >
                <option value="">Selecione…</option>
                {TIPOS.map(t => (
                  <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                ))}
              </select>
              {errors.tipo && (
                <div className="form-error"><AlertCircle size={12} />{errors.tipo.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Data e Hora do Registro <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="datetime-local"
                className={`form-input ${errors.dataRegistro ? 'error' : ''}`}
                {...register('dataRegistro', { required: 'Data é obrigatória' })}
              />
              {errors.dataRegistro && (
                <div className="form-error"><AlertCircle size={12} />{errors.dataRegistro.message}</div>
              )}
            </div>

            {tipoSelecionado === 'CONSUMO' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Nível de Combustível (%)</label>
                  <input
                    type="number"
                    min={0} max={100}
                    className="form-input"
                    placeholder="0–100"
                    {...register('nivelCombustivel', {
                      min: { value: 0, message: 'Mín 0' },
                      max: { value: 100, message: 'Máx 100' },
                    })}
                  />
                  {errors.nivelCombustivel && (
                    <div className="form-error"><AlertCircle size={12} />{errors.nivelCombustivel.message}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Nível de Água (%)</label>
                  <input
                    type="number"
                    min={0} max={100}
                    className="form-input"
                    placeholder="0–100"
                    {...register('nivelAgua', {
                      min: { value: 0, message: 'Mín 0' },
                      max: { value: 100, message: 'Máx 100' },
                    })}
                  />
                  {errors.nivelAgua && (
                    <div className="form-error"><AlertCircle size={12} />{errors.nivelAgua.message}</div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Descrição <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <textarea
                className={`form-input ${errors.descricao ? 'error' : ''}`}
                rows={6}
                placeholder="Descreva detalhadamente o registro operacional…"
                style={{ resize: 'vertical' }}
                {...register('descricao', {
                  required: 'Descrição é obrigatória',
                  minLength: { value: 10, message: 'Descrição muito curta (mín. 10 caracteres)' }
                })}
              />
              {errors.descricao && (
                <div className="form-error"><AlertCircle size={12} />{errors.descricao.message}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: 'auto' }}
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '11px 28px' }}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} /> : null}
                Enviar para Aprovação
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--color-primary-light)', border: '1px solid #bae6f5' }}>
        <div className="card-body" style={{ padding: '14px 18px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
            ℹ️ Fluxo de aprovação
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
            Seu registro será enviado como <strong>Pendente</strong> e ficará aguardando a aprovação do gerente.
            Após aprovado, ficará visível para a diretoria.
          </p>
        </div>
      </div>
    </div>
  )
}
