<template>
  <div class="seccion-csirt">
    <!-- Header de la sección -->
    <div class="seccion-header d-flex align-items-center justify-content-between">
      <h5 class="mb-0">
        <i class="fas fa-shield-alt me-2"></i>
        Solicitud de Asistencia CSIRT
      </h5>
      <span class="badge" :class="getBadgeClass()">
        {{ datosCSIRT.solicitarAyuda ? 'Ayuda Solicitada' : 'Sin Solicitud' }}
      </span>
    </div>

    <!-- Descripción informativa -->
    <div class="alert alert-info mt-3">
      <i class="fas fa-info-circle me-2"></i>
      <strong>CSIRT Nacional</strong>
      <p class="mb-0 mt-1">
        El Computer Security Incident Response Team (CSIRT) proporciona asistencia especializada 
        en la gestión de incidentes de ciberseguridad críticos.
      </p>
    </div>

    <!-- Checkbox principal -->
    <div class="form-check form-switch mb-4">
      <input 
        v-model="datosCSIRT.solicitarAyuda" 
        type="checkbox" 
        class="form-check-input" 
        id="solicitarAyudaCSIRT"
        @change="onToggleAyuda">
      <label class="form-check-label" for="solicitarAyudaCSIRT">
        <strong>Solicitar asistencia del CSIRT Nacional para este incidente</strong>
      </label>
    </div>

    <!-- Campos adicionales si se solicita ayuda -->
    <div v-if="datosCSIRT.solicitarAyuda" class="campos-csirt">
      
      <!-- Tipo de Ayuda -->
      <div class="mb-3">
        <label class="form-label">
          Tipo de Asistencia Requerida <span class="text-danger">*</span>
        </label>
        <select 
          v-model="datosCSIRT.tipoAyuda" 
          class="form-select"
          required>
          <option value="">Seleccione el tipo de ayuda</option>
          <option value="Análisis Forense">Análisis Forense</option>
          <option value="Contención del Incidente">Contención del Incidente</option>
          <option value="Asesoría Técnica">Asesoría Técnica</option>
          <option value="Coordinación de Respuesta">Coordinación de Respuesta</option>
          <option value="Recuperación de Sistemas">Recuperación de Sistemas</option>
          <option value="Análisis de Malware">Análisis de Malware</option>
          <option value="Otro">Otro (especificar en descripción)</option>
        </select>
      </div>

      <!-- Descripción de la Ayuda -->
      <div class="mb-3">
        <label class="form-label">
          Descripción de la Asistencia Solicitada <span class="text-danger">*</span>
        </label>
        <textarea 
          v-model="datosCSIRT.descripcionAyuda" 
          class="form-control" 
          rows="4"
          placeholder="Describa detalladamente qué tipo de asistencia necesita del CSIRT..."
          required>
        </textarea>
        <div class="form-text">
          Sea específico sobre las necesidades técnicas y el alcance de la asistencia requerida.
        </div>
      </div>

      <!-- Información de Contacto -->
      <div class="mb-3">
        <label class="form-label">
          Contacto de Emergencia para CSIRT <span class="text-danger">*</span>
        </label>
        <input 
          v-model="datosCSIRT.contacto" 
          type="text" 
          class="form-control"
          placeholder="Nombre, teléfono y email del contacto principal"
          required>
        <div class="form-text">
          Proporcione los datos de la persona que será el punto de contacto con el CSIRT.
        </div>
      </div>

      <!-- Criticidad específica para CSIRT -->
      <div class="mb-3">
        <label class="form-label">Nivel de Urgencia para CSIRT</label>
        <div class="btn-group w-100" role="group">
          <input 
            v-model="datosCSIRT.urgencia" 
            type="radio" 
            class="btn-check" 
            value="Inmediata" 
            id="urgenciaInmediata">
          <label class="btn btn-outline-danger" for="urgenciaInmediata">
            <i class="fas fa-fire me-1"></i>
            Inmediata
          </label>

          <input 
            v-model="datosCSIRT.urgencia" 
            type="radio" 
            class="btn-check" 
            value="Alta" 
            id="urgenciaAlta">
          <label class="btn btn-outline-warning" for="urgenciaAlta">
            <i class="fas fa-exclamation-triangle me-1"></i>
            Alta
          </label>

          <input 
            v-model="datosCSIRT.urgencia" 
            type="radio" 
            class="btn-check" 
            value="Media" 
            id="urgenciaMedia">
          <label class="btn btn-outline-info" for="urgenciaMedia">
            <i class="fas fa-clock me-1"></i>
            Media
          </label>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="card bg-light">
        <div class="card-body">
          <h6 class="card-title">
            <i class="fas fa-phone-alt me-2"></i>
            Información de Contacto CSIRT Nacional
          </h6>
          <p class="mb-1"><strong>Teléfono 24/7:</strong> +56 2 2486 3850</p>
          <p class="mb-1"><strong>Email:</strong> soc@csirt.gob.cl</p>
          <p class="mb-0"><strong>Web:</strong> 
            <a href="https://www.csirt.gob.cl" target="_blank">www.csirt.gob.cl</a>
          </p>
        </div>
      </div>

      <!-- Estado de la Solicitud (solo lectura si ya existe) -->
      <div v-if="datosCSIRT.estadoSolicitud" class="mt-3">
        <label class="form-label">Estado de la Solicitud</label>
        <div class="input-group">
          <span class="input-group-text" :class="getEstadoClass()">
            <i :class="getEstadoIcon()"></i>
          </span>
          <input 
            :value="datosCSIRT.estadoSolicitud" 
            type="text" 
            class="form-control" 
            readonly>
        </div>
      </div>

      <!-- Respuesta del CSIRT (si existe) -->
      <div v-if="datosCSIRT.respuestaCSIRT" class="mt-3">
        <label class="form-label">Respuesta del CSIRT</label>
        <div class="card">
          <div class="card-body">
            <p class="mb-0">{{ datosCSIRT.respuestaCSIRT }}</p>
            <small class="text-muted">
              Fecha: {{ formatearFecha(datosCSIRT.fechaRespuesta) }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeccionCSIRT',
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      datosCSIRT: {
        solicitarAyuda: false,
        tipoAyuda: '',
        descripcionAyuda: '',
        contacto: '',
        urgencia: 'Media',
        estadoSolicitud: '',
        respuestaCSIRT: '',
        fechaSolicitud: null,
        fechaRespuesta: null
      }
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(nuevosValores) {
        if (nuevosValores && Object.keys(nuevosValores).length > 0) {
          this.datosCSIRT = { ...this.datosCSIRT, ...nuevosValores }
        }
      }
    },
    datosCSIRT: {
      deep: true,
      handler(valor) {
        this.$emit('update:modelValue', valor)
      }
    }
  },
  methods: {
    onToggleAyuda() {
      if (this.datosCSIRT.solicitarAyuda && !this.datosCSIRT.fechaSolicitud) {
        this.datosCSIRT.fechaSolicitud = new Date().toISOString()
      }
      
      // Limpiar campos si se desmarca
      if (!this.datosCSIRT.solicitarAyuda) {
        this.datosCSIRT.tipoAyuda = ''
        this.datosCSIRT.descripcionAyuda = ''
        this.datosCSIRT.contacto = ''
        this.datosCSIRT.urgencia = 'Media'
      }
    },
    
    getBadgeClass() {
      if (!this.datosCSIRT.solicitarAyuda) return 'bg-secondary'
      if (this.datosCSIRT.estadoSolicitud === 'Completada') return 'bg-success'
      if (this.datosCSIRT.estadoSolicitud === 'En Proceso') return 'bg-warning'
      if (this.datosCSIRT.estadoSolicitud === 'Rechazada') return 'bg-danger'
      return 'bg-info'
    },
    
    getEstadoClass() {
      const estado = this.datosCSIRT.estadoSolicitud
      if (estado === 'Completada') return 'bg-success text-white'
      if (estado === 'En Proceso') return 'bg-warning'
      if (estado === 'Rechazada') return 'bg-danger text-white'
      return 'bg-info text-white'
    },
    
    getEstadoIcon() {
      const estado = this.datosCSIRT.estadoSolicitud
      if (estado === 'Completada') return 'fas fa-check-circle'
      if (estado === 'En Proceso') return 'fas fa-spinner fa-spin'
      if (estado === 'Rechazada') return 'fas fa-times-circle'
      return 'fas fa-clock'
    },
    
    formatearFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleString('es-ES')
    },
    
    validar() {
      if (!this.datosCSIRT.solicitarAyuda) return true
      
      const camposRequeridos = ['tipoAyuda', 'descripcionAyuda', 'contacto']
      const camposFaltantes = camposRequeridos.filter(campo => !this.datosCSIRT[campo])
      
      if (camposFaltantes.length > 0) {
        this.$swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor complete todos los campos requeridos para la solicitud CSIRT'
        })
        return false
      }
      
      return true
    }
  }
}
</script>

<style scoped>
.seccion-csirt {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.seccion-header {
  padding-bottom: 15px;
  border-bottom: 2px solid #dee2e6;
}

.campos-csirt {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-check-input:checked {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-group label {
  font-size: 0.9rem;
}

.card {
  border: 1px solid #dee2e6;
}
</style>