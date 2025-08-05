<template>
  <div class="gestor-informes-anci">
    <!-- Header -->
    <div class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="fas fa-file-word me-2"></i>
          Gestor de Informes ANCI
        </h4>
      </div>
      <div class="card-body">
        <p class="text-muted">
          Genera informes oficiales ANCI basados en plantillas Word. 
          El sistema reemplaza automáticamente los datos del incidente en la plantilla.
        </p>
      </div>
    </div>

    <!-- Plantillas Disponibles -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-folder-open me-2"></i>
          Plantillas Disponibles
        </h5>
      </div>
      <div class="card-body">
        <div v-if="cargandoPlantillas" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div v-else-if="plantillas.length === 0" class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          No se encontraron plantillas ANCI. Verifique que existe el archivo:
          <br>
          <code>{{ plantillaActual }}</code>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Ubicación</th>
                  <th>Tamaño</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="plantilla in plantillas" :key="plantilla.ruta">
                  <td>
                    <i class="fas fa-file-word text-primary me-2"></i>
                    {{ plantilla.nombre }}
                  </td>
                  <td>
                    <small class="text-muted">{{ plantilla.ruta }}</small>
                  </td>
                  <td>{{ formatearTamano(plantilla.tamano) }}</td>
                  <td>
                    <button 
                      class="btn btn-sm btn-success"
                      @click="seleccionarPlantilla(plantilla)"
                      :disabled="plantilla.ruta === plantillaActual">
                      <i class="fas fa-check"></i>
                      {{ plantilla.ruta === plantillaActual ? 'Seleccionada' : 'Seleccionar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="alert alert-info mt-3">
            <strong>Plantilla actual:</strong><br>
            <code>{{ plantillaActual }}</code>
          </div>
        </div>
      </div>
    </div>

    <!-- Vista Previa de Marcadores -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-tags me-2"></i>
          Marcadores Disponibles
        </h5>
      </div>
      <div class="card-body">
        <p class="text-muted mb-3">
          Estos marcadores en la plantilla serán reemplazados automáticamente con los datos del incidente:
        </p>
        
        <div class="row">
          <div class="col-md-6">
            <h6>Información Básica</h6>
            <ul class="list-unstyled">
              <li><code>{{`{{FECHA_REPORTE}}`}}</code> - Fecha actual</li>
              <li><code>{{`{{TIPO_REPORTE}}`}}</code> - Tipo de informe</li>
              <li><code>{{`{{ID_INCIDENTE}}`}}</code> - ID del incidente</li>
              <li><code>{{`{{TITULO_INCIDENTE}}`}}</code> - Título</li>
              <li><code>{{`{{FECHA_DETECCION}}`}}</code> - Fecha detección</li>
              <li><code>{{`{{FECHA_OCURRENCIA}}`}}</code> - Fecha ocurrencia</li>
              <li><code>{{`{{CRITICIDAD}}`}}</code> - Nivel de criticidad</li>
              <li><code>{{`{{ESTADO}}`}}</code> - Estado actual</li>
            </ul>
          </div>
          <div class="col-md-6">
            <h6>Información ANCI</h6>
            <ul class="list-unstyled">
              <li><code>{{`{{TIPO_EMPRESA}}`}}</code> - OIV/PSE/AMBAS</li>
              <li><code>{{`{{SISTEMAS_AFECTADOS}}`}}</code> - Sistemas</li>
              <li><code>{{`{{SERVICIOS_INTERRUMPIDOS}}`}}</code> - Servicios</li>
              <li><code>{{`{{REPORTE_ANCI_ID}}`}}</code> - ID ANCI</li>
              <li><code>{{`{{TIPO_AMENAZA}}`}}</code> - Tipo amenaza</li>
              <li><code>{{`{{CAUSA_RAIZ}}`}}</code> - Causa raíz</li>
              <li><code>{{`{{LECCIONES_APRENDIDAS}}`}}</code> - Lecciones</li>
              <li><code>{{`{{PLAN_MEJORA}}`}}</code> - Plan de mejora</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Archivos Semilla -->
    <div v-if="incidenteId" class="card mb-4">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0">
          <i class="fas fa-seedling me-2"></i>
          Archivos Semilla ANCI
        </h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <p class="text-muted">
            Los archivos semilla son plantillas predefinidas que facilitan la generación de reportes ANCI.
            Puede subir archivos de referencia para cada tipo de reporte.
          </p>
        </div>
        
        <!-- Plantillas ANCI disponibles -->
        <div class="mb-4">
          <h6>Plantillas ANCI por Tipo de Reporte</h6>
          <div v-if="cargandoPlantillasAnci" class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div v-else class="row">
            <div v-for="plantilla in plantillasAnci" :key="plantilla.id" class="col-md-6 mb-3">
              <div class="card border-secondary">
                <div class="card-body">
                  <h6 class="card-title text-primary">{{ plantilla.nombre }}</h6>
                  <p class="card-text small">{{ plantilla.descripcion }}</p>
                  <p class="card-text">
                    <small class="text-muted">
                      <i class="fas fa-clock me-1"></i>Tiempo límite: {{ plantilla.tiempo_limite }}
                    </small>
                  </p>
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="generarInformeConPlantilla(plantilla.tipo)">
                    <i class="fas fa-file-download me-1"></i>
                    Generar {{ plantilla.tipo }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Lista de archivos semilla -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">Archivos Semilla Subidos</h6>
            <button class="btn btn-sm btn-primary" @click="mostrarModalSubirSemilla">
              <i class="fas fa-upload me-1"></i>
              Subir Archivo Semilla
            </button>
          </div>
          
          <div v-if="cargandoSemillas" class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          
          <div v-else-if="archivosSemilla.length === 0" class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            No hay archivos semilla subidos para este incidente.
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Sección</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="archivo in archivosSemilla" :key="archivo.ArchivoID">
                  <td>
                    <i class="fas fa-file text-warning me-1"></i>
                    {{ archivo.NombreArchivo }}
                  </td>
                  <td>Sección {{ archivo.SeccionID }}</td>
                  <td>{{ archivo.Descripcion }}</td>
                  <td>{{ formatearFecha(archivo.FechaSubida) }}</td>
                  <td>
                    <button 
                      class="btn btn-sm btn-info me-1"
                      @click="descargarArchivoSemilla(archivo.ArchivoID)">
                      <i class="fas fa-download"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-danger"
                      @click="eliminarArchivoSemilla(archivo)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Subir Archivo Semilla -->
    <div class="modal fade" id="modalSubirSemilla" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-upload me-2"></i>
              Subir Archivo Semilla
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="subirArchivoSemilla">
              <div class="mb-3">
                <label class="form-label">Archivo</label>
                <input 
                  type="file" 
                  class="form-control" 
                  ref="archivoSemilla"
                  accept=".docx,.xlsx,.pdf,.json,.txt"
                  required>
                <small class="text-muted">
                  Formatos permitidos: DOCX, XLSX, PDF, JSON, TXT
                </small>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Sección</label>
                <select v-model="semillaSeccion" class="form-select" required>
                  <option value="1">Sección 1 - Datos Generales</option>
                  <option value="2">Sección 2 - Análisis Inicial</option>
                  <option value="3">Sección 3 - Impacto</option>
                  <option value="4">Sección 4 - Acciones</option>
                  <option value="5">Sección 5 - Documentación</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea 
                  v-model="semillaDescripcion" 
                  class="form-control" 
                  rows="3"
                  placeholder="Descripción del archivo semilla...">
                </textarea>
              </div>
              
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="subiendoSemilla">
                  <span v-if="subiendoSemilla">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Subiendo...
                  </span>
                  <span v-else>
                    <i class="fas fa-upload me-2"></i>
                    Subir
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Generar Informe (si viene con incidenteId) -->
    <div v-if="incidenteId" class="card mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">
          <i class="fas fa-file-export me-2"></i>
          Generar Informe para Incidente #{{ incidenteId }}
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">Tipo de Informe</label>
            <select v-model="tipoInforme" class="form-select">
              <option value="completo">Completo</option>
              <option value="preliminar">Preliminar</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div class="col-md-6 d-flex align-items-end">
            <button 
              class="btn btn-success w-100"
              @click="generarInforme"
              :disabled="generandoInforme">
              <span v-if="generandoInforme">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Generando...
              </span>
              <span v-else>
                <i class="fas fa-file-download me-2"></i>
                Generar Informe ANCI
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Historial de Informes -->
    <div v-if="incidenteId" class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-history me-2"></i>
          Historial de Informes Generados
        </h5>
      </div>
      <div class="card-body">
        <div v-if="cargandoHistorial" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div v-else-if="historial.length === 0" class="alert alert-info">
          No se han generado informes para este incidente.
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Tamaño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="informe in historial" :key="informe.nombre">
                <td>
                  <i class="fas fa-file-word text-primary me-2"></i>
                  {{ informe.nombre }}
                </td>
                <td>
                  <span class="badge" :class="getBadgeTipo(informe.nombre)">
                    {{ getTipoInforme(informe.nombre) }}
                  </span>
                </td>
                <td>{{ formatearFecha(informe.fecha_creacion) }}</td>
                <td>{{ formatearTamano(informe.tamano) }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-primary"
                    @click="descargarInforme(informe.nombre)">
                    <i class="fas fa-download"></i>
                    Descargar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Ejemplo de Plantilla -->
    <div class="card mt-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-code me-2"></i>
          Ejemplo de Plantilla
        </h5>
      </div>
      <div class="card-body">
        <p>La plantilla Word debe contener texto como este:</p>
        <div class="bg-light p-3 rounded">
          <pre class="mb-0">INFORME DE INCIDENTE DE CIBERSEGURIDAD
          
Fecha del Reporte: {{`{{FECHA_REPORTE}}`}}
Tipo de Reporte: {{`{{TIPO_REPORTE}}`}}

DATOS DEL INCIDENTE
ID del Incidente: {{`{{ID_INCIDENTE}}`}}
Título: {{`{{TITULO_INCIDENTE}}`}}
Fecha de Detección: {{`{{FECHA_DETECCION}}`}}
Criticidad: {{`{{CRITICIDAD}}`}}

EMPRESA AFECTADA
ID Empresa: {{`{{EMPRESA_ID}}`}}
Tipo: {{`{{TIPO_EMPRESA}}`}}

DESCRIPCIÓN DEL INCIDENTE
Sistemas Afectados: {{`{{SISTEMAS_AFECTADOS}}`}}
Servicios Interrumpidos: {{`{{SERVICIOS_INTERRUMPIDOS}}`}}

[... más contenido ...]</pre>
        </div>
        <p class="text-muted mt-2">
          <small>El sistema reemplazará automáticamente todos los marcadores con los datos reales.</small>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'GestorInformesANCI',
  props: {
    incidenteId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      plantillas: [],
      plantillaActual: '',
      cargandoPlantillas: false,
      tipoInforme: 'completo',
      generandoInforme: false,
      historial: [],
      cargandoHistorial: false,
      // Archivos semilla
      archivosSemilla: [],
      cargandoSemillas: false,
      subiendoSemilla: false,
      semillaSeccion: '1',
      semillaDescripcion: 'Archivo semilla ANCI',
      // Plantillas ANCI
      plantillasAnci: [],
      cargandoPlantillasAnci: false
    }
  },
  mounted() {
    this.cargarPlantillas()
    if (this.incidenteId) {
      this.cargarHistorial()
      this.cargarArchivosSemilla()
      this.cargarPlantillasAnci()
    }
  },
  methods: {
    async cargarPlantillas() {
      try {
        this.cargandoPlantillas = true
        const response = await axios.get('http://localhost:5000/api/informes-anci/plantillas')
        
        if (response.data.success) {
          this.plantillas = response.data.plantillas
          this.plantillaActual = response.data.plantilla_actual
        }
      } catch (error) {
        console.error('Error cargando plantillas:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las plantillas ANCI'
        })
      } finally {
        this.cargandoPlantillas = false
      }
    },
    
    async seleccionarPlantilla(plantilla) {
      try {
        const response = await axios.post('http://localhost:5000/api/informes-anci/configurar-plantilla', {
          ruta_plantilla: plantilla.ruta
        })
        
        if (response.data.success) {
          this.plantillaActual = plantilla.ruta
          this.$swal.fire({
            icon: 'success',
            title: 'Plantilla Configurada',
            text: 'La plantilla ha sido seleccionada correctamente'
          })
        }
      } catch (error) {
        if (error.response?.status === 403) {
          this.$swal.fire({
            icon: 'error',
            title: 'Sin Permisos',
            text: 'Solo los administradores pueden cambiar la plantilla'
          })
        } else {
          this.$swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo configurar la plantilla'
          })
        }
      }
    },
    
    async generarInforme() {
      try {
        this.generandoInforme = true
        
        const response = await axios.post(
          `http://localhost:5000/api/informes-anci/generar/${this.incidenteId}`,
          { tipo_informe: this.tipoInforme }
        )
        
        if (response.data.success) {
          this.$swal.fire({
            icon: 'success',
            title: 'Informe Generado',
            html: `
              <p>El informe ANCI ha sido generado exitosamente.</p>
              <p><strong>Archivo:</strong> ${response.data.archivo}</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Descargar',
            cancelButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.descargarInforme(response.data.archivo)
            }
          })
          
          // Recargar historial
          this.cargarHistorial()
        }
      } catch (error) {
        console.error('Error generando informe:', error)
        
        let mensaje = 'No se pudo generar el informe'
        if (error.response?.data?.error) {
          mensaje = error.response.data.error
          if (error.response.data.sugerencia) {
            mensaje += '\n\n' + error.response.data.sugerencia
          }
        }
        
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje
        })
      } finally {
        this.generandoInforme = false
      }
    },
    
    async cargarHistorial() {
      try {
        this.cargandoHistorial = true
        const response = await axios.get(`http://localhost:5000/api/informes-anci/historial/${this.incidenteId}`)
        
        if (response.data.success) {
          this.historial = response.data.informes
        }
      } catch (error) {
        console.error('Error cargando historial:', error)
      } finally {
        this.cargandoHistorial = false
      }
    },
    
    descargarInforme(nombreArchivo) {
      const url = `http://localhost:5000/api/informes-anci/descargar/${this.incidenteId}/${nombreArchivo}`
      window.open(url, '_blank')
    },
    
    formatearTamano(bytes) {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    },
    
    formatearFecha(timestamp) {
      if (!timestamp) return ''
      const fecha = new Date(timestamp * 1000)
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getTipoInforme(nombreArchivo) {
      if (nombreArchivo.includes('completo')) return 'COMPLETO'
      if (nombreArchivo.includes('preliminar')) return 'PRELIMINAR'
      if (nombreArchivo.includes('final')) return 'FINAL'
      return 'INFORME'
    },
    
    getBadgeTipo(nombreArchivo) {
      const tipo = this.getTipoInforme(nombreArchivo)
      return {
        'bg-primary': tipo === 'COMPLETO',
        'bg-warning text-dark': tipo === 'PRELIMINAR',
        'bg-success': tipo === 'FINAL',
        'bg-secondary': tipo === 'INFORME'
      }
    },
    
    // Métodos para archivos semilla
    async cargarArchivosSemilla() {
      try {
        this.cargandoSemillas = true
        const response = await axios.get(`http://localhost:5000/api/incidente/${this.incidenteId}/archivos-semilla`)
        
        if (response.data.success) {
          this.archivosSemilla = response.data.archivos_semilla
        }
      } catch (error) {
        console.error('Error cargando archivos semilla:', error)
      } finally {
        this.cargandoSemillas = false
      }
    },
    
    async cargarPlantillasAnci() {
      try {
        this.cargandoPlantillasAnci = true
        const response = await axios.get(`http://localhost:5000/api/incidente/${this.incidenteId}/plantillas-anci`)
        
        if (response.data.success) {
          this.plantillasAnci = response.data.plantillas
        }
      } catch (error) {
        console.error('Error cargando plantillas ANCI:', error)
      } finally {
        this.cargandoPlantillasAnci = false
      }
    },
    
    mostrarModalSubirSemilla() {
      const modal = new bootstrap.Modal(document.getElementById('modalSubirSemilla'))
      modal.show()
    },
    
    async subirArchivoSemilla() {
      try {
        this.subiendoSemilla = true
        
        const archivo = this.$refs.archivoSemilla.files[0]
        if (!archivo) {
          this.$swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Debe seleccionar un archivo'
          })
          return
        }
        
        const formData = new FormData()
        formData.append('archivo', archivo)
        formData.append('seccion_id', this.semillaSeccion)
        formData.append('descripcion', this.semillaDescripcion)
        formData.append('subido_por', 'Usuario')
        
        const response = await axios.post(
          `http://localhost:5000/api/incidente/${this.incidenteId}/archivos-semilla`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        if (response.data.success) {
          this.$swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Archivo semilla subido correctamente'
          })
          
          // Cerrar modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalSubirSemilla'))
          modal.hide()
          
          // Limpiar formulario
          this.$refs.archivoSemilla.value = ''
          this.semillaDescripcion = 'Archivo semilla ANCI'
          
          // Recargar lista
          this.cargarArchivosSemilla()
        }
      } catch (error) {
        console.error('Error subiendo archivo semilla:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo subir el archivo semilla'
        })
      } finally {
        this.subiendoSemilla = false
      }
    },
    
    async descargarArchivoSemilla(archivoId) {
      const url = `http://localhost:5000/api/incidente/${this.incidenteId}/descargar-semilla/${archivoId}`
      window.open(url, '_blank')
    },
    
    async eliminarArchivoSemilla(archivo) {
      const result = await this.$swal.fire({
        icon: 'warning',
        title: '¿Eliminar archivo semilla?',
        text: `¿Está seguro de eliminar el archivo ${archivo.NombreArchivo}?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
      })
      
      if (result.isConfirmed) {
        try {
          // Por ahora solo actualizamos la lista localmente
          this.archivosSemilla = this.archivosSemilla.filter(a => a.ArchivoID !== archivo.ArchivoID)
          
          this.$swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El archivo semilla ha sido eliminado'
          })
        } catch (error) {
          console.error('Error eliminando archivo semilla:', error)
          this.$swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el archivo'
          })
        }
      }
    },
    
    async generarInformeConPlantilla(tipoReporte) {
      try {
        this.generandoInforme = true
        
        const response = await axios.post(
          `http://localhost:5000/api/incidente/${this.incidenteId}/generar-documento-anci`,
          { 
            tipo_reporte: tipoReporte,
            formato: 'word'
          }
        )
        
        // Si la respuesta es exitosa, descargar el archivo
        if (response.headers['content-type'].includes('application/')) {
          // Crear blob y descargar
          const blob = new Blob([response.data], { type: response.headers['content-type'] })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `ANCI_${tipoReporte}_${this.incidenteId}_${new Date().toISOString().split('T')[0]}.docx`
          link.click()
          window.URL.revokeObjectURL(url)
          
          this.$swal.fire({
            icon: 'success',
            title: 'Informe Generado',
            text: `El informe ${tipoReporte} ha sido generado y descargado exitosamente`
          })
        }
      } catch (error) {
        console.error('Error generando informe con plantilla:', error)
        this.$swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el informe con la plantilla'
        })
      } finally {
        this.generandoInforme = false
      }
    }
  }
}
</script>

<style scoped>
.gestor-informes-anci {
  padding: 20px;
}

pre {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #333;
}

code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  color: #d73a49;
}

.table td {
  vertical-align: middle;
}
</style>