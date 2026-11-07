<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { errorMessage } from '../api/client'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value) // talks to the FastAPI backend
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false // runs whether it worked or not
  }
}
</script>

<template>
  <div class="login">
    <!-- left: brand panel (hidden on phones) -->
    <section class="login-side">
      <span class="brand"><img class="brand-logo" src="/logo.png" alt="" /><span>Hire<span class="rise">Rise</span></span></span>
      <h2>Everything about your people, <em>in one place.</em></h2>
      <p>Track employee status, attendance, leave and work without the spreadsheets.</p>
      <ul class="login-points">
        <li>Live headcount and attendance</li>
        <li>Leave requests with one-click approval</li>
        <li>Tasks and deadlines for every team</li>
      </ul>
    </section>

    <!-- right: the form -->
    <section class="login-form-wrap">
      <form class="login-form" @submit.prevent="submit">
        <h1>Sign in</h1>
        <p>Use the account HR created for you.</p>

        <div v-if="error" class="alert" role="alert">{{ error }}</div>

        <div class="field">
          <label for="email">Work email</label>
          <input id="email" v-model="email" type="email" autocomplete="username" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required />
        </div>

        <button class="btn btn-primary" type="submit" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
        <p class="login-note">Forgot your password? Ask HR to reset it.</p>
      </form>
    </section>
  </div>
</template>
