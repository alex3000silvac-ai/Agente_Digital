<template>
  <div class="reporte-anci-exportable">
    <!-- Header con acciones de exportación -->
    <div class="reporte-header">
      <div class="header-info">
        <h2 class="reporte-titulo">
          <i class="ph ph-shield-warning"></i>
          Reporte ANCI Oficial
        </h2>
        <p class="reporte-subtitulo">
          Formato oficial para envío a la Agencia Nacional de Ciberseguridad
        </p>
      </div>
      
      <div class="export-actions">
        <button @click="exportarPDF" class="btn-export btn-pdf" :disabled="exportando">
          <i class="ph ph-file-pdf"></i>
          <span>{{ exportando === 'pdf' ? 'Generando...' : 'Exportar PDF' }}</span>
        </button>
        <button @click="exportarWord" class="btn-export btn-word" :disabled="exportando">
          <i class="ph ph-file-doc"></i>
          <span>{{ exportando === 'word' ? 'Generando...' : 'Exportar Word' }}</span>
        </button>
        <button @click="exportarTexto" class="btn-export btn-text" :disabled="exportando">
          <i class="ph ph-file-text"></i>
          <span>{{ exportando === 'text' ? 'Generando...' : 'Exportar Texto' }}</span>
        </button>
      </div>
    </div>

    <!-- Contenido del Reporte -->
    <div class="reporte-contenido" ref="reporteContent">
      <!-- Encabezado Oficial -->
      <div class="seccion-oficial">
        <div class="logo-anci">
          <div class="logo-placeholder">
            <i class="ph ph-shield-check"></i>
            <span>ANCI</span>
          </div>
          <div class="info-oficial">
            <h3>AGENCIA NACIONAL DE CIBERSEGURIDAD</h3>
            <p>Reporte de Incidente de Ciberseguridad</p>
            <p class="fecha-generacion">Generado: {{ fechaGeneracion }}</p>
          </div>
        </div>
      </div>

      <!-- Información de la Empresa -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">1. INFORMACIÓN DE LA EMPRESA REPORTANTE</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Razón Social:</label>
            <span>{{ empresa.RazonSocial }}</span>
          </div>
          <div class="info-item">
            <label>RUT:</label>
            <span>{{ empresa.RUT }}</span>
          </div>
          <div class="info-item">
            <label>Tipo de Empresa:</label>
            <span class="badge-tipo">{{ empresa.TipoEmpresa }}</span>
          </div>
          <div class="info-item">
            <label>Sector Económico:</label>
            <span>{{ empresa.SectorEconomico || 'No especificado' }}</span>
          </div>
        </div>
      </div>

      <!-- Información del Incidente -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">2. IDENTIFICACIÓN DEL INCIDENTE</h3>
        <div class="info-grid">
          <div class="info-item span-2">
            <label>Título del Incidente:</label>
            <span class="texto-destacado">{{ incidente.Titulo }}</span>
          </div>
          <div class="info-item">
            <label>ID Sistema:</label>
            <span>{{ incidente.IncidenteID }}</span>
          </div>
          <div class="info-item">
            <label>Criticidad:</label>
            <span :class="['badge-criticidad', `criticidad-${incidente.Criticidad?.toLowerCase()}`]">
              {{ incidente.Criticidad }}
            </span>
          </div>
          <div class="info-item">
            <label>Fecha de Detección:</label>
            <span>{{ formatearFecha(incidente.FechaDeteccion) }}</span>
          </div>
          <div class="info-item">
            <label>Fecha de Ocurrencia:</label>
            <span>{{ formatearFecha(incidente.FechaOcurrencia) || 'Igual a detección' }}</span>
          </div>
        </div>
      </div>

      <!-- Descripción Detallada -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">3. DESCRIPCIÓN DEL INCIDENTE</h3>
        <div class="descripcion-contenido">
          <div class="campo-texto">
            <label>Descripción Inicial:</label>
            <p>{{ incidente.DescripcionInicial }}</p>
          </div>
          <div class="campo-texto" v-if="incidente.AnciImpactoPreliminar">
            <label>Impacto Preliminar Observado:</label>
            <p>{{ incidente.AnciImpactoPreliminar }}</p>
          </div>
        </div>
      </div>

      <!-- Sistemas Afectados -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">4. SISTEMAS Y SERVICIOS AFECTADOS</h3>
        <div class="campo-texto">
          <label>Sistemas, Activos o Personal Afectado:</label>
          <p>{{ incidente.SistemasAfectados }}</p>
        </div>
        <div class="campo-texto" v-if="incidente.ServiciosInterrumpidos">
          <label>Servicios Interrumpidos y Duración:</label>
          <p>{{ incidente.ServiciosInterrumpidos }}</p>
        </div>
        <div class="info-grid" v-if="incidente.AlcanceGeografico">
          <div class="info-item">
            <label>Alcance Geográfico:</label>
            <span>{{ incidente.AlcanceGeografico }}</span>
          </div>
        </div>
      </div>

      <!-- Análisis Técnico -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">5. ANÁLISIS TÉCNICO PRELIMINAR</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Tipo de Amenaza:</label>
            <span>{{ incidente.AnciTipoAmenaza || 'Por determinar' }}</span>
          </div>
          <div class="info-item">
            <label>Vector de Ataque:</label>
            <span>{{ incidente.OrigenIncidente }}</span>
          </div>
        </div>
        <div class="campo-texto" v-if="incidente.CausaRaiz">
          <label>Causa Raíz Identificada:</label>
          <p>{{ incidente.CausaRaiz }}</p>
        </div>
      </div>

      <!-- Clasificación Taxonómica -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">6. CLASIFICACIÓN SEGÚN TAXONOMÍA ANCI</h3>
        <div class="taxonomias-list">
          <div v-if="taxonomias.length > 0">
            <div v-for="tax in taxonomias" :key="tax.ID_Incidente" class="taxonomia-item">
              <span class="taxonomia-categoria">{{ tax.CategoriaSeleccionable }}</span>
              <span class="taxonomia-info">{{ tax.InformacionDescriptiva }}</span>
            </div>
          </div>
          <div v-else class="sin-datos">
            Sin taxonomías seleccionadas
          </div>
        </div>
      </div>

      <!-- Acciones de Respuesta -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">7. ACCIONES DE RESPUESTA INMEDIATA</h3>
        <div class="campo-texto">
          <label>Medidas de Contención Aplicadas:</label>
          <p>{{ incidente.AccionesInmediatas || 'No especificadas' }}</p>
        </div>
      </div>

      <!-- Plan de Mejora (si aplica) -->
      <div class="seccion-reporte" v-if="incidente.LeccionesAprendidas || incidente.PlanMejora">
        <h3 class="seccion-titulo">8. LECCIONES APRENDIDAS Y MEJORAS</h3>
        <div class="campo-texto" v-if="incidente.LeccionesAprendidas">
          <label>Lecciones Aprendidas:</label>
          <p>{{ incidente.LeccionesAprendidas }}</p>
        </div>
        <div class="campo-texto" v-if="incidente.PlanMejora">
          <label>Plan de Mejora:</label>
          <p>{{ incidente.PlanMejora }}</p>
        </div>
      </div>

      <!-- Información del Delegado -->
      <div class="seccion-reporte">
        <h3 class="seccion-titulo">9. RESPONSABLE DEL REPORTE</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Delegado de Ciberseguridad:</label>
            <span>{{ empresa.DelegadoCiberseguridadNombre || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <label>Cargo:</label>
            <span>{{ empresa.DelegadoCiberseguridadCargo || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ empresa.DelegadoCiberseguridadEmail || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <label>Teléfono:</label>
            <span>{{ empresa.DelegadoCiberseguridadTelefono || 'No especificado' }}</span>
          </div>
        </div>
      </div>

      <!-- Firma Digital -->
      <div class="seccion-firma">
        <div class="firma-box">
          <p class="firma-texto">Este reporte ha sido generado automáticamente por el sistema de gestión de incidentes.</p>
          <p class="firma-fecha">Fecha de generación: {{ fechaGeneracion }}</p>
          <p class="firma-validacion">ID de validación: {{ generarIdValidacion() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const props = defineProps({
  incidenteId: { type: [String, Number], required: true },
  incidente: { type: Object, default: () => ({}) },
  empresa: { type: Object, default: () => ({}) },
  reporteAnciId: { type: [String, Number], default: null }
})

// Estado
const exportando = ref(null)
const taxonomias = ref([])
const reporteContent = ref(null)

// Computed
const fechaGeneracion = computed(() => {
  return new Date().toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Métodos
function formatearFecha(fecha) {
  if (!fecha) return null
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function generarIdValidacion() {
  const fecha = new Date().getTime()
  const random = Math.random().toString(36).substring(2, 9)
  return `ANCI-${props.incidenteId}-${fecha}-${random}`.toUpperCase()
}

async function cargarTaxonomias() {
  // Validar que el incidenteId existe
  if (!props.incidenteId || props.incidenteId === 'undefined') {
    console.error('Error: incidenteId es undefined o inválido:', props.incidenteId)
    return
  }
  
  try {
    console.log('🔍 Cargando taxonomías para incidente ID:', props.incidenteId)
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/taxonomias`)
    if (response.ok) {
      taxonomias.value = await response.json()
    }
  } catch (error) {
    console.error('Error al cargar taxonomías:', error)
  }
}

async function exportarPDF() {
  exportando.value = 'pdf'
  
  try {
    // Capturar el contenido como imagen
    const canvas = await html2canvas(reporteContent.value, {
      scale: 2,
      backgroundColor: '#ffffff'
    })
    
    // Crear PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    // Agregar primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // Agregar páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // Descargar PDF
    pdf.save(`Reporte_ANCI_${props.incidente.IncidenteID}_${new Date().getTime()}.pdf`)
    
  } catch (error) {
    console.error('Error al generar PDF:', error)
    alert('Error al generar el PDF. Por favor intente nuevamente.')
  } finally {
    exportando.value = null
  }
}

async function exportarWord() {
  exportando.value = 'word'
  
  try {
    // Preparar contenido para Word
    const contenido = reporteContent.value.innerText || reporteContent.value.textContent
    
    // Crear blob con formato RTF básico
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Times New Roman;}}
\\f0\\fs24
${contenido.replace(/\n/g, '\\par ')}
}`
    
    const blob = new Blob([rtfContent], { type: 'application/rtf' })
    const url = URL.createObjectURL(blob)
    
    // Descargar archivo
    const a = document.createElement('a')
    a.href = url
    a.download = `Reporte_ANCI_${props.incidente.IncidenteID}_${new Date().getTime()}.rtf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Error al generar Word:', error)
    alert('Error al generar el documento Word. Por favor intente nuevamente.')
  } finally {
    exportando.value = null
  }
}

async function exportarTexto() {
  exportando.value = 'text'
  
  try {
    // Obtener contenido de texto
    const contenido = reporteContent.value.innerText || reporteContent.value.textContent
    
    // Crear blob de texto
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    
    // Descargar archivo
    const a = document.createElement('a')
    a.href = url
    a.download = `Reporte_ANCI_${props.incidente.IncidenteID}_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Error al generar texto:', error)
    alert('Error al generar el archivo de texto. Por favor intente nuevamente.')
  } finally {
    exportando.value = null
  }
}

// Lifecycle
onMounted(() => {
  cargarTaxonomias()
})
</script>

<style scoped>
.reporte-anci-exportable {
  background-color: #1f2937;
  border-radius: 0.75rem;
  overflow: hidden;
}

.reporte-header {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.header-info p {
  color: #fecaca;
  margin: 0.25rem 0 0 0;
}

.export-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.btn-pdf {
  background-color: #7f1d1d;
}

.btn-pdf:hover:not(:disabled) {
  background-color: #991b1b;
}

.btn-word {
  background-color: #1e40af;
}

.btn-word:hover:not(:disabled) {
  background-color: #1e3a8a;
}

.btn-text {
  background-color: #374151;
}

.btn-text:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-export i {
  font-size: 1.125rem;
}

/* Contenido del Reporte */
.reporte-contenido {
  background-color: white;
  color: #1f2937;
  padding: 2rem;
  min-height: 800px;
}

.seccion-oficial {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.logo-anci {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  background-color: #dc2626;
  color: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.logo-placeholder i {
  font-size: 2rem;
}

.info-oficial h3 {
  color: #111827;
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
}

.info-oficial p {
  color: #6b7280;
  margin: 0.25rem 0;
}

.fecha-generacion {
  font-size: 0.875rem;
  color: #9ca3af;
}

.seccion-reporte {
  margin-bottom: 2.5rem;
}

.seccion-titulo {
  color: #dc2626;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  padding: 0.5rem 0;
}

.info-item.span-2 {
  grid-column: span 2;
}

.info-item label {
  display: block;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.info-item span {
  color: #111827;
}

.texto-destacado {
  font-size: 1.125rem;
  font-weight: 600;
}

.badge-tipo {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: #dbeafe;
  color: #1e40af;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.badge-criticidad {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.criticidad-baja {
  background-color: #d1fae5;
  color: #065f46;
}

.criticidad-media {
  background-color: #fef3c7;
  color: #92400e;
}

.criticidad-alta {
  background-color: #fed7aa;
  color: #9a3412;
}

.criticidad-crítica {
  background-color: #fee2e2;
  color: #991b1b;
}

.campo-texto {
  margin-bottom: 1rem;
}

.campo-texto label {
  display: block;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.campo-texto p {
  color: #111827;
  line-height: 1.6;
  margin: 0;
}

.descripcion-contenido {
  space-y: 1.5rem;
}

.taxonomias-list {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.taxonomia-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.taxonomia-categoria {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.taxonomia-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.sin-datos {
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
}

.seccion-firma {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.firma-box {
  text-align: center;
  background-color: #f9fafb;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px dashed #d1d5db;
}

.firma-texto {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.firma-fecha {
  color: #4b5563;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.firma-validacion {
  color: #9ca3af;
  font-family: monospace;
  font-size: 0.875rem;
}

/* Print styles para mejor exportación */
@media print {
  .reporte-header {
    display: none;
  }
  
  .reporte-contenido {
    padding: 0;
    background: white;
  }
  
  .seccion-reporte {
    page-break-inside: avoid;
  }
}
</style>