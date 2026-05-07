import api from './axios'

export async function listar(params = {}) {
  const { data } = await api.get('/tripulantes', { params })
  return data
}

export async function listarPorEmbarcacao(embarcacaoId) {
  const { data } = await api.get(`/embarcacoes/${embarcacaoId}/tripulantes`)
  return data
}

export async function buscarPorId(id) {
  const { data } = await api.get(`/tripulantes/${id}`)
  return data
}

/**
 * Cria tripulante via multipart/form-data.
 * @param {Object} campos - { embarcacaoId, nomeCompleto, numeroCIR, dataVencimentoCIR, categoria, funcaoBase, dataEntradaEmpresa }
 * @param {File|null} arquivo - foto ou PDF da CIR (opcional)
 */
export async function criar(campos, arquivo) {
  const form = buildFormData(campos, arquivo)
  const { data } = await api.post('/tripulantes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Atualiza tripulante via multipart/form-data.
 * Se `arquivo` for null, o documento atual é mantido.
 */
export async function atualizar(id, campos, arquivo) {
  const form = buildFormData(campos, arquivo)
  const { data } = await api.put(`/tripulantes/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function inativar(id) {
  const { data } = await api.patch(`/tripulantes/${id}/inativar`)
  return data
}

export async function ativar(id) {
  const { data } = await api.patch(`/tripulantes/${id}/ativar`)
  return data
}

/** Upload avulso de documento (substitui o atual). */
export async function uploadDocumento(id, arquivo) {
  const form = new FormData()
  form.append('arquivo', arquivo)
  const { data } = await api.post(`/tripulantes/${id}/documento`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/** Retorna URL pública do documento CIR para visualização inline. */
export function urlDocumento(relativePath) {
  if (!relativePath) return null
  const base = import.meta.env.VITE_API_URL || '/api'
  return `${base}/uploads/${relativePath}`
}

// ---------------------------------------------------------------------------

function buildFormData(campos, arquivo) {
  const form = new FormData()
  if (campos.embarcacaoId) form.append('embarcacaoId', campos.embarcacaoId)
  form.append('nomeCompleto', campos.nomeCompleto ?? '')
  if (campos.numeroCIR) form.append('numeroCIR', campos.numeroCIR)
  if (campos.dataVencimentoCIR) form.append('dataVencimentoCIR', campos.dataVencimentoCIR)
  if (campos.categoria) form.append('categoria', campos.categoria)
  if (campos.funcaoBase) form.append('funcaoBase', campos.funcaoBase)
  if (campos.dataEntradaEmpresa) form.append('dataEntradaEmpresa', campos.dataEntradaEmpresa)
  if (arquivo) form.append('arquivo', arquivo)
  return form
}
