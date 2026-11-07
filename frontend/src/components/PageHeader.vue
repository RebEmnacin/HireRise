<script setup>
import { icons } from '../data/icons'

// a small icon for the sidebar (no draw animation): <NavIcon name="users" />
defineProps({ name: { type: String, required: true } })
</script>

<template>
  <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" v-html="icons[name]"></svg>
</template>
