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

// the same two people the backend's demo accounts are (ids 1 and 2 match the sample data in stores/hr.js)
function offlineDemoSession(account) {
  const hr = account === 'hr'
  return {
    access_token: 'offline-demo',
    user: {
      id: hr ? -1 : -2,
      email: hr ? 'demo.hr@hirerise.example' : 'demo.employee@hirerise.example',
      role: hr ? 'hr' : 'employee',
      is_active: true,
      employee: hr
        ? { id: 1, employee_no: 'DEMO-0001', first_name: 'Ana', last_name: 'Dela Cruz', position: 'HR Manager', status: 'active' }
        : { id: 2, employee_no: 'DEMO-0002', first_name: 'Marco', last_name: 'Santos', position: 'Software Engineer', status: 'active' },
    },
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
      this.saveSession(await authApi.login(email.trim(), password)) // talks to the FastAPI backend
    },
    // "Try the demo": sign in as the demo HR manager or the demo employee. 'hr' | 'employee'
    // offline = true when there is no backend (the live site): the session is made right here in the browser.
    // That is safe because the pages only show sample data, and the fake token is useless to any real API.
    async demoLogin(account, offline = false) {
      this.saveSession(offline ? offlineDemoSession(account) : await authApi.demoLogin(account))
    },
    // keeps the token and user in the store, and in localStorage so a refresh keeps you signed in
    saveSession(res) {
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