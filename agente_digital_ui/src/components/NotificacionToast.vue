<template>
  <transition name="toast" appear>
    <div class="toast" :class="getToastClass()">
      <div class="toast-icon">
        <i :class="getToastIcon()"></i>
      </div>
      <div class="toast-content">
        <div class="toast-message">{{ notificacion.mensaje }}</div>
        <div class="toast-time">{{ formatearTiempo(notificacion.timestamp) }}</div>
      </div>
      <button @click="$emit('cerrar')" class="toast-close">
        <i class="ph ph-x"></i>
      </button>
      <div class="toast-progress" :class="getToastClass()"></div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notificacion: { type: Object, required: true }
})

const emit = defineEmits(['cerrar'])

function getToastClass() {
  const classes = {
    'success': 'toast-success',
    'error': 'toast-error',
    'warning': 'toast-warning',
    'info': 'toast-info'
  }
  return classes[props.notificacion.tipo] || 'toast-info'
}

function getToastIcon() {
  const icons = {
    'success': 'ph ph-check-circle',
    'error': 'ph ph-x-circle',
    'warning': 'ph ph-warning-circle',
    'info': 'ph ph-info'
  }
  return icons[props.notificacion.tipo] || 'ph ph-info'
}

function formatearTiempo(timestamp) {
  const ahora = new Date()
  const tiempo = new Date(timestamp)
  const diferencia = Math.floor((ahora - tiempo) / 1000)
  
  if (diferencia < 60) return 'Ahora'
  if (diferencia < 3600) return `${Math.floor(diferencia / 60)}m`
  return `${Math.floor(diferencia / 3600)}h`
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 300px;
  max-width: 400px;
  border: 1px solid rgba(71, 85, 105, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  position: relative;
  overflow: hidden;
}

.toast-success {
  border-color: rgba(16, 185, 129, 0.5);
}

.toast-error {
  border-color: rgba(239, 68, 68, 0.5);
}

.toast-warning {
  border-color: rgba(245, 158, 11, 0.5);
}

.toast-info {
  border-color: rgba(59, 130, 246, 0.5);
}

.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.toast-error .toast-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.toast-warning .toast-icon {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.toast-info .toast-icon {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.toast-content {
  flex: 1;
}

.toast-message {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.toast-time {
  color: #64748b;
  font-size: 0.75rem;
}

.toast-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(71, 85, 105, 0.3);
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(71, 85, 105, 0.5);
  color: #cbd5e1;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  animation: progress 5s linear forwards;
}

.toast-progress.toast-success {
  background: #10b981;
}

.toast-progress.toast-error {
  background: #ef4444;
}

.toast-progress.toast-warning {
  background: #f59e0b;
}

.toast-progress.toast-info {
  background: #3b82f6;
}

/* Animaciones */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* Responsive */
@media (max-width: 768px) {
  .toast {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    min-width: auto;
    max-width: none;
  }
}
</style>