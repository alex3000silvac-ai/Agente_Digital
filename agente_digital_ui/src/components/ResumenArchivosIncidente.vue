<template>
  <div class="resumen-archivos-incidente">
    <div v-if="archivos.length === 0" class="sin-archivos">
      <i class="fas fa-folder-open text-4xl text-gray-500 mb-2"></i>
      <p class="text-gray-400">No hay archivos adjuntos en este incidente</p>
    </div>
    
    <div v-else>
      <table class="tabla-resumen">
        <thead>
          <tr>
            <th>Sub Módulo</th>
            <th>Item</th>
            <th>Sección</th>
            <th>Nombre Archivo</th>
            <th>Descripción</th>
            <th>Fecha de Carga</th>
            <th>Opción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="archivo in archivos" :key="archivo.item">
            <td>{{ archivo.submodulo }}</td>
            <td class="font-mono">{{ archivo.item }}</td>
            <td>
              <span class="text-xs">{{ archivo.seccion }}</span>
              <span v-if="archivo.taxonomia" class="text-xs text-blue-400 block">
                {{ archivo.taxonomia }}
              </span>
            </td>
            <td>{{ archivo.nombre }}</td>
            <td>{{ archivo.descripcion || '-' }}</td>
            <td>{{ formatearFecha(archivo.fechaCarga) }}</td>
            <td>
              <button 
                @click.stop.prevent="verArchivo(archivo)" 
                class="btn-ver" 
                type="button"
              >
                <i class="fas fa-eye"></i>
                Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="resumen-stats">
        <span class="stat-item">
          <i class="fas fa-file"></i>
          Total: {{ archivos.length }} archivos
        </span>
        <span class="stat-item">
          <i class="fas fa-hdd"></i>
          Tamaño total: {{ tamañoTotal }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  archivos: {
    type: Array,
    default: () => []
  }
})

const tamañoTotal = computed(() => {
  const bytes = props.archivos.reduce((total, archivo) => {
    return total + (archivo.tamaño || 0)
  }, 0)
  
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

function formatearFecha(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function verArchivo(archivo) {
  console.log('🔍 Ver archivo:', archivo)
  
  // Si el archivo no tiene ID, es nuevo y no se puede visualizar
  if (!archivo.id) {
    alert('Este archivo es nuevo y aún no ha sido guardado. Guarde el incidente para poder visualizarlo.')
    return
  }
  
  try {
    // Usar la URL del backend directamente (puerto 5000)
    const url = `http://localhost:5000/api/incidentes/archivo/${archivo.id}`
    console.log('📎 Abriendo URL:', url)
    
    // Abrir en nueva ventana con todos los parámetros
    const nuevaVentana = window.open(url, '_blank', 'noopener=yes,noreferrer=yes')
    
    // Verificar que se abrió correctamente
    if (!nuevaVentana) {
      alert('No se pudo abrir el archivo. Por favor, permita ventanas emergentes para este sitio.')
    }
  } catch (error) {
    console.error('Error abriendo archivo:', error)
    alert('Error al intentar abrir el archivo')
  }
}
</script>

<style scoped>
.resumen-archivos-incidente {
  @apply bg-gray-700 rounded-lg p-4;
}

.sin-archivos {
  @apply text-center py-8;
}

.tabla-resumen {
  @apply w-full text-sm;
}

.tabla-resumen th {
  @apply text-left p-2 bg-gray-800 text-gray-300 font-medium;
}

.tabla-resumen td {
  @apply p-2 border-t border-gray-600;
}

.tabla-resumen tr:hover {
  @apply bg-gray-600;
}

.btn-ver {
  @apply px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors;
}

.resumen-stats {
  @apply mt-4 pt-4 border-t border-gray-600 flex justify-between text-sm text-gray-400;
}

.stat-item {
  @apply flex items-center space-x-2;
}
</style>