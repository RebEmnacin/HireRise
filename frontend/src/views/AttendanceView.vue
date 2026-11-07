<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHrStore, LATE_AFTER } from '../stores/hr'
import { fmtDate, fmtTime, hoursBetween, initials } from '../lib/format'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'

const auth = useAuthStore()
const hr = useHrStore()

// a clock that ticks every second
const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 1000)))
onBeforeUnmount(() => clearInterval(timer)) // always stop timers when leaving the page

const clockText = computed(() => now.value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }))

const statusLine = computed(() => {
  const t = hr.myToday
  if (!t) return `You have not clocked in yet. Arrive after ${fmtTime(LATE_AFTER)} and it counts as late.`
  if (!t.time_out) return `Clocked in at ${fmtTime(t.time_in)}${t.status === 'late' ? ' (late)' : ''}. Have a good one.`
  return `Clocked out at ${fmtTime(t.time_out)}. ${hoursBetween(t.time_in, t.time_out).toFixed(1)} hours today.`
})

const tab = ref('mine') // 'mine' | 'team'

// HR's "team today" view: every employee who has not resigned, with today's record if there is one
const team = computed(() =>
  hr.activeEmployees.map((e) => {
    const rec = hr.todayRecords.find((a) => a.employeeId === e.id)
    return { e, rec, status: rec ? rec.status : 'not_yet' }
  })
)
</script>

<template>
  <PageHeader title="Attendance" subtitle="Clock in, clock out and review your days." />

  <section class="clock-card">
    <div>
      <div class="clock-time">{{ clockText }}</div>
      <p>{{ statusLine }}</p>
    </div>
    <button v-if="!hr.myToday" class="btn" type="button" @click="hr.clockIn()">Clock in</button>
    <button v-else class="btn" type="button" :disabled="Boolean(hr.myToday.time_out)" @click="hr.clockOut()">
      {{ hr.myToday.time_out ? 'Done for today' : 'Clock out' }}
    </button>
  </section>

  <div v-if="auth.isHR" class="tabs" role="tablist">
    <button type="button" :class="{ on: tab === 'mine' }" @click="tab = 'mine'">My attendance</button>
    <button type="button" :class="{ on: tab === 'team' }" @click="tab = 'team'">Team today</button>
  </div>

  <!-- my attendance -->
  <div v-if="tab === 'mine'" class="table-wrap">
    <table class="table">
      <thead><tr><th>Date</th><th>Time in</th><th>Time out</th><th>Hours</th><th>Status</th></tr></thead>
      <tbody>
        <tr v-for="a in hr.myAttendance.slice(0, 20)" :key="a.id">
          <td>{{ fmtDate(a.date) }}</td>
          <td>{{ fmtTime(a.time_in) }}</td>
          <td>{{ fmtTime(a.time_out) }}</td>
          <td>{{ a.time_in && a.time_out ? hoursBetween(a.time_in, a.time_out).toFixed(1) : '-' }}</td>
          <td><StatusBadge :status="a.status" /></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- HR: everyone, today -->
  <div v-else class="table-wrap">
    <table class="table">
      <thead><tr><th>Employee</th><th>Department</th><th>Time in</th><th>Time out</th><th>Status</th></tr></thead>
      <tbody>
        <tr v-for="r in team" :key="r.e.id">
          <td>
            <div class="person">
              <span class="avatar">{{ initials(r.e.first, r.e.last) }}</span>
              <div><strong>{{ r.e.first }} {{ r.e.last }}</strong><small>{{ r.e.position }}</small></div>
            </div>
          </td>
          <td>{{ r.e.dept }}</td>
          <td>{{ fmtTime(r.rec?.time_in) }}</td>
          <td>{{ fmtTime(r.rec?.time_out) }}</td>
          <td><StatusBadge :status="r.status" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
