<template>
  <div class="admin-dashboard-container">
    <h1 class="dashboard-title">Panel de Administración</h1>
    <p class="dashboard-subtitle">Seleccione un módulo para comenzar a gestionar el sistema.</p>

    <div class="modulos-grid">
      <router-link to="/gestion/inquilinos" class="modulo-card">
        <div class="card-icon">
          <i class="ph-bold ph-users-three"></i>
        </div>
        <h2 class="card-title">Supervisar Inquilinos</h2>
        <p class="card-description">Ver la lista de clientes y acceder a sus empresas y módulos.</p>
      </router-link>

      <router-link to="/gestion/crear-inquilinos-empresas" class="modulo-card">
        <div class="card-icon">
          <i class="ph-bold ph-user-plus"></i>
        </div>
        <h2 class="card-title">Crear Inquilinos y Empresas</h2>
        <p class="card-description">Registrar nuevos clientes y configurar sus empresas en el sistema.</p>
      </router-link>
      
      
      <router-link to="/gestion/logs-auditoria" class="modulo-card">
        <div class="card-icon">
          <i class="ph-bold ph-detective"></i>
        </div>
        <h2 class="card-title">Logs de Auditoría</h2>
        <p class="card-description">Monitorear todas las acciones realizadas en el sistema para auditoría y seguridad.</p>
      </router-link>
      
      <!-- Card del Sistema de Gestión de Contraseñas -->
      <PasswordManagementCard />
      
      <!-- Card de Accesos Clientes -->
      <AccesosClientesCard />
    </div>
  </div>
</template>

<script setup>
import PasswordManagementCard from '../components/PasswordManagementCard.vue';
import AccesosClientesCard from '../components/AccesosClientesCard.vue';
</script>

<style scoped>
/* Estilos autocontenidos para este componente */
.admin-dashboard-container {
  padding: 2rem;
}

.dashboard-title {
  font-size: 2.25rem; /* 36px */
  font-weight: 800; /* extrabold */
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  font-size: 1.125rem; /* 18px */
  color: #9ca3af; /* text-gray-400 */
  margin-bottom: 2.5rem;
}

.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.modulo-card {
  background-color: #1f2937; /* bg-gray-800 */
  border: 1px solid #374151; /* border-gray-700 */
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.modulo-card:not(.disabled) {
  cursor: pointer;
}

.modulo-card:not(.disabled):hover {
  transform: translateY(-5px);
  border-color: #4f46e5; /* border-indigo-500 */
  box-shadow: 0 10px 20px rgba(0,0,0,0.25);
}

.card-icon {
  font-size: 3rem; /* 48px */
  color: #818cf8; /* text-indigo-400 */
  margin-bottom: 1rem;
  height: 48px;
  line-height: 1;
}

.card-title {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem; /* 14px */
  color: #9ca3af; /* text-gray-400 */
  line-height: 1.5;
}

.modulo-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modulo-card.disabled .card-icon {
  color: #4b5563; /* text-gray-600 */
}

</style>