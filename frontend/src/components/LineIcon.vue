<script setup>
import { icons } from '../data/icons'

// props = the inputs a parent gives this component:  <LineIcon name="heart" />
defineProps({ name: { type: String, required: true } })
</script>

<template>
  <span class="icon-wrap">
    <!-- v-html puts the icon's SVG shapes inside. Safe here because they are our own fixed strings. -->
    <svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true" v-html="icons[name]"></svg>
  </span>
</template>
