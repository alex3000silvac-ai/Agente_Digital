<template>
  <div class="seguimiento-plazos-container">
    <!-- Header con información de plazos -->
    <div class="plazos-header">
      <div class="tipo-empresa-info">
        <span class="tipo-badge" :class="`tipo-${tipoEmpresa?.toLowerCase()}`">
          {{ tipoEmpresa }}
        </span>
        <span class="plazos-texto">
          Plazo inicial: <strong>{{ tipoEmpresa === 'OIV' ? '2 horas' : '4 horas' }}</strong> | 
          Plazo final: <strong>72 horas</strong>
        </span>
      </div>
      
      <div class="estado-actual">
        <span class="estado-label">Estado:</span>
        <span :class="['estado-badge', `estado-${estadoActual}`]">
          {{ obtenerTextoEstado() }}
        </span>
      </div>
    </div>

    <!-- Línea de tiempo vertical -->
    <div class="timeline-container">
      <div class="timeline-vertical">
        
        <!-- Etapa 1: Detección del Incidente -->
        <div class="timeline-item" :class="{ 'completado': etapa1Completada }">
          <div class="timeline-marker">
            <i class="ph" :class="etapa1Completada ? 'ph-check-circle' : 'ph-circle'"></i>
          </div>
          <div class="timeline-content">
            <h3 class="etapa-titulo">Detección del Incidente</h3>
            <p class="etapa-fecha">{{ formatearFecha(fechaDeteccion) }}</p>
            <p class="etapa-descripcion">Incidente detectado y registrado en el sistema</p>
          </div>
        </div>

        <!-- Etapa 2: Transformación a ANCI -->
        <div class="timeline-item" :class="{ 'completado': etapa2Completada, 'activo': esEtapaActual(2) }">
          <div class="timeline-marker">
            <i class="ph" :class="obtenerIconoEtapa(2)"></i>
          </div>
          <div class="timeline-content">
            <h3 class="etapa-titulo">Transformación a Reporte ANCI</h3>
            <p class="etapa-fecha">{{ formatearFecha(fechaTransformacion) }}</p>
            <p class="etapa-descripcion">Incidente escalado a reporte oficial ANCI</p>
            <div v-if="etapa2Completada" class="alerta-enviada">
              <i class="ph ph-envelope-simple"></i>
              Alerta enviada al delegado de ciberseguridad
            </div>
          </div>
        </div>

        <!-- Etapa 3: Reporte Inicial -->
        <div class="timeline-item" :class="{ 
          'completado': etapa3Completada, 
          'activo': esEtapaActual(3),
          'alerta': mostrarAlertaInicial 
        }">
          <div class="timeline-marker">
            <i class="ph" :class="obtenerIconoEtapa(3)"></i>
          </div>
          <div class="timeline-content">
            <h3 class="etapa-titulo">Reporte Inicial ANCI</h3>
            <p class="etapa-fecha">
              Límite: {{ formatearFecha(fechaLimiteInicial) }}
            </p>
            
            <!-- Contador de tiempo -->
            <div v-if="!etapa3Completada && fechaTransformacion" class="contador-tiempo" :class="{ 'urgente': tiempoRestanteInicial.urgente }">
              <i class="ph ph-timer"></i>
              <span v-if="tiempoRestanteInicial.vencido">
                VENCIDO hace {{ tiempoRestanteInicial.texto }}
              </span>
              <span v-else>
                Tiempo restante: {{ tiempoRestanteInicial.texto }}
              </span>
            </div>
            
            <p class="etapa-descripcion">
              Envío del primer reporte con información preliminar
            </p>
            
            <div v-if="etapa3Completada" class="reporte-enviado">
              <i class="ph ph-check-circle"></i>
              Reporte enviado: {{ formatearFecha(fechaEnvioInicial) }}
            </div>
            
            <div v-else-if="etapa2Completada" class="acciones-reporte">
              <button @click="marcarReporteInicial" class="btn-enviar-reporte" :disabled="enviandoReporte">
                <i class="ph ph-upload"></i>
                <span>{{ enviandoReporte === 'inicial' ? 'Enviando...' : 'Marcar como Enviado' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Etapa 4: Investigación -->
        <div class="timeline-item" :class="{ 
          'completado': etapa4Completada, 
          'activo': esEtapaActual(4) 
        }">
          <div class="timeline-marker">
            <i class="ph" :class="obtenerIconoEtapa(4)"></i>
          </div>
          <div class="timeline-content">
            <h3 class="etapa-titulo">Investigación y Análisis</h3>
            <p class="etapa-descripcion">
              Análisis forense, identificación de causa raíz y medidas de mitigación
            </p>
            <div class="progreso-investigacion" v-if="esEtapaActual(4)">
              <div class="progreso-bar">
                <div class="progreso-fill" :style="{ width: progresoInvestigacion + '%' }"></div>
              </div>
              <span class="progreso-texto">{{ progresoInvestigacion }}% completado</span>
            </div>
          </div>
        </div>

        <!-- Etapa 5: Reporte Final -->
        <div class="timeline-item" :class="{ 
          'completado': etapa5Completada, 
          'activo': esEtapaActual(5),
          'alerta': mostrarAlertaFinal 
        }">
          <div class="timeline-marker">
            <i class="ph" :class="obtenerIconoEtapa(5)"></i>
          </div>
          <div class="timeline-content">
            <h3 class="etapa-titulo">Reporte Final ANCI</h3>
            <p class="etapa-fecha">
              Límite: {{ formatearFecha(fechaLimiteFinal) }}
            </p>
            
            <!-- Contador de tiempo -->
            <div v-if="!etapa5Completada && fechaTransformacion" class="contador-tiempo" :class="{ 'urgente': tiempoRestanteFinal.urgente }">
              <i class="ph ph-timer"></i>
              <span v-if="tiempoRestanteFinal.vencido">
                VENCIDO hace {{ tiempoRestanteFinal.texto }}
              </span>
              <span v-else>
                Tiempo restante: {{ tiempoRestanteFinal.texto }}
              </span>
            </div>
            
            <p class="etapa-descripcion">
              Reporte completo con análisis, causa raíz y plan de mejora
            </p>
            
            <div v-if="etapa5Completada" class="reporte-enviado">
              <i class="ph ph-check-circle"></i>
              Reporte enviado: {{ formatearFecha(fechaEnvioFinal) }}
            </div>
            
            <div v-else-if="etapa3Completada" class="acciones-reporte">
              <button @click="marcarReporteFinal" class="btn-enviar-reporte" :disabled="enviandoReporte">
                <i class="ph ph-upload"></i>
                <span>{{ enviandoReporte === 'final' ? 'Enviando...' : 'Marcar como Enviado' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Etapa 6: Cierre -->
        <div class="timeline-item" :class="{ 'completado': etapa6Completada }">
          <div class="timeline-marker">
            <i class="ph" :class="etapa6Completada ? 'ph-seal-check' : 'ph-circle'"></i>
          </div>
          <div class="timeline-content">
            <h3 class="etapa-titulo">Cierre del Caso ANCI</h3>
            <p class="etapa-descripcion">
              Caso cerrado y archivado en el sistema ANCI
            </p>
            <div v-if="etapa6Completada" class="caso-cerrado">
              <i class="ph ph-archive"></i>
              Cerrado: {{ formatearFecha(fechaCierre) }}
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Panel de alertas y recordatorios -->
    <div class="alertas-panel" v-if="alertasActivas.length > 0">
      <h3 class="alertas-titulo">
        <i class="ph ph-warning-circle"></i>
        Alertas y Recordatorios
      </h3>
      <div class="alertas-list">
        <div v-for="alerta in alertasActivas" :key="alerta.id" class="alerta-item" :class="`alerta-${alerta.tipo}`">
          <i class="ph" :class="alerta.icono"></i>
          <div class="alerta-content">
            <p class="alerta-mensaje">{{ alerta.mensaje }}</p>
            <p class="alerta-tiempo">{{ alerta.tiempo }}</p>
            
            <!-- Botón para enviar alerta por email -->
            <div class="alerta-actions">
              <button @click="enviarAlertaEmail(alerta)" class="btn-alerta-email" :disabled="enviandoAlerta">
                <i class="ph ph-envelope-simple"></i>
                <span>{{ enviandoAlerta === alerta.id ? 'Enviando...' : 'Enviar Alerta Email' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botón para enviar todas las alertas -->
      <div class="alertas-footer" v-if="alertasActivas.length > 1">
        <button @click="enviarTodasLasAlertas" class="btn-enviar-todas" :disabled="enviandoTodasAlertas">
          <i class="ph ph-envelope-simple"></i>
          <span>{{ enviandoTodasAlertas ? 'Enviando todas...' : 'Enviar Todas las Alertas' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  incidenteId: { type: [String, Number], required: true },
  reporteAnciId: { type: [String, Number], required: true },
  tipoEmpresa: { type: String, default: 'PSE' }
})

// Estado del reporte ANCI
const reporteAnci = ref({})
const fechaDeteccion = ref(null)
const fechaTransformacion = ref(null)
const fechaLimiteInicial = ref(null)
const fechaLimiteFinal = ref(null)
const fechaEnvioInicial = ref(null)
const fechaEnvioFinal = ref(null)
const fechaCierre = ref(null)
const estadoReporte = ref('Iniciado')

// Control de tiempo
const ahora = ref(new Date())
let intervalId = null

// Estado de envío de reportes
const enviandoReporte = ref(null)

// Estado de envío de alertas por email
const enviandoAlerta = ref(null)
const enviandoTodasAlertas = ref(false)

// Computed
const etapa1Completada = computed(() => !!fechaDeteccion.value)
const etapa2Completada = computed(() => !!fechaTransformacion.value)
const etapa3Completada = computed(() => !!fechaEnvioInicial.value)
const etapa4Completada = computed(() => etapa3Completada.value && !etapa5Completada.value)
const etapa5Completada = computed(() => !!fechaEnvioFinal.value)
const etapa6Completada = computed(() => estadoReporte.value === 'Cerrado')

const progresoInvestigacion = computed(() => {
  if (!etapa3Completada.value) return 0
  if (etapa5Completada.value) return 100
  
  // Calcular progreso basado en tiempo transcurrido
  const inicio = new Date(fechaEnvioInicial.value || fechaTransformacion.value)
  const fin = new Date(fechaLimiteFinal.value)
  const ahora = new Date()
  
  const tiempoTotal = fin - inicio
  const tiempoTranscurrido = ahora - inicio
  
  return Math.min(Math.round((tiempoTranscurrido / tiempoTotal) * 100), 95)
})

const estadoActual = computed(() => {
  if (etapa6Completada.value) return 'cerrado'
  if (etapa5Completada.value) return 'completo'
  if (etapa3Completada.value) return 'investigando'
  if (etapa2Completada.value) return 'esperando-inicial'
  return 'iniciado'
})

const tiempoRestanteInicial = computed(() => calcularTiempoRestante(fechaLimiteInicial.value))
const tiempoRestanteFinal = computed(() => calcularTiempoRestante(fechaLimiteFinal.value))

const mostrarAlertaInicial = computed(() => {
  return !etapa3Completada.value && tiempoRestanteInicial.value.urgente
})

const mostrarAlertaFinal = computed(() => {
  return !etapa5Completada.value && tiempoRestanteFinal.value.urgente
})

const alertasActivas = computed(() => {
  const alertas = []
  
  if (!etapa3Completada.value && fechaLimiteInicial.value) {
    const tiempo = tiempoRestanteInicial.value
    if (tiempo.vencido) {
      alertas.push({
        id: 'inicial-vencido',
        tipo: 'error',
        icono: 'ph-x-circle',
        mensaje: 'Reporte inicial ANCI vencido',
        tiempo: `Venció hace ${tiempo.texto}`
      })
    } else if (tiempo.horas < 1) {
      alertas.push({
        id: 'inicial-urgente',
        tipo: 'warning',
        icono: 'ph-warning',
        mensaje: 'Reporte inicial ANCI próximo a vencer',
        tiempo: `Quedan ${tiempo.texto}`
      })
    }
  }
  
  if (!etapa5Completada.value && fechaLimiteFinal.value) {
    const tiempo = tiempoRestanteFinal.value
    if (tiempo.vencido) {
      alertas.push({
        id: 'final-vencido',
        tipo: 'error',
        icono: 'ph-x-circle',
        mensaje: 'Reporte final ANCI vencido',
        tiempo: `Venció hace ${tiempo.texto}`
      })
    } else if (tiempo.horas < 24) {
      alertas.push({
        id: 'final-urgente',
        tipo: 'warning',
        icono: 'ph-warning',
        mensaje: 'Reporte final ANCI próximo a vencer',
        tiempo: `Quedan ${tiempo.texto}`
      })
    }
  }
  
  return alertas
})

// Métodos
function formatearFecha(fecha) {
  if (!fecha) return 'Pendiente'
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calcularTiempoRestante(fechaLimite) {
  if (!fechaLimite) return { texto: 'No definido', horas: 999, urgente: false, vencido: false }
  
  const limite = new Date(fechaLimite)
  const diferencia = limite - ahora.value
  const horas = Math.floor(Math.abs(diferencia) / (1000 * 60 * 60))
  const minutos = Math.floor((Math.abs(diferencia) % (1000 * 60 * 60)) / (1000 * 60))
  
  let texto = ''
  if (horas > 0) {
    texto = `${horas}h ${minutos}m`
  } else {
    texto = `${minutos} minutos`
  }
  
  return {
    texto,
    horas: diferencia / (1000 * 60 * 60),
    urgente: diferencia < (1000 * 60 * 60 * 2), // Menos de 2 horas
    vencido: diferencia < 0
  }
}

function obtenerTextoEstado() {
  const estados = {
    'cerrado': 'Caso Cerrado',
    'completo': 'Reportes Completados',
    'investigando': 'En Investigación',
    'esperando-inicial': 'Esperando Reporte Inicial',
    'iniciado': 'Recién Iniciado'
  }
  return estados[estadoActual.value] || 'Desconocido'
}

function esEtapaActual(etapa) {
  if (etapa === 2) return etapa2Completada.value && !etapa3Completada.value
  if (etapa === 3) return etapa2Completada.value && !etapa3Completada.value
  if (etapa === 4) return etapa3Completada.value && !etapa5Completada.value
  if (etapa === 5) return etapa3Completada.value && !etapa5Completada.value
  return false
}

function obtenerIconoEtapa(etapa) {
  if (etapa === 2) return etapa2Completada.value ? 'ph-check-circle' : 'ph-circle'
  if (etapa === 3) {
    if (etapa3Completada.value) return 'ph-check-circle'
    if (tiempoRestanteInicial.value.vencido) return 'ph-x-circle'
    if (esEtapaActual(3)) return 'ph-timer'
    return 'ph-circle'
  }
  if (etapa === 4) {
    if (etapa5Completada.value) return 'ph-check-circle'
    if (esEtapaActual(4)) return 'ph-magnifying-glass'
    return 'ph-circle'
  }
  if (etapa === 5) {
    if (etapa5Completada.value) return 'ph-check-circle'
    if (tiempoRestanteFinal.value.vencido) return 'ph-x-circle'
    if (esEtapaActual(5)) return 'ph-timer'
    return 'ph-circle'
  }
  return 'ph-circle'
}

async function cargarDatosReporte() {
  // Validar que los IDs existen
  if (!props.incidenteId || props.incidenteId === 'undefined') {
    console.error('Error: incidenteId es undefined o inválido:', props.incidenteId)
    return
  }
  
  if (!props.reporteAnciId || props.reporteAnciId === 'undefined') {
    console.warn('Warning: reporteAnciId es undefined, usando fallback')
    await cargarDatosIncidenteFallback()
    return
  }
  
  try {
    console.log('🔍 Cargando reporte ANCI con ID:', props.reporteAnciId)
    // Cargar datos del reporte ANCI completo
    const responseAnci = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteAnciId}`)
    if (responseAnci.ok) {
      const reporte = await responseAnci.json()
      reporteAnci.value = reporte
      
      // Asignar datos del reporte
      fechaDeteccion.value = reporte.FechaDeteccion
      fechaTransformacion.value = reporte.FechaTransformacion
      fechaLimiteInicial.value = new Date(reporte.FechaLimiteInicial)
      fechaLimiteFinal.value = new Date(reporte.FechaLimiteFinal)
      fechaEnvioInicial.value = reporte.FechaEnvioInicial ? new Date(reporte.FechaEnvioInicial) : null
      fechaEnvioFinal.value = reporte.FechaEnvioFinal ? new Date(reporte.FechaEnvioFinal) : null
      estadoReporte.value = reporte.EstadoReporte
      
      console.log('✅ Datos del reporte ANCI cargados:', reporte)
    } else {
      console.warn('No se pudieron cargar los datos del reporte ANCI')
      // Fallback: cargar datos del incidente solamente
      await cargarDatosIncidenteFallback()
    }
    
  } catch (error) {
    console.error('Error al cargar datos del reporte:', error)
    // Fallback en caso de error
    await cargarDatosIncidenteFallback()
  }
}

async function cargarDatosIncidenteFallback() {
  try {
    console.log('🔍 Fallback: Cargando datos del incidente con ID:', props.incidenteId)
    // Cargar datos del incidente como fallback
    const responseIncidente = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}`)
    if (responseIncidente.ok) {
      const incidente = await responseIncidente.json()
      fechaDeteccion.value = incidente.FechaDeteccion
      
      // Si hay ReporteAnciID pero no pudimos cargar los datos, crear datos temporales
      if (incidente.ReporteAnciID) {
        const ahora = new Date()
        fechaTransformacion.value = ahora
        
        // Calcular fechas límite según tipo de empresa
        const horasInicial = props.tipoEmpresa === 'OIV' ? 2 : 4
        fechaLimiteInicial.value = new Date(ahora.getTime() + horasInicial * 60 * 60 * 1000)
        fechaLimiteFinal.value = new Date(ahora.getTime() + 72 * 60 * 60 * 1000)
      }
    }
  } catch (fallbackError) {
    console.error('Error en fallback:', fallbackError)
  }
}

async function marcarReporteInicial() {
  enviandoReporte.value = 'inicial'
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteAnciId}/actualizar-estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'enviar_inicial',
        contenido: 'Reporte inicial enviado a través del sistema'
      })
    })
    
    if (response.ok) {
      // Recargar datos del reporte
      await cargarDatosReporte()
      alert('✅ Reporte inicial marcado como enviado')
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al marcar reporte')
    }
    
  } catch (error) {
    console.error('Error al marcar reporte inicial:', error)
    alert('❌ Error al marcar reporte inicial: ' + error.message)
  } finally {
    enviandoReporte.value = null
  }
}

async function marcarReporteFinal() {
  enviandoReporte.value = 'final'
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteAnciId}/actualizar-estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'enviar_final',
        contenido: 'Reporte final enviado a través del sistema'
      })
    })
    
    if (response.ok) {
      // Recargar datos del reporte
      await cargarDatosReporte()
      alert('✅ Reporte final marcado como enviado')
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al marcar reporte')
    }
    
  } catch (error) {
    console.error('Error al marcar reporte final:', error)
    alert('❌ Error al marcar reporte final: ' + error.message)
  } finally {
    enviandoReporte.value = null
  }
}

async function enviarAlertaEmail(alerta) {
  enviandoAlerta.value = alerta.id
  
  try {
    // Determinar tipo de alerta para el endpoint
    const tipoAlerta = alerta.vencido ? 'vencido' : 'proximo_vencimiento'
    
    const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteAnciId}/enviar-alerta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: tipoAlerta
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      alert('✅ ' + result.message)
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al enviar alerta')
    }
    
  } catch (error) {
    console.error('Error al enviar alerta por email:', error)
    alert('❌ Error al enviar alerta por email: ' + error.message)
  } finally {
    enviandoAlerta.value = null
  }
}

async function enviarTodasLasAlertas() {
  enviandoTodasAlertas.value = true
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/reportes-anci/enviar-alertas-vencimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      const result = await response.json()
      alert(`✅ ${result.mensaje}\nEmails enviados: ${result.emails_enviados}/${result.total_alertas_procesadas}`)
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al enviar alertas')
    }
    
  } catch (error) {
    console.error('Error al enviar todas las alertas:', error)
    alert('❌ Error al enviar alertas: ' + error.message)
  } finally {
    enviandoTodasAlertas.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarDatosReporte()
  
  // Actualizar tiempo cada minuto
  intervalId = setInterval(() => {
    ahora.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.seguimiento-plazos-container {
  background-color: #1f2937;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.plazos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
}

.tipo-empresa-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tipo-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.tipo-oiv {
  background-color: #dbeafe;
  color: #1e40af;
}

.tipo-pse {
  background-color: #e0e7ff;
  color: #4338ca;
}

.plazos-texto {
  color: #9ca3af;
  font-size: 0.875rem;
}

.plazos-texto strong {
  color: #e5e7eb;
}

.estado-actual {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estado-label {
  color: #9ca3af;
  font-size: 0.875rem;
}

.estado-badge {
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
}

.estado-iniciado {
  background-color: #374151;
  color: #d1d5db;
}

.estado-esperando-inicial {
  background-color: #7c2d12;
  color: #fed7aa;
}

.estado-investigando {
  background-color: #1e40af;
  color: #dbeafe;
}

.estado-completo {
  background-color: #166534;
  color: #bbf7d0;
}

.estado-cerrado {
  background-color: #4b5563;
  color: #e5e7eb;
}

/* Timeline */
.timeline-container {
  position: relative;
  padding: 2rem 0;
}

.timeline-vertical {
  position: relative;
  padding-left: 3rem;
}

.timeline-vertical::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #374151;
}

.timeline-item {
  position: relative;
  margin-bottom: 2.5rem;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.timeline-item.completado {
  opacity: 1;
}

.timeline-item.activo {
  opacity: 1;
}

.timeline-item.alerta .timeline-marker {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 2rem;
  height: 2rem;
  background-color: #1f2937;
  border: 2px solid #374151;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-marker i {
  font-size: 1.25rem;
  color: #9ca3af;
}

.timeline-item.completado .timeline-marker {
  background-color: #065f46;
  border-color: #10b981;
}

.timeline-item.completado .timeline-marker i {
  color: #10b981;
}

.timeline-item.activo .timeline-marker {
  background-color: #1e40af;
  border-color: #3b82f6;
}

.timeline-item.activo .timeline-marker i {
  color: #93bbfe;
}

.timeline-item.alerta .timeline-marker {
  background-color: #7c2d12;
  border-color: #f59e0b;
}

.timeline-item.alerta .timeline-marker i {
  color: #fbbf24;
}

.timeline-content {
  background-color: #111827;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.etapa-titulo {
  color: #f3f4f6;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.etapa-fecha {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.etapa-descripcion {
  color: #d1d5db;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.contador-tiempo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #1e293b;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
  font-weight: 600;
  color: #fbbf24;
}

.contador-tiempo.urgente {
  background-color: #7c2d12;
  color: #fed7aa;
  animation: pulse 2s infinite;
}

.contador-tiempo i {
  font-size: 1.125rem;
}

.alerta-enviada,
.reporte-enviado,
.caso-cerrado {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #064e3b;
  color: #6ee7b7;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.progreso-investigacion {
  margin-top: 0.75rem;
}

.progreso-bar {
  height: 0.5rem;
  background-color: #374151;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progreso-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s;
}

.progreso-texto {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Panel de alertas */
.alertas-panel {
  margin-top: 2rem;
  background-color: #111827;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.alertas-titulo {
  color: #f59e0b;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alertas-list {
  space-y: 0.75rem;
}

.alerta-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

.alerta-warning {
  background-color: #78350f;
  border: 1px solid #f59e0b;
}

.alerta-error {
  background-color: #7f1d1d;
  border: 1px solid #dc2626;
}

.alerta-item i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alerta-warning i {
  color: #fbbf24;
}

.alerta-error i {
  color: #f87171;
}

.alerta-content {
  flex: 1;
}

.alerta-mensaje {
  color: #f3f4f6;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alerta-tiempo {
  color: #d1d5db;
  font-size: 0.875rem;
}

/* Acciones de reporte */
.acciones-reporte {
  margin-top: 1rem;
}

.btn-enviar-reporte {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-enviar-reporte:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.btn-enviar-reporte:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-enviar-reporte i {
  font-size: 1.125rem;
}

/* Acciones de alerta */
.alerta-actions {
  margin-top: 0.75rem;
}

.btn-alerta-email {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-alerta-email:hover:not(:disabled) {
  background: linear-gradient(135deg, #9a3412 0%, #f97316 100%);
  transform: translateY(-1px);
}

.btn-alerta-email:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-alerta-email i {
  font-size: 1rem;
}

.alertas-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #4b5563;
  text-align: center;
}

.btn-enviar-todas {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #9a3412 0%, #f97316 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);
}

.btn-enviar-todas:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%);
  box-shadow: 0 6px 8px -1px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.btn-enviar-todas:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-enviar-todas i {
  font-size: 1.125rem;
}
</style>