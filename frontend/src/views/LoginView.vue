<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { animate } from 'motion' // motion.dev, the same library the landing page uses
import { useAuthStore } from '../stores/auth'
import { errorMessage } from '../api/client'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false) // the eye button flips this: password (dots) <-> text
const error = ref('')
const loading = ref(false)

const fanEl = ref(null)
const cardEl = ref(null)

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

// the same six cards as the landing page, as a hand behind the form
const cards = [
  { tone: 'dark', title: 'Employee records', kind: 'people' },
  { tone: 'light', title: 'Live attendance', kind: 'clock' },
  { tone: 'blue', title: 'Leave approvals', kind: 'leave' },
  { tone: 'dark', title: 'Task board', kind: 'board' },
  { tone: 'light', title: 'Role-based access', kind: 'roles' },
  { tone: 'blue', title: 'Team dashboard', kind: 'stats' },
]

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const spring = (stiffness, damping, extra = {}) => ({ type: 'spring', stiffness, damping, ...extra })
  const tiles = [...fanEl.value.querySelectorAll('.lg-tile')]
  const angle = (i) => (i - (tiles.length - 1) / 2) * 14 // 14 degrees between cards, a wider sweep than the landing page

  try {
    if (reduce) {
      tiles.forEach((el, i) => (el.style.transform = `rotate(${angle(i)}deg)`)) // no motion: just the finished fan
      return
    }
    // the cards spread out of one stack in a single spring, nothing fades (same motion as the landing page)
    tiles.forEach((el, i) => animate(el, { rotate: [0, angle(i)], y: [50, 0] }, spring(70, 13, { delay: 0.1 + i * 0.07 })))
    // the form card rises from below and settles in front of them
    animate(cardEl.value, { y: [70, 0], scale: [0.94, 1] }, spring(90, 16, { delay: 0.35 }))
  } catch (err) {
    console.warn('login animation failed, showing the page without it', err)
    tiles.forEach((el, i) => (el.style.transform = `rotate(${angle(i)}deg)`))
  }
})
</script>

<template>
  <div class="lg">
    <!-- the hand of cards, behind everything. It is for looking at only. -->
    <ul ref="fanEl" class="lg-fan" aria-hidden="true">
      <li v-for="(c, i) in cards" :key="c.title" class="lg-tile" :class="'t-' + c.tone" :style="{ '--i': i }">
        <h3>{{ c.title }}</h3>
        <div v-if="c.kind === 'people'" class="lg-m rows"><span v-for="r in ['AD', 'MS', 'JR']" :key="r"><b>{{ r }}</b><i></i></span></div>
        <div v-else-if="c.kind === 'clock'" class="lg-m big"><b>08:52</b><small>Clocked in</small></div>
        <div v-else-if="c.kind === 'leave'" class="lg-m req"><b>Vacation</b><small>3 days · pending</small><em>Approve</em></div>
        <div v-else-if="c.kind === 'board'" class="lg-m board"><span></span><span></span><span></span></div>
        <div v-else-if="c.kind === 'roles'" class="lg-m rows"><span v-for="r in ['Admin', 'HR', 'Employee']" :key="r"><strong>{{ r }}</strong></span></div>
        <div v-else class="lg-m big"><b>42</b><small>Present</small></div>
      </li>
    </ul>

    <header class="lg-top">
      <RouterLink :to="{ name: 'landing' }" class="lg-back">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        Back to home
      </RouterLink>
      <RouterLink :to="{ name: 'landing' }" class="brand" aria-label="HireRise home">
        <img class="brand-logo" src="/logo.png" alt="" />
        <span>Hire<span class="rise">Rise</span></span>
      </RouterLink>
      <span class="lg-top-space" aria-hidden="true"></span>
    </header>

    <main class="lg-main">
      <div ref="cardEl" class="lg-card">
        <form class="lg-form" @submit.prevent="submit">
          <h1>Sign in</h1>
          <p class="lg-form-sub">Use the account HR created for you.</p>

          <div v-if="error" class="alert" role="alert">{{ error }}</div>

          <div class="field">
            <label for="email">Work email</label>
            <input id="email" v-model="email" type="email" autocomplete="username" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <div class="lg-pw">
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
              <button type="button" class="lg-eye" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" @click="showPassword = !showPassword">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                  <path v-if="showPassword" d="M4 4l16 16" />
                </svg>
              </button>
            </div>
          </div>

          <button class="btn lg-submit" type="submit" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
          <p class="lg-note">Forgot your password? Ask HR to reset it.</p>
        </form>
      </div>
    </main>
  </div>
</template>

<style>
/* ====== login. Everything starts with lg- so it never clashes with the app styles ====== */
.lg {
  --k: 1.2; /* how big the hand of cards is drawn (1 = 640px wide) */
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100vh;
  height: 100svh; /* exactly one screen: the page itself never scrolls */
  min-height: 600px;
  overflow: hidden;
  background: var(--ink); /* the same dark slate as the landing page */
  color: var(--white);
}

/* ---- the top row: back pill on the left, logo in the middle ---- */
.lg-top {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 22px clamp(20px, 4vw, 56px) 0;
}
.lg-top-space { justify-self: end; }
.lg-back {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px 9px 14px;
  border: 1px solid rgba(211, 206, 190, 0.5);
  border-radius: 999px; /* pill */
  color: var(--accent);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.lg-back svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.25s; }
.lg-back:hover { background: var(--accent); color: var(--ink); }
.lg-back:hover svg { transform: translateX(-3px); } /* the arrow nudges left, toward "back" */
.lg-back:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.lg .brand { color: var(--white); }
.lg .brand .rise { color: var(--accent); } /* the beige is for dark backgrounds, like the landing nav */
.lg .brand-logo { height: 32px; filter: brightness(0) invert(1); } /* the logo is navy, so turn it white on this dark page */

/* ---- the form card, in the middle, in front of the cards ---- */
.lg-main {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 16px 20px 28px;
  overflow-y: auto; /* only if the screen is too short for the card */
}
.lg-card {
  width: min(440px, 100%);
  padding: clamp(28px, 4vw, 44px);
  border-radius: 28px;
  background: var(--white);
  color: var(--ink);
  box-shadow: 0 30px 80px rgba(6, 22, 42, 0.55);
  will-change: transform;
}
.lg-form h1 { font-size: 2.1rem; font-weight: 800; letter-spacing: -0.03em; }
.lg-form-sub { margin: 8px 0 24px; color: var(--muted); }
.lg-pw { position: relative; }
.lg-pw input { width: 100%; padding-right: 48px; }
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
}
.lg-eye:hover { background: var(--brand-soft); color: var(--brand); }
.lg-eye:focus-visible { outline: 2px solid var(--brand); }
.lg-eye svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

/* the button matches the landing page's dark pill on white */
.lg .btn.lg-submit {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  border-radius: 999px;
  background: var(--ink);
  border-color: var(--ink);
  color: var(--white);
}
.lg .btn.lg-submit:hover:not(:disabled) { background: var(--brand); border-color: var(--brand); }
.lg-note { margin-top: 20px; font-size: 0.84rem; color: var(--muted); text-align: center; }

/* ---- smaller screens: the hand shrinks ---- */
@media (max-width: 1100px) { .lg { --k: 1; } }
@media (max-width: 700px) {
  .lg { --k: 0.8; min-height: 640px; }
  .lg-top { grid-template-columns: auto 1fr; gap: 12px; padding: 16px 16px 0; }
  .lg-top .brand { justify-self: end; }
  .lg-top-space { display: none; }
  .lg-fan { bottom: -190px; }
}
@media (max-height: 760px) { .lg-fan { bottom: -130px; } } /* shorter screens: sink the cards so the form has room */
@media (prefers-reduced-motion: reduce) {
  .lg *, .lg *::before, .lg *::after { transition: none !important; }
}
</style>