<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import LineIcon from '../components/LineIcon.vue'

// reactive() = like ref() but for an object. form.name, form.email... are all reactive.
const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' })
const errors = reactive({ name: '', email: '', phone: '', subject: '', message: '' })
const sent = ref(false)

// the Jobs page "Apply" button links here with ?role=Title, so pre-fill the form
const role = useRoute().query.role
if (role) {
  form.subject = 'Job application'
  form.message = `Hi, I'd like to apply for the ${role} role.\n\n`
}

// one rule per field: returns an error message, or '' when the value is fine
const rules = {
  name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email.'),
  phone: (v) => (!v || /^[+\d][\d\s-]{6,}$/.test(v) ? '' : 'Use digits only, e.g. +63 912 345 6789.'),
  subject: (v) => (v ? '' : 'Please choose a topic.'),
  message: (v) => (v.trim().length >= 10 ? '' : 'Tell us a little more (at least 10 characters).'),
}

function check(field) {
  errors[field] = rules[field](form[field])
  return !errors[field]
}

function submit() {
  // run every check, then require them all to pass
  const ok = Object.keys(rules).map(check).every(Boolean)
  if (!ok) return
  // prototype: nothing is sent yet. Later: fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })
  Object.keys(form).forEach((k) => (form[k] = ''))
  sent.value = true
}
</script>

<template>
  <section class="page-hero">
    <div class="container">
      <h1>Let's talk</h1>
      <p>Tell us what you need or which role you are applying for. We reply within one business day.</p>
    </div>
  </section>

  <section class="section" style="padding-top: 56px">
    <div class="container form-grid">
      <!-- @submit.prevent = on submit, run submit() and stop the page from reloading.
           novalidate = use our own messages instead of the browser's. -->
      <form v-reveal class="form-card" novalidate @submit.prevent="submit">
        <div class="field-row">
          <div class="field" :class="{ invalid: errors.name }">
            <label for="name">Full name</label>
            <input id="name" v-model="form.name" type="text" autocomplete="name" @blur="check('name')" />
            <p class="error-msg">{{ errors.name }}</p>
          </div>
          <div class="field" :class="{ invalid: errors.email }">
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" autocomplete="email" @blur="check('email')" />
            <p class="error-msg">{{ errors.email }}</p>
          </div>
        </div>

        <div class="field-row">
          <div class="field" :class="{ invalid: errors.phone }">
            <label for="phone">Phone (optional)</label>
            <input id="phone" v-model="form.phone" type="tel" autocomplete="tel" @blur="check('phone')" />
            <p class="error-msg">{{ errors.phone }}</p>
          </div>
          <div class="field" :class="{ invalid: errors.subject }">
            <label for="subject">Topic</label>
            <select id="subject" v-model="form.subject" @blur="check('subject')">
              <option value="">Choose one</option>
              <option>Hiring for my company</option>
              <option>Job application</option>
              <option>Payroll &amp; compliance</option>
              <option>HR consulting</option>
              <option>Something else</option>
            </select>
            <p class="error-msg">{{ errors.subject }}</p>
          </div>
        </div>

        <div class="field" :class="{ invalid: errors.message }">
          <label for="message">Message</label>
          <textarea id="message" v-model="form.message" @blur="check('message')"></textarea>
          <p class="error-msg">{{ errors.message }}</p>
        </div>

        <button class="btn btn-primary" type="submit">Send message</button>
        <p class="form-success" :class="{ show: sent }" role="status">Thanks! Your message is ready. (Prototype: nothing is sent yet, a backend comes later.)</p>
      </form>

      <div class="info-list">
        <div v-reveal class="info-item"><LineIcon name="mail" /><div><h4>Email</h4><p>hello@hirerise.example</p></div></div>
        <div v-reveal="0.1" class="info-item"><LineIcon name="pin" /><div><h4>Office</h4><p>Makati City, Philippines</p></div></div>
        <div v-reveal="0.2" class="info-item"><LineIcon name="clock" /><div><h4>Hours</h4><p>Mon to Fri, 9:00 AM to 6:00 PM</p></div></div>
      </div>
    </div>
  </section>
</template>
