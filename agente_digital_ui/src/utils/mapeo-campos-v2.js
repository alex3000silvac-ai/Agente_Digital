// utils/mapeo-campos-v2.js
// MAPEO EXACTO Y SEGURO ENTRE BD Y FORMULARIO V2

// IMPORTANTE: Este mapeo usa los nombres ORIGINALES de la BD
// NO usa renombramientos para evitar errores de sincronización

export const MAPEO_BD_FORMULARIO = {
  // === CAMPOS DE IDENTIFICACIÓN ===
  'IncidenteID': 'incidenteId',
  'EmpresaID': 'empresaId',
  'IDVisible': 'idVisible',
  
  // === SECCIÓN 1: IDENTIFICACIÓN GENERAL ===
  'TipoFlujo': 'tipoRegistro',        // En BD es TipoFlujo, en form es tipoRegistro
  'Titulo': 'titulo',
  'FechaDeteccion': 'fechaDeteccion',
  'FechaOcurrencia': 'fechaOcurrencia',
  'Criticidad': 'criticidad',
  'AlcanceGeografico': 'alcanceGeografico',
  
  // === SECCIÓN 2: DESCRIPCIÓN Y ALCANCE ===  
  'DescripcionInicial': 'descripcionInicial',
  'AnciImpactoPreliminar': 'impactoPreliminar',
  'SistemasAfectados': 'sistemasAfectados',
  'ServiciosInterrumpidos': 'serviciosInterrumpidos',
  
  // === SECCIÓN 3: ANÁLISIS PRELIMINAR ===
  'AnciTipoAmenaza': 'tipoAmenaza',
  'OrigenIncidente': 'origenAtaque',
  'ResponsableCliente': 'responsableCliente',
  
  // === SECCIÓN 5: ACCIONES INMEDIATAS ===
  'AccionesInmediatas': 'medidasContencion',
  
  // === SECCIÓN 6: ANÁLISIS FINAL ===
  'CausaRaiz': 'causaRaiz',
  'LeccionesAprendidas': 'leccionesAprendidas', 
  'PlanMejora': 'planMejora',
  
  // === CAMPOS DE CONTROL Y AUDITORÍA ===
  'EstadoActual': 'estadoActual',
  'CreadoPor': 'creadoPor',
  'FechaCreacion': 'fechaCreacion',
  'FechaActualizacion': 'fechaActualizacion',
  'FechaCierre': 'fechaCierre',
  'ReporteAnciID': 'reporteAnciId'
}

// MAPEO INVERSO (Formulario → BD)
export const MAPEO_FORMULARIO_BD = Object.entries(MAPEO_BD_FORMULARIO)
  .reduce((acc, [bd, form]) => ({ ...acc, [form]: bd }), {})

// VALIDACIONES DE LONGITUD MÁXIMA (Según BD)
export const LONGITUDES_MAXIMAS = {
  'Titulo': 255,
  'TipoFlujo': 100,
  'Criticidad': 50,
  'EstadoActual': 50,
  'OrigenIncidente': 255,
  'ResponsableCliente': 255,
  'CreadoPor': 255,
  'AlcanceGeografico': 100,
  'AnciTipoAmenaza': 500,
  // Campos ntext/nvarchar(MAX) no tienen límite práctico
  'DescripcionInicial': 4000,  // Límite sugerido
  'SistemasAfectados': 4000,
  'AccionesInmediatas': 4000,
  'ServiciosInterrumpidos': 2000,
  'AnciImpactoPreliminar': 2000,
  'CausaRaiz': 2000,
  'LeccionesAprendidas': 2000,
  'PlanMejora': 2000
}

// VALORES POR DEFECTO SEGUROS
export const VALORES_DEFECTO = {
  'TipoFlujo': 'Informativo',
  'Criticidad': 'Media',
  'EstadoActual': 'Abierto',
  'AlcanceGeografico': 'Local',
  'OrigenIncidente': 'Sistema interno',
  'SistemasAfectados': 'No especificado',
  'AccionesInmediatas': 'Pendiente de definir',
  'ResponsableCliente': 'No asignado'
}

// CAMPOS REQUERIDOS PARA VALIDACIÓN
export const CAMPOS_REQUERIDOS = [
  'Titulo',
  'DescripcionInicial',
  'FechaDeteccion',
  'Criticidad',
  'SistemasAfectados',
  'OrigenIncidente',
  'AccionesInmediatas'
]

// OPCIONES DE DROPDOWN (Valores exactos de BD)
export const OPCIONES_FORMULARIO = {
  tipoRegistro: [
    { valor: 'Informativo', texto: 'Informativo (Registro simple)' },
    { valor: 'Interno', texto: 'Interno' },
    { valor: 'Externo', texto: 'Externo' },
    { valor: 'Mixto', texto: 'Mixto' }
  ],
  
  criticidad: [
    { valor: 'Baja', texto: 'Baja' },
    { valor: 'Media', texto: 'Media' },
    { valor: 'Alta', texto: 'Alta' },
    { valor: 'Crítica', texto: 'Crítica' }
  ],
  
  estadoActual: [
    { valor: 'Abierto', texto: 'Abierto' },
    { valor: 'En Proceso', texto: 'En Proceso' },
    { valor: 'En Investigación', texto: 'En Investigación' },
    { valor: 'Pendiente', texto: 'Pendiente' },
    { valor: 'Cerrado', texto: 'Cerrado' }
  ],
  
  alcanceGeografico: [
    { valor: 'Local', texto: 'Local' },
    { valor: 'Regional', texto: 'Regional' },
    { valor: 'Nacional', texto: 'Nacional' },
    { valor: 'Internacional', texto: 'Internacional' }
  ]
}

// FUNCIONES HELPER PARA CONVERSIÓN SEGURA
export function convertirDatosBDaFormulario(datosBD) {
  const datosFormulario = {}
  
  Object.entries(MAPEO_BD_FORMULARIO).forEach(([campoBD, campoForm]) => {
    if (datosBD[campoBD] !== undefined && datosBD[campoBD] !== null) {
      datosFormulario[campoForm] = datosBD[campoBD]
    }
  })
  
  return datosFormulario
}

export function convertirDatosFormularioaBD(datosForm) {
  const datosBD = {}
  
  Object.entries(MAPEO_FORMULARIO_BD).forEach(([campoForm, campoBD]) => {
    if (datosForm[campoForm] !== undefined && datosForm[campoForm] !== null) {
      // Aplicar validación de longitud
      let valor = datosForm[campoForm]
      
      if (typeof valor === 'string' && LONGITUDES_MAXIMAS[campoBD]) {
        valor = valor.substring(0, LONGITUDES_MAXIMAS[campoBD])
      }
      
      datosBD[campoBD] = valor
    }
  })
  
  return datosBD
}

// VALIDACIÓN DE DATOS ANTES DE ENVIAR A BD
export function validarDatosParaBD(datos) {
  const errores = []
  
  // Validar campos requeridos
  CAMPOS_REQUERIDOS.forEach(campo => {
    if (!datos[campo] || (typeof datos[campo] === 'string' && datos[campo].trim() === '')) {
      errores.push(`El campo ${campo} es requerido`)
    }
  })
  
  // Validar longitudes
  Object.entries(datos).forEach(([campo, valor]) => {
    if (typeof valor === 'string' && LONGITUDES_MAXIMAS[campo] && valor.length > LONGITUDES_MAXIMAS[campo]) {
      errores.push(`El campo ${campo} excede la longitud máxima de ${LONGITUDES_MAXIMAS[campo]} caracteres`)
    }
  })
  
  // Validar formatos de fecha
  ['FechaDeteccion', 'FechaOcurrencia', 'FechaCierre'].forEach(campo => {
    if (datos[campo]) {
      const fecha = new Date(datos[campo])
      if (isNaN(fecha.getTime())) {
        errores.push(`El campo ${campo} tiene un formato de fecha inválido`)
      }
    }
  })
  
  return errores
}