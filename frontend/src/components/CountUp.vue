<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  to: { type: Number, required: true },
  suffix: { type: String, default: '' },
})

const shown = ref(0)
const el = ref(null) // el.value will be the real <div> once it is on the page (see ref="el" below)
let observer

function run() {
  const start = performance.now()
  const duration = 1600
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1)
    shown.value = Math.round(props.to * (1 - Math.pow(1 - t, 3))) // starts fast, ends slow
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        run()
        observer.disconnect()
      }
    },
    { threshold: 0.6 }
  )
  observer.observe(el.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="el" class="num">{{ shown.toLocaleString() }}{{ suffix }}</div>
</template>
