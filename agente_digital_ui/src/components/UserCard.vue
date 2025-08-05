<template>
  <div class="user-card" :class="{ 'card-inactive': usuario.Estado !== 'Activo' }">
    <!-- Header de la tarjeta -->
    <div class="card-header">
      <div class="user-avatar">
        <div class="avatar-circle" :class="getAvatarClass(usuario.Estado)">
          <i class="ph ph-user"></i>
        </div>
        <div class="status-indicator" :class="getStatusClass(usuario.Estado)">
          <div class="status-dot"></div>
        </div>
      </div>
      
      <div class="user-info">
        <h3 class="user-name">{{ usuario.NombreCompleto || 'Sin nombre' }}</h3>
        <p class="user-email">{{ usuario.Email }}</p>
        <div class="user-badges">
          <span class="badge badge-rol" :class="getRolClass(usuario.Rol)">
            {{ usuario.Rol || 'Sin rol' }}
          </span>
          <span class="badge badge-estado" :class="getStatusBadgeClass(usuario.Estado)">
            {{ usuario.Estado || 'Pendiente' }}
          </span>
        </div>
      </div>

      <div class="card-actions">
        <button @click="$emit('verDetalles', usuario)" class="action-btn" title="Ver detalles">
          <i class="ph ph-eye"></i>
        </button>
        <div class="dropdown" v-click-outside="() => showDropdown = false">
          <button @click="showDropdown = !showDropdown" class="action-btn" title="Más opciones">
            <i class="ph ph-dots-three-vertical"></i>
          </button>
          <div v-if="showDropdown" class="dropdown-menu">
            <button @click="editarUsuario" class="dropdown-item">
              <i class="ph ph-pencil"></i>
              Editar
            </button>
            <button @click="asignarPermisos" class="dropdown-item">
              <i class="ph ph-shield-check"></i>
              Permisos
            </button>
            <button @click="cambiarEstado" class="dropdown-item">
              <i class="ph ph-power"></i>
              {{ usuario.Estado === 'Activo' ? 'Desactivar' : 'Activar' }}
            </button>
            <div class="dropdown-divider"></div>
            <button @click="eliminarUsuario" class="dropdown-item danger">
              <i class="ph ph-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Información organizacional -->
    <div class="card-body">
      <div class="org-info">
        <div class="org-item">
          <div class="org-icon">
            <i class="ph ph-building-office"></i>
          </div>
          <div class="org-details">
            <span class="org-label">Inquilino</span>
            <span class="org-value">{{ usuario.InquilinoNombre || 'No asignado' }}</span>
          </div>
        </div>
        
        <div class="org-item" v-if="usuario.EmpresaNombre">
          <div class="org-icon">
            <i class="ph ph-buildings"></i>
          </div>
          <div class="org-details">
            <span class="org-label">Empresa</span>
            <span class="org-value">{{ usuario.EmpresaNombre }}</span>
          </div>
        </div>
      </div>

      <!-- Estadísticas de actividad -->
      <div class="activity-stats">
        <div class="stat-item">
          <div class="stat-icon">
            <i class="ph ph-calendar"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Último acceso</span>
            <span class="stat-value">{{ formatearFecha(usuario.UltimoAcceso) }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">
            <i class="ph ph-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">Creado</span>
            <span class="stat-value">{{ formatearFecha(usuario.FechaCreacion) }}</span>
          </div>
        </div>
      </div>

      <!-- Indicadores de permisos -->
      <div class="permissions-preview" v-if="usuario.Permisos">
        <h4 class="permissions-title">
          <i class="ph ph-shield"></i>
          Permisos Activos
        </h4>
        <div class="permissions-list">
          <span 
            v-for="permiso in usuario.Permisos.slice(0, 3)" 
            :key="permiso"
            class="permission-tag"
          >
            {{ permiso }}
          </span>
          <span v-if="usuario.Permisos.length > 3" class="permission-more">
            +{{ usuario.Permisos.length - 3 }} más
          </span>
        </div>
      </div>
    </div>

    <!-- Footer con acciones rápidas -->
    <div class="card-footer">
      <div class="quick-actions">
        <button 
          @click="$emit('asignarPermisos', usuario)" 
          class="quick-action-btn primary"
          title="Gestionar permisos"
        >
          <i class="ph ph-shield-check"></i>
          <span>Permisos</span>
        </button>
        
        <button 
          @click="$emit('editar', usuario)" 
          class="quick-action-btn secondary"
          title="Editar usuario"
        >
          <i class="ph ph-pencil"></i>
          <span>Editar</span>
        </button>
        
        <button 
          @click="toggleEstado" 
          class="quick-action-btn" 
          :class="usuario.Estado === 'Activo' ? 'warning' : 'success'"
          :title="usuario.Estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'"
        >
          <i :class="usuario.Estado === 'Activo' ? 'ph ph-pause' : 'ph ph-play'"></i>
          <span>{{ usuario.Estado === 'Activo' ? 'Pausar' : 'Activar' }}</span>
        </button>
      </div>
    </div>

    <!-- Efectos visuales -->
    <div class="card-glow" :class="getGlowClass(usuario.Estado)"></div>
    <div class="card-pattern"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  usuario: { type: Object, required: true }
})

const emit = defineEmits([
  'editar', 
  'eliminar', 
  'cambiarEstado', 
  'verDetalles', 
  'asignarPermisos'
])

const showDropdown = ref(false)

// Directiva para cerrar dropdown al hacer click fuera
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Métodos
function editarUsuario() {
  showDropdown.value = false
  emit('editar', props.usuario)
}

function asignarPermisos() {
  showDropdown.value = false
  emit('asignarPermisos', props.usuario)
}

function cambiarEstado() {
  showDropdown.value = false
  const nuevoEstado = props.usuario.Estado === 'Activo' ? 'Inactivo' : 'Activo'
  emit('cambiarEstado', props.usuario, nuevoEstado)
}

function toggleEstado() {
  cambiarEstado()
}

function eliminarUsuario() {
  showDropdown.value = false
  emit('eliminar', props.usuario)
}

function formatearFecha(fecha) {
  if (!fecha) return 'Nunca'
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getAvatarClass(estado) {
  const classes = {
    'Activo': 'avatar-active',
    'Inactivo': 'avatar-inactive',
    'Suspendido': 'avatar-suspended',
    'Pendiente': 'avatar-pending'
  }
  return classes[estado] || 'avatar-pending'
}

function getStatusClass(estado) {
  const classes = {
    'Activo': 'status-active',
    'Inactivo': 'status-inactive',
    'Suspendido': 'status-suspended',
    'Pendiente': 'status-pending'
  }
  return classes[estado] || 'status-pending'
}

function getStatusBadgeClass(estado) {
  const classes = {
    'Activo': 'badge-success',
    'Inactivo': 'badge-danger',
    'Suspendido': 'badge-warning',
    'Pendiente': 'badge-info'
  }
  return classes[estado] || 'badge-info'
}

function getRolClass(rol) {
  const classes = {
    'Administrador': 'rol-admin',
    'Supervisor': 'rol-supervisor',
    'Usuario': 'rol-user',
    'Operador': 'rol-operator',
    'Auditor': 'rol-auditor'
  }
  return classes[rol] || 'rol-default'
}

function getGlowClass(estado) {
  const classes = {
    'Activo': 'glow-active',
    'Inactivo': 'glow-inactive',
    'Suspendido': 'glow-suspended',
    'Pendiente': 'glow-pending'
  }
  return classes[estado] || 'glow-pending'
}
</script>

<style scoped>
.user-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.user-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(59, 130, 246, 0.2);
}

.card-inactive {
  opacity: 0.7;
  filter: grayscale(0.3);
}

.card-header {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  position: relative;
  transition: all 0.3s;
}

.avatar-active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.avatar-inactive {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: #d1d5db;
}

.avatar-suspended {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.avatar-pending {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid rgba(30, 41, 59, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-active .status-dot {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.status-inactive .status-dot {
  background: #ef4444;
}

.status-suspended .status-dot {
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
}

.status-pending .status-dot {
  background: #3b82f6;
  box-shadow: 0 0 6px #3b82f6;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
  truncate: true;
}

.user-email {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  word-break: break-all;
}

.user-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-rol {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.rol-admin {
  background: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.rol-supervisor {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
  transform: scale(1.05);
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem;
  min-width: 150px;
  z-index: 10;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.dropdown-item {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: #cbd5e1;
  text-align: left;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.dropdown-item.danger {
  color: #fca5a5;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
}

.dropdown-divider {
  height: 1px;
  background: rgba(71, 85, 105, 0.3);
  margin: 0.5rem 0;
}

.card-body {
  flex: 1;
  padding: 0 1.5rem;
  position: relative;
  z-index: 2;
}

.org-info {
  margin-bottom: 1.5rem;
}

.org-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
}

.org-item:last-child {
  border-bottom: none;
}

.org-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 1.125rem;
}

.org-details {
  flex: 1;
  min-width: 0;
}

.org-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.125rem;
}

.org-value {
  display: block;
  font-size: 0.875rem;
  color: #e2e8f0;
  font-weight: 500;
  truncate: true;
}

.activity-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  background: rgba(100, 116, 139, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1rem;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.125rem;
}

.stat-value {
  display: block;
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 500;
}

.permissions-preview {
  margin-bottom: 1rem;
}

.permissions-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.permission-tag {
  padding: 0.125rem 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.permission-more {
  padding: 0.125rem 0.5rem;
  background: rgba(71, 85, 105, 0.3);
  color: #94a3b8;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(71, 85, 105, 0.2);
  position: relative;
  z-index: 2;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-action-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.quick-action-btn.primary {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.quick-action-btn.primary:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.quick-action-btn.secondary {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.quick-action-btn.secondary:hover {
  background: rgba(100, 116, 139, 0.3);
  transform: translateY(-1px);
}

.quick-action-btn.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.quick-action-btn.warning:hover {
  background: rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

.quick-action-btn.success {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.quick-action-btn.success:hover {
  background: rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.user-card:hover .card-glow {
  opacity: 1;
}

.glow-active {
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.glow-inactive {
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
}

.glow-suspended {
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

.glow-pending {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.card-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 25%);
  pointer-events: none;
  opacity: 0.5;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive */
@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .activity-stats {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
  }
}
</style>