<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-white">Módulo de Administración</h1>
      <p class="text-gray-400 mt-1">Gestión de clientes, reglas de negocio y configuración del sistema.</p>
    </header>

    <div class="tabs mb-6">
      <button @click="adminVistaActiva = 'clientes'" :class="{ 'active': adminVistaActiva === 'clientes' }">
        <i class="ph-fill ph-users-three mr-2"></i>Gestión de Clientes
      </button>
      <button @click="adminVistaActiva = 'regla_oro'" :class="{ 'active': adminVistaActiva === 'regla_oro' }">
        <i class="ph-fill ph-link mr-2"></i>Gestión "Regla de Oro"
      </button>
      <button @click="adminVistaActiva = 'normas'" :class="{ 'active': adminVistaActiva === 'normas' }">
        <i class="ph-fill ph-scroll mr-2"></i>Gestión de Normativas
      </button>
    </div>

    <main>
      <div v-if="adminVistaActiva === 'clientes'">
        
        <div v-if="mostrandoFormulario">
          <div class="card-dark">
            <div class="card-header-dark">
              <h2 class="text-xl font-bold">{{ isEditMode ? 'Editar Inquilino' : 'Crear Nuevo Inquilino' }}</h2>
              <p class="text-sm text-gray-400">Plataforma de Servicios de Jurídica Digital SPA</p>
            </div>
            <form @submit.prevent="handleSubmit" class="mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div><label class="form-label">Razón Social (*)</label><input autocomplete="off" type="text" v-model="formState.RazonSocial" class="form-input" required></div>
                <div><label class="form-label">Nombre de Fantasía</label><input autocomplete="off" type="text" v-model="formState.NombreFantasia" class="form-input"></div>
                <div><label class="form-label">RUT (*)</label><input autocomplete="off" type="text" v-model="formState.RUT" class="form-input" required></div>
                <div><label class="form-label">Giro del Negocio</label><input autocomplete="off" type="text" v-model="formState.GiroDelNegocio" class="form-input"></div>
                <div><label class="form-label">Dirección</label><input autocomplete="off" type="text" v-model="formState.Direccion" class="form-input"></div>
                <div><label class="form-label">Ciudad</label><input autocomplete="off" type="text" v-model="formState.Ciudad" class="form-input"></div>
                <div><label class="form-label">Representante Legal</label><input autocomplete="off" type="text" v-model="formState.RepresentanteLegal" class="form-input"></div>
                <div><label class="form-label">Email de Contacto</label><input autocomplete="off" type="email" v-model="formState.EmailContacto" class="form-input"></div>
                <div><label class="form-label">Teléfono</label><input autocomplete="off" type="tel" v-model="formState.Telefono" class="form-input"></div>
                <div><label class="form-label">Contacto Técnico</label><input autocomplete="off" type="text" v-model="formState.ContactoTecnico" class="form-input"></div>
                <div><label class="form-label">Contacto Comercial</label><input autocomplete="off" type="text" v-model="formState.ContactoComercial" class="form-input"></div>
                <div><label class="form-label">Contacto Cobranza</label><input autocomplete="off" type="text" v-model="formState.ContactoCobranza" class="form-input"></div>
              </div>
              <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
                <button type="button" @click="cerrarFormulario" class="btn btn-secondary">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="guardando">{{ guardando ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Inquilino') }}</button>
              </div>
              <p v-if="mensaje" class="mt-4 text-center" :class="{ 'text-red-400': esError }">{{ mensaje }}</p>
            </form>
          </div>
        </div>

        <div v-else-if="inquilinoSeleccionadoId">
          <VistaGestion
              :inquilino-id="inquilinoSeleccionadoId"
              @volver="inquilinoSeleccionadoId = null"
          />
        </div>
        
        <div v-else>
          <div class="card-dark">
            <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
              <h2 class="text-xl font-bold text-white">Maestro de Inquilinos</h2>
              <button @click="abrirFormularioCreacion" class="btn btn-primary">+ Agregar Nuevo Inquilino</button>
            </div>
            <div class="overflow-x-auto">
              <div v-if="loading" class="p-8 text-center text-gray-400">Cargando inquilinos...</div>
              <div v-else-if="error" class="p-8 text-center text-red-400">{{ error }}</div>
              <table v-else-if="listaInquilinos.length > 0" class="data-table-dark">
                <thead>
                  <tr><th>Razón Social</th><th>RUT</th><th>Nº Empresas</th><th class="text-right">Acciones</th></tr>
                </thead>
                <tbody>
                  <tr v-for="inquilino in listaInquilinos" :key="inquilino.InquilinoID">
                    <td class="font-semibold text-white">{{ inquilino.RazonSocial }}</td>
                    <td>{{ inquilino.RUT }}</td>
                    <td class="text-center">{{ inquilino.TotalEmpresas }}</td>
                    <td class="text-right space-x-2">
                      <button @click="gestionarEmpresas(inquilino.InquilinoID)" class="btn btn-primary">Gestionar</button>
                      <button @click="abrirFormularioEdicion(inquilino)" class="btn btn-outline">Modificar</button>
                      <button @click="eliminarInquilino(inquilino)" class="btn btn-danger">Eliminar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="p-8 text-center text-gray-400">No se encontraron inquilinos.</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="adminVistaActiva === 'regla_oro'">
        <VistaReglaDeOro />
      </div>

      <div v-if="adminVistaActiva === 'normas'">
         <div class="card-dark text-center p-8">
            <h2 class="text-xl font-bold text-white">Próximamente: Editor de Normativas</h2>
         </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// Se importan solo los componentes de VISTA que se necesitan
import VistaGestion from './VistaGestion.vue';
import VistaReglaDeOro from './VistaReglaDeOro.vue';

// Estado para el submenú de administración
const adminVistaActiva = ref('clientes');

// --- Toda la lógica de gestión de inquilinos ahora vive aquí ---
const listaInquilinos = ref([]);
const loading = ref(true);
const error = ref(null);
const inquilinoSeleccionadoId = ref(null);
const mostrandoFormulario = ref(false);
const isEditMode = ref(false);
const formState = ref({});
const guardando = ref(false);
const mensaje = ref('');
const esError = ref(false);

async function cargarInquilinos() {
    loading.value = true; error.value = null;
    try {
        const response = await fetch("http://localhost:5000/api/admin/inquilinos");
        if (!response.ok) throw new Error('Error al cargar inquilinos');
        listaInquilinos.value = await response.json();
    } catch (e) { error.value = e.message; }
    finally { loading.value = false; }
}
onMounted(cargarInquilinos);

function gestionarEmpresas(id) { inquilinoSeleccionadoId.value = id; }

async function eliminarInquilino(inquilino) {
    if (window.confirm(`¿Estás seguro de eliminar a "${inquilino.RazonSocial}"? Se borrarán también sus ${inquilino.TotalEmpresas} empresas.`)) {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${inquilino.InquilinoID}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falló la eliminación en la API.');
            alert('Inquilino eliminado.');
            cargarInquilinos();
        } catch (e) { alert(`Error: ${e.message}`); }
    }
}

const getInitialFormState = () => ({
    RazonSocial: '', RUT: '', EmailContacto: '', Telefono: '', NombreFantasia: '', Direccion: '',
    Ciudad: '', RepresentanteLegal: '', GiroDelNegocio: '', ContactoTecnico: '',
    ContactoComercial: '', ContactoCobranza: ''
});

function abrirFormularioCreacion() {
    isEditMode.value = false;
    formState.value = getInitialFormState();
    mostrandoFormulario.value = true;
}

function abrirFormularioEdicion(inquilino) {
    isEditMode.value = true;
    formState.value = { ...getInitialFormState(), ...inquilino };
    mostrandoFormulario.value = true;
}

function cerrarFormulario() { mostrandoFormulario.value = false; }

async function handleSubmit() {
    guardando.value = true;
    mensaje.value = '';
    esError.value = false;
    const url = isEditMode.value ? `http://localhost:5000/api/admin/inquilinos/${formState.value.InquilinoID}` : 'http://localhost:5000/api/admin/inquilinos';
    const method = isEditMode.value ? 'PUT' : 'POST';
    try {
        const response = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formState.value) });
        const result = await response.json();
        if (!response.ok) { throw new Error(result.error || 'Ocurrió un error.'); }
        alert(`Éxito: ${result.message}`);
        cerrarFormulario();
        cargarInquilinos();
    } catch (e) {
        esError.value = true;
        mensaje.value = `Error: ${e.message}`;
    } finally {
        guardando.value = false;
    }
}
</script>

<style scoped>
/* (Estilos completos sin cambios) */
.tabs { display: flex; border-bottom: 2px solid #374151; }
.tabs button { padding: 0.75rem 1.5rem; border: none; background: none; color: #9ca3af; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; display: flex; align-items: center; }
.tabs button.active { color: #ffffff; border-bottom-color: #4f46e5; }
.card-dark { background-color: #1f2937; border-radius: 0.5rem; padding: 1.5rem; }
.data-table-dark { width: 100%; text-align: left; }
.data-table-dark th { padding: 0.75rem 1rem; font-size: 0.75rem; color: #9ca3af; }
.data-table-dark td { padding: 0.75rem 1rem; border-top: 1px solid #374151; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid transparent; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-outline { background-color: transparent; color: #9ca3af; border-color: #4b5563; }
.btn-danger { background-color: #be123c; color: white; }
</style>