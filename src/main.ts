import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

// Initialize Pinia first
const pinia = createPinia()
app.use(pinia)

// Initialize auth state before mounting app
// This ensures auth state is ready before router guards execute
const authStore = useAuthStore()
authStore.initAuth().then(() => {
  // Mount app after auth is initialized
  app.use(router)
  app.mount('#app')
})
