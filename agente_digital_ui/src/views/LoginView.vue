<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <i class="ph ph-shield-checkered logo-icon"></i>
        <h1 class="text-2xl font-bold text-white">Agente Digital</h1>
        <p class="text-gray-400">Por favor, inicie sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="errorMsg" class="error-banner">
          {{ errorMsg }}
        </div>

        <div class="input-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input autocomplete="off" id="email" type="email" v-model="email" class="form-input" required />
        </div>
        
        <div class="input-group">
          <label for="password" class="form-label">Contraseña</label>
          <input autocomplete="off" id="password" type="password" v-model="password" class="form-input" required />
        </div>
        
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const router = useRouter();
const authStore = useAuthStore();

async function handleLogin() {
  loading.value = true;
  errorMsg.value = ''; // Limpia el mensaje de error anterior
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    // Redirección después del login exitoso
    router.push({ name: 'AdminDashboard' });
  } catch (error) {
    errorMsg.value = 'Credenciales inválidas o error de conexión.';
    console.error("Fallo en el login:", error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #111827; }
.login-card { width: 100%; max-width: 400px; background-color: #1f2937; padding: 2.5rem; border-radius: .75rem; border: 1px solid #374151; text-align: center; }
.login-header { margin-bottom: 2rem; }
.logo-icon { font-size: 3.5rem; color: #4f46e5; margin-bottom: 1rem; }
.login-form { margin-top: 1.5rem; }
.input-group { text-align: left; margin-bottom: 1.25rem; }
.error-banner { background-color: #9f1239; color: white; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem; font-weight: 500; }
.w-full { width: 100%; }
.form-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #9ca3af; }
.form-input { display: block; width: 100%; background-color: #374151; color: #ffffff; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.6rem; }
.btn { display: inline-flex; justify-content: center; align-items: center; font-weight: 600; padding: .75rem 1.25rem; border-radius: .375rem; border: none; cursor: pointer; transition: opacity 0.2s; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>