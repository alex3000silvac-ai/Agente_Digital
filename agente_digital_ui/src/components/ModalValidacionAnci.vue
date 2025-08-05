<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="ph ph-shield-warning mr-2 text-yellow-400"></i>
          Validación para Reporte ANCI
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="ph ph-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="camposFaltantes.length > 0" class="mb-6">
          <div class="warning-banner">
            <i class="ph ph-warning-circle mr-2"></i>
            <div>
              <h4 class="font-semibold">Campos Requeridos Faltantes</h4>
              <p class="text-sm mt-1">
                Para transformar este incidente en un reporte ANCI, debe completar los siguientes campos en el expediente semilla:
              </p>
            </div>
          </div>

          <div class="campos-faltantes mt-4">
            <h5 class="text-sm font-medium text-gray-300 mb-3">Campos que debe completar:</h5>
            <ul class="space-y-2">
              <li 
                v-for="campo in camposFaltantes" 
                :key="campo"
                class="campo-faltante"
              >
                <i class="ph ph-x-circle text-red-400"></i>
                <span>{{ formatearNombreCampo(campo) }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="confirmacion-banner">
          <i class="ph ph-check-circle mr-2 text-green-400"></i>
          <div>
            <h4 class="font-semibold">Validación Exitosa</h4>
            <p class="text-sm mt-1">
              El incidente tiene toda la información requerida para ser transformado en reporte ANCI.
            </p>
          </div>
        </div>

        <div class="info-anci mt-6">
          <h5 class="text-sm font-semibold text-blue-300 mb-3 flex items-center">
            <i class="ph ph-info mr-2"></i>
            ¿Qué sucede al transformar a ANCI?
          </h5>
          <ul class="text-sm text-gray-300 space-y-2">
            <li class="flex items-start space-x-2">
              <i class="ph ph-dot-outline text-blue-400 mt-1 flex-shrink-0"></i>
              <span>Se creará un formulario oficial ANCI con todos los campos requeridos</span>
            </li>
            <li class="flex items-start space-x-2">
              <i class="ph ph-dot-outline text-blue-400 mt-1 flex-shrink-0"></i>
              <span>Se activará el sistema de seguimiento de plazos legales</span>
            </li>
            <li class="flex items-start space-x-2">
              <i class="ph ph-dot-outline text-blue-400 mt-1 flex-shrink-0"></i>
              <span>El expediente semilla seguirá siendo editable independientemente</span>
            </li>
            <li class="flex items-start space-x-2">
              <i class="ph ph-dot-outline text-blue-400 mt-1 flex-shrink-0"></i>
              <span>Podrá exportar el reporte en formatos PDF, Word o TXT</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          <i class="ph ph-x mr-2"></i>
          Cancelar
        </button>
        
        <button 
          v-if="camposFaltantes.length > 0"
          @click="irAExpediente"
          class="btn btn-warning"
        >
          <i class="ph ph-pencil mr-2"></i>
          Completar Campos
        </button>
        
        <button 
          v-else
          @click="$emit('confirmar')"
          class="btn btn-primary"
        >
          <i class="ph ph-shield-check mr-2"></i>
          Confirmar Transformación
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  camposFaltantes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'confirmar'])

// Métodos
const formatearNombreCampo = (campo) => {
  const nombres = {
    'Titulo': 'Título del Incidente',
    'FechaDeteccion': 'Fecha y Hora de Detección',
    'DescripcionInicial': 'Descripción Inicial Detallada',
    'SistemasAfectados': 'Sistemas, Activos o Personal Afectado',
    'Criticidad': 'Criticidad del Incidente',
    'AccionesInmediatas': 'Medidas de Contención Iniciales',
    'OrigenIncidente': 'Origen / Vector de Ataque Probable',
    'EvidenciasMinimas': 'Al menos una evidencia adjunta'
  }
  return nombres[campo] || campo
}

const irAExpediente = () => {
  emit('close')
  // TODO: Scroll o highlight de campos faltantes
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-white flex items-center;
}

.btn-close {
  @apply p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors;
}

.modal-body {
  @apply flex-1 overflow-y-auto p-6;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-700;
}

.warning-banner {
  @apply p-4 bg-yellow-900/30 border border-yellow-500 rounded-lg text-yellow-100 flex items-start space-x-3;
}

.confirmacion-banner {
  @apply p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-100 flex items-start space-x-3;
}

.campos-faltantes {
  @apply bg-gray-700/30 rounded-lg p-4 border border-gray-600;
}

.campo-faltante {
  @apply flex items-center space-x-2 text-sm text-gray-200;
}

.info-anci {
  @apply bg-blue-900/20 rounded-lg p-4 border border-blue-600;
}

.btn {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none;
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