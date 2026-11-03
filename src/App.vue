<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

// starts the hero progress-bar animation shortly after the app appears
onMounted(() => setTimeout(() => document.body.classList.add('loaded'), 50))
</script>

<template>
  <AppHeader />
  <main>
    <!-- <RouterView> shows whichever page matches the URL (see router/index.js) -->
    <RouterView />
  </main>
  <AppFooter />
</template>
