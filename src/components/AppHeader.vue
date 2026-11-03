<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

// ref() = a reactive value. When it changes, the template updates by itself.
const menuOpen = ref(false)
const scrolled = ref(false)
const route = useRoute() // the current page info (route.path is the URL)

const links = [
  { to: '/', label: 'Home' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const onScroll = () => (scrolled.value = window.scrollY > 8)
const onKey = (e) => e.key === 'Escape' && (menuOpen.value = false)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})

// watch() runs code whenever a value changes
watch(() => route.path, () => (menuOpen.value = false)) // close the menu after navigating
watch(menuOpen, (open) => (document.body.style.overflow = open ? 'hidden' : '')) // no scrolling behind the menu
</script>

<template>
  <header class="site-header" :class="{ scrolled }">
    <div class="container nav">
      <RouterLink class="brand" to="/"><span class="brand-mark">H</span><span>Hire<span class="rise">Rise</span></span></RouterLink>

      <!-- :class="{ open: menuOpen }" adds the class "open" only while menuOpen is true -->
      <button
        class="menu-btn"
        :class="{ open: menuOpen }"
        type="button"
        aria-label="Toggle menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>

      <nav class="nav-links" :class="{ open: menuOpen }">
        <!-- exact-active-class: RouterLink gives the current page's link the class "active" -->
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" exact-active-class="active">{{ l.label }}</RouterLink>
        <RouterLink class="btn btn-primary" to="/contact">Get in touch</RouterLink>
      </nav>
    </div>
  </header>
</template>
