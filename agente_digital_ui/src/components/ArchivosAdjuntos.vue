<template>
  <div class="archivos-adjuntos">
    <!-- Lista de archivos existentes -->
    <div v-if="archivos.length > 0" class="archivos-lista">
      <h5 class="archivos-titulo">
        <i class="fas fa-paperclip"></i>
        Archivos adjuntos ({{ archivos.length }})
      </h5>
      
      <div 
        v-for="(archivo, index) in archivos" 
        :key="archivo.id || `archivo-${index}`"
        class="archivo-item"
      >
        <div class="archivo-info">
          <i class="fas fa-file archivo-icono"></i>
          <div class="archivo-detalles">
            <div class="archivo-nombre">{{ archivo.nombre }}</div>
            <div class="archivo-meta">
              <span v-if="archivo.tamaño">{{ formatearTamaño(archivo.tamaño) }}</span>
              <span v-if="archivo.fechaCarga" class="archivo-fecha">
                • {{ formatearFecha(archivo.fechaCarga) }}
              </span>
              <span v-if="archivo.existente" class="archivo-estado">
                <i class="fas fa-check-circle"></i> Guardado
              </span>
            </div>
            <div v-if="archivo.descripcion" class="archivo-descripcion">
              {{ archivo.descripcion }}
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="archivo-acciones">
          <button 
            v-if="archivo.id"
            @click="verArchivo(archivo)" 
            class="btn-archivo btn-ver"
            type="button"
            title="Ver archivo"
          >
            <i class="fas fa-eye"></i>
          </button>
          
          <button 
            v-if="!archivo.existente || modo === 'editar'"
            @click="editarComentario(archivo, index)"
            class="btn-archivo btn-editar"
            type="button"
            title="Editar descripción"
          >
            <i class="fas fa-edit"></i>
          </button>
          
          <button 
            @click="eliminarArchivo(archivo, index)"
            class="btn-archivo btn-eliminar"
            type="button"
            title="Eliminar archivo"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Zona para agregar nuevos archivos -->
    <div class="agregar-archivo-zona">
      <label class="agregar-archivo-label">
        <input
          type="file"
          multiple
          @change="manejarArchivosSeleccionados"
          class="agregar-archivo-input"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip,.rar"
        />
        <div class="agregar-archivo-contenido">
          <i class="fas fa-cloud-upload-alt"></i>
          <span>Agregar archivos</span>
          <span class="agregar-archivo-ayuda">
            Clic para seleccionar o arrastre archivos aquí
          </span>
        </div>
      </label>
    </div>
    
    <!-- Modal para editar descripción -->
    <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModalEdicion">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar información del archivo</h3>
          <button @click="cerrarModalEdicion" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Archivo:</label>
            <p class="archivo-nombre-modal">{{ archivoEditando?.nombre }}</p>
          </div>
          
          <div class="form-group">
            <label for="descripcion-archivo">Descripción:</label>
            <textarea
              id="descripcion-archivo"
              v-model="descripcionTemporal"
              class="form-control"
              rows="3"
              placeholder="Describa brevemente el contenido del archivo..."
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModalEdicion" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="guardarDescripcion" class="btn btn-primary">
            <i class="fas fa-save"></i>
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  seccion: {
    type: Number,
    required: true
  },
  campo: {
    type: Number,
    required: true
  },
  archivos: {
    type: Array,
    default: () => []
  },
  modo: {
    type: String,
    default: 'crear'
  }
})

const emit = defineEmits([
  'archivo-agregado',
  'archivo-eliminado',
  'comentario-actualizado'
])

// Estado del modal de edición
const mostrarModalEdicion = ref(false)
const archivoEditando = ref(null)
const indiceEditando = ref(null)
const descripcionTemporal = ref('')

// Formatear tamaño de archivo
function formatearTamaño(bytes) {
  if (!bytes) return 'Tamaño desconocido'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Formatear fecha
function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Ver archivo
function verArchivo(archivo) {
  if (!archivo.id) {
    alert('Este archivo es nuevo y aún no ha sido guardado.')
    return
  }
  
  const url = `http://localhost:5000/api/incidentes/archivo/${archivo.id}`
  window.open(url, '_blank', 'noopener=yes,noreferrer=yes')
}

// Manejar archivos seleccionados
function manejarArchivosSeleccionados(event) {
  const archivos = Array.from(event.target.files)
  
  for (const archivo of archivos) {
    // Validar tamaño (máximo 50MB)
    if (archivo.size > 50 * 1024 * 1024) {
      alert(`El archivo ${archivo.name} es demasiado grande. Máximo 50MB.`)
      continue
    }
    
    const nuevoArchivo = {
      id: `nuevo_${Date.now()}_${Math.random()}`,
      nombre: archivo.name,
      tamaño: archivo.size,
      tipo: archivo.type,
      file: archivo,
      descripcion: '',
      comentario: '',
      fechaCarga: new Date().toISOString(),
      existente: false,
      origen: 'nuevo'
    }
    
    emit('archivo-agregado', nuevoArchivo)
  }
  
  // Limpiar input
  event.target.value = ''
}

// Editar comentario/descripción
function editarComentario(archivo, index) {
  archivoEditando.value = archivo
  indiceEditando.value = index
  descripcionTemporal.value = archivo.descripcion || archivo.comentario || ''
  mostrarModalEdicion.value = true
}

// Cerrar modal de edición
function cerrarModalEdicion() {
  mostrarModalEdicion.value = false
  archivoEditando.value = null
  indiceEditando.value = null
  descripcionTemporal.value = ''
}

// Guardar descripción
function guardarDescripcion() {
  if (archivoEditando.value) {
    emit('comentario-actualizado', {
      archivo: archivoEditando.value,
      index: indiceEditando.value,
      comentario: descripcionTemporal.value
    })
  }
  cerrarModalEdicion()
}

// Eliminar archivo
function eliminarArchivo(archivo, index) {
  const mensaje = archivo.existente 
    ? '¿Está seguro de eliminar este archivo? Esta acción no se puede deshacer.'
    : '¿Está seguro de quitar este archivo?'
    
  if (confirm(mensaje)) {
    emit('archivo-eliminado', archivo)
  }
}
</script>

<style scoped>
.archivos-adjuntos {
  @apply space-y-4;
}

.archivos-lista {
  @apply space-y-3;
}

.archivos-titulo {
  @apply text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2;
}

.archivo-item {
  @apply flex items-start justify-between p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors;
}

.archivo-info {
  @apply flex items-start gap-3 flex-1;
}

.archivo-icono {
  @apply text-blue-400 text-lg mt-1;
}

.archivo-detalles {
  @apply flex-1;
}

.archivo-nombre {
  @apply text-white font-medium text-sm;
}

.archivo-meta {
  @apply text-xs text-gray-400 mt-1 flex items-center gap-2;
}

.archivo-fecha {
  @apply text-gray-500;
}

.archivo-estado {
  @apply text-green-400 flex items-center gap-1;
}

.archivo-descripcion {
  @apply text-sm text-gray-300 mt-2;
}

.archivo-acciones {
  @apply flex items-center gap-2 ml-4;
}

.btn-archivo {
  @apply p-2 rounded text-sm transition-all duration-200 border border-transparent;
}

.btn-ver {
  @apply text-blue-400 hover:bg-blue-900/30 hover:border-blue-700;
}

.btn-editar {
  @apply text-yellow-400 hover:bg-yellow-900/30 hover:border-yellow-700;
}

.btn-eliminar {
  @apply text-red-400 hover:bg-red-900/30 hover:border-red-700;
}

/* Zona de agregar archivos */
.agregar-archivo-zona {
  @apply mt-4;
}

.agregar-archivo-label {
  @apply block cursor-pointer;
}

.agregar-archivo-input {
  @apply hidden;
}

.agregar-archivo-contenido {
  @apply border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-gray-800/50 transition-all;
}

.agregar-archivo-contenido i {
  @apply text-3xl text-gray-500 mb-2;
}

.agregar-archivo-contenido span {
  @apply block text-gray-400;
}

.agregar-archivo-ayuda {
  @apply text-xs text-gray-500 mt-1;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-auto;
}

.modal-header {
  @apply flex justify-between items-center p-4 border-b border-gray-700;
}

.modal-header h3 {
  @apply text-lg font-semibold text-white;
}

.modal-close {
  @apply text-gray-400 hover:text-white p-1;
}

.modal-body {
  @apply p-4 space-y-4;
}

.modal-footer {
  @apply flex justify-end gap-3 p-4 border-t border-gray-700;
}

.form-group {
  @apply space-y-2;
}

.form-group label {
  @apply text-sm font-medium text-gray-300;
}

.archivo-nombre-modal {
  @apply text-white font-medium;
}

.form-control {
  @apply w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none;
}

.btn {
  @apply px-4 py-2 rounded font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}
</style>