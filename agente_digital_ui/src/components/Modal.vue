<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-backdrop" @click="close">
        <div class="modal-container" @click.stop>
          
          <header class="modal-header">
            <slot name="header">
              Título por Defecto
            </slot>
            <button @click="close" class="btn-close">&times;</button>
          </header>

          <section class="modal-body">
            <slot>
              Contenido por defecto del modal.
            </slot>
          </section>

          <footer class="modal-footer">
            <slot name="footer">
              <button @click="close" class="btn btn-secondary">Cerrar</button>
            </slot>
          </footer>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
// Definimos las propiedades que el componente puede recibir del padre
const props = defineProps({
  modelValue: { // 'modelValue' es el estándar para usar con v-model en Vue 3
    type: Boolean,
    required: true,
  }
});

// Definimos los eventos que el componente puede emitir hacia el padre
const emit = defineEmits(['update:modelValue']);

// Función para emitir el evento de cierre
function close() {
  emit('update:modelValue', false); // Esto permite usar v-model en el componente padre
}
</script>

<style scoped>
/* Estilos para el fondo oscuro y el contenedor del modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background-color: #1f2937; /* Color de fondo oscuro como tus otras tarjetas */
  border: 1px solid #374151;
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 600px; /* Ancho máximo del modal */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Estilos para las secciones del modal */
.modal-header, .modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
}

.modal-header {
  justify-content: space-between;
  border-bottom: 1px solid #374151;
  font-size: 1.25rem;
  color: #ffffff;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto; /* Permite scroll si el contenido es muy largo */
  color: #d1d5db;
}

.modal-footer {
  border-top: 1px solid #374151;
  justify-content: flex-end;
  gap: 0.75rem; /* Espacio entre los botones del pie */
}

/* Botón de cierre */
.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
}
.btn-close:hover {
  color: #ffffff;
}

/* Transiciones para la animación */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>