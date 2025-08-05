<template>
  <div class="app-container">
    <aside class="sidebar">
      <div>
        <div class="sidebar-header">
          <div class="logo-icon-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.471A9.003 9.003 0 1012 21a9.003 9.003 0 008.369-5.39V12m-10 6h.01M12 6h.01M6 12h.01M7.5 16h.01M3 8h.01M16 8h.01M21 12h.01M12 3h.01M12 21h.01"></path></svg>
          </div>
          <div>
            <h1 class="logo-title">Jurídica Digital SPA</h1>
            <p class="logo-subtitle">Agente Digital</p>
          </div>
        </div>
        <nav>
          <ul class="sidebar-nav">
            <li>
              <router-link :to="{ name: 'dashboard' }" class="nav-link">
                <span>❖ Panel Principal</span>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'supervisar' }" class="nav-link">
                <span>👥 Supervisar Inquilinos</span>
              </router-link>
            </li>
            </ul>
        </nav>
      </div>
      <div class="sidebar-footer">
        <a @click="handleLogout" href="#" class="nav-link">Cerrar Sesión</a>
      </div>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
    
    <!-- Sistema de Notificaciones Global -->
    <ToastNotification ref="globalToastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router'
import ToastNotification from '../components/ToastNotification.vue'
import { useToast } from '../composables/useToast.js'

const authStore = useAuthStore();
const router = useRouter();

// Sistema de notificaciones global
const { registerToast } = useToast()
const globalToastRef = ref(null)

onMounted(() => {
  // Registrar instancia global del sistema de notificaciones
  if (globalToastRef.value) {
    registerToast(globalToastRef.value)
  }
})

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>