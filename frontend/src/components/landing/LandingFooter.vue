<script setup>
// The dark footer sheet: links, source code, and a big wordmark that zooms in and tips upright as the page runs out.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { scrub, goTo } from '../../lib/landingMotion'

const footEl = ref(null)
const year = new Date().getFullYear()
const stops = []

onMounted(() => {
  try {
    stops.push(scrub(footEl.value.querySelector('.lp-foot-word'), { scale: [0.62, 1], rotateX: [42, 0], y: [90, 0] }, ['start end', 'end end'], footEl.value))
    stops.push(scrub(footEl.value.querySelector('.lp-foot-cols'), { y: [60, 0] }, ['start end', 'center end'], footEl.value))
  } catch (err) {
    console.warn('footer animation failed, showing it without it', err)
  }
})

onBeforeUnmount(() => stops.forEach((stop) => stop()))
</script>

<template>
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
        <a href="#features" @click.prevent="goTo('features')">Features</a>
        <a href="#roles" @click.prevent="goTo('roles')">Who it's for</a>
        <a href="#how" @click.prevent="goTo('how')">How it works</a>
        <a href="#stack" @click.prevent="goTo('stack')">Built with</a>
        <a href="#faq" @click.prevent="goTo('faq')">FAQ</a>
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
      <button type="button" class="lp-top" @click="goTo('top')">
        Back to top
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
      </button>
    </div>
  </footer>
</template>

<style>
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
  .lp-foot-cols { grid-template-columns: 1fr 1fr; }
  .lp-foot-brand { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .lp-foot { border-radius: 36px 36px 0 0; margin-top: -36px; }
}
</style>