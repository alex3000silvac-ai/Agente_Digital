<template>
  <div class="formulario-dinamico-anci">
    <!-- Header del formulario -->
    <div class="formulario-header">
      <h2 class="formulario-titulo">
        <i class="fas fa-file-alt"></i>
        Formulario Dinámico ANCI
      </h2>
      <div class="empresa-info">
        <span class="empresa-nombre">{{ empresaInfo.razonSocial }}</span>
        <span class="empresa-tipo" :class="'tipo-' + empresaInfo.tipoEmpresa.toLowerCase()">
          {{ empresaInfo.tipoEmpresa === 'OIV' ? 'Operador de Infraestructura Vital' : 'Proveedor de Servicios Esenciales' }}
        </span>
      </div>
    </div>

    <!-- Estadísticas del formulario -->
    <div class="formulario-stats" v-if="estadisticas">
      <div class="stat-card">
        <i class="fas fa-list"></i>
        <div class="stat-content">
          <span class="stat-number">{{ estadisticas.seccionesAplicables }}</span>
          <span class="stat-label">Secciones Aplicables</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-tags"></i>
        <div class="stat-content">
          <span class="stat-number">{{ estadisticas.taxonomiasAplicables }}</span>
          <span class="stat-label">Taxonomías</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-file"></i>
        <div class="stat-content">
          <span class="stat-number">{{ capacidades.maxArchivosTotal }}</span>
          <span class="stat-label">Max Archivos</span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="cargando" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Cargando configuración dinámica...</span>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ error }}</span>
      <button @click="cargarConfiguracion" class="btn btn-outline-primary btn-sm">
        <i class="fas fa-redo"></i> Reintentar
      </button>
    </div>

    <!-- Formulario dinámico -->
    <div v-if="!cargando && !error && secciones.length > 0" class="formulario-content">
      <!-- Controles del formulario -->
      <div class="formulario-controls">
        <button @click="expandirTodo" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-expand-alt"></i>
          Expandir Todo
        </button>
        <button @click="contraerTodo" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-compress-alt"></i>
          Contraer Todo
        </button>
        <button @click="sincronizarTaxonomias" class="btn btn-outline-info btn-sm" :disabled="sincronizando">
          <i class="fas fa-sync" :class="{ 'fa-spin': sincronizando }"></i>
          Sincronizar Taxonomías
        </button>
        <div class="formulario-progress">
          <span>Progreso: {{ progresoCompletado }}/{{ secciones.length }} secciones</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: porcentajeProgreso + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Acordeón dinámico de secciones -->
      <div class="accordion formulario-accordion" id="formularioDinamicoAcordeon">
        <div 
          v-for="seccion in secciones" 
          :key="seccion.codigoSeccion"
          class="accordion-item seccion-item"
          :class="getSeccionClasses(seccion)"
        >
          <!-- Header de la sección -->
          <h2 class="accordion-header">
            <button 
              class="accordion-button seccion-header"
              :class="{ collapsed: !seccion.expandida }"
              type="button"
              @click="toggleSeccion(seccion)"
              :style="{ 
                borderLeft: `4px solid ${seccion.colorIndicador}`,
                backgroundColor: getSeccionBackgroundColor(seccion)
              }"
            >
              <div class="seccion-header-content">
                <div class="seccion-titulo-container">
                  <i :class="'fas fa-' + seccion.iconoSeccion" class="seccion-icono"></i>
                  <span class="seccion-titulo">{{ seccion.titulo }}</span>
                  <span v-if="seccion.esObligatorio" class="badge badge-obligatorio">Obligatorio</span>
                  <span class="badge badge-tipo" :class="'badge-' + seccion.tipoSeccion.toLowerCase()">
                    {{ getTipoSeccionLabel(seccion.tipoSeccion) }}
                  </span>
                </div>
                <div class="seccion-meta">
                  <span class="seccion-estado" :class="'estado-' + getEstadoSeccion(seccion)">
                    {{ getEstadoSeccionLabel(seccion) }}
                  </span>
                  <span v-if="getArchivosSeccion(seccion) > 0" class="badge badge-archivos">
                    <i class="fas fa-file"></i> {{ getArchivosSeccion(seccion) }}
                  </span>
                  <span class="seccion-campos">{{ seccion.numeroCampos }} campos</span>
                </div>
              </div>
              <i class="fas fa-chevron-down accordion-chevron" :class="{ rotated: seccion.expandida }"></i>
            </button>
          </h2>

          <!-- Contenido de la sección -->
          <div 
            v-show="seccion.expandida"
            class="accordion-collapse seccion-contenido"
          >
            <div class="accordion-body">
              <!-- Descripción de la sección -->
              <div v-if="seccion.descripcion" class="seccion-descripcion">
                <i class="fas fa-info-circle"></i>
                <span>{{ seccion.descripcion }}</span>
              </div>

              <!-- Campos dinámicos de la sección -->
              <div class="seccion-campos-container">
                <div class="row">
                  <div class="col-md-8">
                    <CamposDinamicos
                      :seccion="seccion"
                      :datos="datosFormulario[seccion.codigoSeccion] || {}"
                      @datos-actualizados="actualizarDatosSeccion"
                      @campo-validado="validarCampo"
                    />
                  </div>
                  <div class="col-md-4">
                    <!-- Panel de archivos -->
                    <GestorArchivosSeccion
                      :incidente-id="incidenteId"
                      :codigo-seccion="seccion.codigoSeccion"
                      :max-archivos="seccion.maxArchivos"
                      :max-tamano-mb="seccion.maxSizeMB"
                      @archivos-actualizados="actualizarArchivosSeccion"
                    />

                    <!-- Panel de comentarios -->
                    <GestorComentariosSeccion
                      :incidente-id="incidenteId"
                      :codigo-seccion="seccion.codigoSeccion"
                      :max-comentarios="seccion.maxComentarios"
                      @comentarios-actualizados="actualizarComentariosSeccion"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones del formulario -->
      <div class="formulario-acciones">
        <button 
          @click="guardarBorrador" 
          class="btn btn-outline-primary"
          :disabled="guardando"
        >
          <i class="fas fa-save"></i>
          {{ guardando ? 'Guardando...' : 'Guardar Borrador' }}
        </button>
        
        <button 
          @click="validarFormulario" 
          class="btn btn-outline-warning"
          :disabled="validando"
        >
          <i class="fas fa-check-circle"></i>
          {{ validando ? 'Validando...' : 'Validar Formulario' }}
        </button>
        
        <button 
          @click="guardarCompleto" 
          class="btn btn-success"
          :disabled="!formularioValido || guardando"
        >
          <i class="fas fa-paper-plane"></i>
          Completar y Enviar
        </button>
      </div>
    </div>

    <!-- Modal de validación -->
    <ModalValidacion
      v-if="mostrarModalValidacion"
      :validaciones="resultadosValidacion"
      @cerrar="mostrarModalValidacion = false"
      @corregir="irASeccionError"
    />
  </div>
</template>

<script>
import CamposDinamicos from './CamposDinamicos.vue'
import GestorArchivosSeccion from './GestorArchivosSeccion.vue'
import GestorComentariosSeccion from './GestorComentariosSeccion.vue'
import ModalValidacion from './ModalValidacion.vue'

export default {
  name: 'FormularioDinamicoANCI',
  components: {
    CamposDinamicos,
    GestorArchivosSeccion,
    GestorComentariosSeccion,
    ModalValidacion
  },
  props: {
    empresaId: {
      type: Number,
      required: true
    },
    incidenteId: {
      type: Number,
      default: null
    },
    modo: {
      type: String,
      default: 'crear', // 'crear' o 'editar'
      validator: value => ['crear', 'editar'].includes(value)
    }
  },
  data() {
    return {
      // Estado de carga
      cargando: false,
      error: null,
      guardando: false,
      validando: false,
      sincronizando: false,
      
      // Información de la empresa
      empresaInfo: {},
      
      // Configuración del formulario
      secciones: [],
      estadisticas: null,
      capacidades: {},
      
      // Datos del formulario
      datosFormulario: {},
      archivosFormulario: {},
      comentariosFormulario: {},
      
      // Estado de validación
      formularioValido: false,
      erroresValidacion: {},
      resultadosValidacion: null,
      mostrarModalValidacion: false,
      
      // Estado de la UI
      seccionesExpandidas: new Set()
    }
  },
  computed: {
    progresoCompletado() {
      return this.secciones.filter(s => this.getEstadoSeccion(s) === 'completado').length
    },
    porcentajeProgreso() {
      return this.secciones.length > 0 ? (this.progresoCompletado / this.secciones.length) * 100 : 0
    }
  },
  async mounted() {
    await this.inicializar()
  },
  methods: {
    async inicializar() {
      await this.cargarConfiguracion()
      if (this.modo === 'editar' && this.incidenteId) {
        await this.cargarDatosIncidente()
      }
    },

    async cargarConfiguracion() {
      this.cargando = true
      this.error = null
      
      try {
        const response = await this.$api.get(`/api/formulario-dinamico/configuracion/${this.empresaId}`)
        
        if (response.data.success) {
          const data = response.data.data
          this.empresaInfo = data.empresa
          this.secciones = data.formulario.secciones.map(seccion => ({
            ...seccion,
            expandida: false
          }))
          this.estadisticas = data.formulario.estadisticas
          this.capacidades = data.capacidades
          
          // Expandir secciones obligatorias por defecto
          this.secciones.forEach(seccion => {
            if (seccion.esObligatorio) {
              this.seccionesExpandidas.add(seccion.codigoSeccion)
              seccion.expandida = true
            }
          })
          
          console.log('Configuración dinámica cargada:', data)
        } else {
          throw new Error('Error en la respuesta del servidor')
        }
      } catch (error) {
        console.error('Error cargando configuración:', error)
        this.error = 'Error cargando la configuración del formulario'
      } finally {
        this.cargando = false
      }
    },

    async cargarDatosIncidente() {
      if (!this.incidenteId) return
      
      try {
        const response = await this.$api.get(`/api/formulario-dinamico/cargar/${this.empresaId}/${this.incidenteId}`)
        
        if (response.data.success) {
          const secciones = response.data.data.secciones
          
          // Cargar datos en cada sección
          Object.keys(secciones).forEach(codigoSeccion => {
            this.datosFormulario[codigoSeccion] = secciones[codigoSeccion].datos || {}
          })
          
          console.log('Datos del incidente cargados:', secciones)
        }
      } catch (error) {
        console.error('Error cargando datos del incidente:', error)
        this.$toast.error('Error cargando datos del incidente')
      }
    },

    async sincronizarTaxonomias() {
      this.sincronizando = true
      
      try {
        const response = await this.$api.post('/api/formulario-dinamico/sincronizar')
        
        if (response.data.success) {
          this.$toast.success('Taxonomías sincronizadas exitosamente')
          await this.cargarConfiguracion() // Recargar configuración
        }
      } catch (error) {
        console.error('Error sincronizando taxonomías:', error)
        this.$toast.error('Error sincronizando taxonomías')
      } finally {
        this.sincronizando = false
      }
    },

    toggleSeccion(seccion) {
      seccion.expandida = !seccion.expandida
      
      if (seccion.expandida) {
        this.seccionesExpandidas.add(seccion.codigoSeccion)
      } else {
        this.seccionesExpandidas.delete(seccion.codigoSeccion)
      }
    },

    expandirTodo() {
      this.secciones.forEach(seccion => {
        seccion.expandida = true
        this.seccionesExpandidas.add(seccion.codigoSeccion)
      })
    },

    contraerTodo() {
      this.secciones.forEach(seccion => {
        seccion.expandida = false
      })
      this.seccionesExpandidas.clear()
    },

    actualizarDatosSeccion(codigoSeccion, datos) {
      this.$set(this.datosFormulario, codigoSeccion, datos)
      
      // Validar sección automáticamente
      this.validarSeccion(codigoSeccion)
    },

    actualizarArchivosSeccion(codigoSeccion, archivos) {
      this.$set(this.archivosFormulario, codigoSeccion, archivos)
    },

    actualizarComentariosSeccion(codigoSeccion, comentarios) {
      this.$set(this.comentariosFormulario, codigoSeccion, comentarios)
    },

    validarSeccion(codigoSeccion) {
      const seccion = this.secciones.find(s => s.codigoSeccion === codigoSeccion)
      if (!seccion) return

      const datos = this.datosFormulario[codigoSeccion] || {}
      const campos = seccion.camposJSON.campos || []
      const errores = []

      // Validar campos obligatorios
      campos.forEach(campo => {
        if (campo.requerido && (!datos[campo.nombre] || datos[campo.nombre].toString().trim() === '')) {
          errores.push(`El campo "${campo.etiqueta}" es obligatorio`)
        }
      })

      this.$set(this.erroresValidacion, codigoSeccion, errores)
    },

    async validarFormulario() {
      if (!this.incidenteId) {
        this.$toast.warning('Debe guardar el incidente antes de validar')
        return
      }

      this.validando = true

      try {
        const response = await this.$api.get(`/api/formulario-dinamico/validar/${this.empresaId}/${this.incidenteId}`)
        
        if (response.data.success) {
          this.resultadosValidacion = response.data.data
          this.mostrarModalValidacion = true
          
          const resumen = this.resultadosValidacion.resumen
          this.formularioValido = resumen.EstadoGeneral === 'APTO'
          
          if (this.formularioValido) {
            this.$toast.success('Formulario válido para envío a ANCI')
          } else {
            this.$toast.warning(`Formulario requiere correcciones: ${resumen.ErroresCriticos} errores críticos`)
          }
        }
      } catch (error) {
        console.error('Error validando formulario:', error)
        this.$toast.error('Error validando formulario')
      } finally {
        this.validando = false
      }
    },

    async guardarBorrador() {
      await this.guardar('BORRADOR')
    },

    async guardarCompleto() {
      await this.guardar('COMPLETADO')
    },

    async guardar(estado) {
      this.guardando = true

      try {
        const payload = {
          secciones: this.datosFormulario,
          estado: estado
        }

        const response = await this.$api.post(`/api/formulario-dinamico/guardar/${this.empresaId}/${this.incidenteId}`, payload)
        
        if (response.data.success) {
          this.$toast.success('Formulario guardado exitosamente')
          
          if (estado === 'COMPLETADO') {
            this.$emit('formulario-completado', {
              empresaId: this.empresaId,
              incidenteId: this.incidenteId
            })
          }
        }
      } catch (error) {
        console.error('Error guardando formulario:', error)
        this.$toast.error('Error guardando formulario')
      } finally {
        this.guardando = false
      }
    },

    irASeccionError(seccion) {
      // Expandir sección con error y hacer scroll
      const seccionObj = this.secciones.find(s => s.codigoSeccion === seccion)
      if (seccionObj) {
        seccionObj.expandida = true
        this.$nextTick(() => {
          const elemento = document.querySelector(`[data-seccion="${seccion}"]`)
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth' })
          }
        })
      }
    },

    // Métodos de utilidad para la UI
    getSeccionClasses(seccion) {
      const estado = this.getEstadoSeccion(seccion)
      return {
        'seccion-completada': estado === 'completado',
        'seccion-parcial': estado === 'parcial',
        'seccion-obligatoria': seccion.esObligatorio,
        'seccion-taxonomia': seccion.tipoSeccion === 'TAXONOMIA'
      }
    },

    getSeccionBackgroundColor(seccion) {
      const estado = this.getEstadoSeccion(seccion)
      if (estado === 'completado') return '#f8fff9'
      if (estado === 'parcial') return '#fff8dc'
      return '#f8f9fa'
    },

    getEstadoSeccion(seccion) {
      const datos = this.datosFormulario[seccion.codigoSeccion] || {}
      const campos = seccion.camposJSON.campos || []
      const camposRequeridos = campos.filter(c => c.requerido)
      
      if (camposRequeridos.length === 0) {
        return Object.keys(datos).length > 0 ? 'completado' : 'vacio'
      }
      
      const camposCompletos = camposRequeridos.filter(campo => 
        datos[campo.nombre] && datos[campo.nombre].toString().trim() !== ''
      )
      
      if (camposCompletos.length === camposRequeridos.length) return 'completado'
      if (camposCompletos.length > 0) return 'parcial'
      return 'vacio'
    },

    getEstadoSeccionLabel(seccion) {
      const estado = this.getEstadoSeccion(seccion)
      switch (estado) {
        case 'completado': return 'Completado'
        case 'parcial': return 'Parcial'
        case 'vacio': return 'Pendiente'
        default: return 'Pendiente'
      }
    },

    getTipoSeccionLabel(tipo) {
      switch (tipo) {
        case 'FIJA': return 'Fija'
        case 'TAXONOMIA': return 'Taxonomía'
        case 'ESPECIAL': return 'Especial'
        case 'CONDICIONAL': return 'Condicional'
        default: return tipo
      }
    },

    getArchivosSeccion(seccion) {
      return (this.archivosFormulario[seccion.codigoSeccion] || []).length
    }
  }
}
</script>

<style scoped>
.formulario-dinamico-anci {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.formulario-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.formulario-titulo {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empresa-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.empresa-nombre {
  font-size: 1.1rem;
  font-weight: 500;
}

.empresa-tipo {
  font-size: 0.9rem;
  opacity: 0.9;
}

.formulario-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-card i {
  font-size: 1.5rem;
  color: #667eea;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

.formulario-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.formulario-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.accordion-item {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 10px;
}

.seccion-header {
  background: white;
  border: none;
  width: 100%;
  padding: 15px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.seccion-header:hover {
  background: #f8f9fa;
}

.seccion-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.seccion-titulo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.seccion-icono {
  color: #667eea;
}

.seccion-titulo {
  font-weight: 600;
  font-size: 1.1rem;
}

.seccion-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-obligatorio {
  background: #dc3545;
  color: white;
}

.badge-tipo {
  background: #6c757d;
  color: white;
}

.badge-fija {
  background: #007bff;
  color: white;
}

.badge-taxonomia {
  background: #e83e8c;
  color: white;
}

.badge-especial {
  background: #fd7e14;
  color: white;
}

.badge-archivos {
  background: #17a2b8;
  color: white;
}

.seccion-estado {
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
}

.estado-completado {
  background: #d4edda;
  color: #155724;
}

.estado-parcial {
  background: #fff3cd;
  color: #856404;
}

.estado-vacio {
  background: #f8d7da;
  color: #721c24;
}

.accordion-chevron {
  transition: transform 0.3s ease;
}

.accordion-chevron.rotated {
  transform: rotate(180deg);
}

.seccion-descripcion {
  background: #e7f3ff;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0c5460;
}

.seccion-campos-container {
  margin-top: 15px;
}

.formulario-acciones {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-container i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #667eea;
}

.error-container i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .formulario-acciones {
    flex-direction: column;
  }
  
  .seccion-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>