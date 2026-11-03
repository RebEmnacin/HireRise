<script setup>
import LineIcon from '../components/LineIcon.vue'

const values = [
  { icon: 'heart', title: 'People first', text: 'Every decision starts with how it affects the person on the other side.' },
  { icon: 'shield', title: 'Honest and clear', text: 'Plain answers, fair terms and no surprises in the fine print.' },
  { icon: 'trend', title: 'Built to last', text: 'We care about the one-year mark, not just the first day.' },
]
const milestones = [
  { year: '2019', text: 'Founded with a team of three and our first five clients.' },
  { year: '2021', text: 'Added payroll and compliance services.' },
  { year: '2023', text: 'Reached 1,000 successful placements.' },
  { year: '2026', text: 'Launched HR consulting for fast-growing teams.' },
]
const team = [
  { name: 'Ana Dela Cruz', role: 'Founder & CEO', initials: 'AD', coral: false },
  { name: 'Marco Santos', role: 'Head of Recruitment', initials: 'MS', coral: true },
  { name: 'Lea Ramos', role: 'People Operations', initials: 'LR', coral: false },
  { name: 'Paolo Reyes', role: 'Payroll Lead', initials: 'PR', coral: true },
]
</script>

<template>
  <section class="page-hero">
    <div class="container">
      <h1>About HireRise</h1>
      <p>Hire the right people, then help them rise. That one idea shapes everything we do for candidates and companies.</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div v-reveal class="section-head">
        <span class="eyebrow">Our story</span>
        <h2>HR that feels human</h2>
        <p>We started because hiring and HR felt cold on both sides of the table. HireRise is a small team that treats candidates like people and companies like partners. (Sample copy. Replace with your own story.)</p>
      </div>
    </div>
  </section>

  <section class="section" style="background: var(--white)">
    <div class="container">
      <div v-reveal class="section-head center"><span class="eyebrow">What we care about</span><h2>Our values</h2></div>
      <div class="card-grid three">
        <article v-for="(v, i) in values" :key="v.title" v-reveal="i * 0.1" class="card">
          <LineIcon :name="v.icon" />
          <h3>{{ v.title }}</h3>
          <p>{{ v.text }}</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div v-reveal class="section-head center"><span class="eyebrow">Milestones</span><h2>Our journey</h2></div>
      <ul class="timeline">
        <li v-for="m in milestones" :key="m.year" v-reveal>
          <strong>{{ m.year }}</strong>
          <p>{{ m.text }}</p>
        </li>
      </ul>
    </div>
  </section>

  <section class="section" style="background: var(--white)">
    <div class="container">
      <div v-reveal class="section-head center">
        <span class="eyebrow">The team</span><h2>Meet the people</h2>
        <p>Placeholder names and initials. Swap in real photos later.</p>
      </div>
      <div class="card-grid">
        <div v-for="(p, i) in team" :key="p.name" v-reveal="i * 0.08" class="card team">
          <span class="avatar big" :class="{ coral: p.coral }">{{ p.initials }}</span>
          <h3 style="margin-top: 0">{{ p.name }}</h3>
          <p>{{ p.role }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
