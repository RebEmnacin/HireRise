<script setup>
import { ref, computed } from 'vue'
import JobCard from '../components/JobCard.vue'
import { jobs } from '../data/jobs'

// the three controls. v-model (in the template) keeps these in sync with the inputs automatically.
const search = ref('')
const dept = ref('')
const type = ref('')

// unique values for the dropdowns (Set removes duplicates)
const departments = [...new Set(jobs.map((j) => j.dept))]
const types = [...new Set(jobs.map((j) => j.type))]

// computed() = a value calculated from other refs. It re-runs by itself whenever search/dept/type change.
const results = computed(() => {
  const q = search.value.trim().toLowerCase()
  return jobs.filter(
    (j) =>
      (!q || j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)) &&
      (!dept.value || j.dept === dept.value) &&
      (!type.value || j.type === type.value)
  )
})
</script>

<template>
  <section class="page-hero">
    <div class="container">
      <h1>Open roles</h1>
      <p>Find a role that fits you. Search by title or location, or filter by department and type.</p>
    </div>
  </section>

  <section class="section" style="padding-top: 48px">
    <div class="container">
      <div class="filters">
        <input v-model="search" type="search" placeholder="Search title or location..." aria-label="Search jobs" />
        <select v-model="dept" aria-label="Department">
          <option value="">All departments</option>
          <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
        </select>
        <select v-model="type" aria-label="Job type">
          <option value="">All types</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <p class="result-count" aria-live="polite">{{ results.length }} open role{{ results.length === 1 ? '' : 's' }}</p>

      <div class="job-list">
        <JobCard v-for="job in results" :key="job.id" :job="job" />
        <!-- v-if shows this block only when the list is empty -->
        <div v-if="!results.length" class="empty">No open roles match your search. Try clearing a filter.</div>
      </div>
    </div>
  </section>
</template>
