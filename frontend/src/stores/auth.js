import { defineStore } from 'pinia'
import { authApi } from '../api/endpoints'

const TOKEN_KEY = 'hirerise-token'
const USER_KEY = 'hirerise-user'

// localStorage can throw (private windows, blocked storage), so every read/write is wrapped.
// The token is saved as plain text (api/client.js reads it the same way); the user object as JSON.
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
function readUser() {
  try {
    const v = localStorage.getItem(USER_KEY)
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  // state = the data this store keeps
  state: () => ({
    token: readToken(),
    user: readUser(),
  }),

  // getters = values calculated from state (like computed())
  getters: {
    isLoggedIn: (s) => Boolean(s.token),
    role: (s) => s.user?.role ?? '',
    isHR: (s) => ['admin', 'hr'].includes(s.user?.role),
    displayName: (s) => {
      const e = s.user?.employee
      return e ? `${e.first_name} ${e.last_name}` : (s.user?.email ?? '')
    },
  },

  // actions = functions that change the state
  actions: {
    async login(email, password) {
      const res = await authApi.login(email.trim(), password)
      this.token = res.access_token
      this.user = res.user
      try {
        localStorage.setItem(TOKEN_KEY, res.access_token)
        localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      } catch {
        /* storage blocked: you just stay logged in until you refresh */
      }
    },
    logout() {
      this.token = ''
      this.user = null
      try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      } catch {
        /* ignore */
      }
    },
  },
})
