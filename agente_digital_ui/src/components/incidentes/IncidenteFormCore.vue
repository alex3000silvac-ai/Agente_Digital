<template>
  <div class="incidente-form-core">
    <!-- Header con información del incidente -->
    <div v-if="!esNuevo" class="info-incidente-panel">
      <div class="info-grid">
        <div class="info-item">
          <i class="ph ph-hash"></i>
          <span class="label">ID:</span>
          <span class="value">#{{ incidente.IncidenteID }}</span>
        </div>
        <div class="info-item">
          <i class="ph ph-user"></i>
          <span class="label">Creado por:</span>
          <span class="value">{{ incidente.CreadoPor || 'Sistema' }}</span>
        </div>
        <div class="info-item">
          <i class="ph ph-calendar"></i>
          <span class="label">Fecha creación:</span>
          <span class="value">{{ formatearFecha(incidente.FechaCreacion) }}</span>
        </div>
        <div class="info-item">
          <i class="ph ph-flag"></i>
          <span class="label">Estado:</span>
          <span class="value badge" :class="'estado-' + incidente.EstadoActual?.toLowerCase()">
            {{ incidente.EstadoActual }}
          </span>
        </div>
      </div>
    </div>

    <!-- Formulario de datos básicos -->
    <div class="form-section">
      <h3 class="section-title">
        <i class="ph ph-identification-badge"></i>
        Identificación del Incidente
      </h3>
      
      <div class="form-grid">
        <!-- Tipo de Flujo -->
        <div class="form-group">
          <label class="form-label">
            Tipo de Registro
            <span class="helper-text">Define el flujo del incidente</span>
          </label>
          <select v-model="incidente.TipoFlujo" class="form-select">
            <option value="Informativo">Informativo (Registro simple)</option>
            <option value="Interno">Interno (Gestión completa)</option>
          </select>
        </div>

        <!-- Criticidad -->
        <div class="form-group">
          <label class="form-label">
            Criticidad
            <span class="helper-text">Nivel de impacto del incidente</span>
          </label>
          <select v-model="incidente.Criticidad" class="form-select">
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Critica">Crítica</option>
          </select>
        </div>

        <!-- Título -->
        <div class="form-group col-span-2">
          <label class="form-label">
            Título del Incidente
            <span class="required">*</span>
          </label>
          <input 
            v-model="incidente.Titulo" 
            type="text" 
            class="form-input"
            placeholder="Descripción breve y clara del incidente"
            maxlength="200"
          >
          <span class="char-count">{{ incidente.Titulo?.length || 0 }}/200</span>
        </div>

        <!-- Fecha Detección -->
        <div class="form-group">
          <label class="form-label">
            Fecha y Hora de Detección
            <span class="required">*</span>
          </label>
          <input 
            v-model="incidente.FechaDeteccion" 
            type="datetime-local" 
            class="form-input"
            :max="fechaMaxima"
          >
        </div>

        <!-- Fecha Ocurrencia -->
        <div class="form-group">
          <label class="form-label">
            Fecha y Hora de Ocurrencia
            <span class="helper-text">Si se conoce</span>
          </label>
          <input 
            v-model="incidente.FechaOcurrencia" 
            type="datetime-local" 
            class="form-input"
            :max="fechaMaxima"
          >
        </div>

        <!-- Origen del Incidente -->
        <div class="form-group col-span-2">
          <label class="form-label">
            Origen del Incidente
            <span class="required">*</span>
          </label>
          <select v-model="incidente.OrigenIncidente" class="form-select">
            <option value="">Seleccionar origen</option>
            <option value="Monitoreo interno">Monitoreo interno</option>
            <option value="Reporte usuario">Reporte de usuario</option>
            <option value="Alerta automatica">Alerta automática</option>
            <option value="Auditoria">Auditoría</option>
            <option value="Proveedor externo">Proveedor externo</option>
            <option value="Entidad reguladora">Entidad reguladora</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <!-- Descripción Inicial -->
        <div class="form-group col-span-2">
          <label class="form-label">
            Descripción Inicial
            <span class="required">*</span>
          </label>
          <textarea 
            v-model="incidente.DescripcionInicial" 
            class="form-textarea"
            rows="4"
            placeholder="Descripción detallada de lo ocurrido, incluyendo contexto y primeras observaciones"
          ></textarea>
        </div>

        <!-- Sistemas Afectados -->
        <div class="form-group col-span-2">
          <label class="form-label">
            Sistemas Afectados
            <span class="required">*</span>
          </label>
          <textarea 
            v-model="incidente.SistemasAfectados" 
            class="form-textarea"
            rows="3"
            placeholder="Lista de sistemas, aplicaciones o servicios afectados"
          ></textarea>
        </div>

        <!-- Acciones Inmediatas -->
        <div class="form-group col-span-2">
          <label class="form-label">
            Acciones Inmediatas Tomadas
            <span class="required">*</span>
          </label>
          <textarea 
            v-model="incidente.AccionesInmediatas" 
            class="form-textarea"
            rows="3"
            placeholder="Medidas de contención o mitigación aplicadas"
          ></textarea>
        </div>

        <!-- Responsable Cliente -->
        <div class="form-group">
          <label class="form-label">
            Responsable del Cliente
          </label>
          <input 
            v-model="incidente.ResponsableCliente" 
            type="text" 
            class="form-input"
            placeholder="Nombre del responsable"
          >
        </div>

        <!-- Alcance Geográfico -->
        <div class="form-group">
          <label class="form-label">
            Alcance Geográfico
          </label>
          <select v-model="incidente.AlcanceGeografico" class="form-select">
            <option value="">Sin definir</option>
            <option value="Local">Local (Una ubicación)</option>
            <option value="Regional">Regional (Múltiples ubicaciones)</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Sección ANCI (solo si es relevante) -->
    <div v-if="mostrarCamposAnci" class="form-section">
      <h3 class="section-title">
        <i class="ph ph-buildings"></i>
        Información ANCI
      </h3>
      
      <div class="form-grid">
        <!-- Servicios Interrumpidos -->
        <div class="form-group col-span-2">
          <label class="form-label">
            Servicios Esenciales Interrumpidos
          </label>
          <textarea 
            v-model="incidente.ServiciosInterrumpidos" 
            class="form-textarea"
            rows="2"
            placeholder="Detallar servicios críticos afectados"
          ></textarea>
        </div>

        <!-- Impacto Preliminar -->
        <div class="form-group">
          <label class="form-label">
            Impacto Preliminar ANCI
          </label>
          <select v-model="incidente.AnciImpactoPreliminar" class="form-select">
            <option value="">Sin evaluar</option>
            <option value="Minimo">Mínimo</option>
            <option value="Menor">Menor</option>
            <option value="Moderado">Moderado</option>
            <option value="Significativo">Significativo</option>
            <option value="Severo">Severo</option>
          </select>
        </div>

        <!-- Tipo de Amenaza -->
        <div class="form-group">
          <label class="form-label">
            Tipo de Amenaza ANCI
          </label>
          <select v-model="incidente.AnciTipoAmenaza" class="form-select">
            <option value="">Sin clasificar</option>
            <option value="Malware">Malware</option>
            <option value="Phishing">Phishing</option>
            <option value="DDoS">DDoS</option>
            <option value="Acceso no autorizado">Acceso no autorizado</option>
            <option value="Fuga de informacion">Fuga de información</option>
            <option value="Error humano">Error humano</option>
            <option value="Falla tecnica">Falla técnica</option>
            <option value="Desastre natural">Desastre natural</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Barra de progreso -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: porcentajeCompletado + '%' }"></div>
      <span class="progress-text">{{ porcentajeCompletado }}% completado</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useIncidenteStore } from '@/stores/incidenteStore'

// Store
const incidenteStore = useIncidenteStore()
const { incidente, esNuevo, porcentajeCompletado } = storeToRefs(incidenteStore)

// Props
const props = defineProps({
  soloLectura: {
    type: Boolean,
    default: false
  }
})

// Computed
const fechaMaxima = computed(() => {
  return new Date().toISOString().slice(0, 16)
})

const mostrarCamposAnci = computed(() => {
  return incidente.value.TipoFlujo === 'Interno' || 
         incidente.value.ReporteAnciID
})

// Helpers
function formatearFecha(fecha) {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.incidente-form-core {
  width: 100%;
}

/* Panel de información */
.info-incidente-panel {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #475569;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
}

.info-item i {
  font-size: 1.25rem;
  color: #60a5fa;
}

.info-item .label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.info-item .value {
  font-weight: 600;
  color: #f1f5f9;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
}

.estado-abierto { background: #dc2626; }
.estado-en-proceso { background: #f59e0b; }
.estado-resuelto { background: #10b981; }
.estado-cerrado { background: #6b7280; }

/* Secciones del formulario */
.form-section {
  background: #1e293b;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid #334155;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #334155;
}

.section-title i {
  color: #60a5fa;
  font-size: 1.5rem;
}

/* Grid del formulario */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.col-span-2 {
  grid-column: span 2;
}

/* Campos del formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.helper-text {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.75rem;
}

.form-input,
.form-select,
.form-textarea {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #f1f5f9;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  font-size: 0.75rem;
  color: #94a3b8;
  text-align: right;
  margin-top: -0.25rem;
}

/* Barra de progreso */
.progress-bar {
  background: #1e293b;
  border-radius: 9999px;
  height: 2rem;
  position: relative;
  overflow: hidden;
  margin-top: 2rem;
  border: 1px solid #334155;
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #f1f5f9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .col-span-2 {
    grid-column: span 1;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Modo solo lectura */
.incidente-form-core[data-solo-lectura="true"] .form-input,
.incidente-form-core[data-solo-lectura="true"] .form-select,
.incidente-form-core[data-solo-lectura="true"] .form-textarea {
  background: #334155;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>