<template>
  <div class="vista-cuenta-regresiva-detalle">
    <div class="header-navegacion">
      <button @click="volver" class="btn-volver">
        <i class="ph ph-arrow-left"></i>
        <span>Volver</span>
      </button>
      
      <div class="header-info">
        <h1 class="titulo-principal">
          <i class="ph ph-clock-countdown"></i>
          Detalle de Plazos ANCI
        </h1>
        <p class="subtitulo">
          Seguimiento detallado de tiempos para el incidente #{{ incidenteId }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="ph ph-warning-circle"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else class="contenido-principal">
      <!-- Información del Incidente -->
      <div class="card-info-incidente">
        <h3><i class="ph ph-file-text"></i> Información del Incidente</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Título:</span>
            <span class="value">{{ incidente.titulo }}</span>
          </div>
          <div class="info-item">
            <span class="label">Empresa:</span>
            <span class="value">{{ incidente.empresa }} ({{ incidente.tipoEmpresa }})</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha Detección:</span>
            <span class="value">{{ formatearFecha(incidente.fechaDeteccion) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Criticidad:</span>
            <span class="value badge" :class="'criticidad-' + incidente.criticidad?.toLowerCase()">
              {{ incidente.criticidad }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timeline de Plazos -->
      <div class="timeline-container">
        <h3><i class="ph ph-timer"></i> Línea de Tiempo de Plazos Legales ANCI</h3>
        
        <div class="timeline">
          <!-- 1. Alerta Temprana (3 horas) -->
          <div class="timeline-item" :class="getEstadoPlazo('alerta_temprana')">
            <div class="timeline-marker">
              <i :class="getIconoPlazo('alerta_temprana')"></i>
            </div>
            <div class="timeline-content">
              <h4>1. Alerta Temprana ANCI</h4>
              <p class="plazo-limite">
                <i class="ph ph-warning"></i>
                Plazo: 3 horas (Obligatorio OIV y PSE)
              </p>
              <p class="fecha-limite">
                Vence: {{ formatearFecha(calcularFechaLimite('alerta_temprana')) }}
              </p>
              <div class="contador" :class="getClaseContador('alerta_temprana')">
                <i class="ph ph-clock"></i>
                {{ calcularTiempoRestante('alerta_temprana') }}
              </div>
              <div v-if="reportes.alerta_temprana" class="estado-completado">
                <i class="ph ph-check-circle"></i>
                Completado: {{ formatearFecha(reportes.alerta_temprana.fecha) }}
              </div>
              <div v-if="!reportes.alerta_temprana" class="acciones-reporte">
                <button class="btn-generar-reporte" @click="generarReporte('alerta_temprana')">
                  <i class="ph ph-file-text"></i>
                  Generar Alerta Temprana
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Informe Preliminar (24h OIV / 72h PSE) -->
          <div class="timeline-item" :class="getEstadoPlazo('informe_preliminar')">
            <div class="timeline-marker">
              <i :class="getIconoPlazo('informe_preliminar')"></i>
            </div>
            <div class="timeline-content">
              <h4>2. Informe Preliminar ANCI</h4>
              <p class="plazo-limite">
                <i class="ph ph-file-text"></i>
                Plazo: {{ incidente.tipoEmpresa === 'OIV' ? '24 horas (servicio esencial) / 72 horas (otros)' : '72 horas (PSE)' }}
              </p>
              <p class="fecha-limite">
                Vence: {{ formatearFecha(calcularFechaLimite('informe_preliminar')) }}
              </p>
              <div class="contador" :class="getClaseContador('informe_preliminar')">
                <i class="ph ph-clock"></i>
                {{ calcularTiempoRestante('informe_preliminar') }}
              </div>
              <div v-if="reportes.informe_preliminar" class="estado-completado">
                <i class="ph ph-check-circle"></i>
                Completado: {{ formatearFecha(reportes.informe_preliminar.fecha) }}
              </div>
              <div v-if="!reportes.informe_preliminar" class="acciones-reporte">
                <button class="btn-generar-reporte" @click="generarReporte('informe_preliminar')">
                  <i class="ph ph-clipboard-text"></i>
                  Generar Informe Preliminar
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Informe Completo (72 horas) -->
          <div class="timeline-item" :class="getEstadoPlazo('informe_completo')">
            <div class="timeline-marker">
              <i :class="getIconoPlazo('informe_completo')"></i>
            </div>
            <div class="timeline-content">
              <h4>3. Informe Completo ANCI</h4>
              <p class="plazo-limite">
                <i class="ph ph-file-doc"></i>
                Plazo: 72 horas (OIV y PSE)
              </p>
              <p class="fecha-limite">
                Vence: {{ formatearFecha(calcularFechaLimite('informe_completo')) }}
              </p>
              <div class="contador" :class="getClaseContador('informe_completo')">
                <i class="ph ph-clock"></i>
                {{ calcularTiempoRestante('informe_completo') }}
              </div>
              <div v-if="reportes.informe_completo" class="estado-completado">
                <i class="ph ph-check-circle"></i>
                Completado: {{ formatearFecha(reportes.informe_completo.fecha) }}
              </div>
              <div v-if="!reportes.informe_completo" class="acciones-reporte">
                <button class="btn-generar-reporte" @click="generarReporte('informe_completo')">
                  <i class="ph ph-file-search"></i>
                  Generar Informe Completo
                </button>
              </div>
            </div>
          </div>

          <!-- 4. Plan de Acción (Solo OIV - 7 días) -->
          <div v-if="incidente.tipoEmpresa === 'OIV'" class="timeline-item" :class="getEstadoPlazo('plan_accion')">
            <div class="timeline-marker">
              <i :class="getIconoPlazo('plan_accion')"></i>
            </div>
            <div class="timeline-content">
              <h4>4. Plan de Acción OIV</h4>
              <p class="plazo-limite">
                <i class="ph ph-strategy"></i>
                Plazo: 7 días (Solo para OIV)
              </p>
              <p class="fecha-limite">
                Vence: {{ formatearFecha(calcularFechaLimite('plan_accion')) }}
              </p>
              <div class="contador" :class="getClaseContador('plan_accion')">
                <i class="ph ph-clock"></i>
                {{ calcularTiempoRestante('plan_accion') }}
              </div>
              <div v-if="reportes.plan_accion" class="estado-completado">
                <i class="ph ph-check-circle"></i>
                Completado: {{ formatearFecha(reportes.plan_accion.fecha) }}
              </div>
              <div v-if="!reportes.plan_accion" class="acciones-reporte">
                <button class="btn-generar-reporte" @click="generarReporte('plan_accion')">
                  <i class="ph ph-strategy"></i>
                  Generar Plan de Acción
                </button>
              </div>
            </div>
          </div>

          <!-- 5. Informe Final (15 días) -->
          <div class="timeline-item" :class="getEstadoPlazo('informe_final')">
            <div class="timeline-marker">
              <i :class="getIconoPlazo('informe_final')"></i>
            </div>
            <div class="timeline-content">
              <h4>5. Informe Final ANCI</h4>
              <p class="plazo-limite">
                <i class="ph ph-file-check"></i>
                Plazo: 15 días (OIV y PSE)
              </p>
              <p class="fecha-limite">
                Vence: {{ formatearFecha(calcularFechaLimite('informe_final')) }}
              </p>
              <div class="contador" :class="getClaseContador('informe_final')">
                <i class="ph ph-clock"></i>
                {{ calcularTiempoRestante('informe_final') }}
              </div>
              <div v-if="reportes.informe_final" class="estado-completado">
                <i class="ph ph-check-circle"></i>
                Completado: {{ formatearFecha(reportes.informe_final.fecha) }}
                <div class="incidente-cerrado">
                  <i class="ph ph-seal-check"></i>
                  Incidente Cerrado
                </div>
              </div>
              <div v-if="!reportes.informe_final" class="acciones-reporte">
                <button class="btn-generar-reporte cerrar-incidente" @click="generarReporte('informe_final')">
                  <i class="ph ph-check-circle"></i>
                  Cerrar Incidente - Generar Informe Final
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de Estado -->
        <div class="resumen-estado">
          <h4><i class="ph ph-chart-pie"></i> Resumen de Cumplimiento</h4>
          <div class="estado-grid">
            <div class="estado-item">
              <span class="estado-numero">{{ reportesCompletados }}</span>
              <span class="estado-label">Reportes Completados</span>
            </div>
            <div class="estado-item">
              <span class="estado-numero">{{ reportesPendientes }}</span>
              <span class="estado-label">Reportes Pendientes</span>
            </div>
            <div class="estado-item">
              <span class="estado-numero">{{ reportesVencidos }}</span>
              <span class="estado-label">Reportes Vencidos</span>
            </div>
            <div class="estado-item">
              <span class="estado-numero">{{ porcentajeCompletitud }}%</span>
              <span class="estado-label">Completitud</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de Acciones -->
      <div class="historial-container">
        <h3><i class="ph ph-list-bullets"></i> Historial de Acciones</h3>
        <div class="historial-lista">
          <div v-for="accion in historial" :key="accion.id" class="historial-item">
            <div class="historial-icono">
              <i :class="getIconoAccion(accion.tipo)"></i>
            </div>
            <div class="historial-contenido">
              <p class="historial-descripcion">{{ accion.descripcion }}</p>
              <p class="historial-fecha">{{ formatearFecha(accion.fecha) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../config'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  incidenteId: {
    type: [String, Number],
    required: true
  }
})

// Estado
const loading = ref(true)
const error = ref(null)
const incidente = ref({})
const reportes = ref({
  alerta_temprana: null,
  informe_preliminar: null,
  informe_completo: null,
  plan_accion: null,
  informe_final: null
})
const historial = ref([])

// Métodos
function volver() {
  router.back()
}

function formatearFecha(fecha) {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calcularFechaLimite(tipo) {
  // Usar fecha de transformación ANCI si está disponible
  const fechaBase = incidente.value.fechaTransformacionANCI || incidente.value.fechaDeteccion
  if (!fechaBase) return null
  
  const fecha = new Date(fechaBase)
  
  // Plazos según documento oficial ANCI
  switch(tipo) {
    case 'alerta_temprana':
      // ALERTA TEMPRANA: 3 horas para TODOS (OIV y PSE)
      fecha.setHours(fecha.getHours() + 3)
      break
      
    case 'informe_preliminar':
      // INFORME PRELIMINAR: 24h OIV (servicios esenciales) / 72h OIV (otros) / 72h PSE
      const horasPreliminar = incidente.value.tipoEmpresa === 'OIV' ? 24 : 72
      fecha.setHours(fecha.getHours() + horasPreliminar)
      break
      
    case 'informe_completo':
      // INFORME COMPLETO: 72 horas para TODOS
      fecha.setHours(fecha.getHours() + 72)
      break
      
    case 'plan_accion':
      // PLAN DE ACCIÓN: 7 días (Solo OIV)
      fecha.setDate(fecha.getDate() + 7)
      break
      
    case 'informe_final':
      // INFORME FINAL: 15 días para TODOS
      fecha.setDate(fecha.getDate() + 15)
      break
  }
  
  return fecha
}

function calcularTiempoRestante(tipo) {
  const ahora = new Date()
  const limite = calcularFechaLimite(tipo)
  
  if (!limite) return 'No calculado'
  
  // Si ya hay reporte, mostrar completado
  if (reportes.value[tipo]) {
    return 'Completado'
  }
  
  const diferencia = limite - ahora
  
  if (diferencia <= 0) {
    return 'VENCIDO'
  }
  
  const horas = Math.floor(diferencia / (1000 * 60 * 60))
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))
  
  if (horas > 24) {
    const dias = Math.floor(horas / 24)
    return `${dias} días, ${horas % 24} horas`
  }
  
  return `${horas} horas, ${minutos} minutos`
}

function getEstadoPlazo(tipo) {
  if (reportes.value[tipo]) return 'completado'
  
  const tiempo = calcularTiempoRestante(tipo)
  if (tiempo === 'VENCIDO') return 'vencido'
  
  const limite = calcularFechaLimite(tipo)
  const ahora = new Date()
  const horasRestantes = (limite - ahora) / (1000 * 60 * 60)
  
  if (horasRestantes <= 2) return 'urgente'
  if (horasRestantes <= 24) return 'proximo'
  
  return 'pendiente'
}

function getIconoPlazo(tipo) {
  const estado = getEstadoPlazo(tipo)
  
  switch (estado) {
    case 'completado': return 'ph ph-check-circle'
    case 'vencido': return 'ph ph-x-circle'
    case 'urgente': return 'ph ph-warning'
    case 'proximo': return 'ph ph-clock-countdown'
    default: return 'ph ph-circle'
  }
}

function getClaseContador(tipo) {
  const estado = getEstadoPlazo(tipo)
  return `contador-${estado}`
}

function getIconoAccion(tipo) {
  switch (tipo) {
    case 'creacion': return 'ph ph-plus-circle'
    case 'reporte': return 'ph ph-file-text'
    case 'alerta': return 'ph ph-bell'
    case 'actualizacion': return 'ph ph-pencil'
    default: return 'ph ph-circle'
  }
}

// Computed properties para estadísticas
const reportesCompletados = computed(() => {
  return Object.values(reportes.value).filter(reporte => reporte !== null).length
})

const reportesPendientes = computed(() => {
  const tiposReportes = ['alerta_temprana', 'informe_preliminar', 'informe_completo', 'informe_final']
  if (incidente.value.tipoEmpresa === 'OIV') {
    tiposReportes.push('plan_accion')
  }
  return tiposReportes.filter(tipo => reportes.value[tipo] === null).length
})

const reportesVencidos = computed(() => {
  const ahora = new Date()
  const tiposReportes = ['alerta_temprana', 'informe_preliminar', 'informe_completo', 'informe_final']
  if (incidente.value.tipoEmpresa === 'OIV') {
    tiposReportes.push('plan_accion')
  }
  
  return tiposReportes.filter(tipo => {
    if (reportes.value[tipo]) return false // Ya completado
    const limite = calcularFechaLimite(tipo)
    return limite && ahora > limite
  }).length
})

const porcentajeCompletitud = computed(() => {
  const total = incidente.value.tipoEmpresa === 'OIV' ? 5 : 4
  const completados = reportesCompletados.value
  return Math.round((completados / total) * 100)
})

async function generarReporte(tipo) {
  try {
    loading.value = true
    
    // Llamar al endpoint de generación de documentos
    // Usar endpoint de prueba por ahora
    const response = await fetch(`http://localhost:5000/api/incidente-test/${props.incidenteId}/generar-documento-anci`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        tipo_reporte: tipo,
        formato: 'json' // Generar documento JSON
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      
      // Si devuelve JSON con datos, mostrarlos
      if (errorData.datos) {
        console.log('Datos del incidente ANCI:', errorData.datos)
        alert('Se generó el reporte en formato JSON. Ver consola para detalles.')
        console.log(JSON.stringify(errorData.datos, null, 2))
        return
      }
      
      throw new Error(errorData.error || errorData.details || 'Error al generar documento')
    }
    
    // Obtener el blob del documento
    const blob = await response.blob()
    
    // Obtener el nombre del archivo desde el header Content-Disposition
    const contentDisposition = response.headers.get('content-disposition')
    let filename = `ANCI_${tipo}_${props.incidenteId}_${new Date().toISOString().slice(0, 10)}.json`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }
    
    // Crear URL para descarga
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    
    // Iniciar descarga
    document.body.appendChild(link)
    link.click()
    
    // Limpiar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    // Mostrar mensaje de éxito
    console.log(`Documento ${tipo} generado exitosamente`)
    
  } catch (error) {
    console.error('Error generando documento:', error)
    alert(`Error al generar el documento: ${error.message}`)
  } finally {
    loading.value = false
  }
}

async function cargarDatos() {
  loading.value = true
  error.value = null
  
  try {
    // Cargar datos reales del incidente desde la API
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_BASE_URL}/api/admin/incidentes/${props.incidenteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = response.data
    
    incidente.value = {
      id: data.IncidenteID,
      titulo: data.Titulo,
      empresa: data.RazonSocial || 'Sin empresa',
      tipoEmpresa: data.TipoEmpresa || 'PSE', // Usar el tipo real de la BD
      fechaDeteccion: data.FechaDeteccion,
      fechaTransformacionANCI: data.FechaTransformacionANCI,
      criticidad: data.Criticidad
    }
    
    console.log('Incidente cargado:', incidente.value)
    console.log(`Tipo de empresa: ${incidente.value.tipoEmpresa}`)
    
    // Cargar estado de reportes ANCI
    try {
      const anciResponse = await axios.get(`${API_BASE_URL}/incidente/${props.incidenteId}/cargar-anci`)
      if (anciResponse.data && anciResponse.data.success) {
        const tracking = anciResponse.data.incidente.estructura_json?.['9']?.tracking_reportes || {}
        
        // Mapear estados de reportes
        reportes.value = {
          alerta_temprana: tracking.alerta_temprana_enviada ? { fecha: tracking.fecha_alerta_temprana } : null,
          informe_preliminar: tracking.informe_preliminar_enviado ? { fecha: tracking.fecha_informe_preliminar } : null,
          informe_completo: tracking.informe_completo_enviado ? { fecha: tracking.fecha_informe_completo } : null,
          plan_accion: tracking.plan_accion_enviado ? { fecha: tracking.fecha_plan_accion } : null,
          informe_final: tracking.informe_final_enviado ? { fecha: tracking.fecha_informe_final } : null
        }
      }
    } catch (err) {
      console.warn('No se pudieron cargar datos ANCI:', err)
    }
    
    // Cargar historial
    historial.value = [
      {
        id: 1,
        tipo: 'creacion',
        descripcion: 'Incidente transformado a ANCI',
        fecha: data.FechaTransformacionANCI || data.FechaDeteccion
      }
    ]
    
    // Agregar entradas del historial según reportes completados
    Object.entries(reportes.value).forEach(([tipo, reporte]) => {
      if (reporte) {
        const nombres = {
          'alerta_temprana': 'Alerta Temprana ANCI enviada',
          'informe_preliminar': 'Informe Preliminar ANCI enviado',
          'informe_completo': 'Informe Completo ANCI enviado',
          'plan_accion': 'Plan de Acción OIV enviado',
          'informe_final': 'Informe Final ANCI enviado - Incidente cerrado'
        }
        
        historial.value.push({
          id: historial.value.length + 1,
          tipo: 'reporte',
          descripcion: nombres[tipo],
          fecha: reporte.fecha
        })
      }
    })
    
    // Ordenar historial por fecha
    historial.value.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    
  } catch (err) {
    error.value = 'Error al cargar los datos del incidente'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.vista-cuenta-regresiva-detalle {
  min-height: 100vh;
  background: #0f172a;
  padding: 2rem;
  color: #e2e8f0;
}

/* Header */
.header-navegacion {
  margin-bottom: 2rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.btn-volver:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  transform: translateX(-4px);
}

.header-info {
  margin-bottom: 2rem;
}

.titulo-principal {
  font-size: 2rem;
  color: #e2e8f0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.titulo-principal i {
  color: #f59e0b;
}

.subtitulo {
  color: #94a3b8;
  font-size: 1rem;
}

/* Cards */
.card-info-incidente {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.card-info-incidente h3 {
  color: #e2e8f0;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-info-incidente h3 i {
  color: #3b82f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.info-item .value {
  color: #e2e8f0;
  font-weight: 500;
}

/* Timeline */
.timeline-container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.timeline-container h3 {
  color: #e2e8f0;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-container h3 i {
  color: #f59e0b;
}

.timeline {
  position: relative;
  padding-left: 3rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #334155;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 1rem;
  width: 2rem;
  height: 2rem;
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-marker i {
  font-size: 1rem;
}

/* Estados de timeline */
.timeline-item.completado .timeline-marker {
  border-color: #10b981;
}

.timeline-item.completado .timeline-marker i {
  color: #10b981;
}

.timeline-item.vencido .timeline-marker {
  border-color: #ef4444;
}

.timeline-item.vencido .timeline-marker i {
  color: #ef4444;
}

.timeline-item.urgente .timeline-marker {
  border-color: #ef4444;
  animation: pulse 1s infinite;
}

.timeline-item.urgente .timeline-marker i {
  color: #ef4444;
}

.timeline-item.proximo .timeline-marker {
  border-color: #f59e0b;
}

.timeline-item.proximo .timeline-marker i {
  color: #f59e0b;
}

.timeline-content h4 {
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.plazo-limite,
.fecha-limite {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.contador {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.contador i {
  font-size: 1rem;
}

.contador-completado {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.contador-vencido {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.contador-urgente {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  animation: pulse 1s infinite;
}

.contador-proximo {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.contador-pendiente {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.estado-completado {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.375rem;
  color: #10b981;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Historial */
.historial-container {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.historial-container h3 {
  color: #e2e8f0;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.historial-container h3 i {
  color: #94a3b8;
}

.historial-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.historial-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
}

.historial-icono {
  width: 2rem;
  height: 2rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.historial-icono i {
  color: #3b82f6;
  font-size: 1rem;
}

.historial-contenido {
  flex: 1;
}

.historial-descripcion {
  color: #e2e8f0;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.historial-fecha {
  color: #64748b;
  font-size: 0.75rem;
}

/* Loading y Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 400px;
  color: #94a3b8;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-container i {
  font-size: 3rem;
  color: #ef4444;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.criticidad-alta {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.criticidad-media {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.criticidad-baja {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Animaciones */
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Acciones de reporte */
.acciones-reporte {
  margin-top: 1rem;
}

.btn-generar-reporte {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generar-reporte:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-generar-reporte.cerrar-incidente {
  background: #059669;
}

.btn-generar-reporte.cerrar-incidente:hover {
  background: #047857;
}

.incidente-cerrado {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.3);
  border-radius: 0.375rem;
  color: #059669;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Resumen de estado */
.resumen-estado {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #334155;
}

.resumen-estado h4 {
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resumen-estado h4 i {
  color: #f59e0b;
}

.estado-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.estado-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.estado-numero {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.25rem;
}

.estado-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Estados específicos de timeline mejorados */
.timeline-item.completado {
  border-left: 3px solid #10b981;
}

.timeline-item.vencido {
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.02);
}

.timeline-item.urgente {
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.02);
}

.timeline-item.proximo {
  border-left: 3px solid #f59e0b;
  background: rgba(245, 158, 11, 0.02);
}

.timeline-item.pendiente {
  border-left: 3px solid #64748b;
}

/* Iconos de plazos en contenido */
.plazo-limite i {
  margin-right: 0.5rem;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .titulo-principal {
    font-size: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    padding-left: 2rem;
  }
  
  .timeline-marker {
    left: -1.5rem;
  }
  
  .estado-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .btn-generar-reporte {
    width: 100%;
    justify-content: center;
  }
}
</style>