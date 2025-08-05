<template>
  <div>
    <div class="card-dark">
      <div class="card-header-dark !border-b-0 !pb-0 !mb-4">
        <h2 class="text-xl font-bold text-white">Maestro de Vínculos: Acompañamiento e Incidentes</h2>
        <p class="text-sm text-gray-400 mt-1">Seleccione una obligación para gestionar sus vínculos con la taxonomía de incidentes.</p>
      </div>
      <div class="overflow-x-auto">
        <div v-if="loading" class="p-8 text-center text-gray-400">Cargando obligaciones...</div>
        <div v-else-if="error" class="p-8 text-center text-red-400">{{ error }}</div>
        <table v-else-if="obligaciones.length > 0" class="data-table-dark">
          <thead>
            <tr>
              <th>Artículo Norma</th>
              <th>Descripción de la Obligación</th>
              <th class="text-center">Vínculos</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="obligacion in obligaciones" :key="obligacion.ObligacionID" :class="{ 'bg-gray-700': obligacionActiva && obligacionActiva.ObligacionID === obligacion.ObligacionID }">
              <td class="font-mono w-1/6">{{ obligacion.ArticuloNorma }}</td>
              <td class="text-white w-3/6">{{ obligacion.Descripcion }}</td>
              <td class="text-center font-bold text-lg" :class="obligacion.TotalVinculos > 0 ? 'text-green-400' : 'text-yellow-400'">{{ obligacion.TotalVinculos }}</td>
              <td class="text-right">
                <button @click="seleccionarObligacion(obligacion)" class="btn btn-primary">
                  {{ obligacionActiva && obligacionActiva.ObligacionID === obligacion.ObligacionID ? 'Ocultar Vínculos' : 'Gestionar Vínculos' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="p-8 text-center text-gray-400">No se encontraron obligaciones.</div>
      </div>
    </div>
    <div v-if="obligacionActiva" class="card-dark mt-6" ref="editorVinculos">
       <div class="card-header-dark">
        <h3 class="text-xl font-bold text-white">Editando Vínculos para: <span class="text-indigo-400">{{ obligacionActiva.ArticuloNorma }}</span></h3>
        <p class="text-sm text-gray-400 mt-1">{{ obligacionActiva.Descripcion }}</p>
      </div>
      <div class="mt-4">
        <div v-if="loadingTaxonomia" class="text-center p-4">Cargando taxonomía...</div>
        <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            <div v-for="(efectos, areaImpacto) in taxonomiaAgrupada" :key="areaImpacto" class="border border-gray-700 rounded-lg bg-gray-800/50">
                <button @click="toggleAccordion(areaImpacto)" type="button" class="flex items-center justify-between w-full p-4 text-left font-semibold text-white hover:bg-gray-700">
                    <span>{{ areaImpacto }}</span>
                    <i class="ph ph-caret-down transition-transform" :class="{ 'rotate-180': openSections[areaImpacto] }"></i>
                </button>
                <div v-show="openSections[areaImpacto]" class="px-4 pb-2 border-t border-gray-700">
                    <div v-for="(categorias, efectoObservable) in efectos" :key="efectoObservable" class="pl-4 mt-3">
                        <h4 class="font-medium text-indigo-300 mb-2">{{ efectoObservable }}</h4>
                        <div class="pl-4 space-y-2">
                            <div v-for="categoria in categorias" :key="categoria.TaxonomiaID" class="flex items-center">
                                <input autocomplete="off" :id="'tax-' + categoria.TaxonomiaID" type="checkbox" :value="categoria.TaxonomiaID" v-model="vinculosSeleccionados" class="w-4 h-4 text-indigo-600 bg-gray-600 border-gray-500 rounded">
                                <label :for="'tax-' + categoria.TaxonomiaID" class="ml-2 text-sm text-gray-300 cursor-pointer">{{ categoria.Categoria }}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-700">
        <button @click="cerrarEditor" class="btn btn-secondary">Cerrar Editor</button>
        <button @click="guardarVinculos" class="btn btn-primary" :disabled="guardandoVinculos">
          {{ guardandoVinculos ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';

const obligaciones = ref([]);
const loading = ref(true);
const error = ref(null);
const obligacionActiva = ref(null);
const vinculosSeleccionados = ref([]);
const guardandoVinculos = ref(false);
const taxonomiaCompleta = ref([]);
const loadingTaxonomia = ref(true);
const openSections = ref({});
const editorVinculos = ref(null);

async function cargarDatosIniciales() {
  loading.value = true;
  error.value = null;
  try {
    const obsResponse = await fetch('http://localhost:5000/api/admin/obligaciones');
    if (!obsResponse.ok) throw new Error('No se pudo cargar la lista de obligaciones.');
    obligaciones.value = await obsResponse.json();
    const taxResponse = await fetch('http://localhost:5000/api/admin/taxonomia');
    if (!taxResponse.ok) throw new Error('No se pudo cargar la taxonomía.');
    taxonomiaCompleta.value = await taxResponse.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
    loadingTaxonomia.value = false;
  }
}
onMounted(cargarDatosIniciales);

async function seleccionarObligacion(obligacion) {
  if (obligacionActiva.value && obligacionActiva.value.ObligacionID === obligacion.ObligacionID) {
    cerrarEditor();
    return;
  }
  obligacionActiva.value = obligacion;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/acompanamiento/${obligacion.ObligacionID}/links`);
    if (!response.ok) throw new Error('No se pudieron cargar los vínculos existentes.');
    vinculosSeleccionados.value = await response.json();
    await nextTick();
    if (editorVinculos.value) {
      editorVinculos.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch(e) {
    alert(`Error: ${e.message}`);
  }
}

function cerrarEditor() {
  obligacionActiva.value = null;
  vinculosSeleccionados.value = [];
}

async function guardarVinculos() {
  if (!obligacionActiva.value) return;
  guardandoVinculos.value = true;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/acompanamiento/${obligacionActiva.value.ObligacionID}/links`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vinculosSeleccionados.value)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al guardar.');
    alert(result.message);
    cerrarEditor();
    cargarDatosIniciales();
  } catch(e) {
    alert(`Error: ${e.message}`);
  } finally {
    guardandoVinculos.value = false;
  }
}

const taxonomiaAgrupada = computed(() => {
  return taxonomiaCompleta.value.reduce((acc, item) => {
    const { AreaImpacto, EfectoObservable } = item;
    if (!acc[AreaImpacto]) acc[AreaImpacto] = {};
    if (!acc[AreaImpacto][EfectoObservable]) acc[AreaImpacto][EfectoObservable] = [];
    acc[AreaImpacto][EfectoObservable].push(item);
    return acc;
  }, {});
});

function toggleAccordion(sectionKey) {
  openSections.value[sectionKey] = !openSections.value[sectionKey];
}
</script>

<style scoped>
.card-dark { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.5rem; padding: 1.5rem; }
.card-header-dark { border-bottom: 1px solid #374151; padding-bottom: 1rem; }
.data-table-dark { width: 100%; text-align: left; }
.data-table-dark th { padding: 0.75rem 1rem; font-size: 0.75rem; color: #9ca3af; }
.data-table-dark td { padding: 0.75rem 1rem; border-top: 1px solid #374151; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; }
.btn-primary { background-color: #4f46e5; color: white; border: none; }
.btn-secondary { background-color: #374151; color: #d1d5db; border: none; }
.rotate-180 { transform: rotate(180deg); }
.transition-transform { transition: transform 0.2s ease-in-out; }
</style>