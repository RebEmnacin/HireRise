<script setup>
// "Who it's for": a white sheet that grows to full width as you scroll to it, then its content springs up.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { animate, stagger } from 'motion'
import { spring, gentle, reduced, smoothScroll } from '../../lib/landingMotion'
import { audiences } from '../../data/landing'

const rolesEl = ref(null)
const stops = []

onMounted(() => {
  const rm = reduced()
  try {
    // the sheet grows as it scrolls in (--p goes 0 to 1), and its content springs up once the sheet is mostly there
    let revealed = false
    const reveal = () => {
      revealed = true
      animate(
        rolesEl.value.querySelectorAll('[data-r]'),
        rm ? { opacity: [0, 1] } : { opacity: [0, 1], y: [40, 0] },
        rm ? { ...gentle, delay: stagger(0.08) } : spring(110, 18, { delay: stagger(0.1) }),
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
  } catch (err) {
    console.warn('roles animation failed, showing it without it', err)
    rolesEl.value.style.setProperty('--p', 1)
    rolesEl.value.querySelectorAll('[data-r]').forEach((el) => (el.style.opacity = 1))
  }
})

onBeforeUnmount(() => stops.forEach((stop) => stop()))
</script>

<template>
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
</template>

<style>
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
.lp-roles { padding-bottom: clamp(120px, 16vh, 170px); } /* room for the dark sheet that overlaps the bottom */
/* hidden until the script brings them in */
.lp [data-r] {
  opacity: 0;
}
@media (max-width: 1000px) {
  .lp-aud { grid-template-columns: 1fr; max-width: 560px; }
}
</style>