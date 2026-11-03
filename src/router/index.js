import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// each route = a URL path + the component to show for it.
// The other views are loaded lazily: the browser only downloads them when you visit that page.
const router = createRouter({
  history: createWebHistory(), // createWebHistory = clean URLs (/jobs). createWebHashHistory = /#/jobs
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/jobs', name: 'jobs', component: () => import('../views/JobsView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }, // anything unknown goes home
  ],
  // every time you change page: jump to top (or to a #hash if the link has one)
  scrollBehavior: (to) => (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }),
})

export default router
