<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useHrStore } from '../stores/hr'
import { fmtDate, fmtTime, label, daysInclusive } from '../lib/format'
import PageHeader from '../components/PageHeader.vue'
import LineIcon from '../components/LineIcon.vue'
import CountUp from '../components/CountUp.vue'
import StatusBadge from '../components/StatusBadge.vue'

const auth = useAuthStore()
const hr = useHrStore()

// ---------- HR / admin view ----------
const presentToday = computed(() => hr.todayRecords.filter((a) => a.status === 'present' || a.status === 'late').length)
const onLeaveNow = computed(() => hr.employees.filter((e) => e.status === 'on_leave').length)

// the segments of the "attendance today" bar
const breakdown = computed(() => {
  const count = (s) => hr.todayRecords.filter((a) => a.status === s).length
  const notYet = Math.max(0, hr.activeEmployees.length - hr.todayRecords.length)
  const total = hr.activeEmployees.length || 1
  return [
    { key: 'present', text: 'Present', n: count('present'), color: 'var(--green)' },
    { key: 'late', text: 'Late', n: count('late'), color: 'var(--amber)' },
    { key: 'on_leave', text: 'On leave', n: count('on_leave'), color: 'var(--blue)' },
    { key: 'absent', text: 'Absent', n: count('absent'), color: 'var(--red)' },
    { key: 'notyet', text: 'Not in yet', n: notYet, color: '#c3c9d6' },
  ].map((s) => ({ ...s, pct: (s.n / total) * 100 }))
})

const dueSoon = computed(() =>
  hr.tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5)
)

// ---------- employee view ----------
const monthPrefix = computed(() => hr.todayISO.slice(0, 7))
const myMonth = computed(() => hr.myAttendance.filter((a) => a.date.startsWith(monthPrefix.value)))
const myDaysPresent = computed(() => myMonth.value.filter((a) => a.status === 'present' || a.status === 'late').length)
const myLate = computed(() => myMonth.value.filter((a) => a.status === 'late').length)
const myLeaveDays = computed(() =>
  hr.myLeaves.filter((l) => l.status === 'approved' && l.start.startsWith(hr.todayISO.slice(0, 4))).reduce((sum, l) => sum + daysInclusive(l.start, l.end), 0)
)
const myOpenTasks = computed(() => hr.myTasks.filter((t) => t.status !== 'done'))
</script>

<template>
  <!-- ================= HR / ADMIN ================= -->
  <template v-if="auth.isHR">
    <PageHeader title="Dashboard" subtitle="A live picture of your company today." />

    <div class="grid-4">
      <div v-reveal class="stat"><LineIcon name="users" /><div><CountUp :to="hr.activeEmployees.length" /><p>Employees</p></div></div>
      <div v-reveal="0.08" class="stat"><LineIcon name="userCheck" class="green" /><div><CountUp :to="presentToday" /><p>Present today</p></div></div>
      <div v-reveal="0.16" class="stat"><LineIcon name="calendar" class="coral" /><div><CountUp :to="onLeaveNow" /><p>On leave</p></div></div>
      <div v-reveal="0.24" class="stat"><LineIcon name="inbox" class="amber" /><div><CountUp :to="hr.pendingLeaves.length" /><p>Pending requests</p></div></div>
    </div>

    <div class="grid-2">
      <section v-reveal class="panel">
        <h2>Attendance today</h2>
        <p class="sub">{{ fmtDate(hr.todayISO) }}</p>
        <div class="stack-bar" role="img" aria-label="Attendance today">
          <span v-for="s in breakdown" :key="s.key" :style="{ width: s.pct + '%', background: s.color }"></span>
        </div>
        <div class="legend">
          <span v-for="s in breakdown" :key="s.key"><i :style="{ background: s.color }"></i>{{ s.text }} {{ s.n }}</span>
        </div>
      </section>

      <section v-reveal="0.1" class="panel">
        <h2>Leave requests waiting</h2>
        <p class="sub">Approve or reject without leaving the dashboard.</p>
        <p v-if="!hr.pendingLeaves.length" class="empty">All caught up.</p>
        <div v-for="l in hr.pendingLeaves.slice(0, 4)" :key="l.id" class="list-item">
          <div>
            <strong>{{ hr.nameOf(l.employeeId) }}</strong>
            <small>{{ label(l.type) }} · {{ fmtDate(l.start) }}<template v-if="l.end !== l.start"> to {{ fmtDate(l.end) }}</template></small>
          </div>
          <div class="actions">
            <button class="btn btn-success btn-sm" type="button" @click="hr.decideLeave(l.id, 'approved')">Approve</button>
            <button class="btn btn-danger btn-sm" type="button" @click="hr.decideLeave(l.id, 'rejected')">Reject</button>
          </div>
        </div>
      </section>
    </div>

    <section v-reveal class="panel">
      <h2>Work due soon</h2>
      <p class="sub">The next open tasks by deadline.</p>
      <div v-for="t in dueSoon" :key="t.id" class="list-item">
        <div>
          <strong>{{ t.title }}</strong>
          <small>{{ hr.nameOf(t.assigneeId) }} · due {{ fmtDate(t.due) }}</small>
        </div>
        <StatusBadge :status="t.status" />
      </div>
    </section>
  </template>

  <!-- ================= EMPLOYEE ================= -->
  <template v-else>
    <PageHeader :title="`Hello, ${hr.me.first}`" subtitle="Your month at a glance." />

    <div class="grid-4">
      <div v-reveal class="stat"><LineIcon name="userCheck" class="green" /><div><CountUp :to="myDaysPresent" /><p>Days present this month</p></div></div>
      <div v-reveal="0.08" class="stat"><LineIcon name="clock" class="amber" /><div><CountUp :to="myLate" /><p>Late arrivals</p></div></div>
      <div v-reveal="0.16" class="stat"><LineIcon name="calendar" class="coral" /><div><CountUp :to="myLeaveDays" /><p>Leave days used</p></div></div>
      <div v-reveal="0.24" class="stat"><LineIcon name="tasks" /><div><CountUp :to="myOpenTasks.length" /><p>Open tasks</p></div></div>
    </div>

    <div class="grid-2">
      <section v-reveal class="panel">
        <h2>Recent attendance</h2>
        <p class="sub">Your last five days.</p>
        <div v-for="a in hr.myAttendance.slice(0, 5)" :key="a.id" class="list-item">
          <div>
            <strong>{{ fmtDate(a.date) }}</strong>
            <small>{{ fmtTime(a.time_in) }} to {{ fmtTime(a.time_out) }}</small>
          </div>
          <StatusBadge :status="a.status" />
        </div>
      </section>

      <section v-reveal="0.1" class="panel">
        <h2>My open tasks</h2>
        <p class="sub">What is waiting on you.</p>
        <p v-if="!myOpenTasks.length" class="empty">Nothing open. Nice.</p>
        <div v-for="t in myOpenTasks" :key="t.id" class="list-item">
          <div>
            <strong>{{ t.title }}</strong>
            <small>Due {{ fmtDate(t.due) }}</small>
          </div>
          <StatusBadge :status="t.status" />
        </div>
      </section>
    </div>
  </template>
</template>
