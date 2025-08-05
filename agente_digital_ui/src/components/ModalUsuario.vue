<template>
  <div class="modal-overlay" @click="$emit('cancelar')">
    <div class="modal-container" @click.stop>
      <!-- Header espectacular -->
      <div class="modal-header">
        <div class="header-background">
          <div class="header-pattern"></div>
        </div>
        <div class="header-content">
          <div class="modal-icon">
            <i :class="usuario ? 'ph ph-user-gear' : 'ph ph-user-plus'"></i>
          </div>
          <div class="modal-title-section">
            <h2 class="modal-title">
              {{ usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
            </h2>
            <p class="modal-subtitle">
              {{ usuario ? 'Actualizar información del usuario en el sistema' : 'Registrar un nuevo usuario en el sistema' }}
            </p>
          </div>
          <button @click="$emit('cancelar')" class="modal-close">
            <i class="ph ph-x"></i>
          </button>
        </div>
      </div>

      <!-- Formulario -->
      <div class="modal-body">
        <form @submit.prevent="guardarUsuario" class="user-form">
          <!-- Información Personal -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="ph ph-user-circle"></i>
              </div>
              <h3 class="section-title">Información Personal</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-group span-2">
                <label class="form-label required">
                  <i class="ph ph-user"></i>
                  Nombre Completo
                </label>
                <input autocomplete="off" v-model="form.NombreCompleto"
                  type="text"
                  class="form-input"
                  placeholder="Nombre y apellidos del usuario"
                  required
                  maxlength="255"
                />
                <div v-if="errores.NombreCompleto" class="form-error">
                  {{ errores.NombreCompleto }}
                </div>
              </div>

              <div class="form-group span-2">
                <label class="form-label required">
                  <i class="ph ph-envelope"></i>
                  Correo Electrónico
                </label>
                <input autocomplete="off" v-model="form.Email"
                  type="email"
                  class="form-input"
                  placeholder="usuario@empresa.com"
                  required
                  maxlength="255"
                  @blur="validarEmail"
                />
                <div v-if="errores.Email" class="form-error">
                  {{ errores.Email }}
                </div>
              </div>

              <div class="form-group" v-if="!usuario">
                <label class="form-label required">
                  <i class="ph ph-key"></i>
                  Contraseña
                </label>
                <div class="password-input">
                  <input autocomplete="off" v-model="form.Password"
                    :type="mostrarPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Contraseña segura"
                    required
                    minlength="8"
                  />
                  <button 
                    type="button"
                    @click="mostrarPassword = !mostrarPassword"
                    class="password-toggle"
                  >
                    <i :class="mostrarPassword ? 'ph ph-eye-slash' : 'ph ph-eye'"></i>
                  </button>
                </div>
                <div class="password-strength">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :class="getPasswordStrengthClass()"
                      :style="{ width: getPasswordStrengthWidth() }"
                    ></div>
                  </div>
                  <span class="strength-text">{{ getPasswordStrengthText() }}</span>
                </div>
                <div v-if="errores.Password" class="form-error">
                  {{ errores.Password }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">
                  <i class="ph ph-shield-check"></i>
                  Rol del Usuario
                </label>
                <select autocomplete="off" v-model="form.Rol" class="form-select" required>
                  <option value="">Seleccionar rol</option>
                  <option value="Administrador">👑 Administrador</option>
                  <option value="Supervisor">🛡️ Supervisor</option>
                  <option value="Usuario">👤 Usuario</option>
                  <option value="Operador">⚙️ Operador</option>
                  <option value="Auditor">🔍 Auditor</option>
                </select>
                <div v-if="errores.Rol" class="form-error">
                  {{ errores.Rol }}
                </div>
              </div>
            </div>
          </div>

          <!-- Asignación Organizacional -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="ph ph-buildings"></i>
              </div>
              <h3 class="section-title">Asignación Organizacional</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">
                  <i class="ph ph-building-office"></i>
                  Inquilino
                </label>
                <select autocomplete="off" v-model="form.InquilinoID" 
                  class="form-select" 
                  required
                  @change="onInquilinoChange"
                >
                  <option value="">Seleccionar inquilino</option>
                  <option 
                    v-for="inquilino in inquilinos" 
                    :key="inquilino.InquilinoID"
                    :value="inquilino.InquilinoID"
                  >
                    {{ inquilino.RazonSocial }}
                  </option>
                </select>
                <div v-if="errores.InquilinoID" class="form-error">
                  {{ errores.InquilinoID }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="ph ph-buildings"></i>
                  Empresa (Opcional)
                </label>
                <select autocomplete="off" v-model="form.EmpresaID" class="form-select">
                  <option value="">Sin empresa específica</option>
                  <option 
                    v-for="empresa in empresasFiltradas" 
                    :key="empresa.EmpresaID"
                    :value="empresa.EmpresaID"
                  >
                    {{ empresa.RazonSocial }} 
                    <span v-if="empresa.TipoEmpresa">({{ empresa.TipoEmpresa }})</span>
                  </option>
                </select>
                <div class="form-help">
                  Si no selecciona empresa, el usuario tendrá acceso a todas las empresas del inquilino
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración de Cuenta -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="ph ph-gear"></i>
              </div>
              <h3 class="section-title">Configuración de Cuenta</h3>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  <i class="ph ph-power"></i>
                  Estado de la Cuenta
                </label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input autocomplete="off" type="radio" v-model="form.Estado" value="Activo" />
                    <span class="radio-custom"></span>
                    <span class="radio-label">
                      <i class="ph ph-check-circle"></i>
                      Activo
                    </span>
                  </label>
                  <label class="radio-option">
                    <input autocomplete="off" type="radio" v-model="form.Estado" value="Inactivo" />
                    <span class="radio-custom"></span>
                    <span class="radio-label">
                      <i class="ph ph-x-circle"></i>
                      Inactivo
                    </span>
                  </label>
                  <label class="radio-option">
                    <input autocomplete="off" type="radio" v-model="form.Estado" value="Pendiente" />
                    <span class="radio-custom"></span>
                    <span class="radio-label">
                      <i class="ph ph-clock"></i>
                      Pendiente
                    </span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="ph ph-shield"></i>
                  Configuración de Seguridad
                </label>
                <div class="checkbox-group">
                  <label class="checkbox-option">
                    <input autocomplete="off" type="checkbox" v-model="form.RequiereCambioPassword" />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">Requerir cambio de contraseña en primer acceso</span>
                  </label>
                  <label class="checkbox-option">
                    <input autocomplete="off" type="checkbox" v-model="form.NotificacionesEmail" />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">Recibir notificaciones por email</span>
                  </label>
                  <label class="checkbox-option">
                    <input autocomplete="off" type="checkbox" v-model="form.AccesoMovil" />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">Permitir acceso desde dispositivos móviles</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Vista Previa de Permisos -->
          <div class="form-section" v-if="form.Rol">
            <div class="section-header">
              <div class="section-icon">
                <i class="ph ph-list-checks"></i>
              </div>
              <h3 class="section-title">Vista Previa de Permisos</h3>
            </div>
            
            <div class="permissions-preview">
              <div class="permission-category" v-for="categoria in getPermisosPreview()" :key="categoria.nombre">
                <h4 class="category-title">
                  <i :class="categoria.icono"></i>
                  {{ categoria.nombre }}
                </h4>
                <div class="permissions-list">
                  <div 
                    v-for="permiso in categoria.permisos" 
                    :key="permiso.id"
                    class="permission-item"
                    :class="{ granted: permiso.granted }"
                  >
                    <i :class="permiso.granted ? 'ph ph-check' : 'ph ph-x'"></i>
                    <span>{{ permiso.nombre }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer con acciones -->
      <div class="modal-footer">
        <div class="footer-info">
          <div class="info-item">
            <i class="ph ph-info"></i>
            <span v-if="usuario">
              Último acceso: {{ formatearFecha(usuario.UltimoAcceso) }}
            </span>
            <span v-else>
              Se enviará un email de activación al usuario
            </span>
          </div>
        </div>
        
        <div class="footer-actions">
          <button 
            type="button" 
            @click="$emit('cancelar')" 
            class="btn btn-secondary"
            :disabled="guardando"
          >
            <i class="ph ph-x"></i>
            Cancelar
          </button>
          
          <button 
            @click="guardarUsuario" 
            class="btn btn-primary"
            :disabled="guardando || !formularioValido"
          >
            <i class="ph ph-check" v-if="!guardando"></i>
            <i class="ph ph-spinner ph-spin" v-else></i>
            {{ guardando ? 'Guardando...' : (usuario ? 'Actualizar' : 'Crear Usuario') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  usuario: { type: Object, default: null },
  inquilinos: { type: Array, default: () => [] },
  empresas: { type: Array, default: () => [] }
})

const emit = defineEmits(['guardar', 'cancelar'])

// Estado reactivo
const guardando = ref(false)
const mostrarPassword = ref(false)
const form = ref({
  NombreCompleto: '',
  Email: '',
  Password: '',
  Rol: '',
  InquilinoID: '',
  EmpresaID: '',
  Estado: 'Activo',
  RequiereCambioPassword: true,
  NotificacionesEmail: true,
  AccesoMovil: true
})

const errores = ref({})

// Computed properties
const empresasFiltradas = computed(() => {
  if (!form.value.InquilinoID) return []
  return props.empresas.filter(e => e.InquilinoID == form.value.InquilinoID)
})

const formularioValido = computed(() => {
  return form.value.NombreCompleto.trim() !== '' &&
         form.value.Email.trim() !== '' &&
         form.value.Rol !== '' &&
         form.value.InquilinoID !== '' &&
         Object.keys(errores.value).length === 0 &&
         (!props.usuario ? form.value.Password.length >= 8 : true)
})

// Watchers
watch(() => props.usuario, (newUser) => {
  if (newUser) {
    cargarDatosUsuario()
  } else {
    resetearFormulario()
  }
}, { immediate: true })

// Métodos
function cargarDatosUsuario() {
  if (props.usuario) {
    form.value = {
      NombreCompleto: props.usuario.NombreCompleto || '',
      Email: props.usuario.Email || '',
      Password: '', // No cargar password existente
      Rol: props.usuario.Rol || '',
      InquilinoID: props.usuario.InquilinoID || '',
      EmpresaID: props.usuario.EmpresaID || '',
      Estado: props.usuario.Estado || 'Activo',
      RequiereCambioPassword: props.usuario.RequiereCambioPassword || false,
      NotificacionesEmail: props.usuario.NotificacionesEmail !== false,
      AccesoMovil: props.usuario.AccesoMovil !== false
    }
  }
}

function resetearFormulario() {
  form.value = {
    NombreCompleto: '',
    Email: '',
    Password: '',
    Rol: '',
    InquilinoID: '',
    EmpresaID: '',
    Estado: 'Activo',
    RequiereCambioPassword: true,
    NotificacionesEmail: true,
    AccesoMovil: true
  }
  errores.value = {}
}

function onInquilinoChange() {
  // Limpiar empresa seleccionada al cambiar inquilino
  form.value.EmpresaID = ''
}

function validarEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.Email) {
    errores.value.Email = 'El email es obligatorio'
  } else if (!emailRegex.test(form.value.Email)) {
    errores.value.Email = 'El formato del email no es válido'
  } else {
    delete errores.value.Email
  }
}

function getPasswordStrengthClass() {
  const strength = calculatePasswordStrength()
  if (strength < 25) return 'strength-weak'
  if (strength < 50) return 'strength-fair'
  if (strength < 75) return 'strength-good'
  return 'strength-strong'
}

function getPasswordStrengthWidth() {
  return `${calculatePasswordStrength()}%`
}

function getPasswordStrengthText() {
  const strength = calculatePasswordStrength()
  if (strength < 25) return 'Débil'
  if (strength < 50) return 'Regular'
  if (strength < 75) return 'Buena'
  return 'Fuerte'
}

function calculatePasswordStrength() {
  const password = form.value.Password
  if (!password) return 0
  
  let strength = 0
  
  // Longitud
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 10
  
  // Mayúsculas
  if (/[A-Z]/.test(password)) strength += 15
  
  // Minúsculas
  if (/[a-z]/.test(password)) strength += 15
  
  // Números
  if (/\d/.test(password)) strength += 15
  
  // Símbolos
  if (/[^A-Za-z0-9]/.test(password)) strength += 20
  
  return Math.min(strength, 100)
}

function getPermisosPreview() {
  const permisosPorRol = {
    'Administrador': {
      'Gestión de Usuarios': [
        { id: 'user_create', nombre: 'Crear usuarios', granted: true },
        { id: 'user_edit', nombre: 'Editar usuarios', granted: true },
        { id: 'user_delete', nombre: 'Eliminar usuarios', granted: true },
        { id: 'user_permissions', nombre: 'Gestionar permisos', granted: true }
      ],
      'Gestión de Incidentes': [
        { id: 'incident_create', nombre: 'Crear incidentes', granted: true },
        { id: 'incident_edit', nombre: 'Editar incidentes', granted: true },
        { id: 'incident_delete', nombre: 'Eliminar incidentes', granted: true },
        { id: 'incident_anci', nombre: 'Transformar a ANCI', granted: true }
      ],
      'Administración': [
        { id: 'admin_config', nombre: 'Configuración sistema', granted: true },
        { id: 'admin_reports', nombre: 'Reportes avanzados', granted: true },
        { id: 'admin_audit', nombre: 'Logs de auditoría', granted: true }
      ]
    },
    'Supervisor': {
      'Gestión de Usuarios': [
        { id: 'user_create', nombre: 'Crear usuarios', granted: true },
        { id: 'user_edit', nombre: 'Editar usuarios', granted: true },
        { id: 'user_delete', nombre: 'Eliminar usuarios', granted: false },
        { id: 'user_permissions', nombre: 'Gestionar permisos', granted: false }
      ],
      'Gestión de Incidentes': [
        { id: 'incident_create', nombre: 'Crear incidentes', granted: true },
        { id: 'incident_edit', nombre: 'Editar incidentes', granted: true },
        { id: 'incident_delete', nombre: 'Eliminar incidentes', granted: false },
        { id: 'incident_anci', nombre: 'Transformar a ANCI', granted: true }
      ]
    },
    'Usuario': {
      'Gestión de Incidentes': [
        { id: 'incident_create', nombre: 'Crear incidentes', granted: true },
        { id: 'incident_edit', nombre: 'Editar propios', granted: true },
        { id: 'incident_view', nombre: 'Ver incidentes', granted: true }
      ],
      'Cumplimiento': [
        { id: 'compliance_view', nombre: 'Ver cumplimiento', granted: true },
        { id: 'compliance_upload', nombre: 'Subir evidencias', granted: true }
      ]
    },
    'Operador': {
      'Gestión de Incidentes': [
        { id: 'incident_create', nombre: 'Crear incidentes', granted: true },
        { id: 'incident_edit', nombre: 'Editar incidentes', granted: true },
        { id: 'incident_view', nombre: 'Ver todos', granted: true }
      ]
    },
    'Auditor': {
      'Auditoría': [
        { id: 'audit_view', nombre: 'Ver logs', granted: true },
        { id: 'audit_export', nombre: 'Exportar reportes', granted: true },
        { id: 'compliance_audit', nombre: 'Auditar cumplimiento', granted: true }
      ]
    }
  }
  
  const iconosPorCategoria = {
    'Gestión de Usuarios': 'ph ph-users',
    'Gestión de Incidentes': 'ph ph-warning-circle',
    'Administración': 'ph ph-gear',
    'Cumplimiento': 'ph ph-shield-check',
    'Auditoría': 'ph ph-magnifying-glass'
  }
  
  const permisos = permisosPorRol[form.value.Rol] || {}
  
  return Object.entries(permisos).map(([categoria, permisosList]) => ({
    nombre: categoria,
    icono: iconosPorCategoria[categoria] || 'ph ph-list',
    permisos: permisosList
  }))
}

function formatearFecha(fecha) {
  if (!fecha) return 'Nunca'
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function guardarUsuario() {
  // Validar formulario
  validarEmail()
  
  if (!formularioValido.value) {
    return
  }
  
  guardando.value = true
  
  try {
    const datosUsuario = { ...form.value }
    
    // Limpiar datos vacíos
    Object.keys(datosUsuario).forEach(key => {
      if (datosUsuario[key] === '' || datosUsuario[key] === null) {
        delete datosUsuario[key]
      }
    })
    
    emit('guardar', datosUsuario)
    
  } catch (error) {
    console.error('Error en guardarUsuario:', error)
  } finally {
    guardando.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (props.usuario) {
    cargarDatosUsuario()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1.5rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  position: relative;
  padding: 2rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.header-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 25%);
  animation: float 20s linear infinite;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 1.5rem;
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
  flex-shrink: 0;
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.125rem;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93c5fd;
  font-size: 1.125rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.span-2 {
  grid-column: span 2;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-input {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-input::placeholder {
  color: #64748b;
}

.form-select {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  transition: all 0.2s;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #93c5fd;
}

.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-weak {
  background: #ef4444;
}

.strength-fair {
  background: #f59e0b;
}

.strength-good {
  background: #3b82f6;
}

.strength-strong {
  background: #10b981;
}

.strength-text {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  min-width: 60px;
}

.radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.radio-option:hover {
  background: rgba(59, 130, 246, 0.1);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #64748b;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #3b82f6;
  background: #3b82f6;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.radio-label {
  color: #e2e8f0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.checkbox-option:hover {
  background: rgba(59, 130, 246, 0.1);
}

.checkbox-option input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #64748b;
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s;
}

.checkbox-option input[type="checkbox"]:checked + .checkbox-custom {
  border-color: #3b82f6;
  background: #3b82f6;
}

.checkbox-option input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.checkbox-label {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.form-help {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  font-style: italic;
}

.form-error {
  color: #fca5a5;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.permissions-preview {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.permission-category {
  margin-bottom: 1.5rem;
}

.permission-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.permissions-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.permission-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.permission-item.granted {
  background: rgba(16, 185, 129, 0.1);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.permission-item:not(.granted) {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  background: rgba(30, 41, 59, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.footer-actions {
  display: flex;
  gap: 1rem;
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

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.5);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.ph-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0% { transform: translateX(0) translateY(0); }
  100% { transform: translateX(-25px) translateY(-25px); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.span-2 {
    grid-column: span 1;
  }
  
  .radio-group {
    flex-direction: column;
  }
  
  .permissions-list {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: center;
  }
}
</style>