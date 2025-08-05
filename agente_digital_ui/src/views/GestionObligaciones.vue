<template>
  <div class="gestion-container">
    <h1 class="text-2xl font-bold text-white mb-6">Gestión de Maestros de Acompañamiento</h1>

    <div class="tres-columnas-layout">
      <div class="columna">
        <div class="columna-header">
          <h2 class="font-semibold text-lg">1. Obligaciones</h2>
          <button @click="abrirModal('obligacion')" class="btn-nuevo" title="Añadir nueva obligación">+</button>
        </div>
        <div v-if="loading.obligaciones" class="p-4 text-center text-gray-400">Cargando...</div>
        <ul v-else class="lista-items">
          <li
            v-for="o in obligaciones"
            :key="o.ObligacionID"
            @click="seleccionarObligacion(o)"
            :class="{ 'item-seleccionado': obligacionSeleccionada?.ObligacionID === o.ObligacionID }"
            class="item-con-acciones"
          >
            <div>
              <span class="font-bold">{{ o.ArticuloNorma }}</span>
              <span class="text-sm text-gray-400 block">{{ o.Descripcion }}</span>
            </div>
            <div class="acciones">
                <button @click.stop="abrirModal('obligacion', o)" class="btn-accion" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button @click.stop="eliminarItem('obligacion', o)" class="btn-accion btn-peligro" title="Eliminar"><i class="ph ph-trash"></i></button>
            </div>
          </li>
        </ul>
      </div>

      <div class="columna">
        <div v-if="obligacionSeleccionada">
          <div class="columna-header">
            <h2 class="font-semibold text-lg">2. Verbos Rectores</h2>
            <button @click="abrirModal('verbo')" class="btn-nuevo" title="Añadir nuevo verbo">+</button>
          </div>
          <div v-if="loading.verbos" class="p-4 text-center text-gray-400">Cargando...</div>
          <ul v-else class="lista-items">
            <li
              v-for="v in verbos"
              :key="v.VerboID"
              @click="seleccionarVerbo(v)"
              :class="{ 'item-seleccionado': verboSeleccionado?.VerboID === v.VerboID }"
              class="item-con-acciones"
            >
              <span>{{ v.NombreVerbo }}</span>
              <div class="acciones">
                <button @click.stop="abrirModal('verbo', v)" class="btn-accion" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button @click.stop="eliminarItem('verbo', v)" class="btn-accion btn-peligro" title="Eliminar"><i class="ph ph-trash"></i></button>
              </div>
            </li>
             <li v-if="!verbos.length && !loading.verbos" class="item-vacio">No hay verbos para esta obligación.</li>
          </ul>
        </div>
        <div v-else class="columna-vacia">Seleccione una obligación</div>
      </div>

      <div class="columna">
        <div v-if="verboSeleccionado">
          <div class="columna-header">
            <h2 class="font-semibold text-lg">3. Recomendaciones</h2>
            <button @click="abrirModal('recomendacion')" class="btn-nuevo" title="Añadir nueva recomendación">+</button>
          </div>
          <div v-if="loading.recomendaciones" class="p-4 text-center text-gray-400">Cargando...</div>
          <ul v-else class="lista-items">
            <li
              v-for="r in recomendaciones"
              :key="r.RecomendacionID"
              class="item-con-acciones"
            >
              <span class="descripcion-recomendacion">{{ r.DescripcionRecomendacion }}</span>
              <div class="acciones">
                <button @click.stop="abrirModal('recomendacion', r)" class="btn-accion" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button @click.stop="eliminarItem('recomendacion', r)" class="btn-accion btn-peligro" title="Eliminar"><i class="ph ph-trash"></i></button>
              </div>
            </li>
            <li v-if="!recomendaciones.length && !loading.recomendaciones" class="item-vacio">No hay recomendaciones para este verbo.</li>
          </ul>
        </div>
         <div v-else class="columna-vacia">Seleccione un verbo</div>
      </div>
    </div>

    <Modal v-model="modal.visible">
      <template #header>
        <h3 class="text-lg font-medium leading-6 text-white">{{ modal.titulo }}</h3>
      </template>
      <template #default>
        <div class="space-y-4">
          <div v-if="modal.tipo === 'obligacion'">
            <div>
              <label class="form-label">Artículo Norma</label>
              <input autocomplete="off" type="text" v-model="itemEnEdicion.ArticuloNorma" class="form-input">
            </div>
            <div>
              <label class="form-label">Descripción</label>
              <textarea autocomplete="off" v-model="itemEnEdicion.Descripcion" class="form-input" rows="3"></textarea>
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
          <div v-if="modal.tipo === 'verbo'">
            <div>
              <label class="form-label">Nombre del Verbo</label>
              <input autocomplete="off" type="text" v-model="itemEnEdicion.NombreVerbo" class="form-input" placeholder="Ej: Prevenir">
            </div>
            <div>
              <label class="form-label">Orden</label>
              <input autocomplete="off" type="number" v-model="itemEnEdicion.Orden" class="form-input">
            </div>
          </div>
          <div v-if="modal.tipo === 'recomendacion'">
            <div>
              <label class="form-label">Descripción de la Recomendación</label>
              <textarea autocomplete="off" v-model="itemEnEdicion.DescripcionRecomendacion" class="form-input" rows="4"></textarea>
            </div>
            <div>
              <label class="form-label">Fuente (Opcional)</label>
              <input autocomplete="off" type="text" v-model="itemEnEdicion.Fuente" class="form-input" placeholder="Ej: ISO 27001">
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

const API_BASE_URL = 'http://localhost:5000/api/admin';

// ESTADO DE DATOS Y SELECCIÓN
const obligaciones = ref([]);
const verbos = ref([]);
const recomendaciones = ref([]);
const obligacionSeleccionada = ref(null);
const verboSeleccionado = ref(null);
const loading = reactive({ obligaciones: true, verbos: false, recomendaciones: false });

// LÓGICA DE MODAL REFACTORIZADA
const modal = reactive({
  visible: false,
  titulo: '',
  tipo: '',
  esEdicion: false,
});
const itemEnEdicion = ref({});

// FUNCIONES DE CARGA DE DATOS (API)
const fetchData = async (url, targetRef) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error en la petición: ${response.statusText}`);
    targetRef.value = await response.json();
  } catch (error) {
    console.error(`Error cargando datos desde ${url}:`, error);
    alert(`No se pudieron cargar los datos.`);
  }
};

const cargarObligaciones = async () => {
    loading.obligaciones = true;
    await fetchData(`${API_BASE_URL}/obligaciones`, obligaciones);
    loading.obligaciones = false;
};
const cargarVerbos = async (id) => {
    loading.verbos = true;
    await fetchData(`${API_BASE_URL}/obligaciones/${id}/verbos`, verbos);
    loading.verbos = false;
};
const cargarRecomendaciones = async (id) => {
    loading.recomendaciones = true;
    await fetchData(`${API_BASE_URL}/verbos/${id}/recomendaciones`, recomendaciones);
    loading.recomendaciones = false;
};

// FUNCIONES DE SELECCIÓN
function seleccionarObligacion(obligacion) {
  obligacionSeleccionada.value = obligacion;
  verboSeleccionado.value = null;
  recomendaciones.value = [];
  cargarVerbos(obligacion.ObligacionID);
}

function seleccionarVerbo(verbo) {
  verboSeleccionado.value = verbo;
  cargarRecomendaciones(verbo.VerboID);
}

// LÓGICA GENÉRICA PARA MODALES Y CRUD
const configCRUD = {
  obligacion: {
    tituloNuevo: 'Nueva Obligación',
    tituloEditar: 'Editar Obligación',
    idField: 'ObligacionID',
    endpoint: 'obligaciones',
    reload: cargarObligaciones,
    camposRequeridos: ['ArticuloNorma', 'Descripcion', 'AplicaPara'],
  },
  verbo: {
    tituloNuevo: 'Nuevo Verbo Rector',
    tituloEditar: 'Editar Verbo Rector',
    idField: 'VerboID',
    endpoint: 'verbos',
    reload: () => cargarVerbos(obligacionSeleccionada.value.ObligacionID),
    camposRequeridos: ['NombreVerbo'],
  },
  recomendacion: {
    tituloNuevo: 'Nueva Recomendación',
    tituloEditar: 'Editar Recomendación',
    idField: 'RecomendacionID',
    endpoint: 'recomendaciones',
    reload: () => cargarRecomendaciones(verboSeleccionado.value.VerboID),
    camposRequeridos: ['DescripcionRecomendacion'],
  }
};

function abrirModal(tipo, item = null) {
  const config = configCRUD[tipo];
  if ((tipo === 'verbo' && !obligacionSeleccionada.value) || (tipo === 'recomendacion' && !verboSeleccionado.value)) {
    return alert(`Por favor, seleccione un ítem de la columna anterior primero.`);
  }
  if (tipo === 'recomendacion' && !item && recomendaciones.value.length >= 5) {
     return alert("No se pueden agregar más de 5 recomendaciones por verbo.");
  }

  modal.tipo = tipo;
  modal.esEdicion = !!item;
  modal.titulo = item ? config.tituloEditar : config.tituloNuevo;
  itemEnEdicion.value = item ? { ...item } : {};
  modal.visible = true;
}

async function guardarItem() {
  const config = configCRUD[modal.tipo];
  for(const campo of config.camposRequeridos) {
      if(!itemEnEdicion.value[campo]) return alert(`El campo '${campo}' no puede estar vacío.`);
  }
  
  const esEdicion = modal.esEdicion;
  let url = `${API_BASE_URL}/`;
  if (esEdicion) {
    url += `${config.endpoint}/${itemEnEdicion.value[config.idField]}`;
  } else {
    if (modal.tipo === 'verbo') url += `obligaciones/${obligacionSeleccionada.value.ObligacionID}/verbos`;
    else if (modal.tipo === 'recomendacion') url += `verbos/${verboSeleccionado.value.VerboID}/recomendaciones`;
    else url += config.endpoint;
  }
  
  const method = esEdicion ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemEnEdicion.value) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido');
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
  const nombre = item.NombreVerbo || item.DescripcionRecomendacion || item.ArticuloNorma;

  if (!confirm(`¿Está seguro de que desea eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${config.endpoint}/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido');
    
    if(tipo === 'obligacion' && obligacionSeleccionada.value?.ObligacionID === id) {
        obligacionSeleccionada.value = null;
        verboSeleccionado.value = null;
        verbos.value = [];
        recomendaciones.value = [];
    } else if (tipo === 'verbo' && verboSeleccionado.value?.VerboID === id) {
        verboSeleccionado.value = null;
        recomendaciones.value = [];
    }
    await config.reload();
  } catch (error) {
    console.error(`Error al eliminar:`, error);
    alert(`Error al eliminar: ${error.message}`);
  }
}

onMounted(cargarObligaciones);
</script>

<style scoped>
.gestion-container {
  padding: 2rem;
  background-color: #111827;
  color: #d1d5db;
}
.tres-columnas-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.columna {
  background-color: #1f2937;
  border-radius: 0.5rem;
  border: 1px solid #374151;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  max-height: 70vh;
}
.columna-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #374151;
  flex-shrink: 0;
}
.columna-header h2 {
    color: #ffffff;
}
.btn-nuevo {
  background-color: #4f46e5;
  color: white;
  border-radius: 9999px;
  width: 2rem;
  height: 2rem;
  font-size: 1.5rem;
  line-height: 2rem;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}
.btn-nuevo:hover {
  background-color: #4338ca;
}
.lista-items {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
}
.lista-items li {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #374151;
  transition: background-color 0.2s;
  font-size: 0.875rem;
}
.lista-items li:not(.item-vacio) {
  cursor: pointer;
}
.lista-items li:not(.item-vacio):hover {
  background-color: #374151;
}
.lista-items li.item-seleccionado {
  background-color: #4f46e5;
  color: white;
}
.lista-items li.item-seleccionado .text-gray-400 {
    color: #e5e7eb;
}
.item-vacio {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
}
.columna-vacia {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  color: #4b5563;
  font-style: italic;
  padding: 1rem;
  text-align: center;
}
.item-con-acciones {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.item-con-acciones > div:first-child, .item-con-acciones > span {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.acciones {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}
.item-con-acciones:hover .acciones {
  opacity: 1;
}
.btn-accion {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  font-size: 1.25rem;
}
.btn-accion:hover {
  background-color: #4b5563;
  color: white;
}
.btn-accion.btn-peligro:hover {
  background-color: #ef4444;
  color: white;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #9ca3af;
  font-size: 0.875rem;
}
.form-input {
  width: 100%;
  border: 1px solid #4b5563;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: #374151;
  color: #ffffff;
}
textarea.form-input {
  resize: vertical;
}
.btn {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-primary {
  background-color: #4f46e5;
  color: white;
}
.btn-secondary {
  background-color: #374151;
  color: #d1d5db;
  border: 1px solid #4b5563;
}
</style>