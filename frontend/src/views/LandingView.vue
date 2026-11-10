<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LineIcon from '../components/LineIcon.vue'

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

// the nodes around the phone. "off" pushes a node closer to the phone, so the lines bulge outward like an arc.
// (icon names come from data/icons.js)
const leftNodes = [
  { icon: 'users', title: 'Employee records', text: 'Every profile', off: 56 },
  { icon: 'clock', title: 'Live attendance', text: 'Clock in and out', off: 0 },
  { icon: 'calendar', title: 'Leave approvals', text: 'One-click decisions', off: 0 },
  { icon: 'tasks', title: 'Task board', text: 'Work and deadlines', off: 56 },
]
const rightNodes = [
  { icon: 'shield', title: 'Role-based access', text: 'Admin, HR, employee', off: 56 },
  { icon: 'dashboard', title: 'Team dashboard', text: 'The day at a glance', off: 0 },
  { icon: 'userCheck', title: 'Secure sign-in', text: 'Accounts made by HR', off: 56 },
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

    <!-- headline -->
    <section class="lp-head">
      <span class="lp-eyebrow">HR management system</span>
      <h1 class="lp-title">
        <span style="--i: 0">Every employee,</span>
        <span style="--i: 1">every day,</span>
        <span style="--i: 2" class="lp-hl">in one place.</span>
      </h1>
      <p class="lp-sub">Track employee status, attendance, leave and work without the spreadsheets.</p>
    </section>

    <!-- the hub: phone in the middle, nodes on both sides, button underneath -->
    <main class="lp-stage">
      <div class="lp-hub">
        <!-- left nodes. Each one is: icon, text, a line that draws toward the phone, and a dot on the phone's edge -->
        <ul class="lp-nodes lp-left">
          <li v-for="(n, i) in leftNodes" :key="n.title" class="lp-node" :style="{ '--i': i, '--off': n.off + 'px' }" :title="n.title">
            <LineIcon :name="n.icon" />
            <span class="lp-node-text"><b>{{ n.title }}</b><small>{{ n.text }}</small></span>
            <i class="lp-line"></i>
            <i class="lp-dot-end"></i>
          </li>
        </ul>

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

        <!-- right nodes: the same markup, mirrored by CSS -->
        <ul class="lp-nodes lp-right">
          <li v-for="(n, i) in rightNodes" :key="n.title" class="lp-node" :style="{ '--i': i + 2, '--off': n.off + 'px' }" :title="n.title">
            <LineIcon :name="n.icon" />
            <span class="lp-node-text"><b>{{ n.title }}</b><small>{{ n.text }}</small></span>
            <i class="lp-line"></i>
            <i class="lp-dot-end"></i>
          </li>
        </ul>
      </div>

      <RouterLink :to="{ name: 'login' }" class="btn btn-primary lp-cta">
        Get Started Now
        <span class="lp-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </RouterLink>
    </main>
  </div>
</template>

<style>
/* ====== landing (one screen, no scrolling). Everything starts with lp- so it never clashes ====== */
.lp {
  --ph: clamp(250px, calc(100svh - 340px), 600px); /* phone height: grows and shrinks with the window */
  --pw: calc(var(--ph) * 0.49); /* phone width */
  position: relative;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  height: 100vh;
  height: 100svh;
  overflow: hidden; /* no scrolling */
  background: linear-gradient(180deg, #d6e5f9 0%, #e9f1fb 55%, var(--bg) 100%);
  color: var(--ink);
}
.lp > header,
.lp > section,
.lp > main {
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
  top: 22%;
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
  padding: 14px clamp(20px, 4vw, 56px);
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

/* ---- headline (centered) ---- */
.lp-head {
  display: grid;
  justify-items: center;
  gap: clamp(6px, 1.2vh, 12px);
  padding: 0 clamp(20px, 4vw, 56px);
  text-align: center;
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 0.28em;
  font-size: clamp(1.8rem, min(3.3vw, 6vh), 3.2rem);
  font-weight: 800;
  line-height: 1.08;
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
  max-width: 660px;
  color: var(--muted);
  font-size: clamp(0.88rem, 1.3vh + 0.3rem, 1.02rem);
}

/* ---- the hub ---- */
.lp-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 0 clamp(12px, 3vw, 40px) clamp(12px, 2.6vh, 28px);
  min-height: 0;
}
.lp-hub {
  position: relative; /* the nodes are placed relative to this box */
  flex: none;
  width: var(--pw);
  height: var(--ph);
}

/* ---- nodes ---- */
.lp-nodes {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 7% 0;
  width: min(calc(50vw - var(--pw) / 2 - clamp(12px, 3vw, 40px)), 480px); /* from the page edge to the phone, max 480 */
  list-style: none;
}
.lp-left { right: 100%; } /* its right edge touches the phone's left edge */
.lp-right { left: 100%; }

.lp-node {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: var(--off, 0px); /* a bigger "off" = closer to the phone = a shorter line */
  min-width: 0;
}
.lp-right .lp-node {
  flex-direction: row-reverse; /* dot first, then the line, then text, then icon */
  margin-left: 0;
  margin-right: var(--off, 0px);
  text-align: right;
}
.lp-node .icon-wrap {
  flex: none;
  width: 42px;
  height: 42px;
  box-shadow: 0 8px 18px rgba(20, 76, 140, 0.25);
  transition: background 0.2s, transform 0.2s;
}
.lp-node .icon-wrap svg { width: 20px; height: 20px; }
.lp-node:hover .icon-wrap { background: var(--ink); transform: scale(1.08); }
.lp-node-text b { display: block; font-size: 0.88rem; line-height: 1.25; }

/* the connecting line, drawn outward from the phone */
.lp-line {
  flex: 1;
  min-width: 24px;
  height: 2px;
  background: linear-gradient(to left, var(--brand), rgba(20, 76, 140, 0.12)); /* strong at the phone, fading outward */
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.7s + var(--i) * 0.1s);
}
.lp-right .lp-line {
  background: linear-gradient(to right, var(--brand), rgba(20, 76, 140, 0.12));
  transform-origin: left center;
}
.in .lp-line { transform: scaleX(1); }

/* the dot where the line meets the phone, with a ring that pulses */
.lp-dot-end {
  position: relative;
  flex: none;
  width: 10px;
  height: 10px;
  margin-right: -5px; /* half the dot sits on the phone's edge */
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 0 3px var(--white);
}
.lp-right .lp-dot-end { margin-right: 0; margin-left: -5px; }
.lp-dot-end::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid var(--brand);
  opacity: 0;
  animation: lp-ping 2.6s ease-out infinite;
  animation-delay: calc(var(--i) * 0.35s);
}
.lp-node .icon-wrap,
.lp-node-text { opacity: 0; transform: translateY(8px); transition: opacity 0.6s ease, transform 0.6s ease; transition-delay: calc(1s + var(--i) * 0.1s); }
.in .lp-node .icon-wrap,
.in .lp-node-text { opacity: 1; transform: none; }
.lp-node:hover .icon-wrap { transition-delay: 0s; }

/* ---- phone ---- */
.lp-tilt {
  position: relative;
  z-index: 1;
  perspective: 900px;
}
.lp-phone {
  container-type: inline-size; /* lets everything inside size itself in "cqw" = % of the phone width */
  position: relative;
  width: var(--pw);
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
.lp-screen small { color: inherit; }
.lp-date { font-size: 4.2cqw; font-weight: 600; opacity: 0.85; }
.lp-time { font-size: 19cqw; font-weight: 700; line-height: 1.05; letter-spacing: -0.03em; }
.lp-hero-ic { margin: auto 0 2cqw; }
.lp-phone .icon-wrap { width: auto; height: auto; background: transparent; box-shadow: none; }
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
.lp-row small { font-size: 2.8cqw; color: var(--muted); }
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

/* ---- motion ---- */
.lp-float { animation: lp-float-phone 6s ease-in-out infinite; animation-delay: var(--f, 0s); }
.lp-cta, .lp-nav { opacity: 0; transition: opacity 0.7s ease 0.35s; }
.in .lp-cta, .in .lp-nav { opacity: 1; }
.lp-tilt { opacity: 0; transform: translateY(22px); transition: opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s; }
.in .lp-tilt { opacity: 1; transform: none; }

@keyframes lp-float-phone { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
@keyframes lp-drift { from { transform: translateX(-52%); } to { transform: translateX(-48%); } }
@keyframes lp-shine { 0%, 55% { left: -40%; } 100% { left: 140%; } }
@keyframes lp-ping { 0% { opacity: 0.7; transform: scale(1); } 70%, 100% { opacity: 0; transform: scale(2.6); } }

@media (prefers-reduced-motion: reduce) {
  .lp *, .lp *::before, .lp *::after { animation: none !important; transition: none !important; }
  .lp-title span, .lp-cta, .lp-nav, .lp-tilt, .lp-node .icon-wrap, .lp-node-text { opacity: 1 !important; filter: none !important; transform: none !important; }
  .lp-line { transform: scaleX(1) !important; }
}

/* ---- smaller screens ---- */
@media (max-width: 1000px) {
  .lp-node-text small { display: none; } /* titles only */
  .lp-node-text b { font-size: 0.78rem; }
  .lp-node .icon-wrap { width: 36px; height: 36px; }
  .lp-node .icon-wrap svg { width: 17px; height: 17px; }
  .lp-node { gap: 8px; --off: 0px !important; }
  .lp-nodes { width: calc(50vw - var(--pw) / 2 - 12px); }
}

@media (max-width: 700px) {
  .lp { --ph: clamp(240px, calc(100svh - 420px), 440px); }
  .lp-title { font-size: clamp(1.7rem, 7.6vw, 2.4rem); }
  .lp-node-text { display: none; } /* phones: icons only, no room for words */
  .lp-node { gap: 4px; }
  .lp-node .icon-wrap { width: 34px; height: 34px; }
  .lp-watermark { font-size: 30vw; }
}
@media (max-width: 700px) and (max-height: 720px) {
  .lp { --ph: clamp(220px, calc(100svh - 330px), 440px); }
  .lp-sub, .lp-eyebrow { display: none; }
}
@media (max-width: 520px) {
  .lp .brand-logo { height: 32px; }
  .lp-sub { font-size: 0.88rem; }
}
</style>
