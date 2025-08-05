<template>
    <div class="p-4 sm:p-6 lg:p-8">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-white">Módulo de Acompañamiento</h1>
            <p class="text-gray-400 mt-1">Plataforma de Servicios de Jurídica Digital SPA</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="card-dark">
                <label for="inquilino-selector" class="form-label font-semibold text-white">Paso 1: Seleccione un Inquilino</label>
                <select autocomplete="off" id="inquilino-selector" v-model="inquilinoSeleccionadoId" @change="cargarEmpresasDelInquilino" class="form-input mt-2">
                    <option disabled value="">Elija un inquilino...</option>
                    <option v-for="inquilino in listaInquilinos" :key="inquilino.InquilinoID" :value="inquilino.InquilinoID">
                        {{ inquilino.RazonSocial }}
                    </option>
                </select>
            </div>
            <div class="card-dark">
                <label for="empresa-selector" class="form-label font-semibold text-white">Paso 2: Seleccione una Empresa Gestionada</label>
                <select autocomplete="off" id="empresa-selector" v-model="empresaSeleccionadaId" class="form-input mt-2" :disabled="!inquilinoSeleccionadoId || cargandoEmpresas">
                    <option disabled value="">{{ placeholderSelectorEmpresa }}</option>
                    <option v-for="empresa in listaEmpresas" :key="empresa.EmpresaID" :value="empresa.EmpresaID">
                        {{ empresa.RazonSocial }} ({{ empresa.TipoEmpresa }})
                    </option>
                </select>
            </div>
        </div>

        <main v-if="empresaSeleccionadaId">
            <ModuloAcompanamiento
                :key="empresaSeleccionadaId"
                :empresa-id="empresaSeleccionadaId"
            />
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
// --- CORRECCIÓN CLAVE: La ruta ahora sube un nivel (../) para luego entrar a components/ ---
import ModuloAcompanamiento from '../components/ModuloAcompanamiento.vue';

// Estado para los selectores
const listaInquilinos = ref([]);
const inquilinoSeleccionadoId = ref('');
const listaEmpresas = ref([]);
const empresaSeleccionadaId = ref('');
const cargandoEmpresas = ref(false);

// Carga la lista inicial de Inquilinos
onMounted(async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/inquilinos');
        if (!response.ok) throw new Error('No se pudo cargar la lista de inquilinos.');
        listaInquilinos.value = await response.json();
    } catch (e) {
        console.error(e);
    }
});

// Carga las empresas del inquilino seleccionado
async function cargarEmpresasDelInquilino() {
    if (!inquilinoSeleccionadoId.value) return;
    empresaSeleccionadaId.value = ''; // Resetea la selección de empresa
    listaEmpresas.value = [];
    cargandoEmpresas.value = true;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${inquilinoSeleccionadoId.value}/empresas`);
        if (!response.ok) throw new Error('No se pudo cargar la lista de empresas.');
        listaEmpresas.value = await response.json();
    } catch (e) {
        console.error(e);
    } finally {
        cargandoEmpresas.value = false;
    }
}

// Texto dinámico para el selector de empresas
const placeholderSelectorEmpresa = computed(() => {
    if (!inquilinoSeleccionadoId.value) return 'Primero elija un inquilino';
    if (cargandoEmpresas.value) return 'Cargando empresas...';
    if (listaEmpresas.value.length === 0) return 'Este inquilino no tiene empresas';
    return 'Elija una empresa...';
});
</script>

<style scoped>
/* Estilos específicos de esta vista, si fueran necesarios */
.form-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; }
.form-input { display: block; width: 100%; background-color: #374151; color: #ffffff; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.6rem; }
.card-dark { background-color: #1f2937; border-radius: 0.5rem; padding: 1.5rem; }
</style>