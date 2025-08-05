<template>
  <div v-if="loading" class="text-center p-16 text-gray-400">Cargando detalle del incidente...</div>
  
  <div v-else-if="error" class="text-center p-16 text-red-400">
    <p>Ocurrió un error al cargar el incidente.</p>
    <p class="text-sm">{{ error }}</p>
  </div>

  <div class="layout-detalle" v-else-if="incidente">
    <header class="header-fijo">
      <div class="header-con-navegacion mb-4">
        <button @click="volver" class="btn-volver">
          <i class="ph ph-arrow-left"></i>
          <span>Volver a la Lista de Incidentes</span>
        </button>
      </div>
      
      <div class="header-principal">
        <div>
          <h1 v-if="!enModoEdicion" class="text-3xl font-bold text-white">{{ incidente.Titulo }}</h1>
          <input autocomplete="off" v-else type="text" v-model="incidenteEditable.Titulo" class="input-titulo" />
          <p class="text-gray-400 mt-2">ID: <span class="font-mono">{{ incidente.IDVisible }}</span> | Empresa: <span class="font-semibold text-gray-300">{{ incidente.EmpresaAfectada }}</span></p>
        </div>
        
        <div class="estado-container">
          <span class="label mb-2">Estado del Incidente</span>
          <div v-if="!enModoEdicion" class="estado-incidente" :class="`estado-${incidente.EstadoActual?.toLowerCase().replace(' ', '-')}`">
            {{ incidente.EstadoActual }}
          </div>
          <select autocomplete="off" v-else v-model="incidenteEditable.EstadoActual" class="form-input form-input-sm w-auto">
            <option>Activo</option>
            <option>En Investigación</option>
            <option>Contenido</option>
            <option>Erradicado</option>
            <option>Recuperado</option>
            <option>Cerrado</option>
          </select>
        </div>
      </div>
    </header>

    <main class="contenido-scrollable">
      <div class="contenido-grid">
        <div class="columna-izquierda">
          <div class="card">
            <h2 class="card-titulo">Detalles del Registro</h2>
            <div class="detalles-grid">
              <div>
                  <span class="label">Fecha Detección:</span>
                  <span class="valor">{{ formatarFecha(incidente.FechaDeteccion) }}</span>
              </div>
              <div>
                  <span class="label">Criticidad:</span>
                  <span v-if="!enModoEdicion" class="valor">{{ incidente.Criticidad }}</span>
                  <select autocomplete="off" v-else v-model="incidenteEditable.Criticidad" class="form-input form-input-sm">
                      <option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option>
                  </select>
              </div>
              <div>
                  <span class="label">Responsable:</span>
                  <span v-if="!enModoEdicion" class="valor">{{ incidente.ResponsableCliente || 'No asignado' }}</span>
                  <input autocomplete="off" v-else type="text" v-model="incidenteEditable.ResponsableCliente" class="form-input form-input-sm">
              </div>
              <div>
                  <span class="label">Flujo Propuesto:</span>
                  <span v-if="!enModoEdicion" class="valor">{{ incidente.TipoFlujo }}</span>
                  <select autocomplete="off" v-else v-model="incidenteEditable.TipoFlujo" class="form-input form-input-sm">
                      <option>Informativo</option>
                      <option>Interno</option>
                      <option>ANCI</option>
                  </select>
              </div>
              <div class="detalle-full-width">
                  <span class="label">Sistemas Afectados:</span>
                  <span v-if="!enModoEdicion" class="valor">{{ incidente.SistemasAfectados }}</span>
                  <input autocomplete="off" v-else type="text" v-model="incidenteEditable.SistemasAfectados" class="form-input form-input-sm">
              </div>
              <div class="detalle-full-width">
                  <span class="label">Origen Preliminar:</span>
                  <span v-if="!enModoEdicion" class="valor">{{ incidente.OrigenIncidente }}</span>
                  <input autocomplete="off" v-else type="text" v-model="incidenteEditable.OrigenIncidente" class="form-input form-input-sm">
              </div>
              <div class="detalle-full-width">
                  <span class="label">Acciones Inmediatas:</span>
                  <p v-if="!enModoEdicion" class="valor-parrafo">{{ incidente.AccionesInmediatas }}</p>
                  <textarea autocomplete="off" v-else v-model="incidenteEditable.AccionesInmediatas" class="form-input form-input-sm" rows="3"></textarea>
              </div>
              <div class="detalle-full-width">
                  <span class="label">Descripción Inicial:</span>
                  <p v-if="!enModoEdicion" class="valor-parrafo">{{ incidente.DescripcionInicial }}</p>
                  <textarea autocomplete="off" v-else v-model="incidenteEditable.DescripcionInicial" class="form-input form-input-sm" rows="5"></textarea>
              </div>
            </div>
          </div>

          <div class="card">
            <h2 class="card-titulo">Clasificación de Taxonomía</h2>
            <div class="vinculos-container">
                <span v-if="!incidente.taxonomia || incidente.taxonomia.length === 0" class="tag-vacio">Sin clasificación</span>
                <span v-for="cat in incidente.taxonomia" :key="cat.CategoriaID" class="tag-vinculo">{{ cat.DescripcionCategoria }}</span>
            </div>
          </div>
        </div>

        <div class="columna-derecha">
          <div class="card">
            <h2 class="card-titulo">Bitácora de Novedades (Cronología)</h2>
            <div class="nueva-novedad">
              <textarea autocomplete="off" v-model="nuevaNovedadTexto" placeholder="Añadir una nueva actualización o comentario..." rows="3" class="form-input"></textarea>
              <button @click="anadirNovedad" class="btn btn-secondary w-full mt-2" :disabled="!nuevaNovedadTexto.trim() || submittingNovedad">
                  <span v-if="submittingNovedad">Añadiendo...</span>
                  <span v-else>Añadir Novedad</span>
              </button>
            </div>
            <div class="lista-novedades">
              <div v-if="!incidente.novedades || incidente.novedades.length === 0" class="item-vacio">No hay novedades registradas.</div>
              <div v-for="novedad in incidente.novedades" :key="novedad.NovedadID" class="novedad-item">
                  <p class="novedad-descripcion">{{ novedad.Descripcion }}</p>
                  <div class="novedad-meta">
                      <span>Por: {{ novedad.Usuario }}</span>
                      <span>{{ formatarFecha(novedad.FechaNovedad) }}</span>
                  </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h2 class="card-titulo">Acciones del Incidente</h2>
            <div class="p-4 space-y-4">
               <button @click="abrirModalEvidencia" class="btn btn-primary-outline w-full">
                  <i class="ph ph-folder-open"></i>
                  <span>Administrar Archivos de Evidencia</span>
               </button>
               
               <div v-if="!enModoEdicion">
                  <button @click="activarModoEdicion" class="btn btn-secondary w-full">
                      <i class="ph ph-pencil-simple"></i>
                      <span>Editar Campos del Incidente</span>
                  </button>
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                  <button @click="guardarCambios" class="btn btn-primary" :disabled="guardando">
                      <i class="ph ph-floppy-disk"></i>
                      <span>{{ guardando ? 'Guardando...' : 'Guardar' }}</span>
                  </button>
                  <button @click="cancelarEdicion" class="btn btn-danger-outline">Cancelar</button>
              </div>

              <div class="border-t border-gray-600 pt-4">
                <div v-if="!incidente.ReporteAnciID">
                    <p class="form-sublabel text-center mb-2">Este incidente aún no ha sido escalado a un reporte formal.</p>
                    <button @click="generarReporte" class="btn btn-danger w-full" :disabled="generandoReporte">
                        <i class="ph ph-shield-warning"></i>
                        <span>{{ generandoReporte ? 'Generando...' : 'Generar Reporte ANCI' }}</span>
                    </button>
                </div>
                <div v-else>
                    <p class="form-sublabel text-center mb-2">Ya existe un reporte ANCI para este incidente.</p>
                    <button @click="verReporte" class="btn btn-success w-full">
                        <i class="ph ph-eye"></i>
                        <span>Ver Reporte ANCI</span>
                    </button>
                </div>
              </div>

              <div class="border-t border-gray-600 pt-4">
                <button @click="ejecutarAnalisis" class="btn btn-warning w-full" :disabled="analizando">
                    <i class="ph ph-link-simple-horizontal"></i>
                    <span>{{ analizando ? 'Analizando...' : 'Analizar Consistencia (Regla de Oro)' }}</span>
                </button>
              </div>

            </div>
          </div>

          <HistorialCambios :incidente-id="id" />
        </div>
      </div>
    </main>
  </div>

  <div v-else class="text-center p-16 text-yellow-400">
      <h1 class="text-2xl font-bold mb-4">Incidente no Encontrado</h1>
      <p>No se encontró información para el incidente solicitado.</p>
  </div>
  
  <ModalEvidenciasIncidente
    v-model="mostrandoModalEvidencia"
    :incidente-id="incidenteIdActivo"
    @gestion-finalizada="cargarDetalleIncidente"
  />

  <ModalConsistencia
    v-model="mostrandoModalConsistencia"
    :informe="informeConsistencia"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ModalEvidenciasIncidente from '../components/ModalEvidenciasIncidente.vue';
import HistorialCambios from '../components/HistorialCambios.vue';
import ModalConsistencia from '../components/ModalConsistencia.vue';

const router = useRouter();
const props = defineProps({
  id: { type: [String, Number], required: true }
});

const incidente = ref(null);
const loading = ref(true);
const error = ref(null);
const nuevaNovedadTexto = ref('');
const submittingNovedad = ref(false);
const API_BASE_URL = 'http://localhost:5000/api/admin';
const mostrandoModalEvidencia = ref(false);
const incidenteIdActivo = ref(null);
const enModoEdicion = ref(false);
const incidenteEditable = ref(null);
const guardando = ref(false);
const generandoReporte = ref(false);
const analizando = ref(false);
const mostrandoModalConsistencia = ref(false);
const informeConsistencia = ref(null);

function volver() {
  if (incidente.value && incidente.value.EmpresaID) {
    router.push({ 
      name: 'VistaListaIncidentes', 
      params: { 
        inquilinoId: route.params.inquilinoId,
        empresaId: incidente.value.EmpresaID 
      } 
    });
  } else {
    router.push({ 
      name: 'VistaListaIncidentes', 
      params: { 
        inquilinoId: route.params.inquilinoId,
        empresaId: route.params.empresaId 
      } 
    });
  }
}

function activarModoEdicion() {
  incidenteEditable.value = JSON.parse(JSON.stringify(incidente.value));
  enModoEdicion.value = true;
}

function cancelarEdicion() {
  incidenteEditable.value = null;
  enModoEdicion.value = false;
}

async function guardarCambios() {
  if (!incidenteEditable.value) return;
  guardando.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/incidentes/${props.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidenteEditable.value)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al guardar los cambios.');
    
    alert(result.message);
    enModoEdicion.value = false;
    await cargarDetalleIncidente();
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    guardando.value = false;
  }
}

function abrirModalEvidencia() {
  incidenteIdActivo.value = props.id;
  mostrandoModalEvidencia.value = true;
}

async function generarReporte() {
  if (!confirm('¿Estás seguro de que deseas generar un Reporte ANCI para este incidente? Esta acción iniciará los protocolos y plazos formales.')) {
    return;
  }
  generandoReporte.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/incidentes/${props.id}/generar-reporte-anci`, {
      method: 'POST'
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Ocurrió un error al generar el reporte.');
    }
    alert(result.message);
    await cargarDetalleIncidente();
  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    generandoReporte.value = false;
  }
}

function verReporte() {
  router.push(`/reporte-anci/${incidente.value.ReporteAnciID}`);
}

async function ejecutarAnalisis() {
    analizando.value = true;
    informeConsistencia.value = null; // Limpiamos el informe anterior
    try {
        const response = await fetch(`${API_BASE_URL}/incidentes/${props.id}/analizar-consistencia`, {
            method: 'POST',
        });
        const informe = await response.json();
        if (!response.ok) {
            throw new Error(informe.error || 'Ocurrió un error desconocido durante el análisis.');
        }

        // Guardamos el resultado en nuestra ref y abrimos el modal
        informeConsistencia.value = informe;
        mostrandoModalConsistencia.value = true;

    } catch (err) {
        console.error("Error al ejecutar el análisis:", err);
        alert(err.message);
    } finally {
        analizando.value = false;
    }
}

async function cargarDetalleIncidente() {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/incidente-detalle/${props.id}`);
    if (!response.ok) {
        if(response.status === 404){
            incidente.value = null;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "No se pudo cargar el detalle del incidente.");
        }
    } else {
       incidente.value = await response.json();
    }
  } catch (err) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function anadirNovedad() {
    if (!nuevaNovedadTexto.value.trim()) return;
    submittingNovedad.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/incidentes/${props.id}/novedades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Descripcion: nuevaNovedadTexto.value })
        });
        if (!response.ok) throw new Error("Error al añadir la novedad.");
        nuevaNovedadTexto.value = '';
        await cargarDetalleIncidente();
    } catch (err) {
        console.error(err);
        alert(err.message);
    } finally {
        submittingNovedad.value = false;
    }
}

function formatarFecha(fecha) {
    if (!fecha) return 'N/A';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-CL', opciones);
}

onMounted(cargarDetalleIncidente);
</script>

<style scoped>
.detalle-container { padding: 2rem; }
.header-con-navegacion { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.btn-volver { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #374151; color: #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; transition: background-color 0.2s; cursor: pointer; border: none;}
.btn-volver:hover { background-color: #4b5563; }
.btn-volver i { font-size: 1.25rem; }
.header-principal { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #374151; padding-bottom: 1.5rem; margin-bottom: 2rem; }
.estado-incidente { padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 700; text-transform: uppercase; color: white; }
.estado-activo { background-color: #f97316; }
.estado-en-investigación { background-color: #0ea5e9; }
.estado-contenido { background-color: #a855f7; }
.estado-erradicado { background-color: #10b981; }
.estado-recuperado { background-color: #22c55e; }
.estado-cerrado { background-color: #6b7280; }
.contenido-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.columna-derecha { display: flex; flex-direction: column; gap: 2rem; }
.card { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; }
.card-titulo { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin: 0 0 1.5rem 0; }
.detalles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; row-gap: 1.5rem; }
.detalles-grid > div { display: flex; flex-direction: column; }
.detalles-grid .detalle-full-width { grid-column: 1 / -1; }
.label { font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.25rem; }
.valor { font-size: 0.95rem; color: #e5e7eb; }
.valor-parrafo { font-size: 0.95rem; color: #e5e7eb; white-space: pre-wrap; background-color: #111827; padding: 0.75rem; border-radius: 0.25rem; }
.vinculos-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag-vinculo { background-color: #4f46e5; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.tag-vacio { color: #6b7280; font-style: italic; }
.nueva-novedad { margin-bottom: 1.5rem; }
.form-input { width: 100%; border: 1px solid #4b5563; border-radius: 0.375rem; padding: 0.75rem; background-color: #374151; color: #ffffff; box-sizing: border-box; resize: vertical;}
.form-input-sm { padding: 0.5rem 0.75rem; }
.w-auto { width: auto; }
.btn { font-weight: 600; border: none; cursor: pointer; display: inline-flex; justify-content: center; align-items: center; gap: 0.5rem; transition: background-color 0.2s; padding: 0.75rem 1rem; border-radius: 0.375rem;}
.btn-primary { background-color: #4f46e5; color: white; }
.btn-primary-outline { background-color: transparent; color: #a78bfa; border: 1px solid #4f46e5; }
.btn-primary-outline:hover { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; color: #d1d5db; border: 1px solid #4b5563; }
.btn-danger-outline { background-color: transparent; color: #fca5a5; border: 1px solid #ef4444; }
.btn-danger-outline:hover { background-color: #ef4444; color: white; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.w-full { width: 100%; }
.mt-2 { margin-top: 0.5rem; }
.lista-novedades { max-height: 40vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.novedad-item { background-color: #111827; padding: 1rem; border-radius: 0.5rem; }
.novedad-descripcion { margin: 0 0 0.75rem 0; color: #d1d5db; white-space: pre-wrap; font-size: 0.9rem; }
.novedad-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #6b7280; }
.item-vacio { text-align: center; color: #6b7280; padding: 1rem; }
.input-titulo {
    font-size: 1.875rem;
    line-height: 2.25rem;
    font-weight: 700;
    color: white;
    background-color: #374151;
    border-radius: 0.5rem;
    padding: 0.5rem;
    width: 100%;
    border: 2px solid #4f46e5;
}
.btn-danger { background-color: #ef4444; color: white; }
.btn-danger:hover { background-color: #dc2626; }
.btn-success { background-color: #22c55e; color: white; }
.btn-success:hover { background-color: #16a34a; }
.form-sublabel { font-size: 0.875rem; color: #9ca3af; }
.btn-warning { background-color: #f59e0b; color: white; }
.btn-warning:hover { background-color: #d97706; }
</style>
