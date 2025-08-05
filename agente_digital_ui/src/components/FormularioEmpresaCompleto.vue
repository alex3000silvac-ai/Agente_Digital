<template>
  <div class="formulario-empresa">
    <div v-if="!soloDatos" class="formulario-header">
      <h3 class="formulario-titulo">
        <i class="ph ph-buildings"></i>
        {{ modoEdicion ? 'Editar Empresa' : 'Registrar Nueva Empresa' }}
      </h3>
      <p class="formulario-descripcion">
        {{ modoEdicion ? 'Modifique la información de la empresa' : 'Complete toda la información de la empresa que será gestionada en el sistema' }}
      </p>
    </div>

    <form @submit.prevent="enviarFormulario" class="formulario-container">
      
      <!-- Selector de Inquilino (si aplica) -->
      <div v-if="mostrarSelectorInquilino && !modoEdicion" class="seccion-form">
        <h4 class="seccion-titulo">
          <i class="ph ph-link"></i>
          Vinculación con Inquilino
        </h4>
        <div class="campo-grupo">
          <label class="campo-label obligatorio">
            Seleccionar Inquilino
          </label>
          <select autocomplete="off" v-model="form.InquilinoID" 
            class="campo-input"
            required
            @change="validarFormulario"
          >
            <option value="">Seleccione un inquilino</option>
            <option 
              v-for="inquilino in inquilinos" 
              :key="inquilino.InquilinoID" 
              :value="inquilino.InquilinoID"
            >
              {{ inquilino.RazonSocial }} {{ inquilino.RUT ? `(${inquilino.RUT})` : '' }}
            </option>
          </select>
          <div v-if="errores.InquilinoID" class="campo-error">
            {{ errores.InquilinoID }}
          </div>
        </div>
      </div>

      <!-- Información Básica -->
      <div class="seccion-form">
        <h4 class="seccion-titulo">
          <i class="ph ph-info"></i>
          Información Básica
        </h4>
        <div class="campos-grid">
          <div class="campo-grupo span-2">
            <label class="campo-label obligatorio">
              Razón Social
            </label>
            <input autocomplete="off" v-model="form.RazonSocial"
              type="text"
              class="campo-input"
              placeholder="Ej: Empresa de Tecnología SpA"
              maxlength="510"
              required
              @input="validarFormulario"
            />
            <div v-if="errores.RazonSocial" class="campo-error">
              {{ errores.RazonSocial }}
            </div>
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
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

          <div class="campo-grupo">
            <label class="campo-label">
              Tipo de Empresa
            </label>
            <select autocomplete="off" v-model="form.TipoEmpresa" class="campo-input">
              <option value="">Seleccionar tipo</option>
              <option value="OIV">OIV (Operador de Infraestructura Vital)</option>
              <option value="PSE">PSE (Proveedor de Servicios Esenciales)</option>
              <option value="BTD">BTD (Empresa Bajo Tecnología Digital)</option>
            </select>
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Nombre de Fantasía
            </label>
            <input autocomplete="off" v-model="form.NombreFantasia"
              type="text"
              class="campo-input"
              placeholder="Ej: TechCorp, InnovaDigital"
              maxlength="1020"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Giro del Negocio
            </label>
            <input autocomplete="off" v-model="form.GiroDelNegocio"
              type="text"
              class="campo-input"
              placeholder="Ej: Desarrollo de software, Consultoría IT, Comercio electrónico"
              maxlength="1020"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Sector Económico
            </label>
            <select autocomplete="off" v-model="form.SectorEconomico" class="campo-input">
              <option value="">Seleccionar sector</option>
              <option value="Financiero">Financiero</option>
              <option value="Energía">Energía</option>
              <option value="Telecomunicaciones">Telecomunicaciones</option>
              <option value="Transporte">Transporte</option>
              <option value="Agua">Agua</option>
              <option value="Salud">Salud</option>
              <option value="Gobierno">Gobierno</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Manufactura">Manufactura</option>
              <option value="Comercio">Comercio</option>
              <option value="Educación">Educación</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Número de Empleados
            </label>
            <input autocomplete="off" v-model.number="form.NumeroEmpleados"
              type="number"
              class="campo-input"
              placeholder="Ej: 25, 150, 500"
              min="1"
            />
          </div>
        </div>
      </div>

      <!-- Información de Contacto -->
      <div class="seccion-form">
        <h4 class="seccion-titulo">
          <i class="ph ph-map-pin"></i>
          Información de Contacto
        </h4>
        <div class="campos-grid">
          <div class="campo-grupo span-2">
            <label class="campo-label">
              Dirección
            </label>
            <input autocomplete="off" v-model="form.Direccion"
              type="text"
              class="campo-input"
              placeholder="Ej: Av. Apoquindo 3000, Piso 12, Las Condes"
              maxlength="1020"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Ciudad
            </label>
            <input autocomplete="off" v-model="form.Ciudad"
              type="text"
              class="campo-input"
              placeholder="Ej: Santiago, Valparaíso, Concepción"
              maxlength="200"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Email de Contacto
            </label>
            <input autocomplete="off" v-model="form.EmailContacto"
              type="email"
              class="campo-input"
              placeholder="Ej: contacto@empresa.cl, info@miempresa.com"
              maxlength="255"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Teléfono
            </label>
            <input autocomplete="off" v-model="form.Telefono"
              type="tel"
              class="campo-input"
              placeholder="+56 9 1234 5678"
              maxlength="100"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Representante Legal
            </label>
            <input autocomplete="off" v-model="form.RepresentanteLegal"
              type="text"
              class="campo-input"
              placeholder="Ej: Juan Pérez González, María Silva Rojas"
              maxlength="500"
            />
          </div>
        </div>
      </div>

      <!-- Contactos Específicos -->
      <div class="seccion-form">
        <h4 class="seccion-titulo">
          <i class="ph ph-users"></i>
          Contactos Específicos
        </h4>
        <div class="campos-grid">
          <div class="campo-grupo">
            <label class="campo-label">
              Contacto Técnico
            </label>
            <input autocomplete="off" v-model="form.ContactoTecnico"
              type="text"
              class="campo-input"
              placeholder="Ej: Carlos López - Jefe de TI"
              maxlength="500"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Contacto Comercial
            </label>
            <input autocomplete="off" v-model="form.ContactoComercial"
              type="text"
              class="campo-input"
              placeholder="Ej: Ana Martínez - Gerente Comercial"
              maxlength="500"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Contacto Cobranza
            </label>
            <input autocomplete="off" v-model="form.ContactoCobranza"
              type="text"
              class="campo-input"
              placeholder="Ej: Pedro Soto - Encargado de Finanzas"
              maxlength="500"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Encargado de Ciberseguridad
            </label>
            <input autocomplete="off" v-model="form.EncargadoCiberseguridad"
              type="text"
              class="campo-input"
              placeholder="Ej: Luis Morales - CISO"
              maxlength="255"
            />
          </div>
        </div>
      </div>

      <!-- Delegado de Ciberseguridad -->
      <div class="seccion-form">
        <h4 class="seccion-titulo">
          <i class="ph ph-shield-check"></i>
          Delegado de Ciberseguridad
        </h4>
        <div class="campos-grid">
          <div class="campo-grupo">
            <label class="campo-label">
              Email del Delegado
            </label>
            <input autocomplete="off" v-model="form.DelegadoCiberseguridadEmail"
              type="email"
              class="campo-input"
              placeholder="Ej: delegado@empresa.cl, ciso@miempresa.com"
              maxlength="255"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Teléfono del Delegado
            </label>
            <input autocomplete="off" v-model="form.DelegadoCiberseguridadTelefono"
              type="tel"
              class="campo-input"
              placeholder="+56 9 1234 5678"
              maxlength="50"
            />
          </div>
        </div>
      </div>

      <!-- Contacto Técnico de Emergencia -->
      <div class="seccion-form">
        <h4 class="seccion-titulo">
          <i class="ph ph-warning-circle"></i>
          Contacto Técnico de Emergencia
        </h4>
        <div class="campos-grid">
          <div class="campo-grupo">
            <label class="campo-label">
              Nombre
            </label>
            <input autocomplete="off" v-model="form.ContactoTecnicoEmergenciaNombre"
              type="text"
              class="campo-input"
              placeholder="Ej: Roberto Vargas - Coordinador de Emergencias"
              maxlength="255"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Email
            </label>
            <input autocomplete="off" v-model="form.ContactoTecnicoEmergenciaEmail"
              type="email"
              class="campo-input"
              placeholder="Ej: emergencia@empresa.cl, soporte24h@miempresa.com"
              maxlength="255"
            />
          </div>

          <div class="campo-grupo">
            <label class="campo-label">
              Teléfono
            </label>
            <input autocomplete="off" v-model="form.ContactoTecnicoEmergenciaTelefono"
              type="tel"
              class="campo-input"
              placeholder="+56 9 1234 5678"
              maxlength="50"
            />
          </div>
        </div>
      </div>

      <!-- Botones de acción (solo si no es modo solo-datos) -->
      <div v-if="!soloDatos" class="acciones-formulario">
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
          {{ loading ? (textoGuardando || 'Guardando...') : (textoBotonPrincipal || (modoEdicion ? 'Modificar Empresa' : 'Crear Empresa')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

const props = defineProps({
  inquilinos: { type: Array, default: () => [] },
  soloDatos: { type: Boolean, default: false },
  mostrarSelectorInquilino: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: null },
  modoEdicion: { type: Boolean, default: false },
  textoBotonPrincipal: { type: String, default: '' },
  textoGuardando: { type: String, default: '' }
})

const emit = defineEmits(['guardar', 'cancelar', 'validar'])

// Estado del formulario
const form = ref({
  InquilinoID: '',
  RazonSocial: '',
  RUT: '',
  TipoEmpresa: '',
  NombreFantasia: '',
  GiroDelNegocio: '',
  Direccion: '',
  Ciudad: '',
  RepresentanteLegal: '',
  EmailContacto: '',
  Telefono: '',
  ContactoTecnico: '',
  ContactoComercial: '',
  ContactoCobranza: '',
  EncargadoCiberseguridad: '',
  SectorEconomico: '',
  DelegadoCiberseguridadEmail: '',
  DelegadoCiberseguridadTelefono: '',
  ContactoTecnicoEmergenciaNombre: '',
  ContactoTecnicoEmergenciaEmail: '',
  ContactoTecnicoEmergenciaTelefono: '',
  NumeroEmpleados: null
})

// Watcher reactivo para cargar datos iniciales
watchEffect(() => {
  if (props.datosIniciales) {
    console.log('🏢 Cargando datos iniciales de la empresa:', props.datosIniciales)
    form.value = {
      InquilinoID: props.datosIniciales.InquilinoID || '',
      RazonSocial: props.datosIniciales.RazonSocial || '',
      RUT: props.datosIniciales.RUT || '',
      TipoEmpresa: props.datosIniciales.TipoEmpresa || '',
      NombreFantasia: props.datosIniciales.NombreFantasia || '',
      GiroDelNegocio: props.datosIniciales.GiroDelNegocio || '',
      Direccion: props.datosIniciales.Direccion || '',
      Ciudad: props.datosIniciales.Ciudad || '',
      RepresentanteLegal: props.datosIniciales.RepresentanteLegal || '',
      EmailContacto: props.datosIniciales.EmailContacto || '',
      Telefono: props.datosIniciales.Telefono || '',
      ContactoTecnico: props.datosIniciales.ContactoTecnico || '',
      ContactoComercial: props.datosIniciales.ContactoComercial || '',
      ContactoCobranza: props.datosIniciales.ContactoCobranza || '',
      EncargadoCiberseguridad: props.datosIniciales.EncargadoCiberseguridad || '',
      SectorEconomico: props.datosIniciales.SectorEconomico || '',
      DelegadoCiberseguridadEmail: props.datosIniciales.DelegadoCiberseguridadEmail || '',
      DelegadoCiberseguridadTelefono: props.datosIniciales.DelegadoCiberseguridadTelefono || '',
      ContactoTecnicoEmergenciaNombre: props.datosIniciales.ContactoTecnicoEmergenciaNombre || '',
      ContactoTecnicoEmergenciaEmail: props.datosIniciales.ContactoTecnicoEmergenciaEmail || '',
      ContactoTecnicoEmergenciaTelefono: props.datosIniciales.ContactoTecnicoEmergenciaTelefono || '',
      NumeroEmpleados: props.datosIniciales.NumeroEmpleados || null
    }
  }
})

// Errores de validación
const errores = ref({})

// Computed properties
const formularioValido = computed(() => {
  const razonSocialValida = form.value.RazonSocial.trim().length > 0
  const inquilinoValido = (props.mostrarSelectorInquilino && !props.modoEdicion) ? 
    form.value.InquilinoID !== '' : true
  
  return razonSocialValida && 
         inquilinoValido && 
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
  
  // Validar Inquilino (si es necesario y no estamos en modo edición)
  if (props.mostrarSelectorInquilino && !props.modoEdicion && !form.value.InquilinoID) {
    errores.value.InquilinoID = 'Debe seleccionar un inquilino'
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
    const datosEmpresa = { ...form.value }
    
    // Limpiar campos vacíos que no son obligatorios
    Object.keys(datosEmpresa).forEach(key => {
      if (datosEmpresa[key] === '' || datosEmpresa[key] === null) {
        delete datosEmpresa[key]
      }
    })
    
    emit('guardar', datosEmpresa)
  }
}

function resetFormulario() {
  form.value = {
    InquilinoID: '',
    RazonSocial: '',
    RUT: '',
    TipoEmpresa: '',
    NombreFantasia: '',
    GiroDelNegocio: '',
    Direccion: '',
    Ciudad: '',
    RepresentanteLegal: '',
    EmailContacto: '',
    Telefono: '',
    ContactoTecnico: '',
    ContactoComercial: '',
    ContactoCobranza: '',
    EncargadoCiberseguridad: '',
    SectorEconomico: '',
    DelegadoCiberseguridadEmail: '',
    DelegadoCiberseguridadTelefono: '',
    ContactoTecnicoEmergenciaNombre: '',
    ContactoTecnicoEmergenciaEmail: '',
    ContactoTecnicoEmergenciaTelefono: '',
    NumeroEmpleados: null
  }
  errores.value = {}
  emit('cancelar')
}

// Métodos públicos (para usar con ref)
function obtenerDatos() {
  const datos = { ...form.value }
  
  // Limpiar campos vacíos
  Object.keys(datos).forEach(key => {
    if (datos[key] === '' || datos[key] === null) {
      delete datos[key]
    }
  })
  
  return datos
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
.formulario-empresa {
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

.formulario-container {
  space-y: 2rem;
}

.seccion-form {
  background-color: #111827;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #2d3748;
}

.seccion-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.5rem;
}

.campos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
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
}

.acciones-formulario {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
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
  .campos-grid {
    grid-template-columns: 1fr;
  }
  
  .campo-grupo.span-2 {
    grid-column: span 1;
  }
}
</style>