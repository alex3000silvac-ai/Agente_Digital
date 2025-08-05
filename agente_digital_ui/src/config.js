// Configuración de la aplicación
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
export const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : ''
export const APP_NAME = 'Agente Digital'
export const APP_VERSION = '1.0.0'

// Configuración de plazos ANCI (en horas)
export const PLAZOS_ANCI = {
  OIV: {
    inicial: 2,
    final: 72
  },
  PSE: {
    inicial: 4,
    final: 72
  }
}

// Estados de incidentes
export const ESTADOS_INCIDENTE = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  CERRADO: 'Cerrado',
  ANCI: 'ANCI'
}

// Tipos de empresas
export const TIPOS_EMPRESA = {
  OIV: 'Operador de Infraestructura Vital',
  PSE: 'Proveedor de Servicios Esenciales'
}

// Criticidades
export const CRITICIDADES = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
}

// Configuración de archivos
export const CONFIG_ARCHIVOS = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  TIPOS_PERMITIDOS: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
}

// Colores del tema
export const COLORES = {
  primario: '#3b82f6',
  secundario: '#64748b',
  exito: '#10b981',
  advertencia: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4'
}

// Configuración de notificaciones
export const CONFIG_NOTIFICACIONES = {
  DURACION_DEFAULT: 5000,
  POSICION: 'top-right'
}