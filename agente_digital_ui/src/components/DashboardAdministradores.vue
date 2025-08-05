<template>
  <div class="dashboard-administradores">
    <!-- 🌟 HEADER ÉPICO CON ANIMACIONES -->
    <header class="dashboard-header">
      <div class="matrix-rain"></div>
      <div class="cyber-grid"></div>
      
      <div class="header-content">
        <div class="admin-avatar-section">
          <div class="avatar-container" :style="{ borderColor: adminActual?.tipo?.color }">
            <div class="avatar-glow" :style="{ backgroundColor: adminActual?.tipo?.color }"></div>
            <i class="ph" :class="adminActual?.tipo?.icono || 'ph-crown'" 
               :style="{ color: adminActual?.tipo?.color }"></i>
          </div>
          <div class="admin-info">
            <h1 class="dashboard-title">
              <span class="title-main">Dashboard Administrativo</span>
              <span class="title-glow">AGENTE DIGITAL LEY CIBERSEGURIDAD</span>
            </h1>
            <p class="admin-details">
              {{ adminActual?.nombre }} • {{ adminActual?.tipo?.nombre }}
              <span class="online-indicator">● En línea</span>
            </p>
          </div>
        </div>

        <div class="dashboard-actions">
          <button @click="actualizarDatos" 
                  class="btn btn-quantum"
                  :disabled="cargando">
            <i class="ph ph-arrows-clockwise" :class="{ 'animate-spin': cargando }"></i>
            <span>Actualizar</span>
          </button>
          
          <button @click="mostrarAlertas = !mostrarAlertas" 
                  class="btn btn-alert"
                  :class="{ 'active': mostrarAlertas }">
            <i class="ph ph-bell"></i>
            <span>Alertas</span>
            <span v-if="alertas.length > 0" class="notification-badge">{{ alertas.length }}</span>
          </button>
          
          <button @click="exportarReporte" class="btn btn-export">
            <i class="ph ph-download"></i>
            <span>Exportar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 🚨 PANEL DE ALERTAS DESLIZANTE -->
    <transition name="slide-down">
      <div v-if="mostrarAlertas && alertas.length > 0" class="alertas-panel">
        <div class="alertas-header">
          <h3>
            <i class="ph ph-shield-warning"></i>
            Alertas del Sistema
          </h3>
          <span class="alertas-count">{{ alertas.length }}</span>
        </div>
        
        <div class="alertas-grid">
          <div v-for="alerta in alertas" 
               :key="alerta.id"
               class="alerta-card"
               :class="[`alerta-${alerta.severidad.toLowerCase()}`]">
            <div class="alerta-icon">
              <i class="ph" :class="alerta.icono"></i>
            </div>
            <div class="alerta-content">
              <h4>{{ alerta.titulo }}</h4>
              <p>{{ alerta.mensaje }}</p>
              <span class="alerta-timestamp">{{ formatearFecha(alerta.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 📊 MÉTRICAS PRINCIPALES -->
    <div class="metricas-principales">
      <div class="metrica-card usuarios-totales">
        <div class="metrica-icon">
          <i class="ph ph-users-three"></i>
        </div>
        <div class="metrica-content">
          <h3>{{ metricas.total_usuarios || 0 }}</h3>
          <p>Usuarios Totales</p>
          <div class="metrica-trend positive">
            <i class="ph ph-trend-up"></i>
            <span>+{{ metricas.usuarios_nuevos_mes || 0 }} este mes</span>
          </div>
        </div>
      </div>

      <div class="metrica-card administradores">
        <div class="metrica-icon">
          <i class="ph ph-crown"></i>
        </div>
        <div class="metrica-content">
          <h3>{{ metricas.total_administradores || 0 }}</h3>
          <p>Administradores</p>
          <div class="metrica-trend">
            <i class="ph ph-pulse"></i>
            <span>{{ metricas.sesiones_activas || 0 }} sesiones activas</span>
          </div>
        </div>
      </div>

      <div class="metrica-card empresas">
        <div class="metrica-icon">
          <i class="ph ph-buildings"></i>
        </div>
        <div class="metrica-content">
          <h3>{{ metricas.empresas_activas || 0 }}</h3>
          <p>Empresas Activas</p>
          <div class="metrica-trend positive">
            <i class="ph ph-chart-line-up"></i>
            <span>{{ metricas.usuarios_activos_hoy || 0 }} activos hoy</span>
          </div>
        </div>
      </div>

      <div class="metrica-card incidentes">
        <div class="metrica-icon">
          <i class="ph ph-warning-circle"></i>
        </div>
        <div class="metrica-content">
          <h3>{{ metricas.incidentes_mes || 0 }}</h3>
          <p>Incidentes del Mes</p>
          <div class="metrica-trend">
            <i class="ph ph-activity"></i>
            <span>{{ calcularTendenciaIncidentes() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 📈 GRÁFICOS Y ANÁLISIS -->
    <div class="dashboard-grid">
      <!-- Gráfico de Actividad -->
      <div class="dashboard-card grafico-actividad">
        <div class="card-header">
          <h3>
            <i class="ph ph-chart-line"></i>
            Actividad del Sistema
          </h3>
          <div class="period-selector">
            <button v-for="periodo in ['24h', '7d', '30d']" 
                    :key="periodo"
                    @click="cambiarPeriodo(periodo)"
                    :class="['period-btn', { active: periodoActivo === periodo }]">
              {{ periodo }}
            </button>
          </div>
        </div>
        <div class="grafico-container">
          <GraficoActividad 
            :datos="datosActividad" 
            :periodo="periodoActivo"
            :height="300" />
        </div>
      </div>

      <!-- Distribución de Administradores -->
      <div class="dashboard-card distribucion-admins">
        <div class="card-header">
          <h3>
            <i class="ph ph-pie-chart"></i>
            Distribución de Administradores
          </h3>
        </div>
        <div class="distribucion-grid">
          <div v-for="tipo in tiposAdministradores" 
               :key="tipo.codigo"
               class="tipo-admin-card">
            <div class="tipo-icon" :style="{ backgroundColor: tipo.color }">
              <i class="ph" :class="tipo.icono"></i>
            </div>
            <div class="tipo-info">
              <h4>{{ tipo.cantidad }}</h4>
              <p>{{ tipo.nombre }}</p>
              <span class="sesiones-activas">{{ tipo.sesiones_activas }} activos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividad Reciente -->
      <div class="dashboard-card actividad-reciente">
        <div class="card-header">
          <h3>
            <i class="ph ph-clock-clockwise"></i>
            Actividad Reciente
          </h3>
        </div>
        <div class="actividad-lista">
          <div v-for="actividad in actividadReciente" 
               :key="actividad.id"
               class="actividad-item">
            <div class="actividad-icon" :class="[`resultado-${actividad.resultado.toLowerCase()}`]">
              <i class="ph" :class="getIconoActividad(actividad.accion)"></i>
            </div>
            <div class="actividad-content">
              <h4>{{ actividad.accion.replace('_', ' ') }}</h4>
              <p>{{ actividad.administrador }} • {{ actividad.modulo }}</p>
              <span class="actividad-timestamp">{{ formatearFecha(actividad.fecha) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas de Rendimiento -->
      <div class="dashboard-card metricas-rendimiento">
        <div class="card-header">
          <h3>
            <i class="ph ph-gauge"></i>
            Rendimiento del Sistema
          </h3>
        </div>
        <div class="rendimiento-grid">
          <div class="rendimiento-item">
            <div class="rendimiento-valor">{{ tiempoPromedioRespuesta }}ms</div>
            <div class="rendimiento-label">Tiempo Promedio</div>
            <div class="rendimiento-bar">
              <div class="bar-fill" :style="{ width: getBarraRendimiento(tiempoPromedioRespuesta, 2000) }"></div>
            </div>
          </div>
          
          <div class="rendimiento-item">
            <div class="rendimiento-valor">{{ tasaExito }}%</div>
            <div class="rendimiento-label">Tasa de Éxito</div>
            <div class="rendimiento-bar">
              <div class="bar-fill success" :style="{ width: tasaExito + '%' }"></div>
            </div>
          </div>
          
          <div class="rendimiento-item">
            <div class="rendimiento-valor">{{ erroresTotales }}</div>
            <div class="rendimiento-label">Errores Hoy</div>
            <div class="rendimiento-bar">
              <div class="bar-fill error" :style="{ width: getBarraRendimiento(erroresTotales, 50) }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="dashboard-card accesos-rapidos">
        <div class="card-header">
          <h3>
            <i class="ph ph-lightning"></i>
            Accesos Rápidos
          </h3>
        </div>
        <div class="accesos-grid">
          <router-link to="/admin/usuarios" class="acceso-item">
            <i class="ph ph-users"></i>
            <span>Gestión de Usuarios</span>
          </router-link>
          
          <router-link to="/admin/empresas" class="acceso-item">
            <i class="ph ph-buildings"></i>
            <span>Administrar Empresas</span>
          </router-link>
          
          <router-link to="/admin/incidentes" class="acceso-item">
            <i class="ph ph-warning"></i>
            <span>Monitor Incidentes</span>
          </router-link>
          
          <router-link to="/admin/reportes" class="acceso-item">
            <i class="ph ph-file-text"></i>
            <span>Reportes ANCI</span>
          </router-link>
          
          <router-link to="/admin/auditoria" class="acceso-item">
            <i class="ph ph-shield-check"></i>
            <span>Logs de Auditoría</span>
          </router-link>
          
          <router-link to="/admin/configuracion" class="acceso-item">
            <i class="ph ph-gear"></i>
            <span>Configuración</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 🎯 RECOMENDACIONES INTELIGENTES -->
    <div v-if="recomendaciones.length > 0" class="recomendaciones-section">
      <h3 class="recomendaciones-title">
        <i class="ph ph-lightbulb"></i>
        Recomendaciones Inteligentes
      </h3>
      
      <div class="recomendaciones-grid">
        <div v-for="recomendacion in recomendaciones" 
             :key="recomendacion.id"
             class="recomendacion-card"
             :class="[`prioridad-${recomendacion.prioridad.toLowerCase()}`]">
          <div class="recomendacion-header">
            <div class="prioridad-badge">{{ recomendacion.prioridad }}</div>
            <div class="esfuerzo-badge">{{ recomendacion.esfuerzo }}</div>
          </div>
          <h4>{{ recomendacion.titulo }}</h4>
          <p>{{ recomendacion.descripcion }}</p>
          <div class="recomendacion-accion">
            <strong>Acción:</strong> {{ recomendacion.accion_recomendada }}
          </div>
          <div class="recomendacion-impacto">
            <strong>Impacto:</strong> {{ recomendacion.impacto_estimado }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="cargando" class="loading-overlay">
      <div class="loading-content">
        <div class="quantum-loader"></div>
        <p>{{ mensajeCarga }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import GraficoActividad from './GraficoActividad.vue'

const router = useRouter()
const authStore = useAuthStore()

// Estado reactivo
const cargando = ref(false)
const mensajeCarga = ref('')
const mostrarAlertas = ref(false)
const periodoActivo = ref('24h')

// Datos del dashboard
const metricas = ref({})
const tiposAdministradores = ref([])
const actividadReciente = ref([])
const alertas = ref([])
const recomendaciones = ref([])
const datosActividad = ref([])

// Métricas de rendimiento
const tiempoPromedioRespuesta = ref(0)
const tasaExito = ref(0)
const erroresTotales = ref(0)

// Intervalo de actualización
let intervaloActualizacion = null

// Computed properties
const adminActual = computed(() => authStore.admin || {})

// Métodos principales
async function cargarDatosDashboard() {
  cargando.value = true
  mensajeCarga.value = 'Cargando métricas del sistema...'
  
  try {
    // Cargar todos los datos en paralelo
    const [
      resMetricas,
      resEstadisticas,
      resAlertas,
      resRecomendaciones,
      resGraficos,
      resRendimiento
    ] = await Promise.all([
      fetch('/api/admin-dashboard/metricas-generales', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch('/api/admin-dashboard/estadisticas-administradores', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch('/api/admin-dashboard/alertas-sistema', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch('/api/admin-analytics/recomendaciones-optimizacion', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch('/api/admin-dashboard/graficos-actividad', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      }),
      fetch('/api/admin-dashboard/metricas-rendimiento', {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
    ])
    
    // Procesar respuestas
    if (resMetricas.ok) {
      const dataMetricas = await resMetricas.json()
      metricas.value = dataMetricas.metricas
    }
    
    if (resEstadisticas.ok) {
      const dataEstadisticas = await resEstadisticas.json()
      tiposAdministradores.value = dataEstadisticas.tipos_admin
      actividadReciente.value = dataEstadisticas.actividad_reciente
    }
    
    if (resAlertas.ok) {
      const dataAlertas = await resAlertas.json()
      alertas.value = dataAlertas.alertas
    }
    
    if (resRecomendaciones.ok) {
      const dataRecomendaciones = await resRecomendaciones.json()
      recomendaciones.value = dataRecomendaciones.recomendaciones
    }
    
    if (resGraficos.ok) {
      const dataGraficos = await resGraficos.json()
      datosActividad.value = dataGraficos.actividad_diaria
    }
    
    if (resRendimiento.ok) {
      const dataRendimiento = await resRendimiento.json()
      calcularMetricasRendimiento(dataRendimiento)
    }
    
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    cargando.value = false
  }
}

function calcularMetricasRendimiento(data) {
  // Calcular tiempo promedio de respuesta
  if (data.rendimiento_modulos && data.rendimiento_modulos.length > 0) {
    const tiempos = data.rendimiento_modulos.map(m => m.tiempo_promedio_ms)
    tiempoPromedioRespuesta.value = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
  }
  
  // Calcular tasa de éxito
  if (data.estadisticas_errores) {
    const exitosos = data.estadisticas_errores.EXITOSO || 0
    const errores = data.estadisticas_errores.ERROR || 0
    const total = exitosos + errores
    tasaExito.value = total > 0 ? Math.round((exitosos / total) * 100) : 100
    erroresTotales.value = errores
  }
}

function calcularTendenciaIncidentes() {
  // Lógica para calcular tendencia de incidentes
  const incidentesActuales = metricas.value.incidentes_mes || 0
  if (incidentesActuales > 50) {
    return '↗ Tendencia alta'
  } else if (incidentesActuales > 20) {
    return '→ Tendencia normal'
  } else {
    return '↘ Tendencia baja'
  }
}

function getIconoActividad(accion) {
  const iconos = {
    'LOGIN_SUCCESS': 'ph-sign-in',
    'CREATE_USER': 'ph-user-plus',
    'DELETE_USER': 'ph-user-minus',
    'CREATE_ADMIN': 'ph-crown',
    'EXPORT_REPORT': 'ph-download',
    'UPDATE_PERMISSIONS': 'ph-shield-check'
  }
  return iconos[accion] || 'ph-activity'
}

function getBarraRendimiento(valor, maximo) {
  return Math.min((valor / maximo) * 100, 100) + '%'
}

function cambiarPeriodo(nuevoPeriodo) {
  periodoActivo.value = nuevoPeriodo
  // Recargar datos según el período
  cargarDatosDashboard()
}

async function actualizarDatos() {
  await cargarDatosDashboard()
}

async function exportarReporte() {
  cargando.value = true
  mensajeCarga.value = 'Generando reporte de dashboard...'
  
  try {
    const response = await fetch('/api/admin-dashboard/exportar-reporte', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        tipo: 'general',
        formato: 'json',
        fecha_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        fecha_fin: new Date().toISOString()
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      
      // Crear y descargar archivo
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard_reporte_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  } catch (error) {
    console.error('Error exportando reporte:', error)
  } finally {
    cargando.value = false
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  cargarDatosDashboard()
  
  // Actualizar cada 5 minutos
  intervaloActualizacion = setInterval(cargarDatosDashboard, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion)
  }
})
</script>

<style scoped>
.dashboard-administradores {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: white;
  position: relative;
}

/* Header Épico */
.dashboard-header {
  position: relative;
  padding: 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="20" style="font:16px monospace;fill:%234f46e5">01</text><text y="40" style="font:12px monospace;fill:%236366f1">10</text><text y="60" style="font:14px monospace;fill:%237c3aed">11</text></svg>') repeat;
  opacity: 0.1;
  animation: matrix-fall 20s linear infinite;
}

.cyber-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: grid-pulse 4s ease-in-out infinite;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.admin-avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  border: 3px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.avatar-glow {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse-glow 2s ease-in-out infinite;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.title-main {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-glow {
  display: block;
  font-size: 1rem;
  color: #06b6d4;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.admin-details {
  font-size: 1.1rem;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.online-indicator {
  color: #10b981;
  font-weight: 600;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Botones Cuánticos */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-quantum {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-quantum:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
}

.btn-alert {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  position: relative;
}

.btn-alert.active {
  background: rgba(239, 68, 68, 0.3);
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-export {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

/* Panel de Alertas */
.alertas-panel {
  margin: 0 2rem 2rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
}

.alertas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.alertas-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f87171;
  font-size: 1.25rem;
}

.alertas-count {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.alertas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.alerta-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.alerta-alta {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: #ef4444;
}

.alerta-media {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: #f59e0b;
}

.alerta-baja {
  background: rgba(6, 182, 212, 0.1);
  border-left-color: #06b6d4;
}

.alerta-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.alerta-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.alerta-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

.alerta-timestamp {
  font-size: 0.75rem;
  opacity: 0.6;
}

/* Métricas Principales */
.metricas-principales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 0 2rem 2rem;
}

.metrica-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.metrica-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.metrica-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.usuarios-totales .metrica-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.administradores .metrica-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.empresas .metrica-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.incidentes .metrica-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.metrica-content h3 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.25rem 0;
}

.metrica-content p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metrica-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.metrica-trend.positive {
  color: #10b981;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin: 0 2rem 2rem;
}

.dashboard-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}

.period-selector {
  display: flex;
  gap: 0.25rem;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.period-btn.active {
  background: #3b82f6;
  color: white;
}

/* Distribución de Administradores */
.distribucion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tipo-admin-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.5rem;
}

.tipo-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.tipo-info h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #3b82f6;
}

.tipo-info p {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0;
}

.sesiones-activas {
  font-size: 0.75rem;
  color: #10b981;
}

/* Actividad Reciente */
.actividad-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.actividad-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 0.5rem;
}

.actividad-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.resultado-exitoso {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.resultado-error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.actividad-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.actividad-content p {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0 0 0.25rem 0;
}

.actividad-timestamp {
  font-size: 0.625rem;
  color: #64748b;
}

/* Métricas de Rendimiento */
.rendimiento-grid {
  display: grid;
  gap: 1rem;
}

.rendimiento-item {
  padding: 1rem;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 0.5rem;
}

.rendimiento-valor {
  font-size: 2rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.25rem;
}

.rendimiento-label {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.rendimiento-bar {
  height: 6px;
  background: rgba(100, 116, 139, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.bar-fill.success {
  background: #10b981;
}

.bar-fill.error {
  background: #ef4444;
}

/* Accesos Rápidos */
.accesos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.acceso-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 0.5rem;
  text-decoration: none;
  color: #cbd5e1;
  transition: all 0.3s ease;
}

.acceso-item:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
  color: #3b82f6;
}

.acceso-item i {
  font-size: 2rem;
}

.acceso-item span {
  font-size: 0.875rem;
  text-align: center;
  font-weight: 500;
}

/* Recomendaciones */
.recomendaciones-section {
  margin: 2rem;
}

.recomendaciones-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 1.5rem;
}

.recomendaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.recomendacion-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
}

.prioridad-alta {
  border-left: 4px solid #ef4444;
}

.prioridad-media {
  border-left: 4px solid #f59e0b;
}

.prioridad-baja {
  border-left: 4px solid #06b6d4;
}

.recomendacion-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.prioridad-badge, .esfuerzo-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.prioridad-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.esfuerzo-badge {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.recomendacion-card h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.recomendacion-card p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.recomendacion-accion, .recomendacion-impacto {
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.recomendacion-accion strong, .recomendacion-impacto strong {
  color: #3b82f6;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.quantum-loader {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* Transiciones */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Animaciones */
@keyframes matrix-fall {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes grid-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px currentColor; }
  50% { box-shadow: 0 0 20px currentColor; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    margin: 0 1rem 2rem;
  }
  
  .metricas-principales {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin: 0 1rem 2rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
}
</style>