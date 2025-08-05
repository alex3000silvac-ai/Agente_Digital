<template>
  <div class="vista-container">
    <header class="vista-header">
      <h1 class="vista-title">Supervisar Inquilinos Ley Ciberseguridad 21663</h1>
      <p class="vista-subtitle">Seleccione un inquilino para ver las empresas asociadas.</p>
    </header>

    <div v-if="loading" class="text-center py-16">
      <p class="text-gray-400">Cargando inquilinos...</p>
    </div>

    <div v-else-if="error" class="error-banner">
      <p><strong>Ocurrió un error al cargar los inquilinos:</strong> {{ error }}</p>
    </div>
    
    <div v-else-if="inquilinos.length > 0" class="cards-grid">
      <div 
        v-for="inquilino in inquilinos" 
        :key="inquilino.InquilinoID"
        class="card-item"
        @click="verEmpresas(inquilino)"
      >
        <div class="card-content">
          <div class="card-header">
            <div class="card-info">
              <h2 class="card-title">{{ inquilino.RazonSocial }}</h2>
              <p class="card-subtitle">{{ inquilino.RUT }}</p>
            </div>
            <div class="empresa-badge">
              <div class="empresa-number">{{ inquilino.CantidadEmpresas }}</div>
              <div class="empresa-label">{{ inquilino.CantidadEmpresas === 1 ? 'Empresa' : 'Empresas' }}</div>
            </div>
          </div>
          <div class="card-footer">
            <div class="progress-indicator">
              <i class="ph ph-buildings"></i>
              <span class="progress-text">Gestionar empresas asociadas</span>
              <i class="ph ph-arrow-right arrow-icon"></i>
            </div>
          </div>
          <!-- Botones de acción removidos - ahora están en el panel de administración -->
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 card-dark">
      <p class="text-gray-400">No se encontraron inquilinos activos para mostrar.</p>
    </div>

    <!-- Modal de Edición de Inquilino -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click="cancelarEdicion">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="modal-icon edit">
            <i class="ph ph-pencil-simple"></i>
          </div>
          <h3 class="modal-title">Editar Inquilino</h3>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="guardarInquilino" class="form-edit">
            <div class="form-group">
              <label class="form-label">Razón Social</label>
              <input autocomplete="off" v-model="inquilinoEditando.RazonSocial" 
                type="text" 
                class="form-input"
                required
                maxlength="255"
              />
            </div>
            <div class="form-group">
              <label class="form-label">RUT</label>
              <input autocomplete="off" v-model="inquilinoEditando.RUT" 
                type="text" 
                class="form-input"
                maxlength="20"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select autocomplete="off" v-model="inquilinoEditando.Estado" class="form-input">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelarEdicion" class="btn btn-secondary">
            <i class="ph ph-x"></i>
            Cancelar
          </button>
          <button @click="guardarInquilino" class="btn btn-primary" :disabled="guardando">
            <i class="ph ph-floppy-disk"></i>
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Primera Confirmación para Eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click="cancelarEliminar">
      <div class="modal-container modal-peligro" @click.stop>
        <div class="modal-header">
          <div class="modal-icon warning">
            <i class="ph ph-warning-triangle"></i>
          </div>
          <h3 class="modal-title">¿Eliminar Inquilino?</h3>
        </div>
        
        <div class="modal-body">
          <p class="modal-mensaje">
            ¿Está seguro que desea eliminar el inquilino?
          </p>
          <div class="inquilino-info">
            <div class="info-item">
              <strong>Razón Social:</strong> {{ inquilinoEliminar?.RazonSocial }}
            </div>
            <div class="info-item">
              <strong>RUT:</strong> {{ inquilinoEliminar?.RUT }}
            </div>
            <div class="info-item">
              <strong>Empresas asociadas:</strong> {{ inquilinoEliminar?.CantidadEmpresas }}
            </div>
          </div>
          <div class="alerta-advertencia">
            <i class="ph ph-info"></i>
            <span>Esta acción eliminará también todas las empresas y datos asociados al inquilino.</span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelarEliminar" class="btn btn-secondary">
            <i class="ph ph-x"></i>
            Cancelar
          </button>
          <button @click="mostrarConfirmacionFinal" class="btn btn-warning">
            <i class="ph ph-warning"></i>
            Continuar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación Final (Doble confirmación) -->
    <div v-if="mostrarModalConfirmacionFinal" class="modal-overlay" @click="cancelarEliminar">
      <div class="modal-container modal-peligro-final" @click.stop>
        <div class="modal-header">
          <div class="modal-icon danger">
            <i class="ph ph-warning-octagon"></i>
          </div>
          <h3 class="modal-title">¡CONFIRMACIÓN FINAL!</h3>
        </div>
        
        <div class="modal-body">
          <p class="modal-mensaje-critico">
            ESTA ACCIÓN ES PERMANENTE E IRREVERSIBLE
          </p>
          <div class="datos-eliminacion">
            <h4>Se eliminarán permanentemente:</h4>
            <ul class="lista-eliminacion">
              <li><i class="ph ph-check"></i> El inquilino: <strong>{{ inquilinoEliminar?.RazonSocial }}</strong></li>
              <li><i class="ph ph-check"></i> {{ inquilinoEliminar?.CantidadEmpresas }} empresa(s) asociada(s)</li>
              <li><i class="ph ph-check"></i> Todos los usuarios de estas empresas</li>
              <li><i class="ph ph-check"></i> Todos los incidentes registrados</li>
              <li><i class="ph ph-check"></i> Todos los archivos y documentos</li>
              <li><i class="ph ph-check"></i> Todo el historial y reportes</li>
            </ul>
          </div>
          
          <div class="confirmacion-escrita">
            <label class="form-label">Para confirmar, escriba el nombre del inquilino:</label>
            <input autocomplete="off" v-model="confirmacionTexto" 
              type="text" 
              class="form-input form-danger"
              :placeholder="inquilinoEliminar?.RazonSocial"
              @input="console.log('Texto actual:', confirmacionTexto, 'Esperado:', inquilinoEliminar?.RazonSocial, 'Puede eliminar:', puedeEliminar)"
            />
            <!-- DEBUG: Mostrar estado actual -->
            <div style="font-size: 0.75rem; color: #fca5a5; margin-top: 0.5rem;">
              <div>✍️ Escribiste: "{{ confirmacionTexto }}"</div>
              <div>🎯 Se requiere: "{{ inquilinoEliminar?.RazonSocial }}"</div>
              <div>✅ Estado: {{ puedeEliminar ? 'VÁLIDO - Botón habilitado' : 'INVÁLIDO - Botón deshabilitado' }}</div>
            </div>
          </div>
          
          <div class="alerta-peligro-final">
            <i class="ph ph-warning-octagon"></i>
            <span><strong>NO HAY FORMA DE RECUPERAR ESTOS DATOS</strong></span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelarEliminar" class="btn btn-secondary">
            <i class="ph ph-shield-x"></i>
            Cancelar y Proteger Datos
          </button>
          <button 
            @click="eliminarInquilinoFinal" 
            class="btn btn-danger-final" 
            :disabled="!puedeEliminar || eliminando"
          >
            <i class="ph ph-trash"></i>
            {{ eliminando ? 'ELIMINANDO...' : 'ELIMINAR PERMANENTEMENTE' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api.js';

const router = useRouter();
const inquilinos = ref([]);
const loading = ref(true);
const error = ref(null);

// Estados para edición
const mostrarModalEditar = ref(false);
const inquilinoEditando = ref({});
const guardando = ref(false);

// Estados para eliminación
const mostrarModalEliminar = ref(false);
const mostrarModalConfirmacionFinal = ref(false);
const inquilinoEliminar = ref(null);
const confirmacionTexto = ref('');
const eliminando = ref(false);

// Computed para verificar si puede eliminar
const puedeEliminar = computed(() => {
  if (!confirmacionTexto.value || !inquilinoEliminar.value?.RazonSocial) {
    return false;
  }
  
  // Normalizar texto: quitar espacios al inicio/final y convertir a minúsculas
  const textoUsuario = confirmacionTexto.value.trim().toLowerCase();
  const textoEsperado = inquilinoEliminar.value.RazonSocial.trim().toLowerCase();
  
  return textoUsuario === textoEsperado;
});

async function cargarInquilinos() {
  loading.value = true;
  error.value = null;
  try {
    console.log('DEBUG: Cargando lista de inquilinos');
    const response = await apiClient.get('/admin/inquilinos');
    console.log('DEBUG: Inquilinos cargados:', response.data);
    inquilinos.value = response.data;
  } catch (err) {
    console.error("Error al cargar inquilinos:", err);
    error.value = err.response?.data?.error || err.message || "No se pudo establecer conexión con el servidor.";
  } finally {
    loading.value = false;
  }
}

// Navegación
    function verEmpresas(inquilino) {
      if (!inquilino || typeof inquilino.InquilinoID === 'undefined') {
        console.error("Error: InquilinoID no definido.", inquilino);
        return;
      }
      router.push({ path: `/inquilino/${inquilino.InquilinoID}/empresas` });
    }

// Funciones de edición
function editarInquilino(inquilino) {
  inquilinoEditando.value = { 
    ...inquilino,
    // Asegurar que Estado tenga un valor por defecto
    Estado: inquilino.Estado || 'Activo'
  };
  mostrarModalEditar.value = true;
}

function cancelarEdicion() {
  mostrarModalEditar.value = false;
  inquilinoEditando.value = {};
  guardando.value = false;
}

async function guardarInquilino() {
  if (!inquilinoEditando.value.RazonSocial) {
    alert('La razón social es obligatoria');
    return;
  }
  
  guardando.value = true;
  try {
    await apiClient.put(`/admin/inquilinos/${inquilinoEditando.value.InquilinoID}`, {
      RazonSocial: inquilinoEditando.value.RazonSocial,
      RUT: inquilinoEditando.value.RUT,
      Estado: inquilinoEditando.value.Estado
    });
    
    alert('Inquilino actualizado correctamente');
    await cargarInquilinos();
    cancelarEdicion();
  } catch (err) {
    console.error('Error al guardar inquilino:', err);
    const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
    
    // Mostrar mensaje más detallado según el tipo de error
    if (err.response?.status === 403) {
      alert('Error: No tiene permisos para editar inquilinos. Solo los administradores generales pueden realizar esta acción.');
    } else if (err.response?.status === 401) {
      alert('Error: Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    } else {
      alert(`Error al guardar inquilino: ${errorMessage}`);
    }
    guardando.value = false;
  }
}

// Funciones de eliminación
function confirmarEliminarInquilino(inquilino) {
  inquilinoEliminar.value = inquilino;
  mostrarModalEliminar.value = true;
}

function mostrarConfirmacionFinal() {
  mostrarModalEliminar.value = false;
  mostrarModalConfirmacionFinal.value = true;
}

function cancelarEliminar() {
  mostrarModalEliminar.value = false;
  mostrarModalConfirmacionFinal.value = false;
  inquilinoEliminar.value = null;
  confirmacionTexto.value = '';
  eliminando.value = false;
}

async function eliminarInquilinoFinal() {
  if (!puedeEliminar.value) {
    alert('Debe escribir exactamente el nombre del inquilino para confirmar');
    return;
  }
  
  eliminando.value = true;
  try {
    await apiClient.delete(`/admin/inquilinos/${inquilinoEliminar.value.InquilinoID}`);
    
    alert('Inquilino eliminado correctamente');
    await cargarInquilinos();
    cancelarEliminar();
  } catch (err) {
    console.error('Error al eliminar inquilino:', err);
    const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
    
    // Mostrar mensaje más detallado según el tipo de error
    if (err.response?.status === 403) {
      alert('Error: No tiene permisos para eliminar inquilinos. Solo los administradores generales pueden realizar esta acción.');
    } else if (err.response?.status === 401) {
      alert('Error: Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    } else if (err.response?.status === 404) {
      alert('Error: El inquilino no fue encontrado.');
    } else {
      alert(`Error al eliminar inquilino: ${errorMessage}`);
    }
    eliminando.value = false;
  }
}

onMounted(cargarInquilinos);
</script>

<style scoped>
.vista-container { padding: 1rem; }
.vista-header { margin-bottom: 2rem; }
.vista-title { font-size: 2.25rem; font-weight: 800; color: #ffffff; }
.vista-subtitle { font-size: 1.125rem; color: #9ca3af; }
.cards-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
  gap: 1.5rem; 
}
.card-item { 
  display: block; 
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%); 
  border: 1px solid #374151; 
  border-radius: 1rem; 
  padding: 1.5rem; 
  text-decoration: none; 
  color: inherit; 
  transition: all 0.3s ease; 
  position: relative;
  overflow: hidden;
  cursor: pointer;
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
  transform: translateY(-8px); 
  border-color: #4f46e5; 
  box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(79, 70, 229, 0.2); 
}

.card-item:hover::before {
  opacity: 1;
}

.card-item:hover .arrow-icon {
  transform: translateX(4px);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.card-info {
  flex: 1;
}

.card-title { 
  font-size: 1.375rem; 
  font-weight: 700; 
  color: #ffffff; 
  margin-bottom: 0.5rem; 
  line-height: 1.2;
}

.card-subtitle { 
  font-family: 'SF Mono', 'Monaco', monospace; 
  color: #9ca3af; 
  font-size: 0.875rem;
  font-weight: 500;
}

.empresa-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(79, 70, 229, 0.15);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem;
  min-width: 70px;
}

.empresa-number {
  font-size: 1.875rem;
  font-weight: 800;
  color: #4f46e5;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.empresa-label {
  font-size: 0.625rem;
  color: #a5b4fc;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-align: center;
}

.card-footer { 
  border-top: 1px solid #374151; 
  padding-top: 1rem; 
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-text {
  flex: 1;
}

.arrow-icon {
  transition: transform 0.3s ease;
  color: #4f46e5;
  font-weight: 600;
}

/* Estilos de botones para modales */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.btn-danger-final {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  animation: pulse-danger 2s ease-in-out infinite;
}

/* Estilos de modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

.modal-peligro {
  border-color: rgba(245, 158, 11, 0.5);
}

.modal-peligro-final {
  border-color: rgba(239, 68, 68, 0.8);
  box-shadow: 0 25px 50px rgba(239, 68, 68, 0.3);
}

.modal-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1rem;
  color: white;
}

.modal-icon.edit {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.modal-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

.modal-icon.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
  animation: pulse-danger 2s ease-in-out infinite;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.modal-body {
  padding: 0 2rem 2rem;
}

.form-edit {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  background: rgba(71, 85, 105, 0.1);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  color: #e2e8f0;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-danger {
  border-color: #ef4444;
}

.modal-mensaje {
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-mensaje-critico {
  color: #fca5a5;
  text-align: center;
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.inquilino-info {
  background: rgba(71, 85, 105, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
}

.info-item:last-child {
  border-bottom: none;
}

.alerta-advertencia {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.5rem;
  color: #fcd34d;
  font-size: 0.875rem;
}

.datos-eliminacion {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.datos-eliminacion h4 {
  color: #fca5a5;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.lista-eliminacion {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lista-eliminacion li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #e2e8f0;
  border-bottom: 1px solid rgba(239, 68, 68, 0.1);
}

.lista-eliminacion li:last-child {
  border-bottom: none;
}

.lista-eliminacion li i {
  color: #ef4444;
  font-weight: 600;
}

.confirmacion-escrita {
  margin-bottom: 1.5rem;
}

.alerta-peligro-final {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.5);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-weight: 700;
  text-align: center;
  animation: pulse-warning 3s ease-in-out infinite;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-footer .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse-danger {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
  }
  50% { 
    box-shadow: 0 0 50px rgba(239, 68, 68, 0.6);
  }
}

@keyframes pulse-warning {
  0%, 100% { 
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.15);
  }
  50% { 
    border-color: rgba(239, 68, 68, 0.8);
    background: rgba(239, 68, 68, 0.25);
  }
}

.error-banner { background-color: #9f1239; color: white; padding: 1rem; border-radius: 0.5rem; }
.card-dark { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; }
</style>
