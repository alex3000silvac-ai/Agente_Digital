<template>
  <div class="formulario-simple">
    <!-- Header Simple -->
    <div class="header-simple">
      <h1 class="titulo">Registro de Incidente</h1>
      <div class="info">
        <span v-if="incidenteId">ID: {{ incidenteId }}</span>
        <span v-else>Nuevo Incidente</span>
      </div>
    </div>

    <!-- Formulario en Una Sola Vista -->
    <div class="contenedor-form">
      <div class="grid-principal">
        
        <!-- COLUMNA IZQUIERDA -->
        <div class="columna-izq">
          
          <!-- Datos Básicos -->
          <div class="seccion">
            <h2>Datos Básicos</h2>
            
            <div class="campo">
              <label>Título del Incidente *</label>
              <input v-model="datos.titulo" 
                     type="text" 
                     class="input"
                     placeholder="Ej: Intento de acceso no autorizado">
            </div>

            <div class="campo-grid">
              <div class="campo">
                <label>Criticidad *</label>
                <select v-model="datos.criticidad" class="input">
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
              <div class="campo">
                <label>Fecha de Detección *</label>
                <input v-model="datos.fechaDeteccion" 
                       type="datetime-local" 
                       class="input">
              </div>
            </div>

            <div class="campo">
              <label>Descripción *</label>
              <textarea v-model="datos.descripcionInicial" 
                        class="input"
                        rows="3"
                        placeholder="Describe brevemente lo sucedido..."></textarea>
            </div>

            <div class="campo">
              <label>Sistemas Afectados *</label>
              <input v-model="datos.sistemasAfectados" 
                     type="text" 
                     class="input"
                     placeholder="Ej: Servidor web, Base de datos">
            </div>

            <div class="campo">
              <label>Origen del Ataque *</label>
              <input v-model="datos.origenAtaque" 
                     type="text" 
                     class="input"
                     placeholder="Ej: IP externa, Usuario interno">
            </div>

            <div class="campo">
              <label>Acciones Tomadas *</label>
              <textarea v-model="datos.medidasContencion" 
                        class="input"
                        rows="3"
                        placeholder="Describe las acciones inmediatas..."></textarea>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="columna-der">
          
          <!-- Gestión de Archivos -->
          <div class="seccion">
            <h2>Archivos de Evidencia</h2>
            
            <!-- Selector de Sección -->
            <div class="campo">
              <label>Sección de Evidencia</label>
              <select v-model="seccionActiva" class="input">
                <option value="descripcion">Evidencia de Descripción</option>
                <option value="analisis">Evidencia de Análisis</option>
                <option value="acciones">Evidencia de Acciones</option>
                <option value="general">Evidencia General</option>
              </select>
            </div>

            <!-- Upload de Archivos -->
            <div class="upload-zone" 
                 @drop="handleDrop" 
                 @dragover.prevent 
                 @dragenter.prevent
                 @click="$refs.fileInput.click()">
              <input ref="fileInput" 
                     type="file" 
                     multiple 
                     @change="handleFileUpload"
                     style="display: none;">
              <div class="upload-content">
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                <small>PDF, DOC, IMG, TXT - Máx 10MB</small>
              </div>
            </div>

            <!-- Lista de Archivos por Sección -->
            <div class="archivos-seccion">
              <div class="seccion-header">
                <span>{{ getNombreSeccion(seccionActiva) }}</span>
                <span class="contador">{{ getArchivosSeccion(seccionActiva).length }} archivo(s)</span>
              </div>
              
              <div v-if="getArchivosSeccion(seccionActiva).length === 0" class="sin-archivos">
                <p>No hay archivos en esta sección</p>
              </div>
              
              <div v-else class="lista-archivos">
                <div v-for="(archivo, index) in getArchivosSeccion(seccionActiva)" 
                     :key="index"
                     class="archivo-item">
                  <div class="archivo-info">
                    <i :class="getIconoArchivo(archivo.nombre)" class="archivo-icono"></i>
                    <div class="archivo-detalles">
                      <div class="archivo-nombre">{{ archivo.nombre }}</div>
                      <div class="archivo-meta">
                        {{ formatearTamaño(archivo.tamaño) }} • {{ archivo.fechaSubida || 'Ahora' }}
                      </div>
                    </div>
                  </div>
                  <div class="archivo-acciones">
                    <button @click="verArchivo(archivo)" class="btn-icono" title="Ver">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button @click="eliminarArchivo(seccionActiva, index)" class="btn-icono btn-rojo" title="Eliminar">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de Archivos -->
            <div class="resumen-archivos">
              <div class="stat-archivo" v-for="seccion in secciones" :key="seccion.id">
                <span class="numero">{{ getArchivosSeccion(seccion.id).length }}</span>
                <span class="label">{{ seccion.nombre }}</span>
              </div>
            </div>
          </div>

          <!-- Taxonomías -->
          <div class="seccion">
            <h2>Categorías del Incidente</h2>
            
            <div class="buscar-box">
              <input v-model="busqueda" 
                     type="text" 
                     class="input"
                     placeholder="Buscar categorías...">
            </div>

            <div class="taxonomias-lista">
              <div v-for="taxonomia in taxonomiasFiltradas" 
                   :key="taxonomia.Id_Taxonomia"
                   :class="['taxonomia-card', { seleccionada: estaSeleccionada(taxonomia.Id_Taxonomia) }]"
                   @click="toggleTaxonomia(taxonomia)">
                
                <div class="taxonomia-header">
                  <input type="checkbox" 
                         :checked="estaSeleccionada(taxonomia.Id_Taxonomia)"
                         @click.stop>
                  <span class="taxonomia-titulo">{{ taxonomia.Nombre }}</span>
                </div>
                
                <div class="taxonomia-desc">{{ taxonomia.Descripcion }}</div>
                
                <!-- Gestión Completa si está seleccionada -->
                <div v-if="estaSeleccionada(taxonomia.Id_Taxonomia)" class="taxonomia-gestion">
                  
                  <!-- Comentarios -->
                  <div class="comentarios-seccion">
                    <label class="label-pequeño">Comentarios</label>
                    <div class="comentarios-lista">
                      <div v-for="(comentario, idx) in getComentarios(taxonomia.Id_Taxonomia)" 
                           :key="idx"
                           class="comentario-item">
                        <div class="comentario-texto">{{ comentario.texto }}</div>
                        <div class="comentario-meta">{{ comentario.fecha }} - {{ comentario.usuario }}</div>
                        <button @click="eliminarComentario(taxonomia.Id_Taxonomia, idx)" 
                                class="btn-eliminar-comentario">×</button>
                      </div>
                    </div>
                    <div class="nuevo-comentario">
                      <textarea v-model="nuevoComentario[taxonomia.Id_Taxonomia]"
                                class="input-small"
                                rows="2"
                                placeholder="Agregar comentario..."></textarea>
                      <button @click="agregarComentario(taxonomia.Id_Taxonomia)" 
                              class="btn-agregar-comentario">
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Archivos de Taxonomía -->
                  <div class="archivos-taxonomia">
                    <label class="label-pequeño">Archivos ({{ getArchivosTaxonomia(taxonomia.Id_Taxonomia).length }})</label>
                    <div class="upload-mini" @click="uploadArchivoTaxonomia(taxonomia.Id_Taxonomia)">
                      <i class="fas fa-paperclip"></i>
                      <span>Agregar archivo</span>
                    </div>
                    <div v-for="archivo in getArchivosTaxonomia(taxonomia.Id_Taxonomia).slice(0, 3)" 
                         :key="archivo.nombre"
                         class="archivo-mini">
                      <span>{{ archivo.nombre }}</span>
                      <button @click="eliminarArchivoTaxonomia(taxonomia.Id_Taxonomia, archivo)" 
                              class="btn-eliminar-mini">×</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="datos.taxonomiasSeleccionadas.length === 0" class="sin-taxonomias">
              <p>No hay categorías seleccionadas</p>
            </div>
          </div>

          <!-- Resumen -->
          <div class="seccion">
            <h2>Resumen del Incidente</h2>
            <div class="resumen-stats">
              <div class="stat">
                <span class="numero">{{ datos.taxonomiasSeleccionadas.length }}</span>
                <span class="label">Categorías</span>
              </div>
              <div class="stat">
                <span class="numero">{{ totalArchivos }}</span>
                <span class="label">Archivos</span>
              </div>
              <div class="stat">
                <span class="numero">{{ totalComentarios }}</span>
                <span class="label">Comentarios</span>
              </div>
              <div class="stat">
                <span class="numero">{{ datos.criticidad }}</span>
                <span class="label">Criticidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="acciones">
        <button @click="cancelar" class="btn btn-gris">
          Cancelar
        </button>
        <button @click="guardarIncidente" 
                :disabled="!esValido || guardando"
                class="btn btn-azul">
          <i v-if="guardando" class="fas fa-spinner fa-spin"></i>
          {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  incidenteId: { type: [Number, String], default: null },
  modo: { type: String, default: 'creacion' }
})

// Emits
const emit = defineEmits(['incidente-guardado', 'error'])

// Composables
const router = useRouter()

// Estado
const guardando = ref(false)
const busqueda = ref('')
const taxonomiasDisponibles = ref([])
const seccionActiva = ref('descripcion')
const nuevoComentario = ref({})

const datos = ref({
  titulo: '',
  criticidad: 'Media',
  fechaDeteccion: new Date().toISOString().slice(0, 16), // Fecha actual por defecto
  descripcionInicial: '',
  sistemasAfectados: '',
  origenAtaque: '',
  medidasContencion: '',
  taxonomiasSeleccionadas: [],
  archivos: {
    descripcion: [],
    analisis: [],
    acciones: [],
    general: []
  },
  comentarios: {},
  archivosTaxonomias: {}
})

const secciones = [
  { id: 'descripcion', nombre: 'Descripción' },
  { id: 'analisis', nombre: 'Análisis' },
  { id: 'acciones', nombre: 'Acciones' },
  { id: 'general', nombre: 'General' }
]

// Computed
const modoEdicion = computed(() => props.modo === 'edicion')

const esValido = computed(() => {
  return datos.value.titulo.trim() !== '' &&
         datos.value.fechaDeteccion !== '' &&
         datos.value.descripcionInicial.trim() !== '' &&
         datos.value.sistemasAfectados.trim() !== '' &&
         datos.value.origenAtaque.trim() !== '' &&
         datos.value.medidasContencion.trim() !== ''
})

const taxonomiasFiltradas = computed(() => {
  if (!busqueda.value) return taxonomiasDisponibles.value.slice(0, 10) // Mostrar solo las primeras 10
  
  const busq = busqueda.value.toLowerCase()
  return taxonomiasDisponibles.value.filter(tax => 
    tax.Nombre.toLowerCase().includes(busq) ||
    tax.Descripcion.toLowerCase().includes(busq)
  ).slice(0, 10)
})

const totalArchivos = computed(() => {
  return Object.values(datos.value.archivos).reduce((total, seccion) => total + seccion.length, 0) +
         Object.values(datos.value.archivosTaxonomias).reduce((total, archivos) => total + archivos.length, 0)
})

const totalComentarios = computed(() => {
  return Object.values(datos.value.comentarios).reduce((total, comentarios) => total + comentarios.length, 0)
})

// Métodos
function estaSeleccionada(idTaxonomia) {
  return datos.value.taxonomiasSeleccionadas.some(t => t.Id_Taxonomia === idTaxonomia)
}

function toggleTaxonomia(taxonomia) {
  const index = datos.value.taxonomiasSeleccionadas.findIndex(t => t.Id_Taxonomia === taxonomia.Id_Taxonomia)
  
  if (index > -1) {
    datos.value.taxonomiasSeleccionadas.splice(index, 1)
  } else {
    datos.value.taxonomiasSeleccionadas.push({
      Id_Taxonomia: taxonomia.Id_Taxonomia,
      Comentarios: ''
    })
  }
}

function getComentario(idTaxonomia) {
  const taxonomia = datos.value.taxonomiasSeleccionadas.find(t => t.Id_Taxonomia === idTaxonomia)
  return taxonomia?.Comentarios || ''
}

function actualizarComentario(idTaxonomia, comentario) {
  const taxonomia = datos.value.taxonomiasSeleccionadas.find(t => t.Id_Taxonomia === idTaxonomia)
  if (taxonomia) {
    taxonomia.Comentarios = comentario
  }
}

// === GESTIÓN DE ARCHIVOS ===
function getNombreSeccion(seccionId) {
  const nombres = {
    'descripcion': 'Evidencia de Descripción',
    'analisis': 'Evidencia de Análisis', 
    'acciones': 'Evidencia de Acciones',
    'general': 'Evidencia General'
  }
  return nombres[seccionId] || seccionId
}

function getArchivosSeccion(seccionId) {
  return datos.value.archivos[seccionId] || []
}

function handleFileUpload(event) {
  const files = Array.from(event.target.files)
  procesarArchivos(files)
}

function handleDrop(event) {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  procesarArchivos(files)
}

function procesarArchivos(files) {
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) { // 10MB máximo
      alert(`El archivo ${file.name} es demasiado grande (máx 10MB)`)
      return
    }
    
    const archivo = {
      id: Date.now() + Math.random(),
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type,
      fechaSubida: new Date().toLocaleDateString(),
      archivo: file
    }
    
    datos.value.archivos[seccionActiva.value].push(archivo)
  })
}

function eliminarArchivo(seccion, index) {
  if (confirm('¿Eliminar este archivo?')) {
    datos.value.archivos[seccion].splice(index, 1)
  }
}

function verArchivo(archivo) {
  if (archivo.archivo) {
    const url = URL.createObjectURL(archivo.archivo)
    window.open(url, '_blank')
  }
}

function getIconoArchivo(nombreArchivo) {
  const extension = nombreArchivo.split('.').pop()?.toLowerCase()
  const iconos = {
    pdf: 'fas fa-file-pdf text-red-400',
    doc: 'fas fa-file-word text-blue-400',
    docx: 'fas fa-file-word text-blue-400',
    xls: 'fas fa-file-excel text-green-400',
    xlsx: 'fas fa-file-excel text-green-400',
    jpg: 'fas fa-file-image text-purple-400',
    jpeg: 'fas fa-file-image text-purple-400',
    png: 'fas fa-file-image text-purple-400',
    txt: 'fas fa-file-lines text-gray-400',
    log: 'fas fa-file-lines text-gray-400'
  }
  return iconos[extension] || 'fas fa-file text-gray-400'
}

function formatearTamaño(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// === GESTIÓN DE COMENTARIOS ===
function getComentarios(idTaxonomia) {
  return datos.value.comentarios[idTaxonomia] || []
}

function agregarComentario(idTaxonomia) {
  const comentario = nuevoComentario.value[idTaxonomia]
  if (!comentario?.trim()) return
  
  if (!datos.value.comentarios[idTaxonomia]) {
    datos.value.comentarios[idTaxonomia] = []
  }
  
  datos.value.comentarios[idTaxonomia].push({
    texto: comentario.trim(),
    fecha: new Date().toLocaleString(),
    usuario: 'Usuario Actual'
  })
  
  nuevoComentario.value[idTaxonomia] = ''
}

function eliminarComentario(idTaxonomia, index) {
  if (confirm('¿Eliminar este comentario?')) {
    datos.value.comentarios[idTaxonomia].splice(index, 1)
  }
}

// === ARCHIVOS DE TAXONOMÍAS ===
function getArchivosTaxonomia(idTaxonomia) {
  return datos.value.archivosTaxonomias[idTaxonomia] || []
}

function uploadArchivoTaxonomia(idTaxonomia) {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    if (!datos.value.archivosTaxonomias[idTaxonomia]) {
      datos.value.archivosTaxonomias[idTaxonomia] = []
    }
    
    files.forEach(file => {
      datos.value.archivosTaxonomias[idTaxonomia].push({
        id: Date.now() + Math.random(),
        nombre: file.name,
        tamaño: file.size,
        archivo: file
      })
    })
  }
  input.click()
}

function eliminarArchivoTaxonomia(idTaxonomia, archivo) {
  if (confirm('¿Eliminar este archivo?')) {
    const archivos = datos.value.archivosTaxonomias[idTaxonomia]
    const index = archivos.findIndex(a => a.id === archivo.id)
    if (index > -1) {
      archivos.splice(index, 1)
    }
  }
}

async function cargarTaxonomias() {
  try {
    const response = await fetch('/api/admin/taxonomias/jerarquica?tipo_empresa=PSE')
    if (!response.ok) throw new Error('Error cargando categorías')
    
    const data = await response.json()
    const taxonomias = data.taxonomias || data || []
    
    taxonomiasDisponibles.value = taxonomias.map(tax => ({
      Id_Taxonomia: tax.CodigoTaxonomia || tax.Id_Incidente,
      Nombre: tax.Categoria_del_Incidente || `${tax.Area} - ${tax.Efecto}`,
      Descripcion: tax.Subcategoria_del_Incidente || tax.Categoria_del_Incidente || 'Sin descripción'
    }))
    
    console.log('✅ Categorías cargadas:', taxonomiasDisponibles.value.length)
  } catch (error) {
    console.error('❌ Error cargando categorías:', error)
    // Categorías de ejemplo
    taxonomiasDisponibles.value = [
      { Id_Taxonomia: 'FUERZA_BRUTA', Nombre: 'Ataque de fuerza bruta', Descripcion: 'Intentos repetidos de acceso' },
      { Id_Taxonomia: 'MALWARE', Nombre: 'Infección por malware', Descripcion: 'Software malicioso detectado' },
      { Id_Taxonomia: 'PHISHING', Nombre: 'Intento de phishing', Descripcion: 'Engaño para obtener credenciales' },
      { Id_Taxonomia: 'DDoS', Nombre: 'Ataque DDoS', Descripcion: 'Denegación de servicio distribuida' },
      { Id_Taxonomia: 'FUGA_DATOS', Nombre: 'Fuga de datos', Descripcion: 'Exposición no autorizada de información' }
    ]
  }
}

async function cargarIncidente() {
  if (!props.incidenteId) return
  
  try {
    const response = await fetch(`/api/admin/incidente-detalle/${props.incidenteId}`)
    if (!response.ok) throw new Error('Error cargando incidente')
    
    const data = await response.json()
    
    datos.value = {
      titulo: data.Titulo || '',
      criticidad: data.Criticidad || 'Media',
      fechaDeteccion: formatearFecha(data.FechaDeteccion),
      descripcionInicial: data.DescripcionInicial || '',
      sistemasAfectados: data.SistemasAfectados || '',
      origenAtaque: data.OrigenIncidente || '',
      medidasContencion: data.AccionesInmediatas || '',
      taxonomiasSeleccionadas: data.Taxonomias || []
    }
  } catch (error) {
    console.error('❌ Error cargando incidente:', error)
    emit('error', 'Error cargando el incidente')
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toISOString().slice(0, 16)
}

async function guardarIncidente() {
  try {
    guardando.value = true
    
    const datosParaEnviar = {
      Titulo: datos.value.titulo,
      TipoFlujo: 'Informativo',
      Criticidad: datos.value.criticidad,
      FechaDeteccion: datos.value.fechaDeteccion,
      DescripcionInicial: datos.value.descripcionInicial,
      SistemasAfectados: datos.value.sistemasAfectados,
      OrigenIncidente: datos.value.origenAtaque,
      AccionesInmediatas: datos.value.medidasContencion,
      CategoriasSeleccionadas: datos.value.taxonomiasSeleccionadas
    }
    
    const url = modoEdicion.value 
      ? `/api/admin/incidentes/${props.incidenteId}`
      : `/api/admin/incidentes-empresa/2`
    
    const metodo = modoEdicion.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosParaEnviar)
    })
    
    if (!response.ok) throw new Error(`Error ${response.status}`)
    
    const resultado = await response.json()
    console.log('✅ Incidente guardado')
    emit('incidente-guardado', resultado)
    
  } catch (error) {
    console.error('❌ Error:', error)
    emit('error', error.message)
  } finally {
    guardando.value = false
  }
}

function cancelar() {
  router.go(-1)
}

// Lifecycle
onMounted(async () => {
  await cargarTaxonomias()
  if (props.incidenteId) {
    await cargarIncidente()
  }
})
</script>

<style scoped>
.formulario-simple {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  font-family: 'Inter', system-ui, sans-serif;
}

.header-simple {
  background: #2a2a2a;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #333;
}

.titulo {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.info {
  color: #888;
  margin-top: 0.5rem;
}

.contenedor-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.grid-principal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .grid-principal {
    grid-template-columns: 1fr;
  }
}

.seccion {
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.seccion h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #ffffff;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 0.5rem;
}

.campo {
  margin-bottom: 1rem;
}

.campo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.campo label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #cccccc;
  font-size: 0.9rem;
}

.input, .input-small {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.input:focus, .input-small:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.input-small {
  padding: 0.5rem;
  font-size: 0.8rem;
}

.buscar-box {
  margin-bottom: 1rem;
}

.taxonomias-lista {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 6px;
}

.taxonomia-card {
  padding: 1rem;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.taxonomia-card:hover {
  background: #333;
}

.taxonomia-card.seleccionada {
  background: #1e3a8a;
  border-color: #3b82f6;
}

.taxonomia-card:last-child {
  border-bottom: none;
}

.taxonomia-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.taxonomia-titulo {
  font-weight: 500;
  color: #ffffff;
}

.taxonomia-desc {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.comentario-box {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #444;
}

.sin-taxonomias {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.resumen-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  text-align: center;
}

.stat .numero {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat .label {
  font-size: 0.8rem;
  color: #888;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-gris {
  background: #4a4a4a;
  color: #ffffff;
}

.btn-gris:hover {
  background: #555;
}

.btn-azul {
  background: #4f46e5;
  color: #ffffff;
}

.btn-azul:hover:not(:disabled) {
  background: #4338ca;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>