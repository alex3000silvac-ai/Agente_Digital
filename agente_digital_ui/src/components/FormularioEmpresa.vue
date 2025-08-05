<template>
  <div class="card-dark">
    <h2 class="card-header-dark">{{ isEditMode ? 'Editar Empresa' : 'Crear Nueva Empresa' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="space-y-4">
          <div>
            <label for="razonSocial" class="form-label">Razón Social (*)</label>
            <input autocomplete="off" type="text" id="razonSocial" v-model="formState.RazonSocial" class="form-input" required placeholder="Ej: Empresa Ejemplo S.A.">
          </div>
          <div>
            <label for="nombreFantasia" class="form-label">Nombre de Fantasía</label>
            <input autocomplete="off" type="text" id="nombreFantasia" v-model="formState.NombreFantasia" class="form-input" placeholder="Ej: Ejemplo Corp">
          </div>
          <div>
            <label for="rut" class="form-label">RUT (*)</label>
            <input autocomplete="off" type="text" id="rut" v-model="formState.RUT" class="form-input" required placeholder="Ej: 12.345.678-9">
          </div>
          <div>
            <label for="tipoEmpresa" class="form-label">Tipo de Empresa (*)</label>
            <select autocomplete="off" id="tipoEmpresa" v-model="formState.TipoEmpresa" class="form-input" required>
              <option disabled value="">Seleccione un tipo...</option>
              <option>OIV</option>
              <option>PSE</option>
              <option>BTD</option>
            </select>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="giro" class="form-label">Giro del Negocio</label>
            <input autocomplete="off" type="text" id="giro" v-model="formState.GiroDelNegocio" class="form-input" placeholder="Ej: Servicios informáticos, Comercio, Industria">
          </div>
          <div>
            <label for="direccion" class="form-label">Dirección</label>
            <input autocomplete="off" type="text" id="direccion" v-model="formState.Direccion" class="form-input" placeholder="Ej: Av. Providencia 1234, Oficina 56">
          </div>
          <div>
            <label for="ciudad" class="form-label">Ciudad</label>
            <input autocomplete="off" type="text" id="ciudad" v-model="formState.Ciudad" class="form-input" placeholder="Ej: Santiago, Valparaíso, Concepción">
          </div>
          <div>
            <label for="repLegal" class="form-label">Representante Legal</label>
            <input autocomplete="off" type="text" id="repLegal" v-model="formState.RepresentanteLegal" class="form-input" placeholder="Nombre completo del representante legal">
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="email" class="form-label">Email de Contacto</label>
            <input autocomplete="off" type="email" id="email" v-model="formState.EmailContacto" class="form-input" placeholder="Ej: contacto@empresa.cl">
          </div>
          <div>
            <label for="telefono" class="form-label">Teléfono</label>
            <input autocomplete="off" type="tel" id="telefono" v-model="formState.Telefono" class="form-input" placeholder="Ej: +56 9 1234 5678">
          </div>
          <div>
            <label for="contactoTecnico" class="form-label">Contacto Técnico</label>
            <input autocomplete="off" type="text" id="contactoTecnico" v-model="formState.ContactoTecnico" class="form-input" placeholder="Nombre y cargo del responsable técnico">
          </div>
          <div>
            <label for="contactoComercial" class="form-label">Contacto Comercial</label>
            <input autocomplete="off" type="text" id="contactoComercial" v-model="formState.ContactoComercial" class="form-input" placeholder="Nombre y cargo del responsable comercial">
          </div>
          <div>
            <label for="contactoCobranza" class="form-label">Contacto Cobranza</label>
            <input autocomplete="off" type="text" id="contactoCobranza" v-model="formState.ContactoCobranza" class="form-input" placeholder="Nombre y cargo del responsable de cobranza">
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
        <button type="button" @click="$emit('cancelar')" class="btn-secondary">Cancelar</button>
        <button type="submit" class="btn-primary" :disabled="guardando">
          {{ guardando ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Empresa') }}
        </button>
      </div>
       <p v-if="mensaje" class="mt-4 text-center" :class="{ 'text-red-400': esError }">{{ mensaje }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import apiClient from '../services/api.js';
const props = defineProps({
  inquilinoId: { type: Number, required: true },
  empresaParaEditar: { type: Object, default: null }
});
const emit = defineEmits(['empresa-creada', 'empresa-actualizada', 'cancelar']);
const formState = ref({});
const mensaje = ref('');
const esError = ref(false);
const guardando = ref(false);
const isEditMode = computed(() => !!props.empresaParaEditar);

function initializeForm() {
  formState.value = isEditMode.value ? { ...props.empresaParaEditar } : {
    RazonSocial: '', RUT: '', TipoEmpresa: '', GiroDelNegocio: '', Direccion: '', EmailContacto: '', Telefono: '', RepresentanteLegal: '', NombreFantasia: '', Ciudad: '', ContactoTecnico: '', ContactoComercial: '', ContactoCobranza: ''
  };
}

watch(() => props.empresaParaEditar, initializeForm, { immediate: true });

async function handleSubmit() {
  guardando.value = true;
  mensaje.value = '';
  esError.value = false;

  const payload = { ...formState.value }; // Enviamos todos los campos del formulario

  try {
    let response;
    
    if (isEditMode.value) {
      // Editar empresa existente
      response = await apiClient.put(`/admin/empresas/${props.empresaParaEditar.EmpresaID}`, payload);
    } else {
      // Crear nueva empresa
      response = await apiClient.post(`/admin/inquilinos/${props.inquilinoId}/empresas`, payload);
    }
    
    mensaje.value = `Éxito: ${response.data.message}`;
    emit(isEditMode.value ? 'empresa-actualizada' : 'empresa-creada');
  } catch (e) {
    esError.value = true;
    console.error('Error en handleSubmit:', e);
    
    // Manejar diferentes tipos de errores
    if (e.response?.status === 403) {
      mensaje.value = 'Error: No tiene permisos para realizar esta acción. Solo los administradores generales pueden editar empresas.';
    } else if (e.response?.status === 401) {
      mensaje.value = 'Error: Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
    } else if (e.response?.data?.error) {
      mensaje.value = `Error: ${e.response.data.error}`;
    } else {
      mensaje.value = `Error: ${e.message || 'Ocurrió un error desconocido'}`;
    }
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
/* (Estilos sin cambios) */
.card-dark { background-color: #1f2937; border-radius: 0.5rem; padding: 1.5rem; }
.card-header-dark { font-size: 1.25rem; font-weight: 700; color: #ffffff; border-bottom: 1px solid #374151; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #9ca3af; }
.form-input { display: block; width: 100%; background-color: #374151; color: #ffffff; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.6rem; }
.btn-primary { background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; }
.btn-primary:disabled { background-color: #3730a3; cursor: not-allowed; }
.btn-secondary { background-color: #374151; color: #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; }
</style>