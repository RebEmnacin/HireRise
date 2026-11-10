<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LineIcon from '../components/LineIcon.vue'
import CountUp from '../components/CountUp.vue'

// "ready" flips to true right after the page shows, which starts the entrance animations
// (the same .in class the icon "draw" animation already listens for in style.css)
const ready = ref(false)
const now = ref(new Date())
let timer

onMounted(() => {
  setTimeout(() => (ready.value = true), 60)
  timer = setInterval(() => (now.value = new Date()), 20000) // keeps the phone clock live
})
onBeforeUnmount(() => clearInterval(timer))

const timeText = computed(() => {
  const h = now.value.getHours() % 12 || 12
  const m = String(now.value.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
})
const dateText = computed(() =>
  now.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

// the strip along the bottom (icon names come from data/icons.js)
const features = [
  { icon: 'users', title: 'Employee records', text: 'Every profile' },
  { icon: 'clock', title: 'Live attendance', text: 'Clock in and out' },
  { icon: 'calendar', title: 'Leave approvals', text: 'One-click decisions' },
  { icon: 'tasks', title: 'Task board', text: 'Work and deadlines' },
  { icon: 'shield', title: 'Role-based access', text: 'Admin, HR, employee' },
  { icon: 'dashboard', title: 'Team dashboard', text: 'The day at a glance' },
  { icon: 'userCheck', title: 'Secure sign-in', text: 'Accounts made by HR' },
]

// tilt the phone a little toward the mouse (desktop only)
const tilt = ref({ x: 0, y: 0 })
function onMove(e) {
  tilt.value = {
    x: (e.clientX / window.innerWidth - 0.5) * 2, // -1 (left edge) to 1 (right edge)
    y: (e.clientY / window.innerHeight - 0.5) * 2,
  }
}
</script>

<template>
  <div class="lp" :class="{ in: ready }" @mousemove="onMove">
    <!-- soft background: gradient + the big word behind the phone -->
    <div class="lp-bg" aria-hidden="true">
      <span class="lp-watermark">HIRERISE</span>
    </div>

    <!-- top bar -->
    <header class="lp-nav">
      <RouterLink to="/" class="brand">
        <img class="brand-logo" src="/logo.png" alt="" />
        <span>Hire<span class="rise">Rise</span></span>
      </RouterLink>
      <RouterLink :to="{ name: 'login' }" class="btn btn-outline lp-signin">Sign in</RouterLink>
    </header>

    <main class="lp-stage">
      <!-- left: headline + stat card -->
      <section class="lp-left">
        <span class="lp-eyebrow">HR management system</span>
        <h1 class="lp-title">
          <span style="--i: 0">Every employee,</span>
          <span style="--i: 1">every day,</span>
          <span style="--i: 2" class="lp-hl">in one place.</span>
        </h1>
        <p class="lp-sub">Track employee status, attendance, leave and work without the spreadsheets.</p>

        <div class="lp-card lp-stat lp-float" style="--f: 0s">
          <div class="lp-avatars" aria-hidden="true">
            <span>AD</span><span>MS</span><span>JS</span><span>LR</span>
          </div>
          <div>
            <CountUp :to="248" suffix="+" />
            <strong>Employees tracked</strong>
            <small>Attendance, leave and tasks in one dashboard</small>
          </div>
        </div>
      </section>

      <!-- center: phone + button -->
      <section class="lp-center">
        <div class="lp-tilt" :style="{ '--mx': tilt.x, '--my': tilt.y }">
          <div class="lp-phone lp-float" style="--f: 0.4s">
            <div class="lp-notch"></div>
            <div class="lp-screen">
              <div class="lp-date">{{ dateText }}</div>
              <div class="lp-time">{{ timeText }}</div>

              <div class="lp-hero-ic"><LineIcon name="users" /></div>
              <p class="lp-tag">Know your people<br />Track their time<br />Grow your team</p>

              <div class="lp-tiles">
                <span class="lp-tile"><LineIcon name="clock" />Clock in</span>
                <span class="lp-tile"><LineIcon name="calendar" />Leave</span>
                <span class="lp-tile"><LineIcon name="tasks" />Tasks</span>
              </div>

              <div class="lp-recent">
                <span class="lp-recent-title">Recent activity</span>
                <div class="lp-row">
                  <i class="lp-dot ok"></i>
                  <span><b>Leave approved</b><small>Marco Santos · 2m ago</small></span>
                </div>
                <div class="lp-row">
                  <i class="lp-dot"></i>
                  <span><b>Clocked in 08:52</b><small>Ana Dela Cruz · today</small></span>
                </div>
              </div>
              <div class="lp-home-bar"></div>
            </div>
          </div>
        </div>

        <RouterLink :to="{ name: 'login' }" class="btn btn-primary lp-cta">
          Get Started Now
          <span class="lp-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </RouterLink>
      </section>

      <!-- right: team illustration + floating cards -->
      <section class="lp-right">
        <div class="lp-card lp-badge lp-float" style="--f: 0.8s">
          <span class="lp-avatar">HR</span>
          <span><b>@hr-team</b><small>People Operations</small></span>
        </div>

        <div class="lp-people">
          <svg class="lp-team" viewBox="0 0 320 300" aria-hidden="true">
            <circle cx="160" cy="214" r="128" fill="#cfe1f7" />
            <!-- left person -->
            <path d="M52 118a28 28 0 0 1 56 0v44q-28 10-56 0z" fill="#2b1d16" />
            <rect x="69" y="126" width="22" height="24" fill="#c68b63" />
            <circle cx="80" cy="112" r="25" fill="#d9a47c" />
            <path d="M55 108q10-26 38-20 18 4 24 20-22-14-62 0z" fill="#2b1d16" />
            <path d="M24 300V214q0-34 38-42h34q38 8 38 42v86z" fill="#d3cebe" />
            <path d="M64 172q16 24 32 0z" fill="#ffffff" />
            <!-- right person -->
            <rect x="233" y="122" width="20" height="22" fill="#d9a47c" />
            <circle cx="243" cy="106" r="26" fill="#efcba8" />
            <path d="M217 102q4-26 28-26 22 0 26 26-14-12-26-10-14-2-28 10z" fill="#5a3a22" />
            <path d="M190 300V200q0-40 42-46l11 10 11-10q42 6 42 46v100z" fill="#1f3c58" />
            <path d="M228 154l15 36 15-36z" fill="#ffffff" />
            <!-- center person (in front) -->
            <rect x="150" y="104" width="20" height="18" fill="#c68b63" />
            <circle cx="160" cy="82" r="30" fill="#d9a47c" />
            <path d="M130 78q2-32 32-32 28 0 30 32-16-16-32-14-16-2-30 14z" fill="#1b2635" />
            <path d="M96 300V180q0-44 46-52l18 16 18-16q46 8 46 52v120z" fill="#144c8c" />
            <path d="M142 128l18 44 18-44z" fill="#ffffff" />
            <path d="M154 146h12l-2 30-4 6-4-6z" fill="#0e3a6e" />
            <path d="M142 128l-10 30 28 14M178 128l10 30-28 14" fill="none" stroke="#0e3a6e" stroke-width="3" stroke-linejoin="round" />
          </svg>

          <div class="lp-card lp-chip lp-chip-a lp-float" style="--f: 1.2s">
            <div class="lp-avatars sm" aria-hidden="true"><span>MS</span><span>DC</span><span>BV</span></div>
            <span><b>3</b><small>Leave requests pending</small></span>
          </div>
          <div class="lp-card lp-chip lp-chip-b lp-float" style="--f: 0.2s">
            <LineIcon name="shield" />
            <span><b>Role-based access</b><small>Admin · HR · Employee</small></span>
          </div>
        </div>
      </section>
    </main>

    <!-- feature strip (a slow marquee on small screens) -->
    <footer class="lp-features">
      <div class="lp-track">
        <div v-for="f in features" :key="f.title" class="lp-card lp-feat">
          <LineIcon :name="f.icon" />
          <span><b>{{ f.title }}</b><small>{{ f.text }}</small></span>
        </div>
        <div v-for="f in features" :key="'dup-' + f.title" class="lp-card lp-feat lp-dup" aria-hidden="true">
          <LineIcon :name="f.icon" />
          <span><b>{{ f.title }}</b><small>{{ f.text }}</small></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* ====== landing (one screen, no scrolling). Everything starts with lp- so it never clashes ====== */
.lp {
  --ph: clamp(250px, calc(100svh - 285px), 600px); /* phone height: grows and shrinks with the window */
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  height: 100vh;
  height: 100svh;
  overflow: hidden; /* no scrolling */
  background: linear-gradient(180deg, #d6e5f9 0%, #e9f1fb 50%, var(--bg) 100%);
  color: var(--ink);
}
.lp > header,
.lp > main,
.lp > footer {
  position: relative;
  z-index: 1;
}

/* background word */
.lp-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.lp-watermark {
  position: absolute;
  left: 50%;
  top: -0.04em;
  transform: translateX(-50%);
  font-size: clamp(100px, 21vw, 330px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.78);
  animation: lp-drift 14s ease-in-out infinite alternate;
}

/* top bar */
.lp-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px clamp(20px, 4vw, 56px);
}
.lp .brand .rise {
  color: var(--brand); /* the beige is for dark backgrounds, this page is light */
}
.lp .brand-logo {
  height: 38px;
}
.lp-signin {
  padding: 8px 22px;
  background: var(--white);
  color: var(--brand);
  border-color: var(--brand);
}
.lp-signin:hover {
  background: var(--brand);
  color: var(--white);
}

/* three columns: left text, center phone, right people */
.lp-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: clamp(16px, 3vw, 56px);
  align-items: center;
  min-height: 0;
  padding: 0 clamp(20px, 4vw, 56px);
}
/* the big white curve the phone sits on */
.lp-stage::before {
  content: "";
  position: absolute;
  left: -8%;
  right: -8%;
  bottom: 0;
  height: 44%;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  z-index: -1;
}

.lp-card {
  background: var(--white);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  border-radius: 0; /* sharp cards */
}
.lp small {
  display: block;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--muted);
  line-height: 1.35;
}
.lp b {
  font-weight: 700;
}

/* ---- left ---- */
.lp-left {
  display: grid;
  gap: clamp(8px, 1.6vh, 18px);
  justify-items: start;
}
.lp-eyebrow {
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--white);
  border: 1px solid var(--line);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase; /* none | uppercase | lowercase | capitalize */
  color: var(--brand);
}
.lp-title {
  display: grid;
  font-size: clamp(1.9rem, min(3.6vw, 6.2vh), 3.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
}
.lp-title span {
  opacity: 0;
  filter: blur(10px);
  transform: translateY(14px);
  transition: opacity 0.7s ease, filter 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.1s + var(--i) * 0.14s);
}
.in .lp-title span {
  opacity: 1;
  filter: none;
  transform: none;
}
.lp-hl {
  color: var(--brand);
}
.lp-sub {
  max-width: 400px;
  color: var(--muted);
  font-size: clamp(0.9rem, 1.4vh + 0.3rem, 1.05rem);
}

.lp-stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  margin-top: clamp(0px, 1.5vh, 12px);
}
.lp-stat .num {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
  color: var(--brand);
}
.lp-stat strong {
  display: block;
  margin-top: 4px;
  font-size: 0.9rem;
}

/* overlapping initials circles */
.lp-avatars {
  display: flex;
}
.lp-avatars span {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin-left: -10px;
  border: 2px solid var(--white);
  border-radius: 50%;
  background: var(--brand);
  color: var(--white);
  font-size: 0.68rem;
  font-weight: 800;
}
.lp-avatars span:first-child {
  margin-left: 0;
}
.lp-avatars span:nth-child(2) { background: var(--light-blue); color: var(--ink); }
.lp-avatars span:nth-child(3) { background: var(--accent); color: var(--ink); }
.lp-avatars span:nth-child(4) { background: var(--ink); }
.lp-avatars.sm span {
  width: 28px;
  height: 28px;
  font-size: 0.58rem;
}

/* ---- center: phone ---- */
.lp-center {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-bottom: clamp(10px, 2.5vh, 26px);
  min-height: 0;
}
.lp-tilt {
  perspective: 900px;
}
.lp-phone {
  container-type: inline-size; /* lets everything inside size itself in "cqw" = % of the phone width */
  position: relative;
  width: calc(var(--ph) * 0.49);
  height: var(--ph);
  flex: none;
  padding: calc(var(--ph) * 0.016);
  border-radius: calc(var(--ph) * 0.075);
  background: #0a2447;
  box-shadow: 0 30px 70px rgba(14, 58, 110, 0.35), inset 0 0 0 2px #27456f;
  transform: rotateY(calc(var(--mx, 0) * 7deg)) rotateX(calc(var(--my, 0) * -4deg));
  transition: transform 0.25s ease-out;
}
.lp-notch {
  position: absolute;
  top: calc(var(--ph) * 0.026);
  left: 50%;
  z-index: 2;
  width: 28%;
  height: calc(var(--ph) * 0.02);
  transform: translateX(-50%);
  border-radius: 999px;
  background: #050f20;
}
.lp-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 11cqw 7cqw 4cqw;
  border-radius: calc(var(--ph) * 0.062);
  background: linear-gradient(170deg, #2169b8 0%, #123f78 55%, #0a2a55 100%);
  color: var(--white);
  text-align: center;
  overflow: hidden;
}
.lp-date { font-size: 4.2cqw; font-weight: 600; opacity: 0.85; }
.lp-time { font-size: 19cqw; font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; }
.lp-hero-ic { margin: auto 0 2cqw; }
.lp-phone .icon-wrap { width: auto; height: auto; background: transparent; }
.lp-hero-ic .icon-wrap svg { width: 13cqw; height: 13cqw; }
.lp-tag { font-size: 4.8cqw; font-weight: 700; line-height: 1.35; }

.lp-tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.4cqw;
  margin-top: auto;
}
.lp-tile {
  display: grid;
  justify-items: center;
  gap: 1.4cqw;
  padding: 3cqw 1cqw;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  font-size: 3.2cqw;
  font-weight: 700;
}
.lp-tile .icon-wrap svg { width: 6.4cqw; height: 6.4cqw; }

.lp-recent { display: grid; gap: 2cqw; margin-top: 4cqw; text-align: left; }
.lp-recent-title { font-size: 3.3cqw; font-weight: 700; opacity: 0.85; }
.lp-row {
  display: flex;
  align-items: center;
  gap: 2.6cqw;
  padding: 2.6cqw;
  background: var(--white);
  color: var(--ink);
}
.lp-row small { font-size: 2.8cqw; }
.lp-row b { font-size: 3.3cqw; display: block; }
.lp-dot {
  flex: none;
  width: 6.4cqw;
  height: 6.4cqw;
  border-radius: 50%;
  background: var(--light-blue);
}
.lp-dot.ok { background: #86d19f; }
.lp-home-bar {
  width: 32%;
  height: 1.1cqw;
  margin: 4cqw auto 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
}

/* the big button */
.lp-cta {
  flex: none; /* never let the column squash the button */
  position: relative;
  overflow: hidden;
  gap: 14px;
  padding: 10px 12px 10px 28px;
  font-size: 1rem;
  box-shadow: 0 12px 28px rgba(20, 76, 140, 0.35);
}
.lp-arrow {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--white);
  transition: transform 0.25s;
}
.lp .lp-arrow svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: var(--brand) !important; /* a global .btn rule would otherwise paint it white */
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lp-cta:hover .lp-arrow { transform: translateX(4px); }
.lp-cta::after { /* a light sweep that runs across the button */
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -40%;
  width: 30%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  animation: lp-shine 4.5s ease-in-out infinite;
}

/* ---- right ---- */
.lp-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(8px, 2vh, 20px);
}
.lp-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 10px;
}
.lp-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--brand);
  color: var(--white);
  font-size: 0.75rem;
  font-weight: 800;
}
.lp-people {
  position: relative;
  width: min(100%, 400px);
}
.lp-team {
  display: block;
  width: 100%;
  max-height: clamp(180px, 38vh, 380px);
  margin-inline: auto;
}
.lp-chip {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px 9px 10px;
}
.lp-chip b { display: block; font-size: 0.85rem; }
.lp-chip-a { left: -6%; bottom: 8%; }
.lp-chip-b { right: -2%; top: 6%; }
.lp-chip .icon-wrap { width: 34px; height: 34px; }
.lp-chip .icon-wrap svg { width: 18px; height: 18px; }
.lp-chip-a b { font-size: 1.15rem; line-height: 1; margin-bottom: 2px; }

/* ---- bottom strip ---- */
.lp-features {
  overflow: hidden;
  padding: 14px clamp(20px, 4vw, 56px) 18px;
}
.lp-track {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}
.lp-feat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.lp-feat:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.lp-feat b { display: block; font-size: 0.8rem; line-height: 1.25; }
.lp-feat small { font-size: 0.7rem; }
.lp-feat .icon-wrap { flex: none; width: 36px; height: 36px; }
.lp-feat .icon-wrap svg { width: 18px; height: 18px; }
.lp-feat.lp-dup { display: none; } /* the copy is only for the phone marquee */

/* ---- motion ---- */
.lp-float { animation: lp-float 6s ease-in-out infinite; animation-delay: var(--f, 0s); }
.lp-phone.lp-float { animation-name: lp-float-phone; }
.lp-cta, .lp-nav, .lp-features { opacity: 0; transition: opacity 0.7s ease 0.35s; }
.in .lp-cta, .in .lp-nav, .in .lp-features { opacity: 1; }
.lp-right, .lp-center .lp-tilt { opacity: 0; transform: translateY(22px); transition: opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s; }
.in .lp-right, .in .lp-center .lp-tilt { opacity: 1; transform: none; }

@keyframes lp-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
@keyframes lp-float-phone { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }
@keyframes lp-drift { from { transform: translateX(-52%); } to { transform: translateX(-48%); } }
@keyframes lp-shine { 0%, 55% { left: -40%; } 100% { left: 140%; } }
@keyframes lp-marquee { to { transform: translateX(-50%); } }

@media (prefers-reduced-motion: reduce) {
  .lp *, .lp *::before, .lp *::after { animation: none !important; transition: none !important; }
  .lp-title span, .lp-cta, .lp-nav, .lp-features, .lp-right, .lp-tilt { opacity: 1 !important; filter: none !important; transform: none !important; }
}

/* ---- smaller screens ---- */
@media (max-width: 1100px) {
  .lp-features { padding-inline: 0; }
  .lp-track { display: flex; width: max-content; padding-left: 12px; animation: lp-marquee 32s linear infinite; }
  .lp-feat { flex: none; width: 210px; }
  .lp-feat.lp-dup { display: flex; }
  .lp-chip-a { left: 0; }
  .lp-chip-b { right: 0; }
}

@media (max-width: 900px) {
  .lp { --ph: clamp(240px, calc(100svh - 440px), 440px); }
  .lp-stage {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    align-content: start;
    gap: 6px;
  }
  .lp-left { justify-items: center; text-align: center; }
  .lp-title { font-size: clamp(1.7rem, 7.6vw, 2.4rem); }
  .lp-right, .lp-stat { display: none; }
  .lp-center { gap: 12px; }
  .lp-watermark { font-size: 30vw; }
}
@media (max-width: 900px) and (max-height: 720px) {
  .lp-sub, .lp-eyebrow { display: none; }
  .lp-features { display: none; }
  .lp { --ph: clamp(220px, calc(100svh - 300px), 440px); }
}
@media (max-width: 520px) {
  .lp .brand-logo { height: 32px; }
  .lp-sub { font-size: 0.88rem; }
}
</style>
