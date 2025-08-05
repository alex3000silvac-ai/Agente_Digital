<template>
  <div class="vista-cuenta-regresiva">
    <!-- Header con navegación -->
    <div class="header-navegacion">
      <div class="breadcrumb">
        <router-link to="/dashboard" class="breadcrumb-item">
          <i class="ph ph-house"></i> Dashboard
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <router-link to="/gestion/inquilinos" class="breadcrumb-item">
          Inquilinos
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <router-link 
          :to="`/inquilino/${route.params.inquilinoId}/empresas`" 
          class="breadcrumb-item"
        >
          Empresas
        </router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Cuenta Regresiva ANCI</span>
      </div>
    </div>

    <!-- Título principal -->
    <div class="titulo-principal">
      <h1>
        <i class="ph ph-timer"></i>
        Cuenta Regresiva - Informes ANCI
      </h1>
      <p class="subtitulo">
        Control de plazos y vencimientos para informes ANCI
      </p>
    </div>

    <!-- Filtros -->
    <div class="seccion-filtros">
      <div class="filtro-grupo">
        <label>Estado</label>
        <select v-model="filtros.estado" @change="aplicarFiltros">
          <option value="">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="proximo">Próximos a vencer</option>
          <option value="vencido">Vencidos</option>
          <option value="completado">Completados</option>
        </select>
      </div>
      
      <div class="filtro-grupo">
        <label>Tipo de informe</label>
        <select v-model="filtros.tipo" @change="aplicarFiltros">
          <option value="">Todos</option>
          <option value="preliminar">Preliminar (24h)</option>
          <option value="completo">Completo</option>
          <option value="final">Final</option>
        </select>
      </div>

      <div class="filtro-grupo">
        <label>Empresa</label>
        <select v-model="filtros.empresa" @change="aplicarFiltros">
          <option value="">Todas</option>
          <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
            {{ empresa.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="estadisticas-grid">
      <div class="stat-card urgente">
        <div class="stat-icon">
          <i class="ph ph-warning-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-numero">{{ estadisticas.urgentes }}</div>
          <div class="stat-label">Urgentes (< 6h)</div>
        </div>
      </div>

      <div class="stat-card proximo">
        <div class="stat-icon">
          <i class="ph ph-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-numero">{{ estadisticas.proximos }}</div>
          <div class="stat-label">Próximos (< 24h)</div>
        </div>
      </div>

      <div class="stat-card pendiente">
        <div class="stat-icon">
          <i class="ph ph-hourglass-medium"></i>
        </div>
        <div class="stat-content">
          <div class="stat-numero">{{ estadisticas.pendientes }}</div>
          <div class="stat-label">En plazo</div>
        </div>
      </div>

      <div class="stat-card completado">
        <div class="stat-icon">
          <i class="ph ph-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-numero">{{ estadisticas.completados }}</div>
          <div class="stat-label">Completados</div>
        </div>
      </div>
    </div>

    <!-- Lista de incidentes con cuenta regresiva -->
    <div class="lista-cuenta-regresiva">
      <div v-if="cargando" class="estado-carga">
        <i class="ph ph-spinner-gap rotating"></i>
        <p>Cargando información de plazos...</p>
      </div>

      <div v-else-if="incidentesFiltrados.length === 0" class="estado-vacio">
        <i class="ph ph-clock"></i>
        <p>No hay incidentes con plazos pendientes</p>
      </div>

      <div v-else class="tabla-responsive">
        <table class="tabla-incidentes">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>Incidente</th>
              <th>Fecha Detección</th>
              <th>Informe Preliminar</th>
              <th>Informe Completo</th>
              <th>Informe Final</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incidente in incidentesFiltrados" :key="incidente.id"
                :class="{ 'fila-urgente': incidente.esUrgente, 'fila-vencida': incidente.tieneVencidos }">
              <td>{{ incidente.idVisible }}</td>
              <td>{{ incidente.empresa }}</td>
              <td class="titulo-incidente">{{ incidente.titulo }}</td>
              <td>{{ formatearFecha(incidente.fechaDeteccion) }}</td>
              
              <!-- Columna Informe Preliminar -->
              <td>
                <div class="estado-plazo" :class="incidente.preliminar.clase">
                  <i :class="incidente.preliminar.icono"></i>
                  <span>{{ incidente.preliminar.texto }}</span>
                  <div v-if="incidente.preliminar.tiempoRestante" class="tiempo-restante">
                    {{ incidente.preliminar.tiempoRestante }}
                  </div>
                </div>
              </td>

              <!-- Columna Informe Completo -->
              <td>
                <div class="estado-plazo" :class="incidente.completo.clase">
                  <i :class="incidente.completo.icono"></i>
                  <span>{{ incidente.completo.texto }}</span>
                  <div v-if="incidente.completo.tiempoRestante" class="tiempo-restante">
                    {{ incidente.completo.tiempoRestante }}
                  </div>
                </div>
              </td>

              <!-- Columna Informe Final -->
              <td>
                <div class="estado-plazo" :class="incidente.final.clase">
                  <i :class="incidente.final.icono"></i>
                  <span>{{ incidente.final.texto }}</span>
                  <div v-if="incidente.final.tiempoRestante" class="tiempo-restante">
                    {{ incidente.final.tiempoRestante }}
                  </div>
                </div>
              </td>

              <td class="acciones">
                <router-link 
                  :to="`/informes-anci/${incidente.id}`"
                  class="btn-accion generar"
                  title="Generar informe"
                >
                  <i class="ph ph-file-text"></i>
                </router-link>
                <router-link 
                  :to="`/incidente-detalle/${incidente.id}`"
                  class="btn-accion ver"
                  title="Ver detalle"
                >
                  <i class="ph ph-eye"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="leyenda">
      <h3>Leyenda de Estados</h3>
      <div class="leyenda-items">
        <div class="leyenda-item">
          <span class="estado-plazo completado">
            <i class="ph ph-check-circle"></i> Completado
          </span>
          <span>Informe ya generado y enviado</span>
        </div>
        <div class="leyenda-item">
          <span class="estado-plazo en-plazo">
            <i class="ph ph-hourglass-medium"></i> En plazo
          </span>
          <span>Tiempo suficiente para generar</span>
        </div>
        <div class="leyenda-item">
          <span class="estado-plazo proximo">
            <i class="ph ph-warning"></i> Próximo
          </span>
          <span>Menos de 6 horas restantes</span>
        </div>
        <div class="leyenda-item">
          <span class="estado-plazo vencido">
            <i class="ph ph-x-circle"></i> Vencido
          </span>
          <span>Plazo excedido</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '@/config'

const route = useRoute()

// Estado
const cargando = ref(true)
const incidentes = ref([])
const empresas = ref([])
const intervalId = ref(null)

// Filtros
const filtros = ref({
  estado: '',
  tipo: '',
  empresa: ''
})

// Estadísticas
const estadisticas = computed(() => {
  const stats = {
    urgentes: 0,
    proximos: 0,
    pendientes: 0,
    completados: 0
  }

  incidentes.value.forEach(incidente => {
    // Contar urgentes (< 6 horas)
    if (incidente.preliminar.horasRestantes > 0 && incidente.preliminar.horasRestantes < 6) stats.urgentes++
    if (incidente.completo.horasRestantes > 0 && incidente.completo.horasRestantes < 6) stats.urgentes++
    if (incidente.final.horasRestantes > 0 && incidente.final.horasRestantes < 6) stats.urgentes++

    // Contar próximos (< 24 horas)
    if (incidente.preliminar.horasRestantes > 6 && incidente.preliminar.horasRestantes < 24) stats.proximos++
    if (incidente.completo.horasRestantes > 6 && incidente.completo.horasRestantes < 24) stats.proximos++
    if (incidente.final.horasRestantes > 6 && incidente.final.horasRestantes < 24) stats.proximos++

    // Contar pendientes
    if (incidente.preliminar.estado === 'pendiente') stats.pendientes++
    if (incidente.completo.estado === 'pendiente') stats.pendientes++
    if (incidente.final.estado === 'pendiente') stats.pendientes++

    // Contar completados
    if (incidente.preliminar.estado === 'completado') stats.completados++
    if (incidente.completo.estado === 'completado') stats.completados++
    if (incidente.final.estado === 'completado') stats.completados++
  })

  return stats
})

// Incidentes filtrados
const incidentesFiltrados = computed(() => {
  return incidentes.value.filter(incidente => {
    // Filtro por estado
    if (filtros.value.estado) {
      const tieneEstado = 
        incidente.preliminar.estado === filtros.value.estado ||
        incidente.completo.estado === filtros.value.estado ||
        incidente.final.estado === filtros.value.estado
      if (!tieneEstado) return false
    }

    // Filtro por tipo
    if (filtros.value.tipo) {
      // Lógica específica por tipo de informe
      if (filtros.value.tipo === 'preliminar' && incidente.preliminar.estado === 'no-aplica') return false
      if (filtros.value.tipo === 'completo' && incidente.completo.estado === 'no-aplica') return false
      if (filtros.value.tipo === 'final' && incidente.final.estado === 'no-aplica') return false
    }

    // Filtro por empresa
    if (filtros.value.empresa && incidente.empresaId !== parseInt(filtros.value.empresa)) {
      return false
    }

    return true
  })
})

// Funciones
async function cargarDatos() {
  try {
    console.log('⏱️ Cargando datos de cuenta regresiva...')
    
    // Cargar empresas del inquilino
    const inquilinoId = route.params.inquilinoId
    if (inquilinoId) {
      const respEmpresas = await axios.get(`${API_BASE_URL}/admin/inquilinos/${inquilinoId}/empresas`)
      empresas.value = respEmpresas.data
    }

    // Cargar incidentes con plazos
    const respIncidentes = await axios.get(`${API_BASE_URL}/informes-anci/cuenta-regresiva`, {
      params: inquilinoId ? { inquilino_id: inquilinoId } : {}
    })
    
    incidentes.value = procesarIncidentes(respIncidentes.data)
    console.log('✅ Datos de cuenta regresiva cargados:', incidentes.value.length)
  } catch (error) {
    console.error('❌ Error cargando cuenta regresiva:', error)
  } finally {
    cargando.value = false
  }
}

function procesarIncidentes(datos) {
  return datos.map(incidente => {
    const fechaDeteccion = new Date(incidente.fechaDeteccion)
    const ahora = new Date()
    
    // Calcular estados y tiempos para cada tipo de informe
    const preliminar = calcularEstadoInforme(fechaDeteccion, ahora, 24, incidente.informePreliminar)
    const completo = calcularEstadoInforme(fechaDeteccion, ahora, 72, incidente.informeCompleto)
    const final = calcularEstadoInforme(fechaDeteccion, ahora, 720, incidente.informeFinal) // 30 días

    return {
      id: incidente.id,
      idVisible: incidente.idVisible,
      empresa: incidente.empresa,
      empresaId: incidente.empresaId,
      titulo: incidente.titulo,
      fechaDeteccion: incidente.fechaDeteccion,
      preliminar,
      completo,
      final,
      esUrgente: preliminar.esUrgente || completo.esUrgente || final.esUrgente,
      tieneVencidos: preliminar.estado === 'vencido' || completo.estado === 'vencido' || final.estado === 'vencido'
    }
  })
}

function calcularEstadoInforme(fechaDeteccion, ahora, horasPlazo, yaGenerado) {
  if (yaGenerado) {
    return {
      estado: 'completado',
      clase: 'completado',
      icono: 'ph ph-check-circle',
      texto: 'Completado',
      tiempoRestante: null,
      horasRestantes: 0,
      esUrgente: false
    }
  }

  const fechaLimite = new Date(fechaDeteccion.getTime() + horasPlazo * 60 * 60 * 1000)
  const diferencia = fechaLimite - ahora
  const horasRestantes = Math.floor(diferencia / (1000 * 60 * 60))
  const minutosRestantes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

  if (diferencia <= 0) {
    return {
      estado: 'vencido',
      clase: 'vencido',
      icono: 'ph ph-x-circle',
      texto: 'Vencido',
      tiempoRestante: formatearTiempoVencido(-horasRestantes, -minutosRestantes),
      horasRestantes: 0,
      esUrgente: false
    }
  } else if (horasRestantes < 6) {
    return {
      estado: 'proximo',
      clase: 'proximo',
      icono: 'ph ph-warning',
      texto: 'Próximo',
      tiempoRestante: formatearTiempoRestante(horasRestantes, minutosRestantes),
      horasRestantes,
      esUrgente: true
    }
  } else {
    return {
      estado: 'pendiente',
      clase: 'en-plazo',
      icono: 'ph ph-hourglass-medium',
      texto: 'En plazo',
      tiempoRestante: formatearTiempoRestante(horasRestantes, minutosRestantes),
      horasRestantes,
      esUrgente: false
    }
  }
}

function formatearTiempoRestante(horas, minutos) {
  if (horas >= 24) {
    const dias = Math.floor(horas / 24)
    return `${dias}d ${horas % 24}h`
  }
  return `${horas}h ${minutos}m`
}

function formatearTiempoVencido(horas, minutos) {
  if (horas >= 24) {
    const dias = Math.floor(horas / 24)
    return `Hace ${dias}d`
  }
  return `Hace ${horas}h`
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function aplicarFiltros() {
  // Los filtros se aplican reactivamente a través del computed
  console.log('🔍 Aplicando filtros:', filtros.value)
}

// Actualizar cuenta regresiva cada minuto
function actualizarCuentaRegresiva() {
  incidentes.value = procesarIncidentes(incidentes.value)
}

// Lifecycle
onMounted(() => {
  cargarDatos()
  // Actualizar cada minuto
  intervalId.value = setInterval(actualizarCuentaRegresiva, 60000)
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<style scoped>
.vista-cuenta-regresiva {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header y navegación */
.header-navegacion {
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #8a8a8a;
}

.breadcrumb-item {
  color: #00d4ff;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-item:hover {
  color: #00a3cc;
}

.breadcrumb-separator {
  color: #666;
}

.breadcrumb-current {
  color: #e0e0e0;
}

/* Título */
.titulo-principal {
  margin-bottom: 2rem;
}

.titulo-principal h1 {
  font-size: 2rem;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.titulo-principal h1 i {
  color: #00d4ff;
}

.subtitulo {
  color: #8a8a8a;
  font-size: 1rem;
}

/* Filtros */
.seccion-filtros {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.filtro-grupo {
  flex: 1;
  min-width: 200px;
}

.filtro-grupo label {
  display: block;
  color: #8a8a8a;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.filtro-grupo select {
  width: 100%;
  padding: 0.5rem 1rem;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

/* Estadísticas */
.estadisticas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-numero {
  font-size: 2rem;
  font-weight: 600;
  color: #e0e0e0;
}

.stat-label {
  font-size: 0.9rem;
  color: #8a8a8a;
}

/* Colores por tipo */
.stat-card.urgente .stat-icon {
  color: #ff4444;
}

.stat-card.proximo .stat-icon {
  color: #ff9800;
}

.stat-card.pendiente .stat-icon {
  color: #00d4ff;
}

.stat-card.completado .stat-icon {
  color: #4caf50;
}

/* Lista de incidentes */
.lista-cuenta-regresiva {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

/* Estados */
.estado-carga,
.estado-vacio {
  text-align: center;
  padding: 3rem;
  color: #8a8a8a;
}

.estado-carga i,
.estado-vacio i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  color: #00d4ff;
}

/* Tabla */
.tabla-responsive {
  overflow-x: auto;
}

.tabla-incidentes {
  width: 100%;
  border-collapse: collapse;
}

.tabla-incidentes th,
.tabla-incidentes td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabla-incidentes th {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.tabla-incidentes td {
  color: #e0e0e0;
}

.titulo-incidente {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Filas especiales */
.fila-urgente {
  background: rgba(255, 68, 68, 0.05);
}

.fila-vencida {
  background: rgba(255, 68, 68, 0.1);
}

/* Estados de plazo */
.estado-plazo {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  min-width: 100px;
}

.estado-plazo i {
  font-size: 1.2rem;
}

.tiempo-restante {
  font-size: 0.75rem;
  font-weight: 600;
}

.estado-plazo.completado {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.estado-plazo.en-plazo {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
}

.estado-plazo.proximo {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.estado-plazo.vencido {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

/* Acciones */
.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-accion.generar {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.btn-accion.generar:hover {
  background: rgba(0, 212, 255, 0.2);
  transform: scale(1.05);
}

.btn-accion.ver {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.btn-accion.ver:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: scale(1.05);
}

/* Leyenda */
.leyenda {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.leyenda h3 {
  color: #e0e0e0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.leyenda-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #8a8a8a;
  font-size: 0.9rem;
}

/* Animaciones */
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: rotating 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .seccion-filtros {
    flex-direction: column;
  }
  
  .filtro-grupo {
    width: 100%;
  }
  
  .estadisticas-grid {
    grid-template-columns: 1fr;
  }
  
  .tabla-incidentes {
    font-size: 0.85rem;
  }
  
  .tabla-incidentes th,
  .tabla-incidentes td {
    padding: 0.5rem;
  }
  
  .estado-plazo {
    min-width: 80px;
    font-size: 0.75rem;
  }
}
</style>