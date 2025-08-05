<template>
  <div class="resumen-archivos">
    <div v-if="totalArchivos === 0" class="sin-archivos">
      <div class="sin-archivos-contenido">
        <i class="fa-solid fa-folder-open text-4xl text-gray-500 mb-4"></i>
        <p class="texto-vacio">No hay archivos asociados al incidente</p>
        <small class="texto-ayuda">Los archivos aparecerán aquí a medida que los agregue en cada sección</small>
      </div>
    </div>

    <div v-else class="archivos-por-seccion">
      <!-- Descripción y Alcance -->
      <div v-if="archivosPorSeccion.descripcion_alcance?.length > 0" class="seccion-archivos">
        <h3 class="seccion-titulo">
          <i class="fa-solid fa-file-text"></i>
          Evidencia de Alcance ({{ archivosPorSeccion.descripcion_alcance.length }})
        </h3>
        <div class="archivos-lista">
          <ArchivoItem v-for="archivo in archivosPorSeccion.descripcion_alcance"
                       :key="archivo.id || archivo.nombre"
                       :archivo="archivo"
                       seccion="descripcion_alcance" />
        </div>
      </div>

      <!-- Análisis Preliminar -->
      <div v-if="archivosPorSeccion.analisis_preliminar?.length > 0" class="seccion-archivos">
        <h3 class="seccion-titulo">
          <i class="fa-solid fa-search"></i>
          Evidencia de Análisis ({{ archivosPorSeccion.analisis_preliminar.length }})
        </h3>
        <div class="archivos-lista">
          <ArchivoItem v-for="archivo in archivosPorSeccion.analisis_preliminar"
                       :key="archivo.id || archivo.nombre"
                       :archivo="archivo"
                       seccion="analisis_preliminar" />
        </div>
      </div>

      <!-- Acciones Inmediatas -->
      <div v-if="archivosPorSeccion.acciones_inmediatas?.length > 0" class="seccion-archivos">
        <h3 class="seccion-titulo">
          <i class="fa-solid fa-exclamation-triangle"></i>
          Evidencia de Acciones ({{ archivosPorSeccion.acciones_inmediatas.length }})
        </h3>
        <div class="archivos-lista">
          <ArchivoItem v-for="archivo in archivosPorSeccion.acciones_inmediatas"
                       :key="archivo.id || archivo.nombre"
                       :archivo="archivo"
                       seccion="acciones_inmediatas" />
        </div>
      </div>

      <!-- Documentación Técnica -->
      <div v-if="archivosPorSeccion.documentacion_tecnica?.length > 0" class="seccion-archivos">
        <h3 class="seccion-titulo">
          <i class="fa-solid fa-file-code"></i>
          Documentación Técnica ({{ archivosPorSeccion.documentacion_tecnica.length }})
        </h3>
        <div class="archivos-lista">
          <ArchivoItem v-for="archivo in archivosPorSeccion.documentacion_tecnica"
                       :key="archivo.id || archivo.nombre"
                       :archivo="archivo"
                       seccion="documentacion_tecnica" />
        </div>
      </div>

      <!-- Estadísticas generales -->
      <div class="estadisticas-resumen">
        <div class="stat-card">
          <div class="stat-numero">{{ totalArchivos }}</div>
          <div class="stat-label">Total de Archivos</div>
        </div>
        <div class="stat-card">
          <div class="stat-numero">{{ seccionesConArchivos }}</div>
          <div class="stat-label">Secciones con Evidencia</div>
        </div>
        <div class="stat-card">
          <div class="stat-numero">{{ tamasoTotalMB }}MB</div>
          <div class="stat-label">Tamaño Total</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ArchivoItem from '@/components/ArchivoItem.vue'

// Props
const props = defineProps({
  archivosPorSeccion: {
    type: Object,
    default: () => ({
      descripcion_alcance: [],
      analisis_preliminar: [],
      acciones_inmediatas: [],
      documentacion_tecnica: []
    })
  }
})

// Computed
const totalArchivos = computed(() => {
  return Object.values(props.archivosPorSeccion)
    .reduce((total, archivos) => total + (archivos?.length || 0), 0)
})

const seccionesConArchivos = computed(() => {
  return Object.values(props.archivosPorSeccion)
    .filter(archivos => archivos && archivos.length > 0).length
})

const tamasoTotalMB = computed(() => {
  const totalBytes = Object.values(props.archivosPorSeccion)
    .flat()
    .reduce((total, archivo) => total + (archivo?.tamaño || archivo?.size || 0), 0)
  
  return (totalBytes / (1024 * 1024)).toFixed(1)
})
</script>

<style scoped>
.resumen-archivos {
  @apply space-y-6;
}

.sin-archivos {
  @apply bg-gray-700 rounded-lg p-8;
}

.sin-archivos-contenido {
  @apply text-center;
}

.texto-vacio {
  @apply text-gray-400 text-lg mb-2;
}

.texto-ayuda {
  @apply text-gray-500 text-sm;
}

.archivos-por-seccion {
  @apply space-y-6;
}

.seccion-archivos {
  @apply bg-gray-700 rounded-lg p-4;
}

.seccion-titulo {
  @apply text-lg font-semibold text-white mb-4 flex items-center space-x-2;
}

.archivos-lista {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3;
}

.estadisticas-resumen {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mt-6;
}

.stat-card {
  @apply bg-indigo-600 rounded-lg p-4 text-center;
}

.stat-numero {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-indigo-200 text-sm;
}
</style>