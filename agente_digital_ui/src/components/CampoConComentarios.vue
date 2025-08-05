<template>
  <div class="campo-con-comentarios">
    <!-- Campo principal del formulario -->
    <div class="campo-wrapper">
      <slot></slot>
      
      <!-- Botón para mostrar/ocultar comentarios -->
      <button 
        v-if="incidenteId"
        @click="toggleComentarios"
        class="btn-comentarios"
        type="button"
        :title="mostrarComentarios ? 'Ocultar comentarios' : 'Ver/agregar comentarios'"
      >
        <i class="ph ph-chat-circle"></i>
        <span v-if="comentarios.length > 0" class="comentario-badge">{{ comentarios.length }}</span>
      </button>
    </div>

    <!-- Panel de comentarios expandible -->
    <transition name="comentarios-slide">
      <div v-if="mostrarComentarios" class="comentarios-panel">
        <div class="comentarios-header">
          <h5 class="comentarios-titulo">
            <i class="ph ph-chat-text"></i>
            Comentarios para "{{ nombreCampo }}"
          </h5>
          <button @click="mostrarComentarios = false" class="btn-cerrar">
            <i class="ph ph-x"></i>
          </button>
        </div>

        <!-- Formulario para nuevo comentario -->
        <div class="nuevo-comentario">
          <textarea 
            v-model="nuevoComentario"
            class="comentario-input"
            rows="2"
            :placeholder="`Agregar comentario sobre ${nombreCampo.toLowerCase()}...`"
            :disabled="guardandoComentario"
          ></textarea>
          <button 
            @click="agregarComentario"
            class="btn-agregar-comentario"
            :disabled="!nuevoComentario.trim() || guardandoComentario"
            type="button"
          >
            <i class="ph ph-plus-circle"></i>
            {{ guardandoComentario ? 'Guardando...' : 'Agregar' }}
          </button>
        </div>

        <!-- Lista de comentarios -->
        <div class="comentarios-lista">
          <div v-if="comentarios.length === 0" class="comentarios-vacio">
            No hay comentarios para este campo.
          </div>
          <div v-else class="comentarios-items">
            <div v-for="comentario in comentarios" :key="comentario.id" class="comentario-item">
              <div class="comentario-contenido">
                <div class="comentario-texto">{{ comentario.contenido }}</div>
                <div class="comentario-meta">
                  <span class="comentario-autor">{{ comentario.autor }}</span>
                  <span class="comentario-fecha">{{ formatearFecha(comentario.fecha) }}</span>
                </div>
              </div>
              <button 
                v-if="puedeEliminar(comentario)"
                @click="eliminarComentario(comentario.id)"
                class="btn-eliminar"
                type="button"
                title="Eliminar comentario"
              >
                <i class="ph ph-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Historial de cambios del campo -->
        <div class="historial-campo">
          <div class="historial-header">
            <h6 class="historial-titulo">
              <i class="ph ph-clock-counter-clockwise"></i>
              Historial de Cambios
            </h6>
            <button @click="cargarHistorial" class="btn-refrescar" title="Actualizar historial">
              <i class="ph ph-arrow-clockwise"></i>
            </button>
          </div>
          
          <div v-if="cargandoHistorial" class="historial-loading">
            <i class="ph ph-spinner animate-spin"></i>
            Cargando historial...
          </div>
          
          <div v-else-if="historial.length === 0" class="historial-vacio">
            No hay cambios registrados para este campo.
          </div>
          
          <div v-else class="historial-items">
            <div v-for="cambio in historial.slice(0, 3)" :key="cambio.id" class="historial-item">
              <div class="historial-indicador">
                <div class="historial-dot"></div>
              </div>
              <div class="historial-contenido">
                <div class="historial-cambio">
                  <span class="valor-anterior">{{ cambio.valorAnterior || 'Vacío' }}</span>
                  <i class="ph ph-arrow-right"></i>
                  <span class="valor-nuevo">{{ cambio.valorNuevo || 'Vacío' }}</span>
                </div>
                <div class="historial-meta">
                  {{ cambio.usuario }} - {{ formatearFecha(cambio.fecha) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  incidenteId: { type: [String, Number], default: null },
  nombreCampo: { type: String, required: true },
  valorCampo: { type: String, default: '' }
})

const emit = defineEmits(['comentario-agregado', 'comentario-eliminado'])

// Estado local
const mostrarComentarios = ref(false)
const comentarios = ref([])
const historial = ref([])
const nuevoComentario = ref('')
const guardandoComentario = ref(false)
const cargandoHistorial = ref(false)

// Métodos
const toggleComentarios = () => {
  mostrarComentarios.value = !mostrarComentarios.value
  if (mostrarComentarios.value) {
    cargarComentarios()
    cargarHistorial()
  }
}

const cargarComentarios = async () => {
  if (!props.incidenteId) return
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/comentarios-campo?campo=${props.nombreCampo}`)
    if (response.ok) {
      comentarios.value = await response.json()
    }
  } catch (error) {
    console.error('Error cargando comentarios del campo:', error)
  }
}

const agregarComentario = async () => {
  if (!nuevoComentario.value.trim() || !props.incidenteId) return
  
  guardandoComentario.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/comentarios-campo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        campo: props.nombreCampo,
        contenido: nuevoComentario.value
      })
    })
    
    if (response.ok) {
      nuevoComentario.value = ''
      await cargarComentarios()
      emit('comentario-agregado', { campo: props.nombreCampo, contenido: nuevoComentario.value })
    }
  } catch (error) {
    console.error('Error agregando comentario:', error)
  } finally {
    guardandoComentario.value = false
  }
}

const eliminarComentario = async (comentarioId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/comentarios-campo/${comentarioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (response.ok) {
      await cargarComentarios()
      emit('comentario-eliminado', { comentarioId })
    }
  } catch (error) {
    console.error('Error eliminando comentario:', error)
  }
}

const cargarHistorial = async () => {
  if (!props.incidenteId) return
  
  cargandoHistorial.value = true
  try {
    const response = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/historial-campo?campo=${props.nombreCampo}`)
    if (response.ok) {
      historial.value = await response.json()
    }
  } catch (error) {
    console.error('Error cargando historial del campo:', error)
  } finally {
    cargandoHistorial.value = false
  }
}

const puedeEliminar = (comentario) => {
  const currentUser = localStorage.getItem('userEmail') || 'current_user'
  return comentario.autor === currentUser || comentario.autorId === currentUser
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watchers
watch(() => props.valorCampo, (nuevoValor, valorAnterior) => {
  // Aquí se podría registrar automáticamente el cambio en el historial
  if (props.incidenteId && valorAnterior !== undefined && nuevoValor !== valorAnterior) {
    // Lógica para registrar cambio en el historial
    console.log(`Campo ${props.nombreCampo} cambió de "${valorAnterior}" a "${nuevoValor}"`)
  }
})
</script>

<style scoped>
.campo-con-comentarios {
  position: relative;
}

.campo-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.btn-comentarios {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #374151;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.btn-comentarios:hover {
  background-color: #4b5563;
  color: #d1d5db;
}

.comentario-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.25rem;
  border-radius: 9999px;
  min-width: 1rem;
  text-align: center;
}

.comentarios-panel {
  margin-top: 0.75rem;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.comentarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #0f172a;
  border-bottom: 1px solid #334155;
}

.comentarios-titulo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.btn-cerrar {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.btn-cerrar:hover {
  color: #f87171;
}

.nuevo-comentario {
  padding: 1rem;
  border-bottom: 1px solid #334155;
}

.comentario-input {
  width: 100%;
  background-color: #374151;
  border: 1px solid #4b5563;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  resize: vertical;
  margin-bottom: 0.5rem;
  transition: border-color 0.2s;
}

.comentario-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.comentario-input::placeholder {
  color: #9ca3af;
}

.btn-agregar-comentario {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-agregar-comentario:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-agregar-comentario:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comentarios-lista {
  padding: 0.75rem;
  max-height: 12rem;
  overflow-y: auto;
}

.comentarios-vacio {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 1rem;
}

.comentarios-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comentario-item {
  display: flex;
  gap: 0.5rem;
  background-color: #374151;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #4b5563;
}

.comentario-contenido {
  flex: 1;
  min-width: 0;
}

.comentario-texto {
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.comentario-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.comentario-autor {
  font-weight: 500;
  color: #60a5fa;
}

.btn-eliminar {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.btn-eliminar:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.historial-campo {
  border-top: 1px solid #334155;
  padding: 0.75rem;
}

.historial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.historial-titulo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-refrescar {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.btn-refrescar:hover {
  color: #3b82f6;
}

.historial-loading, .historial-vacio {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.75rem;
}

.historial-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.historial-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.historial-indicador {
  display: flex;
  align-items: center;
  height: 1.5rem;
}

.historial-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #f59e0b;
  border-radius: 50%;
}

.historial-contenido {
  flex: 1;
  min-width: 0;
}

.historial-cambio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.valor-anterior {
  color: #fca5a5;
  font-family: monospace;
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.valor-nuevo {
  color: #86efac;
  font-family: monospace;
  background-color: rgba(34, 197, 94, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.historial-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Transiciones */
.comentarios-slide-enter-active,
.comentarios-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.comentarios-slide-enter-from,
.comentarios-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>