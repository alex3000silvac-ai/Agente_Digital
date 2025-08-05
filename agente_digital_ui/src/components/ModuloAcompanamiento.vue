<template>
  <div class="card-dark">
    <div class="header-con-navegacion">
       <button v-if="vieneDeInforme" @click="volverAInforme" class="btn-volver">
          <i class="ph ph-file-text"></i>
          <span>Volver al Informe</span>
       </button>
       <button v-else @click="volverAEmpresas" class="btn-volver">
        <i class="ph ph-arrow-left"></i>
        <span>Volver a Empresas</span>
      </button>
      <h2 class="text-xl font-bold text-white">Módulo de Acompañamiento Normativo para Cumplimiento Ley Ciberseguridad 21663</h2>
    </div>

    <div v-if="loading" class="text-center p-8 text-gray-400">Cargando plan de acompañamiento...</div>
    <div v-else-if="error" class="error-banner"><strong>Error:</strong> {{ error }}</div>
    
    <div v-else-if="planAcompanamiento.length > 0" class="mt-6 space-y-2">
      <div v-for="obligacion in planAcompanamiento" :key="obligacion.ObligacionID" class="accordion-item" :data-obligacion-id="obligacion.ObligacionID">
        
        <button 
          @click="toggleAcordeon(obligacion.ObligacionID)" 
          class="accordion-header"
          :aria-expanded="acordeonesAbiertos.has(obligacion.ObligacionID)"
        >
          <span class="header-text">
            <span class="article-reference">{{ obligacion.ArticuloNorma }}</span>
            <span class="description-text">{{ obligacion.Descripcion }}</span>
          </span>
          <i class="ph ph-caret-down accordion-caret" :class="{ 'open': acordeonesAbiertos.has(obligacion.ObligacionID) }"></i>
        </button>
        
        <Transition name="accordion-fade">
          <div v-show="acordeonesAbiertos.has(obligacion.ObligacionID)" class="accordion-content">
            
            <div class="content-section">
              <h3 class="section-title">Datos de Gestión</h3>
              <div class="form-grid">
                <div><label class="form-label">Estado</label><select autocomplete="off" v-model="obligacion.Estado" class="form-input"><option>Pendiente</option><option>En Proceso</option><option>Implementado</option><option>No Aplica</option></select></div>
                <div><label class="form-label">% Avance</label><input autocomplete="off" type="number" v-model.number="obligacion.PorcentajeAvance" min="0" max="100" class="form-input"></div>
                <div><label class="form-label">Responsable</label><input autocomplete="off" type="text" v-model="obligacion.Responsable" class="form-input" placeholder="Nombre o área"></div>
                <div><label class="form-label">Fecha Término</label><input autocomplete="off" type="date" :value="formatDateForInput(obligacion.FechaTermino)" @input="obligacion.FechaTermino = $event.target.value" class="form-input"></div>
              </div>
            </div>
            
            <div class="content-section">
              <h3 class="section-title">Información Adicional</h3>
              <div>
                <label class="form-label-info">Medio de Verificación Sugerido:</label>
                <p class="form-value-info">{{ obligacion.MedioDeVerificacionSugerido || 'No especificado.' }}</p>
              </div>
            </div>

            <div class="content-section">
              <h3 class="section-title">Observaciones</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label class="form-label">Observaciones Ciberseguridad</label><textarea autocomplete="off" v-model="obligacion.ObservacionesCiberseguridad" class="form-input" rows="3"></textarea></div>
                <div><label class="form-label">Observaciones Legales</label><textarea autocomplete="off" v-model="obligacion.ObservacionesLegales" class="form-input" rows="3"></textarea></div>
              </div>
            </div>

            <!-- Sección de Evidencias Compacta -->
            <div class="content-section evidencias-full-width" v-if="obligacion.CumplimientoID">
              <!-- Caja de Información de Evidencias -->
              <div class="evidencias-box">
                  <!-- Header con estadísticas -->
                  <div class="evidencias-header">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <h3>
                        <i class="ph ph-folder-open" style="color: #60a5fa;"></i>
                        Evidencias de Respaldo
                      </h3>
                      <div class="evidencias-stats" v-if="obligacion.evidenciasStats">
                        <span class="stat-badge vigente"><i class="ph ph-check"></i> {{ obligacion.evidenciasStats.vigentes || 0 }}</span>
                        <span class="stat-badge por-vencer"><i class="ph ph-clock"></i> {{ obligacion.evidenciasStats.por_vencer || 0 }}</span>
                        <span class="stat-badge vencido"><i class="ph ph-warning"></i> {{ obligacion.evidenciasStats.vencidos || 0 }}</span>
                      </div>
                      <div v-else style="font-size: 0.75rem; color: #9ca3af;">Sin evidencias</div>
                    </div>
                  </div>

                  <!-- Lista compacta de archivos -->
                  <div class="evidencias-list" v-if="obligacion.evidenciasResumen && obligacion.evidenciasResumen.length > 0">
                    <div 
                      v-for="evidencia in obligacion.evidenciasResumen" 
                      :key="evidencia.id"
                      class="evidencia-item"
                    >
                      <div class="evidencia-content" @click="mostrarPreviewEvidencia(evidencia)">
                        <div class="evidencia-info">
                          <i :class="getIconoArchivo(evidencia.tipo_icono)" class="evidencia-icon"></i>
                          <div class="evidencia-details">
                            <div class="evidencia-name-line">
                              <span class="evidencia-name">{{ evidencia.nombre }}</span>
                              <span class="evidencia-version">v{{ evidencia.version }}</span>
                              <span v-if="evidencia.descripcion" class="evidencia-comentario">"{{ evidencia.descripcion }}"</span>
                              <span class="evidencia-fecha">{{ evidencia.fecha_formateada || formatDateTime(evidencia.fecha_subida) }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="evidencia-status">
                          <span :class="getColorVigencia(evidencia.estado)" class="evidencia-vigencia">{{ evidencia.vigencia }}</span>
                          <i :class="getIconoEstado(evidencia.estado)" style="font-size: 0.75rem;"></i>
                        </div>
                      </div>
                      <div class="evidencia-actions">
                        <button 
                          @click.stop="editarComentarioEvidencia(evidencia, obligacion)"
                          class="btn-editar-evidencia"
                          title="Editar comentario"
                        >
                          <i class="ph ph-pencil"></i>
                        </button>
                        <button 
                          @click.stop="eliminarEvidencia(evidencia, obligacion)"
                          class="btn-eliminar-evidencia"
                          title="Eliminar evidencia y comentarios"
                        >
                          <i class="ph ph-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Mensaje cuando no hay evidencias -->
                  <div v-else class="evidencias-empty">
                    No hay evidencias cargadas
                  </div>

                  <!-- Footer con acción - oculto cuando hay evidencias -->
                  <div class="evidencias-footer" v-if="!obligacion.evidenciasStats || obligacion.evidenciasStats.total === 0">
                    <button @click="abrirModalEvidencias(obligacion)">
                      Subir primera evidencia <i class="ph ph-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            
            <div class="form-actions">
              <button @click="abrirModalHistorial(obligacion)" class="btn btn-secondary"><i class="ph ph-clock-counter-clockwise"></i> Ver Historial</button>
              <button @click="abrirModalEvidencias(obligacion)" class="btn btn-secondary"><i class="ph ph-paperclip"></i> Evidencias</button>
              <button @click="guardarCumplimiento(obligacion)" class="btn btn-primary" :disabled="obligacion.guardando"><span v-if="obligacion.guardando">Guardando...</span><span v-else>Guardar Cambios</span></button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <div v-else class="text-center p-8 text-gray-400">No se encontraron obligaciones aplicables para esta empresa.</div>
  </div>

  <ModalEvidencias 
    v-model="modalEvidencias.visible" 
    :cumplimiento-id="modalEvidencias.cumplimientoId" 
    @gestion-finalizada="onEvidenciasActualizadas" 
  />
  <ModalHistorial v-model="modalHistorial.visible" :cumplimiento-id="modalHistorial.cumplimientoId" />
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '../services/api.js';
import ModalEvidencias from './ModalEvidencias.vue';
import ModalHistorial from './ModalHistorial.vue';

const props = defineProps({
    empresaId: { type: [String, Number], required: true },
    inquilinoId: { type: [String, Number], required: true }
});

const router = useRouter();
const route = useRoute(); // Obtenemos la ruta activa para leer los query params

const planAcompanamiento = ref([]);
const loading = ref(true);
const error = ref(null);
const acordeonesAbiertos = reactive(new Set());

const modalEvidencias = reactive({ visible: false, cumplimientoId: null, obligacionActual: null });
const modalHistorial = reactive({ visible: false, cumplimientoId: null });

// Verificamos si venimos desde el informe (si existe el query param 'open')
const vieneDeInforme = computed(() => !!route.query.open);

async function cargarPlanAcompanamiento() {
    loading.value = true;
    error.value = null;
    try {
        const response = await apiClient.get(`/admin/empresas/${props.empresaId}/acompanamiento`);
        // REVERTIDO: Ahora el backend envía un array de obligaciones directamente
        planAcompanamiento.value = response.data.map(item => ({ ...item, guardando: false }));
        
        // Manejar filtros específicos desde el dashboard
        handleDashboardFilter();
        
        // Después de cargar, abrimos el acordeón si la URL nos lo indica
        if (route.query.open) {
            acordeonesAbiertos.add(route.query.open);
        }
    } catch (err) {
        error.value = "No se pudo cargar el plan. Verifique la conexión con el backend.";
        console.error("Error cargando el plan:", err);
    } finally {
        loading.value = false;
    }
}

function handleDashboardFilter() {
    const filtro = route.query.filtro;
    const estado = route.query.estado;
    
    console.log('🎯 Manejando filtro del dashboard:', { filtro, estado });
    
    if (!filtro) return;
    
    // Cerrar todos los acordeones primero
    acordeonesAbiertos.clear();
    
    // Filtrar y abrir acordeones según el filtro específico
    const obligacionesAAbrir = [];
    
    switch (filtro) {
        case 'total':
            // Abrir todos los acordeones
            planAcompanamiento.value.forEach(obligacion => {
                obligacionesAAbrir.push(obligacion.ObligacionID);
            });
            break;
            
        case 'cumplidas':
            // Solo abrir acordeones de obligaciones implementadas
            planAcompanamiento.value
                .filter(obligacion => obligacion.Estado === 'Implementado')
                .forEach(obligacion => {
                    obligacionesAAbrir.push(obligacion.ObligacionID);
                });
            break;
            
        case 'proceso':
            // Solo abrir acordeones de obligaciones en proceso
            planAcompanamiento.value
                .filter(obligacion => obligacion.Estado === 'En Proceso')
                .forEach(obligacion => {
                    obligacionesAAbrir.push(obligacion.ObligacionID);
                });
            break;
            
        case 'pendientes':
            // Abrir acordeones de obligaciones pendientes y vencidas
            const estadosPendientes = estado ? estado.split(',') : ['Pendiente', 'Vencido'];
            planAcompanamiento.value
                .filter(obligacion => {
                    // Considerar pendientes si no tienen estado definido o si están en la lista
                    const estadoObligacion = obligacion.Estado || 'Pendiente';
                    return estadosPendientes.includes(estadoObligacion) || 
                           (!obligacion.Estado && estadosPendientes.includes('Pendiente'));
                })
                .forEach(obligacion => {
                    obligacionesAAbrir.push(obligacion.ObligacionID);
                });
            break;
    }
    
    // Abrir los acordeones filtrados con un pequeño delay para mejor UX
    setTimeout(() => {
        obligacionesAAbrir.forEach(id => {
            acordeonesAbiertos.add(id);
        });
        
        // Scroll al primer elemento abierto si hay alguno
        if (obligacionesAAbrir.length > 0) {
            const primerElemento = document.querySelector(`[data-obligacion-id="${obligacionesAAbrir[0]}"]`);
            if (primerElemento) {
                primerElemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        console.log(`✅ Abiertos ${obligacionesAAbrir.length} acordeones para filtro "${filtro}"`);
    }, 300);
}

async function guardarCumplimiento(obligacion) {
    obligacion.guardando = true;
    const payload = {
        EmpresaID: props.empresaId, 
        ObligacionID: obligacion.ObligacionID,
        Estado: obligacion.Estado, 
        PorcentajeAvance: obligacion.PorcentajeAvance,
        Responsable: obligacion.Responsable, 
        FechaTermino: obligacion.FechaTermino || null,
        ObservacionesCiberseguridad: obligacion.ObservacionesCiberseguridad,
        ObservacionesLegales: obligacion.ObservacionesLegales,
    };
    
    try {
        console.log(`💾 Guardando cumplimiento:`, payload);
        let response;
        
        if (obligacion.CumplimientoID) {
            console.log(`📝 Actualizando cumplimiento existente: ${obligacion.CumplimientoID}`);
            try {
                response = await apiClient.put(`/admin/cumplimiento/${obligacion.CumplimientoID}`, payload);
            } catch (err) {
                console.log('⚠️ Endpoint principal falló, usando temporal...');
                response = await apiClient.put(`/admin/cumplimiento-temp/${obligacion.CumplimientoID}`, payload);
            }
        } else {
            console.log(`✨ Creando nuevo cumplimiento`);
            try {
                response = await apiClient.post(`/admin/cumplimiento`, payload);
            } catch (err) {
                console.log('⚠️ Endpoint principal falló, usando temporal...');
                response = await apiClient.post(`/admin/cumplimiento-temp`, payload);
            }
            
            if (response.data && response.data.CumplimientoID) {
                obligacion.CumplimientoID = response.data.CumplimientoID;
                console.log(`✅ Cumplimiento creado con ID: ${obligacion.CumplimientoID}`);
            }
        }
        
        const mensaje = response.data?.message || 'Cambios guardados exitosamente';
        alert(mensaje);
        console.log(`✅ Guardado exitoso: ${mensaje}`);
        
        // Crear entrada en historial si el guardado fue exitoso
        if (obligacion.CumplimientoID) {
            await crearRegistroHistorial(obligacion, payload);
            // Recargar evidencias después de guardar para reflejar cualquier cambio
            await cargarEvidenciasResumen(obligacion);
        }
        
    } catch (err) {
        console.error("❌ Error en guardarCumplimiento:", err);
        
        let mensajeError = 'Ocurrió un error al guardar los cambios.';
        if (err.response?.data?.error) {
            mensajeError += ` Detalle: ${err.response.data.error}`;
        } else if (err.message) {
            mensajeError += ` Detalle: ${err.message}`;
        }
        
        alert(mensajeError);
    } finally {
        obligacion.guardando = false;
    }
}

// Función auxiliar para crear registro de historial
async function crearRegistroHistorial(obligacion, payload) {
    try {
        // Comparar valores actuales con los guardados para crear historial
        const cambios = [];
        Object.keys(payload).forEach(key => {
            if (key !== 'EmpresaID' && key !== 'ObligacionID') {
                cambios.push({
                    campo: key,
                    valorNuevo: payload[key]
                });
            }
        });
        
        console.log(`📋 Registrando ${cambios.length} cambios en historial`);
    } catch (err) {
        console.error('❌ Error creando historial:', err);
        // No mostrar error al usuario, es solo logging
    }
}

function abrirModalEvidencias(obligacion) {
    if (!obligacion.CumplimientoID) {
        alert("Debes guardar al menos una vez este ítem antes de poder adjuntar evidencias.");
        return;
    }
    modalEvidencias.cumplimientoId = Number(obligacion.CumplimientoID);
    modalEvidencias.obligacionActual = obligacion; // Guardar referencia a la obligación actual
    modalEvidencias.visible = true;
}

// Función para actualizar evidencias cuando se cierra el modal
async function onEvidenciasActualizadas() {
    console.log('📋 Actualizando evidencias después de gestión en modal');
    if (modalEvidencias.obligacionActual) {
        await cargarEvidenciasResumen(modalEvidencias.obligacionActual);
    }
}

function abrirModalHistorial(obligacion) {
    if (!obligacion.CumplimientoID) {
        alert("No hay historial para un ítem que nunca ha sido guardado.");
        return;
    }
    modalHistorial.cumplimientoId = obligacion.CumplimientoID;
    modalHistorial.visible = true;
}

function volverAEmpresas() {
  router.push({ name: 'VistaEmpresas', params: { inquilinoId: props.inquilinoId } });
}

function volverAInforme() {
    router.push({ 
        name: 'InformeCumplimiento', 
        params: { inquilinoId: props.inquilinoId, empresaId: props.empresaId } 
    });
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('es-CL', options);
}

// Funciones para evidencias
async function cargarEvidenciasResumen(obligacion) {
    if (!obligacion.CumplimientoID) return;
    
    try {
        const response = await apiClient.get(`/admin/cumplimiento/${obligacion.CumplimientoID}/evidencias/resumen`);
        if (response.data) {
            obligacion.evidenciasResumen = response.data.evidencias;
            obligacion.evidenciasStats = response.data.estadisticas;
        }
    } catch (error) {
        console.error('Error cargando evidencias resumen:', error);
        obligacion.evidenciasResumen = [];
        obligacion.evidenciasStats = null;
    }
}

function getIconoArchivo(tipoIcono) {
    const iconos = {
        'pdf': 'ph ph-file-pdf text-red-400',
        'excel': 'ph ph-file-xls text-green-400',
        'word': 'ph ph-file-doc text-blue-400',
        'imagen': 'ph ph-file-image text-purple-400',
        'archivo': 'ph ph-file text-gray-400'
    };
    return iconos[tipoIcono] || iconos.archivo;
}

function getColorVigencia(estado) {
    const colores = {
        'Vigente': 'text-green-400',
        'Por vencer': 'text-yellow-400',
        'Vencido': 'text-red-400'
    };
    return colores[estado] || 'text-gray-400';
}

function getIconoEstado(estado) {
    const iconos = {
        'Vigente': 'ph ph-circle-fill text-green-400',
        'Por vencer': 'ph ph-circle-fill text-yellow-400',
        'Vencido': 'ph ph-circle-fill text-red-400'
    };
    return iconos[estado] || 'ph ph-circle text-gray-400';
}

async function mostrarPreviewEvidencia(evidencia) {
    console.log('🔍 mostrarPreviewEvidencia llamada para:', evidencia);
    const token = localStorage.getItem('token');
    const fileExt = evidencia.nombre.split('.').pop().toLowerCase();
    
    try {
        // Para PDFs e imágenes, abrir en nueva pestaña
        if (['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
            console.log('🖼️ Procesando imagen/PDF desde servidor');
            
            // Intentar primero con autenticación
            let response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Si falla, usar endpoint temporal
            if (!response.ok) {
                console.log('⚠️ Autenticación falló, usando endpoint temporal');
                response = await fetch(`http://localhost:5000/api/admin/evidencia-temp/${evidencia.id}`);
            }
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                
                // Limpiar el URL después de un tiempo
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            } else {
                const errorText = await response.text();
                console.error('❌ Error en respuesta:', errorText);
                alert('No se pudo visualizar el archivo: ' + errorText);
            }
        } else {
            console.log('📄 Procesando descarga desde servidor');
            
            // Intentar descarga con autenticación
            let response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.id}?download=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Si falla, usar endpoint temporal
            if (!response.ok) {
                console.log('⚠️ Autenticación falló, usando endpoint temporal');
                response = await fetch(`http://localhost:5000/api/admin/evidencia-temp/${evidencia.id}?download=true`);
            }
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = evidencia.nombre;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                const errorText = await response.text();
                console.error('❌ Error en descarga:', errorText);
                alert('No se pudo descargar el archivo: ' + errorText);
            }
        }
    } catch (error) {
        console.error('❌ Error visualizando evidencia:', error);
        alert('Error al visualizar el archivo: ' + error.message);
    }
}

// Editar comentario de evidencia
async function editarComentarioEvidencia(evidencia, obligacion) {
    const nuevoComentario = prompt('Editar comentario de la evidencia:', evidencia.descripcion || '');
    
    if (nuevoComentario === null) return; // Usuario canceló
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.id}/comentario`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descripcion: nuevoComentario })
        });
        
        if (response.ok) {
            console.log('✅ Comentario actualizado exitosamente');
            
            // Actualizar la lista de evidencias
            await cargarEvidenciasResumen(obligacion);
            
            // Mostrar mensaje de éxito
            alert('Comentario actualizado exitosamente');
        } else {
            const errorData = await response.json();
            console.error('❌ Error actualizando comentario:', errorData);
            alert(`Error al actualizar el comentario: ${errorData.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('❌ Error actualizando comentario:', error);
        alert('Error al actualizar el comentario: ' + error.message);
    }
}

// Eliminar evidencia con confirmación
async function eliminarEvidencia(evidencia, obligacion) {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la evidencia "${evidencia.nombre}" y todos sus comentarios?\n\nEsta acción no se puede deshacer.`);
    
    if (!confirmacion) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/evidencia/${evidencia.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Evidencia eliminada exitosamente');
            
            // Actualizar la lista de evidencias
            await cargarEvidenciasResumen(obligacion);
            
            // Mostrar mensaje de éxito
            alert('Evidencia eliminada exitosamente');
        } else {
            const errorData = await response.json();
            console.error('❌ Error eliminando evidencia:', errorData);
            alert(`Error al eliminar la evidencia: ${errorData.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('❌ Error eliminando evidencia:', error);
        alert('Error al eliminar la evidencia: ' + error.message);
    }
}

// Cargar evidencias cuando se abre un acordeón
function toggleAcordeon(obligacionId) {
    if (acordeonesAbiertos.has(obligacionId)) {
        acordeonesAbiertos.delete(obligacionId);
    } else {
        acordeonesAbiertos.add(obligacionId);
        
        // Cargar evidencias cuando se abre el acordeón
        const obligacion = planAcompanamiento.value.find(o => o.ObligacionID === obligacionId);
        if (obligacion && obligacion.CumplimientoID) {
            cargarEvidenciasResumen(obligacion);
        }
    }
}

onMounted(cargarPlanAcompanamiento);
</script>

<style scoped>
.card-dark { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; }
.header-con-navegacion { display: flex; align-items: center; gap: 1.5rem; border-bottom: 1px solid #374151; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.btn-volver { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #374151; color: #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; cursor: pointer; border: none; }
.btn-volver:hover { background-color: #4b5563; }
.accordion-item {
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background-color: #1f2937;
  transition: background-color 0.2s;
}
.accordion-header { 
  width: 100%; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  text-align: left; 
  padding: 1rem 1.5rem; 
  cursor: pointer;
  background-color: #2d3748;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}
.accordion-header:hover { background-color: #374151; }
.accordion-header[aria-expanded="true"] {
  background-color: #1e293b;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 1px solid #4f46e5;
}
.header-text { display: flex; flex-direction: column; gap: 0.25rem; }
.article-reference { font-size: 0.8rem; font-weight: 700; color: #93c5fd; text-transform: uppercase; }
.description-text { color: #d1d5db; font-weight: 500; }
.accordion-caret { transition: transform 0.3s ease-in-out; }
.accordion-caret.open { transform: rotate(180deg); }
.accordion-content { 
  padding: 1.5rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
  background-color: #111827;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
.accordion-fade-enter-active, .accordion-fade-leave-active {
  transition: all 0.3s ease-out;
  max-height: 1000px;
  opacity: 1;
}
.accordion-fade-enter-from, .accordion-fade-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
}
.content-section { padding-top: 1rem; border-top: 1px solid #374151; }
.content-section:first-child { padding-top: 0; border-top: none; }
.section-title { font-size: 0.875rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; margin-bottom: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
.form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #9ca3af; font-size: 0.875rem; }
.form-input { width: 100%; background-color: #374151; border: 1px solid #4b5563; color: white; padding: 0.75rem 1rem; border-radius: 0.375rem; }
.form-label-info { font-size: 0.8rem; text-transform: uppercase; color: #6b7280; margin-bottom: 0.25rem; display: block; }
.form-value-info { color: #d1d5db; font-size: 0.9rem; line-height: 1.6; }
.form-actions { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.btn { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; padding: 0.6rem 1.2rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-primary { background-color: #4f46e5; color: white; }
.btn-secondary { background-color: #374151; color: #d1d5db; border: 1px solid #4b5563; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.error-banner { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 1rem; border-radius: 0.5rem; border: 1px solid #ef4444; }

/* Estilos para la caja de evidencias elegante */
.evidencias-box {
  background-color: rgba(31, 41, 55, 0.5);
  border: 1px solid #4b5563;
  border-radius: 0.5rem;
  overflow: hidden;
  min-width: 340px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.evidencias-header {
  background-color: #1f2937;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #4b5563;
}

.evidencias-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.evidencias-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.stat-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.stat-badge.vigente {
  background-color: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.stat-badge.por-vencer {
  background-color: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stat-badge.vencido {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.evidencias-list {
  max-height: 8rem;
  overflow-y: auto;
  background-color: #111827;
}

.evidencias-list::-webkit-scrollbar {
  width: 6px;
}

.evidencias-list::-webkit-scrollbar-track {
  background: #1f2937;
}

.evidencias-list::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.evidencias-list::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.evidencia-item {
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

.evidencia-item:hover {
  background-color: rgba(75, 85, 99, 0.3);
}

.evidencia-content {
  flex: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.evidencia-actions {
  margin-left: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.btn-editar-evidencia {
  background-color: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-editar-evidencia:hover {
  background-color: rgba(96, 165, 250, 0.2);
  border-color: rgba(96, 165, 250, 0.5);
}

.btn-eliminar-evidencia {
  background-color: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-eliminar-evidencia:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.evidencia-item:last-child {
  border-bottom: none;
}

.evidencia-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.evidencia-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.evidencia-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.evidencia-details {
  min-width: 0;
  flex: 1;
}

.evidencia-name-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.evidencia-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e7eb;
}

.evidencia-version {
  font-size: 0.75rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.evidencia-comentario {
  font-size: 0.75rem;
  color: #d1d5db;
  font-style: italic;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
}

.evidencia-fecha {
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: auto;
}

.evidencia-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.evidencia-vigencia {
  font-size: 0.75rem;
}

.evidencias-empty {
  padding: 0.75rem 1rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  background-color: #111827;
}

.evidencias-footer {
  background-color: #1f2937;
  padding: 0.5rem 1rem;
  text-align: center;
  border-top: 1px solid #4b5563;
}

.evidencias-footer button {
  font-size: 0.75rem;
  font-weight: 500;
  color: #60a5fa;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.evidencias-footer button:hover {
  color: #93bbfc;
}

/* Evidencias a ancho completo */
.evidencias-full-width {
  width: 100%;
  max-width: 100%;
}

.evidencias-full-width .evidencias-box {
  width: 100%;
  background: #1f2937;
  border-radius: 0.5rem;
  border: 1px solid #374151;
  overflow: hidden;
}

.evidencias-full-width .evidencia-name-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}
</style>