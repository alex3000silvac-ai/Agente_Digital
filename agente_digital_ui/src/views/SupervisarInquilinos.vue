<template>
  <div class="page-container">
    <h1 class="page-header">Supervisar Inquilinos Ley Ciberseguridad 21.663</h1>
    
    <p class="page-subheader">
      <span v-if="!inquilinoSeleccionado">
        Seleccione un inquilino para ver sus empresas.
      </span>
      <span v-else-if="!empresaSeleccionada">
        <a href="#" @click.prevent="volverAInquilinos" class="breadcrumb-link">Inquilinos</a> / {{ inquilinoSeleccionado.NombreInquilino }}
      </span>
      <span v-else>
        <a href="#" @click.prevent="volverAInquilinos" class="breadcrumb-link">Inquilinos</a> / 
        <a href="#" @click.prevent="volverAEmpresas" class="breadcrumb-link">{{ inquilinoSeleccionado.NombreInquilino }}</a> / {{ empresaSeleccionada.NombreEmpresa }}
      </span>
    </p>

    <div v-if="isLoading" class="text-center p-8">Cargando datos...</div>

    <div v-if="!inquilinoSeleccionado && !isLoading" class="dashboard-grid">
      <p v-if="inquilinos.length === 0" class="text-gray-500">No se encontraron inquilinos registrados.</p>
      <a href="#" v-for="inquilino in inquilinos" :key="inquilino.InquilinoID" @click.prevent="seleccionarInquilino(inquilino)" class="card-link">
        <div class="card-dark">
          <div class="card-icon">🏢</div>
          <h3 class="card-title">{{ inquilino.NombreInquilino }}</h3>
        </div>
      </a>
    </div>

    <div v-else-if="!empresaSeleccionada && !isLoading" class="dashboard-grid">
      <p v-if="empresas.length === 0" class="text-gray-500">Este inquilino no tiene empresas asociadas.</p>
      <a href="#" v-for="empresa in empresas" :key="empresa.EmpresaID" @click.prevent="seleccionarEmpresa(empresa)" class="card-link">
        <div class="card-dark">
          <div class="card-icon">🏭</div>
          <h3 class="card-title">{{ empresa.NombreEmpresa }}</h3>
        </div>
      </a>
    </div>

    <div v-else-if="!isLoading" class="dashboard-grid">
      <router-link :to="{ name: 'acompanamiento', params: { empresaId: empresaSeleccionada.EmpresaID } }" class="card-link">
        <div class="card-dark">
          <div class="card-icon">🤝</div>
          <h3 class="card-title">Gestión de Acompañamiento</h3>
          <p class="card-description">Ver y gestionar el checklist de cumplimiento de la empresa.</p>
        </div>
      </router-link>
      <router-link to="#" class="card-link">
        <div class="card-dark">
          <div class="card-icon">⚠️</div>
          <h3 class="card-title">Gestión de Incidentes</h3>
          <p class="card-description">Reportar y dar seguimiento a los incidentes de ciberseguridad.</p>
        </div>
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';

const inquilinos = ref([]);
const empresas = ref([]);
const inquilinoSeleccionado = ref(null);
const empresaSeleccionada = ref(null);
const isLoading = ref(false);

const cargarInquilinos = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/inquilinos/');
    inquilinos.value = response.data;
  } catch (error) {
    console.error("Error al cargar inquilinos:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(cargarInquilinos);

const seleccionarInquilino = async (inquilino) => {
  inquilinoSeleccionado.value = inquilino;
  isLoading.value = true;
  try {
    const response = await apiClient.get(`/inquilinos/${inquilino.InquilinoID}/empresas`);
    empresas.value = response.data;
  } catch (error) {
    console.error(`Error al cargar empresas para el inquilino ${inquilino.InquilinoID}:`, error);
  } finally {
    isLoading.value = false;
  }
};

const seleccionarEmpresa = (empresa) => {
  empresaSeleccionada.value = empresa;
};

const volverAInquilinos = () => {
  inquilinoSeleccionado.value = null;
  empresaSeleccionada.value = null;
  empresas.value = [];
};

const volverAEmpresas = () => {
  empresaSeleccionada.value = null;
};
</script>

<style scoped>
.breadcrumb-link { color: var(--color-text-secondary); text-decoration: none; }
.breadcrumb-link:hover { color: var(--color-accent); text-decoration: underline; }
</style>
