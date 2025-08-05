import { ref } from 'vue'

// Estado global del sistema de notificaciones
const toastInstance = ref(null)

// Hook para usar notificaciones
export const useToast = () => {
  // Función para registrar la instancia del componente Toast
  const registerToast = (instance) => {
    toastInstance.value = instance
  }

  // Funciones de conveniencia que usan la instancia global
  const showToast = (message, type = 'info', options = {}) => {
    if (!toastInstance.value) {
      console.warn('Toast component not registered. Falling back to console log.')
      console.log(`[${type.toUpperCase()}] ${message}`)
      return
    }
    return toastInstance.value.createToast(message, type, options)
  }

  const success = (message, options = {}) => {
    return showToast(message, 'success', options)
  }

  const error = (message, options = {}) => {
    return showToast(message, 'error', options)
  }

  const warning = (message, options = {}) => {
    return showToast(message, 'warning', options)
  }

  const info = (message, options = {}) => {
    return showToast(message, 'info', options)
  }

  const removeToast = (id) => {
    if (toastInstance.value) {
      toastInstance.value.removeToast(id)
    }
  }

  const clearAll = () => {
    if (toastInstance.value) {
      toastInstance.value.clearAll()
    }
  }

  // Función helper para manejar respuestas de API
  const handleApiResponse = async (apiCall, successMessage = 'Operación exitosa') => {
    try {
      const result = await apiCall()
      success(successMessage)
      return result
    } catch (err) {
      error(err.message || 'Error en la operación')
      throw err
    }
  }

  return {
    registerToast,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
    handleApiResponse
  }
}

// Funciones globales para usar sin el composable (compatibilidad)
export const toast = {
  success: (message, options) => {
    const { success } = useToast()
    return success(message, options)
  },
  error: (message, options) => {
    const { error } = useToast()
    return error(message, options)
  },
  warning: (message, options) => {
    const { warning } = useToast()
    return warning(message, options)
  },
  info: (message, options) => {
    const { info } = useToast()
    return info(message, options)
  }
}