<template>
  <div class="taxonomia-anci-espectacular">
    <!-- Header compacto y elegante -->
    <div class="taxonomia-header">
      <div class="header-content">
        <div class="header-info">
          <div class="icon-container">
            <i class="ph ph-tree-structure"></i>
          </div>
          <div class="header-text">
            <h4 class="header-title">Catálogo de Incidentes de Ciberseguridad</h4>
            <p class="header-subtitle">
              Taxonomías para formato ANCI - Empresa tipo 
              <span class="empresa-badge" :class="getBadgeClass(tipoEmpresa)">{{ tipoEmpresa }}</span>
            </p>
          </div>
        </div>
        <div class="header-stats" v-if="!loading && taxonomias.length > 0">
          <div class="stat-mini">
            <span class="stat-number">{{ taxonomias.length }}</span>
            <span class="stat-label">Disponibles</span>
          </div>
          <div class="stat-mini">
            <span class="stat-number">{{ seleccionadas.length }}</span>
            <span class="stat-label">Seleccionadas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estados de carga/error -->
    <div v-if="loading" class="loading-state">
      <div class="cyber-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">Cargando taxonomías ANCI...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="ph ph-warning-octagon"></i>
      </div>
      <h4>Error al cargar taxonomías</h4>
      <p>{{ error }}</p>
      <button @click="cargarTaxonomias" class="retry-btn">
        <i class="ph ph-arrow-clockwise"></i>
        Reintentar
      </button>
    </div>

    <!-- Lista de taxonomías redesñada según especificaciones -->
    <div v-else-if="taxonomias.length > 0" class="taxonomias-container">
      
      <!-- Búsqueda rápida -->
      <div class="search-section">
        <div class="search-input-container">
          <i class="ph ph-magnifying-glass"></i>
          <input autocomplete="off" v-model="filtroTexto" 
            placeholder="Buscar en categorías de incidentes..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Lista principal de taxonomías -->
      <div class="taxonomias-lista">
        <div 
          v-for="taxonomia in taxonomiasFiltradas" 
          :key="taxonomia.ID_Incidente"
          class="taxonomia-item"
          :class="{ 'selected': estaSeleccionada(taxonomia.ID_Incidente) }"
        >
          <!-- Información descriptiva (Area + Efecto + Subcategoría) -->
          <div class="informacion-descriptiva">
            <div class="info-badge">
              <i class="ph ph-info"></i>
            </div>
            <div class="info-content">
              <div class="info-text">{{ taxonomia.InformacionDescriptiva }}</div>
              <div class="info-codigo">{{ taxonomia.CodigoTaxonomia }}</div>
            </div>
            <div class="info-indicators">
              <div class="tipo-indicator" :class="getBadgeClass(taxonomia.AplicaTipoEmpresa)"></div>
              <div v-if="taxonomia.RequiereReporteANCI" class="anci-indicator">
                <i class="ph ph-warning-circle"></i>
                <span>ANCI</span>
              </div>
            </div>
          </div>

          <!-- Categoría seleccionable con checkbox -->
          <div class="categoria-seleccionable" @click="toggleSeleccion(taxonomia.ID_Incidente)">
            <div class="checkbox-container">
              <input autocomplete="off" type="checkbox" 
                :checked="estaSeleccionada(taxonomia.ID_Incidente)"
                @click.stop="toggleSeleccion(taxonomia.ID_Incidente)"
                class="categoria-checkbox"
                :id="`cat-${taxonomia.ID_Incidente}`"
              />
              <label :for="`cat-${taxonomia.ID_Incidente}`" class="checkbox-label">
                <div class="checkbox-check">
                  <i class="ph ph-check"></i>
                </div>
              </label>
            </div>
            <div class="categoria-content">
              <div class="categoria-title">{{ taxonomia.CategoriaSeleccionable }}</div>
              <div class="categoria-subtitle">Categoría de incidente para reporte ANCI</div>
            </div>
            <div class="selection-arrow">
              <i class="ph ph-caret-right"></i>
            </div>
          </div>

          <!-- Panel expandible para opciones (comentarios y archivos) -->
          <transition name="opciones-slide">
            <div v-if="estaSeleccionada(taxonomia.ID_Incidente)" class="opciones-panel">
              <div class="panel-header">
                <i class="ph ph-gear"></i>
                <span>Documentación para Reporte ANCI</span>
              </div>

              <div class="opciones-grid">
                <!-- Sección de comentarios -->
                <div class="opcion-seccion comentarios">
                  <div class="seccion-header">
                    <i class="ph ph-chat-text"></i>
                    <span>Observaciones y Comentarios</span>
                    <div class="version-badge" v-if="historialComentarios[taxonomia.ID_Incidente]?.length > 0">
                      v{{ historialComentarios[taxonomia.ID_Incidente].length }}
                    </div>
                  </div>

                  <div class="comentario-form">
                    <textarea autocomplete="off" v-model="comentarios[taxonomia.ID_Incidente]"
                      placeholder="Agregue observaciones específicas para el reporte ANCI..."
                      class="comentario-textarea"
                      rows="3"
                    ></textarea>
                    <button 
                      @click="guardarComentario(taxonomia.ID_Incidente)"
                      class="comentario-save-btn"
                      :disabled="!comentarios[taxonomia.ID_Incidente]?.trim()"
                    >
                      <i class="ph ph-plus-circle"></i>
                      Agregar Comentario
                    </button>
                  </div>

                  <!-- Lista de comentarios con control de cambios -->
                  <div v-if="historialComentarios[taxonomia.ID_Incidente]?.length > 0" class="comentarios-historial">
                    <div class="historial-titulo">
                      <i class="ph ph-clock-clockwise"></i>
                      Historial de Comentarios
                    </div>
                    <div class="comentarios-timeline">
                      <div 
                        v-for="comentario in historialComentarios[taxonomia.ID_Incidente].slice(0, 3)" 
                        :key="comentario.id"
                        class="comentario-timeline-item"
                      >
                        <div class="timeline-dot">v{{ comentario.version }}</div>
                        <div class="timeline-content">
                          <div class="timeline-text">{{ comentario.texto }}</div>
                          <div class="timeline-meta">{{ formatearFecha(comentario.fecha) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección de archivos -->
                <div class="opcion-seccion archivos">
                  <div class="seccion-header">
                    <i class="ph ph-paperclip"></i>
                    <span>Evidencias y Documentos</span>
                    <div class="version-badge" v-if="archivos[taxonomia.ID_Incidente]?.length > 0">
                      {{ archivos[taxonomia.ID_Incidente].length }} archivo(s)
                    </div>
                  </div>

                  <!-- Upload zone -->
                  <div class="upload-zone">
                    <input autocomplete="off" type="file" 
                      multiple
                      :id="`upload-${taxonomia.ID_Incidente}`"
                      @change="manejarArchivos(taxonomia.ID_Incidente, $event)"
                      class="upload-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                    />
                    <label :for="`upload-${taxonomia.ID_Incidente}`" class="upload-label">
                      <div class="upload-icon">
                        <i class="ph ph-cloud-arrow-up"></i>
                      </div>
                      <div class="upload-text">
                        <span class="upload-main">Agregar Evidencias</span>
                        <span class="upload-sub">PDF, DOC, IMG, XLS (máx. 10MB)</span>
                      </div>
                    </label>
                  </div>

                  <!-- Lista de archivos con versionado -->
                  <div v-if="archivos[taxonomia.ID_Incidente]?.length > 0" class="archivos-lista">
                    <div class="archivos-titulo">
                      <i class="ph ph-files"></i>
                      Archivos con Control de Versiones
                    </div>
                    <div class="archivos-grid">
                      <div 
                        v-for="archivo in archivos[taxonomia.ID_Incidente]" 
                        :key="archivo.id"
                        class="archivo-card"
                      >
                        <div class="archivo-header">
                          <i :class="getIconoArchivo(archivo.type)" class="archivo-icono"></i>
                          <div class="archivo-version">v{{ archivo.version }}</div>
                        </div>
                        <div class="archivo-info">
                          <div class="archivo-nombre">{{ archivo.name }}</div>
                          <div class="archivo-meta">
                            <span class="archivo-size">{{ formatearTamano(archivo.size) }}</span>
                            <span class="archivo-fecha">{{ formatearFecha(archivo.fecha) }}</span>
                          </div>
                        </div>
                        <button @click="eliminarArchivo(taxonomia.ID_Incidente, archivo.id)" class="archivo-remove">
                          <i class="ph ph-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Indicador de selección para ANCI -->
              <div class="anci-footer">
                <div class="anci-status">
                  <i class="ph ph-check-circle-fill"></i>
                  <span>Categoría seleccionada para inclusión en reporte ANCI</span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Resumen final para ANCI -->
      <div v-if="seleccionadas.length > 0" class="resumen-anci">
        <div class="resumen-header">
          <i class="ph ph-clipboard-text"></i>
          <span>Resumen para Reporte ANCI</span>
        </div>
        <div class="resumen-stats">
          <div class="stat-item">
            <span class="stat-value">{{ seleccionadas.length }}</span>
            <span class="stat-desc">Categorías seleccionadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalComentarios }}</span>
            <span class="stat-desc">Comentarios documentados</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalArchivos }}</span>
            <span class="stat-desc">Evidencias adjuntas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="ph ph-tree-structure"></i>
      </div>
      <h4>Sin taxonomías disponibles</h4>
      <p>No hay categorías configuradas para empresas tipo <strong>{{ tipoEmpresa }}</strong></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import apiClient from '../services/api.js'

// Props
const props = defineProps({
  tipoEmpresa: {
    type: String,
    required: true,
    validator: (value) => ['OIV', 'PSE', 'Ambos'].includes(value)
  },
  incidenteId: {
    type: [String, Number],
    default: null
  },
  categoriasIniciales: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'categorias-changed', 
  'evidencia-subida', 
  'comentario-agregado'
])

// Estados reactivos
const loading = ref(false)
const error = ref(null)
const taxonomias = ref([])
const seleccionadas = ref([])
const filtroTexto = ref('')

// Datos de gestión
const comentarios = reactive({})
const archivos = reactive({})
const historialComentarios = reactive({})

// Computed
const taxonomiasFiltradas = computed(() => {
  if (!filtroTexto.value.trim()) return taxonomias.value
  
  const filtro = filtroTexto.value.toLowerCase()
  return taxonomias.value.filter(t => 
    t.InformacionDescriptiva.toLowerCase().includes(filtro) ||
    t.CategoriaSeleccionable.toLowerCase().includes(filtro) ||
    t.CodigoTaxonomia.toLowerCase().includes(filtro) ||
    t.Area.toLowerCase().includes(filtro) ||
    t.Efecto.toLowerCase().includes(filtro)
  )
})

const totalComentarios = computed(() => {
  return Object.values(historialComentarios).reduce((total, comentariosArray) => total + comentariosArray.length, 0)
})

const totalArchivos = computed(() => {
  return Object.values(archivos).reduce((total, archivosArray) => total + archivosArray.length, 0)
})

// Métodos principales
const cargarTaxonomias = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Si tenemos incidenteId, usar el endpoint completo que incluye comentarios y archivos
    if (props.incidenteId) {
      console.log('🏷️ Cargando taxonomías completas para incidente:', props.incidenteId)
      const response = await apiClient.get(`/admin/incidentes/${props.incidenteId}/taxonomias-completas`)
      
      console.log('🏷️ Respuesta completa del backend:', response.data)
      taxonomias.value = response.data.taxonomias || []
      
      // Inicializar datos de gestión con datos existentes
      taxonomias.value.forEach(taxonomia => {
        console.log('🏷️ Procesando taxonomía:', taxonomia)
        
        // Marcar como seleccionada si ya está en la BD
        if (taxonomia.Seleccionada) {
          if (!seleccionadas.value.includes(taxonomia.ID_Incidente)) {
            seleccionadas.value.push(taxonomia.ID_Incidente)
          }
        }
        
        // Cargar comentarios existentes
        historialComentarios[taxonomia.ID_Incidente] = taxonomia.comentarios || []
        console.log('💬 Comentarios cargados para taxonomía', taxonomia.ID_Incidente, ':', taxonomia.comentarios)
        
        // Cargar archivos existentes
        archivos[taxonomia.ID_Incidente] = taxonomia.archivos || []
        console.log('📁 Archivos cargados para taxonomía', taxonomia.ID_Incidente, ':', taxonomia.archivos)
        
        // Inicializar campo de comentario
        comentarios[taxonomia.ID_Incidente] = ''
      })
      
      console.log('🏷️ Taxonomías completas cargadas:', taxonomias.value.length)
      console.log('🏷️ Seleccionadas inicialmente:', seleccionadas.value.length)
      console.log('🏷️ Historial comentarios:', historialComentarios)
      console.log('🏷️ Archivos por taxonomía:', archivos)
      
    } else {
      // Modo creación: usar endpoint básico
      const tipoEmpresaSeguro = props.tipoEmpresa || 'PSE'
      console.log('🏷️ Cargando taxonomías básicas para tipo empresa:', tipoEmpresaSeguro)
      
      const response = await apiClient.get(`/admin/taxonomias/jerarquica?tipo_empresa=${tipoEmpresaSeguro}`)
      taxonomias.value = response.data
    }
    
    if (taxonomias.value.length === 0) {
      error.value = `No se encontraron taxonomías disponibles`
    }
    
  } catch (err) {
    console.error('Error al cargar taxonomías:', err)
    error.value = err.response?.data?.error || err.message || 'Error al cargar las taxonomías'
    taxonomias.value = []
  } finally {
    loading.value = false
  }
}

const toggleSeleccion = (taxonomiaId) => {
  if (estaSeleccionada(taxonomiaId)) {
    removerSeleccion(taxonomiaId)
  } else {
    agregarSeleccion(taxonomiaId)
  }
}

const estaSeleccionada = (taxonomiaId) => {
  return seleccionadas.value.includes(taxonomiaId)
}

const agregarSeleccion = (taxonomiaId) => {
  if (!estaSeleccionada(taxonomiaId)) {
    seleccionadas.value.push(taxonomiaId)
    
    // Solo inicializar si no existen ya (para preservar datos cargados)
    if (!comentarios[taxonomiaId]) comentarios[taxonomiaId] = ''
    if (!archivos[taxonomiaId]) archivos[taxonomiaId] = []
    if (!historialComentarios[taxonomiaId]) historialComentarios[taxonomiaId] = []
    
    emitirCambios()
  }
}

const removerSeleccion = (taxonomiaId) => {
  const index = seleccionadas.value.indexOf(taxonomiaId)
  if (index > -1) {
    seleccionadas.value.splice(index, 1)
    delete comentarios[taxonomiaId]
    delete archivos[taxonomiaId]
    delete historialComentarios[taxonomiaId]
    emitirCambios()
  }
}

// Gestión de comentarios
const guardarComentario = async (taxonomiaId) => {
  const comentario = comentarios[taxonomiaId]?.trim()
  if (!comentario) return
  
  try {
    // Persistir en backend si tenemos incidenteId
    if (props.incidenteId) {
      const response = await apiClient.post(`/admin/taxonomias/${taxonomiaId}/comentarios`, {
        comentario: comentario,
        incidenteId: props.incidenteId,
        usuario: 'Usuario'
      })
      
      console.log('✅ Comentario guardado en BD:', response.data)
    }
    
    // Agregar al historial local con versionado
    if (!historialComentarios[taxonomiaId]) {
      historialComentarios[taxonomiaId] = []
    }
    
    const version = historialComentarios[taxonomiaId].length + 1
    historialComentarios[taxonomiaId].unshift({
      id: Date.now(),
      texto: comentario,
      version: version,
      fecha: new Date(),
      autor: 'Usuario'
    })
    
    // Limpiar campo
    comentarios[taxonomiaId] = ''
    
    emit('comentario-agregado', { taxonomiaId, comentario })
    
  } catch (error) {
    console.error('Error guardando comentario:', error)
    alert('Error al guardar el comentario. Inténtelo nuevamente.')
  }
}

// Gestión de archivos
const manejarArchivos = async (taxonomiaId, event) => {
  const files = Array.from(event.target.files)
  
  for (const file of files) {
    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
      continue
    }
    
    try {
      // Persistir en backend si tenemos incidenteId
      if (props.incidenteId) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('incidenteId', props.incidenteId)
        formData.append('usuario', 'Usuario')
        formData.append('comentario', `Evidencia para taxonomía ${taxonomiaId}`)
        
        const response = await apiClient.post(`/admin/taxonomias/${taxonomiaId}/evidencias`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        console.log('✅ Evidencia guardada en BD:', response.data)
      }
      
      // Agregar archivo al estado local con versionado automático
      const existingFiles = archivos[taxonomiaId] || []
      const version = existingFiles.length + 1
      
      archivos[taxonomiaId].push({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        version: version,
        fecha: new Date()
      })
      
    } catch (error) {
      console.error('Error subiendo archivo:', error)
      alert(`Error al subir ${file.name}. Inténtelo nuevamente.`)
    }
  }
  
  // Limpiar input
  event.target.value = ''
  emit('evidencia-subida', { taxonomiaId, archivos: files })
}

const eliminarArchivo = async (taxonomiaId, archivoId) => {
  try {
    // TODO: Implementar endpoint de eliminación en backend
    // if (props.incidenteId) {
    //   await apiClient.delete(`/admin/taxonomias/${taxonomiaId}/evidencias/${archivoId}`)
    // }
    
    // Eliminar del estado local
    if (archivos[taxonomiaId]) {
      archivos[taxonomiaId] = archivos[taxonomiaId].filter(a => a.id !== archivoId)
    }
    
    console.log('🗑️ Archivo eliminado localmente')
    
  } catch (error) {
    console.error('Error eliminando archivo:', error)
    alert('Error al eliminar el archivo. Inténtelo nuevamente.')
  }
}

// Utilidades
const emitirCambios = () => {
  emit('categorias-changed', seleccionadas.value)
}

const getBadgeClass = (tipo) => {
  const classes = {
    'OIV': 'badge-oiv',
    'PSE': 'badge-pse',
    'AMBAS': 'badge-ambas'
  }
  return classes[tipo] || 'badge-ambas'
}

const getIconoArchivo = (type) => {
  if (!type) return 'ph ph-file'
  if (type.includes('pdf')) return 'ph ph-file-pdf'
  if (type.includes('word') || type.includes('doc')) return 'ph ph-file-doc'
  if (type.includes('image')) return 'ph ph-file-image'
  if (type.includes('excel') || type.includes('sheet')) return 'ph ph-file-xls'
  return 'ph ph-file'
}

const formatearTamano = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  try {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'N/A'
  }
}

// Watchers e inicialización
watch(() => props.tipoEmpresa, cargarTaxonomias, { immediate: false })
watch(() => props.incidenteId, cargarTaxonomias, { immediate: false })

watch(() => props.categoriasIniciales, (nuevasCategorias) => {
  if (nuevasCategorias && nuevasCategorias.length > 0) {
    seleccionadas.value = [...nuevasCategorias]
    nuevasCategorias.forEach(taxonomiaId => {
      if (!comentarios[taxonomiaId]) comentarios[taxonomiaId] = ''
      if (!archivos[taxonomiaId]) archivos[taxonomiaId] = []
      if (!historialComentarios[taxonomiaId]) historialComentarios[taxonomiaId] = []
    })
  }
}, { immediate: true })

onMounted(() => {
  console.log('🏷️ TaxonomiaANCIEspectacular montado')
  console.log('Tipo empresa:', props.tipoEmpresa)
  console.log('Incidente ID:', props.incidenteId)
  
  // Cargar taxonomías al montar el componente
  cargarTaxonomias()
})
</script>

<style scoped>
/* Contenedor principal */
.taxonomia-anci-espectacular {
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Header compacto */
.taxonomia-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(79, 70, 229, 0.3);
  position: relative;
}

.taxonomia-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empresa-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.badge-oiv { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.badge-pse { background: rgba(34, 197, 94, 0.2); color: #86efac; }
.badge-ambas { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-mini {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;
  min-width: 3rem;
}

.stat-number {
  display: block;
  font-size: 1.125rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.625rem;
  color: #94a3b8;
  text-transform: uppercase;
  margin-top: 0.125rem;
}

/* Loading state */
.loading-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #94a3b8;
}

.cyber-spinner {
  position: relative;
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.3s;
  border-top-color: #7c3aed;
  transform: scale(0.8);
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.6s;
  border-top-color: #ec4899;
  transform: scale(0.6);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  font-weight: 500;
}

/* Error state */
.error-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #f87171;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.error-state h4 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.retry-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: transform 0.2s;
}

.retry-btn:hover {
  transform: translateY(-2px);
}

/* Búsqueda */
.search-section {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input-container {
  position: relative;
  max-width: 24rem;
}

.search-input-container i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

/* Lista de taxonomías */
.taxonomias-lista {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
}

.taxonomia-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.taxonomia-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(79, 70, 229, 0.3);
  transform: translateY(-2px);
}

.taxonomia-item.selected {
  background: rgba(79, 70, 229, 0.1);
  border-color: #4f46e5;
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.2);
}

/* Información descriptiva */
.informacion-descriptiva {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-badge {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-text {
  font-size: 1rem;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.info-codigo {
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Monaco', monospace;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.info-indicators {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tipo-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.anci-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Categoría seleccionable */
.categoria-seleccionable {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.categoria-seleccionable:hover {
  background: rgba(255, 255, 255, 0.05);
}

.checkbox-container {
  position: relative;
}

.categoria-checkbox {
  display: none;
}

.checkbox-label {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.checkbox-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
}

.categoria-checkbox:checked + .checkbox-label {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-color: #7c3aed;
}

.categoria-checkbox:checked + .checkbox-label .checkbox-check {
  opacity: 1;
  transform: scale(1);
}

.categoria-content {
  flex: 1;
  min-width: 0;
}

.categoria-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.categoria-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
}

.selection-arrow {
  color: #4f46e5;
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.taxonomia-item.selected .selection-arrow {
  transform: rotate(90deg);
}

/* Panel de opciones */
.opciones-panel {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header i {
  color: #4f46e5;
}

.opciones-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.opcion-seccion {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.seccion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.seccion-header i {
  color: #4f46e5;
}

.version-badge {
  background: rgba(79, 70, 229, 0.2);
  color: #a5b4fc;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: auto;
}

/* Comentarios */
.comentario-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.comentario-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  resize: vertical;
  min-height: 4rem;
  transition: border-color 0.2s;
}

.comentario-textarea::placeholder {
  color: #64748b;
}

.comentario-textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.comentario-save-btn {
  align-self: flex-start;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.comentario-save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.comentario-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.comentarios-historial {
  margin-top: 1rem;
}

.historial-titulo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comentarios-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comentario-timeline-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.timeline-dot {
  background: #f59e0b;
  color: white;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-text {
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.timeline-meta {
  color: #64748b;
  font-size: 0.75rem;
}

/* Upload de archivos */
.upload-zone {
  margin-bottom: 1.5rem;
}

.upload-input {
  display: none;
}

.upload-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-label:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4f46e5;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(79, 70, 229, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  font-size: 1.5rem;
}

.upload-text {
  flex: 1;
}

.upload-main {
  display: block;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.upload-sub {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Lista de archivos */
.archivos-lista {
  margin-top: 1rem;
}

.archivos-titulo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.archivos-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 10rem;
  overflow-y: auto;
}

.archivo-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.archivo-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4f46e5;
}

.archivo-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.archivo-icono {
  color: #4f46e5;
  font-size: 1.5rem;
}

.archivo-version {
  background: #22c55e;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
}

.archivo-info {
  flex: 1;
  min-width: 0;
}

.archivo-nombre {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.archivo-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
}

.archivo-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.archivo-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

/* Footer ANCI */
.anci-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.anci-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;
}

.anci-status i {
  font-size: 1rem;
}

/* Resumen ANCI */
.resumen-anci {
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1.5rem;
}

.resumen-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.resumen-header i {
  color: #4f46e5;
  font-size: 1.25rem;
}

.resumen-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-desc {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Estado vacío */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

/* Transiciones */
.opciones-slide-enter-active,
.opciones-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  opacity: 1;
}

.opciones-slide-enter-from,
.opciones-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .opciones-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .resumen-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-info {
    flex-direction: column;
    text-align: center;
  }
  
  .taxonomias-lista {
    padding: 1rem;
  }
  
  .taxonomia-item {
    margin-bottom: 0.75rem;
  }
  
  .informacion-descriptiva {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .categoria-seleccionable {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .opciones-panel {
    padding: 1rem;
  }
}
</style>