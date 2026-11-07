// small helpers shared by the pages

const pad = (n) => String(n).padStart(2, '0')

/** Date -> "2026-11-03" (local time, not UTC) */
export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "2026-11-03" -> "Nov 3, 2026" */
export function fmtDate(iso) {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "09:05" -> "9:05 AM" */
export function fmtTime(hhmm) {
  if (!hhmm) return '-'
  const [h, m] = hhmm.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`
}

/** Date -> "09:05" */
export function nowHHMM(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Hours between two "HH:MM" strings, e.g. 8.5 */
export function hoursBetween(a, b) {
  if (!a || !b) return 0
  const [h1, m1] = a.split(':').map(Number)
  const [h2, m2] = b.split(':').map(Number)
  return Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60)
}

/** Inclusive number of days between two ISO dates (same day = 1) */
export function daysInclusive(startISO, endISO) {
  const a = new Date(startISO)
  const b = new Date(endISO)
  return Math.round((b - a) / 86400000) + 1
}

export const initials = (first = '', last = '') => `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()

/** "in_progress" -> "In progress" */
export const label = (s = '') => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '')
