<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" size="lg">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-white">
        <i class="ph ph-folder-open mr-2"></i>
        Gestor de Archivos y Versiones
      </h3>
    </template>
    
    <template #default>
      <div class="space-y-6">
        <!-- Área de subida de archivos mejorada -->
        <div class="upload-zone">
          <input 
            type="file" 
            ref="fileInput" 
            @change="onFileSelect" 
            multiple
            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.zip,.rar,.7z,.tar,.gz,.xml,.json,.log"
            class="hidden"
          >
          
          <div 
            @click="$refs.fileInput.click()"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            class="upload-drop-zone"
            :class="{ 'drag-over': dragOver }"
          >
            <i class="ph ph-cloud-arrow-up text-5xl mb-3"></i>
            <p class="text-lg font-medium mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
            <p class="text-sm text-gray-400">Puedes subir múltiples archivos a la vez</p>
            <p class="text-xs text-gray-500 mt-2">Formatos permitidos: PDF, DOC, XLS, Imágenes, ZIP, etc.</p>
          </div>
        </div>

        <!-- Archivos seleccionados para subir -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <h4 class="text-sm font-medium text-gray-300 mb-3">
            <i class="ph ph-files mr-2"></i>
            Archivos listos para subir ({{ selectedFiles.length }})
          </h4>
          
          <div class="space-y-2">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="flex items-center gap-3">
                <i :class="getFileIcon(file.name)" class="text-2xl"></i>
                <div class="flex-1">
                  <p class="font-medium text-white">{{ file.name }}</p>
                  <p class="text-xs text-gray-400">{{ formatFileSize(file.size) }}</p>
                </div>
                <button @click="removeSelectedFile(index)" class="btn-remove">
                  <i class="ph ph-x"></i>
                </button>
              </div>
              
              <!-- Descripción y fecha de vigencia para cada archivo -->
              <div class="mt-2 space-y-2">
                <input 
                  v-model="fileDescriptions[index]"
                  type="text" 
                  placeholder="Descripción del archivo (opcional)"
                  class="file-description-input"
                >
                <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <label class="text-xs text-gray-400 block mb-1">Fecha de Vigencia (opcional)</label>
                    <input 
                      v-model="fileExpiryDates[index]"
                      type="date" 
                      class="file-date-input"
                      title="Fecha hasta la cual el archivo es válido"
                    >
                  </div>
                  <div class="text-xs text-gray-500 mt-4">
                    Si no se especifica, el archivo no tendrá fecha de vencimiento
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button @click="uploadAllFiles" class="btn-upload-all mt-4" :disabled="uploading">
            <i v-if="!uploading" class="ph ph-upload"></i>
            <div v-else class="spinner"></div>
            {{ uploading ? 'Subiendo...' : 'Subir todos los archivos' }}
          </button>
        </div>

        <!-- Lista de archivos existentes -->
        <div class="existing-files">
          <h4 class="text-sm font-medium text-gray-300 mb-3">
            <i class="ph ph-archive mr-2"></i>
            Archivos existentes
          </h4>
          
          <div v-if="loading" class="text-center p-4 text-gray-400">
            Cargando archivos...
          </div>
          
          <div v-else-if="evidencias.length === 0" class="empty-state">
            <i class="ph ph-folder-open text-4xl text-gray-600 mb-2"></i>
            <p class="text-gray-400">No hay archivos para este cumplimiento</p>
          </div>
          
          <div v-else class="files-grid">
            <div v-for="evidencia in evidencias" :key="evidencia.EvidenciaID" class="file-card">
              <div class="file-card-header">
                <i :class="getFileIcon(evidencia.NombreArchivoOriginal)" class="text-3xl"></i>
                <div class="file-actions">
                  <button @click="viewFile(evidencia)" class="btn-action" title="Ver">
                    <i class="ph ph-eye"></i>
                  </button>
                  <button @click="downloadFile(evidencia)" class="btn-action" title="Descargar">
                    <i class="ph ph-download"></i>
                  </button>
                  <button @click="deleteFile(evidencia)" class="btn-action danger" title="Eliminar">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </div>
              
              <div class="file-card-body">
                <p class="file-name">{{ evidencia.NombreArchivoOriginal }}</p>
                <p class="file-info">
                  <span class="version">v{{ evidencia.Version || 1 }}</span>
                  <span class="separator">•</span>
                  <span class="size">{{ formatFileSize(evidencia.TamanoArchivoKB * 1024) }}</span>
                </p>
                <p class="file-date">
                  {{ formatDate(evidencia.FechaSubida) }}
                </p>
                <p v-if="evidencia.Descripcion" class="file-description">
                  {{ evidencia.Descripcion }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button @click="$emit('update:modelValue', false)" class="btn btn-secondary">
        Cerrar
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  cumplimientoId: { type: Number, required: true }
});

const emit = defineEmits(['update:modelValue', 'files-updated']);

const selectedFiles = ref([]);
const fileDescriptions = ref([]);
const fileExpiryDates = ref([]);
const evidencias = ref([]);
const loading = ref(false);
const uploading = ref(false);
const dragOver = ref(false);

function onFileSelect(event) {
  const files = Array.from(event.target.files);
  addFiles(files);
}

function handleDrop(event) {
  dragOver.value = false;
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
}

function addFiles(files) {
  files.forEach(file => {
    selectedFiles.value.push(file);
    fileDescriptions.value.push('');
    fileExpiryDates.value.push('');
  });
}

function removeSelectedFile(index) {
  selectedFiles.value.splice(index, 1);
  fileDescriptions.value.splice(index, 1);
  fileExpiryDates.value.splice(index, 1);
}

async function uploadAllFiles() {
  if (selectedFiles.value.length === 0) return;
  
  uploading.value = true;
  const token = localStorage.getItem('token');
  let successCount = 0;
  
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];
    const description = fileDescriptions.value[i];
    const expiryDate = fileExpiryDates.value[i];
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('descripcion', description);
    if (expiryDate) {
      formData.append('fecha_vigencia', expiryDate);
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/cumplimiento/${props.cumplimientoId}/evidencia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        successCount++;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  
  uploading.value = false;
  
  if (successCount > 0) {
    alert(`${successCount} de ${selectedFiles.value.length} archivos subidos exitosamente`);
    selectedFiles.value = [];
    fileDescriptions.value = [];
    fileExpiryDates.value = [];
    loadEvidencias();
    emit('files-updated');
  }
}

async function loadEvidencias() {
  loading.value = true;
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/cumplimiento/${props.cumplimientoId}/evidencias`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      evidencias.value = await response.json();
    }
  } catch (error) {
    console.error('Error loading evidencias:', error);
  } finally {
    loading.value = false;
  }
}

async function viewFile(evidencia) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.EvidenciaID}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

async function downloadFile(evidencia) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.EvidenciaID}?download=true`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = evidencia.NombreArchivoOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

async function deleteFile(evidencia) {
  if (!confirm(`¿Eliminar ${evidencia.NombreArchivoOriginal}?`)) return;
  
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.EvidenciaID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    loadEvidencias();
    emit('files-updated');
  }
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'ph ph-file-pdf text-red-400';
  if (['xls', 'xlsx'].includes(ext)) return 'ph ph-file-xls text-green-400';
  if (['doc', 'docx'].includes(ext)) return 'ph ph-file-doc text-blue-400';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'ph ph-file-image text-purple-400';
  if (['zip', 'rar', '7z'].includes(ext)) return 'ph ph-file-zip text-yellow-400';
  return 'ph ph-file text-gray-400';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadEvidencias();
  }
});
</script>

<style scoped>
.upload-zone {
  margin-bottom: 2rem;
}

.upload-drop-zone {
  border: 2px dashed #4b5563;
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #111827;
}

.upload-drop-zone:hover {
  border-color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.05);
}

.upload-drop-zone.drag-over {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.selected-files {
  background-color: #1f2937;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #374151;
}

.file-item {
  background-color: #111827;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #374151;
}

.file-description-input {
  width: 100%;
  background-color: #1f2937;
  border: 1px solid #374151;
  color: #e5e7eb;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.file-date-input {
  width: 100%;
  background-color: #1f2937;
  border: 1px solid #374151;
  color: #e5e7eb;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-size: 0.875rem;
}

.btn-remove {
  padding: 0.5rem;
  color: #f87171;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.btn-remove:hover {
  background-color: rgba(239, 68, 68, 0.2);
}

.btn-upload-all {
  width: 100%;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-upload-all:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn-upload-all:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.existing-files {
  background-color: #1f2937;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #374151;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.file-card {
  background-color: #111827;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.file-card:hover {
  border-color: #4b5563;
  transform: translateY(-2px);
}

.file-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-action {
  padding: 0.375rem;
  color: #9ca3af;
  background-color: transparent;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-action:hover {
  background-color: #374151;
  color: #60a5fa;
}

.btn-action.danger:hover {
  color: #f87171;
}

.file-name {
  font-weight: 500;
  color: #e5e7eb;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.version {
  background-color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.separator {
  color: #4b5563;
}

.file-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-description {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
}

.btn-secondary:hover {
  background-color: #4b5563;
}
</style>