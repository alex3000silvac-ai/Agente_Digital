<template>
  <div class="gestion-container">
    <h1 class="text-2xl font-bold text-white mb-6">Gestión de Taxonomía de Incidentes</h1>

    <div class="tres-columnas-layout">
      <div class="columna">
        <div class="columna-header">
          <h2 class="font-semibold text-lg">1. Áreas de Impacto</h2>
          <button @click="abrirModal('area')" class="btn-nuevo" title="Añadir nueva área">+</button>
        </div>
        <div v-if="loading.areas" class="p-4 text-center text-gray-400">Cargando...</div>
        <ul v-else class="lista-items">
          <li
            v-for="area in areas"
            :key="area.AreaID"
            @click="seleccionarArea(area)"
            :class="{ 'item-seleccionado': areaSeleccionada?.AreaID === area.AreaID }"
            class="item-con-acciones"
          >
            <span>{{ area.NombreArea }}</span>
            <div class="acciones">
                <button @click.stop="abrirModal('area', area)" class="btn-accion" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button @click.stop="eliminarItem('area', area)" class="btn-accion btn-peligro" title="Eliminar"><i class="ph ph-trash"></i></button>
            </div>
          </li>
        </ul>
      </div>

      <div class="columna">
        <div v-if="areaSeleccionada">
          <div class="columna-header">
            <h2 class="font-semibold text-lg">2. Efectos Observables</h2>
            <button @click="abrirModal('efecto')" class="btn-nuevo" title="Añadir nuevo efecto">+</button>
          </div>
          <div v-if="loading.efectos" class="p-4 text-center text-gray-400">Cargando...</div>
          <ul v-else class="lista-items">
            <li
              v-for="efecto in efectos"
              :key="efecto.EfectoID"
              @click="seleccionarEfecto(efecto)"
              :class="{ 'item-seleccionado': efectoSeleccionado?.EfectoID === efecto.EfectoID }"
              class="item-con-acciones"
            >
              <span>{{ efecto.NombreEfecto }}</span>
              <div class="acciones">
                <button @click.stop="abrirModal('efecto', efecto)" class="btn-accion" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button @click.stop="eliminarItem('efecto', efecto)" class="btn-accion btn-peligro" title="Eliminar"><i class="ph ph-trash"></i></button>
              </div>
            </li>
             <li v-if="!efectos.length && !loading.efectos" class="item-vacio">No hay efectos para esta área.</li>
          </ul>
        </div>
        <div v-else class="columna-vacia">Seleccione un área de impacto</div>
      </div>

      <div class="columna">
        <div v-if="efectoSeleccionado">
          <div class="columna-header">
            <h2 class="font-semibold text-lg">3. Categorías Específicas</h2>
            <button @click="abrirModal('categoria')" class="btn-nuevo" title="Añadir nueva categoría">+</button>
          </div>
          <div v-if="loading.categorias" class="p-4 text-center text-gray-400">Cargando...</div>
          <ul v-else class="lista-items">
            <li
              v-for="cat in categorias"
              :key="cat.CategoriaID"
              class="item-con-acciones"
            >
              <span class="descripcion-recomendacion">{{ cat.DescripcionCategoria }} ({{cat.AplicaPara}})</span>
              <div class="acciones">
                <button @click.stop="abrirModal('categoria', cat)" class="btn-accion" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button @click.stop="eliminarItem('categoria', cat)" class="btn-accion btn-peligro" title="Eliminar"><i class="ph ph-trash"></i></button>
              </div>
            </li>
            <li v-if="!categorias.length && !loading.categorias" class="item-vacio">No hay categorías para este efecto.</li>
          </ul>
        </div>
         <div v-else class="columna-vacia">Seleccione un efecto observable</div>
      </div>
    </div>

    <Modal v-model="modal.visible">
      <template #header>
        <h3 class="text-lg font-medium leading-6 text-white">{{ modal.titulo }}</h3>
      </template>
      <template #default>
        <div class="space-y-4">
          <div v-if="modal.tipo === 'area'">
            <label class="form-label">Nombre del Área de Impacto</label>
            <input autocomplete="off" type="text" v-model="itemEnEdicion.NombreArea" class="form-input">
          </div>
          <div v-if="modal.tipo === 'efecto'">
            <label class="form-label">Nombre del Efecto Observable</label>
            <input autocomplete="off" type="text" v-model="itemEnEdicion.NombreEfecto" class="form-input">
          </div>
          <div v-if="modal.tipo === 'categoria'">
            <div>
              <label class="form-label">Descripción de la Categoría</label>
              <textarea autocomplete="off" v-model="itemEnEdicion.DescripcionCategoria" class="form-input" rows="3"></textarea>
            </div>
            <div>
              <label class="form-label">Aplica Para</label>
              <select autocomplete="off" v-model="itemEnEdicion.AplicaPara" class="form-input">
                <option value="OIV">OIV</option>
                <option value="PSE">PSE</option>
                <option value="BTD">BTD</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="modal.visible = false" type="button" class="btn btn-secondary">Cancelar</button>
        <button @click="guardarItem" type="button" class="btn btn-primary">{{ modal.esEdicion ? 'Guardar Cambios' : 'Crear' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Modal from '../components/Modal.vue'; 

const API_BASE_URL = 'http://localhost:5000/api/admin/taxonomia';

// --- ESTADO DE DATOS Y SELECCIÓN ---
const areas = ref([]);
const efectos = ref([]);
const categorias = ref([]);
const areaSeleccionada = ref(null);
const efectoSeleccionado = ref(null);
const loading = reactive({ areas: true, efectos: false, categorias: false });
const modal = reactive({ visible: false, titulo: '', tipo: '', esEdicion: false });
const itemEnEdicion = ref({});

// --- LÓGICA DE CARGA DE DATOS ---
const cargarAreas = async () => {
  loading.areas = true;
  const response = await fetch(`${API_BASE_URL}/areas`);
  areas.value = await response.json();
  loading.areas = false;
};

const cargarEfectos = async (areaId) => {
  loading.efectos = true;
  efectos.value = [];
  categorias.value = [];
  efectoSeleccionado.value = null;
  const response = await fetch(`${API_BASE_URL}/areas/${areaId}/efectos`);
  efectos.value = await response.json();
  loading.efectos = false;
};

const cargarCategorias = async (efectoId) => {
  loading.categorias = true;
  categorias.value = [];
  const response = await fetch(`${API_BASE_URL}/efectos/${efectoId}/categorias`);
  categorias.value = await response.json();
  loading.categorias = false;
};

onMounted(cargarAreas);

// --- LÓGICA DE SELECCIÓN ---
function seleccionarArea(area) {
  areaSeleccionada.value = area;
  cargarEfectos(area.AreaID);
}

function seleccionarEfecto(efecto) {
  efectoSeleccionado.value = efecto;
  cargarCategorias(efecto.EfectoID);
}

// --- LÓGICA DE MODAL Y CRUD ---
const configCRUD = {
  area: {
    tituloNuevo: 'Nueva Área de Impacto',
    tituloEditar: 'Editar Área de Impacto',
    idField: 'AreaID',
    endpoint: 'areas',
    reload: cargarAreas,
    camposRequeridos: ['NombreArea'],
  },
  efecto: {
    tituloNuevo: 'Nuevo Efecto Observable',
    tituloEditar: 'Editar Efecto Observable',
    idField: 'EfectoID',
    endpoint: 'efectos',
    reload: () => cargarEfectos(areaSeleccionada.value.AreaID),
    camposRequeridos: ['NombreEfecto'],
  },
  categoria: {
    tituloNuevo: 'Nueva Categoría Específica',
    tituloEditar: 'Editar Categoría Específica',
    idField: 'CategoriaID',
    endpoint: 'categorias',
    reload: () => cargarCategorias(efectoSeleccionado.value.EfectoID),
    camposRequeridos: ['DescripcionCategoria', 'AplicaPara'],
  }
};

function abrirModal(tipo, item = null) {
  const config = configCRUD[tipo];
  if ((tipo === 'efecto' && !areaSeleccionada.value) || (tipo === 'categoria' && !efectoSeleccionado.value)) {
    return alert(`Por favor, seleccione un ítem de la columna anterior primero.`);
  }

  modal.tipo = tipo;
  modal.esEdicion = !!item;
  modal.titulo = item ? config.tituloEditar : config.tituloNuevo;
  itemEnEdicion.value = item ? { ...item } : {};
  modal.visible = true;
}

async function guardarItem() {
  const config = configCRUD[modal.tipo];
  
  // Validación de campos
  for(const campo of config.camposRequeridos) {
      if(!itemEnEdicion.value[campo] || itemEnEdicion.value[campo].trim() === '') {
        return alert(`El campo '${campo}' no puede estar vacío.`);
      }
  }
  
  const esEdicion = modal.esEdicion;
  let url = `${API_BASE_URL}/`;
  if (esEdicion) {
    url += `${config.endpoint}/${itemEnEdicion.value[config.idField]}`;
  } else {
    if (modal.tipo === 'efecto') url += `areas/${areaSeleccionada.value.AreaID}/efectos`;
    else if (modal.tipo === 'categoria') url += `efectos/${efectoSeleccionado.value.EfectoID}/categorias`;
    else url += config.endpoint;
  }
  
  try {
    const response = await fetch(url, {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemEnEdicion.value),
    });
    if (!response.ok) throw new Error(await response.text());
    modal.visible = false;
    await config.reload();
  } catch (error) {
    console.error(`Error al guardar:`, error);
    alert(`Error al guardar: ${error.message}`);
  }
}

async function eliminarItem(tipo, item) {
  const config = configCRUD[tipo];
  const id = item[config.idField];
  const nombre = item.NombreArea || item.NombreEfecto || item.DescripcionCategoria;

  if (!confirm(`¿Está seguro de que desea eliminar "${nombre}"? Se eliminarán también todos sus elementos hijos.`)) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${config.endpoint}/${id}`, { method: 'DELETE' });
     if (!response.ok) throw new Error(await response.text());
    
    // Limpiar selección si el item eliminado era el seleccionado
    if(tipo === 'area' && areaSeleccionada.value?.AreaID === id) {
        areaSeleccionada.value = null;
        efectoSeleccionado.value = null;
        efectos.value = [];
        categorias.value = [];
    } else if (tipo === 'efecto' && efectoSeleccionado.value?.EfectoID === id) {
        efectoSeleccionado.value = null;
        categorias.value = [];
    }
    await config.reload();
  } catch (error) {
    console.error(`Error al eliminar:`, error);
    alert(`Error al eliminar: ${error.message}`);
  }
}
</script>

<style scoped>
/* Los estilos son idénticos a los de GestionObligaciones.vue para mantener la consistencia visual */
.gestion-container { padding: 2rem; }
.tres-columnas-layout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.columna { background-color: #1f2937; border-radius: 0.5rem; border: 1px solid #374151; display: flex; flex-direction: column; min-height: 70vh; max-height: 70vh; }
.columna-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #374151; flex-shrink: 0; }
.columna-header h2 { color: #ffffff; }
.btn-nuevo { background-color: #4f46e5; color: white; border-radius: 9999px; width: 2rem; height: 2rem; font-size: 1.5rem; line-height: 2rem; text-align: center; border: none; cursor: pointer; transition: background-color 0.2s; flex-shrink: 0; }
.btn-nuevo:hover { background-color: #4338ca; }
.lista-items { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex-grow: 1; }
.lista-items li { padding: 0.75rem 1rem; border-bottom: 1px solid #374151; transition: background-color 0.2s; font-size: 0.875rem; }
.lista-items li:not(.item-vacio) { cursor: pointer; }
.lista-items li:not(.item-vacio):hover { background-color: #374151; }
.lista-items li.item-seleccionado { background-color: #4f46e5; color: white; }
.item-vacio { padding: 1rem; text-align: center; color: #6b7280; }
.columna-vacia { display: flex; align-items: center; justify-content: center; flex-grow: 1; color: #4b5563; font-style: italic; padding: 1rem; text-align: center; }
.item-con-acciones { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.item-con-acciones > span { flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.acciones { display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; flex-shrink: 0; }
.item-con-acciones:hover .acciones { opacity: 1; }
.btn-accion { background: transparent; border: none; color: #9ca3af; cursor: pointer; padding: 0.25rem; font-size: 1.25rem; }
.btn-accion:hover { color: white; }
.btn-accion.btn-peligro:hover { color: #ef4444; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #9ca3af; font-size: 0.875rem; }
.form-input { width: 100%; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.5rem 0.75rem; background-color: #374151; color: #ffffff; }
textarea.form-input { resize: vertical; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; color: #d1d5db; }
.descripcion-recomendacion { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
</style>