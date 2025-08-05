<template>
  <div class="vista-container">
    <header class="vista-header">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="vista-title">Crear Inquilinos y Empresas</h1>
          <p class="vista-subtitle">Registro completo de nuevos clientes en el sistema</p>
        </div>
        <button @click="volverAlDashboard" class="btn btn-secondary">
          <i class="ph ph-arrow-left"></i>
          Volver al Dashboard
        </button>
      </div>
    </header>

    <!-- Pestañas de navegación -->
    <div class="tabs-container">
      <div class="tabs-header">
        <button 
          :class="['tab', { active: activeTab === 'inquilino' }]"
          @click="activeTab = 'inquilino'"
        >
          <i class="ph ph-building-office"></i>
          Crear Inquilino
        </button>
        <button 
          :class="['tab', { active: activeTab === 'empresa' }]"
          @click="activeTab = 'empresa'"
        >
          <i class="ph ph-buildings"></i>
          Crear Empresa
        </button>
        <button 
          :class="['tab', { active: activeTab === 'ambos' }]"
          @click="activeTab = 'ambos'"
        >
          <i class="ph ph-plus-circle"></i>
          Crear Inquilino + Empresa
        </button>
        <button 
          :class="['tab', { active: activeTab === 'gestionar-inquilino' }]"
          @click="activeTab = 'gestionar-inquilino'"
        >
          <i class="ph ph-magnifying-glass"></i>
          Gestionar Inquilinos
        </button>
        <button 
          :class="['tab', { active: activeTab === 'gestionar-empresa' }]"
          @click="activeTab = 'gestionar-empresa'"
        >
          <i class="ph ph-gear"></i>
          Gestionar Empresas
        </button>
      </div>

      <div class="tab-content">
        <!-- PESTAÑA 1: Crear solo Inquilino -->
        <div v-if="activeTab === 'inquilino'" class="tab-panel">
          <FormularioInquilino 
            @guardar="guardarInquilino"
            @cancelar="resetFormularios"
            :loading="guardando"
          />
        </div>

        <!-- PESTAÑA 2: Crear solo Empresa -->
        <div v-if="activeTab === 'empresa'" class="tab-panel">
          <div v-if="inquilinos.length === 0" class="aviso-sin-inquilinos">
            <i class="ph ph-warning-circle"></i>
            <h3>No hay inquilinos disponibles</h3>
            <p>Para crear una empresa, primero debe existir al menos un inquilino en el sistema.</p>
            <button @click="activeTab = 'inquilino'" class="btn btn-primary">
              <i class="ph ph-plus"></i>
              Crear Inquilino Primero
            </button>
          </div>
          <FormularioEmpresaCompleto 
            v-else
            :inquilinos="inquilinos"
            @guardar="guardarEmpresa"
            @cancelar="resetFormularios"
            :loading="guardando"
          />
        </div>

        <!-- PESTAÑA 3: Crear Inquilino + Empresa juntos -->
        <div v-if="activeTab === 'ambos'" class="tab-panel">
          <div class="formularios-combinados">
            <div class="seccion-formulario">
              <h3 class="seccion-titulo">
                <i class="ph ph-building-office"></i>
                Datos del Inquilino
              </h3>
              <FormularioInquilino 
                ref="formInquilino"
                :solo-datos="true"
                @validar="validacionInquilino = $event"
              />
            </div>

            <div class="separador"></div>

            <div class="seccion-formulario">
              <h3 class="seccion-titulo">
                <i class="ph ph-buildings"></i>
                Datos de la Empresa
              </h3>
              <FormularioEmpresaCompleto 
                ref="formEmpresa"
                :solo-datos="true"
                :mostrar-selector-inquilino="false"
                @validar="validacionEmpresa = $event"
              />
            </div>

            <div class="acciones-combinadas">
              <button @click="resetFormularios" class="btn btn-secondary" :disabled="guardando">
                <i class="ph ph-x"></i>
                Cancelar
              </button>
              <button 
                @click="guardarInquilinoYEmpresa" 
                class="btn btn-primary"
                :disabled="guardando || !validacionInquilino || !validacionEmpresa"
              >
                <i class="ph ph-check" v-if="!guardando"></i>
                <i class="ph ph-spinner ph-spin" v-else></i>
                {{ guardando ? 'Guardando...' : 'Crear Inquilino y Empresa' }}
              </button>
            </div>
          </div>
        </div>

        <!-- PESTAÑA 4: Gestionar Inquilinos -->
        <div v-if="activeTab === 'gestionar-inquilino'" class="tab-panel">
          <div class="gestion-section">
            <div class="search-header">
              <h3 class="section-title">
                <i class="ph ph-magnifying-glass"></i>
                Buscar y Gestionar Inquilinos
              </h3>
              <p class="section-subtitle">Busque un inquilino para editarlo o eliminarlo del sistema</p>
            </div>

            <!-- Buscador de inquilinos -->
            <div class="search-container">
              <div class="search-input-group">
                <i class="ph ph-magnifying-glass search-icon"></i>
                <input autocomplete="off" v-model="busquedaInquilino"
                  @input="buscarInquilinos"
                  type="text" 
                  placeholder="Buscar por razón social o RUT..."
                  class="search-input"
                />
                <button v-if="busquedaInquilino" @click="limpiarBusquedaInquilino" class="clear-search-btn">
                  <i class="ph ph-x"></i>
                </button>
              </div>
            </div>

            <!-- Resultados de búsqueda -->
            <div v-if="inquilinosBuscados.length > 0" class="search-results">
              <h4 class="results-title">Resultados encontrados ({{ inquilinosBuscados.length }})</h4>
              <div class="results-grid">
                <div 
                  v-for="inquilino in inquilinosBuscados" 
                  :key="inquilino.InquilinoID"
                  class="result-card"
                >
                  <div class="result-info">
                    <h5 class="result-name">{{ inquilino.RazonSocial }}</h5>
                    <p class="result-rut">{{ inquilino.RUT }}</p>
                    <p class="result-empresas">{{ inquilino.TotalEmpresas }} empresa(s)</p>
                  </div>
                  <div class="result-actions">
                    <button @click="editarInquilinoSeleccionado(inquilino)" class="btn-action edit">
                      <i class="ph ph-pencil"></i>
                      Editar
                    </button>
                    <button @click="iniciarEliminacionInquilino(inquilino)" class="btn-action delete">
                      <i class="ph ph-trash"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="busquedaInquilino && !cargandoBusqueda" class="empty-state">
              <i class="ph ph-magnifying-glass-minus"></i>
              <h4>No se encontraron inquilinos</h4>
              <p>No hay inquilinos que coincidan con "{{ busquedaInquilino }}"</p>
            </div>

            <!-- Estado inicial -->
            <div v-else-if="!busquedaInquilino" class="initial-state">
              <i class="ph ph-magnifying-glass"></i>
              <h4>Buscar Inquilinos</h4>
              <p>Escriba el nombre o RUT del inquilino que desea gestionar</p>
            </div>

            <!-- Loading -->
            <div v-if="cargandoBusqueda" class="loading-state">
              <i class="ph ph-spinner ph-spin"></i>
              <p>Buscando inquilinos...</p>
            </div>
          </div>
        </div>

        <!-- PESTAÑA 5: Gestionar Empresas -->
        <div v-if="activeTab === 'gestionar-empresa'" class="tab-panel">
          <div class="gestion-section">
            <div class="search-header">
              <h3 class="section-title">
                <i class="ph ph-gear"></i>
                Buscar y Gestionar Empresas
              </h3>
              <p class="section-subtitle">Busque una empresa para editarla o eliminarla del sistema</p>
            </div>

            <!-- Buscador de empresas -->
            <div class="search-container">
              <div class="search-input-group">
                <i class="ph ph-magnifying-glass search-icon"></i>
                <input autocomplete="off" v-model="busquedaEmpresa"
                  @input="buscarEmpresas"
                  type="text" 
                  placeholder="Buscar por razón social o RUT..."
                  class="search-input"
                />
                <button v-if="busquedaEmpresa" @click="limpiarBusquedaEmpresa" class="clear-search-btn">
                  <i class="ph ph-x"></i>
                </button>
              </div>
            </div>

            <!-- Resultados de búsqueda -->
            <div v-if="empresasBuscadas.length > 0" class="search-results">
              <h4 class="results-title">Resultados encontrados ({{ empresasBuscadas.length }})</h4>
              <div class="results-grid">
                <div 
                  v-for="empresa in empresasBuscadas" 
                  :key="empresa.EmpresaID"
                  class="result-card"
                >
                  <div class="result-info">
                    <h5 class="result-name">{{ empresa.RazonSocial }}</h5>
                    <p class="result-rut">{{ empresa.RUT }}</p>
                    <p class="result-tipo">{{ empresa.TipoEmpresa }}</p>
                    <p class="result-inquilino">Inquilino: {{ empresa.InquilinoNombre }}</p>
                  </div>
                  <div class="result-actions">
                    <button @click="editarEmpresaSeleccionada(empresa)" class="btn-action edit">
                      <i class="ph ph-pencil"></i>
                      Editar
                    </button>
                    <button @click="iniciarEliminacionEmpresa(empresa)" class="btn-action delete">
                      <i class="ph ph-trash"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="busquedaEmpresa && !cargandoBusquedaEmpresas" class="empty-state">
              <i class="ph ph-magnifying-glass-minus"></i>
              <h4>No se encontraron empresas</h4>
              <p>No hay empresas que coincidan con "{{ busquedaEmpresa }}"</p>
            </div>

            <!-- Estado inicial -->
            <div v-else-if="!busquedaEmpresa" class="initial-state">
              <i class="ph ph-magnifying-glass"></i>
              <h4>Buscar Empresas</h4>
              <p>Escriba el nombre o RUT de la empresa que desea gestionar</p>
            </div>

            <!-- Loading -->
            <div v-if="cargandoBusquedaEmpresas" class="loading-state">
              <i class="ph ph-spinner ph-spin"></i>
              <p>Buscando empresas...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">¡Registro Exitoso!</h3>
        <p class="modal-text">{{ mensajeConfirmacion }}</p>
        <div class="modal-actions">
          <button @click="cerrarConfirmacion" class="btn btn-primary">
            Entendido
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de error -->
    <div v-if="mostrarError" class="modal-overlay">
      <div class="modal-content error">
        <h3 class="modal-title error">Error en el Registro</h3>
        <p class="modal-text">{{ mensajeError }}</p>
        <div class="modal-actions">
          <button @click="cerrarError" class="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación de inquilino -->
    <div v-if="mostrarModalEliminacionInquilino" class="modal-overlay">
      <div class="modal-content danger">
        <h3 class="modal-title danger">⚠️ Confirmar Eliminación de Inquilino</h3>
        <div v-if="pasoConfirmacionInquilino === 0">
          <p class="modal-text warning">
            <strong>¿Está seguro que desea eliminar el inquilino "{{ inquilinoAEliminar?.RazonSocial }}"?</strong>
          </p>
          <p class="modal-text warning">
            Esta acción eliminará <strong>PERMANENTEMENTE</strong> el inquilino y todos sus datos relacionados:
          </p>
          <ul class="warning-list">
            <li>Todas las empresas asociadas</li>
            <li>Todos los usuarios del inquilino</li>
            <li>Todos los incidentes y su historial</li>
            <li>Todos los archivos adjuntos</li>
            <li>Todas las sesiones de acompañamiento</li>
          </ul>
          <div class="confirmation-input">
            <label>Para continuar, escriba <strong>CONFIRMAR</strong>:</label>
            <input autocomplete="off" v-model="confirmacionTextoInquilino" type="text" placeholder="Escriba CONFIRMAR" />
          </div>
          <div class="modal-actions">
            <button @click="cancelarEliminacionInquilino" class="btn btn-secondary">
              Cancelar
            </button>
            <button 
              @click="avanzarPasoConfirmacionInquilino" 
              class="btn btn-danger"
              :disabled="confirmacionTextoInquilino !== 'CONFIRMAR'"
            >
              Continuar
            </button>
          </div>
        </div>
        <div v-else>
          <p class="modal-text danger">
            <strong>⚠️ ÚLTIMA CONFIRMACIÓN ⚠️</strong>
          </p>
          <p class="modal-text danger">
            El inquilino "<strong>{{ inquilinoAEliminar?.RazonSocial }}</strong>" y TODOS SUS DATOS serán eliminados PERMANENTEMENTE.
          </p>
          <p class="modal-text danger">
            <strong>Esta acción NO SE PUEDE DESHACER.</strong>
          </p>
          <div class="confirmation-input">
            <label>Para proceder, escriba <strong>ELIMINAR</strong>:</label>
            <input autocomplete="off" v-model="confirmacionTextoInquilino" type="text" placeholder="Escriba ELIMINAR" />
          </div>
          <div class="modal-actions">
            <button @click="cancelarEliminacionInquilino" class="btn btn-secondary">
              Cancelar
            </button>
            <button 
              @click="avanzarPasoConfirmacionInquilino" 
              class="btn btn-danger"
              :disabled="confirmacionTextoInquilino !== 'ELIMINAR' || guardando"
            >
              <i class="ph ph-trash" v-if="!guardando"></i>
              <i class="ph ph-spinner ph-spin" v-else></i>
              {{ guardando ? 'Eliminando...' : 'ELIMINAR DEFINITIVAMENTE' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación de empresa -->
    <div v-if="mostrarModalEliminacionEmpresa" class="modal-overlay">
      <div class="modal-content danger">
        <h3 class="modal-title danger">⚠️ Confirmar Eliminación de Empresa</h3>
        <div v-if="pasoConfirmacionEmpresa === 0">
          <p class="modal-text warning">
            <strong>¿Está seguro que desea eliminar la empresa "{{ empresaAEliminar?.RazonSocial }}"?</strong>
          </p>
          <p class="modal-text warning">
            Esta acción eliminará <strong>PERMANENTEMENTE</strong> la empresa y todos sus datos relacionados:
          </p>
          <ul class="warning-list">
            <li>Todos los usuarios de la empresa</li>
            <li>Todos los incidentes y su historial</li>
            <li>Todos los archivos adjuntos</li>
            <li>Todas las sesiones de acompañamiento</li>
          </ul>
          <div class="confirmation-input">
            <label>Para continuar, escriba <strong>CONFIRMAR</strong>:</label>
            <input autocomplete="off" v-model="confirmacionTextoEmpresa" type="text" placeholder="Escriba CONFIRMAR" />
          </div>
          <div class="modal-actions">
            <button @click="cancelarEliminacionEmpresa" class="btn btn-secondary">
              Cancelar
            </button>
            <button 
              @click="avanzarPasoConfirmacionEmpresa" 
              class="btn btn-danger"
              :disabled="confirmacionTextoEmpresa !== 'CONFIRMAR'"
            >
              Continuar
            </button>
          </div>
        </div>
        <div v-else>
          <p class="modal-text danger">
            <strong>⚠️ ÚLTIMA CONFIRMACIÓN ⚠️</strong>
          </p>
          <p class="modal-text danger">
            La empresa "<strong>{{ empresaAEliminar?.RazonSocial }}</strong>" y TODOS SUS DATOS serán eliminados PERMANENTEMENTE.
          </p>
          <p class="modal-text danger">
            <strong>Esta acción NO SE PUEDE DESHACER.</strong>
          </p>
          <div class="confirmation-input">
            <label>Para proceder, escriba <strong>ELIMINAR</strong>:</label>
            <input autocomplete="off" v-model="confirmacionTextoEmpresa" type="text" placeholder="Escriba ELIMINAR" />
          </div>
          <div class="modal-actions">
            <button @click="cancelarEliminacionEmpresa" class="btn btn-secondary">
              Cancelar
            </button>
            <button 
              @click="avanzarPasoConfirmacionEmpresa" 
              class="btn btn-danger"
              :disabled="confirmacionTextoEmpresa !== 'ELIMINAR' || guardando"
            >
              <i class="ph ph-trash" v-if="!guardando"></i>
              <i class="ph ph-spinner ph-spin" v-else></i>
              {{ guardando ? 'Eliminando...' : 'ELIMINAR DEFINITIVAMENTE' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edición de inquilino -->
    <div v-if="mostrarModalEdicionInquilino" class="modal-overlay">
      <div class="modal-content modal-edicion">
        <div class="modal-header">
          <h3 class="modal-title">Editar Inquilino: {{ inquilinoAEditar?.RazonSocial }}</h3>
          <button @click="cerrarModalEdicionInquilino" class="btn-close-modal">
            <i class="ph ph-x"></i>
          </button>
        </div>
        <div class="modal-content-wrapper">
          <FormularioInquilino 
            ref="formInquilinoEditar"
            :datos-iniciales="inquilinoAEditar"
            :modo-edicion="true"
            :texto-boton-principal="'Modificar Inquilino'"
            :texto-guardando="'Modificando...'"
            @guardar="guardarEdicionInquilino"
            @cancelar="cerrarModalEdicionInquilino"
            :loading="guardando"
          />
        </div>
      </div>
    </div>

    <!-- Modal de edición de empresa -->
    <div v-if="mostrarModalEdicionEmpresa" class="modal-overlay">
      <div class="modal-content modal-edicion">
        <div class="modal-header">
          <h3 class="modal-title">Editar Empresa: {{ empresaAEditar?.RazonSocial }}</h3>
          <button @click="cerrarModalEdicionEmpresa" class="btn-close-modal">
            <i class="ph ph-x"></i>
          </button>
        </div>
        <div class="modal-content-wrapper">
          <FormularioEmpresaCompleto 
            ref="formEmpresaEditar"
            :datos-iniciales="empresaAEditar"
            :modo-edicion="true"
            :texto-boton-principal="'Modificar Empresa'"
            :texto-guardando="'Modificando...'"
            :inquilinos="inquilinos"
            @guardar="guardarEdicionEmpresa"
            @cancelar="cerrarModalEdicionEmpresa"
            :loading="guardando"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FormularioInquilino from '../components/FormularioInquilino.vue'
import FormularioEmpresaCompleto from '../components/FormularioEmpresaCompleto.vue'

const router = useRouter()

// Estado reactivo
const activeTab = ref('inquilino')
const guardando = ref(false)
const inquilinos = ref([])
const validacionInquilino = ref(false)
const validacionEmpresa = ref(false)

// Referencias a los formularios
const formInquilino = ref(null)
const formEmpresa = ref(null)
const formInquilinoEditar = ref(null)
const formEmpresaEditar = ref(null)

// Estados de modales
const mostrarConfirmacion = ref(false)
const mostrarError = ref(false)
const mensajeConfirmacion = ref('')
const mensajeError = ref('')

// Estados para gestión de inquilinos
const busquedaInquilino = ref('')
const inquilinosBuscados = ref([])
const cargandoBusqueda = ref(false)
const inquilinoAEditar = ref(null)
const inquilinoAEliminar = ref(null)
const mostrarModalEdicionInquilino = ref(false)
const mostrarModalEliminacionInquilino = ref(false)
const pasoConfirmacionInquilino = ref(0)
const confirmacionTextoInquilino = ref('')

// Estados para gestión de empresas
const busquedaEmpresa = ref('')
const empresasBuscadas = ref([])
const cargandoBusquedaEmpresas = ref(false)
const empresaAEditar = ref(null)
const empresaAEliminar = ref(null)
const mostrarModalEdicionEmpresa = ref(false)
const mostrarModalEliminacionEmpresa = ref(false)
const pasoConfirmacionEmpresa = ref(0)
const confirmacionTextoEmpresa = ref('')

// Cargar inquilinos existentes
async function cargarInquilinos() {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:5000/api/admin/inquilinos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      inquilinos.value = await response.json()
    }
  } catch (error) {
    console.error('Error al cargar inquilinos:', error)
  }
}

// Guardar solo inquilino
async function guardarInquilino(datosInquilino) {
  guardando.value = true
  try {
    const response = await fetch('http://localhost:5000/api/admin/inquilinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosInquilino)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear inquilino')
    }

    const resultado = await response.json()
    mensajeConfirmacion.value = `Inquilino "${datosInquilino.RazonSocial}" creado exitosamente con ID: ${resultado.InquilinoID}`
    mostrarConfirmacion.value = true
    
    // Recargar lista de inquilinos
    await cargarInquilinos()
    
  } catch (error) {
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Guardar solo empresa
async function guardarEmpresa(datosEmpresa) {
  guardando.value = true
  try {
    const response = await fetch('http://localhost:5000/api/admin/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosEmpresa)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al crear empresa')
    }

    const resultado = await response.json()
    mensajeConfirmacion.value = `Empresa "${datosEmpresa.RazonSocial}" creada exitosamente con ID: ${resultado.EmpresaID}`
    mostrarConfirmacion.value = true
    
  } catch (error) {
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Guardar inquilino y empresa juntos
async function guardarInquilinoYEmpresa() {
  guardando.value = true
  try {
    // Obtener datos de los formularios
    const datosInquilino = formInquilino.value.obtenerDatos()
    const datosEmpresa = formEmpresa.value.obtenerDatos()

    // Primero crear el inquilino
    const responseInquilino = await fetch('http://localhost:5000/api/admin/inquilinos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosInquilino)
    })

    if (!responseInquilino.ok) {
      const error = await responseInquilino.json()
      throw new Error(error.error || 'Error al crear inquilino')
    }

    const resultadoInquilino = await responseInquilino.json()
    const inquilinoId = resultadoInquilino.InquilinoID

    // Luego crear la empresa vinculada al inquilino
    datosEmpresa.InquilinoID = inquilinoId
    const responseEmpresa = await fetch('http://localhost:5000/api/admin/empresas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosEmpresa)
    })

    if (!responseEmpresa.ok) {
      const error = await responseEmpresa.json()
      throw new Error(error.error || 'Error al crear empresa')
    }

    const resultadoEmpresa = await responseEmpresa.json()
    
    mensajeConfirmacion.value = `
      ¡Registro completado exitosamente!
      
      Inquilino: "${datosInquilino.RazonSocial}" (ID: ${inquilinoId})
      Empresa: "${datosEmpresa.RazonSocial}" (ID: ${resultadoEmpresa.EmpresaID})
    `
    mostrarConfirmacion.value = true
    
    // Recargar lista de inquilinos
    await cargarInquilinos()
    
  } catch (error) {
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Funciones de utilidad
function resetFormularios() {
  if (formInquilino.value) formInquilino.value.reset()
  if (formEmpresa.value) formEmpresa.value.reset()
  validacionInquilino.value = false
  validacionEmpresa.value = false
}

function volverAlDashboard() {
  router.push('/dashboard')
}

function cerrarConfirmacion() {
  mostrarConfirmacion.value = false
  resetFormularios()
}

function cerrarError() {
  mostrarError.value = false
}

// Funciones de búsqueda de inquilinos
async function buscarInquilinos() {
  if (!busquedaInquilino.value || busquedaInquilino.value.trim().length < 2) {
    inquilinosBuscados.value = []
    return
  }

  cargandoBusqueda.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/inquilinos/buscar?q=${encodeURIComponent(busquedaInquilino.value)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      inquilinosBuscados.value = await response.json()
    } else {
      throw new Error('Error al buscar inquilinos')
    }
  } catch (error) {
    console.error('Error al buscar inquilinos:', error)
    mensajeError.value = 'Error al buscar inquilinos'
    mostrarError.value = true
  } finally {
    cargandoBusqueda.value = false
  }
}

function limpiarBusquedaInquilino() {
  busquedaInquilino.value = ''
  inquilinosBuscados.value = []
}

async function editarInquilinoSeleccionado(inquilino) {
  console.log('📝 Editando inquilino seleccionado:', inquilino)
  
  try {
    cargandoBusqueda.value = true
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${inquilino.InquilinoID}/datos-completos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const datosCompletos = await response.json()
      console.log('📝 Datos completos del inquilino obtenidos:', datosCompletos)
      inquilinoAEditar.value = datosCompletos
      mostrarModalEdicionInquilino.value = true
    } else {
      throw new Error('Error al obtener datos completos del inquilino')
    }
  } catch (error) {
    console.error('Error al cargar datos del inquilino:', error)
    mensajeError.value = 'Error al cargar datos del inquilino para edición'
    mostrarError.value = true
  } finally {
    cargandoBusqueda.value = false
  }
}

function iniciarEliminacionInquilino(inquilino) {
  inquilinoAEliminar.value = inquilino
  pasoConfirmacionInquilino.value = 0
  confirmacionTextoInquilino.value = ''
  mostrarModalEliminacionInquilino.value = true
}

function cancelarEliminacionInquilino() {
  inquilinoAEliminar.value = null
  pasoConfirmacionInquilino.value = 0
  confirmacionTextoInquilino.value = ''
  mostrarModalEliminacionInquilino.value = false
}

function avanzarPasoConfirmacionInquilino() {
  const textoRequerido = pasoConfirmacionInquilino.value === 0 ? 'CONFIRMAR' : 'ELIMINAR'
  if (confirmacionTextoInquilino.value === textoRequerido) {
    if (pasoConfirmacionInquilino.value === 0) {
      pasoConfirmacionInquilino.value = 1
      confirmacionTextoInquilino.value = ''
    } else {
      confirmarEliminacionInquilino()
    }
  }
}

async function confirmarEliminacionInquilino() {
  if (!inquilinoAEliminar.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${inquilinoAEliminar.value.InquilinoID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      mensajeConfirmacion.value = `Inquilino "${inquilinoAEliminar.value.RazonSocial}" eliminado exitosamente`
      mostrarConfirmacion.value = true
      cancelarEliminacionInquilino()
      buscarInquilinos()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar inquilino')
    }
  } catch (error) {
    console.error('Error al eliminar inquilino:', error)
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Funciones de búsqueda de empresas
async function buscarEmpresas() {
  if (!busquedaEmpresa.value || busquedaEmpresa.value.trim().length < 2) {
    empresasBuscadas.value = []
    return
  }

  cargandoBusquedaEmpresas.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/empresas/buscar?q=${encodeURIComponent(busquedaEmpresa.value)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      empresasBuscadas.value = await response.json()
    } else {
      throw new Error('Error al buscar empresas')
    }
  } catch (error) {
    console.error('Error al buscar empresas:', error)
    mensajeError.value = 'Error al buscar empresas'
    mostrarError.value = true
  } finally {
    cargandoBusquedaEmpresas.value = false
  }
}

function limpiarBusquedaEmpresa() {
  busquedaEmpresa.value = ''
  empresasBuscadas.value = []
}

async function editarEmpresaSeleccionada(empresa) {
  console.log('🏢 Editando empresa seleccionada:', empresa)
  
  try {
    cargandoBusquedaEmpresas.value = true
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${empresa.EmpresaID}/datos-completos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const datosCompletos = await response.json()
      console.log('🏢 Datos completos de la empresa obtenidos:', datosCompletos)
      empresaAEditar.value = datosCompletos
      mostrarModalEdicionEmpresa.value = true
    } else {
      throw new Error('Error al obtener datos completos de la empresa')
    }
  } catch (error) {
    console.error('Error al cargar datos de la empresa:', error)
    mensajeError.value = 'Error al cargar datos de la empresa para edición'
    mostrarError.value = true
  } finally {
    cargandoBusquedaEmpresas.value = false
  }
}

function iniciarEliminacionEmpresa(empresa) {
  empresaAEliminar.value = empresa
  pasoConfirmacionEmpresa.value = 0
  confirmacionTextoEmpresa.value = ''
  mostrarModalEliminacionEmpresa.value = true
}

function cancelarEliminacionEmpresa() {
  empresaAEliminar.value = null
  pasoConfirmacionEmpresa.value = 0
  confirmacionTextoEmpresa.value = ''
  mostrarModalEliminacionEmpresa.value = false
}

function avanzarPasoConfirmacionEmpresa() {
  const textoRequerido = pasoConfirmacionEmpresa.value === 0 ? 'CONFIRMAR' : 'ELIMINAR'
  if (confirmacionTextoEmpresa.value === textoRequerido) {
    if (pasoConfirmacionEmpresa.value === 0) {
      pasoConfirmacionEmpresa.value = 1
      confirmacionTextoEmpresa.value = ''
    } else {
      confirmarEliminacionEmpresa()
    }
  }
}

async function confirmarEliminacionEmpresa() {
  if (!empresaAEliminar.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${empresaAEliminar.value.EmpresaID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      mensajeConfirmacion.value = `Empresa "${empresaAEliminar.value.RazonSocial}" eliminada exitosamente`
      mostrarConfirmacion.value = true
      cancelarEliminacionEmpresa()
      buscarEmpresas()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al eliminar empresa')
    }
  } catch (error) {
    console.error('Error al eliminar empresa:', error)
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Funciones de edición de inquilinos
function cerrarModalEdicionInquilino() {
  mostrarModalEdicionInquilino.value = false
  inquilinoAEditar.value = null
}

async function guardarEdicionInquilino(datosInquilino) {
  if (!inquilinoAEditar.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${inquilinoAEditar.value.InquilinoID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosInquilino)
    })
    
    if (response.ok) {
      mensajeConfirmacion.value = `Inquilino "${datosInquilino.RazonSocial}" actualizado exitosamente`
      mostrarConfirmacion.value = true
      cerrarModalEdicionInquilino()
      buscarInquilinos()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar inquilino')
    }
  } catch (error) {
    console.error('Error al actualizar inquilino:', error)
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Funciones de edición de empresas
function cerrarModalEdicionEmpresa() {
  mostrarModalEdicionEmpresa.value = false
  empresaAEditar.value = null
}

async function guardarEdicionEmpresa(datosEmpresa) {
  if (!empresaAEditar.value) return
  
  guardando.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${empresaAEditar.value.EmpresaID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosEmpresa)
    })
    
    if (response.ok) {
      mensajeConfirmacion.value = `Empresa "${datosEmpresa.RazonSocial}" actualizada exitosamente`
      mostrarConfirmacion.value = true
      cerrarModalEdicionEmpresa()
      buscarEmpresas()
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Error al actualizar empresa')
    }
  } catch (error) {
    console.error('Error al actualizar empresa:', error)
    mensajeError.value = error.message
    mostrarError.value = true
  } finally {
    guardando.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarInquilinos()
})
</script>

<style scoped>
.vista-container {
  padding: 2rem;
  background-color: #0f172a;
  min-height: 100vh;
  color: white;
}

.vista-header {
  margin-bottom: 2rem;
}

.vista-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.vista-subtitle {
  font-size: 1rem;
  color: #9ca3af;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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

.tabs-container {
  background-color: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid #334155;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background-color: #0f172a;
  border-bottom: 1px solid #334155;
}

.tab {
  flex: 1;
  padding: 1rem 1.5rem;
  background-color: transparent;
  border: none;
  color: #94a3b8;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab:hover {
  background-color: #1e293b;
  color: #cbd5e1;
}

.tab.active {
  background-color: #1e293b;
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  padding: 2rem;
}

.tab-panel {
  min-height: 400px;
}

.aviso-sin-inquilinos {
  text-align: center;
  padding: 3rem;
  background-color: #1f2937;
  border-radius: 0.75rem;
  border: 1px dashed #374151;
}

.aviso-sin-inquilinos i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.aviso-sin-inquilinos h3 {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
}

.aviso-sin-inquilinos p {
  color: #9ca3af;
  margin-bottom: 2rem;
}

.formularios-combinados {
  space-y: 2rem;
}

.seccion-formulario {
  background-color: #1f2937;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #374151;
  margin-bottom: 2rem;
}

.seccion-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.separador {
  height: 1px;
  background: linear-gradient(to right, transparent, #374151, transparent);
  margin: 2rem 0;
}

.acciones-combinadas {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1e293b;
  padding: 2rem;
  border-radius: 0.75rem;
  border: 1px solid #334155;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.error {
  border-color: #dc2626;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 1rem;
}

.modal-title.error {
  color: #ef4444;
}

.modal-text {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.ph-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Estilos para pestañas de gestión */
.gestion-section {
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.section-subtitle {
  color: #9ca3af;
  font-size: 1rem;
}

.search-container {
  margin-bottom: 2rem;
}

.search-input-group {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background-color: #1f2937;
  border: 2px solid #374151;
  border-radius: 0.75rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-input::placeholder {
  color: #6b7280;
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  color: #ffffff;
  background-color: #374151;
}

.search-results {
  margin-top: 2rem;
}

.results-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background-color: #1f2937;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  border-color: #4f46e5;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.result-card:hover::before {
  opacity: 1;
}

.result-info {
  margin-bottom: 1rem;
}

.result-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.result-rut {
  font-family: monospace;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.result-empresas {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
}

.result-tipo {
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.result-inquilino {
  color: #8b5cf6;
  font-size: 0.875rem;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #374151;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action.edit {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-action.edit:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.btn-action.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-action.delete:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.empty-state, .initial-state {
  text-align: center;
  padding: 3rem;
  background-color: #1f2937;
  border-radius: 0.75rem;
  border: 1px dashed #374151;
}

.empty-state i, .initial-state i {
  font-size: 3rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.empty-state h4, .initial-state h4 {
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.empty-state p, .initial-state p {
  color: #9ca3af;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.loading-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

/* Estilos para modales de confirmación */
.modal-content.danger {
  border-color: #dc2626;
  max-width: 600px;
}

.modal-title.danger {
  color: #ef4444;
}

.modal-text.warning {
  color: #fbbf24;
}

.modal-text.danger {
  color: #ef4444;
  font-weight: 600;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
}

.warning-list li {
  color: #fbbf24;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.5rem;
}

.warning-list li:before {
  content: '⚠️';
  position: absolute;
  left: 0;
  top: 0;
}

.confirmation-input {
  margin: 1.5rem 0;
}

.confirmation-input label {
  display: block;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.confirmation-input input {
  width: 100%;
  padding: 0.75rem;
  background-color: #374151;
  border: 2px solid #4b5563;
  border-radius: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  text-align: center;
  font-weight: 600;
}

.confirmation-input input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para modal de edición */
.modal-edicion {
  max-width: 95vw !important;
  max-height: 95vh !important;
  width: 90vw !important;
  min-width: 800px;
  overflow: hidden;
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #374151;
  background-color: #374151;
  border-radius: 0.75rem 0.75rem 0 0;
  flex-shrink: 0;
}

.modal-header .modal-title {
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
  flex-shrink: 0;
}

.btn-close-modal:hover {
  color: #ffffff;
  background-color: rgba(239, 68, 68, 0.2);
}

.modal-content-wrapper {
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* Ajustes específicos para formularios dentro de modales */
.modal-edicion .formulario-inquilino,
.modal-edicion .formulario-empresa {
  max-width: none;
  margin: 0;
}

.modal-edicion .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: none;
}

.modal-edicion .form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #374151;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-edicion .btn-form {
  min-width: 120px;
}

/* Responsividad para modales */
@media (max-width: 1024px) {
  .modal-edicion {
    min-width: 90vw !important;
    width: 90vw !important;
  }
  
  .modal-edicion .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modal-edicion {
    min-width: 95vw !important;
    width: 95vw !important;
    max-height: 90vh !important;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-content-wrapper {
    padding: 1rem 1.5rem 1.5rem;
  }
  
  .modal-edicion .form-actions {
    flex-direction: column;
  }
}
</style>