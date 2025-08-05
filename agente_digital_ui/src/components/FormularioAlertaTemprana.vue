<template>
  <div class="formulario-alerta-temprana">
    <!-- Header con timer urgente -->
    <div class="formulario-header urgente">
      <div class="header-content">
        <h3>
          <i class="ph ph-warning-circle"></i>
          ALERTA TEMPRANA ANCI - URGENTE
        </h3>
        <p class="descripcion">
          Notificación obligatoria dentro de las primeras 3 horas desde la detección
        </p>
      </div>
      <div class="timer-urgente">
        <i class="ph ph-timer"></i>
        <span class="tiempo">{{ tiempoRestante }}</span>
        <span class="label">Tiempo restante</span>
      </div>
    </div>

    <div class="formulario-body">
      <!-- SECCIÓN 1: IDENTIFICACIÓN DE LA ENTIDAD -->
      <div class="seccion">
        <h4><i class="ph ph-buildings"></i> Identificación de la Entidad</h4>
        <div class="campo-grid">
          <div class="campo">
            <label>Razón Social <span class="requerido">*</span></label>
            <input 
              type="text" 
              v-model="formulario.nombreInstitucion" 
              class="form-control"
              readonly
            />
          </div>
          <div class="campo">
            <label>RUT <span class="requerido">*</span></label>
            <input 
              type="text" 
              v-model="formulario.rut" 
              class="form-control"
              readonly
            />
          </div>
          <div class="campo">
            <label>Tipo de Entidad <span class="requerido">*</span></label>
            <input 
              type="text" 
              v-model="formulario.tipoEntidad" 
              class="form-control"
              readonly
            />
          </div>
          <div class="campo">
            <label>Sector Esencial <span class="requerido">*</span></label>
            <select v-model="formulario.sectorEsencial" class="form-control" required>
              <option value="">Seleccione...</option>
              <option value="Energía">Energía</option>
              <option value="Telecomunicaciones">Telecomunicaciones</option>
              <option value="Financiero">Financiero</option>
              <option value="Salud">Salud</option>
              <option value="Agua">Agua</option>
              <option value="Transporte">Transporte</option>
              <option value="Infraestructura Digital">Infraestructura Digital</option>
              <option value="Administración Pública">Administración Pública</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: DATOS DE CONTACTO -->
      <div class="seccion">
        <h4><i class="ph ph-user-circle"></i> Datos de Contacto de Emergencia</h4>
        <div class="campo-grid">
          <div class="campo">
            <label>Nombre del Reportante <span class="requerido">*</span></label>
            <input 
              type="text" 
              v-model="formulario.nombreReportante" 
              class="form-control"
              placeholder="Nombre completo del responsable"
              required
            />
          </div>
          <div class="campo">
            <label>Cargo <span class="requerido">*</span></label>
            <input 
              type="text" 
              v-model="formulario.cargoReportante" 
              class="form-control"
              placeholder="Ej: CISO, Encargado de Seguridad"
              required
            />
          </div>
          <div class="campo">
            <label>Teléfono 24/7 <span class="requerido">*</span></label>
            <input 
              type="tel" 
              v-model="formulario.telefono24_7" 
              class="form-control"
              placeholder="+56 9 XXXX XXXX"
              required
            />
          </div>
          <div class="campo">
            <label>Email Oficial <span class="requerido">*</span></label>
            <input 
              type="email" 
              v-model="formulario.emailOficial" 
              class="form-control"
              placeholder="seguridad@empresa.cl"
              required
            />
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: DATOS DEL INCIDENTE -->
      <div class="seccion">
        <h4><i class="ph ph-warning-diamond"></i> Datos del Incidente</h4>
        <div class="campo-grid">
          <div class="campo">
            <label>Fecha/Hora de Detección <span class="requerido">*</span></label>
            <input 
              type="datetime-local" 
              v-model="formulario.fechaHoraDeteccion" 
              class="form-control"
              required
            />
          </div>
          <div class="campo">
            <label>Fecha/Hora de Inicio Estimada <span class="requerido">*</span></label>
            <input 
              type="datetime-local" 
              v-model="formulario.fechaHoraInicioEstimada" 
              class="form-control"
              required
            />
          </div>
        </div>
        
        <div class="campo">
          <label>Descripción Breve <span class="requerido">*</span> <small>(Máximo 500 caracteres)</small></label>
          <textarea 
            v-model="formulario.descripcionBreve" 
            class="form-control"
            rows="3"
            maxlength="500"
            placeholder="Resumen ejecutivo del incidente..."
            required
          ></textarea>
          <div class="contador-caracteres">{{ formulario.descripcionBreve.length }}/500</div>
        </div>

        <div class="campo">
          <label>Taxonomía Inicial <span class="requerido">*</span></label>
          <div class="taxonomia-selector">
            <select v-model="formulario.taxonomiaInicial" class="form-control" required>
              <option value="">Seleccione la categoría principal...</option>
              <optgroup label="A. Impacto en el uso legítimo de recursos">
                <option value="a.i.a">Uso no autorizado de redes y sistemas</option>
                <option value="a.i.b">Phishing en infraestructura propia</option>
                <option value="a.i.c">Phishing relacionado con la institución</option>
                <option value="a.i.d">Ejecución no autorizada de código</option>
              </optgroup>
              <optgroup label="B. Impacto en la confidencialidad">
                <option value="b.i.e">Exfiltración/exposición de datos</option>
                <option value="b.i.f">Exfiltración/exposición de configuraciones</option>
                <option value="b.i.g">Exfiltración/exposición de código fuente</option>
              </optgroup>
              <optgroup label="C. Impacto en la disponibilidad">
                <option value="c.i.h">Indisponibilidad/denegación de servicio</option>
                <option value="c.i.i">Degradación de servicio</option>
              </optgroup>
              <optgroup label="D. Impacto en la integridad">
                <option value="d.i.j">Modificación no autorizada de datos</option>
                <option value="d.i.k">Manipulación no autorizada de configuración</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 4: IMPACTO INICIAL -->
      <div class="seccion">
        <h4><i class="ph ph-chart-line-down"></i> Impacto Inicial</h4>
        <div class="campo">
          <label>Sistemas Afectados <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.sistemasAfectados" 
            class="form-control"
            rows="2"
            placeholder="Liste los sistemas/servicios afectados..."
            required
          ></textarea>
        </div>
        
        <div class="campo-grid">
          <div class="campo">
            <label>¿Servicios Interrumpidos? <span class="requerido">*</span></label>
            <select v-model="formulario.serviciosInterrumpidos" class="form-control" required>
              <option value="">Seleccione...</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
              <option value="Parcialmente">Parcialmente</option>
            </select>
          </div>
          <div class="campo">
            <label>Duración Estimada <span class="requerido">*</span></label>
            <input 
              type="number" 
              v-model="formulario.duracionEstimada" 
              class="form-control"
              placeholder="Horas estimadas"
              min="0"
              required
            />
          </div>
          <div class="campo">
            <label>Usuarios Afectados <span class="requerido">*</span></label>
            <input 
              type="number" 
              v-model="formulario.usuariosAfectados" 
              class="form-control"
              placeholder="Número aproximado"
              min="0"
              required
            />
          </div>
          <div class="campo">
            <label>Alcance Geográfico <span class="requerido">*</span></label>
            <select v-model="formulario.alcanceGeografico" class="form-control" required>
              <option value="">Seleccione...</option>
              <option value="Local">Local</option>
              <option value="Regional">Regional</option>
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 5: ESTADO ACTUAL -->
      <div class="seccion">
        <h4><i class="ph ph-activity"></i> Estado Actual</h4>
        <div class="campo-grid">
          <div class="campo">
            <label>¿Incidente en Curso? <span class="requerido">*</span></label>
            <select v-model="formulario.incidenteEnCurso" class="form-control" required>
              <option value="">Seleccione...</option>
              <option value="Si">Sí - Activo</option>
              <option value="No">No - Contenido</option>
              <option value="Parcial">Parcialmente Contenido</option>
            </select>
          </div>
          <div class="campo">
            <label>¿Contención Aplicada? <span class="requerido">*</span></label>
            <select v-model="formulario.contencionAplicada" class="form-control" required>
              <option value="">Seleccione...</option>
              <option value="Si">Sí</option>
              <option value="No">No</option>
              <option value="EnProceso">En Proceso</option>
            </select>
          </div>
        </div>
        
        <div class="campo">
          <label>Descripción del Estado <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.descripcionEstado" 
            class="form-control"
            rows="3"
            placeholder="Describa el estado actual del incidente..."
            required
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 6: ACCIONES INMEDIATAS -->
      <div class="seccion">
        <h4><i class="ph ph-first-aid"></i> Acciones Inmediatas</h4>
        <div class="campo">
          <label>Medidas de Contención <span class="requerido">*</span></label>
          <textarea 
            v-model="formulario.medidasContencion" 
            class="form-control"
            rows="3"
            placeholder="Liste las acciones tomadas hasta el momento..."
            required
          ></textarea>
        </div>
        
        <div class="campo">
          <label>¿Sistemas Aislados?</label>
          <div class="campo-compuesto">
            <select v-model="formulario.sistemasAisladosSi" class="form-control">
              <option value="No">No</option>
              <option value="Si">Sí</option>
            </select>
            <input 
              v-if="formulario.sistemasAisladosSi === 'Si'"
              type="text" 
              v-model="formulario.sistemasAisladosDetalle" 
              class="form-control"
              placeholder="Detalle cuáles sistemas fueron aislados..."
            />
          </div>
        </div>
      </div>

      <!-- SECCIÓN 7: SOLICITUD DE APOYO -->
      <div class="seccion">
        <h4><i class="ph ph-lifebuoy"></i> Solicitud de Apoyo CSIRT</h4>
        <div class="campo">
          <label>¿Requiere Asistencia del CSIRT? <span class="requerido">*</span></label>
          <select v-model="formulario.requiereAsistenciaCSIRT" class="form-control" required>
            <option value="">Seleccione...</option>
            <option value="No">No</option>
            <option value="Si">Sí</option>
          </select>
        </div>
        
        <div v-if="formulario.requiereAsistenciaCSIRT === 'Si'" class="campo">
          <label>Tipo de Apoyo Requerido <span class="requerido">*</span></label>
          <select v-model="formulario.tipoApoyoRequerido" class="form-control" required>
            <option value="">Seleccione...</option>
            <option value="Análisis forense">Análisis forense</option>
            <option value="Contención">Apoyo en contención</option>
            <option value="Comunicaciones">Gestión de comunicaciones</option>
            <option value="Coordinación">Coordinación con otras entidades</option>
            <option value="Recuperación">Apoyo en recuperación</option>
            <option value="Otro">Otro</option>
          </select>
          <textarea 
            v-if="formulario.tipoApoyoRequerido === 'Otro'"
            v-model="formulario.tipoApoyoOtro" 
            class="form-control mt-2"
            rows="2"
            placeholder="Especifique el tipo de apoyo requerido..."
          ></textarea>
        </div>
      </div>

      <!-- SECCIÓN 8: DECLARACIÓN Y CONFIRMACIÓN -->
      <div class="seccion declaracion">
        <h4><i class="ph ph-seal-check"></i> Declaración</h4>
        <div class="declaracion-box">
          <p>
            Declaro que la información proporcionada es verídica y completa según mi mejor conocimiento 
            al momento de este reporte. Entiendo que esta notificación es de carácter obligatorio 
            según la normativa ANCI y que cualquier omisión o falsedad puede resultar en sanciones.
          </p>
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="formulario.declaracionVeracidad"
              required
            />
            <span>Confirmo la veracidad de la información proporcionada</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Footer con acciones -->
    <div class="formulario-footer">
      <div class="info-urgente">
        <i class="ph ph-warning-circle"></i>
        <div>
          <span class="titulo">PLAZO LEGAL: 3 HORAS</span>
          <span class="subtitulo">Desde la detección del incidente</span>
        </div>
      </div>
      
      <div class="acciones">
        <button @click="guardarBorrador" class="btn btn-secondary">
          <i class="ph ph-floppy-disk"></i>
          Guardar Borrador
        </button>
        
        <button @click="validarFormulario" class="btn btn-primary" :disabled="enviando || !formularioValido">
          <i v-if="!enviando" class="ph ph-paper-plane-tilt"></i>
          <div v-else class="spinner-border spinner-border-sm" role="status"></div>
          {{ enviando ? 'Enviando...' : 'Enviar Alerta Temprana' }}
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay" @click.self="mostrarConfirmacion = false">
      <div class="modal-confirmacion">
        <div class="modal-header urgente">
          <i class="ph ph-warning-circle"></i>
          <h4>Confirmar Envío de Alerta Temprana</h4>
        </div>
        
        <div class="modal-body">
          <p class="alerta-legal">
            <strong>IMPORTANTE:</strong> Esta es una notificación oficial a la Agencia Nacional 
            de Ciberseguridad e Inteligencia (ANCI) según lo establecido en la normativa vigente.
          </p>
          
          <div class="resumen-envio">
            <h5>Resumen del Reporte:</h5>
            <ul>
              <li><strong>Tipo:</strong> Alerta Temprana (3 horas)</li>
              <li><strong>Empresa:</strong> {{ formulario.nombreInstitucion }}</li>
              <li><strong>Incidente:</strong> {{ formulario.descripcionBreve.substring(0, 100) }}...</li>
              <li><strong>Criticidad:</strong> {{ formulario.criticidad || 'Alta' }}</li>
              <li><strong>Sistemas Afectados:</strong> {{ formulario.serviciosInterrumpidos }}</li>
              <li><strong>Solicita CSIRT:</strong> {{ formulario.requiereAsistenciaCSIRT }}</li>
            </ul>
          </div>
          
          <div class="advertencia-final">
            <i class="ph ph-seal-warning"></i>
            <p>
              Una vez enviado, este reporte no podrá ser modificado. 
              Asegúrese de que toda la información sea correcta.
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="mostrarConfirmacion = false" class="btn btn-secondary">
            <i class="ph ph-x"></i>
            Revisar Nuevamente
          </button>
          <button @click="enviarDefinitivo" class="btn btn-danger">
            <i class="ph ph-paper-plane-tilt"></i>
            Confirmar y Enviar a ANCI
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

// Estado del formulario
const formulario = ref({
  // Identificación de la entidad
  nombreInstitucion: '',
  rut: '',
  tipoEntidad: '',
  sectorEsencial: '',
  
  // Datos de contacto
  nombreReportante: '',
  cargoReportante: '',
  telefono24_7: '',
  emailOficial: '',
  
  // Datos del incidente
  fechaHoraDeteccion: '',
  fechaHoraInicioEstimada: '',
  descripcionBreve: '',
  taxonomiaInicial: '',
  
  // Impacto inicial
  sistemasAfectados: '',
  serviciosInterrumpidos: '',
  duracionEstimada: 0,
  usuariosAfectados: 0,
  alcanceGeografico: '',
  
  // Estado actual
  incidenteEnCurso: '',
  contencionAplicada: '',
  descripcionEstado: '',
  
  // Acciones inmediatas
  medidasContencion: '',
  sistemasAisladosSi: 'No',
  sistemasAisladosDetalle: '',
  
  // Solicitud de apoyo
  requiereAsistenciaCSIRT: '',
  tipoApoyoRequerido: '',
  tipoApoyoOtro: '',
  
  // Declaración
  declaracionVeracidad: false,
  
  // Metadata
  criticidad: 'Alta'
})

const enviando = ref(false)
const mostrarConfirmacion = ref(false)
const tiempoRestante = ref('')
const intervalId = ref(null)

// Computed
const formularioValido = computed(() => {
  return formulario.value.declaracionVeracidad &&
         formulario.value.nombreReportante &&
         formulario.value.cargoReportante &&
         formulario.value.telefono24_7 &&
         formulario.value.emailOficial &&
         formulario.value.descripcionBreve &&
         formulario.value.taxonomiaInicial &&
         formulario.value.sectorEsencial
})

// Métodos
async function cargarDatosIncidente() {
  try {
    // Cargar datos del incidente
    const response = await axios.get(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}`)
    const incidente = response.data
    
    // Prellenar datos de la empresa
    formulario.value.nombreInstitucion = incidente.RazonSocial || ''
    formulario.value.rut = incidente.RUT || ''
    formulario.value.tipoEntidad = incidente.TipoEmpresa || 'PSE'
    
    // Prellenar datos del incidente
    formulario.value.fechaHoraDeteccion = incidente.FechaDeteccion ? 
      new Date(incidente.FechaDeteccion).toISOString().slice(0, 16) : ''
    formulario.value.fechaHoraInicioEstimada = incidente.FechaOcurrencia ? 
      new Date(incidente.FechaOcurrencia).toISOString().slice(0, 16) : ''
    formulario.value.descripcionBreve = incidente.DescripcionInicial || ''
    formulario.value.criticidad = incidente.Criticidad || 'Alta'
    
    // Prellenar impacto si existe
    formulario.value.sistemasAfectados = incidente.SistemasAfectados || ''
    formulario.value.serviciosInterrumpidos = incidente.ServiciosInterrumpidos || ''
    formulario.value.alcanceGeografico = incidente.AlcanceGeografico || ''
    
    // Prellenar datos de contacto si existen
    formulario.value.nombreReportante = incidente.NombreReportante || ''
    formulario.value.cargoReportante = incidente.CargoReportante || ''
    formulario.value.telefono24_7 = incidente.TelefonoEmergencia || ''
    formulario.value.emailOficial = incidente.EmailOficialSeguridad || ''
    
    // Prellenar sector si existe
    formulario.value.sectorEsencial = incidente.SectorEsencial || ''
    
    // Calcular tiempo restante
    calcularTiempoRestante(incidente.FechaDeteccion)
    
  } catch (error) {
    console.error('Error cargando datos:', error)
    alert('Error al cargar los datos del incidente')
  }
}

function calcularTiempoRestante(fechaDeteccion) {
  if (!fechaDeteccion) return
  
  const ahora = new Date()
  const deteccion = new Date(fechaDeteccion)
  const limite = new Date(deteccion.getTime() + (3 * 60 * 60 * 1000)) // 3 horas
  
  const actualizar = () => {
    const ahora = new Date()
    const diferencia = limite - ahora
    
    if (diferencia <= 0) {
      tiempoRestante.value = 'VENCIDO'
      return
    }
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000)
    
    tiempoRestante.value = `${horas}h ${minutos}m ${segundos}s`
  }
  
  actualizar()
  intervalId.value = setInterval(actualizar, 1000)
}

async function guardarBorrador() {
  try {
    const datos = {
      ...formulario.value,
      tipoInforme: 'alertaTemprana',
      incidenteId: props.incidenteId
    }
    
    await axios.post(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}/borradores`, datos)
    alert('Borrador guardado exitosamente')
  } catch (error) {
    console.error('Error guardando borrador:', error)
    alert('Error al guardar el borrador')
  }
}

function validarFormulario() {
  // Validar campos requeridos
  const camposRequeridos = [
    'nombreReportante', 'cargoReportante', 'telefono24_7', 'emailOficial',
    'sectorEsencial', 'descripcionBreve', 'taxonomiaInicial',
    'sistemasAfectados', 'serviciosInterrumpidos', 'duracionEstimada',
    'usuariosAfectados', 'alcanceGeografico', 'incidenteEnCurso',
    'contencionAplicada', 'descripcionEstado', 'medidasContencion',
    'requiereAsistenciaCSIRT'
  ]
  
  for (const campo of camposRequeridos) {
    if (!formulario.value[campo] && formulario.value[campo] !== 0) {
      alert(`Por favor complete el campo: ${campo.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
      return
    }
  }
  
  mostrarConfirmacion.value = true
}

async function enviarDefinitivo() {
  enviando.value = true
  mostrarConfirmacion.value = false
  
  try {
    // Preparar datos para envío
    const datosEnvio = {
      tipoInforme: 'alertaTemprana',
      incidenteId: props.incidenteId,
      datos: formulario.value,
      fechaEnvio: new Date().toISOString()
    }
    
    // Enviar a la API
    const response = await axios.post(
      `${API_BASE_URL}/admin/incidentes/${props.incidenteId}/enviar-alerta-temprana`,
      datosEnvio
    )
    
    if (response.data.success) {
      // Actualizar estado del incidente
      await axios.patch(`${API_BASE_URL}/admin/incidentes/${props.incidenteId}`, {
        AlertaTempranaEnviada: true,
        FechaAlertaTemprana: new Date().toISOString(),
        // Actualizar campos en la BD
        NombreReportante: formulario.value.nombreReportante,
        CargoReportante: formulario.value.cargoReportante,
        TelefonoEmergencia: formulario.value.telefono24_7,
        EmailOficialSeguridad: formulario.value.emailOficial,
        SectorEsencial: formulario.value.sectorEsencial,
        DescripcionEstadoActual: formulario.value.descripcionEstado,
        DuracionEstimadaHoras: formulario.value.duracionEstimada,
        IncidenteEnCurso: formulario.value.incidenteEnCurso === 'Si',
        ContencionAplicada: formulario.value.contencionAplicada === 'Si'
      })
      
      alert('Alerta Temprana enviada exitosamente a ANCI')
      
      // Redirigir a la vista de detalle
      router.push({
        name: 'VistaDetalleIncidenteANCI',
        params: { incidenteId: props.incidenteId }
      })
    }
    
  } catch (error) {
    console.error('Error enviando alerta:', error)
    alert('Error al enviar la alerta temprana. Por favor intente nuevamente.')
  } finally {
    enviando.value = false
  }
}

// Lifecycle
onMounted(() => {
  cargarDatosIncidente()
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.formulario-alerta-temprana {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header urgente */
.formulario-header.urgente {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
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

.header-content h3 i {
  font-size: 2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.header-content .descripcion {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 1.1rem;
}

/* Timer urgente */
.timer-urgente {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  min-width: 180px;
}

.timer-urgente i {
  font-size: 2.5rem;
  margin-bottom: 8px;
  display: block;
}

.timer-urgente .tiempo {
  font-size: 2rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  display: block;
  margin-bottom: 4px;
}

.timer-urgente .label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Body del formulario */
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

.campo label small {
  color: #64748b;
  font-weight: normal;
  margin-left: 8px;
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

.form-control[readonly] {
  background: rgba(30, 41, 59, 0.3);
  cursor: not-allowed;
  color: #94a3b8;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

select.form-control {
  cursor: pointer;
}

/* Grid de campos */
.campo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Campo compuesto */
.campo-compuesto {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  align-items: start;
}

/* Contador de caracteres */
.contador-caracteres {
  text-align: right;
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 5px;
}

/* Selector de taxonomía */
.taxonomia-selector select {
  font-family: 'Courier New', monospace;
}

.taxonomia-selector optgroup {
  font-weight: bold;
  color: #60a5fa;
}

/* Sección de declaración */
.seccion.declaracion {
  background: rgba(239, 68, 68, 0.05);
  padding: 30px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-top: 40px;
}

.declaracion-box {
  background: rgba(30, 41, 59, 0.5);
  padding: 25px;
  border-radius: 8px;
}

.declaracion-box p {
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #e2e8f0;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-top: 2px;
  flex-shrink: 0;
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

.info-urgente {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fbbf24;
}

.info-urgente i {
  font-size: 2rem;
}

.info-urgente .titulo {
  display: block;
  font-weight: bold;
  font-size: 1.1rem;
}

.info-urgente .subtitulo {
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.5);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
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

.modal-header.urgente {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
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

.modal-header i {
  font-size: 1.75rem;
}

.modal-body {
  padding: 30px;
}

.alerta-legal {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 16px 20px;
  border-radius: 8px;
  color: #fbbf24;
  margin-bottom: 25px;
  line-height: 1.6;
}

.resumen-envio {
  background: rgba(30, 41, 59, 0.5);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.resumen-envio h5 {
  color: #cbd5e1;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.resumen-envio ul {
  margin: 0;
  padding-left: 25px;
  color: #94a3b8;
}

.resumen-envio li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.resumen-envio strong {
  color: #e2e8f0;
}

.advertencia-final {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 16px 20px;
  border-radius: 8px;
  color: #f87171;
}

.advertencia-final i {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.advertencia-final p {
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  background: rgba(30, 41, 59, 0.5);
  padding: 20px 30px;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-danger {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-header.urgente {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .formulario-body {
    padding: 25px;
  }
  
  .campo-grid {
    grid-template-columns: 1fr;
  }
  
  .campo-compuesto {
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