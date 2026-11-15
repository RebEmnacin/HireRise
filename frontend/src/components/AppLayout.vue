<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import NavIcon from './NavIcon.vue'
import { motion, AnimatePresence } from 'motion-v'
import { label } from '../lib/format.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)

// every sidebar link. "roles" limits who sees it (no roles = everyone)
const links = [
  { to: '/dashboard', text: 'Dashboard', icon: 'dashboard' },
  { to: '/employees', text: 'Employees', icon: 'users', roles: ['admin', 'hr'] },
  { to: '/attendance', text: 'Attendance', icon: 'clock' },
  { to: '/leave', text: 'Leave', icon: 'calendar' },
  { to: '/tasks', text: 'Tasks', icon: 'tasks' },
]
const visibleLinks = computed(() => links.filter((l) => !l.roles || l.roles.includes(auth.role)))

// close the phone menu after you pick a page, and stop the page scrolling behind it while it's open
watch(() => route.path, () => (menuOpen.value = false))
watch(menuOpen, (open) => (document.body.style.overflow = open ? 'hidden' : ''))

function signOut() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="app">
    <!-- phone only: top bar with the hamburger -->
    <header class="topbar">
      <span class="brand"><img class="brand-logo" src="/logo.png" alt="" /><span>Hire<span class="rise">Rise</span></span></span>
      <button class="menu-btn" :class="{ open: menuOpen }" type="button" aria-label="Toggle menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>
    </header>

    <aside class="sidebar" :class="{ open: menuOpen }">
      <span class="brand"><img class="brand-logo" src="/logo.png" alt="" /><span>Hire<span class="rise">Rise</span></span></span>

      <nav class="side-nav">
        <RouterLink v-for="l in visibleLinks" :key="l.to" :to="l.to" active-class="active">
          <NavIcon :name="l.icon" />{{ l.text }}
        </RouterLink>
      </nav>

      <div class="side-user">
        <span class="avatar">{{ auth.displayName.slice(0, 2).toUpperCase() }}</span>
        <div class="who">
          <strong>{{ auth.displayName }}</strong>
          <small>{{ label(auth.role) }}</small>
        </div>
        <button class="icon-btn" type="button" aria-label="Sign out" title="Sign out" @click="signOut">
          <NavIcon name="logout" />
        </button>
      </div>
    </aside>

    <main class="main">
      <!-- the current page (Dashboard, Employees...) appears here -->
      <RouterView v-slot="{ Component, route: current }">
        <!-- mode="wait": the old page fades out first, then the new one fades in -->
        <AnimatePresence mode="wait">
          <motion.div
            :key="current.path"
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -4, transition: { duration: 0.08 } }"
            :transition="{ duration: 0.16, ease: 'easeOut' }"
          >
            <component :is="Component" />
          </motion.div>
        </AnimatePresence>
      </RouterView>
    </main>
  </div>
</template>