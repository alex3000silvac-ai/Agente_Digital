<template>
  <div class="logs-container">
    <!-- Header espectacular -->
    <header class="hero-header">
      <div class="header-background">
        <div class="floating-particles"></div>
        <div class="cyber-grid"></div>
      </div>
      <div class="header-content">
        <div class="header-info">
          <h1 class="hero-title">
            <i class="ph ph-detective"></i>
            Logs de Auditoría
            <span class="titulo-badge">SEGURIDAD</span>
          </h1>
          <p class="hero-subtitle">
            Monitoreo completo de todas las acciones realizadas en el sistema
          </p>
        </div>
        <div class="header-actions">
          <button @click="volverAlDashboard" class="btn btn-glass">
            <i class="ph ph-arrow-left"></i>
            Volver
          </button>
          <button @click="exportarLogs" class="btn btn-secondary-glow">
            <i class="ph ph-download"></i>
            Exportar
          </button>
          <button @click="recargarLogs" class="btn btn-primary-glow">
            <i class="ph ph-arrows-clockwise"></i>
            Actualizar
          </button>
        </div>
      </div>
    </header>

    <!-- Panel de Filtros -->
    <div class="filtros-panel">
      <div class="filtros-header">
        <h3>
          <i class="ph ph-funnel"></i>
          Filtros de Auditoría
        </h3>
        <button @click="limpiarFiltros" class="btn-clear-filters">
          <i class="ph ph-x"></i>
          Limpiar
        </button>
      </div>
      <div class="filtros-grid">
        <div class="filtro-grupo">
          <label>Acción</label>
          <select autocomplete="off" v-model="filtros.accion" @change="aplicarFiltros" class="filtro-select">
            <option value="">Todas las acciones</option>
            <option value="CREAR_USUARIO">Crear Usuario</option>
            <option value="EDITAR_INQUILINO">Editar Inquilino</option>
            <option value="ELIMINAR_INQUILINO_CASCADA">Eliminar Inquilino</option>
            <option value="ELIMINAR_INCIDENTE">Eliminar Incidente</option>
            <option value="LOGIN">Inicio de Sesión</option>
            <option value="LOGOUT">Cierre de Sesión</option>
          </select>
        </div>
        <div class="filtro-grupo">
          <label>Tabla</label>
          <select autocomplete="off" v-model="filtros.tabla" @change="aplicarFiltros" class="filtro-select">
            <option value="">Todas las tablas</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Inquilinos">Inquilinos</option>
            <option value="Empresas">Empresas</option>
            <option value="Incidentes">Incidentes</option>
          </select>
        </div>
        <div class="filtro-grupo">
          <label>Usuario</label>
          <select autocomplete="off" v-model="filtros.usuario_id" @change="aplicarFiltros" class="filtro-select">
            <option value="">Todos los usuarios</option>
            <option v-for="usuario in usuarios" :key="usuario.UsuarioID" :value="usuario.UsuarioID">
              {{ usuario.NombreCompleto }}
            </option>
          </select>
        </div>
        <div class="filtro-grupo">
          <label>Fecha Desde</label>
          <input autocomplete="off" v-model="filtros.fecha_desde" 
            type="datetime-local" 
            class="filtro-input"
            @change="aplicarFiltros"
          />
        </div>
        <div class="filtro-grupo">
          <label>Fecha Hasta</label>
          <input autocomplete="off" v-model="filtros.fecha_hasta" 
            type="datetime-local" 
            class="filtro-input"
            @change="aplicarFiltros"
          />
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-panel">
      <div class="stat-card">
        <div class="stat-icon create">
          <i class="ph ph-plus-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.creaciones }}</div>
          <div class="stat-label">Creaciones</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon edit">
          <i class="ph ph-pencil"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.ediciones }}</div>
          <div class="stat-label">Ediciones</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon delete">
          <i class="ph ph-trash"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.eliminaciones }}</div>
          <div class="stat-label">Eliminaciones</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon login">
          <i class="ph ph-sign-in"></i>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ estadisticas.accesos }}</div>
          <div class="stat-label">Accesos</div>
        </div>
      </div>
    </div>

    <!-- Tabla de Logs -->
    <div class="logs-table-container">
      <div v-if="cargando" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando logs de auditoría...</p>
      </div>
      
      <div v-else-if="!logs || logs.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="ph ph-archive"></i>
        </div>
        <h3>No hay logs disponibles</h3>
        <p>No se encontraron registros de auditoría con los filtros aplicados.</p>
      </div>

      <div v-else class="logs-table">
        <table class="tabla-logs">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Tabla</th>
              <th>Registro ID</th>
              <th>IP</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="log in logs" 
              :key="log.LogID"
              :class="getLogRowClass(log.Accion)"
              @click="verDetalleLog(log)"
            >
              <td class="fecha-cell">
                <div class="fecha-principal">{{ formatearFecha(log.Fecha) }}</div>
                <div class="fecha-secundaria">{{ formatearHora(log.Fecha) }}</div>
              </td>
              <td class="usuario-cell">
                <div class="usuario-info">
                  <div class="usuario-avatar">
                    <i class="ph ph-user"></i>
                  </div>
                  <div class="usuario-datos">
                    <div class="usuario-nombre">{{ log.UsuarioNombre || 'Sistema' }}</div>
                    <div class="usuario-id">ID: {{ log.UsuarioID || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="accion-cell">
                <span class="accion-badge" :class="getAccionClass(log.Accion)">
                  <i :class="getAccionIcon(log.Accion)"></i>
                  {{ formatearAccion(log.Accion) }}
                </span>
              </td>
              <td class="tabla-cell">
                <span class="tabla-badge">{{ log.Tabla }}</span>
              </td>
              <td class="id-cell">
                <span class="id-badge">#{{ log.RegistroID }}</span>
              </td>
              <td class="ip-cell">
                <span class="ip-address">{{ log.IPAddress || 'N/A' }}</span>
              </td>
              <td class="detalles-cell">
                <button @click.stop="verDetalleLog(log)" class="btn-detalle">
                  <i class="ph ph-eye"></i>
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalLogs > limite" class="paginacion">
        <button 
          @click="paginaAnterior" 
          :disabled="offset === 0" 
          class="btn-paginacion"
        >
          <i class="ph ph-caret-left"></i>
          Anterior
        </button>
        <span class="paginacion-info">
          {{ offset + 1 }} - {{ Math.min(offset + limite, totalLogs) }} de {{ totalLogs }}
        </span>
        <button 
          @click="paginaSiguiente" 
          :disabled="offset + limite >= totalLogs" 
          class="btn-paginacion"
        >
          Siguiente
          <i class="ph ph-caret-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal de Detalle de Log -->
    <div v-if="mostrarDetalleLog" class="modal-overlay" @click="cerrarDetalleLog">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-icon" :class="getAccionClass(logSeleccionado?.Accion)">
            <i :class="getAccionIcon(logSeleccionado?.Accion)"></i>
          </div>
          <h3 class="modal-title">Detalle de Auditoría</h3>
        </div>
        
        <div class="modal-body">
          <div class="detalle-log">
            <div class="detalle-seccion">
              <h4>Información General</h4>
              <div class="detalle-grid">
                <div class="detalle-item">
                  <label>Fecha y Hora</label>
                  <div>{{ formatearFechaCompleta(logSeleccionado?.Fecha) }}</div>
                </div>
                <div class="detalle-item">
                  <label>Usuario</label>
                  <div>{{ logSeleccionado?.UsuarioNombre || 'Sistema' }}</div>
                </div>
                <div class="detalle-item">
                  <label>Acción</label>
                  <div>{{ formatearAccion(logSeleccionado?.Accion) }}</div>
                </div>
                <div class="detalle-item">
                  <label>Tabla Afectada</label>
                  <div>{{ logSeleccionado?.Tabla }}</div>
                </div>
                <div class="detalle-item">
                  <label>ID de Registro</label>
                  <div>{{ logSeleccionado?.RegistroID }}</div>
                </div>
                <div class="detalle-item">
                  <label>Dirección IP</label>
                  <div>{{ logSeleccionado?.IPAddress || 'No disponible' }}</div>
                </div>
              </div>
            </div>

            <div v-if="logSeleccionado?.DatosAnteriores" class="detalle-seccion">
              <h4>Datos Anteriores</h4>
              <div class="datos-json">
                <pre>{{ formatearJSON(logSeleccionado.DatosAnteriores) }}</pre>
              </div>
            </div>

            <div v-if="logSeleccionado?.DatosNuevos" class="detalle-seccion">
              <h4>Datos Nuevos</h4>
              <div class="datos-json">
                <pre>{{ formatearJSON(logSeleccionado.DatosNuevos) }}</pre>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarDetalleLog" class="btn btn-secondary">
            <i class="ph ph-x"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estado reactivo
const logs = ref([])
const usuarios = ref([])
const cargando = ref(false)
const totalLogs = ref(0)
const offset = ref(0)
const limite = ref(50)

// Filtros
const filtros = ref({
  accion: '',
  tabla: '',
  usuario_id: '',
  fecha_desde: '',
  fecha_hasta: ''
})

// Modal
const mostrarDetalleLog = ref(false)
const logSeleccionado = ref(null)

// Estadísticas computadas
const estadisticas = computed(() => {
  const stats = {
    creaciones: 0,
    ediciones: 0,
    eliminaciones: 0,
    accesos: 0
  }
  
  // Verificar que logs.value existe y es un array
  if (logs.value && Array.isArray(logs.value)) {
    logs.value.forEach(log => {
      if (log.Accion && log.Accion.includes('CREAR')) stats.creaciones++
      else if (log.Accion && (log.Accion.includes('EDITAR') || log.Accion.includes('UPDATE'))) stats.ediciones++
      else if (log.Accion && (log.Accion.includes('ELIMINAR') || log.Accion.includes('DELETE'))) stats.eliminaciones++
      else if (log.Accion && log.Accion.includes('LOGIN')) stats.accesos++
    })
  }
  
  return stats
})

// Funciones de datos
async function cargarLogs() {
  cargando.value = true
  try {
    const params = new URLSearchParams({
      offset: offset.value.toString(),
      limite: limite.value.toString()
    })
    
    // Agregar filtros
    Object.entries(filtros.value).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    const response = await fetch(`http://localhost:5000/api/admin/logs-auditoria?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Verificar que la respuesta tenga la estructura esperada
    logs.value = Array.isArray(data.logs) ? data.logs : []
    totalLogs.value = data.total || 0
  } catch (err) {
    console.error('Error al cargar logs:', err)
    logs.value = [] // Asegurar que logs sea un array vacío en caso de error
    totalLogs.value = 0
    alert('Error al cargar logs de auditoría: ' + (err.message || 'Error desconocido'))
  } finally {
    cargando.value = false
  }
}

async function cargarUsuarios() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/usuarios')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    usuarios.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    usuarios.value = [] // Asegurar que usuarios sea un array vacío en caso de error
  }
}

// Funciones de filtrado y paginación
function aplicarFiltros() {
  offset.value = 0
  cargarLogs()
}

function limpiarFiltros() {
  filtros.value = {
    accion: '',
    tabla: '',
    usuario_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  }
  aplicarFiltros()
}

function paginaAnterior() {
  if (offset.value >= limite.value) {
    offset.value -= limite.value
    cargarLogs()
  }
}

function paginaSiguiente() {
  if (offset.value + limite.value < totalLogs.value) {
    offset.value += limite.value
    cargarLogs()
  }
}

// Funciones de formateo
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL')
}

function formatearHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-CL')
}

function formatearFechaCompleta(fecha) {
  return new Date(fecha).toLocaleString('es-CL')
}

function formatearAccion(accion) {
  const acciones = {
    'CREAR_USUARIO': 'Crear Usuario',
    'EDITAR_INQUILINO': 'Editar Inquilino',
    'ELIMINAR_INQUILINO_CASCADA': 'Eliminar Inquilino',
    'ELIMINAR_INCIDENTE': 'Eliminar Incidente',
    'LOGIN': 'Inicio de Sesión',
    'LOGOUT': 'Cierre de Sesión'
  }
  return acciones[accion] || accion
}

function formatearJSON(jsonString) {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2)
  } catch {
    return jsonString
  }
}

// Funciones de estilos
function getLogRowClass(accion) {
  if (accion.includes('ELIMINAR') || accion.includes('DELETE')) return 'log-row-danger'
  if (accion.includes('CREAR') || accion.includes('CREATE')) return 'log-row-success'
  if (accion.includes('EDITAR') || accion.includes('UPDATE')) return 'log-row-warning'
  return 'log-row-info'
}

function getAccionClass(accion) {
  if (accion.includes('ELIMINAR') || accion.includes('DELETE')) return 'accion-danger'
  if (accion.includes('CREAR') || accion.includes('CREATE')) return 'accion-success'
  if (accion.includes('EDITAR') || accion.includes('UPDATE')) return 'accion-warning'
  return 'accion-info'
}

function getAccionIcon(accion) {
  if (accion.includes('ELIMINAR') || accion.includes('DELETE')) return 'ph ph-trash'
  if (accion.includes('CREAR') || accion.includes('CREATE')) return 'ph ph-plus'
  if (accion.includes('EDITAR') || accion.includes('UPDATE')) return 'ph ph-pencil'
  if (accion.includes('LOGIN')) return 'ph ph-sign-in'
  if (accion.includes('LOGOUT')) return 'ph ph-sign-out'
  return 'ph ph-info'
}

// Funciones de UI
function verDetalleLog(log) {
  logSeleccionado.value = log
  mostrarDetalleLog.value = true
}

function cerrarDetalleLog() {
  mostrarDetalleLog.value = false
  logSeleccionado.value = null
}

function volverAlDashboard() {
  router.push('/dashboard')
}

function recargarLogs() {
  cargarLogs()
}

function exportarLogs() {
  // TODO: Implementar exportación
  alert('Función de exportación en desarrollo')
}

// Inicialización
onMounted(() => {
  cargarLogs()
  cargarUsuarios()
})
</script>

<style scoped>
.logs-container {
  padding: 1.5rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
}

/* Header espectacular */
.hero-header {
  position: relative;
  padding: 3rem 0;
  margin-bottom: 2rem;
  overflow: hidden;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(15, 20, 25, 0.9), rgba(26, 32, 44, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(2px 2px at 20px 30px, #3b82f6, transparent),
                    radial-gradient(2px 2px at 40px 70px, #8b5cf6, transparent),
                    radial-gradient(1px 1px at 90px 40px, #06b6d4, transparent);
  background-repeat: repeat;
  background-size: 100px 100px;
  animation: float 20s ease-in-out infinite;
}

.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.titulo-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-radius: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.hero-subtitle {
  color: #94a3b8;
  font-size: 1.125rem;
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-primary-glow {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.btn-secondary-glow {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4);
}

/* Panel de filtros */
.filtros-panel {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filtros-header h3 {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-clear-filters {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-grupo label {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
}

.filtro-select, .filtro-input {
  padding: 0.75rem;
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
}

/* Panel de estadísticas */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.create {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.edit {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-icon.delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-icon.login {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  color: white;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Tabla de logs */
.logs-table-container {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  overflow: hidden;
}

.tabla-logs {
  width: 100%;
  border-collapse: collapse;
}

.tabla-logs th {
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  font-weight: 700;
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tabla-logs td {
  padding: 1rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  color: #e2e8f0;
}

.tabla-logs tbody tr {
  cursor: pointer;
  transition: background-color 0.2s;
}

.tabla-logs tbody tr:hover {
  background: rgba(71, 85, 105, 0.1);
}

.log-row-success {
  border-left: 3px solid #10b981;
}

.log-row-warning {
  border-left: 3px solid #f59e0b;
}

.log-row-danger {
  border-left: 3px solid #ef4444;
}

.log-row-info {
  border-left: 3px solid #3b82f6;
}

/* Celdas específicas */
.fecha-cell {
  min-width: 120px;
}

.fecha-principal {
  font-weight: 600;
  font-size: 0.875rem;
}

.fecha-secundaria {
  color: #94a3b8;
  font-size: 0.75rem;
}

.usuario-cell {
  min-width: 150px;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.usuario-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.usuario-nombre {
  font-weight: 600;
  font-size: 0.875rem;
}

.usuario-id {
  color: #94a3b8;
  font-size: 0.75rem;
}

.accion-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.accion-success {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.accion-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.accion-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.accion-info {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.tabla-badge {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.id-badge {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: monospace;
}

.ip-address {
  font-family: monospace;
  color: #94a3b8;
  font-size: 0.875rem;
}

.btn-detalle {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detalle:hover {
  background: rgba(59, 130, 246, 0.2);
}

/* Estados vacíos y de carga */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #4b5563;
  margin-bottom: 1rem;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.btn-paginacion {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginacion-info {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Modal de detalle */
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
}

.modal-header {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.detalle-seccion {
  margin-bottom: 2rem;
}

.detalle-seccion h4 {
  color: #e2e8f0;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(71, 85, 105, 0.3);
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle-item label {
  font-weight: 600;
  color: #94a3b8;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detalle-item div {
  color: #e2e8f0;
  font-weight: 500;
}

.datos-json {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}

.datos-json pre {
  color: #e2e8f0;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  justify-content: flex-end;
}

/* Animaciones */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 1.75rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .filtros-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tabla-logs {
    font-size: 0.75rem;
  }
  
  .modal-container {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>