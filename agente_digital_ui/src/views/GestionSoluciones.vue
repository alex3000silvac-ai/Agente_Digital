<template>
  <div class="vista-gestion-soluciones">
    <div class="header mb-6 pb-4 border-b border-gray-700">
      <h1 class="text-3xl font-bold text-white">Gestión de Vínculos y Soluciones</h1>
      <p class="text-gray-400 mt-1">Conecta las recomendaciones del plan de acompañamiento con las soluciones del catálogo.</p>
    </div>

    <div class="gestion-grid">
      <div class="card">
        <h2 class="card-titulo">1. Seleccione una Recomendación</h2>
        <div v-if="loading.arbol" class="loading-placeholder">Cargando árbol de acompañamiento...</div>
        <div v-else class="arbol-container">
            <div v-for="obligacion in obligaciones" :key="obligacion.ObligacionID" class="obligacion-item">
                <p class="obligacion-titulo">{{ obligacion.ArticuloNorma }}</p>
                <div v-for="verbo in obligacion.Verbos" :key="verbo.VerboID" class="verbo-item">
                    <p class="verbo-titulo">{{ verbo.NombreVerbo }}</p>
                    <ul class="pl-2">
                        <li v-for="rec in verbo.Recomendaciones" :key="rec.RecomendacionID" 
                            @click="seleccionarRecomendacion(rec)"
                            class="recomendacion-item"
                            :class="{ 'seleccionado': recomendacionSeleccionada?.RecomendacionID === rec.RecomendacionID }">
                            {{ rec.DescripcionRecomendacion }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>

      <div class="card">
        <div class="flex justify-between items-center">
            <h2 class="card-titulo">2. Catálogo de Soluciones</h2>
            <button @click="abrirModalParaCrear" class="btn btn-secondary btn-sm">
                <i class="ph ph-plus"></i> Crear Solución
            </button>
        </div>
        <div v-if="loading.soluciones" class="loading-placeholder">Cargando soluciones...</div>
        <div v-else class="soluciones-container">
            <div v-if="soluciones.length === 0" class="empty-state">No hay soluciones en el catálogo.</div>
            <div v-for="solucion in soluciones" :key="solucion.SolucionID" class="solucion-item">
                <div class="flex-grow">
                    <p class="font-semibold text-white">{{ solucion.NombreSolucion }}</p>
                    <p class="text-xs text-gray-400">{{ solucion.TipoSolucion || 'Sin tipo' }}</p>
                </div>
                <button @click="abrirModalParaEditar(solucion)" class="btn-editar-solucion" title="Editar Solución">
                    <i class="ph ph-pencil-simple"></i>
                </button>
            </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-titulo">3. Vincular Soluciones</h2>
        <div v-if="!recomendacionSeleccionada" class="empty-state p-8">
            <i class="ph ph-arrow-left text-4xl mb-4 text-gray-600"></i>
            <p>Seleccione una recomendación de la primera columna para ver y editar sus soluciones asociadas.</p>
        </div>
        <div v-else>
            <p class="mb-4 text-sm">Asociar soluciones para:</p>
            <p class="recomendacion-activa">{{ recomendacionSeleccionada.DescripcionRecomendacion }}</p>
            
            <div v-if="loading.vinculos" class="loading-placeholder mt-4">Cargando vínculos...</div>
            <div v-else class="vinculos-container space-y-3">
                <label v-for="solucion in soluciones" :key="solucion.SolucionID" class="checkbox-label" :title="solucion.DescripcionSolucion">
                    <input autocomplete="off" type="checkbox" :value="solucion.SolucionID" v-model="solucionesVinculadasIds" class="checkbox-input">
                    <span class="truncate">{{ solucion.NombreSolucion }}</span>
                </label>
            </div>

            <div class="mt-6 text-right">
                <button @click="guardarVinculos" class="btn btn-primary" :disabled="guardandoVinculos">
                    <span v-if="guardandoVinculos">Guardando...</span>
                    <span v-else>Guardar Vínculos</span>
                </button>
            </div>
        </div>
      </div>
    </div>

    <ModalSolucion 
      v-model="mostrandoModal"
      :solucion="solucionSeleccionadaParaModal"
      @guardado="handleGuardadoDeSolucion"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ModalSolucion from '../components/ModalSolucion.vue';

// --- ESTADOS REACTIVOS ---

// Datos de las columnas
const obligaciones = ref([]);
const soluciones = ref([]);
const recomendacionSeleccionada = ref(null);
const solucionesVinculadasIds = ref([]);

// Estados de carga para una mejor UX
const loading = ref({
    arbol: true,
    soluciones: true,
    vinculos: false
});
const guardandoVinculos = ref(false);

// Estados para el modal de edición/creación de soluciones
const mostrandoModal = ref(false);
const solucionSeleccionadaParaModal = ref(null);

const API_BASE_URL = 'http://localhost:5000/api/admin';

// --- LÓGICA DE CARGA DE DATOS ---

onMounted(() => {
    cargarDatosIniciales();
});

async function cargarDatosIniciales() {
    loading.value.arbol = true;
    loading.value.soluciones = true;
    try {
        const [arbolRes, solucionesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/acompanamiento/arbol-completo`),
            fetch(`${API_BASE_URL}/soluciones`)
        ]);

        if (!arbolRes.ok) throw new Error('No se pudo cargar el árbol de acompañamiento.');
        if (!solucionesRes.ok) throw new Error('No se pudo cargar el catálogo de soluciones.');
        
        obligaciones.value = await arbolRes.json();
        soluciones.value = await solucionesRes.json();

    } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        alert(err.message);
    } finally {
        loading.value.arbol = false;
        loading.value.soluciones = false;
    }
}

async function cargarSoluciones() {
    loading.value.soluciones = true;
    try {
        const response = await fetch(`${API_BASE_URL}/soluciones`);
        if (!response.ok) throw new Error('No se pudo recargar el catálogo de soluciones.');
        soluciones.value = await response.json();
    } catch(err) {
        alert(err.message);
    } finally {
        loading.value.soluciones = false;
    }
}

// --- LÓGICA DE INTERACCIÓN ---

async function seleccionarRecomendacion(recomendacion) {
    if (recomendacionSeleccionada.value?.RecomendacionID === recomendacion.RecomendacionID) return;

    recomendacionSeleccionada.value = recomendacion;
    loading.value.vinculos = true;
    solucionesVinculadasIds.value = [];

    try {
        const response = await fetch(`${API_BASE_URL}/recomendaciones/${recomendacion.RecomendacionID}/soluciones-vinculadas`);
        if (!response.ok) throw new Error('No se pudieron cargar los vínculos para la recomendación.');
        
        solucionesVinculadasIds.value = await response.json();
    } catch (err) {
        console.error("Error cargando vínculos:", err);
        alert(err.message);
    } finally {
        loading.value.vinculos = false;
    }
}

async function guardarVinculos() {
    if (!recomendacionSeleccionada.value) return;
    guardandoVinculos.value = true;
    try {
        const url = `${API_BASE_URL}/recomendaciones/${recomendacionSeleccionada.value.RecomendacionID}/soluciones-vinculadas`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solucionesVinculadasIds.value)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error desconocido al guardar.');
        
        alert(result.message);
    } catch (err) {
        alert(`Error al guardar los vínculos: ${err.message}`);
    } finally {
        guardandoVinculos.value = false;
    }
}

// --- LÓGICA DEL MODAL ---

function abrirModalParaCrear() {
  solucionSeleccionadaParaModal.value = null; // Limpiamos para indicar que es uno nuevo
  mostrandoModal.value = true;
}

function abrirModalParaEditar(solucion) {
  solucionSeleccionadaParaModal.value = solucion; // Pasamos la solución a editar
  mostrandoModal.value = true;
}

function handleGuardadoDeSolucion() {
    // Cuando el modal nos avisa que guardó, recargamos la lista de soluciones
    cargarSoluciones();
}
</script>

<style scoped>
.vista-gestion-soluciones {
  padding: 2rem;
}

.gestion-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem; 
}

.card { 
  background-color: #1f2937; 
  border-radius: 0.75rem; 
  padding: 1.5rem; 
  border: 1px solid #374151; 
  display: flex; 
  flex-direction: column;
  min-height: 400px; /* Altura mínima para consistencia */
}

.card-titulo { 
  font-size: 1.125rem; 
  font-weight: 600; 
  color: #e5e7eb; 
  margin-bottom: 1.5rem; 
  flex-shrink: 0;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.75rem;
}

.arbol-container, .soluciones-container, .vinculos-container { 
  overflow-y: auto; 
  flex-grow: 1; 
  padding-right: 0.5rem; /* Espacio para la barra de scroll */
}

/* Estilos de la columna 1: Árbol */
.obligacion-titulo { font-weight: bold; color: #a78bfa; margin-top: 1rem; }
.obligacion-item:first-child .obligacion-titulo { margin-top: 0; }
.verbo-item { padding-left: 1rem; border-left: 1px solid #374151; margin-top: 0.5rem; }
.verbo-titulo { font-weight: 500; color: #d1d5db; }
.recomendacion-item { 
  font-size: 0.875rem; 
  color: #9ca3af; 
  padding: 0.75rem; 
  border-radius: 0.375rem; 
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}
.recomendacion-item:hover { background-color: #374151; color: #e5e7eb; }
.recomendacion-item.seleccionado { 
  background-color: #4f46e5; 
  color: white; 
  font-weight: 600;
  border-color: #a78bfa;
}

/* Estilos de la columna 2: Soluciones */
.soluciones-container { display: flex; flex-direction: column; gap: 0.75rem; }
.solucion-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: #2d3748;
  transition: background-color 0.2s;
}
.solucion-item:hover { background-color: #374151; }
.btn-editar-solucion { 
  background: none; 
  border: none; 
  color: #9ca3af; 
  cursor: pointer; 
  font-size: 1.25rem;
  padding: 0.25rem;
}
.btn-editar-solucion:hover { color: #c4b5fd; }

/* Estilos de la columna 3: Vínculos */
.recomendacion-activa {
  background-color: #111827;
  border: 1px solid #4f46e5;
  color: #c7d2fe;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.checkbox-label { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  padding: 0.75rem; 
  border-radius: 0.375rem; 
  cursor: pointer; 
  transition: background-color 0.2s;
  background-color: #374151;
  color: #d1d5db;
}
.checkbox-label:hover { background-color: #4b5563; }
.checkbox-input { 
  width: 1rem; 
  height: 1rem; 
  accent-color: #6d28d9;
  flex-shrink: 0;
}

/* Utilidades y estados */
.loading-placeholder, .empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #6b7280;
  font-style: italic;
  flex-grow: 1;
  height: 100%;
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
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-primary:hover:not(:disabled) { background-color: #4338ca; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background-color: #374151; color: #d1d5db; border: 1px solid #4b5563; }
.btn-secondary:hover { background-color: #4b5563; }

</style>