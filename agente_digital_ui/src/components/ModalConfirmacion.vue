<template>
  <div class="modal-overlay" @click="$emit('cancelar')">
    <div class="modal-container" @click.stop>
      <div class="modal-header" :class="getHeaderClass()">
        <div class="modal-icon" :class="getIconClass()">
          <i :class="getIcon()"></i>
        </div>
        <h3 class="modal-title">{{ titulo }}</h3>
      </div>
      
      <div class="modal-body">
        <p class="modal-message">{{ mensaje }}</p>
      </div>
      
      <div class="modal-footer">
        <button 
          @click="$emit('cancelar')" 
          class="btn btn-secondary"
        >
          <i class="ph ph-x"></i>
          Cancelar
        </button>
        <button 
          @click="$emit('confirmar')" 
          class="btn" 
          :class="getButtonClass()"
        >
          <i :class="getConfirmIcon()"></i>
          {{ getConfirmText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  titulo: { type: String, required: true },
  mensaje: { type: String, required: true },
  tipo: { type: String, default: 'info' } // 'info', 'warning', 'peligro', 'success'
})

const emit = defineEmits(['confirmar', 'cancelar'])

function getHeaderClass() {
  const classes = {
    'info': 'header-info',
    'warning': 'header-warning',
    'peligro': 'header-danger',
    'success': 'header-success'
  }
  return classes[props.tipo] || 'header-info'
}

function getIconClass() {
  const classes = {
    'info': 'icon-info',
    'warning': 'icon-warning',
    'peligro': 'icon-danger',
    'success': 'icon-success'
  }
  return classes[props.tipo] || 'icon-info'
}

function getIcon() {
  const icons = {
    'info': 'ph ph-info',
    'warning': 'ph ph-warning-triangle',
    'peligro': 'ph ph-trash',
    'success': 'ph ph-check-circle'
  }
  return icons[props.tipo] || 'ph ph-info'
}

function getButtonClass() {
  const classes = {
    'info': 'btn-primary',
    'warning': 'btn-warning',
    'peligro': 'btn-danger',
    'success': 'btn-success'
  }
  return classes[props.tipo] || 'btn-primary'
}

function getConfirmIcon() {
  const icons = {
    'info': 'ph ph-check',
    'warning': 'ph ph-warning',
    'peligro': 'ph ph-trash',
    'success': 'ph ph-check'
  }
  return icons[props.tipo] || 'ph ph-check'
}

function getConfirmText() {
  const texts = {
    'info': 'Confirmar',
    'warning': 'Continuar',
    'peligro': 'Eliminar',
    'success': 'Aceptar'
  }
  return texts[props.tipo] || 'Confirmar'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  position: relative;
}

.header-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
}

.header-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1));
}

.header-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
}

.header-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1rem;
  position: relative;
}

.icon-info {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.icon-warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

.icon-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
  animation: pulse-danger 2s ease-in-out infinite;
}

.icon-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.modal-body {
  padding: 0 2rem 2rem;
  text-align: center;
}

.modal-message {
  color: #cbd5e1;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(71, 85, 105, 0.3);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-secondary {
  background: rgba(71, 85, 105, 0.3);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-secondary:hover {
  background: rgba(71, 85, 105, 0.5);
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse-danger {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
  }
  50% { 
    box-shadow: 0 0 50px rgba(239, 68, 68, 0.6);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .modal-container {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .modal-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-body {
    padding: 0 1.5rem 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>