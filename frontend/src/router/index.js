import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'
import LoginView from '../views/LoginView.vue'

// Which roles may open which pages is written here, in meta.roles. No meta.roles = every logged-in user.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    {
      path: '/',
      component: AppLayout, // the sidebar + top bar; the pages below show inside it
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
        { path: 'employees', name: 'employees', component: () => import('../views/EmployeesView.vue'), meta: { roles: ['admin', 'hr'] } },
        { path: 'attendance', name: 'attendance', component: () => import('../views/AttendanceView.vue') },
        { path: 'leave', name: 'leave', component: () => import('../views/LeaveView.vue') },
        { path: 'tasks', name: 'tasks', component: () => import('../views/TasksView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// Runs before every page change. Returning a path redirects; returning nothing lets the page open.
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'dashboard' }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) return { name: 'dashboard' }
})

export default router
