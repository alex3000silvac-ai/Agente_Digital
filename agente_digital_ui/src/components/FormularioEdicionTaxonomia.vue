<template>
  <form @submit.prevent class="space-y-4">
    <div>
      <label for="areaImpacto" class="form-label">Área de Impacto</label>
      <input autocomplete="off" type="text" id="areaImpacto" v-model="formData.AreaImpacto" class="form-input" required>
    </div>
    <div>
      <label for="efectoObservable" class="form-label">Efecto Observable</label>
      <input autocomplete="off" type="text" id="efectoObservable" v-model="formData.EfectoObservable" class="form-input" required>
    </div>
    <div>
      <label for="categoria" class="form-label">Categoría</label>
      <textarea autocomplete="off" id="categoria" v-model="formData.Categoria" class="form-input" rows="3" required></textarea>
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['update:modelValue']);

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
  box-sizing: border-box;
}
</style>