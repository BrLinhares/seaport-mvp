import api from './axios'

export const usersApi = {
  listar: () =>
    api.get('/users').then(r => r.data),

  getMe: () =>
    api.get('/users/me').then(r => r.data),

  criar: (data) =>
    api.post('/users', data).then(r => r.data),

  atualizar: (id, data) =>
    api.put(`/users/${id}`, data).then(r => r.data),

  // GERENTE reseta a senha de outro usuário (senha temporária)
  resetarSenha: (id, newPassword) =>
    api.put(`/users/${id}/resetar-senha`, { newPassword }).then(r => r.data),

  // Ativar / desativar usuário
  toggleStatus: (id) =>
    api.patch(`/users/${id}/status`).then(r => r.data),

  // Usuário troca sua própria senha (obrigatório no primeiro login)
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),
}
