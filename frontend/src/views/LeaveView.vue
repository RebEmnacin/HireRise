<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHrStore, LEAVE_TYPES } from '../stores/hr'
import { fmtDate, label, daysInclusive, initials } from '../lib/format'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'

const auth = useAuthStore()
const hr = useHrStore()

const form = reactive({ type: 'vacation', start: '', end: '', reason: '' })
const errors = reactive({ start: '', end: '', reason: '' })
const sent = ref(false)

function submit() {
  sent.value = false
  errors.start = form.start ? '' : 'Pick a start date.'
  errors.end = !form.end ? 'Pick an end date.' : form.end < form.start ? 'End date is before the start date.' : '' // ISO dates compare correctly as text
  errors.reason = form.reason.trim().length >= 3 ? '' : 'Add a short reason.'
  if (Object.values(errors).some(Boolean)) return

  hr.addLeave({ ...form, reason: form.reason.trim() })
  Object.assign(form, { type: 'vacation', start: '', end: '', reason: '' })
  sent.value = true
}

// HR sees every request, pending ones first
const allRequests = computed(() =>
  [...hr.leaves].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || b.start.localeCompare(a.start))
)
</script>

<template>
  <PageHeader title="Leave" subtitle="Ask for time off and track every request." />

  <div class="grid-2">
    <!-- request form -->
    <section class="panel">
      <h2>New request</h2>
      <p class="sub">Your manager and HR are notified once you send it.</p>
      <div v-if="sent" class="alert ok" role="status">Request sent. You will see the decision here.</div>
      <form novalidate @submit.prevent="submit">
        <div class="field">
          <label for="type">Leave type</label>
          <select id="type" v-model="form.type"><option v-for="t in LEAVE_TYPES" :key="t" :value="t">{{ label(t) }}</option></select>
        </div>
        <div class="field-row">
          <div class="field" :class="{ invalid: errors.start }">
            <label for="start">From</label><input id="start" v-model="form.start" type="date" />
            <p class="error-msg">{{ errors.start }}</p>
          </div>
          <div class="field" :class="{ invalid: errors.end }">
            <label for="end">To</label><input id="end" v-model="form.end" type="date" />
            <p class="error-msg">{{ errors.end }}</p>
          </div>
        </div>
        <div class="field" :class="{ invalid: errors.reason }">
          <label for="reason">Reason</label><textarea id="reason" v-model="form.reason"></textarea>
          <p class="error-msg">{{ errors.reason }}</p>
        </div>
        <button class="btn btn-primary" type="submit">Send request</button>
      </form>
    </section>

    <!-- my requests -->
    <section class="panel">
      <h2>My requests</h2>
      <p class="sub">Newest first.</p>
      <p v-if="!hr.myLeaves.length" class="empty">No requests yet.</p>
      <div v-for="l in hr.myLeaves" :key="l.id" class="list-item">
        <div>
          <strong>{{ label(l.type) }} · {{ daysInclusive(l.start, l.end) }} day{{ daysInclusive(l.start, l.end) === 1 ? '' : 's' }}</strong>
          <small>{{ fmtDate(l.start) }}<template v-if="l.end !== l.start"> to {{ fmtDate(l.end) }}</template></small>
        </div>
        <StatusBadge :status="l.status" />
      </div>
    </section>
  </div>

  <!-- HR: all requests with approve / reject -->
  <section v-if="auth.isHR">
    <h2 style="margin-bottom: 12px">All requests</h2>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="l in allRequests" :key="l.id">
            <td>
              <div class="person">
                <span class="avatar">{{ initials(hr.byId(l.employeeId)?.first, hr.byId(l.employeeId)?.last) }}</span>
                <strong>{{ hr.nameOf(l.employeeId) }}</strong>
              </div>
            </td>
            <td>{{ label(l.type) }}</td>
            <td>{{ fmtDate(l.start) }}<template v-if="l.end !== l.start"> to {{ fmtDate(l.end) }}</template></td>
            <td>{{ daysInclusive(l.start, l.end) }}</td>
            <td>{{ l.reason }}</td>
            <td><StatusBadge :status="l.status" /></td>
            <td>
              <div v-if="l.status === 'pending'" class="actions" style="display: flex; gap: 8px">
                <button class="btn btn-success btn-sm" type="button" @click="hr.decideLeave(l.id, 'approved')">Approve</button>
                <button class="btn btn-danger btn-sm" type="button" @click="hr.decideLeave(l.id, 'rejected')">Reject</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
