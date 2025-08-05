<template>
  <div class="vista-container">
    <header class="vista-header">
      <router-link to="/gestion/inquilinos" class="btn-volver mb-4">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Inquilinos</span>
      </router-link>
      <h1 class="vista-title">Empresas</h1>
      <p class="vista-subtitle">Empresas asociadas al inquilino seleccionado.</p>
    </header>

    <div v-if="loading" class="text-center py-16">
      <p class="text-gray-400">Cargando empresas...</p>
    </div>
    <div v-else-if="error" class="error-banner">
      <p><strong>Ocurrió un error al cargar las empresas:</strong> {{ error }}</p>
    </div>
    
    <div v-else-if="empresas.length > 0" class="cards-grid">
      <div 
        v-for="empresa in empresas" 
        :key="empresa.EmpresaID" 
        class="empresa-container"
      >
        <!-- Tarjeta principal de la empresa -->
        <div class="card-item" @click="seleccionarEmpresa(empresa)">
          <div class="card-content">
            <h2 class="card-title">{{ empresa.RazonSocial }}</h2>
            <p class="card-subtitle">{{ empresa.RUT }}</p>
            <div class="card-footer">
              <span class="badge" :class="getBadgeClass(empresa.TipoEmpresa)">{{ empresa.TipoEmpresa }}</span>
              <div class="company-actions">
                <button @click.stop="seleccionarEmpresa(empresa)" class="action-button primary">
                  <i class="ph ph-gear"></i>
                  <span>Gestionar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard siempre visible -->
        <div class="dashboard-wrapper">
          <DashboardEmpresa 
            :empresa-id="empresa.EmpresaID"
            @open-module="(modulo) => abrirModuloDesdeDashboard(empresa, modulo)"
            @navigate-with-filter="(filterData) => navegarConFiltro(empresa, filterData)"
          />
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-16 card-dark">
      <p class="text-gray-400">Este inquilino no tiene empresas asociadas.</p>
    </div>

    <!-- Modal de gestión de empresa -->
    <div v-if="empresaSeleccionada" class="modal-backdrop" @click="cerrarModal">
      <div class="modal-container" @click.stop>
        <h3 class="modal-titulo">Gestionar: {{ empresaSeleccionada.RazonSocial }}</h3>
        <p class="modal-subtitulo">Seleccione el módulo al que desea acceder.</p>
        <div class="modal-acciones">
          <button @click="irAModulo('Acompanamiento')" class="btn-modulo">Gestión de Acompañamiento</button>
          <button @click="irAModulo('Incidentes')" class="btn-modulo">Gestión de Incidentes</button>
          <button @click="irAModulo('InformeCumplimiento')" class="btn-modulo">Informe de Cumplimiento</button>
        </div>
        <button @click="cerrarModal" class="btn-cerrar-modal">Cancelar</button>
      </div>
    </div>

    <!-- Modales de edición/eliminación removidos - ahora están en panel de administración -->
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api.js';
import DashboardEmpresa from '../components/DashboardEmpresa.vue';
import FormularioEmpresa from '../components/FormularioEmpresa.vue';

const props = defineProps({
  inquilinoId: { type: [String, Number], required: true }
});

const router = useRouter();
const empresas = ref([]);
const loading = ref(true);
const error = ref(null);
const empresaSeleccionada = ref(null);
// Estados para edición/eliminación removidos - ahora manejados en panel de administración

async function cargarEmpresas() {
  loading.value = true;
  error.value = null;
  try {
    console.log(`DEBUG Frontend: Cargando empresas para inquilino ${props.inquilinoId}`);
    const response = await apiClient.get(`/admin/inquilinos/${props.inquilinoId}/empresas`);
    console.log(`DEBUG Frontend: Respuesta recibida:`, response.data);
    empresas.value = response.data;
  } catch (err) {
    console.error('Error al cargar empresas:', err);
    error.value = err.response?.data?.error || err.message || "No se pudo establecer conexión con el servidor.";
  } finally {
    loading.value = false;
  }
}

function seleccionarEmpresa(empresa) {
  empresaSeleccionada.value = empresa;
}

function cerrarModal() {
  empresaSeleccionada.value = null;
}

function irAModulo(modulo) {
  if (!empresaSeleccionada.value) return;
  const empresaId = empresaSeleccionada.value.EmpresaID;
  const inquilinoId = props.inquilinoId;

  if (modulo === 'Acompanamiento') {
    router.push({ name: 'ModuloAcompanamiento', params: { inquilinoId: inquilinoId, empresaId: empresaId } });
  } 
  else if (modulo === 'Incidentes') {
    router.push({ name: 'VistaListaIncidentes', params: { inquilinoId: inquilinoId, empresaId: empresaId } });
  }
  else if (modulo === 'InformeCumplimiento') {
    router.push({ name: 'InformeCumplimiento', params: { inquilinoId: inquilinoId, empresaId: empresaId } });
  }
  
  cerrarModal();
}


function abrirModuloDesdeDashboard(empresa, modulo) {
  const empresaId = empresa.EmpresaID;
  const inquilinoId = props.inquilinoId;

  if (modulo === 'Acompanamiento') {
    router.push({ name: 'ModuloAcompanamiento', params: { inquilinoId: inquilinoId, empresaId: empresaId } });
  } 
  else if (modulo === 'Incidentes') {
    router.push({ name: 'VistaListaIncidentes', params: { inquilinoId: inquilinoId, empresaId: empresaId } });
  }
  else if (modulo === 'InformeCumplimiento') {
    router.push({ name: 'InformeCumplimiento', params: { inquilinoId: inquilinoId, empresaId: empresaId } });
  }
}

function navegarConFiltro(empresa, filterData) {
  const empresaId = empresa.EmpresaID;
  const inquilinoId = props.inquilinoId;
  
  console.log('🎯 Navegando con filtro:', filterData);
  
  if (filterData.modulo === 'Acompanamiento') {
    // Preparar query params para acompañamiento
    const query = {
      filtro: filterData.filtro,
      tipoEmpresa: filterData.tipoEmpresa
    };
    
    // Configurar filtros específicos
    switch (filterData.filtro) {
      case 'total':
        query.estado = 'todos';
        break;
      case 'cumplidas':
        query.estado = 'Implementado';
        break;
      case 'proceso':
        query.estado = 'EnProceso';
        break;
      case 'pendientes':
        query.estado = 'Pendiente,Vencido';
        break;
    }
    
    router.push({ 
      name: 'ModuloAcompanamiento', 
      params: { inquilinoId: inquilinoId, empresaId: empresaId },
      query: query
    });
  }
  else if (filterData.modulo === 'Incidentes') {
    // Preparar query params para incidentes
    const query = {
      filtro: filterData.filtro
    };
    
    // Agregar parámetros específicos según el filtro
    if (filterData.estado) query.estado = filterData.estado;
    if (filterData.criticidad) query.criticidad = filterData.criticidad;
    if (filterData.tipoFlujo) query.tipo = filterData.tipoFlujo;
    if (filterData.periodo) query.periodo = filterData.periodo;
    
    router.push({ 
      name: 'VistaListaIncidentes', 
      params: { inquilinoId: inquilinoId, empresaId: empresaId },
      query: query
    });
  }
}

function getBadgeClass(tipo) {
  if (tipo === 'OIV') return 'badge-oiv';
  if (tipo === 'PSE') return 'badge-pse';
  return 'badge-btd';
}

// Funciones para editar y eliminar empresas
// Funciones de edición y eliminación removidas - ahora están en el panel de administración

onMounted(cargarEmpresas);
</script>

<style scoped>
/* Estilos previamente validados */
.vista-container { padding: 1.5rem; }
.vista-header { margin-bottom: 2rem; }
.vista-title { font-size: 2.25rem; font-weight: 800; color: #ffffff; }
.vista-subtitle { font-size: 1.125rem; color: #9ca3af; }
.btn-volver { display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #9ca3af; text-decoration: none; font-weight: 600; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }

/* Empresa Container */
.empresa-container {
  display: flex;
  flex-direction: column;
}

.card-item { 
  display: block; 
  background-color: #1f2937; 
  border: 1px solid #374151; 
  border-radius: 0.75rem; 
  padding: 1.5rem; 
  text-decoration: none; 
  color: inherit; 
  cursor: pointer; 
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
}

.card-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-item:hover { 
  transform: translateY(-5px); 
  border-color: #4f46e5; 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
}

.card-item:hover::before {
  opacity: 1;
}

.card-title { font-size: 1.25rem; font-weight: 600; color: #ffffff; }
.card-subtitle { font-family: monospace; color: #9ca3af; margin-bottom: 1rem; }

.card-footer { 
  border-top: 1px solid #374151; 
  padding-top: 1rem; 
  margin-top: 1rem; 
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Company Actions */
.company-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.action-button.edit {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.5rem;
  min-width: auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.danger {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem;
  min-width: auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.action-button.edit:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

.action-button.danger:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.action-button i {
  font-size: 0.875rem;
}

/* Dashboard Wrapper */
.dashboard-wrapper {
  margin-top: 0.75rem;
  border-top: 1px solid #374151;
  padding-top: 0.75rem;
}

.badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; }
.badge-oiv { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; }
.badge-pse { background-color: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 50; }
.modal-container { background-color: #1f2937; padding: 2.5rem; border-radius: 0.75rem; width: 90%; max-width: 500px; text-align: center; }
.modal-titulo { font-size: 1.5rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
.modal-subtitulo { color: #9ca3af; margin-bottom: 2rem; }
.modal-acciones { display: flex; flex-direction: column; gap: 1rem; }
.btn-modulo { width: 100%; padding: 1rem; font-size: 1rem; font-weight: 600; border: 1px solid #374151; border-radius: 0.5rem; background-color: #2d3748; color: #e5e7eb; cursor: pointer; transition: background-color 0.2s; }
.btn-modulo:not(.disabled):hover { background-color: #4f46e5; }
.btn-modulo.disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cerrar-modal { margin-top: 2rem; background: none; border: none; color: #9ca3af; font-weight: 500; cursor: pointer; }
.btn-cerrar-modal:hover { color: #ffffff; }

/* Estilos para modal de edición */
.modal-edicion {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #374151;
  background-color: #374151;
  border-radius: 0.75rem 0.75rem 0 0;
}

.modal-header .modal-titulo {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close-modal {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  color: #ffffff;
  background-color: rgba(239, 68, 68, 0.2);
}

.modal-content-wrapper {
  padding: 1.5rem 2rem 2rem;
  max-height: 70vh;
  overflow-y: auto;
}
</style>