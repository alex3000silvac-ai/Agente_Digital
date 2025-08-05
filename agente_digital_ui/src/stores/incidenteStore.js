/**
 * Store Centralizado para Gestión de Incidentes
 * Ley 21663 - Sistema de Cumplimiento Ciberseguridad
 * 
 * Este store maneja todo el estado relacionado con incidentes,
 * proporcionando una fuente única de verdad para la aplicación.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useIncidenteStore = defineStore('incidente', () => {
  // ==================== ESTADO ====================
  
  // Datos del incidente actual
  const incidente = ref({
    // Identificación
    IncidenteID: null,
    EmpresaID: null,
    
    // Datos básicos
    Titulo: '',
    DescripcionInicial: '',
    Criticidad: 'Media',
    EstadoActual: 'Abierto',
    TipoFlujo: 'Informativo',
    
    // Fechas
    FechaCreacion: null,
    FechaActualizacion: null,
    FechaDeteccion: null,
    FechaOcurrencia: null,
    FechaCierre: null,
    
    // Responsables
    CreadoPor: '',
    ResponsableCliente: '',
    
    // Detalles del incidente
    OrigenIncidente: '',
    SistemasAfectados: '',
    AccionesInmediatas: '',
    AlcanceGeografico: '',
    ServiciosInterrumpidos: '',
    
    // ANCI
    AnciImpactoPreliminar: '',
    AnciTipoAmenaza: '',
    ReporteAnciID: null,
    FechaDeclaracionANCI: null,
    
    // Análisis posterior
    CausaRaiz: '',
    LeccionesAprendidas: '',
    PlanMejora: ''
  })
  
  // Evidencias/Archivos adjuntos
  const evidencias = ref([])
  
  // Taxonomías seleccionadas
  const taxonomias = ref([])
  const catalogoTaxonomias = ref([])
  
  // Historial de cambios
  const historial = ref([])
  
  // Estado de la UI
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  
  // Información de la empresa
  const empresa = ref({})
  
  // ==================== GETTERS ====================
  
  // Verifica si es un incidente nuevo o existente
  const esNuevo = computed(() => !incidente.value.IncidenteID)
  
  // Verifica si el incidente está transformado a ANCI
  const esAnci = computed(() => !!incidente.value.ReporteAnciID)
  
  // Calcula el estado de completitud
  const porcentajeCompletado = computed(() => {
    const camposRequeridos = [
      'Titulo', 'DescripcionInicial', 'FechaDeteccion',
      'OrigenIncidente', 'SistemasAfectados', 'AccionesInmediatas'
    ]
    const camposCompletos = camposRequeridos.filter(
      campo => incidente.value[campo] && incidente.value[campo].trim() !== ''
    ).length
    return Math.round((camposCompletos / camposRequeridos.length) * 100)
  })
  
  // Validación básica
  const esValido = computed(() => {
    return incidente.value.Titulo?.trim() && 
           incidente.value.DescripcionInicial?.trim() &&
           incidente.value.FechaDeteccion
  })
  
  // ==================== ACCIONES ====================
  
  /**
   * Carga un incidente existente desde el servidor
   */
  async function cargarIncidente(incidenteId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`http://localhost:5000/api/incidente/${incidenteId}`)
      if (!response.ok) throw new Error('Error al cargar incidente')
      
      const data = await response.json()
      
      // Actualizar estado
      incidente.value = { ...incidente.value, ...data }
      evidencias.value = data.archivos_adjuntos || []
      taxonomias.value = data.Taxonomias || []
      historial.value = data.historial_cambios || []
      
      // Cargar información de la empresa si existe
      if (data.EmpresaID) {
        await cargarEmpresa(data.EmpresaID)
      }
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error cargando incidente:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Carga información de la empresa
   */
  async function cargarEmpresa(empresaId) {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/empresas/${empresaId}`)
      if (!response.ok) throw new Error('Error al cargar empresa')
      
      empresa.value = await response.json()
    } catch (err) {
      console.error('Error cargando empresa:', err)
    }
  }
  
  /**
   * Carga el catálogo de taxonomías disponibles
   */
  async function cargarCatalogoTaxonomias() {
    try {
      const response = await fetch('http://localhost:5000/api/taxonomias')
      if (!response.ok) throw new Error('Error al cargar taxonomías')
      
      catalogoTaxonomias.value = await response.json()
    } catch (err) {
      console.error('Error cargando catálogo de taxonomías:', err)
    }
  }
  
  /**
   * Guarda el incidente (crear o actualizar)
   */
  async function guardarIncidente() {
    saving.value = true
    error.value = null
    
    try {
      const formData = new FormData()
      
      // Agregar campos del incidente
      Object.keys(incidente.value).forEach(key => {
        if (incidente.value[key] !== null && incidente.value[key] !== undefined) {
          // Formatear fechas a ISO si es necesario
          if (key.includes('Fecha') && incidente.value[key]) {
            const fecha = new Date(incidente.value[key])
            formData.append(key, fecha.toISOString())
          } else {
            formData.append(key, incidente.value[key])
          }
        }
      })
      
      // Agregar taxonomías seleccionadas
      formData.append('taxonomias_seleccionadas', JSON.stringify(
        taxonomias.value.map(t => ({
          Id_Taxonomia: t.Id_Taxonomia,
          ObservacionesTecnicas: t.observacionesTecnicas || '',
          ObservacionesImpacto: t.observacionesImpacto || ''
        }))
      ))
      
      // Agregar información de usuario
      const usuario = JSON.parse(localStorage.getItem('user') || '{}')
      formData.append('creado_por', usuario.nombre || 'Sistema')
      formData.append('empresa_id', incidente.value.EmpresaID)
      
      const url = esNuevo.value 
        ? 'http://localhost:5000/api/incidente/'
        : `http://localhost:5000/api/incidente/${incidente.value.IncidenteID}`
      
      const response = await fetch(url, {
        method: esNuevo.value ? 'POST' : 'PUT',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar')
      }
      
      const result = await response.json()
      
      // Si es nuevo, actualizar el ID
      if (esNuevo.value && result.incidente_id) {
        incidente.value.IncidenteID = result.incidente_id
      }
      
      return result
    } catch (err) {
      error.value = err.message
      console.error('Error guardando incidente:', err)
      throw err
    } finally {
      saving.value = false
    }
  }
  
  /**
   * Sube una nueva evidencia
   */
  async function subirEvidencia(archivo, seccion = 'general', comentario = '') {
    const formData = new FormData()
    formData.append('archivos', archivo)
    formData.append('seccion', seccion)
    formData.append('comentario', comentario)
    
    const response = await fetch(`http://localhost:5000/api/incidente/${incidente.value.IncidenteID}/evidencia`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('Error al subir evidencia')
    
    // Recargar evidencias
    await cargarIncidente(incidente.value.IncidenteID)
  }
  
  /**
   * Elimina una evidencia
   */
  async function eliminarEvidencia(evidenciaId) {
    const response = await fetch(
      `http://localhost:5000/api/incidente/${incidente.value.IncidenteID}/evidencia/${evidenciaId}`,
      { method: 'DELETE' }
    )
    
    if (!response.ok) throw new Error('Error al eliminar evidencia')
    
    // Actualizar lista local
    evidencias.value = evidencias.value.filter(e => e.EvidenciaID !== evidenciaId)
  }
  
  /**
   * Actualiza el estado del incidente
   */
  async function actualizarEstado(nuevoEstado) {
    incidente.value.EstadoActual = nuevoEstado
    await guardarIncidente()
  }
  
  /**
   * Transforma el incidente a reporte ANCI
   */
  async function transformarAAnci() {
    const response = await fetch(
      `http://localhost:5000/api/incidente/${incidente.value.IncidenteID}/transformar-anci`,
      { method: 'POST' }
    )
    
    if (!response.ok) throw new Error('Error al transformar a ANCI')
    
    const result = await response.json()
    incidente.value.ReporteAnciID = result.reporte_anci_id
    
    return result
  }
  
  /**
   * Reinicia el store a su estado inicial
   */
  function reset() {
    incidente.value = {
      IncidenteID: null,
      EmpresaID: null,
      Titulo: '',
      DescripcionInicial: '',
      Criticidad: 'Media',
      EstadoActual: 'Abierto',
      TipoFlujo: 'Informativo',
      FechaCreacion: null,
      FechaActualizacion: null,
      FechaDeteccion: null,
      FechaOcurrencia: null,
      FechaCierre: null,
      CreadoPor: '',
      ResponsableCliente: '',
      OrigenIncidente: '',
      SistemasAfectados: '',
      AccionesInmediatas: '',
      AlcanceGeografico: '',
      ServiciosInterrumpidos: '',
      AnciImpactoPreliminar: '',
      AnciTipoAmenaza: '',
      ReporteAnciID: null,
      FechaDeclaracionANCI: null,
      CausaRaiz: '',
      LeccionesAprendidas: '',
      PlanMejora: ''
    }
    evidencias.value = []
    taxonomias.value = []
    historial.value = []
    error.value = null
    loading.value = false
    saving.value = false
  }
  
  return {
    // Estado
    incidente,
    evidencias,
    taxonomias,
    catalogoTaxonomias,
    historial,
    empresa,
    loading,
    saving,
    error,
    
    // Getters
    esNuevo,
    esAnci,
    porcentajeCompletado,
    esValido,
    
    // Acciones
    cargarIncidente,
    cargarEmpresa,
    cargarCatalogoTaxonomias,
    guardarIncidente,
    subirEvidencia,
    eliminarEvidencia,
    actualizarEstado,
    transformarAAnci,
    reset
  }
})