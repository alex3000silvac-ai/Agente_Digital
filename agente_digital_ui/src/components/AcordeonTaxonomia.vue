<template>
  <div class="clasificacion-taxonomia">
    <!-- Header con información -->
    <div class="seccion-header">
      <h3 class="titulo-seccion">
        <i class="ph ph-tag"></i>
        Clasificación de Taxonomía de Incidentes
      </h3>
      <p class="descripcion-seccion">
        Seleccione las taxonomías que corresponden a este incidente según el tipo de empresa
        <span class="tipo-empresa-badge" :class="getBadgeClass(tipoEmpresa)">{{ tipoEmpresa }}</span>
      </p>
    </div>

    <!-- Estados de carga -->
    <div v-if="loading" class="estado-carga">
      <div class="spinner-load"></div>
      <p>Cargando clasificaciones disponibles...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="estado-error">
      <i class="ph ph-warning-circle"></i>
      <p>{{ error }}</p>
      <button @click="cargarTaxonomias" class="btn-reintentar">
        <i class="ph ph-arrow-clockwise"></i>
        Reintentar
      </button>
    </div>

    <!-- Lista de taxonomías -->
    <div v-else-if="taxonomias.length > 0" class="taxonomias-contenedor">
      <!-- Resumen de selecciones -->
      <div v-if="seleccionadas.length > 0" class="resumen-selecciones">
        <div class="resumen-info">
          <i class="ph ph-check-circle-fill"></i>
          <span>{{ seleccionadas.length }} taxonomía(s) seleccionada(s)</span>
        </div>
        <button @click="limpiarSelecciones" class="btn-limpiar">
          <i class="ph ph-trash"></i>
          Limpiar todo
        </button>
      </div>

      <!-- Lista de taxonomías compacta -->
      <div class="taxonomias-lista">
        <!-- Header de la tabla -->
        <div class="tabla-header">
          <div class="header-checkbox">
            <input autocomplete="off" type="checkbox" 
              :checked="seleccionadas.length === taxonomias.length && taxonomias.length > 0"
              @change="toggleSeleccionarTodas"
              class="checkbox-input"
            />
          </div>
          <div class="header-codigo">Código</div>
          <div class="header-descripcion">Clasificación de Taxonomía</div>
          <div class="header-tipo">Tipo</div>
          <div class="header-anci">ANCI</div>
        </div>

        <!-- Filas de taxonomías -->
        <div class="tabla-body">
          <div 
            v-for="taxonomia in taxonomias" 
            :key="taxonomia.Id_Incidente"
            class="taxonomia-fila"
            :class="{ 'seleccionada': estaSeleccionada(taxonomia.Id_Incidente) }"
            @click="toggleSeleccion(taxonomia.Id_Incidente)"
          >
            <!-- Checkbox -->
            <div class="fila-checkbox">
              <input autocomplete="off" type="checkbox" 
                :checked="estaSeleccionada(taxonomia.Id_Incidente)"
                @click.stop="toggleSeleccion(taxonomia.Id_Incidente)"
                class="checkbox-input"
              />
            </div>
            
            <!-- Código -->
            <div class="fila-codigo">
              <span class="codigo-badge">{{ taxonomia.Id_Incidente }}</span>
            </div>
            
            <!-- Descripción completa -->
            <div class="fila-descripcion">
              <span class="descripcion-texto">{{ taxonomia.TaxonomiaCompleta }}</span>
            </div>
            
            <!-- Tipo de empresa -->
            <div class="fila-tipo">
              <span class="tipo-badge" :class="getBadgeClass(taxonomia.AplicaTipoEmpresa)">
                {{ taxonomia.AplicaTipoEmpresa }}
              </span>
            </div>
            
            <!-- ANCI -->
            <div class="fila-anci">
              <span v-if="taxonomia.RequiereReporteANCI" class="anci-badge">
                <i class="ph ph-warning-circle"></i>
                Sí
              </span>
              <span v-else class="anci-no">-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de gestión -->
      <div v-if="seleccionadas.length > 0" class="panel-gestion">
        <h4 class="gestion-titulo">
          <i class="ph ph-gear"></i>
          Gestión de Taxonomías Seleccionadas
        </h4>

        <div class="gestion-items">
          <div 
            v-for="idTaxonomia in seleccionadas" 
            :key="`gestion-${idTaxonomia}`"
            class="gestion-item"
          >
            <!-- Header del item -->
            <div class="item-header">
              <div class="item-info">
                <span class="item-codigo">{{ idTaxonomia }}</span>
                <span class="item-nombre">{{ getNombreTaxonomia(idTaxonomia) }}</span>
              </div>
              <button @click="removerSeleccion(idTaxonomia)" class="btn-remover">
                <i class="ph ph-x"></i>
              </button>
            </div>

            <!-- Formulario -->
            <div class="item-formulario">
              <!-- Comentarios -->
              <div class="campo-grupo">
                <label class="campo-label">
                  <i class="ph ph-chat-text"></i>
                  Comentarios y observaciones
                </label>
                <textarea autocomplete="off" v-model="comentarios[idTaxonomia]"
                  placeholder="Agregar comentarios específicos sobre esta taxonomía..."
                  class="campo-textarea"
                  rows="3"
                  @input="emitirCambios"
                ></textarea>
              </div>

              <!-- Evidencias -->
              <div class="campo-grupo">
                <label class="campo-label">
                  <i class="ph ph-paperclip"></i>
                  Evidencias y documentos de soporte
                </label>
                
                <!-- Archivos subidos -->
                <div v-if="evidencias[idTaxonomia]?.length > 0" class="archivos-lista">
                  <div 
                    v-for="archivo in evidencias[idTaxonomia]" 
                    :key="archivo.id"
                    class="archivo-item"
                  >
                    <div class="archivo-info">
                      <i :class="getIconoArchivo(archivo.type)" class="archivo-icono"></i>
                      <div class="archivo-detalles">
                        <div class="archivo-nombre">{{ archivo.name }}</div>
                        <div class="archivo-tamano">{{ formatearTamano(archivo.size) }}</div>
                      </div>
                    </div>
                    <button @click="eliminarArchivo(idTaxonomia, archivo.id)" class="btn-eliminar-archivo">
                      <i class="ph ph-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Área de subida -->
                <div class="upload-zone">
                  <input autocomplete="off" type="file" 
                    multiple
                    :id="`file-${idTaxonomia}`"
                    @change="manejarArchivos(idTaxonomia, $event)"
                    class="upload-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx"
                  />
                  <label :for="`file-${idTaxonomia}`" class="upload-button">
                    <i class="ph ph-cloud-arrow-up"></i>
                    <span>Seleccionar archivos</span>
                    <small>PDF, DOC, IMG, TXT (máx. 10MB cada uno)</small>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="estado-vacio">
      <i class="ph ph-files"></i>
      <p>No hay taxonomías disponibles para empresas tipo {{ tipoEmpresa || 'PSE' }}</p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'

export default {
  name: 'ClasificacionTaxonomia',
  props: {
    tipoEmpresa: {
      type: String,
      required: true,
      validator: (value) => value && ['OIV', 'PSE', 'Ambos'].includes(value),
      default: 'PSE'
    },
    categoriasIniciales: {
      type: Array,
      default: () => []
    }
  },
  emits: ['categorias-changed', 'evidencia-subida', 'comentario-agregado'],
  setup(props, { emit }) {
    // Estados reactivos
    const loading = ref(false)
    const error = ref(null)
    const taxonomias = ref([])
    const seleccionadas = ref([])
    
    // Datos de gestión
    const comentarios = reactive({})
    const evidencias = reactive({})

    // Computed para obtener datos completos (para debugging)
    const datosCompletos = computed(() => ({
      seleccionadas: [...seleccionadas.value],
      comentarios: { ...comentarios },
      evidencias: { ...evidencias }
    }))

    // Métodos principales
    const cargarTaxonomias = async () => {
      try {
        loading.value = true
        error.value = null
        
        // Asegurar que siempre se use un valor válido para tipo_empresa
        const tipoEmpresaSeguro = props.tipoEmpresa || 'PSE'
        console.log('Cargando taxonomías para tipo empresa:', tipoEmpresaSeguro)
        
        const response = await fetch(`http://localhost:5000/api/admin/taxonomias/jerarquica?tipo_empresa=${tipoEmpresaSeguro}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Datos recibidos:', data)
        
        taxonomias.value = data
        
        if (data.length === 0) {
          error.value = `No se encontraron taxonomías para empresas tipo ${tipoEmpresaSeguro}`
        }
        
      } catch (err) {
        console.error('Error al cargar taxonomías:', err)
        error.value = err.message || 'Error al cargar las taxonomías'
        taxonomias.value = []
      } finally {
        loading.value = false
      }
    }

    const toggleSeleccion = (idTaxonomia) => {
      if (estaSeleccionada(idTaxonomia)) {
        removerSeleccion(idTaxonomia)
      } else {
        agregarSeleccion(idTaxonomia)
      }
    }

    const estaSeleccionada = (idTaxonomia) => {
      return seleccionadas.value.includes(idTaxonomia)
    }

    const agregarSeleccion = (idTaxonomia) => {
      if (!estaSeleccionada(idTaxonomia)) {
        seleccionadas.value.push(idTaxonomia)
        comentarios[idTaxonomia] = ''
        evidencias[idTaxonomia] = []
        emitirCambios()
      }
    }

    const removerSeleccion = (idTaxonomia) => {
      const index = seleccionadas.value.indexOf(idTaxonomia)
      if (index > -1) {
        seleccionadas.value.splice(index, 1)
        delete comentarios[idTaxonomia]
        delete evidencias[idTaxonomia]
        emitirCambios()
      }
    }

    const limpiarSelecciones = () => {
      seleccionadas.value = []
      Object.keys(comentarios).forEach(key => delete comentarios[key])
      Object.keys(evidencias).forEach(key => delete evidencias[key])
      emitirCambios()
    }

    const toggleSeleccionarTodas = () => {
      if (seleccionadas.value.length === taxonomias.value.length) {
        // Si todas están seleccionadas, deseleccionar todas
        limpiarSelecciones()
      } else {
        // Seleccionar todas
        taxonomias.value.forEach(taxonomia => {
          if (!estaSeleccionada(taxonomia.Id_Incidente)) {
            agregarSeleccion(taxonomia.Id_Incidente)
          }
        })
      }
    }

    const emitirCambios = () => {
      // Emitir en el formato esperado por DeclararIncidente.vue
      emit('categorias-changed', seleccionadas.value)
      
      // Emitir evidencias y comentarios por separado
      seleccionadas.value.forEach(taxonomiaId => {
        const evidenciasArray = evidencias[taxonomiaId] || []
        if (evidenciasArray.length > 0) {
          evidenciasArray.forEach(evidencia => {
            emit('evidencia-subida', { categoriaId: taxonomiaId, evidencia })
          })
        }
        
        const comentario = comentarios[taxonomiaId]
        if (comentario && comentario.trim()) {
          emit('comentario-agregado', { categoriaId: taxonomiaId, texto: comentario })
        }
      })
    }

    // Gestión de archivos
    const manejarArchivos = (idTaxonomia, event) => {
      const files = Array.from(event.target.files)
      
      files.forEach(file => {
        // Validar tamaño
        if (file.size > 10 * 1024 * 1024) {
          alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
          return
        }
        
        // Agregar archivo
        if (!evidencias[idTaxonomia]) evidencias[idTaxonomia] = []
        evidencias[idTaxonomia].push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        })
      })
      
      // Limpiar input
      event.target.value = ''
      emitirCambios()
    }

    const eliminarArchivo = (idTaxonomia, archivoId) => {
      if (evidencias[idTaxonomia]) {
        evidencias[idTaxonomia] = evidencias[idTaxonomia].filter(a => a.id !== archivoId)
        emitirCambios()
      }
    }

    // Utilidades
    const getNombreTaxonomia = (idTaxonomia) => {
      const taxonomia = taxonomias.value.find(t => t.Id_Incidente === idTaxonomia)
      return taxonomia ? taxonomia.TaxonomiaCompleta : idTaxonomia
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
      if (type?.includes('pdf')) return 'ph ph-file-pdf'
      if (type?.includes('word') || type?.includes('doc')) return 'ph ph-file-doc'
      if (type?.includes('image')) return 'ph ph-file-image'
      if (type?.includes('excel') || type?.includes('sheet')) return 'ph ph-file-xls'
      return 'ph ph-file'
    }

    const formatearTamano = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Watchers
    watch(() => props.tipoEmpresa, cargarTaxonomias, { immediate: true })
    
    watch(() => props.categoriasIniciales, (nuevasCategorias) => {
      if (nuevasCategorias && nuevasCategorias.length > 0) {
        seleccionadas.value = [...nuevasCategorias]
        // Inicializar comentarios y evidencias para las categorías preseleccionadas
        nuevasCategorias.forEach(categoriaId => {
          if (!comentarios[categoriaId]) comentarios[categoriaId] = ''
          if (!evidencias[categoriaId]) evidencias[categoriaId] = []
        })
      }
    }, { immediate: true })

    // Inicialización
    onMounted(() => {
      console.log('Componente montado, tipo empresa:', props.tipoEmpresa)
      console.log('Categorías iniciales:', props.categoriasIniciales)
    })

    return {
      loading,
      error,
      taxonomias,
      seleccionadas,
      comentarios,
      evidencias,
      cargarTaxonomias,
      toggleSeleccion,
      estaSeleccionada,
      removerSeleccion,
      limpiarSelecciones,
      toggleSeleccionarTodas,
      manejarArchivos,
      eliminarArchivo,
      getNombreTaxonomia,
      getBadgeClass,
      getIconoArchivo,
      formatearTamano
    }
  }
}
</script>

<style scoped>
/* ===== CONTENEDOR PRINCIPAL ===== */
.clasificacion-taxonomia {
  @apply w-full space-y-6;
}

/* ===== HEADER ===== */
.seccion-header {
  @apply bg-white border border-gray-200 rounded-lg p-6 shadow-sm;
}

.titulo-seccion {
  @apply text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-2;
}

.descripcion-seccion {
  @apply text-gray-600 text-sm flex items-center space-x-2;
}

.tipo-empresa-badge {
  @apply px-2 py-1 rounded text-xs font-medium text-white;
}

.badge-oiv { @apply bg-red-500; }
.badge-pse { @apply bg-green-500; }
.badge-ambos { @apply bg-blue-500; }

/* ===== ESTADOS ===== */
.estado-carga {
  @apply text-center py-12 bg-white border border-gray-200 rounded-lg;
}

.spinner-load {
  @apply w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4;
}

.estado-error {
  @apply text-center py-8 bg-red-50 border border-red-200 rounded-lg text-red-700 space-y-4;
}

.btn-reintentar {
  @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto;
}

.estado-vacio {
  @apply text-center py-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-500;
}

.estado-vacio i {
  @apply text-4xl mb-4;
}

/* ===== CONTENEDOR TAXONOMÍAS ===== */
.taxonomias-contenedor {
  @apply space-y-6;
}

.resumen-selecciones {
  @apply bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between;
}

.resumen-info {
  @apply flex items-center space-x-3 text-blue-700 font-medium;
}

.resumen-info i {
  @apply text-blue-500 text-xl;
}

.btn-limpiar {
  @apply bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm;
}

/* ===== TABLA DE TAXONOMÍAS ===== */
.taxonomias-lista {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden;
}

/* Header de tabla */
.tabla-header {
  @apply grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-sm text-gray-700;
  grid-template-columns: 40px 150px 1fr 100px 80px;
}

.header-checkbox {
  @apply flex items-center justify-center;
}

.header-codigo {
  @apply flex items-center;
}

.header-descripcion {
  @apply flex items-center;
}

.header-tipo {
  @apply flex items-center justify-center;
}

.header-anci {
  @apply flex items-center justify-center;
}

/* Body de tabla */
.tabla-body {
  @apply divide-y divide-gray-200;
}

.taxonomia-fila {
  @apply grid grid-cols-5 gap-4 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-50;
  grid-template-columns: 40px 150px 1fr 100px 80px;
}

.taxonomia-fila.seleccionada {
  @apply bg-blue-50 border-l-4 border-l-blue-500;
}

.fila-checkbox {
  @apply flex items-center justify-center;
}

.checkbox-input {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2;
}

.fila-codigo {
  @apply flex items-center;
}

.codigo-badge {
  @apply text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded border;
}

.fila-descripcion {
  @apply flex items-center;
}

.descripcion-texto {
  @apply text-sm text-gray-900 leading-tight;
}

.fila-tipo {
  @apply flex items-center justify-center;
}

.tipo-badge {
  @apply px-2 py-1 rounded text-xs font-medium text-white;
}

.fila-anci {
  @apply flex items-center justify-center;
}

.anci-badge {
  @apply flex items-center space-x-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded;
}

.anci-no {
  @apply text-xs text-gray-400;
}

/* ===== PANEL DE GESTIÓN ===== */
.panel-gestion {
  @apply bg-white border border-gray-200 rounded-lg p-6 shadow-sm;
}

.gestion-titulo {
  @apply text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6;
}

.gestion-items {
  @apply space-y-6;
}

.gestion-item {
  @apply border border-gray-200 rounded-lg p-4 bg-gray-50;
}

.item-header {
  @apply flex items-center justify-between mb-4;
}

.item-info {
  @apply space-y-1;
}

.item-codigo {
  @apply text-xs font-mono bg-white px-2 py-1 rounded border text-gray-700;
}

.item-nombre {
  @apply text-sm font-medium text-gray-900 block;
}

.btn-remover {
  @apply w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors;
}

/* ===== FORMULARIO ===== */
.item-formulario {
  @apply space-y-4;
}

.campo-grupo {
  @apply space-y-2;
}

.campo-label {
  @apply flex items-center space-x-2 text-sm font-medium text-gray-700;
}

.campo-textarea {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors;
}

/* ===== ARCHIVOS ===== */
.archivos-lista {
  @apply space-y-2 mb-3;
}

.archivo-item {
  @apply flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg;
}

.archivo-info {
  @apply flex items-center space-x-3;
}

.archivo-icono {
  @apply text-2xl text-gray-500;
}

.archivo-nombre {
  @apply text-sm font-medium text-gray-900;
}

.archivo-tamano {
  @apply text-xs text-gray-500;
}

.btn-eliminar-archivo {
  @apply p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors;
}

/* ===== UPLOAD ===== */
.upload-zone {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors;
}

.upload-input {
  @apply sr-only;
}

.upload-button {
  @apply cursor-pointer flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600 transition-colors;
}

.upload-button i {
  @apply text-3xl;
}

.upload-button span {
  @apply font-medium;
}

.upload-button small {
  @apply text-xs text-gray-500;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .tabla-header,
  .taxonomia-fila {
    grid-template-columns: 30px 120px 1fr 80px 60px;
    @apply gap-2 px-2 text-xs;
  }
  
  .codigo-badge {
    @apply text-xs px-1 py-0.5;
  }
  
  .descripcion-texto {
    @apply text-xs;
  }
  
  .tipo-badge,
  .anci-badge {
    @apply text-xs px-1 py-0.5;
  }
  
  .resumen-selecciones {
    @apply flex-col space-y-3 items-start;
  }
}

@media (max-width: 480px) {
  .tabla-header {
    @apply hidden;
  }
  
  .taxonomia-fila {
    @apply grid-cols-1 gap-2;
    grid-template-columns: 1fr;
  }
  
  .fila-checkbox {
    @apply justify-start;
  }
  
  .fila-codigo,
  .fila-tipo,
  .fila-anci {
    @apply justify-start;
  }
}
</style>