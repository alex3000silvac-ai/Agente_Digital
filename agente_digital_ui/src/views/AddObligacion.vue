<template>
  <div class="maestros-container">
    <div>
      <a href="#" @click.prevent="$router.back()" class="btn-volver">
        <span>←</span> Volver a la lista
      </a>
      <h1 style="font-size: 1.8rem; color: #fff; font-weight: bold;">Añadir Nueva Obligación</h1>
    </div>

    <div class="card-dark" style="max-width: 800px;">
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Artículo Norma</label>
                <input autocomplete="off" v-model="form.ArticuloNorma" type="text" class="form-input">
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

        <div v-if="error" style="color: #fca5a5; text-align: center; margin-top: 1rem;">
          {{ error }}
        </div>

        <div style="text-align: right; margin-top: 1.5rem;">
          <a href="#" @click.prevent="$router.back()" class="btn-secondary">Cancelar</a>
          <button type="submit" class="btn-primary">Guardar Obligación</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';

const router = useRouter();
// El objeto del formulario ahora usa los nombres de columna exactos
const form = ref({
  ArticuloNorma: '',
  Descripcion: '',
  Origen: '',
  AplicaPara: '',
  TipoExigencia: '',
  Frecuencia: ''
});
const error = ref(null);

const handleSubmit = async () => {
  error.value = null;
  try {
    await apiClient.post('/obligaciones/', form.value);
    router.push({ name: 'obligaciones' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Ocurrió un error al crear la obligación.';
    console.error(err);
  }
};
</script>
