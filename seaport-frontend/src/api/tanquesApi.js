import api from './axios'

export async function listarPorEmbarcacao(embarcacaoId) {
  const { data } = await api.get(`/embarcacoes/${embarcacaoId}/tanques`)
  return data
}

export async function criar(payload) {
  const { data } = await api.post('/tanques', payload)
  return data
}

export async function atualizar(id, payload) {
  const { data } = await api.put(`/tanques/${id}`, payload)
  return data
}

export async function excluir(id) {
  await api.delete(`/tanques/${id}`)
}
