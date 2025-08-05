<template>
  <div class="formulario-compacto">
    <!-- Header -->
    <header class="header-formulario">
      <h1 class="titulo-principal">Registro de Incidente de Ciberseguridad</h1>
      <div class="info-incidente">
        <span v-if="incidenteId" class="id-incidente">ID: {{ incidenteId }}</span>
        <span v-else class="id-incidente">Nuevo Incidente</span>
      </div>
    </header>

    <!-- Navegación por Pasos -->
    <nav class="navegacion-pasos">
      <div v-for="(paso, index) in pasos" 
           :key="index"
           :class="['paso', { activo: pasoActual === index }]"
           @click="cambiarPaso(index)">
        {{ index + 1 }}. {{ paso }}
      </div>
    </nav>

    <!-- Contenido del Formulario -->
    <main class="contenido-principal">
      
      <!-- PASO 1: Identificación -->
      <div v-if="pasoActual === 0" class="vista-paso">
        <h2 class="titulo-paso">1. Identificación General del Incidente</h2>
        <div class="grid-campos">
          <div>
            <label class="campo-label">Título del Incidente *</label>
            <input v-model="datos.titulo" 
                   type="text" 
                   class="campo-input"
                   placeholder="Descripción breve del incidente">
          </div>
          <div>
            <label class="campo-label">Criticidad *</label>
            <select v-model="datos.criticidad" class="campo-input">
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          <div>
            <label class="campo-label">Fecha y Hora de Detección *</label>
            <input v-model="datos.fechaDeteccion" 
                   type="datetime-local" 
                   class="campo-input">
          </div>
          <div>
            <label class="campo-label">Fecha y Hora de Ocurrencia</label>
            <input v-model="datos.fechaOcurrencia" 
                   type="datetime-local" 
                   class="campo-input">
          </div>
          <div class="col-span-2">
            <label class="campo-label">Descripción Inicial Detallada *</label>
            <textarea v-model="datos.descripcionInicial" 
                      class="campo-textarea" 
                      rows="4"
                      placeholder="Describa detalladamente el incidente..."></textarea>
          </div>
        </div>
      </div>

      <!-- PASO 2: Análisis -->
      <div v-if="pasoActual === 1" class="vista-paso">
        <h2 class="titulo-paso">2. Análisis Preliminar</h2>
        <div class="grid-campos">
          <div>
            <label class="campo-label">Impacto Preliminar Observado</label>
            <input v-model="datos.impactoPreliminar" 
                   type="text" 
                   class="campo-input"
                   placeholder="Describa el impacto observado">
          </div>
          <div>
            <label class="campo-label">Sistemas, Activos o Personal Afectado *</label>
            <input v-model="datos.sistemasAfectados" 
                   type="text" 
                   class="campo-input"
                   placeholder="Especifique sistemas afectados">
          </div>
          <div class="col-span-2">
            <label class="campo-label">Origen / Vector de Ataque Probable *</label>
            <input v-model="datos.origenAtaque" 
                   type="text" 
                   class="campo-input"
                   placeholder="Identifique el origen del ataque">
          </div>
        </div>
      </div>

      <!-- PASO 3: Taxonomías -->
      <div v-if="pasoActual === 2" class="vista-paso">
        <h2 class="titulo-paso">3. Taxonomías del Incidente</h2>
        <div class="taxonomias-container">
          <!-- Lista de Taxonomías Disponibles -->
          <div class="taxonomias-disponibles">
            <h3 class="subtitulo">Seleccionar Taxonomías</h3>
            <div class="buscar-taxonomias">
              <input v-model="busquedaTaxonomia" 
                     type="text" 
                     class="campo-input"
                     placeholder="Buscar taxonomías...">
            </div>
            <div class="lista-taxonomias">
              <div v-for="taxonomia in taxonomiasFiltradas" 
                   :key="taxonomia.Id_Taxonomia"
                   :class="['taxonomia-item', { seleccionada: esTaxonomiaSeleccionada(taxonomia.Id_Taxonomia) }]"
                   @click="toggleTaxonomia(taxonomia)">
                <div class="taxonomia-checkbox">
                  <input type="checkbox" 
                         :checked="esTaxonomiaSeleccionada(taxonomia.Id_Taxonomia)"
                         @click.stop>
                </div>
                <div class="taxonomia-info">
                  <div class="taxonomia-nombre">{{ taxonomia.Nombre }}</div>
                  <div class="taxonomia-descripcion">{{ taxonomia.Descripcion }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Taxonomías Seleccionadas -->
          <div v-if="datos.taxonomiasSeleccionadas.length > 0" class="taxonomias-seleccionadas">
            <h3 class="subtitulo">Taxonomías Seleccionadas ({{ datos.taxonomiasSeleccionadas.length }})</h3>
            <div v-for="(seleccion, index) in datos.taxonomiasSeleccionadas" 
                 :key="seleccion.Id_Taxonomia"
                 class="taxonomia-seleccionada">
              <div class="taxonomia-header">
                <span class="taxonomia-titulo">{{ getNombreTaxonomia(seleccion.Id_Taxonomia) }}</span>
                <button @click="removerTaxonomia(index)" class="btn-remover">
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>
              <div class="taxonomia-comentarios">
                <label class="campo-label-small">Comentarios:</label>
                <textarea v-model="seleccion.Comentarios"
                          class="campo-textarea-small"
                          rows="2"
                          placeholder="Comentarios específicos sobre esta taxonomía..."></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 4: Acciones -->
      <div v-if="pasoActual === 3" class="vista-paso">
        <h2 class="titulo-paso">4. Acciones Inmediatas y Plan de Mejora</h2>
        <div class="grid-campos">
          <div class="col-span-2">
            <label class="campo-label">Medidas de Contención Iniciales *</label>
            <textarea v-model="datos.medidasContencion" 
                      class="campo-textarea" 
                      rows="4"
                      placeholder="Describa las acciones inmediatas tomadas..."></textarea>
          </div>
          <div class="col-span-2">
            <label class="campo-label">Plan de Mejora Propuesto</label>
            <textarea v-model="datos.planMejora" 
                      class="campo-textarea" 
                      rows="4"
                      placeholder="Describa las mejoras propuestas..."></textarea>
          </div>
        </div>
      </div>

    </main>

    <!-- Footer con Controles -->
    <footer class="footer-controles">
      <div class="controles-navegacion">
        <button @click="pasoAnterior" 
                :disabled="pasoActual === 0"
                class="btn btn-secundario">
          <i class="fa-solid fa-chevron-left"></i>
          Anterior
        </button>
        <button @click="siguientePaso" 
                :disabled="pasoActual === pasos.length - 1"
                class="btn btn-secundario">
          Siguiente
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div class="controles-accion">
        <button @click="cancelar" class="btn btn-cancelar">Cancelar</button>
        <button @click="guardarIncidente" 
                :disabled="!formularioValido || guardando"
                class="btn btn-primario">
          <i v-if="guardando" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-save"></i>
          {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  incidenteId: {
    type: [Number, String],
    default: null
  },
  modo: {
    type: String,
    default: 'creacion'
  }
})

// Emits
const emit = defineEmits(['incidente-guardado', 'error'])

// Composables
const router = useRouter()

// Estado Local
const pasoActual = ref(0)
const guardando = ref(false)
const busquedaTaxonomia = ref('')
const taxonomiasDisponibles = ref([])

const pasos = ['Identificación', 'Análisis', 'Taxonomías', 'Acciones']

const datos = ref({
  titulo: '',
  criticidad: 'Media',
  fechaDeteccion: '',
  fechaOcurrencia: '',
  descripcionInicial: '',
  impactoPreliminar: '',
  sistemasAfectados: '',
  origenAtaque: '',
  medidasContencion: '',
  planMejora: '',
  taxonomiasSeleccionadas: []
})

// Computed
const modoEdicion = computed(() => props.modo === 'edicion')

const formularioValido = computed(() => {
  return datos.value.titulo.trim() !== '' &&
         datos.value.fechaDeteccion !== '' &&
         datos.value.criticidad !== '' &&
         datos.value.descripcionInicial.trim() !== '' &&
         datos.value.sistemasAfectados.trim() !== '' &&
         datos.value.origenAtaque.trim() !== '' &&
         datos.value.medidasContencion.trim() !== ''
})

const taxonomiasFiltradas = computed(() => {
  if (!busquedaTaxonomia.value) return taxonomiasDisponibles.value
  
  const busqueda = busquedaTaxonomia.value.toLowerCase()
  return taxonomiasDisponibles.value.filter(tax => 
    tax.Nombre.toLowerCase().includes(busqueda) ||
    tax.Descripcion.toLowerCase().includes(busqueda)
  )
})

// Métodos
function cambiarPaso(index) {
  pasoActual.value = index
}

function siguientePaso() {
  if (pasoActual.value < pasos.length - 1) {
    pasoActual.value++
  }
}

function pasoAnterior() {
  if (pasoActual.value > 0) {
    pasoActual.value--
  }
}

function esTaxonomiaSeleccionada(idTaxonomia) {
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

function removerTaxonomia(index) {
  datos.value.taxonomiasSeleccionadas.splice(index, 1)
}

function getNombreTaxonomia(idTaxonomia) {
  const taxonomia = taxonomiasDisponibles.value.find(t => t.Id_Taxonomia === idTaxonomia)
  return taxonomia?.Nombre || `Taxonomía ${idTaxonomia}`
}

async function cargarTaxonomias() {
  try {
    // Intentar primera ruta con tipo de empresa PSE
    let response = await fetch('/api/admin/taxonomias/jerarquica?tipo_empresa=PSE')
    
    if (!response.ok) {
      // Si falla, intentar segunda ruta
      response = await fetch('/api/admin/taxonomias/jerarquica')
    }
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Adaptar datos al formato esperado por el componente
    const taxonomias = data.taxonomias || data || []
    
    taxonomiasDisponibles.value = taxonomias.map(tax => ({
      Id_Taxonomia: tax.CodigoTaxonomia || tax.Id_Incidente || tax.ID_Incidente,
      Nombre: tax.Categoria_del_Incidente || tax.titulo || `${tax.Area} - ${tax.Efecto}`,
      Descripcion: `${tax.Area || ''} • ${tax.Efecto || ''} • ${tax.Categoria_del_Incidente || ''} • ${tax.Subcategoria_del_Incidente || ''}`.trim()
    }))
    
    console.log('✅ Taxonomías cargadas:', taxonomiasDisponibles.value.length)
    console.log('📋 Primera taxonomía:', taxonomiasDisponibles.value[0])
  } catch (error) {
    console.error('❌ Error cargando taxonomías:', error)
    
    // Como fallback, usar datos simulados para que el formulario funcione
    taxonomiasDisponibles.value = [
      {
        Id_Taxonomia: 'INC_USO_UNRI_AFBE',
        Nombre: 'Ataque de fuerza bruta exitoso',
        Descripcion: 'Impacto en el uso legítimo de recursos • Uso no autorizado de redes y sistemas informáticos • Ataque de fuerza bruta exitoso'
      },
      {
        Id_Taxonomia: 'INC_CONF_EXDA_FDP',
        Nombre: 'Filtración de datos personales',
        Descripcion: 'Impacto en la confidencialidad de la información • Exfiltración y/o exposición de datos • Filtración de datos personales'
      },
      {
        Id_Taxonomia: 'INC_DISP_INDS_DSEV',
        Nombre: 'Denegación de servicio',
        Descripcion: 'Impacto en la disponibilidad de un servicio esencial • Indisponibilidad y/o denegación de servicio'
      }
    ]
    
    console.log('⚠️ Usando taxonomías simuladas como fallback')
  }
}

async function cargarIncidente() {
  if (!props.incidenteId) return
  
  try {
    const response = await fetch(`/api/admin/incidente-detalle/${props.incidenteId}`)
    if (!response.ok) throw new Error('Error cargando incidente')
    
    const data = await response.json()
    
    // Mapear datos
    datos.value = {
      titulo: data.Titulo || '',
      criticidad: data.Criticidad || 'Media',
      fechaDeteccion: formatearFechaParaInput(data.FechaDeteccion),
      fechaOcurrencia: formatearFechaParaInput(data.FechaOcurrencia),
      descripcionInicial: data.DescripcionInicial || '',
      impactoPreliminar: data.AnciImpactoPreliminar || '',
      sistemasAfectados: data.SistemasAfectados || '',
      origenAtaque: data.OrigenIncidente || '',
      medidasContencion: data.AccionesInmediatas || '',
      planMejora: data.PlanMejora || '',
      taxonomiasSeleccionadas: data.Taxonomias || []
    }
    
    console.log('✅ Incidente cargado para edición')
  } catch (error) {
    console.error('❌ Error cargando incidente:', error)
    emit('error', 'Error cargando el incidente')
  }
}

function formatearFechaParaInput(fechaBD) {
  if (!fechaBD) return ''
  
  const fecha = new Date(fechaBD)
  if (isNaN(fecha.getTime())) return ''
  
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  const hours = String(fecha.getHours()).padStart(2, '0')
  const minutes = String(fecha.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

async function guardarIncidente() {
  try {
    guardando.value = true
    
    if (!formularioValido.value) {
      throw new Error('Complete todos los campos requeridos')
    }
    
    const datosParaEnviar = {
      Titulo: datos.value.titulo,
      TipoFlujo: 'Informativo',
      Criticidad: datos.value.criticidad,
      FechaDeteccion: datos.value.fechaDeteccion,
      FechaOcurrencia: datos.value.fechaOcurrencia || null,
      DescripcionInicial: datos.value.descripcionInicial,
      AnciImpactoPreliminar: datos.value.impactoPreliminar,
      SistemasAfectados: datos.value.sistemasAfectados,
      OrigenIncidente: datos.value.origenAtaque,
      AccionesInmediatas: datos.value.medidasContencion,
      PlanMejora: datos.value.planMejora,
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
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const resultado = await response.json()
    
    console.log('✅ Incidente guardado:', resultado)
    emit('incidente-guardado', resultado)
    
  } catch (error) {
    console.error('❌ Error guardando incidente:', error)
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
.formulario-compacto {
  @apply min-h-screen bg-gray-900 text-gray-100;
  font-family: 'Inter', sans-serif;
}

.header-formulario {
  @apply bg-gray-800 border-b border-gray-700 px-6 py-4;
}

.titulo-principal {
  @apply text-2xl font-bold text-white;
}

.info-incidente {
  @apply text-gray-400 mt-1;
}

.navegacion-pasos {
  @apply bg-gray-800 border-b border-gray-700 flex;
}

.paso {
  @apply px-4 py-3 cursor-pointer text-gray-400 hover:text-white transition-colors;
  border-bottom: 3px solid transparent;
}

.paso.activo {
  @apply text-white;
  border-bottom-color: #6366f1;
}

.contenido-principal {
  @apply p-6 max-w-6xl mx-auto;
}

.vista-paso {
  @apply bg-gray-800 rounded-lg p-6;
}

.titulo-paso {
  @apply text-xl font-bold text-white mb-6;
}

.grid-campos {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.col-span-2 {
  grid-column: span 1;
}

@media (min-width: 768px) {
  .col-span-2 {
    grid-column: span 2;
  }
}

.campo-label {
  @apply block text-sm font-medium text-gray-300 mb-2;
}

.campo-label-small {
  @apply block text-xs font-medium text-gray-400 mb-1;
}

.campo-input, .campo-textarea {
  @apply w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white
         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors;
}

.campo-textarea-small {
  @apply w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm
         focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500;
}

.taxonomias-container {
  @apply space-y-6;
}

.taxonomias-disponibles {
  @apply bg-gray-700 rounded-lg p-4;
}

.subtitulo {
  @apply text-lg font-semibold text-white mb-4;
}

.buscar-taxonomias {
  @apply mb-4;
}

.lista-taxonomias {
  @apply space-y-2 max-h-80 overflow-y-auto;
}

.taxonomia-item {
  @apply flex items-start space-x-3 p-3 bg-gray-600 rounded cursor-pointer
         hover:bg-gray-500 transition-colors;
}

.taxonomia-item.seleccionada {
  @apply bg-indigo-600 hover:bg-indigo-700;
}

.taxonomia-checkbox {
  @apply flex-shrink-0 mt-1;
}

.taxonomia-info {
  @apply flex-1;
}

.taxonomia-nombre {
  @apply font-medium text-white;
}

.taxonomia-descripcion {
  @apply text-sm text-gray-300 mt-1;
}

.taxonomias-seleccionadas {
  @apply bg-gray-700 rounded-lg p-4;
}

.taxonomia-seleccionada {
  @apply bg-indigo-600 rounded-lg p-4 mb-4;
}

.taxonomia-header {
  @apply flex justify-between items-center mb-3;
}

.taxonomia-titulo {
  @apply font-medium text-white;
}

.btn-remover {
  @apply text-white hover:text-red-300 p-1 hover:bg-red-600 rounded transition-colors;
}

.footer-controles {
  @apply bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-between items-center;
}

.controles-navegacion, .controles-accion {
  @apply flex space-x-3;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2;
}

.btn-primario {
  @apply bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secundario {
  @apply bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-cancelar {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}
</style>