<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { animate, stagger } from 'motion' // motion.dev, the same library the landing page uses
import { useAuthStore } from '../stores/auth'
import { errorMessage } from '../api/client'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false) // the eye button flips this: password (dots) <-> text
const error = ref('')
const loading = ref(false)

const sideEl = ref(null)
const fanEl = ref(null)
const sheetEl = ref(null)

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

// the three little cards on the left are a sneak peek of the landing page's fan
const cards = [
  { tone: 'dark', title: 'Employee records', rows: ['AD', 'MS', 'JR'] },
  { tone: 'light', title: 'Live attendance', big: '08:52' },
  { tone: 'blue', title: 'Team dashboard', big: '42', small: 'Present' },
]

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const spring = (stiffness, damping, extra = {}) => ({ type: 'spring', stiffness, damping, ...extra })
  const tiles = [...fanEl.value.querySelectorAll('.lg-tile')]
  const angle = (i) => (i - 1) * 12 // -12, 0, 12 degrees

  try {
    if (reduce) {
      // reduced motion: gentle fades only
      animate([...sideEl.value.querySelectorAll('[data-in]'), sheetEl.value], { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.08) })
      tiles.forEach((el, i) => (el.style.transform = `rotate(${angle(i)}deg)`))
      return
    }
    // the white sheet slides in from the right; no fade, so it never looks see-through
    animate(sheetEl.value, { x: [90, 0], scale: [0.96, 1] }, spring(90, 17))
    // the text on the left rises one line after another
    animate([...sideEl.value.querySelectorAll('[data-in]')], { opacity: [0, 1], y: [34, 0] }, spring(90, 16, { delay: stagger(0.1, { startDelay: 0.15 }) }))
    // the cards spread out of one stack in a single spring (same motion as the landing page)
    tiles.forEach((el, i) => animate(el, { rotate: [0, angle(i)], y: [40, 0] }, spring(70, 13, { delay: 0.35 + i * 0.08 })))
  } catch (err) {
    console.warn('login animation failed, showing the page without it', err)
    sideEl.value.querySelectorAll('[data-in]').forEach((el) => (el.style.opacity = 1))
    tiles.forEach((el, i) => (el.style.transform = `rotate(${angle(i)}deg)`))
  }
})
</script>

<template>
  <div class="lg">
    <!-- left: the landing theme (dark, beige accents, a peek of the card fan) -->
    <section ref="sideEl" class="lg-side">
      <div class="lg-top" data-in>
        <RouterLink :to="{ name: 'landing' }" class="lg-back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Back to home
        </RouterLink>
      </div>

      <div class="lg-copy">
        <RouterLink :to="{ name: 'landing' }" class="brand" data-in aria-label="HireRise home">
          <img class="brand-logo" src="/logo.png" alt="" />
          <span>Hire<span class="rise">Rise</span></span>
        </RouterLink>
        <h2 class="lg-title" data-in>Welcome back, <em>your team is waiting.</em></h2>
        <p class="lg-sub" data-in>Track employee status, attendance, leave and work without the spreadsheets.</p>
        <ul class="lg-points" data-in>
          <li>Live headcount and attendance</li>
          <li>Leave requests with one-click approval</li>
          <li>Tasks and deadlines for every team</li>
        </ul>
      </div>

      <ul ref="fanEl" class="lg-fan" aria-hidden="true">
        <li v-for="(c, i) in cards" :key="c.title" class="lg-tile" :class="'t-' + c.tone" :style="{ '--i': i }">
          <h3>{{ c.title }}</h3>
          <div v-if="c.rows" class="lg-rows">
            <span v-for="r in c.rows" :key="r"><b>{{ r }}</b><i></i></span>
          </div>
          <div v-else class="lg-big">
            <b>{{ c.big }}</b>
            <small v-if="c.small">{{ c.small }}</small>
          </div>
        </li>
      </ul>
    </section>

    <!-- right: the form on a white sheet, like the landing page's white sections -->
    <section class="lg-form-wrap">
      <div ref="sheetEl" class="lg-sheet">
        <RouterLink :to="{ name: 'landing' }" class="lg-back lg-back-mobile">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          Back to home
        </RouterLink>

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
    </section>
  </div>
</template>

<style>
/* ====== login. Everything starts with lg- so it never clashes with the app styles ====== */
.lg {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  height: 100vh;
  height: 100svh; /* exactly one screen: the page itself never scrolls */
  min-height: 560px;
  background: var(--ink); /* the same dark slate as the landing page */
  color: var(--white);
  overflow-x: clip;
}

/* ---- left side ---- */
.lg-side {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 28px clamp(28px, 4.5vw, 64px) 0;
  overflow: hidden;
}
.lg-back {
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

.lg-copy {
  display: grid;
  justify-items: start;
  gap: 18px;
  margin: auto 0;
  padding: 48px 0 24px;
}
.lg .brand { color: var(--white); }
.lg .brand-logo { height: 34px; filter: brightness(0) invert(1); } /* the logo is navy, so turn it white on this dark side */
.lg .brand .rise { color: var(--accent); } /* the beige is for dark backgrounds, like the landing nav */
.lg-title {
  max-width: 14ch;
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.lg-title em { display: block; font-style: normal; color: var(--accent); }
.lg-sub { max-width: 40ch; color: rgba(255, 255, 255, 0.78); }
.lg-points { display: grid; gap: 10px; margin-top: 8px; font-weight: 600; }
.lg-points li { display: flex; align-items: center; gap: 12px; color: rgba(255, 255, 255, 0.9); }
.lg-points li::before { /* a small beige dot instead of a character */
  content: "";
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.lg [data-in] { opacity: 0; } /* hidden until the script brings them in */

/* the hand of three cards, cut off by the bottom edge like the landing page */
.lg-fan {
  position: relative;
  flex: none;
  width: 100%;
  height: clamp(140px, 24svh, 230px); /* shorter screens just crop the cards a little more */
  margin-top: auto;
  list-style: none;
  pointer-events: none;
}
.lg-tile {
  position: absolute;
  left: calc(50% - 110px);
  top: 24px;
  z-index: calc(var(--i) + 1);
  width: 220px;
  height: 320px;
  padding: 16px;
  border-radius: 14px;
  box-shadow: -6px 10px 26px rgba(6, 22, 42, 0.4);
  transform-origin: 50% 160%; /* turn around a point below the card, like a wrist */
  transform: rotate(calc((var(--i) - 1) * 12deg)); /* final angle, so it is right even before the script runs */
}
.lg-tile.t-dark { background: var(--brand-dark); color: var(--white); }
.lg-tile.t-light { background: var(--bg); color: var(--ink); }
.lg-tile.t-blue { background: var(--light-blue); color: var(--ink); }
.lg-tile h3 { font-size: 1rem; font-weight: 800; letter-spacing: -0.01em; }
.lg-rows { display: grid; gap: 8px; margin-top: 12px; }
.lg-rows span { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 10px; background: rgba(255, 255, 255, 0.08); }
.lg-rows b { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--accent); color: var(--ink); font-size: 0.6rem; font-weight: 800; }
.lg-rows i { flex: 1; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.2); }
.lg-big { display: grid; margin-top: 10px; }
.lg-big b { font-size: 3rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; }
.lg-big small { font-size: 0.75rem; font-weight: 600; opacity: 0.7; }

/* ---- right side: a white sheet ---- */
.lg-form-wrap {
  display: grid;
  place-items: center;
  min-height: 0;
  padding: 24px clamp(20px, 4vw, 64px) 24px 0;
  overflow-y: auto; /* only if the screen is too short for the card */
}
.lg-sheet {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 18px;
  width: min(500px, 100%);
  padding: clamp(32px, 4vw, 52px) clamp(24px, 4vw, 48px);
  border-radius: 32px;
  background: var(--white);
  color: var(--ink);
  box-shadow: 0 30px 70px rgba(6, 22, 42, 0.35);
  will-change: transform;
}
.lg-back-mobile { display: none; }
.lg-form { width: min(380px, 100%); }
.lg-form h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; }
.lg-form-sub { margin: 8px 0 26px; color: var(--muted); }
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
.lg-note { margin-top: 22px; font-size: 0.84rem; color: var(--muted); text-align: center; }

/* ---- phones and tablets: one column, the sheet comes up under a short header ---- */
@media (max-width: 900px) {
  .lg { grid-template-columns: 1fr; align-content: start; height: auto; min-height: 100svh; } /* rows hug their content instead of splitting the screen */
  .lg-side { padding: 22px 22px 0; }
  .lg-top, .lg-points, .lg-fan, .lg-sub { display: none; } /* the sheet has its own back button below */
  .lg-copy { margin: 0; padding: 20px 0 28px; gap: 10px; }
  .lg-title { max-width: none; font-size: 1.9rem; }
  .lg-form-wrap { padding: 0 12px 12px; overflow: visible; }
  .lg-sheet { width: 100%; align-content: start; padding: 28px 22px 36px; border-radius: 32px; }
  .lg-back-mobile { display: inline-flex; justify-self: start; color: var(--brand); border-color: rgba(20, 76, 140, 0.3); }
  .lg-back-mobile:hover { background: var(--brand); color: var(--white); }
}
@media (prefers-reduced-motion: reduce) {
  .lg *, .lg *::before, .lg *::after { transition: none !important; }
}
</style>