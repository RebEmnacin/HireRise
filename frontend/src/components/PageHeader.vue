<script setup>
defineProps({ title: { type: String, required: true }, subtitle: { type: String, default: '' } })
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <!-- anything placed inside <PageHeader>...</PageHeader> shows here (buttons, filters) -->
    <div class="page-actions"><slot /></div>
  </div>
</template>
