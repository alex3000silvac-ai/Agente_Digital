<template>
  <div class="card-dark">
    <h2 class="card-header-dark">Empresas Gestionadas</h2>
    
    <div v-if="loading" class="p-8 text-center text-gray-400">Cargando empresas...</div>
    <div v-else-if="error" class="p-8 text-center text-red-400">Error: {{ error }}</div>
    
    <div v-else-if="empresas.length > 0" class="overflow-x-auto">
      <table class="data-table-dark">
        <thead>
          <tr>
            <th>Razón Social</th><th>RUT</th><th>Tipo</th><th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empresa in empresas" :key="empresa.EmpresaID">
            <td class="font-semibold text-white">{{ empresa.RazonSocial }}</td>
            <td>{{ empresa.RUT }}</td>
            <td><span class="badge" :class="getBadgeClass(empresa.TipoEmpresa)">{{ empresa.TipoEmpresa }}</span></td>
            <td class="flex justify-end items-center gap-2">
              <button @click="$emit('modificar-empresa', empresa)" class="btn-secondary">Modificar</button>
              <button @click="eliminarEmpresa(empresa.EmpresaID)" class="btn-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="p-8 text-center text-gray-400">No se encontraron empresas para este inquilino.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, defineExpose } from 'vue';
const props = defineProps({ inquilinoId: { type: Number, required: true } });
const emit = defineEmits(['modificar-empresa']);
const empresas = ref([]);
const loading = ref(true);
const error = ref(null);

async function cargarEmpresas() {
    loading.value = true;
    error.value = null; // Limpiamos errores previos
    try {
        const response = await fetch(`http://localhost:5000/api/admin/inquilinos/${props.inquilinoId}/empresas`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Error al obtener las empresas');
        }
        empresas.value = await response.json();
    } catch (e) { error.value = e.message; } finally { loading.value = false; }
}

onMounted(cargarEmpresas);

async function eliminarEmpresa(empresaId) {
  if (window.confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/empresas/${empresaId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error en la API al eliminar');
      alert('Empresa eliminada con éxito.');
      cargarEmpresas();
    } catch (e) { alert(`Error: ${e.message}`); }
  }
}
const getBadgeClass = (tipo) => {
    if (tipo === 'OIV') return 'badge-oiv';
    if (tipo === 'PSE') return 'badge-pse';
    return 'badge-btd';
};

// --- CORRECCIÓN CLAVE ---
// 'defineExpose' hace que la función 'cargarEmpresas' sea accesible
// desde el componente padre a través de una referencia (ref).
defineExpose({
  cargarEmpresas
});
</script>

<style scoped>
/* Estilos (sin cambios visuales) */
.card-dark { background-color: #1f2937; border-radius: 0.5rem; padding: 1.5rem; }
.card-header-dark { font-size: 1.25rem; font-weight: 700; color: #ffffff; border-bottom: 1px solid #374151; padding-bottom: 1rem; margin-bottom: 1rem; }
.data-table-dark { width: 100%; }
.data-table-dark th { padding: 0.75rem 1rem; text-transform: uppercase; font-size: 0.75rem; color: #9ca3af; }
.data-table-dark td { padding: 0.75rem 1rem; border-top: 1px solid #374151; }
.btn-secondary { background-color: #374151; color: #d1d5db; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; }
.btn-danger { background-color: #be123c; color: white; font-weight: 600; padding: 0.5rem 1rem; border-radius: 0.375rem; }
.badge { padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
.badge-oiv { background-color: #991b1b; color: #fecaca; }
.badge-pse { background-color: #1e40af; color: #dbeafe; }
.badge-btd { background-color: #581c87; color: #f3e8ff; }
</style>