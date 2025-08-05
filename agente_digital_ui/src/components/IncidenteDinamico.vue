<template>
  <div class="incidente-dinamico">
    <!-- Header con información del incidente -->
    <div class="incidente-header mb-4">
      <h2>{{ incidente.Titulo || 'Nuevo Incidente' }}</h2>
      <div class="row">
        <div class="col-md-4">
          <small class="text-muted">ID: {{ incidente.IDVisible }}</small>
        </div>
        <div class="col-md-4">
          <small class="text-muted">Empresa: {{ tipoEmpresa }}</small>
        </div>
        <div class="col-md-4">
          <div class="progress" style="height: 20px;">
            <div class="progress-bar" 
                 :class="getProgressClass(progresoGeneral)"
                 :style="{width: progresoGeneral + '%'}">
              {{ progresoGeneral }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sistema de Acordeones Dinámico -->
    <div class="accordion" id="acordeonIncidente">
      <!-- Acordeón por cada sección aplicable -->
      <div v-for="(seccion, index) in secciones" 
           :key="seccion.seccion_id"
           class="accordion-item mb-2">
        
        <!-- Header del acordeón -->
        <h2 class="accordion-header" :id="'heading' + seccion.seccion_id">
          <button class="accordion-button" 
                  :class="{ collapsed: !seccionesAbiertas[seccion.seccion_id] }"
                  type="button"
                  @click="toggleSeccion(seccion.seccion_id)"
                  :style="{ backgroundColor: seccion.tiene_contenido ? seccion.color + '20' : '' }">
            
            <!-- Icono y título -->
            <div class="d-flex align-items-center w-100">
              <i :class="'fas fa-' + (seccion.icono || 'folder')" 
                 :style="{ color: seccion.tiene_contenido ? seccion.color : '#6c757d' }"
                 class="me-2"></i>
              
              <span class="flex-grow-1">
                <strong>{{ index + 1 }}. {{ seccion.titulo }}</strong>
                <span v-if="seccion.tipo === 'TAXONOMIA'" class="badge bg-info ms-2">Taxonomía</span>
              </span>
              
              <!-- Indicadores de contenido -->
              <div class="d-flex gap-2 me-3">
                <span v-if="seccion.total_comentarios > 0" 
                      class="badge bg-primary">
                  <i class="fas fa-comment"></i> {{ seccion.total_comentarios }}
                </span>
                <span v-if="seccion.total_archivos > 0" 
                      class="badge bg-success">
                  <i class="fas fa-paperclip"></i> {{ seccion.total_archivos }}
                </span>
                <span v-if="seccion.porcentaje > 0" 
                      class="badge" 
                      :class="getBadgeClass(seccion.porcentaje)">
                  {{ seccion.porcentaje }}%
                </span>
              </div>
            </div>
          </button>
        </h2>

        <!-- Contenido del acordeón -->
        <div :id="'collapse' + seccion.seccion_id"
             class="accordion-collapse collapse"
             :class="{ show: seccionesAbiertas[seccion.seccion_id] }">
          <div class="accordion-body">
            
            <!-- Descripción de la sección -->
            <p class="text-muted mb-3">{{ seccion.descripcion }}</p>

            <!-- Formulario dinámico según campos JSON -->
            <div v-if="seccion.campos" class="mb-4">
              <h5>Datos de la sección</h5>
              <div class="row">
                <div v-for="campo in obtenerCampos(seccion.campos)" 
                     :key="campo"
                     class="col-md-6 mb-3">
                  <label :for="'campo_' + seccion.seccion_id + '_' + campo" 
                         class="form-label">
                    {{ formatearNombreCampo(campo) }}
                  </label>
                  <textarea v-if="esTextarea(campo)"
                           :id="'campo_' + seccion.seccion_id + '_' + campo"
                           v-model="seccion.datos[campo]"
                           class="form-control"
                           rows="3"
                           @change="guardarSeccion(seccion)">
                  </textarea>
                  <input v-else
                         :id="'campo_' + seccion.seccion_id + '_' + campo"
                         v-model="seccion.datos[campo]"
                         type="text"
                         class="form-control"
                         @change="guardarSeccion(seccion)">
                </div>
              </div>
            </div>

            <!-- Sección de Comentarios -->
            <div class="comentarios-section mb-4">
              <h5>
                Comentarios 
                <span class="badge bg-secondary">
                  {{ seccion.comentarios.length }}/{{ seccion.max_comentarios }}
                </span>
              </h5>
              
              <!-- Lista de comentarios -->
              <div v-if="seccion.comentarios.length > 0" class="comentarios-lista mb-3">
                <div v-for="comentario in seccion.comentarios" 
                     :key="comentario.numero"
                     class="card mb-2">
                  <div class="card-body py-2">
                    <div class="d-flex justify-content-between">
                      <small class="text-muted">
                        #{{ comentario.numero }} - {{ comentario.usuario }} - 
                        {{ formatearFecha(comentario.fecha) }}
                      </small>
                      <span v-if="comentario.tipo !== 'GENERAL'" 
                            class="badge bg-info">{{ comentario.tipo }}</span>
                    </div>
                    <p class="mb-0 mt-1">{{ comentario.texto }}</p>
                  </div>
                </div>
              </div>

              <!-- Agregar comentario -->
              <div v-if="seccion.comentarios.length < seccion.max_comentarios" 
                   class="agregar-comentario">
                <div class="input-group">
                  <input v-model="nuevosComentarios[seccion.seccion_id]"
                         type="text"
                         class="form-control"
                         placeholder="Agregar comentario..."
                         @keyup.enter="agregarComentario(seccion)">
                  <button class="btn btn-primary" 
                          @click="agregarComentario(seccion)"
                          :disabled="!nuevosComentarios[seccion.seccion_id]">
                    <i class="fas fa-plus"></i> Agregar
                  </button>
                </div>
              </div>
            </div>

            <!-- Sección de Archivos -->
            <div class="archivos-section">
              <h5>
                Evidencias 
                <span class="badge bg-secondary">
                  {{ seccion.archivos.length }}/{{ seccion.max_archivos }}
                </span>
                <small class="text-muted ms-2">
                  (Máx {{ seccion.max_size_mb }}MB por archivo)
                </small>
              </h5>

              <!-- Lista de archivos -->
              <div v-if="seccion.archivos.length > 0" class="archivos-lista mb-3">
                <div class="row">
                  <div v-for="archivo in seccion.archivos" 
                       :key="archivo.numero"
                       class="col-md-6 mb-2">
                    <div class="card">
                      <div class="card-body py-2">
                        <div class="d-flex align-items-center">
                          <i :class="getIconoArchivo(archivo.tipo)" 
                             class="me-2"></i>
                          <div class="flex-grow-1">
                            <div class="fw-bold small">{{ archivo.nombre_original }}</div>
                            <div class="text-muted small">
                              {{ formatearTamano(archivo.tamano_kb) }} - 
                              {{ formatearFecha(archivo.fecha) }}
                            </div>
                          </div>
                          <button class="btn btn-sm btn-danger"
                                  @click="eliminarArchivo(seccion, archivo)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Subir archivo -->
              <div v-if="seccion.archivos.length < seccion.max_archivos" 
                   class="subir-archivo">
                <div class="input-group">
                  <input type="file"
                         :id="'archivo_' + seccion.seccion_id"
                         class="form-control"
                         @change="prepararArchivo($event, seccion)"
                         :accept="tiposArchivosPermitidos">
                  <button class="btn btn-success"
                          @click="subirArchivo(seccion)"
                          :disabled="!archivosPreparados[seccion.seccion_id]">
                    <i class="fas fa-upload"></i> Subir
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="mt-4 d-flex justify-content-between">
      <button class="btn btn-secondary" @click="$router.back()">
        <i class="fas fa-arrow-left"></i> Volver
      </button>
      
      <div>
        <button class="btn btn-primary me-2" @click="guardarTodo()">
          <i class="fas fa-save"></i> Guardar Todo
        </button>
        <button class="btn btn-danger" @click="confirmarEliminar()">
          <i class="fas fa-trash"></i> Eliminar Incidente
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'IncidenteDinamico',
  props: {
    incidenteId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      incidente: {},
      secciones: [],
      tipoEmpresa: '',
      progresoGeneral: 0,
      seccionesAbiertas: {},
      nuevosComentarios: {},
      archivosPreparados: {},
      tiposArchivosPermitidos: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv,.zip',
      cargando: false
    }
  },
  mounted() {
    this.cargarIncidente()
  },
  methods: {
    async cargarIncidente() {
      try {
        this.cargando = true
        const response = await axios.get(`/api/incidente-dinamico/${this.incidenteId}`)
        
        if (response.data.success) {
          this.incidente = response.data.incidente
          this.secciones = response.data.secciones
          this.tipoEmpresa = this.incidente.Tipo_Empresa
          
          // Calcular progreso general
          const totalSecciones = this.secciones.length
          const seccionesConContenido = response.data.secciones_con_contenido
          this.progresoGeneral = Math.round((seccionesConContenido / totalSecciones) * 100)
          
          // Abrir secciones con contenido
          this.secciones.forEach(seccion => {
            if (seccion.tiene_contenido) {
              this.seccionesAbiertas[seccion.seccion_id] = true
            }
          })
        }
      } catch (error) {
        console.error('Error cargando incidente:', error)
        this.$swal.fire('Error', 'No se pudo cargar el incidente', 'error')
      } finally {
        this.cargando = false
      }
    },
    
    toggleSeccion(seccionId) {
      this.$set(this.seccionesAbiertas, seccionId, !this.seccionesAbiertas[seccionId])
    },
    
    obtenerCampos(camposJson) {
      try {
        const campos = JSON.parse(camposJson)
        return campos.campos || []
      } catch {
        return []
      }
    },
    
    formatearNombreCampo(campo) {
      return campo
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    },
    
    esTextarea(campo) {
      const camposTextarea = ['descripcion', 'analisis', 'acciones', 'observaciones', 'plan']
      return camposTextarea.some(c => campo.toLowerCase().includes(c))
    },
    
    async guardarSeccion(seccion) {
      try {
        const response = await axios.put(
          `/api/incidente-dinamico/${this.incidenteId}/seccion/${seccion.seccion_id}`,
          { datos: seccion.datos }
        )
        
        if (response.data.success) {
          seccion.estado = response.data.estado
          this.$swal.fire({
            icon: 'success',
            title: 'Guardado',
            text: 'Sección guardada correctamente',
            timer: 1500,
            showConfirmButton: false
          })
        }
      } catch (error) {
        console.error('Error guardando sección:', error)
        this.$swal.fire('Error', 'No se pudo guardar la sección', 'error')
      }
    },
    
    async agregarComentario(seccion) {
      const comentario = this.nuevosComentarios[seccion.seccion_id]
      if (!comentario) return
      
      try {
        const response = await axios.post(
          `/api/incidente-dinamico/${this.incidenteId}/seccion/${seccion.seccion_id}/comentario`,
          { comentario, tipo: 'GENERAL' }
        )
        
        if (response.data.success) {
          // Recargar sección
          await this.cargarIncidente()
          this.nuevosComentarios[seccion.seccion_id] = ''
        }
      } catch (error) {
        if (error.response?.data?.error) {
          this.$swal.fire('Error', error.response.data.error, 'error')
        } else {
          this.$swal.fire('Error', 'No se pudo agregar el comentario', 'error')
        }
      }
    },
    
    prepararArchivo(event, seccion) {
      const file = event.target.files[0]
      if (file) {
        // Validar tamaño
        const sizeMB = file.size / (1024 * 1024)
        if (sizeMB > seccion.max_size_mb) {
          this.$swal.fire('Error', `El archivo excede el límite de ${seccion.max_size_mb}MB`, 'error')
          event.target.value = ''
          return
        }
        
        this.archivosPreparados[seccion.seccion_id] = file
      }
    },
    
    async subirArchivo(seccion) {
      const file = this.archivosPreparados[seccion.seccion_id]
      if (!file) return
      
      try {
        const formData = new FormData()
        formData.append('archivo', file)
        formData.append('descripcion', '')
        
        const response = await axios.post(
          `/api/incidente-dinamico/${this.incidenteId}/seccion/${seccion.seccion_id}/archivo`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        if (response.data.success) {
          // Limpiar input y recargar
          document.getElementById(`archivo_${seccion.seccion_id}`).value = ''
          delete this.archivosPreparados[seccion.seccion_id]
          await this.cargarIncidente()
        }
      } catch (error) {
        if (error.response?.data?.error) {
          this.$swal.fire('Error', error.response.data.error, 'error')
        } else {
          this.$swal.fire('Error', 'No se pudo subir el archivo', 'error')
        }
      }
    },
    
    async eliminarArchivo(seccion, archivo) {
      // Por implementar: endpoint para eliminar archivo
      console.log('Eliminar archivo:', archivo)
    },
    
    async guardarTodo() {
      try {
        // Guardar todas las secciones con datos
        const promesas = this.secciones
          .filter(s => Object.keys(s.datos).length > 0)
          .map(s => this.guardarSeccion(s))
        
        await Promise.all(promesas)
        
        this.$swal.fire('Éxito', 'Todos los cambios guardados', 'success')
      } catch (error) {
        this.$swal.fire('Error', 'Error al guardar algunos cambios', 'error')
      }
    },
    
    async confirmarEliminar() {
      const result = await this.$swal.fire({
        title: '¿Eliminar incidente?',
        text: 'Esta acción eliminará permanentemente el incidente y todos sus archivos',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      })
      
      if (result.isConfirmed) {
        await this.eliminarIncidente()
      }
    },
    
    async eliminarIncidente() {
      try {
        const response = await axios.delete(`/api/incidente-dinamico/${this.incidenteId}`)
        
        if (response.data.success) {
          this.$swal.fire('Eliminado', 'El incidente ha sido eliminado', 'success')
          this.$router.push('/incidentes')
        }
      } catch (error) {
        this.$swal.fire('Error', 'No se pudo eliminar el incidente', 'error')
      }
    },
    
    getProgressClass(porcentaje) {
      if (porcentaje < 30) return 'bg-danger'
      if (porcentaje < 60) return 'bg-warning'
      if (porcentaje < 90) return 'bg-info'
      return 'bg-success'
    },
    
    getBadgeClass(porcentaje) {
      if (porcentaje < 30) return 'bg-danger'
      if (porcentaje < 60) return 'bg-warning'
      if (porcentaje < 90) return 'bg-info'
      return 'bg-success'
    },
    
    getIconoArchivo(tipo) {
      const iconos = {
        'pdf': 'fas fa-file-pdf text-danger',
        'doc': 'fas fa-file-word text-primary',
        'docx': 'fas fa-file-word text-primary',
        'xls': 'fas fa-file-excel text-success',
        'xlsx': 'fas fa-file-excel text-success',
        'png': 'fas fa-file-image text-info',
        'jpg': 'fas fa-file-image text-info',
        'jpeg': 'fas fa-file-image text-info',
        'zip': 'fas fa-file-archive text-warning'
      }
      
      const extension = tipo?.split('/').pop() || 'default'
      return iconos[extension] || 'fas fa-file text-secondary'
    },
    
    formatearTamano(kb) {
      if (kb < 1024) return `${kb} KB`
      return `${(kb / 1024).toFixed(1)} MB`
    },
    
    formatearFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.incidente-dinamico {
  padding: 20px;
}

.incidente-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.accordion-button {
  font-size: 1.1rem;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f3ff;
}

.comentarios-lista {
  max-height: 300px;
  overflow-y: auto;
}

.archivos-lista {
  max-height: 400px;
  overflow-y: auto;
}

.badge {
  font-size: 0.75rem;
}
</style>