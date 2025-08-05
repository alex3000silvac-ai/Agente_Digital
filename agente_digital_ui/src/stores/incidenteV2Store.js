// stores/incidenteV2Store.js
import { defineStore } from 'pinia'
import { MAPEO_BD_FORMULARIO, MAPEO_FORMULARIO_BD } from '@/utils/mapeo-campos-v2'

export const useIncidenteV2Store = defineStore('incidenteV2', {
  state: () => ({
    // DATOS EXACTOS DE BD - Sin transformaciones complejas
    datosIncidente: {
      // === SECCIÓN 1: IDENTIFICACIÓN GENERAL ===
      incidenteId: null,
      tipoRegistro: 'Informativo',     // TipoFlujo en BD
      titulo: '',                      // Titulo en BD  
      fechaDeteccion: '',             // FechaDeteccion en BD
      fechaOcurrencia: '',            // FechaOcurrencia en BD
      criticidad: 'Media',            // Criticidad en BD
      alcanceGeografico: '',          // AlcanceGeografico en BD
      
      // === SECCIÓN 2: DESCRIPCIÓN Y ALCANCE ===
      descripcionInicial: '',         // DescripcionInicial en BD
      impactoPreliminar: '',          // AnciImpactoPreliminar en BD
      sistemasAfectados: '',          // SistemasAfectados en BD
      serviciosInterrumpidos: '',     // ServiciosInterrumpidos en BD
      
      // === SECCIÓN 3: ANÁLISIS PRELIMINAR ===
      tipoAmenaza: '',                // AnciTipoAmenaza en BD
      origenAtaque: '',               // OrigenIncidente en BD
      responsableCliente: '',         // ResponsableCliente en BD
      
      // === SECCIÓN 4: TAXONOMÍAS ===
      taxonomiasSeleccionadas: [],    // Array de objetos {Id_Taxonomia, Comentarios}
      
      // === SECCIÓN 5: ACCIONES INMEDIATAS ===
      medidasContencion: '',          // AccionesInmediatas en BD
      
      // === SECCIÓN 6: ANÁLISIS FINAL ===
      causaRaiz: '',                  // CausaRaiz en BD
      leccionesAprendidas: '',        // LeccionesAprendidas en BD
      planMejora: '',                 // PlanMejora en BD
      
      // === CAMPOS DE CONTROL (No editables) ===
      empresaId: null,                // EmpresaID en BD
      estadoActual: 'Abierto',        // EstadoActual en BD
      creadoPor: '',                  // CreadoPor en BD
      fechaCreacion: null,            // FechaCreacion en BD
      fechaActualizacion: null,       // FechaActualizacion en BD
      idVisible: '',                  // IDVisible en BD
    },
    
    // ARCHIVOS POR SECCIÓN - Estructura separada
    archivosPorSeccion: {
      descripcion_alcance: [],
      analisis_preliminar: [],
      acciones_inmediatas: [],
      documentacion_tecnica: []
    },
    
    // ESTADO DE LA APLICACIÓN
    seccionActual: 0,
    modoEdicion: false,
    cambiosPendientes: false,
    validacionesActivas: false
  }),

  getters: {
    // Convierte datos del store al formato esperado por la BD
    datosParaBD: (state) => {
      const datos = {}
      
      // Mapear cada campo del formulario a su nombre en BD
      Object.entries(state.datosIncidente).forEach(([campoForm, valor]) => {
        const campoBD = MAPEO_FORMULARIO_BD[campoForm]
        if (campoBD) {
          datos[campoBD] = valor
        }
      })
      
      // Asegurar que las taxonomías tienen el formato correcto
      datos.CategoriasSeleccionadas = state.datosIncidente.taxonomiasSeleccionadas
      
      return datos
    },
    
    
    formularioValido: (state) => {
      const camposTexto = ['titulo', 'descripcionInicial', 'criticidad', 'sistemasAfectados', 'origenAtaque', 'medidasContencion']
      const camposFecha = ['fechaDeteccion']
      
      const textosValidos = camposTexto.every(
        campo => state.datosIncidente[campo] && state.datosIncidente[campo].trim() !== ''
      )
      
      const fechasValidas = camposFecha.every(
        campo => state.datosIncidente[campo] && state.datosIncidente[campo] !== ''
      )
      
      return textosValidos && fechasValidas
    },
    
    // Total de archivos
    totalArchivos: (state) => {
      return Object.values(state.archivosPorSeccion)
        .reduce((total, archivos) => total + archivos.length, 0)
    }
  },

  actions: {
    // CARGAR DATOS DESDE BD (Para edición)
    cargarDatosDesdeBD(datosBD) {
      console.log('🔄 Cargando datos desde BD:', datosBD)
      
      // Resetear estado
      this.$reset()
      
      // Mapear cada campo de BD al formulario
      Object.entries(MAPEO_BD_FORMULARIO).forEach(([campoBD, campoForm]) => {
        if (datosBD[campoBD] !== undefined) {
          this.datosIncidente[campoForm] = datosBD[campoBD]
          
          // Formatear fechas si vienen de BD
          if (campoForm.includes('fecha') && datosBD[campoBD]) {
            this.datosIncidente[campoForm] = this.formatearFechaParaInput(datosBD[campoBD])
          }
        }
      })
      
      // Cargar taxonomías
      if (datosBD.Taxonomias && Array.isArray(datosBD.Taxonomias)) {
        this.datosIncidente.taxonomiasSeleccionadas = datosBD.Taxonomias.map(tax => ({
          Id_Taxonomia: tax.Id_Taxonomia,
          Comentarios: tax.Comentarios || ''
        }))
      }
      
      // Cargar archivos por sección
      if (datosBD.ArchivosPorSeccion) {
        this.archivosPorSeccion = datosBD.ArchivosPorSeccion
      }
      
      this.modoEdicion = true
      this.cambiosPendientes = false
      
      console.log('✅ Datos cargados en formulario:', this.datosIncidente)
    },
    
    // GUARDAR CAMBIOS
    async guardarIncidente() {
      const camposTexto = ['titulo', 'descripcionInicial', 'criticidad', 'sistemasAfectados', 'origenAtaque', 'medidasContencion']
      const camposFecha = ['fechaDeteccion']
      
      const textosValidos = camposTexto.every(
        campo => this.datosIncidente[campo] && this.datosIncidente[campo].trim() !== ''
      )
      
      const fechasValidas = camposFecha.every(
        campo => this.datosIncidente[campo] && this.datosIncidente[campo] !== ''
      )
      
      if (!textosValidos || !fechasValidas) {
        throw new Error('Formulario incompleto. Revise los campos requeridos.')
      }
      
      const datosParaEnviar = this.datosParaBD
      
      // Formatear fechas para BD
      if (datosParaEnviar.FechaDeteccion) {
        datosParaEnviar.FechaDeteccion = this.formatearFechaParaBD(datosParaEnviar.FechaDeteccion)
      }
      if (datosParaEnviar.FechaOcurrencia) {
        datosParaEnviar.FechaOcurrencia = this.formatearFechaParaBD(datosParaEnviar.FechaOcurrencia)
      }
      
      console.log('💾 Datos a enviar a BD:', datosParaEnviar)
      
      return datosParaEnviar
    },
    
    // UTILIDADES
    formatearFechaParaInput(fechaBD) {
      // Convierte fecha de BD a formato datetime-local
      if (!fechaBD) return ''
      
      // Si viene en formato ISO o con GMT
      const fecha = new Date(fechaBD)
      if (isNaN(fecha.getTime())) return fechaBD
      
      // Formato YYYY-MM-DDTHH:mm
      const year = fecha.getFullYear()
      const month = String(fecha.getMonth() + 1).padStart(2, '0')
      const day = String(fecha.getDate()).padStart(2, '0')
      const hours = String(fecha.getHours()).padStart(2, '0')
      const minutes = String(fecha.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}`
    },
    
    formatearFechaParaBD(fechaInput) {
      // Convierte datetime-local a formato BD
      if (!fechaInput) return null
      
      // Si ya viene con T, está en formato correcto
      if (fechaInput.includes('T')) {
        return fechaInput
      }
      
      // Si no, intentar parsear
      const fecha = new Date(fechaInput)
      if (isNaN(fecha.getTime())) return fechaInput
      
      return fecha.toISOString().slice(0, 19).replace('T', ' ')
    },
    
    // NAVEGACIÓN
    irASeccion(indice) {
      if (indice >= 0 && indice <= 6) {
        this.seccionActual = indice
      }
    },
    
    siguienteSeccion() {
      if (this.seccionActual < 6) {
        this.seccionActual++
      }
    },
    
    anteriorSeccion() {
      if (this.seccionActual > 0) {
        this.seccionActual--
      }
    },
    
    // GESTIÓN DE CAMBIOS
    marcarCambio(campo) {
      this.cambiosPendientes = true
      console.log(`📝 Campo modificado: ${campo}`)
    },
    
    // RESET
    resetearFormulario() {
      this.$reset()
    }
  }
})