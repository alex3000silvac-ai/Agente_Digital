<template>
  <div class="taxonomia-espectacular">
    <!-- Header futurista -->
    <div class="taxonomia-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-left">
          <div class="icon-container">
            <i class="ph ph-tree-structure"></i>
            <div class="icon-pulse"></div>
          </div>
          <div class="header-text">
            <h3 class="header-title">Clasificación de Taxonomía</h3>
            <p class="header-subtitle">
              Catálogo de incidentes de ciberseguridad para 
              <span class="empresa-badge" :class="getBadgeClass(tipoEmpresa)">{{ tipoEmpresa }}</span>
            </p>
          </div>
        </div>
        <div class="header-stats" v-if="!loading && taxonomias.length > 0">
          <div class="stat-card">
            <div class="stat-number">{{ taxonomias.length }}</div>
            <div class="stat-label">Disponibles</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ seleccionadas.length }}</div>
            <div class="stat-label">Seleccionadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ categoriasUnicas.length }}</div>
            <div class="stat-label">Categorías</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estados de carga -->
    <div v-if="loading" class="loading-state">
      <div class="loading-animation">
        <div class="cyber-loader">
          <div class="cyber-ring"></div>
          <div class="cyber-ring"></div>
          <div class="cyber-ring"></div>
        </div>
        <div class="loading-text">
          <span>Cargando taxonomías</span>
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="ph ph-warning-octagon"></i>
      </div>
      <div class="error-content">
        <h4>Error al cargar taxonomías</h4>
        <p>{{ error }}</p>
        <button @click="cargarTaxonomias" class="retry-btn">
          <i class="ph ph-arrow-clockwise"></i>
          Reintentar carga
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="taxonomias.length > 0" class="taxonomia-content">
      
      <!-- Panel de control -->
      <div class="control-panel">
        <div class="search-container">
          <div class="search-box">
            <i class="ph ph-magnifying-glass"></i>
            <input autocomplete="off" v-model="filtroTexto" 
              placeholder="Buscar taxonomías por área, efecto o categoría..."
              class="search-input"
            />
            <div v-if="filtroTexto" @click="filtroTexto = ''" class="search-clear">
              <i class="ph ph-x"></i>
            </div>
          </div>
        </div>
        
        <div class="filter-tabs">
          <button 
            v-for="categoria in ['Todas', ...categoriasUnicas]" 
            :key="categoria"
            @click="filtroCategoria = categoria === 'Todas' ? '' : categoria"
            class="filter-tab"
            :class="{ 'active': (categoria === 'Todas' && !filtroCategoria) || filtroCategoria === categoria }"
          >
            {{ categoria }}
            <span class="tab-count">{{ contarPorCategoria(categoria) }}</span>
          </button>
        </div>

        <div class="action-buttons">
          <button 
            @click="seleccionarTodas" 
            class="action-btn primary"
            :disabled="taxonomiasFiltradas.length === 0"
          >
            <i class="ph ph-check-square"></i>
            Seleccionar todas
          </button>
          <button 
            @click="limpiarSelecciones" 
            class="action-btn secondary"
            :disabled="seleccionadas.length === 0"
          >
            <i class="ph ph-square"></i>
            Limpiar selección
          </button>
        </div>
      </div>

      <!-- Lista de taxonomías rediseñada completamente -->
      <div class="taxonomias-grid">
        <transition-group name="taxonomia-item" tag="div" class="grid-container">
          <div 
            v-for="taxonomia in taxonomiasFiltradas" 
            :key="taxonomia.ID_Incidente"
            class="taxonomia-card"
            :class="{
              'selected': estaSeleccionada(taxonomia.ID_Incidente),
              'has-files': tieneArchivos(taxonomia.ID_Incidente),
              'has-comments': tieneComentarios(taxonomia.ID_Incidente)
            }"
            @click="toggleSeleccion(taxonomia.ID_Incidente)"
          >
            <!-- Barra superior con indicadores -->
            <div class="card-indicators">
              <div class="tipo-indicator" :class="getBadgeClass(taxonomia.AplicaTipoEmpresa)"></div>
              <div class="anci-indicator" v-if="taxonomia.RequiereReporteANCI">
                <i class="ph ph-warning-circle"></i>
                <span>ANCI</span>
              </div>
            </div>

            <!-- Checkbox principal -->
            <div class="checkbox-container">
              <input autocomplete="off" type="checkbox" 
                :checked="estaSeleccionada(taxonomia.ID_Incidente)"
                @click.stop="toggleSeleccion(taxonomia.ID_Incidente)"
                class="taxonomia-checkbox"
                :id="`tax-${taxonomia.ID_Incidente}`"
              />
              <label :for="`tax-${taxonomia.ID_Incidente}`" class="checkbox-label">
                <div class="checkbox-check">
                  <i class="ph ph-check"></i>
                </div>
              </label>
            </div>

            <!-- Código identificador -->
            <div class="codigo-section">
              <div class="codigo-badge">{{ taxonomia.CodigoTaxonomia }}</div>
            </div>

            <!-- Contenido principal de la taxonomía -->
            <div class="taxonomia-main">
              <!-- Línea concatenada principal -->
              <div class="taxonomia-linea">
                {{ taxonomia.TaxonomiaCompleta }}
              </div>

              <!-- Desglose detallado -->
              <div class="taxonomia-desglose">
                <div class="desglose-item area">
                  <span class="desglose-label">Área:</span>
                  <span class="desglose-valor">{{ taxonomia.Area }}</span>
                </div>
                <div class="desglose-item efecto">
                  <span class="desglose-label">Efecto:</span>
                  <span class="desglose-valor">{{ taxonomia.Efecto }}</span>
                </div>
                <div class="desglose-item categoria">
                  <span class="desglose-label">Categoría:</span>
                  <span class="desglose-valor">{{ taxonomia.Categoria_del_Incidente }}</span>
                </div>
                <div v-if="taxonomia.Subcategoria_del_Incidente" class="desglose-item subcategoria">
                  <span class="desglose-label">Subcategoría:</span>
                  <span class="desglose-valor">{{ taxonomia.Subcategoria_del_Incidente }}</span>
                </div>
              </div>
            </div>

            <!-- Footer con gestión de archivos y comentarios -->
            <div v-if="estaSeleccionada(taxonomia.ID_Incidente)" class="card-footer">
              <div class="footer-section files">
                <div class="section-header">
                  <i class="ph ph-paperclip"></i>
                  <span>Evidencias</span>
                  <div class="file-count">{{ contarArchivos(taxonomia.ID_Incidente) }}</div>
                </div>
                <div class="file-upload">
                  <input autocomplete="off" type="file" 
                    multiple
                    :id="`files-${taxonomia.ID_Incidente}`"
                    @change="manejarArchivos(taxonomia.ID_Incidente, $event)"
                    class="file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                  />
                  <label :for="`files-${taxonomia.ID_Incidente}`" class="file-label">
                    <i class="ph ph-cloud-arrow-up"></i>
                    <span>Agregar archivos</span>
                  </label>
                </div>
                
                <!-- Lista de archivos subidos -->
                <div v-if="archivos[taxonomia.ID_Incidente]?.length > 0" class="files-list">
                  <div 
                    v-for="archivo in archivos[taxonomia.ID_Incidente]" 
                    :key="archivo.id"
                    class="file-item"
                  >
                    <i :class="getIconoArchivo(archivo.type)" class="file-icon"></i>
                    <div class="file-info">
                      <div class="file-name">{{ archivo.name }}</div>
                      <div class="file-meta">
                        <span class="file-size">{{ formatearTamano(archivo.size) }}</span>
                        <span class="file-version">v{{ archivo.version || 1 }}</span>
                      </div>
                    </div>
                    <button @click="eliminarArchivo(taxonomia.ID_Incidente, archivo.id)" class="file-remove">
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="footer-section comments">
                <div class="section-header">
                  <i class="ph ph-chat-text"></i>
                  <span>Comentarios</span>
                  <div class="comment-count">{{ contarComentarios(taxonomia.ID_Incidente) }}</div>
                </div>
                <div class="comment-form">
                  <textarea autocomplete="off" v-model="comentarios[taxonomia.ID_Incidente]"
                    placeholder="Agregar observaciones específicas..."
                    class="comment-textarea"
                    rows="2"
                  ></textarea>
                  <button 
                    @click="guardarComentario(taxonomia.ID_Incidente)"
                    class="comment-save"
                    :disabled="!comentarios[taxonomia.ID_Incidente]?.trim()"
                  >
                    <i class="ph ph-paper-plane-right"></i>
                  </button>
                </div>

                <!-- Historial de comentarios -->
                <div v-if="historialComentarios[taxonomia.ID_Incidente]?.length > 0" class="comments-history">
                  <div 
                    v-for="comentario in historialComentarios[taxonomia.ID_Incidente].slice(0, 2)" 
                    :key="comentario.id"
                    class="comment-item"
                  >
                    <div class="comment-meta">
                      <span class="comment-version">v{{ comentario.version }}</span>
                      <span class="comment-date">{{ formatearFecha(comentario.fecha) }}</span>
                    </div>
                    <div class="comment-text">{{ comentario.texto }}</div>
                  </div>
                  <button 
                    v-if="historialComentarios[taxonomia.ID_Incidente].length > 2"
                    class="show-more-comments"
                  >
                    Ver {{ historialComentarios[taxonomia.ID_Incidente].length - 2 }} más...
                  </button>
                </div>
              </div>
            </div>

            <!-- Overlay de selección -->
            <div v-if="estaSeleccionada(taxonomia.ID_Incidente)" class="selection-overlay">
              <div class="selection-check">
                <i class="ph ph-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- Resumen final -->
      <div v-if="seleccionadas.length > 0" class="summary-panel">
        <div class="summary-content">
          <div class="summary-stats">
            <div class="summary-item">
              <i class="ph ph-check-circle"></i>
              <span>{{ seleccionadas.length }} taxonomías seleccionadas</span>
            </div>
            <div class="summary-item">
              <i class="ph ph-paperclip"></i>
              <span>{{ totalArchivos }} archivos cargados</span>
            </div>
            <div class="summary-item">
              <i class="ph ph-chat-text"></i>
              <span>{{ totalComentarios }} comentarios agregados</span>
            </div>
          </div>
          <div class="summary-actions">
            <button @click="exportarSeleccion" class="export-btn">
              <i class="ph ph-download"></i>
              Exportar selección
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-illustration">
        <i class="ph ph-tree-structure"></i>
        <div class="empty-particles">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
      </div>
      <h4>Sin taxonomías disponibles</h4>
      <p>No hay taxonomías configuradas para empresas tipo <strong>{{ tipoEmpresa }}</strong></p>
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
const filtroCategoria = ref('')

// Datos de gestión
const comentarios = reactive({})
const archivos = reactive({})
const historialComentarios = reactive({})

// Computed
const taxonomiasFiltradas = computed(() => {
  let filtradas = taxonomias.value

  // Filtro por texto
  if (filtroTexto.value.trim()) {
    const filtro = filtroTexto.value.toLowerCase()
    filtradas = filtradas.filter(t => 
      t.TaxonomiaCompleta.toLowerCase().includes(filtro) ||
      t.Area.toLowerCase().includes(filtro) ||
      t.Efecto.toLowerCase().includes(filtro) ||
      t.Categoria_del_Incidente.toLowerCase().includes(filtro) ||
      t.CodigoTaxonomia.toLowerCase().includes(filtro)
    )
  }

  // Filtro por categoría
  if (filtroCategoria.value) {
    filtradas = filtradas.filter(t => t.Area === filtroCategoria.value)
  }

  return filtradas
})

const categoriasUnicas = computed(() => {
  const categorias = [...new Set(taxonomias.value.map(t => t.Area))]
  return categorias.sort()
})

const totalArchivos = computed(() => {
  return Object.values(archivos).reduce((total, archivosArray) => total + archivosArray.length, 0)
})

const totalComentarios = computed(() => {
  return Object.values(historialComentarios).reduce((total, comentariosArray) => total + comentariosArray.length, 0)
})

// Métodos principales
const cargarTaxonomias = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Asegurar que siempre se use un valor válido para tipo_empresa
    const tipoEmpresaSeguro = props.tipoEmpresa || 'PSE'
    console.log('🏷️ Cargando taxonomías para tipo empresa:', tipoEmpresaSeguro)
    
    const response = await apiClient.get(`/admin/taxonomias/jerarquica?tipo_empresa=${tipoEmpresaSeguro}`)
    taxonomias.value = response.data
    
    if (response.data.length === 0) {
      error.value = `No se encontraron taxonomías para empresas tipo ${tipoEmpresaSeguro}`
    }
    
    console.log('🏷️ Taxonomías cargadas:', response.data.length)
    
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
    comentarios[taxonomiaId] = ''
    archivos[taxonomiaId] = []
    historialComentarios[taxonomiaId] = []
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

const seleccionarTodas = () => {
  taxonomiasFiltradas.value.forEach(taxonomia => {
    if (!estaSeleccionada(taxonomia.ID_Incidente)) {
      agregarSeleccion(taxonomia.ID_Incidente)
    }
  })
}

const limpiarSelecciones = () => {
  seleccionadas.value = []
  Object.keys(comentarios).forEach(key => delete comentarios[key])
  Object.keys(archivos).forEach(key => delete archivos[key])
  Object.keys(historialComentarios).forEach(key => delete historialComentarios[key])
  emitirCambios()
}

// Gestión de archivos
const manejarArchivos = (taxonomiaId, event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
      return
    }
    
    // Agregar archivo con versionado automático
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
  })
  
  // Limpiar input
  event.target.value = ''
  emit('evidencia-subida', { taxonomiaId, archivos: files })
}

const eliminarArchivo = (taxonomiaId, archivoId) => {
  if (archivos[taxonomiaId]) {
    archivos[taxonomiaId] = archivos[taxonomiaId].filter(a => a.id !== archivoId)
  }
}

// Gestión de comentarios
const guardarComentario = (taxonomiaId) => {
  const comentario = comentarios[taxonomiaId]?.trim()
  if (!comentario) return
  
  // Agregar al historial con versionado
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
}

// Utilidades
const emitirCambios = () => {
  emit('categorias-changed', seleccionadas.value)
}

const contarPorCategoria = (categoria) => {
  if (categoria === 'Todas') return taxonomias.value.length
  return taxonomias.value.filter(t => t.Area === categoria).length
}

const tieneArchivos = (taxonomiaId) => {
  return archivos[taxonomiaId]?.length > 0
}

const tieneComentarios = (taxonomiaId) => {
  return historialComentarios[taxonomiaId]?.length > 0
}

const contarArchivos = (taxonomiaId) => {
  return archivos[taxonomiaId]?.length || 0
}

const contarComentarios = (taxonomiaId) => {
  return historialComentarios[taxonomiaId]?.length || 0
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

const exportarSeleccion = () => {
  // TODO: Implementar exportación
  console.log('Exportando selección:', seleccionadas.value)
}

// Watchers e inicialización
watch(() => props.tipoEmpresa, cargarTaxonomias, { immediate: true })

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
  console.log('🏷️ TaxonomiaIncidentesEspectacular montado')
  console.log('Tipo empresa:', props.tipoEmpresa)
  console.log('Incidente ID:', props.incidenteId)
})
</script>

<style scoped>
/* Contenedor principal */
.taxonomia-espectacular {
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
}

/* Header futurista */
.taxonomia-header {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #f59e0b, #10b981);
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-container {
  position: relative;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 1rem;
  font-size: 2rem;
  color: white;
}

.icon-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.1; }
}

.header-text {
  color: white;
}

.header-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.empresa-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.badge-oiv { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-pse { background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
.badge-ambas { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  min-width: 5rem;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Loading state */
.loading-state {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.cyber-loader {
  position: relative;
  width: 4rem;
  height: 4rem;
}

.cyber-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.cyber-ring:nth-child(2) {
  animation-delay: 0.3s;
  border-top-color: #7c3aed;
  transform: scale(0.8);
}

.cyber-ring:nth-child(3) {
  animation-delay: 0.6s;
  border-top-color: #ec4899;
  transform: scale(0.6);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 1.125rem;
  font-weight: 500;
}

.loading-dots {
  display: flex;
  gap: 0.25rem;
}

.loading-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: #4f46e5;
  border-radius: 50%;
  animation: loadingDot 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes loadingDot {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* Error state */
.error-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #f87171;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.error-content h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.error-content p {
  margin-bottom: 2rem;
  color: #94a3b8;
}

.retry-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

/* Panel de control */
.control-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-container {
  flex: 1;
}

.search-box {
  position: relative;
  max-width: 32rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1.125rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
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

.search-clear {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.search-clear:hover {
  color: white;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.filter-tab.active {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-color: #7c3aed;
  color: white;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Grid de taxonomías */
.taxonomias-grid {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.taxonomia-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.taxonomia-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #4f46e5, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.taxonomia-card:hover {
  transform: translateY(-4px);
  border-color: rgba(79, 70, 229, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.taxonomia-card:hover::before {
  opacity: 1;
}

.taxonomia-card.selected {
  background: rgba(79, 70, 229, 0.1);
  border-color: #4f46e5;
  transform: translateY(-2px);
}

.taxonomia-card.selected::before {
  opacity: 1;
}

.taxonomia-card.has-files {
  border-right: 4px solid #10b981;
}

.taxonomia-card.has-comments {
  border-left: 4px solid #f59e0b;
}

.card-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tipo-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.tipo-indicator.badge-oiv { background: #ef4444; }
.tipo-indicator.badge-pse { background: #22c55e; }
.tipo-indicator.badge-ambas { background: #3b82f6; }

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

.checkbox-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.taxonomia-checkbox {
  display: none;
}

.checkbox-label {
  display: block;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
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
  font-size: 1rem;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
}

.taxonomia-checkbox:checked + .checkbox-label {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-color: #7c3aed;
}

.taxonomia-checkbox:checked + .checkbox-label .checkbox-check {
  opacity: 1;
  transform: scale(1);
}

.codigo-section {
  margin-bottom: 1rem;
}

.codigo-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', monospace;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
}

.taxonomia-main {
  margin-bottom: 1.5rem;
}

.taxonomia-linea {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  line-height: 1.4;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  border-left: 4px solid #4f46e5;
}

.taxonomia-desglose {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.desglose-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.desglose-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 5rem;
  flex-shrink: 0;
}

.desglose-valor {
  font-size: 0.875rem;
  color: #e2e8f0;
  line-height: 1.4;
}

.desglose-item.area .desglose-valor { color: #fbbf24; }
.desglose-item.efecto .desglose-valor { color: #a78bfa; }
.desglose-item.categoria .desglose-valor { color: #34d399; }
.desglose-item.subcategoria .desglose-valor { color: #fb7185; }

/* Footer de la tarjeta */
.card-footer {
  background: rgba(0, 0, 0, 0.2);
  margin: 1rem -1.5rem -1.5rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
}

.section-header i {
  color: #4f46e5;
}

.file-count, .comment-count {
  background: rgba(79, 70, 229, 0.2);
  color: #a5b4fc;
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 1.5rem;
  text-align: center;
}

.file-upload {
  position: relative;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.file-label:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #4f46e5;
  color: white;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 8rem;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-icon {
  color: #4f46e5;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  word-break: break-word;
}

.file-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.625rem;
  color: #64748b;
  margin-top: 0.125rem;
}

.file-version {
  background: #22c55e;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.file-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.file-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

.comment-form {
  display: flex;
  gap: 0.5rem;
}

.comment-textarea {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  resize: none;
  transition: border-color 0.2s;
}

.comment-textarea::placeholder {
  color: #64748b;
}

.comment-textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.comment-save {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  padding: 0.75rem;
  transition: all 0.2s;
}

.comment-save:hover:not(:disabled) {
  transform: scale(1.05);
}

.comment-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.comments-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 8rem;
  overflow-y: auto;
}

.comment-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.625rem;
  color: #64748b;
}

.comment-version {
  background: #f59e0b;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.comment-text {
  font-size: 0.75rem;
  color: #e2e8f0;
  line-height: 1.4;
}

.show-more-comments {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem;
  text-align: left;
}

/* Overlay de selección */
.selection-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 0 1rem 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  opacity: 0.9;
}

/* Panel de resumen */
.summary-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-stats {
  display: flex;
  gap: 2rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-item i {
  color: #4f46e5;
}

.export-btn {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

/* Estado vacío */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #94a3b8;
  position: relative;
}

.empty-illustration {
  position: relative;
  font-size: 6rem;
  margin-bottom: 2rem;
  opacity: 0.3;
}

.empty-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  background: #4f46e5;
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
}

.particle:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

.particle:nth-child(3) {
  bottom: 20%;
  left: 50%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
}

.empty-state h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

/* Transiciones */
.taxonomia-item-enter-active,
.taxonomia-item-leave-active {
  transition: all 0.5s ease;
}

.taxonomia-item-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.taxonomia-item-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.9);
}

.taxonomia-item-move {
  transition: transform 0.5s ease;
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .control-panel {
    gap: 1rem;
  }
  
  .filter-tabs {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .taxonomia-header {
    padding: 1.5rem;
  }
  
  .header-left {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .card-footer {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .summary-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .taxonomias-grid {
    padding: 1rem;
  }
  
  .taxonomia-card {
    padding: 1rem;
  }
  
  .control-panel {
    padding: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .filter-tabs {
    gap: 0.25rem;
  }
  
  .filter-tab {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>