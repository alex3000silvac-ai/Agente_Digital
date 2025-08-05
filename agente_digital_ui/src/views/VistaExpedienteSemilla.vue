<template>
  <div class="vista-expediente-semilla">
    <!-- Header con navegación -->
    <div class="header-navegacion">
      <button @click="volver" class="btn-volver">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Gestión ANCI</span>
      </button>
      
      <div class="header-info">
        <h1 class="titulo-principal">
          <i class="ph ph-notebook"></i>
          Expediente Semilla
        </h1>
        <p class="subtitulo">
          Documento maestro del incidente - Sección 1 congelada
        </p>
      </div>
    </div>

    <!-- Alerta de sección congelada -->
    <div class="alerta-congelada" v-if="incidente.TieneReporteANCI">
      <i class="ph ph-lock"></i>
      <div class="alerta-contenido">
        <h4>Sección 1 Congelada</h4>
        <p>
          La sección "Identificación General" está bloqueada para mantener la integridad del reporte ANCI. 
          Puedes continuar editando las secciones 2 a 6.
        </p>
      </div>
    </div>

    <!-- Formulario con sección 1 deshabilitada -->
    <AcordeonIncidenteMejorado
      v-if="incidente.EmpresaID"
      :incidente-id="incidenteId"
      :empresa-id="incidente.EmpresaID"
      :inquilino-id="incidente.InquilinoID || 1"
      :modo="'editar'"
      :datos-iniciales="datosParaEdicion"
      :seccion-congelada="1"
      @incidente-guardado="guardarCambios"
    />
    
    <!-- Loading mientras se carga el incidente -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando expediente semilla...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import AcordeonIncidenteMejorado from '../components/AcordeonIncidenteMejorado.vue'
import { API_BASE_URL } from '@/config'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  incidenteId: {
    type: [String, Number],
    required: true
  }
})

// Estado
const incidente = ref({})
const datosParaEdicion = ref(null)

// Métodos
async function cargarIncidente() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No se encontró token de autenticación')
      return
    }
    
    const response = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    incidente.value = response.data
    
    // Preparar datos para edición
    prepararDatosParaEdicion(response.data)
  } catch (error) {
    console.error('Error cargando incidente:', error)
  }
}

function prepararDatosParaEdicion(data) {
  // Mapear los datos del backend al formato del formulario
  datosParaEdicion.value = {
    // Sección 1 - Identificación General (CONGELADA)
    '1.1': data.TipoRegistro || data.TipoFlujo || 'Registro General',
    '1.2': data.Titulo || '',
    '1.3': data.FechaDeteccion ? new Date(data.FechaDeteccion).toISOString().slice(0, 16) : '',
    '1.4': data.FechaOcurrencia ? new Date(data.FechaOcurrencia).toISOString().slice(0, 16) : '',
    '1.5': data.Criticidad || 'Media',
    '1.6': data.OrigenIncidente || '',
    '1.7.solicitar_csirt': data.SolicitarCSIRT || false,
    '1.7.tipo_apoyo': data.TipoApoyoCSIRT || '',
    '1.7.urgencia': data.UrgenciaCSIRT || '',
    '1.7.observaciones_csirt': data.ObservacionesCSIRT || '',
    
    // Sección 2 - Descripción y Alcance (EDITABLE)
    '2.1': data.DescripcionBreve || '',
    '2.2': data.SistemasAfectados || '',
    '2.3': data.UsuariosAfectados || '',
    '2.4': data.TiempoIncidencia || '',
    '2.5': data.ImpactoPreliminar || '',
    '2.6': data.AlcanceGeografico || '',
    
    // Sección 3 - Análisis Preliminar (EDITABLE)
    '3.1': data.AnciImpactoPreliminar || '',
    '3.2': data.AnciTipoAmenaza || '',
    '3.3': data.AnciAgenteAmenaza || '',
    '3.4': data.AnciVulnerabilidadExplotada || '',
    '3.5': data.AnciDatosComprometidos || '',
    '3.6': data.AnciAfectacionTerceros || '',
    
    // Sección 4 - Acciones Inmediatas (EDITABLE)
    '4.1': data.AccionesInmediatas || '',
    '4.2': data.ResponsableCliente || '',
    '4.3': data.NivelEscalamiento || '',
    '4.4': data.MedidasContencion || '',
    '4.5': data.PlanComunicacion || '',
    '4.6': data.NotificacionesRealizadas || '',
    
    // Sección 5 - Análisis y Solución (EDITABLE)
    '5.1': data.CausaRaiz || '',
    '5.2': data.SolucionImplementada || '',
    '5.3': data.MedidasPreventivas || '',
    '5.4': data.ProximosPasos || '',
    '5.5': data.LeccionesAprendidas || '',
    '5.6': data.DocumentacionAdjunta || '',
    
    // Sección 6 - Cierre del Incidente (EDITABLE)
    '6.1': data.FechaResolucion ? new Date(data.FechaResolucion).toISOString().slice(0, 16) : '',
    '6.2': data.EstadoFinal || '',
    '6.3': data.PersonaCierre || '',
    '6.4': data.AprobacionCierre || '',
    '6.5': data.ObservacionesFinales || '',
    '6.6': data.RequiereAcciones || false,
    
    // Archivos existentes
    archivos: data.archivos || {}
  }
}

async function guardarCambios(datos) {
  try {
    console.log('Guardando cambios del expediente semilla:', datos)
    alert('Cambios guardados exitosamente')
    await cargarIncidente() // Recargar datos
  } catch (error) {
    console.error('Error al guardar:', error)
    alert('Error al guardar cambios: ' + error.message)
  }
}

function volver() {
  router.back()
}

// Lifecycle
onMounted(() => {
  cargarIncidente()
})
</script>

<style scoped>
.vista-expediente-semilla {
  min-height: 100vh;
  background: #0f172a;
  padding: 2rem;
}

/* Header */
.header-navegacion {
  margin-bottom: 2rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.btn-volver:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  transform: translateX(-4px);
}

.header-info {
  margin-bottom: 2rem;
}

.titulo-principal {
  font-size: 2rem;
  color: #e2e8f0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.titulo-principal i {
  color: #3b82f6;
}

.subtitulo {
  color: #94a3b8;
  font-size: 1rem;
}

/* Alerta de sección congelada */
.alerta-congelada {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  animation: slideIn 0.3s ease;
}

.alerta-congelada i {
  font-size: 1.5rem;
  color: #f59e0b;
  margin-top: 0.25rem;
}

.alerta-contenido h4 {
  color: #fbbf24;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.alerta-contenido p {
  color: #fde68a;
  margin: 0;
  line-height: 1.5;
}

/* Animación */
@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .titulo-principal {
    font-size: 1.5rem;
  }
  
  .alerta-congelada {
    flex-direction: column;
    text-align: center;
  }
}
</style>