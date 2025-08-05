<template>
  <div class="modal-overlay" @click="$emit('cancelar')">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-background">
          <div class="header-pattern"></div>
        </div>
        <div class="header-content">
          <div class="modal-icon">
            <i class="ph ph-shield-check"></i>
          </div>
          <div class="modal-title-section">
            <h2 class="modal-title">Gestión de Permisos</h2>
            <p class="modal-subtitle">
              Configurar permisos y accesos para {{ usuario?.NombreCompleto }}
            </p>
          </div>
          <button @click="$emit('cancelar')" class="modal-close">
            <i class="ph ph-x"></i>
          </button>
        </div>
      </div>

      <!-- Contenido -->
      <div class="modal-body">
        <div class="permisos-container">
          <!-- Información del Usuario -->
          <div class="usuario-info">
            <div class="usuario-avatar">
              <i class="ph ph-user-circle"></i>
            </div>
            <div class="usuario-datos">
              <h3 class="usuario-nombre">{{ usuario?.NombreCompleto }}</h3>
              <p class="usuario-email">{{ usuario?.Email }}</p>
              <span class="usuario-rol" :class="getRolClass(usuario?.Rol)">
                {{ usuario?.Rol }}
              </span>
            </div>
          </div>

          <!-- Configuración de Permisos -->
          <div class="permisos-seccion">
            <div class="seccion-header">
              <div class="seccion-icon">
                <i class="ph ph-gear"></i>
              </div>
              <h3 class="seccion-titulo">Configuración General</h3>
            </div>
            
            <div class="permisos-grid">
              <div class="permiso-item">
                <div class="permiso-header">
                  <div class="permiso-icono email">
                    <i class="ph ph-envelope"></i>
                  </div>
                  <div class="permiso-info">
                    <h4 class="permiso-titulo">Notificaciones Email</h4>
                    <p class="permiso-descripcion">Recibir notificaciones por correo electrónico</p>
                  </div>
                </div>
                <div class="permiso-toggle">
                  <label class="toggle">
                    <input autocomplete="off" type="checkbox" 
                      v-model="permisos.notificacionesEmail"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="permiso-item">
                <div class="permiso-header">
                  <div class="permiso-icono mobile">
                    <i class="ph ph-device-mobile"></i>
                  </div>
                  <div class="permiso-info">
                    <h4 class="permiso-titulo">Acceso Móvil</h4>
                    <p class="permiso-descripcion">Permitir acceso desde dispositivos móviles</p>
                  </div>
                </div>
                <div class="permiso-toggle">
                  <label class="toggle">
                    <input autocomplete="off" type="checkbox" 
                      v-model="permisos.accesoMovil"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="permiso-item">
                <div class="permiso-header">
                  <div class="permiso-icono password">
                    <i class="ph ph-key"></i>
                  </div>
                  <div class="permiso-info">
                    <h4 class="permiso-titulo">Cambio de Contraseña</h4>
                    <p class="permiso-descripcion">Requerir cambio de contraseña en próximo acceso</p>
                  </div>
                </div>
                <div class="permiso-toggle">
                  <label class="toggle">
                    <input autocomplete="off" type="checkbox" 
                      v-model="permisos.requiereCambioPassword"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Permisos por Rol -->
          <div class="permisos-seccion">
            <div class="seccion-header">
              <div class="seccion-icon">
                <i class="ph ph-users"></i>
              </div>
              <h3 class="seccion-titulo">Permisos por Rol</h3>
            </div>
            
            <div class="rol-permisos">
              <div class="rol-info">
                <div class="rol-badge" :class="getRolClass(usuario?.Rol)">
                  <i :class="getRolIcon(usuario?.Rol)"></i>
                  {{ usuario?.Rol }}
                </div>
                <p class="rol-descripcion">{{ getRolDescripcion(usuario?.Rol) }}</p>
              </div>
              
              <div class="permisos-lista">
                <div 
                  v-for="permiso in getPermisosPorRol(usuario?.Rol)" 
                  :key="permiso.id"
                  class="permiso-rol-item"
                >
                  <div class="permiso-rol-icon" :class="permiso.habilitado ? 'habilitado' : 'deshabilitado'">
                    <i :class="permiso.habilitado ? 'ph ph-check' : 'ph ph-x'"></i>
                  </div>
                  <div class="permiso-rol-texto">
                    <span class="permiso-rol-nombre">{{ permiso.nombre }}</span>
                    <span class="permiso-rol-desc">{{ permiso.descripcion }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial de Accesos -->
          <div class="permisos-seccion">
            <div class="seccion-header">
              <div class="seccion-icon">
                <i class="ph ph-clock-clockwise"></i>
              </div>
              <h3 class="seccion-titulo">Información de Acceso</h3>
            </div>
            
            <div class="acceso-info">
              <div class="acceso-item">
                <div class="acceso-label">Último Acceso</div>
                <div class="acceso-valor">
                  {{ usuario?.UltimoAcceso ? formatearFecha(usuario.UltimoAcceso) : 'Nunca' }}
                </div>
              </div>
              <div class="acceso-item">
                <div class="acceso-label">Fecha de Creación</div>
                <div class="acceso-valor">{{ formatearFecha(usuario?.FechaCreacion) }}</div>
              </div>
              <div class="acceso-item">
                <div class="acceso-label">Estado del Usuario</div>
                <div class="acceso-valor">
                  <span class="estado-badge" :class="getEstadoClass(usuario?.Estado)">
                    <i :class="getEstadoIcon(usuario?.Estado)"></i>
                    {{ usuario?.Estado }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="$emit('cancelar')" class="btn btn-secondary">
          <i class="ph ph-x"></i>
          Cancelar
        </button>
        <button @click="guardarPermisos" class="btn btn-primary">
          <i class="ph ph-floppy-disk"></i>
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  usuario: { type: Object, required: true }
})

const emit = defineEmits(['confirmar', 'cancelar'])

// Estado de permisos
const permisos = ref({
  notificacionesEmail: true,
  accesoMovil: true,
  requiereCambioPassword: false
})

// Inicializar permisos desde usuario
onMounted(() => {
  if (props.usuario) {
    permisos.value = {
      notificacionesEmail: props.usuario.NotificacionesEmail ?? true,
      accesoMovil: props.usuario.AccesoMovil ?? true,
      requiereCambioPassword: props.usuario.RequiereCambioPassword ?? false
    }
  }
})

function getRolClass(rol) {
  const classes = {
    'Administrador': 'rol-admin',
    'Supervisor': 'rol-supervisor',
    'Usuario': 'rol-usuario',
    'Operador': 'rol-operador',
    'Auditor': 'rol-auditor'
  }
  return classes[rol] || 'rol-usuario'
}

function getRolIcon(rol) {
  const icons = {
    'Administrador': 'ph ph-crown',
    'Supervisor': 'ph ph-eye',
    'Usuario': 'ph ph-user',
    'Operador': 'ph ph-wrench',
    'Auditor': 'ph ph-magnifying-glass'
  }
  return icons[rol] || 'ph ph-user'
}

function getRolDescripcion(rol) {
  const descripciones = {
    'Administrador': 'Acceso completo a todas las funcionalidades del sistema',
    'Supervisor': 'Supervisión y gestión de usuarios y procesos',
    'Usuario': 'Acceso básico a funcionalidades estándar',
    'Operador': 'Operación y mantenimiento de procesos específicos',
    'Auditor': 'Revisión y auditoría de actividades del sistema'
  }
  return descripciones[rol] || 'Rol sin descripción'
}

function getPermisosPorRol(rol) {
  const permisosPorRol = {
    'Administrador': [
      { id: 1, nombre: 'Gestión de Usuarios', descripcion: 'Crear, editar y eliminar usuarios', habilitado: true },
      { id: 2, nombre: 'Gestión de Empresas', descripcion: 'Administrar inquilinos y empresas', habilitado: true },
      { id: 3, nombre: 'Configuración del Sistema', descripcion: 'Acceso a configuraciones globales', habilitado: true },
      { id: 4, nombre: 'Reportes Avanzados', descripcion: 'Generar y exportar reportes', habilitado: true },
      { id: 5, nombre: 'Auditoría Completa', descripcion: 'Acceso a logs y auditorías', habilitado: true }
    ],
    'Supervisor': [
      { id: 1, nombre: 'Gestión de Usuarios', descripcion: 'Ver y editar usuarios asignados', habilitado: true },
      { id: 2, nombre: 'Supervisión de Procesos', descripcion: 'Monitorear actividades y procesos', habilitado: true },
      { id: 3, nombre: 'Reportes Supervisión', descripcion: 'Generar reportes de supervisión', habilitado: true },
      { id: 4, nombre: 'Configuración Limitada', descripcion: 'Configuraciones específicas del área', habilitado: true },
      { id: 5, nombre: 'Auditoría Completa', descripcion: 'Acceso a logs y auditorías', habilitado: false }
    ],
    'Usuario': [
      { id: 1, nombre: 'Acceso Básico', descripcion: 'Funcionalidades estándar del sistema', habilitado: true },
      { id: 2, nombre: 'Reportes Básicos', descripcion: 'Generar reportes básicos', habilitado: true },
      { id: 3, nombre: 'Gestión Personal', descripcion: 'Editar perfil personal', habilitado: true },
      { id: 4, nombre: 'Configuración Avanzada', descripcion: 'Configuraciones del sistema', habilitado: false },
      { id: 5, nombre: 'Gestión de Usuarios', descripcion: 'Administrar otros usuarios', habilitado: false }
    ],
    'Operador': [
      { id: 1, nombre: 'Operaciones Específicas', descripcion: 'Ejecutar operaciones asignadas', habilitado: true },
      { id: 2, nombre: 'Monitoreo de Procesos', descripcion: 'Supervisar procesos operativos', habilitado: true },
      { id: 3, nombre: 'Reportes Operativos', descripcion: 'Generar reportes operativos', habilitado: true },
      { id: 4, nombre: 'Gestión de Usuarios', descripcion: 'Administrar usuarios', habilitado: false },
      { id: 5, nombre: 'Configuración del Sistema', descripcion: 'Modificar configuraciones', habilitado: false }
    ],
    'Auditor': [
      { id: 1, nombre: 'Auditoría Completa', descripcion: 'Acceso completo a auditorías', habilitado: true },
      { id: 2, nombre: 'Reportes de Auditoría', descripcion: 'Generar reportes de auditoría', habilitado: true },
      { id: 3, nombre: 'Revisión de Logs', descripcion: 'Acceso a logs del sistema', habilitado: true },
      { id: 4, nombre: 'Análisis de Cumplimiento', descripcion: 'Revisar cumplimiento normativo', habilitado: true },
      { id: 5, nombre: 'Modificación de Datos', descripcion: 'Editar información del sistema', habilitado: false }
    ]
  }
  return permisosPorRol[rol] || []
}

function getEstadoClass(estado) {
  const classes = {
    'Activo': 'estado-activo',
    'Inactivo': 'estado-inactivo',
    'Pendiente': 'estado-pendiente',
    'Suspendido': 'estado-suspendido'
  }
  return classes[estado] || 'estado-pendiente'
}

function getEstadoIcon(estado) {
  const icons = {
    'Activo': 'ph ph-check-circle',
    'Inactivo': 'ph ph-x-circle',
    'Pendiente': 'ph ph-clock',
    'Suspendido': 'ph ph-pause-circle'
  }
  return icons[estado] || 'ph ph-question'
}

function formatearFecha(fecha) {
  if (!fecha) return 'No disponible'
  return new Date(fecha).toLocaleString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function guardarPermisos() {
  emit('confirmar', {
    usuario: props.usuario,
    permisos: permisos.value
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

.modal-header {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
}

.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0);
  background-size: 20px 20px;
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  color: #cbd5e1;
  font-size: 0.875rem;
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(71, 85, 105, 0.3);
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.modal-close:hover {
  background: rgba(71, 85, 105, 0.5);
  color: #cbd5e1;
  transform: scale(1.1);
}

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}

.permisos-container {
  padding: 2rem;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(71, 85, 105, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  margin-bottom: 2rem;
}

.usuario-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.usuario-datos {
  flex: 1;
}

.usuario-nombre {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.usuario-email {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.usuario-rol {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permisos-seccion {
  margin-bottom: 2rem;
}

.permisos-seccion:last-child {
  margin-bottom: 0;
}

.seccion-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(71, 85, 105, 0.3);
}

.seccion-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #22c55e;
}

.seccion-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.permisos-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.permiso-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(71, 85, 105, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.2s;
}

.permiso-item:hover {
  background: rgba(71, 85, 105, 0.2);
  transform: translateY(-1px);
}

.permiso-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.permiso-icono {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.permiso-icono.email {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.permiso-icono.mobile {
  background: linear-gradient(135deg, #10b981, #059669);
}

.permiso-icono.password {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.permiso-info {
  flex: 1;
}

.permiso-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
}

.permiso-descripcion {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(71, 85, 105, 0.5);
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.rol-permisos {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rol-info {
  text-align: center;
  padding: 1rem;
  background: rgba(71, 85, 105, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.rol-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.rol-descripcion {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0;
}

.permisos-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.permiso-rol-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(71, 85, 105, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.2);
}

.permiso-rol-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.permiso-rol-icon.habilitado {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.permiso-rol-icon.deshabilitado {
  background: rgba(107, 114, 128, 0.3);
  color: #6b7280;
}

.permiso-rol-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.permiso-rol-nombre {
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
}

.permiso-rol-desc {
  color: #94a3b8;
  font-size: 0.75rem;
}

.acceso-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.acceso-item {
  padding: 1rem;
  background: rgba(71, 85, 105, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.acceso-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.acceso-valor {
  font-size: 1rem;
  color: #e2e8f0;
  font-weight: 500;
}

/* Reutilizar estilos de otros componentes */
.rol-admin {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.rol-supervisor {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.rol-usuario {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.rol-operador {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.rol-auditor {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2));
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.estado-activo {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.estado-inactivo {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2));
  color: #9ca3af;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.estado-pendiente {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.estado-suspendido {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.estado-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.5);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.5);
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
    width: calc(100% - 2rem);
    max-height: calc(100vh - 2rem);
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .permisos-container {
    padding: 1.5rem;
  }
  
  .usuario-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .acceso-info {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>