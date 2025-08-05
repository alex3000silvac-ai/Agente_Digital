<template>
  <div class="declarar-incidente-v3-container">
    <!-- HEADER DE NAVEGACIÓN -->
    <div class="header-navegacion" v-if="mostrarBotonVolver">
      <button @click="volver" class="btn-volver">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Volver al Listado</span>
      </button>
    </div>

    <!-- LOADING INICIAL -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fa-solid fa-spinner fa-spin text-4xl text-indigo-500"></i>
        <p class="text-gray-400 mt-4">{{ mensajeCarga }}</p>
      </div>
    </div>

    <!-- ERROR DE CARGA -->
    <div v-if="errorCarga && !loading" class="error-container">
      <div class="error-content">
        <i class="fa-solid fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <h3 class="text-xl font-semibold text-white mb-2">Error al cargar</h3>
        <p class="text-gray-400 mb-4">{{ errorCarga }}</p>
        <button @click="reintentar" class="btn-reintentar">
          <i class="fa-solid fa-redo"></i>
          Reintentar
        </button>
      </div>
    </div>

    <!-- FORMULARIO DINÁMICO ANCI V3 -->
    <div v-if="!loading && !errorCarga" class="formulario-dinamico-container">
      <FormularioDinamicoAnciV3
        :empresa-id="empresaId"
        :empresa-info="empresaInfo"
        :incidente-id="incidenteId"
        :formulario-id="formularioId"
        :modo="modo"
        @incidente-guardado="onFormularioCreado"
        @formulario-completado="onFormularioCompletado"
        @error="onError"
      />
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="mostrarConfirmacion" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa-solid fa-check-circle text-green-500"></i>
            Formulario Completado
          </h3>
        </div>
        <div class="modal-body">
          <p>El formulario ANCI ha sido completado y enviado exitosamente.</p>
          <p class="text-sm text-gray-400 mt-2">
            Formulario ID: {{ formularioId }}<br>
            Incidente ID: {{ incidenteId }}
          </p>
        </div>
        <div class="modal-footer">
          <button @click="irAListado" class="btn-primary">
            <i class="fa-solid fa-list"></i>
            Ver Listado
          </button>
          <button @click="crearNuevo" class="btn-secondary">
            <i class="fa-solid fa-plus"></i>
            Crear Nuevo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FormularioDinamicoAnciV3 from '@/components/AcordeonIncidenteMejorado.vue'

// Props
const props = defineProps({
  empresaId: { 
    type: [String, Number], 
    required: true 
  }
})

// Composables
const router = useRouter()
const route = useRoute()

// Estado local
const loading = ref(true)
const errorCarga = ref(null)
const mensajeCarga = ref('Inicializando formulario dinámico...')
const mostrarBotonVolver = ref(true)
const mostrarConfirmacion = ref(false)
const formularioId = ref(null)
const empresaInfo = ref({
  nombre: '',
  tipo: '',
  inquilino: ''
})

// Detectar modo y ID desde la ruta
const incidenteId = computed(() => {
  const id = route.params.incidenteId || route.query.incidenteId || null
  return id ? parseInt(id) : null
})

const modo = computed(() => {
  if (incidenteId.value) {
    return 'editar'
  }
  return route.query.modo || 'crear'
})

// Watchers
watch(() => props.empresaId, (newVal) => {
  if (newVal) {
    inicializar()
  }
}, { immediate: true })

// Métodos
async function inicializar() {
  try {
    loading.value = true
    errorCarga.value = null
    mensajeCarga.value = 'Verificando empresa...'
    
    // Verificar que la empresa existe y está activa
    await verificarEmpresa()
    
    mensajeCarga.value = 'Cargando formulario dinámico...'
    
    // Si hay incidenteId, verificar que existe
    if (incidenteId.value) {
      await verificarIncidente()
    }
    
    // Todo listo, el componente FormularioDinamicoAnciV3 manejará el resto
    loading.value = false
    
  } catch (error) {
    console.error('Error inicializando vista:', error)
    errorCarga.value = error.message || 'Error desconocido'
    loading.value = false
  }
}

async function verificarEmpresa() {
  try {
    mensajeCarga.value = 'Cargando información de la empresa...'
    
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${props.empresaId}`)
    if (!response.ok) {
      throw new Error('Empresa no encontrada')
    }
    
    const data = await response.json()
    console.log('✅ Datos empresa:', data)
    
    // Actualizar información de empresa
    empresaInfo.value = {
      nombre: data.RazonSocial || data.razon_social || '',
      tipo: data.TipoEmpresa || data.tipo_empresa || 'PSE',
      inquilino: data.NombreInquilino || data.inquilino || ''
    }
    
    console.log('✅ Empresa verificada:', props.empresaId, empresaInfo.value)
    
  } catch (error) {
    console.error('Error verificando empresa:', error)
    throw new Error('Empresa no encontrada o inactiva')
  }
}

async function verificarIncidente() {
  try {
    // Aquí deberías verificar que el incidente existe y pertenece a la empresa
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('✅ Incidente verificado:', incidenteId.value)
    
  } catch (error) {
    throw new Error('Incidente no encontrado o no pertenece a esta empresa')
  }
}

function reintentar() {
  inicializar()
}

function volver() {
  // Verificar si hay cambios sin guardar antes de navegar
  if (confirm('¿Está seguro que desea salir? Los cambios sin guardar se perderán.')) {
    router.push({ 
      name: 'VistaIncidentes',
      params: { 
        inquilinoId: route.params.inquilinoId,
        empresaId: props.empresaId 
      }
    })
  }
}

function onFormularioCreado(evento) {
  console.log('✅ Formulario creado:', evento)
  
  formularioId.value = evento.formularioId
  
  // Si se está creando un nuevo incidente, actualizar la URL
  if (modo.value === 'crear' && evento.incidenteId) {
    const newUrl = `/empresa/${props.empresaId}/incidentes/declarar/${evento.incidenteId}`
    router.replace(newUrl)
  }
  
  // Mostrar notificación de éxito
  console.log(`🎉 Formulario dinámico creado con ID: ${evento.formularioId}`)
}

function onFormularioCompletado(evento) {
  console.log('✅ Formulario completado:', evento)
  
  formularioId.value = evento.formularioId
  mostrarConfirmacion.value = true
  
  // Registrar en analytics si está disponible
  if (window.gtag) {
    window.gtag('event', 'formulario_anci_completado', {
      'empresa_id': props.empresaId,
      'incidente_id': evento.incidenteId,
      'formulario_id': evento.formularioId
    })
  }
}

function onError(error) {
  console.error('❌ Error en formulario:', error)
  
  // Mostrar error al usuario
  errorCarga.value = `Error: ${error.message || error}`
  
  // Opcional: enviar error a servicio de monitoreo
  if (window.Sentry) {
    window.Sentry.captureException(error)
  }
}

function irAListado() {
  mostrarConfirmacion.value = false
  router.push({ 
    name: 'VistaIncidentes',
    params: { empresaId: props.empresaId }
  })
}

function crearNuevo() {
  mostrarConfirmacion.value = false
  // Recargar la página para crear un nuevo formulario
  router.push({ 
    name: 'DeclararIncidente',
    params: { empresaId: props.empresaId }
  })
  // Forzar recarga del componente
  setTimeout(() => {
    window.location.reload()
  }, 100)
}

// Lifecycle
onMounted(() => {
  console.log('🚀 Vista DeclararIncidenteV3 montada')
  console.log('📋 Modo:', modo.value)
  console.log('🆔 Incidente ID:', incidenteId.value)
  console.log('🏢 Empresa ID:', props.empresaId)
  
  // Configurar título de la página
  document.title = `Declarar Incidente ANCI - Empresa ${props.empresaId}`
})
</script>

<style scoped>
.declarar-incidente-v3-container {
  @apply min-h-screen;
  background-color: #1f2937;
}

.header-navegacion {
  @apply px-6 py-4 sticky top-0 z-10;
  background-color: #1f2937;
  border-bottom: 1px solid #374151;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.btn-volver {
  @apply flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 font-medium;
  background-color: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
}

.btn-volver:hover {
  background-color: #4b5563;
  color: #e5e7eb;
}


.loading-container {
  @apply flex items-center justify-center min-h-screen;
  background-color: #1f2937;
}

.loading-spinner {
  @apply flex flex-col items-center p-8 rounded-lg shadow-lg;
  background-color: #111827;
  border: 1px solid #374151;
}

.error-container {
  @apply flex items-center justify-center min-h-screen;
  background-color: #1f2937;
}

.error-content {
  @apply flex flex-col items-center p-8 rounded-lg shadow-lg max-w-md mx-auto;
  background-color: #111827;
  border: 1px solid #374151;
  color: #d1d5db;
}

.btn-reintentar {
  @apply flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md 
         hover:bg-blue-700 transition-all duration-200 font-medium;
}

.formulario-dinamico-container {
  @apply w-full;
}

/* Modal de confirmación */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md mx-4 overflow-hidden;
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 flex items-center space-x-2;
}

.modal-body {
  @apply px-6 py-4 text-gray-700;
}

.modal-footer {
  @apply px-6 py-4 bg-gray-50 flex space-x-3 justify-end;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
         transition-colors duration-200 font-medium flex items-center space-x-2;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 
         transition-colors duration-200 font-medium flex items-center space-x-2;
}

/* Responsive */
@media (max-width: 768px) {
  .header-navegacion {
    @apply px-4 py-3;
  }
  
  .loading-spinner,
  .error-content {
    @apply mx-4 p-6;
  }
  
  .modal-content {
    @apply mx-2;
  }
  
  .modal-footer {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .btn-primary,
  .btn-secondary {
    @apply w-full justify-center;
  }
}
</style>