<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-white">Gestión de Evidencias</h3>
    </template>
    
    <template #default>
      <div v-if="loading" class="text-center p-4 text-gray-400">Cargando historial de evidencias...</div>
      <div v-else-if="error" class="text-center p-4 text-red-400">{{ error }}</div>
      <div v-else class="space-y-6">
        <div>
          <h4 class="font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <i class="ph ph-cloud-arrow-up text-blue-400"></i>
            Subir Nueva Evidencia
          </h4>
          <div class="upload-container">
            <!-- Evidencia de Acciones -->
            <div class="mb-4">
                <label for="evidencia" class="block text-sm font-medium text-gray-400 mb-2">Evidencia de Acciones</label>
                <input id="file-upload" ref="fileInputRef" type="file" class="sr-only" 
                       accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.zip,.rar,.7z,.tar,.gz,.xml,.json,.log" 
                       @change="onFileChange">
                <span class="ml-4 text-sm text-gray-400" v-if="selectedFile">{{ selectedFile.name }}</span>
            </div>

            <!-- Botón de Gestionar Archivos -->
            <div class="mb-6">
                <label for="file-upload" class="inline-flex items-center justify-center h-10 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition duration-200 cursor-pointer">
                    <i class="fas fa-folder-open text-sm mr-2"></i>
                    Gestionar Archivos y Versiones
                </label>
            </div>
            
            <!-- Campos mejorados con indicadores visuales -->
            <div class="form-fields-container" v-if="selectedFile">
              <div class="form-field">
                <label class="form-label">
                  <i class="ph ph-text-align-left text-blue-400"></i>
                  Descripción del archivo
                  <span class="required-indicator">*</span>
                </label>
                <div class="input-wrapper">
                  <textarea autocomplete="off" v-model="descripcionArchivo" 
                    class="form-textarea"
                    :class="{ 'is-filled': descripcionArchivo.length > 0 }"
                    rows="3"
                    placeholder="Explica brevemente qué información contiene este archivo y para qué sirve como respaldo..."
                    @input="updateProgress"
                  ></textarea>
                  <div class="char-counter" :class="{ 'warning': descripcionArchivo.length > 200 }">
                    {{ descripcionArchivo.length }}/250 caracteres
                  </div>
                </div>
              </div>
            
              <div class="form-field">
                <label class="form-label">
                  <i class="ph ph-calendar-check text-blue-400"></i>
                  Fecha de vigencia
                  <span class="required-indicator">*</span>
                </label>
                <div class="input-wrapper">
                  <input autocomplete="off" type="date" 
                    v-model="fechaVigencia"
                    class="form-input date-input"
                    :class="{ 'is-filled': fechaVigencia }"
                    :min="minDate"
                    @change="updateProgress"
                  >
                  <div class="date-helper">
                    <i class="ph ph-info text-xs"></i>
                    <span>Indica hasta cuándo la información de este documento será válida</span>
                  </div>
                </div>
              </div>
              
              <!-- Indicador de progreso -->
              <div class="progress-indicator">
                <div class="progress-header">
                  <span class="text-xs font-medium text-gray-400">Completitud del formulario</span>
                  <span class="text-xs font-bold" :class="getProgressColor">{{ formProgress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: formProgress + '%' }" :class="getProgressColor"></div>
                </div>
              </div>
            </div>
            
            <button 
              @click="subirNuevoArchivo" 
              class="upload-button"
              :class="{ 'is-ready': isFormValid, 'is-uploading': uploading }"
              :disabled="uploading || !isFormValid"
            >
              <i v-if="!uploading" class="ph ph-cloud-arrow-up"></i>
              <div v-else class="spinner"></div>
              <span>{{ uploading ? 'Subiendo archivo...' : 'Subir Evidencia' }}</span>
            </button>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold text-gray-300 mb-2">Historial de Versiones</h4>
          <div v-if="evidencias.length > 0" class="space-y-2">
            <div v-for="evidencia in evidencias" :key="evidencia.EvidenciaID" class="historial-item">
              <div v-if="evidenciaEditando?.EvidenciaID === evidencia.EvidenciaID" class="edit-form">
                <!-- Formulario de edición -->
                <div class="edit-header">
                  <i :class="getFileIcon(evidencia.NombreArchivoOriginal)" class="text-xl"></i>
                  <div>
                    <p class="font-medium text-white">{{ evidencia.NombreArchivoOriginal }}</p>
                    <p class="text-xs text-gray-400">Editando versión {{ evidencia.Version }}</p>
                  </div>
                </div>
                
                <div class="edit-fields">
                  <div class="edit-field">
                    <label class="edit-label">Descripción</label>
                    <textarea autocomplete="off" v-model="editandoDescripcion" 
                      class="edit-textarea"
                      rows="2"
                      placeholder="Descripción del archivo..."
                    ></textarea>
                  </div>
                  
                  <div class="edit-field">
                    <label class="edit-label">Fecha de vigencia</label>
                    <input autocomplete="off" type="date" 
                      v-model="editandoFechaVigencia"
                      class="edit-input"
                      :min="minDate"
                    >
                  </div>
                </div>
                
                <div class="edit-actions flex gap-2 mt-3">
                  <button @click="guardarEdicion(evidencia)" class="inline-flex items-center justify-center h-8 px-3 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-md transition duration-200">
                    <i class="fas fa-check text-xs mr-1"></i> Guardar
                  </button>
                  <button @click="cancelarEdicion" class="inline-flex items-center justify-center h-8 px-3 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-md transition duration-200">
                    <i class="fas fa-times text-xs mr-1"></i> Cancelar
                  </button>
                </div>
              </div>
              
              <div v-else class="evidencia-normal">
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
                      Subido por {{ evidencia.UsuarioQueSubio }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <button @click="visualizarEvidencia(evidencia)" class="inline-flex items-center justify-center w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-md transition duration-200" title="Ver archivo">
                    <i class="fas fa-eye text-sm"></i>
                  </button>
                  <button @click="descargarEvidencia(evidencia)" class="inline-flex items-center justify-center w-8 h-8 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-md transition duration-200" title="Descargar">
                    <i class="fas fa-download text-sm"></i>
                  </button>
                  <button @click="editarEvidencia(evidencia)" class="inline-flex items-center justify-center w-8 h-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-md transition duration-200" title="Editar">
                    <i class="fas fa-edit text-sm"></i>
                  </button>
                  <button @click="eliminarEvidencia(evidencia.EvidenciaID)" class="inline-flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition duration-200" title="Eliminar">
                    <i class="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 p-4 border border-gray-700 rounded-lg">
            No hay evidencias para este ítem.
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
import { ref, watch, computed } from 'vue';
import Modal from './Modal.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  cumplimientoId: { type: Number, default: null }
});
const emit = defineEmits(['update:modelValue', 'gestion-finalizada']);

const evidencias = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);
const fileInputRef = ref(null);
const descripcionArchivo = ref('');
const fechaVigencia = ref('');
const visorModal = ref(false);
const archivoVisualizando = ref(null);
const evidenciaEditando = ref(null);
const editandoDescripcion = ref('');
const editandoFechaVigencia = ref('');

// Computed properties para el formulario mejorado
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const formProgress = computed(() => {
  let progress = 0;
  if (selectedFile.value) progress += 33;
  if (descripcionArchivo.value.length >= 10) progress += 33;
  if (fechaVigencia.value) progress += 34;
  return progress;
});

const getProgressColor = computed(() => {
  if (formProgress.value < 50) return 'text-red-400';
  if (formProgress.value < 100) return 'text-yellow-400';
  return 'text-green-400';
});

const isFormValid = computed(() => {
  return selectedFile.value && 
         descripcionArchivo.value.length >= 10 && 
         descripcionArchivo.value.length <= 250 &&
         fechaVigencia.value;
});

async function cargarEvidencias() {
  if (!props.cumplimientoId) return;
  loading.value = true;
  error.value = null;
  try {
    console.log(`🔍 Cargando evidencias para cumplimiento: ${props.cumplimientoId}`);
    
    // Usar endpoint con autenticación
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/admin/cumplimiento/${props.cumplimientoId}/evidencias`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || 'Error al cargar evidencias');
    }
    
    const data = await response.json();
    evidencias.value = Array.isArray(data) ? data : [];
    console.log(`✅ Evidencias cargadas: ${evidencias.value.length} archivos`);
  } catch (e) {
    console.error('❌ Error cargando evidencias:', e);
    error.value = `No se pudieron cargar las evidencias: ${e.message}`;
  } finally {
    loading.value = false;
  }
}

function onFileChange(event) {
  selectedFile.value = event.target.files[0];
  updateProgress();
}

function clearFile() {
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
  updateProgress();
}

function updateProgress() {
  // El progreso se actualiza automáticamente vía computed property
}

function getFileIcon(filename) {
  if (!filename) return 'ph ph-file text-gray-400';
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

function previewSelectedFile() {
  console.log('🔍 previewSelectedFile llamada - archivo local');
  console.log('📄 selectedFile.value:', selectedFile.value);
  
  if (!selectedFile.value) {
    console.log('❌ No hay archivo seleccionado');
    alert('No hay archivo seleccionado');
    return;
  }
  
  const fileExt = selectedFile.value.name.split('.').pop().toLowerCase();
  console.log('📄 Archivo:', selectedFile.value.name, 'Extensión:', fileExt);
  
  // Verificar que es un archivo válido
  if (!selectedFile.value.size || selectedFile.value.size === 0) {
    console.log('❌ Archivo vacío o inválido');
    alert('El archivo seleccionado está vacío o es inválido');
    return;
  }
  
  console.log('✅ Procesando archivo local - NO debe llamar al servidor');
  
  try {
    // Para archivos visualizables, crear preview usando el archivo local
    if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExt)) {
      console.log('🖼️ Creando vista previa para imagen/PDF');
      const url = URL.createObjectURL(selectedFile.value);
      console.log('🔗 URL creada:', url);
      
      const newWindow = window.open('', '_blank');
      
      if (!newWindow) {
        alert('Por favor, permite ventanas emergentes para ver la vista previa del archivo.');
        URL.revokeObjectURL(url);
        return;
      }
      
      console.log('🪟 Ventana creada, escribiendo HTML');
      
      // Crear página HTML con el archivo embebido
      newWindow.document.write(`
        <html>
          <head>
            <title>Vista previa: ${selectedFile.value.name}</title>
            <meta charset="UTF-8">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #1f2937; 
                color: #e5e7eb; 
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                min-height: 100vh;
              }
              .header {
                background: #374151;
                padding: 15px;
                margin: -20px -20px 20px -20px;
                border-bottom: 2px solid #4f46e5;
                position: sticky;
                top: 0;
                z-index: 10;
              }
              .content {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
              }
              iframe, img {
                max-width: 100%;
                max-height: 80vh;
                border: 1px solid #374151;
                border-radius: 8px;
              }
              .file-info {
                font-size: 12px;
                color: #9ca3af;
                margin-top: 5px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h3 style="margin: 0; color: #60a5fa;">📄 Vista previa: ${selectedFile.value.name}</h3>
              <div class="file-info">
                Tamaño: ${formatFileSize(selectedFile.value.size)} | Tipo: ${fileExt.toUpperCase()}
              </div>
            </div>
            <div class="content">
              ${fileExt === 'pdf' ? 
                `<iframe src="${url}" width="100%" height="600px" type="application/pdf"></iframe>` :
                `<img src="${url}" alt="Vista previa de ${selectedFile.value.name}" />`
              }
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
      
      console.log('✅ Vista previa creada exitosamente');
      
      // Limpiar el URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log('🧹 URL limpiada');
      }, 300000); // 5 minutos
      
    } else if (['txt', 'json', 'xml', 'csv', 'log', 'md', 'js', 'css', 'html', 'py', 'sql'].includes(fileExt)) {
      console.log('📝 Procesando archivo de texto');
      
      // Para archivos de texto, mostrar contenido
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('📖 Archivo leído exitosamente');
        const content = e.target.result;
        const newWindow = window.open('', '_blank');
        
        if (!newWindow) {
          alert('Por favor, permite ventanas emergentes para ver la vista previa del archivo.');
          return;
        }
        
        // Detectar si es JSON para formatear
        let formattedContent = content;
        if (fileExt === 'json') {
          try {
            const parsed = JSON.parse(content);
            formattedContent = JSON.stringify(parsed, null, 2);
          } catch (e) {
            // Si no es JSON válido, mostrar como texto normal
          }
        }
        
        newWindow.document.write(`
          <html>
            <head>
              <title>Vista previa: ${selectedFile.value.name}</title>
              <meta charset="UTF-8">
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  padding: 20px; 
                  background: #1f2937; 
                  color: #e5e7eb; 
                  margin: 0;
                  line-height: 1.5;
                }
                .header {
                  background: #374151;
                  padding: 15px;
                  margin: -20px -20px 20px -20px;
                  border-bottom: 2px solid #4f46e5;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                }
                .content {
                  background: #111827;
                  padding: 20px;
                  border-radius: 8px;
                  border: 1px solid #374151;
                  margin-top: 20px;
                }
                pre { 
                  white-space: pre-wrap; 
                  word-wrap: break-word; 
                  font-size: 14px;
                  margin: 0;
                  max-height: 70vh;
                  overflow-y: auto;
                }
                .file-info {
                  font-size: 12px;
                  color: #9ca3af;
                  margin-top: 5px;
                }
                .truncated {
                  color: #fbbf24;
                  font-style: italic;
                  margin-top: 10px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h3 style="margin: 0; color: #60a5fa;">📄 Vista previa: ${selectedFile.value.name}</h3>
                <div class="file-info">
                  Tamaño: ${formatFileSize(selectedFile.value.size)} | Tipo: ${fileExt.toUpperCase()}
                </div>
              </div>
              <div class="content">
                <pre>${formattedContent.length > 100000 ? formattedContent.substring(0, 100000) : formattedContent}</pre>
                ${formattedContent.length > 100000 ? '<div class="truncated">... (archivo truncado para visualización - mostrando primeros 100KB)</div>' : ''}
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
        console.log('✅ Vista previa de texto creada exitosamente');
      };
      reader.onerror = () => {
        console.error('❌ Error al leer el archivo');
        alert('Error al leer el archivo');
      };
      reader.readAsText(selectedFile.value);
      
    } else if (['docx', 'xlsx', 'pptx'].includes(fileExt)) {
      alert(`📄 Archivo de Office detectado: ${selectedFile.value.name}\\n\\n⚠️ Los archivos de Microsoft Office no se pueden mostrar directamente en el navegador.\\n\\nPuedes:\\n• Subirlo y descargarlo después para abrirlo\\n• Convertirlo a PDF para vista previa\\n• Usar una aplicación compatible`);
    } else {
      alert(`⚠️ Vista previa no disponible para archivos .${fileExt}\\n\\nTipos soportados:\\n• Imágenes: JPG, PNG, GIF, BMP, WEBP\\n• Documentos: PDF\\n• Texto: TXT, JSON, XML, CSV, LOG, MD\\n• Código: JS, CSS, HTML, PY, SQL\\n\\nPara otros tipos, sube el archivo y úsalo normalmente.`);
    }
  } catch (error) {
    console.error('❌ Error en vista previa:', error);
    alert('Error al mostrar la vista previa del archivo: ' + error.message);
  }
}

async function subirNuevoArchivo() {
  if (!selectedFile.value) {
    alert('Por favor, seleccione un archivo primero.');
    return;
  }
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('descripcion', descripcionArchivo.value);
  formData.append('fecha_vigencia', fechaVigencia.value);
  try {
    console.log(`📤 Subiendo archivo para cumplimiento: ${props.cumplimientoId}`);
    
    // Usar endpoint con autenticación
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/admin/cumplimiento/${props.cumplimientoId}/evidencia`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido al subir.');
    
    alert(result.message || 'Archivo subido exitosamente');
    selectedFile.value = null;
    descripcionArchivo.value = '';
    fechaVigencia.value = '';
    if (fileInputRef.value) fileInputRef.value.value = '';
    await cargarEvidencias();
    emit('gestion-finalizada');
  } catch(e) {
    alert(`Error al subir el archivo: ${e.message}`);
  } finally {
    uploading.value = false;
  }
}

async function eliminarEvidencia(evidenciaId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia? Esta acción es irreversible.')) return;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidenciaId}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al eliminar');
        alert(result.message);
        await cargarEvidencias();
        emit('gestion-finalizada');
    } catch(e) {
        alert(`Error: ${e.message}`);
    }
}

function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(isoString).toLocaleString('es-CL', options);
}

async function visualizarEvidencia(evidencia) {
  console.log('🔍 visualizarEvidencia llamada para:', evidencia);
  const token = localStorage.getItem('token');
  const fileExt = evidencia.NombreArchivoOriginal.split('.').pop().toLowerCase();
  
  try {
    // Para PDFs e imágenes, abrir en nueva pestaña
    if (['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      console.log('🖼️ Procesando imagen/PDF desde servidor');
      
      // Intentar primero con autenticación
      let response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.EvidenciaID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Si falla, usar endpoint temporal
      if (!response.ok) {
        console.log('⚠️ Autenticación falló, usando endpoint temporal');
        response = await fetch(`http://localhost:5000/api/admin/evidencia-temp/${evidencia.EvidenciaID}`);
      }
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Limpiar el URL después de un tiempo
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        alert('No se pudo visualizar el archivo: ' + errorText);
      }
    } else {
      console.log('📄 Procesando descarga desde servidor');
      
      // Intentar descarga con autenticación
      let response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.EvidenciaID}?download=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Si falla, usar endpoint temporal
      if (!response.ok) {
        console.log('⚠️ Autenticación falló, usando endpoint temporal');
        response = await fetch(`http://localhost:5000/api/admin/evidencia-temp/${evidencia.EvidenciaID}?download=true`);
      }
      
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
      } else {
        const errorText = await response.text();
        console.error('❌ Error en descarga:', errorText);
        alert('No se pudo descargar el archivo: ' + errorText);
      }
    }
  } catch (error) {
    console.error('❌ Error visualizando evidencia:', error);
    alert('Error al visualizar el archivo: ' + error.message);
  }
}

async function descargarEvidencia(evidencia) {
  const token = localStorage.getItem('token');
  
  try {
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
    } else {
      alert('No se pudo descargar el archivo');
    }
  } catch (error) {
    console.error('Error descargando evidencia:', error);
    alert('Error al descargar el archivo');
  }
}

function editarEvidencia(evidencia) {
  evidenciaEditando.value = evidencia;
  editandoDescripcion.value = evidencia.Descripcion || '';
  editandoFechaVigencia.value = evidencia.FechaVigencia ? formatDateForInput(evidencia.FechaVigencia) : '';
}

function cancelarEdicion() {
  evidenciaEditando.value = null;
  editandoDescripcion.value = '';
  editandoFechaVigencia.value = '';
}

async function guardarEdicion(evidencia) {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.EvidenciaID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descripcion: editandoDescripcion.value,
        fecha_vigencia: editandoFechaVigencia.value
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      alert(result.message || 'Evidencia actualizada correctamente');
      
      // Actualizar la evidencia en la lista local
      const index = evidencias.value.findIndex(e => e.EvidenciaID === evidencia.EvidenciaID);
      if (index !== -1) {
        evidencias.value[index].Descripcion = editandoDescripcion.value;
        evidencias.value[index].FechaVigencia = editandoFechaVigencia.value;
      }
      
      cancelarEdicion();
      emit('gestion-finalizada');
    } else {
      const errorData = await response.json();
      alert('Error al actualizar: ' + (errorData.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error guardando edición:', error);
    alert('Error al guardar los cambios');
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL');
}

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.cumplimientoId) {
    cargarEvidencias();
  }
});
</script>

<style scoped>
/* Estilos base existentes */
.historial-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0.75rem; 
  background-color: #2d3748; 
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.historial-item:hover {
  background-color: #374151;
}
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; }
.btn-secondary { background-color: #374151; border: 1px solid #4b5563; color: #d1d5db; }
.btn-icon { padding: 0.5rem; background-color: #4b5563; color: #d1d5db; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-icon:hover { background-color: #374151; }
.btn-danger { color: #fca5a5; }
.btn-danger:hover { background-color: #ef4444; color: white; }

/* Nuevos estilos para el formulario mejorado */
.upload-container {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 1.5rem;
  space-y: 1.5rem;
}

.file-upload-section {
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.file-upload-label {
  display: block;
  width: 100%;
  min-height: 120px;
  background-color: #111827;
  border: 2px dashed #4b5563;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.file-upload-label:hover {
  border-color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.05);
}

.file-upload-section.has-file .file-upload-label {
  border-style: solid;
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 1.5rem;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  min-height: 120px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-details p {
  margin: 0;
}

.file-actions {
  margin-top: 0.5rem;
}

.file-actions-external {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
}

.preview-button {
  background-color: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.preview-button:hover {
  background-color: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-1px);
}

.preview-button i {
  font-size: 0.875rem;
}

.remove-file {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-file:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.form-fields-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e7eb;
}

.form-label i {
  font-size: 1rem;
}

.required-indicator {
  color: #f87171;
  font-weight: bold;
  margin-left: 0.25rem;
}

.input-wrapper {
  position: relative;
}

.form-textarea, .form-input {
  width: 100%;
  background-color: #1f2937;
  border: 2px solid #374151;
  color: #e5e7eb;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-textarea:focus, .form-input:focus {
  outline: none;
  border-color: #60a5fa;
  background-color: #111827;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.form-textarea.is-filled, .form-input.is-filled {
  border-color: #10b981;
}

.char-counter {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 0.75rem;
  color: #6b7280;
  transition: color 0.2s;
}

.char-counter.warning {
  color: #fbbf24;
}

.date-input {
  cursor: pointer;
}

.date-helper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-indicator {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #111827;
  border-radius: 0.5rem;
  border: 1px solid #374151;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background-color: #374151;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #ef4444;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.progress-fill.text-yellow-400 {
  background-color: #fbbf24;
}

.progress-fill.text-green-400 {
  background-color: #10b981;
}

.upload-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  background-color: #374151;
  color: #9ca3af;
  margin-top: 1.5rem;
}

.upload-button.is-ready {
  background-color: #4f46e5;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
}

.upload-button.is-ready:hover:not(:disabled) {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -2px rgba(79, 70, 229, 0.4);
}

.upload-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-button.is-uploading {
  background-color: #4f46e5;
  color: white;
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

/* Estilos para formulario de edición de evidencias */
.edit-form {
  background-color: #111827;
  border: 2px solid #4f46e5;
  border-radius: 0.5rem;
  padding: 1rem;
  animation: fadeIn 0.3s ease-in;
}

.edit-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #374151;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
}

.edit-textarea, .edit-input {
  background-color: #1f2937;
  border: 1px solid #4b5563;
  color: #e5e7eb;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.edit-textarea:focus, .edit-input:focus {
  outline: none;
  border-color: #60a5fa;
}

.edit-textarea {
  resize: vertical;
  min-height: 3rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-save, .btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.btn-save {
  background-color: #10b981;
  color: white;
}

.btn-save:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.btn-cancel {
  background-color: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background-color: #4b5563;
}

.btn-edit {
  color: #fbbf24 !important;
}

.btn-edit:hover {
  background-color: rgba(251, 191, 36, 0.1) !important;
}

.evidencia-normal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>