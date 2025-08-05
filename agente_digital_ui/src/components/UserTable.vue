<template>
  <div class="user-table-container">
    <!-- Header de la tabla -->
    <div class="table-header">
      <div class="table-controls">
        <div class="selection-info" v-if="usuariosSeleccionados.length > 0">
          <span class="selection-count">{{ usuariosSeleccionados.length }} usuarios seleccionados</span>
          <div class="bulk-actions">
            <button @click="accionMasiva('activar')" class="bulk-btn success">
              <i class="ph ph-play"></i>
              Activar
            </button>
            <button @click="accionMasiva('desactivar')" class="bulk-btn warning">
              <i class="ph ph-pause"></i>
              Desactivar
            </button>
            <button @click="accionMasiva('eliminar')" class="bulk-btn danger">
              <i class="ph ph-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
        
        <div class="table-options">
          <button @click="exportarSeleccion" class="table-btn">
            <i class="ph ph-export"></i>
            Exportar
          </button>
          <button @click="toggleColumnas" class="table-btn">
            <i class="ph ph-columns"></i>
            Columnas
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla principal -->
    <div class="table-wrapper">
      <table class="user-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <label class="checkbox-container">
                <input autocomplete="off" type="checkbox" 
                  :checked="todosSeleccionados"
                  @change="toggleTodos"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
              </label>
            </th>
            
            <th 
              v-for="columna in columnasVisibles" 
              :key="columna.key"
              :class="['sortable-header', { 'sorted': ordenActual === columna.key }]"
              @click="cambiarOrden(columna.key)"
            >
              <div class="header-content">
                <span>{{ columna.label }}</span>
                <div class="sort-indicators">
                  <i 
                    class="ph ph-caret-up"
                    :class="{ active: ordenActual === columna.key && direccionOrden === 'asc' }"
                  ></i>
                  <i 
                    class="ph ph-caret-down"
                    :class="{ active: ordenActual === columna.key && direccionOrden === 'desc' }"
                  ></i>
                </div>
              </div>
            </th>
            
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        
        <tbody>
          <tr 
            v-for="usuario in usuariosOrdenados" 
            :key="usuario.UsuarioID"
            :class="['user-row', { 
              'selected': usuariosSeleccionados.includes(usuario.UsuarioID),
              'inactive': usuario.Estado !== 'Activo'
            }]"
            @click="toggleSeleccion(usuario.UsuarioID)"
          >
            <td class="checkbox-col">
              <label class="checkbox-container" @click.stop>
                <input autocomplete="off" type="checkbox" 
                  :checked="usuariosSeleccionados.includes(usuario.UsuarioID)"
                  @change="toggleSeleccion(usuario.UsuarioID)"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
              </label>
            </td>
            
            <!-- Avatar y Nombre -->
            <td v-if="mostrarColumna('usuario')" class="user-info-cell">
              <div class="user-avatar-mini">
                <div class="avatar-circle-mini" :class="getAvatarClass(usuario.Estado)">
                  <i class="ph ph-user"></i>
                </div>
                <div class="status-dot-mini" :class="getStatusClass(usuario.Estado)"></div>
              </div>
              <div class="user-details">
                <div class="user-name">{{ usuario.NombreCompleto || 'Sin nombre' }}</div>
                <div class="user-email">{{ usuario.Email }}</div>
              </div>
            </td>
            
            <!-- Estado -->
            <td v-if="mostrarColumna('estado')" class="status-cell">
              <div class="status-badge" :class="getStatusBadgeClass(usuario.Estado)">
                <div class="status-indicator" :class="getStatusClass(usuario.Estado)"></div>
                <span>{{ usuario.Estado || 'Pendiente' }}</span>
              </div>
            </td>
            
            <!-- Rol -->
            <td v-if="mostrarColumna('rol')" class="role-cell">
              <div class="role-badge" :class="getRolClass(usuario.Rol)">
                <i :class="getRolIcon(usuario.Rol)"></i>
                <span>{{ usuario.Rol || 'Sin rol' }}</span>
              </div>
            </td>
            
            <!-- Organización -->
            <td v-if="mostrarColumna('organizacion')" class="org-cell">
              <div class="org-info">
                <div class="org-primary">{{ usuario.InquilinoNombre || 'No asignado' }}</div>
                <div class="org-secondary" v-if="usuario.EmpresaNombre">{{ usuario.EmpresaNombre }}</div>
              </div>
            </td>
            
            <!-- Último Acceso -->
            <td v-if="mostrarColumna('ultimoAcceso')" class="date-cell">
              <div class="date-info">
                <div class="date-value">{{ formatearFecha(usuario.UltimoAcceso) }}</div>
                <div class="date-relative">{{ formatearFechaRelativa(usuario.UltimoAcceso) }}</div>
              </div>
            </td>
            
            <!-- Fecha Creación -->
            <td v-if="mostrarColumna('fechaCreacion')" class="date-cell">
              <div class="date-info">
                <div class="date-value">{{ formatearFecha(usuario.FechaCreacion) }}</div>
                <div class="date-relative">{{ formatearFechaRelativa(usuario.FechaCreacion) }}</div>
              </div>
            </td>
            
            <!-- Permisos -->
            <td v-if="mostrarColumna('permisos')" class="permissions-cell">
              <div class="permissions-summary">
                <div class="permission-count">{{ usuario.CantidadPermisos || 0 }}</div>
                <div class="permission-label">permisos</div>
              </div>
            </td>
            
            <!-- Acciones -->
            <td class="actions-cell">
              <div class="action-buttons">
                <button 
                  @click.stop="$emit('verDetalles', usuario)" 
                  class="action-btn view"
                  title="Ver detalles"
                >
                  <i class="ph ph-eye"></i>
                </button>
                
                <button 
                  @click.stop="$emit('editar', usuario)" 
                  class="action-btn edit"
                  title="Editar usuario"
                >
                  <i class="ph ph-pencil"></i>
                </button>
                
                <button 
                  @click.stop="toggleEstadoUsuario(usuario)" 
                  class="action-btn" 
                  :class="usuario.Estado === 'Activo' ? 'pause' : 'play'"
                  :title="usuario.Estado === 'Activo' ? 'Desactivar' : 'Activar'"
                >
                  <i :class="usuario.Estado === 'Activo' ? 'ph ph-pause' : 'ph ph-play'"></i>
                </button>
                
                <div class="dropdown" v-click-outside="() => mostrarDropdown[usuario.UsuarioID] = false">
                  <button 
                    @click.stop="toggleDropdown(usuario.UsuarioID)" 
                    class="action-btn more"
                    title="Más opciones"
                  >
                    <i class="ph ph-dots-three-vertical"></i>
                  </button>
                  
                  <div v-if="mostrarDropdown[usuario.UsuarioID]" class="dropdown-menu">
                    <button @click="accionUsuario('permisos', usuario)" class="dropdown-item">
                      <i class="ph ph-shield-check"></i>
                      Gestionar Permisos
                    </button>
                    <button @click="accionUsuario('clonar', usuario)" class="dropdown-item">
                      <i class="ph ph-copy"></i>
                      Clonar Usuario
                    </button>
                    <button @click="accionUsuario('resetPassword', usuario)" class="dropdown-item">
                      <i class="ph ph-key"></i>
                      Resetear Contraseña
                    </button>
                    <div class="dropdown-divider"></div>
                    <button @click="accionUsuario('eliminar', usuario)" class="dropdown-item danger">
                      <i class="ph ph-trash"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Panel de configuración de columnas -->
    <div v-if="mostrarConfigColumnas" class="columns-config">
      <div class="config-header">
        <h3>Configurar Columnas</h3>
        <button @click="toggleColumnas" class="close-btn">
          <i class="ph ph-x"></i>
        </button>
      </div>
      <div class="config-body">
        <div 
          v-for="columna in todasLasColumnas" 
          :key="columna.key"
          class="column-option"
        >
          <label class="checkbox-container">
            <input autocomplete="off" type="checkbox" 
              :checked="columnasSeleccionadas.includes(columna.key)"
              @change="toggleColumna(columna.key)"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="column-label">{{ columna.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="table-pagination" v-if="totalPaginas > 1">
      <div class="pagination-info">
        Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} - 
        {{ Math.min(paginaActual * itemsPorPagina, usuarios.length) }} 
        de {{ usuarios.length }} usuarios
      </div>
      
      <div class="pagination-controls">
        <button 
          @click="irAPagina(1)" 
          :disabled="paginaActual === 1"
          class="pagination-btn"
        >
          <i class="ph ph-caret-double-left"></i>
        </button>
        
        <button 
          @click="irAPagina(paginaActual - 1)" 
          :disabled="paginaActual === 1"
          class="pagination-btn"
        >
          <i class="ph ph-caret-left"></i>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="pagina in paginasVisibles" 
            :key="pagina"
            @click="irAPagina(pagina)"
            :class="['page-btn', { active: pagina === paginaActual }]"
          >
            {{ pagina }}
          </button>
        </div>
        
        <button 
          @click="irAPagina(paginaActual + 1)" 
          :disabled="paginaActual === totalPaginas"
          class="pagination-btn"
        >
          <i class="ph ph-caret-right"></i>
        </button>
        
        <button 
          @click="irAPagina(totalPaginas)" 
          :disabled="paginaActual === totalPaginas"
          class="pagination-btn"
        >
          <i class="ph ph-caret-double-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  usuarios: { type: Array, default: () => [] }
})

const emit = defineEmits(['editar', 'eliminar', 'cambiarEstado', 'verDetalles', 'ordenar'])

// Estado reactivo
const usuariosSeleccionados = ref([])
const ordenActual = ref('NombreCompleto')
const direccionOrden = ref('asc')
const mostrarConfigColumnas = ref(false)
const mostrarDropdown = reactive({})
const paginaActual = ref(1)
const itemsPorPagina = ref(20)

// Configuración de columnas
const todasLasColumnas = [
  { key: 'usuario', label: 'Usuario', visible: true },
  { key: 'estado', label: 'Estado', visible: true },
  { key: 'rol', label: 'Rol', visible: true },
  { key: 'organizacion', label: 'Organización', visible: true },
  { key: 'ultimoAcceso', label: 'Último Acceso', visible: true },
  { key: 'fechaCreacion', label: 'Creado', visible: false },
  { key: 'permisos', label: 'Permisos', visible: false }
]

const columnasSeleccionadas = ref(
  todasLasColumnas.filter(c => c.visible).map(c => c.key)
)

// Directiva para cerrar dropdown
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

// Computed properties
const columnasVisibles = computed(() => 
  todasLasColumnas.filter(c => columnasSeleccionadas.value.includes(c.key))
)

const todosSeleccionados = computed(() => 
  props.usuarios.length > 0 && usuariosSeleccionados.value.length === props.usuarios.length
)

const usuariosOrdenados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  
  let sorted = [...props.usuarios].sort((a, b) => {
    const valorA = a[ordenActual.value] || ''
    const valorB = b[ordenActual.value] || ''
    
    if (direccionOrden.value === 'asc') {
      return valorA.toString().localeCompare(valorB.toString())
    } else {
      return valorB.toString().localeCompare(valorA.toString())
    }
  })
  
  return sorted.slice(inicio, fin)
})

const totalPaginas = computed(() => 
  Math.ceil(props.usuarios.length / itemsPorPagina.value)
)

const paginasVisibles = computed(() => {
  const total = totalPaginas.value
  const actual = paginaActual.value
  const rango = 5
  
  let inicio = Math.max(1, actual - Math.floor(rango / 2))
  let fin = Math.min(total, inicio + rango - 1)
  
  if (fin - inicio < rango - 1) {
    inicio = Math.max(1, fin - rango + 1)
  }
  
  const paginas = []
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  
  return paginas
})

// Métodos
function mostrarColumna(key) {
  return columnasSeleccionadas.value.includes(key)
}

function toggleColumna(key) {
  const index = columnasSeleccionadas.value.indexOf(key)
  if (index > -1) {
    columnasSeleccionadas.value.splice(index, 1)
  } else {
    columnasSeleccionadas.value.push(key)
  }
}

function toggleColumnas() {
  mostrarConfigColumnas.value = !mostrarConfigColumnas.value
}

function toggleSeleccion(usuarioId) {
  const index = usuariosSeleccionados.value.indexOf(usuarioId)
  if (index > -1) {
    usuariosSeleccionados.value.splice(index, 1)
  } else {
    usuariosSeleccionados.value.push(usuarioId)
  }
}

function toggleTodos() {
  if (todosSeleccionados.value) {
    usuariosSeleccionados.value = []
  } else {
    usuariosSeleccionados.value = props.usuarios.map(u => u.UsuarioID)
  }
}

function cambiarOrden(columna) {
  if (ordenActual.value === columna) {
    direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc'
  } else {
    ordenActual.value = columna
    direccionOrden.value = 'asc'
  }
  
  emit('ordenar', { campo: columna, direccion: direccionOrden.value })
}

function toggleDropdown(usuarioId) {
  // Cerrar todos los dropdowns
  Object.keys(mostrarDropdown).forEach(key => {
    mostrarDropdown[key] = false
  })
  // Abrir el seleccionado
  mostrarDropdown[usuarioId] = true
}

function toggleEstadoUsuario(usuario) {
  const nuevoEstado = usuario.Estado === 'Activo' ? 'Inactivo' : 'Activo'
  emit('cambiarEstado', usuario, nuevoEstado)
}

function accionUsuario(accion, usuario) {
  mostrarDropdown[usuario.UsuarioID] = false
  
  switch (accion) {
    case 'permisos':
      // Emitir evento para gestionar permisos
      break
    case 'clonar':
      // Emitir evento para clonar usuario
      break
    case 'resetPassword':
      // Emitir evento para resetear contraseña
      break
    case 'eliminar':
      emit('eliminar', usuario)
      break
  }
}

function accionMasiva(accion) {
  const usuarios = props.usuarios.filter(u => 
    usuariosSeleccionados.value.includes(u.UsuarioID)
  )
  
  // Emitir evento de acción masiva
  console.log(`Acción masiva: ${accion}`, usuarios)
  usuariosSeleccionados.value = []
}

function exportarSeleccion() {
  const usuarios = usuariosSeleccionados.value.length > 0 
    ? props.usuarios.filter(u => usuariosSeleccionados.value.includes(u.UsuarioID))
    : props.usuarios
  
  // Lógica de exportación
  console.log('Exportando usuarios:', usuarios)
}

function irAPagina(pagina) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

function formatearFecha(fecha) {
  if (!fecha) return 'Nunca'
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatearFechaRelativa(fecha) {
  if (!fecha) return ''
  
  const ahora = new Date()
  const fechaObj = new Date(fecha)
  const diferencia = ahora - fechaObj
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
  
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `${dias} días`
  if (dias < 30) return `${Math.floor(dias / 7)} semanas`
  if (dias < 365) return `${Math.floor(dias / 30)} meses`
  return `${Math.floor(dias / 365)} años`
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
</script>

<style scoped>
.user-table-container {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
}

.table-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  background: rgba(30, 41, 59, 0.5);
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selection-count {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.875rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.bulk-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.bulk-btn.success {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.bulk-btn.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.bulk-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.table-options {
  display: flex;
  gap: 0.5rem;
}

.table-btn {
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
}

.table-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.table-wrapper {
  overflow-x: auto;
  max-height: 70vh;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.user-table th {
  background: rgba(30, 41, 59, 0.8);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  position: sticky;
  top: 0;
  z-index: 10;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.sortable-header:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sort-indicators {
  display: flex;
  flex-direction: column;
  gap: -2px;
}

.sort-indicators i {
  font-size: 0.75rem;
  color: #64748b;
  transition: color 0.2s;
}

.sort-indicators i.active {
  color: #3b82f6;
}

.user-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  vertical-align: middle;
}

.user-row {
  transition: all 0.2s;
  cursor: pointer;
}

.user-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.user-row.selected {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}

.user-row.inactive {
  opacity: 0.6;
}

.checkbox-col {
  width: 50px;
}

.actions-col {
  width: 150px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
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

.checkbox-input:checked + .checkbox-custom {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.user-info-cell {
  min-width: 250px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-mini {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle-mini {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

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

.status-dot-mini {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(15, 23, 42, 0.9);
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

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.125rem;
  truncate: true;
}

.user-email {
  color: #94a3b8;
  font-size: 0.75rem;
  truncate: true;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
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

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
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

.org-info {
  max-width: 200px;
}

.org-primary {
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 0.125rem;
  truncate: true;
}

.org-secondary {
  color: #94a3b8;
  font-size: 0.75rem;
  truncate: true;
}

.date-info {
  text-align: center;
}

.date-value {
  color: #e2e8f0;
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.date-relative {
  color: #64748b;
  font-size: 0.75rem;
}

.permissions-summary {
  text-align: center;
}

.permission-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}

.permission-label {
  color: #64748b;
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  position: relative;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.action-btn.edit {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.action-btn.play {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.action-btn.pause {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.action-btn.more {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
}

.action-btn:hover {
  transform: scale(1.1);
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
  min-width: 180px;
  z-index: 20;
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

.columns-config {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(59, 130, 246, 0.3);
  z-index: 30;
}

.config-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-header h3 {
  color: #e2e8f0;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.config-body {
  padding: 1rem 1.5rem;
}

.column-option {
  margin-bottom: 0.75rem;
}

.column-label {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.table-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 41, 59, 0.5);
}

.pagination-info {
  color: #94a3b8;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: 1px solid rgba(100, 116, 139, 0.3);
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: 1px solid rgba(100, 116, 139, 0.3);
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.page-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.page-btn:hover:not(.active) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

/* Responsive */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-wrapper {
    font-size: 0.75rem;
  }
  
  .columns-config {
    width: 100%;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>