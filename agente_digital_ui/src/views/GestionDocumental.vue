<template>
  <div class="gestion-documental">
    <!-- Header -->
    <header class="header-section">
      <router-link :to="`/gestion/inquilinos/${inquilinoId}/empresas`" class="btn-volver">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Empresas</span>
      </router-link>
      
      <div class="header-content">
        <h1 class="page-title">
          <i class="ph ph-folder-open"></i>
          Gestión Documental ANCI
        </h1>
        <p class="page-subtitle">
          Sistema de gestión de cumplimiento según Ley 21.663
        </p>
      </div>
    </header>

    <!-- Info de la empresa -->
    <div v-if="empresa" class="empresa-info-card">
      <div class="empresa-header">
        <div>
          <h2>{{ empresa.RazonSocial }}</h2>
          <p class="empresa-rut">RUT: {{ empresa.RUT }}</p>
        </div>
        <div class="empresa-badges">
          <span class="badge" :class="getBadgeClass(empresa.TipoEmpresa)">
            {{ empresa.TipoEmpresa }}
          </span>
          <span v-if="empresa.SectorEsencial" class="badge badge-sector">
            {{ empresa.SectorEsencial }}
          </span>
        </div>
      </div>
    </div>

    <!-- Dashboard de Cumplimiento -->
    <div class="dashboard-cumplimiento">
      <h3 class="section-title">Dashboard de Cumplimiento</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="ph ph-check-circle"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metricas.cumplimientoGlobal }}%</div>
            <div class="metric-label">Cumplimiento Global</div>
          </div>
        </div>
        
        <div class="metric-card alert" v-if="metricas.alertasCriticas > 0">
          <div class="metric-icon">
            <i class="ph ph-warning-circle"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metricas.alertasCriticas }}</div>
            <div class="metric-label">Alertas Críticas</div>
          </div>
        </div>
        
        <div class="metric-card warning" v-if="metricas.proximosVencimientos > 0">
          <div class="metric-icon">
            <i class="ph ph-clock"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metricas.proximosVencimientos }}</div>
            <div class="metric-label">Próximos Vencimientos</div>
          </div>
        </div>
        
        <div class="metric-card success">
          <div class="metric-icon">
            <i class="ph ph-file-check"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metricas.documentosActualizados }}</div>
            <div class="metric-label">Documentos al Día</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación de Carpetas -->
    <div class="carpetas-section">
      <h3 class="section-title">Estructura de Carpetas</h3>
      
      <div class="carpetas-grid">
        <div 
          v-for="carpeta in carpetas" 
          :key="carpeta.id"
          class="carpeta-card"
          :class="{ 'activa': carpetaActiva === carpeta.id }"
          @click="seleccionarCarpeta(carpeta)"
        >
          <div class="carpeta-icon">
            <i :class="carpeta.icono"></i>
          </div>
          <div class="carpeta-info">
            <h4>{{ carpeta.nombre }}</h4>
            <p>{{ carpeta.descripcion }}</p>
            <div class="carpeta-stats">
              <span class="stat">
                <i class="ph ph-file"></i>
                {{ carpeta.archivos }} archivos
              </span>
              <span v-if="carpeta.alertas > 0" class="stat alert">
                <i class="ph ph-warning"></i>
                {{ carpeta.alertas }} alertas
              </span>
            </div>
          </div>
          <div v-if="carpeta.requerido" class="carpeta-badge">
            <span class="badge badge-required">Obligatorio</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido de la Carpeta Seleccionada -->
    <div v-if="carpetaActiva" class="contenido-carpeta">
      <div class="contenido-header">
        <h3>{{ carpetaSeleccionada.nombre }}</h3>
        <div class="contenido-actions">
          <button class="btn btn-primary" @click="subirDocumento">
            <i class="ph ph-upload"></i>
            Subir Documento
          </button>
          <button class="btn btn-secondary" @click="verChecklist">
            <i class="ph ph-list-checks"></i>
            Ver Checklist
          </button>
        </div>
      </div>

      <!-- Lista de Documentos -->
      <div v-if="documentos.length > 0" class="documentos-list">
        <table class="documentos-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Tipo</th>
              <th>Fecha Subida</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documentos" :key="doc.id">
              <td>
                <div class="doc-info">
                  <i :class="getIconoDocumento(doc.tipo)"></i>
                  <span>{{ doc.nombre }}</span>
                </div>
              </td>
              <td>{{ doc.tipo }}</td>
              <td>{{ formatearFecha(doc.fechaSubida) }}</td>
              <td>
                <span v-if="doc.fechaVencimiento" :class="getClaseVencimiento(doc.fechaVencimiento)">
                  {{ formatearFecha(doc.fechaVencimiento) }}
                </span>
                <span v-else class="text-muted">N/A</span>
              </td>
              <td>
                <span class="badge" :class="getBadgeEstado(doc.estado)">
                  {{ doc.estado }}
                </span>
              </td>
              <td>
                <div class="doc-actions">
                  <button class="btn-icon" @click="verDocumento(doc)" title="Ver">
                    <i class="ph ph-eye"></i>
                  </button>
                  <button class="btn-icon" @click="descargarDocumento(doc)" title="Descargar">
                    <i class="ph ph-download"></i>
                  </button>
                  <button class="btn-icon" @click="editarDocumento(doc)" title="Editar">
                    <i class="ph ph-pencil"></i>
                  </button>
                  <button class="btn-icon danger" @click="eliminarDocumento(doc)" title="Eliminar">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <i class="ph ph-folder-open"></i>
        <p>No hay documentos en esta carpeta</p>
        <button class="btn btn-primary" @click="subirDocumento">
          <i class="ph ph-upload"></i>
          Subir Primer Documento
        </button>
      </div>
    </div>

    <!-- Alertas y Notificaciones -->
    <div v-if="alertas.length > 0" class="alertas-section">
      <h3 class="section-title">
        <i class="ph ph-warning"></i>
        Alertas y Notificaciones
      </h3>
      
      <div class="alertas-list">
        <div v-for="alerta in alertas" :key="alerta.id" 
             class="alerta-item" 
             :class="`alerta-${alerta.tipo}`">
          <div class="alerta-icon">
            <i :class="getIconoAlerta(alerta.tipo)"></i>
          </div>
          <div class="alerta-content">
            <h4>{{ alerta.titulo }}</h4>
            <p>{{ alerta.mensaje }}</p>
            <span class="alerta-fecha">{{ formatearFecha(alerta.fecha) }}</span>
          </div>
          <button class="btn-icon" @click="gestionarAlerta(alerta)">
            <i class="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Subir Documento -->
    <div v-if="mostrarModalSubir" class="modal-backdrop" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Subir Documento</h3>
          <button class="btn-close" @click="cerrarModal">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Carpeta</label>
            <input type="text" :value="carpetaSeleccionada.nombre" disabled class="form-control">
          </div>
          
          <div class="form-group">
            <label>Tipo de Documento</label>
            <select v-model="nuevoDocumento.tipo" class="form-control">
              <option value="">Seleccionar tipo...</option>
              <option v-for="tipo in tiposDocumento" :key="tipo.id" :value="tipo.id">
                {{ tipo.nombre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Archivo</label>
            <div class="file-upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
              <input type="file" ref="fileInput" @change="handleFileSelect" hidden>
              <div v-if="!nuevoDocumento.archivo" class="upload-prompt" @click="$refs.fileInput.click()">
                <i class="ph ph-upload"></i>
                <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
                <span class="file-types">PDF, DOCX, XLSX (máx. 10MB)</span>
              </div>
              <div v-else class="file-selected">
                <i :class="getIconoDocumento(nuevoDocumento.archivo.type)"></i>
                <p>{{ nuevoDocumento.archivo.name }}</p>
                <button class="btn-icon" @click="nuevoDocumento.archivo = null">
                  <i class="ph ph-x"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Fecha de Vencimiento (opcional)</label>
            <input type="date" v-model="nuevoDocumento.fechaVencimiento" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="nuevoDocumento.descripcion" class="form-control" rows="3"></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" @click="guardarDocumento" :disabled="!puedeGuardar">
            <i class="ph ph-upload"></i>
            Subir Documento
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Checklist -->
    <div v-if="mostrarModalChecklist" class="modal-backdrop" @click="cerrarModalChecklist">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3>Checklist - {{ carpetaSeleccionada.nombre }}</h3>
          <button class="btn-close" @click="cerrarModalChecklist">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="checklist-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="`width: ${checklistProgress}%`"></div>
            </div>
            <span class="progress-text">{{ checklistProgress }}% Completado</span>
          </div>
          
          <div class="checklist-items">
            <div v-for="item in checklistItems" :key="item.id" class="checklist-item">
              <div class="item-status">
                <i v-if="item.completado" class="ph ph-check-circle" style="color: #10b981;"></i>
                <i v-else class="ph ph-circle" style="color: #6b7280;"></i>
              </div>
              <div class="item-content">
                <h4>{{ item.nombre }}</h4>
                <p>{{ item.descripcion }}</p>
                <div v-if="item.documento" class="item-documento">
                  <i :class="getIconoDocumento(item.documento.tipo)"></i>
                  <span>{{ item.documento.nombre }}</span>
                </div>
              </div>
              <div class="item-actions">
                <button v-if="!item.completado" class="btn btn-sm btn-primary" @click="subirParaItem(item)">
                  <i class="ph ph-upload"></i>
                  Subir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../services/api';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();

// Props y parámetros
const inquilinoId = route.params.inquilinoId;
const empresaId = route.params.empresaId;

// Estado
const empresa = ref(null);
const carpetas = ref([]);
const carpetaActiva = ref(null);
const documentos = ref([]);
const alertas = ref([]);
const metricas = ref({
  cumplimientoGlobal: 0,
  alertasCriticas: 0,
  proximosVencimientos: 0,
  documentosActualizados: 0
});

// Modales
const mostrarModalSubir = ref(false);
const mostrarModalChecklist = ref(false);
const nuevoDocumento = ref({
  tipo: '',
  archivo: null,
  fechaVencimiento: '',
  descripcion: ''
});
const checklistItems = ref([]);

// Computed
const carpetaSeleccionada = computed(() => {
  return carpetas.value.find(c => c.id === carpetaActiva.value) || {};
});

const puedeGuardar = computed(() => {
  return nuevoDocumento.value.tipo && nuevoDocumento.value.archivo;
});

const checklistProgress = computed(() => {
  if (checklistItems.value.length === 0) return 0;
  const completados = checklistItems.value.filter(i => i.completado).length;
  return Math.round((completados / checklistItems.value.length) * 100);
});

const tiposDocumento = computed(() => {
  // Tipos según la carpeta seleccionada
  const tiposPorCarpeta = {
    '01_REGISTRO_ANCI': [
      { id: 'comprobante_registro', nombre: 'Comprobante de Registro ANCI' },
      { id: 'designacion_encargado', nombre: 'Designación de Encargado (FEA)' },
      { id: 'certificado_vigencia', nombre: 'Certificado de Vigencia' }
    ],
    '03_GOBERNANZA_SEGURIDAD': [
      { id: 'politica_seguridad', nombre: 'Política General de Seguridad' },
      { id: 'manual_sgsi', nombre: 'Manual SGSI' },
      { id: 'matriz_riesgos', nombre: 'Matriz de Riesgos' }
    ],
    // ... más tipos según carpeta
  };
  
  return tiposPorCarpeta[carpetaSeleccionada.value.codigo] || [];
});

// Funciones
async function cargarDatos() {
  try {
    // Cargar datos de la empresa
    const respEmpresa = await apiClient.get(`/gestion-documental/empresa/${empresaId}`);
    empresa.value = respEmpresa.data;
    
    // Cargar estructura de carpetas
    const respCarpetas = await apiClient.get(`/gestion-documental/carpetas/${empresaId}`);
    carpetas.value = respCarpetas.data;
    
    // Cargar métricas
    const respMetricas = await apiClient.get(`/gestion-documental/metricas/${empresaId}`);
    metricas.value = respMetricas.data;
    
    // Cargar alertas
    const respAlertas = await apiClient.get(`/gestion-documental/alertas/${empresaId}`);
    alertas.value = respAlertas.data;
    
    // Seleccionar primera carpeta por defecto
    if (carpetas.value.length > 0) {
      seleccionarCarpeta(carpetas.value[0]);
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los datos'
    });
  }
}

async function seleccionarCarpeta(carpeta) {
  carpetaActiva.value = carpeta.id;
  
  try {
    const resp = await apiClient.get(`/gestion-documental/documentos/${empresaId}/${carpeta.id}`);
    documentos.value = resp.data;
  } catch (error) {
    console.error('Error cargando documentos:', error);
  }
}

function subirDocumento() {
  mostrarModalSubir.value = true;
}

function cerrarModal() {
  mostrarModalSubir.value = false;
  nuevoDocumento.value = {
    tipo: '',
    archivo: null,
    fechaVencimiento: '',
    descripcion: ''
  };
}

function handleDrop(e) {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    nuevoDocumento.value.archivo = files[0];
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    nuevoDocumento.value.archivo = files[0];
  }
}

async function guardarDocumento() {
  const formData = new FormData();
  formData.append('archivo', nuevoDocumento.value.archivo);
  formData.append('tipo', nuevoDocumento.value.tipo);
  formData.append('carpeta_id', carpetaActiva.value);
  formData.append('fecha_vencimiento', nuevoDocumento.value.fechaVencimiento);
  formData.append('descripcion', nuevoDocumento.value.descripcion);
  
  try {
    await apiClient.post(`/gestion-documental/documentos/${empresaId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    Swal.fire({
      icon: 'success',
      title: 'Documento subido',
      text: 'El documento se ha subido correctamente'
    });
    
    cerrarModal();
    seleccionarCarpeta(carpetaSeleccionada.value);
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo subir el documento'
    });
  }
}

async function verChecklist() {
  try {
    const resp = await apiClient.get(`/gestion-documental/checklist/${empresaId}/${carpetaActiva.value}`);
    checklistItems.value = resp.data;
    mostrarModalChecklist.value = true;
  } catch (error) {
    console.error('Error cargando checklist:', error);
  }
}

function cerrarModalChecklist() {
  mostrarModalChecklist.value = false;
}

async function verDocumento(doc) {
  window.open(`/api/gestion-documental/documentos/${doc.id}/ver`, '_blank');
}

async function descargarDocumento(doc) {
  window.open(`/api/gestion-documental/documentos/${doc.id}/descargar`, '_blank');
}

async function editarDocumento(doc) {
  // Implementar edición
  console.log('Editar documento:', doc);
}

async function eliminarDocumento(doc) {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Eliminar documento?',
    text: `¿Está seguro de eliminar ${doc.nombre}?`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });
  
  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/gestion-documental/documentos/${doc.id}`);
      
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El documento ha sido eliminado'
      });
      
      seleccionarCarpeta(carpetaSeleccionada.value);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el documento'
      });
    }
  }
}

async function gestionarAlerta(alerta) {
  // Navegar a la sección correspondiente según el tipo de alerta
  if (alerta.carpeta_id) {
    const carpeta = carpetas.value.find(c => c.id === alerta.carpeta_id);
    if (carpeta) {
      seleccionarCarpeta(carpeta);
    }
  }
}

function subirParaItem(item) {
  // Pre-configurar el modal para este item específico
  nuevoDocumento.value.tipo = item.tipo_documento;
  subirDocumento();
}

// Funciones de utilidad
function getBadgeClass(tipo) {
  const clases = {
    'OIV': 'badge-oiv',
    'PSE': 'badge-pse',
    'AMBAS': 'badge-ambas'
  };
  return clases[tipo] || 'badge-default';
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES');
}

function getIconoDocumento(tipo) {
  const iconos = {
    'pdf': 'ph ph-file-pdf',
    'docx': 'ph ph-file-doc',
    'xlsx': 'ph ph-file-xls',
    'application/pdf': 'ph ph-file-pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'ph ph-file-doc',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'ph ph-file-xls'
  };
  return iconos[tipo] || 'ph ph-file';
}

function getClaseVencimiento(fecha) {
  const dias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'text-danger';
  if (dias <= 30) return 'text-warning';
  return 'text-muted';
}

function getBadgeEstado(estado) {
  const clases = {
    'vigente': 'badge-success',
    'por_vencer': 'badge-warning',
    'vencido': 'badge-danger',
    'pendiente': 'badge-secondary'
  };
  return clases[estado] || 'badge-default';
}

function getIconoAlerta(tipo) {
  const iconos = {
    'critica': 'ph ph-warning-octagon',
    'alta': 'ph ph-warning-circle',
    'media': 'ph ph-info',
    'baja': 'ph ph-bell'
  };
  return iconos[tipo] || 'ph ph-warning';
}

// Lifecycle
onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
/* Variables */
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --accent-primary: #4f46e5;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
  --border-color: #334155;
}

/* Layout */
.gestion-documental {
  min-height: 100vh;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Header */
.header-section {
  margin-bottom: 2rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.2s;
}

.btn-volver:hover {
  color: var(--text-primary);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
}

/* Empresa Info Card */
.empresa-info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.empresa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empresa-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.empresa-rut {
  color: var(--text-secondary);
  font-family: monospace;
}

.empresa-badges {
  display: flex;
  gap: 0.5rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-oiv {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.badge-pse {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.badge-ambas {
  background: rgba(168, 85, 247, 0.2);
  color: #c4b5fd;
}

.badge-sector {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.badge-required {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  font-size: 0.625rem;
}

.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* Dashboard de Cumplimiento */
.dashboard-cumplimiento {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
}

.metric-card.alert {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
}

.metric-card.warning {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.1);
}

.metric-card.success {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.1);
}

.metric-icon {
  font-size: 2rem;
  color: var(--accent-primary);
}

.metric-card.alert .metric-icon {
  color: var(--accent-danger);
}

.metric-card.warning .metric-icon {
  color: var(--accent-warning);
}

.metric-card.success .metric-icon {
  color: var(--accent-success);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
}

.metric-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Carpetas */
.carpetas-section {
  margin-bottom: 2rem;
}

.carpetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.carpeta-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.carpeta-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  opacity: 0;
  transition: opacity 0.3s;
}

.carpeta-card:hover,
.carpeta-card.activa {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
}

.carpeta-card:hover::before,
.carpeta-card.activa::before {
  opacity: 1;
}

.carpeta-icon {
  font-size: 2rem;
  color: var(--accent-primary);
  margin-bottom: 0.75rem;
}

.carpeta-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.carpeta-info p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.carpeta-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat.alert {
  color: var(--accent-warning);
}

.carpeta-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

/* Contenido de Carpeta */
.contenido-carpeta {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.contenido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.contenido-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.contenido-actions {
  display: flex;
  gap: 0.5rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: #475569;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 0.375rem;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #475569;
  transform: scale(1.05);
}

.btn-icon.danger {
  color: var(--accent-danger);
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

/* Tabla de Documentos */
.documentos-table {
  width: 100%;
  border-collapse: collapse;
}

.documentos-table th {
  text-align: left;
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.documentos-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.doc-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.doc-actions {
  display: flex;
  gap: 0.25rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Alertas */
.alertas-section {
  margin-bottom: 2rem;
}

.alertas-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alerta-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.alerta-item:hover {
  transform: translateX(4px);
}

.alerta-critica {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
}

.alerta-alta {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.1);
}

.alerta-media {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
}

.alerta-icon {
  font-size: 1.5rem;
}

.alerta-critica .alerta-icon {
  color: var(--accent-danger);
}

.alerta-alta .alerta-icon {
  color: var(--accent-warning);
}

.alerta-media .alerta-icon {
  color: #3b82f6;
}

.alerta-content {
  flex: 1;
}

.alerta-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alerta-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.alerta-fecha {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.modal-large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Forms */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

/* File Upload */
.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: var(--accent-primary);
  background: rgba(79, 70, 229, 0.05);
}

.upload-prompt {
  color: var(--text-secondary);
}

.upload-prompt i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
  opacity: 0.5;
}

.file-types {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: block;
  margin-top: 0.5rem;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.file-selected i {
  font-size: 2rem;
  color: var(--accent-primary);
}

/* Checklist */
.checklist-progress {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--accent-success);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.checklist-item:hover {
  border-color: var(--accent-primary);
}

.item-status {
  font-size: 1.5rem;
}

.item-content {
  flex: 1;
}

.item-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.item-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.item-documento {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--accent-primary);
}

.item-actions {
  margin-left: auto;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* Utilidades */
.text-muted {
  color: var(--text-secondary);
}

.text-danger {
  color: var(--accent-danger);
}

.text-warning {
  color: var(--accent-warning);
}

/* Responsive */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .carpetas-grid {
    grid-template-columns: 1fr;
  }
  
  .contenido-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .contenido-actions {
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .documentos-table {
    font-size: 0.75rem;
  }
  
  .doc-actions {
    flex-direction: column;
  }
}
</style>