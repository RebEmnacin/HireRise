import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import reveal from './directives/reveal'
import './assets/style.css'

const app = createApp(App)
app.use(createPinia()) // Pinia = the shared stores (login session, HR data)
app.use(router) // gives every component <RouterLink> and <RouterView>
app.directive('reveal', reveal) // lets us write v-reveal on any element
app.mount('#app')
