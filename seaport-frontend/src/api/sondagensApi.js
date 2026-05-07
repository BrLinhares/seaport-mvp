import api from './axios'

export async function listarTodas() {
  const { data } = await api.get('/sondagens')
  return data
}

export async function listarMinhaEmbarcacao() {
  const { data } = await api.get('/sondagens/minha-embarcacao')
  return data
}

export async function listarAprovadas() {
  const { data } = await api.get('/sondagens/aprovadas')
  return data
}

export async function criar(payload) {
  const { data } = await api.post('/sondagens', payload)
  return data
}

export async function aprovar(id) {
  const { data } = await api.put(`/sondagens/${id}/aprovar`)
  return data
}

export async function rejeitar(id, motivo) {
  const { data } = await api.put(`/sondagens/${id}/rejeitar`, { motivo })
  return data
}
