<script setup>
// The "hand of cards" in the hero: six little pieces of the real app that start as a stack and fan out like an UNO hand.
import { ref, onMounted } from 'vue'
import { animate } from 'motion'
import { spring, gentle, reduced } from '../../lib/landingMotion'
import { people, week, roles } from '../../data/landing'

const fanEl = ref(null)
const pan = ref(null) // the wrapper the hero moves for its scroll parallax (LandingHero.vue)
defineExpose({ pan })

onMounted(() => {
  const tiles = [...fanEl.value.querySelectorAll('.lp-tile')]
  const angle = (i) => (i - (tiles.length - 1) / 2) * 11 // the fan: 11 degrees between cards
  const rm = reduced()
  try {
    // the cards start as one stack and spread into the fan in a single spring. There is no fade at all:
    // the cards are solid from the first frame, only their angle and position change.
    tiles.forEach((el, i) => {
      const delay = 0.15 + i * 0.06
      if (rm) {
        animate(el, { rotate: [angle(i) * 0.4, angle(i)] }, { ...gentle, duration: 0.8, delay })
        return
      }
      animate(el, { rotate: [0, angle(i)], y: [40, 0] }, spring(70, 13, { delay }))
    })
  } catch (err) {
    console.warn('card fan animation failed, showing the cards without it', err)
    tiles.forEach((el, i) => {
      el.style.transform = `rotate(${angle(i)}deg)`
    })
  }
})
</script>

<template>
    <div id="features" class="lp-fan-wrap" aria-label="What HireRise does">
      <div ref="pan" class="lp-fan-pan">
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
</template>

<style>
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
</style>