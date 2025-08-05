<template>
  <div v-if="loading" class="flex items-center justify-center h-screen text-gray-400">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Cargando expediente del incidente...</p>
    </div>
  </div>
  
  <div v-else-if="error" class="error-banner m-8">
    <i class="ph ph-warning-circle mr-2"></i>
    <strong>Error:</strong> {{ error }}
    <div v-if="error.includes('ID de incidente no válido')" class="mt-4">
      <p class="text-sm">
        <strong>Posibles causas:</strong>
      </p>
      <ul class="text-sm mt-2 list-disc list-inside">
        <li>La URL no contiene un ID de incidente válido</li>
        <li>El incidente fue eliminado o no existe</li>
        <li>Error en la navegación desde otra página</li>
      </ul>
      <div class="mt-4">
        <button @click="volver" class="btn-volver">
          <i class="ph ph-arrow-left"></i>
          <span>Volver al Dashboard</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Vista Normal: Expediente Semilla con botón ANCI -->
  <div v-else-if="incidente && !incidente.ReporteAnciID" class="vista-normal">
    <div class="header-con-navegacion mb-6 border-b border-gray-700 pb-4">
      <div class="header-row-superior">
        <button @click="volver" class="btn-volver">
          <i class="ph ph-arrow-left"></i>
          <span>Volver a la Lista de Incidentes</span>
        </button>
        <button @click="abrirDialogoTransformarAnci" class="btn-transformar-anci">
          <i class="ph ph-warning-circle"></i>
          <span>Transformar a ANCI</span>
        </button>
      </div>
      <h2 class="text-xl font-bold text-white mt-4">Expediente de Incidente</h2>
    </div>

    <!-- Usar el mismo componente de creación pero con datos precargados -->
    <AcordeonIncidenteMejorado
      v-if="incidente.IncidenteID"
      :incidente-id="incidente.IncidenteID"
      :empresa-id="incidente.EmpresaID"
      :inquilino-id="incidente.InquilinoID || 1"
      :modo="'editar'"
      :datos-iniciales="datosParaEdicion"
      :empresa-info="{ tipo: empresaData?.TipoEmpresa || 'PSE', nombre: empresaData?.RazonSocial || '' }"
      @incidente-guardado="guardarCambios"
    />
    
    <!-- Modal de confirmación para transformar a ANCI -->
    <div v-if="mostrandoDialogoAnci" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">⚠️ Transformar a Reporte ANCI</h3>
        <p class="modal-text">
          Esta acción convertirá el incidente en un reporte oficial para la ANCI. 
          Se activarán los plazos legales y se enviarán alertas automáticas al delegado de ciberseguridad.
        </p>
        <div class="modal-plazos">
          <div class="plazo-info">
            <strong>Empresa tipo {{ incidente.TipoEmpresa }}:</strong>
            <ul>
              <li>📋 Reporte inicial: {{ incidente.TipoEmpresa === 'OIV' ? '2 horas' : '4 horas' }}</li>
              <li>📊 Reporte final: 72 horas</li>
            </ul>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="cancelarTransformacionAnci" class="btn-secondary">
            Cancelar
          </button>
          <button @click="confirmarTransformacionAnci" class="btn-danger" :disabled="transformandoAnci">
            <span v-if="transformandoAnci">Transformando...</span>
            <span v-else>Sí, Transformar a ANCI</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Vista ANCI: Sistema de Tarjetas -->
  <VistaDetalleIncidenteANCI 
    v-else-if="incidente && incidente.ReporteAnciID" 
    :incidente-id="incidenteId"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AcordeonIncidenteMejorado from '../components/AcordeonIncidenteMejorado.vue'
import VistaDetalleIncidenteANCI from './VistaDetalleIncidenteANCI.vue'

const router = useRouter()
const route = useRoute()
const props = defineProps({
  incidenteId: { type: [String, Number], required: false }
})

// Estado reactivo
const loading = ref(true)
const error = ref(null)
const incidente = ref({})
const empresaData = ref({})
const activeTab = ref('semilla')
const mostrandoDialogoAnci = ref(false)
const transformandoAnci = ref(false)
const datosParaEdicion = ref(null)

// Obtener ID del incidente de props o de la ruta
const incidenteId = computed(() => {
  const propId = props.incidenteId;
  const routeId = route.params.incidenteId;
  console.log(`🔍 DEBUG incidenteId computed:`, {
    propId,
    routeId,
    routePath: route.path,
    routeParams: route.params
  });
  return propId || routeId;
})

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return 'No especificada'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// Cargar datos del incidente
async function cargarIncidente() {
  loading.value = true
  error.value = null
  
  // Validar que el incidenteId existe y es válido
  const currentIncidenteId = incidenteId.value
  console.log(`🔍 Validando incidenteId:`, {
    currentIncidenteId,
    type: typeof currentIncidenteId,
    propsId: props.incidenteId,
    routeId: route.params.incidenteId
  });
  
  if (!currentIncidenteId || currentIncidenteId === 'undefined' || currentIncidenteId === undefined) {
    const errorMessage = `ID de incidente no válido. Props: ${props.incidenteId}, Route: ${route.params.incidenteId}`;
    error.value = errorMessage;
    loading.value = false;
    console.error('❌ Error: incidenteId es undefined o inválido:', {
      currentIncidenteId,
      props: props.incidenteId,
      routeParams: route.params.incidenteId,
      routePath: route.path
    });
    return;
  }
  
  try {
    console.log('🔍 Cargando incidente con ID:', currentIncidenteId)
    
    // Agregar token de autenticación
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }
    
    const response = await fetch(`http://localhost:5002/api/incidente/${currentIncidenteId}/cargar_completo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      console.error('Error en la respuesta:', response.status, response.statusText)
      throw new Error(`Error ${response.status}: No se pudo cargar el incidente`)
    }
    
    const respuesta = await response.json()
    console.log('📦 Respuesta del servidor:', respuesta)
    
    // El endpoint cargar_completo devuelve { success: true, incidente: {...} }
    const data = respuesta.incidente || respuesta
    incidente.value = data
    
    // Debug de campos CSIRT
    console.log('🔍 Campos CSIRT recibidos:', {
      SolicitarCSIRT: data.SolicitarCSIRT,
      TipoApoyoCSIRT: data.TipoApoyoCSIRT,
      UrgenciaCSIRT: data.UrgenciaCSIRT,
      ObservacionesCSIRT: data.ObservacionesCSIRT
    })
    
    // Cargar datos de la empresa si existe EmpresaID
    if (data.EmpresaID) {
      try {
        const empresaResponse = await fetch(`http://localhost:5000/api/admin/empresas/${data.EmpresaID}`)
        if (empresaResponse.ok) {
          empresaData.value = await empresaResponse.json()
        }
      } catch (empresaErr) {
        console.error('Error al cargar datos de la empresa:', empresaErr)
      }
    }
    
    // Preparar datos para el formulario de edición (mapear campos de BD a campos del formulario)
    datosParaEdicion.value = {
      // Sección 1
      '1.1': data.TipoRegistro || data.TipoFlujo || 'Registro General',  // Usar el valor real de la BD
      '1.2': data.Titulo || '',
      '1.3': data.FechaDeteccion ? new Date(data.FechaDeteccion).toISOString().slice(0, 16) : '',
      '1.4': data.FechaOcurrencia ? new Date(data.FechaOcurrencia).toISOString().slice(0, 16) : '',
      '1.5': data.Criticidad || '',
      '1.6': data.AlcanceGeografico || '',
      
      // Campos CSIRT
      '1.7.solicitar_csirt': data.SolicitarCSIRT || false,
      '1.7.tipo_apoyo': data.TipoApoyoCSIRT || '',
      '1.7.urgencia': data.UrgenciaCSIRT || '',
      '1.7.observaciones_csirt': data.ObservacionesCSIRT || '',
      
      // Sección 2
      '2.1': data.DescripcionInicial || '',
      '2.2': data.AnciImpactoPreliminar || '',
      '2.3': data.SistemasAfectados || '',
      '2.4': data.ServiciosInterrumpidos || '',
      
      // Sección 3
      '3.1': data.OrigenIncidente || '',
      '3.2': data.AnciTipoAmenaza || '',
      '3.3': data.ResponsableCliente || '',
      
      // Sección 4 - Taxonomías (se cargarán aparte)
      taxonomias_seleccionadas: data.taxonomias_seleccionadas || [],
      
      // Sección 5
      '5.1': data.AccionesInmediatas || '',
      
      // Sección 6
      '6.1': data.CausaRaiz || '',
      '6.2': data.LeccionesAprendidas || '',
      '6.3': data.PlanMejora || '',
      
      // Archivos (se manejarán aparte)
      archivos: data.archivos || {},
      // También pasar los archivos con el nombre que espera el componente
      archivos_existentes: data.archivos || {},
      
      // IMPORTANTE: Incluir las taxonomías seleccionadas
      taxonomias_seleccionadas: data.taxonomias_seleccionadas || [],
      
      // Incluir evidencias de taxonomías si existen
      evidencias_taxonomias: data.evidencias_taxonomias || {}
    }
    
    console.log('Incidente cargado:', data)
    console.log('Empresa cargada:', empresaData.value)
    console.log('Datos preparados para edición:', datosParaEdicion.value)
  } catch (err) {
    console.error('Error al cargar incidente con cargar_completo:', err)
    
    // Intentar con el endpoint antiguo como fallback
    try {
      console.log('⚠️ Intentando con endpoint antiguo...')
      const response = await fetch(`http://localhost:5000/api/admin/incidentes/${currentIncidenteId}`)
      
      if (!response.ok) {
        throw new Error('También falló el endpoint antiguo')
      }
      
      const data = await response.json()
      incidente.value = data
      
      // Preparar datos para edición con el formato antiguo
      datosParaEdicion.value = {
        // Sección 1
        '1.1': data.TipoRegistro || data.TipoFlujo || 'Registro General',
        '1.2': data.Titulo || '',
        '1.3': data.FechaDeteccion ? new Date(data.FechaDeteccion).toISOString().slice(0, 16) : '',
        '1.4': data.FechaOcurrencia ? new Date(data.FechaOcurrencia).toISOString().slice(0, 16) : '',
        '1.5': data.Criticidad || '',
        '1.6': data.AlcanceGeografico || '',
        
        // Campos CSIRT
        '1.7.solicitar_csirt': data.SolicitarCSIRT || false,
        '1.7.tipo_apoyo': data.TipoApoyoCSIRT || '',
        '1.7.urgencia': data.UrgenciaCSIRT || '',
        '1.7.observaciones_csirt': data.ObservacionesCSIRT || '',
        
        // Sección 2
        '2.1': data.DescripcionInicial || '',
        '2.2': data.AnciImpactoPreliminar || '',
        '2.3': data.SistemasAfectados || '',
        '2.4': data.ServiciosInterrumpidos || '',
        
        // Sección 3
        '3.1': data.OrigenIncidente || '',
        '3.2': data.AnciTipoAmenaza || '',
        '3.3': data.ResponsableCliente || '',
        
        // Sección 5
        '5.1': data.AccionesInmediatas || '',
        
        // Sección 6
        '6.1': data.CausaRaiz || '',
        '6.2': data.LeccionesAprendidas || '',
        '6.3': data.PlanMejora || '',
        
        // Archivos
        archivos: data.archivos || {},
        archivos_existentes: data.archivos || {},
        
        // Taxonomías vacías porque el endpoint antiguo no las incluye
        taxonomias_seleccionadas: [],
        evidencias_taxonomias: {}
      }
      
      console.warn('⚠️ Usando endpoint antiguo - Las taxonomías no se cargarán')
      error.value = null
      
    } catch (fallbackErr) {
      console.error('Error también con endpoint antiguo:', fallbackErr)
      error.value = 'Error al cargar los datos del incidente'
    }
  } finally {
    loading.value = false
  }
}

// Volver a la lista de incidentes
function volver() {
  // Usar los datos del incidente si no están en la ruta
  const inquilinoId = route.params.inquilinoId || incidente.value?.InquilinoID || 1
  const empresaId = route.params.empresaId || incidente.value?.EmpresaID
  
  if (empresaId) {
    router.push({ 
      name: 'VistaListaIncidentes', 
      params: { 
        inquilinoId: inquilinoId.toString(), 
        empresaId: empresaId.toString() 
      } 
    })
  } else {
    // Fallback al dashboard si no hay empresa
    router.push({ name: 'Dashboard' })
  }
}

// Guardar cambios en el incidente
function guardarCambios(resultado) {
  console.log('✅ Incidente guardado desde vista detalle:', resultado)
  // Recargar datos
  cargarIncidente()
}

function onError(error) {
  console.error('❌ Error en formulario:', error)
  alert(`Error: ${error.message || error}`)
}

// Función legacy para compatibilidad
async function guardarCambiosLegacy({ formData, evidencias }) {
  try {
    console.log('Guardando cambios:', formData)
    
    const currentIncidenteId = incidenteId.value
    if (!currentIncidenteId) {
      alert('Error: No se puede guardar, ID de incidente no válido')
      return
    }
    
    // Actualizar el incidente
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${currentIncidenteId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    })
    
    if (!response.ok) throw new Error('Error al guardar cambios')
    
    // Subir evidencias si existen
    if (evidencias && Object.keys(evidencias).length > 0) {
      console.log(`📎 Subiendo evidencias para incidente ${currentIncidenteId}:`, evidencias);
      
      for (const seccion in evidencias) {
        const files = evidencias[seccion];
        if (files && files.length > 0) {
          console.log(`📎 Subiendo ${files.length} archivos para sección: ${seccion}`);
          
          for (const file of files) {
            try {
              // Validar archivo antes de subirlo
              if (file.size > 50 * 1024 * 1024) {
                console.error(`❌ Archivo demasiado grande: ${file.name} (${file.size} bytes)`);
                continue;
              }
              
              const evidenciaFormData = new FormData();
              evidenciaFormData.append('file', file);
              evidenciaFormData.append('seccion', seccion);
              evidenciaFormData.append('comentario', `Evidencia para ${seccion}`);

              console.log(`📎 Subiendo archivo: ${file.name} (${file.size} bytes)`);
              
              const token = localStorage.getItem('token');
              const response = await fetch(`http://localhost:5000/api/admin/incidentes/${currentIncidenteId}/evidencia`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: evidenciaFormData
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ Error subiendo ${file.name}:`, errorData);
                throw new Error(`Error ${response.status}: ${errorData.error || 'Error desconocido'}`);
              }
              
              const result = await response.json();
              console.log(`✅ Archivo subido exitosamente: ${file.name}`, result);
              
            } catch (fileError) {
              console.error(`❌ Error subiendo archivo ${file.name}:`, fileError);
              // Continuar con otros archivos en lugar de fallar completamente
            }
          }
        }
      }
    } else {
      console.log('📎 No hay evidencias para subir');
    }
    
    alert('Cambios guardados exitosamente')
    await cargarIncidente() // Recargar datos
    
  } catch (err) {
    console.error('Error al guardar:', err)
    alert('Error al guardar cambios: ' + err.message)
  }
}

// Mostrar diálogo de confirmación para transformación ANCI
function mostrarDialogoTransformacionAnci() {
  mostrandoDialogoAnci.value = true
}

// Abrir diálogo de transformar a ANCI
function abrirDialogoTransformarAnci() {
  mostrandoDialogoAnci.value = true
}

// Cancelar transformación a ANCI
function cancelarTransformacionAnci() {
  mostrandoDialogoAnci.value = false
}

// Confirmar transformación a ANCI
async function confirmarTransformacionAnci() {
  transformandoAnci.value = true
  
  try {
    const currentIncidenteId = incidenteId.value
    if (!currentIncidenteId) {
      alert('Error: No se puede transformar, ID de incidente no válido')
      return
    }
    
    // Obtener token de autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }
    
    // Validar que el incidente tenga todos los campos requeridos
    const validacionResponse = await fetch(`http://localhost:5000/api/admin/incidentes/${currentIncidenteId}/validar-para-anci`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!validacionResponse.ok) {
      let errorMessage = 'Error en la validación'
      try {
        const errorData = await validacionResponse.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        console.error('Error parseando respuesta:', e)
      }
      throw new Error(errorMessage)
    }
    
    // Transformar a ANCI
    const transformResponse = await fetch(`http://localhost:5000/api/admin/incidentes/${currentIncidenteId}/transformar-a-anci`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!transformResponse.ok) {
      const errorData = await transformResponse.json()
      throw new Error(errorData.error || 'Error al transformar a ANCI')
    }
    
    const result = await transformResponse.json()
    alert('Incidente transformado a ANCI exitosamente')
    
    // Recargar datos y cerrar diálogo
    mostrandoDialogoAnci.value = false
    await cargarIncidente()
    
  } catch (err) {
    console.error('Error al transformar a ANCI:', err)
    alert('Error al transformar a ANCI: ' + err.message)
  } finally {
    transformandoAnci.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('🔧 VistaDetalleIncidente montado con props:', {
    propsIncidenteId: props.incidenteId,
    routeIncidenteId: route.params.incidenteId,
    computedIncidenteId: incidenteId.value,
    routePath: route.path,
    routeParams: route.params,
    routeName: route.name
  })
  cargarIncidente()
})

// Watcher para recargar cuando cambie el ID del incidente
watch(() => incidenteId.value, (newId, oldId) => {
  console.log(`🔄 IncidenteId cambió: ${oldId} → ${newId}`);
  if (newId && newId !== oldId) {
    cargarIncidente();
  }
}, { immediate: false })

// Watcher para los parámetros de la ruta
watch(() => route.params.incidenteId, (newId, oldId) => {
  console.log(`🔄 Route params incidenteId cambió: ${oldId} → ${newId}`);
}, { immediate: false })
</script>

<style scoped>
.vista-normal {
  min-height: 100vh;
  background-color: #0f172a;
  color: white;
  padding: 2rem;
}

.vista-anci {
  min-height: 100vh;
  background-color: #0f172a;
  color: white;
  padding: 2rem;
}

.header-con-navegacion {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #374151;
  color: #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
}

.btn-volver:hover {
  background-color: #4b5563;
}

.header-row-superior {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.btn-transformar-anci {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-transformar-anci:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-transformar-anci i {
  font-size: 1.2rem;
}

.btn-volver i {
  font-size: 1.25rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-anci {
  background-color: #dc2626;
  color: white;
}

.badge-normal {
  background-color: #059669;
  color: white;
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

.reporte-anci-placeholder,
.seguimiento-plazos-placeholder {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  background-color: #1e293b;
  border-radius: 0.5rem;
  border: 1px dashed #334155;
}

.reporte-anci-placeholder h3,
.seguimiento-plazos-placeholder h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
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

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.modal-text {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.modal-plazos {
  background-color: #0f172a;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  margin-bottom: 1.5rem;
}

.plazo-info {
  color: #e2e8f0;
}

.plazo-info strong {
  color: #f59e0b;
}

.plazo-info ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.plazo-info li {
  margin: 0.25rem 0;
  color: #cbd5e1;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: #374151;
  color: #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn-danger:disabled {
  background-color: #6b7280;
  cursor: not-allowed;
}

.error-banner {
  background-color: #7f1d1d;
  border: 1px solid #dc2626;
  color: #fecaca;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
}

.error-banner i {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}
</style>
