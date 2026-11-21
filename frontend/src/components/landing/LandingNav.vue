<script setup>
// The floating pill at the top: logo, section links, Sign in.
// Under the links sits a MARKER that shows which section you are in.
//   - resting: an underline under the link of the section you are in
//   - hovering another link: the marker shrinks into a DOT and hops over to that link. It stays a dot.
//   - pressing a link: the dot stretches into the underline (it does not shrink and restart)
//   - leaving the nav: the marker goes back under the section you are in
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
let shownEl = null // the link the marker is under right now (or travelling to)
let shape = 'line' // what the marker is (or is turning into): 'line' | 'dot'
let hoverEl = null // the link the mouse (or keyboard focus) is on, if any
let moveAnim = null // the running animation, so a new one can cancel it
let lockUntil = 0 // after clicking a link we ignore scroll-spy while the page glides there
const LINE_SPRING = { type: 'spring', stiffness: 380, damping: 22 } // the stretch into the underline, with a tiny overshoot

const linkOf = (id) => linksEl.value?.querySelector(`[data-sec="${NAV_OF[id] ?? id}"]`) ?? null
const markLinks = (target) =>
  linksEl.value?.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a === target))

// put the marker straight under a link as an underline (no animation): used on resize
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
  shape = 'line'
}

// send the marker to a link, as a 'line' (underline) or a 'dot'
//   dot -> same link, 'line'  : it just stretches (no shrinking first, so pressing never restarts the animation)
//   anything -> another link  : (shrink to a dot if it is a line) -> travel -> (stretch if 'line')
function moveMarker(link, mode = 'line') {
  const ind = indEl.value
  if (!ind) return
  if (!link || !link.offsetWidth) {
    moveAnim?.stop()
    animate(ind, { opacity: 0 }, { duration: 0.2 })
    shownEl = null
    return
  }
  if (link === shownEl && mode === shape) return
  const first = !shownEl || +getComputedStyle(ind).opacity === 0
  const sameLink = link === shownEl
  shownEl = link
  shape = mode
  moveAnim?.stop()
  const toCenter = link.offsetLeft + link.offsetWidth / 2
  const toLine = { left: link.offsetLeft, width: link.offsetWidth, height: 2 }
  if (first) {
    // nothing to hop from: a dot pops in under the link (and stretches if it should be an underline)
    ind.style.left = `${toCenter - DOT / 2}px`
    ind.style.width = `${DOT}px`
    ind.style.height = `${DOT}px`
    const steps = [[ind, { opacity: 1, scale: [0.4, 1] }, { duration: 0.2 }]]
    if (mode === 'line') steps.push([ind, toLine, LINE_SPRING])
    moveAnim = animate(steps)
    return
  }
  const cs = getComputedStyle(ind)
  const left = parseFloat(cs.left)
  const width = parseFloat(cs.width)
  const fromCenter = left + width / 2
  const isDot = width <= DOT + 1 // it is already a dot (or on its way to being one)
  if (sameLink && mode === 'line' && isDot) {
    moveAnim = animate(ind, toLine, LINE_SPRING)
    return
  }
  const steps = []
  // 1. shrink into a dot, right where it is
  if (!isDot) steps.push([ind, { left: fromCenter - DOT / 2, width: DOT, height: DOT }, { duration: 0.16, ease: 'easeIn' }])
  // 2. the dot travels (a little longer for a longer trip)
  if (!sameLink) {
    const dist = Math.abs(toCenter - fromCenter)
    steps.push([ind, { left: toCenter - DOT / 2 }, { duration: Math.min(0.2 + dist / 900, 0.5), ease: [0.65, 0, 0.35, 1] }])
  }
  // 3. only an underline stretches out
  if (mode === 'line') steps.push([ind, toLine, LINE_SPRING])
  moveAnim = animate(steps)
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
  if (!hoverEl) moveMarker(link, 'line') // while you hover the nav the marker stays with your mouse
}

let spyFrame = 0
const onScroll = () => {
  cancelAnimationFrame(spyFrame)
  spyFrame = requestAnimationFrame(spy)
}
const onResize = () => placeMarker(shownEl && linkOf(activeId))

// hovering a link: the marker becomes a dot under it (hovering the link you are already in keeps the underline).
// leaving the nav sends the marker back under the section you are in.
const onOver = (e) => {
  const a = e.target.closest?.('a[data-sec]')
  if (!a) return
  hoverEl = a
  moveMarker(a, a === linkOf(activeId) ? 'line' : 'dot')
}
const onLeave = () => {
  hoverEl = null
  moveMarker(linkOf(activeId), 'line')
}

// a link was clicked anywhere on the page (goTo in lib/landingMotion.js): go straight to that link instead of
// hopping through every section the page scrolls past on the way
const onGoto = (e) => {
  lockUntil = performance.now() + 1100
  activeId = e.detail
  const link = linkOf(activeId)
  markLinks(link)
  moveMarker(link, 'line') // pressed: the dot you were hovering with stretches into the underline
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
        <!-- the marker under the links: a dot while you hover a link, an underline once you press it -->
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