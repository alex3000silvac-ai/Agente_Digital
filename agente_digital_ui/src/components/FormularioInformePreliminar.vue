<template>
  <div class="formulario-informe-preliminar">
    <!-- Header con timer -->
    <div class="formulario-header">
      <div class="header-content">
        <h3>
          <i class="ph ph-file-text"></i>
          INFORME PRELIMINAR ANCI
        </h3>
        <p class="descripcion">
          {{ tipoEmpresa === 'OIV' ? 'Plazo: 24 horas (servicio esencial afectado)' : 'Plazo: 72 horas' }}
        </p>
      </div>
      <div class="timer-container">
        <i class="ph ph-clock"></i>
        <span class="tiempo">{{ tiempoRestante }}</span>
        <span class="label">Tiempo restante</span>
      </div>
    </div>

    <div class="formulario-body">
      <!-- SECCIÓN 1: RESUMEN EJECUTIVO -->
      <div class="seccion">
        <h4><i class="ph ph-clipboard-text"></i> 1. Resumen Ejecutivo</h4>
        <div class="campo">
          <label>Actualización del Estado <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.resumenEjecutivo" 
            class="form-control"
            rows="4"
            placeholder="Resumen actualizado del incidente, incluyendo evolución desde la alerta temprana..."
            required
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 2: CRONOLOGÍA DETALLADA -->
      <div class="seccion">
        <h4><i class="ph ph-clock-countdown"></i> 2. Cronología del Incidente</h4>
        <div class="timeline-editor">
          <div class="timeline-instrucciones">
            <i class="ph ph-info"></i>
            <span>Registre los eventos clave en orden cronológico</span>
          </div>
          
          <div class="timeline-items">
            <div v-for="(evento, index) in formulario.cronologia" :key="index" class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <input 
                    type="datetime-local" 
                    v-model="evento.fechaHora" 
                    class="form-control datetime-input"
                    required
                  />
                  <button @click="eliminarEvento(index)" class="btn-remove">
                    <i class="ph ph-x"></i>
                  </button>
                </div>
                <input 
                  type="text" 
                  v-model="evento.descripcion" 
                  class="form-control"
                  placeholder="Descripción del evento..."
                  required
                />
              </div>
            </div>
          </div>
          
          <button @click="agregarEvento" class="btn-add-evento">
            <i class="ph ph-plus"></i>
            Agregar Evento
          </button>
        </div>
      </div>

      <!-- SECCIÓN 3: ANÁLISIS TÉCNICO PRELIMINAR -->
      <div class="seccion">
        <h4><i class="ph ph-magnifying-glass"></i> 3. Análisis Técnico Preliminar</h4>
        
        <div class="campo">
          <label>Vector de Ataque Identificado</label>
          <select v-model="formulario.vectorAtaque" class="form-control">
            <option value="">Sin determinar aún</option>
            <option value="Phishing">Phishing/Spear Phishing</option>
            <option value="Malware">Malware/Ransomware</option>
            <option value="Vulnerabilidad">Explotación de vulnerabilidad</option>
            <option value="Credenciales">Credenciales comprometidas</option>
            <option value="Insider">Amenaza interna</option>
            <option value="DDoS">Ataque DDoS</option>
            <option value="Supply Chain">Cadena de suministro</option>
            <option value="Otro">Otro</option>
          </select>
          <input 
            v-if="formulario.vectorAtaque === 'Otro'"
            type="text" 
            v-model="formulario.vectorAtaqueOtro" 
            class="form-control mt-2"
            placeholder="Especifique el vector de ataque..."
          />
        </div>
        
        <div class="campo">
          <label>Vulnerabilidades Identificadas</label>
          <textarea 
            v-model="formulario.vulnerabilidadesIdentificadas" 
            class="form-control"
            rows="3"
            placeholder="CVEs, configuraciones incorrectas, falta de parches, etc..."
          ></textarea>
        </div>
        
        <div class="campo">
          <label>Causa Raíz Preliminar</label>
          <textarea 
            v-model="formulario.causaRaizPreliminar" 
            class="form-control"
            rows="3"
            placeholder="Análisis inicial de la causa raíz del incidente..."
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 4: INDICADORES DE COMPROMISO (IoCs) -->
      <div class="seccion">
        <h4><i class="ph ph-fingerprint"></i> 4. Indicadores de Compromiso (IoCs) Confirmados</h4>
        
        <div class="ioc-grid">
          <div class="campo">
            <label>IPs Maliciosas</label>
            <textarea 
              v-model="formulario.iocIPs" 
              class="form-control"
              rows="3"
              placeholder="Una IP por línea&#10;Ej: 192.168.1.100"
            ></textarea>
          </div>
          
          <div class="campo">
            <label>Dominios Maliciosos</label>
            <textarea 
              v-model="formulario.iocDominios" 
              class="form-control"
              rows="3"
              placeholder="Un dominio por línea&#10;Ej: malware.example.com"
            ></textarea>
          </div>
          
          <div class="campo">
            <label>Hashes de Malware</label>
            <textarea 
              v-model="formulario.iocHashes" 
              class="form-control"
              rows="3"
              placeholder="Un hash por línea&#10;MD5, SHA1 o SHA256"
            ></textarea>
          </div>
          
          <div class="campo">
            <label>URLs Maliciosas</label>
            <textarea 
              v-model="formulario.iocURLs" 
              class="form-control"
              rows="3"
              placeholder="Una URL por línea"
            ></textarea>
          </div>
        </div>
        
        <div class="campo">
          <label>Otros Indicadores</label>
          <textarea 
            v-model="formulario.iocOtros" 
            class="form-control"
            rows="2"
            placeholder="Cuentas comprometidas, procesos maliciosos, claves de registro, etc..."
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 5: IMPACTO ACTUALIZADO -->
      <div class="seccion">
        <h4><i class="ph ph-chart-bar"></i> 5. Evaluación de Impacto Actualizada</h4>
        
        <div class="campo-grid">
          <div class="campo">
            <label>Sistemas Afectados <span class="requerido">*</span></label>
            <input 
              type="number" 
              v-model="formulario.totalSistemasAfectados" 
              class="form-control"
              placeholder="Número total"
              min="0"
              required
            />
          </div>
          
          <div class="campo">
            <label>Usuarios Impactados <span class="requerido">*</span></label>
            <input 
              type="number" 
              v-model="formulario.totalUsuariosImpactados" 
              class="form-control"
              placeholder="Número total"
              min="0"
              required
            />
          </div>
          
          <div class="campo">
            <label>Datos Comprometidos (GB)</label>
            <input 
              type="number" 
              v-model="formulario.volumenDatosGB" 
              class="form-control"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          
          <div class="campo">
            <label>Pérdida Estimada ($)</label>
            <input 
              type="number" 
              v-model="formulario.perdidaEstimada" 
              class="form-control"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        
        <div class="campo">
          <label>Detalle de Sistemas Críticos Afectados <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.sistemasCriticosDetalle" 
            class="form-control"
            rows="3"
            placeholder="Liste y describa los sistemas críticos afectados..."
            required
          ></textarea>
        </div>
        
        <div class="campo">
          <label>Servicios Esenciales Afectados {{ tipoEmpresa === 'OIV' ? '(OIV)' : '' }}</label>
          <textarea 
            v-model="formulario.serviciosEsencialesAfectados" 
            class="form-control"
            rows="3"
            placeholder="Detalle los servicios esenciales interrumpidos o degradados..."
            :required="tipoEmpresa === 'OIV'"
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 6: ACCIONES DE CONTENCIÓN -->
      <div class="seccion">
        <h4><i class="ph ph-shield-check"></i> 6. Acciones de Contención y Respuesta</h4>
        
        <div class="campo">
          <label>Medidas de Contención Implementadas <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.medidasContencionImplementadas" 
            class="form-control"
            rows="4"
            placeholder="Detalle todas las medidas de contención aplicadas..."
            required
          ></textarea>
        </div>
        
        <div class="campo">
          <label>Efectividad de las Medidas <span class="requerido">*</span></label>
          <select v-model="formulario.efectividadMedidas" class="form-control" required>
            <option value="">Seleccione...</option>
            <option value="Total">Totalmente efectivas</option>
            <option value="Parcial">Parcialmente efectivas</option>
            <option value="Limitada">Efectividad limitada</option>
            <option value="Evaluando">En evaluación</option>
          </select>
        </div>
        
        <div class="campo">
          <label>Sistemas Aislados/Desconectados</label>
          <textarea 
            v-model="formulario.sistemasAislados" 
            class="form-control"
            rows="3"
            placeholder="Liste los sistemas que fueron aislados o desconectados..."
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 7: COORDINACIONES REALIZADAS -->
      <div class="seccion">
        <h4><i class="ph ph-users"></i> 7. Coordinaciones y Notificaciones</h4>
        
        <div class="coordinaciones-grid">
          <div class="coordinacion-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formulario.notificacionRegulador"
              />
              <span>Regulador sectorial notificado</span>
            </label>
            <input 
              v-if="formulario.notificacionRegulador"
              type="text" 
              v-model="formulario.reguladorDetalle" 
              class="form-control mt-2"
              placeholder="Nombre del regulador y fecha/hora de notificación"
            />
          </div>
          
          <div class="coordinacion-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formulario.denunciaPolicial"
              />
              <span>Denuncia policial realizada</span>
            </label>
            <input 
              v-if="formulario.denunciaPolicial"
              type="text" 
              v-model="formulario.numeroParte" 
              class="form-control mt-2"
              placeholder="Número de parte o constancia"
            />
          </div>
          
          <div class="coordinacion-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formulario.proveedoresContactados"
              />
              <span>Proveedores de seguridad contactados</span>
            </label>
            <textarea 
              v-if="formulario.proveedoresContactados"
              v-model="formulario.proveedoresDetalle" 
              class="form-control mt-2"
              rows="2"
              placeholder="Detalle proveedores contactados y acciones..."
            ></textarea>
          </div>
          
          <div class="coordinacion-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formulario.comunicacionClientes"
              />
              <span>Comunicación a clientes/usuarios</span>
            </label>
            <textarea 
              v-if="formulario.comunicacionClientes"
              v-model="formulario.comunicacionDetalle" 
              class="form-control mt-2"
              rows="2"
              placeholder="Detalle de comunicaciones realizadas..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 8: PLAN DE RECUPERACIÓN INICIAL -->
      <div class="seccion">
        <h4><i class="ph ph-arrows-clockwise"></i> 8. Plan de Recuperación Inicial</h4>
        
        <div class="campo">
          <label>Estrategia de Recuperación <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.estrategiaRecuperacion" 
            class="form-control"
            rows="4"
            placeholder="Describa la estrategia general de recuperación..."
            required
          ></textarea>
        </div>
        
        <div class="campo-grid">
          <div class="campo">
            <label>Tiempo Estimado de Recuperación (horas) <span class="requerido">*</span></label>
            <input 
              type="number" 
              v-model="formulario.tiempoRecuperacionEstimado" 
              class="form-control"
              placeholder="Horas"
              min="0"
              required
            />
          </div>
          
          <div class="campo">
            <label>Prioridad de Recuperación</label>
            <select v-model="formulario.prioridadRecuperacion" class="form-control">
              <option value="Critica">Crítica - Sistemas esenciales</option>
              <option value="Alta">Alta - Sistemas importantes</option>
              <option value="Media">Media - Sistemas secundarios</option>
              <option value="Baja">Baja - Sistemas auxiliares</option>
            </select>
          </div>
        </div>
        
        <div class="campo">
          <label>Recursos Necesarios</label>
          <textarea 
            v-model="formulario.recursosNecesarios" 
            class="form-control"
            rows="3"
            placeholder="Personal, hardware, software, servicios externos..."
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 9: SOLICITUD DE APOYO CSIRT -->
      <div class="seccion">
        <h4><i class="ph ph-lifebuoy"></i> 9. Actualización Solicitud CSIRT</h4>
        
        <div class="campo">
          <label>Estado de Solicitud CSIRT</label>
          <select v-model="formulario.estadoCSIRT" class="form-control">
            <option value="No solicitado">No solicitado</option>
            <option value="Solicitado">Solicitado - Pendiente respuesta</option>
            <option value="En coordinacion">En coordinación</option>
            <option value="Apoyo activo">Recibiendo apoyo activo</option>
          </select>
        </div>
        
        <div v-if="formulario.estadoCSIRT !== 'No solicitado'" class="campo">
          <label>Detalle de Coordinación con CSIRT</label>
          <textarea 
            v-model="formulario.detalleCSIRT" 
            class="form-control"
            rows="3"
            placeholder="Acciones coordinadas, recomendaciones recibidas, etc..."
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 10: ANEXOS Y EVIDENCIAS -->
      <div class="seccion">
        <h4><i class="ph ph-paperclip"></i> 10. Anexos y Evidencias</h4>
        
        <div class="evidencias-container">
          <div class="evidencias-lista">
            <h5>Archivos del Expediente</h5>
            <div class="archivos-expediente">
              <div 
                v-for="archivo in archivosExpediente" 
                :key="archivo.id"
                class="archivo-item"
                :class="{ seleccionado: archivosSeleccionados.includes(archivo.id) }"
                @click="toggleArchivo(archivo.id)"
              >
                <input 
                  type="checkbox" 
                  :checked="archivosSeleccionados.includes(archivo.id)"
                  @click.stop="toggleArchivo(archivo.id)"
                />
                <i :class="getIconoArchivo(archivo.tipo)"></i>
                <span>{{ archivo.nombre }}</span>
              </div>
            </div>
          </div>
          
          <div class="nuevas-evidencias">
            <h5>Agregar Nuevas Evidencias</h5>
            <div class="upload-area" @click="$refs.fileInput.click()" @drop="handleDrop" @dragover.prevent>
              <input 
                ref="fileInput" 
                type="file" 
                multiple 
                @change="handleFileSelect"
                style="display: none"
              />
              <i class="ph ph-upload"></i>
              <p>Arrastre archivos aquí o haga clic para seleccionar</p>
              <small>Logs, capturas, reportes forenses, etc.</small>
            </div>
            
            <div v-if="nuevosArchivos.length > 0" class="archivos-nuevos">
              <div v-for="(archivo, index) in nuevosArchivos" :key="index" class="archivo-nuevo">
                <i :class="getIconoArchivo(archivo.type)"></i>
                <span>{{ archivo.name }}</span>
                <button @click="removerArchivo(index)" class="btn-remove-file">
                  <i class="ph ph-x"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <div class="formulario-footer">
      <div class="info-plazo">
        <i class="ph ph-info"></i>
        <div>
          <span class="titulo">Informe Preliminar</span>
          <span class="subtitulo">{{ tipoEmpresa === 'OIV' ? 'Plazo: 24 horas' : 'Plazo: 72 horas' }}</span>
        </div>
      </div>
      
      <div class="acciones">
        <button @click="guardarBorrador" class="btn btn-secondary">
          <i class="ph ph-floppy-disk"></i>
          Guardar Borrador
        </button>
        
        <button @click="validarFormulario" class="btn btn-primary" :disabled="enviando">
          <i v-if="!enviando" class="ph ph-paper-plane-tilt"></i>
          <div v-else class="spinner-border spinner-border-sm" role="status"></div>
          {{ enviando ? 'Enviando...' : 'Enviar Informe Preliminar' }}
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay" @click.self="mostrarConfirmacion = false">
      <div class="modal-confirmacion">
        <div class="modal-header">
          <i class="ph ph-file-text"></i>
          <h4>Confirmar Envío de Informe Preliminar</h4>
        </div>
        
        <div class="modal-body">
          <div class="resumen-envio">
            <h5>Resumen del Informe:</h5>
            <ul>
              <li><strong>Tipo:</strong> Informe Preliminar</li>
              <li><strong>Empresa:</strong> {{ datosIncidente.RazonSocial }}</li>
              <li><strong>Vector de Ataque:</strong> {{ formulario.vectorAtaque || 'Por determinar' }}</li>
              <li><strong>Sistemas Afectados:</strong> {{ formulario.totalSistemasAfectados }}</li>
              <li><strong>IoCs Identificados:</strong> {{ contarIoCs() }}</li>
              <li><strong>Archivos Adjuntos:</strong> {{ archivosSeleccionados.length + nuevosArchivos.length }}</li>
            </ul>
          </div>
          
          <div class="advertencia">
            <i class="ph ph-warning"></i>
            <p>
              Este informe complementa la Alerta Temprana enviada anteriormente. 
              Una vez enviado no podrá ser modificado.
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="mostrarConfirmacion = false" class="btn btn-secondary">
            Revisar
          </button>
          <button @click="enviarDefinitivo" class="btn btn-primary">
            <i class="ph ph-paper-plane-tilt"></i>
            Confirmar Envío
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../config'

const route = useRoute()
const router = useRouter()

const props = defineProps({
  incidenteId: {
    type: [String, Number],
    required: true
  }
})

// Estado
const formulario = ref({
  // Resumen
  resumenEjecutivo: '',
  
  // Cronología
  cronologia: [
    { fechaHora: '', descripcion: '' }
  ],
  
  // Análisis técnico
  vectorAtaque: '',
  vectorAtaqueOtro: '',
  vulnerabilidadesIdentificadas: '',
  causaRaizPreliminar: '',
  
  // IoCs
  iocIPs: '',
  iocDominios: '',
  iocHashes: '',
  iocURLs: '',
  iocOtros: '',
  
  // Impacto
  totalSistemasAfectados: 0,
  totalUsuariosImpactados: 0,
  volumenDatosGB: 0,
  perdidaEstimada: 0,
  sistemasCriticosDetalle: '',
  serviciosEsencialesAfectados: '',
  
  // Contención
  medidasContencionImplementadas: '',
  efectividadMedidas: '',
  sistemasAislados: '',
  
  // Coordinaciones
  notificacionRegulador: false,
  reguladorDetalle: '',
  denunciaPolicial: false,
  numeroParte: '',
  proveedoresContactados: false,
  proveedoresDetalle: '',
  comunicacionClientes: false,
  comunicacionDetalle: '',
  
  // Recuperación
  estrategiaRecuperacion: '',
  tiempoRecuperacionEstimado: 0,
  prioridadRecuperacion: 'Critica',
  recursosNecesarios: '',
  
  // CSIRT
  estadoCSIRT: 'No solicitado',
  detalleCSIRT: ''
})

const datosIncidente = ref({})
const tipoEmpresa = ref('PSE')
const archivosExpediente = ref([])
const archivosSeleccionados = ref([])
const nuevosArchivos = ref([])
const enviando = ref(false)
const mostrarConfirmacion = ref(false)
const tiempoRestante = ref('')
const intervalId = ref(null)

// Métodos
async function cargarDatos() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}`)
    datosIncidente.value = response.data
    tipoEmpresa.value = response.data.TipoEmpresa || 'PSE'
    
    // Prellenar datos si existen
    if (response.data.VectorAtaque) {
      formulario.value.vectorAtaque = response.data.VectorAtaque
    }
    if (response.data.SistemasAfectados) {
      formulario.value.sistemasCriticosDetalle = response.data.SistemasAfectados
    }
    
    // Cargar archivos
    const archivosResponse = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}/archivos`)
    archivosExpediente.value = archivosResponse.data || []
    
    // Calcular tiempo restante
    calcularTiempoRestante(response.data.FechaAlertaTemprana)
    
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

function calcularTiempoRestante(fechaAlerta) {
  if (!fechaAlerta) return
  
  const horasPlazo = tipoEmpresa.value === 'OIV' ? 24 : 72
  const fechaLimite = new Date(fechaAlerta)
  fechaLimite.setHours(fechaLimite.getHours() + horasPlazo)
  
  const actualizar = () => {
    const ahora = new Date()
    const diferencia = fechaLimite - ahora
    
    if (diferencia <= 0) {
      tiempoRestante.value = 'VENCIDO'
      return
    }
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))
    
    if (dias > 0) {
      tiempoRestante.value = `${dias}d ${horas}h ${minutos}m`
    } else {
      tiempoRestante.value = `${horas}h ${minutos}m`
    }
  }
  
  actualizar()
  intervalId.value = setInterval(actualizar, 60000) // Actualizar cada minuto
}

function agregarEvento() {
  formulario.value.cronologia.push({ fechaHora: '', descripcion: '' })
}

function eliminarEvento(index) {
  if (formulario.value.cronologia.length > 1) {
    formulario.value.cronologia.splice(index, 1)
  }
}

function toggleArchivo(archivoId) {
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

function removerArchivo(index) {
  nuevosArchivos.value.splice(index, 1)
}

function getIconoArchivo(tipo) {
  if (tipo?.includes('pdf')) return 'ph ph-file-pdf'
  if (tipo?.includes('word') || tipo?.includes('doc')) return 'ph ph-file-doc'
  if (tipo?.includes('image')) return 'ph ph-file-image'
  if (tipo?.includes('zip') || tipo?.includes('rar')) return 'ph ph-file-zip'
  return 'ph ph-file'
}

function contarIoCs() {
  let total = 0
  if (formulario.value.iocIPs) total += formulario.value.iocIPs.split('\n').filter(x => x.trim()).length
  if (formulario.value.iocDominios) total += formulario.value.iocDominios.split('\n').filter(x => x.trim()).length
  if (formulario.value.iocHashes) total += formulario.value.iocHashes.split('\n').filter(x => x.trim()).length
  if (formulario.value.iocURLs) total += formulario.value.iocURLs.split('\n').filter(x => x.trim()).length
  return total
}

async function guardarBorrador() {
  try {
    await axios.post(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}/borradores`, {
      tipoInforme: 'preliminar',
      datos: formulario.value
    })
    alert('Borrador guardado exitosamente')
  } catch (error) {
    console.error('Error guardando borrador:', error)
    alert('Error al guardar el borrador')
  }
}

function validarFormulario() {
  // Validaciones básicas
  if (!formulario.value.resumenEjecutivo) {
    alert('Debe incluir un resumen ejecutivo')
    return
  }
  
  if (!formulario.value.estrategiaRecuperacion) {
    alert('Debe incluir una estrategia de recuperación')
    return
  }
  
  // Validar cronología
  const cronologiaValida = formulario.value.cronologia.every(evento => 
    evento.fechaHora && evento.descripcion
  )
  
  if (!cronologiaValida) {
    alert('Complete todos los eventos de la cronología')
    return
  }
  
  mostrarConfirmacion.value = true
}

async function enviarDefinitivo() {
  enviando.value = true
  mostrarConfirmacion.value = false
  
  try {
    const formData = new FormData()
    formData.append('tipoInforme', 'preliminar')
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
      // Actualizar estado en BD
      await axios.patch(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}`, {
        InformePreliminarEnviado: true,
        FechaInformePreliminar: new Date().toISOString(),
        VectorAtaque: formulario.value.vectorAtaque,
        VulnerabilidadExplotada: formulario.value.vulnerabilidadesIdentificadas,
        IPsSospechosas: formulario.value.iocIPs,
        DominiosMaliciosos: formulario.value.iocDominios,
        HashesMalware: formulario.value.iocHashes,
        URLsMaliciosas: formulario.value.iocURLs,
        CronologiaDetallada: JSON.stringify(formulario.value.cronologia)
      })
      
      alert('Informe Preliminar enviado exitosamente')
      router.push(`/incidente-detalle/${props.incidenteId}`)
    }
    
  } catch (error) {
    console.error('Error enviando informe:', error)
    alert('Error al enviar el informe')
  } finally {
    enviando.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarDatos()
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.formulario-informe-preliminar {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.formulario-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h3 {
  font-size: 1.75rem;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content .descripcion {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 1.1rem;
}

.timer-container {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
}

.timer-container i {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

.timer-container .tiempo {
  font-size: 1.75rem;
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}

.timer-container .label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Body */
.formulario-body {
  padding: 40px;
}

/* Secciones */
.seccion {
  margin-bottom: 50px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.seccion:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.seccion h4 {
  color: #e2e8f0;
  font-size: 1.35rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.seccion h4 i {
  color: #60a5fa;
  font-size: 1.5rem;
}

/* Campos */
.campo {
  margin-bottom: 24px;
}

.campo label {
  display: block;
  color: #cbd5e1;
  font-size: 0.95rem;
  margin-bottom: 10px;
  font-weight: 500;
}

.campo label .requerido {
  color: #ef4444;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.campo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.mt-2 {
  margin-top: 0.5rem;
}

/* Timeline */
.timeline-editor {
  background: rgba(30, 41, 59, 0.3);
  padding: 25px;
  border-radius: 12px;
}

.timeline-instrucciones {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.timeline-items {
  margin-bottom: 20px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  background: #60a5fa;
  border-radius: 50%;
  margin-top: 16px;
  flex-shrink: 0;
  position: relative;
}

.timeline-marker::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: calc(100% + 40px);
  background: rgba(96, 165, 250, 0.3);
  transform: translateX(-50%);
}

.timeline-item:last-child .timeline-marker::after {
  display: none;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.datetime-input {
  max-width: 250px;
}

.btn-remove {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-add-evento {
  background: rgba(96, 165, 250, 0.2);
  border: 1px dashed rgba(96, 165, 250, 0.5);
  color: #60a5fa;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  width: 100%;
  justify-content: center;
  font-weight: 500;
}

.btn-add-evento:hover {
  background: rgba(96, 165, 250, 0.3);
  border-color: rgba(96, 165, 250, 0.8);
}

/* IoCs Grid */
.ioc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Coordinaciones */
.coordinaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.coordinacion-item {
  background: rgba(30, 41, 59, 0.3);
  padding: 20px;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Evidencias */
.evidencias-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.evidencias-lista h5,
.nuevas-evidencias h5 {
  color: #cbd5e1;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.archivos-expediente {
  background: rgba(30, 41, 59, 0.3);
  padding: 15px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.archivo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.archivo-item:hover {
  background: rgba(96, 165, 250, 0.1);
}

.archivo-item.seleccionado {
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.archivo-item i {
  font-size: 1.25rem;
  color: #60a5fa;
}

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
  border-color: #60a5fa;
}

.upload-area i {
  font-size: 3rem;
  color: #64748b;
  display: block;
  margin-bottom: 10px;
}

.upload-area p {
  color: #94a3b8;
  margin: 5px 0;
}

.upload-area small {
  color: #64748b;
  font-size: 0.875rem;
}

.archivos-nuevos {
  margin-top: 15px;
}

.archivo-nuevo {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.btn-remove-file {
  margin-left: auto;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
}

/* Footer */
.formulario-footer {
  background: rgba(30, 41, 59, 0.5);
  padding: 25px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(71, 85, 105, 0.3);
}

.info-plazo {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #60a5fa;
}

.info-plazo i {
  font-size: 2rem;
}

.info-plazo .titulo {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
}

.info-plazo .subtitulo {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
}

.acciones {
  display: flex;
  gap: 16px;
}

/* Botones */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-confirmacion {
  background: #1e293b;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  padding: 25px 30px;
  color: white;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-body {
  padding: 30px;
}

.resumen-envio {
  background: rgba(30, 41, 59, 0.5);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.resumen-envio h5 {
  color: #cbd5e1;
  margin: 0 0 15px 0;
}

.resumen-envio ul {
  margin: 0;
  padding-left: 25px;
  color: #94a3b8;
}

.resumen-envio strong {
  color: #e2e8f0;
}

.advertencia {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 16px 20px;
  border-radius: 8px;
  color: #fbbf24;
}

.advertencia i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.modal-footer {
  background: rgba(30, 41, 59, 0.5);
  padding: 20px 30px;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .formulario-body {
    padding: 25px;
  }
  
  .campo-grid,
  .ioc-grid,
  .coordinaciones-grid,
  .evidencias-container {
    grid-template-columns: 1fr;
  }
  
  .formulario-footer {
    flex-direction: column;
    gap: 20px;
  }
  
  .acciones {
    width: 100%;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>