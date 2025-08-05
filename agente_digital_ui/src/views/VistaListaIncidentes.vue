<template>
  <div class="vista-container">
    <header class="vista-header">
      <button @click="volverAEmpresas" class="btn-volver mb-4">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a la Selección de Empresa</span>
      </button>
      <div class="flex justify-between items-center">
        <div>
            <h1 class="vista-title">Gestión de Incidentes</h1>
            <p v-if="!loading" class="vista-subtitle">Mostrando incidentes para: {{ nombreEmpresa }}</p>
        </div>
        <div class="header-actions">
          <button @click="irADeclararIncidente" class="btn btn-primary">
              <i class="ph ph-plus-circle"></i>
              <span>Registrar Nuevo Incidente</span>
          </button>
        </div>
      </div>
    </header>

    <div v-if="loading" class="text-center py-16 text-gray-400">
      Cargando incidentes...
    </div>
    <div v-else-if="error" class="error-banner">
      {{ error }}
    </div>
    
    <div v-else-if="incidentes.length > 0" class="tabla-container">
      <table class="tabla-moderna">
        <thead>
          <tr>
            <th>ID Incidente</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Criticidad</th>
            <th>Fecha Detección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="incidente in incidentes" :key="incidente.IncidenteID">
            <td class="font-mono">{{ incidente.IncidenteID }}</td>
            <td>{{ incidente.Titulo }}</td>
            <td>
              <span v-if="incidente.TieneReporteANCI" class="badge-tipo-anci">
                <i class="ph ph-warning-circle"></i>
                ANCI
              </span>
              <span v-else class="badge-tipo-normal">
                <i class="ph ph-file-text"></i>
                Normal
              </span>
            </td>
            <td>
              <div class="estado-container">
                <span class="badge-estado-enhanced" :class="getEstadoClass(incidente.EstadoActual)">
                  <i class="estado-icon" :class="getEstadoIcon(incidente.EstadoActual)"></i>
                  <span class="estado-text">{{ incidente.EstadoActual || 'No definido' }}</span>
                  <div class="estado-pulse" v-if="isEstadoUrgente(incidente.EstadoActual)"></div>
                </span>
              </div>
            </td>
            <td>
              <div class="criticidad-container">
                <span class="badge-criticidad-enhanced" :class="getCriticidadClass(incidente.Criticidad)">
                  <i class="criticidad-icon" :class="getCriticidadIcon(incidente.Criticidad)"></i>
                  <span class="criticidad-text">{{ incidente.Criticidad || 'No definida' }}</span>
                  <div class="criticidad-indicator" :class="getCriticidadIndicator(incidente.Criticidad)"></div>
                </span>
              </div>
            </td>
            <td>{{ formatarFecha(incidente.FechaDeteccion || incidente.FechaCreacion) }}</td>
            <td>
              <div class="acciones-grupo">
                <button @click="verDetalle(incidente.IncidenteID)" class="btn-action btn-view" title="Ver/Editar Expediente">
                  <i class="ph ph-eye"></i>
                  <span class="btn-tooltip">Ver detalle</span>
                </button>
                <!-- Solo administradores pueden eliminar incidentes -->
                <button 
                  v-if="esAdministrador" 
                  @click="confirmarEliminarIncidente(incidente)" 
                  class="btn-action btn-delete" 
                  title="Eliminar Incidente"
                >
                  <i class="ph ph-trash"></i>
                  <span class="btn-tooltip">Eliminar</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="text-center py-16 card-dark">
      <h3 class="text-xl font-semibold text-white">No hay incidentes registrados</h3>
      <p class="text-gray-400 mt-2">Puedes comenzar registrando el primer incidente para esta empresa.</p>
    </div>

    <!-- Modal de Confirmación para Eliminar Incidente -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click="cancelarEliminar">
      <div class="modal-container modal-peligro" @click.stop>
        <div class="modal-header">
          <div class="modal-icon peligro">
            <i class="ph ph-warning-octagon"></i>
          </div>
          <h3 class="modal-title">¿Eliminar Incidente?</h3>
        </div>
        
        <div class="modal-body">
          <p class="modal-mensaje">
            Esta acción eliminará permanentemente el incidente:
          </p>
          <div class="incidente-info">
            <div class="info-item">
              <strong>ID:</strong> {{ incidenteEliminar?.IncidenteID }}
            </div>
            <div class="info-item">
              <strong>Título:</strong> {{ incidenteEliminar?.Titulo }}
            </div>
            <div class="info-item">
              <strong>Estado:</strong> {{ incidenteEliminar?.EstadoActual }}
            </div>
          </div>
          <div class="alerta-peligro">
            <i class="ph ph-warning-triangle"></i>
            <span>Esta acción no se puede deshacer. Se eliminarán todos los datos relacionados.</span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelarEliminar" class="btn btn-secondary">
            <i class="ph ph-x"></i>
            Cancelar
          </button>
          <button @click="eliminarIncidente" class="btn btn-danger" :disabled="eliminando">
            <i class="ph ph-trash"></i>
            {{ eliminando ? 'Eliminando...' : 'Eliminar Incidente' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';

const props = defineProps({
  empresaId: { type: [String, Number], required: true },
  inquilinoId: { type: [String, Number], required: true }
});

const router = useRouter();
const incidentes = ref([]);
const nombreEmpresa = ref('');
const loading = ref(true);
const error = ref(null);

// Estados para eliminación de incidentes
const mostrarModalEliminar = ref(false);
const incidenteEliminar = ref(null);
const eliminando = ref(false);

// Verificar si el usuario es administrador (ejemplo básico)
const esAdministrador = ref(true); // TODO: Obtener del store de autenticación

async function cargarDatos() {
  loading.value = true;
  error.value = null;
  try {
    // Cargar incidentes primero - Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const resIncidentes = await apiClient.get(`/admin/empresas/${props.empresaId}/incidentes?_t=${timestamp}`);
    incidentes.value = resIncidentes.data;
    
    // Luego cargar datos de empresa, con manejo de error específico
    try {
      const resEmpresa = await apiClient.get(`/admin/empresas/${props.empresaId}`);
      nombreEmpresa.value = resEmpresa.data.RazonSocial || `Empresa ${props.empresaId}`;
    } catch (errEmpresa) {
      console.error('Error cargando datos de empresa:', errEmpresa);
      // Si falla la carga de empresa, usar un nombre por defecto
      nombreEmpresa.value = `Empresa ${props.empresaId}`;
    }
  } catch (err) {
    error.value = "No se pudieron cargar los incidentes. " + (err.response?.data?.error || err.message);
  } finally {
    loading.value = false;
  }
}

function irADeclararIncidente() {
  router.push({ name: 'DeclararIncidente', params: { empresaId: props.empresaId } });
}

function verDetalle(incidenteId) {
  console.log('🔗 Navegando a detalle del incidente:', incidenteId);
  router.push({ name: 'VistaDetalleIncidente', params: { incidenteId: incidenteId } });
}

function irAInformesANCI(incidenteId) {
  console.log('📄 Navegando a informes ANCI del incidente:', incidenteId);
  router.push({ name: 'InformesANCI', params: { incidenteId: incidenteId } });
}

function volverAEmpresas() {
  // Navegación explícita y segura a la lista de empresas del inquilino correcto.
  router.push({ name: 'VistaEmpresas', params: { inquilinoId: props.inquilinoId } });
}

function formatarFecha(fecha) {
    if (!fecha) return 'N/A';
    const opciones = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-CL', opciones);
}

function getEstadoClass(estado) {
  const S = estado?.toLowerCase() || '';
  if (S.includes('activo') || S.includes('investigación')) return 'estado-activo';
  if (S.includes('contenido') || S.includes('erradicado')) return 'estado-contenido';
  if (S.includes('cerrado')) return 'estado-cerrado';
  return 'estado-indefinido';
}

function getCriticidadClass(criticidad) {
    const C = criticidad?.toLowerCase() || '';
    if (C === 'crítica') return 'criticidad-critica';
    if (C === 'alta') return 'criticidad-alta';
    if (C === 'media') return 'criticidad-media';
    return 'criticidad-baja';
}

// Nuevas funciones para iconos y indicadores mejorados
function getEstadoIcon(estado) {
    const S = estado?.toLowerCase() || '';
    if (S.includes('activo') || S.includes('investigación')) return 'ph ph-detective';
    if (S.includes('contenido') || S.includes('erradicado')) return 'ph ph-shield-check';
    if (S.includes('cerrado')) return 'ph ph-check-circle';
    return 'ph ph-question-mark';
}

function getCriticidadIcon(criticidad) {
    const C = criticidad?.toLowerCase() || '';
    if (C === 'crítica') return 'ph ph-fire';
    if (C === 'alta') return 'ph ph-warning-octagon';
    if (C === 'media') return 'ph ph-warning';
    return 'ph ph-info';
}

function isEstadoUrgente(estado) {
    const S = estado?.toLowerCase() || '';
    return S.includes('activo') || S.includes('investigación');
}

function getCriticidadIndicator(criticidad) {
    const C = criticidad?.toLowerCase() || '';
    if (C === 'crítica') return 'indicator-critica';
    if (C === 'alta') return 'indicator-alta';
    if (C === 'media') return 'indicator-media';
    return 'indicator-baja';
}

// Funciones para eliminar incidentes
function confirmarEliminarIncidente(incidente) {
  incidenteEliminar.value = incidente;
  mostrarModalEliminar.value = true;
}

function cancelarEliminar() {
  mostrarModalEliminar.value = false;
  incidenteEliminar.value = null;
  eliminando.value = false;
}

async function eliminarIncidente() {
  if (!incidenteEliminar.value) return;
  
  eliminando.value = true;
  const idAEliminar = incidenteEliminar.value.IncidenteID;
  
  console.log(`🔥 INICIANDO eliminación del incidente ${idAEliminar}`);
  console.log('📊 Estado previo a eliminación:', {
    totalIncidentes: incidentes.value.length,
    incidenteAEliminar: incidenteEliminar.value,
    idsExistentes: incidentes.value.map(i => i.IncidenteID)
  });
  
  try {
    console.log(`🌐 Enviando petición DELETE a: /admin/incidentes/${idAEliminar}`);
    const response = await apiClient.delete(`/admin/incidentes/${idAEliminar}`);
    
    console.log('📨 Respuesta del servidor:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // Verificar respuesta exitosa
    if (response.data?.success || response.status === 200) {
      console.log('✅ Eliminación exitosa confirmada por servidor');
      
      // Contar incidentes antes de filtrar
      const countAntes = incidentes.value.length;
      
      // Eliminar inmediatamente de la lista local
      incidentes.value = incidentes.value.filter(inc => inc.IncidenteID !== idAEliminar);
      const countDespues = incidentes.value.length;
      
      console.log(`🗑️ Filtro aplicado: ${countAntes} -> ${countDespues} incidentes`);
      console.log('📋 IDs restantes:', incidentes.value.map(i => i.IncidenteID));
      
      // Verificar que efectivamente se eliminó
      const existeAun = incidentes.value.find(inc => inc.IncidenteID === idAEliminar);
      if (existeAun) {
        console.error('❌ ERROR: El incidente aún existe en la lista local tras filtro');
        console.error('🐛 Incidente problemático:', existeAun);
      } else {
        console.log('✅ Confirmado: Incidente eliminado de lista local');
      }
      
      // Mostrar mensaje de éxito
      alert('Incidente eliminado correctamente');
      
      // Cerrar modal
      cancelarEliminar();
      
      // Forzar recarga inmediata sin caché para confirmar cambios en BD
      console.log('🔄 Forzando recarga desde BD para validar eliminación...');
      try {
        await cargarDatos();
        
        // Verificar que no regresó tras la recarga
        const existeTrasRecarga = incidentes.value.find(inc => inc.IncidenteID === idAEliminar);
        if (existeTrasRecarga) {
          console.error('❌ CRÍTICO: El incidente volvió a aparecer tras recarga de BD');
          console.error('🚨 Esto indica que NO se eliminó de la base de datos');
          alert('⚠️ ADVERTENCIA: El incidente parece no haberse eliminado de la base de datos. Verificando...');
        } else {
          console.log('✅ ÉXITO TOTAL: Incidente confirmado eliminado de BD');
        }
      } catch (e) {
        console.error('❌ Error recargando datos para validación:', e);
        console.log('📝 Manteniendo lista filtrada localmente');
      }
    } else {
      throw new Error('La eliminación no fue confirmada por el servidor');
    }
  } catch (err) {
    console.error('❌ Error completo al eliminar incidente:', {
      error: err,
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    
    const errorMsg = err.response?.data?.error || err.response?.data?.detalle || err.message;
    alert('Error al eliminar el incidente: ' + errorMsg);
    eliminando.value = false;
    
    // Recargar por si acaso hubo un cambio parcial
    console.log('🔄 Recargando datos tras error para verificar estado actual...');
    await cargarDatos();
  }
}

onMounted(cargarDatos);
</script>

<style scoped>
.vista-container { padding: 1.5rem 2rem; }
.vista-header { margin-bottom: 2rem; }
.vista-title { font-size: 2.25rem; font-weight: 800; color: #ffffff; }
.vista-subtitle { font-size: 1rem; color: #9ca3af; }
.btn-volver { display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #9ca3af; text-decoration: none; font-weight: 600; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; padding: 0.6rem 1.2rem; border-radius: 0.375rem; border: none; cursor: pointer; transition: background-color 0.2s; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #6b7280; color: white; }
.btn-danger { background-color: #dc2626; color: white; }
.btn-icon { padding: 0.5rem; background-color: #374151; color: #9ca3af; border-radius: 0.375rem; }
.btn-icon:hover { background-color: #4b5563; color: white; }
.btn-danger:hover { background-color: #b91c1c; }
.acciones-grupo { display: flex; gap: 0.5rem; }
.btn-primary:hover { background-color: #4338ca; }

/* Botones de acción mejorados */
.btn-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  font-size: 1.25rem;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-action:hover::before {
  opacity: 1;
}

.btn-view {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.btn-view:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.btn-delete:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* Tooltip para botones */
.btn-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 10;
}

.btn-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.btn-action:hover .btn-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.tabla-container { background-color: #1f2937; border-radius: 0.75rem; border: 1px solid #374151; overflow: hidden; }
.tabla-moderna { width: 100%; border-collapse: collapse; }
.tabla-moderna th, .tabla-moderna td { padding: 1rem 1.5rem; text-align: left; border-bottom: 1px solid #374151; color: #d1d5db; }
.tabla-moderna thead th { background-color: #2d3748; font-size: 0.75rem; text-transform: uppercase; color: #9ca3af; }
.tabla-moderna tbody tr:last-child td { border-bottom: none; }
.tabla-moderna tbody tr:hover { background-color: #2a3344; }
/* Estilos creativos mejorados para badges */
.estado-container, .criticidad-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-estado-enhanced, .badge-criticidad-enhanced {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.875rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid transparent;
}

.badge-estado-enhanced:hover, .badge-criticidad-enhanced:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Estilos de Estado */
.estado-activo {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
  color: #fcd34d;
  border-color: rgba(245, 158, 11, 0.3);
}

.estado-contenido {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.2));
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.3);
}

.estado-cerrado {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(134, 239, 172, 0.2));
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.3);
}

.estado-indefinido {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(156, 163, 175, 0.2));
  color: #9ca3af;
  border-color: rgba(107, 114, 128, 0.3);
}

/* Estilos de Criticidad */
.criticidad-critica {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
  animation: pulse-critica 2s ease-in-out infinite;
}

.criticidad-alta {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.2));
  color: #fb923c;
  border-color: rgba(249, 115, 22, 0.3);
}

.criticidad-media {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
  color: #fcd34d;
  border-color: rgba(245, 158, 11, 0.3);
}

.criticidad-baja {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.2));
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.3);
}

/* Iconos */
.estado-icon, .criticidad-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.estado-text, .criticidad-text {
  white-space: nowrap;
}

/* Efectos de pulso para estados urgentes */
.estado-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.75rem;
  background: rgba(245, 158, 11, 0.3);
  animation: pulse-estado 1.5s ease-in-out infinite;
  pointer-events: none;
}

/* Indicadores de criticidad */
.criticidad-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #1f2937;
}

.indicator-critica {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  animation: blink-critica 1s ease-in-out infinite;
}

.indicator-alta {
  background: #f97316;
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
}

.indicator-media {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.3);
}

.indicator-baja {
  background: #0ea5e9;
  box-shadow: 0 0 4px rgba(14, 165, 233, 0.2);
}

/* Animaciones */
@keyframes pulse-critica {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
    transform: scale(1.02);
  }
}

@keyframes pulse-estado {
  0%, 100% { 
    opacity: 0;
    transform: scale(1);
  }
  50% { 
    opacity: 0.3;
    transform: scale(1.05);
  }
}

@keyframes blink-critica {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.3;
    transform: scale(1.2);
  }
}

/* Efectos hover específicos */
.estado-activo:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(251, 191, 36, 0.3));
  border-color: rgba(245, 158, 11, 0.5);
}

.criticidad-critica:hover {
  animation-duration: 1s;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.3);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .badge-estado-enhanced, .badge-criticidad-enhanced {
    font-size: 0.625rem;
    padding: 0.25rem 0.5rem;
    gap: 0.25rem;
  }
  
  .estado-icon, .criticidad-icon {
    font-size: 0.75rem;
  }
}
.card-dark { background-color: #1f2937; padding: 2rem; border-radius: 0.75rem; border: 1px solid #374151; }
.error-banner { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ef4444; }

/* Header actions */
.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Botón cuenta regresiva */
.btn-cuenta-regresiva {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1));
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-cuenta-regresiva:hover {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.2));
  border-color: rgba(249, 115, 22, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.btn-cuenta-regresiva i {
  font-size: 1.1rem;
}

/* Badges de tipo de incidente */
.badge-tipo-anci, .badge-tipo-normal {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo-anci {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-tipo-normal {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Estilos del modal de eliminación */
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
  border-color: rgba(239, 68, 68, 0.5);
}

.modal-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
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

.modal-icon.peligro {
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

.modal-mensaje {
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 1.5rem;
}

.incidente-info {
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

.info-item strong {
  color: #94a3b8;
  font-weight: 600;
}

.alerta-peligro {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-footer .btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.modal-footer .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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
</style>