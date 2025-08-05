<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-medium leading-6 text-white">
        <i class="ph ph-link-simple-horizontal mr-2"></i>
        Informe de Consistencia (Regla de Oro)
      </h3>
    </template>
    
    <template #default>
      <div v-if="!informe" class="text-center p-6 text-gray-400">Cargando informe...</div>
      <div v-else class="space-y-6 max-h-[70vh] overflow-y-auto p-1">
        
        <div>
          <h4 class="seccion-titulo text-red-400">
            <i class="ph ph-warning-circle"></i>
            Deficiencias Detectadas ({{ informe.deficiencias_detectadas.length }})
          </h4>
          <div v-if="informe.deficiencias_detectadas.length > 0" class="space-y-4">
            <div v-for="item in informe.deficiencias_detectadas" :key="item.RecomendacionID" class="item-card deficiencia">
              <p class="item-ruta">{{ item.ArticuloNorma }} &rarr; {{ item.NombreVerbo }}</p>
              <p class="item-recomendacion">{{ item.DescripcionRecomendacion }}</p>
              <p class="item-estado">Estado Actual: <span class="font-bold">{{ item.EstadoCumplimiento }}</span></p>
            </div>
          </div>
          <div v-else class="item-vacio">
            <p>¡Excelente! No se encontraron deficiencias de cumplimiento vinculadas a este incidente.</p>
          </div>
        </div>

        <div>
           <h4 class="seccion-titulo text-green-400">
            <i class="ph ph-check-circle"></i>
            Controles Cumplidos ({{ informe.controles_cumplidos.length }})
          </h4>
          <div v-if="informe.controles_cumplidos.length > 0" class="space-y-2">
             <div v-for="item in informe.controles_cumplidos" :key="item.RecomendacionID" class="item-card cumplido">
               <p class="item-ruta-sm">{{ item.ArticuloNorma }} &rarr; {{ item.NombreVerbo }}</p>
               <p class="item-recomendacion-sm">{{ item.DescripcionRecomendacion }}</p>
             </div>
          </div>
           <div v-else class="item-vacio">
            <p>No se encontraron controles cumplidos vinculados a este incidente.</p>
          </div>
        </div>

      </div>
    </template>

    <template #footer>
      <button @click="$emit('update:modelValue', false)" type="button" class="btn btn-secondary">Cerrar</button>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue'; // Asumiendo componente base de modal

defineProps({
  modelValue: { type: Boolean, required: true },
  informe: { type: Object, default: null }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.seccion-titulo {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.item-card {
    padding: 1rem;
    border-radius: 0.5rem;
    border-left-width: 4px;
}
.item-card.deficiencia {
    background-color: #452b2b;
    border-color: #ef4444;
}
.item-card.cumplido {
    background-color: #1c3a2e;
    border-color: #22c55e;
    opacity: 0.7;
}
.item-ruta {
    font-size: 0.8rem;
    color: #9ca3af;
    margin-bottom: 0.25rem;
}
.item-ruta-sm{
    font-size: 0.75rem;
    color: #6b7280;
}
.item-recomendacion {
    font-weight: 500;
    color: #e5e7eb;
}
.item-recomendacion-sm {
    font-size: 0.875rem;
    color: #9ca3af;
}
.item-estado {
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: #fca5a5;
}
.item-vacio {
    padding: 1rem;
    text-align: center;
    color: #6b7280;
    font-style: italic;
    background-color: #2d3748;
    border-radius: 0.5rem;
}
.btn { font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-secondary { background-color: #374151; border: 1px solid #4b5563; color: #d1d5db; }
</style>