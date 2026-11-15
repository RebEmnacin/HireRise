<script setup>
// The floating pill at the top: logo, section links, Sign in.
// Under the links sits a MARKER that shows which section you are in. When you move to another section (or hover
// another link) it shrinks into a dot, hops across and stretches back into an underline.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { animate } from 'motion'
import { spring, gentle, reduced, goTo } from '../../lib/landingMotion'

const navEl = ref(null)
const linksEl = ref(null)
const indEl = ref(null)
const SECTIONS = ['features', 'roles', 'how', 'stack', 'faq'] // top to bottom ("stack" has no link of its own)
const NAV_OF = { stack: 'how' } // so while you are in "Built with" the marker stays under "How it works"
const DOT = 6 // px: the size of the dot while travelling
let activeId = '' // the section you are in (from scrolling)
let shownEl = null // the link the marker is under right now
let moveAnim = null // the running hop, so a new hop can cancel it
let lockUntil = 0 // after clicking a link we ignore scroll-spy while the page glides there

const linkOf = (id) => linksEl.value?.querySelector(`[data-sec="${NAV_OF[id] ?? id}"]`) ?? null
const markLinks = (target) =>
  linksEl.value?.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a === target))

// put the marker straight under a link (no animation): used on resize
function placeMarker(link) {
  const ind = indEl.value
  moveAnim?.stop()
  if (!link || !link.offsetWidth) {
    ind.style.opacity = 0
    shownEl = null
    return
  }
  ind.style.cssText += `;left:${link.offsetLeft}px;width:${link.offsetWidth}px;height:2px;opacity:1`
  shownEl = link
}

// move the marker to a link: underline -> dot -> travel -> underline
function moveMarker(link) {
  const ind = indEl.value
  if (!ind || link === shownEl) return
  if (!link || !link.offsetWidth) {
    moveAnim?.stop()
    animate(ind, { opacity: 0 }, { duration: 0.2 })
    shownEl = null
    return
  }
  const first = !shownEl || +getComputedStyle(ind).opacity === 0
  shownEl = link
  moveAnim?.stop()
  const toCenter = link.offsetLeft + link.offsetWidth / 2
  if (first) {
    // nothing to hop from: a dot pops in under the link, then stretches into the underline
    ind.style.left = `${toCenter - DOT / 2}px`
    ind.style.width = `${DOT}px`
    ind.style.height = `${DOT}px`
    moveAnim = animate([
      [ind, { opacity: 1, scale: [0.4, 1] }, { duration: 0.2 }],
      [ind, { left: link.offsetLeft, width: link.offsetWidth, height: 2 }, { duration: 0.28, ease: [0.22, 1, 0.36, 1] }],
    ])
    return
  }
  const left = parseFloat(getComputedStyle(ind).left)
  const width = parseFloat(getComputedStyle(ind).width)
  const fromCenter = left + width / 2
  const dist = Math.abs(toCenter - fromCenter)
  moveAnim = animate([
    // 1. shrink into a dot, right where it is
    [ind, { left: fromCenter - DOT / 2, width: DOT, height: DOT }, { duration: 0.16, ease: 'easeIn' }],
    // 2. the dot travels (a little longer for a longer trip)
    [ind, { left: toCenter - DOT / 2 }, { duration: Math.min(0.2 + dist / 900, 0.5), ease: [0.65, 0, 0.35, 1] }],
    // 3. it lands and stretches into the underline, with a tiny overshoot
    [ind, { left: link.offsetLeft, width: link.offsetWidth, height: 2 }, { type: 'spring', stiffness: 380, damping: 22 }],
  ])
}

// which section are we in? the last one whose top has passed 40% of the way down the screen
function spy() {
  if (performance.now() < lockUntil) return
  let cur = ''
  for (const id of SECTIONS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = id
  }
  if (cur === activeId) return
  activeId = cur
  const link = linkOf(cur)
  markLinks(link)
  moveMarker(link)
}

let spyFrame = 0
const onScroll = () => {
  cancelAnimationFrame(spyFrame)
  spyFrame = requestAnimationFrame(spy)
}
const onResize = () => placeMarker(shownEl && linkOf(activeId))

// hovering a link: the marker hops over to it; leaving the nav sends it back to the section you are in
const onOver = (e) => {
  const a = e.target.closest?.('a[data-sec]')
  if (a) moveMarker(a)
}
const onLeave = () => moveMarker(linkOf(activeId))

// a link was clicked anywhere on the page (goTo in lib/landingMotion.js): go straight to that link instead of
// hopping through every section the page scrolls past on the way
const onGoto = (e) => {
  lockUntil = performance.now() + 1100
  activeId = e.detail
  const link = linkOf(activeId)
  markLinks(link)
  moveMarker(link)
  setTimeout(spy, 1150)
}

onMounted(() => {
  // the pill drops in from above
  const rm = reduced()
  animate(navEl.value, rm ? { opacity: [0, 1] } : { opacity: [0, 1], y: [-24, 0] }, rm ? gentle : spring(180, 20))

  const nav = linksEl.value
  nav.addEventListener('mouseover', onOver)
  nav.addEventListener('mouseleave', onLeave)
  nav.addEventListener('focusin', onOver)
  nav.addEventListener('focusout', onLeave)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('lp:goto', onGoto)
  spy()
})

onBeforeUnmount(() => {
  moveAnim?.stop()
  cancelAnimationFrame(spyFrame)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('lp:goto', onGoto)
})
</script>

<template>
  
    <header ref="navEl" class="lp-nav">
      <RouterLink to="/" class="brand">
        <img class="brand-logo" src="/logo.png" alt="" />
        <span>Hire<span class="rise">Rise</span></span>
      </RouterLink>
      <i class="lp-sep" aria-hidden="true"></i>
      <nav ref="linksEl" class="lp-links" aria-label="Page sections">
        <a href="#features" data-sec="features" @click.prevent="goTo('features')">Features</a>
        <a href="#roles" data-sec="roles" @click.prevent="goTo('roles')">Who it's for</a>
        <a href="#how" data-sec="how" @click.prevent="goTo('how')">How it works</a>
        <a href="#faq" data-sec="faq" @click.prevent="goTo('faq')">FAQ</a>
        <!-- the marker under the links: an underline that shrinks to a dot, hops to the next link, and stretches back -->
        <i ref="indEl" class="lp-ind" aria-hidden="true"></i>
      </nav>
      <RouterLink :to="{ name: 'login' }" class="btn lp-btn lp-btn-accent lp-nav-cta">Sign in</RouterLink>
    </header>
</template>

<style>
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
  position: relative;
  display: flex;
  gap: clamp(12px, 2vw, 22px);
  font-size: 0.88rem;
  font-weight: 600;
}
.lp-links a {
  color: rgba(255, 255, 255, 0.76);
  transition: color 0.2s;
}
.lp-links a:hover,
.lp-links a.on {
  color: var(--white);
}
/* the marker: an underline that turns into a dot while it hops between links (all sizes are set by the script) */
.lp-ind {
  position: absolute;
  bottom: -7px;
  left: 0;
  width: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--lp-accent);
  opacity: 0;
  pointer-events: none;
}
.lp .lp-nav-cta {
  padding: 8px 18px;
  font-size: 0.88rem;
}

/* hidden until the script drops it in */
.lp-nav {
  opacity: 0;
}
@media (max-width: 680px) {
  .lp-links, .lp-sep { display: none; } /* just the logo and Sign in */
  .lp-nav { padding-left: 14px; gap: 14px; }
}
</style>