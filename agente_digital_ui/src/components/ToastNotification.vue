<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast',
            `toast-${toast.type}`,
            { 'toast-dismissible': toast.dismissible }
          ]"
        >
          <div class="toast-icon">
            <i class="ph" :class="getIcon(toast.type)"></i>
          </div>
          
          <div class="toast-content">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          
          <button 
            v-if="toast.dismissible"
            @click="removeToast(toast.id)"
            class="toast-close"
            type="button"
          >
            <i class="ph ph-x"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

const emit = defineEmits(['toast-created', 'toast-removed'])

// Función principal para crear notificaciones
const createToast = (message, type = 'info', options = {}) => {
  const toast = {
    id: ++toastIdCounter,
    message,
    type,
    title: options.title || '',
    dismissible: options.dismissible !== false,
    duration: options.duration || getDefaultDuration(type),
    persistent: options.persistent || false
  }
  
  toasts.value.push(toast)
  emit('toast-created', toast)
  
  // Auto-remover si no es persistente
  if (!toast.persistent && toast.duration > 0) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }
  
  return toast.id
}

// Remover notificación
const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    const toast = toasts.value[index]
    toasts.value.splice(index, 1)
    emit('toast-removed', toast)
  }
}

// Limpiar todas las notificaciones
const clearAll = () => {
  toasts.value = []
}

// Funciones de conveniencia
const success = (message, options = {}) => createToast(message, 'success', options)
const error = (message, options = {}) => createToast(message, 'error', options)
const warning = (message, options = {}) => createToast(message, 'warning', options)
const info = (message, options = {}) => createToast(message, 'info', options)

// Obtener duración por defecto según tipo
const getDefaultDuration = (type) => {
  const durations = {
    success: 4000,
    info: 5000,
    warning: 6000,
    error: 0 // Los errores no se auto-ocultan
  }
  return durations[type] || 5000
}

// Obtener icono según tipo
const getIcon = (type) => {
  const icons = {
    success: 'ph-check-circle',
    error: 'ph-x-circle',
    warning: 'ph-warning-circle',
    info: 'ph-info'
  }
  return icons[type] || 'ph-info'
}

// Exponer funciones para el componente padre
defineExpose({
  createToast,
  success,
  error,
  warning,
  info,
  removeToast,
  clearAll
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
}

.toast {
  @apply flex items-start space-x-3 p-4 mb-3 rounded-lg shadow-lg backdrop-blur-sm;
  pointer-events: auto;
  min-height: 64px;
  border-left: 4px solid;
}

.toast-success {
  @apply bg-green-900/90 text-green-100 border-green-500;
}

.toast-error {
  @apply bg-red-900/90 text-red-100 border-red-500;
}

.toast-warning {
  @apply bg-yellow-900/90 text-yellow-100 border-yellow-500;
}

.toast-info {
  @apply bg-blue-900/90 text-blue-100 border-blue-500;
}

.toast-icon {
  @apply flex-shrink-0 flex items-center justify-center w-6 h-6 mt-0.5;
}

.toast-icon i {
  @apply text-xl;
}

.toast-content {
  @apply flex-1 min-w-0;
}

.toast-title {
  @apply font-semibold text-sm mb-1;
}

.toast-message {
  @apply text-sm leading-relaxed;
  word-wrap: break-word;
}

.toast-close {
  @apply flex-shrink-0 flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors;
}

.toast-close i {
  @apply text-sm;
}

/* Animaciones */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
  
  .toast {
    @apply p-3 mb-2 text-sm;
    min-height: 56px;
  }
  
  .toast-icon {
    @apply w-5 h-5;
  }
  
  .toast-icon i {
    @apply text-lg;
  }
  
  .toast-close {
    @apply w-5 h-5;
  }
}
</style>