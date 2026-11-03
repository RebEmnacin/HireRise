<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <RouterLink class="brand" to="/"><span class="brand-mark">H</span><span>Hire<span class="rise">Rise</span></span></RouterLink>
          <p style="margin-top: 14px; max-width: 300px">People-first HR and recruitment for growing companies.</p>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/jobs">Open roles</RouterLink></li>
            <li><RouterLink to="/contact">Contact</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul><li>Recruitment</li><li>Onboarding</li><li>Payroll &amp; benefits</li><li>HR consulting</li></ul>
        </div>
        <div>
          <h4>Reach us</h4>
          <ul><li>hello@hirerise.example</li><li>+63 900 000 0000</li><li>Makati City, Philippines</li></ul>
        </div>
      </div>
      <p class="copyright">&copy; {{ year }} HireRise. Prototype with sample content.</p>
    </div>
  </footer>
</template>
