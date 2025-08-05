<template>
  <div class="vista-detalle-anci">
    <!-- Reloj flotante de cuenta regresiva -->
    <div v-if="mostrarReloj && plazoActual" class="reloj-flotante" :class="{ 'urgente': esRelojUrgente }">
      <div class="reloj-header">
        <i class="ph ph-timer"></i>
        <span class="reloj-titulo">{{ tipoPlazoCritico }}</span>
      </div>
      <div class="reloj-tiempo">
        {{ tiempoRestanteCritico }}
      </div>
      <div class="reloj-footer">
        Plazo legal ANCI
      </div>
    </div>
    
    <!-- Header con navegación -->
    <div class="header-navegacion">
      <button @click="volver" class="btn-volver">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Lista de Incidentes</span>
      </button>
      
      <div class="header-info">
        <h1 class="titulo-principal">
          Gestión de Incidente ANCI
          <span class="badge-anci">
            <i class="ph ph-warning-circle"></i>
            REPORTE ANCI ACTIVO
          </span>
        </h1>
        <p class="subtitulo">
          Incidente #{{ incidenteId }} - {{ incidente.Titulo || 'Sin título' }}
        </p>
      </div>
    </div>

    <!-- Sistema de 3 Tarjetas -->
    <div class="sistema-tarjetas">
      <!-- Tarjeta 1: Expediente Semilla -->
      <div class="tarjeta tarjeta-semilla" @click="abrirExpedienteSemilla">
        <div class="tarjeta-header">
          <div class="tarjeta-icono">
            <i class="ph ph-notebook"></i>
          </div>
          <h3 class="tarjeta-titulo">Expediente Semilla</h3>
          <span class="tarjeta-badge badge-editable">
            <i class="ph ph-pencil"></i>
            Editable*
          </span>
        </div>
        
        <div class="tarjeta-body">
          <p class="tarjeta-descripcion">
            Documento maestro del incidente con toda la información detallada y evidencias.
          </p>
          
          <div class="info-items">
            <div class="info-item">
              <i class="ph ph-calendar"></i>
              <span>Creado: {{ formatearFecha(incidente.FechaCreacion) }}</span>
            </div>
            <div class="info-item">
              <i class="ph ph-user"></i>
              <span>Responsable: {{ incidente.ResponsableCliente || 'No asignado' }}</span>
            </div>
            <div class="info-item" v-if="incidente.SeccionCongelada">
              <i class="ph ph-lock"></i>
              <span class="text-warning">Sección 1 congelada</span>
            </div>
          </div>
          
          <div class="estadisticas-mini">
            <div class="stat-mini">
              <span class="stat-numero">{{ incidente.TotalEvidencias || 0 }}</span>
              <span class="stat-label">Evidencias</span>
            </div>
            <div class="stat-mini">
              <span class="stat-numero">{{ incidente.TotalComentarios || 0 }}</span>
              <span class="stat-label">Comentarios</span>
            </div>
            <div class="stat-mini">
              <span class="stat-numero">{{ incidente.Completitud || 0 }}%</span>
              <span class="stat-label">Completado</span>
            </div>
          </div>
        </div>
        
        <div class="tarjeta-footer">
          <span class="nota-footer">
            * Solo secciones 2-6 editables tras generar ANCI
          </span>
          <button class="btn-tarjeta-accion">
            Abrir Expediente
            <i class="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Tarjeta 2: Informe ANCI -->
      <div class="tarjeta tarjeta-anci" @click="abrirInformeANCI">
        <div class="tarjeta-header">
          <div class="tarjeta-icono">
            <i class="ph ph-file-doc"></i>
          </div>
          <h3 class="tarjeta-titulo">Informe ANCI</h3>
          <span class="tarjeta-badge badge-oficial">
            <i class="ph ph-seal-check"></i>
            Oficial
          </span>
        </div>
        
        <div class="tarjeta-body">
          <p class="tarjeta-descripcion">
            Documento formal para reportar a la Agencia Nacional de Ciberseguridad e Inteligencia.
          </p>
          
          <div class="info-items">
            <div class="info-item">
              <i class="ph ph-identification-badge"></i>
              <span>Folio: {{ incidente.FolioANCI || 'Pendiente' }}</span>
            </div>
            <div class="info-item">
              <i class="ph ph-buildings"></i>
              <span>Tipo Empresa: {{ incidente.TipoEmpresa }}</span>
            </div>
            <div class="info-item">
              <i class="ph ph-file-arrow-down"></i>
              <span>Última exportación: {{ formatearFecha(incidente.UltimaExportacion) || 'Nunca' }}</span>
            </div>
          </div>
          
          <div class="formatos-exportacion">
            <p class="formatos-titulo">Formatos disponibles:</p>
            <div class="formatos-lista">
              <span class="formato-item">
                <i class="ph ph-file-pdf"></i> PDF
              </span>
              <span class="formato-item">
                <i class="ph ph-file-doc"></i> Word
              </span>
              <span class="formato-item">
                <i class="ph ph-file-text"></i> Texto
              </span>
            </div>
          </div>
        </div>
        
        <div class="tarjeta-footer">
          <div class="botones-exportacion">
            <button class="btn-exportar" @click.stop="exportarPDF">
              <i class="ph ph-file-pdf"></i>
              PDF
            </button>
            <button class="btn-exportar" @click.stop="exportarWord">
              <i class="ph ph-file-doc"></i>
              Word
            </button>
            <button class="btn-exportar" @click.stop="exportarTexto">
              <i class="ph ph-file-text"></i>
              Texto
            </button>
          </div>
          <button class="btn-tarjeta-accion">
            Ver Informe
            <i class="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Tarjeta 3: Cuenta Regresiva -->
      <div class="tarjeta tarjeta-cuenta-regresiva" 
           :class="{ 'urgente': esUrgente }"
           @click="abrirCuentaRegresiva">
        <div class="tarjeta-header">
          <div class="tarjeta-icono">
            <i class="ph ph-timer"></i>
          </div>
          <h3 class="tarjeta-titulo">Cuenta Regresiva</h3>
          <span class="tarjeta-badge" :class="badgePlazosClass">
            <i :class="iconoPlazos"></i>
            {{ estadoPlazos }}
          </span>
        </div>
        
        <div class="tarjeta-body">
          <p class="tarjeta-descripcion">
            Control de plazos legales para cumplimiento con la normativa ANCI.
          </p>
          
          <!-- Reloj grande de cuenta regresiva -->
          <div class="reloj-principal-tarjeta" v-if="tiempoRestanteCritico">
            <div class="reloj-label">{{ tipoPlazoCritico }}</div>
            <div class="tiempo-grande" :class="{ 'urgente': esRelojUrgente }">
              {{ tiempoRestanteCritico }}
            </div>
          </div>
          
          <!-- Timeline de plazos -->
          <div class="timeline-plazos">
            <!-- NUEVO: Alerta Temprana (3 horas) -->
            <div class="plazo-item" :class="{ 'completado': plazos.alertaTemprana?.completado, 'vencido': plazos.alertaTemprana?.vencido }">
              <div class="plazo-indicador">
                <i :class="plazos.alertaTemprana?.completado ? 'ph ph-check-circle' : 'ph ph-circle'"></i>
              </div>
              <div class="plazo-info">
                <span class="plazo-nombre">Alerta Temprana</span>
                <span class="plazo-tiempo">
                  3 horas
                  <span v-if="!plazos.alertaTemprana?.completado" class="tiempo-restante">
                    - {{ plazos.alertaTemprana?.tiempoRestante }}
                  </span>
                </span>
              </div>
              <div class="plazo-acciones">
                <div v-if="!plazos.alertaTemprana?.completado" class="reloj-mini">
                  <i class="ph ph-clock"></i>
                  {{ plazos.alertaTemprana?.tiempoRestante || '3h 00m' }}
                </div>
                <button 
                  @click="generarInforme('alertaTemprana')" 
                  class="btn-generar-mini"
                  :class="{ 'completado': plazos.alertaTemprana?.completado }"
                >
                  <i class="ph ph-file-text"></i>
                  {{ plazos.alertaTemprana?.completado ? 'Ver' : 'Generar' }}
                </button>
              </div>
            </div>
            
            <div class="plazo-item" :class="{ 'completado': plazos.preliminar.completado, 'vencido': plazos.preliminar.vencido }">
              <div class="plazo-indicador">
                <i :class="plazos.preliminar.completado ? 'ph ph-check-circle' : 'ph ph-circle'"></i>
              </div>
              <div class="plazo-info">
                <span class="plazo-nombre">Informe Preliminar</span>
                <span class="plazo-tiempo">
                  {{ incidente.TipoEmpresa === 'OIV' ? '24 horas' : '72 horas' }}
                  <span v-if="!plazos.preliminar.completado" class="tiempo-restante">
                    - {{ plazos.preliminar.tiempoRestante }}
                  </span>
                </span>
              </div>
              <div class="plazo-acciones">
                <div v-if="!plazos.preliminar.completado" class="reloj-mini">
                  <i class="ph ph-clock"></i>
                  {{ plazos.preliminar.tiempoRestante || '72h 00m' }}
                </div>
                <button 
                  @click="generarInforme('preliminar')" 
                  class="btn-generar-mini"
                  :class="{ 'completado': plazos.preliminar.completado }"
                >
                  <i class="ph ph-file-text"></i>
                  {{ plazos.preliminar.completado ? 'Ver' : 'Generar' }}
                </button>
              </div>
            </div>
            
            <div class="plazo-item" :class="{ 'completado': plazos.completo.completado, 'vencido': plazos.completo.vencido }">
              <div class="plazo-indicador">
                <i :class="plazos.completo.completado ? 'ph ph-check-circle' : 'ph ph-circle'"></i>
              </div>
              <div class="plazo-info">
                <span class="plazo-nombre">Informe Completo</span>
                <span class="plazo-tiempo">
                  72 horas
                  <span v-if="!plazos.completo.completado" class="tiempo-restante">
                    - {{ plazos.completo.tiempoRestante }}
                  </span>
                </span>
              </div>
              <div class="plazo-acciones">
                <div v-if="!plazos.completo.completado" class="reloj-mini">
                  <i class="ph ph-clock"></i>
                  {{ plazos.completo.tiempoRestante || '72h 00m' }}
                </div>
                <button 
                  @click="generarInforme('completo')" 
                  class="btn-generar-mini"
                  :class="{ 'completado': plazos.completo.completado }"
                >
                  <i class="ph ph-file-text"></i>
                  {{ plazos.completo.completado ? 'Ver' : 'Generar' }}
                </button>
              </div>
            </div>
            
            <!-- NUEVO: Plan de Acción (Solo OIV - 7 días) -->
            <div v-if="incidente.TipoEmpresa === 'OIV'" class="plazo-item" :class="{ 'completado': plazos.planAccion?.completado, 'vencido': plazos.planAccion?.vencido }">
              <div class="plazo-indicador">
                <i :class="plazos.planAccion?.completado ? 'ph ph-check-circle' : 'ph ph-circle'"></i>
              </div>
              <div class="plazo-info">
                <span class="plazo-nombre">Plan de Acción</span>
                <span class="plazo-tiempo">
                  7 días
                  <span v-if="!plazos.planAccion?.completado" class="tiempo-restante">
                    - {{ plazos.planAccion?.tiempoRestante }}
                  </span>
                </span>
              </div>
              <div class="plazo-acciones">
                <div v-if="!plazos.planAccion?.completado" class="reloj-mini">
                  <i class="ph ph-clock"></i>
                  {{ plazos.planAccion?.tiempoRestante || '7d 00h' }}
                </div>
                <button 
                  @click="generarInforme('planAccion')" 
                  class="btn-generar-mini"
                  :class="{ 'completado': plazos.planAccion?.completado }"
                >
                  <i class="ph ph-file-text"></i>
                  {{ plazos.planAccion?.completado ? 'Ver' : 'Generar' }}
                </button>
              </div>
            </div>
            
            <div class="plazo-item" :class="{ 'completado': plazos.final.completado, 'vencido': plazos.final.vencido }">
              <div class="plazo-indicador">
                <i :class="plazos.final.completado ? 'ph ph-check-circle' : 'ph ph-circle'"></i>
              </div>
              <div class="plazo-info">
                <span class="plazo-nombre">Informe Final</span>
                <span class="plazo-tiempo">
                  15 días
                  <span v-if="!plazos.final.completado" class="tiempo-restante">
                    - {{ plazos.final.tiempoRestante }}
                  </span>
                </span>
              </div>
              <div class="plazo-acciones">
                <div v-if="!plazos.final.completado" class="reloj-mini">
                  <i class="ph ph-clock"></i>
                  {{ plazos.final.tiempoRestante || '15d 00h' }}
                </div>
                <button 
                  @click="generarInforme('final')" 
                  class="btn-generar-mini"
                  :class="{ 'completado': plazos.final.completado }"
                >
                  <i class="ph ph-file-text"></i>
                  {{ plazos.final.completado ? 'Ver' : 'Generar' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="alerta-proximos" v-if="tieneProximos">
            <i class="ph ph-warning"></i>
            <span>{{ mensajeAlerta }}</span>
          </div>
        </div>
        
        <div class="tarjeta-footer">
          <span class="fecha-inicio">
            Iniciado: {{ formatearFecha(incidente.FechaTransformacionANCI) }}
          </span>
          <button class="btn-tarjeta-accion">
            Ver Detalle
            <i class="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Sección 1 Congelada (si intentan editar) -->
    <div v-if="mostrarModalCongelado" class="modal-overlay" @click="cerrarModalCongelado">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <i class="ph ph-lock"></i>
          <h3>Sección 1 Congelada</h3>
        </div>
        <div class="modal-body">
          <p>
            La Sección 1 "Identificación General" ha sido congelada al generar el informe ANCI 
            para mantener la integridad del reporte oficial.
          </p>
          <p class="mt-3">
            Puedes continuar editando las secciones 2 a 6 del expediente semilla.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModalCongelado" class="btn-entendido">
            Entendido
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal para Expediente Semilla -->
    <div v-if="mostrandoExpedienteSemilla" class="modal-overlay" @click.self="cerrarExpedienteSemilla">
      <div class="modal-expediente-semilla">
        <button class="btn-cerrar-modal" @click="cerrarExpedienteSemilla">
          <i class="ph ph-x"></i>
        </button>
        <div v-if="!incidente.IncidenteID" class="cargando-expediente">
          <div class="spinner"></div>
          <p>Cargando expediente semilla...</p>
        </div>
        <AcordeonIncidenteANCI
          v-else
          :incidente-id="incidente.IncidenteID"
          :empresa-id="incidente.EmpresaID"
          :inquilino-id="incidente.InquilinoID || 1"
          :modo="'editar'"
          :datos-iniciales="datosParaEdicion"
          :empresa-info="{ tipo: incidente.TipoEmpresa || 'PSE', nombre: incidente.RazonSocial || '' }"
          :seccion-congelada="1"
          @incidente-guardado="handleIncidenteGuardado"
          @mounted="console.log('📌 AcordeonIncidenteANCI montado con ID:', incidente.IncidenteID)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import AcordeonIncidenteANCI from '../components/AcordeonIncidenteANCI.vue'

const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  incidenteId: {
    type: [String, Number],
    required: true
  }
})

// Estado
const incidente = ref({})
const mostrandoExpedienteSemilla = ref(false)
const datosParaEdicion = ref(null)
const plazos = ref({
  alertaTemprana: { completado: false, vencido: false, tiempoRestante: '' }, // NUEVO
  preliminar: { completado: false, vencido: false, tiempoRestante: '' },
  completo: { completado: false, vencido: false, tiempoRestante: '' },
  planAccion: { completado: false, vencido: false, tiempoRestante: '' }, // NUEVO - Solo OIV
  final: { completado: false, vencido: false, tiempoRestante: '' }
})
const mostrarModalCongelado = ref(false)
const intervalId = ref(null)
const mostrarReloj = ref(true)
const plazoActual = ref(null)

// Computed
const esUrgente = computed(() => {
  return plazos.value.preliminar.vencido || 
         plazos.value.completo.vencido ||
         (plazos.value.preliminar.tiempoRestante && plazos.value.preliminar.tiempoRestante.includes('hora'))
})

const tieneProximos = computed(() => {
  return Object.values(plazos.value).some(p => 
    !p.completado && p.tiempoRestante && 
    (p.tiempoRestante.includes('hora') || p.tiempoRestante.includes('minuto'))
  )
})

const mensajeAlerta = computed(() => {
  const proximos = []
  // CRÍTICO: Alerta Temprana
  if (!plazos.value.alertaTemprana?.completado && plazos.value.alertaTemprana?.tiempoRestante?.includes('hora')) {
    proximos.push('ALERTA TEMPRANA (3h)')
  }
  if (!plazos.value.preliminar.completado && plazos.value.preliminar.tiempoRestante?.includes('hora')) {
    proximos.push('Informe Preliminar')
  }
  if (!plazos.value.completo.completado && plazos.value.completo.tiempoRestante?.includes('hora')) {
    proximos.push('Informe Completo')
  }
  if (incidente.value.TipoEmpresa === 'OIV' && !plazos.value.planAccion?.completado && plazos.value.planAccion?.tiempoRestante?.includes('día')) {
    proximos.push('Plan de Acción')
  }
  return proximos.length > 0 ? `¡Atención! ${proximos.join(' y ')} próximo(s) a vencer` : ''
})

const estadoPlazos = computed(() => {
  if (plazos.value.final.completado) return 'Completado'
  if (plazos.value.preliminar.vencido || plazos.value.completo.vencido) return 'Vencido'
  if (tieneProximos.value) return 'Urgente'
  return 'En Proceso'
})

const badgePlazosClass = computed(() => {
  if (plazos.value.final.completado) return 'badge-completado'
  if (plazos.value.preliminar.vencido || plazos.value.completo.vencido) return 'badge-vencido'
  if (tieneProximos.value) return 'badge-urgente'
  return 'badge-proceso'
})

const iconoPlazos = computed(() => {
  if (plazos.value.final.completado) return 'ph ph-check-circle'
  if (plazos.value.preliminar.vencido || plazos.value.completo.vencido) return 'ph ph-x-circle'
  if (tieneProximos.value) return 'ph ph-warning-circle'
  return 'ph ph-hourglass-medium'
})

// Computed para el reloj flotante
const tipoPlazoCritico = computed(() => {
  if (!plazos.value.preliminar.completado && !plazos.value.preliminar.vencido) {
    return 'INFORME PRELIMINAR'
  } else if (!plazos.value.completo.completado && !plazos.value.completo.vencido) {
    return 'INFORME COMPLETO'
  } else if (!plazos.value.final.completado && !plazos.value.final.vencido) {
    return 'INFORME FINAL'
  }
  return ''
})

const tiempoRestanteCritico = computed(() => {
  if (!plazos.value.preliminar.completado && !plazos.value.preliminar.vencido) {
    return plazos.value.preliminar.tiempoRestante
  } else if (!plazos.value.completo.completado && !plazos.value.completo.vencido) {
    return plazos.value.completo.tiempoRestante
  } else if (!plazos.value.final.completado && !plazos.value.final.vencido) {
    return plazos.value.final.tiempoRestante
  }
  return ''
})

const esRelojUrgente = computed(() => {
  const tiempo = tiempoRestanteCritico.value
  return tiempo && (tiempo.includes('hora') || tiempo.includes('minuto'))
})

// Métodos
async function cargarDatos() {
  try {
    // Cargar datos del incidente
    const response = await axios.get(`${API_BASE_URL}/api/admin/incidentes/${props.incidenteId}`)
    incidente.value = response.data
    
    // Cargar estadísticas reales
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/api/admin/incidentes/${props.incidenteId}/estadisticas`)
      if (statsResponse.data) {
        incidente.value.TotalEvidencias = statsResponse.data.TotalEvidencias || 0
        incidente.value.TotalComentarios = statsResponse.data.TotalComentarios || 0
        incidente.value.Completitud = statsResponse.data.Completitud || 0
        console.log('📊 Estadísticas cargadas:', statsResponse.data)
      }
    } catch (statsError) {
      console.error('Error cargando estadísticas:', statsError)
      // Valores por defecto si falla
      incidente.value.TotalEvidencias = 0
      incidente.value.TotalComentarios = 0
      incidente.value.Completitud = 0
    }
    
    // Preparar datos para edición (igual que en VistaDetalleIncidente)
    datosParaEdicion.value = {
      // Sección 1
      '1.1': response.data.TipoRegistro || response.data.TipoFlujo || 'Registro General',
      '1.2': response.data.Titulo || '',
      '1.3': response.data.FechaDeteccion ? new Date(response.data.FechaDeteccion).toISOString().slice(0, 16) : '',
      '1.4': response.data.FechaOcurrencia ? new Date(response.data.FechaOcurrencia).toISOString().slice(0, 16) : '',
      '1.5': response.data.Criticidad || '',
      '1.6': response.data.AlcanceGeografico || '',
      
      // Campos CSIRT
      '1.7.solicitar_csirt': response.data.SolicitarCSIRT || false,
      '1.7.tipo_apoyo': response.data.TipoApoyoCSIRT || '',
      '1.7.urgencia': response.data.UrgenciaCSIRT || '',
      '1.7.observaciones_csirt': response.data.ObservacionesCSIRT || '',
      
      // Sección 2
      '2.1': response.data.DescripcionInicial || '',
      '2.2': response.data.AnciImpactoPreliminar || '',
      '2.3': response.data.SistemasAfectados || '',
      '2.4': response.data.ServiciosInterrumpidos || '',
      
      // Sección 3
      '3.1': response.data.OrigenIncidente || '',
      '3.2': response.data.AnciTipoAmenaza || '',
      '3.3': response.data.ResponsableCliente || '',
      
      // Sección 4 - Taxonomías
      taxonomias_seleccionadas: response.data.taxonomias_seleccionadas || [],
      
      // Sección 5
      '5.1': response.data.AccionesInmediatas || '',
      
      // Sección 6
      '6.1': response.data.CausaRaiz || '',
      '6.2': response.data.LeccionesAprendidas || '',
      '6.3': response.data.PlanMejora || '',
      
      // Archivos
      archivos: response.data.archivos || {},
      archivos_existentes: response.data.archivos || {}
    }
    
    // Calcular plazos
    calcularPlazos()
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

function calcularPlazos() {
  if (!incidente.value.FechaTransformacionANCI) return
  
  const fechaInicio = new Date(incidente.value.FechaTransformacionANCI)
  const ahora = new Date()
  
  // Calcular para cada tipo de informe
  // Plazos según documento oficial ANCI
  const plazosConfig = {
    alertaTemprana: 3, // NUEVO: 3 horas para TODOS (OIV y PSE)
    preliminar: incidente.value.TipoEmpresa === 'OIV' ? 24 : 72, // TODO: Condicional si servicio esencial afectado
    completo: 72,
    planAccion: incidente.value.TipoEmpresa === 'OIV' ? 168 : null, // NUEVO: 7 días solo para OIV
    final: 360 // CORREGIDO: 15 días (no 30)
  }
  
  Object.keys(plazosConfig).forEach(tipo => {
    const horasPlazo = plazosConfig[tipo]
    const fechaLimite = new Date(fechaInicio.getTime() + horasPlazo * 60 * 60 * 1000)
    const diferencia = fechaLimite - ahora
    
    plazos.value[tipo] = {
      completado: incidente.value[`Informe${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Completado`] || false,
      vencido: diferencia < 0 && !incidente.value[`Informe${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Completado`],
      tiempoRestante: formatearTiempoRestante(diferencia)
    }
  })
}

function formatearTiempoRestante(milisegundos) {
  if (milisegundos < 0) return 'Vencido'
  
  const horas = Math.floor(milisegundos / (1000 * 60 * 60))
  const minutos = Math.floor((milisegundos % (1000 * 60 * 60)) / (1000 * 60))
  
  if (horas >= 24) {
    const dias = Math.floor(horas / 24)
    return `${dias} día${dias > 1 ? 's' : ''}`
  } else if (horas > 0) {
    return `${horas}h ${minutos}m`
  } else {
    return `${minutos} minutos`
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function volver() {
  router.back()
}

function abrirExpedienteSemilla() {
  console.log('🔍 DEBUG - Abriendo expediente semilla:')
  console.log('  - incidente.IncidenteID:', incidente.value.IncidenteID)
  console.log('  - incidente.EmpresaID:', incidente.value.EmpresaID)
  console.log('  - datosParaEdicion:', datosParaEdicion.value)
  console.log('  - incidente completo:', incidente.value)
  
  if (!incidente.value.IncidenteID) {
    console.error('❌ No se puede abrir expediente: IncidenteID no está definido')
    alert('Error: Los datos del incidente no están cargados. Por favor, recargue la página.')
    return
  }
  
  mostrandoExpedienteSemilla.value = true
}

function cerrarExpedienteSemilla() {
  mostrandoExpedienteSemilla.value = false
}

function handleIncidenteGuardado(resultado) {
  console.log('✅ Incidente ANCI guardado:', resultado)
  cerrarExpedienteSemilla()
  cargarDatos() // Recargar datos
}

function abrirInformeANCI() {
  router.push({
    name: 'InformesANCI',
    params: { incidenteId: props.incidenteId }
  })
}

function abrirCuentaRegresiva() {
  router.push({
    name: 'CuentaRegresivaDetalle',
    params: { incidenteId: props.incidenteId }
  })
}

function generarInforme(tipoInforme) {
  // Redirigir al formulario de envío ANCI con el tipo de informe
  router.push({
    name: 'FormularioEnvioANCI',
    params: { 
      incidenteId: props.incidenteId,
      tipoInforme: tipoInforme
    }
  })
}

async function exportarPDF() {
  try {
    console.log('Generando informe PDF...')
    const response = await axios.post(
      `${API_BASE_URL}/api/informes-anci/generar/${props.incidenteId}`,
      { tipo: 'completo', formato: 'pdf' },
      { responseType: 'blob' }
    )
    
    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Informe_ANCI_${props.incidenteId}_${new Date().toISOString().slice(0,10)}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    
    console.log('✅ PDF generado exitosamente')
  } catch (error) {
    console.error('Error exportando PDF:', error)
    alert('Error al generar el informe PDF. Por favor, intente nuevamente.')
  }
}

async function exportarWord() {
  try {
    console.log('Generando informe Word...')
    const response = await axios.post(
      `${API_BASE_URL}/api/informes-anci/generar/${props.incidenteId}`,
      { tipo: 'completo', formato: 'docx' },
      { responseType: 'blob' }
    )
    
    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Informe_ANCI_${props.incidenteId}_${new Date().toISOString().slice(0,10)}.docx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    console.log('✅ Word generado exitosamente')
  } catch (error) {
    console.error('Error exportando Word:', error)
    alert('Error al generar el informe Word. Por favor, intente nuevamente.')
  }
}

async function exportarTexto() {
  try {
    console.log('Generando informe de texto...')
    const response = await axios.post(
      `${API_BASE_URL}/api/informes-anci/generar/${props.incidenteId}`,
      { tipo: 'preliminar' }
    )
    
    if (response.data.contenido) {
      // Crear archivo de texto con el contenido
      const blob = new Blob([response.data.contenido], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Informe_ANCI_${props.incidenteId}_${new Date().toISOString().slice(0,10)}.txt`
      link.click()
      window.URL.revokeObjectURL(url)
      
      console.log('✅ Texto generado exitosamente')
    } else if (response.data.informe_id) {
      // Si devuelve un ID, descargar desde el servidor
      window.location.href = `${API_BASE_URL}/api/informes-anci/descargar/${response.data.informe_id}`
    }
  } catch (error) {
    console.error('Error exportando texto:', error)
    alert('Error al exportar el informe de texto. Por favor, intente nuevamente.')
  }
}

function cerrarModalCongelado() {
  mostrarModalCongelado.value = false
}

// Lifecycle
onMounted(() => {
  cargarDatos()
  // Actualizar cada segundo para el reloj
  intervalId.value = setInterval(() => {
    calcularPlazos()
    // Actualizar plazo actual para el reloj
    if (!plazos.value.preliminar.completado && !plazos.value.preliminar.vencido) {
      plazoActual.value = plazos.value.preliminar
    } else if (!plazos.value.completo.completado && !plazos.value.completo.vencido) {
      plazoActual.value = plazos.value.completo
    } else if (!plazos.value.final.completado && !plazos.value.final.vencido) {
      plazoActual.value = plazos.value.final
    } else {
      plazoActual.value = null
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.vista-detalle-anci {
  min-height: 100vh;
  background: #0f172a;
  padding: 2rem;
}

/* Header */
.header-navegacion {
  margin-bottom: 2rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.btn-volver:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  transform: translateX(-4px);
}

.header-info {
  margin-bottom: 2rem;
}

.titulo-principal {
  font-size: 2rem;
  color: #e2e8f0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.badge-anci {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 9999px;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 600;
  animation: pulse-anci 2s infinite;
}

@keyframes pulse-anci {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.subtitulo {
  color: #94a3b8;
  font-size: 1.125rem;
}

/* Sistema de Tarjetas */
.sistema-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.tarjeta {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.tarjeta:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Variantes de tarjetas */
.tarjeta-semilla {
  border-color: rgba(59, 130, 246, 0.3);
}

.tarjeta-semilla:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
}

.tarjeta-anci {
  border-color: rgba(168, 85, 247, 0.3);
}

.tarjeta-anci:hover {
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.1);
}

.tarjeta-cuenta-regresiva {
  border-color: rgba(251, 146, 60, 0.3);
}

.tarjeta-cuenta-regresiva:hover {
  border-color: rgba(251, 146, 60, 0.5);
  box-shadow: 0 20px 40px rgba(251, 146, 60, 0.1);
}

.tarjeta-cuenta-regresiva.urgente {
  border-color: rgba(239, 68, 68, 0.5);
  animation: pulse-urgente 2s infinite;
}

@keyframes pulse-urgente {
  0%, 100% {
    border-color: rgba(239, 68, 68, 0.5);
  }
  50% {
    border-color: rgba(239, 68, 68, 0.8);
  }
}

/* Header de tarjeta */
.tarjeta-header {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tarjeta-icono {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.tarjeta-semilla .tarjeta-icono {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tarjeta-anci .tarjeta-icono {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.tarjeta-cuenta-regresiva .tarjeta-icono {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
}

.tarjeta-titulo {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.tarjeta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-editable {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-oficial {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-proceso {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.badge-urgente {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-vencido {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.badge-completado {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Body de tarjeta */
.tarjeta-body {
  padding: 1.5rem;
  flex: 1;
}

.tarjeta-descripcion {
  color: #94a3b8;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.info-item i {
  color: #64748b;
  font-size: 1rem;
}

.text-warning {
  color: #f59e0b;
}

/* Estadísticas mini */
.estadisticas-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.stat-mini {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-numero {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}

/* Formatos de exportación */
.formatos-exportacion {
  margin-top: 1rem;
}

.formatos-titulo {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.formatos-lista {
  display: flex;
  gap: 1rem;
}

.formato-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #cbd5e1;
  font-size: 0.875rem;
}

.formato-item i {
  font-size: 1rem;
}

/* Timeline de plazos */
.timeline-plazos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
}

.plazo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
  position: relative;
}

.plazo-item.completado {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.plazo-item.vencido {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.plazo-indicador {
  font-size: 1.25rem;
}

.plazo-item.completado .plazo-indicador {
  color: #22c55e;
}

.plazo-item.vencido .plazo-indicador {
  color: #ef4444;
}

.plazo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plazo-nombre {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.plazo-tiempo {
  font-size: 0.75rem;
  color: #94a3b8;
}

.tiempo-restante {
  color: #fb923c;
  font-weight: 600;
}

.plazo-item.vencido .tiempo-restante {
  color: #ef4444;
}

/* Acciones de plazo */
.plazo-acciones {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.reloj-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #60a5fa;
  font-size: 0.875rem;
  min-width: 80px;
  justify-content: center;
}

.reloj-mini i {
  font-size: 1rem;
}

.plazo-item.vencido .reloj-mini {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.btn-generar-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-generar-mini:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-generar-mini.completado {
  background: linear-gradient(135deg, #059669, #10b981);
}

.btn-generar-mini.completado:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-generar-mini i {
  font-size: 1rem;
}

/* Alerta próximos */
.alerta-proximos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.3);
  border-radius: 0.5rem;
  color: #fb923c;
  font-size: 0.875rem;
  font-weight: 500;
}

.alerta-proximos i {
  font-size: 1.25rem;
}

/* Footer de tarjeta */
.tarjeta-footer {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nota-footer, .fecha-inicio {
  font-size: 0.75rem;
  color: #64748b;
  font-style: italic;
}

.btn-tarjeta-accion {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-tarjeta-accion:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

/* Botones de exportación */
.botones-exportacion {
  display: flex;
  gap: 0.5rem;
}

.btn-exportar {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-exportar:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  overflow: hidden;
  animation: slideIn 0.3s;
}

.modal-header {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-header i {
  font-size: 2rem;
  color: #f59e0b;
}

.modal-header h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.modal-footer {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
}

.btn-entendido {
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-entendido:hover {
  background: #2563eb;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .sistema-tarjetas {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .titulo-principal {
    font-size: 1.5rem;
    flex-wrap: wrap;
  }
  
  .estadisticas-mini {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .formatos-lista {
    flex-wrap: wrap;
  }
}

/* Modal para Expediente Semilla */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-expediente-semilla {
  background-color: #0f172a;
  border-radius: 1rem;
  width: 95%;
  max-width: 1400px;
  height: 90vh;
  overflow: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  border: 1px solid #1e293b;
}

.btn-cerrar-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #374151;
  color: white;
  border: none;
  border-radius: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.btn-cerrar-modal:hover {
  background-color: #ef4444;
  transform: scale(1.05);
}

.btn-cerrar-modal i {
  font-size: 1.25rem;
}

/* Reloj flotante de cuenta regresiva */
.reloj-flotante {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95));
  color: white;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 250px;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.reloj-flotante.urgente {
  animation: pulseUrgent 1s infinite;
}

@keyframes pulseUrgent {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
  }
  50% { 
    transform: scale(1.02); 
    box-shadow: 0 8px 40px rgba(220, 38, 38, 0.5);
  }
}

.reloj-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.reloj-header i {
  font-size: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.reloj-titulo {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.reloj-tiempo {
  font-size: 32px;
  font-weight: bold;
  margin: 15px 0;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.reloj-footer {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Reloj principal en la tarjeta */
.reloj-principal-tarjeta {
  text-align: center;
  padding: 20px 0;
  margin: 10px 0;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.reloj-principal-tarjeta .reloj-label {
  font-size: 0.875rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
}

.reloj-principal-tarjeta .tiempo-grande {
  font-size: 48px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #60a5fa;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  line-height: 1;
}

.reloj-principal-tarjeta .tiempo-grande.urgente {
  color: #ef4444;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>