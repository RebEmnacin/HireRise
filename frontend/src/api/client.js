import axios from 'axios'

const TOKEN_KEY = 'hirerise-token'
const USER_KEY = 'hirerise-user'

// baseURL: '/api' in dev (Vite forwards it to FastAPI). In production set VITE_API_URL to the real backend URL.
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// before every request: attach the login token if there is one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// after every response: a 401 on any page except login means the token expired, so go back to the login screen
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginCall = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.assign('/login')
    }
    return Promise.reject(err)
  }
)

/** Turns any axios error into a message a person can read. */
export function errorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Is the backend running?'
  const detail = err.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ') // FastAPI validation errors
  if (err.response.status >= 500) return 'Server error. Check the backend terminal for details.'
  return 'Something went wrong. Please try again.'
}
