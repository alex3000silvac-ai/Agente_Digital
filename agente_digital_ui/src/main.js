import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupGlobalErrorHandler } from './utils/errorHandler'

// Importa tus archivos CSS originales directamente
import './assets/base.css'
import './assets/main.css'

// Configurar manejador global de errores
setupGlobalErrorHandler()

// Agregar Font Awesome CSS globalmente si no está ya incluido
if (!document.querySelector('link[href*="font-awesome"]')) {
  const fontAwesome = document.createElement('link')
  fontAwesome.rel = 'stylesheet'
  fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
  document.head.appendChild(fontAwesome)
}

const app = createApp(App)

// Configurar manejo de errores en Vue
app.config.errorHandler = (err, instance, info) => {
  // Ignorar errores de extensiones
  if (err.message && err.message.includes('listener indicated an asynchronous response')) {
    return
  }
  console.error('Vue Error:', err, info)
}

app.use(createPinia())
app.use(router)

app.mount('#app')