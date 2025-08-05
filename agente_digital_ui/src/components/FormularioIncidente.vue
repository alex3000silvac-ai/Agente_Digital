<template>
  <form @submit.prevent class="form-section">
    <div>
      <label for="inquilino" class="form-label">1. Seleccione el Inquilino</label>
      <select autocomplete="off" id="inquilino" v-model="inquilinoSeleccionado" @change="onInquilinoChange" class="form-input" required>
        <option disabled value="">Elija un inquilino...</option>
        <option v-for="inquilino in listaInquilinos" :key="inquilino.InquilinoID" :value="inquilino.InquilinoID">
          {{ inquilino.RazonSocial }}
        </option>
      </select>
    </div>

    <div>
      <label for="empresa" class="form-label">2. Seleccione la Empresa Afectada</label>
      <select autocomplete="off" id="empresa" v-model="formData.EmpresaID" class="form-input" :disabled="!inquilinoSeleccionado" required>
        <option disabled value="">
          {{ inquilinoSeleccionado ? 'Elija una empresa...' : 'Primero seleccione un inquilino' }}
        </option>
        <option v-for="empresa in listaEmpresas" :key="empresa.EmpresaID" :value="empresa.EmpresaID">
          {{ empresa.RazonSocial }}
        </option>
      </select>
    </div>
    
    <hr class="border-gray-600 my-4">

    <div>
      <label class="form-label">3. Seleccione el Flujo de Trabajo para este Incidente</label>
      <div class="space-y-2">
        <div v-for="flujo in tiposDeFlujo" :key="flujo.valor" class="radio-option">
          <input autocomplete="off" type="radio" :id="flujo.valor" :value="flujo.valor" v-model="formData.TipoFlujo" name="tipoFlujo">
          <label :for="flujo.valor">
            <span class="font-semibold">{{ flujo.nombre }}</span>
            <span class="text-xs text-gray-400 block">{{ flujo.descripcion }}</span>
          </label>
        </div>
      </div>
    </div>
    
    <hr class="border-gray-600 my-4">

    <div>
      <label for="titulo" class="form-label">4. Título del Incidente</label>
      <input autocomplete="off" type="text" id="titulo" v-model="formData.Titulo" class="form-input" required>
    </div>
    <div>
      <label for="fechaDeteccion" class="form-label">5. Fecha y Hora de Detección</label>
      <input autocomplete="off" type="datetime-local" id="fechaDeteccion" v-model="formData.FechaDeteccion" class="form-input" required>
    </div>
    <div>
      <label for="descripcion" class="form-label">6. Descripción Inicial</label>
      <textarea autocomplete="off" id="descripcion" v-model="formData.DescripcionInicial" class="form-input" required></textarea>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '../services/api.js';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue']);

// --- Estado local del componente ---
const listaInquilinos = ref([]);
const listaEmpresas = ref([]);
const inquilinoSeleccionado = ref('');

const tiposDeFlujo = [
  { valor: 'ReporteANCI', nombre: 'Reportar a la ANCI', descripcion: 'Inicia el flujo completo con plazos legales.' },
  { valor: 'GestionInterna', nombre: 'Gestión Interna', descripcion: 'Se gestiona internamente, sin reportar a la ANCI.' },
  { valor: 'SoloRegistro', nombre: 'Solo Registrar', descripcion: 'Se registra para fines históricos, sin acciones inmediatas.' },
];

// --- v-model para el formulario ---
const formData = computed({
  get: () => props.modelValue,
  set: (value) => { emit('update:modelValue', value); }
});

// Cargar la lista de inquilinos cuando el componente se monta
onMounted(async () => {
  try {
    const response = await apiClient.get('/admin/inquilinos');
    listaInquilinos.value = response.data;
  } catch (e) {
    console.error("Error al cargar inquilinos:", e);
  }
});

// Función que se dispara cuando cambia el inquilino seleccionado
async function onInquilinoChange() {
  // Limpiamos la empresa seleccionada anteriormente
  formData.value.EmpresaID = ''; 
  listaEmpresas.value = [];
  if (!inquilinoSeleccionado.value) return;

  try {
    const response = await apiClient.get(`/admin/inquilinos/${inquilinoSeleccionado.value}/empresas`);
    listaEmpresas.value = response.data;
  } catch (e) {
    console.error("Error al cargar empresas:", e);
  }
}
</script>

<style scoped>
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #9ca3af; font-size: 0.875rem; }
.form-input { width: 100%; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.5rem 0.75rem; background-color: #374151; color: #ffffff; box-sizing: border-box; }
.form-input[type="datetime-local"]::-webkit-calendar-picker-indicator { background-color: #9ca3af; }
.form-input:disabled { background-color: #2d3748; cursor: not-allowed; }
.radio-option { display: flex; align-items: center; background-color: #2d3748; padding: 0.75rem; border-radius: 0.375rem; border: 1px solid #4b5563; }
.radio-option input { width: 1rem; height: 1rem; margin-right: 0.75rem; }
</style>