// SAMPLE DATA STORE.
// Everything here is made up and lives only in the browser (a refresh resets it).
// As the backend gets its endpoints (employees, attendance, leave, tasks), each action below
// gets replaced by an API call, and the arrays are filled from the server instead.
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { toISO, nowHHMM } from '../lib/format'

export const DEPARTMENTS = ['People Ops', 'Engineering', 'Finance', 'Sales', 'Operations']
export const LEAVE_TYPES = ['vacation', 'sick', 'emergency', 'unpaid']
export const LATE_AFTER = '09:15' // clocking in after this time counts as "late"

const today = new Date()
const iso = (offsetDays) => toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays))
const isWeekday = (offset) => {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset).getDay()
  return day !== 0 && day !== 6
}

const employees = [
  { id: 1, no: 'EMP-0001', first: 'Ana', last: 'Dela Cruz', email: 'ana@hirerise.example', dept: 'People Ops', position: 'HR Manager', status: 'active', hired: '2021-03-01' },
  { id: 2, no: 'EMP-0002', first: 'Marco', last: 'Santos', email: 'marco@hirerise.example', dept: 'Engineering', position: 'Software Engineer', status: 'active', hired: '2022-06-15' },
  { id: 3, no: 'EMP-0003', first: 'Lea', last: 'Ramos', email: 'lea@hirerise.example', dept: 'Finance', position: 'Payroll Analyst', status: 'active', hired: '2022-09-05' },
  { id: 4, no: 'EMP-0004', first: 'Paolo', last: 'Reyes', email: 'paolo@hirerise.example', dept: 'Sales', position: 'Account Executive', status: 'probation', hired: iso(-60) },
  { id: 5, no: 'EMP-0005', first: 'Maria', last: 'Lopez', email: 'maria@hirerise.example', dept: 'Operations', position: 'Operations Lead', status: 'on_leave', hired: '2020-01-20' },
  { id: 6, no: 'EMP-0006', first: 'Daniel', last: 'Cruz', email: 'daniel@hirerise.example', dept: 'Engineering', position: 'QA Engineer', status: 'active', hired: '2023-02-13' },
  { id: 7, no: 'EMP-0007', first: 'Aisha', last: 'Tan', email: 'aisha@hirerise.example', dept: 'Finance', position: 'Accountant', status: 'active', hired: '2021-11-08' },
  { id: 8, no: 'EMP-0008', first: 'Jamie', last: 'Santiago', email: 'jamie@hirerise.example', dept: 'People Ops', position: 'Recruiter', status: 'probation', hired: iso(-30) },
  { id: 9, no: 'EMP-0009', first: 'Carlo', last: 'Mendoza', email: 'carlo@hirerise.example', dept: 'Sales', position: 'Sales Associate', status: 'resigned', hired: '2022-04-04' },
  { id: 10, no: 'EMP-0010', first: 'Bea', last: 'Villanueva', email: 'bea@hirerise.example', dept: 'Operations', position: 'Logistics Coordinator', status: 'active', hired: '2023-08-21' },
]

// predictable "random" numbers so the sample data looks the same on every refresh
const rand = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/** Last 20 working days of attendance for every employee who is not resigned. */
function buildAttendance() {
  const rows = []
  let id = 1
  for (const e of employees) {
    if (e.status === 'resigned') continue
    for (let off = -28; off <= 0; off++) {
      if (!isWeekday(off)) continue
      if (off === 0 && e.id === 1) continue // "me" (Ana) hasn't clocked in yet today, so you can try the button
      let status = 'present'
      let time_in = '08:' + String(40 + Math.floor(rand(e.id * 100 + off) * 19)).padStart(2, '0')
      let time_out = '17:' + String(Math.floor(rand(e.id * 50 + off) * 40)).padStart(2, '0')
      const r = rand(e.id * 7 + off * 3)
      if (r > 0.88) { status = 'late'; time_in = '09:' + String(20 + Math.floor(rand(off + e.id) * 30)).padStart(2, '0') }
      else if (r < 0.04) { status = 'absent'; time_in = null; time_out = null }
      if (e.status === 'on_leave' && off >= -2) { status = 'on_leave'; time_in = null; time_out = null }
      if (off === 0 && status !== 'absent' && status !== 'on_leave') time_out = rand(e.id) > 0.5 ? null : time_out // some still working
      rows.push({ id: id++, employeeId: e.id, date: iso(off), time_in, time_out, status })
    }
  }
  return rows
}

const leaves = [
  { id: 1, employeeId: 5, type: 'vacation', start: iso(-2), end: iso(4), reason: 'Family trip', status: 'approved', reviewedBy: 1 },
  { id: 2, employeeId: 2, type: 'sick', start: iso(1), end: iso(2), reason: 'Flu and fever', status: 'pending', reviewedBy: null },
  { id: 3, employeeId: 6, type: 'vacation', start: iso(10), end: iso(14), reason: 'Beach holiday', status: 'pending', reviewedBy: null },
  { id: 4, employeeId: 3, type: 'emergency', start: iso(-12), end: iso(-12), reason: 'Family emergency', status: 'approved', reviewedBy: 1 },
  { id: 5, employeeId: 7, type: 'unpaid', start: iso(-20), end: iso(-18), reason: 'Personal matters', status: 'rejected', reviewedBy: 1 },
  { id: 6, employeeId: 1, type: 'vacation', start: iso(-45), end: iso(-41), reason: 'Rest week', status: 'approved', reviewedBy: 1 },
  { id: 7, employeeId: 10, type: 'sick', start: iso(0), end: iso(0), reason: 'Migraine', status: 'pending', reviewedBy: null },
]

const tasks = [
  { id: 1, title: 'Prepare Q4 payroll run', assigneeId: 3, due: iso(3), status: 'in_progress' },
  { id: 2, title: 'Update the employee handbook', assigneeId: 1, due: iso(10), status: 'todo' },
  { id: 3, title: 'Onboard the two new sales hires', assigneeId: 8, due: iso(2), status: 'in_progress' },
  { id: 4, title: 'Fix the attendance export bug', assigneeId: 2, due: iso(-1), status: 'todo' },
  { id: 5, title: 'Reconcile October expenses', assigneeId: 7, due: iso(5), status: 'todo' },
  { id: 6, title: 'Schedule performance reviews', assigneeId: 1, due: iso(14), status: 'todo' },
  { id: 7, title: 'Renew office insurance', assigneeId: 10, due: iso(-6), status: 'done' },
  { id: 8, title: 'Test the new leave form', assigneeId: 6, due: iso(4), status: 'in_progress' },
  { id: 9, title: 'Collect signed contracts', assigneeId: 8, due: iso(-3), status: 'done' },
  { id: 10, title: 'Order laptops for new hires', assigneeId: 10, due: iso(7), status: 'todo' },
]

const FLOW = ['todo', 'in_progress', 'done']

export const useHrStore = defineStore('hr', {
  state: () => ({
    employees,
    attendance: buildAttendance(),
    leaves,
    tasks,
  }),

  getters: {
    /** The employee record of whoever is logged in. Admins without one fall back to employee #1 for the demo. */
    me() {
      const auth = useAuthStore()
      const id = auth.user?.employee?.id ?? 1
      return this.employees.find((e) => e.id === id) ?? this.employees[0]
    },
    byId: (s) => (id) => s.employees.find((e) => e.id === id),
    nameOf() {
      return (id) => {
        const e = this.byId(id)
        return e ? `${e.first} ${e.last}` : 'Unknown'
      }
    },
    todayISO: () => toISO(new Date()),
    myToday() {
      return this.attendance.find((a) => a.employeeId === this.me.id && a.date === this.todayISO) ?? null
    },
    myAttendance() {
      return this.attendance.filter((a) => a.employeeId === this.me.id).sort((a, b) => b.date.localeCompare(a.date))
    },
    todayRecords() {
      return this.attendance.filter((a) => a.date === this.todayISO)
    },
    activeEmployees: (s) => s.employees.filter((e) => e.status !== 'resigned'),
    pendingLeaves: (s) => s.leaves.filter((l) => l.status === 'pending'),
    myLeaves() {
      return this.leaves.filter((l) => l.employeeId === this.me.id).sort((a, b) => b.start.localeCompare(a.start))
    },
    myTasks() {
      return this.tasks.filter((t) => t.assigneeId === this.me.id)
    },
  },

  actions: {
    clockIn() {
      if (this.myToday) return
      const time = nowHHMM()
      this.attendance.push({
        id: Date.now(),
        employeeId: this.me.id,
        date: this.todayISO,
        time_in: time,
        time_out: null,
        status: time > LATE_AFTER ? 'late' : 'present', // "HH:MM" strings compare correctly as text
      })
    },
    clockOut() {
      if (this.myToday && !this.myToday.time_out) this.myToday.time_out = nowHHMM()
    },

    addLeave({ type, start, end, reason }) {
      this.leaves.unshift({ id: Date.now(), employeeId: this.me.id, type, start, end, reason, status: 'pending', reviewedBy: null })
    },
    decideLeave(id, status) {
      const l = this.leaves.find((x) => x.id === id)
      if (!l) return
      l.status = status
      l.reviewedBy = this.me.id
      // approved leave that covers today puts the person on leave
      if (status === 'approved' && l.start <= this.todayISO && l.end >= this.todayISO) {
        const e = this.byId(l.employeeId)
        if (e && e.status !== 'resigned') e.status = 'on_leave'
      }
    },

    addEmployee(data) {
      const id = Math.max(...this.employees.map((e) => e.id)) + 1
      this.employees.push({ id, no: `EMP-${String(id).padStart(4, '0')}`, status: 'probation', ...data })
    },

    addTask({ title, assigneeId, due }) {
      this.tasks.unshift({ id: Date.now(), title, assigneeId, due, status: 'todo' })
    },
    moveTask(id, dir) {
      const t = this.tasks.find((x) => x.id === id)
      if (!t) return
      const next = FLOW.indexOf(t.status) + dir
      if (next >= 0 && next < FLOW.length) t.status = FLOW[next]
    },
  },
})
