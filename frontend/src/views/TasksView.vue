<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHrStore } from '../stores/hr'
import { fmtDate, initials } from '../lib/format'
import PageHeader from '../components/PageHeader.vue'

const auth = useAuthStore()
const hr = useHrStore()

const columns = [
  { key: 'todo', text: 'To do' },
  { key: 'in_progress', text: 'In progress' },
  { key: 'done', text: 'Done' },
]

// HR can filter the board by person. Employees only ever see their own tasks.
const who = ref('') // '' = everyone
const visible = computed(() => {
  if (!auth.isHR) return hr.myTasks
  return who.value ? hr.tasks.filter((t) => t.assigneeId === Number(who.value)) : hr.tasks
})
const inColumn = (key) => visible.value.filter((t) => t.status === key).sort((a, b) => a.due.localeCompare(b.due))
const isOverdue = (t) => t.status !== 'done' && t.due < hr.todayISO

// ---------- "New task" modal ----------
const showForm = ref(false)
const form = reactive({ title: '', assigneeId: '', due: '' })
const errors = reactive({ title: '', assigneeId: '', due: '' })

function openForm() {
  Object.assign(form, { title: '', assigneeId: '', due: '' })
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  showForm.value = true
}
function save() {
  errors.title = form.title.trim().length >= 3 ? '' : 'Give the task a title.'
  errors.assigneeId = form.assigneeId ? '' : 'Choose who it is for.'
  errors.due = form.due ? '' : 'Pick a due date.'
  if (Object.values(errors).some(Boolean)) return
  hr.addTask({ title: form.title.trim(), assigneeId: Number(form.assigneeId), due: form.due })
  showForm.value = false
}
</script>

<template>
  <PageHeader title="Tasks" :subtitle="auth.isHR ? 'Work assigned across the company.' : 'Work assigned to you.'">
    <select v-if="auth.isHR" v-model="who" aria-label="Filter by employee" style="width: auto">
      <option value="">Everyone</option>
      <option v-for="e in hr.activeEmployees" :key="e.id" :value="e.id">{{ e.first }} {{ e.last }}</option>
    </select>
    <button v-if="auth.isHR" class="btn btn-primary" type="button" @click="openForm">+ New task</button>
  </PageHeader>

  <div class="board">
    <section v-for="c in columns" :key="c.key" class="column">
      <h2>{{ c.text }} <span>{{ inColumn(c.key).length }}</span></h2>

      <article v-for="t in inColumn(c.key)" :key="t.id" class="task">
        <h3>{{ t.title }}</h3>
        <div class="task-foot">
          <span class="person" style="gap: 8px">
            <span class="avatar" style="width: 26px; height: 26px; font-size: 0.65rem">{{ initials(hr.byId(t.assigneeId)?.first, hr.byId(t.assigneeId)?.last) }}</span>
            <span :class="{ overdue: isOverdue(t) }">{{ isOverdue(t) ? 'Overdue · ' : '' }}{{ fmtDate(t.due) }}</span>
          </span>
          <span class="move">
            <button type="button" :disabled="t.status === 'todo'" :aria-label="`Move ${t.title} back`" @click="hr.moveTask(t.id, -1)">‹</button>
            <button type="button" :disabled="t.status === 'done'" :aria-label="`Move ${t.title} forward`" @click="hr.moveTask(t.id, 1)">›</button>
          </span>
        </div>
      </article>

      <p v-if="!inColumn(c.key).length" class="muted" style="font-size: 0.85rem; padding: 8px 4px">Nothing here.</p>
    </section>
  </div>

  <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
    <form class="modal" novalidate @submit.prevent="save">
      <h2>New task</h2>
      <div class="field" :class="{ invalid: errors.title }">
        <label for="t-title">Title</label><input id="t-title" v-model="form.title" type="text" />
        <p class="error-msg">{{ errors.title }}</p>
      </div>
      <div class="field-row">
        <div class="field" :class="{ invalid: errors.assigneeId }">
          <label for="t-who">Assign to</label>
          <select id="t-who" v-model="form.assigneeId">
            <option value="">Choose...</option>
            <option v-for="e in hr.activeEmployees" :key="e.id" :value="e.id">{{ e.first }} {{ e.last }}</option>
          </select>
          <p class="error-msg">{{ errors.assigneeId }}</p>
        </div>
        <div class="field" :class="{ invalid: errors.due }">
          <label for="t-due">Due date</label><input id="t-due" v-model="form.due" type="date" />
          <p class="error-msg">{{ errors.due }}</p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" type="button" @click="showForm = false">Cancel</button>
        <button class="btn btn-primary" type="submit">Create task</button>
      </div>
    </form>
  </div>
</template>
