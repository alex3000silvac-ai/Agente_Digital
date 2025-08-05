<template>
  <div class="formulario-envio-anci">
    <div class="formulario-header">
      <h3>
        <i class="ph ph-paper-plane-tilt"></i>
        Envío de {{ getTipoInforme() }} a ANCI
      </h3>
      <p class="descripcion">
        Complete o verifique la información antes de enviar el informe oficial
      </p>
    </div>

    <div class="formulario-body">
      <!-- Sección 1: Datos del Incidente -->
      <div class="seccion">
        <h4><i class="ph ph-file-text"></i> Datos del Incidente</h4>
        <div class="campo-grid">
          <div class="campo">
            <label>Título del Incidente</label>
            <input 
              type="text" 
              v-model="formulario.titulo" 
              class="form-control"
              readonly
            />
          </div>
          <div class="campo">
            <label>Fecha de Detección</label>
            <input 
              type="datetime-local" 
              v-model="formulario.fechaDeteccion" 
              class="form-control"
              readonly
            />
          </div>
          <div class="campo">
            <label>Criticidad</label>
            <select v-model="formulario.criticidad" class="form-control">
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
          <div class="campo">
            <label>Tipo de Empresa</label>
            <input 
              type="text" 
              :value="`${formulario.tipoEmpresa} (${getTiemposPlazo()})`" 
              class="form-control"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- Sección 2: Descripción del Incidente -->
      <div class="seccion">
        <h4><i class="ph ph-text-align-left"></i> Descripción del Incidente</h4>
        <div class="campo">
          <label>Descripción Inicial</label>
          <textarea 
            v-model="formulario.descripcionInicial" 
            class="form-control"
            rows="4"
            placeholder="Describa brevemente el incidente..."
          ></textarea>
          <small class="text-muted">{{ formulario.descripcionInicial.length }}/500 caracteres</small>
        </div>
        
        <div class="campo" v-if="tipoInforme !== 'alertaTemprana'">
          <label>Análisis Detallado</label>
          <textarea 
            v-model="formulario.analisisDetallado" 
            class="form-control"
            rows="6"
            placeholder="Análisis completo del incidente, vector de ataque, causa raíz..."
          ></textarea>
        </div>
      </div>

      <!-- Sección 3: Taxonomías -->
      <div class="seccion">
        <h4><i class="ph ph-tag"></i> Taxonomías ANCI</h4>
        <div class="taxonomias-seleccionadas">
          <div v-if="formulario.taxonomias.length === 0" class="alert alert-warning">
            <i class="ph ph-warning"></i>
            No hay taxonomías seleccionadas. Debe seleccionar al menos una.
          </div>
          <div v-else class="taxonomia-list">
            <div 
              v-for="tax in formulario.taxonomias" 
              :key="tax.id"
              class="taxonomia-item"
            >
              <span class="taxonomia-nombre">{{ tax.categoria }} - {{ tax.subcategoria }}</span>
              <button @click="removerTaxonomia(tax.id)" class="btn-remove">
                <i class="ph ph-x"></i>
              </button>
            </div>
          </div>
          <button @click="abrirSelectorTaxonomias" class="btn-agregar-taxonomia">
            <i class="ph ph-plus"></i>
            Agregar Taxonomía
          </button>
        </div>
      </div>

      <!-- Sección 4: Archivos Adjuntos -->
      <div class="seccion">
        <h4><i class="ph ph-paperclip"></i> Archivos de Evidencia</h4>
        
        <!-- Archivos del expediente semilla -->
        <div class="subseccion">
          <h5>Archivos del Expediente Semilla</h5>
          <div class="archivos-semilla">
            <div 
              v-for="archivo in archivosExpediente" 
              :key="archivo.id"
              class="archivo-item"
              :class="{ 'seleccionado': archivosSeleccionados.includes(archivo.id) }"
              @click="toggleArchivoSeleccion(archivo.id)"
            >
              <div class="archivo-check">
                <input 
                  type="checkbox" 
                  :checked="archivosSeleccionados.includes(archivo.id)"
                  @click.stop="toggleArchivoSeleccion(archivo.id)"
                />
              </div>
              <div class="archivo-info">
                <i :class="getIconoArchivo(archivo.tipo)"></i>
                <span class="archivo-nombre">{{ archivo.nombre }}</span>
                <span class="archivo-tamano">{{ formatearTamano(archivo.tamano) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nuevos archivos -->
        <div class="subseccion">
          <h5>Agregar Nuevos Archivos</h5>
          <div class="upload-area" @click="$refs.fileInput.click()" @drop="handleDrop" @dragover.prevent>
            <input 
              ref="fileInput" 
              type="file" 
              multiple 
              @change="handleFileSelect"
              style="display: none"
            />
            <i class="ph ph-upload"></i>
            <p>Haga clic o arrastre archivos aquí</p>
            <small>Máximo 10MB por archivo</small>
          </div>
          
          <div v-if="nuevosArchivos.length > 0" class="nuevos-archivos">
            <div 
              v-for="(archivo, index) in nuevosArchivos" 
              :key="index"
              class="archivo-item nuevo"
            >
              <div class="archivo-info">
                <i :class="getIconoArchivo(archivo.type)"></i>
                <span class="archivo-nombre">{{ archivo.name }}</span>
                <span class="archivo-tamano">{{ formatearTamano(archivo.size) }}</span>
              </div>
              <button @click="removerNuevoArchivo(index)" class="btn-remove">
                <i class="ph ph-x"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 5: Impacto (para informes completos) -->
      <div class="seccion" v-if="tipoInforme === 'completo'">
        <h4><i class="ph ph-warning-octagon"></i> Evaluación de Impacto</h4>
        <div class="campo-grid">
          <div class="campo">
            <label>Sistemas Afectados</label>
            <input 
              type="text" 
              v-model="formulario.sistemasAfectados" 
              class="form-control"
              placeholder="Ej: Servidor web, base de datos..."
            />
          </div>
          <div class="campo">
            <label>Usuarios Impactados</label>
            <input 
              type="number" 
              v-model="formulario.usuariosImpactados" 
              class="form-control"
              placeholder="Número aproximado"
            />
          </div>
          <div class="campo">
            <label>Duración de la Interrupción</label>
            <input 
              type="text" 
              v-model="formulario.duracionInterrupcion" 
              class="form-control"
              placeholder="Ej: 2 horas 30 minutos"
            />
          </div>
          <div class="campo">
            <label>Alcance Geográfico</label>
            <select v-model="formulario.alcanceGeografico" class="form-control">
              <option value="Local">Local</option>
              <option value="Regional">Regional</option>
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sección 6: Acciones y Medidas -->
      <div class="seccion" v-if="tipoInforme !== 'alertaTemprana'">
        <h4><i class="ph ph-shield-check"></i> Acciones y Medidas</h4>
        <div class="campo">
          <label>Medidas de Contención Aplicadas</label>
          <textarea 
            v-model="formulario.medidasContencion" 
            class="form-control"
            rows="4"
            placeholder="Describa las medidas tomadas..."
          ></textarea>
        </div>
        
        <div class="campo" v-if="tipoInforme === 'completo'">
          <label>Plan de Recuperación</label>
          <textarea 
            v-model="formulario.planRecuperacion" 
            class="form-control"
            rows="4"
            placeholder="Detalle el plan de recuperación..."
          ></textarea>
        </div>
      </div>

      <!-- Sección 7: Solicitud de Apoyo CSIRT -->
      <div class="seccion">
        <h4><i class="ph ph-lifebuoy"></i> Solicitud de Apoyo</h4>
        <div class="campo">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="formulario.requiereCSIRT"
            />
            Requiere asistencia del CSIRT Nacional
          </label>
        </div>
        
        <div v-if="formulario.requiereCSIRT" class="campo">
          <label>Tipo de apoyo requerido</label>
          <select v-model="formulario.tipoApoyoCSIRT" class="form-control">
            <option value="">Seleccione...</option>
            <option value="analisis_forense">Análisis Forense</option>
            <option value="contencion">Apoyo en Contención</option>
            <option value="comunicaciones">Gestión de Comunicaciones</option>
            <option value="coordinacion">Coordinación con otras entidades</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <div class="formulario-footer">
      <div class="info-plazo">
        <i class="ph ph-clock"></i>
        <span>Plazo para {{ getTipoInforme() }}: {{ getPlazoRestante() }}</span>
      </div>
      
      <div class="acciones">
        <button @click="guardarBorrador" class="btn btn-secondary">
          <i class="ph ph-floppy-disk"></i>
          Guardar Borrador
        </button>
        
        <button @click="validarYEnviar" class="btn btn-primary" :disabled="enviando">
          <i v-if="!enviando" class="ph ph-paper-plane-tilt"></i>
          <div v-else class="spinner-border spinner-border-sm" role="status"></div>
          {{ enviando ? 'Enviando...' : 'Enviar a ANCI' }}
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay" @click.self="mostrarConfirmacion = false">
      <div class="modal-confirmacion">
        <h4>Confirmar Envío</h4>
        <p>¿Está seguro de enviar este {{ getTipoInforme() }} a ANCI?</p>
        <p class="text-warning">
          <i class="ph ph-warning"></i>
          Esta acción no se puede deshacer y quedará registrada oficialmente.
        </p>
        
        <div class="resumen-envio">
          <h5>Resumen del envío:</h5>
          <ul>
            <li>Tipo: {{ getTipoInforme() }}</li>
            <li>Taxonomías: {{ formulario.taxonomias.length }}</li>
            <li>Archivos: {{ archivosSeleccionados.length + nuevosArchivos.length }}</li>
            <li>Solicita CSIRT: {{ formulario.requiereCSIRT ? 'Sí' : 'No' }}</li>
          </ul>
        </div>
        
        <div class="modal-acciones">
          <button @click="mostrarConfirmacion = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="enviarDefinitivo" class="btn btn-danger">
            <i class="ph ph-paper-plane-tilt"></i>
            Confirmar Envío
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../config'

const route = useRoute()

const props = defineProps({
  incidenteId: {
    type: [String, Number],
    required: true
  },
  tipoInforme: {
    type: String,
    default: 'alertaTemprana' // alertaTemprana, preliminar, completo
  }
})

// Estado
const formulario = ref({
  titulo: '',
  fechaDeteccion: '',
  criticidad: 'Media',
  tipoEmpresa: 'PSE',
  descripcionInicial: '',
  analisisDetallado: '',
  taxonomias: [],
  sistemasAfectados: '',
  usuariosImpactados: 0,
  duracionInterrupcion: '',
  alcanceGeografico: 'Local',
  medidasContencion: '',
  planRecuperacion: '',
  requiereCSIRT: false,
  tipoApoyoCSIRT: ''
})

const archivosExpediente = ref([])
const archivosSeleccionados = ref([])
const nuevosArchivos = ref([])
const enviando = ref(false)
const mostrarConfirmacion = ref(false)

// Computed
const getTipoInforme = () => {
  const tipos = {
    alertaTemprana: 'Alerta Temprana',
    preliminar: 'Informe Preliminar',
    completo: 'Informe Completo'
  }
  return tipos[props.tipoInforme] || 'Informe'
}

const getTiemposPlazo = () => {
  if (formulario.value.tipoEmpresa === 'OIV') {
    return props.tipoInforme === 'alertaTemprana' ? '3 horas' : '24 horas'
  }
  return props.tipoInforme === 'alertaTemprana' ? '3 horas' : '72 horas'
}

const getPlazoRestante = () => {
  // TODO: Calcular tiempo real restante
  return '2 horas 15 minutos'
}

// Métodos
async function cargarDatosIncidente() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}`)
    const incidente = response.data
    
    // Prellenar formulario con datos del incidente
    formulario.value.titulo = incidente.Titulo
    formulario.value.fechaDeteccion = incidente.FechaDeteccion
    formulario.value.criticidad = incidente.Criticidad || 'Media'
    formulario.value.tipoEmpresa = incidente.TipoEmpresa || 'PSE'
    formulario.value.descripcionInicial = incidente.DescripcionInicial || ''
    
    // Cargar archivos del expediente
    await cargarArchivosExpediente()
    
    // Cargar taxonomías seleccionadas
    await cargarTaxonomias()
    
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

async function cargarArchivosExpediente() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}/archivos`)
    archivosExpediente.value = response.data || []
  } catch (error) {
    console.error('Error cargando archivos:', error)
  }
}

async function cargarTaxonomias() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}/taxonomias`)
    formulario.value.taxonomias = response.data || []
  } catch (error) {
    console.error('Error cargando taxonomías:', error)
  }
}

function toggleArchivoSeleccion(archivoId) {
  const index = archivosSeleccionados.value.indexOf(archivoId)
  if (index > -1) {
    archivosSeleccionados.value.splice(index, 1)
  } else {
    archivosSeleccionados.value.push(archivoId)
  }
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  nuevosArchivos.value.push(...files)
}

function handleDrop(event) {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  nuevosArchivos.value.push(...files)
}

function removerNuevoArchivo(index) {
  nuevosArchivos.value.splice(index, 1)
}

function removerTaxonomia(taxId) {
  formulario.value.taxonomias = formulario.value.taxonomias.filter(t => t.id !== taxId)
}

function abrirSelectorTaxonomias() {
  // TODO: Implementar selector de taxonomías
  console.log('Abrir selector de taxonomías')
}

function getIconoArchivo(tipo) {
  if (tipo?.includes('pdf')) return 'ph ph-file-pdf'
  if (tipo?.includes('word') || tipo?.includes('doc')) return 'ph ph-file-doc'
  if (tipo?.includes('image')) return 'ph ph-file-image'
  return 'ph ph-file'
}

function formatearTamano(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function guardarBorrador() {
  try {
    const borrador = {
      ...formulario.value,
      archivosSeleccionados: archivosSeleccionados.value,
      tipoInforme: props.tipoInforme
    }
    
    await axios.post(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}/borradores`, borrador)
    
    alert('Borrador guardado exitosamente')
  } catch (error) {
    console.error('Error guardando borrador:', error)
    alert('Error al guardar el borrador')
  }
}

function validarYEnviar() {
  // Validaciones básicas
  if (!formulario.value.descripcionInicial.trim()) {
    alert('Debe incluir una descripción del incidente')
    return
  }
  
  if (formulario.value.taxonomias.length === 0) {
    alert('Debe seleccionar al menos una taxonomía')
    return
  }
  
  mostrarConfirmacion.value = true
}

async function enviarDefinitivo() {
  enviando.value = true
  mostrarConfirmacion.value = false
  
  try {
    const formData = new FormData()
    
    // Agregar datos del formulario
    formData.append('tipoInforme', props.tipoInforme)
    formData.append('datos', JSON.stringify(formulario.value))
    formData.append('archivosExpediente', JSON.stringify(archivosSeleccionados.value))
    
    // Agregar nuevos archivos
    nuevosArchivos.value.forEach(archivo => {
      formData.append('archivos', archivo)
    })
    
    const response = await axios.post(
      `${API_BASE_URL}/admin/incidentes/${props.incidenteId}/enviar-anci`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    if (response.data.success) {
      alert('Informe enviado exitosamente a ANCI')
      // TODO: Redirigir o cerrar formulario
    }
    
  } catch (error) {
    console.error('Error enviando informe:', error)
    alert('Error al enviar el informe. Por favor intente nuevamente.')
  } finally {
    enviando.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarDatosIncidente()
})
</script>

<style scoped>
.formulario-envio-anci {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
}

.formulario-header {
  background: linear-gradient(135deg, #3730a3, #4f46e5);
  color: white;
  padding: 30px;
  text-align: center;
}

.formulario-header h3 {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.formulario-header .descripcion {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.formulario-body {
  padding: 30px;
}

.seccion {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.seccion:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.seccion h4 {
  color: #e2e8f0;
  font-size: 1.25rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.campo {
  margin-bottom: 20px;
}

.campo label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 15px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #4f46e5;
  background: rgba(30, 41, 59, 0.8);
}

.form-control[readonly] {
  background: rgba(30, 41, 59, 0.3);
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.campo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Taxonomías */
.taxonomias-seleccionadas {
  background: rgba(30, 41, 59, 0.3);
  padding: 20px;
  border-radius: 8px;
}

.taxonomia-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.taxonomia-item {
  background: rgba(79, 70, 229, 0.2);
  border: 1px solid rgba(79, 70, 229, 0.5);
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.taxonomia-nombre {
  color: #a5b4fc;
  font-size: 0.875rem;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.btn-remove:hover {
  transform: scale(1.1);
}

.btn-agregar-taxonomia {
  background: rgba(79, 70, 229, 0.2);
  border: 1px dashed rgba(79, 70, 229, 0.5);
  color: #a5b4fc;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-agregar-taxonomia:hover {
  background: rgba(79, 70, 229, 0.3);
  border-color: rgba(79, 70, 229, 0.8);
}

/* Archivos */
.subseccion {
  margin-bottom: 25px;
}

.subseccion h5 {
  color: #cbd5e1;
  font-size: 1rem;
  margin-bottom: 15px;
}

.archivos-semilla {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.archivo-item {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.3);
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.archivo-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(71, 85, 105, 0.5);
}

.archivo-item.seleccionado {
  background: rgba(79, 70, 229, 0.1);
  border-color: rgba(79, 70, 229, 0.5);
}

.archivo-item.nuevo {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.archivo-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.archivo-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.archivo-info i {
  font-size: 1.25rem;
  color: #60a5fa;
}

.archivo-nombre {
  flex: 1;
  color: #e2e8f0;
}

.archivo-tamano {
  color: #64748b;
  font-size: 0.875rem;
}

/* Upload area */
.upload-area {
  background: rgba(30, 41, 59, 0.3);
  border: 2px dashed rgba(71, 85, 105, 0.5);
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  background: rgba(30, 41, 59, 0.5);
  border-color: #4f46e5;
}

.upload-area i {
  font-size: 3rem;
  color: #64748b;
  margin-bottom: 10px;
}

.upload-area p {
  color: #94a3b8;
  margin: 5px 0;
}

.upload-area small {
  color: #64748b;
  font-size: 0.75rem;
}

.nuevos-archivos {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Footer */
.formulario-footer {
  background: rgba(30, 41, 59, 0.5);
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.info-plazo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fbbf24;
}

.info-plazo i {
  font-size: 1.25rem;
}

.acciones {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.5);
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-confirmacion {
  background: #1e293b;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
}

.modal-confirmacion h4 {
  color: #e2e8f0;
  margin: 0 0 15px 0;
}

.modal-confirmacion p {
  color: #94a3b8;
  margin: 10px 0;
}

.text-warning {
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 8px;
}

.resumen-envio {
  background: rgba(30, 41, 59, 0.5);
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.resumen-envio h5 {
  color: #cbd5e1;
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.resumen-envio ul {
  margin: 0;
  padding-left: 20px;
  color: #94a3b8;
}

.modal-acciones {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-danger {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
}

/* Alertas */
.alert {
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-warning {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-header {
    padding: 20px;
  }
  
  .formulario-body {
    padding: 20px;
  }
  
  .campo-grid {
    grid-template-columns: 1fr;
  }
  
  .formulario-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .acciones {
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>