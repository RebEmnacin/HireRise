<script setup>
// "How it works": the dark sheet rounds over the white one; the title zooms out, three panels swing in from the
// sides and fill the line that links them.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { inView } from 'motion'
import LineIcon from '../LineIcon.vue'
import { scrub } from '../../lib/landingMotion'
import { steps } from '../../data/landing'

const howEl = ref(null)
const stops = []

onMounted(() => {
  try {
    stops.push(scrub(howEl.value.querySelector('.lp-h2'), { scale: [1.5, 1], y: [70, 0] }, ['start end', 'start 0.55']))
    const stepEls = [...howEl.value.querySelectorAll('.lp-step')]
    const from = [
      { x: [-240, 0], rotateY: [42, 0], rotateX: [14, 0], scale: [0.8, 1] },
      { y: [170, 0], rotateX: [32, 0], scale: [0.7, 1] },
      { x: [240, 0], rotateY: [-42, 0], rotateX: [14, 0], scale: [0.8, 1] },
    ]
    stepEls.forEach((el, i) => stops.push(scrub(el, from[i])))
    stops.push(scrub(howEl.value.querySelector('.lp-how-line i'), { scaleX: [0, 1] }, ['start 0.9', 'end 0.55'], howEl.value.querySelector('.lp-steps')))
    // the line icons draw themselves once their panel comes into view
    stops.push(inView(stepEls, (el) => { el.classList.add('in') }, { amount: 0.4 }))
  } catch (err) {
    console.warn('how-it-works animation failed, showing it without it', err)
  }
})

onBeforeUnmount(() => stops.forEach((stop) => stop()))
</script>

<template>
  <section id="how" ref="howEl" class="lp-how" aria-label="How HireRise works">
    <h2 class="lp-h2">Three steps, <em>zero spreadsheets.</em></h2>
    <div class="lp-steps">
      <div class="lp-how-line" aria-hidden="true"><i></i></div>
      <article v-for="s in steps" :key="s.title" class="lp-step" :class="s.tone">
        <LineIcon :name="s.icon" />
        <h3>{{ s.title }}</h3>
        <p>{{ s.text }}</p>
      </article>
    </div>
  </section>
</template>

<style>
/* ---- how it works: the dark sheet rounds over the bottom of the white one ---- */
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
  min-height: 250px;
  padding: 26px;
  border-radius: 20px;
  box-shadow: -6px 12px 34px rgba(6, 22, 42, 0.38);
  will-change: transform;
}
.lp-step.t-dark { background: var(--lp-dark); color: var(--white); }
.lp-step.t-light { background: var(--lp-light); color: var(--lp-ink); }
.lp-step.t-blue { background: var(--lp-blue); color: var(--lp-ink); }
.lp-step .icon-wrap { display: inline-grid; width: 46px; height: 46px; place-items: center; border-radius: 12px; background: rgba(127, 150, 180, 0.2); }
.lp-step .icon-wrap svg { width: 24px; height: 24px; }
.lp-step h3 { font-family: var(--lp-serif); font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; }
.lp-step p { font-size: 0.95rem; line-height: 1.55; opacity: 0.82; }
@media (max-width: 1000px) {
  .lp-steps { grid-template-columns: 1fr; max-width: 520px; }
  .lp-how-line { display: none; }
}
@media (max-width: 560px) {
  .lp-how { border-radius: 36px 36px 0 0; margin-top: -36px; }
}
</style>