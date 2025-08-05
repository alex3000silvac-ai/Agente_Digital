<template>
  <div class="formulario-incidente-v2">
    <!-- ENCABEZADO CON INFORMACIÓN DEL INCIDENTE -->
    <header class="formulario-header">
      <div class="header-content">
        <h1 class="titulo-principal">Registro de Incidente de Ciberseguridad</h1>
        <div class="info-incidente">
          <span v-if="datosIncidente.idVisible" class="id-incidente">
            ID del Incidente: {{ datosIncidente.idVisible }}
          </span>
          <span v-else class="id-incidente">
            Nuevo Incidente
          </span>
          <span class="estado-badge" :class="estadoClass">
            {{ datosIncidente.estadoActual || 'Borrador' }}
          </span>
        </div>
      </div>
    </header>

    <!-- NAVEGACIÓN POR SECCIONES -->
    <nav class="navegacion-secciones">
      <div v-for="(seccion, index) in secciones" 
           :key="index"
           :class="['seccion-tab', { 
             activa: seccionActual === index,
             completada: seccionCompletada(index),
             con_errores: seccionConErrores(index)
           }]"
           @click="irASeccion(index)">
        
        <div class="tab-numero">{{ index + 1 }}</div>
        <div class="tab-texto">{{ seccion.titulo }}</div>
        
        <!-- Indicadores de estado -->
        <div class="tab-indicadores">
          <i v-if="seccionCompletada(index)" class="fa-solid fa-check indicador-ok"></i>
          <i v-else-if="seccionConErrores(index)" class="fa-solid fa-exclamation-triangle indicador-error"></i>
          <i v-else-if="seccionActual === index" class="fa-solid fa-edit indicador-activo"></i>
        </div>
      </div>
    </nav>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="contenido-formulario">
      <div class="contenido-wrapper">
        <!-- SECCIÓN 1: IDENTIFICACIÓN GENERAL -->
        <div v-if="seccionActual === 0" class="seccion" data-seccion="identificacion">
          <h2 class="seccion-titulo">1. Identificación General</h2>
          
          <div class="campos-grid">
            <!-- Tipo de Registro -->
            <div class="campo-grupo">
              <label class="campo-label">Tipo de Registro del Incidente</label>
              <select v-model="datosIncidente.tipoRegistro" 
                      class="campo-input"
                      @change="marcarCambio('tipoRegistro')">
                <option v-for="opcion in opciones.tipoRegistro" 
                        :key="opcion.valor" 
                        :value="opcion.valor">
                  {{ opcion.texto }}
                </option>
              </select>
            </div>

            <!-- Título -->
            <div class="campo-grupo col-span-2">
              <label class="campo-label campo-requerido">Título del Incidente</label>
              <input type="text" 
                     v-model="datosIncidente.titulo"
                     class="campo-input"
                     :class="{ error: errores.titulo }"
                     maxlength="255"
                     placeholder="Descripción breve del incidente..."
                     @input="marcarCambio('titulo')">
              <div v-if="errores.titulo" class="campo-error">{{ errores.titulo }}</div>
            </div>

            <!-- Fecha y Hora de Detección -->
            <div class="campo-grupo">
              <label class="campo-label campo-requerido">Fecha y Hora de Detección</label>
              <input type="datetime-local" 
                     v-model="datosIncidente.fechaDeteccion"
                     class="campo-input"
                     :class="{ error: errores.fechaDeteccion }"
                     @change="marcarCambio('fechaDeteccion')">
              <div v-if="errores.fechaDeteccion" class="campo-error">{{ errores.fechaDeteccion }}</div>
            </div>

            <!-- Fecha y Hora de Ocurrencia -->
            <div class="campo-grupo">
              <label class="campo-label">Fecha y Hora de Ocurrencia</label>
              <input type="datetime-local" 
                     v-model="datosIncidente.fechaOcurrencia"
                     class="campo-input"
                     @change="marcarCambio('fechaOcurrencia')">
              <small class="campo-ayuda">Solo si difiere de la fecha de detección</small>
            </div>

            <!-- Criticidad -->
            <div class="campo-grupo">
              <label class="campo-label campo-requerido">Criticidad</label>
              <select v-model="datosIncidente.criticidad" 
                      class="campo-input"
                      :class="{ error: errores.criticidad }"
                      @change="marcarCambio('criticidad')">
                <option v-for="opcion in opciones.criticidad" 
                        :key="opcion.valor" 
                        :value="opcion.valor">
                  {{ opcion.texto }}
                </option>
              </select>
              <div v-if="errores.criticidad" class="campo-error">{{ errores.criticidad }}</div>
            </div>

            <!-- Alcance Geográfico -->
            <div class="campo-grupo">
              <label class="campo-label">Alcance Geográfico</label>
              <select v-model="datosIncidente.alcanceGeografico" 
                      class="campo-input"
                      @change="marcarCambio('alcanceGeografico')">
                <option value="">Seleccionar...</option>
                <option v-for="opcion in opciones.alcanceGeografico" 
                        :key="opcion.valor" 
                        :value="opcion.valor">
                  {{ opcion.texto }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: DESCRIPCIÓN Y ALCANCE -->
        <div v-if="seccionActual === 1" class="seccion" data-seccion="descripcion">
          <h2 class="seccion-titulo">2. Descripción y Alcance</h2>
          
          <div class="campos-grid">
            <!-- Descripción Inicial -->
            <div class="campo-grupo col-span-2">
              <label class="campo-label campo-requerido">Descripción Inicial Detallada</label>
              <textarea v-model="datosIncidente.descripcionInicial"
                        class="campo-textarea"
                        :class="{ error: errores.descripcionInicial }"
                        rows="4"
                        maxlength="4000"
                        placeholder="Describa detalladamente el incidente..."
                        @input="marcarCambio('descripcionInicial')"></textarea>
              <div class="campo-contador">{{ (datosIncidente.descripcionInicial || '').length }}/4000</div>
              <div v-if="errores.descripcionInicial" class="campo-error">{{ errores.descripcionInicial }}</div>
            </div>

            <!-- Impacto Preliminar -->
            <div class="campo-grupo">
              <label class="campo-label">Impacto Preliminar Observado</label>
              <input type="text" 
                     v-model="datosIncidente.impactoPreliminar"
                     class="campo-input"
                     maxlength="2000"
                     placeholder="Describa el impacto observado..."
                     @input="marcarCambio('impactoPreliminar')">
            </div>

            <!-- Sistemas Afectados -->
            <div class="campo-grupo">
              <label class="campo-label campo-requerido">Sistemas, Activos o Personal Afectado</label>
              <input type="text" 
                     v-model="datosIncidente.sistemasAfectados"
                     class="campo-input"
                     :class="{ error: errores.sistemasAfectados }"
                     maxlength="4000"
                     placeholder="Especifique sistemas, activos o personal..."
                     @input="marcarCambio('sistemasAfectados')">
              <div v-if="errores.sistemasAfectados" class="campo-error">{{ errores.sistemasAfectados }}</div>
            </div>

            <!-- Servicios Interrumpidos -->
            <div class="campo-grupo col-span-2">
              <label class="campo-label">Servicios Interrumpidos y Duración</label>
              <textarea v-model="datosIncidente.serviciosInterrumpidos"
                        class="campo-textarea"
                        rows="3"
                        maxlength="2000"
                        placeholder="Describa servicios interrumpidos y tiempo estimado..."
                        @input="marcarCambio('serviciosInterrumpidos')"></textarea>
            </div>
          </div>

          <!-- Evidencias de Descripción y Alcance -->
          <div class="evidencias-seccion">
            <h3 class="evidencias-titulo">Evidencia de Alcance</h3>
            <EvidenciaUploader 
              :archivos="archivosPorSeccion.descripcion_alcance"
              seccion="descripcion_alcance"
              @archivos-cambiados="actualizarArchivosSeccion" />
          </div>
        </div>

        <!-- SECCIÓN 3: ANÁLISIS PRELIMINAR -->
        <div v-if="seccionActual === 2" class="seccion" data-seccion="analisis">
          <h2 class="seccion-titulo">3. Análisis Preliminar</h2>
          
          <div class="campos-grid">
            <!-- Tipo de Amenaza -->
            <div class="campo-grupo">
              <label class="campo-label">Tipo de Amenaza Probable</label>
              <input type="text" 
                     v-model="datosIncidente.tipoAmenaza"
                     class="campo-input"
                     maxlength="500"
                     placeholder="Identifique el tipo de amenaza..."
                     @input="marcarCambio('tipoAmenaza')">
            </div>

            <!-- Origen/Vector de Ataque -->
            <div class="campo-grupo">
              <label class="campo-label campo-requerido">Origen / Vector de Ataque Probable</label>
              <input type="text" 
                     v-model="datosIncidente.origenAtaque"
                     class="campo-input"
                     :class="{ error: errores.origenAtaque }"
                     maxlength="255"
                     placeholder="Especifique el origen del ataque..."
                     @input="marcarCambio('origenAtaque')">
              <div v-if="errores.origenAtaque" class="campo-error">{{ errores.origenAtaque }}</div>
            </div>

            <!-- Responsable del Cliente -->
            <div class="campo-grupo col-span-2">
              <label class="campo-label">Responsable del Cliente</label>
              <input type="text" 
                     v-model="datosIncidente.responsableCliente"
                     class="campo-input"
                     maxlength="255"
                     placeholder="Nombre y contacto del responsable..."
                     @input="marcarCambio('responsableCliente')">
            </div>
          </div>

          <!-- Evidencias de Análisis -->
          <div class="evidencias-seccion">
            <h3 class="evidencias-titulo">Evidencia de Análisis</h3>
            <EvidenciaUploader 
              :archivos="archivosPorSeccion.analisis_preliminar"
              seccion="analisis_preliminar"
              @archivos-cambiados="actualizarArchivosSeccion" />
          </div>
        </div>

        <!-- SECCIÓN 4: TAXONOMÍAS -->
        <div v-if="seccionActual === 3" class="seccion" data-seccion="taxonomias">
          <h2 class="seccion-titulo">4. Clasificación de Taxonomía</h2>
          <p class="seccion-descripcion">
            Seleccione las taxonomías aplicables según el catálogo de incidentes de ciberseguridad. 
            Cada taxonomía puede incluir evidencias y comentarios con control de versiones.
          </p>

          <SeccionTaxonomias 
            v-model="datosIncidente.taxonomiasSeleccionadas"
            @cambio="marcarCambio('taxonomias')" />
        </div>

        <!-- SECCIÓN 5: ACCIONES INMEDIATAS -->
        <div v-if="seccionActual === 4" class="seccion" data-seccion="acciones">
          <h2 class="seccion-titulo">5. Acciones Inmediatas</h2>
          
          <div class="campos-grid">
            <!-- Medidas de Contención -->
            <div class="campo-grupo col-span-2">
              <label class="campo-label campo-requerido">Medidas de Contención Iniciales</label>
              <textarea v-model="datosIncidente.medidasContencion"
                        class="campo-textarea"
                        :class="{ error: errores.medidasContencion }"
                        rows="4"
                        maxlength="4000"
                        placeholder="Describa las medidas tomadas para contener el incidente..."
                        @input="marcarCambio('medidasContencion')"></textarea>
              <div v-if="errores.medidasContencion" class="campo-error">{{ errores.medidasContencion }}</div>
            </div>
          </div>

          <!-- Evidencias de Acciones -->
          <div class="evidencias-seccion">
            <h3 class="evidencias-titulo">Evidencia de Acciones</h3>
            <EvidenciaUploader 
              :archivos="archivosPorSeccion.acciones_inmediatas"
              seccion="acciones_inmediatas"
              @archivos-cambiados="actualizarArchivosSeccion" />
          </div>
        </div>

        <!-- SECCIÓN 6: ANÁLISIS FINAL -->
        <div v-if="seccionActual === 5" class="seccion" data-seccion="final">
          <h2 class="seccion-titulo">6. Análisis Final y Mejoras</h2>
          <p class="seccion-descripcion">
            Estos campos se completan durante la investigación y son requeridos para el reporte final a ANCI.
          </p>
          
          <div class="campos-grid">
            <!-- Causa Raíz -->
            <div class="campo-grupo">
              <label class="campo-label">Causa Raíz Identificada</label>
              <textarea v-model="datosIncidente.causaRaiz"
                        class="campo-textarea"
                        rows="3"
                        maxlength="2000"
                        placeholder="Identifique la causa raíz del incidente..."
                        @input="marcarCambio('causaRaiz')"></textarea>
            </div>

            <!-- Lecciones Aprendidas -->
            <div class="campo-grupo">
              <label class="campo-label">Lecciones Aprendidas</label>
              <textarea v-model="datosIncidente.leccionesAprendidas"
                        class="campo-textarea"
                        rows="3"
                        maxlength="2000"
                        placeholder="Documenta las lecciones aprendidas..."
                        @input="marcarCambio('leccionesAprendidas')"></textarea>
            </div>

            <!-- Plan de Mejora -->
            <div class="campo-grupo col-span-2">
              <label class="campo-label">Plan de Mejora</label>
              <textarea v-model="datosIncidente.planMejora"
                        class="campo-textarea"
                        rows="4"
                        maxlength="2000"
                        placeholder="Defina el plan de mejora a implementar..."
                        @input="marcarCambio('planMejora')"></textarea>
            </div>
          </div>

          <!-- Documentación Técnica -->
          <div class="evidencias-seccion">
            <h3 class="evidencias-titulo">Documentación Técnica</h3>
            <p class="evidencias-descripcion">Logs, capturas, trazas de red, hash de archivos maliciosos</p>
            <EvidenciaUploader 
              :archivos="archivosPorSeccion.documentacion_tecnica"
              seccion="documentacion_tecnica"
              @archivos-cambiados="actualizarArchivosSeccion" />
          </div>
        </div>

        <!-- SECCIÓN 7: RESUMEN DE ARCHIVOS -->
        <div v-if="seccionActual === 6" class="seccion" data-seccion="resumen">
          <h2 class="seccion-titulo">7. Archivos del Incidente</h2>
          <p class="seccion-descripcion">
            Listado completo de todos los archivos asociados al incidente, organizados por sección. 
            Este es un resumen de solo lectura con referencias a cada archivo.
          </p>

          <ResumenArchivos :archivos-por-seccion="archivosPorSeccion" />
        </div>
      </div>
    </main>

    <!-- BARRA DE PROGRESO -->
    <div class="barra-progreso">
      <div class="progreso-fill" :style="{ width: progresoPorcentaje + '%' }"></div>
      <span class="progreso-texto">{{ progresoPorcentaje }}% completado</span>
    </div>

    <!-- CONTROLES DE NAVEGACIÓN Y GUARDADO -->
    <footer class="controles-formulario">
      <div class="controles-navegacion">
        <button @click="anteriorSeccion" 
                :disabled="seccionActual === 0"
                class="btn btn-secundario">
          <i class="fa-solid fa-chevron-left"></i>
          Anterior
        </button>
        
        <button @click="siguienteSeccion" 
                :disabled="seccionActual === 6"
                class="btn btn-secundario">
          Siguiente
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div class="controles-accion">
        <button @click="cancelar" class="btn btn-cancelar">
          Cancelar
        </button>
        
        <button @click="guardarIncidente" 
                :disabled="!formularioValido || guardando"
                class="btn btn-primario">
          <i v-if="guardando" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-save"></i>
          {{ modoEdicion ? 'Actualizar' : 'Guardar' }} Incidente
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useIncidenteV2Store } from '@/stores/incidenteV2Store'
import { OPCIONES_FORMULARIO } from '@/utils/mapeo-campos-v2'
import EvidenciaUploader from '@/components/EvidenciaUploader.vue'
import SeccionTaxonomias from '@/components/SeccionTaxonomias.vue'
import ResumenArchivos from '@/components/ResumenArchivos.vue'

// Props
const props = defineProps({
  incidenteId: {
    type: [Number, String],
    default: null
  },
  modo: {
    type: String,
    default: 'creacion', // 'creacion' | 'edicion'
    validator: valor => ['creacion', 'edicion'].includes(valor)
  }
})

// Composables
const router = useRouter()
const route = useRoute()
const store = useIncidenteV2Store()

// Estado local
const guardando = ref(false)
const errores = ref({})

// Computed
const datosIncidente = computed(() => store.datosIncidente)
const archivosPorSeccion = computed(() => store.archivosPorSeccion)
const seccionActual = computed(() => store.seccionActual)
const modoEdicion = computed(() => store.modoEdicion)
const formularioValido = computed(() => store.formularioValido)

const opciones = OPCIONES_FORMULARIO

const secciones = [
  { titulo: 'Identificación', clave: 'identificacion' },
  { titulo: 'Descripción', clave: 'descripcion' },
  { titulo: 'Análisis', clave: 'analisis' },
  { titulo: 'Taxonomías', clave: 'taxonomias' },
  { titulo: 'Acciones', clave: 'acciones' },
  { titulo: 'Análisis Final', clave: 'final' },
  { titulo: 'Resumen', clave: 'resumen' }
]

const estadoClass = computed(() => {
  const estado = datosIncidente.value.estadoActual?.toLowerCase()
  return {
    'estado-abierto': estado === 'abierto',
    'estado-proceso': estado === 'en proceso',
    'estado-investigacion': estado === 'en investigación',
    'estado-cerrado': estado === 'cerrado'
  }
})

const progresoPorcentaje = computed(() => {
  const totalSecciones = secciones.length
  const seccionesCompletadas = secciones.filter((_, index) => seccionCompletada(index)).length
  return Math.round((seccionesCompletadas / totalSecciones) * 100)
})

// Métodos
function seccionCompletada(index) {
  // Lógica para determinar si una sección está completada
  switch (index) {
    case 0: // Identificación
      return !!(datosIncidente.value.titulo && 
                datosIncidente.value.fechaDeteccion && 
                datosIncidente.value.criticidad)
    case 1: // Descripción
      return !!(datosIncidente.value.descripcionInicial && 
                datosIncidente.value.sistemasAfectados)
    case 2: // Análisis
      return !!datosIncidente.value.origenAtaque
    case 3: // Taxonomías
      return datosIncidente.value.taxonomiasSeleccionadas.length > 0
    case 4: // Acciones
      return !!datosIncidente.value.medidasContencion
    case 5: // Análisis Final
      return true // Opcional
    case 6: // Resumen
      return true // Solo lectura
    default:
      return false
  }
}

function seccionConErrores(index) {
  // Verificar si hay errores en los campos de esta sección
  const camposPorSeccion = {
    0: ['titulo', 'fechaDeteccion', 'criticidad'],
    1: ['descripcionInicial', 'sistemasAfectados'],
    2: ['origenAtaque'],
    3: [],
    4: ['medidasContencion'],
    5: [],
    6: []
  }
  
  return camposPorSeccion[index]?.some(campo => errores.value[campo])
}

function irASeccion(index) {
  store.irASeccion(index)
}

function siguienteSeccion() {
  store.siguienteSeccion()
}

function anteriorSeccion() {
  store.anteriorSeccion()
}

function marcarCambio(campo) {
  store.marcarCambio(campo)
  // Limpiar error del campo si se corrige
  if (errores.value[campo]) {
    delete errores.value[campo]
  }
}

function actualizarArchivosSeccion(payload) {
  const { seccion, archivos } = payload
  store.archivosPorSeccion[seccion] = archivos
  store.marcarCambio('archivos')
}

async function guardarIncidente() {
  try {
    guardando.value = true
    errores.value = {}

    // Validar formulario
    const erroresValidacion = validarFormulario()
    if (Object.keys(erroresValidacion).length > 0) {
      errores.value = erroresValidacion
      return
    }

    // Obtener datos preparados para BD
    const datosParaEnviar = await store.guardarIncidente()
    
    // Preparar FormData para enviar archivos y datos
    const formData = new FormData()
    
    // Agregar campos de datos al FormData
    Object.keys(datosParaEnviar).forEach(key => {
      if (key === 'CategoriasSeleccionadas' || key === 'taxonomias_seleccionadas') {
        // Serializar arrays/objetos como JSON
        formData.append(key, JSON.stringify(datosParaEnviar[key]))
      } else if (datosParaEnviar[key] !== null && datosParaEnviar[key] !== undefined) {
        formData.append(key, datosParaEnviar[key])
      }
    })
    
    // Agregar empresa_id si no está en edición
    if (!modoEdicion.value) {
      formData.append('empresa_id', datosIncidente.value.empresaId || '2')
    }
    
    // Agregar archivos de cada sección
    Object.entries(archivosPorSeccion.value).forEach(([seccion, archivos]) => {
      archivos.forEach(archivo => {
        if (archivo.file && !archivo.id) {
          // Solo archivos nuevos (no tienen ID)
          formData.append('archivos', archivo.file)
          formData.append(`descripcion_archivo_${archivo.file.name}`, archivo.comentarios || '')
          formData.append(`version_archivo_${archivo.file.name}`, '1')
          formData.append(`seccion_archivo_${archivo.file.name}`, seccion)
        }
      })
    })
    
    // Agregar comentarios adicionales como JSON
    const comentariosAdicionales = []
    Object.values(archivosPorSeccion.value).forEach(archivos => {
      archivos.forEach(archivo => {
        if (archivo.comentarios) {
          comentariosAdicionales.push({
            texto: archivo.comentarios,
            fecha: new Date().toISOString()
          })
        }
      })
    })
    
    if (comentariosAdicionales.length > 0) {
      formData.append('comentarios_adicionales_json', JSON.stringify(comentariosAdicionales))
    }
    
    // Enviar al backend
    const url = modoEdicion.value 
      ? `/api/incidente/${datosIncidente.value.incidenteId}`
      : `/api/incidente/`
    
    const metodo = modoEdicion.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method: metodo,
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const resultado = await response.json()
    
    // Actualizar store con resultado
    if (resultado.IncidenteID || resultado.incidenteId) {
      store.datosIncidente.incidenteId = resultado.IncidenteID || resultado.incidenteId
      store.modoEdicion = true
    }

    // Mensaje de éxito
    console.log('✅ Incidente guardado exitosamente:', resultado)
    
    // NO navegar automáticamente - mantener formulario
    store.cambiosPendientes = false
    
  } catch (error) {
    console.error('❌ Error guardando incidente:', error)
    errores.value.general = error.message
  } finally {
    guardando.value = false
  }
}

function validarFormulario() {
  const errores = {}
  
  // Campos requeridos por sección
  if (!datosIncidente.value.titulo?.trim()) {
    errores.titulo = 'El título es requerido'
  }
  
  if (!datosIncidente.value.fechaDeteccion) {
    errores.fechaDeteccion = 'La fecha de detección es requerida'
  }
  
  if (!datosIncidente.value.criticidad) {
    errores.criticidad = 'La criticidad es requerida'
  }
  
  if (!datosIncidente.value.descripcionInicial?.trim()) {
    errores.descripcionInicial = 'La descripción inicial es requerida'
  }
  
  if (!datosIncidente.value.sistemasAfectados?.trim()) {
    errores.sistemasAfectados = 'Los sistemas afectados son requeridos'
  }
  
  if (!datosIncidente.value.origenAtaque?.trim()) {
    errores.origenAtaque = 'El origen del ataque es requerido'
  }
  
  if (!datosIncidente.value.medidasContencion?.trim()) {
    errores.medidasContencion = 'Las medidas de contención son requeridas'
  }
  
  return errores
}

function cancelar() {
  if (store.cambiosPendientes) {
    if (confirm('¿Está seguro que desea cancelar? Se perderán los cambios no guardados.')) {
      router.go(-1)
    }
  } else {
    router.go(-1)
  }
}

// Lifecycle
onMounted(async () => {
  // Si hay incidenteId, cargar datos para edición
  if (props.incidenteId || route.params.incidenteId) {
    const id = props.incidenteId || route.params.incidenteId
    await cargarIncidenteParaEdicion(id)
  } else {
    // Inicializar con valores por defecto
    store.resetearFormulario()
  }
})

async function cargarIncidenteParaEdicion(incidenteId) {
  try {
    const response = await fetch(`/api/admin/incidentes/${incidenteId}`)
    if (!response.ok) {
      throw new Error(`Error cargando incidente: ${response.statusText}`)
    }
    
    const datosBD = await response.json()
    store.cargarDatosDesdeBD(datosBD)
    
    console.log('✅ Incidente cargado para edición:', incidenteId)
  } catch (error) {
    console.error('❌ Error cargando incidente:', error)
    errores.value.general = 'Error cargando el incidente'
  }
}

// Watchers
watch(() => route.params.incidenteId, (nuevoId) => {
  if (nuevoId) {
    cargarIncidenteParaEdicion(nuevoId)
  }
})
</script>

<style scoped>
/* Estilos específicos del componente FormularioIncidenteV2 */
.formulario-incidente-v2 {
  @apply min-h-screen bg-gray-900 text-gray-100;
  font-family: 'Inter', sans-serif;
}

.formulario-header {
  @apply bg-gray-800 border-b border-gray-700 px-6 py-4;
}

.header-content {
  @apply max-w-7xl mx-auto flex justify-between items-center;
}

.titulo-principal {
  @apply text-2xl font-bold text-white;
}

.info-incidente {
  @apply flex items-center space-x-4;
}

.id-incidente {
  @apply text-gray-400 font-mono;
}

.estado-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.estado-abierto { @apply bg-blue-600 text-white; }
.estado-proceso { @apply bg-yellow-600 text-white; }
.estado-investigacion { @apply bg-orange-600 text-white; }
.estado-cerrado { @apply bg-green-600 text-white; }

.navegacion-secciones {
  @apply bg-gray-800 border-b border-gray-700 px-6 flex overflow-x-auto;
}

.seccion-tab {
  @apply flex items-center space-x-2 px-4 py-3 cursor-pointer border-b-2 border-transparent 
         hover:bg-gray-700 transition-colors whitespace-nowrap;
}

.seccion-tab.activa {
  @apply border-indigo-500 bg-gray-700 text-white;
}

.seccion-tab.completada:not(.activa) {
  @apply border-green-500 text-green-400;
}

.seccion-tab.con_errores:not(.activa) {
  @apply border-red-500 text-red-400;
}

.tab-numero {
  @apply w-6 h-6 bg-gray-600 text-white text-sm rounded-full flex items-center justify-center font-bold;
}

.seccion-tab.activa .tab-numero {
  @apply bg-indigo-600;
}

.seccion-tab.completada .tab-numero {
  @apply bg-green-600;
}

.seccion-tab.con_errores .tab-numero {
  @apply bg-red-600;
}

.tab-texto {
  @apply font-medium;
}

.tab-indicadores {
  @apply ml-2;
}

.indicador-ok { @apply text-green-400; }
.indicador-error { @apply text-red-400; }
.indicador-activo { @apply text-indigo-400; }

.contenido-formulario {
  @apply flex-1 p-6;
}

.contenido-wrapper {
  @apply max-w-7xl mx-auto;
}

.seccion {
  @apply bg-gray-800 rounded-lg p-6 shadow-lg;
}

.seccion-titulo {
  @apply text-xl font-bold text-white mb-2;
}

.seccion-descripcion {
  @apply text-gray-400 mb-6;
}

.campos-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6 mb-6;
}

.campo-grupo {
  @apply space-y-2;
}

.campo-grupo.col-span-2 {
  grid-column: span 1;
}

@media (min-width: 768px) {
  .campo-grupo.col-span-2 {
    grid-column: span 2;
  }
}

.campo-label {
  @apply block text-sm font-medium text-gray-300;
}

.campo-label.campo-requerido::after {
  content: ' *';
  @apply text-red-400;
}

.campo-input, .campo-textarea {
  @apply w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white
         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors;
}

.campo-input.error, .campo-textarea.error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}

.campo-textarea {
  resize: vertical;
}

.campo-ayuda {
  @apply text-xs text-gray-500;
}

.campo-error {
  @apply text-red-400 text-sm;
}

.campo-contador {
  @apply text-xs text-gray-500 text-right;
}

.evidencias-seccion {
  @apply mt-8 p-4 bg-gray-700 rounded-lg;
}

.evidencias-titulo {
  @apply text-lg font-semibold text-white mb-2;
}

.evidencias-descripcion {
  @apply text-gray-400 text-sm mb-4;
}

.barra-progreso {
  @apply relative bg-gray-700 h-2 mx-6 rounded-full overflow-hidden;
}

.progreso-fill {
  @apply h-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-500;
}

.progreso-texto {
  @apply absolute inset-0 flex items-center justify-center text-xs font-medium text-white;
}

.controles-formulario {
  @apply bg-gray-800 border-t border-gray-700 px-6 py-4 flex justify-between items-center;
}

.controles-navegacion, .controles-accion {
  @apply flex space-x-3;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2;
}

.btn-primario {
  @apply bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secundario {
  @apply bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-cancelar {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}
</style>