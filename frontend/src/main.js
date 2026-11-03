import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import reveal from './directives/reveal'
import './assets/style.css'

const app = createApp(App)
app.use(router) // gives every component <RouterLink> and <RouterView>
app.directive('reveal', reveal) // lets us write v-reveal on any element
app.mount('#app')
