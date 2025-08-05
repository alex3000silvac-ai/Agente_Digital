<template>
  <div class="evidencia-uploader">
    <!-- Zona de arrastrar y soltar -->
    <div class="drop-zone" 
         :class="{ 'drag-over': isDragOver }"
         @dragover.prevent="handleDragOver"
         @dragleave.prevent="handleDragLeave"
         @drop.prevent="handleDrop">
      
      <div class="drop-zone-content">
        <i class="fa-solid fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
        <p class="drop-zone-text">Arrastra archivos aquí o</p>
        <button @click="triggerFileInput" class="btn-upload">
          Seleccionar Archivos
        </button>
      </div>
      
      <input ref="fileInputRef" 
             type="file" 
             class="hidden" 
             multiple 
             :accept="acceptedFormats"
             @change="handleFileChange">
    </div>

    <!-- Lista de archivos -->
    <div v-if="archivos.length > 0" class="archivos-lista">
      <div class="lista-header">
        <h4 class="lista-titulo">Archivos Cargados ({{ archivos.length }})</h4>
        <button @click="limpiarTodos" class="btn-limpiar">
          <i class="fa-solid fa-trash"></i>
          Limpiar Todo
        </button>
      </div>

      <div class="archivos-grid">
        <div v-for="(archivo, index) in archivos" 
             :key="archivo.id || index"
             class="archivo-card">
          
          <div class="archivo-info">
            <div class="archivo-icono">
              <i :class="getFileIcon(archivo)" class="text-lg"></i>
            </div>
            
            <div class="archivo-detalles">
              <div class="archivo-nombre" :title="archivo.nombre">
                {{ archivo.nombre }}
              </div>
              <div class="archivo-metadata">
                <span class="archivo-tamaño">{{ formatFileSize(archivo.tamaño || archivo.size) }}</span>
                <span v-if="archivo.fechaSubida" class="archivo-fecha">
                  {{ formatDate(archivo.fechaSubida) }}
                </span>
              </div>
            </div>
          </div>

          <div class="archivo-comentarios">
            <textarea v-model="archivo.comentarios"
                      placeholder="Comentarios del archivo..."
                      class="comentarios-input"
                      rows="2"
                      maxlength="200"
                      @input="emitCambios"></textarea>
          </div>

          <div class="archivo-acciones">
            <button v-if="archivo.url" 
                    @click="previsualizarArchivo(archivo)"
                    class="btn-accion btn-ver"
                    title="Previsualizar">
              <i class="fa-solid fa-eye"></i>
            </button>
            
            <button @click="eliminarArchivo(index)"
                    class="btn-accion btn-eliminar"
                    title="Eliminar">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="estado-vacio">
      <i class="fa-solid fa-folder-open text-4xl text-gray-500 mb-3"></i>
      <p class="texto-vacio">No hay archivos para esta sección</p>
      <small class="texto-ayuda">Agrega evidencias relacionadas con {{ nombreSeccion }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  archivos: {
    type: Array,
    default: () => []
  },
  seccion: {
    type: String,
    required: true
  },
  incidenteId: {
    type: [String, Number],
    default: null
  }
})

// Emits
const emit = defineEmits(['archivos-cambiados'])

// Estado local
const isDragOver = ref(false)
const fileInputRef = ref(null)

// Computed
const acceptedFormats = computed(() => {
  return '.pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.zip,.rar,.7z,.tar,.gz,.xml,.json,.log'
})

const nombreSeccion = computed(() => {
  const nombres = {
    'descripcion_alcance': 'descripción y alcance',
    'analisis_preliminar': 'análisis preliminar', 
    'acciones_inmediatas': 'acciones inmediatas',
    'documentacion_tecnica': 'documentación técnica'
  }
  return nombres[props.seccion] || props.seccion
})

// Métodos
function handleDragOver(event) {
  isDragOver.value = true
}

function handleDragLeave(event) {
  isDragOver.value = false
}

function handleDrop(event) {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  procesarArchivos(files)
}

function handleFileChange(event) {
  const files = Array.from(event.target.files)
  procesarArchivos(files)
  
  // Limpiar input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function procesarArchivos(files) {
  const nuevosArchivos = files.map(file => ({
    id: Date.now() + Math.random(),
    nombre: file.name,
    size: file.size,
    tamaño: file.size,
    tipo: file.type,
    archivo: file, // Archivo original para upload
    comentarios: '',
    fechaSubida: new Date().toISOString(),
    seccion: props.seccion,
    url: null // Se asignará después del upload
  }))
  
  const archivosActualizados = [...props.archivos, ...nuevosArchivos]
  emit('archivos-cambiados', { seccion: props.seccion, archivos: archivosActualizados })
}

function eliminarArchivo(index) {
  const archivosActualizados = props.archivos.filter((_, i) => i !== index)
  emit('archivos-cambiados', { seccion: props.seccion, archivos: archivosActualizados })
}

function limpiarTodos() {
  emit('archivos-cambiados', { seccion: props.seccion, archivos: [] })
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function emitCambios() {
  emit('archivos-cambiados', { seccion: props.seccion, archivos: props.archivos })
}

function getFileIcon(archivo) {
  const extension = archivo.nombre?.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return 'fa-solid fa-file-pdf text-red-400'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'fa-solid fa-file-image text-green-400'
    case 'doc':
    case 'docx':
      return 'fa-solid fa-file-word text-blue-400'
    case 'xls':
    case 'xlsx':
      return 'fa-solid fa-file-excel text-green-600'
    case 'txt':
    case 'log':
      return 'fa-solid fa-file-lines text-gray-400'
    case 'zip':
    case 'rar':
    case '7z':
      return 'fa-solid fa-file-zipper text-yellow-400'
    default:
      return 'fa-solid fa-file text-gray-500'
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const fecha = new Date(dateString)
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function previsualizarArchivo(archivo) {
  if (archivo.url) {
    window.open(archivo.url, '_blank')
  }
}

// Exponer funciones para componente padre
defineExpose({
  limpiarTodos
})
</script>

<style scoped>
.evidencia-uploader {
  @apply space-y-4;
}

.drop-zone {
  @apply border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-colors
         hover:border-gray-500 cursor-pointer;
}

.drop-zone.drag-over {
  @apply border-indigo-500 bg-indigo-50 bg-opacity-5;
}

.drop-zone-content {
  @apply flex flex-col items-center;
}

.drop-zone-text {
  @apply text-gray-400 mb-3;
}

.btn-upload {
  @apply px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors;
}

.archivos-lista {
  @apply space-y-4;
}

.lista-header {
  @apply flex justify-between items-center;
}

.lista-titulo {
  @apply text-lg font-semibold text-white;
}

.btn-limpiar {
  @apply flex items-center space-x-2 px-3 py-1 text-red-400 hover:text-red-300 
         hover:bg-red-400 hover:bg-opacity-10 rounded transition-colors;
}

.archivos-grid {
  @apply space-y-3;
}

.archivo-card {
  @apply bg-gray-700 rounded-lg p-4 border border-gray-600;
}

.archivo-info {
  @apply flex items-start space-x-3 mb-3;
}

.archivo-icono {
  @apply flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-600 rounded;
}

.archivo-detalles {
  @apply flex-1 min-w-0;
}

.archivo-nombre {
  @apply text-white font-medium truncate;
}

.archivo-metadata {
  @apply flex space-x-3 text-sm text-gray-400 mt-1;
}

.archivo-comentarios {
  @apply mb-3;
}

.comentarios-input {
  @apply w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm
         focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none;
}

.archivo-acciones {
  @apply flex space-x-2;
}

.btn-accion {
  @apply p-2 rounded hover:bg-gray-600 transition-colors;
}

.btn-ver {
  @apply text-blue-400 hover:text-blue-300;
}

.btn-eliminar {
  @apply text-red-400 hover:text-red-300;
}

.estado-vacio {
  @apply text-center py-12 bg-gray-700 rounded-lg;
}

.texto-vacio {
  @apply text-gray-400 text-lg mb-2;
}

.texto-ayuda {
  @apply text-gray-500 text-sm;
}
</style>