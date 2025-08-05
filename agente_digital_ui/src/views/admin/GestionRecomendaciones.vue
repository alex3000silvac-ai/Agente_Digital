<template>
  <div class="vista-container">
    <header class="vista-header">
      <h1 class="vista-title">Supervisar Inquilinos</h1>
      <p class="vista-subtitle">Seleccione un inquilino para ver las empresas asociadas.</p>
    </header>

    <div v-if="loading" class="text-center py-16">
      <p class="text-gray-400">Cargando inquilinos...</p>
    </div>

    <div v-else-if="error" class="error-banner">
      <p><strong>Ocurrió un error al cargar los inquilinos:</strong> {{ error }}</p>
    </div>
    
    <div v-else-if="inquilinos.length > 0" class="cards-grid">
      <router-link 
        v-for="inquilino in inquilinos" 
        :key="inquilino.InquilinoID"
        :to="'/inquilino/' + inquilino.InquilinoID + '/empresas'"
        class="card-item"
      >
        <div class="card-content">
          <h2 class="card-title">{{ inquilino.RazonSocial }}</h2>
          <p class="card-subtitle">{{ inquilino.RUT }}</p>
          <div class="card-footer">
            <span class="badge">{{ inquilino.TotalEmpresas }} {{ inquilino.TotalEmpresas === 1 ? 'Empresa' : 'Empresas' }}</span>
          </div>
        </div>
      </router-link>
    </div>

    <div v-else class="text-center py-16 card-dark">
      <p class="text-gray-400">No se encontraron inquilinos activos para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const inquilinos = ref([]);
const loading = ref(true);
const error = ref(null);

async function cargarInquilinos() {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get('http://localhost:5000/api/inquilinos/');
    inquilinos.value = response.data;
  } catch (err) {
    console.error("Error al cargar inquilinos:", err);
    error.value = err.message || "No se pudo establecer conexión con el servidor.";
  } finally {
    loading.value = false;
  }
}

onMounted(cargarInquilinos);
</script>

<style scoped>
.vista-container { padding: 1rem; }
.vista-header { margin-bottom: 2rem; }
.vista-title { font-size: 2.25rem; font-weight: 800; color: #ffffff; }
.vista-subtitle { font-size: 1.125rem; color: #9ca3af; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.card-item { display: block; background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
.card-item:hover { transform: translateY(-5px); border-color: #4f46e5; box-shadow: 0 10px 20px rgba(0,0,0,0.25); }
.card-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin-bottom: 0.25rem; }
.card-subtitle { font-family: monospace; color: #9ca3af; margin-bottom: 1rem; }
.card-footer { border-top: 1px solid #374151; padding-top: 1rem; margin-top: 1rem; }
.badge { display: inline-block; background-color: #374151; color: #a5b4fc; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; }
.error-banner { background-color: #9f1239; color: white; padding: 1rem; border-radius: 0.5rem; }
.card-dark { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; }
</style>
