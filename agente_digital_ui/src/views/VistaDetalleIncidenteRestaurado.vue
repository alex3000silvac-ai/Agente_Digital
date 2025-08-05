<template>
  <div v-if="loading" class="flex items-center justify-center h-screen text-gray-400">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Cargando expediente del incidente...</p>
    </div>
  </div>
  
  <div v-else-if="error" class="error-banner m-8">
    <i class="ph ph-warning-circle mr-2"></i>
    <strong>Error:</strong> {{ error }}
  </div>
  
  <div v-else-if="incidente" class="layout-detalle">
    <!-- Header Fijo -->
    <header class="header-fijo">
      <!-- Navegación -->
      <div class="header-con-navegacion mb-4">
        <button @click="volver" class="btn-volver">
          <i class="ph ph-arrow-left"></i>
          <span>Volver a la Lista de Incidentes</span>
        </button>
      </div>

      <!-- Header Principal -->
      <div class="header-principal">
        <div class="flex-1">
          <input autocomplete="off" v-model="incidenteEditable.Titulo" 
            class="input-titulo" 
            placeholder="Título del Incidente"
            :class="{ 'input-error': validacionErrors.Titulo }"
          />
          <div class="flex items-center space-x-4 mt-2">
            <p class="text-gray-400">
              ID: <span class="font-mono">{{ incidente.IDVisible }}</span>
            </p>
            <p class="text-gray-400">
              Empresa: <span class="font-semibold text-gray-300">{{ incidente.EmpresaAfectada }}</span>
            </p>
            <div class="flex items-center space-x-2">
              <span 
                class="badge"
                :class="incidente.ReporteAnciID ? 'badge-anci' : 'badge-normal'"
              >
                {{ incidente.ReporteAnciID ? 'ANCI' : 'NORMAL' }}
              </span>
              <span 
                class="badge badge-estado"
                :class="getEstadoBadgeClass(incidenteEditable.EstadoActual)"
              >
                {{ incidenteEditable.EstadoActual }}
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones Principales -->
        <div class="flex items-center gap-3">
          <!-- Botón Transformar a ANCI -->
          <button 
            v-if="!incidente.ReporteAnciID" 
            @click="transformarAAnci"
            class="btn btn-warning"
            :disabled="transformando"
            title="Escalar incidente a reporte ANCI"
          >
            <i class="ph ph-shield-warning"></i>
            <span>{{ transformando ? 'Validando...' : 'Transformar a ANCI' }}</span>
          </button>

          <!-- Botón Guardar -->
          <button 
            @click="guardarCambios" 
            class="btn btn-primary" 
            :disabled="guardando"
          >
            <i class="ph ph-floppy-disk"></i>
            <span>{{ guardando ? 'Guardando...' : 'Guardar Expediente' }}</span>
          </button>

          <!-- Botón Ver Historial -->
          <button 
            @click="abrirHistorial" 
            class="btn btn-secondary"
            title="Ver historial de cambios"
          >
            <i class="ph ph-clock-clockwise"></i>
          </button>
        </div>
      </div>

      <!-- Tabs para ANCI -->
      <div v-if="incidente.ReporteAnciID" class="tabs-container">
        <button 
          @click="activeTab = 'expediente'" 
          :class="{'active': activeTab === 'expediente'}" 
          class="tab-btn"
        >
          <i class="ph ph-folder-simple"></i> 
          Expediente Semilla
        </button>
        <button 
          @click="activeTab = 'anci'" 
          :class="{'active': activeTab === 'anci'}" 
          class="tab-btn"
        >
          <i class="ph ph-shield-warning"></i> 
          Reporte ANCI
        </button>
        <button 
          @click="activeTab = 'seguimiento'" 
          :class="{'active': activeTab === 'seguimiento'}" 
          class="tab-btn"
        >
          <i class="ph ph-timer"></i> 
          Seguimiento ANCI
        </button>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="contenido-scrollable">
      <!-- TAB: Expediente Semilla -->
      <div v-show="!incidente.ReporteAnciID || activeTab === 'expediente'" class="expediente-container">
        <div class="form-card">
          <div class="space-y-8">
            
            <!-- 1. Identificación General -->
            <fieldset class="fieldset-section">
              <legend class="legend-style">1. Identificación General</legend>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="tipoFlujo" class="form-label">Tipo de Registro</label>
                  <select autocomplete="off" id="tipoFlujo" v-model="incidenteEditable.TipoFlujo" class="form-input" disabled>
                    <option value="Informativo">Informativo (Registro simple)</option>
                    <option value="Interno">Interno (Investigación detallada)</option>
                  </select>
                </div>
                <div>
                  <label for="fechaDeteccion" class="form-label required">Fecha y Hora de Detección *</label>
                  <input autocomplete="off" type="datetime-local" 
                    id="fechaDeteccion" 
                    v-model="incidenteEditable.FechaDeteccion" 
                    class="form-input"
                    :class="{ 'input-error': validacionErrors.FechaDeteccion }"
                  >
                </div>
                <div>
                  <label for="estado" class="form-label">Estado Actual</label>
                  <select autocomplete="off" id="estado" v-model="incidenteEditable.EstadoActual" class="form-input">
                    <option>Activo</option>
                    <option>En Investigación</option>
                    <option>Contenido</option>
                    <option>Erradicado</option>
                    <option>Recuperado</option>
                    <option>Cerrado</option>
                  </select>
                </div>
                <div>
                  <label for="criticidad" class="form-label">Criticidad *</label>
                  <select autocomplete="off" id="criticidad" v-model="incidenteEditable.Criticidad" class="form-input">
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                    <option>Crítica</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <!-- 2. Descripción y Alcance -->
            <fieldset class="fieldset-section">
              <legend class="legend-style">2. Descripción y Alcance</legend>
              <div class="space-y-6">
                <div>
                  <label for="descripcion" class="form-label required">Descripción Inicial Detallada *</label>
                  <textarea autocomplete="off" id="descripcion" 
                    v-model="incidenteEditable.DescripcionInicial" 
                    class="form-input" 
                    rows="4"
                    :class="{ 'input-error': validacionErrors.DescripcionInicial }"
                  ></textarea>
                </div>
                <div>
                  <label class="form-label">Impacto Preliminar Observado</label>
                  <textarea autocomplete="off" v-model="incidenteEditable.AnciImpactoPreliminar" class="form-input" rows="3"></textarea>
                </div>
                <div>
                  <label class="form-label">Sistemas, Activos o Personal Afectado *</label>
                  <textarea autocomplete="off" v-model="incidenteEditable.SistemasAfectados" 
                    class="form-input" 
                    rows="3"
                    :class="{ 'input-error': validacionErrors.SistemasAfectados }"
                  ></textarea>
                </div>
                <div>
                  <label class="form-label">Evidencia de Alcance</label>
                  <EvidenciaUploader 
                    seccion="descripcion_alcance" 
                    :incidente-id="incidente.IncidenteID"
                    @files-changed="onEvidenciasChanged" 
                  />
                </div>
              </div>
            </fieldset>

            <!-- 3. Análisis Preliminar -->
            <fieldset class="fieldset-section">
              <legend class="legend-style">3. Análisis Preliminar</legend>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="tipoAmenaza" class="form-label">Tipo de Amenaza Probable</label>
                  <input autocomplete="off" type="text" 
                    id="tipoAmenaza" 
                    v-model="incidenteEditable.AnciTipoAmenaza" 
                    class="form-input" 
                    placeholder="Ej: Ransomware, Phishing, Fuga de datos..."
                  >
                </div>
                <div>
                  <label for="origenIncidente" class="form-label">Origen / Vector de Ataque Probable *</label>
                  <input autocomplete="off" type="text" 
                    id="origenIncidente" 
                    v-model="incidenteEditable.OrigenIncidente" 
                    class="form-input" 
                    placeholder="Ej: Correo electrónico, vulnerabilidad externa..."
                    :class="{ 'input-error': validacionErrors.OrigenIncidente }"
                  >
                </div>
              </div>
              <div class="mt-6">
                <label class="form-label">Evidencia de Análisis</label>
                <EvidenciaUploader 
                  seccion="analisis_preliminar" 
                  :incidente-id="incidente.IncidenteID"
                  @files-changed="onEvidenciasChanged" 
                />
              </div>
            </fieldset>

            <!-- 4. Clasificación de Taxonomía -->
            <fieldset class="fieldset-section">
              <legend class="legend-style">4. Clasificación de Taxonomía *</legend>
              <p class="form-sublabel mb-4">Clasificar el incidente es fundamental para el posterior análisis de la "Regla de Oro".</p>
              <AcordeonTaxonomia 
                :tipo-empresa="incidente.TipoEmpresa" 
                :categorias-iniciales="incidenteEditable.CategoriasSeleccionadas || []"
                :incidente-id="incidente.IncidenteID"
                @categorias-changed="onCategoriasChanged"
                @evidencia-subida="onEvidenciaSubida"
                @comentario-agregado="onComentarioAgregado"
              />
            </fieldset>

            <!-- 5. Acciones Inmediatas -->
            <fieldset 
              v-if="incidente.TipoEmpresa === 'OIV' || incidente.TipoEmpresa === 'PSE'" 
              class="fieldset-section border-yellow-400"
            >
              <legend class="legend-style text-yellow-300">5. Acciones Inmediatas (Requerido para OIV/PSE)</legend>
              <div>
                <label for="accionesInmediatas" class="form-label">Medidas de Contención Iniciales *</label>
                <textarea autocomplete="off" id="accionesInmediatas" 
                  v-model="incidenteEditable.AccionesInmediatas" 
                  class="form-input" 
                  rows="4"
                  :class="{ 'input-error': validacionErrors.AccionesInmediatas }"
                ></textarea>
              </div>
              <div class="mt-6">
                <label class="form-label">Evidencia de Acciones</label>
                <EvidenciaUploader 
                  seccion="acciones_inmediatas" 
                  :incidente-id="incidente.IncidenteID"
                  @files-changed="onEvidenciasChanged" 
                />
              </div>
            </fieldset>

          </div>
        </div>
      </div>

      <!-- TAB: Reporte ANCI -->
      <div v-show="incidente.ReporteAnciID && activeTab === 'anci'" class="anci-container">
        <div class="form-card">
          <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-white mb-2">Formulario de Reporte ANCI</h2>
            <p class="text-gray-400">Información oficial para envío a la Agencia Nacional de Ciberseguridad</p>
          </div>
          
          <!-- TODO: Implementar formulario ANCI completo -->
          <div class="p-8 bg-blue-900/20 border border-blue-500 rounded-lg text-center">
            <i class="ph ph-construction text-4xl text-blue-400 mb-4"></i>
            <h3 class="text-lg font-semibold text-blue-300 mb-2">Formulario ANCI en Desarrollo</h3>
            <p class="text-gray-300">Esta sección contendrá el formulario completo con todos los campos oficiales ANCI.</p>
          </div>
        </div>
      </div>

      <!-- TAB: Seguimiento ANCI -->
      <div v-show="incidente.ReporteAnciID && activeTab === 'seguimiento'" class="seguimiento-container">
        <div class="form-card">
          <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-white mb-2">Seguimiento de Plazos ANCI</h2>
            <p class="text-gray-400">Gestión de etapas y plazos legales según tipo de empresa</p>
          </div>
          
          <!-- TODO: Implementar seguimiento con timeline -->
          <div class="p-8 bg-yellow-900/20 border border-yellow-500 rounded-lg text-center">
            <i class="ph ph-timer text-4xl text-yellow-400 mb-4"></i>
            <h3 class="text-lg font-semibold text-yellow-300 mb-2">Timeline de Seguimiento en Desarrollo</h3>
            <p class="text-gray-300">Esta sección contendrá el timeline con cuenta regresiva y gestión de etapas.</p>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal de Historial -->
  <ModalHistorial 
    v-if="showHistorial" 
    :incidente-id="incidente.IncidenteID"
    @close="showHistorial = false" 
  />

  <!-- Modal de Validación ANCI -->
  <ModalValidacionAnci
    v-if="showValidacionAnci"
    :campos-faltantes="camposFaltantes"
    @close="showValidacionAnci = false"
    @confirmar="confirmarTransformacionAnci"
  />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import EvidenciaUploader from '../components/EvidenciaUploader.vue'
import AcordeonTaxonomia from '../components/AcordeonTaxonomia.vue'
import ModalHistorial from '../components/ModalHistorial.vue'
import ModalValidacionAnci from '../components/ModalValidacionAnci.vue'

const router = useRouter()
const route = useRoute()

// Estados reactivos
const loading = ref(true)
const error = ref(null)
const guardando = ref(false)
const transformando = ref(false)
const showHistorial = ref(false)
const showValidacionAnci = ref(false)
const camposFaltantes = ref([])
const activeTab = ref('expediente')

const incidente = ref(null)
const incidenteEditable = reactive({})
const validacionErrors = reactive({})

// Computed
const esAnci = computed(() => !!incidente.value?.ReporteAnciID)

// Métodos principales
const cargarIncidente = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`/api/admin/incidente-detalle/${route.params.id}`)
    if (!response.ok) throw new Error('Error al cargar el incidente')
    
    const data = await response.json()
    incidente.value = data
    
    // Copiar datos a objeto editable
    Object.assign(incidenteEditable, {
      Titulo: data.Titulo || '',
      EstadoActual: data.EstadoActual || 'Activo',
      Criticidad: data.Criticidad || 'Media',
      ResponsableCliente: data.ResponsableCliente || '',
      TipoFlujo: data.TipoFlujo || '',
      SistemasAfectados: data.SistemasAfectados || '',
      OrigenIncidente: data.OrigenIncidente || '',
      AccionesInmediatas: data.AccionesInmediatas || '',
      DescripcionInicial: data.DescripcionInicial || '',
      AnciImpactoPreliminar: data.AnciImpactoPreliminar || '',
      AnciTipoAmenaza: data.AnciTipoAmenaza || '',
      FechaDeteccion: formatDateForInput(data.FechaDeteccion),
      CategoriasSeleccionadas: data.CategoriasSeleccionadas || []
    })
    
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const guardarCambios = async () => {
  try {
    guardando.value = true
    limpiarValidacionErrors()
    
    const response = await fetch(`/api/admin/incidentes/${incidente.value.IncidenteID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...incidenteEditable,
        UsuarioCambio: 'admin' // TODO: Obtener usuario real
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al guardar')
    }
    
    const result = await response.json()
    
    // Mostrar mensaje de éxito
    mostrarNotificacion('Expediente guardado correctamente', 'success')
    
    // Recargar datos
    await cargarIncidente()
    
  } catch (err) {
    error.value = err.message
    mostrarNotificacion(err.message, 'error')
  } finally {
    guardando.value = false
  }
}

const transformarAAnci = async () => {
  try {
    transformando.value = true
    
    // Validar campos requeridos
    const response = await fetch(`/api/admin/incidentes/${incidente.value.IncidenteID}/validar-para-anci`)
    if (!response.ok) throw new Error('Error en validación')
    
    const validacion = await response.json()
    
    if (!validacion.es_valido) {
      camposFaltantes.value = validacion.campos_faltantes
      showValidacionAnci.value = true
      return
    }
    
    // Si es válido, proceder con la transformación
    await confirmarTransformacionAnci()
    
  } catch (err) {
    error.value = err.message
    mostrarNotificacion(err.message, 'error')
  } finally {
    transformando.value = false
  }
}

const confirmarTransformacionAnci = async () => {
  try {
    const response = await fetch(`/api/admin/incidentes/${incidente.value.IncidenteID}/generar-reporte-anci`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) throw new Error('Error al generar reporte ANCI')
    
    showValidacionAnci.value = false
    mostrarNotificacion('Reporte ANCI generado correctamente', 'success')
    
    // Recargar incidente para mostrar tabs
    await cargarIncidente()
    activeTab.value = 'anci'
    
  } catch (err) {
    error.value = err.message
    mostrarNotificacion(err.message, 'error')
  }
}

// Métodos de utilidad
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const getEstadoBadgeClass = (estado) => {
  const classMap = {
    'Activo': 'badge-activo',
    'En Investigación': 'badge-investigacion',
    'Contenido': 'badge-contenido',
    'Erradicado': 'badge-erradicado',
    'Recuperado': 'badge-recuperado',
    'Cerrado': 'badge-cerrado'
  }
  return classMap[estado] || 'badge-default'
}

const limpiarValidacionErrors = () => {
  Object.keys(validacionErrors).forEach(key => {
    delete validacionErrors[key]
  })
}

const mostrarNotificacion = (mensaje, tipo) => {
  // TODO: Implementar sistema de notificaciones
  if (tipo === 'error') {
    alert(`Error: ${mensaje}`)
  } else {
    alert(`Éxito: ${mensaje}`)
  }
}

// Event handlers
const volver = () => {
  router.go(-1)
}

const abrirHistorial = () => {
  showHistorial.value = true
}

const onCategoriasChanged = (categorias) => {
  incidenteEditable.CategoriasSeleccionadas = categorias
}

const onEvidenciasChanged = ({ seccion, files }) => {
  // TODO: Implementar manejo de evidencias
  console.log('Evidencias cambiadas:', seccion, files)
}

const onEvidenciaSubida = ({ categoriaId }) => {
  // TODO: Implementar lógica de evidencia por categoría
  console.log('Evidencia subida para categoría:', categoriaId)
}

const onComentarioAgregado = ({ categoriaId, texto }) => {
  // TODO: Implementar lógica de comentarios por categoría
  console.log('Comentario agregado:', categoriaId, texto)
}

// Inicialización
onMounted(() => {
  cargarIncidente()
})
</script>

<style scoped>
.layout-detalle {
  @apply h-screen flex flex-col bg-gray-900;
}

.header-fijo {
  @apply flex-shrink-0 bg-gray-800 border-b border-gray-700 p-6;
}

.header-con-navegacion {
  @apply flex items-center;
}

.btn-volver {
  @apply flex items-center space-x-2 text-gray-400 hover:text-white transition-colors;
}

.header-principal {
  @apply flex items-start justify-between gap-6;
}

.input-titulo {
  @apply text-2xl font-bold bg-transparent border-none text-white placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-2;
}

.input-error {
  @apply border-red-500 ring-1 ring-red-500;
}

.badge {
  @apply text-xs px-2 py-1 rounded-full font-medium;
}

.badge-anci {
  @apply bg-yellow-600 text-yellow-100;
}

.badge-normal {
  @apply bg-gray-600 text-gray-100;
}

.badge-estado {
  @apply text-white;
}

.badge-activo { @apply bg-green-600; }
.badge-investigacion { @apply bg-blue-600; }
.badge-contenido { @apply bg-orange-600; }
.badge-erradicado { @apply bg-purple-600; }
.badge-recuperado { @apply bg-teal-600; }
.badge-cerrado { @apply bg-gray-600; }
.badge-default { @apply bg-gray-600; }

.tabs-container {
  @apply flex space-x-1 mt-4;
}

.tab-btn {
  @apply flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white;
}

.tab-btn.active {
  @apply bg-gray-600 text-white;
}

.contenido-scrollable {
  @apply flex-1 overflow-y-auto p-6;
}

.expediente-container,
.anci-container,
.seguimiento-container {
  @apply max-w-7xl mx-auto;
}

.form-card {
  @apply bg-gray-800/50 rounded-lg p-8 border border-gray-700;
}

.fieldset-section {
  @apply border border-gray-600 rounded-lg p-6 space-y-4;
}

.legend-style {
  @apply text-lg font-semibold text-white px-4 bg-gray-800;
}

.form-label {
  @apply block text-sm font-medium text-gray-300 mb-2;
}

.form-label.required::after {
  @apply text-red-400 ml-1;
  content: '*';
}

.form-input {
  @apply w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-sublabel {
  @apply text-sm text-gray-400;
}

.btn {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-warning {
  @apply bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.error-banner {
  @apply bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-300;
}
</style>