<template>
  <div class="maestros-container">
    <div>
      <a href="#" @click.prevent="$router.back()" class="btn-volver">
        <span>←</span> Volver a la lista
      </a>
      <h1 style="font-size: 1.8rem; color: #fff; font-weight: bold;">Editar Obligación</h1>
    </div>

    <div v-if="isLoading" class="text-center p-8">Cargando datos de la obligación...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    
    <div v-else class="card-dark" style="max-width: 800px;">
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Artículo Norma</label>
                <input autocomplete="off" v-model="form.ArticuloNorma" type="text" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Origen</label>
                <input autocomplete="off" v-model="form.Origen" type="text" class="form-input">
            </div>
            <div class="form-group">
                <label class="form-label">Aplica Para</label>
                <input autocomplete="off" v-model="form.AplicaPara" type="text" class="form-input">
            </div>
            <div class="form-group">
                <label class="form-label">Tipo Exigencia</label>
                <input autocomplete="off" v-model="form.TipoExigencia" type="text" class="form-input">
            </div>
            <div class="form-group-full">
                <label class="form-label">Frecuencia</label>
                <input autocomplete="off" v-model="form.Frecuencia" type="text" class="form-input">
            </div>
            <div class="form-group-full">
                <label class="form-label">Descripción</label>
                <textarea autocomplete="off" v-model="form.Descripcion" class="form-input" rows="4"></textarea>
            </div>
        </div>

        <div style="text-align: right; margin-top: 1.5rem;">
          <a href="#" @click.prevent="$router.back()" class="btn-secondary">Cancelar</a>
          <button type="submit" class="btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '../services/api';

const router = useRouter(); // Para la navegación
const route = useRoute();   // Para leer parámetros de la URL, como el ID

const form = ref({});
const error = ref(null);
const isLoading = ref(true);
const obligacionId = route.params.id; // Obtenemos el ID de la obligación desde la URL

// Cuando el componente se carga, buscamos los datos de la obligación a editar
onMounted(async () => {
  try {
    const response = await apiClient.get(`/obligaciones/${obligacionId}`);
    form.value = response.data; // Pre-llenamos el formulario con los datos recibidos
  } catch (err) {
    error.value = err.response?.data?.message || 'No se pudieron cargar los datos de la obligación.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

// Cuando el usuario guarda el formulario
const handleSubmit = async () => {
  error.value = null;
  try {
    // Usamos el método PUT para enviar los datos actualizados
    await apiClient.put(`/obligaciones/${obligacionId}`, form.value);
    router.push({ name: 'obligaciones' }); // Volvemos a la lista
  } catch (err) {
    error.value = err.response?.data?.message || 'Ocurrió un error al actualizar la obligación.';
    console.error(err);
  }
};
</script>