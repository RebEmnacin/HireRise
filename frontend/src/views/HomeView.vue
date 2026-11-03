<script setup>
import LineIcon from '../components/LineIcon.vue'
import JobCard from '../components/JobCard.vue'
import CountUp from '../components/CountUp.vue'
import { jobs } from '../data/jobs'

// the page content is plain data. The template below loops over it with v-for.
const industries = ['Retail', 'Technology', 'Healthcare', 'BPO & Customer Service', 'Logistics', 'Hospitality', 'Finance', 'Education', 'Manufacturing']

const services = [
  { icon: 'search', title: 'Recruitment', text: 'We find, screen and shortlist people who fit your team and your culture.' },
  { icon: 'users', title: 'Onboarding', text: 'A smooth first 90 days so new hires feel ready and stay longer.' },
  { icon: 'shield', title: 'Payroll & compliance', text: 'Accurate pay, benefits and records that keep you audit-ready.' },
  { icon: 'trend', title: 'HR consulting', text: 'Policies, performance reviews and growth plans built around your goals.' },
]

const stats = [
  { to: 1200, suffix: '+', label: 'People placed' },
  { to: 85, suffix: '+', label: 'Partner companies' },
  { to: 14, suffix: ' days', label: 'Average time to hire' },
  { to: 96, suffix: '%', label: 'Still with us after a year' },
]

const steps = [
  { title: 'Tell us what you need', text: 'A 20-minute call to understand your team, goals and timeline.' },
  { title: 'We find and prepare', text: 'We source, screen and shortlist, then handle the paperwork.' },
  { title: 'You grow with confidence', text: 'Onboarding, check-ins and support long after day one.' },
]

const quotes = [
  { name: 'Maria Reyes', role: 'Operations Director', text: 'They filled three roles in a month and every candidate felt like a real fit.', initials: 'MR', coral: false },
  { name: 'Daniel Cruz', role: 'Founder, Retail startup', text: 'Our onboarding finally feels organised. New hires are productive faster.', initials: 'DC', coral: true },
  { name: 'Aisha Tan', role: 'Finance Lead', text: 'Payroll used to be stressful. Now it just works and the records are clean.', initials: 'AT', coral: false },
]

const featured = jobs.slice(0, 3) // first 3 jobs
</script>

<template>
  <!-- ===== HERO ===== -->
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span v-reveal class="eyebrow">HR &amp; recruitment partner</span>
        <h1 v-reveal="0.08">Hire well. Keep them. <em>Help them rise.</em></h1>
        <p v-reveal="0.16" class="lead">HireRise takes care of the people side of your business, from the first interview to the first promotion, so you can focus on the work.</p>
        <div v-reveal="0.24" class="hero-actions">
          <RouterLink class="btn btn-primary" to="/contact">Talk to us &rarr;</RouterLink>
          <RouterLink class="btn btn-outline" to="/jobs">Browse open roles</RouterLink>
        </div>
        <ul v-reveal="0.32" class="hero-points">
          <li>Free first consultation</li><li>Vetted candidates</li><li>Fast turnaround</li>
        </ul>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="float-card one">
          <div class="person"><span class="avatar">JS</span><div><h4>Jamie S. joined</h4><p>Onboarding 80% complete</p></div></div>
          <div class="bar"><span style="--w: 80%"></span></div>
        </div>
        <div class="float-card two">
          <p>Time to hire</p>
          <div class="stat-big">14 days</div>
          <p>down from 38 days</p>
        </div>
        <div class="float-card three">
          <div class="person"><span class="avatar coral">LP</span><div><h4>New application</h4><p>Senior Recruiter (Tech)</p></div></div>
          <div class="bar"><span style="--w: 62%"></span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== INDUSTRY STRIP (list shown twice so the loop has no gap) ===== -->
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      <span v-for="(name, i) in [...industries, ...industries]" :key="i">{{ name }}</span>
    </div>
  </div>

  <!-- ===== SERVICES ===== -->
  <section class="section">
    <div class="container">
      <div v-reveal class="section-head center">
        <span class="eyebrow">What we do</span>
        <h2>Everything HR, handled</h2>
        <p>Pick one service or let us run the whole people function for you.</p>
      </div>
      <div class="card-grid">
        <!-- v-for = repeat this element for every item. :key helps Vue track each one. -->
        <article v-for="(s, i) in services" :key="s.title" v-reveal="i * 0.1" class="card">
          <LineIcon :name="s.icon" />
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ===== NUMBERS ===== -->
  <section class="section band-dark">
    <div class="container stats-grid">
      <div v-for="(s, i) in stats" :key="s.label" v-reveal="i * 0.1">
        <CountUp :to="s.to" :suffix="s.suffix" />
        <p>{{ s.label }}</p>
      </div>
    </div>
  </section>

  <!-- ===== PROCESS ===== -->
  <section class="section">
    <div class="container">
      <div v-reveal class="section-head">
        <span class="eyebrow">How it works</span>
        <h2>Three simple steps</h2>
      </div>
      <div class="steps">
        <div v-for="(s, i) in steps" :key="s.title" v-reveal="i * 0.1" class="step">
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== FEATURED JOBS ===== -->
  <section class="section" style="padding-top: 0">
    <div class="container">
      <div v-reveal class="section-head">
        <span class="eyebrow">Now hiring</span>
        <h2>Featured roles</h2>
      </div>
      <div class="job-list">
        <JobCard v-for="job in featured" :key="job.id" :job="job" />
      </div>
      <p style="margin-top: 28px"><RouterLink class="btn btn-outline" to="/jobs">See all open roles</RouterLink></p>
    </div>
  </section>

  <!-- ===== TESTIMONIALS ===== -->
  <section class="section" style="background: var(--white)">
    <div class="container">
      <div v-reveal class="section-head center">
        <span class="eyebrow">Kind words</span>
        <h2>Teams that trust us</h2>
        <p>Sample testimonials. Replace with real ones.</p>
      </div>
      <div class="card-grid three">
        <figure v-for="(q, i) in quotes" :key="q.name" v-reveal="i * 0.1" class="card quote">
          <blockquote>{{ q.text }}</blockquote>
          <div class="person">
            <span class="avatar" :class="{ coral: q.coral }">{{ q.initials }}</span>
            <div><cite>{{ q.name }}</cite><small>{{ q.role }}</small></div>
          </div>
        </figure>
      </div>
    </div>
  </section>

  <!-- ===== CTA ===== -->
  <section class="section">
    <div class="container">
      <div v-reveal class="cta-band">
        <h2>Ready to build a team you are proud of?</h2>
        <p>Book a free 20-minute call and we will map out your next hires together.</p>
        <RouterLink class="btn btn-light" to="/contact">Book a free call</RouterLink>
      </div>
    </div>
  </section>
</template>
