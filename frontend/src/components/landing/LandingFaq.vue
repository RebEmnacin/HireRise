<script setup>
// FAQ: a white sheet that zooms in, and questions that swing in from alternate sides like doors. One answer open at a time.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { scrub } from '../../lib/landingMotion'
import { faq } from '../../data/landing'

const faqEl = ref(null)
const openQ = ref(0)
const stops = []

onMounted(() => {
  try {
    stops.push(scrub(faqEl.value.querySelector('.lp-faq-sheet'), { scale: [0.86, 1], y: [60, 0] }, ['start end', 'start 0.25']))
    faqEl.value.querySelectorAll('.lp-q').forEach((el, i) =>
      // done when the top is 88% down, so the lowest question is flat as soon as it shows
      stops.push(scrub(el, { x: [i % 2 ? 140 : -140, 0], rotateY: [i % 2 ? -26 : 26, 0] }, ['start end', 'start 0.88'])),
    )
  } catch (err) {
    console.warn('faq animation failed, showing it without it', err)
  }
})

onBeforeUnmount(() => stops.forEach((stop) => stop()))
</script>

<template>
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
</template>

<style>
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
@media (max-width: 560px) {
  .lp-faq-sheet { border-radius: 36px 36px 0 0; }
}
</style>