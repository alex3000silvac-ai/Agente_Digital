<template>
  <div class="taxonomia-avanzada">
    <!-- Header espectacular -->
    <div class="taxonomia-header">
      <div class="header-content">
        <div class="header-info">
          <h3 class="header-title">
            <i class="ph ph-tree-structure"></i>
            Taxonomías de Incidentes
          </h3>
          <p class="header-subtitle">
            Seleccione las taxonomías aplicables y gestione evidencias con control de versiones
            <span class="tipo-badge" :class="getBadgeClass(tipoEmpresa)">{{ tipoEmpresa }}</span>
          </p>
        </div>
        <div class="header-stats" v-if="taxonomias.length > 0">
          <div class="stat-item">
            <span class="stat-number">{{ taxonomias.length }}</span>
            <span class="stat-label">Disponibles</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ seleccionadas.length }}</span>
            <span class="stat-label">Seleccionadas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estados de carga/error -->
    <div v-if="loading" class="estado-loading">
      <div class="loading-spinner"></div>
      <p>Cargando taxonomías disponibles...</p>
    </div>

    <div v-else-if="error" class="estado-error">
      <i class="ph ph-warning-circle"></i>
      <p>{{ error }}</p>
      <button @click="cargarTaxonomias" class="btn-retry">
        <i class="ph ph-arrow-clockwise"></i>
        Reintentar
      </button>
    </div>

    <!-- Lista de taxonomías -->
    <div v-else-if="taxonomias.length > 0" class="taxonomias-container">
      
      <!-- Controles superiores -->
      <div class="controles-superiores">
        <div class="busqueda-container">
          <i class="ph ph-magnifying-glass"></i>
          <input autocomplete="off" v-model="filtroTexto" 
            placeholder="Buscar en taxonomías..."
            class="busqueda-input"
          />
        </div>
        <div class="acciones-masivas">
          <button 
            @click="seleccionarTodas" 
            class="btn-accion"
            :disabled="taxonomiasFiltradas.length === 0"
          >
            <i class="ph ph-check-square"></i>
            Seleccionar todas
          </button>
          <button 
            @click="limpiarSelecciones" 
            class="btn-accion secondary"
            :disabled="seleccionadas.length === 0"
          >
            <i class="ph ph-square"></i>
            Limpiar selección
          </button>
        </div>
      </div>

      <!-- Header de tabla -->
      <div class="tabla-header">
        <div class="col-checkbox">
          <input autocomplete="off" type="checkbox" 
            :checked="todasSeleccionadas"
            @change="toggleSeleccionarTodas"
            class="checkbox-master"
          />
        </div>
        <div class="col-codigo">ID</div>
        <div class="col-taxonomia">Taxonomía Completa</div>
        <div class="col-tipo">Tipo</div>
        <div class="col-evidencias">Evidencias</div>
        <div class="col-comentarios">Comentarios</div>
        <div class="col-acciones">Acciones</div>
      </div>

      <!-- Filas de taxonomías -->
      <div class="tabla-body">
        <div 
          v-for="taxonomia in taxonomiasFiltradas" 
          :key="taxonomia.Id_Incidente"
          class="taxonomia-row"
          :class="{ 
            'seleccionada': estaSeleccionada(taxonomia.Id_Incidente),
            'con-evidencias': tieneEvidencias(taxonomia.Id_Incidente),
            'con-comentarios': tieneComentarios(taxonomia.Id_Incidente)
          }"
        >
          <!-- Fila principal -->
          <div class="row-principal" @click="toggleSeleccion(taxonomia.Id_Incidente)">
            <!-- Checkbox -->
            <div class="col-checkbox">
              <input autocomplete="off" type="checkbox" 
                :checked="estaSeleccionada(taxonomia.Id_Incidente)"
                @click.stop="toggleSeleccion(taxonomia.Id_Incidente)"
                class="checkbox-row"
              />
            </div>
            
            <!-- Código ID -->
            <div class="col-codigo">
              <span class="codigo-badge">{{ taxonomia.Id_Incidente }}</span>
            </div>
            
            <!-- Taxonomía completa (Area + Efecto + Categoría + Subcategoría) -->
            <div class="col-taxonomia">
              <div class="taxonomia-completa">
                <div class="taxonomia-principal">{{ taxonomia.TaxonomiaCompleta }}</div>
                <div class="taxonomia-detalle">
                  <span class="detalle-item"><strong>Área:</strong> {{ taxonomia.Area }}</span>
                  <span class="detalle-item"><strong>Efecto:</strong> {{ taxonomia.Efecto }}</span>
                  <span class="detalle-item"><strong>Categoría:</strong> {{ taxonomia.Categoria_del_Incidente }}</span>
                  <span v-if="taxonomia.Subcategoria_del_Incidente" class="detalle-item">
                    <strong>Subcategoría:</strong> {{ taxonomia.Subcategoria_del_Incidente }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Tipo de empresa -->
            <div class="col-tipo">
              <span class="tipo-badge" :class="getBadgeClass(taxonomia.AplicaTipoEmpresa)">
                {{ taxonomia.AplicaTipoEmpresa }}
              </span>
            </div>
            
            <!-- Contador de evidencias -->
            <div class="col-evidencias">
              <div class="contador-item">
                <i class="ph ph-paperclip"></i>
                <span>{{ contarEvidencias(taxonomia.Id_Incidente) }}</span>
              </div>
            </div>
            
            <!-- Contador de comentarios -->
            <div class="col-comentarios">
              <div class="contador-item">
                <i class="ph ph-chat-text"></i>
                <span>{{ contarComentarios(taxonomia.Id_Incidente) }}</span>
              </div>
            </div>
            
            <!-- Acciones -->
            <div class="col-acciones">
              <button 
                v-if="estaSeleccionada(taxonomia.Id_Incidente)"
                @click.stop="toggleGestion(taxonomia.Id_Incidente)"
                class="btn-gestionar"
                :class="{ 'active': gestionAbierta === taxonomia.Id_Incidente }"
              >
                <i class="ph" :class="gestionAbierta === taxonomia.Id_Incidente ? 'ph-caret-up' : 'ph-gear'"></i>
                <span>{{ gestionAbierta === taxonomia.Id_Incidente ? 'Cerrar' : 'Gestionar' }}</span>
              </button>
            </div>
          </div>

          <!-- Panel de gestión expandible -->
          <transition name="panel-slide">
            <div 
              v-if="estaSeleccionada(taxonomia.Id_Incidente) && gestionAbierta === taxonomia.Id_Incidente" 
              class="panel-gestion"
            >
              <div class="gestion-content">
                <!-- Sección de comentarios -->
                <div class="gestion-seccion">
                  <h4 class="seccion-titulo">
                    <i class="ph ph-chat-text"></i>
                    Comentarios y observaciones
                  </h4>
                  
                  <div class="comentario-form">
                    <textarea autocomplete="off" v-model="comentarios[taxonomia.Id_Incidente]"
                      placeholder="Agregar comentarios específicos sobre esta taxonomía..."
                      class="comentario-textarea"
                      rows="3"
                    ></textarea>
                    <button 
                      @click="guardarComentario(taxonomia.Id_Incidente)"
                      class="btn-guardar-comentario"
                      :disabled="!comentarios[taxonomia.Id_Incidente]?.trim()"
                    >
                      <i class="ph ph-floppy-disk"></i>
                      Guardar comentario
                    </button>
                  </div>

                  <!-- Historial de comentarios -->
                  <div v-if="historialComentarios[taxonomia.Id_Incidente]?.length > 0" class="historial-comentarios">
                    <h5 class="historial-titulo">Historial de comentarios</h5>
                    <div class="comentarios-lista">
                      <div 
                        v-for="comentario in historialComentarios[taxonomia.Id_Incidente]" 
                        :key="comentario.ComentarioID"
                        class="comentario-item"
                      >
                        <div class="comentario-header">
                          <span class="comentario-version">v{{ comentario.Version }}</span>
                          <span class="comentario-fecha">{{ formatearFecha(comentario.FechaCreacion) }}</span>
                          <span class="comentario-autor">{{ comentario.CreadoPor }}</span>
                        </div>
                        <div class="comentario-texto">{{ comentario.Comentario }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sección de evidencias -->
                <div class="gestion-seccion">
                  <h4 class="seccion-titulo">
                    <i class="ph ph-paperclip"></i>
                    Evidencias y documentos de soporte
                  </h4>

                  <!-- Upload de archivos -->
                  <div class="upload-zone">
                    <input autocomplete="off" type="file" 
                      multiple
                      :id="`file-${taxonomia.Id_Incidente}`"
                      @change="manejarArchivos(taxonomia.Id_Incidente, $event)"
                      class="upload-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                    />
                    <label :for="`file-${taxonomia.Id_Incidente}`" class="upload-label">
                      <i class="ph ph-cloud-arrow-up"></i>
                      <span>Seleccionar archivos</span>
                      <small>PDF, DOC, IMG, XLS, TXT (máx. 10MB c/u)</small>
                    </label>
                  </div>

                  <!-- Lista de evidencias -->
                  <div v-if="historialEvidencias[taxonomia.Id_Incidente]?.length > 0" class="evidencias-lista">
                    <h5 class="historial-titulo">Archivos subidos (con versionado)</h5>
                    <div class="archivos-grid">
                      <div 
                        v-for="evidencia in historialEvidencias[taxonomia.Id_Incidente]" 
                        :key="evidencia.EvidenciaID"
                        class="archivo-card"
                      >
                        <div class="archivo-header">
                          <i :class="getIconoArchivo(evidencia.TipoArchivo)" class="archivo-icono"></i>
                          <div class="archivo-info">
                            <div class="archivo-nombre">{{ evidencia.NombreArchivoOriginal }}</div>
                            <div class="archivo-meta">
                              <span class="archivo-version">v{{ evidencia.Version }}</span>
                              <span class="archivo-tamano">{{ formatearTamano(evidencia.TamanoArchivo) }}</span>
                              <span class="archivo-fecha">{{ formatearFecha(evidencia.FechaSubida) }}</span>
                            </div>
                          </div>
                        </div>
                        <div v-if="evidencia.Comentario" class="archivo-comentario">
                          {{ evidencia.Comentario }}
                        </div>
                        <div class="archivo-acciones">
                          <button class="btn-descargar" title="Descargar archivo">
                            <i class="ph ph-download"></i>
                          </button>
                          <button class="btn-eliminar" title="Eliminar versión">
                            <i class="ph ph-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="estado-vacio">
      <i class="ph ph-tree-structure"></i>
      <p>No hay taxonomías disponibles para empresas tipo {{ tipoEmpresa }}</p>
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
const gestionAbierta = ref(null)
const filtroTexto = ref('')

// Datos de gestión
const comentarios = reactive({})
const historialComentarios = reactive({})
const historialEvidencias = reactive({})

// Computed
const taxonomiasFiltradas = computed(() => {
  if (!filtroTexto.value.trim()) return taxonomias.value
  
  const filtro = filtroTexto.value.toLowerCase()
  return taxonomias.value.filter(t => 
    t.TaxonomiaCompleta.toLowerCase().includes(filtro) ||
    t.Area.toLowerCase().includes(filtro) ||
    t.Efecto.toLowerCase().includes(filtro) ||
    t.Categoria_del_Incidente.toLowerCase().includes(filtro)
  )
})

const todasSeleccionadas = computed(() => {
  return taxonomiasFiltradas.value.length > 0 && 
         taxonomiasFiltradas.value.every(t => estaSeleccionada(t.Id_Incidente))
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
    cargarHistorial(taxonomiaId)
    emitirCambios()
  }
}

const removerSeleccion = (taxonomiaId) => {
  const index = seleccionadas.value.indexOf(taxonomiaId)
  if (index > -1) {
    seleccionadas.value.splice(index, 1)
    delete comentarios[taxonomiaId]
    delete historialComentarios[taxonomiaId]
    delete historialEvidencias[taxonomiaId]
    if (gestionAbierta.value === taxonomiaId) {
      gestionAbierta.value = null
    }
    emitirCambios()
  }
}

const seleccionarTodas = () => {
  taxonomiasFiltradas.value.forEach(taxonomia => {
    if (!estaSeleccionada(taxonomia.Id_Incidente)) {
      agregarSeleccion(taxonomia.Id_Incidente)
    }
  })
}

const limpiarSelecciones = () => {
  seleccionadas.value = []
  Object.keys(comentarios).forEach(key => delete comentarios[key])
  Object.keys(historialComentarios).forEach(key => delete historialComentarios[key])
  Object.keys(historialEvidencias).forEach(key => delete historialEvidencias[key])
  gestionAbierta.value = null
  emitirCambios()
}

const toggleSeleccionarTodas = () => {
  if (todasSeleccionadas.value) {
    limpiarSelecciones()
  } else {
    seleccionarTodas()
  }
}

const toggleGestion = (taxonomiaId) => {
  if (gestionAbierta.value === taxonomiaId) {
    gestionAbierta.value = null
  } else {
    gestionAbierta.value = taxonomiaId
    cargarHistorial(taxonomiaId)
  }
}

// Gestión de comentarios
const guardarComentario = async (taxonomiaId) => {
  const comentario = comentarios[taxonomiaId]?.trim()
  if (!comentario || !props.incidenteId) return
  
  try {
    await apiClient.post(`/admin/taxonomias/${taxonomiaId}/comentarios`, {
      comentario: comentario,
      incidente_id: props.incidenteId
    })
    
    // Limpiar el campo y recargar historial
    comentarios[taxonomiaId] = ''
    await cargarHistorial(taxonomiaId)
    
    emit('comentario-agregado', { taxonomiaId, comentario })
    
  } catch (err) {
    console.error('Error al guardar comentario:', err)
    alert('Error al guardar el comentario: ' + (err.response?.data?.error || err.message))
  }
}

// Gestión de archivos
const manejarArchivos = async (taxonomiaId, event) => {
  // Validar que el incidenteId existe y es válido
  if (!props.incidenteId || props.incidenteId === 'undefined' || props.incidenteId === undefined || props.incidenteId === null) {
    alert('Se requiere ID de incidente válido para subir archivos')
    console.warn('🚨 Intento de subir archivos con incidenteId inválido:', props.incidenteId)
    return
  }
  
  const files = Array.from(event.target.files)
  
  for (const file of files) {
    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
      continue
    }
    
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      formData.append('incidente_id', props.incidenteId)
      formData.append('comentario', `Evidencia para taxonomía ${taxonomiaId}`)
      
      await apiClient.post(`/admin/taxonomias/${taxonomiaId}/evidencias`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      emit('evidencia-subida', { taxonomiaId, archivo: file })
      
    } catch (err) {
      console.error('Error al subir archivo:', err)
      alert(`Error al subir ${file.name}: ` + (err.response?.data?.error || err.message))
    }
  }
  
  // Limpiar input y recargar historial
  event.target.value = ''
  await cargarHistorial(taxonomiaId)
}

// Cargar historial
const cargarHistorial = async (taxonomiaId) => {
  // Validar que el incidenteId existe y es válido
  if (!props.incidenteId || props.incidenteId === 'undefined' || props.incidenteId === undefined || props.incidenteId === null) {
    console.warn('🚨 Intento de cargar historial con incidenteId inválido:', props.incidenteId)
    return
  }
  
  try {
    const response = await apiClient.get(`/admin/taxonomias/${taxonomiaId}/historial?incidente_id=${props.incidenteId}`)
    historialComentarios[taxonomiaId] = response.data.comentarios || []
    historialEvidencias[taxonomiaId] = response.data.evidencias || []
  } catch (err) {
    console.error('Error al cargar historial:', err)
  }
}

// Utilidades
const emitirCambios = () => {
  emit('categorias-changed', seleccionadas.value)
}

const tieneEvidencias = (taxonomiaId) => {
  return historialEvidencias[taxonomiaId]?.length > 0
}

const tieneComentarios = (taxonomiaId) => {
  return historialComentarios[taxonomiaId]?.length > 0
}

const contarEvidencias = (taxonomiaId) => {
  return historialEvidencias[taxonomiaId]?.length || 0
}

const contarComentarios = (taxonomiaId) => {
  return historialComentarios[taxonomiaId]?.length || 0
}

const getBadgeClass = (tipo) => {
  const classes = {
    'OIV': 'badge-oiv',
    'PSE': 'badge-pse',
    'Ambos': 'badge-ambos'
  }
  return classes[tipo] || 'badge-ambos'
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

const formatearFecha = (isoDate) => {
  if (!isoDate) return 'N/A'
  try {
    return new Date(isoDate).toLocaleDateString('es-CL', {
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
watch(() => props.tipoEmpresa, cargarTaxonomias, { immediate: true })

watch(() => props.categoriasIniciales, (nuevasCategorias) => {
  if (nuevasCategorias && nuevasCategorias.length > 0) {
    seleccionadas.value = [...nuevasCategorias]
    nuevasCategorias.forEach(taxonomiaId => {
      if (!comentarios[taxonomiaId]) comentarios[taxonomiaId] = ''
      cargarHistorial(taxonomiaId)
    })
  }
}, { immediate: true })

onMounted(() => {
  console.log('🏷️ Componente TaxonomiaIncidentesAvanzada montado')
  console.log('Tipo empresa:', props.tipoEmpresa)
  console.log('Incidente ID:', props.incidenteId)
})
</script>

<style scoped>
/* Contenedor principal */
.taxonomia-avanzada {
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Header espectacular */
.taxonomia-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.taxonomia-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
}

.header-info {
  flex: 1;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.header-title i {
  font-size: 1.75rem;
  color: #4f46e5;
}

.header-subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  font-size: 0.625rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Badges */
.tipo-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-oiv { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-pse { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); }
.badge-ambos { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }

/* Estados */
.estado-loading, .estado-error, .estado-vacio {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #64748b;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.estado-error {
  color: #dc2626;
}

.estado-error i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #b91c1c;
}

/* Controles superiores */
.controles-superiores {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.busqueda-container {
  flex: 1;
  max-width: 24rem;
  position: relative;
}

.busqueda-container i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.busqueda-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.busqueda-input:focus {
  outline: none;
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.acciones-masivas {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-accion:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #4f46e5;
  color: #4f46e5;
}

.btn-accion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-accion.secondary {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Tabla */
.tabla-header {
  display: grid;
  grid-template-columns: 50px 80px 1fr 100px 100px 120px 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tabla-body {
  background: white;
  max-height: 60vh;
  overflow-y: auto;
}

.taxonomia-row {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.taxonomia-row:hover .row-principal {
  background: #f8fafc;
}

.taxonomia-row.seleccionada {
  background: rgba(79, 70, 229, 0.02);
  border-left: 4px solid #4f46e5;
}

.taxonomia-row.con-evidencias {
  border-right: 4px solid #22c55e;
}

.taxonomia-row.con-comentarios {
  border-right: 4px solid #f59e0b;
}

.row-principal {
  display: grid;
  grid-template-columns: 50px 80px 1fr 100px 100px 120px 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  align-items: center;
}

.col-checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkbox-master, .checkbox-row {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: #4f46e5;
  cursor: pointer;
}

.col-codigo {
  display: flex;
  align-items: center;
}

.codigo-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', monospace;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.col-taxonomia {
  min-width: 0;
}

.taxonomia-completa {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.taxonomia-principal {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  line-height: 1.3;
}

.taxonomia-detalle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detalle-item {
  font-size: 0.75rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
}

.detalle-item strong {
  color: #374151;
}

.col-tipo {
  display: flex;
  justify-content: center;
}

.col-evidencias, .col-comentarios {
  display: flex;
  justify-content: center;
}

.contador-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #64748b;
  background: #f8fafc;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.col-acciones {
  display: flex;
  justify-content: center;
}

.btn-gestionar {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-gestionar:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.btn-gestionar.active {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-color: #7c3aed;
  color: white;
}

/* Panel de gestión */
.panel-gestion {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.gestion-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.gestion-seccion {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.seccion-titulo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.seccion-titulo i {
  color: #4f46e5;
  font-size: 1.25rem;
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
  min-height: 4rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.comentario-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-guardar-comentario {
  align-self: flex-start;
  padding: 0.75rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-guardar-comentario:hover:not(:disabled) {
  background: #4338ca;
}

.btn-guardar-comentario:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.historial-titulo {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.comentarios-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 15rem;
  overflow-y: auto;
}

.comentario-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.comentario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.comentario-version {
  background: #4f46e5;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.comentario-texto {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

/* Upload de archivos */
.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.upload-zone:hover {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.02);
}

.upload-input {
  display: none;
}

.upload-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  transition: color 0.2s;
}

.upload-label:hover {
  color: #4f46e5;
}

.upload-label i {
  font-size: 2.5rem;
}

.upload-label span {
  font-weight: 600;
  font-size: 0.875rem;
}

.upload-label small {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Lista de evidencias */
.evidencias-lista {
  margin-top: 1rem;
}

.archivos-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 20rem;
  overflow-y: auto;
}

.archivo-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s;
}

.archivo-card:hover {
  border-color: #4f46e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.archivo-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.archivo-icono {
  font-size: 1.5rem;
  color: #4f46e5;
  flex-shrink: 0;
}

.archivo-info {
  flex: 1;
  min-width: 0;
}

.archivo-nombre {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.archivo-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
  flex-wrap: wrap;
}

.archivo-version {
  background: #22c55e;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.archivo-comentario {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.archivo-acciones {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-descargar, .btn-eliminar {
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-descargar {
  color: #22c55e;
}

.btn-descargar:hover {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.btn-eliminar {
  color: #ef4444;
}

.btn-eliminar:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* Transiciones */
.panel-slide-enter-active, .panel-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.panel-slide-enter-from, .panel-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1200px) {
  .gestion-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .tabla-header, .row-principal {
    grid-template-columns: 40px 60px 1fr 80px 80px;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
  
  .col-evidencias, .col-comentarios {
    display: none;
  }
  
  .controles-superiores {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .busqueda-container {
    max-width: none;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .tabla-header {
    display: none;
  }
  
  .row-principal {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .taxonomia-detalle {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>