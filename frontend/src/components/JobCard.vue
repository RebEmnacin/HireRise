<script setup>
defineProps({ job: { type: Object, required: true } })
</script>

<template>
  <article v-reveal class="job">
    <div>
      <h3>{{ job.title }}</h3>
      <div class="tags">
        <span class="tag">{{ job.dept }}</span>
        <span class="tag alt">{{ job.type }}</span>
        <span class="tag">{{ job.location }}</span>
        <span class="tag">{{ job.level }}</span>
      </div>
    </div>
    <!-- sends the role name to the contact page as ?role=... -->
    <RouterLink class="btn btn-outline" :to="{ path: '/contact', query: { role: job.title } }">Apply</RouterLink>
  </article>
</template>
