<template>
  <div class="formulario-taxonomia-container">
    <div v-if="loading" class="text-center text-gray-400">
      Cargando taxonomía de incidentes...
    </div>
    <div v-else-if="error" class="text-center text-red-400">
      Error al cargar la taxonomía: {{ error }}
    </div>
    <div v-else class="space-y-4">
      <div v-for="(group, area) in taxonomiaAgrupada" :key="area" class="taxonomia-group">
        <h3 class="group-title">{{ area }}</h3>
        <div class="group-items">
          <div v-for="item in group" :key="item.TaxonomiaID" class="checkbox-wrapper">
            <input autocomplete="off" type="checkbox" 
              :id="`tax-${item.TaxonomiaID}`"
              :value="item.TaxonomiaID"
              v-model="selectedIDs"
              class="checkbox-input"
            />
            <label :for="`tax-${item.TaxonomiaID}`" class="checkbox-label">
              {{ item.Categoria }} <span class="text-gray-500 text-xs">({{ item.EfectoObservable }})</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

// Este componente usa v-model, por lo que necesita aceptar 'modelValue' y emitir 'update:modelValue'
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const taxonomiaCompleta = ref([]);
const loading = ref(true);
const error = ref(null);

// Variable reactiva para manejar los IDs de los checkboxes seleccionados
const selectedIDs = ref([...props.modelValue]);

// Observamos cambios en los checkboxes y emitimos el evento para actualizar el v-model en el padre
watch(selectedIDs, (newValue) => {
  emit('update:modelValue', newValue);
});

// Cuando el valor del padre cambia (por ejemplo, al abrir el modal con datos precargados), actualizamos los checkboxes
watch(() => props.modelValue, (newValue) => {
  selectedIDs.value = [...newValue];
});

// Usamos onMounted para cargar los datos de la API cuando el componente se crea por primera vez
onMounted(async () => {
  try {
    // Hacemos la llamada a la API que definimos en el backend
    const response = await fetch('http://localhost:5000/api/admin/taxonomia');
    if (!response.ok) {
      throw new Error('La respuesta del servidor no fue exitosa.');
    }
    taxonomiaCompleta.value = await response.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

// Usamos una propiedad computada para agrupar la lista de taxonomía por "AreaImpacto"
const taxonomiaAgrupada = computed(() => {
  return taxonomiaCompleta.value.reduce((acc, item) => {
    const key = item.AreaImpacto;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
});
</script>

<style scoped>
.formulario-taxonomia-container {
  max-height: 50vh; /* Altura máxima para el contenedor, con scroll si es necesario */
  overflow-y: auto;
  padding: 0.5rem;
  background-color: #111827; /* Un fondo ligeramente más oscuro para el área de scroll */
  border-radius: 0.375rem;
}

.taxonomia-group {
  margin-bottom: 1.5rem;
}

.group-title {
  font-weight: 600;
  color: #9ca3af;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  padding: 0.25rem;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  margin-right: 0.75rem;
  cursor: pointer;
}

.checkbox-label {
  color: #d1d5db;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>