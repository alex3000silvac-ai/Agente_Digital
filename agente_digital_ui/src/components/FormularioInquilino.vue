<template>
  <div class="formulario-inquilino">
    <div v-if="!soloDatos" class="formulario-header">
      <h3 class="formulario-titulo">
        <i class="ph ph-building-office"></i>
        {{ modoEdicion ? 'Editar Inquilino' : 'Registrar Nuevo Inquilino' }}
      </h3>
      <p class="formulario-descripcion">
        {{ modoEdicion ? 'Modifique la información del inquilino' : 'Complete la información básica del cliente que será inquilino del sistema' }}
      </p>
    </div>

    <form @submit.prevent="enviarFormulario" class="formulario-grid">
      <!-- Razón Social (Obligatorio) -->
      <div class="campo-grupo span-2">
        <label class="campo-label obligatorio">
          <i class="ph ph-buildings"></i>
          Razón Social
        </label>
        <input autocomplete="off" v-model="form.RazonSocial"
          type="text"
          class="campo-input"
          placeholder="Ej: Empresa Tecnológica SpA"
          maxlength="510"
          required
          @input="validarFormulario"
        />
        <div v-if="errores.RazonSocial" class="campo-error">
          {{ errores.RazonSocial }}
        </div>
      </div>

      <!-- RUT (Opcional) -->
      <div class="campo-grupo">
        <label class="campo-label">
          <i class="ph ph-identification-card"></i>
          RUT
        </label>
        <input autocomplete="off" v-model="form.RUT"
          type="text"
          class="campo-input"
          placeholder="12.345.678-9"
          maxlength="40"
          @input="formatearRUT"
          @blur="validarRUT"
        />
        <div v-if="errores.RUT" class="campo-error">
          {{ errores.RUT }}
        </div>
      </div>

      <!-- Campo adicional de información -->
      <div class="campo-grupo">
        <label class="campo-label">
          <i class="ph ph-info"></i>
          Estado
        </label>
        <select autocomplete="off" v-model="form.Estado" class="campo-input">
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>

      <!-- Información adicional -->
      <div class="info-panel span-2">
        <div class="info-header">
          <i class="ph ph-lightbulb"></i>
          <strong>Información importante:</strong>
        </div>
        <ul class="info-lista">
          <li>La <strong>Razón Social</strong> es obligatoria y será el nombre principal del inquilino</li>
          <li>El <strong>RUT</strong> es opcional pero recomendado para empresas chilenas</li>
          <li>Podrá agregar empresas vinculadas a este inquilino posteriormente</li>
          <li>El sistema generará automáticamente un ID único para el inquilino</li>
        </ul>
      </div>

      <!-- Botones de acción (solo si no es modo solo-datos) -->
      <div v-if="!soloDatos" class="acciones-formulario span-2">
        <button 
          type="button" 
          @click="resetFormulario" 
          class="btn btn-secondary"
          :disabled="loading"
        >
          <i class="ph ph-x"></i>
          Cancelar
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading || !formularioValido"
        >
          <i class="ph ph-check" v-if="!loading"></i>
          <i class="ph ph-spinner ph-spin" v-else></i>
          {{ loading ? (textoGuardando || 'Guardando...') : (textoBotonPrincipal || (modoEdicion ? 'Modificar Inquilino' : 'Crear Inquilino')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

const props = defineProps({
  soloDatos: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: null },
  modoEdicion: { type: Boolean, default: false },
  textoBotonPrincipal: { type: String, default: '' },
  textoGuardando: { type: String, default: '' }
})

const emit = defineEmits(['guardar', 'cancelar', 'validar'])

// Estado del formulario
const form = ref({
  RazonSocial: '',
  RUT: '',
  Estado: 'Activo'
})

// Watcher reactivo para cargar datos iniciales
watchEffect(() => {
  if (props.datosIniciales) {
    console.log('🔄 Cargando datos iniciales del inquilino:', props.datosIniciales)
    form.value = {
      RazonSocial: props.datosIniciales.RazonSocial || '',
      RUT: props.datosIniciales.RUT || '',
      Estado: props.datosIniciales.EstadoActivo ? 'Activo' : 'Inactivo'
    }
  }
})

// Errores de validación
const errores = ref({})

// Computed properties
const formularioValido = computed(() => {
  return form.value.RazonSocial.trim().length > 0 && 
         Object.keys(errores.value).length === 0
})

// Watchers
watch(formularioValido, (nuevoValor) => {
  if (props.soloDatos) {
    emit('validar', nuevoValor)
  }
})

// Métodos de validación
function validarFormulario() {
  errores.value = {}
  
  // Validar Razón Social
  if (!form.value.RazonSocial.trim()) {
    errores.value.RazonSocial = 'La razón social es obligatoria'
  } else if (form.value.RazonSocial.length < 3) {
    errores.value.RazonSocial = 'La razón social debe tener al menos 3 caracteres'
  }
}

function formatearRUT() {
  let rut = form.value.RUT.replace(/[^0-9kK]/g, '')
  
  if (rut.length > 1) {
    rut = rut.slice(0, -1) + '-' + rut.slice(-1)
  }
  if (rut.length > 5) {
    rut = rut.slice(0, -5) + '.' + rut.slice(-5)
  }
  if (rut.length > 9) {
    rut = rut.slice(0, -9) + '.' + rut.slice(-9)
  }
  
  form.value.RUT = rut.toUpperCase()
}

function validarRUT() {
  if (!form.value.RUT) {
    delete errores.value.RUT
    return
  }
  
  const rut = form.value.RUT.replace(/[^0-9kK]/g, '')
  
  if (rut.length < 8) {
    errores.value.RUT = 'RUT debe tener al menos 8 dígitos'
    return
  }
  
  // Validación básica de RUT chileno
  const cuerpo = rut.slice(0, -1)
  const dv = rut.slice(-1).toUpperCase()
  
  let suma = 0
  let multiplicador = 2
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  
  const resto = suma % 11
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString()
  
  if (dv !== dvCalculado) {
    errores.value.RUT = 'RUT inválido'
  } else {
    delete errores.value.RUT
  }
}

// Métodos de formulario
function enviarFormulario() {
  validarFormulario()
  
  if (formularioValido.value) {
    emit('guardar', { ...form.value })
  }
}

function resetFormulario() {
  form.value = {
    RazonSocial: '',
    RUT: '',
    Estado: 'Activo'
  }
  errores.value = {}
  emit('cancelar')
}

// Métodos públicos (para usar con ref)
function obtenerDatos() {
  return { ...form.value }
}

function reset() {
  resetFormulario()
}

// Exponer métodos públicos
defineExpose({
  obtenerDatos,
  reset
})
</script>

<style scoped>
.formulario-inquilino {
  background-color: #1f2937;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #374151;
}

.formulario-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #374151;
}

.formulario-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.formulario-descripcion {
  color: #9ca3af;
  font-size: 0.875rem;
}

.formulario-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.campo-grupo {
  display: flex;
  flex-direction: column;
}

.campo-grupo.span-2 {
  grid-column: span 2;
}

.campo-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campo-label.obligatorio::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.25rem;
}

.campo-input {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 0.375rem;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.campo-input::placeholder {
  color: #9ca3af;
}

.campo-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.info-panel {
  background-color: #1e3a8a;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #3b82f6;
}

.info-header {
  color: #dbeafe;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.info-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #bfdbfe;
  font-size: 0.8rem;
}

.info-lista li {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.info-lista li::before {
  content: '•';
  color: #60a5fa;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.acciones-formulario {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #374151;
  color: #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ph-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-grid {
    grid-template-columns: 1fr;
  }
  
  .campo-grupo.span-2 {
    grid-column: span 1;
  }
}
</style>