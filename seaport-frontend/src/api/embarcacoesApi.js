import api from './axios'

export async function listar() {
  const { data } = await api.get('/embarcacoes')
  return data
}

export async function buscarPorId(id) {
  const { data } = await api.get(`/embarcacoes/${id}`)
  return data
}

export async function criar(payload) {
  const { data } = await api.post('/embarcacoes', payload)
  return data
}

export async function atualizar(id, payload) {
  const { data } = await api.put(`/embarcacoes/${id}`, payload)
  return data
}

export async function excluir(id) {
  await api.delete(`/embarcacoes/${id}`)
}

export async function getDashboard(id) {
  const { data } = await api.get(`/embarcacoes/${id}/dashboard`)
  return data
}
