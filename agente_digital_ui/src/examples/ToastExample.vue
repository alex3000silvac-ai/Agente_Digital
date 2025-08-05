<template>
  <div class="p-8 space-y-6">
    <h2 class="text-2xl font-bold text-white mb-6">Sistema de Notificaciones Toast - Demo</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <button 
        @click="showSuccessToast" 
        class="btn btn-success"
      >
        <i class="ph ph-check-circle"></i>
        Success Toast
      </button>
      
      <button 
        @click="showErrorToast" 
        class="btn btn-error"
      >
        <i class="ph ph-x-circle"></i>
        Error Toast
      </button>
      
      <button 
        @click="showWarningToast" 
        class="btn btn-warning"
      >
        <i class="ph ph-warning-circle"></i>
        Warning Toast
      </button>
      
      <button 
        @click="showInfoToast" 
        class="btn btn-info"
      >
        <i class="ph ph-info"></i>
        Info Toast
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button 
        @click="showPersistentToast" 
        class="btn btn-secondary"
      >
        <i class="ph ph-pin"></i>
        Persistent Toast
      </button>
      
      <button 
        @click="showCustomToast" 
        class="btn btn-secondary"
      >
        <i class="ph ph-gear"></i>
        Custom Options Toast
      </button>
    </div>
    
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-white">Ejemplos de API Calls</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          @click="simulateSuccessApiCall" 
          class="btn btn-primary"
        >
          <i class="ph ph-cloud-check"></i>
          Simular API Exitosa
        </button>
        
        <button 
          @click="simulateErrorApiCall" 
          class="btn btn-danger"
        >
          <i class="ph ph-cloud-x"></i>
          Simular API Error
        </button>
      </div>
    </div>
    
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Código de Ejemplo</h3>
      <pre class="text-sm text-gray-300 overflow-x-auto"><code>// Importar el composable
import { useToast } from '@/composables/useToast.js'

// En el setup()
const { success, error, warning, info } = useToast()

// Usar las notificaciones
success('Operación exitosa!')
error('Ha ocurrido un error')
warning('Advertencia importante')
info('Información útil')

// Con opciones personalizadas
success('Mensaje personalizado', {
  title: 'Título personalizado',
  duration: 8000,
  persistent: false
})</code></pre>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'

const { success, error, warning, info, handleApiResponse } = useToast()

const showSuccessToast = () => {
  success('¡Operación completada exitosamente!')
}

const showErrorToast = () => {
  error('Ha ocurrido un error en la aplicación')
}

const showWarningToast = () => {
  warning('Esta es una advertencia importante que debes leer')
}

const showInfoToast = () => {
  info('Esta es información útil para el usuario')
}

const showPersistentToast = () => {
  error('Este mensaje permanecerá hasta que lo cierres manualmente', {
    title: 'Error Crítico',
    persistent: true
  })
}

const showCustomToast = () => {
  success('Mensaje con opciones personalizadas', {
    title: 'Configuración Guardada',
    duration: 8000
  })
}

const simulateSuccessApiCall = async () => {
  const fakeApiCall = () => new Promise(resolve => {
    setTimeout(() => resolve({ data: 'Datos guardados' }), 1000)
  })
  
  await handleApiResponse(fakeApiCall, 'Los datos se guardaron correctamente')
}

const simulateErrorApiCall = async () => {
  const fakeApiCall = () => new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Error de conexión con el servidor')), 1000)
  })
  
  try {
    await handleApiResponse(fakeApiCall, 'Operación exitosa')
  } catch (err) {
    // El error ya se maneja automáticamente en handleApiResponse
  }
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-error {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.btn-warning {
  @apply bg-yellow-600 text-white hover:bg-yellow-700;
}

.btn-info {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-primary {
  @apply bg-indigo-600 text-white hover:bg-indigo-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.btn-danger {
  @apply bg-red-700 text-white hover:bg-red-800;
}
</style>