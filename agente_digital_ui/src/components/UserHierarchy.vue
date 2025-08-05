<template>
  <div class="user-hierarchy">
    <!-- Header con controles -->
    <div class="hierarchy-header">
      <div class="view-controls">
        <button 
          :class="['view-mode-btn', { active: vistaCompacta }]"
          @click="vistaCompacta = !vistaCompacta"
        >
          <i class="ph ph-list"></i>
          Vista Compacta
        </button>
        <button 
          :class="['view-mode-btn', { active: mostrarEmpresasSinUsuarios }]"
          @click="mostrarEmpresasSinUsuarios = !mostrarEmpresasSinUsuarios"
        >
          <i class="ph ph-eye"></i>
          Mostrar Vacías
        </button>
        <button 
          @click="expandirTodo" 
          class="view-mode-btn"
        >
          <i class="ph ph-arrows-out"></i>
          Expandir Todo
        </button>
        <button 
          @click="contraerTodo" 
          class="view-mode-btn"
        >
          <i class="ph ph-arrows-in"></i>
          Contraer Todo
        </button>
      </div>
      
      <div class="hierarchy-stats">
        <div class="stat-chip">
          <i class="ph ph-building-office"></i>
          {{ inquilinos.length }} Inquilinos
        </div>
        <div class="stat-chip">
          <i class="ph ph-buildings"></i>
          {{ empresas.length }} Empresas
        </div>
        <div class="stat-chip">
          <i class="ph ph-users"></i>
          {{ usuarios.length }} Usuarios
        </div>
      </div>
    </div>

    <!-- Árbol jerárquico -->
    <div class="hierarchy-tree">
      <div 
        v-for="inquilino in inquilinosConUsuarios" 
        :key="inquilino.InquilinoID"
        class="inquilino-node"
      >
        <!-- Cabecera del Inquilino -->
        <div class="node-header inquilino-header" @click="toggleInquilino(inquilino.InquilinoID)">
          <div class="node-toggle">
            <i 
              :class="inquilinosExpandidos[inquilino.InquilinoID] ? 'ph ph-caret-down' : 'ph ph-caret-right'"
              class="toggle-icon"
            ></i>
          </div>
          
          <div class="node-icon inquilino-icon">
            <i class="ph ph-building-office"></i>
          </div>
          
          <div class="node-info">
            <h3 class="node-title">{{ inquilino.RazonSocial }}</h3>
            <div class="node-subtitle">
              {{ inquilino.empresas.length }} empresas • 
              {{ inquilino.totalUsuarios }} usuarios
            </div>
          </div>
          
          <div class="node-actions">
            <button 
              @click.stop="asignarUsuarioInquilino(inquilino)" 
              class="action-btn primary"
              title="Asignar usuario"
            >
              <i class="ph ph-user-plus"></i>
            </button>
            <button 
              @click.stop="verEstadisticasInquilino(inquilino)" 
              class="action-btn secondary"
              title="Ver estadísticas"
            >
              <i class="ph ph-chart-bar"></i>
            </button>
          </div>
          
          <div class="node-indicator">
            <div class="status-bar">
              <div 
                class="status-segment active" 
                :style="{ width: `${getActivosPercentage(inquilino)}%` }"
              ></div>
              <div 
                class="status-segment inactive" 
                :style="{ width: `${getInactivosPercentage(inquilino)}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Empresas del Inquilino -->
        <div 
          v-if="inquilinosExpandidos[inquilino.InquilinoID]" 
          class="empresas-container"
        >
          <div 
            v-for="empresa in inquilino.empresas" 
            :key="empresa.EmpresaID"
            class="empresa-node"
            v-show="mostrarEmpresasSinUsuarios || empresa.usuarios.length > 0"
          >
            <!-- Cabecera de la Empresa -->
            <div class="node-header empresa-header" @click="toggleEmpresa(empresa.EmpresaID)">
              <div class="node-toggle">
                <i 
                  :class="empresasExpandidas[empresa.EmpresaID] ? 'ph ph-caret-down' : 'ph ph-caret-right'"
                  class="toggle-icon"
                  v-if="empresa.usuarios.length > 0"
                ></i>
                <i v-else class="ph ph-dot-outline toggle-icon inactive"></i>
              </div>
              
              <div class="node-icon empresa-icon" :class="getTipoEmpresaClass(empresa.TipoEmpresa)">
                <i class="ph ph-buildings"></i>
              </div>
              
              <div class="node-info">
                <h4 class="node-title">{{ empresa.RazonSocial }}</h4>
                <div class="node-subtitle">
                  <span class="tipo-empresa" :class="getTipoEmpresaClass(empresa.TipoEmpresa)">
                    {{ empresa.TipoEmpresa || 'No definido' }}
                  </span>
                  • {{ empresa.usuarios.length }} usuarios
                </div>
              </div>
              
              <div class="node-actions">
                <button 
                  @click.stop="asignarUsuarioEmpresa(empresa)" 
                  class="action-btn primary"
                  title="Asignar usuario a empresa"
                >
                  <i class="ph ph-user-plus"></i>
                </button>
                <button 
                  @click.stop="gestionarPermisosEmpresa(empresa)" 
                  class="action-btn secondary"
                  title="Gestionar permisos"
                >
                  <i class="ph ph-shield-check"></i>
                </button>
              </div>
              
              <div class="node-indicator" v-if="empresa.usuarios.length > 0">
                <div class="user-count-badge" :class="getUserCountClass(empresa.usuarios.length)">
                  {{ empresa.usuarios.length }}
                </div>
              </div>
              
              <div class="node-indicator" v-else>
                <div class="empty-badge">
                  <i class="ph ph-warning"></i>
                </div>
              </div>
            </div>
            
            <!-- Usuarios de la Empresa -->
            <div 
              v-if="empresasExpandidas[empresa.EmpresaID] && empresa.usuarios.length > 0" 
              class="usuarios-container"
            >
              <div 
                v-for="usuario in empresa.usuarios" 
                :key="usuario.UsuarioID"
                :class="['usuario-node', { 'compact': vistaCompacta }]"
              >
                <!-- Usuario Compacto -->
                <div v-if="vistaCompacta" class="usuario-compact">
                  <div class="user-avatar-tiny">
                    <div class="avatar-circle-tiny" :class="getAvatarClass(usuario.Estado)">
                      <i class="ph ph-user"></i>
                    </div>
                    <div class="status-dot-tiny" :class="getStatusClass(usuario.Estado)"></div>
                  </div>
                  
                  <div class="user-info-compact">
                    <div class="user-name-compact">{{ usuario.NombreCompleto || 'Sin nombre' }}</div>
                    <div class="user-email-compact">{{ usuario.Email }}</div>
                  </div>
                  
                  <div class="user-badges-compact">
                    <div class="badge-rol-compact" :class="getRolClass(usuario.Rol)">
                      {{ usuario.Rol || 'N/A' }}
                    </div>
                    <div class="badge-estado-compact" :class="getStatusBadgeClass(usuario.Estado)">
                      {{ usuario.Estado || 'Pendiente' }}
                    </div>
                  </div>
                  
                  <div class="user-actions-compact">
                    <button 
                      @click="$emit('editar', usuario)" 
                      class="action-btn-tiny edit"
                      title="Editar"
                    >
                      <i class="ph ph-pencil"></i>
                    </button>
                    <button 
                      @click="$emit('eliminar', usuario)" 
                      class="action-btn-tiny delete"
                      title="Eliminar"
                    >
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Usuario Detallado -->
                <div v-else class="usuario-detallado">
                  <div class="user-main-info">
                    <div class="user-avatar-small">
                      <div class="avatar-circle-small" :class="getAvatarClass(usuario.Estado)">
                        <i class="ph ph-user"></i>
                      </div>
                      <div class="status-dot-small" :class="getStatusClass(usuario.Estado)"></div>
                    </div>
                    
                    <div class="user-details-expanded">
                      <div class="user-name-full">{{ usuario.NombreCompleto || 'Sin nombre' }}</div>
                      <div class="user-email-full">{{ usuario.Email }}</div>
                      <div class="user-meta">
                        <span class="meta-item">
                          <i class="ph ph-calendar"></i>
                          Último acceso: {{ formatearFecha(usuario.UltimoAcceso) }}
                        </span>
                        <span class="meta-item">
                          <i class="ph ph-clock"></i>
                          Creado: {{ formatearFecha(usuario.FechaCreacion) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="user-badges-full">
                    <div class="badge-rol-full" :class="getRolClass(usuario.Rol)">
                      <i :class="getRolIcon(usuario.Rol)"></i>
                      {{ usuario.Rol || 'Sin rol' }}
                    </div>
                    <div class="badge-estado-full" :class="getStatusBadgeClass(usuario.Estado)">
                      <div class="status-indicator" :class="getStatusClass(usuario.Estado)"></div>
                      {{ usuario.Estado || 'Pendiente' }}
                    </div>
                  </div>
                  
                  <div class="user-actions-full">
                    <button 
                      @click="$emit('editar', usuario)" 
                      class="action-btn edit"
                      title="Editar usuario"
                    >
                      <i class="ph ph-pencil"></i>
                    </button>
                    <button 
                      @click="gestionarPermisosUsuario(usuario)" 
                      class="action-btn permissions"
                      title="Gestionar permisos"
                    >
                      <i class="ph ph-shield-check"></i>
                    </button>
                    <button 
                      @click="toggleEstadoUsuario(usuario)" 
                      class="action-btn" 
                      :class="usuario.Estado === 'Activo' ? 'pause' : 'play'"
                      :title="usuario.Estado === 'Activo' ? 'Desactivar' : 'Activar'"
                    >
                      <i :class="usuario.Estado === 'Activo' ? 'ph ph-pause' : 'ph ph-play'"></i>
                    </button>
                    <button 
                      @click="$emit('eliminar', usuario)" 
                      class="action-btn delete"
                      title="Eliminar usuario"
                    >
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Mensaje si no hay empresas -->
          <div v-if="inquilino.empresas.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="ph ph-buildings"></i>
            </div>
            <div class="empty-text">
              <h4>No hay empresas asignadas</h4>
              <p>Este inquilino no tiene empresas configuradas</p>
            </div>
            <button @click="crearEmpresaInquilino(inquilino)" class="btn-create-empresa">
              <i class="ph ph-plus"></i>
              Crear Empresa
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mensaje si no hay datos -->
      <div v-if="inquilinosConUsuarios.length === 0" class="empty-hierarchy">
        <div class="empty-hierarchy-icon">
          <i class="ph ph-tree-structure"></i>
        </div>
        <h3>No hay estructura organizacional</h3>
        <p>No se encontraron inquilinos con usuarios asignados</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  usuarios: { type: Array, default: () => [] },
  inquilinos: { type: Array, default: () => [] },
  empresas: { type: Array, default: () => [] }
})

const emit = defineEmits(['editar', 'eliminar', 'asignar'])

// Estado reactivo
const vistaCompacta = ref(false)
const mostrarEmpresasSinUsuarios = ref(true)
const inquilinosExpandidos = reactive({})
const empresasExpandidas = reactive({})

// Computed properties
const inquilinosConUsuarios = computed(() => {
  return props.inquilinos.map(inquilino => {
    const empresasInquilino = props.empresas.filter(e => e.InquilinoID === inquilino.InquilinoID)
    
    const empresasConUsuarios = empresasInquilino.map(empresa => {
      const usuariosEmpresa = props.usuarios.filter(u => u.EmpresaID === empresa.EmpresaID)
      return {
        ...empresa,
        usuarios: usuariosEmpresa
      }
    })
    
    const totalUsuarios = empresasConUsuarios.reduce((sum, empresa) => sum + empresa.usuarios.length, 0)
    
    return {
      ...inquilino,
      empresas: empresasConUsuarios,
      totalUsuarios
    }
  }).filter(inquilino => inquilino.totalUsuarios > 0 || mostrarEmpresasSinUsuarios.value)
})

// Métodos
function toggleInquilino(inquilinoId) {
  inquilinosExpandidos[inquilinoId] = !inquilinosExpandidos[inquilinoId]
}

function toggleEmpresa(empresaId) {
  empresasExpandidas[empresaId] = !empresasExpandidas[empresaId]
}

function expandirTodo() {
  props.inquilinos.forEach(inquilino => {
    inquilinosExpandidos[inquilino.InquilinoID] = true
  })
  props.empresas.forEach(empresa => {
    empresasExpandidas[empresa.EmpresaID] = true
  })
}

function contraerTodo() {
  props.inquilinos.forEach(inquilino => {
    inquilinosExpandidos[inquilino.InquilinoID] = false
  })
  props.empresas.forEach(empresa => {
    empresasExpandidas[empresa.EmpresaID] = false
  })
}

function getActivosPercentage(inquilino) {
  if (inquilino.totalUsuarios === 0) return 0
  const activos = inquilino.empresas.reduce((sum, empresa) => 
    sum + empresa.usuarios.filter(u => u.Estado === 'Activo').length, 0
  )
  return (activos / inquilino.totalUsuarios) * 100
}

function getInactivosPercentage(inquilino) {
  return 100 - getActivosPercentage(inquilino)
}

function getTipoEmpresaClass(tipo) {
  const classes = {
    'OIV': 'tipo-oiv',
    'PSE': 'tipo-pse',
    'BTD': 'tipo-btd'
  }
  return classes[tipo] || 'tipo-default'
}

function getUserCountClass(count) {
  if (count >= 10) return 'count-high'
  if (count >= 5) return 'count-medium'
  if (count >= 1) return 'count-low'
  return 'count-empty'
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

function getRolIcon(rol) {
  const icons = {
    'Administrador': 'ph ph-crown',
    'Supervisor': 'ph ph-shield',
    'Usuario': 'ph ph-user',
    'Operador': 'ph ph-gear',
    'Auditor': 'ph ph-magnifying-glass'
  }
  return icons[rol] || 'ph ph-user'
}

// Eventos de acción
function asignarUsuarioInquilino(inquilino) {
  emit('asignar', { tipo: 'inquilino', target: inquilino })
}

function asignarUsuarioEmpresa(empresa) {
  emit('asignar', { tipo: 'empresa', target: empresa })
}

function gestionarPermisosEmpresa(empresa) {
  console.log('Gestionar permisos de empresa:', empresa)
}

function gestionarPermisosUsuario(usuario) {
  console.log('Gestionar permisos de usuario:', usuario)
}

function toggleEstadoUsuario(usuario) {
  const nuevoEstado = usuario.Estado === 'Activo' ? 'Inactivo' : 'Activo'
  // Emitir evento para cambiar estado
  console.log('Cambiar estado de usuario:', usuario, 'a', nuevoEstado)
}

function crearEmpresaInquilino(inquilino) {
  console.log('Crear empresa para inquilino:', inquilino)
}

function verEstadisticasInquilino(inquilino) {
  console.log('Ver estadísticas de inquilino:', inquilino)
}

// Inicializar estados expandidos
props.inquilinos.forEach(inquilino => {
  inquilinosExpandidos[inquilino.InquilinoID] = true
})
props.empresas.forEach(empresa => {
  empresasExpandidas[empresa.EmpresaID] = false
})
</script>

<style scoped>
.user-hierarchy {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  overflow: hidden;
}

.hierarchy-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  background: rgba(30, 41, 59, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.view-mode-btn {
  padding: 0.5rem 1rem;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 0.375rem;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-mode-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.view-mode-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  color: #93c5fd;
}

.hierarchy-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-chip {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 9999px;
  color: #93c5fd;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.hierarchy-tree {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem;
}

/* Nodos de Inquilino */
.inquilino-node {
  margin-bottom: 1.5rem;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.inquilino-header {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.inquilino-header:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateX(5px);
}

.empresa-header {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.3);
  margin-left: 2rem;
}

.empresa-header:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
  border-color: rgba(16, 185, 129, 0.5);
  transform: translateX(5px);
}

.node-toggle {
  flex-shrink: 0;
}

.toggle-icon {
  font-size: 1.125rem;
  color: #94a3b8;
  transition: all 0.2s;
}

.toggle-icon.inactive {
  color: #64748b;
}

.node-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.inquilino-icon {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.empresa-icon {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: white;
}

.tipo-oiv .empresa-icon {
  background: linear-gradient(135deg, #dc2626, #f59e0b);
}

.tipo-pse .empresa-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.tipo-btd .empresa-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
  truncate: true;
}

.empresa-header .node-title {
  font-size: 1rem;
}

.node-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tipo-empresa {
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.tipo-oiv {
  background: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
}

.tipo-pse {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.tipo-btd {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.tipo-default {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
}

.node-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-btn.primary {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.action-btn.secondary {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.action-btn:hover {
  transform: scale(1.05);
}

.node-indicator {
  flex-shrink: 0;
  margin-left: auto;
}

.status-bar {
  width: 60px;
  height: 6px;
  border-radius: 3px;
  background: rgba(71, 85, 105, 0.3);
  overflow: hidden;
  display: flex;
}

.status-segment {
  height: 100%;
  transition: width 0.3s;
}

.status-segment.active {
  background: #10b981;
}

.status-segment.inactive {
  background: #ef4444;
}

.user-count-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  min-width: 24px;
}

.count-high {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.count-medium {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.count-low {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.empty-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

/* Contenedores */
.empresas-container {
  margin-left: 3rem;
  margin-top: 1rem;
}

.empresa-node {
  margin-bottom: 1rem;
}

.usuarios-container {
  margin-left: 4rem;
  margin-top: 0.75rem;
}

.usuario-node {
  margin-bottom: 0.75rem;
}

/* Usuario Compacto */
.usuario-compact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.usuario-compact:hover {
  background: rgba(30, 41, 59, 0.5);
  border-color: rgba(59, 130, 246, 0.3);
}

.user-avatar-tiny {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle-tiny {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.status-dot-tiny {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(30, 41, 59, 0.9);
}

.user-info-compact {
  flex: 1;
  min-width: 0;
}

.user-name-compact {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
  truncate: true;
}

.user-email-compact {
  color: #94a3b8;
  font-size: 0.75rem;
  truncate: true;
}

.user-badges-compact {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.badge-rol-compact,
.badge-estado-compact {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
}

.user-actions-compact {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn-tiny {
  width: 24px;
  height: 24px;
  border-radius: 0.25rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
}

.action-btn-tiny.edit {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.action-btn-tiny.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* Usuario Detallado */
.usuario-detallado {
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.usuario-detallado:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(59, 130, 246, 0.3);
}

.user-main-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar-small {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.status-dot-small {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(30, 41, 59, 0.9);
}

.user-details-expanded {
  flex: 1;
  min-width: 0;
}

.user-name-full {
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.user-email-full {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.user-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #64748b;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.user-badges-full {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.badge-rol-full,
.badge-estado-full {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-actions-full {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn.edit {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.action-btn.permissions {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.action-btn.play {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.action-btn.pause {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Estados de avatares y status */
.avatar-active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.avatar-inactive {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: #d1d5db;
}

.avatar-suspended {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.avatar-pending {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.status-active {
  background: #10b981;
}

.status-inactive {
  background: #ef4444;
}

.status-suspended {
  background: #f59e0b;
}

.status-pending {
  background: #3b82f6;
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

.rol-user {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.rol-operator {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.rol-auditor {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.rol-default {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Estados vacíos */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 3rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.empty-text h4 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.empty-text p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.btn-create-empresa {
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.5rem;
  color: #6ee7b7;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.btn-create-empresa:hover {
  background: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.empty-hierarchy {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.empty-hierarchy-icon {
  font-size: 4rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.empty-hierarchy h3 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hierarchy-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .hierarchy-stats {
    justify-content: center;
  }
  
  .empresas-container {
    margin-left: 1rem;
  }
  
  .usuarios-container {
    margin-left: 1rem;
  }
  
  .node-header {
    flex-wrap: wrap;
  }
  
  .user-main-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-actions-full {
    justify-content: center;
  }
}
</style>