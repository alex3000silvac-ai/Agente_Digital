<template>
  <div class="archivo-item">
    <div class="archivo-header">
      <div class="archivo-icono">
        <i :class="iconoArchivo" class="text-lg"></i>
      </div>
      <div class="archivo-info">
        <div class="archivo-nombre" :title="archivo.nombre">{{ archivo.nombre }}</div>
        <div class="archivo-metadata">
          <span class="archivo-tamaño">{{ tamasoFormateado }}</span>
          <span v-if="archivo.fechaSubida" class="archivo-fecha">{{ fechaFormateada }}</span>
        </div>
      </div>
    </div>

    <div class="archivo-acciones">
      <button v-if="archivo.url || archivo.ruta" 
              @click="descargarArchivo"
              class="btn-accion btn-descargar"
              title="Descargar archivo">
        <i class="fa-solid fa-download"></i>
      </button>
      
      <button v-if="puedeVisualizarse" 
              @click="previsualizarArchivo"
              class="btn-accion btn-ver"
              title="Previsualizar">
        <i class="fa-solid fa-eye"></i>
      </button>
    </div>

    <div v-if="archivo.comentarios" class="archivo-comentarios">
      <small class="comentarios-texto">{{ archivo.comentarios }}</small>
    </div>

    <div v-if="archivo.version" class="archivo-version">
      <span class="version-badge">v{{ archivo.version }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  archivo: {
    type: Object,
    required: true
  },
  seccion: {
    type: String,
    required: true
  }
})

// Computed
const iconoArchivo = computed(() => {
  const extension = props.archivo.nombre?.split('.').pop()?.toLowerCase()
  
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
})

const tamasoFormateado = computed(() => {
  const bytes = props.archivo.tamaño || props.archivo.size || 0
  
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const fechaFormateada = computed(() => {
  if (!props.archivo.fechaSubida) return ''
  
  const fecha = new Date(props.archivo.fechaSubida)
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const puedeVisualizarse = computed(() => {
  const extension = props.archivo.nombre?.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(extension)
})

// Métodos
function descargarArchivo() {
  const url = props.archivo.url || props.archivo.ruta
  if (url) {
    const link = document.createElement('a')
    link.href = url
    link.download = props.archivo.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function previsualizarArchivo() {
  // Implementar previsualización según el tipo de archivo
  const url = props.archivo.url || props.archivo.ruta
  if (url) {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.archivo-item {
  @apply bg-gray-600 rounded-lg p-3 border border-gray-500 hover:border-gray-400 transition-colors;
}

.archivo-header {
  @apply flex items-start space-x-3;
}

.archivo-icono {
  @apply flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-700 rounded;
}

.archivo-info {
  @apply flex-1 min-w-0;
}

.archivo-nombre {
  @apply text-white font-medium text-sm truncate;
}

.archivo-metadata {
  @apply flex space-x-2 text-xs text-gray-400 mt-1;
}

.archivo-tamaño, .archivo-fecha {
  @apply whitespace-nowrap;
}

.archivo-acciones {
  @apply flex space-x-1 mt-2;
}

.btn-accion {
  @apply p-1 rounded hover:bg-gray-500 transition-colors text-gray-300 hover:text-white;
}

.btn-descargar:hover {
  @apply text-blue-400;
}

.btn-ver:hover {
  @apply text-green-400;
}

.archivo-comentarios {
  @apply mt-2 pt-2 border-t border-gray-500;
}

.comentarios-texto {
  @apply text-gray-400 text-xs italic;
}

.archivo-version {
  @apply mt-2 flex justify-end;
}

.version-badge {
  @apply bg-indigo-600 text-white text-xs px-2 py-1 rounded-full;
}
</style>