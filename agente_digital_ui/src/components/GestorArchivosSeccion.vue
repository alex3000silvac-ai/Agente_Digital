<template>
  <div class="gestor-archivos-seccion">
    <!-- Lista de archivos existentes -->
    <div v-if="archivos.length > 0" class="archivos-lista mb-4">
      <div v-for="(archivo, idx) in archivos" :key="archivo.id" class="archivo-item">
        <div class="archivo-header">
          <i class="fas fa-file archivo-icon"></i>
          <span class="archivo-numero">{{ seccion }}.{{ campo }}.{{ idx + 1 }}</span>
          <span class="archivo-nombre">{{ archivo.nombre }}</span>
          <div class="archivo-acciones">
            <button 
              @click.prevent="visualizar(archivo)" 
              class="btn-visualizar"
              title="Ver archivo"
              type="button"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button 
              @click="eliminar(archivo)" 
              class="btn-eliminar"
              :title="(archivo.existente || archivo.origen === 'guardado') ? 'Eliminar archivo guardado (requiere confirmación)' : 'Eliminar archivo'"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="archivo-detalles">
          <input 
            type="text" 
            v-model="archivo.descripcion"
            class="archivo-descripcion"
            placeholder="Descripción del archivo..."
            @blur="actualizarDescripcion(archivo)"
          />
          <span class="archivo-fecha">{{ formatearFecha(archivo.fechaCarga) }}</span>
        </div>
        
        <div class="archivo-comentario">
          <textarea
            v-model="archivo.comentario"
            class="comentario-input"
            placeholder="Comentarios sobre este archivo..."
            rows="2"
            @blur="actualizarComentario(archivo)"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Botón para agregar archivo -->
    <div class="agregar-archivo">
      <input 
        ref="fileInput"
        type="file" 
        @change="onFileSelect"
        class="hidden"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip"
      />
      
      <button @click="$refs.fileInput.click()" class="btn-agregar">
        <i class="fas fa-plus"></i>
        Agregar archivo
      </button>
      
      <span class="archivo-ayuda">
        Máx 10MB por archivo. Formatos: PDF, DOC, XLS, imágenes, TXT, ZIP
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  seccion: {
    type: Number,
    required: true
  },
  campo: {
    type: [Number, String],
    required: true
  },
  archivos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['archivo-agregado', 'archivo-eliminado', 'comentario-actualizado'])

function onFileSelect(event) {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} excede el límite de 10MB`)
      return
    }
    
    // Crear objeto archivo con toda la metadata necesaria
    const archivoData = {
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type,
      fechaCarga: new Date().toISOString(),
      descripcion: '',
      comentario: '',
      file: file // Archivo real para subir
    }
    
    emit('archivo-agregado', archivoData)
  })
  
  // Limpiar input
  event.target.value = ''
}

function eliminar(archivo) {
  // Si el archivo está guardado/existente, mostrar confirmación más fuerte
  if (archivo.existente || archivo.origen === 'guardado' || archivo.id) {
    const mensaje = `¿Está seguro de eliminar el archivo "${archivo.nombre}"?\n\nEsta acción eliminará permanentemente el archivo del sistema.`
    if (confirm(mensaje)) {
      emit('archivo-eliminado', archivo)
    }
  } else {
    // Archivo nuevo, confirmación simple
    if (confirm('¿Está seguro de eliminar este archivo?')) {
      emit('archivo-eliminado', archivo)
    }
  }
}

function actualizarDescripcion(archivo) {
  emit('comentario-actualizado', {
    archivoId: archivo.id,
    tipo: 'descripcion',
    valor: archivo.descripcion
  })
}

function actualizarComentario(archivo) {
  emit('comentario-actualizado', {
    archivoId: archivo.id,
    tipo: 'comentario',
    valor: archivo.comentario
  })
}

function visualizar(archivo) {
  // Si el archivo no tiene ID, es nuevo y no se puede visualizar
  if (!archivo.id) {
    alert('Este archivo es nuevo y aún no ha sido guardado. Guarde el incidente para poder visualizarlo.')
    return
  }
  
  // Usar la URL del backend directamente (puerto 5000)
  const url = `http://localhost:5000/api/incidentes/archivo/${archivo.id}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.gestor-archivos-seccion {
  @apply space-y-4;
}

.archivos-lista {
  @apply space-y-3;
}

.archivo-item {
  @apply bg-gray-600 rounded-lg p-4;
}

.archivo-header {
  @apply flex items-center mb-2;
}

.archivo-icon {
  @apply text-blue-400 mr-2;
}

.archivo-numero {
  @apply text-xs text-gray-400 mr-2 font-mono;
}

.archivo-nombre {
  @apply flex-1 text-white font-medium;
}

.archivo-acciones {
  @apply flex items-center space-x-2;
}

.btn-visualizar {
  @apply text-blue-400 hover:text-blue-300 p-1;
}

.btn-eliminar {
  @apply text-red-400 hover:text-red-300 p-1;
}

.btn-eliminar:disabled {
  @apply text-gray-500 cursor-not-allowed opacity-50;
  pointer-events: none;
}

.archivo-detalles {
  @apply flex items-center space-x-4 mb-2;
}

.archivo-descripcion {
  @apply flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white;
}

.archivo-fecha {
  @apply text-xs text-gray-400;
}

.archivo-comentario {
  @apply mt-2;
}

.comentario-input {
  @apply w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white resize-none;
}

.agregar-archivo {
  @apply flex items-center space-x-4;
}

.btn-agregar {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2;
}

.archivo-ayuda {
  @apply text-xs text-gray-400;
}
</style>