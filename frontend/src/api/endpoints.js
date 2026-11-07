import { api } from './client'

export const authApi = {
  // FastAPI's OAuth2 login expects a form (not JSON) and calls the email field "username"
  login: (email, password) =>
    api
      .post('/auth/login', new URLSearchParams({ username: email, password }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  changePassword: (current_password, new_password) =>
    api.post('/auth/change-password', { current_password, new_password }),
}

// Employees, attendance, leave and tasks endpoints get added here as the backend grows.
