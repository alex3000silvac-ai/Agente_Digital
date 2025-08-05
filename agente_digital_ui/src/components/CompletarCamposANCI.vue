<template>
  <div class="completar-campos-anci">
    <div class="card">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Completar Campos ANCI
        </h5>
      </div>
      
      <div class="card-body">
        <!-- Alerta informativa -->
        <div class="alert alert-info mb-4">
          <i class="fas fa-info-circle me-2"></i>
          <strong>Campos necesarios para generar el informe ANCI</strong>
          <p class="mb-0 mt-2">
            Los siguientes campos son requeridos por la plantilla oficial ANCI. 
            Por favor, complételos antes de generar el informe.
          </p>
        </div>

        <!-- Indicador de progreso -->
        <div class="mb-4">
          <div class="d-flex justify-content-between mb-2">
            <span>Completitud del incidente</span>
            <span class="fw-bold">{{ porcentajeCompletitud }}%</span>
          </div>
          <div class="progress" style="height: 25px;">
            <div 
              class="progress-bar" 
              :class="getProgressClass()"
              :style="{ width: porcentajeCompletitud + '%' }">
              {{ porcentajeCompletitud }}%
            </div>
          </div>
        </div>

        <!-- Campos faltantes o vacíos -->
        <div v-if="camposFaltantes.length > 0 || camposVacios.length > 0" class="alert alert-warning">
          <h6>Campos incompletos:</h6>
          <ul class="mb-0">
            <li v-for="campo in camposFaltantes" :key="campo">
              {{ campo }} <span class="badge bg-danger">Faltante</span>
            </li>
            <li v-for="campo in camposVacios" :key="campo">
              {{ campo }} <span class="badge bg-warning text-dark">Vacío</span>
            </li>
          </ul>
        </div>

        <!-- Formulario de campos ANCI -->
        <form @submit.prevent="guardarCampos">
          <h6 class="mb-3">Información específica ANCI</h6>
          
          <!-- Estado del Incidente -->
          <div class="mb-3">
            <label class="form-label">
              Estado del Incidente <span class="text-danger">*</span>
            </label>
            <select 
              v-model="datosAnci.estadoActual" 
              class="form-select"
              :class="{ 'is-invalid': !datosAnci.estadoActual }"
              required>
              <option value="">Seleccione un estado</option>
              <option value="Activo">Activo</option>
              <option value="En Investigación">En Investigación</option>
              <option value="Contenido">Contenido</option>
              <option value="Erradicado">Erradicado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
            <div class="form-text">
              Estado actual del incidente según el proceso de gestión
            </div>
          </div>

          <!-- ID Reporte ANCI -->
          <div class="mb-3">
            <label class="form-label">ID Reporte ANCI</label>
            <input 
              v-model="datosAnci.reporteAnciId" 
              type="text" 
              class="form-control"
              placeholder="Ej: ANCI-2024-001">
            <div class="form-text">
              Identificador único asignado por ANCI (dejar vacío si aún no se ha reportado)
            </div>
          </div>

          <!-- Fecha Declaración ANCI -->
          <div class="mb-3">
            <label class="form-label">Fecha de Declaración ANCI</label>
            <input 
              v-model="datosAnci.fechaDeclaracionAnci" 
              type="datetime-local" 
              class="form-control">
            <div class="form-text">
              Fecha y hora en que se declaró el incidente a ANCI
            </div>
          </div>

          <!-- Información adicional (solo lectura) -->
          <div class="card bg-light mb-3">
            <div class="card-body">
              <h6 class="card-title">Información del contexto</h6>
              <div class="row">
                <div class="col-md-6">
                  <p class="mb-1"><strong>ID Incidente:</strong> {{ datosActuales.idVisible || incidenteId }}</p>
                  <p class="mb-1"><strong>Empresa ID:</strong> {{ datosActuales.empresaId }}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1"><strong>Tipo Empresa:</strong> 
                    <span class="badge" :class="getBadgeTipoEmpresa()">
                      {{ datosActuales.tipoEmpresa }}
                    </span>
                  </p>
                  <p class="mb-1"><strong>Fecha Detección:</strong> {{ formatearFecha(datosActuales.fechaDeteccion) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="$emit('cancelar')">
              <i class="fas fa-times me-2"></i>
              Cancelar
            </button>
            
            <div>
              <button 
                type="button" 
                class="btn btn-info me-2"
                @click="validarCampos"
                :disabled="validando">
                <i class="fas fa-check-circle me-2"></i>
                Validar Campos
              </button>
              
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="guardando">
                <span v-if="guardando">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Guardando...
                </span>
                <span v-else>
                  <i class="fas fa-save me-2"></i>
                  Guardar y Continuar
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CompletarCamposANCI',
  props: {
    incidenteId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      datosAnci: {
        estadoActual: '',
        reporteAnciId: '',
        fechaDeclaracionAnci: ''
      },
      datosActuales: {},
      porcentajeCompletitud: 0,
      camposFaltantes: [],
      camposVacios: [],
      guardando: false,
      validando: false,
      listoParaAnci: false
    }
  },
  mounted() {
    this.validarCampos()
  },
  methods: {
    async validarCampos() {
      try {
        this.validando = true
        const response = await axios.get(`/api/incidente/${this.incidenteId}/validar-anci`)
        
        if (response.data) {
          this.porcentajeCompletitud = response.data.porcentaje_completitud
          this.camposFaltantes = response.data.campos_faltantes || []
          this.camposVacios = response.data.campos_vacios || []
          this.listoParaAnci = response.data.listo_para_anci
          this.datosActuales = response.data.datos_actuales || {}
          
          // Prellenar campos si existen
          if (this.datosActuales.estadoActual) {
            this.datosAnci.estadoActual = this.datosActuales.estadoActual
          }
          if (this.datosActuales.reporteAnciId) {
            this.datosAnci.reporteAnciId = this.datosActuales.reporteAnciId
          }
          if (this.datosActuales.fechaDeclaracionAnci) {
            // Convertir a formato datetime-local
            const fecha = new Date(this.datosActuales.fechaDeclaracionAnci)
            this.datosAnci.fechaDeclaracionAnci = fecha.toISOString().slice(0, 16)
          }
        }
      } catch (error) {
        console.error('Error validando campos:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron validar los campos del incidente'
        })
      } finally {
        this.validando = false
      }
    },
    
    async guardarCampos() {
      try {
        this.guardando = true
        
        // Validar al menos el estado
        if (!this.datosAnci.estadoActual) {
          this.$swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'El estado del incidente es obligatorio'
          })
          return
        }
        
        const response = await axios.put(
          `/api/incidente/${this.incidenteId}/campos-anci`,
          this.datosAnci
        )
        
        if (response.data.success) {
          this.$swal.fire({
            icon: 'success',
            title: 'Campos actualizados',
            text: 'Los campos ANCI se han guardado correctamente'
          })
          
          // Validar nuevamente para actualizar el estado
          await this.validarCampos()
          
          // Si está listo, emitir evento
          if (this.listoParaAnci) {
            this.$emit('camposCompletados', this.datosAnci)
          }
        }
      } catch (error) {
        console.error('Error guardando campos:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los campos ANCI'
        })
      } finally {
        this.guardando = false
      }
    },
    
    getProgressClass() {
      if (this.porcentajeCompletitud < 50) return 'bg-danger'
      if (this.porcentajeCompletitud < 80) return 'bg-warning'
      if (this.porcentajeCompletitud < 100) return 'bg-info'
      return 'bg-success'
    },
    
    getBadgeTipoEmpresa() {
      const tipo = this.datosActuales.tipoEmpresa
      return {
        'bg-primary': tipo === 'OIV',
        'bg-info': tipo === 'PSE',
        'bg-success': tipo === 'AMBAS'
      }
    },
    
    formatearFecha(fecha) {
      if (!fecha) return 'N/A'
      return new Date(fecha).toLocaleString('es-ES')
    }
  }
}
</script>

<style scoped>
.completar-campos-anci {
  max-width: 800px;
  margin: 0 auto;
}

.progress {
  background-color: #e9ecef;
}

.card {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>