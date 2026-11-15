<script setup>
// "Built with": the whole panel zooms out from a big, tilted-back view, then each card slides in from its own side.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { inView } from 'motion'
import LineIcon from '../LineIcon.vue'
import { scrub } from '../../lib/landingMotion'
import { stack } from '../../data/landing'

const stackEl = ref(null)
const stops = []

onMounted(() => {
  try {
    stops.push(scrub(stackEl.value.querySelector('.lp-stack-panel'), { scale: [1.3, 1], rotateX: [-16, 0], y: [90, 0] }, ['start end', 'start 0.2']))
    const techEls = [...stackEl.value.querySelectorAll('.lp-tech')]
    techEls.forEach((el, i) =>
      stops.push(scrub(el, { x: [i % 2 ? 110 : -110, 0], y: [70, 0], rotateZ: [i % 2 ? 7 : -7, 0] }, ['start end', 'center 0.8'])),
    )
    // the line icons draw themselves once their card comes into view
    stops.push(inView(techEls, (el) => { el.classList.add('in') }, { amount: 0.4 }))
  } catch (err) {
    console.warn('built-with animation failed, showing it without it', err)
  }
})

onBeforeUnmount(() => stops.forEach((stop) => stop()))
</script>

<template>
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
</template>

<style>
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
@media (max-width: 1000px) {
  .lp-tech-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .lp-tech-grid { grid-template-columns: 1fr; }
}
</style>