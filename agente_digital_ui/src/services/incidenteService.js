// services/incidenteService.js
// Servicio para manejar incidentes con sistema dinámico

import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Configurar axios con defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ===============================================
// FUNCIONES DEL SISTEMA DINÁMICO
// ===============================================

/**
 * Obtiene las secciones dinámicas aplicables para una empresa
 * @param {number} empresaId - ID de la empresa
 * @returns {Promise} Respuesta con las secciones
 */
export async function obtenerSeccionesDinamicas(empresaId) {
  try {
    console.log(`🔍 Obteniendo secciones dinámicas para empresa ${empresaId}`);
    
    const response = await axios.get(
      `${API_URL}/api/incidente-dinamico/secciones-empresa/${empresaId}`
    );
    
    console.log('✅ Secciones obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo secciones dinámicas:', error);
    throw error;
  }
}

/**
 * Guarda los datos de una sección específica
 * @param {number} incidenteId - ID del incidente
 * @param {number} seccionId - ID de la sección
 * @param {object} datos - Datos a guardar
 * @returns {Promise} Respuesta del servidor
 */
export async function guardarSeccionDinamica(incidenteId, seccionId, datos) {
  try {
    console.log(`💾 Guardando sección ${seccionId} del incidente ${incidenteId}`, datos);
    
    const response = await axios.put(
      `${API_URL}/api/incidente-dinamico/${incidenteId}/seccion/${seccionId}`,
      { datos }
    );
    
    console.log('✅ Sección guardada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error guardando sección:', error);
    throw error;
  }
}

/**
 * Carga un incidente completo con todas sus secciones dinámicas
 * @param {number} incidenteId - ID del incidente
 * @returns {Promise} Incidente completo con secciones
 */
export async function cargarIncidenteDinamico(incidenteId) {
  try {
    console.log(`📄 Cargando incidente dinámico ${incidenteId}`);
    
    const response = await axios.get(
      `${API_URL}/api/incidente-dinamico/${incidenteId}`
    );
    
    console.log('✅ Incidente dinámico cargado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error cargando incidente dinámico:', error);
    throw error;
  }
}

/**
 * Crea un incidente con estructura dinámica
 * @param {number} incidenteId - ID del incidente ya creado
 * @param {number} empresaId - ID de la empresa
 * @param {object} datosIniciales - Datos iniciales del incidente
 * @returns {Promise} Resultado de la creación
 */
export async function crearIncidenteDinamico(incidenteId, empresaId, datosIniciales = {}) {
  try {
    console.log(`🆕 Creando estructura dinámica para incidente ${incidenteId}`);
    
    const response = await axios.post(
      `${API_URL}/api/incidente-dinamico/crear`,
      {
        incidente_id: incidenteId,
        empresa_id: empresaId,
        datos_iniciales: datosIniciales
      }
    );
    
    console.log('✅ Estructura dinámica creada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando estructura dinámica:', error);
    throw error;
  }
}

/**
 * Agrega un comentario a una sección
 * @param {number} incidenteId - ID del incidente
 * @param {number} seccionId - ID de la sección
 * @param {string} comentario - Texto del comentario
 * @param {string} tipo - Tipo de comentario (opcional)
 * @returns {Promise} Resultado
 */
export async function agregarComentarioSeccion(incidenteId, seccionId, comentario, tipo = 'GENERAL') {
  try {
    console.log(`💬 Agregando comentario a sección ${seccionId}`);
    
    const response = await axios.post(
      `${API_URL}/api/incidente-dinamico/${incidenteId}/seccion/${seccionId}/comentario`,
      { comentario, tipo }
    );
    
    console.log('✅ Comentario agregado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error agregando comentario:', error);
    throw error;
  }
}

/**
 * Sube un archivo a una sección
 * @param {number} incidenteId - ID del incidente
 * @param {number} seccionId - ID de la sección
 * @param {File} archivo - Archivo a subir
 * @param {string} descripcion - Descripción del archivo (opcional)
 * @returns {Promise} Resultado
 */
export async function subirArchivoSeccion(incidenteId, seccionId, archivo, descripcion = '') {
  try {
    console.log(`📎 Subiendo archivo a sección ${seccionId}`);
    
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('descripcion', descripcion);
    
    const response = await axios.post(
      `${API_URL}/api/incidente-dinamico/${incidenteId}/seccion/${seccionId}/archivo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('✅ Archivo subido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    throw error;
  }
}

/**
 * Obtiene un resumen del progreso del incidente
 * @param {number} incidenteId - ID del incidente
 * @returns {Promise} Resumen del incidente
 */
export async function obtenerResumenIncidente(incidenteId) {
  try {
    console.log(`📊 Obteniendo resumen del incidente ${incidenteId}`);
    
    const response = await axios.get(
      `${API_URL}/api/incidente-dinamico/${incidenteId}/resumen`
    );
    
    console.log('✅ Resumen obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo resumen:', error);
    throw error;
  }
}

/**
 * Elimina completamente un incidente dinámico
 * @param {number} incidenteId - ID del incidente
 * @returns {Promise} Resultado
 */
export async function eliminarIncidenteDinamico(incidenteId) {
  try {
    console.log(`🗑️ Eliminando incidente dinámico ${incidenteId}`);
    
    const response = await axios.delete(
      `${API_URL}/api/incidente-dinamico/${incidenteId}`
    );
    
    console.log('✅ Incidente eliminado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando incidente:', error);
    throw error;
  }
}

// ===============================================
// FUNCIONES DE UTILIDAD
// ===============================================

/**
 * Verifica si el sistema dinámico está disponible
 * @returns {Promise<boolean>} True si está disponible
 */
export async function verificarSistemaDinamico() {
  try {
    // Intentar obtener secciones para empresa 1 como test
    await obtenerSeccionesDinamicas(1);
    return true;
  } catch (error) {
    console.warn('⚠️ Sistema dinámico no disponible:', error.message);
    return false;
  }
}

/**
 * Parsea campos JSON de forma segura
 * @param {string} camposJson - JSON string de campos
 * @returns {object} Campos parseados o objeto vacío
 */
export function parsearCamposJSON(camposJson) {
  try {
    return JSON.parse(camposJson);
  } catch (e) {
    console.warn('⚠️ Error parseando campos JSON:', e);
    return { campos: [] };
  }
}

/**
 * Valida los datos de una sección según su configuración
 * @param {object} datos - Datos de la sección
 * @param {object} configuracion - Configuración de la sección
 * @returns {object} { esValida: boolean, errores: string[] }
 */
export function validarSeccion(datos, configuracion) {
  const errores = [];
  const campos = parsearCamposJSON(configuracion.campos);
  
  if (!campos.campos) {
    return { esValida: true, errores: [] };
  }
  
  campos.campos.forEach(campo => {
    if (campo.requerido) {
      const valor = datos[campo.nombre];
      if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
        errores.push(`${campo.etiqueta} es requerido`);
      }
    }
  });
  
  return {
    esValida: errores.length === 0,
    errores
  };
}

/**
 * Calcula el porcentaje de completado de una sección
 * @param {object} datos - Datos de la sección
 * @param {object} configuracion - Configuración de la sección
 * @returns {number} Porcentaje (0-100)
 */
export function calcularPorcentajeCompletado(datos, configuracion) {
  const campos = parsearCamposJSON(configuracion.campos);
  
  if (!campos.campos || campos.campos.length === 0) {
    return 0;
  }
  
  const camposCompletos = campos.campos.filter(campo => {
    const valor = datos[campo.nombre];
    return valor !== undefined && valor !== '' && valor !== false && valor !== null;
  });
  
  return Math.round((camposCompletos.length / campos.campos.length) * 100);
}

// ===============================================
// FUNCIONES DE COMPATIBILIDAD (para sistema anterior)
// ===============================================

/**
 * Función de compatibilidad - usar obtenerSeccionesDinamicas en su lugar
 * @deprecated
 */
export async function obtenerSecciones(empresaId) {
  console.warn('⚠️ obtenerSecciones está deprecated, usar obtenerSeccionesDinamicas');
  return obtenerSeccionesDinamicas(empresaId);
}

/**
 * Función de compatibilidad - usar guardarSeccionDinamica en su lugar
 * @deprecated
 */
export async function guardarSeccion(incidenteId, seccionId, datos) {
  console.warn('⚠️ guardarSeccion está deprecated, usar guardarSeccionDinamica');
  return guardarSeccionDinamica(incidenteId, seccionId, datos);
}

// Exportar todo como default también para compatibilidad
export default {
  obtenerSeccionesDinamicas,
  guardarSeccionDinamica,
  cargarIncidenteDinamico,
  crearIncidenteDinamico,
  agregarComentarioSeccion,
  subirArchivoSeccion,
  obtenerResumenIncidente,
  eliminarIncidenteDinamico,
  verificarSistemaDinamico,
  parsearCamposJSON,
  validarSeccion,
  calcularPorcentajeCompletado,
  // Funciones deprecated
  obtenerSecciones,
  guardarSeccion
};