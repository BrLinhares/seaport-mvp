import api from './axios'

export async function listar() {
  const { data } = await api.get('/procedimentos')
  return data
}

export async function buscar(id) {
  const { data } = await api.get(`/procedimentos/${id}`)
  return data
}

/**
 * Cria um novo procedimento via multipart/form-data.
 * @param {Object} campos - { titulo, codigo, revisao, dataEmissao, parte, rolesPermitidas[] }
 * @param {File|null} arquivo - arquivo PDF (opcional)
 */
export async function criar(campos, arquivo) {
  const form = buildFormData(campos, arquivo)
  const { data } = await api.post('/procedimentos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Atualiza um procedimento existente.
 * Se `arquivo` for null, o PDF atual é mantido no backend.
 */
export async function atualizar(id, campos, arquivo) {
  const form = buildFormData(campos, arquivo)
  const { data } = await api.put(`/procedimentos/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function inativar(id) {
  await api.patch(`/procedimentos/${id}/inativar`)
}

/**
 * Faz o download autenticado do arquivo PDF via axios.
 * Retorna a resposta axios com `data: Blob`.
 *
 * Usar junto com URL.createObjectURL para abrir/baixar sem perder o token JWT.
 * NÃO usar <a href> direto — a aba aberta não envia o Authorization header.
 */
export async function baixarArquivo(id, disposition = 'inline') {
  const response = await api.get(`/procedimentos/${id}/arquivo`, {
    params: { disposition },
    responseType: 'blob',
  })
  return response
}

// ---------------------------------------------------------------------------

function buildFormData(campos, arquivo) {
  const form = new FormData()
  form.append('titulo', campos.titulo ?? '')
  form.append('codigo', campos.codigo ?? '')
  if (campos.revisao) form.append('revisao', campos.revisao)
  if (campos.dataEmissao) form.append('dataEmissao', campos.dataEmissao)
  form.append('parte', campos.parte ?? '')
  ;(campos.rolesPermitidas ?? []).forEach(r => form.append('rolesPermitidas', r))
  if (arquivo) form.append('arquivo', arquivo)
  return form
}
