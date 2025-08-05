<template>
  <div v-if="show" class="modal-overlay" @click="cerrar">
    <div class="modal-container" @click.stop>
      
      <!-- Header -->
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="ph ph-download"></i>
          {{ titulo }}
        </h3>
        <button @click="cerrar" class="modal-close">
          <i class="ph ph-x"></i>
        </button>
      </div>

      <!-- Contenido -->
      <div class="modal-content">
        <p class="modal-description">
          {{ descripcion }}
        </p>

        <!-- Opciones de formato -->
        <div class="format-options">
          <div 
            v-for="formato in formatos" 
            :key="formato.value"
            class="format-option"
            :class="{ 'selected': formatoSeleccionado === formato.value }"
            @click="formatoSeleccionado = formato.value"
          >
            <div class="format-icon">
              <i class="ph" :class="formato.icon"></i>
            </div>
            <div class="format-info">
              <div class="format-name">{{ formato.label }}</div>
              <div class="format-description">{{ formato.description }}</div>
            </div>
            <div class="format-radio">
              <input autocomplete="off" type="radio" 
                :value="formato.value" 
                v-model="formatoSeleccionado"
                :id="`formato-${formato.value}`"
              >
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="export-info">
          <div class="info-item">
            <i class="ph ph-info"></i>
            <span>Los archivos TXT son ideales para copiar y pegar en formularios web</span>
          </div>
          <div class="info-item">
            <i class="ph ph-file-pdf"></i>
            <span>Los archivos PDF mantienen el formato para presentaciones oficiales</span>
          </div>
          <div class="info-item">
            <i class="ph ph-file-doc"></i>
            <span>Los archivos Word permiten edición y personalización adicional</span>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="modal-footer">
        <button @click="cerrar" class="btn btn-secondary">
          <i class="ph ph-x"></i>
          Cancelar
        </button>
        <button 
          @click="confirmar" 
          class="btn btn-primary"
          :disabled="!formatoSeleccionado"
        >
          <i class="ph ph-download"></i>
          Descargar {{ formatoSeleccionado?.toUpperCase() }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  titulo: { type: String, default: 'Exportar Documento' },
  descripcion: { type: String, default: 'Seleccione el formato de archivo que desea descargar:' }
})

const emit = defineEmits(['close', 'export'])

const formatoSeleccionado = ref('txt')

const formatos = [
  {
    value: 'txt',
    label: 'Texto Plano (.txt)',
    icon: 'ph-file-text',
    description: 'Fácil de copiar y pegar, compatible con cualquier editor'
  },
  {
    value: 'pdf',
    label: 'PDF (.pdf)',
    icon: 'ph-file-pdf',
    description: 'Formato profesional para presentaciones y archivo'
  },
  {
    value: 'docx',
    label: 'Word (.docx)',
    icon: 'ph-file-doc',
    description: 'Editable en Microsoft Word y aplicaciones compatibles'
  }
]

const cerrar = () => {
  emit('close')
}

const confirmar = () => {
  if (formatoSeleccionado.value) {
    emit('export', formatoSeleccionado.value)
    cerrar()
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-700;
}

.modal-title {
  @apply text-lg font-semibold text-white flex items-center space-x-2;
}

.modal-close {
  @apply text-gray-400 hover:text-white transition-colors p-1 rounded;
}

.modal-content {
  @apply p-6 space-y-6;
}

.modal-description {
  @apply text-gray-300 text-sm;
}

.format-options {
  @apply space-y-3;
}

.format-option {
  @apply flex items-center space-x-4 p-4 border border-gray-600 rounded-lg cursor-pointer transition-colors hover:border-blue-500;
}

.format-option.selected {
  @apply border-blue-500 bg-blue-900/20;
}

.format-icon {
  @apply flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg;
}

.format-icon i {
  @apply text-xl text-gray-300;
}

.format-option.selected .format-icon {
  @apply bg-blue-600;
}

.format-option.selected .format-icon i {
  @apply text-white;
}

.format-info {
  @apply flex-1;
}

.format-name {
  @apply font-medium text-white text-sm;
}

.format-description {
  @apply text-gray-400 text-xs mt-1;
}

.format-radio {
  @apply flex-shrink-0;
}

.format-radio input[type="radio"] {
  @apply w-4 h-4 text-blue-600 border-gray-600 bg-gray-700 focus:ring-blue-500;
}

.export-info {
  @apply bg-gray-700/30 rounded-lg p-4 space-y-2;
}

.info-item {
  @apply flex items-center space-x-2 text-xs text-gray-400;
}

.info-item i {
  @apply text-blue-400 flex-shrink-0;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-700;
}

.btn {
  @apply inline-flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors focus:outline-none;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>