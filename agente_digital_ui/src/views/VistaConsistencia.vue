<template>
  <div class="gestion-container">
    <h1 class="text-2xl font-bold text-white mb-2">Módulo de Consistencia (Regla de Oro)</h1>
    <p class="text-gray-400 mb-6">Vincule las recomendaciones de cumplimiento con las categorías de incidentes correspondientes.</p>

    <div v-if="loading.consistencia" class="text-center text-gray-400 p-8">Cargando datos de consistencia...</div>
    
    <table v-else class="data-table">
        <thead>
            <tr>
                <th>Obligación (Artículo)</th>
                <th>Verbo Rector</th>
                <th>Recomendación de Cumplimiento</th>
                <th>Vínculos con Incidentes</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in consistenciaData" :key="item.RecomendacionID">
                <td data-label="Obligación" class="col-obligacion">{{ item.ArticuloNorma }}</td>
                <td data-label="Verbo Rector" class="col-verbo">{{ item.NombreVerbo }}</td>
                <td data-label="Recomendación">{{ item.DescripcionRecomendacion }}</td>
                <td data-label="Vínculos">
                    <div class="vinculos-container">
                        <span v-if="item.Vinculos.length === 0" class="tag-vacio">Sin vínculos</span>
                        <span v-for="vinculo in item.Vinculos" :key="vinculo.id" class="tag-vinculo">
                            {{ vinculo.text }}
                        </span>
                    </div>
                </td>
                <td data-label="Acciones">
                    <button @click="abrirModal(item)" class="btn btn-secondary btn-sm">
                        <i class="ph ph-link"></i> Editar Vínculos
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <Modal v-model="modal.visible" size="large">
        <template #header>
            <h3 class="text-lg font-medium leading-6 text-white">Editar Vínculos para la Recomendación</h3>
            <p v-if="modal.itemActual" class="text-sm text-gray-400 mt-1">{{ modal.itemActual.DescripcionRecomendacion }}</p>
        </template>
        <template #default>
            <div v-if="loading.taxonomia" class="text-center text-gray-400 p-4">Cargando taxonomía...</div>
            <div v-else class="arbol-taxonomia">
                <div v-for="area in arbolTaxonomia" :key="area.AreaID" class="nodo-area">
                    <h4 class="titulo-area">{{ area.NombreArea }}</h4>
                    <div v-for="efecto in area.efectos" :key="efecto.EfectoID" class="nodo-efecto">
                        <h5 class="titulo-efecto">{{ efecto.NombreEfecto }}</h5>
                        <ul class="lista-categorias">
                            <li v-for="cat in efecto.categorias" :key="cat.CategoriaID">
                                <label class="checkbox-label">
                                    <input autocomplete="off" type="checkbox" :value="cat.CategoriaID" v-model="vinculosSeleccionados" class="checkbox-input">
                                    <span>{{ cat.DescripcionCategoria }} ({{ cat.AplicaPara }})</span>
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <button @click="modal.visible = false" type="button" class="btn btn-secondary">Cancelar</button>
            <button @click="guardarVinculos" type="button" class="btn btn-primary">Guardar Vínculos</button>
        </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Modal from '../components/Modal.vue';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// --- ESTADO ---
const consistenciaData = ref([]);
const arbolTaxonomia = ref([]);
const vinculosSeleccionados = ref([]); // Array de IDs de categorías seleccionadas
const loading = reactive({ consistencia: true, taxonomia: true });
const modal = reactive({ visible: false, itemActual: null });

// --- LÓGICA DE CARGA DE DATOS ---
async function cargarConsistencia() {
    loading.consistencia = true;
    try {
        const response = await fetch(`${API_BASE_URL}/consistencia`);
        if (!response.ok) throw new Error("No se pudieron cargar los datos de consistencia");
        consistenciaData.value = await response.json();
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        loading.consistencia = false;
    }
}

async function cargarArbolTaxonomia() {
    loading.taxonomia = true;
    try {
        const areasRes = await fetch(`${API_BASE_URL}/taxonomia/areas`);
        const areas = await areasRes.json();

        for (const area of areas) {
            const efectosRes = await fetch(`${API_BASE_URL}/taxonomia/areas/${area.AreaID}/efectos`);
            area.efectos = await efectosRes.json();
            for (const efecto of area.efectos) {
                const categoriasRes = await fetch(`${API_BASE_URL}/taxonomia/efectos/${efecto.EfectoID}/categorias`);
                efecto.categorias = await categoriasRes.json();
            }
        }
        arbolTaxonomia.value = areas;
    } catch (error) {
        console.error(error);
        alert("No se pudo cargar el árbol de taxonomía para la vinculación.");
    } finally {
        loading.taxonomia = false;
    }
}

onMounted(() => {
    cargarConsistencia();
    cargarArbolTaxonomia();
});

// --- LÓGICA DE MODAL Y VINCULACIÓN ---
function abrirModal(item) {
    modal.itemActual = item;
    // Pre-seleccionar los checkboxes con los vínculos existentes
    vinculosSeleccionados.value = item.Vinculos.map(v => v.id);
    modal.visible = true;
}

async function guardarVinculos() {
    if (!modal.itemActual) return;
    const recomendacionId = modal.itemActual.RecomendacionID;
    
    try {
        const response = await fetch(`${API_BASE_URL}/recomendaciones/${recomendacionId}/vinculos`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vinculosSeleccionados.value)
        });
        if (!response.ok) throw new Error("Error al guardar los vínculos.");
        
        // Actualizar la vista principal sin recargar toda la página
        await cargarConsistencia();
        modal.visible = false;

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}
</script>

<style scoped>
.gestion-container { padding: 2rem; }
.data-table { width: 100%; border-collapse: collapse; background-color: #1f2937; border-radius: 0.5rem; overflow: hidden; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #374151; vertical-align: top; }
.data-table th { background-color: #374151; font-weight: 600; color: #ffffff; }
.data-table td { color: #d1d5db; }

.col-obligacion { width: 15%; font-weight: 500; }
.col-verbo { width: 15%; }

.vinculos-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag-vinculo { background-color: #4f46e5; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; white-space: nowrap; }
.tag-vacio { color: #6b7280; font-style: italic; }

.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }

/* Estilos del Modal y Arbol de Taxonomía */
.arbol-taxonomia { max-height: 60vh; overflow-y: auto; padding-right: 1rem; }
.nodo-area { margin-bottom: 1rem; }
.titulo-area { font-size: 1.1rem; font-weight: 600; color: #ffffff; padding-bottom: 0.5rem; border-bottom: 1px solid #4b5563; margin-bottom: 0.75rem; }
.nodo-efecto { margin-left: 1.5rem; margin-bottom: 1rem; }
.titulo-efecto { font-size: 1rem; font-weight: 500; color: #e5e7eb; margin-bottom: 0.5rem; }
.lista-categorias { list-style: none; padding-left: 1.5rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.75rem; padding: 0.25rem 0; cursor: pointer; color: #d1d5db; }
.checkbox-input { width: 1rem; height: 1rem; cursor: pointer; }

.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; color: #d1d5db; }
</style>