<template>
  <div class="formulario-informe-completo">
    <div class="formulario-header">
      <h2 class="titulo-formulario">
        <PhosphorIcon name="clipboard-text" />
        Informe Completo ANCI
      </h2>
      <p class="descripcion-formulario">
        Segunda etapa del reporte ANCI - Análisis detallado del incidente
        <br><strong>Plazo:</strong> {{ tipoEmpresa === 'OIV' ? '24h (servicio esencial) / 72h (otros)' : '72h (PSE)' }}
      </p>
    </div>

    <form @submit.prevent="guardarFormulario" class="formulario-anci">
      
      <!-- Sección: Referencia y Actualización -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="link" />
          Referencia del Reporte
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>ID Alerta Temprana *</label>
            <input 
              v-model="formulario.referencia.id_alerta_temprana"
              type="text"
              class="campo-input"
              placeholder="Código del primer reporte"
              required
            />
          </div>
          
          <div class="campo-grupo">
            <label>Fecha de Actualización *</label>
            <input 
              v-model="formulario.referencia.fecha_actualizacion"
              type="datetime-local"
              class="campo-input"
              required
            />
          </div>
        </div>
      </div>

      <!-- Sección: Análisis Detallado -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="magnifying-glass" />
          Análisis Detallado
        </h3>
        
        <div class="campo-grupo">
          <label>Descripción Completa del Incidente *</label>
          <textarea 
            v-model="formulario.analisis.descripcion_completa"
            class="campo-textarea"
            rows="4"
            placeholder="Narrativa detallada del incidente, incluyendo secuencia de eventos"
            required
          ></textarea>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Vector de Ataque *</label>
            <select v-model="formulario.analisis.vector_ataque" class="campo-select" required>
              <option value="">Seleccionar vector</option>
              <option value="Phishing">Phishing</option>
              <option value="Vulnerabilidad">Explotación de vulnerabilidad</option>
              <option value="Fuerza bruta">Ataque de fuerza bruta</option>
              <option value="Ingeniería social">Ingeniería social</option>
              <option value="Malware">Malware</option>
              <option value="Insider threat">Amenaza interna</option>
              <option value="Supply chain">Cadena de suministro</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div class="campo-grupo">
            <label>Causa Raíz Preliminar *</label>
            <input 
              v-model="formulario.analisis.causa_raiz_preliminar"
              type="text"
              class="campo-input"
              placeholder="Análisis inicial de la causa"
              required
            />
          </div>
        </div>
      </div>

      <!-- Sección: Gravedad e Impacto -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="warning-diamond" />
          Gravedad e Impacto
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Nivel de Criticidad *</label>
            <select v-model="formulario.impacto.nivel_criticidad" class="campo-select" required>
              <option value="">Seleccionar nivel</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>
          
          <div class="campo-grupo">
            <label>Duración Real de Interrupción</label>
            <input 
              v-model="formulario.impacto.duracion_real_interrupcion"
              type="text"
              class="campo-input"
              placeholder="HH:MM"
              pattern="^[0-9]{1,2}:[0-9]{2}$"
            />
          </div>
          
          <div class="campo-grupo">
            <label>Número de Usuarios Impactados</label>
            <input 
              v-model.number="formulario.impacto.numero_usuarios_impactados"
              type="number"
              class="campo-input"
              min="0"
              placeholder="Número exacto"
            />
          </div>
          
          <div class="campo-grupo">
            <label>Volumen de Datos Comprometidos (GB)</label>
            <input 
              v-model.number="formulario.impacto.volumen_datos_comprometidos"
              type="number"
              class="campo-input"
              min="0"
              step="0.1"
              placeholder="Si aplica"
            />
          </div>
        </div>
        
        <div class="campo-grupo">
          <label>Sistemas Específicos Afectados *</label>
          <textarea 
            v-model="formulario.impacto.sistemas_especificos_afectados"
            class="campo-textarea"
            rows="2"
            placeholder="Lista detallada de sistemas afectados"
            required
          ></textarea>
        </div>
        
        <div class="campo-grupo">
          <label>Efectos Colaterales</label>
          <textarea 
            v-model="formulario.impacto.efectos_colaterales"
            class="campo-textarea"
            rows="2"
            placeholder="Repercusiones en otros sectores o sistemas"
          ></textarea>
        </div>
      </div>

      <!-- Sección: Indicadores de Compromiso (IoCs) -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="shield-warning" />
          Indicadores de Compromiso (IoCs)
        </h3>
        
        <div class="iocs-container">
          <!-- IPs Sospechosas -->
          <div class="ioc-group">
            <label>Direcciones IP Sospechosas</label>
            <div class="lista-items">
              <div 
                v-for="(ip, index) in formulario.iocs.direcciones_ip_sospechosas" 
                :key="`ip-${index}`"
                class="item-lista"
              >
                <input 
                  v-model="formulario.iocs.direcciones_ip_sospechosas[index]"
                  type="text"
                  class="campo-input-pequeño"
                  placeholder="192.168.1.1"
                />
                <button 
                  type="button" 
                  @click="eliminarItem('direcciones_ip_sospechosas', index)"
                  class="btn-eliminar-item"
                >
                  <PhosphorIcon name="x" />
                </button>
              </div>
              <button 
                type="button" 
                @click="agregarItem('direcciones_ip_sospechosas')"
                class="btn-agregar-item"
              >
                <PhosphorIcon name="plus" /> Agregar IP
              </button>
            </div>
          </div>

          <!-- Hashes de Malware -->
          <div class="ioc-group">
            <label>Hashes de Malware</label>
            <div class="lista-items">
              <div 
                v-for="(hash, index) in formulario.iocs.hashes_malware" 
                :key="`hash-${index}`"
                class="item-lista"
              >
                <input 
                  v-model="formulario.iocs.hashes_malware[index]"
                  type="text"
                  class="campo-input-pequeño"
                  placeholder="SHA256, MD5, etc."
                />
                <button 
                  type="button" 
                  @click="eliminarItem('hashes_malware', index)"
                  class="btn-eliminar-item"
                >
                  <PhosphorIcon name="x" />
                </button>
              </div>
              <button 
                type="button" 
                @click="agregarItem('hashes_malware')"
                class="btn-agregar-item"
              >
                <PhosphorIcon name="plus" /> Agregar Hash
              </button>
            </div>
          </div>

          <!-- Dominios Maliciosos -->
          <div class="ioc-group">
            <label>Dominios Maliciosos</label>
            <div class="lista-items">
              <div 
                v-for="(dominio, index) in formulario.iocs.dominios_maliciosos" 
                :key="`dominio-${index}`"
                class="item-lista"
              >
                <input 
                  v-model="formulario.iocs.dominios_maliciosos[index]"
                  type="text"
                  class="campo-input-pequeño"
                  placeholder="malicious-domain.com"
                />
                <button 
                  type="button" 
                  @click="eliminarItem('dominios_maliciosos', index)"
                  class="btn-eliminar-item"
                >
                  <PhosphorIcon name="x" />
                </button>
              </div>
              <button 
                type="button" 
                @click="agregarItem('dominios_maliciosos')"
                class="btn-agregar-item"
              >
                <PhosphorIcon name="plus" /> Agregar Dominio
              </button>
            </div>
          </div>

          <!-- URLs Maliciosas -->
          <div class="ioc-group">
            <label>URLs Maliciosas</label>
            <div class="lista-items">
              <div 
                v-for="(url, index) in formulario.iocs.urls_maliciosas" 
                :key="`url-${index}`"
                class="item-lista"
              >
                <input 
                  v-model="formulario.iocs.urls_maliciosas[index]"
                  type="url"
                  class="campo-input-pequeño"
                  placeholder="https://malicious-url.com/path"
                />
                <button 
                  type="button" 
                  @click="eliminarItem('urls_maliciosas', index)"
                  class="btn-eliminar-item"
                >
                  <PhosphorIcon name="x" />
                </button>
              </div>
              <button 
                type="button" 
                @click="agregarItem('urls_maliciosas')"
                class="btn-agregar-item"
              >
                <PhosphorIcon name="plus" /> Agregar URL
              </button>
            </div>
          </div>

          <!-- Cuentas Comprometidas -->
          <div class="ioc-group">
            <label>Cuentas Comprometidas</label>
            <div class="lista-items">
              <div 
                v-for="(cuenta, index) in formulario.iocs.cuentas_comprometidas" 
                :key="`cuenta-${index}`"
                class="item-lista"
              >
                <input 
                  v-model="formulario.iocs.cuentas_comprometidas[index]"
                  type="text"
                  class="campo-input-pequeño"
                  placeholder="usuario@empresa.com"
                />
                <button 
                  type="button" 
                  @click="eliminarItem('cuentas_comprometidas', index)"
                  class="btn-eliminar-item"
                >
                  <PhosphorIcon name="x" />
                </button>
              </div>
              <button 
                type="button" 
                @click="agregarItem('cuentas_comprometidas')"
                class="btn-agregar-item"
              >
                <PhosphorIcon name="plus" /> Agregar Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección: Análisis de Causa Raíz -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="tree-structure" />
          Análisis de Causa Raíz
        </h3>
        
        <div class="campo-grupo">
          <label>Vulnerabilidad Explotada</label>
          <input 
            v-model="formulario.causa_raiz.vulnerabilidad_explotada"
            type="text"
            class="campo-input"
            placeholder="CVE-XXXX-XXXX o descripción técnica"
          />
        </div>
        
        <div class="campo-grupo">
          <label>Falla de Control de Seguridad</label>
          <textarea 
            v-model="formulario.causa_raiz.falla_control_seguridad"
            class="campo-textarea"
            rows="2"
            placeholder="Descripción del control de seguridad que falló"
          ></textarea>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>¿Error Humano Involucrado?</label>
            <select v-model="formulario.causa_raiz.error_humano_involucrado" class="campo-select">
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          <div class="campo-grupo" v-show="formulario.causa_raiz.error_humano_involucrado === 'Si'">
            <label>Descripción del Error Humano</label>
            <input 
              v-model="formulario.causa_raiz.descripcion_error_humano"
              type="text"
              class="campo-input"
              placeholder="Detalle del error humano"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Acciones de Respuesta -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="first-aid" />
          Acciones de Respuesta
        </h3>
        
        <div class="campo-grupo">
          <label>Medidas de Contención Aplicadas *</label>
          <textarea 
            v-model="formulario.respuesta.medidas_contencion_aplicadas"
            class="campo-textarea"
            rows="3"
            placeholder="Lista detallada de medidas de contención implementadas"
            required
          ></textarea>
        </div>
        
        <div class="campo-grupo">
          <label>Medidas de Erradicación</label>
          <textarea 
            v-model="formulario.respuesta.medidas_erradicacion"
            class="campo-textarea"
            rows="2"
            placeholder="Acciones para eliminar completamente la amenaza"
          ></textarea>
        </div>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Estado de Recuperación *</label>
            <select v-model="formulario.respuesta.estado_recuperacion" class="campo-select" required>
              <option value="">Seleccionar estado</option>
              <option value="En curso">En curso</option>
              <option value="Completada">Completada</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
          
          <div class="campo-grupo">
            <label>Tiempo Estimado de Resolución</label>
            <input 
              v-model="formulario.respuesta.tiempo_estimado_resolucion"
              type="text"
              class="campo-input"
              placeholder="Horas/días restantes"
            />
          </div>
        </div>
      </div>

      <!-- Sección: Coordinaciones Externas -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="handshake" />
          Coordinaciones Externas
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Notificación a Regulador Sectorial</label>
            <select v-model="formulario.coordinaciones.notificacion_regulador_sectorial" class="campo-select">
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          <div class="campo-grupo" v-show="formulario.coordinaciones.notificacion_regulador_sectorial === 'Si'">
            <label>¿Cuál Regulador?</label>
            <input 
              v-model="formulario.coordinaciones.regulador_notificado"
              type="text"
              class="campo-input"
              placeholder="Nombre del regulador"
            />
          </div>
          
          <div class="campo-grupo">
            <label>Denuncia Policial</label>
            <select v-model="formulario.coordinaciones.denuncia_policial" class="campo-select">
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          <div class="campo-grupo">
            <label>Contacto con Proveedores de Seguridad</label>
            <select v-model="formulario.coordinaciones.contacto_proveedores_seguridad" class="campo-select">
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          <div class="campo-grupo">
            <label>Comunicación Pública Emitida</label>
            <select v-model="formulario.coordinaciones.comunicacion_publica_emitida" class="campo-select">
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sección: Apoyo Requerido -->
      <div class="seccion-formulario">
        <h3 class="titulo-seccion">
          <PhosphorIcon name="lifebuoy" />
          Apoyo Requerido
        </h3>
        
        <div class="campos-grid">
          <div class="campo-grupo">
            <label>Asistencia CSIRT Actualizada</label>
            <select v-model="formulario.apoyo.asistencia_csirt_actualizada" class="campo-select">
              <option value="">Seleccionar</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
            </select>
          </div>
          
          <div class="campo-grupo" v-show="formulario.apoyo.asistencia_csirt_actualizada === 'Si'">
            <label>Tipo de Apoyo en Curso</label>
            <input 
              v-model="formulario.apoyo.tipo_apoyo_en_curso"
              type="text"
              class="campo-input"
              placeholder="Descripción del apoyo requerido"
            />
          </div>
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
          {{ cargando ? 'Enviando...' : 'Enviar Informe Completo' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import PhosphorIcon from './PhosphorIcon.vue'

export default {
  name: 'FormularioInformeCompleto',
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
        referencia: {
          id_alerta_temprana: '',
          fecha_actualizacion: new Date().toISOString().slice(0, 16)
        },
        analisis: {
          descripcion_completa: '',
          vector_ataque: '',
          causa_raiz_preliminar: ''
        },
        impacto: {
          nivel_criticidad: '',
          sistemas_especificos_afectados: '',
          duracion_real_interrupcion: '',
          numero_usuarios_impactados: null,
          volumen_datos_comprometidos: null,
          efectos_colaterales: ''
        },
        iocs: {
          direcciones_ip_sospechosas: [''],
          hashes_malware: [''],
          dominios_maliciosos: [''],
          cuentas_comprometidas: [''],
          urls_maliciosas: ['']
        },
        causa_raiz: {
          vulnerabilidad_explotada: '',
          falla_control_seguridad: '',
          error_humano_involucrado: '',
          descripcion_error_humano: ''
        },
        respuesta: {
          medidas_contencion_aplicadas: '',
          medidas_erradicacion: '',
          estado_recuperacion: '',
          tiempo_estimado_resolucion: ''
        },
        coordinaciones: {
          notificacion_regulador_sectorial: '',
          regulador_notificado: '',
          denuncia_policial: '',
          contacto_proveedores_seguridad: '',
          comunicacion_publica_emitida: ''
        },
        apoyo: {
          asistencia_csirt_actualizada: '',
          tipo_apoyo_en_curso: ''
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
        // Cargar datos desde el incidente existente
        this.formulario = { ...this.formulario, ...this.datosExistentes }
      }
    },
    
    agregarItem(tipo) {
      this.formulario.iocs[tipo].push('')
    },
    
    eliminarItem(tipo, index) {
      if (this.formulario.iocs[tipo].length > 1) {
        this.formulario.iocs[tipo].splice(index, 1)
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
            tipo_reporte: 'informe_completo',
            secciones: {
              9: {
                ...this.formulario
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
        
        // Limpiar arrays vacíos en IoCs
        Object.keys(this.formulario.iocs).forEach(tipo => {
          this.formulario.iocs[tipo] = this.formulario.iocs[tipo].filter(item => item.trim() !== '')
        })
        
        const response = await fetch(`/api/incidente/${this.incidenteId}/actualizar-anci`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            tipo_reporte: 'informe_completo',
            secciones: {
              9: {
                ...this.formulario,
                tracking_reportes: {
                  informe_completo_enviado: true,
                  fecha_informe_completo: new Date().toISOString()
                }
              }
            }
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          this.$emit('formulario-enviado', result)
          this.$toast.success('Informe completo enviado exitosamente')
        } else {
          throw new Error('Error al enviar el formulario')
        }
      } catch (error) {
        console.error('Error:', error)
        this.$toast.error('Error al enviar el informe completo')
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.formulario-informe-completo {
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

/* Estilos para IoCs */
.iocs-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.ioc-group {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.ioc-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
  display: block;
}

.lista-items {
  space-y: 0.5rem;
}

.item-lista {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.campo-input-pequeño {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
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

.btn-agregar-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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
  .formulario-informe-completo {
    padding: 1rem;
  }
  
  .campos-grid {
    grid-template-columns: 1fr;
  }
  
  .iocs-container {
    grid-template-columns: 1fr;
  }
  
  .acciones-formulario {
    flex-direction: column;
  }
}
</style>