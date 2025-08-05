<template>
  <router-link to="/admin/accesos-clientes" class="modulo-card">
    <div class="card-icon">
      <i class="ph-bold ph-users"></i>
    </div>
    <h2 class="card-title">Accesos Clientes</h2>
    <p class="card-description">Gestión de accesos y permisos para usuarios clientes del sistema.</p>
  </router-link>
</template>

<script setup>
// Sin lógica adicional necesaria - es solo una tarjeta de navegación
</script>

<style scoped>
/* Estilos que coinciden exactamente con AdminDashboard.vue */
.modulo-card {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  cursor: pointer;
  display: block;
}

.modulo-card:hover {
  transform: translateY(-5px);
  border-color: #4f46e5;
  box-shadow: 0 10px 20px rgba(0,0,0,0.25);
}

.card-icon {
  font-size: 3rem;
  color: #818cf8;
  margin-bottom: 1rem;
  height: 48px;
  line-height: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.5;
}
</style>