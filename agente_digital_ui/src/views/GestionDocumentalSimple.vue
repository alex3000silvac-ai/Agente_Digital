<template>
  <div class="gestion-documental">
    <!-- Header Moderno -->
    <div class="header-container">
      <router-link :to="`/gestion/inquilinos/${inquilinoId}/empresas`" class="btn-back">
        <i class="ph ph-arrow-left"></i>
        <span>Volver</span>
      </router-link>
      
      <div class="header-main">
        <div class="header-icon">
          <i class="ph ph-folders"></i>
        </div>
        <div class="header-content">
          <h1>Gestión Documental</h1>
          <p>Repositorio seguro de documentos ANCI</p>
        </div>
      </div>
    </div>

    <!-- Info de la empresa -->
    <div v-if="empresa" class="empresa-card">
      <div class="empresa-info">
        <h3>{{ empresa.RazonSocial }}</h3>
        <span class="empresa-rut">RUT: {{ empresa.RUT }}</span>
      </div>
      <div class="empresa-tipo">
        <span class="badge-tipo" :class="`tipo-${empresa.TipoEmpresa?.toLowerCase()}`">
          {{ empresa.TipoEmpresa }}
        </span>
      </div>
    </div>

    <!-- Navegación de Carpetas -->
    <div class="carpetas-container">
      <h2 class="section-title">Carpetas ANCI</h2>
      <div class="carpetas-grid">
        <div 
          v-for="carpeta in carpetas" 
          :key="carpeta.id"
          class="carpeta-item"
          :class="{ 'active': carpetaActiva === carpeta.id }"
          @click="seleccionarCarpeta(carpeta)"
        >
          <div class="carpeta-numero">{{ carpeta.numero }}</div>
          <div class="carpeta-info">
            <h4>{{ carpeta.nombre }}</h4>
            <span class="carpeta-archivos">{{ carpeta.archivos || 0 }} archivos</span>
          </div>
          <i class="ph ph-caret-right carpeta-arrow"></i>
        </div>
      </div>
    </div>

    <!-- Panel de Documentos -->
    <div v-if="carpetaActiva" class="documentos-panel">
      <div class="panel-header">
        <div class="panel-title">
          <h2>{{ carpetaSeleccionada.nombre }}</h2>
          <p class="panel-subtitle">Carpeta {{ carpetaSeleccionada.numero }}</p>
        </div>
        <button class="btn-primary" @click="mostrarModalSubir">
          <i class="ph ph-upload-simple"></i>
          Subir Archivo
        </button>
      </div>

      <!-- Lista de Archivos -->
      <div class="archivos-container">
        <div v-if="cargandoArchivos" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando archivos...</p>
        </div>

        <div v-else-if="archivos.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="ph ph-folder-open"></i>
          </div>
          <h3>No hay archivos en esta carpeta</h3>
          <p>Comienza subiendo tu primer documento</p>
          <button class="btn-primary" @click="mostrarModalSubir">
            <i class="ph ph-upload-simple"></i>
            Subir Archivo
          </button>
        </div>

        <div v-else class="archivos-grid">
          <div v-for="archivo in archivos" :key="archivo.id" class="archivo-card">
            <div class="archivo-icon">
              <i :class="getIconoArchivo(archivo.extension)"></i>
            </div>
            <div class="archivo-info">
              <h4 class="archivo-nombre">{{ archivo.nombre }}</h4>
              <p class="archivo-comentario">{{ archivo.comentario || 'Sin comentario' }}</p>
              <div class="archivo-meta">
                <span><i class="ph ph-calendar"></i> {{ formatearFecha(archivo.fechaSubida) }}</span>
                <span><i class="ph ph-clock"></i> {{ formatearHora(archivo.fechaSubida) }}</span>
              </div>
            </div>
            <div class="archivo-actions">
              <button class="btn-action" @click="descargarArchivo(archivo)" :title="archivo.nombre.match(/\.(png|jpg|jpeg|gif|bmp)$/i) ? 'Ver imagen' : 'Descargar'">
                <i :class="archivo.nombre.match(/\.(png|jpg|jpeg|gif|bmp)$/i) ? 'ph ph-eye' : 'ph ph-download-simple'"></i>
              </button>
              <button class="btn-action" @click="editarComentario(archivo)" title="Editar comentario">
                <i class="ph ph-pencil-simple"></i>
              </button>
              <button class="btn-action danger" @click="eliminarArchivo(archivo)" title="Eliminar">
                <i class="ph ph-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Subir Archivo -->
    <transition name="modal">
      <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Subir Archivo</h3>
            <button class="btn-close" @click="cerrarModal">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <form @submit.prevent="subirArchivo" class="upload-form">
            <!-- Zona de Drop -->
            <div 
              class="drop-zone"
              :class="{ 'dragging': isDragging }"
              @drop="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
            >
              <input 
                type="file" 
                ref="fileInput" 
                @change="handleFileSelect"
                hidden
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.bmp,.zip,.rar,.txt"
              >
              
              <div v-if="!archivoSeleccionado" class="drop-content" @click="$refs.fileInput.click()">
                <i class="ph ph-cloud-arrow-up"></i>
                <h4>Arrastra tu archivo aquí</h4>
                <p>o haz clic para seleccionar</p>
                <span class="file-formats">PDF, DOC, XLS, PNG, JPG, ZIP, TXT (máx. 25MB)</span>
              </div>
              
              <div v-else class="file-preview">
                <i :class="getIconoArchivo(archivoSeleccionado.name.split('.').pop())"></i>
                <div class="file-info">
                  <p class="file-name">{{ archivoSeleccionado.name }}</p>
                  <p class="file-size">{{ formatearTamano(archivoSeleccionado.size) }}</p>
                </div>
                <button type="button" class="btn-remove" @click="archivoSeleccionado = null">
                  <i class="ph ph-x"></i>
                </button>
              </div>
            </div>

            <!-- Subcarpeta (si aplica) -->
            <div v-if="tieneSubcarpetas" class="form-group">
              <label>Subcarpeta</label>
              <select v-model="formData.subcarpeta" class="form-select">
                <option value="">Carpeta principal</option>
                <option v-for="sub in subcarpetas" :key="sub.id" :value="sub.id">
                  {{ sub.nombre }}
                </option>
              </select>
            </div>

            <!-- Comentario -->
            <div class="form-group">
              <label>Comentario</label>
              <textarea 
                v-model="formData.comentario" 
                class="form-textarea"
                rows="3"
                placeholder="Agrega un comentario sobre este archivo..."
              ></textarea>
            </div>

            <!-- Botones -->
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="cerrarModal">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="!archivoSeleccionado || subiendo">
                <span v-if="subiendo">
                  <i class="ph ph-circle-notch spinning"></i>
                  Subiendo...
                </span>
                <span v-else>
                  <i class="ph ph-upload-simple"></i>
                  Subir Archivo
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal Editar Comentario -->
    <transition name="modal">
      <div v-if="mostrarModalEditar" class="modal-overlay" @click.self="cerrarModalEditar">
        <div class="modal-container modal-small">
          <div class="modal-header">
            <h3>Editar Comentario</h3>
            <button class="btn-close" @click="cerrarModalEditar">
              <i class="ph ph-x"></i>
            </button>
          </div>

          <form @submit.prevent="guardarComentario" class="edit-form">
            <div class="form-group">
              <label>Archivo</label>
              <input type="text" :value="archivoEditando?.nombre" class="form-input" disabled>
            </div>

            <div class="form-group">
              <label>Comentario</label>
              <textarea 
                v-model="comentarioEditado" 
                class="form-textarea"
                rows="3"
                placeholder="Agrega un comentario sobre este archivo..."
                autofocus
              ></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="cerrarModalEditar">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                <i class="ph ph-check"></i>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../services/api';
import Swal from 'sweetalert2';

const route = useRoute();
const inquilinoId = route.params.inquilinoId;
const empresaId = route.params.empresaId;

// Estado
const empresa = ref(null);
const carpetas = ref([
  { id: 1, numero: '00', nombre: 'Configuración del Sistema', archivos: 0 },
  { id: 2, numero: '01', nombre: 'Registro ANCI', archivos: 0 },
  { id: 3, numero: '02', nombre: 'Clasificación Entidad', archivos: 0 },
  { id: 4, numero: '03', nombre: 'Gobernanza y Seguridad', archivos: 0 },
  { id: 5, numero: '04', nombre: 'Gestión de Incidentes', archivos: 0 },
  { id: 6, numero: '05', nombre: 'Contratos con Terceros', archivos: 0 },
  { id: 7, numero: '06', nombre: 'Certificaciones', archivos: 0 },
  { id: 8, numero: '07', nombre: 'Auditorías y Evidencias', archivos: 0 },
  { id: 9, numero: '08', nombre: 'Capacitación del Personal', archivos: 0 },
  { id: 10, numero: '09', nombre: 'Continuidad del Negocio', archivos: 0 },
  { id: 11, numero: '10', nombre: 'Comunicación ANCI', archivos: 0 },
  { id: 12, numero: '11', nombre: 'Respaldos Históricos', archivos: 0 }
]);

const carpetaActiva = ref(null);
const archivos = ref([]);
const cargandoArchivos = ref(false);

// Modal Subir
const mostrarModal = ref(false);
const archivoSeleccionado = ref(null);
const isDragging = ref(false);
const subiendo = ref(false);
const formData = ref({
  subcarpeta: '',
  comentario: ''
});

// Modal Editar
const mostrarModalEditar = ref(false);
const archivoEditando = ref(null);
const comentarioEditado = ref('');

// Computed
const carpetaSeleccionada = computed(() => {
  return carpetas.value.find(c => c.id === carpetaActiva.value) || {};
});

const tieneSubcarpetas = computed(() => {
  // Solo algunas carpetas tienen subcarpetas
  const carpetasConSub = [4, 5, 8, 10];
  return carpetasConSub.includes(carpetaActiva.value);
});

const subcarpetas = computed(() => {
  // Definir subcarpetas según la carpeta
  const subsPorCarpeta = {
    4: [ // Gobernanza
      { id: 1, nombre: 'Políticas' },
      { id: 2, nombre: 'Procedimientos' },
      { id: 3, nombre: 'SGSI' }
    ],
    5: [ // Incidentes
      { id: 1, nombre: 'Plan de Respuesta' },
      { id: 2, nombre: 'Incidentes Reportados' },
      { id: 3, nombre: 'Plantillas' }
    ],
    8: [ // Auditorías
      { id: 1, nombre: 'Auditorías Internas' },
      { id: 2, nombre: 'Auditorías Externas' },
      { id: 3, nombre: 'Simulacros' }
    ],
    10: [ // Continuidad
      { id: 1, nombre: 'BIA' },
      { id: 2, nombre: 'BCP' },
      { id: 3, nombre: 'DRP' }
    ]
  };
  
  return subsPorCarpeta[carpetaActiva.value] || [];
});

// Métodos
async function cargarEmpresa() {
  try {
    const response = await apiClient.get(`/gestion-documental/empresa/${empresaId}`);
    empresa.value = response.data;
    
    // Cargar conteo de archivos por carpeta
    await cargarConteoCarpetas();
  } catch (error) {
    console.error('Error cargando empresa:', error);
    // Manejar error silenciosamente si es un error de extensión
    if (error.message && error.message.includes('listener indicated an asynchronous response')) {
      console.log('Error de extensión del navegador detectado, ignorando...');
    }
  }
}

async function cargarConteoCarpetas() {
  try {
    const response = await apiClient.get(`/gestion-documental/carpetas/${empresaId}/conteo`);
    const conteos = response.data;
    
    // Actualizar conteo en carpetas
    carpetas.value.forEach(carpeta => {
      const conteo = conteos.find(c => c.carpeta_id === carpeta.id);
      carpeta.archivos = conteo ? conteo.total : 0;
    });
  } catch (error) {
    if (!error.message?.includes('listener indicated an asynchronous response')) {
      console.error('Error cargando conteo:', error);
    }
  }
}

function seleccionarCarpeta(carpeta) {
  carpetaActiva.value = carpeta.id;
  cargarArchivos();
}

async function cargarArchivos() {
  cargandoArchivos.value = true;
  try {
    const response = await apiClient.get(`/gestion-documental/archivos/${empresaId}/${carpetaActiva.value}`);
    archivos.value = response.data;
  } catch (error) {
    if (!error.message?.includes('listener indicated an asynchronous response')) {
      console.error('Error cargando archivos:', error);
    }
  } finally {
    cargandoArchivos.value = false;
  }
}

function mostrarModalSubir() {
  mostrarModal.value = true;
  formData.value = {
    subcarpeta: '',
    comentario: ''
  };
  archivoSeleccionado.value = null;
}

function cerrarModal() {
  mostrarModal.value = false;
  archivoSeleccionado.value = null;
  isDragging.value = false;
}

function handleDrop(e) {
  e.preventDefault();
  isDragging.value = false;
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    archivoSeleccionado.value = files[0];
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    archivoSeleccionado.value = files[0];
  }
}

async function subirArchivo() {
  if (!archivoSeleccionado.value) return;
  
  subiendo.value = true;
  const formDataUpload = new FormData();
  formDataUpload.append('archivo', archivoSeleccionado.value);
  formDataUpload.append('carpeta_id', carpetaActiva.value);
  formDataUpload.append('subcarpeta_id', formData.value.subcarpeta || '');
  formDataUpload.append('comentario', formData.value.comentario);
  
  try {
    await apiClient.post(`/gestion-documental/archivos/${empresaId}`, formDataUpload, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    Swal.fire({
      icon: 'success',
      title: 'Archivo Subido',
      text: 'El archivo se ha subido correctamente',
      showConfirmButton: false,
      timer: 1500,
      background: '#1a1d3a',
      color: '#ffffff'
    });
    
    cerrarModal();
    cargarArchivos();
    cargarConteoCarpetas();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo subir el archivo',
      background: '#1a1d3a',
      color: '#ffffff'
    });
  } finally {
    subiendo.value = false;
  }
}

async function descargarArchivo(archivo) {
  try {
    // Si es una imagen, mostrar en modal
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
    const extension = archivo.nombre.split('.').pop().toLowerCase();
    
    if (imageExtensions.includes(extension)) {
      await Swal.fire({
        title: archivo.nombre,
        imageUrl: `/api/gestion-documental/archivos/${archivo.id}/descargar`,
        imageAlt: archivo.nombre,
        width: '80%',
        showCloseButton: true,
        showConfirmButton: false,
        background: '#1a1d3a',
        color: '#ffffff'
      });
    } else {
      // Para otros archivos, descargar directamente
      const link = document.createElement('a');
      link.href = `/api/gestion-documental/archivos/${archivo.id}/descargar`;
      link.download = archivo.nombre;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo descargar el archivo',
      background: '#1a1d3a',
      color: '#ffffff'
    });
  }
}

function editarComentario(archivo) {
  archivoEditando.value = archivo;
  comentarioEditado.value = archivo.comentario || '';
  mostrarModalEditar.value = true;
}

function cerrarModalEditar() {
  mostrarModalEditar.value = false;
  archivoEditando.value = null;
  comentarioEditado.value = '';
}

async function guardarComentario() {
  try {
    await apiClient.put(`/gestion-documental/archivos/${archivoEditando.value.id}/comentario`, {
      comentario: comentarioEditado.value
    });
    
    Swal.fire({
      icon: 'success',
      title: 'Comentario Actualizado',
      showConfirmButton: false,
      timer: 1500,
      background: '#1a1d3a',
      color: '#ffffff'
    });
    
    cerrarModalEditar();
    cargarArchivos();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo actualizar el comentario',
      background: '#1a1d3a',
      color: '#ffffff'
    });
  }
}

async function eliminarArchivo(archivo) {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Eliminar archivo?',
    text: `¿Está seguro de eliminar "${archivo.nombre}"?`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    background: '#1a1d3a',
    color: '#ffffff'
  });
  
  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/gestion-documental/archivos/${archivo.id}`);
      
      Swal.fire({
        icon: 'success',
        title: 'Archivo Eliminado',
        showConfirmButton: false,
        timer: 1500,
        background: '#1a1d3a',
        color: '#ffffff'
      });
      
      cargarArchivos();
      cargarConteoCarpetas();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el archivo',
        background: '#1a1d3a',
        color: '#ffffff'
      });
    }
  }
}

// Utilidades
function getIconoArchivo(extension) {
  const iconos = {
    'pdf': 'ph ph-file-pdf',
    'doc': 'ph ph-file-doc',
    'docx': 'ph ph-file-doc',
    'xls': 'ph ph-file-xls',
    'xlsx': 'ph ph-file-xls',
    'png': 'ph ph-file-image',
    'jpg': 'ph ph-file-image',
    'jpeg': 'ph ph-file-image',
    'gif': 'ph ph-file-image',
    'bmp': 'ph ph-file-image',
    'zip': 'ph ph-file-zip',
    'rar': 'ph ph-file-zip',
    'txt': 'ph ph-file-text'
  };
  return iconos[extension?.toLowerCase()] || 'ph ph-file';
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatearHora(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatearTamano(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Lifecycle
onMounted(() => {
  cargarEmpresa();
  if (carpetas.value.length > 0) {
    seleccionarCarpeta(carpetas.value[0]);
  }
});
</script>

<style scoped>
/* Layout Base */
.gestion-documental {
  min-height: 100vh;
  background: #0f0f23;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  color: #ffffff;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Header */
.header-container {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: rgba(30, 33, 57, 0.4);
  border: 1px solid transparent;
}

.btn-back:hover {
  color: #ffffff;
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content p {
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
  font-size: 1.125rem;
}

/* Empresa Card */
.empresa-card {
  background: rgba(30, 33, 57, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.empresa-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.empresa-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: #ffffff;
}

.empresa-rut {
  color: #94a3b8;
  font-size: 0.875rem;
}

.badge-tipo {
  padding: 0.5rem 1.25rem;
  border-radius: 2rem;
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-tipo.tipo-oiv {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.3));
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-tipo.tipo-pse {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.3));
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Carpetas */
.carpetas-container {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #e0e7ff;
}

.carpetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.carpeta-item {
  background: rgba(30, 33, 57, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(42, 46, 90, 0.5);
  border-radius: 0.75rem;
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.carpeta-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  transition: left 0.5s;
}

.carpeta-item:hover {
  background: rgba(30, 33, 57, 0.9);
  border-color: #6366f1;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.carpeta-item:hover::before {
  left: 100%;
}

.carpeta-item.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  box-shadow: 
    inset 0 0 20px rgba(99, 102, 241, 0.2),
    0 0 0 2px rgba(99, 102, 241, 0.3);
}

.carpeta-numero {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  color: #a5b4fc;
  position: relative;
  overflow: hidden;
}

.carpeta-item.active .carpeta-numero {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.carpeta-info {
  flex: 1;
}

.carpeta-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.938rem;
  font-weight: 600;
  color: #ffffff;
}

.carpeta-archivos {
  font-size: 0.813rem;
  color: #94a3b8;
}

.carpeta-arrow {
  color: #6b7280;
  transition: transform 0.2s;
}

.carpeta-item:hover .carpeta-arrow {
  transform: translateX(4px);
  color: #a5b4fc;
}

/* Panel de Documentos */
.documentos-panel {
  background: rgba(21, 25, 50, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(42, 46, 90, 0.6);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(42, 46, 90, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 33, 57, 0.4);
}

.panel-title h2 {
  margin: 0;
  font-size: 1.375rem;
  color: #ffffff;
}

.panel-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Botones */
.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #7c7ff3, #9f7aea);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(135deg, #4b4e99, #6b4c99);
}

.btn-secondary {
  background: rgba(30, 33, 57, 0.8);
  color: #ffffff;
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
  transform: translateY(-1px);
}

/* Archivos */
.archivos-container {
  padding: 1.5rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  color: #6b7280;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #e0e7ff;
}

.empty-state p {
  color: #94a3b8;
  margin: 0 0 2rem 0;
  font-size: 0.95rem;
}

.archivos-grid {
  display: grid;
  gap: 1rem;
}

.archivo-card {
  background: rgba(30, 33, 57, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(42, 46, 90, 0.5);
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.archivo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.archivo-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
  background: rgba(30, 33, 57, 0.8);
}

.archivo-card:hover::before {
  transform: scaleX(1);
}

.archivo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #a5b4fc;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.archivo-card:hover .archivo-icon {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  border-color: rgba(99, 102, 241, 0.4);
  transform: scale(1.1);
}

.archivo-info {
  flex: 1;
  min-width: 0;
}

.archivo-nombre {
  margin: 0 0 0.25rem 0;
  font-size: 0.938rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #ffffff;
}

.archivo-comentario {
  color: #94a3b8;
  font-size: 0.813rem;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.archivo-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.archivo-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.archivo-meta i {
  font-size: 0.875rem;
}

.archivo-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  border: 1px solid rgba(42, 46, 90, 0.6);
  background: rgba(30, 33, 57, 0.8);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.125rem;
}

.btn-action:hover {
  color: #ffffff;
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  transform: scale(1.05);
}

.btn-action.danger:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(5px);
}

.modal-container {
  background: #1a1d3a;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-container.modal-small {
  max-width: 480px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(42, 46, 90, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 33, 57, 0.5);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #ffffff;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  background: rgba(30, 33, 57, 0.8);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Formularios */
.upload-form,
.edit-form {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  background: rgba(15, 15, 35, 0.8);
  border: 1px solid rgba(42, 46, 90, 0.6);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-select option {
  background: #1a1d3a;
  color: #ffffff;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: rgba(15, 15, 35, 1);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  background: rgba(99, 102, 241, 0.05);
}

.drop-zone:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.08);
}

.drop-zone.dragging {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.2);
}

.drop-content i {
  font-size: 3rem;
  color: #6366f1;
  margin-bottom: 1rem;
  display: block;
}

.drop-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #ffffff;
}

.drop-content p {
  color: #94a3b8;
  margin: 0 0 1rem 0;
}

.file-formats {
  font-size: 0.75rem;
  color: #6b7280;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(15, 15, 35, 0.8);
  padding: 1rem;
  border-radius: 0.5rem;
}

.file-preview i {
  font-size: 2rem;
  color: #6366f1;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #ffffff;
}

.file-size {
  margin: 0;
  font-size: 0.875rem;
  color: #94a3b8;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(42, 46, 90, 0.6);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: rgba(30, 33, 57, 0.3);
}

/* Animaciones */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .gestion-documental {
    padding: 1rem;
  }
  
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .empresa-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .carpetas-grid {
    grid-template-columns: 1fr;
  }
  
  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .archivo-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .archivo-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
}
</style>