<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { animate, scroll, stagger, press, inView } from 'motion'
import LineIcon from '../components/LineIcon.vue' // motion.dev: springs, staggering and scroll-linked animation

const navEl = ref(null)
const heroEl = ref(null)
const copyEl = ref(null)
const fanEl = ref(null)
const panEl = ref(null)
const rolesEl = ref(null)
const howEl = ref(null)
const stackEl = ref(null)
const faqEl = ref(null)
const footEl = ref(null)
const stops = [] // the scroll / press listeners, switched off when the page is left

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tiles = [...fanEl.value.querySelectorAll('.lp-tile')]
  const angle = (i) => (i - (tiles.length - 1) / 2) * 11 // the fan: 11 degrees between cards
  const spring = (stiffness, damping, extra = {}) => ({ type: 'spring', stiffness, damping, ...extra })

  // SMOOTH scroll-linking. A plain scroll() animation jumps to a new frame for every wheel tick, so it looks steppy.
  // Here the scrollbar only sets a TARGET (0 to 1). A small loop then glides the animation toward that target
  // a little more every frame (exponential easing, "10" = how snappy it follows, higher = tighter).
  const smoothScroll = (apply, options, once = true) => {
    let cur = null
    let target = 0
    let raf = 0
    let last = 0
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      cur += (target - cur) * (1 - Math.exp(-dt * 10))
      if (Math.abs(target - cur) < 0.0005) {
        cur = target
        raf = 0
      } else {
        raf = requestAnimationFrame(tick)
      }
      apply(cur)
    }
    const stop = scroll((p) => {
      // once = true: the target can only move FORWARD, so an animation that has played stays finished when you
      // scroll back up (until the page is refreshed). The hero parallax passes false so it still follows both ways.
      target = once ? Math.max(target, p) : p
      if (cur === null) {
        cur = target // first value: jump straight there (the page may load already scrolled down)
        apply(cur)
      } else if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }, options)
    return () => {
      stop()
      cancelAnimationFrame(raf)
    }
  }
  // like smoothScroll, but drives a motion animation (keyframes) instead of a callback
  const smoothAnimate = (el, keyframes, options, once = true) => {
    const anim = animate(el, keyframes, { ease: 'linear', duration: 1 })
    anim.pause()
    return smoothScroll((p) => {
      anim.time = p * anim.duration
    }, options, once)
  }

  // safety net: if the animation code ever throws, everything simply appears in its final place
  function showEverything() {
    navEl.value.style.opacity = 1
    ;[...copyEl.value.children].forEach((el) => (el.style.opacity = 1))
    tiles.forEach((el, i) => {
      el.style.transform = `rotate(${angle(i)}deg)`
    })
    rolesEl.value.style.setProperty('--p', 1)
    rolesEl.value.querySelectorAll('[data-r]').forEach((el) => (el.style.opacity = 1))
  }

  // "reduced motion" is an operating-system setting (on Windows: Settings > Accessibility > Visual effects >
  // Animation effects). When it is on, we keep things gentle: quick fades and a plain, non-bouncy fan-out,
  // no parallax. It is never fully switched off, so the page still feels alive.
  const gentle = { duration: 0.6, ease: 'easeOut' }

  try {
    // 1. the pill drops in, then the headline, text and buttons rise one after another
    animate(navEl.value, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [-24, 0] }, reduce ? gentle : spring(180, 20))
    animate(
      [...copyEl.value.children],
      reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [40, 0] },
      reduce
        ? { ...gentle, delay: stagger(0.1, { startDelay: 0.1 }) }
        : spring(90, 16, { delay: stagger(0.16, { startDelay: 0.2 }) }),
    )

    // 2. the cards start as one stack and spread into the fan in a single spring. There is no fade at all:
    //    the cards are solid from the first frame, only their angle and position change.
    tiles.forEach((el, i) => {
      const delay = 0.15 + i * 0.06
      if (reduce) {
        animate(el, { rotate: [angle(i) * 0.4, angle(i)] }, { ...gentle, duration: 0.8, delay })
        return
      }
      animate(el, { rotate: [0, angle(i)], y: [40, 0] }, spring(70, 13, { delay }))
    })

    // 3. scrolling away: the text drifts up and fades, the hand sinks into the page below
    if (!reduce) {
      const heroRange = { target: heroEl.value, offset: ['start start', 'end start'] }
      stops.push(smoothAnimate(copyEl.value, { y: [0, -70], opacity: [1, 0.15] }, heroRange, false))
      stops.push(smoothAnimate(panEl.value, { y: [0, 90] }, heroRange, false))
    }

    // 4. the next section: a white sheet grows to full width as it scrolls in (--p goes 0 to 1),
    //    and its content springs up once the sheet is mostly there
    let revealed = false
    const reveal = () => {
      revealed = true
      animate(
        rolesEl.value.querySelectorAll('[data-r]'),
        reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [40, 0] },
        reduce ? { ...gentle, delay: stagger(0.08) } : spring(110, 18, { delay: stagger(0.1) }),
      )
    }
    stops.push(
      smoothScroll(
        (p) => {
          rolesEl.value.style.setProperty('--p', p)
          if (p > 0.45 && !revealed) reveal()
        },
        { target: rolesEl.value, offset: ['start end', 'start 0.3'] },
      ),
    )

    // 5. buttons squash a little while pressed
    stops.push(
      press('.lp .btn', (el) => {
        animate(el, { scale: 0.95 }, spring(500, 30))
        return () => animate(el, { scale: 1 }, spring(500, 22))
      }),
    )

    // 6. the sections below are SCRUBBED by the scrollbar: the animation moves exactly as far as you scroll,
    //    so scrolling down zooms in and tilts the panels flat. Each one plays once: scrolling back up leaves it flat.
    //    (perspective on each section's wrapper is what makes the tilts look 3D)
    const scrub = (el, keyframes, offset = ['start end', 'center 0.7'], target = el) =>
      stops.push(smoothAnimate(el, keyframes, { target, offset }))

    // how it works: the title zooms out to size, three panels swing in from the sides and the middle one rises
    scrub(howEl.value.querySelector('.lp-h2'), { scale: [1.5, 1], y: [70, 0] }, ['start end', 'start 0.55'])
    const stepEls = [...howEl.value.querySelectorAll('.lp-step')]
    const from = [
      { x: [-240, 0], rotateY: [42, 0], rotateX: [14, 0], scale: [0.8, 1] },
      { y: [170, 0], rotateX: [32, 0], scale: [0.7, 1] },
      { x: [240, 0], rotateY: [-42, 0], rotateX: [14, 0], scale: [0.8, 1] },
    ]
    stepEls.forEach((el, i) => scrub(el, from[i]))
    scrub(howEl.value.querySelector('.lp-how-line i'), { scaleX: [0, 1] }, ['start 0.9', 'end 0.55'], howEl.value.querySelector('.lp-steps'))

    // built with: the whole panel zooms OUT from a big, tilted-back view, then each card slides in from its own side
    scrub(stackEl.value.querySelector('.lp-stack-panel'), { scale: [1.3, 1], rotateX: [-16, 0], y: [90, 0] }, ['start end', 'start 0.2'])
    stackEl.value.querySelectorAll('.lp-tech').forEach((el, i) =>
      scrub(el, { x: [i % 2 ? 110 : -110, 0], y: [70, 0], rotateZ: [i % 2 ? 7 : -7, 0] }, ['start end', 'center 0.8']),
    )

    // faq: the white sheet zooms IN to full size, and the questions swing in from alternate sides like doors
    scrub(faqEl.value.querySelector('.lp-faq-sheet'), { scale: [0.86, 1], y: [60, 0] }, ['start end', 'start 0.25'])
    faqEl.value.querySelectorAll('.lp-q').forEach((el, i) =>
      scrub(el, { x: [i % 2 ? 140 : -140, 0], rotateY: [i % 2 ? -26 : 26, 0] }, ['start end', 'start 0.88']), // done when the top is 88% down, so the lowest question is flat as soon as it shows
    )

    // footer: the big word zooms in and tips upright as the page runs out
    scrub(footEl.value.querySelector('.lp-foot-word'), { scale: [0.62, 1], rotateX: [42, 0], y: [90, 0] }, ['start end', 'end end'], footEl.value)
    scrub(footEl.value.querySelector('.lp-foot-cols'), { y: [60, 0] }, ['start end', 'center end'], footEl.value)

    // the line icons draw themselves once their panel comes into view
    stops.push(inView('.lp-step, .lp-tech', (el) => { el.classList.add('in') }, { amount: 0.4 }))
  } catch (err) {
    console.warn('landing animation failed, showing the page without it', err)
    showEverything()
  }
})

onBeforeUnmount(() => stops.forEach((stop) => typeof stop === 'function' && stop()))

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

// how it works: three steps (the icon names come from data/icons.js)
const steps = [
  { n: '01', icon: 'userCheck', tone: 't-dark', title: 'HR creates the account', text: 'An admin or HR adds the employee and the account. There is no public sign-up, so only the right people get in.' },
  { n: '02', icon: 'clock', tone: 't-light', title: 'The day gets logged', text: 'Employees clock in and out, request leave and update their tasks. Late is counted automatically after 09:15.' },
  { n: '03', icon: 'dashboard', tone: 't-blue', title: 'HR decides in one click', text: 'Approve or reject leave, then read the whole company at a glance on the dashboard.' },
]

// built with: what the project is made of, grouped
const stack = [
  { icon: 'dashboard', title: 'Frontend', items: ['Vue 3', 'Vite', 'Pinia', 'Vue Router', 'Axios', 'Motion'] },
  { icon: 'tasks', title: 'Backend', items: ['FastAPI', 'SQLAlchemy', 'Pydantic', 'Uvicorn'] },
  { icon: 'inbox', title: 'Data and hosting', items: ['SQLite (local)', 'PostgreSQL', 'Neon', 'Vercel'] },
  { icon: 'shield', title: 'Security', items: ['JWT sign-in', 'bcrypt hashing', 'Role-based access'] },
]

// faq: one open at a time
const faq = [
  { q: 'Who creates the accounts?', a: 'HR or an admin. HireRise has no public sign-up, so nobody can register themselves. The first admin is created when the system starts.' },
  { q: 'What can an employee see?', a: 'Only their own records and tasks. Every page and every action is limited by the signed-in role.' },
  { q: 'What happens when someone leaves?', a: 'HR deactivates the account and that person loses access straight away.' },
  { q: 'How is "late" decided?', a: 'Clocking in after 09:15 counts as late. The attendance page and the dashboard use the same rule.' },
  { q: 'Is HireRise a real product?', a: 'It is a portfolio project, built to learn the full stack. Sign-in is a real backend with hashed passwords. The HR data you see after signing in is generated sample data.' },
]
const openQ = ref(0)
const year = new Date().getFullYear()

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
  <div id="top" class="lp">
    <!-- floating pill navigation -->
    <header ref="navEl" class="lp-nav">
      <RouterLink to="/" class="brand">
        <img class="brand-logo" src="/logo.png" alt="" />
        <span>Hire<span class="rise">Rise</span></span>
      </RouterLink>
      <i class="lp-sep" aria-hidden="true"></i>
      <nav class="lp-links" aria-label="Page sections">
        <a href="#features" @click.prevent="go('features')">Features</a>
        <a href="#roles" @click.prevent="go('roles')">Who it's for</a>
        <a href="#how" @click.prevent="go('how')">How it works</a>
        <a href="#faq" @click.prevent="go('faq')">FAQ</a>
      </nav>
      <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent lp-nav-cta">Sign in</RouterLink>
    </header>

    <!-- hero: a hand of cards on the left, the text on the right -->
    <section ref="heroEl" class="lp-hero">
      <div ref="copyEl" class="lp-copy">
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
        <div ref="panEl" class="lp-fan-pan">
        <ul ref="fanEl" class="lp-fan">
        <!-- 1. employee records -->
        <li class="lp-tile t-dark" style="--i: 0">
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
        <li class="lp-tile t-light" style="--i: 1">
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
        <li class="lp-tile t-blue" style="--i: 2">
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
        <li class="lp-tile t-dark" style="--i: 3">
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
        <li class="lp-tile t-light" style="--i: 4">
          <h3 class="lp-label">Role-based access</h3>
          <div class="lp-mock" aria-hidden="true">
            <div v-for="r in roles" :key="r.name" class="lp-role">
              <b>{{ r.name }}</b><small>{{ r.scope }}</small>
            </div>
          </div>
        </li>

        <!-- 6. team dashboard -->
        <li class="lp-tile t-blue" style="--i: 5">
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
      </div>
    </section>

    <!-- who it's for -->
    <section id="roles" ref="rolesEl" class="lp-roles" aria-label="Who HireRise is for">
      <h2 class="lp-h2" data-r>One system, <em>three ways in.</em></h2>
      <div class="lp-aud">
        <article v-for="a in audiences" :key="a.title" class="lp-card" data-r>
          <h3>{{ a.title }}</h3>
          <ul>
            <li v-for="p in a.points" :key="p">{{ p }}</li>
          </ul>
        </article>
      </div>
      <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent lp-end" data-r>
        Get started
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </RouterLink>
    </section>

    <!-- how it works -->
    <section id="how" ref="howEl" class="lp-how" aria-label="How HireRise works">
      <h2 class="lp-h2">Three steps, <em>zero spreadsheets.</em></h2>
      <div class="lp-steps">
        <div class="lp-how-line" aria-hidden="true"><i></i></div>
        <article v-for="s in steps" :key="s.n" class="lp-step" :class="s.tone">
          <span class="lp-step-n">{{ s.n }}</span>
          <LineIcon :name="s.icon" />
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </article>
      </div>
    </section>

    <!-- built with -->
    <section id="stack" ref="stackEl" class="lp-stack" aria-label="What HireRise is built with">
      <div class="lp-stack-panel">
        <span class="lp-eyebrow">Built with</span>
        <h2 class="lp-h2">A full stack, <em>built by hand.</em></h2>
        <div class="lp-tech-grid">
          <article v-for="g in stack" :key="g.title" class="lp-tech">
            <LineIcon :name="g.icon" />
            <h3>{{ g.title }}</h3>
            <ul>
              <li v-for="it in g.items" :key="it">{{ it }}</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <!-- faq -->
    <section id="faq" ref="faqEl" class="lp-faq" aria-label="Frequently asked questions">
      <div class="lp-faq-sheet">
        <h2 class="lp-h2">Questions, <em>answered.</em></h2>
        <div class="lp-qs">
          <div v-for="(f, i) in faq" :key="f.q" class="lp-q" :class="{ open: openQ === i }">
            <button type="button" class="lp-q-btn" :aria-expanded="openQ === i" :aria-controls="'faq-a-' + i" @click="openQ = openQ === i ? -1 : i">
              <span>{{ f.q }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <div :id="'faq-a-' + i" class="lp-a" role="region">
              <div><p>{{ f.a }}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- footer -->
    <footer ref="footEl" class="lp-foot">
      <div class="lp-foot-cols">
        <div class="lp-foot-brand">
          <RouterLink to="/" class="brand">
            <img class="brand-logo" src="/logo.png" alt="" />
            <span>Hire<span class="rise">Rise</span></span>
          </RouterLink>
          <p>Employee records, attendance, leave and tasks in one place.</p>
        </div>
        <nav aria-label="Explore">
          <h4>Explore</h4>
          <a href="#features" @click.prevent="go('features')">Features</a>
          <a href="#roles" @click.prevent="go('roles')">Who it's for</a>
          <a href="#how" @click.prevent="go('how')">How it works</a>
          <a href="#stack" @click.prevent="go('stack')">Built with</a>
          <a href="#faq" @click.prevent="go('faq')">FAQ</a>
        </nav>
        <nav aria-label="Project">
          <h4>Project</h4>
          <a href="https://github.com/RebEmnacin/HireRise" target="_blank" rel="noopener">
            Source on GitHub
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9" /></svg>
          </a>
          <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
        </nav>
      </div>
      <div class="lp-foot-word" aria-hidden="true">Hire<span>Rise</span></div>
      <div class="lp-foot-bar">
        <span>© {{ year }} HireRise · A portfolio project by RebEmnacin</span>
        <button type="button" class="lp-top" @click="go('top')">
          Back to top
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </button>
      </div>
    </footer>
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
  --k: 1.35; /* how big the hand of cards is drawn (1 = 640px wide) */
  display: grid;
  grid-template-columns: calc(640px * var(--k)) minmax(0, 1fr);
  grid-template-areas: "fan copy";
  align-items: end; /* the text and the cards both sit on the bottom edge of the hero */
  gap: 32px;
  max-width: 1440px; /* on very wide screens the hero stays centred instead of stretching to both edges */
  margin: 0 auto;
  padding: clamp(48px, 8vh, 88px) 32px 0; /* no bottom padding: the cards run into the bottom edge and are cut off by it */
}
.lp-copy {
  grid-area: copy;
  padding-bottom: clamp(48px, 9vh, 96px); /* keeps the text clear of the edge the cards are cut off at */
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
/* the wrapper is only as tall as the top half of the cards, so the lower half is cut off at the bottom edge.
   The list inside is always drawn at 640 x 440 and scaled with --k. */
.lp-fan-wrap {
  grid-area: fan;
  width: calc(640px * var(--k));
  height: calc(330px * var(--k));
  overflow: hidden;
  scroll-margin-top: 80px;
}
.lp-fan-pan { width: 100%; height: 100%; }
.lp-fan {
  position: relative;
  width: 640px;
  height: 440px;
  transform: scale(var(--k));
  transform-origin: 0 0;
  list-style: none;
  pointer-events: none; /* the cards are for looking at only: no hover or click reaction */
}
/* every card is turned around a point below it (like a wrist); the angle is set by the animation in the script */
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

/* ---- who it's for: a white sheet that grows to full width as you scroll to it ---- */
.lp-roles {
  --p: 0; /* scroll progress 0 to 1, set by the script */
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: center;
  gap: 36px;
  padding: clamp(72px, 12vh, 130px) clamp(20px, 4vw, 56px) clamp(64px, 10vh, 110px);
  scroll-margin-top: 20px;
  color: var(--lp-ink);
}
.lp-roles::before {
  content: "";
  position: absolute;
  inset: 0 calc((1 - var(--p)) * 5%) 0;
  z-index: -1;
  border-radius: calc((1 - var(--p)) * 56px) calc((1 - var(--p)) * 56px) 0 0;
  background: var(--white);
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
.lp-roles .lp-h2 em { color: var(--brand); }
.lp-aud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  width: 100%;
  max-width: 1100px;
}
.lp-card {
  padding: 26px;
  border: 1px solid rgba(14, 58, 110, 0.1);
  border-radius: 16px;
  background: var(--lp-light);
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
  color: rgba(19, 34, 45, 0.78);
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
  background: var(--brand);
}
.lp .lp-roles .lp-btn-accent { background: var(--ink); border-color: var(--ink); color: var(--white); }
.lp .lp-roles .lp-btn-accent:hover { background: var(--brand); border-color: var(--brand); }

/* ---- how it works: the dark sheet rounds over the bottom of the white one ---- */
.lp-roles { padding-bottom: clamp(120px, 16vh, 170px); } /* room for the dark sheet that overlaps the bottom */
.lp-how {
  position: relative;
  z-index: 2;
  margin-top: -56px;
  padding: clamp(80px, 13vh, 140px) clamp(20px, 4vw, 56px) clamp(70px, 11vh, 120px);
  border-radius: 56px 56px 0 0;
  background: var(--lp-bg);
  display: grid;
  justify-items: center;
  gap: clamp(40px, 7vh, 72px);
  scroll-margin-top: 20px;
}
.lp-how .lp-h2,
.lp-stack .lp-h2 { color: var(--white); max-width: 18ch; }
.lp-how .lp-h2 em,
.lp-stack .lp-h2 em { color: var(--lp-accent); display: block; font-style: normal; }
.lp-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  width: 100%;
  max-width: 1100px;
  perspective: 1200px; /* gives the tilted panels depth */
}
.lp-how-line { /* the line that links the three panels and fills as you scroll */
  position: absolute;
  left: 8%;
  right: 8%;
  top: 50%;
  height: 2px;
  background: rgba(255, 255, 255, 0.12);
  z-index: 0;
}
.lp-how-line i {
  display: block;
  height: 100%;
  background: var(--lp-accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
}
.lp-step {
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: 12px;
  min-height: 300px;
  padding: 26px;
  border-radius: 20px;
  box-shadow: -6px 12px 34px rgba(6, 22, 42, 0.38);
  will-change: transform;
}
.lp-step.t-dark { background: var(--lp-dark); color: var(--white); }
.lp-step.t-light { background: var(--lp-light); color: var(--lp-ink); }
.lp-step.t-blue { background: var(--lp-blue); color: var(--lp-ink); }
.lp-step-n { font-family: var(--lp-serif); font-size: 3.2rem; font-weight: 800; line-height: 1; letter-spacing: -0.05em; opacity: 0.9; }
.lp-step .icon-wrap { display: inline-grid; width: 46px; height: 46px; place-items: center; border-radius: 12px; background: rgba(127, 150, 180, 0.2); }
.lp-step .icon-wrap svg { width: 24px; height: 24px; }
.lp-step h3 { font-family: var(--lp-serif); font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; }
.lp-step p { font-size: 0.95rem; line-height: 1.55; opacity: 0.82; }

/* ---- built with ---- */
.lp-stack {
  position: relative;
  z-index: 2;
  padding: 0 clamp(20px, 4vw, 56px) clamp(70px, 11vh, 120px);
  perspective: 1400px;
  scroll-margin-top: 20px;
}
.lp-stack-panel {
  display: grid;
  justify-items: center;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(40px, 7vw, 76px) clamp(20px, 4vw, 56px);
  border-radius: 40px;
  background: var(--lp-dark);
  box-shadow: 0 30px 70px rgba(6, 22, 42, 0.4);
  transform-origin: 50% 0;
  will-change: transform;
}
.lp-stack .lp-eyebrow {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(211, 206, 190, 0.4);
  color: var(--lp-accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.lp-tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  margin-top: 12px;
}
.lp-tech {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  will-change: transform;
}
.lp-tech .icon-wrap { display: inline-grid; width: 40px; height: 40px; place-items: center; border-radius: 10px; background: rgba(211, 206, 190, 0.16); color: var(--lp-accent); }
.lp-tech .icon-wrap svg { width: 21px; height: 21px; }
.lp-tech h3 { font-family: var(--lp-serif); font-size: 1.1rem; font-weight: 700; }
.lp-tech ul { display: flex; flex-wrap: wrap; gap: 8px; }
.lp-tech li {
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  color: var(--lp-text);
  font-size: 0.8rem;
  font-weight: 600;
}

/* ---- faq: a white sheet ---- */
.lp-faq {
  position: relative;
  z-index: 2;
  padding: 0 clamp(14px, 2.5vw, 32px) 0;
  perspective: 1400px;
  scroll-margin-top: 20px;
}
.lp-faq-sheet {
  display: grid;
  justify-items: center;
  gap: 36px;
  max-width: 1500px;
  margin: 0 auto;
  padding: clamp(64px, 10vh, 110px) clamp(20px, 4vw, 56px) clamp(120px, 16vh, 170px);
  border-radius: 56px 56px 0 0;
  background: var(--white);
  color: var(--lp-ink);
  transform-origin: 50% 0;
  will-change: transform;
}
.lp-faq .lp-h2 em { color: var(--brand); display: block; font-style: normal; }
.lp-qs { display: grid; gap: 12px; width: 100%; max-width: 780px; perspective: 1200px; }
.lp-q {
  border: 1px solid rgba(14, 58, 110, 0.12);
  border-radius: 16px;
  background: var(--lp-light);
  will-change: transform;
}
.lp-q-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 18px 22px;
  background: none;
  border: 0;
  color: var(--lp-ink);
  font: inherit;
  font-weight: 700;
  font-size: 1rem;
  text-align: left;
  cursor: pointer; /* auto | pointer | default */
}
.lp-q-btn:focus-visible { outline: 3px solid var(--brand); outline-offset: -3px; border-radius: 16px; }
.lp-q-btn svg {
  flex: none;
  width: 22px;
  height: 22px;
  fill: none;
  stroke: var(--brand);
  stroke-width: 2.2;
  stroke-linecap: round;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.lp-q.open .lp-q-btn svg { transform: rotate(135deg); } /* the plus turns into an x */
.lp-a {
  display: grid;
  grid-template-rows: 0fr; /* 0fr = closed, 1fr = open: the row animates its own height */
  transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.lp-q.open .lp-a { grid-template-rows: 1fr; }
.lp-a > div { overflow: hidden; }
.lp-a p { padding: 0 22px 20px; color: rgba(19, 34, 45, 0.78); font-size: 0.95rem; line-height: 1.6; }

/* ---- footer: the dark sheet rounds over the bottom of the faq ---- */
.lp-foot {
  position: relative;
  z-index: 3;
  margin-top: -56px;
  padding: clamp(64px, 10vh, 100px) clamp(20px, 4vw, 56px) 28px;
  border-radius: 56px 56px 0 0;
  background: var(--lp-bg);
  overflow: hidden;
  perspective: 1400px;
}
.lp-foot-cols {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
}
.lp-foot-brand p { max-width: 32ch; margin-top: 14px; color: var(--lp-text); font-size: 0.92rem; }
.lp-foot h4 { margin-bottom: 14px; color: var(--lp-accent); font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.lp-foot nav { display: grid; align-content: start; gap: 10px; }
.lp-foot nav a { display: inline-flex; align-items: center; gap: 6px; color: var(--lp-text); font-size: 0.92rem; text-decoration: none; }
.lp-foot nav a:hover { color: var(--white); }
.lp-foot nav svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.lp-foot-word {
  margin: clamp(40px, 8vh, 80px) auto 0;
  max-width: 1200px;
  font-family: var(--lp-serif);
  font-size: clamp(64px, 17vw, 250px);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.06em;
  text-align: center;
  color: rgba(255, 255, 255, 0.1);
  transform-origin: 50% 100%;
  will-change: transform;
  user-select: none;
}
.lp-foot-word span { color: rgba(211, 206, 190, 0.22); }
.lp-foot-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 1100px;
  margin: 28px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--lp-text);
  font-size: 0.82rem;
}
.lp-top { display: inline-flex; align-items: center; gap: 6px; background: none; border: 0; color: var(--lp-accent); font: inherit; font-weight: 700; cursor: pointer; }
.lp-top svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.2s; }
.lp-top:hover svg { transform: translateY(-3px); }
.lp-foot a:focus-visible, .lp-top:focus-visible { outline: 2px solid var(--lp-accent); outline-offset: 3px; border-radius: 4px; }

@media (max-width: 1000px) {
  .lp-steps { grid-template-columns: 1fr; max-width: 520px; }
  .lp-how-line { display: none; }
  .lp-tech-grid { grid-template-columns: repeat(2, 1fr); }
  .lp-foot-cols { grid-template-columns: 1fr 1fr; }
  .lp-foot-brand { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .lp-tech-grid { grid-template-columns: 1fr; }
  .lp-how, .lp-foot, .lp-faq-sheet { border-radius: 36px 36px 0 0; }
  .lp-how, .lp-foot { margin-top: -36px; }
}

/* ---- animation start states: hidden until the script (motion) brings them in ---- */
.lp-nav,
.lp-copy > *,
.lp [data-r] {
  opacity: 0;
}

/* ---- smaller screens: the hand shrinks, then moves below the text ---- */
@media (max-width: 1439px) { .lp-hero { --k: 1.15; } }
@media (max-width: 1279px) { .lp-hero { --k: 0.95; } }
@media (max-width: 1099px) { .lp-hero { --k: 0.75; } }
@media (max-width: 1000px) {
  .lp-aud { grid-template-columns: 1fr; max-width: 560px; }
}
@media (max-width: 900px) {
  .lp-hero {
    --k: 0.9;
    grid-template-columns: 1fr;
    grid-template-areas: "copy" "fan";
    justify-items: center;
    gap: 36px;
    padding: 40px 20px 0;
  }
  .lp-copy { justify-items: center; text-align: center; padding-bottom: 0; }
  .lp-actions { justify-content: center; }
}
@media (max-width: 680px) {
  .lp-hero { --k: 0.8; }
  .lp-links, .lp-sep { display: none; } /* just the logo and Sign in */
  .lp-nav { padding-left: 14px; gap: 14px; }
}
@media (max-width: 540px) {
  .lp-hero { --k: 0.66; }
  .lp-actions { width: 100%; }
  .lp-actions .btn { flex: 1 1 auto; }
}
@media (max-width: 440px) {
  .lp-hero { --k: 0.54; }
}
</style>