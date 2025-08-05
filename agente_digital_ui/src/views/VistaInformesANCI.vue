<template>
  <div class="vista-container">
    <!-- Header -->
    <header class="vista-header">
      <button @click="volverAIncidentes" class="btn-volver mb-4">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Lista de Incidentes</span>
      </button>
      <div class="flex justify-between items-center">
        <div>
          <h1 class="vista-title">Informes ANCI</h1>
          <p v-if="incidenteInfo" class="vista-subtitle">
            Incidente #{{ incidenteInfo.IncidenteID }}: {{ incidenteInfo.Titulo }}
          </p>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando información del incidente...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-banner">
      <i class="ph ph-warning-circle"></i>
      <span>{{ error }}</span>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Información del Incidente -->
      <div class="incidente-info-card">
        <div class="card-header">
          <i class="ph ph-info-circle"></i>
          <h3>Información del Incidente</h3>
        </div>
        <div class="card-content" v-if="incidenteInfo">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ incidenteInfo.IncidenteID }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Título:</span>
              <span class="info-value">{{ incidenteInfo.Titulo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="info-value badge-estado" :class="getEstadoClass(incidenteInfo.EstadoActual)">
                {{ incidenteInfo.EstadoActual }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Criticidad:</span>
              <span class="info-value badge-criticidad" :class="getCriticidadClass(incidenteInfo.Criticidad)">
                {{ incidenteInfo.Criticidad }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha Detección:</span>
              <span class="info-value">{{ formatearFecha(incidenteInfo.FechaDeteccion) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Empresa:</span>
              <span class="info-value">{{ empresaInfo?.RazonSocial || 'Cargando...' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Generación de Informes -->
      <div class="generacion-informes-section">
        <div class="section-header">
          <i class="ph ph-file-plus"></i>
          <h3>Generar Nuevo Informe ANCI</h3>
        </div>
        
        <div class="tipos-informe">
          <div class="tipo-informe-card" 
               v-for="tipo in tiposInforme" 
               :key="tipo.id"
               @click="generarInforme(tipo)"
               :class="{ 'generando': generandoTipo === tipo.id }"
               :disabled="generandoTipo !== null">
            <div class="tipo-icon">
              <i :class="tipo.icon"></i>
            </div>
            <div class="tipo-content">
              <h4 class="tipo-titulo">{{ tipo.nombre }}</h4>
              <p class="tipo-descripcion">{{ tipo.descripcion }}</p>
              <div class="tipo-features">
                <span v-for="feature in tipo.features" :key="feature" class="feature-tag">
                  {{ feature }}
                </span>
              </div>
            </div>
            <div class="tipo-action">
              <button class="btn-generar" :disabled="generandoTipo !== null">
                <i v-if="generandoTipo === tipo.id" class="ph ph-circle-notch animate-spin"></i>
                <i v-else class="ph ph-play"></i>
                <span>{{ generandoTipo === tipo.id ? 'Generando...' : 'Generar' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de Informes Generados -->
      <div class="historial-informes-section">
        <div class="section-header">
          <i class="ph ph-clock-clockwise"></i>
          <h3>Historial de Informes Generados</h3>
          <button @click="cargarHistorial" class="btn-refresh" :disabled="cargandoHistorial">
            <i class="ph ph-refresh" :class="{ 'animate-spin': cargandoHistorial }"></i>
          </button>
        </div>

        <div v-if="cargandoHistorial" class="loading-historial">
          <div class="loading-spinner-small"></div>
          <span>Cargando historial...</span>
        </div>

        <div v-else-if="historialInformes.length === 0" class="empty-state">
          <i class="ph ph-file-x"></i>
          <h4>No hay informes generados</h4>
          <p>Genera tu primer informe ANCI usando las opciones de arriba</p>
        </div>

        <div v-else class="historial-lista">
          <div v-for="informe in historialInformes" 
               :key="informe.id" 
               class="informe-item">
            <div class="informe-icon">
              <i class="ph ph-file-doc"></i>
            </div>
            <div class="informe-info">
              <h4 class="informe-nombre">{{ informe.nombre_archivo }}</h4>
              <div class="informe-meta">
                <span class="informe-tipo">{{ informe.tipo_informe }}</span>
                <span class="informe-fecha">{{ formatearFecha(informe.fecha_generacion) }}</span>
                <span class="informe-tamaño">{{ formatearTamaño(informe.tamaño_archivo) }}</span>
              </div>
            </div>
            <div class="informe-actions">
              <button @click="descargarInforme(informe)" 
                      class="btn-accion btn-descargar"
                      title="Descargar informe">
                <i class="ph ph-download"></i>
              </button>
              <button @click="previsualizarInforme(informe)" 
                      class="btn-accion btn-preview"
                      title="Previsualizar">
                <i class="ph ph-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Progreso -->
    <div v-if="mostrarModalProgreso" class="modal-overlay">
      <div class="modal-progreso">
        <div class="progreso-header">
          <i class="ph ph-gear animate-spin"></i>
          <h3>Generando Informe ANCI</h3>
        </div>
        <div class="progreso-content">
          <div class="progreso-step" v-for="(paso, index) in pasosProgreso" 
               :key="index"
               :class="{ 
                 'activo': pasoActual === index,
                 'completado': pasoActual > index 
               }">
            <div class="paso-icon">
              <i v-if="pasoActual > index" class="ph ph-check"></i>
              <i v-else-if="pasoActual === index" class="ph ph-circle-notch animate-spin"></i>
              <span v-else class="paso-numero">{{ index + 1 }}</span>
            </div>
            <span class="paso-texto">{{ paso }}</span>
          </div>
        </div>
        <div class="progreso-footer">
          <p class="progreso-mensaje">{{ mensajeProgreso }}</p>
        </div>
      </div>
    </div>

    <!-- Modal de Éxito -->
    <div v-if="mostrarModalExito" class="modal-overlay" @click="cerrarModalExito">
      <div class="modal-exito" @click.stop>
        <div class="exito-header">
          <i class="ph ph-check-circle"></i>
          <h3>¡Informe Generado Exitosamente!</h3>
        </div>
        <div class="exito-content">
          <p>El informe ANCI ha sido generado correctamente.</p>
          <div class="archivo-generado">
            <i class="ph ph-file-doc"></i>
            <span>{{ archivoGenerado?.nombre }}</span>
          </div>
        </div>
        <div class="exito-actions">
          <button @click="cerrarModalExito" class="btn btn-secondary">
            Cerrar
          </button>
          <button @click="descargarUltimoInforme" class="btn btn-primary">
            <i class="ph ph-download"></i>
            Descargar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Vista Previa del Informe -->
    <div v-if="mostrarModalVistaPrevia" class="modal-overlay" @click="cerrarModalVistaPrevia">
      <div class="modal-vista-previa" @click.stop>
        <div class="vista-previa-header">
          <div class="header-left">
            <i class="ph ph-file-text"></i>
            <h3>Vista Previa del Informe ANCI</h3>
          </div>
          <button @click="cerrarModalVistaPrevia" class="btn-cerrar">
            <i class="ph ph-x"></i>
          </button>
        </div>
        <div class="vista-previa-content">
          <pre class="informe-contenido">{{ contenidoInforme }}</pre>
        </div>
        <div class="vista-previa-actions">
          <button @click="copiarAlPortapapeles" class="btn btn-secondary">
            <i class="ph ph-copy"></i>
            Copiar al Portapapeles
          </button>
          <button @click="descargarInformeActual" class="btn btn-primary">
            <i class="ph ph-download"></i>
            Descargar como Archivo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '../services/api'

const router = useRouter()
const route = useRoute()

// Props reactivos
const incidenteId = computed(() => route.params.incidenteId)

// Estados reactivos
const loading = ref(true)
const error = ref(null)
const incidenteInfo = ref(null)
const empresaInfo = ref(null)
const historialInformes = ref([])
const cargandoHistorial = ref(false)
const generandoTipo = ref(null)
const mostrarModalProgreso = ref(false)
const mostrarModalExito = ref(false)
const mostrarModalVistaPrevia = ref(false)
const pasoActual = ref(0)
const mensajeProgreso = ref('')
const archivoGenerado = ref(null)
const contenidoInforme = ref('')
const informeActual = ref(null)

// Configuración de tipos de informe
const tiposInforme = ref([
  {
    id: 'preliminar',
    nombre: 'Informe Preliminar',
    descripcion: 'Reporte inicial para notificación temprana a ANCI',
    icon: 'ph ph-lightning',
    features: ['Notificación 24hrs', 'Datos básicos', 'Impacto inicial'],
    color: 'orange'
  },
  {
    id: 'completo',
    nombre: 'Informe Completo',
    descripcion: 'Reporte detallado con análisis completo del incidente',
    icon: 'ph ph-file-text',
    features: ['Análisis completo', 'Evidencias', 'Causa raíz'],
    color: 'blue'
  },
  {
    id: 'final',
    nombre: 'Informe Final',
    descripcion: 'Reporte de cierre con lecciones aprendidas y medidas',
    icon: 'ph ph-check-square',
    features: ['Cierre oficial', 'Lecciones', 'Plan mejora'],
    color: 'green'
  }
])

// Pasos del progreso
const pasosProgreso = ref([
  'Validando datos del incidente',
  'Recopilando información complementaria',
  'Aplicando plantilla ANCI',
  'Generando documento Word',
  'Finalizando y guardando'
])

// Funciones principales
async function cargarDatosIniciales() {
  loading.value = true
  error.value = null
  
  try {
    console.log('📊 Cargando datos del incidente:', incidenteId.value)
    
    // Cargar información del incidente
    const resIncidente = await apiClient.get(`/admin/incidentes/${incidenteId.value}`)
    incidenteInfo.value = resIncidente.data
    
    // Cargar información de la empresa
    const resEmpresa = await apiClient.get(`/admin/empresas/${incidenteInfo.value.EmpresaID}`)
    empresaInfo.value = resEmpresa.data
    
    // Cargar historial de informes
    await cargarHistorial()
    
    console.log('✅ Datos cargados exitosamente')
  } catch (err) {
    console.error('❌ Error cargando datos:', err)
    error.value = 'Error al cargar los datos del incidente: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

async function cargarHistorial() {
  cargandoHistorial.value = true
  try {
    console.log('📂 Cargando historial de informes ANCI')
    const response = await apiClient.get(`/informes-anci/historial/${incidenteId.value}`)
    historialInformes.value = response.data.informes || []
    console.log(`✅ Historial cargado: ${historialInformes.value.length} informes`)
  } catch (err) {
    console.error('❌ Error cargando historial:', err)
    // No mostrar error al usuario, solo log
  } finally {
    cargandoHistorial.value = false
  }
}

async function generarInforme(tipo) {
  if (generandoTipo.value) return
  
  console.log('🔄 Iniciando generación de informe:', tipo.nombre)
  
  generandoTipo.value = tipo.id
  mostrarModalProgreso.value = true
  pasoActual.value = 0
  mensajeProgreso.value = `Iniciando generación de ${tipo.nombre}...`
  
  try {
    // Simular progreso paso a paso
    for (let i = 0; i < pasosProgreso.value.length; i++) {
      pasoActual.value = i
      mensajeProgreso.value = pasosProgreso.value[i]
      await new Promise(resolve => setTimeout(resolve, 800)) // Simular trabajo
    }
    
    // Hacer la llamada real al backend
    const response = await apiClient.post(`/informes-anci/generar/${incidenteId.value}`, {
      tipo_informe: tipo.id,
      nombre_plantilla: `plantilla_${tipo.id}.docx`,
      incluir_anexos: true
    })
    
    console.log('✅ Informe generado exitosamente:', response.data)
    
    // Guardar datos del informe
    archivoGenerado.value = {
      nombre: response.data.archivo_generado || `Informe_ANCI_${tipo.id}_${new Date().toISOString()}.txt`,
      url: response.data.url_descarga
    }
    
    contenidoInforme.value = response.data.contenido || 'Sin contenido disponible'
    informeActual.value = response.data
    
    // Cerrar modal de progreso y mostrar vista previa
    mostrarModalProgreso.value = false
    mostrarModalVistaPrevia.value = true
    
    // Recargar historial
    await cargarHistorial()
    
  } catch (err) {
    console.error('❌ Error generando informe:', err)
    mostrarModalProgreso.value = false
    
    const errorMsg = err.response?.data?.error || err.message
    alert(`Error al generar el informe: ${errorMsg}`)
  } finally {
    generandoTipo.value = null
  }
}

async function descargarInforme(informe) {
  try {
    console.log('📥 Descargando informe:', informe.nombre_archivo)
    
    const response = await apiClient.get(
      `/informes-anci/descargar/${incidenteId.value}/${informe.nombre_archivo}`,
      { responseType: 'blob' }
    )
    
    // Crear y trigger descarga
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = informe.nombre_archivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('✅ Descarga iniciada')
  } catch (err) {
    console.error('❌ Error descargando informe:', err)
    alert('Error al descargar el archivo: ' + (err.response?.data?.error || err.message))
  }
}

function previsualizarInforme(informe) {
  // Por ahora, simplemente descargar. En el futuro se puede implementar preview
  descargarInforme(informe)
}

function descargarUltimoInforme() {
  if (archivoGenerado.value?.url) {
    window.open(archivoGenerado.value.url, '_blank')
  }
  cerrarModalExito()
}

function cerrarModalExito() {
  mostrarModalExito.value = false
  archivoGenerado.value = null
}

function cerrarModalVistaPrevia() {
  mostrarModalVistaPrevia.value = false
}

function copiarAlPortapapeles() {
  if (contenidoInforme.value) {
    navigator.clipboard.writeText(contenidoInforme.value)
      .then(() => {
        alert('✅ Contenido copiado al portapapeles')
      })
      .catch(err => {
        console.error('Error al copiar:', err)
        alert('❌ Error al copiar al portapapeles')
      })
  }
}

function descargarInformeActual() {
  if (!informeActual.value) return
  
  const blob = new Blob([contenidoInforme.value], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  const fecha = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `Informe_ANCI_${informeActual.value.informe_id}_${fecha}.txt`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function volverAIncidentes() {
  // Navegar de regreso a la lista de incidentes
  // Usaremos el empresaId del incidente para construir la ruta correcta
  if (incidenteInfo.value?.EmpresaID) {
    router.push({ 
      name: 'VistaListaIncidentes',
      params: { 
        empresaId: incidenteInfo.value.EmpresaID,
        inquilinoId: empresaInfo.value?.InquilinoID || 1 // Fallback
      }
    })
  } else {
    router.push({ name: 'AdminDashboard' })
  }
}

// Funciones de utilidad
function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  const opciones = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }
  return new Date(fecha).toLocaleDateString('es-CL', opciones)
}

function formatearTamaño(bytes) {
  if (!bytes) return 'N/A'
  const kb = bytes / 1024
  const mb = kb / 1024
  
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`
  } else {
    return `${kb.toFixed(0)} KB`
  }
}

function getEstadoClass(estado) {
  const s = estado?.toLowerCase() || ''
  if (s.includes('activo') || s.includes('investigación')) return 'estado-activo'
  if (s.includes('contenido') || s.includes('erradicado')) return 'estado-contenido'
  if (s.includes('cerrado')) return 'estado-cerrado'
  return 'estado-indefinido'
}

function getCriticidadClass(criticidad) {
  const c = criticidad?.toLowerCase() || ''
  if (c === 'crítica') return 'criticidad-critica'
  if (c === 'alta') return 'criticidad-alta'
  if (c === 'media') return 'criticidad-media'
  return 'criticidad-baja'
}

// Lifecycle
onMounted(() => {
  cargarDatosIniciales()
})
</script>

<style scoped>
.vista-container {
  padding: 1.5rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.vista-header {
  margin-bottom: 2rem;
}

.vista-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.vista-subtitle {
  font-size: 1rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #9ca3af;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.btn-volver:hover {
  color: #3b82f6;
}

/* Loading & Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #9ca3af;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #374151;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.1rem;
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ef4444;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Cards */
.incidente-info-card,
.generacion-informes-section,
.historial-informes-section {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header,
.section-header {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
  padding: 1.5rem;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header h3,
.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.card-header i,
.section-header i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.card-content {
  padding: 1.5rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(71, 85, 105, 0.2);
  border-radius: 0.5rem;
}

.info-label {
  font-weight: 600;
  color: #9ca3af;
}

.info-value {
  color: #ffffff;
  font-weight: 500;
}

/* Badges */
.badge-estado,
.badge-criticidad {
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.estado-activo { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
.estado-contenido { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.estado-cerrado { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.estado-indefinido { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }

.criticidad-critica { background: rgba(239, 68, 68, 0.3); color: #fca5a5; }
.criticidad-alta { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
.criticidad-media { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
.criticidad-baja { background: rgba(14, 165, 233, 0.2); color: #38bdf8; }

/* Tipos de Informe */
.tipos-informe {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.tipo-informe-card {
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.3), rgba(51, 65, 85, 0.3));
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tipo-informe-card:hover:not(.generando) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: #3b82f6;
}

.tipo-informe-card.generando {
  opacity: 0.7;
  cursor: not-allowed;
}

.tipo-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.tipo-titulo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.tipo-descripcion {
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

.tipo-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-tag {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-generar {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.btn-generar:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.btn-generar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Historial */
.btn-refresh {
  background: rgba(71, 85, 105, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #9ca3af;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.btn-refresh:hover {
  background: rgba(71, 85, 105, 0.5);
  color: #ffffff;
}

.loading-historial {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #9ca3af;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #374151;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.historial-lista {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.informe-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(71, 85, 105, 0.2);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.informe-item:hover {
  background: rgba(71, 85, 105, 0.3);
}

.informe-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.informe-info {
  flex: 1;
}

.informe-nombre {
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.informe-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.informe-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  width: 36px;
  height: 36px;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-descargar {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.btn-descargar:hover {
  background: rgba(34, 197, 94, 0.3);
}

.btn-preview {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.btn-preview:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Modales */
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

.modal-progreso,
.modal-exito {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.progreso-header,
.exito-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
}

.progreso-header h3,
.exito-header h3 {
  color: #ffffff;
  margin: 0.5rem 0 0 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.progreso-header i,
.exito-header i {
  font-size: 3rem;
  color: #3b82f6;
}

.exito-header i {
  color: #22c55e;
}

.progreso-content {
  padding: 1.5rem 2rem;
}

.progreso-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  transition: all 0.3s ease;
}

.progreso-step.activo {
  color: #3b82f6;
}

.progreso-step.completado {
  color: #22c55e;
}

.paso-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(71, 85, 105, 0.3);
  border: 2px solid rgba(71, 85, 105, 0.5);
  color: #9ca3af;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progreso-step.activo .paso-icon {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #3b82f6;
}

.progreso-step.completado .paso-icon {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  color: #22c55e;
}

.paso-numero {
  font-size: 0.875rem;
  font-weight: 600;
}

.paso-texto {
  color: #d1d5db;
  font-weight: 500;
}

.progreso-footer {
  padding: 0 2rem 2rem;
  text-align: center;
}

.progreso-mensaje {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

.exito-content {
  padding: 1.5rem 2rem;
  text-align: center;
}

.exito-content p {
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.archivo-generado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(71, 85, 105, 0.2);
  border-radius: 0.5rem;
  color: #ffffff;
  font-weight: 500;
}

.archivo-generado i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.exito-actions {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

/* Modal de Vista Previa */
.modal-vista-previa {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.98), rgba(51, 65, 85, 0.98));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 1000px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.vista-previa-header {
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vista-previa-header i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.vista-previa-header h3 {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.btn-cerrar {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;
}

.btn-cerrar:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.vista-previa-content {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.5);
}

.informe-contenido {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  padding: 2rem;
  color: #d1d5db;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  min-height: 400px;
}

.vista-previa-actions {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  background: rgba(30, 41, 59, 0.5);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.3);
  color: #d1d5db;
}

.btn-secondary:hover {
  background: rgba(107, 114, 128, 0.5);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

/* Flex utilities */
.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .vista-container {
    padding: 1rem;
  }
  
  .tipos-informe {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .informe-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>