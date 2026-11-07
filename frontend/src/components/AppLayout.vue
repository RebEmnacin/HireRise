<script setup>
import { label } from '../lib/format'

// shows a colored pill for any status: <StatusBadge status="on_leave" />
// the colors come from the .badge--<status> classes in style.css
defineProps({ status: { type: String, required: true } })
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ label(status) }}</span>
</template>
