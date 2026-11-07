<script setup>
import { ref, reactive, computed } from 'vue'
import { useHrStore, DEPARTMENTS } from '../stores/hr'
import { fmtDate, initials, label } from '../lib/format'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'

const hr = useHrStore()

// the three filter controls (v-model keeps them in sync with the inputs)
const search = ref('')
const status = ref('')
const dept = ref('')

const statuses = ['active', 'probation', 'on_leave', 'resigned']

// computed = recalculated automatically whenever search/status/dept (or the data) change
const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return hr.employees.filter(
    (e) =>
      (!q || `${e.first} ${e.last} ${e.no} ${e.email} ${e.position}`.toLowerCase().includes(q)) &&
      (!status.value || e.status === status.value) &&
      (!dept.value || e.dept === dept.value)
  )
})

// ---------- "Add employee" modal ----------
const showForm = ref(false)
const form = reactive({ first: '', last: '', email: '', dept: DEPARTMENTS[0], position: '', hired: '' })
const errors = reactive({ first: '', last: '', email: '', position: '', hired: '' })

const rules = {
  first: (v) => (v.trim() ? '' : 'First name is required.'),
  last: (v) => (v.trim() ? '' : 'Last name is required.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email.'),
  position: (v) => (v.trim() ? '' : 'Position is required.'),
  hired: (v) => (v ? '' : 'Pick a hire date.'),
}

function openForm() {
  Object.assign(form, { first: '', last: '', email: '', dept: DEPARTMENTS[0], position: '', hired: '' })
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  showForm.value = true
}

function save() {
  Object.keys(rules).forEach((k) => (errors[k] = rules[k](form[k])))
  if (Object.values(errors).some(Boolean)) return
  hr.addEmployee({ ...form, first: form.first.trim(), last: form.last.trim() })
  showForm.value = false
}
</script>

<template>
  <PageHeader title="Employees" subtitle="Everyone in the company and where they stand.">
    <button class="btn btn-primary" type="button" @click="openForm">+ Add employee</button>
  </PageHeader>

  <div class="toolbar">
    <input v-model="search" type="search" placeholder="Search name, ID, email or position..." aria-label="Search employees" />
    <select v-model="status" aria-label="Status">
      <option value="">All statuses</option>
      <option v-for="s in statuses" :key="s" :value="s">{{ label(s) }}</option>
    </select>
    <select v-model="dept" aria-label="Department">
      <option value="">All departments</option>
      <option v-for="d in DEPARTMENTS" :key="d" :value="d">{{ d }}</option>
    </select>
  </div>

  <p class="count">{{ rows.length }} employee{{ rows.length === 1 ? '' : 's' }}</p>

  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr><th>Employee</th><th>ID</th><th>Department</th><th>Position</th><th>Status</th><th>Hired</th></tr>
      </thead>
      <tbody>
        <tr v-for="e in rows" :key="e.id">
          <td>
            <div class="person">
              <span class="avatar">{{ initials(e.first, e.last) }}</span>
              <div><strong>{{ e.first }} {{ e.last }}</strong><small>{{ e.email }}</small></div>
            </div>
          </td>
          <td>{{ e.no }}</td>
          <td>{{ e.dept }}</td>
          <td>{{ e.position }}</td>
          <td><StatusBadge :status="e.status" /></td>
          <td>{{ fmtDate(e.hired) }}</td>
        </tr>
        <tr v-if="!rows.length"><td colspan="6" class="empty">No employees match your search.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- the modal: v-if shows it only while showForm is true. Clicking the dark area closes it. -->
  <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
    <form class="modal" novalidate @submit.prevent="save">
      <h2>Add employee</h2>
      <div class="field-row">
        <div class="field" :class="{ invalid: errors.first }">
          <label for="first">First name</label><input id="first" v-model="form.first" type="text" />
          <p class="error-msg">{{ errors.first }}</p>
        </div>
        <div class="field" :class="{ invalid: errors.last }">
          <label for="last">Last name</label><input id="last" v-model="form.last" type="text" />
          <p class="error-msg">{{ errors.last }}</p>
        </div>
      </div>
      <div class="field" :class="{ invalid: errors.email }">
        <label for="e-email">Work email</label><input id="e-email" v-model="form.email" type="email" />
        <p class="error-msg">{{ errors.email }}</p>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="e-dept">Department</label>
          <select id="e-dept" v-model="form.dept"><option v-for="d in DEPARTMENTS" :key="d">{{ d }}</option></select>
        </div>
        <div class="field" :class="{ invalid: errors.hired }">
          <label for="e-hired">Hire date</label><input id="e-hired" v-model="form.hired" type="date" />
          <p class="error-msg">{{ errors.hired }}</p>
        </div>
      </div>
      <div class="field" :class="{ invalid: errors.position }">
        <label for="e-pos">Position</label><input id="e-pos" v-model="form.position" type="text" />
        <p class="error-msg">{{ errors.position }}</p>
      </div>
      <p class="muted" style="font-size: 0.82rem; margin-bottom: 14px">Sample mode: the new employee is kept in the browser only. The backend step will save it and create their login.</p>
      <div class="modal-actions">
        <button class="btn btn-outline" type="button" @click="showForm = false">Cancel</button>
        <button class="btn btn-primary" type="submit">Save employee</button>
      </div>
    </form>
  </div>
</template>
