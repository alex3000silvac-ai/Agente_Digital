<template>
  <div class="vista-incidentes-container">
    <div class="header-con-navegacion mb-6 border-b border-gray-700 pb-4">
       <button @click="volver" class="btn-volver">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Mis Empresas</span>
      </button>
    </div>

    <div class="header">
      <div>
        <h1 class="text-3xl font-bold text-white">Historial de Incidentes</h1>
        <p class="text-gray-400">Revisa y gestiona los incidentes registrados para esta empresa.</p>
      </div>
      <button @click="irADeclarar" class="btn btn-primary">
        <i class="ph ph-plus-circle"></i>
        <span>Registrar Nuevo Incidente</span>
      </button>
    </div>

    <div v-if="loading" class="text-center p-16 text-gray-400">Cargando incidentes...</div>
    <div v-else-if="error" class="text-center p-16 text-red-400">
      <p>Ocurrió un error al cargar los incidentes.</p>
      <p class="text-sm">{{ error }}</p>
    </div>
    
    <div v-else-if="incidentes && incidentes.length > 0" class="tabla-incidentes-card">
    <table class="w-full text-left">
        <thead>
          <tr>
            <th>ID del Incidente</th>
            <th>Título</th>
            <th>Fecha de Detección</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="incidente in incidentes" :key="incidente.IncidenteID">
            <td class="font-mono">{{ incidente.IDVisible }}</td>
            <td>{{ incidente.Titulo }}</td>
            <td>{{ formatarFecha(incidente.FechaDeteccion) }}</td>
            <td>
              <span class="tag-estado" :class="`estado-${incidente.Estado?.toLowerCase().replace(' ', '-')}`">
                {{ incidente.Estado }}
              </span>
            </td>
            <td>
              <button @click="irADetalle(incidente.IncidenteID)" class="btn btn-secondary btn-sm">
                Ver Detalle
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center p-16 text-yellow-400">
      <p class="text-xl font-semibold">No hay incidentes registrados</p>
      <p class="text-gray-500 mt-2">Puedes comenzar registrando el primer incidente para esta empresa.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps({
  empresaId: {
    type: [String, Number],
    required: true
  }
});

const incidentes = ref([]);
const loading = ref(true);
const error = ref(null);
const inquilinoId = ref(null); // <-- NUEVA REF

async function obtenerInquilinoId() {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${props.empresaId}`);
    if (!response.ok) return;
    const data = await response.json();
    // Necesitamos que la API devuelva el InquilinoID. Asumiremos que lo hace.
    // Si no, necesitaremos un pequeño ajuste en api_admin.py en `get_empresa_details`
    inquilinoId.value = data.InquilinoID;
  } catch (error) {
    console.error("No se pudo obtener el InquilinoID", error);
  }
}

function volver() {
  if (inquilinoId.value) {
    // Lógica corregida: Siempre vuelve a la lista de empresas del inquilino.
    router.push({ 
      name: 'VistaEmpresas', 
      params: { inquilinoId: inquilinoId.value } 
    });
  } else {
    // Fallback si no hay inquilinoId
    router.push({ name: 'Dashboard' });
  }
}

onMounted(() => {
  obtenerInquilinoId(); // <-- LLAMADA A LA NUEVA FUNCIÓN
  cargarIncidentes();
});

async function cargarIncidentes() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${props.empresaId}/incidentes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error del servidor.');
    }
    incidentes.value = await response.json();
  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function irADetalle(incidenteId) {
  console.log(`🔄 Navegando a detalle del incidente: ${incidenteId}`);
  router.push({ 
    name: 'VistaDetalleIncidente', 
    params: { incidenteId: incidenteId } 
  });
}

function irADeclarar() {
  router.push(`/empresa/${props.empresaId}/incidentes/declarar`);
}

function formatarFecha(fecha) {
  if (!fecha) return 'N/A';
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-CL', opciones);
}
</script>

<style scoped>
.header-con-navegacion {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #374151;
  color: #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
}
.btn-volver:hover { background-color: #4b5563; }
.btn-volver i { font-size: 1.25rem; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  border-bottom: 1px solid #374151;
  padding-bottom: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary { background-color: #4f46e5; color: white; }
.btn-primary:hover { background-color: #4338ca; }
.btn-secondary { background-color: #374151; color: #d1d5db; border: 1px solid #4b5563; }
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }

.tabla-incidentes-card {
  background-color: #1f2937;
  border-radius: 0.5rem;
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
  border: 1px solid #374151;
}

th {
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid #374151;
}

td {
  padding: 1rem 0;
  color: #d1d5db;
  border-bottom: 1px solid #374151;
}

tbody tr:last-child td {
  border-bottom: none;
}

.tag-estado {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  color: white;
}
.estado-activo { background-color: #f97316; }
.estado-en-investigación { background-color: #0ea5e9; }
.estado-contenido { background-color: #a855f7; }
.estado-erradicado { background-color: #10b981; }
.estado-recuperado { background-color: #22c55e; }
.estado-cerrado { background-color: #6b7280; }
</style>