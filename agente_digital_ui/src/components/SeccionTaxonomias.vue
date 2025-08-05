<template>
  <div class="seccion-taxonomias">
    <div class="taxonomias-grid">
      <!-- Lista de taxonomías disponibles -->
      <div class="taxonomias-disponibles">
        <h4 class="sub-titulo">Taxonomías Disponibles</h4>
        <div class="taxonomias-lista">
          <div v-for="taxonomia in taxonomiasDisponibles" 
               :key="taxonomia.Id_Taxonomia"
               class="taxonomia-item"
               :class="{ seleccionada: estaSeleccionada(taxonomia.Id_Taxonomia) }"
               @click="toggleTaxonomia(taxonomia)">
            
            <div class="taxonomia-header">
              <input type="checkbox" 
                     :checked="estaSeleccionada(taxonomia.Id_Taxonomia)"
                     @click.stop="toggleTaxonomia(taxonomia)"
                     class="taxonomia-checkbox">
              <span class="taxonomia-nombre">{{ taxonomia.Nombre }}</span>
            </div>
            
            <p class="taxonomia-descripcion">{{ taxonomia.Descripcion }}</p>
            
            <!-- Comentarios si está seleccionada -->
            <div v-if="estaSeleccionada(taxonomia.Id_Taxonomia)" class="taxonomia-comentarios">
              <label class="comentarios-label">Comentarios específicos:</label>
              <textarea :value="getComentarios(taxonomia.Id_Taxonomia)"
                        class="comentarios-textarea"
                        rows="2"
                        maxlength="500"
                        placeholder="Añadir comentarios sobre esta taxonomía..."
                        @input="actualizarComentarios(taxonomia.Id_Taxonomia, $event.target.value)"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de selecciones -->
      <div class="taxonomias-seleccionadas">
        <h4 class="sub-titulo">Taxonomías Seleccionadas ({{ modelValue.length }})</h4>
        <div v-if="modelValue.length === 0" class="sin-selecciones">
          <p class="texto-vacio">No hay taxonomías seleccionadas</p>
        </div>
        <div v-else class="selecciones-lista">
          <div v-for="seleccion in modelValue" 
               :key="seleccion.Id_Taxonomia"
               class="seleccion-item">
            <div class="seleccion-header">
              <span class="seleccion-nombre">{{ getNombreTaxonomia(seleccion.Id_Taxonomia) }}</span>
              <button @click="removerTaxonomia(seleccion.Id_Taxonomia)" 
                      class="btn-remover">
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
            <div v-if="seleccion.Comentarios" class="seleccion-comentarios">
              <small>{{ seleccion.Comentarios }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'cambio'])

// Estado local
const taxonomiasDisponibles = ref([])
const cargando = ref(false)

// Computed
const taxonomiasSeleccionadasIds = computed(() => 
  props.modelValue.map(t => t.Id_Taxonomia)
)

// Métodos
function estaSeleccionada(idTaxonomia) {
  return taxonomiasSeleccionadasIds.value.includes(idTaxonomia)
}

function getComentarios(idTaxonomia) {
  const seleccion = props.modelValue.find(t => t.Id_Taxonomia === idTaxonomia)
  return seleccion?.Comentarios || ''
}

function getNombreTaxonomia(idTaxonomia) {
  const taxonomia = taxonomiasDisponibles.value.find(t => t.Id_Taxonomia === idTaxonomia)
  return taxonomia?.Nombre || `Taxonomía ${idTaxonomia}`
}

function toggleTaxonomia(taxonomia) {
  const yaSeleccionada = estaSeleccionada(taxonomia.Id_Taxonomia)
  
  if (yaSeleccionada) {
    removerTaxonomia(taxonomia.Id_Taxonomia)
  } else {
    agregarTaxonomia(taxonomia)
  }
}

function agregarTaxonomia(taxonomia) {
  const nuevaSeleccion = {
    Id_Taxonomia: taxonomia.Id_Taxonomia,
    Comentarios: ''
  }
  
  const nuevasSelecciones = [...props.modelValue, nuevaSeleccion]
  emit('update:modelValue', nuevasSelecciones)
  emit('cambio')
}

function removerTaxonomia(idTaxonomia) {
  const nuevasSelecciones = props.modelValue.filter(t => t.Id_Taxonomia !== idTaxonomia)
  emit('update:modelValue', nuevasSelecciones)
  emit('cambio')
}

function actualizarComentarios(idTaxonomia, comentarios) {
  const nuevasSelecciones = props.modelValue.map(t => 
    t.Id_Taxonomia === idTaxonomia 
      ? { ...t, Comentarios: comentarios }
      : t
  )
  emit('update:modelValue', nuevasSelecciones)
  emit('cambio')
}

async function cargarTaxonomias() {
  try {
    cargando.value = true
    const response = await fetch('/api/admin/taxonomias')
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    taxonomiasDisponibles.value = data.taxonomias || []
    
    console.log('✅ Taxonomías cargadas:', taxonomiasDisponibles.value.length)
  } catch (error) {
    console.error('❌ Error cargando taxonomías:', error)
    taxonomiasDisponibles.value = []
  } finally {
    cargando.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarTaxonomias()
})
</script>

<style scoped>
.seccion-taxonomias {
  @apply space-y-6;
}

.taxonomias-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.sub-titulo {
  @apply text-lg font-semibold text-white mb-4 flex items-center;
}

.taxonomias-disponibles {
  @apply bg-gray-700 rounded-lg p-4;
}

.taxonomias-lista {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.taxonomia-item {
  @apply bg-gray-600 rounded-md p-3 cursor-pointer transition-colors border-2 border-transparent;
}

.taxonomia-item:hover {
  @apply bg-gray-500;
}

.taxonomia-item.seleccionada {
  @apply border-indigo-500 bg-indigo-600;
}

.taxonomia-header {
  @apply flex items-start space-x-3;
}

.taxonomia-checkbox {
  @apply text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded mt-1;
}

.taxonomia-nombre {
  @apply font-medium text-white;
}

.taxonomia-descripcion {
  @apply text-sm text-gray-300 mt-2 ml-6;
}

.taxonomia-comentarios {
  @apply mt-3 ml-6;
}

.comentarios-label {
  @apply block text-sm text-gray-300 mb-1;
}

.comentarios-textarea {
  @apply w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm
         focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500;
}

.taxonomias-seleccionadas {
  @apply bg-gray-700 rounded-lg p-4;
}

.sin-selecciones {
  @apply text-center py-8;
}

.texto-vacio {
  @apply text-gray-400 italic;
}

.selecciones-lista {
  @apply space-y-2;
}

.seleccion-item {
  @apply bg-indigo-600 rounded-md p-3;
}

.seleccion-header {
  @apply flex justify-between items-center;
}

.seleccion-nombre {
  @apply font-medium text-white;
}

.btn-remover {
  @apply text-white hover:text-red-300 p-1 hover:bg-red-600 rounded transition-colors;
}

.seleccion-comentarios {
  @apply mt-2 text-gray-200;
}
</style>