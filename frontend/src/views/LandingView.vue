<script setup>
import { ref, onMounted } from 'vue'

// "ready" flips to true right after the page shows, which starts the entrance animations
// (everything below listens for the .in class on the page wrapper)
const ready = ref(false)
// "settled" flips a moment later, once the entrance has finished, so hover effects react instantly
const settled = ref(false)
onMounted(() => {
  setTimeout(() => (ready.value = true), 60)
  setTimeout(() => (settled.value = true), 2400)
})

// Smooth-scroll to a section by id. A plain <a href="#x"> would be picked up by the router
// (its scrollBehavior sends every navigation back to the top), so we scroll by hand instead.
function go(id) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

// the three employee statuses shown on the first card (same words the app uses)
const people = [
  { initials: 'AD', status: 'Active', tone: 'ok' },
  { initials: 'MS', status: 'Probation', tone: 'warn' },
  { initials: 'JR', status: 'On leave', tone: 'info' },
]

// weekday bars on the attendance card (heights are percentages)
const week = [
  { d: 'M', h: 82 },
  { d: 'T', h: 64 },
  { d: 'W', h: 90 },
  { d: 'T', h: 72 },
  { d: 'F', h: 48, today: true },
]

// who is who on the access card (matches the roles table in the README)
const roles = [
  { name: 'Admin', scope: 'Company-wide' },
  { name: 'HR', scope: 'Company-wide' },
  { name: 'Employee', scope: 'Own records only' },
]

// the "who it's for" cards
const audiences = [
  {
    title: 'For HR and admins',
    points: [
      'A company-wide dashboard: headcount, who is in, who is on leave, what is pending',
      'Approve or reject leave requests in one click',
      'Employee directory, team attendance and the task board',
    ],
  },
  {
    title: 'For employees',
    points: [
      'A personal dashboard with your hours, leave balance and open tasks',
      'Clock in and out, request leave and see how it was decided',
      'You only ever see your own records and tasks',
    ],
  },
  {
    title: 'Secure by default',
    points: [
      'Real sign-in with hashed passwords and signed tokens',
      'Every page and every action is limited by role',
      'Deactivate someone and their access ends immediately',
    ],
  },
]
</script>

<template>
  <div class="lp" :class="{ in: ready, settled }">
    <!-- floating pill navigation -->
    <header class="lp-nav">
      <RouterLink to="/" class="brand">
        <img class="brand-logo" src="/logo.png" alt="" />
        <span>Hire<span class="rise">Rise</span></span>
      </RouterLink>
      <i class="lp-sep" aria-hidden="true"></i>
      <nav class="lp-links" aria-label="Page sections">
        <a href="#features" @click.prevent="go('features')">Features</a>
        <a href="#roles" @click.prevent="go('roles')">Who it's for</a>
      </nav>
      <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent lp-nav-cta">Sign in</RouterLink>
    </header>

    <!-- hero: a hand of cards on the left, the text on the right -->
    <section class="lp-hero">
      <div class="lp-copy">
        <h1 class="lp-title">Every employee, every day, <em>in one place.</em></h1>
        <p class="lp-sub">Track employee status, attendance, leave and work without the spreadsheets.</p>
        <div class="lp-actions">
          <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent">
            Get started
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </RouterLink>
          <a href="#roles" class="btn lp-btn lp-btn-ghost" @click.prevent="go('roles')">Learn more</a>
        </div>
      </div>

      <!-- the cards: each one is a tiny piece of the real app. They start as a stack and fan out like an UNO hand -->
      <div id="features" class="lp-fan-wrap" aria-label="What HireRise does">
        <ul class="lp-fan">
        <!-- 1. employee records -->
        <li class="lp-tile t-dark" style="--i: 0; --a: -27.5deg">
          <h3 class="lp-label">Employee records</h3>
          <div class="lp-mock" aria-hidden="true">
            <div v-for="p in people" :key="p.initials" class="lp-person">
              <span class="lp-avatar">{{ p.initials }}</span>
              <span class="lp-skel"><i></i><i></i></span>
              <span class="lp-chip" :class="p.tone">{{ p.status }}</span>
            </div>
          </div>
        </li>

        <!-- 2. live attendance -->
        <li class="lp-tile t-light" style="--i: 1; --a: -16.5deg">
          <h3 class="lp-label">Live attendance</h3>
          <div class="lp-mock" aria-hidden="true">
            <div class="lp-clock"><b>08:52</b><span>Clocked in</span></div>
            <div class="lp-bars">
              <span v-for="(w, k) in week" :key="k" :class="{ today: w.today }">
                <i :style="{ height: w.h + '%' }"></i><em>{{ w.d }}</em>
              </span>
            </div>
            <small>Late after 09:15</small>
          </div>
        </li>

        <!-- 3. leave approvals -->
        <li class="lp-tile t-blue" style="--i: 2; --a: -5.5deg">
          <h3 class="lp-label">Leave approvals</h3>
          <div class="lp-mock" aria-hidden="true">
            <div class="lp-req">
              <b>Vacation</b><small>3 days · pending</small>
              <span class="lp-req-actions"><i class="yes">Approve</i><i class="no">Reject</i></span>
            </div>
            <div class="lp-req done">
              <b>Sick leave</b><small>1 day · approved</small>
            </div>
          </div>
        </li>

        <!-- 4. task board -->
        <li class="lp-tile t-dark" style="--i: 3; --a: 5.5deg">
          <h3 class="lp-label">Task board</h3>
          <div class="lp-mock" aria-hidden="true">
            <div class="lp-board">
              <span><em>To do</em><i></i><i class="short"></i></span>
              <span><em>In progress</em><i class="hot"></i></span>
              <span><em>Done</em><i class="ok"></i><i class="ok short"></i></span>
            </div>
          </div>
        </li>

        <!-- 5. role-based access -->
        <li class="lp-tile t-light" style="--i: 4; --a: 16.5deg">
          <h3 class="lp-label">Role-based access</h3>
          <div class="lp-mock" aria-hidden="true">
            <div v-for="r in roles" :key="r.name" class="lp-role">
              <b>{{ r.name }}</b><small>{{ r.scope }}</small>
            </div>
          </div>
        </li>

        <!-- 6. team dashboard -->
        <li class="lp-tile t-blue" style="--i: 5; --a: 27.5deg">
          <h3 class="lp-label">Team dashboard</h3>
          <div class="lp-mock" aria-hidden="true">
            <div class="lp-stats">
              <span><b>42</b><small>Present</small></span>
              <span><b>3</b><small>On leave</small></span>
              <span><b>5</b><small>Pending</small></span>
            </div>
            <div class="lp-spark"><i style="--s: 40%"></i><i style="--s: 62%"></i><i style="--s: 50%"></i><i style="--s: 78%"></i><i style="--s: 66%"></i><i style="--s: 92%"></i></div>
          </div>
        </li>
        </ul>
      </div>
    </section>

    <!-- who it's for -->
    <section id="roles" class="lp-roles" aria-label="Who HireRise is for">
      <h2 class="lp-h2">One system, <em>three ways in.</em></h2>
      <div class="lp-aud">
        <article v-for="a in audiences" :key="a.title" class="lp-card">
          <h3>{{ a.title }}</h3>
          <ul>
            <li v-for="p in a.points" :key="p">{{ p }}</li>
          </ul>
        </article>
      </div>
      <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent lp-end">
        Get started
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </RouterLink>
    </section>
  </div>
</template>

<style>
/* ====== landing. Everything starts with lp- so it never clashes with the app styles ====== */
.lp {
  --lp-bg: var(--ink);
  --lp-accent: var(--accent); /* the same beige the login panel and sidebar use */
  --lp-accent-hover: var(--white);
  --lp-on-accent: var(--ink);
  --lp-text: rgba(255, 255, 255, 0.78);
  --lp-dark: var(--brand-dark);
  --lp-light: var(--bg);
  --lp-blue: var(--light-blue);
  --lp-ink: var(--ink);
  --lp-serif: "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif; /* same font as the app and the logo lettering */
  min-height: 100vh;
  min-height: 100svh;
  padding-top: 14px; /* padding, not a margin on the nav: a margin would leak out and show the page background above */
  overflow-x: clip;
  background: var(--lp-bg);
  color: var(--white);
}

/* ---- buttons ---- */
/* (".lp" in front of each rule makes them win over the global .btn rules in style.css) */
.lp .lp-btn {
  padding: 12px 24px;
  font-size: 0.95rem;
}
.lp .lp-btn-accent {
  background: var(--lp-accent);
  border-color: var(--lp-accent);
  color: var(--lp-on-accent);
}
.lp .lp-btn-accent:hover {
  background: var(--lp-accent-hover);
  border-color: var(--lp-accent-hover);
}
.lp .lp-btn-ghost {
  background: transparent;
  border-color: rgba(211, 206, 190, 0.55);
  color: var(--lp-accent);
}
.lp .lp-btn-ghost:hover {
  background: rgba(211, 206, 190, 0.14);
  border-color: var(--lp-accent);
}
.lp .btn svg {
  transition: transform 0.2s;
}
.lp .btn:hover svg {
  transform: translateX(3px);
}
.lp .btn:focus-visible,
.lp-links a:focus-visible {
  outline: 2px solid var(--lp-accent);
  outline-offset: 3px;
}

/* ---- pill navigation ---- */
.lp-nav {
  position: sticky;
  top: 14px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: clamp(10px, 2vw, 22px);
  width: fit-content;
  max-width: calc(100% - 24px);
  margin: 0 auto;
  padding: 7px 7px 7px 18px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 999px;
  background: var(--brand-dark);
}
.lp .brand {
  font-size: 1.05rem;
  color: var(--white);
}
.lp .brand-logo {
  height: 28px;
  filter: brightness(0) invert(1); /* the logo is navy, so turn it white on this dark page */
}
.lp .brand .rise {
  color: var(--lp-accent);
}
.lp-sep {
  width: 1px;
  height: 22px;
  background: rgba(255, 255, 255, 0.16);
}
.lp-links {
  display: flex;
  gap: clamp(12px, 2vw, 22px);
  font-size: 0.88rem;
  font-weight: 600;
}
.lp-links a {
  color: rgba(255, 255, 255, 0.76);
  transition: color 0.2s;
}
.lp-links a:hover {
  color: var(--white);
}
.lp .lp-nav-cta {
  padding: 8px 18px;
  font-size: 0.88rem;
}

/* ---- hero: cards on the left, text on the right ---- */
.lp-hero {
  display: grid;
  grid-template-columns: minmax(0, 640px) minmax(0, 1fr);
  grid-template-areas: "fan copy";
  align-items: center;
  gap: clamp(24px, 4vw, 72px);
  max-width: 1320px;
  min-height: calc(100svh - 86px);
  margin: 0 auto;
  padding: clamp(28px, 5vh, 64px) clamp(20px, 4vw, 56px) clamp(40px, 6vh, 72px);
}
.lp-copy {
  grid-area: copy;
  display: grid;
  justify-items: start;
  gap: 22px;
  text-align: left;
}
.lp-title {
  font-family: var(--lp-serif);
  font-size: clamp(2.2rem, 4.2vw, 3.6rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.lp-title em,
.lp-h2 em {
  display: block; /* the accent phrase always sits on its own line */
  font-style: normal;
  color: var(--lp-accent);
}
.lp-sub {
  max-width: 44ch;
  color: var(--lp-text);
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
}
.lp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

/* ---- the hand of cards ---- */
/* the wrapper takes the scaled-down size, the list inside is always drawn at 640 x 440 and scaled with --k */
.lp-fan-wrap {
  --k: 1;
  grid-area: fan;
  justify-self: center;
  width: calc(640px * var(--k));
  height: calc(440px * var(--k));
  scroll-margin-top: 80px;
}
.lp-fan {
  position: relative;
  width: 640px;
  height: 440px;
  transform: scale(var(--k));
  transform-origin: 0 0;
  list-style: none;
}
/* every card is turned around a point below it (like a wrist), by its own angle --a */
.lp-tile {
  position: absolute;
  left: calc(50% - 115px);
  bottom: 70px;
  z-index: calc(var(--i) + 1);
  width: 230px;
  height: 320px;
  padding: 16px;
  border-radius: 16px;
  box-shadow: -6px 10px 26px rgba(6, 22, 42, 0.4);
  transform-origin: 50% 140%;
  transform: rotate(var(--a));
}
.t-dark { background: var(--lp-dark); color: var(--white); }
.t-light { background: var(--lp-light); color: var(--lp-ink); }
.t-blue { background: var(--lp-blue); color: var(--lp-ink); }

.lp-label {
  margin-bottom: 12px;
  font-family: var(--lp-serif);
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.lp-tile small {
  display: block;
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.3;
  opacity: 0.68;
}
.lp-tile b { font-weight: 700; }
.lp-mock { display: grid; gap: 10px; }

/* employee rows */
.lp-person {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
}
.lp-avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--lp-accent);
  color: var(--lp-on-accent);
  font-size: 0.64rem;
  font-weight: 800;
}
.lp-skel { flex: 1; display: grid; gap: 4px; min-width: 0; }
.lp-skel i { height: 5px; border-radius: 999px; background: rgba(255, 255, 255, 0.28); }
.lp-skel i:last-child { width: 60%; background: rgba(255, 255, 255, 0.14); }
.lp-chip {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 700;
  white-space: nowrap;
}
.lp-chip.ok { background: var(--green-soft); color: var(--green); }
.lp-chip.warn { background: var(--amber-soft); color: var(--amber); }
.lp-chip.info { background: var(--blue-soft); color: var(--blue); }

/* attendance */
.lp-clock { display: flex; align-items: baseline; gap: 8px; }
.lp-clock b { font-family: var(--lp-serif); font-size: clamp(1.6rem, 2.6vw, 2.2rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
.lp-clock span { font-size: 0.72rem; font-weight: 600; opacity: 0.65; }
.lp-bars { display: flex; align-items: flex-end; gap: 6px; height: clamp(76px, 7vw, 100px); }
.lp-bars span { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 4px; height: 100%; }
.lp-bars i { width: 100%; border-radius: 6px 6px 3px 3px; background: var(--ink); }
.lp-bars .today i { background: var(--brand); }
.lp-bars em { font-style: normal; font-size: 0.6rem; font-weight: 700; opacity: 0.6; }

/* leave requests */
.lp-req {
  display: grid;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--white);
}
.lp-req b { font-size: 0.82rem; }
.lp-req-actions { display: flex; gap: 6px; margin-top: 8px; }
.lp-req-actions i {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.64rem;
  font-style: normal;
  font-weight: 700;
}
.lp-req-actions .yes { background: var(--lp-ink); color: var(--white); }
.lp-req-actions .no { border: 1.5px solid rgba(31, 60, 88, 0.4); }
.lp-req.done { opacity: 0.7; }

/* task board */
.lp-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
.lp-board span { display: grid; align-content: start; gap: 6px; min-width: 0; }
.lp-board em { font-style: normal; font-size: 0.6rem; font-weight: 700; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lp-board i { height: 34px; border-radius: 8px; background: rgba(255, 255, 255, 0.13); }
.lp-board i.short { height: 24px; }
.lp-board i.hot { background: var(--light-blue); }
.lp-board i.ok { background: color-mix(in srgb, var(--green) 60%, transparent); }

/* access */
.lp-role {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 2px 8px;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--white);
}
.lp-role b { font-size: 0.8rem; }
.lp-role small { font-size: 0.64rem; }

/* dashboard */
/* auto-fit: three boxes in a row when there is room, otherwise the last one drops to a second row (never a split word) */
.lp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(54px, 1fr)); gap: 6px; }
.lp-stats span { min-width: 0; padding: 8px 7px; border-radius: 10px; background: rgba(255, 255, 255, 0.7); }
.lp-stats small { font-size: 0.6rem; }
.lp-stats b { display: block; font-family: var(--lp-serif); font-size: clamp(1.2rem, 2vw, 1.7rem); font-weight: 800; line-height: 1.1; }
.lp-spark { display: flex; align-items: flex-end; gap: 6px; height: clamp(36px, 4.5vw, 60px); }
.lp-spark i { flex: 1; height: var(--s); border-radius: 5px 5px 2px 2px; background: var(--ink); }
.lp-spark i:last-child { background: var(--brand); }

/* ---- who it's for ---- */
.lp-roles {
  display: grid;
  justify-items: center;
  gap: 36px;
  padding: clamp(72px, 12vh, 130px) clamp(20px, 4vw, 56px) clamp(64px, 10vh, 110px);
  scroll-margin-top: 20px;
}
.lp-h2 {
  max-width: 16ch;
  font-family: var(--lp-serif);
  font-size: clamp(2rem, 4.2vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-align: center;
  text-wrap: balance;
}
.lp-aud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  width: 100%;
  max-width: 1100px;
}
.lp-card {
  padding: 26px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}
.lp-card h3 {
  margin-bottom: 16px;
  font-family: var(--lp-serif);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.lp-card ul { display: grid; gap: 12px; }
.lp-card li {
  position: relative;
  padding-left: 22px;
  color: var(--lp-text);
  font-size: 0.92rem;
  line-height: 1.5;
}
.lp-card li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.5em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lp-accent);
}

/* ---- entrance motion ---- */
.lp-nav,
.lp-title,
.lp-sub,
.lp-actions {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.lp-title { transition-delay: 0.1s; }
.lp-sub { transition-delay: 0.22s; }
.lp-actions { transition-delay: 0.34s; }
.lp.in .lp-nav,
.lp.in .lp-title,
.lp.in .lp-sub,
.lp.in .lp-actions { opacity: 1; transform: none; filter: none; }

/* the cards start stacked like a deck in one hand, then fan out one after another */
.lp .lp-tile {
  opacity: 0;
  transform: rotate(0deg) translateY(calc(var(--i) * -3px));
  transition:
    opacity 0.4s ease calc(0.35s + var(--i) * 0.05s),
    transform 1.1s cubic-bezier(0.22, 1.25, 0.36, 1) calc(0.55s + var(--i) * 0.07s);
}
.lp.in .lp-tile { opacity: 1; transform: rotate(var(--a)); }
/* the cards are for looking at only: no hover or click reaction */
.lp-fan { pointer-events: none; }

@media (prefers-reduced-motion: reduce) {
  .lp *, .lp *::before, .lp *::after { transition: none !important; animation: none !important; }
  .lp-nav, .lp-title, .lp-sub, .lp-actions { opacity: 1 !important; transform: none !important; filter: none !important; }
  .lp .lp-tile { opacity: 1 !important; transform: rotate(var(--a)) !important; }
}

/* ---- smaller screens: the whole hand shrinks, then moves below the text ---- */
@media (max-width: 1180px) {
  .lp-hero { grid-template-columns: minmax(0, 560px) minmax(0, 1fr); }
  .lp-fan-wrap { --k: 0.875; }
}
@media (max-width: 1000px) {
  .lp-aud { grid-template-columns: 1fr; max-width: 560px; }
}
@media (max-width: 900px) {
  .lp-hero {
    grid-template-columns: 1fr;
    grid-template-areas: "copy" "fan";
    min-height: 0;
    gap: 36px;
    padding-top: 40px;
  }
  .lp-copy { justify-items: center; text-align: center; }
  .lp-actions { justify-content: center; }
  .lp-fan-wrap { --k: 0.9; }
}
@media (max-width: 680px) {
  .lp-links, .lp-sep { display: none; } /* just the logo and Sign in */
  .lp-nav { padding-left: 14px; gap: 14px; }
  .lp-fan-wrap { --k: 0.8; }
}
@media (max-width: 540px) {
  .lp-fan-wrap { --k: 0.66; }
  .lp-actions { width: 100%; }
  .lp-actions .btn { flex: 1 1 auto; }
}
@media (max-width: 440px) {
  .lp-fan-wrap { --k: 0.54; }
}
</style>