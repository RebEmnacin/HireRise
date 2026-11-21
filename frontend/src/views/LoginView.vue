<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { animate, stagger } from 'motion' // motion.dev, the same library the landing page uses
import { useAuthStore } from '../stores/auth'
import { errorMessage } from '../api/client'
import { authApi } from '../api/endpoints'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false) // the eye button flips this: password (dots) <-> text
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value) // talks to the FastAPI backend
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false // runs whether it worked or not
  }
}

// "Try the demo". When the page opens it asks the backend:
//   backend says enabled  -> the buttons sign in through the API
//   backend says disabled -> no buttons (a private install)
//   no backend at all (like the live Vercel site, or the API is down) -> the buttons sign in "offline", in the browser
const demoOn = ref(false)
const demoOffline = ref(false)
const demoLoading = ref('') // which demo button is busy: 'hr' | 'employee' | ''
async function tryDemo(account) {
  error.value = ''
  demoLoading.value = account
  try {
    await auth.demoLogin(account, demoOffline.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    demoLoading.value = ''
  }
}

/* ============ right side: the form ============ */
const formEl = ref(null)

// a wrong password makes the form shake "no"
watch(error, (msg) => {
  if (msg && formEl.value) animate(formEl.value, { x: [0, -12, 10, -7, 4, 0] }, { duration: 0.45, ease: 'easeOut' })
})

/* ============ left side: a little demo of the app that plays on a loop ============ */
// (nothing here is real data: it only shows what you get after signing in)
const stats = ref({ present: 0, leave: 0, pending: 0 })
const clock = ref('--:--:--')
const status = ref('pending') // the leave request on the demo: 'pending' -> 'approved' -> back again

const demoEl = ref(null)
const cursorEl = ref(null)
const approveEl = ref(null)
const reqEl = ref(null)
const actionsEl = ref(null)
const doneEl = ref(null)

let alive = true // set to false when the page is left, so the loop stops
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const spring = (stiffness, damping, extra = {}) => ({ type: 'spring', stiffness, damping, ...extra })
const countTo = (key, to, delay = 0) => animate(0, to, { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => (stats.value[key] = Math.round(v)) })

// the clock shows the real time in the Philippines (Philippine Standard Time, UTC+8), whatever the visitor's own time zone is
const manila = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
let tick
function startClock() {
  const update = () => (clock.value = manila.format(new Date()))
  update()
  tick = setInterval(update, 1000)
}

// where is an element's centre, measured inside the demo area?
function centreOf(el) {
  const a = demoEl.value.getBoundingClientRect()
  const b = el.getBoundingClientRect()
  return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 }
}

// the loop: a cursor moves to "Approve", clicks it, the request turns into "Approved", then it all resets
async function playLeaveDemo() {
  while (alive) {
    status.value = 'pending'
    actionsEl.value.style.opacity = 1
    doneEl.value.style.opacity = 0
    animate(reqEl.value, { scale: 1 }, { duration: 0.01 })
    stats.value.pending = 5
    await sleep(1500)
    if (!alive) return

    // 1. the cursor glides in from the side
    const target = centreOf(approveEl.value)
    await animate(
      cursorEl.value,
      { opacity: [0, 1], x: [target.x + 70, target.x], y: [target.y + 50, target.y] },
      { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    ).finished.catch(() => {})
    if (!alive) return
    // 2. it clicks: the button squashes
    await animate(approveEl.value, { scale: [1, 0.9, 1] }, { duration: 0.28 }).finished.catch(() => {})
    // 3. the request becomes "Approved" and the pending counter goes down by one
    animate(actionsEl.value, { opacity: 0 }, { duration: 0.2 })
    status.value = 'approved'
    stats.value.pending = 4
    animate(reqEl.value, { scale: [1, 1.03, 1] }, spring(300, 14))
    const check = doneEl.value.querySelectorAll('path')
    check.forEach((p) => (p.style.strokeDashoffset = 1))
    animate(doneEl.value, { opacity: 1 }, { duration: 0.2 })
    animate(check, { strokeDashoffset: [1, 0] }, { duration: 0.45, ease: 'easeOut' })
    animate(cursorEl.value, { opacity: 0 }, { duration: 0.3, delay: 0.4 })
    await sleep(3000)
  }
}

onMounted(() => {
  const noBackend = () => {
    demoOn.value = true
    demoOffline.value = true
  }
  authApi
    .demoStatus()
    // a real backend answers with { enabled: true | false }; anything else (like the website's own HTML page) means there is no backend
    .then((d) => (d && typeof d === 'object' && 'enabled' in d ? (demoOn.value = Boolean(d.enabled)) : noBackend()))
    .catch(noBackend)
  const items = [...formEl.value.querySelectorAll('[data-in]')]
  const cards = [...demoEl.value.querySelectorAll('.lg-dcard')]
  try {
    // the form: the heading, fields and button follow one after another
    animate(items, { opacity: [0, 1], y: [18, 0] }, spring(120, 18, { delay: stagger(0.07, { startDelay: 0.35 }) }))
    // the demo: the three cards slide in from the left, one after another, and the numbers count up
    animate(cards, { opacity: [0, 1], x: [-60, 0] }, spring(90, 16, { delay: stagger(0.12, { startDelay: 0.2 }) }))
    countTo('present', 42, 0.5)
    countTo('leave', 3, 0.6)
    countTo('pending', 5, 0.7)
    startClock()
    setTimeout(playLeaveDemo, 2200)
  } catch (err) {
    console.warn('login animation failed, showing the page without it', err)
    items.forEach((el) => (el.style.opacity = 1))
    cards.forEach((el) => (el.style.opacity = 1))
    stats.value = { present: 42, leave: 3, pending: 5 }
  }
})
onBeforeUnmount(() => {
  alive = false
  clearInterval(tick)
})
</script>

<template>
  <div class="lg">
    <!-- ===== left: the dark side, with a small looping demo of the app ===== -->
    <aside class="lg-side" aria-hidden="true">
      <RouterLink :to="{ name: 'landing' }" class="brand lg-brand" tabindex="-1">
        <img class="brand-logo" src="/logo.png" alt="" />
        <span>Hire<span class="rise">Rise</span></span>
      </RouterLink>

      <div class="lg-stage">
      <div class="lg-pitch">
        <h2>Welcome <em>back.</em></h2>
        <p>Your team, their attendance, leave and tasks: right where you left them.</p>
      </div>

      <div ref="demoEl" class="lg-demo">
        <!-- today at a glance -->
        <div class="lg-dcard lg-glance">
          <span class="lg-dlabel">Today</span>
          <div class="lg-stats">
            <span><b>{{ stats.present }}</b><small>Present</small></span>
            <span><b>{{ stats.leave }}</b><small>On leave</small></span>
            <span><b>{{ stats.pending }}</b><small>Pending</small></span>
          </div>
        </div>

        <!-- a leave request that gets approved -->
        <div ref="reqEl" class="lg-dcard lg-req" :class="status">
          <span class="lg-av">MS</span>
          <div class="lg-req-text">
            <b>Maria S.</b>
            <small>Vacation · 3 days</small>
          </div>
          <div ref="actionsEl" class="lg-req-actions">
            <i ref="approveEl" class="yes">Approve</i>
            <i class="no">Reject</i>
          </div>
          <span ref="doneEl" class="lg-done">
            <svg viewBox="0 0 24 24"><circle class="ring" cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.5" /></svg>
            Approved
          </span>
        </div>

        <!-- clocked in -->
        <div class="lg-dcard lg-clock">
          <i class="lg-pulse"></i>
          <div>
            <b>{{ clock }}</b>
            <small>Philippine Standard Time · UTC+8</small>
          </div>
        </div>

        <!-- the pretend mouse pointer that clicks "Approve" -->
        <svg ref="cursorEl" class="lg-cursor" viewBox="0 0 24 24"><path d="M5 3l14 7-6 2-2 6z" /></svg>
      </div>
      </div>
    </aside>

    <!-- ===== right: the sign-in form ===== -->
    <main class="lg-pane">
      <RouterLink :to="{ name: 'landing' }" class="lg-back">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        Back to home
      </RouterLink>

      <form ref="formEl" class="lg-form" @submit.prevent="submit">
        <h1 data-in>Sign in</h1>
        <p class="lg-form-sub" data-in>Use the account HR created for you.</p>

        <div v-if="error" class="alert" role="alert">{{ error }}</div>

        <div class="field" data-in>
          <label for="email">Work email</label>
          <div class="lg-in"><input id="email" v-model="email" type="email" autocomplete="username" required /></div>
        </div>
        <div class="field" data-in>
          <label for="password">Password</label>
          <div class="lg-in lg-pw">
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
            <button type="button" class="lg-eye" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="showPassword = !showPassword">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                <path class="lg-slash" :class="{ on: showPassword }" d="M4 4l16 16" pathLength="1" />
              </svg>
            </button>
          </div>
        </div>

        <button class="btn lg-submit" type="submit" :disabled="loading" data-in>
          <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
        </button>
        <p class="lg-note" data-in>Forgot your password? Ask HR to reset it.</p>

      <!-- shown when the backend's DEMO_MODE is on, or when there is no backend (then it is an offline demo) -->
      <section v-if="demoOn" class="lg-demo-box" aria-label="Try the demo">
        <p class="lg-or"><span>or look around first</span></p>
        <div class="lg-demo-btns">
          <button type="button" class="lg-demo-btn" :disabled="Boolean(demoLoading) || loading" @click="tryDemo('hr')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 15a5 5 0 015 5" /></svg>
            {{ demoLoading === 'hr' ? 'Opening…' : 'Demo as HR' }}
          </button>
          <button type="button" class="lg-demo-btn" :disabled="Boolean(demoLoading) || loading" @click="tryDemo('employee')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>
            {{ demoLoading === 'employee' ? 'Opening…' : 'Demo as employee' }}
          </button>
        </div>
        <p v-if="demoOffline" class="lg-demo-note">Demo mode: sample data, nothing is saved.</p>
      </section>
      </form>
    </main>
  </div>
</template>

<style>
/* ====== login. Everything starts with lg- so it never clashes with the app styles. Flat colours only. ====== */
.lg {
  display: grid;
  grid-template-columns: minmax(380px, 1fr) minmax(0, 1.15fr); /* the form is on the LEFT, the demo on the right */
  height: 100vh;
  height: 100svh; /* exactly one screen: the page itself never scrolls */
  min-height: 620px;
  overflow: hidden;
  background: var(--white);
  color: var(--ink);
}

/* ---- left: the dark side ---- */
.lg-side {
  position: relative;
  display: grid;
  grid-template-rows: 88px minmax(0, 1fr); /* row 1: the logo row (same height as the form side's top row), row 2: the content */
  justify-items: center;
  padding: 0 clamp(28px, 4.5vw, 72px) 32px;
  background: var(--ink); /* the same dark slate as the landing page */
  color: var(--white);
  overflow: hidden;
}
/* logo, headline and demo share ONE column, so their left edges line up; the column sits in the middle of the dark side */
.lg-brand, .lg-stage { width: min(520px, 100%); }
.lg-brand { align-self: center; justify-self: center; }
.lg-stage { align-self: center; display: grid; gap: clamp(18px, 4vh, 40px); }
.lg .brand { color: var(--white); }
.lg .brand .rise { color: var(--accent); } /* the beige is for dark backgrounds */
.lg .brand-logo { height: 32px; filter: brightness(0) invert(1); } /* the logo is navy, so turn it white on the dark side */
.lg-pitch h2 { font-size: clamp(2.2rem, 4.4vw, 3.6rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.lg-pitch h2 em { font-style: normal; color: var(--accent); }
.lg-pitch p { max-width: 30ch; margin-top: 14px; font-size: 1.05rem; line-height: 1.55; color: rgba(255, 255, 255, 0.72); }

/* the demo: three flat cards stacked in a column, the pointer floats above them */
.lg-demo { position: relative; display: grid; gap: 14px; width: 100%; }
.lg-dcard { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 16px; opacity: 0; }
.lg-glance { display: grid; gap: 12px; background: var(--brand-dark); }
.lg-dlabel { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
.lg-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.lg-stats span { display: grid; padding: 10px 12px; border-radius: 12px; background: rgba(255, 255, 255, 0.07); }
.lg-stats b { font-size: 1.9rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.lg-stats small { font-size: 0.74rem; font-weight: 600; color: rgba(255, 255, 255, 0.65); }

.lg-req { position: relative; background: var(--white); color: var(--ink); }
.lg-av { display: grid; place-items: center; flex: none; width: 38px; height: 38px; border-radius: 50%; background: var(--accent); font-size: 0.78rem; font-weight: 800; }
.lg-req-text { display: grid; flex: 1; min-width: 0; }
.lg-req-text small { color: var(--muted); font-size: 0.8rem; }
.lg-req-actions { display: flex; gap: 8px; }
.lg-req-actions i { padding: 7px 14px; border-radius: 999px; font-size: 0.78rem; font-style: normal; font-weight: 700; }
.lg-req-actions .yes { background: var(--ink); color: var(--white); }
.lg-req-actions .no { background: var(--bg); color: var(--ink); }
.lg-done { position: absolute; right: 18px; top: 50%; display: inline-flex; align-items: center; gap: 6px; transform: translateY(-50%); opacity: 0; font-size: 0.85rem; font-weight: 800; color: var(--brand); }
.lg-done svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.lg-done path { stroke-dasharray: 1; }
.lg-done path { stroke-dashoffset: 0; }

.lg-clock { overflow: hidden; background: var(--light-blue); color: var(--ink); }
.lg-clock b { display: block; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.lg-clock small { font-size: 0.8rem; font-weight: 600; opacity: 0.75; }
.lg-pulse { position: relative; flex: none; margin-left: 6px; width: 12px; height: 12px; border-radius: 50%; background: var(--ink); }
.lg-pulse::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--ink); animation: lg-ping 1.8s ease-out infinite; }
@keyframes lg-ping { from { transform: scale(1); opacity: 0.5; } to { transform: scale(3); opacity: 0; } }

.lg-cursor { position: absolute; left: 0; top: 0; z-index: 2; width: 26px; height: 26px; opacity: 0; fill: var(--white); stroke: var(--ink); stroke-width: 1.5; stroke-linejoin: round; filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35)); pointer-events: none; }

/* ---- right: the form ---- */
.lg-pane { order: -1; position: relative; display: grid; place-items: center; padding: 88px clamp(24px, 5vw, 72px) 32px; overflow-y: auto; } /* top 88px = the same logo row as the dark side, so both columns centre in the same space */
.lg-back {
  position: absolute;
  top: 23px; /* centred on the logo row (88px) */
  left: calc(50% - min(200px, 50% - clamp(24px, 5vw, 72px))); /* the same left edge as the form (the form is 400px wide and centred) */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px 9px 14px;
  border: 1px solid var(--line, rgba(31, 58, 86, 0.25));
  border-radius: 999px; /* pill */
  color: var(--ink);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.lg-back svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.25s; }
.lg-back:hover { background: var(--ink); color: var(--white); }
.lg-back:hover svg { transform: translateX(-3px); } /* the arrow nudges left, toward "back" */
.lg-back:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; }

.lg-form { width: min(400px, 100%); }
.lg-form h1 { font-size: 2.3rem; font-weight: 800; letter-spacing: -0.03em; }
.lg-form-sub { margin: 8px 0 24px; color: var(--muted); }
[data-in] { opacity: 0; } /* hidden until the script brings the heading, fields and button in */

/* inputs: a line draws across the bottom edge while the field is focused */
.lg-in { position: relative; }
.lg-in input { width: 100%; }
.lg-in::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: var(--ink);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}
.lg-in:focus-within::after { transform: scaleX(1); }
.lg-pw input { padding-right: 48px; }
.lg-eye {
  position: absolute;
  top: 50%;
  right: 8px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  transform: translateY(-50%);
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.lg-eye:hover { background: var(--brand-soft); color: var(--brand); transform: translateY(-50%) scale(1.1); }
.lg-eye:focus-visible { outline: 2px solid var(--brand); }
.lg-eye svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }
/* the slash across the eye draws itself when the password is shown */
.lg-slash { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 0.3s ease; }
.lg-slash.on { stroke-dashoffset: 0; }

/* the button: the dark pill, with a light shine that sweeps across on hover */
.lg .btn.lg-submit {
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  border-radius: 999px;
  background: var(--ink);
  border-color: var(--ink);
  color: var(--white);
}
.lg .btn.lg-submit span { position: relative; z-index: 1; }
.lg .btn.lg-submit::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 40%;
  background: rgba(255, 255, 255, 0.2);
  transform: skewX(-20deg);
}
.lg .btn.lg-submit:hover:not(:disabled) { background: var(--brand); border-color: var(--brand); }
.lg .btn.lg-submit:hover:not(:disabled)::after { left: 130%; transition: left 0.7s ease; }
/* ---- the "Try the demo" buttons ---- */
.lg-demo-box { width: min(400px, 100%); margin-top: 18px; }
.lg-or { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: var(--muted); }
.lg-or::before, .lg-or::after { content: ''; flex: 1; height: 1px; background: var(--line); }
.lg-demo-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.lg-demo-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 12px; border: 2px solid var(--ink); border-radius: 999px; background: transparent;
  color: var(--ink); font: inherit; font-size: 0.88rem; font-weight: 700; cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}
.lg-demo-note { margin-top: 10px; font-size: 0.78rem; color: var(--muted); text-align: center; }
.lg-demo-btn svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.lg-demo-btn:hover:not(:disabled) { background: var(--ink); color: var(--white); }
.lg-demo-btn:active:not(:disabled) { transform: scale(0.96); }
.lg-demo-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.lg-note { margin-top: 20px; font-size: 0.84rem; color: var(--muted); text-align: center; }

/* ---- smaller screens: the dark side goes away, the form fills the screen ---- */
@media (max-width: 900px) {
  .lg { grid-template-columns: 1fr; }
  .lg-side { display: none; }
}
@media (max-height: 700px) {
  .lg-pitch p { display: none; }
}
</style>