<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-300 p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
        <h1 class="text-3xl font-bold text-white">Agente de Acompañamiento</h1>
        <p class="text-gray-400 mt-1">Plan de implementación para la Ley Marco de Ciberseguridad N° 21.663</p>
    </header>

    <div class="mb-6">
        <label for="empresa-selector" class="form-label">Viendo Plan de Acompañamiento para:</label>
        <select autocomplete="off" id="empresa-selector" v-model="empresaSeleccionadaId" @change="cargarObligaciones" class="form-input max-w-lg">
            <option disabled value="">Seleccione una empresa...</option>
            <option v-for="empresa in listaEmpresas" :key="empresa.EmpresaID" :value="empresa.EmpresaID">
                {{ empresa.RazonSocial }} ({{ empresa.TipoEmpresa }})
            </option>
        </select>
    </div>

    <main class="flex-1 overflow-y-auto">
        <div v-if="!empresaSeleccionadaId" class="text-center p-10 card-dark">
            <i class="ph ph-info text-6xl text-gray-600"></i>
            <h2 class="mt-4 text-xl font-semibold text-white">Seleccione una empresa</h2>
            <p class="text-gray-500">Por favor, elija una empresa en el menú superior para ver su plan.</p>
        </div>
        <div v-else-if="loadingObligaciones" class="text-center p-10 card-dark">Cargando obligaciones...</div>
        <div v-else-if="errorObligaciones" class="p-10 card-dark text-red-400">Error: {{ errorObligaciones }}</div>
        <div v-else class="space-y-4">
            <div v-for="(articulo, nombreArticulo) in obligacionesAgrupadas" :key="nombreArticulo">
                <div class="article-header" @click="toggleArticulo(nombreArticulo)">
                    <span class="article-title">{{ nombreArticulo }}</span>
                    <i class="ph ph-caret-down article-caret" :class="{ 'open': articulosAbiertos[nombreArticulo] }"></i>
                </div>
                <div v-if="articulosAbiertos[nombreArticulo]" class="activities-container">
                    <div v-for="obligacion in articulo" :key="obligacion.CumplimientoID" class="activity-card">
                        <h4 class="activity-title">{{ obligacion.Descripcion }}</h4>
                        <div class="form-grid">
                             <div><label :for="'status-' + obligacion.CumplimientoID" class="form-label">Estado</label><select autocomplete="off" :id="'status-' + obligacion.CumplimientoID" v-model="obligacion.Estado" class="form-input"><option>Pendiente</option><option>En Proceso</option><option>Implementado</option><option>No Aplica</option></select></div>
                             <div><label :for="'progress-' + obligacion.CumplimientoID" class="form-label">% Avance</label><input autocomplete="off" :id="'progress-' + obligacion.CumplimientoID" type="number" v-model.number="obligacion.PorcentajeAvance" min="0" max="100" class="form-input"></div>
                             <div><label :for="'resp-' + obligacion.CumplimientoID" class="form-label">Responsable</label><input autocomplete="off" :id="'resp-' + obligacion.CumplimientoID" type="text" v-model="obligacion.Responsable" class="form-input"></div>
                             <div><label :for="'date-' + obligacion.CumplimientoID" class="form-label">Fecha Término</label><input autocomplete="off" :id="'date-' + obligacion.CumplimientoID" type="date" :value="formatDateForInput(obligacion.FechaTermino)" @input="obligacion.FechaTermino = $event.target.value" class="form-input"></div>
                        </div>
                        <div class="mt-4 space-y-4">
                            <div><label :for="'obs-ciber-' + obligacion.CumplimientoID" class="form-label">Observaciones Ciberseguridad</label><textarea autocomplete="off" :id="'obs-ciber-' + obligacion.CumplimientoID" v-model="obligacion.ObservacionesCiberseguridad" class="form-input" rows="2"></textarea></div>
                            <div><label :for="'obs-legal-' + obligacion.CumplimientoID" class="form-label">Observaciones Legales</label><textarea autocomplete="off" :id="'obs-legal-' + obligacion.CumplimientoID" v-model="obligacion.ObservacionesLegales" class="form-input" rows="2"></textarea></div>
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-secondary">Adjuntar Evidencia</button>
                            <button @click="guardarCumplimiento(obligacion)" class="btn btn-primary">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const listaEmpresas = ref([]);
const empresaSeleccionadaId = ref('');
const obligaciones = ref([]);
const loadingObligaciones = ref(false);
const errorObligaciones = ref(null);
const articulosAbiertos = ref({});

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/empresas');
    if (!response.ok) throw new Error('No se pudo obtener la lista de empresas.');
    listaEmpresas.value = await response.json();
  } catch (e) { console.error("Error al cargar empresas:", e); }
});

async function cargarObligaciones() {
    if (!empresaSeleccionadaId.value) return;
    loadingObligaciones.value = true;
    errorObligaciones.value = null;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/empresas/${empresaSeleccionadaId.value}/acompanamiento`);
        if (!response.ok) throw new Error('No se pudo cargar la información de cumplimiento.');
        obligaciones.value = await response.json();
    } catch (e) {
        errorObligaciones.value = e.message;
    } finally {
        loadingObligaciones.value = false;
    }
}

const obligacionesAgrupadas = computed(() => {
  return obligaciones.value.reduce((acc, obligacion) => {
    const key = obligacion.ArticuloNorma || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(obligacion);
    return acc;
  }, {});
});

function toggleArticulo(nombreArticulo) {
  articulosAbiertos.value[nombreArticulo] = !articulosAbiertos.value[nombreArticulo];
}

async function guardarCumplimiento(obligacion) {
  const payload = {
    Estado: obligacion.Estado,
    PorcentajeAvance: obligacion.PorcentajeAvance,
    Responsable: obligacion.Responsable,
    FechaTermino: obligacion.FechaTermino,
    ObservacionesCiberseguridad: obligacion.ObservacionesCiberseguridad,
    ObservacionesLegales: obligacion.ObservacionesLegales
  };
  try {
    const response = await fetch(`http://localhost:5000/api/admin/cumplimiento/${obligacion.CumplimientoID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al guardar');
    alert(`Éxito: ${result.message}`);
  } catch (e) {
    alert(`Error al guardar: ${e.message}`);
  }
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
}
</script>

<style scoped>
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #9ca3af; }
.form-input { display: block; width: 100%; background-color: #374151; color: #ffffff; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.6rem; }
.card-dark { background-color: #1f2937; border-radius: 0.5rem; padding: 1.5rem; }
.article-header { background-color: #374151; padding: 0.75rem 1rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-radius: 0.5rem; }
.article-title { font-weight: 600; color: #ffffff; }
.article-caret { transition: transform 0.3s; }
.article-caret.open { transform: rotate(180deg); }
.activities-container { padding-left: 1rem; border-left: 2px solid #4b5563; margin-top: 1rem; }
.activity-card { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; }
.activity-title { font-weight: 500; color: #e5e7eb; margin-bottom: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; color: #d1d5db; }
</style>