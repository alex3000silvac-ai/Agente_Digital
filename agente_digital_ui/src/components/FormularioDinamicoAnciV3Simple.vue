<template>
  <div class="formulario-dinamico-anci-v3">
    <!-- Header Principal -->
    <div class="formulario-header">
      <h1 class="titulo-principal">
        <i class="fas fa-file-alt"></i>
        Formulario Dinámico ANCI V3 - Sistema de 41 Secciones
      </h1>
      <p class="subtitulo">
        Empresa ID: {{ empresaId }} | 
        Incidente ID: {{ incidenteId || 'Nuevo' }} |
        Modo: {{ modo }}
      </p>
    </div>

    <!-- Estado de Carga -->
    <div v-if="cargando" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando configuración dinámica...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error al cargar formulario</h3>
        <p>{{ error }}</p>
        <button @click="recargar" class="btn btn-primary">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div v-else class="formulario-content">
      <!-- Información de la Empresa -->
      <div class="empresa-info-card">
        <h3>Información de la Empresa</h3>
        <p><strong>Razón Social:</strong> {{ empresaInfo.razonSocial || 'Cargando...' }}</p>
        <p><strong>Tipo:</strong> {{ empresaInfo.tipoEmpresa || 'Cargando...' }}</p>
        <p><strong>Secciones Aplicables:</strong> {{ seccionesAplicables.length }} de 41</p>
      </div>

      <!-- Acordeón de Secciones -->
      <div class="secciones-container">
        <h2>Secciones del Formulario ANCI</h2>
        
        <!-- Sección Fija de Ejemplo -->
        <div class="seccion-item">
          <div class="seccion-header" @click="toggleSeccion(1)">
            <i class="fas fa-chevron-right"></i>
            <span class="seccion-numero">1</span>
            <span class="seccion-titulo">Identificación del Incidente</span>
            <span class="seccion-estado">
              <i class="fas fa-check-circle text-green-500"></i>
            </span>
          </div>
          <div v-if="seccionesAbiertas[1]" class="seccion-content">
            <p>Contenido de la sección 1...</p>
            <div class="campo-grupo">
              <label>Campo de prueba:</label>
              <input type="text" class="form-input" placeholder="Ingrese valor...">
            </div>
          </div>
        </div>

        <!-- Más secciones... -->
        <div v-for="i in 5" :key="i + 1" class="seccion-item">
          <div class="seccion-header" @click="toggleSeccion(i + 1)">
            <i class="fas fa-chevron-right"></i>
            <span class="seccion-numero">{{ i + 1 }}</span>
            <span class="seccion-titulo">Sección {{ i + 1 }}</span>
            <span class="seccion-estado">
              <i class="fas fa-circle text-gray-400"></i>
            </span>
          </div>
        </div>

        <!-- Secciones Dinámicas (Taxonomías) -->
        <h3 class="taxonomias-titulo">Taxonomías Aplicables</h3>
        <div v-for="(tax, index) in taxonomiasAplicables" :key="'tax-' + index" class="seccion-item taxonomia">
          <div class="seccion-header" @click="toggleSeccion('tax-' + index)">
            <i class="fas fa-chevron-right"></i>
            <span class="seccion-numero">{{ 7 + index }}</span>
            <span class="seccion-titulo">{{ tax.nombre }}</span>
            <span class="badge-taxonomia">{{ tax.tipo }}</span>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="acciones-footer">
        <button @click="guardarBorrador" class="btn btn-secondary">
          <i class="fas fa-save"></i>
          Guardar Borrador
        </button>
        <button @click="validar" class="btn btn-warning">
          <i class="fas fa-check"></i>
          Validar
        </button>
        <button @click="enviar" class="btn btn-primary">
          <i class="fas fa-paper-plane"></i>
          Enviar Formulario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Props
const props = defineProps({
  empresaId: {
    type: [String, Number],
    required: true
  },
  incidenteId: {
    type: [String, Number],
    default: null
  },
  formularioId: {
    type: [String, Number],
    default: null
  },
  modo: {
    type: String,
    default: 'crear'
  }
})

// Estado
const cargando = ref(true)
const error = ref(null)
const empresaInfo = ref({})
const seccionesAbiertas = ref({})
const seccionesAplicables = ref([])
const taxonomiasAplicables = ref([])

// Métodos
async function cargarDatos() {
  try {
    cargando.value = true
    error.value = null
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Datos de ejemplo
    empresaInfo.value = {
      razonSocial: 'Empresa de Prueba S.A.',
      tipoEmpresa: 'PSE'
    }
    
    seccionesAplicables.value = Array(6).fill(null).map((_, i) => ({
      id: i + 1,
      nombre: `Sección ${i + 1}`,
      tipo: 'fija'
    }))
    
    taxonomiasAplicables.value = Array(10).fill(null).map((_, i) => ({
      id: `tax-${i}`,
      nombre: `Taxonomía ${i + 1}`,
      tipo: ['OIV', 'PSE', 'AMBAS'][i % 3]
    }))
    
    console.log('✅ Formulario Dinámico ANCI V3 cargado correctamente')
    
  } catch (err) {
    console.error('❌ Error cargando formulario:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    cargando.value = false
  }
}

function toggleSeccion(id) {
  seccionesAbiertas.value[id] = !seccionesAbiertas.value[id]
}

function recargar() {
  cargarDatos()
}

function guardarBorrador() {
  console.log('💾 Guardando borrador...')
  alert('Borrador guardado (simulado)')
}

function validar() {
  console.log('✔️ Validando formulario...')
  alert('Formulario validado (simulado)')
}

function enviar() {
  console.log('📤 Enviando formulario...')
  alert('Formulario enviado (simulado)')
}

// Lifecycle
onMounted(() => {
  console.log('🚀 FormularioDinamicoAnciV3 montado')
  console.log('📝 Props:', {
    empresaId: props.empresaId,
    incidenteId: props.incidenteId,
    modo: props.modo
  })
  cargarDatos()
})
</script>

<style scoped>
.formulario-dinamico-anci-v3 {
  @apply bg-gray-900 text-gray-100 min-h-screen p-6;
}

.formulario-header {
  @apply bg-gray-800 rounded-lg p-6 mb-6 text-center;
}

.titulo-principal {
  @apply text-3xl font-bold text-white mb-2;
}

.subtitulo {
  @apply text-gray-400;
}

.loading-container, .error-container {
  @apply flex items-center justify-center min-h-[400px];
}

.loading-spinner, .error-content {
  @apply text-center;
}

.loading-spinner i, .error-content i {
  @apply text-4xl mb-4;
}

.error-content i {
  @apply text-red-500;
}

.loading-spinner i {
  @apply text-blue-500;
}

.empresa-info-card {
  @apply bg-gray-800 rounded-lg p-6 mb-6;
}

.secciones-container {
  @apply bg-gray-800 rounded-lg p-6 mb-6;
}

.seccion-item {
  @apply mb-2 bg-gray-700 rounded overflow-hidden;
}

.seccion-header {
  @apply flex items-center p-4 cursor-pointer hover:bg-gray-600 transition-colors;
}

.seccion-numero {
  @apply mx-3 font-bold text-blue-400;
}

.seccion-titulo {
  @apply flex-1;
}

.seccion-estado {
  @apply ml-auto;
}

.seccion-content {
  @apply p-4 bg-gray-800 border-t border-gray-600;
}

.campo-grupo {
  @apply mb-4;
}

.campo-grupo label {
  @apply block text-sm font-medium text-gray-300 mb-2;
}

.form-input {
  @apply w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white;
}

.taxonomias-titulo {
  @apply text-xl font-bold text-white mt-6 mb-4;
}

.badge-taxonomia {
  @apply ml-3 px-2 py-1 text-xs rounded bg-blue-600 text-white;
}

.acciones-footer {
  @apply flex justify-end space-x-4 mt-6;
}

.btn {
  @apply px-6 py-3 rounded font-medium transition-colors flex items-center space-x-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.btn-warning {
  @apply bg-yellow-600 text-white hover:bg-yellow-700;
}
</style>