<script setup>
// The landing page is only an ASSEMBLY of sections. Each one lives in components/landing/ with its own
// template, animation and styles; the wording is in data/landing.js and the shared motion helpers in lib/landingMotion.js.
import { onMounted, onBeforeUnmount } from 'vue'
import { animate, press } from 'motion'
import { spring } from '../lib/landingMotion'
import '../components/landing/landing-base.css' // the page background, colour variables and buttons
import LandingNav from '../components/landing/LandingNav.vue'
import LandingHero from '../components/landing/LandingHero.vue'
import LandingRoles from '../components/landing/LandingRoles.vue'
import LandingHow from '../components/landing/LandingHow.vue'
import LandingStack from '../components/landing/LandingStack.vue'
import LandingFaq from '../components/landing/LandingFaq.vue'
import LandingFooter from '../components/landing/LandingFooter.vue'

// buttons squash a little while pressed
let stopPress
onMounted(() => {
  stopPress = press('.lp .btn', (el) => {
    animate(el, { scale: 0.95 }, spring(500, 30))
    return () => animate(el, { scale: 1 }, spring(500, 22))
  })
})
onBeforeUnmount(() => stopPress?.())
</script>

<template>
  <div id="top" class="lp">
    <LandingNav />
    <LandingHero />
    <LandingRoles />
    <LandingHow />
    <LandingStack />
    <LandingFaq />
    <LandingFooter />
  </div>
</template>