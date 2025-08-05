<template>
  <div class="vista-container">
    <header class="vista-header print-hide">
      <div class="flex justify-between items-center w-full">
        <div>
          <h1 class="vista-title">Informe de Brechas de Cumplimiento</h1>
          <p class="vista-subtitle">Generado el: {{ fechaActual }}</p>
        </div>
        <div class="flex gap-4">
            <button @click="volverAEmpresas" class="btn btn-secondary">
                <i class="ph ph-arrow-left"></i> Volver a Empresas
            </button>
            <button @click="imprimir" class="btn btn-primary">
                <i class="ph ph-printer"></i> Imprimir
            </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="text-center py-16 text-gray-400">Generando informe...</div>
    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <div v-else>
        <div class="info-bar">
            <span><strong>Inquilino:</strong> {{ infoEmpresa.InquilinoRazonSocial || 'N/A' }}</span>
            <span><strong>Empresa:</strong> {{ infoEmpresa.RazonSocial || 'N/A' }}</span>
            <span><strong>Tipo:</strong> <span class="badge" :class="getBadgeClass(infoEmpresa.TipoEmpresa)">{{ infoEmpresa.TipoEmpresa }}</span></span>
            <span><strong>Encargado Ciberseguridad:</strong> {{ infoEmpresa.EncargadoCiberseguridad || 'No asignado' }}</span>
        </div>

        <div class="report-table">
            <div class="table-header">
                <div class="header-cell" style="flex: 2;">Obligación (Norma)</div>
                <div class="header-cell" style="flex: 3;">Medio de Verificación / Observaciones</div>
                <div class="header-cell" style="flex: 1;">Estado de Cumplimiento</div>
                <div class="header-cell" style="flex: 2;">Propuesta Técnica</div>
            </div>
            <div v-if="informe.length > 0" class="table-body">
                <button 
                  v-for="item in informe" 
                  :key="item.ObligacionID" 
                  class="table-row-clickable"
                  @click="irADetalleObligacion(item)"
                  title="Haga clic para gestionar esta obligación"
                >
                    <div class="table-cell" style="flex: 2;">
                        <span class="font-semibold text-white">{{ item.ArticuloNorma }}</span>
                        <span class="text-sm text-gray-400 block mt-1">{{ item.Descripcion }}</span>
                    </div>
                    <div class="table-cell" style="flex: 3;">
                        <div v-if="item.MedioDeVerificacionSugerido" class="text-sm">
                            <strong class="text-gray-300">Medio de Verificación:</strong>
                            <p class="mt-1">{{ item.MedioDeVerificacionSugerido }}</p>
                        </div>
                        <div v-if="item.ObservacionesCiberseguridad || item.ObservacionesLegales" class="mt-2 text-xs">
                            <div v-if="item.ObservacionesCiberseguridad" class="mb-1">
                                <strong class="text-blue-300">Obs. Ciberseguridad:</strong> {{ item.ObservacionesCiberseguridad }}
                            </div>
                            <div v-if="item.ObservacionesLegales">
                                <strong class="text-purple-300">Obs. Legales:</strong> {{ item.ObservacionesLegales }}
                            </div>
                        </div>
                        <span v-if="!item.MedioDeVerificacionSugerido && !item.ObservacionesCiberseguridad && !item.ObservacionesLegales" class="text-gray-500">N/A</span>
                    </div>
                    <div class="table-cell" style="flex: 1;">
                        <span class="badge-status" :class="getEstadoClass(item.Estado)">
                            {{ item.Estado }}
                        </span>
                        <div v-if="item.PorcentajeAvance > 0" class="text-xs text-gray-400 mt-1">
                            {{ item.PorcentajeAvance }}% completado
                        </div>
                    </div>
                    <div class="table-cell" style="flex: 2;">
                         <div v-if="item.ContactoTecnicoComercial" class="text-sm text-blue-300">
                            {{ item.ContactoTecnicoComercial }}
                         </div>
                         <span v-if="!item.ContactoTecnicoComercial" class="text-gray-500">N/A</span>
                    </div>
                </button>
            </div>
             <div v-else class="text-center py-16 card-dark">
                <p class="text-gray-400">No se encontraron obligaciones aplicables para esta empresa.</p>
            </div>
        </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  empresaId: { type: [String, Number], required: true },
  inquilinoId: { type: [String, Number], required: true }
});

const router = useRouter();
const informe = ref([]);
const infoEmpresa = ref({});
const loading = ref(true);
const error = ref(null);

const fechaActual = computed(() => new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }));

async function cargarDatos() {
  loading.value = true;
  error.value = null;
  try {
    const [resInforme, resEmpresa, resInquilinos] = await Promise.all([
      axios.get(`http://localhost:5000/api/admin/empresas/${props.empresaId}/informe-cumplimiento`),
      axios.get(`http://localhost:5000/api/admin/empresas/${props.empresaId}`),
      axios.get(`http://localhost:5000/api/admin/inquilinos`)
    ]);
    
    // Extraer la lista de obligaciones detalladas del objeto de informe
    console.log('📊 DEBUG Frontend: Estructura del informe recibida:', resInforme.data);
    informe.value = resInforme.data.obligaciones_detalle;
    infoEmpresa.value = resEmpresa.data;
    
    const inquilino = resInquilinos.data.find(i => i.InquilinoID == props.inquilinoId);
    if(inquilino) {
        infoEmpresa.value.InquilinoRazonSocial = inquilino.RazonSocial;
    }

  } catch (err) {
    error.value = "No se pudo generar el informe. " + (err.response?.data?.error || err.message);
  } finally {
    loading.value = false;
  }
}

function volverAEmpresas() {
  router.push({ name: 'VistaEmpresas', params: { inquilinoId: props.inquilinoId } });
}

function irADetalleObligacion(item) {
    router.push({
        name: 'ModuloAcompanamiento',
        params: { empresaId: props.empresaId, inquilinoId: props.inquilinoId },
        query: { open: item.ObligacionID }
    });
}

function imprimir() {
    window.print();
}

function getBadgeClass(tipo) {
  if (tipo === 'OIV') return 'badge-oiv';
  if (tipo === 'PSE') return 'badge-pse';
  return 'badge-btd';
}

function getEstadoClass(estado) {
  switch(estado) {
    case 'Implementado':
      return 'status-cumplida';
    case 'En Proceso':
      return 'status-en-proceso';
    case 'Pendiente':
    default:
      return 'status-incumplida';
  }
}

function formatFecha(fechaISO) {
  if (!fechaISO) return 'N/A';
  try {
    return new Date(fechaISO).toLocaleDateString('es-CL');
  } catch (e) {
    return 'N/A';
  }
}

onMounted(cargarDatos);
</script>
<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .vista-container, .vista-container * {
    visibility: visible;
  }
  .vista-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 1rem;
    background-color: white !important;
    color: black !important;
  }
  .print-hide {
      display: none !important;
  }
  .vista-title, .vista-subtitle, .info-bar, .info-bar span, .info-bar strong, .report-table, .table-cell, .font-semibold.text-white, .table-cell span, .table-cell li {
      color: black !important;
  }
  .report-table, .table-row-clickable, .info-bar, .table-header {
      border-color: #ccc !important;
  }
  .badge-status, .badge {
      border: 1px solid #ccc;
      color: black !important;
      background-color: white !important;
      border-bottom: none !important;
  }
}

.vista-container { padding: 2rem; background-color: #111827; color: #e5e7eb; min-height: 100vh; }
.vista-header { margin-bottom: 2rem; }
.vista-title { font-size: 2rem; font-weight: 800; color: #ffffff; }
.vista-subtitle { font-size: 0.875rem; color: #9ca3af; }
.btn { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.6rem 1.2rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; color: #d1d5db; }

.info-bar { display: flex; flex-wrap: wrap; gap: 2rem; background-color: #1f2937; padding: 1rem 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; font-size: 0.875rem; border: 1px solid #374151;}
.info-bar strong { color: #9ca3af; margin-right: 0.5rem; }
.badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; }
.badge-oiv { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.badge-pse { background-color: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.report-table { background-color: #1f2937; border-radius: 0.5rem; border: 1px solid #374151; }
.table-header { display: flex; background-color: #2d3748; padding: 0.75rem 1.5rem; font-size: 0.75rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; border-bottom: 1px solid #374151; }
.header-cell { text-align: left; }

.table-row-clickable {
    display: flex;
    width: 100%;
    border-bottom: 1px solid #374151;
    background-color: transparent;
    text-align: left;
    color: inherit;
    cursor: pointer;
    padding: 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    transition: background-color 0.2s ease-in-out;
}
.table-row-clickable:hover {
    background-color: #2a3344;
}
.table-row-clickable:last-child {
    border-bottom: none;
}
.table-cell { padding: 1rem 1.5rem; font-size: 0.875rem; color: #d1d5db; display: flex; flex-direction: column; justify-content: center;}

/* Separación visual entre Estado de Cumplimiento y Propuesta Técnica */
.table-cell:nth-child(3) {
  border-right: 2px solid #374151;
  background-color: rgba(59, 130, 246, 0.03);
}
.table-cell:nth-child(4) {
  background-color: rgba(16, 185, 129, 0.03);
}
.badge-status {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.35rem 0.85rem;
    border-radius: 9999px;
    text-transform: uppercase;
    text-align: center;
    border-bottom: 3px solid rgba(0,0,0,0.2);
    transition: transform 0.1s ease-in-out;
}
.badge-status:hover {
    transform: translateY(-2px);
}
.status-cumplida { background-color: #22c55e; color: #ffffff; border-bottom-color: #15803d; }
.status-en-proceso { background-color: #3b82f6; color: #ffffff; border-bottom-color: #1d4ed8; }
.status-incumplida { background-color: #ef4444; color: #ffffff; border-bottom-color: #b91c1c; }
.recomendaciones-lista { list-style-type: disc; padding-left: 1.25rem; font-size: 0.875rem; color: #d1d5db; }
.error-banner { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ef4444; }
.card-dark { background-color: #1f2937; padding: 2rem; border-radius: 0.75rem; border: 1px solid #374151; }
</style>