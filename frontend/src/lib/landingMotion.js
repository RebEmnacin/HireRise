// Shared motion helpers for the landing page (used by every section in components/landing/).
import { animate, scroll } from 'motion'

/** A spring config: stiffness = how hard it pulls, damping = how quickly it stops bouncing. */
export const spring = (stiffness, damping, extra = {}) => ({ type: 'spring', stiffness, damping, ...extra })

/**
 * "Reduced motion" is an operating-system setting (on Windows: Settings > Accessibility > Visual effects >
 * Animation effects). When it is on, the sections keep things gentle: quick fades and a plain fan-out, no parallax.
 * It is never fully switched off, so the page still feels alive.
 */
export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const gentle = { duration: 0.6, ease: 'easeOut' }

/**
 * SMOOTH scroll-linking. A plain scroll() animation jumps to a new frame for every wheel tick, so it looks steppy.
 * Here the scrollbar only sets a TARGET (0 to 1). A small loop then glides the animation toward that target
 * a little more every frame (exponential easing, "10" = how snappy it follows, higher = tighter).
 *
 * apply(progress)  is called with the smoothed 0..1 value
 * options          the same { target, offset } object motion's scroll() takes
 * once             true = progress only moves FORWARD, so an animation that has played stays finished when you
 *                  scroll back up (until the page is refreshed). false = it follows the scrollbar both ways.
 * returns          a function that switches it off
 */
export function smoothScroll(apply, options, once = true) {
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

/** Like smoothScroll, but drives a motion animation (keyframes such as { y: [60, 0] }) instead of a callback. */
export function smoothAnimate(el, keyframes, options, once = true) {
  const anim = animate(el, keyframes, { ease: 'linear', duration: 1 })
  anim.pause()
  return smoothScroll(
    (p) => {
      anim.time = p * anim.duration
    },
    options,
    once,
  )
}

/**
 * SCRUBBED entrance: the animation moves exactly as far as you scroll, from `keyframes` to the normal pose.
 *   offset = [when it starts, when it finishes], each written "<element edge> <viewport edge>"
 *   target = the element whose position is measured (default: the element itself)
 */
export const scrub = (el, keyframes, offset = ['start end', 'center 0.7'], target = el) =>
  smoothAnimate(el, keyframes, { target, offset })

/**
 * Smooth-scroll to a section by id. A plain <a href="#x"> would be picked up by the router
 * (its scrollBehavior sends every navigation back to the top), so we scroll by hand instead.
 * It also tells the nav (see LandingNav.vue) which link was clicked, so its marker goes straight there.
 */
export function goTo(id) {
  window.dispatchEvent(new CustomEvent('lp:goto', { detail: id }))
  document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
}