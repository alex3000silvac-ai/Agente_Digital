<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="loading" class="dashboard-skeleton">
      <div class="skeleton-bar"></div>
      <div class="skeleton-stats">
        <div class="skeleton-stat" v-for="i in 4" :key="i"></div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="dashboard-content">
      <!-- Header con métricas principales -->
      <div class="dashboard-header">
        <!-- Progress Ring Principal -->
        <div class="progress-section">
          <div class="progress-ring-container">
            <svg class="progress-ring" width="100" height="100">
              <circle
                class="progress-ring-background"
                cx="50" cy="50" r="40"
                stroke="#374151" stroke-width="6" fill="transparent"
              />
              <circle
                class="progress-ring-progress"
                cx="50" cy="50" r="40"
                stroke="url(#gradient)" stroke-width="6" fill="transparent"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" :stop-color="getGradientColor().start" />
                  <stop offset="100%" :stop-color="getGradientColor().end" />
                </linearGradient>
              </defs>
            </svg>
            <div class="progress-text">
              <span class="progress-percentage">{{ stats.porcentaje_cumplimiento }}%</span>
              <span class="progress-label">Cumplimiento</span>
            </div>
          </div>
          
          <!-- Risk Badge -->
          <div class="risk-badge" :class="`risk-${stats.riesgo_nivel}`">
            <i class="ph" :class="getRiskIcon()"></i>
            <span>{{ getRiskLabel() }}</span>
          </div>
        </div>

        <!-- Métricas Globales -->
        <div class="global-metrics">
          <!-- Total Obligaciones -->
          <div class="metric-card metric-primary">
            <div class="metric-icon">
              <i class="ph ph-list-checks"></i>
            </div>
            <div class="metric-info">
              <span class="metric-number">{{ stats.total_obligaciones }}</span>
              <span class="metric-label">Obligaciones</span>
              <span class="metric-sublabel">{{ stats.tipo_empresa }}</span>
            </div>
          </div>

          <!-- Total Evidencias -->
          <div class="metric-card metric-secondary">
            <div class="metric-icon">
              <i class="ph ph-files"></i>
            </div>
            <div class="metric-info">
              <span class="metric-number">{{ stats.total_evidencias }}</span>
              <span class="metric-label">Evidencias</span>
              <span class="metric-sublabel">Cargadas</span>
            </div>
          </div>

          <!-- Tendencia -->
          <div class="metric-card" :class="getTendenciaClass()">
            <div class="metric-icon">
              <i class="ph" :class="getTendenciaIcon()"></i>
            </div>
            <div class="metric-info">
              <span class="metric-label">Tendencia</span>
              <span class="metric-sublabel">{{ getTendenciaLabel() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas de Acompañamiento -->
      <div class="acompanamiento-section">
        <h4 class="section-title">
          <i class="ph ph-list-checks"></i>
          Acompañamiento
        </h4>
        
        <div class="acompanamiento-grid">
          <!-- Total -->
          <div class="acompanamiento-card acompanamiento-total clickable" @click="navigateToAcompanamiento('total')">
            <div class="acompanamiento-header">
              <span class="acompanamiento-number">{{ stats.total_obligaciones }}</span>
              <i class="ph ph-list-dashes"></i>
            </div>
            <span class="acompanamiento-label">Total</span>
            <span class="acompanamiento-percent">100%</span>
          </div>

          <!-- Implementadas -->
          <div class="acompanamiento-card acompanamiento-implementado clickable" @click="navigateToAcompanamiento('cumplidas')">
            <div class="acompanamiento-header">
              <span class="acompanamiento-number">{{ stats.implementadas }}</span>
              <i class="ph ph-check-circle"></i>
            </div>
            <span class="acompanamiento-label">Cumplidas</span>
            <span class="acompanamiento-percent">{{ getStatPercentage('implementadas') }}</span>
          </div>

          <!-- En Proceso -->
          <div class="acompanamiento-card acompanamiento-proceso clickable" @click="navigateToAcompanamiento('proceso')">
            <div class="acompanamiento-header">
              <span class="acompanamiento-number">{{ stats.en_proceso }}</span>
              <i class="ph ph-clock"></i>
            </div>
            <span class="acompanamiento-label">En Proceso</span>
            <span class="acompanamiento-percent">{{ getStatPercentage('en_proceso') }}</span>
          </div>

          <!-- Pendientes -->
          <div class="acompanamiento-card acompanamiento-pendiente clickable" @click="navigateToAcompanamiento('pendientes')">
            <div class="acompanamiento-header">
              <span class="acompanamiento-number">{{ stats.pendientes + stats.vencidas }}</span>
              <i class="ph ph-warning-circle"></i>
            </div>
            <span class="acompanamiento-label">Pendientes</span>
            <span class="acompanamiento-percent">{{ Math.round(((stats.pendientes + stats.vencidas) / stats.total_obligaciones) * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- Sección de Incidentes -->
      <div class="incidentes-section">
        <h4 class="section-title">
          <i class="ph ph-warning-octagon"></i>
          Incidentes (Total histórico)
        </h4>
        
        <div class="incidentes-grid">
          <!-- Total Incidentes -->
          <div class="incidente-card incidente-total clickable" @click="navigateToIncidentes('total')">
            <div class="incidente-header">
              <span class="incidente-number">{{ stats.incidentes.total }}</span>
              <i class="ph ph-chart-line"></i>
            </div>
            <span class="incidente-label">Total Incidentes</span>
          </div>

          <!-- Activos -->
          <div class="incidente-card incidente-activo clickable" @click="navigateToIncidentes('activos')">
            <div class="incidente-header">
              <span class="incidente-number">{{ stats.incidentes.activos }}</span>
              <i class="ph ph-fire"></i>
            </div>
            <span class="incidente-label">Activos</span>
          </div>

          <!-- Cerrados -->
          <div class="incidente-card incidente-cerrado clickable" @click="navigateToIncidentes('cerrados')">
            <div class="incidente-header">
              <span class="incidente-number">{{ stats.incidentes.cerrados }}</span>
              <i class="ph ph-check-circle"></i>
            </div>
            <span class="incidente-label">Cerrados</span>
          </div>

          <!-- Pendientes -->
          <div class="incidente-card incidente-pendiente clickable" @click="navigateToIncidentes('pendientes')">
            <div class="incidente-header">
              <span class="incidente-number">{{ stats.incidentes.pendientes }}</span>
              <i class="ph ph-hourglass"></i>
            </div>
            <span class="incidente-label">Pendientes</span>
          </div>
        </div>

        <!-- Criticidad y Tipos -->
        <div class="incidentes-details">
          <!-- Criticidad -->
          <div class="criticidad-section">
            <h5 class="detail-title">Por Criticidad</h5>
            <div class="criticidad-bars">
              <div class="criticidad-bar criticidad-alta clickable" @click="navigateToIncidentes('criticidad', 'Alta')">
                <span class="bar-label">Alta</span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: getCriticidadPercentage('alta') }"></div>
                  <span class="bar-value">{{ stats.incidentes.criticidad_alta }}</span>
                </div>
              </div>
              <div class="criticidad-bar criticidad-media clickable" @click="navigateToIncidentes('criticidad', 'Media')">
                <span class="bar-label">Media</span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: getCriticidadPercentage('media') }"></div>
                  <span class="bar-value">{{ stats.incidentes.criticidad_media }}</span>
                </div>
              </div>
              <div class="criticidad-bar criticidad-baja clickable" @click="navigateToIncidentes('criticidad', 'Baja')">
                <span class="bar-label">Baja</span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: getCriticidadPercentage('baja') }"></div>
                  <span class="bar-value">{{ stats.incidentes.criticidad_baja }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tipos Frecuentes -->
          <div v-if="stats.incidentes.tipos_frecuentes && stats.incidentes.tipos_frecuentes.length > 0" class="tipos-section">
            <h5 class="detail-title">Tipos Más Frecuentes</h5>
            <div class="tipos-list">
              <div 
                v-for="(tipo, index) in stats.incidentes.tipos_frecuentes" 
                :key="tipo.tipo"
                class="tipo-item clickable"
                :class="`tipo-rank-${index + 1}`"
                @click="navigateToIncidentes('tipo', tipo.tipo)"
              >
                <span class="tipo-rank">#{{ index + 1 }}</span>
                <span class="tipo-name">{{ tipo.tipo || 'No especificado' }}</span>
                <span class="tipo-count">{{ tipo.cantidad }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Próximas Fechas -->
      <div v-if="stats.proximas_fechas && stats.proximas_fechas.length > 0" class="upcoming-section">
        <h4 class="section-title">
          <i class="ph ph-calendar-check"></i>
          Próximos Vencimientos
        </h4>
        <div class="upcoming-list">
          <div 
            v-for="fecha in stats.proximas_fechas" 
            :key="fecha.ArticuloNorma"
            class="upcoming-item"
            :class="{ 'urgent': fecha.DiasRestantes <= 7 }"
          >
            <div class="upcoming-days">
              <span class="days-number">{{ fecha.DiasRestantes }}</span>
              <span class="days-label">días</span>
            </div>
            <div class="upcoming-info">
              <span class="upcoming-article">{{ fecha.ArticuloNorma }}</span>
              <span class="upcoming-date">{{ formatDate(fecha.FechaTermino) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <button @click="$emit('open-module', 'Acompanamiento')" class="action-btn primary">
          <i class="ph ph-list-checks"></i>
          <span>Gestionar</span>
        </button>
        <button @click="$emit('open-module', 'InformeCumplimiento')" class="action-btn secondary">
          <i class="ph ph-chart-line"></i>
          <span>Informe</span>
        </button>
        <button @click="$emit('open-module', 'Incidentes')" class="action-btn tertiary">
          <i class="ph ph-warning-octagon"></i>
          <span>Incidentes</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="dashboard-error">
      <i class="ph ph-warning-circle"></i>
      <span>Error cargando estadísticas</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '../services/api.js';

const props = defineProps({
  empresaId: { type: [String, Number], required: true }
});

const emit = defineEmits(['open-module', 'navigate-with-filter']);

const stats = ref(null);
const loading = ref(true);
const error = ref(false);

// Progress ring calculations
const radius = 40;
const circumference = computed(() => 2 * Math.PI * radius);
const progressOffset = computed(() => {
  if (!stats.value) return circumference.value;
  const progress = stats.value.porcentaje_cumplimiento / 100;
  return circumference.value - (progress * circumference.value);
});

async function loadStats() {
  loading.value = true;
  error.value = false;
  try {
    const response = await apiClient.get(`/admin/empresas/${props.empresaId}/dashboard-stats`);
    console.log('📊 Dashboard stats recibidas para empresa', props.empresaId, ':', response.data);
    console.log('  - Total obligaciones:', response.data.total_obligaciones);
    console.log('  - Implementadas:', response.data.implementadas);
    console.log('  - En proceso:', response.data.en_proceso);
    console.log('  - Pendientes:', response.data.pendientes);
    console.log('  - Incidentes totales:', response.data.incidentes?.total);
    stats.value = response.data;
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
    error.value = true;
    // Establecer valores por defecto para evitar errores en la UI
    stats.value = {
      porcentaje_cumplimiento: 0,
      total_obligaciones: 0,
      implementadas: 0,
      en_proceso: 0,
      pendientes: 0,
      vencidas: 0,
      no_aplica: 0,
      total_evidencias: 0,
      riesgo_nivel: 'medio',
      tendencia_cumplimiento: 'estable',
      incidentes: {
        total: 0,
        activos: 0,
        cerrados: 0,
        pendientes: 0,
        criticidad_alta: 0,
        criticidad_media: 0,
        criticidad_baja: 0,
        tipos_frecuentes: []
      },
      proximas_fechas: []
    };
  } finally {
    loading.value = false;
  }
}

function getGradientColor() {
  if (!stats.value) return { start: '#6b7280', end: '#6b7280' };
  const percentage = stats.value.porcentaje_cumplimiento;
  
  if (percentage >= 80) return { start: '#10b981', end: '#34d399' }; // Verde
  if (percentage >= 60) return { start: '#f59e0b', end: '#fbbf24' }; // Amarillo
  if (percentage >= 40) return { start: '#f97316', end: '#fb923c' }; // Naranja
  return { start: '#ef4444', end: '#f87171' }; // Rojo
}

function getStatPercentage(stat) {
  if (!stats.value || stats.value.total_obligaciones === 0) return '0%';
  const value = stats.value[stat] || 0;
  const percentage = (value / stats.value.total_obligaciones) * 100;
  return `${Math.round(percentage)}%`;
}

function getRiskIcon() {
  switch (stats.value?.riesgo_nivel) {
    case 'alto': return 'ph-warning-circle';
    case 'medio': return 'ph-info';
    default: return 'ph-check-circle';
  }
}

function getRiskLabel() {
  switch (stats.value?.riesgo_nivel) {
    case 'alto': return 'Alto Riesgo';
    case 'medio': return 'Riesgo Medio';
    default: return 'Bajo Riesgo';
  }
}

function getTendenciaClass() {
  switch (stats.value?.tendencia_cumplimiento) {
    case 'mejora': return 'metric-success';
    case 'deterioro': return 'metric-danger';
    default: return 'metric-neutral';
  }
}

function getTendenciaIcon() {
  switch (stats.value?.tendencia_cumplimiento) {
    case 'mejora': return 'ph-trend-up';
    case 'deterioro': return 'ph-trend-down';
    default: return 'ph-minus';
  }
}

function getTendenciaLabel() {
  switch (stats.value?.tendencia_cumplimiento) {
    case 'mejora': return 'Mejorando';
    case 'deterioro': return 'Deterioro';
    default: return 'Estable';
  }
}

function getCriticidadPercentage(nivel) {
  if (!stats.value?.incidentes) return '0%';
  
  const total = stats.value.incidentes.total;
  if (total === 0) return '0%';
  
  let cantidad = 0;
  switch (nivel) {
    case 'alta': cantidad = stats.value.incidentes.criticidad_alta; break;
    case 'media': cantidad = stats.value.incidentes.criticidad_media; break;
    case 'baja': cantidad = stats.value.incidentes.criticidad_baja; break;
  }
  
  return `${Math.round((cantidad / total) * 100)}%`;
}

function formatDate(isoDate) {
  if (!isoDate) return 'N/A';
  try {
    return new Date(isoDate).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short'
    });
  } catch (e) {
    return 'N/A';
  }
}

// Validación de totales - verifica que la suma de partes sea igual al total
function validateObligacionesTotal() {
  if (!stats.value) return true;
  
  const total = stats.value.total_obligaciones;
  const implementadas = stats.value.implementadas || 0;
  const enProceso = stats.value.en_proceso || 0;
  const pendientes = stats.value.pendientes || 0;
  const vencidas = stats.value.vencidas || 0;
  const noAplica = stats.value.no_aplica || 0;
  
  // Calcular la suma como se muestra en el frontend
  // Nota: En el frontend, pendientes y vencidas se muestran juntas en la card "Pendientes"
  const pendientesMostrados = pendientes + vencidas;
  const sumaPartes = implementadas + enProceso + pendientesMostrados + noAplica;
  
  // Verificar que la suma cuadre con el total
  if (sumaPartes !== total) {
    console.warn(`⚠️ Suma de partes (${sumaPartes}) no coincide con total (${total})`);
    console.warn(`Desglose: implementadas=${implementadas}, en_proceso=${enProceso}, pendientes_mostrados=${pendientesMostrados} (pendientes=${pendientes} + vencidas=${vencidas}), no_aplica=${noAplica}`);
    console.warn(`Los datos mostrados son: ${implementadas} cumplidas, ${enProceso} en proceso, ${pendientesMostrados} pendientes, total dice ${total}`);
    return false;
  }
  
  return true;
}

// Navegación a acompañamiento con filtros
function navigateToAcompanamiento(filtro) {
  // Validar antes de navegar
  if (!validateObligacionesTotal()) {
    alert('Los datos de acompañamiento parecen inconsistentes. Verificando...');
  }
  
  emit('navigate-with-filter', {
    modulo: 'Acompanamiento',
    filtro: filtro,
    tipoEmpresa: stats.value?.tipo_empresa
  });
}

// Navegación a incidentes con filtros
function navigateToIncidentes(filtro, valor = null) {
  const filtroData = {
    modulo: 'Incidentes',
    filtro: filtro,
    valor: valor
  };
  
  // Preparar filtros específicos
  switch (filtro) {
    case 'total':
      filtroData.periodo = 'ultimos_60_dias';
      break;
    case 'activos':
      filtroData.estado = 'Abierto';
      break;
    case 'cerrados':
      filtroData.estado = 'Cerrado';
      break;
    case 'pendientes':
      filtroData.estado = 'Pendiente';
      break;
    case 'criticidad':
      filtroData.criticidad = valor;
      break;
    case 'tipo':
      filtroData.tipoFlujo = valor;
      break;
  }
  
  emit('navigate-with-filter', filtroData);
}

onMounted(() => {
  loadStats().then(() => {
    // Validar después de cargar datos
    validateObligacionesTotal();
  });
});
</script>

<style scoped>
.dashboard-container {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #374151;
  position: relative;
  overflow: visible;
  max-width: 100%;
  box-sizing: border-box;
  width: 100%;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
}

/* Loading States */
.dashboard-skeleton {
  animation: pulse 2s infinite;
}

.skeleton-bar {
  height: 8px;
  background: #374151;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.skeleton-stat {
  height: 60px;
  background: #374151;
  border-radius: 8px;
}

/* Dashboard Header */
.dashboard-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: start;
}

/* Progress Ring */
.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: fit-content;
}

/* Global Metrics */
.global-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  min-width: 0;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
  min-width: 0;
}

.metric-icon {
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.metric-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.125rem;
  overflow: hidden;
}

.metric-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.metric-label {
  font-size: 0.75rem;
  color: #d1d5db;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.125rem;
}

.metric-sublabel {
  font-size: 0.625rem;
  color: #9ca3af;
  text-transform: uppercase;
  margin-top: 0.125rem;
}

.metric-primary .metric-icon { color: #4f46e5; background: rgba(79, 70, 229, 0.15); }
.metric-secondary .metric-icon { color: #10b981; background: rgba(16, 185, 129, 0.15); }
.metric-success .metric-icon { color: #10b981; background: rgba(16, 185, 129, 0.15); }
.metric-danger .metric-icon { color: #ef4444; background: rgba(239, 68, 68, 0.15); }
.metric-neutral .metric-icon { color: #6b7280; background: rgba(107, 114, 128, 0.15); }

.progress-ring-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-text {
  position: absolute;
  text-align: center;
  color: white;
}

.progress-percentage {
  font-size: 2rem;
  font-weight: 800;
  display: block;
  line-height: 1;
}

.progress-label {
  font-size: 0.875rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Risk Badge */
.risk-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.risk-bajo {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.risk-medio {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.risk-alto {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Acompañamiento Section */
.acompanamiento-section {
  margin-bottom: 0.75rem;
}

.acompanamiento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.acompanamiento-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;
  text-align: center;
  min-height: 100px;
}

.acompanamiento-card:hover {
  transform: translateY(-2px);
}

.acompanamiento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.acompanamiento-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.acompanamiento-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.25rem;
}

.acompanamiento-percent {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-top: 0.25rem;
}

.acompanamiento-total { border-top: 3px solid #6b7280; }
.acompanamiento-total i { color: #6b7280; }

.acompanamiento-implementado { border-top: 3px solid #10b981; }
.acompanamiento-implementado i { color: #10b981; }

.acompanamiento-proceso { border-top: 3px solid #f59e0b; }
.acompanamiento-proceso i { color: #f59e0b; }

.acompanamiento-pendiente { border-top: 3px solid #ef4444; }
.acompanamiento-pendiente i { color: #ef4444; }

/* Clickable styles */
.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.clickable:active {
  transform: translateY(0) scale(0.98);
}





/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Incidentes Section */
.incidentes-section {
  margin-bottom: 1rem;
}

.incidentes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.incidente-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;
}

.incidente-card:hover {
  transform: translateY(-2px);
}

.incidente-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.incidente-number {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
}

.incidente-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.incidente-total { border-top: 3px solid #6b7280; }
.incidente-total i { color: #6b7280; }

.incidente-activo { border-top: 3px solid #ef4444; }
.incidente-activo i { color: #ef4444; }

.incidente-cerrado { border-top: 3px solid #10b981; }
.incidente-cerrado i { color: #10b981; }

.incidente-pendiente { border-top: 3px solid #f59e0b; }
.incidente-pendiente i { color: #f59e0b; }

/* Incidentes Details */
.incidentes-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Criticidad Section */
.criticidad-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #d1d5db;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.criticidad-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.criticidad-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  font-size: 0.75rem;
  color: #d1d5db;
  min-width: 3rem;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.125rem;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 0.625rem;
  transition: width 0.8s ease;
  background: linear-gradient(90deg, currentColor, currentColor);
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  min-width: 1.5rem;
  text-align: center;
}

.criticidad-alta .bar-fill { color: #ef4444; }
.criticidad-media .bar-fill { color: #f59e0b; }
.criticidad-baja .bar-fill { color: #10b981; }

/* Tipos Section */
.tipos-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tipos-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tipo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border-left: 3px solid transparent;
}

.tipo-rank {
  font-size: 0.75rem;
  font-weight: 800;
  color: #9ca3af;
  min-width: 1.5rem;
}

.tipo-name {
  flex: 1;
  font-size: 0.875rem;
  color: #d1d5db;
  font-weight: 500;
}

.tipo-count {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.tipo-rank-1 { border-left-color: #fbbf24; }
.tipo-rank-2 { border-left-color: #9ca3af; }
.tipo-rank-3 { border-left-color: #cd7c2f; }

/* Upcoming Section */
.upcoming-section {
  margin-bottom: 1rem;
}

.upcoming-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.upcoming-item.urgent {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.upcoming-days {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 3rem;
}

.days-number {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.days-label {
  font-size: 0.625rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.upcoming-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.upcoming-article {
  font-weight: 600;
  color: #d1d5db;
  font-size: 0.875rem;
}

.upcoming-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Actions Section */
.actions-section {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.tertiary {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

/* Error State */
.dashboard-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-header {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .global-metrics {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
  }
  
  .incidentes-details {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .acompanamiento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .incidentes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .acompanamiento-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
  }
  
  .incidentes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.375rem;
  }
  
  .global-metrics {
    grid-template-columns: 1fr;
    gap: 0.375rem;
  }
  
  .progress-section {
    align-items: center;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .metric-card {
    flex-direction: row;
    text-align: left;
    gap: 0.375rem;
    padding: 0.375rem;
  }
  
  .dashboard-container {
    padding: 0.5rem;
  }
  
  .incidentes-details {
    gap: 0.375rem;
  }
  
  .acompanamiento-card {
    padding: 0.375rem;
  }
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>