import api from './axios'

export const registrosApi = {
  // Tripulação
  criar: (data) => api.post('/registros', data).then(r => r.data),
  listarMinhaEmbarcacao: () => api.get('/registros/minha-embarcacao').then(r => r.data),

  // Gerente / Diretoria
  listarTodos: (params) => api.get('/registros', { params }).then(r => r.data),
  listarAprovados: () => api.get('/registros/aprovados').then(r => r.data),
  aprovar: (id) => api.put(`/registros/${id}/aprovar`).then(r => r.data),
  rejeitar: (id, motivoRejeicao) =>
    api.put(`/registros/${id}/rejeitar`, { motivoRejeicao }).then(r => r.data),
}
