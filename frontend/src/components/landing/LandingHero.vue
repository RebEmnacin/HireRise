<script setup>
// The first screen: headline, text and buttons on the right, the hand of cards (LandingFan) on the left.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { animate, stagger } from 'motion'
import LandingFan from './LandingFan.vue'
import { spring, gentle, reduced, smoothAnimate, goTo } from '../../lib/landingMotion'

const heroEl = ref(null)
const copyEl = ref(null)
const fan = ref(null)
const stops = [] // scroll listeners, switched off when the page is left

onMounted(() => {
  const rm = reduced()
  try {
    // the headline, text and buttons rise one after another
    animate(
      [...copyEl.value.children],
      rm ? { opacity: [0, 1] } : { opacity: [0, 1], y: [40, 0] },
      rm
        ? { ...gentle, delay: stagger(0.1, { startDelay: 0.1 }) }
        : spring(90, 16, { delay: stagger(0.16, { startDelay: 0.2 }) }),
    )
    // scrolling away: the text drifts up and fades, the hand sinks into the page below
    // (the last "false" = it follows the scrollbar both ways, so it comes back when you scroll up)
    if (!rm) {
      const heroRange = { target: heroEl.value, offset: ['start start', 'end start'] }
      stops.push(smoothAnimate(copyEl.value, { y: [0, -70], opacity: [1, 0.15] }, heroRange, false))
      stops.push(smoothAnimate(fan.value.pan, { y: [0, 90] }, heroRange, false))
    }
  } catch (err) {
    console.warn('hero animation failed, showing it without it', err)
    ;[...copyEl.value.children].forEach((el) => (el.style.opacity = 1))
  }
})

onBeforeUnmount(() => stops.forEach((stop) => stop()))
</script>

<template>
  <section ref="heroEl" class="lp-hero">
    <div ref="copyEl" class="lp-copy">
      <h1 class="lp-title">Every employee, every day, <em>in one place.</em></h1>
      <p class="lp-sub">Track employee status, attendance, leave and work without the spreadsheets.</p>
      <div class="lp-actions">
        <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent">
          Get started
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </RouterLink>
        <a href="#roles" class="btn lp-btn lp-btn-ghost" @click.prevent="goTo('roles')">Learn more</a>
      </div>
    </div>
    <LandingFan ref="fan" />
  </section>
</template>

<style>
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
/* hidden until the script brings them in */
.lp-copy > * {
  opacity: 0;
}

/* ---- smaller screens: the hand shrinks, then moves below the text ---- */
@media (max-width: 1439px) { .lp-hero { --k: 1.15; } }
@media (max-width: 1279px) { .lp-hero { --k: 0.95; } }
@media (max-width: 1099px) { .lp-hero { --k: 0.75; } }
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