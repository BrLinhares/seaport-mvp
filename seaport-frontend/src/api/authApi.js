import api from './axios'

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  getMe: () =>
    api.get('/users/me'),
}
