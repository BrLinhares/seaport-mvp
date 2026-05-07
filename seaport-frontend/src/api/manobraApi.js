import api from './axios'

export async function listarTodas() {
  const { data } = await api.get('/manobras')
  return data
}

export async function listarMinhaEmbarcacao() {
  const { data } = await api.get('/manobras/minha-embarcacao')
  return data
}

export async function listarAprovadas() {
  const { data } = await api.get('/manobras/aprovadas')
  return data
}

export async function criar(payload) {
  const { data } = await api.post('/manobras', payload)
  return data
}

export async function aprovar(id) {
  const { data } = await api.put(`/manobras/${id}/aprovar`)
  return data
}

export async function rejeitar(id, motivo) {
  const { data } = await api.put(`/manobras/${id}/rejeitar`, { motivo })
  return data
}
