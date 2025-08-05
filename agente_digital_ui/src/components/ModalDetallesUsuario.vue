<template>
  <div class="modal-overlay" @click="$emit('cerrar')">
    <div class="modal-container" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-background">
          <div class="header-pattern"></div>
        </div>
        <div class="header-content">
          <div class="modal-icon">
            <i class="ph ph-user-circle"></i>
          </div>
          <div class="modal-title-section">
            <h2 class="modal-title">Detalles del Usuario</h2>
            <p class="modal-subtitle">Información completa del usuario en el sistema</p>
          </div>
          <button @click="$emit('cerrar')" class="modal-close">
            <i class="ph ph-x"></i>
          </button>
        </div>
      </div>

      <!-- Contenido -->
      <div class="modal-body">
        <div class="usuario-detalle">
          <!-- Información Personal -->
          <div class="detalle-seccion">
            <div class="seccion-header">
              <div class="seccion-icon">
                <i class="ph ph-user"></i>
              </div>
              <h3 class="seccion-titulo">Información Personal</h3>
            </div>
            <div class="detalle-grid">
              <div class="detalle-item">
                <label class="detalle-label">Nombre Completo</label>
                <div class="detalle-valor">{{ usuario.NombreCompleto || 'No especificado' }}</div>
              </div>
              <div class="detalle-item">
                <label class="detalle-label">Correo Electrónico</label>
                <div class="detalle-valor">{{ usuario.Email }}</div>
              </div>
              <div class="detalle-item">
                <label class="detalle-label">Rol</label>
                <div class="detalle-valor">
                  <span class="rol-badge" :class="getRolClass(usuario.Rol)">
                    {{ usuario.Rol }}
                  </span>
                </div>
              </div>
              <div class="detalle-item">
                <label class="detalle-label">Estado</label>
                <div class="detalle-valor">
                  <span class="estado-badge" :class="getEstadoClass(usuario.Estado)">
                    <i :class="getEstadoIcon(usuario.Estado)"></i>
                    {{ usuario.Estado }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Información Organizacional -->
          <div class="detalle-seccion">
            <div class="seccion-header">
              <div class="seccion-icon">
                <i class="ph ph-buildings"></i>
              </div>
              <h3 class="seccion-titulo">Información Organizacional</h3>
            </div>
            <div class="detalle-grid">
              <div class="detalle-item span-2">
                <label class="detalle-label">Inquilino</label>
                <div class="detalle-valor">{{ usuario.InquilinoNombre || 'No asignado' }}</div>
              </div>
              <div class="detalle-item span-2">
                <label class="detalle-label">Empresa</label>
                <div class="detalle-valor">{{ usuario.EmpresaNombre || 'No asignado' }}</div>
              </div>
              <div class="detalle-item">
                <label class="detalle-label">Tipo de Empresa</label>
                <div class="detalle-valor">{{ usuario.TipoEmpresa || 'No especificado' }}</div>
              </div>
            </div>
          </div>

          <!-- Información de Sistema -->
          <div class="detalle-seccion">
            <div class="seccion-header">
              <div class="seccion-icon">
                <i class="ph ph-clock"></i>
              </div>
              <h3 class="seccion-titulo">Información de Sistema</h3>
            </div>
            <div class="detalle-grid">
              <div class="detalle-item">
                <label class="detalle-label">Fecha de Creación</label>
                <div class="detalle-valor">{{ formatearFecha(usuario.FechaCreacion) }}</div>
              </div>
              <div class="detalle-item">
                <label class="detalle-label">Último Acceso</label>
                <div class="detalle-valor">
                  {{ usuario.UltimoAcceso ? formatearFecha(usuario.UltimoAcceso) : 'Nunca' }}
                </div>
              </div>
              <div class="detalle-item">
                <label class="detalle-label">ID de Usuario</label>
                <div class="detalle-valor">#{{ usuario.UsuarioID }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="$emit('cerrar')" class="btn btn-secondary">
          <i class="ph ph-x"></i>
          Cerrar
        </button>
        <button @click="$emit('editar', usuario)" class="btn btn-primary">
          <i class="ph ph-pencil"></i>
          Editar Usuario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  usuario: { type: Object, required: true }
})

const emit = defineEmits(['cerrar', 'editar'])

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
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

.modal-header {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
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
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
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
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
}

.usuario-detalle {
  padding: 2rem;
}

.detalle-seccion {
  margin-bottom: 2rem;
}

.detalle-seccion:last-child {
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
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #60a5fa;
}

.seccion-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle-item.span-2 {
  grid-column: span 2;
}

.detalle-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detalle-valor {
  font-size: 1rem;
  color: #e2e8f0;
  font-weight: 500;
}

.rol-badge, .estado-badge {
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
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
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
  
  .usuario-detalle {
    padding: 1.5rem;
  }
  
  .detalle-grid {
    grid-template-columns: 1fr;
  }
  
  .detalle-item.span-2 {
    grid-column: span 1;
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