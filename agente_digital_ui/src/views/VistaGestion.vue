<template>
  <div>
    <button @click="$emit('volver')" class="btn btn-volver mb-6">
      <i class="ph-fill ph-arrow-left mr-2"></i> Volver a la Lista de Inquilinos
    </button>

    <div class="tabs">
      <button @click="vistaActiva = 'empresas'" :class="{ 'active': vistaActiva === 'empresas' }">
        <i class="ph-fill ph-buildings mr-2"></i>Gestión de Empresas
      </button>
      <button @click="vistaActiva = 'acompanamiento'" :class="{ 'active': vistaActiva === 'acompanamiento' }">
        <i class="ph-fill ph-shield-check mr-2"></i>Acompañamiento
      </button>
    </div>

    <div v-if="vistaActiva === 'empresas'" class="mt-6">
      <FormularioEmpresa v-if="mostrarFormulario" :inquilino-id="inquilinoId" :empresa-para-editar="empresaSeleccionada" @empresa-creada="manejarCambios" @empresa-actualizada="manejarCambios" @cancelar="ocultarFormulario" />
      <div v-else>
        <div class="toolbar"><button @click="abrirFormularioCreacion" class="btn btn-primary">+ Agregar Nueva Empresa</button></div>
        <TablaEmpresas ref="tablaEmpresasRef" :inquilino-id="inquilinoId" @modificar-empresa="abrirFormularioEdicion" />
      </div>
    </div>

    <div v-if="vistaActiva === 'acompanamiento'" class="mt-6">
      <div v-if="cargandoEmpresas" class="card-dark text-center p-8">Cargando empresas...</div>
      <div v-else-if="listaEmpresas.length === 0" class="card-dark text-center p-8">
        <p>Este inquilino no tiene empresas gestionadas.</p>
      </div>
      <div v-else>
        <div class="selector-container card-dark mb-6">
          <label for="empresa-selector" class="selector-label">Mostrando Plan de Acompañamiento para la Empresa:</label>
          <select autocomplete="off" id="empresa-selector" v-model="empresaActivaId" class="form-input">
            <option disabled value="">Seleccione una empresa</option>
            <option v-for="empresa in listaEmpresas" :key="empresa.EmpresaID" :value="empresa.EmpresaID">
              {{ empresa.RazonSocial }} ({{ empresa.TipoEmpresa }})
            </option>
          </select>
        </div>
        <ModuloAcompanamiento
          v-if="empresaActivaId"
          :key="empresaActivaId" 
          :empresa-id="empresaActivaId"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
// --- RUTAS DE IMPORTACIÓN CORREGIDAS ---
// Estos componentes deben estar en la carpeta /src/components/
import TablaEmpresas from '../components/TablaEmpresas.vue';
import FormularioEmpresa from '../components/FormularioEmpresa.vue';
import ModuloAcompanamiento from '../components/ModuloAcompanamiento.vue';

const props = defineProps({ inquilinoId: { type: Number, required: true } });
defineEmits(['volver']);

const vistaActiva = ref('empresas');

// --- Lógica para Gestión de Empresas ---
const mostrarFormulario = ref(false);
const tablaEmpresasRef = ref(null);
const empresaSeleccionada = ref(null);
function ocultarFormulario() { mostrarFormulario.value = false; empresaSeleccionada.value = null; }
function manejarCambios() { ocultarFormulario(); if (tablaEmpresasRef.value) { tablaEmpresasRef.value.cargarEmpresas(); } }
function abrirFormularioCreacion() { empresaSeleccionada.value = null; mostrarFormulario.value = true; }
function abrirFormularioEdicion(empresa) { empresaSeleccionada.value = empresa; mostrarFormulario.value = true; }

// --- Lógica para Acompañamiento ---
const listaEmpresas = ref([]);
const empresaActivaId = ref(null);
const cargandoEmpresas = ref(false);

watch(vistaActiva, (nuevaVista) => {
  if (nuevaVista === 'acompanamiento') {
    empresaActivaId.value = null;
    buscarEmpresasDelInquilino();
  }
});

async function buscarEmpresasDelInquilino() {
  cargandoEmpresas.value = true;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${props.inquilinoId}/empresas`);
    if (!response.ok) throw new Error('Error al buscar empresas del inquilino');
    listaEmpresas.value = await response.json();
  } catch (error) {
    console.error("Error en buscarEmpresasDelInquilino:", error);
  } finally {
    cargandoEmpresas.value = false;
  }
}
</script>

<style scoped>
/* Estilos del componente */
.toolbar { margin-bottom: 1.5rem; text-align: right; }
.selector-container { display: flex; align-items: center; gap: 1rem; }
.selector-label { font-weight: 600; color: #d1d5db; white-space: nowrap; }
</style>