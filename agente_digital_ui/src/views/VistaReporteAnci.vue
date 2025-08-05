<template>
  <div v-if="loading" class="text-center p-16 text-gray-400">Cargando reporte...</div>
  <div v-else-if="error" class="text-center p-16 text-red-400">{{ error }}</div>
  
  <div v-else-if="reporte" class="vista-reporte-anci">
    <header class="header-fijo">
        <div class="header-con-navegacion mb-4">
            <button @click="volver" class="btn-volver">
                <i class="ph ph-arrow-left"></i>
                <span>Volver al Detalle del Incidente</span>
            </button>
        </div>
        <div class="header-principal">
            <div>
                <h1 class="text-3xl font-bold text-white">Reporte Formal a la ANCI</h1>
                <p class="text-gray-400 mt-2">Incidente Origen: <span class="font-semibold">{{ reporte.IncidenteTitulo }} ({{ reporte.IncidenteIDVisible }})</span></p>
            </div>
            <button @click="guardarProgreso" class="btn btn-primary" :disabled="guardando">
                <i class="ph ph-floppy-disk"></i>
                <span>{{ guardando ? 'Guardando...' : 'Guardar Progreso' }}</span>
            </button>
        </div>
    </header>
    
    <main class="contenido-scrollable">
        <div class="reporte-grid">
            <aside class="timeline-nav">
                <div class="p-4 mb-4 bg-gray-800 rounded-lg">
                    <span class="text-sm text-gray-400 block">Inicio del Reporte (Etapa 1)</span>
                    <span class="font-semibold text-white">{{ formatarFecha(reporte.AnciFechaAlertaTemprana) }}</span>
                </div>
                <ul>
                    <li @click="pasoActivo = 1" :class="{ 'active': pasoActivo === 1, 'completed': etapa1Completa }">
                        <div class="timeline-marker"><i class="ph" :class="etapa1Completa ? 'ph-check-circle' : 'ph-clock'"></i></div>
                        <div class="timeline-content">
                            <span class="font-semibold">Etapa 1: Alerta Temprana</span>
                            <span class="text-xs text-indigo-400">Plazo Vence: {{ formatarFecha(plazoEtapa1) }}</span>
                            <span class="text-xs font-mono" :class="tiempoVencido(plazoEtapa1) ? 'text-red-400' : 'text-gray-400'">{{ tiempoRestante1 }}</span>
                        </div>
                    </li>
                    <li @click="pasoActivo = 2" :class="{ 'active': pasoActivo === 2, 'completed': etapa2Completa }">
                        <div class="timeline-marker"><i class="ph" :class="etapa2Completa ? 'ph-check-circle' : 'ph-clock'"></i></div>
                        <div class="timeline-content">
                            <span class="font-semibold">Etapa 2: Segunda Notificación</span>
                            <span class="text-xs text-indigo-400">Plazo Vence: {{ formatarFecha(plazoEtapa2) }}</span>
                            <span class="text-xs font-mono" :class="tiempoVencido(plazoEtapa2) ? 'text-red-400' : 'text-gray-400'">{{ tiempoRestante2 }}</span>
                        </div>
                    </li>
                    <li @click="pasoActivo = 3" :class="{ 'active': pasoActivo === 3, 'completed': etapa3Completa }">
                        <div class="timeline-marker"><i class="ph" :class="etapa3Completa ? 'ph-check-circle' : 'ph-clock'"></i></div>
                        <div class="timeline-content">
                            <span class="font-semibold">Etapa 3: Informe Final</span>
                            <span class="text-xs text-indigo-400">Plazo Vence: {{ formatarFecha(plazoEtapa3) }}</span>
                            <span class="text-xs font-mono" :class="tiempoVencido(plazoEtapa3) ? 'text-red-400' : 'text-gray-400'">{{ tiempoRestante3 }}</span>
                        </div>
                    </li>
                </ul>
            </aside>

            <div class="form-content">
                <div v-show="pasoActivo === 1" class="card space-y-6">
                    <h2 class="card-titulo">Etapa 1: Alerta Temprana</h2>
                    <div class="info-box">
                        <p><strong>Institución:</strong> {{ reporte.EmpresaAfectada }}</p>
                        <p><strong>RUT:</strong> {{ reporte.EmpresaRUT }}</p>
                        <p><strong>Encargado:</strong> {{ reporte.EncargadoNombre || 'No definido' }}</p>
                        <p><strong>Email:</strong> {{ reporte.EncargadoEmail || 'No definido' }}</p>
                        <p><strong>Teléfono:</strong> {{ reporte.EncargadoTelefono || 'No definido' }}</p>
                    </div>
                    <div><label class="form-label required">Descripción Inicial del Incidente</label><textarea autocomplete="off" v-model="reporteEditable.AnciImpactoPreliminar" class="form-input" rows="4" placeholder="¿Qué se observó?"></textarea></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label class="form-label required">Tipo de Amenaza Probable</label><input autocomplete="off" type="text" v-model="reporteEditable.AnciTipoAmenaza" class="form-input"></div>
                        <div><label class="form-label">Fecha y Hora de Alerta Temprana</label><input autocomplete="off" type="datetime-local" v-model="reporteEditable.AnciFechaAlertaTemprana" class="form-input"></div>
                    </div>
                </div>

                <div v-show="pasoActivo === 2" class="card space-y-6">
                    <h2 class="card-titulo">Etapa 2: Segunda Notificación</h2>
                    <div><label class="form-label required">Actualización de la Evolución del Incidente</label><textarea autocomplete="off" v-model="reporteEditable.AnciEvolucionIncidente" class="form-input" rows="4" placeholder="¿Ha empeorado, está contenido, hay nuevos hallazgos?"></textarea></div>
                    <div><label class="form-label required">Medidas de Contención Implementadas</label><textarea autocomplete="off" v-model="reporteEditable.AnciMedidasContencion" class="form-input" rows="4" placeholder="¿Qué acciones técnicas y de gestión se han tomado?"></textarea></div>
                    <div><label class="form-label">Plan de Acción</label><textarea autocomplete="off" v-model="reporteEditable.AnciPlanAccion" class="form-input" rows="4" placeholder="Detallar los siguientes pasos planificados."></textarea></div>
                </div>
                
                <div v-show="pasoActivo === 3" class="card space-y-6">
                    <h2 class="card-titulo">Etapa 3: Informe Final</h2>
                    <div><label class="form-label">Resumen Ejecutivo</label><textarea autocomplete="off" v-model="reporteEditable.AnciResumenEjecutivo" class="form-input" rows="3"></textarea></div>
                    <div><label class="form-label">Causa Raíz del Incidente</label><textarea autocomplete="off" v-model="reporteEditable.AnciCausaRaiz" class="form-input" rows="3"></textarea></div>
                    <div><label class="form-label">Lecciones Aprendidas</label><textarea autocomplete="off" v-model="reporteEditable.AnciLeccionesAprendidas" class="form-input" rows="3"></textarea></div>
                    <h3 class="font-semibold text-gray-300 pt-4 border-t border-gray-600">Indicadores de Compromiso (IoCs)</h3>
                    <div><label class="form-label">Direcciones IP</label><textarea autocomplete="off" v-model="reporteEditable.AnciIoCIPs" class="form-input font-mono" rows="3"></textarea></div>
                    <div><label class="form-label">Dominios / URLs</label><textarea autocomplete="off" v-model="reporteEditable.AnciIoCDominios" class="form-input font-mono" rows="3"></textarea></div>
                    <div><label class="form-label">Hashes de Archivos</label><textarea autocomplete="off" v-model="reporteEditable.AnciIoCHashes" class="form-input font-mono" rows="3"></textarea></div>
                    
                    <!-- NUEVA SECCIÓN: GESTIÓN DE ARCHIVOS Y COMENTARIOS -->
                    <div class="archivos-comentarios-section mt-8">
                        <h3 class="section-title">📁 Gestión de Archivos y Comentarios</h3>
                        <p class="section-subtitle">Documentación adicional, evidencias y seguimiento del proceso</p>
                        
                        <!-- Navegación de pestañas -->
                        <div class="tabs-container">
                            <button 
                                @click="tabActiva = 'archivos'" 
                                :class="['tab-button', { 'active': tabActiva === 'archivos' }]"
                            >
                                <i class="ph ph-folder-open"></i>
                                Archivos ({{ totalArchivos }})
                            </button>
                            <button 
                                @click="tabActiva = 'comentarios'" 
                                :class="['tab-button', { 'active': tabActiva === 'comentarios' }]"
                            >
                                <i class="ph ph-chat-circle"></i>
                                Comentarios ({{ totalComentarios }})
                            </button>
                            <button 
                                @click="tabActiva = 'exportar'" 
                                :class="['tab-button', { 'active': tabActiva === 'exportar' }]"
                            >
                                <i class="ph ph-download"></i>
                                Exportar Reporte
                            </button>
                        </div>

                        <!-- Contenido de pestañas -->
                        <div class="tab-content">
                            <!-- PESTAÑA ARCHIVOS -->
                            <div v-show="tabActiva === 'archivos'" class="archivos-tab">
                                <!-- Upload de archivo -->
                                <div class="upload-section">
                                    <h4 class="subsection-title">📤 Subir Nuevo Archivo</h4>
                                    <div class="upload-form">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="form-label">Seleccionar Archivo</label>
                                                <input autocomplete="off" ref="fileInput"
                                                    type="file" 
                                                    @change="seleccionarArchivo"
                                                    class="file-input"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                                                >
                                            </div>
                                            <div>
                                                <label class="form-label">Tipo de Documento</label>
                                                <select autocomplete="off" v-model="nuevoArchivo.tipo" class="form-input">
                                                    <option value="evidencia">📋 Evidencia</option>
                                                    <option value="reporte_inicial">📊 Reporte Inicial</option>
                                                    <option value="reporte_final">📑 Reporte Final</option>
                                                    <option value="comunicacion_oficial">📧 Comunicación Oficial</option>
                                                    <option value="documentacion_tecnica">🔧 Documentación Técnica</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="mt-4">
                                            <label class="form-label">Comentario del Archivo</label>
                                            <textarea autocomplete="off" v-model="nuevoArchivo.comentario" 
                                                class="form-input" 
                                                rows="2" 
                                                placeholder="Descripción del archivo y su propósito..."
                                            ></textarea>
                                        </div>
                                        <button 
                                            @click="subirArchivo" 
                                            :disabled="!nuevoArchivo.archivo || subiendoArchivo"
                                            class="btn-upload"
                                        >
                                            <i class="ph" :class="subiendoArchivo ? 'ph-spinner animate-spin' : 'ph-cloud-arrow-up'"></i>
                                            {{ subiendoArchivo ? 'Subiendo...' : 'Subir Archivo' }}
                                        </button>
                                    </div>
                                </div>

                                <!-- Lista de archivos -->
                                <div class="archivos-lista">
                                    <h4 class="subsection-title">📚 Archivos del Reporte</h4>
                                    <div v-if="archivos.length === 0" class="empty-state">
                                        <i class="ph ph-folder-simple text-4xl text-gray-500"></i>
                                        <p>No hay archivos subidos aún</p>
                                    </div>
                                    <div v-else class="archivos-grid">
                                        <div v-for="archivo in archivos" :key="archivo.archivo_id" class="archivo-card">
                                            <div class="archivo-header">
                                                <div class="archivo-icon">
                                                    <i class="ph" :class="getIconoArchivo(archivo.tipo_documento)"></i>
                                                </div>
                                                <div class="archivo-info">
                                                    <h5 class="archivo-nombre">{{ archivo.nombre_archivo }}</h5>
                                                    <div class="archivo-meta">
                                                        <span class="tipo-badge" :class="getTipoBadgeClass(archivo.tipo_documento)">
                                                            {{ getTipoLabel(archivo.tipo_documento) }}
                                                        </span>
                                                        <span class="archivo-size">{{ formatBytes(archivo.tamano_bytes) }}</span>
                                                        <span class="archivo-version">v{{ archivo.version }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="archivo-comentario" v-if="archivo.comentario">
                                                <p>{{ archivo.comentario }}</p>
                                            </div>
                                            <div class="archivo-footer">
                                                <span class="archivo-fecha">{{ formatFecha(archivo.fecha_subida) }}</span>
                                                <span class="archivo-usuario">por {{ archivo.subido_por }}</span>
                                                <div class="archivo-acciones">
                                                    <button @click="descargarArchivo(archivo.archivo_id)" class="btn-accion download">
                                                        <i class="ph ph-download"></i>
                                                    </button>
                                                    <button @click="eliminarArchivo(archivo.archivo_id)" class="btn-accion delete">
                                                        <i class="ph ph-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- PESTAÑA COMENTARIOS -->
                            <div v-show="tabActiva === 'comentarios'" class="comentarios-tab">
                                <!-- Nuevo comentario -->
                                <div class="comentario-form">
                                    <h4 class="subsection-title">💬 Agregar Comentario</h4>
                                    <div class="form-comentario">
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div class="md:col-span-2">
                                                <label class="form-label">Comentario</label>
                                                <textarea autocomplete="off" v-model="nuevoComentario.texto" 
                                                    class="form-input" 
                                                    rows="3" 
                                                    placeholder="Escriba su comentario sobre el progreso del reporte..."
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label class="form-label">Tipo</label>
                                                <select autocomplete="off" v-model="nuevoComentario.tipo" class="form-input">
                                                    <option value="seguimiento">📝 Seguimiento</option>
                                                    <option value="alerta">⚠️ Alerta</option>
                                                    <option value="estado">📊 Cambio de Estado</option>
                                                    <option value="revision">🔍 Revisión</option>
                                                    <option value="comunicacion">📞 Comunicación</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button 
                                            @click="agregarComentario" 
                                            :disabled="!nuevoComentario.texto.trim() || agregandoComentario"
                                            class="btn-comentario"
                                        >
                                            <i class="ph" :class="agregandoComentario ? 'ph-spinner animate-spin' : 'ph-chat-circle'"></i>
                                            {{ agregandoComentario ? 'Agregando...' : 'Agregar Comentario' }}
                                        </button>
                                    </div>
                                </div>

                                <!-- Lista de comentarios -->
                                <div class="comentarios-lista">
                                    <h4 class="subsection-title">💭 Historial de Comentarios</h4>
                                    <div v-if="comentarios.length === 0" class="empty-state">
                                        <i class="ph ph-chat-circle text-4xl text-gray-500"></i>
                                        <p>No hay comentarios aún</p>
                                    </div>
                                    <div v-else class="comentarios-timeline">
                                        <div v-for="comentario in comentarios" :key="comentario.comentario_id" class="comentario-item">
                                            <div class="comentario-marker">
                                                <i class="ph" :class="getIconoComentario(comentario.tipo)"></i>
                                            </div>
                                            <div class="comentario-content">
                                                <div class="comentario-header">
                                                    <span class="comentario-tipo" :class="getTipoComentarioClass(comentario.tipo)">
                                                        {{ getTipoComentarioLabel(comentario.tipo) }}
                                                    </span>
                                                    <span class="comentario-fecha">{{ formatFecha(comentario.fecha_creacion) }}</span>
                                                </div>
                                                <p class="comentario-texto">{{ comentario.comentario }}</p>
                                                <div class="comentario-footer">
                                                    <span class="comentario-autor">{{ comentario.creado_por }}</span>
                                                    <span class="comentario-version">v{{ comentario.version }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- PESTAÑA EXPORTAR -->
                            <div v-show="tabActiva === 'exportar'" class="exportar-tab">
                                <h4 class="subsection-title">📥 Exportar Reporte por Etapas</h4>
                                <p class="export-description">
                                    Genere documentos oficiales para cada etapa del reporte ANCI que puede subir directamente a la página oficial
                                </p>
                                
                                <div class="export-options">
                                    <!-- Exportar Etapa 1 -->
                                    <div class="export-card">
                                        <div class="export-header">
                                            <h5>🚨 Etapa 1: Alerta Temprana</h5>
                                            <span class="export-status" :class="etapa1Completa ? 'completed' : 'pending'">
                                                {{ etapa1Completa ? '✅ Completa' : '⏳ Pendiente' }}
                                            </span>
                                        </div>
                                        <p class="export-info">Reporte inicial para cumplir con el plazo de 2-4 horas</p>
                                        <div class="export-buttons">
                                            <button @click="exportarEtapa(1, 'pdf')" :disabled="!etapa1Completa" class="btn-export pdf">
                                                <i class="ph ph-file-pdf"></i> PDF
                                            </button>
                                            <button @click="exportarEtapa(1, 'word')" :disabled="!etapa1Completa" class="btn-export word">
                                                <i class="ph ph-file-doc"></i> Word
                                            </button>
                                            <button @click="exportarEtapa(1, 'excel')" :disabled="!etapa1Completa" class="btn-export excel">
                                                <i class="ph ph-file-xls"></i> Excel
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Exportar Etapa 2 -->
                                    <div class="export-card">
                                        <div class="export-header">
                                            <h5>📊 Etapa 2: Segunda Notificación</h5>
                                            <span class="export-status" :class="etapa2Completa ? 'completed' : 'pending'">
                                                {{ etapa2Completa ? '✅ Completa' : '⏳ Pendiente' }}
                                            </span>
                                        </div>
                                        <p class="export-info">Actualización dentro de 24-72 horas según tipo de empresa</p>
                                        <div class="export-buttons">
                                            <button @click="exportarEtapa(2, 'pdf')" :disabled="!etapa2Completa" class="btn-export pdf">
                                                <i class="ph ph-file-pdf"></i> PDF
                                            </button>
                                            <button @click="exportarEtapa(2, 'word')" :disabled="!etapa2Completa" class="btn-export word">
                                                <i class="ph ph-file-doc"></i> Word
                                            </button>
                                            <button @click="exportarEtapa(2, 'excel')" :disabled="!etapa2Completa" class="btn-export excel">
                                                <i class="ph ph-file-xls"></i> Excel
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Exportar Etapa 3 -->
                                    <div class="export-card">
                                        <div class="export-header">
                                            <h5>📑 Etapa 3: Informe Final</h5>
                                            <span class="export-status" :class="etapa3Completa ? 'completed' : 'pending'">
                                                {{ etapa3Completa ? '✅ Completa' : '⏳ Pendiente' }}
                                            </span>
                                        </div>
                                        <p class="export-info">Reporte final completo dentro de 15 días</p>
                                        <div class="export-buttons">
                                            <button @click="exportarEtapa(3, 'pdf')" :disabled="!etapa3Completa" class="btn-export pdf">
                                                <i class="ph ph-file-pdf"></i> PDF
                                            </button>
                                            <button @click="exportarEtapa(3, 'word')" :disabled="!etapa3Completa" class="btn-export word">
                                                <i class="ph ph-file-doc"></i> Word
                                            </button>
                                            <button @click="exportarEtapa(3, 'excel')" :disabled="!etapa3Completa" class="btn-export excel">
                                                <i class="ph ph-file-xls"></i> Excel
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Exportar Reporte Completo -->
                                    <div class="export-card featured">
                                        <div class="export-header">
                                            <h5>📄 Reporte Completo</h5>
                                            <span class="export-status" :class="reporteCompleto ? 'completed' : 'pending'">
                                                {{ reporteCompleto ? '✅ Listo' : '⏳ En progreso' }}
                                            </span>
                                        </div>
                                        <p class="export-info">Documento consolidado con todas las etapas, archivos y comentarios</p>
                                        <div class="export-buttons">
                                            <button @click="exportarCompleto('pdf')" :disabled="!reporteCompleto" class="btn-export pdf large">
                                                <i class="ph ph-file-pdf"></i> PDF Completo
                                            </button>
                                            <button @click="exportarCompleto('word')" :disabled="!reporteCompleto" class="btn-export word large">
                                                <i class="ph ph-file-doc"></i> Word Completo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  reporteId: { type: [String, Number], required: true }
});
const router = useRouter();

const reporte = ref(null);
const reporteEditable = ref(null);
const loading = ref(true);
const error = ref(null);
const guardando = ref(false);
const pasoActivo = ref(1);
const plazoEtapa1 = ref(null);
const plazoEtapa2 = ref(null);
const plazoEtapa3 = ref(null);
const tiempoRestante1 = ref('');
const tiempoRestante2 = ref('');
const tiempoRestante3 = ref('');
let temporizador = null;

// Variables para la nueva funcionalidad
const tabActiva = ref('archivos');
const archivos = ref([]);
const comentarios = ref([]);
const totalArchivos = ref(0);
const totalComentarios = ref(0);
const subiendoArchivo = ref(false);
const agregandoComentario = ref(false);
const fileInput = ref(null);

// Datos para nuevo archivo
const nuevoArchivo = ref({
    archivo: null,
    tipo: 'evidencia',
    comentario: ''
});

// Datos para nuevo comentario
const nuevoComentario = ref({
    texto: '',
    tipo: 'seguimiento'
});

const etapa1Completa = computed(() => reporteEditable.value?.AnciTipoAmenaza && reporteEditable.value?.AnciImpactoPreliminar);
const etapa2Completa = computed(() => reporteEditable.value?.AnciEvolucionIncidente && reporteEditable.value?.AnciMedidasContencion);
const etapa3Completa = computed(() => reporteEditable.value?.AnciResumenEjecutivo && reporteEditable.value?.AnciCausaRaiz);
const reporteCompleto = computed(() => etapa1Completa.value && etapa2Completa.value && etapa3Completa.value);

onMounted(async () => {
    await cargarReporte();
    if (reporte.value) {
        calcularPlazos();
        actualizarTiemposRestantes();
        temporizador = setInterval(actualizarTiemposRestantes, 1000);
        await cargarHistorial();
    }
});

onUnmounted(() => {
    if (temporizador) {
        clearInterval(temporizador);
    }
});

function calcularPlazos() {
    const fechaInicio = new Date(reporte.value.AnciFechaAlertaTemprana);
    
    plazoEtapa1.value = new Date(fechaInicio.getTime() + 3 * 60 * 60 * 1000);

    const horasEtapa2 = reporte.value.TipoEmpresa === 'OIV' ? 24 : 72;
    plazoEtapa2.value = new Date(fechaInicio.getTime() + horasEtapa2 * 60 * 60 * 1000);

    plazoEtapa3.value = new Date(fechaInicio.getTime() + 15 * 24 * 60 * 60 * 1000);
}

function actualizarTiemposRestantes() {
    tiempoRestante1.value = formatoTiempoRestante(plazoEtapa1.value);
    tiempoRestante2.value = formatoTiempoRestante(plazoEtapa2.value);
    tiempoRestante3.value = formatoTiempoRestante(plazoEtapa3.value);
}

function formatoTiempoRestante(fechaPlazo) {
    if (!fechaPlazo) return 'N/A';
    const ahora = new Date();
    const diferencia = fechaPlazo.getTime() - ahora.getTime();

    if (diferencia <= 0) {
        return 'Plazo Vencido';
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    return `${dias}d ${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
}

function tiempoVencido(fechaPlazo) {
    if (!fechaPlazo) return false;
    return new Date() > fechaPlazo;
}

function volver() {
  if (reporte.value && reporte.value.IncidenteID) {
    // Lógica corregida: Siempre vuelve al detalle del incidente "semilla".
    console.log(`🔄 Navegando a detalle del incidente desde ANCI: ${reporte.value.IncidenteID}`);
    router.push({ 
      name: 'VistaDetalleIncidente', 
      params: { incidenteId: reporte.value.IncidenteID } 
    });
  } else {
    router.go(-1);
  }
}

async function cargarReporte() {
  loading.value = true;
  try {
    const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}/detalle`);
    if (!response.ok) throw new Error('No se pudo cargar el detalle del reporte.');
    const data = await response.json();
    
    const fechaOriginal = data.AnciFechaAlertaTemprana;

    for (const key in data) {
      if (key.startsWith('AnciFecha') && data[key]) {
        try {
            data[key] = new Date(data[key]).toISOString().slice(0, 16);
        } catch(e) {
            console.error(`Error al formatear la fecha para el campo ${key}:`, data[key]);
            data[key] = null;
        }
      }
    }
    reporteEditable.value = data;
    reporte.value = JSON.parse(JSON.stringify(data));
    reporte.value.AnciFechaAlertaTemprana = fechaOriginal;

  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function guardarProgreso() {
    guardando.value = true;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reporteEditable.value)
        });
        if(!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Error al guardar el progreso.");
        }
        alert("Progreso guardado exitosamente.");
        await cargarReporte();
    } catch(err) {
        alert(err.message);
    } finally {
        guardando.value = false;
    }
}

function formatarFecha(fecha) {
    if (!fecha) return 'No definida';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-CL', opciones);
}

// NUEVAS FUNCIONES PARA GESTIÓN DE ARCHIVOS Y COMENTARIOS

async function cargarHistorial() {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}/historial`);
        if (!response.ok) throw new Error('Error al cargar historial');
        
        const data = await response.json();
        archivos.value = data.archivos || [];
        comentarios.value = data.comentarios || [];
        totalArchivos.value = data.total_archivos || 0;
        totalComentarios.value = data.total_comentarios || 0;
    } catch (error) {
        console.error('Error cargando historial:', error);
    }
}

function seleccionarArchivo(event) {
    const file = event.target.files[0];
    if (file) {
        nuevoArchivo.value.archivo = file;
    }
}

async function subirArchivo() {
    if (!nuevoArchivo.value.archivo) return;
    
    subiendoArchivo.value = true;
    try {
        const formData = new FormData();
        formData.append('archivo', nuevoArchivo.value.archivo);
        formData.append('tipo_documento', nuevoArchivo.value.tipo);
        formData.append('comentario', nuevoArchivo.value.comentario);
        
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}/archivos`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al subir archivo');
        }
        
        // Limpiar formulario
        nuevoArchivo.value = {
            archivo: null,
            tipo: 'evidencia',
            comentario: ''
        };
        
        // Limpiar input file
        if (fileInput.value) {
            fileInput.value.value = '';
        }
        
        // Recargar historial
        await cargarHistorial();
        
        alert('Archivo subido exitosamente');
    } catch (error) {
        alert(error.message);
    } finally {
        subiendoArchivo.value = false;
    }
}

async function agregarComentario() {
    if (!nuevoComentario.value.texto.trim()) return;
    
    agregandoComentario.value = true;
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comentario: nuevoComentario.value.texto,
                tipo: nuevoComentario.value.tipo
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al agregar comentario');
        }
        
        // Limpiar formulario
        nuevoComentario.value = {
            texto: '',
            tipo: 'seguimiento'
        };
        
        // Recargar historial
        await cargarHistorial();
        
        alert('Comentario agregado exitosamente');
    } catch (error) {
        alert(error.message);
    } finally {
        agregandoComentario.value = false;
    }
}

async function descargarArchivo(archivoId) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/archivos/${archivoId}/download`);
        if (!response.ok) throw new Error('Error al descargar archivo');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'archivo';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert('Error al descargar archivo: ' + error.message);
    }
}

async function eliminarArchivo(archivoId) {
    if (!confirm('¿Está seguro de eliminar este archivo?')) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/archivos/${archivoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar archivo');
        
        await cargarHistorial();
        alert('Archivo eliminado exitosamente');
    } catch (error) {
        alert('Error al eliminar archivo: ' + error.message);
    }
}

async function exportarEtapa(etapa, formato) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}/exportar/${etapa}/${formato}`);
        if (!response.ok) throw new Error('Error al exportar reporte');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_ANCI_Etapa${etapa}_${reporte.value.IncidenteIDVisible}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert('Error al exportar: ' + error.message);
    }
}

async function exportarCompleto(formato) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reportes-anci/${props.reporteId}/exportar/completo/${formato}`);
        if (!response.ok) throw new Error('Error al exportar reporte completo');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_ANCI_Completo_${reporte.value.IncidenteIDVisible}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert('Error al exportar reporte completo: ' + error.message);
    }
}

// Funciones de utilidad para los iconos y etiquetas
function getIconoArchivo(tipo) {
    const iconos = {
        'evidencia': 'ph-file-text',
        'reporte_inicial': 'ph-file-chart-bar',
        'reporte_final': 'ph-file-pdf',
        'comunicacion_oficial': 'ph-envelope',
        'documentacion_tecnica': 'ph-gear'
    };
    return iconos[tipo] || 'ph-file';
}

function getTipoBadgeClass(tipo) {
    const classes = {
        'evidencia': 'badge-blue',
        'reporte_inicial': 'badge-yellow',
        'reporte_final': 'badge-green',
        'comunicacion_oficial': 'badge-purple',
        'documentacion_tecnica': 'badge-gray'
    };
    return classes[tipo] || 'badge-gray';
}

function getTipoLabel(tipo) {
    const labels = {
        'evidencia': 'Evidencia',
        'reporte_inicial': 'Reporte Inicial',
        'reporte_final': 'Reporte Final',
        'comunicacion_oficial': 'Comunicación',
        'documentacion_tecnica': 'Documentación'
    };
    return labels[tipo] || tipo;
}

function getIconoComentario(tipo) {
    const iconos = {
        'seguimiento': 'ph-note-pencil',
        'alerta': 'ph-warning',
        'estado': 'ph-trend-up',
        'revision': 'ph-magnifying-glass',
        'comunicacion': 'ph-phone'
    };
    return iconos[tipo] || 'ph-chat-circle';
}

function getTipoComentarioClass(tipo) {
    const classes = {
        'seguimiento': 'tipo-seguimiento',
        'alerta': 'tipo-alerta',
        'estado': 'tipo-estado',
        'revision': 'tipo-revision',
        'comunicacion': 'tipo-comunicacion'
    };
    return classes[tipo] || 'tipo-default';
}

function getTipoComentarioLabel(tipo) {
    const labels = {
        'seguimiento': 'Seguimiento',
        'alerta': 'Alerta',
        'estado': 'Cambio de Estado',
        'revision': 'Revisión',
        'comunicacion': 'Comunicación'
    };
    return labels[tipo] || tipo;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatFecha(fecha) {
    if (!fecha) return 'No definida';
    const opciones = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(fecha).toLocaleDateString('es-CL', opciones);
}
</script>

<style scoped>
.vista-reporte-anci { display: flex; flex-direction: column; height: calc(100vh - 4rem); }
.header-fijo { position: sticky; top: 0; background-color: #111827; padding: 1.5rem 2rem; z-index: 10; border-bottom: 1px solid #374151; margin: -2rem -2rem 2rem -2rem; }
.contenido-scrollable { overflow-y: auto; flex-grow: 1; padding-right: 1rem; }
.header-con-navegacion { display: flex; align-items: center; justify-content: space-between; }
.btn-volver { display: inline-flex; align-items: center; gap: 0.5rem; background-color: #374151; color: #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; cursor: pointer; border: none;}
.header-principal { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem;}
.reporte-grid { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: flex-start; }
.timeline-nav ul { list-style: none; padding: 0; position: relative; }
.timeline-nav ul::before { content: ''; position: absolute; left: 1rem; top: 0; bottom: 0; width: 2px; background-color: #374151; }
.timeline-nav li { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 0.5rem; cursor: pointer; transition: background-color 0.2s; border: 1px solid transparent; }
.timeline-nav li.active { background-color: #374151; border-color: #4f46e5; }
.timeline-nav li:hover { background-color: #2d3748; }
.timeline-marker { font-size: 2rem; flex-shrink: 0; z-index: 1; background-color: #111827; padding-right: 1rem;}
.timeline-nav li .timeline-marker { color: #6b7280; }
.timeline-nav li.completed .timeline-marker { color: #22c55e; }
.timeline-nav li.active .timeline-marker { color: #4f46e5; }
.timeline-content { display: flex; flex-direction: column; }
.card { background-color: #1f2937; border: 1px solid #374151; border-radius: 0.75rem; padding: 1.5rem; }
.card-titulo { font-size: 1.25rem; font-weight: 600; color: #ffffff; margin: 0 0 1.5rem 0; }
.form-label { display: block; font-weight: 500; color: #d1d5db; margin-bottom: 0.5rem; }
.form-input { width: 100%; background-color: #374151; border: 1px solid #4b5563; color: white; padding: 0.75rem 1rem; border-radius: 0.375rem; }
.btn-primary { background-color: #4f46e5; color: white; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.375rem; border: none; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.timeline-content .font-mono { transition: color 0.3s; }
.info-box {
    background-color: #2d3748;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #4f46e5;
    font-size: 0.875rem;
    color: #d1d5db;
}
.info-box p { margin: 0.25rem 0; }
.form-label.required::after {
  content: ' *';
  color: #fca5a5;
}

/* NUEVOS ESTILOS PARA GESTIÓN DE ARCHIVOS Y COMENTARIOS - MANTENIENDO EL FORMATO ESPECTACULAR */

.archivos-comentarios-section {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border: 1px solid #475569;
    border-radius: 1rem;
    padding: 2rem;
    margin-top: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-subtitle {
    color: #94a3b8;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}

/* PESTAÑAS CON ESTILO ESPECTACULAR */
.tabs-container {
    display: flex;
    background-color: #0f172a;
    border-radius: 0.75rem;
    padding: 0.25rem;
    margin-bottom: 1.5rem;
    border: 1px solid #334155;
}

.tab-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    color: #64748b;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-button:hover {
    color: #cbd5e1;
    background-color: #1e293b;
}

.tab-button.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.tab-content {
    min-height: 300px;
}

/* ESTILOS DE UPLOAD DE ARCHIVOS */
.upload-section {
    background-color: #1e293b;
    border: 2px dashed #475569;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
}

.upload-section:hover {
    border-color: #4f46e5;
    background-color: #0f172a;
}

.subsection-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.upload-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-input {
    width: 100%;
    background-color: #374151;
    border: 1px solid #4b5563;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    file-selector-button: {
        background-color: #4f46e5;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        margin-right: 1rem;
        cursor: pointer;
    }
}

.btn-upload {
    background: linear-gradient(135deg, #059669, #10b981);
    color: white;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    align-self: flex-start;
}

.btn-upload:hover:not(:disabled) {
    background: linear-gradient(135deg, #047857, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    transform: translateY(-1px);
}

.btn-upload:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* GRID DE ARCHIVOS */
.archivos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.archivo-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid #334155;
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.3s ease;
}

.archivo-card:hover {
    border-color: #4f46e5;
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
    transform: translateY(-2px);
}

.archivo-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.archivo-icon {
    font-size: 2rem;
    color: #4f46e5;
    flex-shrink: 0;
}

.archivo-info {
    flex: 1;
    min-width: 0;
}

.archivo-nombre {
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    word-break: break-word;
}

.archivo-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
}

.tipo-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.badge-blue { background-color: #1e40af; color: #dbeafe; }
.badge-yellow { background-color: #d97706; color: #fef3c7; }
.badge-green { background-color: #059669; color: #d1fae5; }
.badge-purple { background-color: #7c3aed; color: #e9d5ff; }
.badge-gray { background-color: #4b5563; color: #f3f4f6; }

.archivo-size, .archivo-version {
    font-size: 0.75rem;
    color: #94a3b8;
}

.archivo-comentario {
    background-color: #0f172a;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin: 0.75rem 0;
    border-left: 3px solid #4f46e5;
}

.archivo-comentario p {
    margin: 0;
    color: #cbd5e1;
    font-size: 0.85rem;
}

.archivo-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #334155;
}

.archivo-fecha, .archivo-usuario {
    font-size: 0.75rem;
    color: #64748b;
}

.archivo-acciones {
    display: flex;
    gap: 0.5rem;
}

.btn-accion {
    background: transparent;
    border: 1px solid #475569;
    color: #94a3b8;
    padding: 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-accion:hover {
    border-color: #4f46e5;
    color: #4f46e5;
}

.btn-accion.delete:hover {
    border-color: #ef4444;
    color: #ef4444;
}

/* ESTILOS DE COMENTARIOS */
.comentario-form {
    background-color: #1e293b;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid #334155;
}

.form-comentario {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.btn-comentario {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    align-self: flex-start;
}

.btn-comentario:hover:not(:disabled) {
    background: linear-gradient(135deg, #4338ca, #6d28d9);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    transform: translateY(-1px);
}

.btn-comentario:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* TIMELINE DE COMENTARIOS */
.comentarios-timeline {
    position: relative;
    padding-left: 2rem;
}

.comentarios-timeline::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #4f46e5, #7c3aed);
}

.comentario-item {
    position: relative;
    margin-bottom: 1.5rem;
    padding-left: 1rem;
}

.comentario-marker {
    position: absolute;
    left: -2rem;
    top: 0.5rem;
    width: 2rem;
    height: 2rem;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
    z-index: 1;
}

.comentario-content {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid #334155;
    border-radius: 0.75rem;
    padding: 1rem;
}

.comentario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.comentario-tipo {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.tipo-seguimiento { background-color: #1e40af; color: #dbeafe; }
.tipo-alerta { background-color: #dc2626; color: #fecaca; }
.tipo-estado { background-color: #059669; color: #d1fae5; }
.tipo-revision { background-color: #d97706; color: #fef3c7; }
.tipo-comunicacion { background-color: #7c3aed; color: #e9d5ff; }
.tipo-default { background-color: #4b5563; color: #f3f4f6; }

.comentario-fecha {
    font-size: 0.75rem;
    color: #64748b;
}

.comentario-texto {
    color: #cbd5e1;
    margin: 0 0 0.75rem 0;
    line-height: 1.6;
}

.comentario-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #334155;
    font-size: 0.75rem;
    color: #64748b;
}

/* ESTILOS DE EXPORTACIÓN */
.export-description {
    color: #94a3b8;
    margin-bottom: 2rem;
    text-align: center;
    font-style: italic;
}

.export-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.export-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid #334155;
    border-radius: 1rem;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.export-card:hover {
    border-color: #4f46e5;
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
    transform: translateY(-2px);
}

.export-card.featured {
    border-color: #7c3aed;
    background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
}

.export-card.featured:hover {
    border-color: #a855f7;
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.2);
}

.export-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.export-header h5 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
}

.export-status {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.export-status.completed {
    background-color: #059669;
    color: #d1fae5;
}

.export-status.pending {
    background-color: #d97706;
    color: #fef3c7;
}

.export-info {
    color: #94a3b8;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}

.export-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.btn-export {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.85rem;
}

.btn-export.large {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
}

.btn-export:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-export.pdf {
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: white;
}

.btn-export.pdf:hover:not(:disabled) {
    background: linear-gradient(135deg, #b91c1c, #dc2626);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-export.word {
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
}

.btn-export.word:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-export.excel {
    background: linear-gradient(135deg, #059669, #10b981);
    color: white;
}

.btn-export.excel:hover:not(:disabled) {
    background: linear-gradient(135deg, #047857, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* ESTADOS VACÍOS */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #64748b;
}

.empty-state i {
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state p {
    margin: 0;
    font-style: italic;
}

/* ANIMACIONES */
@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .archivos-comentarios-section {
        padding: 1rem;
    }
    
    .tabs-container {
        flex-direction: column;
    }
    
    .tab-button {
        justify-content: flex-start;
    }
    
    .archivos-grid {
        grid-template-columns: 1fr;
    }
    
    .export-options {
        grid-template-columns: 1fr;
    }
    
    .export-buttons {
        justify-content: center;
    }
    
    .archivo-header {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .archivo-footer {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }
}
</style>