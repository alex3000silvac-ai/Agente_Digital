<template>
  <div class="app-container">
    <aside v-if="authStore.isAuthenticated && $route.name !== 'Login'" class="sidebar">
      <div>
        <div class="sidebar-header">
          <div class="logo-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.602-.36-3.112-1.004-4.426M6.75 4.574A11.956 11.956 0 0 1 12 3c1.602 0 3.112.36 4.426 1.004" /></svg>
          </div>
          <div>
            <h1 class="logo-title">Jurídica Digital SPA</h1>
            <p class="logo-subtitle">Agente Digital</p>
          </div>
        </div>
        <nav>
          <ul class="sidebar-nav">
            <li>
              <router-link :to="{ name: 'AdminDashboard' }" class="nav-link" :class="{ active: $route.name === 'AdminDashboard' }">
                <span>❖ Panel Principal</span>
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
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
const authStore = useAuthStore();
const handleLogout = () => {
  authStore.logout();
};
</script>