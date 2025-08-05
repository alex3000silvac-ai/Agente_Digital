// utils/errorHandler.js
// Manejo global de errores para evitar spam en la consola

export function setupGlobalErrorHandler() {
  // Capturar errores no manejados
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Ignorar errores conocidos de extensiones
    if (error && error.message) {
      const ignoredErrors = [
        'listener indicated an asynchronous response',
        'Extension context invalidated',
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured'
      ];
      
      const shouldIgnore = ignoredErrors.some(ignored => 
        error.message.includes(ignored)
      );
      
      if (shouldIgnore) {
        event.preventDefault();
        return;
      }
    }
    
    // Log otros errores
    console.error('Unhandled promise rejection:', error);
  });

  // Capturar errores de window
  window.addEventListener('error', (event) => {
    const { message } = event;
    
    // Ignorar errores de extensiones
    if (message && message.includes('listener indicated an asynchronous response')) {
      event.preventDefault();
      return;
    }
  });
}

// Wrapper para llamadas API que ignora errores de extensión
export async function safeApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    // Ignorar errores de extensión silenciosamente
    if (error.message && error.message.includes('listener indicated an asynchronous response')) {
      return null;
    }
    throw error;
  }
}