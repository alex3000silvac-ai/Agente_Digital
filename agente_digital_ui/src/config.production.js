// Configuración para producción en Railway
export default {
  // En producción, el API está en el mismo dominio
  API_BASE_URL: window.location.origin + '/api',
  
  // Otras configuraciones
  APP_NAME: 'Agente Digital',
  APP_VERSION: '2.0.0',
  
  // Timeouts
  REQUEST_TIMEOUT: 30000,
  
  // Features flags
  FEATURES: {
    SHOW_DEBUG_INFO: false,
    ENABLE_ANALYTICS: true
  }
}