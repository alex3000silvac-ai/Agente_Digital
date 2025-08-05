<template>
  <div class="formulario-informe-final">
    <div class="formulario-header">
      <h2 class="titulo-formulario">
        <PhosphorIcon name="file-text" />
        Informe Final ANCI
      </h2>
      <p class="descripcion-formulario">
        Cuarta etapa del reporte ANCI - Cierre definitivo del incidente
        <br><strong>Plazo:</strong> 15 días desde la alerta temprana (OIV y PSE)
      </p>
    </div>

    <form @submit.prevent="guardarFormulario" class="formulario-anci">
      
      <!-- Sección: Identificación del Incidente -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="fingerprint" />
          Identificación del Incidente
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Folio ANCI *</label>
            <input 
              v-model="formulario.identificacion.folio_anci"
              type="text"
              class="campo-input"
              placeholder="Folio asignado por ANCI"
              required
            />
            <small class="campo-ayuda">Folio oficial asignado por la Agencia Nacional de Ciberseguridad</small>
          </div>
          
          <div class="campo-grupo">
            <label>Referencias de Reportes Previos *</label>
            <input 
              v-model="formulario.identificacion.id_referencias_previas"
              type="text"
              class="campo-input"
              placeholder="Códigos de alerta temprana, informe preliminar, etc."
              required
            />
          </div>
          
          <div class="campo-grupo">
            <label>Fecha de Inicio Original *</label>
            <input 
              v-model="formulario.identificacion.fecha_inicio_original"
              type="datetime-local"
              class="campo-input"
              required
            />
          </div>
          
          <div class="campo-grupo">
            <label>Fecha de Cierre *</label>
            <input 
              v-model="formulario.identificacion.fecha_cierre"
              type="datetime-local"
              class="campo-input"
              required
            />
          </div>
        </div>
      </div>

      <!-- Sección: Cronología Detallada -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="clock-clockwise" />
          Cronología Detallada
        </h3>
        
        <div class="cronologia-container">
          <div 
            v-for="(evento, index) in formulario.cronologia_detallada" 
            :key="`evento-${index}`"
            class="evento-cronologia"
          >
            <div class="evento-tiempo">
              <input 
                v-model="evento.fecha_hora"
                type="datetime-local"
                class="campo-input-tiempo"
                required
              />
            </div>
            <div class="evento-descripcion">
              <textarea 
                v-model="evento.descripcion"
                class="campo-textarea-evento"
                rows="2"
                placeholder="Descripción del evento"
                required
              ></textarea>
            </div>
            <div class="evento-acciones">
              <button 
                type="button" 
                @click="eliminarEvento(index)"
                class="btn-eliminar-evento"
                v-if="formulario.cronologia_detallada.length > 1"
              >
                <PhosphorIcon name="trash" />
              </button>
            </div>
          </div>
          
          <button 
            type="button" 
            @click="agregarEvento"
            class="btn-agregar-evento"
          >
            <PhosphorIcon name="plus" /> Agregar Evento
          </button>
        </div>
      </div>

      <!-- Sección: Desarrollo del Ataque -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="shield-slash" />
          Desarrollo del Ataque
        </h3>
        
        <div class="campo-grupo">
          <label>Vector Inicial *</label>
          <textarea 
            v-model="formulario.desarrollo_ataque.vector_inicial"
            class="campo-textarea"
            rows="3"
            placeholder="Descripción detallada del vector de ataque inicial"
            required
          ></textarea>
        </div>
        
        <div class="campo-grupo">
          <label>Técnicas Utilizadas (TTPs según MITRE ATT&CK)</label>
          <div class="ttps-container">
            <div 
              v-for="(ttp, index) in formulario.desarrollo_ataque.tecnicas_utilizadas" 
              :key="`ttp-${index}`"
              class="ttp-item"
            >
              <input 
                v-model="ttp.tecnica"
                type="text"
                class="campo-input"
                placeholder="ID de técnica MITRE (ej: T1566.001)"
              />
              <input 
                v-model="ttp.descripcion"
                type="text"
                class="campo-input"
                placeholder="Descripción de la técnica"
              />
              <button 
                type="button" 
                @click="eliminarTTP(index)"
                class="btn-eliminar-item"
                v-if="formulario.desarrollo_ataque.tecnicas_utilizadas.length > 1"
              >
                <PhosphorIcon name="x" />
              </button>
            </div>
            <button 
              type="button" 
              @click="agregarTTP"
              class="btn-agregar-item"
            >
              <PhosphorIcon name="plus" /> Agregar Técnica
            </button>
          </div>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Objetivos del Atacante</label>
            <textarea 
              v-model="formulario.desarrollo_ataque.objetivos_atacante"
              class="campo-textarea"
              rows="2"
              placeholder="Análisis de las intenciones y objetivos del atacante"
            ></textarea>
          </div>
          
          <div class="campo-grupo">
            <label>Movimiento Lateral</label>
            <textarea 
              v-model="formulario.desarrollo_ataque.movimiento_lateral"
              class="campo-textarea"
              rows="2"
              placeholder="Descripción del movimiento lateral, si aplica"
            ></textarea>
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Escalamiento de Privilegios</label>
          <textarea 
            v-model="formulario.desarrollo_ataque.escalamiento_privilegios"
            class="campo-textarea"
            rows="2"
            placeholder="Descripción del escalamiento de privilegios, si aplica"
          ></textarea>
        </div>
      </div>

      <!-- Sección: Causa Raíz Final -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="magnifying-glass-plus" />
          Causa Raíz Final
        </h3>
        
        <div class="campo-grupo">
          <label>Vector de Compromiso *</label>
          <textarea 
            v-model="formulario.causa_raiz_final.vector_compromiso"
            class="campo-textarea"
            rows="3"
            placeholder="Descripción técnica detallada del vector de compromiso"
            required
          ></textarea>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Vulnerabilidad Específica *</label>
            <input 
              v-model="formulario.causa_raiz_final.vulnerabilidad_especifica"
              type="text"
              class="campo-input"
              placeholder="CVE específico o descripción técnica"
              required
            />
          </div>
          
          <div class="campo-grupo">
            <label>CVSS Score</label>
            <input 
              v-model.number="formulario.causa_raiz_final.cvss_score"
              type="number"
              class="campo-input"
              min="0"
              max="10"
              step="0.1"
              placeholder="Puntaje CVSS"
            />
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Controles de Seguridad que Fallaron</label>
          <div class="controles-container">
            <div 
              v-for="(control, index) in formulario.causa_raiz_final.controles_fallidos" 
              :key="`control-${index}`"
              class="control-item"
            >
              <input 
                v-model="control.tipo"
                type="text"
                class="campo-input"
                placeholder="Tipo de control (ej: Antimalware, Firewall)"
              />
              <textarea 
                v-model="control.razon_falla"
                class="campo-textarea-pequeña"
                rows="2"
                placeholder="Razón por la cual falló"
              ></textarea>
              <button 
                type="button" 
                @click="eliminarControl(index)"
                class="btn-eliminar-item"
                v-if="formulario.causa_raiz_final.controles_fallidos.length > 1"
              >
                <PhosphorIcon name="x" />
              </button>
            </div>
            <button 
              type="button" 
              @click="agregarControl"
              class="btn-agregar-item"
            >
              <PhosphorIcon name="plus" /> Agregar Control Fallido
            </button>
          </div>
        </div>
      </div>

      <!-- Sección: Lecciones Aprendidas -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="lightbulb" />
          Lecciones Aprendidas
        </h3>
        
        <div class="campo-grupo">
          <label>Principales Lecciones Aprendidas *</label>
          <textarea 
            v-model="formulario.lecciones_aprendidas.principales_lecciones"
            class="campo-textarea"
            rows="4"
            placeholder="Principales aprendizajes obtenidos del incidente"
            required
          ></textarea>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Fortalezas Identificadas</label>
            <textarea 
              v-model="formulario.lecciones_aprendidas.fortalezas_identificadas"
              class="campo-textarea"
              rows="3"
              placeholder="Aspectos que funcionaron bien durante la respuesta"
            ></textarea>
          </div>
          
          <div class="campo-grupo">
            <label>Áreas de Mejora</label>
            <textarea 
              v-model="formulario.lecciones_aprendidas.areas_mejora"
              class="campo-textarea"
              rows="3"
              placeholder="Aspectos que requieren mejoras"
            ></textarea>
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Recomendaciones para el Sector</label>
          <textarea 
            v-model="formulario.lecciones_aprendidas.recomendaciones_sector"
            class="campo-textarea"
            rows="3"
            placeholder="Recomendaciones que podrían beneficiar a otras organizaciones del sector"
          ></textarea>
        </div>
      </div>

      <!-- Sección: Plan de Mejora Continua -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="trend-up" />
          Plan de Mejora Continua
        </h3>
        
        <div class="mejoras-container">
          <div 
            v-for="(mejora, index) in formulario.plan_mejora_continua" 
            :key="`mejora-${index}`"
            class="mejora-item"
          >
            <div class="mejora-header">
              <input 
                v-model="mejora.titulo"
                type="text"
                class="campo-input"
                placeholder="Título de la mejora"
                required
              />
              <select v-model="mejora.prioridad" class="campo-select-pequeño">
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            
            <textarea 
              v-model="mejora.descripcion"
              class="campo-textarea"
              rows="2"
              placeholder="Descripción de la mejora"
              required
            ></textarea>
            
            <div class="mejora-detalles">
              <input 
                v-model="mejora.responsable"
                type="text"
                class="campo-input"
                placeholder="Responsable"
              />
              <input 
                v-model="mejora.fecha_implementacion"
                type="date"
                class="campo-input"
              />
              <select v-model="mejora.estado" class="campo-select">
                <option value="Planificado">Planificado</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Implementado">Implementado</option>
                <option value="Verificado">Verificado</option>
              </select>
            </div>
            
            <button 
              type="button" 
              @click="eliminarMejora(index)"
              class="btn-eliminar-mejora"
              v-if="formulario.plan_mejora_continua.length > 1"
            >
              <PhosphorIcon name="trash" /> Eliminar
            </button>
          </div>
          
          <button 
            type="button" 
            @click="agregarMejora"
            class="btn-agregar-mejora"
          >
            <PhosphorIcon name="plus" /> Agregar Mejora
          </button>
        </div>
      </div>

      <!-- Sección: Impacto Económico Final -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="currency-dollar" />
          Impacto Económico Final
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Costos de Recuperación (USD)</label>
            <input 
              v-model.number="formulario.impacto_economico.costos_recuperacion"
              type="number"
              class="campo-input"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div class="campo-grupo">
            <label>Pérdidas Operativas (USD)</label>
            <input 
              v-model.number="formulario.impacto_economico.perdidas_operativas"
              type="number"
              class="campo-input"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div class="campo-grupo">
            <label>Costos de Terceros (USD)</label>
            <input 
              v-model.number="formulario.impacto_economico.costos_terceros"
              type="number"
              class="campo-input"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div class="campo-grupo">
            <label>Costo Total Estimado (USD)</label>
            <input 
              :value="costoTotalCalculado"
              type="text"
              class="campo-input"
              readonly
              :class="{ 'campo-calculado': true }"
            />
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Desglose Detallado de Costos</label>
          <textarea 
            v-model="formulario.impacto_economico.desglose_detallado"
            class="campo-textarea"
            rows="3"
            placeholder="Descripción detallada de los costos incurridos"
          ></textarea>
        </div>
      </div>

      <!-- Sección: Documentación Adjunta -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="paperclip" />
          Documentación Adjunta
        </h3>
        
        <div class="documentos-container">
          <div 
            v-for="(documento, index) in formulario.documentacion_adjunta" 
            :key="`doc-${index}`"
            class="documento-item"
          >
            <div class="documento-info">
              <input 
                v-model="documento.nombre"
                type="text"
                class="campo-input"
                placeholder="Nombre del documento"
              />
              <select v-model="documento.tipo" class="campo-select">
                <option value="">Tipo de documento</option>
                <option value="Evidencia forense">Evidencia forense</option>
                <option value="Log de seguridad">Log de seguridad</option>
                <option value="Reporte técnico">Reporte técnico</option>
                <option value="Comunicación oficial">Comunicación oficial</option>
                <option value="Captura de pantalla">Captura de pantalla</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <textarea 
              v-model="documento.descripcion"
              class="campo-textarea-pequeña"
              rows="1"
              placeholder="Descripción del documento"
            ></textarea>
            <button 
              type="button" 
              @click="eliminarDocumento(index)"
              class="btn-eliminar-item"
              v-if="formulario.documentacion_adjunta.length > 1"
            >
              <PhosphorIcon name="x" />
            </button>
          </div>
          
          <button 
            type="button" 
            @click="agregarDocumento"
            class="btn-agregar-item"
          >
            <PhosphorIcon name="plus" /> Agregar Documento
          </button>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="acciones-formulario">
        <button type="button" @click="guardarBorrador" class="btn-secundario">
          <PhosphorIcon name="floppy-disk" />
          Guardar Borrador
        </button>
        
        <button type="submit" class="btn-primario" :disabled="cargando">
          <PhosphorIcon name="check-circle" />
          {{ cargando ? 'Enviando...' : 'Cerrar Incidente - Enviar Informe Final' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import PhosphorIcon from './PhosphorIcon.vue'

export default {
  name: 'FormularioInformeFinal',
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
      default: 'PSE'
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
        identificacion: {
          folio_anci: '',
          id_referencias_previas: '',
          fecha_inicio_original: '',
          fecha_cierre: new Date().toISOString().slice(0, 16)
        },
        cronologia_detallada: [
          {
            fecha_hora: '',
            descripcion: ''
          }
        ],
        desarrollo_ataque: {
          vector_inicial: '',
          tecnicas_utilizadas: [
            {
              tecnica: '',
              descripcion: ''
            }
          ],
          objetivos_atacante: '',
          movimiento_lateral: '',
          escalamiento_privilegios: ''
        },
        causa_raiz_final: {
          vector_compromiso: '',
          vulnerabilidad_especifica: '',
          cvss_score: null,
          controles_fallidos: [
            {
              tipo: '',
              razon_falla: ''
            }
          ]
        },
        lecciones_aprendidas: {
          principales_lecciones: '',
          fortalezas_identificadas: '',
          areas_mejora: '',
          recomendaciones_sector: ''
        },
        plan_mejora_continua: [
          {
            titulo: '',
            descripcion: '',
            prioridad: 'Media',
            responsable: '',
            fecha_implementacion: '',
            estado: 'Planificado'
          }
        ],
        impacto_economico: {
          costos_recuperacion: null,
          perdidas_operativas: null,
          costos_terceros: null,
          desglose_detallado: ''
        },
        documentacion_adjunta: [
          {
            nombre: '',
            tipo: '',
            descripcion: ''
          }
        ]
      }
    }
  },
  computed: {
    costoTotalCalculado() {
      const costos = this.formulario.impacto_economico
      const total = (costos.costos_recuperacion || 0) + 
                   (costos.perdidas_operativas || 0) + 
                   (costos.costos_terceros || 0)
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(total)
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
    
    // Métodos para cronología
    agregarEvento() {
      this.formulario.cronologia_detallada.push({
        fecha_hora: '',
        descripcion: ''
      })
    },
    
    eliminarEvento(index) {
      if (this.formulario.cronologia_detallada.length > 1) {
        this.formulario.cronologia_detallada.splice(index, 1)
      }
    },
    
    // Métodos para TTPs
    agregarTTP() {
      this.formulario.desarrollo_ataque.tecnicas_utilizadas.push({
        tecnica: '',
        descripcion: ''
      })
    },
    
    eliminarTTP(index) {
      if (this.formulario.desarrollo_ataque.tecnicas_utilizadas.length > 1) {
        this.formulario.desarrollo_ataque.tecnicas_utilizadas.splice(index, 1)
      }
    },
    
    // Métodos para controles fallidos
    agregarControl() {
      this.formulario.causa_raiz_final.controles_fallidos.push({
        tipo: '',
        razon_falla: ''
      })
    },
    
    eliminarControl(index) {
      if (this.formulario.causa_raiz_final.controles_fallidos.length > 1) {
        this.formulario.causa_raiz_final.controles_fallidos.splice(index, 1)
      }
    },
    
    // Métodos para plan de mejora
    agregarMejora() {
      this.formulario.plan_mejora_continua.push({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        responsable: '',
        fecha_implementacion: '',
        estado: 'Planificado'
      })
    },
    
    eliminarMejora(index) {
      if (this.formulario.plan_mejora_continua.length > 1) {
        this.formulario.plan_mejora_continua.splice(index, 1)
      }
    },
    
    // Métodos para documentación
    agregarDocumento() {
      this.formulario.documentacion_adjunta.push({
        nombre: '',
        tipo: '',
        descripcion: ''
      })
    },
    
    eliminarDocumento(index) {
      if (this.formulario.documentacion_adjunta.length > 1) {
        this.formulario.documentacion_adjunta.splice(index, 1)
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
            tipo_reporte: 'informe_final',
            secciones: {
              9: {
                informe_final: this.formulario
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
          'identificacion.folio_anci',
          'identificacion.id_referencias_previas',
          'identificacion.fecha_inicio_original',
          'identificacion.fecha_cierre',
          'desarrollo_ataque.vector_inicial',
          'causa_raiz_final.vector_compromiso',
          'causa_raiz_final.vulnerabilidad_especifica',
          'lecciones_aprendidas.principales_lecciones'
        ]
        
        for (const campo of camposRequeridos) {
          const valor = this.obtenerValorCampo(campo)
          if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
            throw new Error(`El campo ${campo.split('.').pop().replace('_', ' ')} es requerido`)
          }
        }
        
        // Validar que hay al menos un evento en cronología
        const eventosValidos = this.formulario.cronologia_detallada.filter(
          evento => evento.fecha_hora && evento.descripcion.trim()
        )
        
        if (eventosValidos.length === 0) {
          throw new Error('Debe incluir al menos un evento en la cronología detallada')
        }
        
        const response = await fetch(`/api/incidente/${this.incidenteId}/actualizar-anci`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            tipo_reporte: 'informe_final',
            secciones: {
              9: {
                informe_final: this.formulario,
                tracking_reportes: {
                  informe_final_enviado: true,
                  fecha_informe_final: new Date().toISOString()
                }
              },
              // Actualizar estado del incidente a cerrado
              2: {
                estado_operacional: 'Cerrado'
              }
            }
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          this.$emit('incidente-cerrado', result)
          this.$toast.success('Informe final enviado e incidente cerrado exitosamente')
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al enviar el formulario')
        }
      } catch (error) {
        console.error('Error:', error)
        this.$toast.error(error.message || 'Error al enviar el informe final')
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
.formulario-informe-final {
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

.campo-calculado {
  background: #f8fafc;
  color: #059669;
  font-weight: 600;
}

.campo-textarea {
  resize: vertical;
  min-height: 80px;
}

.campo-textarea-pequeña {
  resize: vertical;
  min-height: 40px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Cronología */
.cronologia-container {
  space-y: 1rem;
}

.evento-cronologia {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.campo-input-tiempo {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.campo-textarea-evento {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 60px;
}

.btn-eliminar-evento {
  padding: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-eliminar-evento:hover {
  background: #dc2626;
}

.btn-agregar-evento {
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

.btn-agregar-evento:hover {
  background: #2563eb;
}

/* TTPs, Controles, etc. */
.ttps-container,
.controles-container,
.documentos-container {
  space-y: 1rem;
}

.ttp-item,
.control-item,
.documento-item {
  display: flex;
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.ttp-item .campo-input,
.control-item .campo-input {
  flex: 1;
}

.documento-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  flex: 1;
}

.campo-select-pequeño {
  max-width: 120px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Plan de mejora */
.mejoras-container {
  space-y: 1.5rem;
}

.mejora-item {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.mejora-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mejora-detalles {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-eliminar-mejora {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-eliminar-mejora:hover {
  background: #dc2626;
}

.btn-agregar-mejora {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.btn-agregar-mejora:hover {
  background: #059669;
}

.btn-eliminar-item,
.btn-agregar-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-eliminar-item {
  background: #ef4444;
  color: white;
}

.btn-eliminar-item:hover {
  background: #dc2626;
}

.btn-agregar-item {
  background: #3b82f6;
  color: white;
  margin-top: 1rem;
}

.btn-agregar-item:hover {
  background: #2563eb;
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
  background: #059669;
  color: white;
}

.btn-primario:hover:not(:disabled) {
  background: #047857;
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
  .formulario-informe-final {
    padding: 1rem;
  }
  
  .campos-grid {
    grid-template-columns: 1fr;
  }
  
  .evento-cronologia {
    grid-template-columns: 1fr;
  }
  
  .mejora-header,
  .mejora-detalles {
    grid-template-columns: 1fr;
  }
  
  .documento-info {
    grid-template-columns: 1fr;
  }
  
  .acciones-formulario {
    flex-direction: column;
  }
}
</style>