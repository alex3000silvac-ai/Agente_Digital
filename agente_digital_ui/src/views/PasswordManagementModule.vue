<template>
  <div class="password-management-module">
    <!-- Header espectacular -->
    <div class="module-header">
      <div class="header-background">
        <div class="security-grid"></div>
        <div class="floating-particles">
          <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
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
            <i class="ph ph-shield-check emblem-icon"></i>
          </div>
          
          <div class="title-info">
            <h1 class="module-title">Centro de Gestión de Accesos</h1>
            <p class="module-subtitle">Sistema avanzado de seguridad y control de usuarios</p>
          </div>
        </div>
        
        <!-- Indicadores de seguridad en tiempo real -->
        <div class="live-security-indicators">
          <div class="indicator" :class="{ active: indicators.encryption }">
            <i class="ph ph-lock"></i>
            <span>Encriptación AES-256</span>
          </div>
          <div class="indicator" :class="{ active: indicators.mfa }">
            <i class="ph ph-device-mobile"></i>
            <span>MFA Habilitado</span>
          </div>
          <div class="indicator" :class="{ active: indicators.monitoring }">
            <i class="ph ph-eye"></i>
            <span>Monitoreo Activo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de control principal -->
    <div class="control-panel">
      <!-- Filtros y búsqueda -->
      <div class="control-bar">
        <div class="search-section">
          <div class="search-input-container">
            <i class="ph ph-magnifying-glass search-icon"></i>
            <input autocomplete="off" v-model="searchQuery" 
              type="text" 
              placeholder="Buscar usuarios por nombre, email o rol..."
              class="search-input"
              @input="filterUsers"
            >
          </div>
          
          <div class="filter-chips">
            <button 
              v-for="role in availableRoles" 
              :key="role.id"
              @click="toggleRoleFilter(role.id)"
              class="filter-chip"
              :class="{ active: activeFilters.includes(role.id) }"
            >
              <i :class="role.icon"></i>
              <span>{{ role.name }}</span>
            </button>
          </div>
        </div>
        
        <div class="action-section">
          <button @click="openCreateUserModal" class="btn-create">
            <i class="ph ph-user-plus"></i>
            <span>Nuevo Usuario</span>
          </button>
          
          <button @click="openSecurityReport" class="btn-report">
            <i class="ph ph-chart-bar"></i>
            <span>Reporte</span>
          </button>
          
          <button @click="clearLocalData" class="btn-clear" title="Limpiar datos locales">
            <i class="ph ph-trash"></i>
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="users-table-container">
        <div v-if="loading" class="loading-state">
          <div class="loading-animation">
            <div class="loading-rings">
              <div class="ring"></div>
              <div class="ring"></div>
              <div class="ring"></div>
            </div>
            <p>Cargando usuarios seguros...</p>
          </div>
        </div>
        
        <table v-else class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>MFA</th>
              <th>Contraseña</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-info">
                <div class="user-avatar" :class="getUserAvatarClass(user.role)">
                  <i :class="getRoleIcon(user.role)"></i>
                </div>
                <div class="user-details">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
              </td>
              
              <td>
                <div class="role-badge" :class="getRoleClass(user.role)">
                  <i :class="getRoleIcon(user.role)"></i>
                  <span>{{ user.role }}</span>
                </div>
              </td>
              
              <td>
                <div class="status-indicator" :class="getStatusClass(user)">
                  <div class="status-dot"></div>
                  <span>{{ getUserStatus(user) }}</span>
                </div>
              </td>
              
              <td class="last-access">{{ formatLastAccess(user.lastAccess) }}</td>
              
              <td>
                <div class="mfa-status" :class="{ enabled: user.mfaEnabled }">
                  <i :class="user.mfaEnabled ? 'ph ph-shield-check' : 'ph ph-shield-warning'"></i>
                  <span>{{ user.mfaEnabled ? 'Habilitado' : 'Deshabilitado' }}</span>
                </div>
              </td>
              
              <td>
                <div class="password-status" :class="getPasswordStatusClass(user)">
                  <i :class="getPasswordIcon(user)"></i>
                  <span>{{ getPasswordStatus(user) }}</span>
                  <div v-if="isPasswordExpiring(user)" class="expiry-countdown">
                    {{ getExpiryCountdown(user) }}
                  </div>
                </div>
              </td>
              
              <td>
                <div class="action-buttons">
                  <button @click="editUser(user)" class="action-btn edit" title="Editar Usuario">
                    <i class="ph ph-pencil"></i>
                  </button>
                  <button @click="resetPassword(user)" class="action-btn reset" title="Restablecer Contraseña">
                    <i class="ph ph-key"></i>
                  </button>
                  <button @click="toggleUserStatus(user)" class="action-btn toggle" :title="user.active ? 'Desactivar' : 'Activar'">
                    <i :class="user.active ? 'ph ph-pause' : 'ph ph-play'"></i>
                  </button>
                  <button v-if="canDeleteUser(user)" @click="deleteUser(user)" class="action-btn delete" title="Eliminar Usuario">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar usuario -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="modal-container user-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">
            <i class="ph ph-user-gear"></i>
          </div>
          <h3>{{ editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h3>
          <button @click="closeUserModal" class="close-btn">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveUser" class="user-form">
            <!-- Información básica -->
            <div class="form-section">
              <h4>Información Personal</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input autocomplete="off" v-model="userForm.name" type="text" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input autocomplete="off" v-model="userForm.email" type="email" required class="form-input">
                </div>
              </div>
            </div>
            
            <!-- Rol y permisos -->
            <div class="form-section">
              <h4>Rol y Permisos</h4>
              <div class="role-selection">
                <div v-for="role in availableRoles" :key="role.id" class="role-option">
                  <input autocomplete="off" v-model="userForm.role" 
                    :value="role.name" 
                    type="radio" 
                    :id="'role-' + role.id"
                    class="role-input"
                  >
                  <label :for="'role-' + role.id" class="role-label" :class="role.class">
                    <div class="role-icon">
                      <i :class="role.icon"></i>
                    </div>
                    <div class="role-info">
                      <span class="role-name">{{ role.name }}</span>
                      <span class="role-description">{{ role.description }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Configuración de seguridad -->
            <div class="form-section">
              <h4>Configuración de Seguridad</h4>
              <div class="security-options">
                <div class="security-option">
                  <input autocomplete="off" v-model="userForm.requirePasswordChange" type="checkbox" id="require-change" class="security-checkbox">
                  <label for="require-change" class="security-label">
                    <i class="ph ph-key"></i>
                    <span>Requerir cambio de contraseña en primer acceso</span>
                  </label>
                </div>
                
                <div class="security-option">
                  <input autocomplete="off" v-model="userForm.mfaEnabled" type="checkbox" id="enable-mfa" class="security-checkbox">
                  <label for="enable-mfa" class="security-label">
                    <i class="ph ph-device-mobile"></i>
                    <span>Habilitar autenticación de dos factores (MFA)</span>
                  </label>
                </div>
                
                <div class="security-option">
                  <input autocomplete="off" v-model="userForm.emailNotifications" type="checkbox" id="email-notifications" class="security-checkbox">
                  <label for="email-notifications" class="security-label">
                    <i class="ph ph-envelope"></i>
                    <span>Notificaciones de seguridad por email</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Configuración de contraseña -->
            <div v-if="!editingUser" class="form-section">
              <h4>Configuración de Contraseña</h4>
              
              <!-- Selector de tipo de contraseña -->
              <div class="password-type-selector">
                <div class="type-options">
                  <div class="type-option">
                    <input autocomplete="off" v-model="userForm.passwordType" 
                      value="temporary" 
                      type="radio" 
                      id="password-temporary"
                      class="type-input"
                    >
                    <label for="password-temporary" class="type-label">
                      <div class="type-icon temporary">
                        <i class="ph ph-clock"></i>
                      </div>
                      <div class="type-info">
                        <span class="type-name">Contraseña Temporal</span>
                        <span class="type-description">El usuario debe cambiarla en el primer acceso</span>
                      </div>
                    </label>
                  </div>
                  
                  <div class="type-option">
                    <input autocomplete="off" v-model="userForm.passwordType" 
                      value="permanent" 
                      type="radio" 
                      id="password-permanent"
                      class="type-input"
                    >
                    <label for="password-permanent" class="type-label">
                      <div class="type-icon permanent">
                        <i class="ph ph-shield-check"></i>
                      </div>
                      <div class="type-info">
                        <span class="type-name">Contraseña Definitiva</span>
                        <span class="type-description">Contraseña válida sin requerir cambio inmediato</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Generador/Input de contraseña -->
              <div class="password-configuration">
                <div class="password-display">
                  <input autocomplete="off" v-model="generatedPassword" 
                    :type="showPassword ? 'text' : 'password'"
                    :readonly="userForm.passwordMode === 'generated'"
                    class="password-input"
                    :placeholder="userForm.passwordMode === 'manual' ? 'Ingrese una contraseña...' : ''"
                    @input="onPasswordInput"
                  >
                  
                  <div class="password-controls">
                    <button @click="togglePasswordVisibility" type="button" class="control-btn visibility">
                      <i :class="showPassword ? 'ph ph-eye-slash' : 'ph ph-eye'"></i>
                    </button>
                    
                    <button 
                      v-if="userForm.passwordMode === 'generated'"
                      @click="generatePassword" 
                      type="button" 
                      class="control-btn generate"
                    >
                      <i class="ph ph-arrows-clockwise"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Modo de contraseña -->
                <div class="password-mode-toggle">
                  <button 
                    @click="selectPasswordMode('generated')" 
                    type="button" 
                    class="mode-btn mode-generated"
                    :class="{ active: userForm.passwordMode === 'generated' }"
                  >
                    <div class="mode-btn-content">
                      <div class="mode-icon-wrapper">
                        <i class="ph ph-robot mode-icon"></i>
                        <div class="mode-icon-bg"></div>
                      </div>
                      <div class="mode-info">
                        <span class="mode-title">Generación Automática</span>
                        <span class="mode-description">Crea una contraseña segura instantáneamente</span>
                      </div>
                      <div class="mode-badge" v-if="userForm.passwordMode === 'generated'">
                        <i class="ph ph-check-circle"></i>
                        <span>Activo</span>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    @click="selectPasswordMode('manual')" 
                    type="button" 
                    class="mode-btn mode-manual"
                    :class="{ active: userForm.passwordMode === 'manual' }"
                  >
                    <div class="mode-btn-content">
                      <div class="mode-icon-wrapper">
                        <i class="ph ph-pencil-simple mode-icon"></i>
                        <div class="mode-icon-bg"></div>
                      </div>
                      <div class="mode-info">
                        <span class="mode-title">Entrada Manual</span>
                        <span class="mode-description">Escribe tu propia contraseña personalizada</span>
                      </div>
                      <div class="mode-badge" v-if="userForm.passwordMode === 'manual'">
                        <i class="ph ph-check-circle"></i>
                        <span>Activo</span>
                      </div>
                    </div>
                  </button>
                </div>
                
                <!-- Medidor de fortaleza -->
                <div class="password-strength">
                  <div class="strength-bar">
                    <div class="strength-fill" :style="{ width: passwordStrength + '%' }" :class="getPasswordStrengthClass()"></div>
                  </div>
                  <div class="strength-info">
                    <span class="strength-text">{{ getPasswordStrengthText() }}</span>
                    <span class="strength-score">{{ passwordStrength }}/100</span>
                  </div>
                </div>
                
                <!-- Validaciones en tiempo real -->
                <div v-if="passwordValidation.errors.length > 0" class="password-validation">
                  <div class="validation-title">
                    <i class="ph ph-warning"></i>
                    <span>Requisitos de contraseña:</span>
                  </div>
                  <ul class="validation-list">
                    <li v-for="error in passwordValidation.errors" :key="error" class="validation-error">
                      <i class="ph ph-x"></i>
                      <span>{{ error }}</span>
                    </li>
                  </ul>
                </div>
                
                <!-- Información de expiración -->
                <div class="expiry-info">
                  <div class="expiry-setting">
                    <i class="ph ph-calendar"></i>
                    <span v-if="userForm.passwordType === 'temporary'">
                      Expira en: <strong>7 días</strong> (contraseña temporal)
                    </span>
                    <span v-else>
                      Expira en: <strong>90 días</strong> (contraseña definitiva)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="closeUserModal" type="button" class="btn-cancel">Cancelar</button>
          <button @click="saveUser" type="button" class="btn-save">
            <i class="ph ph-floppy-disk"></i>
            <span>{{ editingUser ? 'Actualizar' : 'Crear Usuario' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de creación exitosa -->
  <div v-if="showSuccessConfirmation" class="modal-overlay success-modal-overlay">
    <div class="modal-content success-modal-content">
      <div class="success-header">
        <div class="success-icon">
          <i class="ph ph-check-circle"></i>
        </div>
        <h3 class="success-title">¡Usuario Creado Exitosamente!</h3>
      </div>
      
      <div class="success-body">
        <div class="created-user-info">
          <div class="info-row">
            <span class="info-label">Nombre:</span>
            <span class="info-value">{{ createdUserInfo?.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ createdUserInfo?.email }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rol:</span>
            <span class="info-value">{{ createdUserInfo?.role }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo de Contraseña:</span>
            <span class="info-value">
              {{ createdUserInfo?.passwordType === 'temporary' ? 'Temporal (7 días)' : 'Definitiva (90 días)' }}
            </span>
          </div>
        </div>
        
        <div class="password-section">
          <div class="password-header">
            <h4>Contraseña Generada</h4>
            <p class="password-warning">
              <i class="ph ph-warning"></i>
              Guarda esta contraseña de forma segura. No se mostrará nuevamente.
            </p>
          </div>
          
          <div class="password-display">
            <div class="password-box">
              <code class="password-code">{{ createdUserInfo?.password }}</code>
              <button @click="copyPassword" class="copy-password-btn">
                <i class="ph ph-copy"></i>
                Copiar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="success-footer">
        <button @click="closeSuccessModal" class="btn-success-ok">
          <i class="ph ph-check"></i>
          Entendido
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación de actualización -->
  <div v-if="showUpdateConfirmation" class="notification-toast">
    <div class="toast-content">
      <i class="ph ph-check-circle toast-icon"></i>
      <span>Usuario actualizado exitosamente</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api.js';

const router = useRouter();

// Estados reactivos
const loading = ref(true);
const searchQuery = ref('');
const activeFilters = ref([]);
const users = ref([]);
const filteredUsers = ref([]);
const showUserModal = ref(false);
const editingUser = ref(null);
const generatedPassword = ref('');
const passwordStrength = ref(0);
const showPassword = ref(false);
const passwordValidation = ref({
  valid: false,
  errors: [],
  score: 0
});

// Estado para modales de confirmación
const showSuccessConfirmation = ref(false);
const createdUserInfo = ref(null);
const showUpdateConfirmation = ref(false);

// Indicadores de seguridad
const indicators = ref({
  encryption: true,
  mfa: true,
  monitoring: true
});

// Roles disponibles
const availableRoles = ref([
  {
    id: 'superuser',
    name: 'Superusuario',
    icon: 'ph ph-crown',
    class: 'role-super',
    description: 'Acceso completo a todos los módulos y funciones del sistema'
  },
  {
    id: 'admin',
    name: 'Administración',
    icon: 'ph ph-gear',
    class: 'role-admin',
    description: 'Gestión de empresas e inquilinos, sin acceso operativo'
  },
  {
    id: 'viewer',
    name: 'Consultas',
    icon: 'ph ph-eye',
    class: 'role-viewer',
    description: 'Solo lectura de incidentes, acompañamiento y datos maestros'
  }
]);

// Formulario de usuario
const userForm = ref({
  name: '',
  email: '',
  role: '',
  requirePasswordChange: true,
  mfaEnabled: false,
  emailNotifications: true,
  passwordType: 'temporary', // 'temporary' o 'permanent'
  passwordMode: 'generated' // 'generated' o 'manual'
});

// Funciones computadas
const passwordStrengthClass = computed(() => {
  if (passwordStrength.value >= 80) return 'strength-excellent';
  if (passwordStrength.value >= 60) return 'strength-good';
  if (passwordStrength.value >= 40) return 'strength-fair';
  return 'strength-weak';
});

// Métodos de utilidad
function getParticleStyle(index) {
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 5 + 's',
    animationDuration: (3 + Math.random() * 4) + 's'
  };
}

function getUserAvatarClass(role) {
  const roleMap = {
    'Superusuario': 'avatar-super',
    'Administración': 'avatar-admin',
    'Consultas': 'avatar-viewer'
  };
  return roleMap[role] || 'avatar-default';
}

function getRoleIcon(role) {
  const iconMap = {
    'Superusuario': 'ph ph-crown',
    'Administración': 'ph ph-gear',
    'Consultas': 'ph ph-eye'
  };
  return iconMap[role] || 'ph ph-user';
}

function getRoleClass(role) {
  const classMap = {
    'Superusuario': 'role-super',
    'Administración': 'role-admin',
    'Consultas': 'role-viewer'
  };
  return classMap[role] || 'role-default';
}

function getStatusClass(user) {
  if (!user.active) return 'status-inactive';
  if (user.locked) return 'status-locked';
  if (user.passwordExpired) return 'status-expired';
  return 'status-active';
}

function getUserStatus(user) {
  if (!user.active) return 'Inactivo';
  if (user.locked) return 'Bloqueado';
  if (user.passwordExpired) return 'Contraseña Vencida';
  return 'Activo';
}

function getPasswordStatusClass(user) {
  if (user.passwordExpired) return 'password-expired';
  if (isPasswordExpiring(user)) return 'password-expiring';
  return 'password-valid';
}

function getPasswordIcon(user) {
  if (user.passwordExpired) return 'ph ph-warning-octagon';
  if (isPasswordExpiring(user)) return 'ph ph-warning';
  return 'ph ph-check-circle';
}

function getPasswordStatus(user) {
  if (user.passwordExpired) return 'Vencida';
  if (isPasswordExpiring(user)) return 'Por vencer';
  return 'Válida';
}

function isPasswordExpiring(user) {
  if (!user.passwordExpiry) return false;
  const expiryDate = new Date(user.passwordExpiry);
  const now = new Date();
  const daysToExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  return daysToExpiry <= 7 && daysToExpiry > 0;
}

function getExpiryCountdown(user) {
  if (!user.passwordExpiry) return '';
  const expiryDate = new Date(user.passwordExpiry);
  const now = new Date();
  const daysToExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  if (daysToExpiry <= 0) return 'Vencida';
  return `${daysToExpiry} día${daysToExpiry !== 1 ? 's' : ''}`;
}

function formatLastAccess(date) {
  if (!date) return 'Nunca';
  return new Date(date).toLocaleDateString('es-CL');
}

function canDeleteUser(user) {
  // Lógica para determinar si se puede eliminar el usuario
  return user.role !== 'Superusuario' || users.value.filter(u => u.role === 'Superusuario').length > 1;
}

function getPasswordStrengthClass() {
  if (passwordStrength.value >= 80) return 'strength-excellent';
  if (passwordStrength.value >= 60) return 'strength-good';
  if (passwordStrength.value >= 40) return 'strength-fair';
  return 'strength-weak';
}

function getPasswordStrengthText() {
  if (passwordStrength.value >= 80) return 'Excelente';
  if (passwordStrength.value >= 60) return 'Buena';
  if (passwordStrength.value >= 40) return 'Regular';
  return 'Débil';
}

// Métodos de acción
function goBack() {
  router.push('/admin/dashboard');
}

function toggleRoleFilter(roleId) {
  const index = activeFilters.value.indexOf(roleId);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(roleId);
  }
  filterUsers();
}

function filterUsers() {
  let filtered = users.value;
  
  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }
  
  // Filtrar por roles
  if (activeFilters.value.length > 0) {
    const roleNames = activeFilters.value.map(id => 
      availableRoles.value.find(r => r.id === id)?.name
    );
    filtered = filtered.filter(user => roleNames.includes(user.role));
  }
  
  filteredUsers.value = filtered;
}

function openCreateUserModal() {
  editingUser.value = null;
  userForm.value = {
    name: '',
    email: '',
    role: '',
    requirePasswordChange: true,
    mfaEnabled: false,
    emailNotifications: true,
    passwordType: 'temporary',
    passwordMode: 'generated'
  };
  generatePassword();
  showUserModal.value = true;
}

function editUser(user) {
  editingUser.value = user;
  userForm.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    requirePasswordChange: user.requirePasswordChange,
    mfaEnabled: user.mfaEnabled,
    emailNotifications: user.emailNotifications
  };
  showUserModal.value = true;
}

function closeUserModal() {
  showUserModal.value = false;
  editingUser.value = null;
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  generatedPassword.value = password;
  calculatePasswordStrength(password);
  validatePasswordRealTime(password); // Validar inmediatamente
}

function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 30;
  passwordStrength.value = Math.min(strength, 100);
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

// Debounce timer
let passwordValidationTimer = null;

function onPasswordInput(event) {
  const password = event.target.value;
  generatedPassword.value = password;
  
  // Cancelar validación anterior
  if (passwordValidationTimer) {
    clearTimeout(passwordValidationTimer);
  }
  
  // Validación local inmediata
  calculatePasswordStrength(password);
  
  // Validación del servidor con debounce
  passwordValidationTimer = setTimeout(() => {
    validatePasswordRealTime(password);
  }, 500); // Esperar 500ms después de que el usuario deje de escribir
}

function validatePasswordRealTime(password) {
  if (!password) {
    passwordValidation.value = { valid: false, errors: [], score: 0 };
    passwordStrength.value = 0;
    return;
  }
  
  // Solo validar si la contraseña tiene al menos 3 caracteres
  if (password.length < 3) {
    passwordValidation.value = { valid: false, errors: ['Muy corta'], score: 0 };
    return;
  }
  
  // Recalcular strength primero
  calculatePasswordStrength(password);
  
  // Validación local completa (sin llamadas al servidor)
  const errors = [];
  
  // Validaciones básicas
  if (password.length < 12) errors.push('Mínimo 12 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Debe incluir mayúsculas');
  if (!/[a-z]/.test(password)) errors.push('Debe incluir minúsculas');
  if (!/[0-9]/.test(password)) errors.push('Debe incluir números');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Debe incluir caracteres especiales');
  
  // Verificar patrones comunes muy específicos
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', '111111', '000000'];
  const lowerPassword = password.toLowerCase();
  
  // Solo marcar como patrón común si la contraseña ES exactamente el patrón o lo contiene literalmente
  const hasCommonPattern = commonPatterns.some(pattern => {
    return lowerPassword === pattern || 
           (pattern.length >= 6 && lowerPassword.includes(pattern));
  });
  
  // No penalizar por "admin" si está seguido de números/símbolos complejos
  if (hasCommonPattern && !(/admin\d{4,}/.test(lowerPassword))) {
    errors.push('No debe contener patrones comunes');
  }
  
  // Determinar si es válida
  const isValid = errors.length === 0;
  
  // Debug temporal para contraseñas problemáticas
  if (password === 'Admin20252024@') {
    console.log('Debug Admin20252024@:', {
      length: password.length,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      errors: errors,
      isValid: isValid,
      score: passwordStrength.value
    });
  }
  
  passwordValidation.value = {
    valid: isValid,
    errors: errors,
    score: passwordStrength.value
  };
}

async function saveUser() {
  try {
    // Validar contraseña antes de enviar (solo en modo manual)
    if (!editingUser.value && userForm.value.passwordMode === 'manual') {
      if (!generatedPassword.value || generatedPassword.value.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      // Validación más permisiva para modo manual - solo requisitos básicos
      const password = generatedPassword.value;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);
      
      // Solo requiere 3 de 4 criterios para ser más flexible
      const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
      
      if (criteriaCount < 3) {
        alert('La contraseña debe incluir al menos 3 de estos: mayúsculas, minúsculas, números, caracteres especiales');
        return;
      }
    }
    
    const userData = {
      ...userForm.value
    };
    
    // Solo incluir contraseña en creación
    if (!editingUser.value) {
      userData.password = generatedPassword.value;
      
      // Configurar según el tipo de contraseña
      if (userForm.value.passwordType === 'temporary') {
        userData.requirePasswordChange = true;
        userData.passwordExpiryDays = 7; // Temporal expira en 7 días
      } else {
        userData.requirePasswordChange = false;
        userData.passwordExpiryDays = 90; // Definitiva expira en 90 días
      }
    }
    
    // Modo demostración - trabajar localmente
    if (!editingUser.value) {
      // Crear nuevo usuario
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        active: true,
        locked: false,
        lastAccess: null,
        passwordExpiry: new Date(Date.now() + userData.passwordExpiryDays * 24 * 60 * 60 * 1000).toISOString(),
        passwordExpired: false,
        mfaEnabled: userData.mfaEnabled,
        requirePasswordChange: userData.requirePasswordChange,
        emailNotifications: userData.emailNotifications,
        createdDate: new Date().toISOString()
      };
      users.value.push(newUser);
      filteredUsers.value = [...users.value];
      
      // Guardar en localStorage
      localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
    } else {
      // Editar usuario existente
      const index = users.value.findIndex(u => u.id === editingUser.value.id);
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          name: userData.name,
          email: userData.email,
          role: userData.role,
          mfaEnabled: userData.mfaEnabled,
          emailNotifications: userData.emailNotifications
        };
        filteredUsers.value = [...users.value];
        
        // Guardar en localStorage
        localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
      }
    }
    
    closeUserModal();
    
    // Mostrar confirmación con modal elegante
    if (!editingUser.value) {
      userData.password = generatedPassword.value; // Asegurar que se muestre la contraseña
      showSuccessModal(userData);
    } else {
      showUpdateSuccessModal();
    }
    
  } catch (error) {
    console.error('Error saving user:', error);
    alert('Error al guardar usuario: ' + (error.response?.data?.error || error.message));
  }
}

function resetPassword(user) {
  // Generar nueva contraseña temporal
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let tempPassword = '';
  for (let i = 0; i < 12; i++) {
    tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Actualizar usuario localmente
  const index = users.value.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      requirePasswordChange: true,
      passwordExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      locked: false
    };
    filteredUsers.value = [...users.value];
    
    // Guardar en localStorage
    localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
  }
  
  alert(`Contraseña temporal generada: ${tempPassword}\n\n¡Guárdala de forma segura!`);
}

function selectPasswordMode(mode) {
  userForm.value.passwordMode = mode;
  if (mode === 'generated') {
    generatePassword();
  } else {
    generatedPassword.value = '';
    passwordValidation.value = { valid: false, errors: ['Ingresa una contraseña'], score: 0 };
    passwordStrength.value = 0;
  }
}

function showSuccessModal(userData) {
  createdUserInfo.value = {
    name: userData.name,
    email: userData.email,
    role: userData.role,
    password: userData.password,
    passwordType: userData.passwordType,
    expiryDays: userData.passwordExpiryDays
  };
  showSuccessConfirmation.value = true;
}

function showUpdateSuccessModal() {
  showUpdateConfirmation.value = true;
  setTimeout(() => {
    showUpdateConfirmation.value = false;
  }, 3000);
}

function closeSuccessModal() {
  showSuccessConfirmation.value = false;
  createdUserInfo.value = null;
}

function copyPassword() {
  if (createdUserInfo.value?.password) {
    navigator.clipboard.writeText(createdUserInfo.value.password);
    // Feedback visual
    const button = document.querySelector('.copy-password-btn');
    if (button) {
      button.textContent = '¡Copiado!';
      setTimeout(() => {
        button.innerHTML = '<i class="ph ph-copy"></i> Copiar Contraseña';
      }, 2000);
    }
  }
}

function toggleUserStatus(user) {
  const index = users.value.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users.value[index] = {
      ...users.value[index],
      active: !users.value[index].active
    };
    filteredUsers.value = [...users.value];
    
    // Guardar en localStorage
    localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
  }
}

function deleteUser(user) {
  if (confirm(`¿Está seguro de que desea eliminar a ${user.name}?`)) {
    // Verificar que no sea el último superusuario
    const superUsers = users.value.filter(u => u.role === 'Superusuario' && u.active);
    if (user.role === 'Superusuario' && superUsers.length === 1) {
      alert('No se puede eliminar el último superusuario del sistema');
      return;
    }
    
    const index = users.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users.value.splice(index, 1);
      filteredUsers.value = [...users.value];
      
      // Guardar en localStorage
      localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
    }
  }
}

function openSecurityReport() {
  router.push('/admin/security-report');
}

function clearLocalData() {
  if (confirm('¿Estás seguro de que quieres limpiar todos los datos guardados localmente?\n\nEsto eliminará todos los usuarios creados y volverá a los datos de ejemplo.')) {
    localStorage.removeItem('passwordManager_users');
    loadUsers();
  }
}

async function loadUsers() {
  try {
    loading.value = true;
    
    // Intentar cargar desde localStorage primero
    const savedUsers = localStorage.getItem('passwordManager_users');
    if (savedUsers) {
      users.value = JSON.parse(savedUsers);
      filteredUsers.value = users.value;
      return;
    }
    
    // Si no hay datos guardados, intentar cargar del servidor
    const response = await apiClient.get('/admin/security/users');
    users.value = response.data;
    filteredUsers.value = users.value;
    
    // Guardar en localStorage
    localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
    
  } catch (error) {
    console.log('Backend no disponible, usando datos de demostración');
    
    // Solo cargar datos de ejemplo si no hay datos guardados
    const savedUsers = localStorage.getItem('passwordManager_users');
    if (!savedUsers) {
      // Datos de ejemplo para demostración inicial
      users.value = [
        {
          id: 1,
          name: 'Administrador Principal',
          email: 'admin@agentedigital.cl',
          role: 'Superusuario',
          active: true,
          locked: false,
          passwordExpired: false,
          passwordExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastAccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          mfaEnabled: true,
          requirePasswordChange: false,
          emailNotifications: true,
          createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: 'Patricia Vega',
          email: 'patricia.vega@agentedigital.cl',
          role: 'Administración',
          active: true,
          locked: false,
          passwordExpired: false,
          passwordExpiry: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          mfaEnabled: false,
          requirePasswordChange: false,
          emailNotifications: true,
          createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Guardar datos iniciales
      localStorage.setItem('passwordManager_users', JSON.stringify(users.value));
    } else {
      // Usar datos guardados
      users.value = JSON.parse(savedUsers);
    }
    
    filteredUsers.value = users.value;
  } finally {
    loading.value = false;
  }
}

// Watchers
watch([searchQuery, activeFilters], filterUsers, { deep: true });

onMounted(() => {
  loadUsers();
  generatePassword();
});
</script>

<style scoped>
.password-management-module {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
}

/* Header espectacular */
.module-header {
  position: relative;
  padding: 2rem;
  overflow: hidden;
}

.header-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
}

.security-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: grid-move 20s linear infinite;
}

.floating-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.header-content {
  position: relative;
  z-index: 2;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.75rem;
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.btn-back:hover {
  background: rgba(71, 85, 105, 0.7);
  color: #f8fafc;
  transform: translateX(-2px);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.security-emblem {
  position: relative;
  width: 5rem;
  height: 5rem;
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
  border: 2px solid;
  border-radius: 50%;
  animation: ring-rotate 8s linear infinite;
}

.ring-1 {
  inset: 0;
  border-color: #3b82f6;
  animation-duration: 8s;
}

.ring-2 {
  inset: 8px;
  border-color: #8b5cf6;
  animation-duration: 6s;
  animation-direction: reverse;
}

.ring-3 {
  inset: 16px;
  border-color: #ec4899;
  animation-duration: 4s;
}

.emblem-icon {
  font-size: 2rem;
  color: #f8fafc;
  z-index: 1;
}

.title-info h1 {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f8fafc, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.title-info p {
  font-size: 1.125rem;
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
}

.live-security-indicators {
  display: flex;
  gap: 2rem;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.indicator.active {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.indicator.active i {
  animation: indicator-pulse 2s ease-in-out infinite;
}

/* Panel de control */
.control-panel {
  padding: 0 2rem 2rem;
}

.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.search-input-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.125rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  color: #f8fafc;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 2rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  background: rgba(71, 85, 105, 0.5);
}

.filter-chip.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.action-section {
  display: flex;
  gap: 1rem;
}

.btn-create, .btn-report {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-create {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-create:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

.btn-report {
  background: rgba(51, 65, 85, 0.5);
  color: #cbd5e1;
  border: 1px solid rgba(71, 85, 105, 0.5);
}

.btn-clear {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-clear:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

.btn-report:hover {
  background: rgba(71, 85, 105, 0.7);
}

/* Tabla de usuarios */
.users-table-container {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 1rem;
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #94a3b8;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-rings {
  position: relative;
  width: 3rem;
  height: 3rem;
}

.loading-rings .ring {
  position: absolute;
  border: 2px solid transparent;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-rings .ring:nth-child(1) { inset: 0; animation-duration: 1s; }
.loading-rings .ring:nth-child(2) { inset: 4px; animation-duration: 1.5s; animation-direction: reverse; }
.loading-rings .ring:nth-child(3) { inset: 8px; animation-duration: 2s; }

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
}

.users-table td {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
  color: #e2e8f0;
}

.user-row:hover {
  background: rgba(51, 65, 85, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.avatar-super { background: linear-gradient(135deg, #dc2626, #b91c1c); }
.avatar-admin { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.avatar-viewer { background: linear-gradient(135deg, #10b981, #059669); }

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #f8fafc;
}

.user-email {
  font-size: 0.875rem;
  color: #94a3b8;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.role-super {
  background: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.role-admin {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.role-viewer {
  background: rgba(16, 185, 129, 0.2);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: status-blink 2s ease-in-out infinite;
}

.status-active .status-dot { background: #10b981; }
.status-inactive .status-dot { background: #6b7280; }
.status-locked .status-dot { background: #ef4444; }
.status-expired .status-dot { background: #f59e0b; }

.mfa-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.mfa-status.enabled {
  color: #86efac;
}

.mfa-status:not(.enabled) {
  color: #fcd34d;
}

.password-status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.password-valid { color: #86efac; }
.password-expiring { color: #fcd34d; }
.password-expired { color: #fca5a5; }

.expiry-countdown {
  position: absolute;
  top: -1.5rem;
  left: 0;
  background: rgba(245, 158, 11, 0.9);
  color: #1f2937;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.action-btn.reset {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.action-btn.toggle {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Modal de confirmación de éxito */
.success-modal-overlay {
  z-index: 1100;
}

.success-modal-content {
  background: linear-gradient(145deg, #0f172a, #1e293b);
  border: 2px solid #10b981;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25);
  animation: successSlideIn 0.5s ease;
}

.success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  color: white;
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: successPulse 2s infinite;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  margin: 0;
}

.success-body {
  padding: 0 2rem 2rem;
}

.created-user-info {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.875rem;
}

.info-value {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.875rem;
}

.password-section {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.password-header h4 {
  color: #ef4444;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.password-warning {
  color: #fbbf24;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
}

.password-display {
  margin-top: 1rem;
}

.password-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.password-code {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
  flex: 1;
  word-break: break-all;
}

.copy-password-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.copy-password-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.success-footer {
  display: flex;
  justify-content: center;
  padding: 0 2rem 2rem;
}

.btn-success-ok {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-success-ok:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Toast notification */
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  color: white;
  font-weight: 500;
  z-index: 1200;
  animation: toastSlideIn 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast-icon {
  font-size: 1.25rem;
}

@keyframes successSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modal-container {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  color: white;
  font-size: 1.25rem;
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #f8fafc;
}

.modal-body {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
}

.form-input {
  padding: 0.875rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  color: #f8fafc;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.role-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-option {
  position: relative;
}

.role-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.role-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-input:checked + .role-label {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.role-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.25rem;
  color: white;
}

.role-super .role-icon { background: linear-gradient(135deg, #dc2626, #b91c1c); }
.role-admin .role-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.role-viewer .role-icon { background: linear-gradient(135deg, #10b981, #059669); }

.role-info {
  flex: 1;
}

.role-name {
  display: block;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.role-description {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
}

.security-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-option {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.security-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #3b82f6;
}

.security-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cbd5e1;
  cursor: pointer;
}

.password-generator {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.password-display {
  display: flex;
  gap: 0.5rem;
}

.password-input {
  flex: 1;
  padding: 0.875rem;
  background: rgba(51, 65, 85, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-family: monospace;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.generate-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

.password-strength {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strength-bar {
  height: 8px;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.strength-weak { background: linear-gradient(90deg, #ef4444, #dc2626); }
.strength-fair { background: linear-gradient(90deg, #f59e0b, #d97706); }
.strength-good { background: linear-gradient(90deg, #3b82f6, #2563eb); }
.strength-excellent { background: linear-gradient(90deg, #10b981, #059669); }

.strength-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 2rem;
  border-top: 1px solid rgba(51, 65, 85, 0.3);
}

.btn-cancel, .btn-save {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: rgba(71, 85, 105, 0.5);
  color: #cbd5e1;
}

.btn-cancel:hover {
  background: rgba(71, 85, 105, 0.7);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-save:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

/* Estilos para los botones de modo de contraseña mejorados */
.password-mode-toggle {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.mode-btn {
  flex: 1;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.mode-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.mode-btn.active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.mode-generated.active {
  border-color: #8b5cf6;
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
}

.mode-manual.active {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
}

.mode-btn-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.mode-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
}

.mode-icon {
  font-size: 1.5rem;
  color: #94a3b8;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
}

.mode-generated .mode-icon {
  color: #8b5cf6;
}

.mode-manual .mode-icon {
  color: #10b981;
}

.mode-icon-bg {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
}

.mode-generated.active .mode-icon-bg {
  opacity: 1;
  animation: iconPulse 2s infinite;
}

.mode-manual.active .mode-icon-bg {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
  opacity: 1;
  animation: iconPulse 2s infinite;
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mode-title {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.mode-description {
  font-size: 0.75rem;
  color: #64748b;
}

.mode-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
  animation: badgeSlideIn 0.3s ease;
}

.mode-generated.active .mode-badge {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.mode-manual.active .mode-badge {
  background: linear-gradient(135deg, #10b981, #059669);
}

/* Animación para el badge */
@keyframes badgeSlideIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Animación para el fondo del icono */
@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* Animaciones */
@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 1; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; }
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes indicator-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: scale(0.9) translateY(-20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Responsive */
@media (max-width: 1024px) {
  .control-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-section {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .module-header {
    padding: 1rem;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .title-info h1 {
    font-size: 2rem;
  }
  
  .live-security-indicators {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .control-panel {
    padding: 0 1rem 1rem;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 800px;
  }
}
</style>