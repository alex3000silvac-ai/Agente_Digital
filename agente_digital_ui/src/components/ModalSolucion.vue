<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-white">{{ esEdicion ? 'Editar Solución' : 'Crear Nueva Solución' }}</h3>
    </template>
    
    <template #default>
      <div v-if="solucionLocal" class="space-y-4">
        <div>
          <label for="nombreSolucion" class="form-label required">Nombre de la Solución</label>
          <input autocomplete="off" type="text" id="nombreSolucion" v-model="solucionLocal.NombreSolucion" class="form-input">
        </div>
        <div>
          <label for="descripcionSolucion" class="form-label">Descripción</label>
          <textarea autocomplete="off" id="descripcionSolucion" v-model="solucionLocal.DescripcionSolucion" class="form-input" rows="4"></textarea>
        </div>
        <div>
          <label for="tipoSolucion" class="form-label">Tipo de Solución</label>
          <input autocomplete="off" type="text" id="tipoSolucion" v-model="solucionLocal.TipoSolucion" class="form-input" placeholder="Ej: Servicio, Producto, Consultoría">
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
          <button @click="$emit('update:modelValue', false)" type="button" class="btn btn-secondary">Cancelar</button>
          <button @click="guardar" type="button" class="btn btn-primary">Guardar Solución</button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Modal from './Modal.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  solucion: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'guardado']);

const solucionLocal = ref(null);

const esEdicion = computed(() => !!(solucionLocal.value && solucionLocal.value.SolucionID));

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Clona el objeto para evitar modificar el original directamente
    solucionLocal.value = props.solucion ? { ...props.solucion } : { NombreSolucion: '', DescripcionSolucion: '', TipoSolucion: '' };
  }
});

async function guardar() {
    if (!solucionLocal.value.NombreSolucion) {
        alert('El nombre de la solución es obligatorio.');
        return;
    }

    const url = esEdicion.value 
        ? `http://localhost:5000/api/admin/soluciones/${solucionLocal.value.SolucionID}`
        : `http://localhost:5000/api/admin/soluciones`;
    
    const method = esEdicion.value ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solucionLocal.value)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        alert(result.message);
        emit('guardado'); // Notifica al padre que se guardó para que pueda recargar la lista
        emit('update:modelValue', false); // Cierra el modal
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
}
</script>

<style scoped>
/* Usamos los mismos estilos de formulario que ya tenemos */
.form-label { display: block; font-weight: 600; color: #d1d5db; margin-bottom: 0.5rem; }
.form-label.required::after { content: ' *'; color: #fca5a5; }
.form-input { width: 100%; background-color: #374151; border: 1px solid #4b5563; color: white; padding: 0.75rem 1rem; border-radius: 0.375rem; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; border: 1px solid #4b5563; color: #d1d5db; }
</style>