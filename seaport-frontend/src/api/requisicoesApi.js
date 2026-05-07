import api from './axios'

// ── Requisição de Material ───────────────────────────────────────────────────
export const requisicoesApi = {
  // Material
  listarMateriais: () =>
    api.get('/requisicoes/materiais').then(r => r.data),

  criarMaterial: (data) =>
    api.post('/requisicoes/materiais', data).then(r => r.data),

  deletarMaterial: (id) =>
    api.delete(`/requisicoes/materiais/${id}`),

  baixarPdfMaterial: (id) =>
    api.get(`/requisicoes/materiais/${id}/pdf`, { responseType: 'blob' }),

  // Serviço
  listarServicos: () =>
    api.get('/requisicoes/servicos').then(r => r.data),

  criarServico: (data) =>
    api.post('/requisicoes/servicos', data).then(r => r.data),

  deletarServico: (id) =>
    api.delete(`/requisicoes/servicos/${id}`),

  baixarPdfServico: (id) =>
    api.get(`/requisicoes/servicos/${id}/pdf`, { responseType: 'blob' }),
}
