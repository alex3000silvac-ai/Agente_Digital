<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-white">Gestión de Evidencias del Incidente</h3>
    </template>
    
    <template #default>
      <div v-if="loading" class="text-center p-4 text-gray-400">Cargando historial de evidencias...</div>
      <div v-else-if="error" class="text-center p-4 text-red-400">{{ error }}</div>
      <div v-else class="space-y-6">
        <div>
          <h4 class="font-semibold text-gray-300 mb-2">Subir Nueva Versión de Evidencia</h4>
          <div class="p-4 border border-dashed border-gray-600 rounded-lg">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Archivo</label>
                <input autocomplete="off" type="file" @change="onFileChange" class="file-input" ref="fileInputRef">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Descripción del archivo</label>
                <textarea 
                  v-model="descripcionArchivo"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Describe brevemente el contenido del archivo..."
                  maxlength="250"
                ></textarea>
                <p class="text-xs text-gray-400 mt-1">{{ descripcionArchivo.length }}/250 caracteres</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Fecha de vigencia (opcional)</label>
                <input 
                  type="date"
                  v-model="fechaVigencia"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :min="new Date().toISOString().split('T')[0]"
                >
              </div>
              
              <button @click="subirNuevoArchivo" class="btn btn-primary w-full" :disabled="uploading || !selectedFile || descripcionArchivo.length < 10">
                {{ uploading ? 'Subiendo...' : 'Subir Archivo' }}
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-300 mb-2">Historial de Versiones</h4>
          <div v-if="evidencias.length > 0" class="space-y-2">
            <div v-for="evidencia in evidencias" :key="evidencia.EvidenciaIncidenteID" class="historial-item">
              <div v-if="evidenciaEditando?.EvidenciaIncidenteID === evidencia.EvidenciaIncidenteID" class="edit-form w-full">
                <!-- Formulario de edición -->
                <div class="space-y-3">
                  <div>
                    <label class="text-xs font-medium text-gray-400">Descripción</label>
                    <textarea 
                      v-model="editandoDescripcion"
                      class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      rows="2"
                    ></textarea>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-400">Fecha de vigencia</label>
                    <input 
                      type="date"
                      v-model="editandoFechaVigencia"
                      class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      :min="new Date().toISOString().split('T')[0]"
                    >
                  </div>
                  <div class="flex gap-2">
                    <button @click="guardarEdicion(evidencia)" class="btn btn-sm btn-primary">
                      <i class="ph ph-check"></i> Guardar
                    </button>
                    <button @click="cancelarEdicion" class="btn btn-sm btn-secondary">
                      <i class="ph ph-x"></i> Cancelar
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-else class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3 flex-1 cursor-pointer" @click="visualizarEvidencia(evidencia)">
                  <i :class="getFileIcon(evidencia.NombreArchivoOriginal)" class="text-2xl"></i>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="font-medium text-white hover:text-blue-400 transition-colors">{{ evidencia.NombreArchivoOriginal }}</p>
                      <span class="text-xs text-gray-400">v{{ evidencia.Version }}</span>
                      <span v-if="evidencia.Descripcion" class="text-xs text-gray-300 italic">"{{ evidencia.Descripcion }}"</span>
                      <span class="text-xs text-gray-500">{{ formatDateTime(evidencia.FechaSubida) }}</span>
                      <span v-if="evidencia.FechaVigencia" class="text-xs text-blue-400">
                        <i class="ph ph-calendar-check"></i> Vigente hasta: {{ formatDate(evidencia.FechaVigencia) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                      Subido por {{ evidencia.UsuarioQueSubio || 'Desconocido' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <button @click="visualizarEvidencia(evidencia)" class="btn btn-icon btn-sm" title="Ver archivo">
                    <i class="ph ph-eye"></i>
                  </button>
                  <button @click="descargarEvidencia(evidencia)" class="btn btn-icon btn-sm" title="Descargar">
                    <i class="ph ph-download-simple"></i>
                  </button>
                  <button @click="editarEvidencia(evidencia)" class="btn btn-icon btn-sm" title="Editar">
                    <i class="ph ph-pencil"></i>
                  </button>
                  <button @click="eliminarEvidencia(evidencia.EvidenciaIncidenteID)" class="btn btn-icon btn-sm btn-danger" title="Eliminar">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 p-4 border border-gray-700 rounded-lg">
            No hay evidencias adjuntas a este incidente.
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button @click="$emit('update:modelValue', false)" type="button" class="btn btn-secondary">Cerrar</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue'; // Asumiendo que tienes un componente base 'Modal.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  incidenteId: { type: Number, default: null }
});
const emit = defineEmits(['update:modelValue', 'gestion-finalizada', 'toast']);

const evidencias = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const fileInputRef = ref(null);
const descripcionArchivo = ref('');
const fechaVigencia = ref('');
const evidenciaEditando = ref(null);
const editandoDescripcion = ref('');
const editandoFechaVigencia = ref('');

async function cargarEvidencias() {
  // Validar que el incidenteId existe y es válido
  if (!props.incidenteId || props.incidenteId === 'undefined' || props.incidenteId === undefined) {
    console.warn('🚨 Intento de cargar evidencias con incidenteId inválido:', props.incidenteId);
    loading.value = false;
    error.value = 'ID de incidente no válido';
    return;
  }
  
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/evidencias`);
    if (!response.ok) throw new Error('Error al cargar el historial de evidencias.');
    evidencias.value = await response.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

function onFileChange(event) {
  selectedFile.value = event.target.files[0];
}

async function subirNuevoArchivo() {
  if (!selectedFile.value) {
    emit('toast', 'Por favor, seleccione un archivo primero.', 'warning');
    return;
  }
  
  // Validar que el incidenteId existe y es válido
  if (!props.incidenteId || props.incidenteId === 'undefined' || props.incidenteId === undefined) {
    emit('toast', 'Error: ID de incidente no válido. No se puede subir evidencia.', 'error');
    console.error('🚨 Intento de subir evidencia con incidenteId inválido:', props.incidenteId);
    return;
  }
  
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('descripcion', descripcionArchivo.value);
  if (fechaVigencia.value) {
    formData.append('fechaVigencia', fechaVigencia.value);
  }
  try {
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/evidencia`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido al subir.');
    
    emit('toast', result.message, 'success');
    selectedFile.value = null;
    descripcionArchivo.value = '';
    fechaVigencia.value = '';
    if (fileInputRef.value) fileInputRef.value.value = ''; // Limpiar el input
    await cargarEvidencias(); // Recargar la lista de evidencias
    emit('gestion-finalizada'); // Notificar al componente padre que algo cambió
  } catch(e) {
    emit('toast', `Error al subir el archivo: ${e.message}`, 'error');
  } finally {
    uploading.value = false;
  }
}

async function eliminarEvidencia(evidenciaId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia? Esta acción es irreversible.')) return;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/evidencia-incidente/${evidenciaId}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al eliminar');
        
        emit('toast', result.message, 'success');
        await cargarEvidencias(); // Recargar la lista
        emit('gestion-finalizada');
    } catch(e) {
        emit('toast', `Error: ${e.message}`, 'error');
    }
}

function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(isoString).toLocaleString('es-CL', options);
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(isoString).toLocaleDateString('es-CL', options);
}

function getFileIcon(filename) {
  if (!filename) return 'ph ph-file text-gray-400';
  const ext = filename.split('.').pop().toLowerCase();
  const iconMap = {
    pdf: 'ph ph-file-pdf text-red-400',
    doc: 'ph ph-file-doc text-blue-400',
    docx: 'ph ph-file-doc text-blue-400',
    xls: 'ph ph-file-xls text-green-400',
    xlsx: 'ph ph-file-xls text-green-400',
    txt: 'ph ph-file-text text-gray-400',
    png: 'ph ph-file-image text-purple-400',
    jpg: 'ph ph-file-image text-purple-400',
    jpeg: 'ph ph-file-image text-purple-400',
    gif: 'ph ph-file-image text-purple-400'
  };
  return iconMap[ext] || 'ph ph-file text-gray-400';
}

function editarEvidencia(evidencia) {
  evidenciaEditando.value = evidencia;
  editandoDescripcion.value = evidencia.Descripcion || '';
  editandoFechaVigencia.value = evidencia.FechaVigencia ? evidencia.FechaVigencia.split('T')[0] : '';
}

function cancelarEdicion() {
  evidenciaEditando.value = null;
  editandoDescripcion.value = '';
  editandoFechaVigencia.value = '';
}

async function guardarEdicion(evidencia) {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/evidencia-incidente/${evidencia.EvidenciaIncidenteID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descripcion: editandoDescripcion.value,
        fechaVigencia: editandoFechaVigencia.value || null
      })
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al actualizar');
    
    emit('toast', 'Evidencia actualizada exitosamente', 'success');
    cancelarEdicion();
    await cargarEvidencias();
  } catch (e) {
    emit('toast', `Error al actualizar: ${e.message}`, 'error');
  }
}

async function visualizarEvidencia(evidencia) {
  try {
    window.open(`http://localhost:5000/api/admin/evidencia-incidente/${evidencia.EvidenciaIncidenteID}`, '_blank');
  } catch (e) {
    emit('toast', 'Error al visualizar el archivo', 'error');
  }
}

async function descargarEvidencia(evidencia) {
  try {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/admin/evidencia-incidente/${evidencia.EvidenciaIncidenteID}`;
    link.download = evidencia.NombreArchivoOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    emit('toast', 'Error al descargar el archivo', 'error');
  }
}

// Cargar las evidencias cuando se abre el modal
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.incidenteId) {
    cargarEvidencias();
  }
});
</script>

<style scoped>
/* Estos estilos son una copia de los que ya usamos, para mantener la consistencia */
.file-input { display: block; width: 100%; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.5rem; font-size: 0.875rem; color: #d1d5db; background-color: #374151; }
.file-input::file-selector-button { margin-right: 0.75rem; border: none; background-color: #4f46e5; font-weight: 600; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; }
.historial-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background-color: #2d3748; border-radius: 0.375rem; margin-bottom: 0.5rem; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-primary:hover { background-color: #4338ca; }
.btn-primary:disabled { background-color: #374151; cursor: not-allowed; }
.btn-secondary { background-color: #374151; border: 1px solid #4b5563; color: #d1d5db; }
.btn-secondary:hover { background-color: #4b5563; }
.btn-icon { padding: 0.5rem; background-color: transparent; color: #d1d5db; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-icon:hover { background-color: #374151; }
.btn-danger { color: #fca5a5; }
.btn-danger:hover { background-color: #ef4444; color: white; }
.edit-form { background-color: #1f2937; padding: 1rem; border-radius: 0.375rem; border: 1px solid #374151; }
</style>