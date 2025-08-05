<template>
  <div class="accesos-clientes-module">
    <!-- Header del módulo -->
    <div class="module-header">
      <div class="header-background">
        <div class="security-grid"></div>
        <div class="floating-particles">
          <div v-for="i in 15" :key="i" class="particle" :style="getParticleStyle(i)"></div>
        </div>
      </div>
      
      <div class="header-content">
        <button @click="goBack" class="btn-back">
          <i class="ph ph-arrow-left"></i>
          <span>Volver al Dashboard</span>
        </button>
        
        <div class="title-section">
          <div class="security-emblem">
            <div class="emblem-rings">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
            </div>
            <i class="ph ph-users emblem-icon"></i>
          </div>
          
          <div class="title-info">
            <h1 class="module-title">Accesos Clientes</h1>
            <p class="module-subtitle">Gestión de usuarios y permisos para acceso de clientes</p>
          </div>
        </div>
        
        <!-- Indicadores de estado -->
        <div class="live-indicators">
          <div class="indicator" :class="{ active: estadisticas.total_usuarios > 0 }">
            <i class="ph ph-users"></i>
            <span>{{ estadisticas.total_usuarios }} Usuarios</span>
          </div>
          <div class="indicator" :class="{ active: estadisticas.inquilinos_configurados > 0 }">
            <i class="ph ph-building-office"></i>
            <span>{{ estadisticas.inquilinos_configurados }} Inquilinos</span>
          </div>
          <div class="indicator" :class="{ active: estadisticas.solicitudes_pendientes > 0 }">
            <i class="ph ph-clock"></i>
            <span>{{ estadisticas.solicitudes_pendientes }} Pendientes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de control principal -->
    <div class="control-panel">
      <!-- Pestañas de navegación -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </button>
        </div>
      </div>

      <!-- Contenido de las pestañas -->
      <div class="tab-content">
        <!-- Pestaña de Inquilinos -->
        <div v-if="activeTab === 'inquilinos'" class="tab-panel">
          <div class="panel-header">
            <h2>Configuración de Inquilinos</h2>
            <button @click="refreshInquilinos" class="btn-refresh">
              <i class="ph ph-arrow-clockwise"></i>
              Actualizar
            </button>
          </div>
          
          <div class="inquilinos-grid">
            <div v-for="inquilino in inquilinos" :key="inquilino.InquilinoID" class="inquilino-card">
              <div class="card-header">
                <div class="inquilino-info">
                  <h3>{{ inquilino.NombreInquilino }}</h3>
                  <p class="rut">{{ inquilino.RUT }}</p>
                  <span class="total-usuarios">{{ inquilino.TotalUsuarios }} usuarios</span>
                </div>
                <div class="card-actions">
                  <button @click="configurarInquilino(inquilino)" class="btn-config">
                    <i class="ph ph-gear"></i>
                  </button>
                  <button @click="verUsuarios(inquilino)" class="btn-users">
                    <i class="ph ph-users"></i>
                  </button>
                </div>
              </div>
              
              <div class="card-body">
                <div class="config-status">
                  <div class="status-item">
                    <span class="label">Tipo de Acceso:</span>
                    <span class="value" :class="getAccessTypeClass(inquilino.TipoAcceso)">
                      {{ inquilino.TipoAcceso === 1 ? 'Vista Completa' : 'Vista Segmentada' }}
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="label">Crear Usuarios:</span>
                    <span class="value" :class="{ enabled: inquilino.PermiteCrearUsuarios }">
                      {{ inquilino.PermiteCrearUsuarios ? 'Habilitado' : 'Deshabilitado' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña de Usuarios -->
        <div v-if="activeTab === 'usuarios'" class="tab-panel">
          <div class="panel-header">
            <h2>Gestión de Usuarios Cliente</h2>
            <div class="header-actions">
              <button @click="openCreateUserModal" class="btn-create">
                <i class="ph ph-user-plus"></i>
                Nuevo Usuario
              </button>
              <button @click="refreshUsuarios" class="btn-refresh">
                <i class="ph ph-arrow-clockwise"></i>
                Actualizar
              </button>
            </div>
          </div>
          
          <!-- Filtros -->
          <div class="filters-section">
            <div class="search-container">
              <i class="ph ph-magnifying-glass search-icon"></i>
              <input autocomplete="off" v-model="searchQuery" 
                type="text" 
                placeholder="Buscar usuarios..."
                class="search-input"
              >
            </div>
            <div class="filter-chips">
              <button 
                v-for="rol in roles" 
                :key="rol.RolID"
                @click="toggleRoleFilter(rol.RolID)"
                class="filter-chip"
                :class="{ active: activeRoleFilters.includes(rol.RolID) }"
              >
                {{ rol.NombreRol }}
              </button>
            </div>
          </div>
          
          <!-- Tabla de usuarios -->
          <div class="usuarios-table-container">
            <table class="usuarios-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Inquilino</th>
                  <th>Empresa</th>
                  <th>Rol</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in filteredUsuarios" :key="usuario.UsuarioClienteID">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">
                        <i class="ph ph-user"></i>
                      </div>
                      <div class="user-info">
                        <strong>{{ usuario.NombreCompleto }}</strong>
                        <span class="email">{{ usuario.Email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ usuario.NombreInquilino }}</td>
                  <td>{{ usuario.NombreEmpresa || 'N/A' }}</td>
                  <td>
                    <span class="role-badge" :class="getRoleBadgeClass(usuario.NombreRol)">
                      {{ usuario.NombreRol }}
                    </span>
                  </td>
                  <td>{{ usuario.TipoUsuario }}</td>
                  <td>
                    <span class="status-badge" :class="getStatusBadgeClass(usuario.Estado)">
                      {{ usuario.Estado }}
                    </span>
                  </td>
                  <td>{{ formatDate(usuario.UltimoAcceso) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editarUsuario(usuario)" class="btn-action edit">
                        <i class="ph ph-pencil"></i>
                      </button>
                      <button @click="resetPassword(usuario)" class="btn-action reset">
                        <i class="ph ph-key"></i>
                      </button>
                      <button @click="toggleUserStatus(usuario)" class="btn-action toggle">
                        <i :class="usuario.Estado === 'Activo' ? 'ph ph-pause' : 'ph ph-play'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pestaña de Roles -->
        <div v-if="activeTab === 'roles'" class="tab-panel">
          <div class="panel-header">
            <h2>Configuración de Roles</h2>
          </div>
          
          <div class="roles-grid">
            <div v-for="rol in roles" :key="rol.RolID" class="role-card">
              <div class="role-header">
                <h3>{{ rol.NombreRol }}</h3>
                <div class="role-icon" :class="getRoleIconClass(rol.NombreRol)">
                  <i :class="getRoleIcon(rol.NombreRol)"></i>
                </div>
              </div>
              
              <div class="role-body">
                <p class="role-description">{{ rol.Descripcion }}</p>
                
                <div class="permissions-list">
                  <div v-if="rol.AccesoAcompanamiento" class="permission-item">
                    <i class="ph ph-handshake"></i>
                    <span>Acompañamiento</span>
                  </div>
                  <div v-if="rol.AccesoIncidentes" class="permission-item">
                    <i class="ph ph-warning"></i>
                    <span>Incidentes</span>
                  </div>
                  <div v-if="rol.AccesoInformesANCI" class="permission-item">
                    <i class="ph ph-file-text"></i>
                    <span>Informes ANCI</span>
                  </div>
                  <div v-if="rol.AccesoTodosModulos" class="permission-item">
                    <i class="ph ph-squares-four"></i>
                    <span>Todos los módulos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña de Autorizaciones -->
        <div v-if="activeTab === 'autorizaciones'" class="tab-panel">
          <div class="panel-header">
            <h2>Solicitudes de Autorización</h2>
          </div>
          
          <div class="authorization-list">
            <div v-if="solicitudesAutorizacion.length === 0" class="empty-state">
              <i class="ph ph-check-circle"></i>
              <p>No hay solicitudes pendientes de autorización</p>
            </div>
            
            <div v-for="solicitud in solicitudesAutorizacion" :key="solicitud.SolicitudID" class="authorization-item">
              <div class="auth-header">
                <div class="auth-type">
                  <i class="ph ph-key"></i>
                  <span>{{ solicitud.TipoSolicitud }}</span>
                </div>
                <div class="auth-status">
                  <span class="status-badge" :class="getAuthStatusClass(solicitud.Estado)">
                    {{ solicitud.Estado }}
                  </span>
                </div>
              </div>
              
              <div class="auth-body">
                <p><strong>Usuario:</strong> {{ solicitud.NombreUsuario }}</p>
                <p><strong>Solicitante:</strong> {{ solicitud.NombreSolicitante }}</p>
                <p><strong>Motivo:</strong> {{ solicitud.Motivo }}</p>
                <p><strong>Fecha:</strong> {{ formatDate(solicitud.FechaCreacion) }}</p>
              </div>
              
              <div class="auth-actions" v-if="solicitud.Estado === 'Pendiente'">
                <button @click="procesarAutorizacion(solicitud)" class="btn-authorize">
                  <i class="ph ph-check"></i>
                  Autorizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración de Inquilino -->
    <div v-if="showConfigModal" class="modal-overlay" @click="closeConfigModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Configurar Inquilino</h3>
          <button @click="closeConfigModal" class="btn-close">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Tipo de Acceso</label>
            <div class="radio-group">
              <label class="radio-option">
                <input autocomplete="off" type="radio" 
                  v-model="configForm.tipo_acceso" 
                  :value="1"
                >
                <span class="radio-label">Vista Completa</span>
                <small>El inquilino puede ver todas sus empresas con una sola cuenta</small>
              </label>
              <label class="radio-option">
                <input autocomplete="off" type="radio" 
                  v-model="configForm.tipo_acceso" 
                  :value="2"
                >
                <span class="radio-label">Vista Segmentada</span>
                <small>Cuenta principal del inquilino + cuentas separadas por empresa</small>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-option">
              <input autocomplete="off" type="checkbox" 
                v-model="configForm.permite_crear_usuarios"
              >
              <span class="checkbox-label">Permitir crear usuarios</span>
              <small>El inquilino puede crear cuentas para sus empresas</small>
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeConfigModal" class="btn-cancel">Cancelar</button>
          <button @click="saveConfig" class="btn-save">Guardar Configuración</button>
        </div>
      </div>
    </div>

    <!-- Modal de Autorización -->
    <div v-if="showAuthModal" class="modal-overlay" @click="closeAuthModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Autorizar Solicitud</h3>
          <button @click="closeAuthModal" class="btn-close">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="auth-info">
            <p><strong>Se ha enviado un código de autorización al email del inquilino principal.</strong></p>
            <p>Ingrese el código recibido para autorizar la solicitud:</p>
          </div>
          
          <div class="form-group">
            <label>Código de Autorización</label>
            <input autocomplete="off" type="text" 
              v-model="authCode" 
              placeholder="Ingrese el código de 6 dígitos"
              class="auth-input"
              maxlength="6"
            >
          </div>
          
          <div class="demo-notice">
            <p><strong>Modo Demo:</strong> Código: {{ demoAuthCode }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeAuthModal" class="btn-cancel">Cancelar</button>
          <button @click="confirmAuthorization" class="btn-authorize">Autorizar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Estado reactivo
const activeTab = ref('inquilinos')
const inquilinos = ref([])
const usuarios = ref([])
const roles = ref([])
const estadisticas = ref({
  total_usuarios: 0,
  inquilinos_configurados: 0,
  solicitudes_pendientes: 0
})
const solicitudesAutorizacion = ref([])

// Filtros y búsqueda
const searchQuery = ref('')
const activeRoleFilters = ref([])

// Modales
const showConfigModal = ref(false)
const showAuthModal = ref(false)
const currentInquilino = ref(null)
const currentSolicitud = ref(null)
const authCode = ref('')
const demoAuthCode = ref('')

// Formularios
const configForm = ref({
  tipo_acceso: 1,
  permite_crear_usuarios: true
})

// Configuración de pestañas
const tabs = [
  { id: 'inquilinos', name: 'Inquilinos', icon: 'ph ph-building-office' },
  { id: 'usuarios', name: 'Usuarios', icon: 'ph ph-users' },
  { id: 'roles', name: 'Roles', icon: 'ph ph-shield' },
  { id: 'autorizaciones', name: 'Autorizaciones', icon: 'ph ph-key' }
]

// Computed properties
const filteredUsuarios = computed(() => {
  let filtered = usuarios.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(usuario => 
      usuario.NombreCompleto.toLowerCase().includes(query) ||
      usuario.Email.toLowerCase().includes(query) ||
      usuario.NombreInquilino.toLowerCase().includes(query)
    )
  }

  // Filtro por roles
  if (activeRoleFilters.value.length > 0) {
    filtered = filtered.filter(usuario => 
      activeRoleFilters.value.includes(usuario.RolID)
    )
  }

  return filtered
})

// Métodos
function goBack() {
  router.push('/admin')
}

function getParticleStyle(index) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    backgroundColor: colors[index % colors.length]
  }
}

async function loadData() {
  try {
    await Promise.all([
      loadInquilinos(),
      loadUsuarios(),
      loadRoles(),
      loadEstadisticas()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

async function loadInquilinos() {
  try {
    const response = await axios.get('/api/admin/accesos-clientes/inquilinos')
    inquilinos.value = response.data
  } catch (error) {
    console.error('Error loading inquilinos:', error)
  }
}

async function loadUsuarios() {
  try {
    const response = await axios.get('/api/admin/accesos-clientes/usuarios')
    usuarios.value = response.data
  } catch (error) {
    console.error('Error loading usuarios:', error)
  }
}

async function loadRoles() {
  try {
    const response = await axios.get('/api/admin/accesos-clientes/roles')
    roles.value = response.data
  } catch (error) {
    console.error('Error loading roles:', error)
  }
}

async function loadEstadisticas() {
  try {
    const response = await axios.get('/api/admin/accesos-clientes/estadisticas')
    estadisticas.value = response.data
  } catch (error) {
    console.error('Error loading estadisticas:', error)
  }
}

function refreshInquilinos() {
  loadInquilinos()
}

function refreshUsuarios() {
  loadUsuarios()
}

function configurarInquilino(inquilino) {
  currentInquilino.value = inquilino
  configForm.value = {
    tipo_acceso: inquilino.TipoAcceso,
    permite_crear_usuarios: inquilino.PermiteCrearUsuarios
  }
  showConfigModal.value = true
}

function closeConfigModal() {
  showConfigModal.value = false
  currentInquilino.value = null
}

async function saveConfig() {
  try {
    await axios.post(`/api/admin/accesos-clientes/inquilinos/${currentInquilino.value.InquilinoID}/config`, configForm.value)
    
    // Actualizar la lista
    await loadInquilinos()
    closeConfigModal()
    
    // Mostrar notificación de éxito
    // TODO: Implementar sistema de notificaciones
    
  } catch (error) {
    console.error('Error saving config:', error)
  }
}

function verUsuarios(inquilino) {
  // Filtrar usuarios por inquilino
  activeTab.value = 'usuarios'
  searchQuery.value = inquilino.NombreInquilino
}

function toggleRoleFilter(rolId) {
  const index = activeRoleFilters.value.indexOf(rolId)
  if (index > -1) {
    activeRoleFilters.value.splice(index, 1)
  } else {
    activeRoleFilters.value.push(rolId)
  }
}

function openCreateUserModal() {
  // TODO: Implementar modal de creación de usuario
}

function editarUsuario(usuario) {
  // TODO: Implementar edición de usuario
}

async function resetPassword(usuario) {
  try {
    const response = await axios.post(`/api/admin/accesos-clientes/usuarios/${usuario.UsuarioClienteID}/solicitar-reset`, {
      motivo: 'Reseteo de contraseña solicitado por administrador'
    })
    
    currentSolicitud.value = response.data
    demoAuthCode.value = response.data.codigo_demo
    showAuthModal.value = true
    
  } catch (error) {
    console.error('Error requesting password reset:', error)
  }
}

function toggleUserStatus(usuario) {
  // TODO: Implementar cambio de estado
}

function procesarAutorizacion(solicitud) {
  currentSolicitud.value = solicitud
  showAuthModal.value = true
}

function closeAuthModal() {
  showAuthModal.value = false
  currentSolicitud.value = null
  authCode.value = ''
  demoAuthCode.value = ''
}

async function confirmAuthorization() {
  try {
    const response = await axios.post(`/api/admin/accesos-clientes/autorizar/${currentSolicitud.value.solicitud_id}`, {
      codigo: authCode.value
    })
    
    if (response.data.success) {
      // Mostrar contraseña temporal si es reset de password
      if (response.data.nueva_password) {
        alert(`Nueva contraseña generada: ${response.data.nueva_password}`)
      }
      
      closeAuthModal()
      loadData() // Recargar datos
    }
    
  } catch (error) {
    console.error('Error authorizing request:', error)
    alert('Error al autorizar la solicitud')
  }
}

// Métodos de utilidad
function getAccessTypeClass(tipo) {
  return tipo === 1 ? 'access-complete' : 'access-segmented'
}

function getRoleBadgeClass(rol) {
  const classes = {
    'Acompañamiento': 'role-acompanamiento',
    'Incidentes': 'role-incidentes',
    'General': 'role-general',
    'Administrador Inquilino': 'role-admin'
  }
  return classes[rol] || 'role-default'
}

function getStatusBadgeClass(estado) {
  const classes = {
    'Activo': 'status-active',
    'Inactivo': 'status-inactive',
    'Suspendido': 'status-suspended'
  }
  return classes[estado] || 'status-default'
}

function getRoleIconClass(rol) {
  const classes = {
    'Acompañamiento': 'role-icon-acompanamiento',
    'Incidentes': 'role-icon-incidentes',
    'General': 'role-icon-general',
    'Administrador Inquilino': 'role-icon-admin'
  }
  return classes[rol] || 'role-icon-default'
}

function getRoleIcon(rol) {
  const icons = {
    'Acompañamiento': 'ph ph-handshake',
    'Incidentes': 'ph ph-warning',
    'General': 'ph ph-squares-four',
    'Administrador Inquilino': 'ph ph-crown'
  }
  return icons[rol] || 'ph ph-shield'
}

function getAuthStatusClass(estado) {
  const classes = {
    'Pendiente': 'auth-pending',
    'Aprobada': 'auth-approved',
    'Rechazada': 'auth-rejected',
    'Expirada': 'auth-expired'
  }
  return classes[estado] || 'auth-default'
}

function formatDate(dateString) {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.accesos-clientes-module {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
}

/* Header styling */
.module-header {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
}

.security-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: grid-move 20s linear infinite;
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.header-content {
  position: relative;
  z-index: 2;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #93c5fd;
  text-decoration: none;
  transition: all 0.3s;
  margin-bottom: 2rem;
}

.btn-back:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateX(-5px);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.security-emblem {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emblem-rings {
  position: absolute;
  inset: 0;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  animation: ring-pulse 3s ease-in-out infinite;
}

.ring-1 {
  inset: 0;
  border-color: rgba(59, 130, 246, 0.6);
}

.ring-2 {
  inset: 8px;
  border-color: rgba(139, 92, 246, 0.4);
  animation-delay: 0.5s;
}

.ring-3 {
  inset: 16px;
  border-color: rgba(16, 185, 129, 0.3);
  animation-delay: 1s;
}

.emblem-icon {
  font-size: 2rem;
  color: #3b82f6;
  z-index: 1;
}

.module-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.module-subtitle {
  font-size: 1.125rem;
  color: #94a3b8;
}

.live-indicators {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  color: #94a3b8;
  transition: all 0.3s;
}

.indicator.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

/* Control panel */
.control-panel {
  padding: 2rem;
}

.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  padding-bottom: 0.5rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.tab-button:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
}

.tab-button.active {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border-bottom: 2px solid #3b82f6;
}

.tab-content {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh, .btn-create {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #93c5fd;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover, .btn-create:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

/* Inquilinos grid */
.inquilinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.inquilino-card {
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.inquilino-card:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.inquilino-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.inquilino-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.inquilino-info .rut {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.total-usuarios {
  display: inline-block;
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-config, .btn-users {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(71, 85, 105, 0.3);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-config:hover, .btn-users:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

.config-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item .label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.status-item .value {
  font-weight: 500;
  font-size: 0.875rem;
}

.access-complete {
  color: #10b981;
}

.access-segmented {
  color: #f59e0b;
}

.value.enabled {
  color: #10b981;
}

/* Filtros */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  color: white;
  placeholder-color: #94a3b8;
}

.search-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(71, 85, 105, 0.5);
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 0.5rem 1rem;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.375rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
}

.filter-chip:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
}

.filter-chip.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

/* Tabla de usuarios */
.usuarios-table-container {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(30, 41, 59, 0.5);
}

.usuarios-table th {
  background: rgba(71, 85, 105, 0.5);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.usuarios-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
}

.usuarios-table tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #93c5fd;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info strong {
  color: #e2e8f0;
  font-weight: 600;
}

.user-info .email {
  color: #94a3b8;
  font-size: 0.875rem;
}

.role-badge, .status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-acompanamiento {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.role-incidentes {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.role-general {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.role-admin {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
}

.status-active {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.status-inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.status-suspended {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  background: rgba(71, 85, 105, 0.3);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

.btn-action.reset:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fcd34d;
}

/* Roles grid */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.role-card {
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.role-card:hover {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.role-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.role-icon-acompanamiento {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.role-icon-incidentes {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.role-icon-general {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.role-icon-admin {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.role-description {
  color: #94a3b8;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.permission-item i {
  color: #3b82f6;
}

/* Authorization list */
.authorization-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.authorization-item {
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.auth-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-weight: 600;
}

.auth-body {
  margin-bottom: 1rem;
}

.auth-body p {
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

.auth-actions {
  display: flex;
  gap: 1rem;
}

.btn-authorize {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 0.5rem;
  color: #6ee7b7;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-authorize:hover {
  background: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.auth-pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.auth-approved {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.auth-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e2e8f0;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(71, 85, 105, 0.2);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.radio-option:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.radio-option input[type="radio"] {
  margin-top: 0.125rem;
}

.radio-label {
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.radio-option small {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.4;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label {
  font-weight: 500;
  color: #e2e8f0;
}

.checkbox-option small {
  color: #94a3b8;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}

.btn-cancel, .btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-cancel {
  background: rgba(71, 85, 105, 0.3);
  border-color: rgba(71, 85, 105, 0.5);
  color: #94a3b8;
}

.btn-cancel:hover {
  background: rgba(71, 85, 105, 0.5);
}

.btn-save {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #93c5fd;
}

.btn-save:hover {
  background: rgba(59, 130, 246, 0.3);
}

.auth-info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.auth-info p {
  margin-bottom: 0.5rem;
  color: #93c5fd;
}

.auth-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  color: white;
  font-size: 1.125rem;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.2em;
}

.auth-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(71, 85, 105, 0.5);
}

.demo-notice {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.demo-notice p {
  color: #fcd34d;
  margin: 0;
}

/* Animations */
@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.1) rotate(180deg); opacity: 0.7; }
}

/* Responsive */
@media (max-width: 768px) {
  .title-section {
    flex-direction: column;
    text-align: center;
  }

  .live-indicators {
    justify-content: center;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .panel-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .usuarios-table-container {
    font-size: 0.875rem;
  }

  .modal-content {
    margin: 1rem;
    max-width: none;
  }
}
</style>