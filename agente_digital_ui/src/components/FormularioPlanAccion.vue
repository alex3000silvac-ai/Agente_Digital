<template>
  <div class="formulario-plan-accion">
    <div class="formulario-header">
      <h2 class="titulo-formulario">
        <PhosphorIcon name="strategy" />
        Plan de Acción ANCI
      </h2>
      <p class="descripcion-formulario">
        Tercera etapa del reporte ANCI - Exclusivo para OIV
        <br><strong>Plazo:</strong> 7 días desde la alerta temprana
      </p>
      
      <!-- Alerta si no es OIV -->
      <div v-if="tipoEmpresa !== 'OIV'" class="alerta-tipo-empresa">
        <PhosphorIcon name="warning" />
        <span>El Plan de Acción es exclusivo para Organismos de Importancia Vital (OIV)</span>
      </div>
    </div>

    <form v-if="tipoEmpresa === 'OIV'" @submit.prevent="guardarFormulario" class="formulario-anci">
      
      <!-- Sección: Plan de Recuperación -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="arrow-clockwise" />
          Plan de Recuperación
        </h3>
        
        <div class="campo-grupo">
          <label>Programa de Restauración de Datos *</label>
          <textarea 
            v-model="formulario.plan_recuperacion.programa_restauracion_datos"
            class="campo-textarea"
            rows="4"
            placeholder="Cronograma detallado para la restauración de datos y servicios"
            required
          ></textarea>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Responsables Técnicos *</label>
            <textarea 
              v-model="formulario.plan_recuperacion.responsables_tecnicos"
              class="campo-textarea"
              rows="3"
              placeholder="Nombres y roles del personal técnico responsable"
              required
            ></textarea>
          </div>
          
          <div class="campo-grupo">
            <label>Responsables Administrativos *</label>
            <textarea 
              v-model="formulario.plan_recuperacion.responsables_administrativos"
              class="campo-textarea"
              rows="3"
              placeholder="Nombres y roles del personal administrativo responsable"
              required
            ></textarea>
          </div>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Tiempo Estimado de Restablecimiento *</label>
            <input 
              v-model.number="formulario.plan_recuperacion.tiempo_estimado_restablecimiento"
              type="number"
              class="campo-input"
              min="1"
              placeholder="Horas para restablecimiento completo"
              required
            />
            <small class="campo-ayuda">Tiempo en horas para el restablecimiento completo de servicios</small>
          </div>
          
          <div class="campo-grupo">
            <label>Recursos Necesarios *</label>
            <textarea 
              v-model="formulario.plan_recuperacion.recursos_necesarios"
              class="campo-textarea"
              rows="2"
              placeholder="Recursos humanos, tecnológicos y financieros requeridos"
              required
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Sección: Medidas de Mitigación -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="shield-check" />
          Medidas de Mitigación
        </h3>
        
        <div class="timeline-container">
          <!-- Acciones a Corto Plazo -->
          <div class="timeline-item corto-plazo">
            <div class="timeline-marker">
              <PhosphorIcon name="clock" />
            </div>
            <div class="timeline-content">
              <h4>Acciones a Corto Plazo (0-24 horas) *</h4>
              <textarea 
                v-model="formulario.medidas_mitigacion.acciones_corto_plazo"
                class="campo-textarea"
                rows="4"
                placeholder="Acciones inmediatas y críticas para las próximas 24 horas"
                required
              ></textarea>
            </div>
          </div>
          
          <!-- Acciones a Mediano Plazo -->
          <div class="timeline-item mediano-plazo">
            <div class="timeline-marker">
              <PhosphorIcon name="calendar" />
            </div>
            <div class="timeline-content">
              <h4>Acciones a Mediano Plazo (1-7 días) *</h4>
              <textarea 
                v-model="formulario.medidas_mitigacion.acciones_mediano_plazo"
                class="campo-textarea"
                rows="4"
                placeholder="Acciones de consolidación para la primera semana"
                required
              ></textarea>
            </div>
          </div>
          
          <!-- Acciones a Largo Plazo -->
          <div class="timeline-item largo-plazo">
            <div class="timeline-marker">
              <PhosphorIcon name="calendar-plus" />
            </div>
            <div class="timeline-content">
              <h4>Acciones a Largo Plazo (1-4 semanas) *</h4>
              <textarea 
                v-model="formulario.medidas_mitigacion.acciones_largo_plazo"
                class="campo-textarea"
                rows="4"
                placeholder="Acciones de fortalecimiento y mejora continua"
                required
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección: Impacto en Servicios Vitales -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="pulse" />
          Impacto en Servicios Vitales
        </h3>
        
        <div class="campo-grupo">
          <label>Servicios Críticos Afectados *</label>
          <div class="servicios-container">
            <div 
              v-for="(servicio, index) in formulario.impacto_servicios.servicios_criticos_afectados" 
              :key="`servicio-${index}`"
              class="servicio-item"
            >
              <div class="servicio-datos">
                <input 
                  v-model="servicio.nombre"
                  type="text"
                  class="campo-input"
                  placeholder="Nombre del servicio"
                  required
                />
                <input 
                  v-model.number="servicio.porcentaje_afectacion"
                  type="number"
                  class="campo-input porcentaje"
                  min="0"
                  max="100"
                  placeholder="% afectación"
                />
                <input 
                  v-model="servicio.alternativa"
                  type="text"
                  class="campo-input"
                  placeholder="Alternativa operacional"
                />
              </div>
              <button 
                type="button" 
                @click="eliminarServicio(index)"
                class="btn-eliminar-item"
                v-if="formulario.impacto_servicios.servicios_criticos_afectados.length > 1"
              >
                <PhosphorIcon name="trash" />
              </button>
            </div>
            <button 
              type="button" 
              @click="agregarServicio"
              class="btn-agregar-servicio"
            >
              <PhosphorIcon name="plus" /> Agregar Servicio Crítico
            </button>
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Alternativas Operacionales Implementadas</label>
          <textarea 
            v-model="formulario.impacto_servicios.alternativas_operacionales"
            class="campo-textarea"
            rows="3"
            placeholder="Descripción de servicios de respaldo o alternativas implementadas"
          ></textarea>
        </div>
      </div>

      <!-- Sección: Matriz de Seguimiento -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="chart-line" />
          Matriz de Seguimiento
        </h3>
        
        <div class="matriz-seguimiento">
          <div class="matriz-header">
            <div class="columna-accion">Acción</div>
            <div class="columna-responsable">Responsable</div>
            <div class="columna-fecha">Fecha Límite</div>
            <div class="columna-estado">Estado</div>
            <div class="columna-acciones">Acciones</div>
          </div>
          
          <div 
            v-for="(item, index) in formulario.matriz_seguimiento" 
            :key="`matriz-${index}`"
            class="matriz-fila"
          >
            <input 
              v-model="item.accion"
              type="text"
              class="campo-input-matriz"
              placeholder="Descripción de la acción"
            />
            <input 
              v-model="item.responsable"
              type="text"
              class="campo-input-matriz"
              placeholder="Responsable"
            />
            <input 
              v-model="item.fecha_limite"
              type="date"
              class="campo-input-matriz"
            />
            <select v-model="item.estado" class="campo-select-matriz">
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completado">Completado</option>
              <option value="Retrasado">Retrasado</option>
            </select>
            <button 
              type="button" 
              @click="eliminarItemMatriz(index)"
              class="btn-eliminar-matriz"
              v-if="formulario.matriz_seguimiento.length > 1"
            >
              <PhosphorIcon name="x" />
            </button>
          </div>
          
          <button 
            type="button" 
            @click="agregarItemMatriz"
            class="btn-agregar-matriz"
          >
            <PhosphorIcon name="plus" /> Agregar Item de Seguimiento
          </button>
        </div>
      </div>

      <!-- Sección: Comunicaciones -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="megaphone" />
          Plan de Comunicaciones
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Estrategia de Comunicación Interna</label>
            <textarea 
              v-model="formulario.comunicaciones.estrategia_interna"
              class="campo-textarea"
              rows="3"
              placeholder="Cómo se comunicará el plan internamente"
            ></textarea>
          </div>
          
          <div class="campo-grupo">
            <label>Comunicación con Stakeholders</label>
            <textarea 
              v-model="formulario.comunicaciones.comunicacion_stakeholders"
              class="campo-textarea"
              rows="3"
              placeholder="Plan de comunicación con partes interesadas externas"
            ></textarea>
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Frecuencia de Reportes de Progreso</label>
          <select v-model="formulario.comunicaciones.frecuencia_reportes" class="campo-select">
            <option value="">Seleccionar frecuencia</option>
            <option value="Diario">Diario</option>
            <option value="Cada 12 horas">Cada 12 horas</option>
            <option value="Cada 6 horas">Cada 6 horas</option>
            <option value="Cada 3 horas">Cada 3 horas</option>
            <option value="Cuando sea necesario">Cuando sea necesario</option>
          </select>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="acciones-formulario">
        <button type="button" @click="guardarBorrador" class="btn-secundario">
          <PhosphorIcon name="floppy-disk" />
          Guardar Borrador
        </button>
        
        <button type="submit" class="btn-primario" :disabled="cargando">
          <PhosphorIcon name="paper-plane-tilt" />
          {{ cargando ? 'Enviando...' : 'Enviar Plan de Acción' }}
        </button>
      </div>
    </form>
    
    <!-- Mensaje para PSE -->
    <div v-else class="mensaje-pse">
      <PhosphorIcon name="info" />
      <h3>Plan de Acción no Requerido</h3>
      <p>
        Los Prestadores de Servicios Esenciales (PSE) no requieren presentar un Plan de Acción formal a ANCI.
        Su próximo reporte será el <strong>Informe Final</strong> a los 15 días desde la alerta temprana.
      </p>
    </div>
  </div>
</template>

<script>
import PhosphorIcon from './PhosphorIcon.vue'

export default {
  name: 'FormularioPlanAccion',
  components: {
    PhosphorIcon
  },
  props: {
    incidenteId: {
      type: Number,
      required: true
    },
    tipoEmpresa: {
      type: String,
      required: true
    },
    datosExistentes: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      cargando: false,
      formulario: {
        plan_recuperacion: {
          programa_restauracion_datos: '',
          responsables_tecnicos: '',
          responsables_administrativos: '',
          tiempo_estimado_restablecimiento: null,
          recursos_necesarios: ''
        },
        medidas_mitigacion: {
          acciones_corto_plazo: '',
          acciones_mediano_plazo: '',
          acciones_largo_plazo: ''
        },
        impacto_servicios: {
          servicios_criticos_afectados: [
            {
              nombre: '',
              porcentaje_afectacion: null,
              alternativa: ''
            }
          ],
          alternativas_operacionales: ''
        },
        matriz_seguimiento: [
          {
            accion: '',
            responsable: '',
            fecha_limite: '',
            estado: 'Pendiente'
          }
        ],
        comunicaciones: {
          estrategia_interna: '',
          comunicacion_stakeholders: '',
          frecuencia_reportes: ''
        }
      }
    }
  },
  mounted() {
    this.cargarDatosExistentes()
  },
  methods: {
    cargarDatosExistentes() {
      if (this.datosExistentes && Object.keys(this.datosExistentes).length > 0) {
        this.formulario = { ...this.formulario, ...this.datosExistentes }
      }
    },
    
    agregarServicio() {
      this.formulario.impacto_servicios.servicios_criticos_afectados.push({
        nombre: '',
        porcentaje_afectacion: null,
        alternativa: ''
      })
    },
    
    eliminarServicio(index) {
      if (this.formulario.impacto_servicios.servicios_criticos_afectados.length > 1) {
        this.formulario.impacto_servicios.servicios_criticos_afectados.splice(index, 1)
      }
    },
    
    agregarItemMatriz() {
      this.formulario.matriz_seguimiento.push({
        accion: '',
        responsable: '',
        fecha_limite: '',
        estado: 'Pendiente'
      })
    },
    
    eliminarItemMatriz(index) {
      if (this.formulario.matriz_seguimiento.length > 1) {
        this.formulario.matriz_seguimiento.splice(index, 1)
      }
    },
    
    async guardarBorrador() {
      try {
        this.cargando = true
        
        const response = await fetch(`/api/incidente/${this.incidenteId}/actualizar-anci`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            tipo_reporte: 'plan_accion',
            secciones: {
              9: {
                plan_accion_oiv: this.formulario
              }
            }
          })
        })
        
        if (response.ok) {
          this.$emit('borrador-guardado')
          this.$toast.success('Borrador guardado exitosamente')
        } else {
          throw new Error('Error al guardar borrador')
        }
      } catch (error) {
        console.error('Error:', error)
        this.$toast.error('Error al guardar el borrador')
      } finally {
        this.cargando = false
      }
    },
    
    async guardarFormulario() {
      try {
        this.cargando = true
        
        // Validar campos requeridos
        const camposRequeridos = [
          'plan_recuperacion.programa_restauracion_datos',
          'plan_recuperacion.responsables_tecnicos',
          'plan_recuperacion.responsables_administrativos',
          'plan_recuperacion.tiempo_estimado_restablecimiento',
          'plan_recuperacion.recursos_necesarios',
          'medidas_mitigacion.acciones_corto_plazo',
          'medidas_mitigacion.acciones_mediano_plazo',
          'medidas_mitigacion.acciones_largo_plazo'
        ]
        
        for (const campo of camposRequeridos) {
          const valor = this.obtenerValorCampo(campo)
          if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
            throw new Error(`El campo ${campo.split('.').pop()} es requerido`)
          }
        }
        
        // Validar que al menos un servicio crítico esté completamente lleno
        const serviciosValidos = this.formulario.impacto_servicios.servicios_criticos_afectados.filter(
          servicio => servicio.nombre && servicio.nombre.trim() !== ''
        )
        
        if (serviciosValidos.length === 0) {
          throw new Error('Debe especificar al menos un servicio crítico afectado')
        }
        
        const response = await fetch(`/api/incidente/${this.incidenteId}/actualizar-anci`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            tipo_reporte: 'plan_accion',
            secciones: {
              9: {
                plan_accion_oiv: this.formulario,
                tracking_reportes: {
                  plan_accion_enviado: true,
                  fecha_plan_accion: new Date().toISOString()
                }
              }
            }
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          this.$emit('formulario-enviado', result)
          this.$toast.success('Plan de Acción enviado exitosamente')
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al enviar el formulario')
        }
      } catch (error) {
        console.error('Error:', error)
        this.$toast.error(error.message || 'Error al enviar el Plan de Acción')
      } finally {
        this.cargando = false
      }
    },
    
    obtenerValorCampo(ruta) {
      return ruta.split('.').reduce((obj, prop) => obj && obj[prop], this.formulario)
    }
  }
}
</script>

<style scoped>
.formulario-plan-accion {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.formulario-header {
  margin-bottom: 2rem;
  text-align: center;
}

.titulo-formulario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.descripcion-formulario {
  color: #64748b;
  line-height: 1.5;
}

.alerta-tipo-empresa {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #92400e;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fbbf24;
  margin-top: 1rem;
}

.formulario-anci {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.seccion-formulario {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.seccion-formulario:last-of-type {
  border-bottom: none;
}

.titulo-seccion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.campos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.campo-grupo {
  display: flex;
  flex-direction: column;
}

.campo-grupo label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.campo-ayuda {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.campo-input,
.campo-select,
.campo-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo-input:focus,
.campo-select:focus,
.campo-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.campo-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Timeline de medidas de mitigación */
.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.corto-plazo .timeline-marker {
  background: #ef4444;
}

.mediano-plazo .timeline-marker {
  background: #f59e0b;
}

.largo-plazo .timeline-marker {
  background: #10b981;
}

.timeline-content h4 {
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

/* Servicios críticos */
.servicios-container {
  space-y: 1rem;
}

.servicio-item {
  display: flex;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.servicio-datos {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  gap: 1rem;
}

.porcentaje {
  max-width: 120px;
}

.btn-agregar-servicio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-agregar-servicio:hover {
  background: #2563eb;
}

/* Matriz de seguimiento */
.matriz-seguimiento {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.matriz-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr auto;
  gap: 1px;
  background: #f1f5f9;
  font-weight: 500;
  color: #374151;
}

.matriz-header > div {
  padding: 0.75rem;
  background: white;
}

.matriz-fila {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr auto;
  gap: 1px;
  background: #e2e8f0;
}

.campo-input-matriz,
.campo-select-matriz {
  padding: 0.5rem;
  border: none;
  background: white;
  font-size: 0.875rem;
}

.campo-input-matriz:focus,
.campo-select-matriz:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px #3b82f6;
}

.btn-eliminar-matriz {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-eliminar-matriz:hover {
  background: #dc2626;
}

.btn-agregar-matriz {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.btn-agregar-matriz:hover {
  background: #059669;
}

.btn-eliminar-item {
  padding: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-eliminar-item:hover {
  background: #dc2626;
}

/* Mensaje para PSE */
.mensaje-pse {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #0c4a6e;
}

.mensaje-pse h3 {
  margin: 0.5rem 0 1rem 0;
  color: #0c4a6e;
}

/* Acciones del formulario */
.acciones-formulario {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primario,
.btn-secundario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primario {
  background: #10b981;
  color: white;
}

.btn-primario:hover:not(:disabled) {
  background: #059669;
}

.btn-primario:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secundario {
  background: #6b7280;
  color: white;
}

.btn-secundario:hover {
  background: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-plan-accion {
    padding: 1rem;
  }
  
  .campos-grid {
    grid-template-columns: 1fr;
  }
  
  .servicio-datos {
    grid-template-columns: 1fr;
  }
  
  .matriz-header,
  .matriz-fila {
    grid-template-columns: 1fr;
  }
  
  .acciones-formulario {
    flex-direction: column;
  }
}
</style>