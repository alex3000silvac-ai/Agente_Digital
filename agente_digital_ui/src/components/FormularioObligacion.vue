<template>
  <form @submit.prevent class="space-y-4">
    <div>
      <label for="articulo" class="form-label">Artículo / Norma</label>
      <input autocomplete="off" type="text" id="articulo" v-model="formData.ArticuloNorma" class="form-input" required>
    </div>
    <div>
      <label for="descripcion" class="form-label">Descripción</label>
      <textarea autocomplete="off" id="descripcion" v-model="formData.Descripcion" class="form-input" rows="4" required></textarea>
    </div>
    <div>
      <label for="origen" class="form-label">Origen</label>
      <input autocomplete="off" type="text" id="origen" v-model="formData.Origen" class="form-input">
    </div>
    <div>
      <label for="aplicaPara" class="form-label">Aplica Para</label>
      <select autocomplete="off" id="aplicaPara" v-model="formData.AplicaPara" class="form-input" required>
        <option disabled value="">Seleccione una opción</option>
        <option>Ambos</option>
        <option>OIV</option>
        <option>PSE</option>
      </select>
    </div>
    <div>
      <label for="tipoExigencia" class="form-label">Tipo de Exigencia</label>
      <input autocomplete="off" type="text" id="tipoExigencia" v-model="formData.TipoExigencia" class="form-input">
    </div>
    <div>
      <label for="frecuencia" class="form-label">Frecuencia</label>
      <input autocomplete="off" type="text" id="frecuencia" v-model="formData.Frecuencia" class="form-input">
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue';

// Este componente usa v-model, por lo que necesita estas props y emits.
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['update:modelValue']);

// Usamos una propiedad computada para vincular el formulario al v-model del padre.
// Esto evita modificar directamente la 'prop' y sigue las mejores prácticas de Vue.
const formData = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  }
});
</script>

<style scoped>
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #9ca3af;
  font-size: 0.875rem;
}
.form-input {
  width: 100%;
  border: 1px solid #4b5563;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: #374151;
  color: #ffffff;
  box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
}
</style>