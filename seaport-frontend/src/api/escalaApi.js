import api from './axios'

export async function listarAtivasPorEmbarcacao(embarcacaoId) {
  const { data } = await api.get(`/embarcacoes/${embarcacaoId}/escala`)
  return data
}

export async function listarHistoricoPorEmbarcacao(embarcacaoId) {
  const { data } = await api.get(`/embarcacoes/${embarcacaoId}/escala/historico`)
  return data
}

export async function criar(payload) {
  const { data } = await api.post('/escala', payload)
  return data
}

export async function atualizar(id, payload) {
  const { data } = await api.put(`/escala/${id}`, payload)
  return data
}

export async function encerrar(id) {
  const { data } = await api.patch(`/escala/${id}/encerrar`)
  return data
}
