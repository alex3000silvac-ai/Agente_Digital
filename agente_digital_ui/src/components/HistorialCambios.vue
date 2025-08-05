<template>
  <div class="card">
    <h2 class="card-titulo">
      <i class="ph ph-clock-counter-clockwise mr-2"></i>
      Historial de Cambios
    </h2>
    <div v-if="loading" class="text-center p-4 text-gray-400">Cargando historial...</div>
    <div v-else-if="error" class="text-center p-4 text-red-400">{{ error }}</div>
    <div v-else-if="historial.length === 0" class="item-vacio">No hay cambios registrados para este ítem.</div>
    <div v-else class="lista-historial">
      <div v-for="item in historial" :key="item.HistorialID" class="historial-item">
        <div class="historial-icono">
          <i class="ph ph-git-commit"></i>
        </div>
        <div class="historial-contenido">
          <p class="font-semibold text-white">
            Campo modificado: <span class="campo-modificado">{{ item.CampoModificado }}</span>
          </p>
          <div class="valores-grid">
            <div class="label-valor">
              <span class="label-historial">Valor Anterior:</span>
              <p class="valor-anterior">{{ item.ValorAnterior }}</p>
            </div>
            <div class="label-valor">
              <span class="label-historial">Valor Nuevo:</span>
              <p class="valor-nuevo">{{ item.ValorNuevo }}</p>
            </div>
          </div>
          <p class="historial-meta">
            {{ item.UsuarioCambio }} - {{ formatarFecha(item.FechaCambio) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  incidenteId: { type: [String, Number], required: true }
});

const historial = ref([]);
const loading = ref(true);
const error = ref(null);

async function cargarHistorial() {
  if (!props.incidenteId) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/historial`);
    if (!response.ok) throw new Error('No se pudo cargar el historial.');
    historial.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function formatarFecha(fecha) {
    if (!fecha) return 'N/A';
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-CL', opciones);
}

onMounted(cargarHistorial);

// Recargar el historial si el ID del incidente cambia
watch(() => props.incidenteId, cargarHistorial);
</script>

<style scoped>
.card { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; }
.card-titulo { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin: 0 0 1.5rem 0; display: flex; align-items: center; }
.lista-historial { max-height: 40vh; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; padding-right: 0.5rem;}
.historial-item { display: flex; gap: 1rem; padding: 1rem; background-color: #2d3748; border-radius: 0.5rem;}
.historial-icono { color: #818cf8; font-size: 1.5rem; padding-top: 0.25rem; }
.historial-contenido { flex-grow: 1; }
.campo-modificado { color: #c4b5fd; font-family: monospace; }
.valores-grid { display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-top: 0.5rem; }
.label-valor { display: flex; flex-direction: column; }
.label-historial { font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.1rem; }
.valor-anterior { color: #fca5a5; font-family: monospace; white-space: pre-wrap; word-break: break-all; font-size: 0.8rem; }
.valor-nuevo { color: #86efac; font-family: monospace; white-space: pre-wrap; word-break: break-all; font-size: 0.8rem; }
.historial-meta { font-size: 0.75rem; color: #6b7280; text-align: right; margin-top: 0.75rem; }
.item-vacio { text-align: center; color: #6b7280; padding: 1rem; }
</style>