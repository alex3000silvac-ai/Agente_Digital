<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-white">Historial de Cambios</h3>
    </template>
    
    <template #default>
      <div v-if="loading" class="text-center p-6 text-gray-400">Cargando historial...</div>
      <div v-else-if="error" class="text-center p-6 text-red-400">{{ error }}</div>
      <div v-else class="historial-container space-y-4">
        <div v-if="historial.length > 0" v-for="item in historial" :key="item.HistorialID" class="historial-item">
          <div class="historial-icon">
            <i class="ph ph-clock-counter-clockwise"></i>
          </div>
          <div class="historial-content">
            <p class="font-semibold text-white">
              Campo modificado: <span class="text-indigo-400">{{ item.CampoModificado }}</span>
            </p>
            
            <!-- Mostrar información específica para archivos -->
            <div v-if="esHistorialArchivo(item)" class="archivo-historial">
              <div class="archivo-info-historial">
                <p class="text-sm text-gray-300">
                  <i class="fa-solid fa-file mr-2"></i>
                  <strong>Archivo:</strong> {{ extraerNombreArchivo(item.ValorNuevo) }}
                </p>
                <p class="text-sm text-gray-300" v-if="extraerDescripcionArchivo(item.ValorNuevo)">
                  <i class="fa-solid fa-comment mr-2"></i>
                  <strong>Descripción:</strong> {{ extraerDescripcionArchivo(item.ValorNuevo) }}
                </p>
                <p class="text-sm text-gray-300" v-if="extraerFechaVigencia(item.ValorNuevo)">
                  <i class="fa-solid fa-calendar mr-2"></i>
                  <strong>Vigente hasta:</strong> {{ formatearFecha(extraerFechaVigencia(item.ValorNuevo)) }}
                </p>
              </div>
            </div>
            
            <!-- Mostrar valores normales para otros campos -->
            <div v-else>
              <p class="text-sm text-gray-400">
                Valor Anterior: <span class="valor-anterior">{{ item.ValorAnterior || 'N/A' }}</span>
              </p>
              <p class="text-sm text-gray-400">
                Valor Nuevo: <span class="valor-nuevo">{{ item.ValorNuevo || 'N/A' }}</span>
              </p>
            </div>
            
            <p class="historial-meta">
              {{ item.UsuarioCambio }} - {{ formatDateTime(item.FechaCambio) }}
            </p>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 p-6">
          No hay historial de cambios para este ítem.
        </div>
      </div>
    </template>

    <template #footer>
      <button @click="$emit('update:modelValue', false)" type="button" class="btn btn-secondary">Cerrar</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  cumplimientoId: { type: Number, default: null }
});
defineEmits(['update:modelValue']);

const historial = ref([]);
const loading = ref(true);
const error = ref(null);

async function cargarHistorial() {
  if (!props.cumplimientoId) return;
  loading.value = true;
  error.value = null;
  try {
    console.log(`🔍 Cargando historial para cumplimiento: ${props.cumplimientoId}`);
    
    // Usar endpoint con autenticación
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/admin/cumplimiento/${props.cumplimientoId}/historial`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || 'Error al cargar el historial');
    }
    
    const data = await response.json();
    historial.value = Array.isArray(data) ? data : [];
    console.log(`✅ Historial cargado: ${historial.value.length} registros`);
  } catch (e) {
    console.error('❌ Error cargando historial:', e);
    error.value = `No se pudo cargar el historial: ${e.message}`;
  } finally {
    loading.value = false;
  }
}

// --- FUNCIÓN DE DEPURACIÓN PROFUNDA ---
function formatDateTime(dateInput) {
  console.log("------------------------------");
  console.log("1. VALOR INICIAL RECIBIDO:", dateInput);

  if (!dateInput) {
    console.log("-> El valor es nulo o indefinido. Terminando.");
    console.log("------------------------------");
    return 'Fecha no disponible';
  }

  const date = new Date(dateInput);
  console.log("2. OBJETO DATE CREADO:", date.toString());
  
  const esValida = !isNaN(date.getTime());
  console.log("   -> ¿Es fecha válida?", esValida);

  if (!esValida) {
    console.log("-> La fecha no es válida. Terminando.");
    console.log("------------------------------");
    return 'Formato de fecha inválido';
  }

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Santiago'
  };
  
  try {
    const formatador = new Intl.DateTimeFormat('es-CL', options);
    const fechaFormateada = formatador.format(date);
    console.log("3. RESULTADO FINAL FORMATEADO:", fechaFormateada);
    console.log("------------------------------");
    return fechaFormateada;
  } catch (e) {
    console.error("¡ERROR! Falló la función Intl.DateTimeFormat:", e);
    console.log("------------------------------");
    return "Error de formato";
  }
}
// --- FIN DE LA FUNCIÓN ---

// Funciones para manejar información de archivos en el historial
function esHistorialArchivo(item) {
  // Detectar si el campo modificado es relacionado con archivos
  const camposArchivos = ['evidencia_agregada', 'archivo_subido', 'evidencia', 'documento', 'archivo'];
  return camposArchivos.some(campo => 
    item.CampoModificado?.toLowerCase().includes(campo) ||
    (item.ValorNuevo && typeof item.ValorNuevo === 'string' && item.ValorNuevo.includes('descripcion:'))
  );
}

function extraerNombreArchivo(valorNuevo) {
  if (!valorNuevo) return '';
  
  try {
    // Si es JSON, intentar parsearlo
    if (valorNuevo.startsWith('{') || valorNuevo.includes('nombre:')) {
      const data = JSON.parse(valorNuevo);
      return data.nombre || data.filename || data.archivo || '';
    }
    
    // Si es texto simple con formato "nombre: valor"
    const match = valorNuevo.match(/nombre:\s*([^,\n]+)/i);
    if (match) return match[1].trim();
    
    // Si es solo el nombre del archivo
    return valorNuevo;
  } catch {
    return valorNuevo;
  }
}

function extraerDescripcionArchivo(valorNuevo) {
  if (!valorNuevo) return '';
  
  try {
    // Si es JSON
    if (valorNuevo.startsWith('{')) {
      const data = JSON.parse(valorNuevo);
      return data.descripcion || data.description || data.comentario || '';
    }
    
    // Si es texto con formato "descripcion: valor"
    const match = valorNuevo.match(/descripcion:\s*([^,\n]+)/i);
    if (match) return match[1].trim();
    
    return '';
  } catch {
    return '';
  }
}

function extraerFechaVigencia(valorNuevo) {
  if (!valorNuevo) return '';
  
  try {
    // Si es JSON
    if (valorNuevo.startsWith('{')) {
      const data = JSON.parse(valorNuevo);
      return data.fechaVigencia || data.fecha_vigencia || data.vigencia || '';
    }
    
    // Si es texto con formato "fecha_vigencia: valor"
    const match = valorNuevo.match(/fecha_vigencia:\s*([^,\n]+)/i);
    if (match) return match[1].trim();
    
    return '';
  } catch {
    return '';
  }
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  
  try {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return fecha;
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.cumplimientoId) {
    cargarHistorial();
  }
});
</script>

<style scoped>
.historial-container { max-height: 60vh; overflow-y: auto; padding: 0.5rem; }
.historial-item { display: flex; gap: 1rem; }
.historial-icon { color: #818cf8; font-size: 1.5rem; padding-top: 0.25rem; }
.historial-content { flex-grow: 1; border-bottom: 1px solid #374151; padding-bottom: 1rem; }
.historial-item:last-child .historial-content { border-bottom: none; }
.valor-anterior { color: #fca5a5; font-family: monospace; }
.valor-nuevo { color: #86efac; font-family: monospace; }
.historial-meta { font-size: 0.75rem; color: #6b7280; text-align: right; margin-top: 0.5rem; }
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-secondary { background-color: #374151; border: 1px solid #4b5563; color: #d1d5db; }

.archivo-historial {
  background-color: #111827;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.5rem;
  border: 1px solid #374151;
}

.archivo-info-historial {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.archivo-info-historial p {
  margin: 0;
  display: flex;
  align-items: center;
}

.archivo-info-historial i {
  color: #60a5fa;
  width: 1.2rem;
}
</style>