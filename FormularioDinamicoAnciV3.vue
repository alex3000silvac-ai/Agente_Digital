<template>
  <div class="formulario-anci-dinamico-v3">
    <!-- Header del formulario -->
    <div class="formulario-header">
      <div class="header-content">
        <div class="titulo-seccion">
          <i class="fas fa-file-alt header-icon"></i>
          <div class="titulo-info">
            <h2 class="formulario-titulo">Formulario Dinámico ANCI v3.0</h2>
            <p class="empresa-info">
              <span class="empresa-nombre">{{ empresaInfo.razonSocial }}</span>
              <span class="separador">•</span>
              <span class="empresa-tipo" :class="'tipo-' + empresaInfo.tipoEmpresa.toLowerCase()">
                {{ getTipoEmpresaLabel(empresaInfo.tipoEmpresa) }}
              </span>
            </p>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            v-if="!editandoFormulario" 
            @click="iniciarEdicion" 
            class="btn btn-primary btn-editar"
            :disabled="cargando"
          >
            <i class="fas fa-edit"></i>
            Editar Formulario
          </button>
          
          <button 
            v-if="editandoFormulario" 
            @click="finalizarEdicion" 
            class="btn btn-success btn-finalizar"
          >
            <i class="fas fa-save"></i>
            Finalizar Edición
          </button>
        </div>
      </div>
      
      <!-- Indicador de estado de edición -->
      <div v-if="editandoFormulario" class="edicion-indicator">
        <div class="indicator-content">
          <i class="fas fa-lock indicator-icon"></i>
          <span class="indicator-text">Editando formulario</span>
          <span class="indicator-time">Desde: {{ formatFecha(fechaInicioEdicion) }}</span>
        </div>
      </div>
    </div>

    <!-- Estadísticas del formulario -->
    <div class="formulario-stats" v-if="estadisticas">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-list"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ estadisticas.seccionesAplicables }}</span>
          <span class="stat-label">Secciones Totales</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ estadisticas.seccionesCompletadas || 0 }}</span>
          <span class="stat-label">Completadas</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-file"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ estadisticas.totalArchivos || 0 }}</span>
          <span class="stat-label">Archivos</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ Math.round(estadisticas.porcentajeCompletado || 0) }}%</span>
          <span class="stat-label">Progreso</span>
        </div>
      </div>
    </div>

    <!-- Barra de progreso -->
    <div class="progress-container" v-if="estadisticas">
      <div class="progress-header">
        <span class="progress-label">Progreso del formulario</span>
        <span class="progress-fraction">
          {{ estadisticas.seccionesCompletadas || 0 }}/{{ estadisticas.seccionesAplicables || 0 }}
        </span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: (estadisticas.porcentajeCompletado || 0) + '%' }"
          :class="getProgressClass(estadisticas.porcentajeCompletado || 0)"
        ></div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="cargando" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <span class="loading-text">{{ mensajeCarga }}</span>
    </div>

    <!-- Error state -->
    <div v-if="error && !cargando" class="error-container">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle error-icon"></i>
        <h3>Error al cargar el formulario</h3>
        <p>{{ error }}</p>
        <button @click="inicializar" class="btn btn-outline-primary">
          <i class="fas fa-redo"></i>
          Reintentar
        </button>
      </div>
    </div>

    <!-- Controles del formulario -->
    <div v-if="!cargando && !error && secciones.length > 0" class="formulario-controles">
      <div class="controles-izquierda">
        <button @click="expandirTodas" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-expand-alt"></i>
          Expandir Todas
        </button>
        <button @click="contraerTodas" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-compress-alt"></i>
          Contraer Todas
        </button>
        <button @click="mostrarSoloObligatorias" class="btn btn-outline-info btn-sm">
          <i class="fas fa-star"></i>
          Solo Obligatorias
        </button>
      </div>
      
      <div class="controles-derecha">
        <button @click="limpiarHuerfanos" class="btn btn-outline-warning btn-sm" :disabled="!editandoFormulario">
          <i class="fas fa-broom"></i>
          Limpiar Archivos
        </button>
        <button @click="validarFormulario" class="btn btn-outline-success btn-sm">
          <i class="fas fa-check-double"></i>
          Validar
        </button>
      </div>
    </div>

    <!-- Acordeón dinámico de secciones -->
    <div v-if="!cargando && !error && secciones.length > 0" class="acordeon-dinamico">
      <div 
        v-for="(seccion, index) in seccionesFiltradas" 
        :key="seccion.codigoSeccion"
        class="seccion-item"
        :class="getClasesSeccion(seccion)"
        :data-seccion="seccion.codigoSeccion"
      >
        <!-- Header de la sección -->
        <div class="seccion-header" @click="toggleSeccion(seccion)">
          <div class="seccion-header-content">
            <div class="seccion-principal">
              <div class="seccion-numero">{{ index + 1 }}</div>
              <div 
                class="seccion-indicator" 
                :style="{ backgroundColor: seccion.colorIndicador }"
              ></div>
              <i :class="'fas fa-' + seccion.iconoSeccion" class="seccion-icono"></i>
              <div class="seccion-info">
                <h3 class="seccion-titulo">{{ seccion.titulo }}</h3>
                <p class="seccion-descripcion">{{ seccion.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>
            
            <div class="seccion-meta">
              <div class="seccion-badges">
                <span v-if="seccion.esObligatorio" class="badge badge-obligatorio">
                  <i class="fas fa-star"></i>
                  Obligatorio
                </span>
                <span class="badge badge-tipo" :class="'badge-' + seccion.tipoSeccion.toLowerCase()">
                  {{ getTipoSeccionLabel(seccion.tipoSeccion) }}
                </span>
                <span class="badge badge-estado" :class="'badge-' + getEstadoSeccion(seccion)">
                  {{ getEstadoSeccionLabel(seccion) }}
                </span>
              </div>
              
              <div class="seccion-stats">
                <span v-if="getArchivosSeccion(seccion) > 0" class="stat-item">
                  <i class="fas fa-file"></i>
                  {{ getArchivosSeccion(seccion) }}/{{ seccion.maxArchivos }}
                </span>
                <span v-if="getComentariosSeccion(seccion) > 0" class="stat-item">
                  <i class="fas fa-comment"></i>
                  {{ getComentariosSeccion(seccion) }}/{{ seccion.maxComentarios }}
                </span>
                <span class="stat-item">
                  <i class="fas fa-tasks"></i>
                  {{ getCamposCompletados(seccion) }}/{{ getCamposTotales(seccion) }}
                </span>
              </div>
            </div>
            
            <div class="seccion-toggle">
              <i 
                class="fas fa-chevron-down toggle-icon" 
                :class="{ 'rotated': seccion.expandida }"
              ></i>
            </div>
          </div>
        </div>

        <!-- Contenido de la sección -->
        <transition name="seccion-content">
          <div v-if="seccion.expandida" class="seccion-contenido">
            <div class="contenido-wrapper">
              <!-- Instrucciones de la sección -->
              <div v-if="seccion.instrucciones" class="seccion-instrucciones">
                <i class="fas fa-info-circle"></i>
                <span>{{ seccion.instrucciones }}</span>
              </div>
              
              <div class="seccion-layout">
                <!-- Columna principal: Campos dinámicos -->
                <div class="campos-container">
                  <CamposDinamicosANCI
                    :seccion="seccion"
                    :datos="datosFormulario[seccion.codigoSeccion] || {}"
                    :solo-lectura="!editandoFormulario"
                    @datos-actualizados="actualizarDatosSeccion"
                    @campo-validado="validarCampoSeccion"
                  />
                </div>
                
                <!-- Columna lateral: Archivos y comentarios -->
                <div class="recursos-container">
                  <!-- Panel de archivos -->
                  <div class="panel-recursos archivos-panel">
                    <div class="panel-header">
                      <h4 class="panel-titulo">
                        <i class="fas fa-folder-open"></i>
                        Archivos
                        <span class="contador">({{ getArchivosSeccion(seccion) }}/{{ seccion.maxArchivos }})</span>
                      </h4>
                      <button 
                        v-if="editandoFormulario && getArchivosSeccion(seccion) < seccion.maxArchivos"
                        @click="mostrarSubirArchivo(seccion)"
                        class="btn-panel"
                      >
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    
                    <GestorArchivosANCI
                      :formulario-id="formularioId"
                      :codigo-seccion="seccion.codigoSeccion"
                      :max-archivos="seccion.maxArchivos"
                      :max-tamano-mb="seccion.maxSizeMB"
                      :solo-lectura="!editandoFormulario"
                      :token-edicion="tokenEdicion"
                      @archivos-actualizados="actualizarArchivosSeccion"
                      @archivo-subido="manejarArchivoSubido"
                      @archivo-eliminado="manejarArchivoEliminado"
                    />
                  </div>
                  
                  <!-- Panel de comentarios -->
                  <div class="panel-recursos comentarios-panel">
                    <div class="panel-header">
                      <h4 class="panel-titulo">
                        <i class="fas fa-comments"></i>
                        Comentarios
                        <span class="contador">({{ getComentariosSeccion(seccion) }}/{{ seccion.maxComentarios }})</span>
                      </h4>
                      <button 
                        v-if="editandoFormulario && getComentariosSeccion(seccion) < seccion.maxComentarios"
                        @click="mostrarAgregarComentario(seccion)"
                        class="btn-panel"
                      >
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                    
                    <GestorComentariosANCI
                      :formulario-id="formularioId"
                      :codigo-seccion="seccion.codigoSeccion"
                      :max-comentarios="seccion.maxComentarios"
                      :solo-lectura="!editandoFormulario"
                      @comentarios-actualizados="actualizarComentariosSeccion"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Acciones del formulario -->
    <div v-if="!cargando && !error && secciones.length > 0" class="formulario-acciones">
      <div class="acciones-principales">
        <button 
          @click="guardarBorrador" 
          class="btn btn-outline-primary btn-lg"
          :disabled="guardando || !editandoFormulario"
        >
          <i class="fas fa-save"></i>
          {{ guardando ? 'Guardando...' : 'Guardar Borrador' }}
        </button>
        
        <button 
          @click="validarFormularioCompleto" 
          class="btn btn-outline-warning btn-lg"
          :disabled="validando"
        >
          <i class="fas fa-check-circle"></i>
          {{ validando ? 'Validando...' : 'Validar Formulario' }}
        </button>
        
        <button 
          @click="completarFormulario" 
          class="btn btn-success btn-lg"
          :disabled="!formularioValido || guardando || !editandoFormulario"
        >
          <i class="fas fa-paper-plane"></i>
          Completar y Enviar a ANCI
        </button>
      </div>
      
      <div class="acciones-secundarias">
        <button @click="crearBackup" class="btn btn-outline-secondary">
          <i class="fas fa-archive"></i>
          Crear Backup
        </button>
        
        <button @click="verEstadisticas" class="btn btn-outline-info">
          <i class="fas fa-chart-bar"></i>
          Estadísticas
        </button>
      </div>
    </div>

    <!-- Modal de validación -->
    <ModalValidacionANCI
      v-if="mostrarModalValidacion"
      :resultados="resultadosValidacion"
      @cerrar="mostrarModalValidacion = false"
      @ir-a-seccion="irASeccionError"
    />
    
    <!-- Modal de estadísticas -->
    <ModalEstadisticasANCI
      v-if="mostrarModalEstadisticas"
      :estadisticas="estadisticasDetalladas"
      @cerrar="mostrarModalEstadisticas = false"
    />
  </div>
</template>

<script>
import CamposDinamicosANCI from './CamposDinamicosANCI.vue'
import GestorArchivosANCI from './GestorArchivosANCI.vue'
import GestorComentariosANCI from './GestorComentariosANCI.vue'
import ModalValidacionANCI from './ModalValidacionANCI.vue'
import ModalEstadisticasANCI from './ModalEstadisticasANCI.vue'

export default {
  name: 'FormularioDinamicoAnciV3',
  components: {
    CamposDinamicosANCI,
    GestorArchivosANCI,
    GestorComentariosANCI,
    ModalValidacionANCI,
    ModalEstadisticasANCI
  },
  props: {
    empresaId: {
      type: Number,
      required: true
    },
    incidenteId: {
      type: Number,
      default: null
    },
    formularioId: {
      type: Number,
      default: null
    },
    modo: {
      type: String,
      default: 'crear', // 'crear', 'editar', 'visualizar'
      validator: value => ['crear', 'editar', 'visualizar'].includes(value)
    }
  },
  data() {
    return {
      // Estado de carga
      cargando: false,
      error: null,
      mensajeCarga: 'Cargando configuración...',
      
      // Estados de operaciones
      guardando: false,
      validando: false,
      creandoBackup: false,
      
      // Información de la empresa
      empresaInfo: {},
      
      // Configuración del formulario
      secciones: [],
      estadisticas: null,
      capacidades: {},
      
      // Datos del formulario
      datosFormulario: {},
      archivosFormulario: {},
      comentariosFormulario: {},
      
      // Estado de edición
      editandoFormulario: false,
      tokenEdicion: null,
      fechaInicioEdicion: null,
      
      // Estado de validación
      formularioValido: false,
      erroresValidacion: {},
      resultadosValidacion: null,
      mostrarModalValidacion: false,
      
      // Estadísticas detalladas
      estadisticasDetalladas: null,
      mostrarModalEstadisticas: false,
      
      // Estado de la UI
      seccionesExpandidas: new Set(),
      filtroActivo: null, // null, 'obligatorias', 'completadas'
      
      // Auto-guardado
      timerAutoGuardado: null,
      ultimoGuardado: null
    }
  },
  computed: {
    seccionesFiltradas() {
      if (!this.filtroActivo) {
        return this.secciones
      }
      
      if (this.filtroActivo === 'obligatorias') {
        return this.secciones.filter(s => s.esObligatorio)
      }
      
      if (this.filtroActivo === 'completadas') {
        return this.secciones.filter(s => this.getEstadoSeccion(s) === 'completado')
      }
      
      return this.secciones
    },
    
    progresoCompletado() {
      if (!this.secciones.length) return 0
      return this.secciones.filter(s => this.getEstadoSeccion(s) === 'completado').length
    },
    
    porcentajeProgreso() {
      if (!this.secciones.length) return 0
      return Math.round((this.progresoCompletado / this.secciones.length) * 100)
    }
  },
  async mounted() {
    await this.inicializar()
    this.configurarAutoGuardado()
    this.configurarEventosVentana()
  },
  beforeDestroy() {
    this.limpiarRecursos()
  },
  methods: {
    async inicializar() {
      this.cargando = true
      this.error = null
      
      try {
        // Cargar configuración del formulario
        await this.cargarConfiguracion()
        
        // Si es modo editar o visualizar, cargar datos existentes
        if (this.modo !== 'crear' && this.formularioId) {
          await this.cargarDatosFormulario()
        }
        
        // Si es modo crear, crear nuevo formulario
        if (this.modo === 'crear' && this.incidenteId) {
          await this.crearNuevoFormulario()
        }
        
      } catch (error) {
        console.error('Error inicializando formulario:', error)
        this.error = 'Error cargando el formulario: ' + error.message
      } finally {
        this.cargando = false
      }
    },
    
    async cargarConfiguracion() {
      this.mensajeCarga = 'Cargando configuración del formulario...'
      
      const response = await this.$api.get(`/api/formulario-anci/configuracion/${this.empresaId}`)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error obteniendo configuración')
      }
      
      const data = response.data.data
      this.empresaInfo = data.empresa
      this.secciones = data.formulario.secciones.map(seccion => ({
        ...seccion,
        expandida: seccion.esObligatorio || false
      }))
      this.estadisticas = data.formulario.estadisticas
      this.capacidades = data.capacidades
      
      console.log('Configuración cargada:', data)
    },
    
    async crearNuevoFormulario() {
      this.mensajeCarga = 'Creando nuevo formulario...'
      
      const response = await this.$api.post('/api/formulario-anci/crear', {
        empresaId: this.empresaId,
        incidenteId: this.incidenteId,
        usuario: this.$store.state.user?.username || 'SISTEMA'
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error creando formulario')
      }
      
      const resultado = response.data.data
      this.formularioId = resultado.formularioId
      
      // Emitir evento para actualizar props del padre
      this.$emit('formulario-creado', {
        formularioId: resultado.formularioId,
        indiceUnico: resultado.indiceUnico
      })
      
      console.log('Formulario creado:', resultado)
    },
    
    async cargarDatosFormulario() {
      this.mensajeCarga = 'Cargando datos del formulario...'
      
      // Implementar carga de datos existentes
      // TODO: Implementar endpoint para cargar datos
      
      console.log('Cargando datos del formulario ID:', this.formularioId)
    },
    
    async iniciarEdicion() {
      if (!this.formularioId) {
        this.$toast.error('No hay formulario para editar')
        return
      }
      
      try {
        const response = await this.$api.post('/api/formulario-anci/iniciar-edicion', {
          formularioId: this.formularioId,
          usuario: this.$store.state.user?.username || 'SISTEMA'
        })
        
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        
        const resultado = response.data.data
        this.editandoFormulario = true
        this.tokenEdicion = resultado.tokenEdicion
        this.fechaInicioEdicion = new Date(resultado.fechaInicioEdicion)
        
        this.$toast.success('Edición iniciada correctamente')
        
      } catch (error) {
        console.error('Error iniciando edición:', error)
        this.$toast.error('Error iniciando edición: ' + error.message)
      }
    },
    
    async finalizarEdicion() {
      if (!this.tokenEdicion) return
      
      try {
        const response = await this.$api.post('/api/formulario-anci/finalizar-edicion', {
          formularioId: this.formularioId,
          usuario: this.$store.state.user?.username || 'SISTEMA',
          tokenEdicion: this.tokenEdicion
        })
        
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        
        this.editandoFormulario = false
        this.tokenEdicion = null
        this.fechaInicioEdicion = null
        
        this.$toast.success('Edición finalizada correctamente')
        
      } catch (error) {
        console.error('Error finalizando edición:', error)
        this.$toast.error('Error finalizando edición: ' + error.message)
      }
    },
    
    async actualizarDatosSeccion(codigoSeccion, datos) {
      // Actualizar datos localmente
      this.$set(this.datosFormulario, codigoSeccion, datos)
      
      // Guardar automáticamente si está editando
      if (this.editandoFormulario && this.tokenEdicion) {
        this.programarAutoGuardado()
      }
      
      // Validar sección automáticamente
      this.validarSeccion(codigoSeccion)
    },
    
    async guardarDatosSeccion(codigoSeccion, datos) {
      if (!this.editandoFormulario || !this.tokenEdicion) return
      
      try {
        const response = await this.$api.post('/api/formulario-anci/guardar-datos', {
          formularioId: this.formularioId,
          codigoSeccion: codigoSeccion,
          datos: datos,
          usuario: this.$store.state.user?.username || 'SISTEMA',
          tokenEdicion: this.tokenEdicion
        })
        
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        
        const resultado = response.data.data
        
        // Actualizar estadísticas
        if (this.estadisticas) {
          this.estadisticas.seccionesCompletadas = resultado.seccionesCompletadas
          this.estadisticas.porcentajeCompletado = resultado.porcentajeCompletado
        }
        
        this.ultimoGuardado = new Date()
        
      } catch (error) {
        console.error('Error guardando sección:', error)
        this.$toast.error('Error guardando datos: ' + error.message)
      }
    },
    
    async guardarBorrador() {
      if (!this.editandoFormulario) return
      
      this.guardando = true
      
      try {
        // Guardar todas las secciones con datos
        const promesasGuardado = Object.entries(this.datosFormulario).map(
          ([codigoSeccion, datos]) => this.guardarDatosSeccion(codigoSeccion, datos)
        )
        
        await Promise.all(promesasGuardado)
        
        this.$toast.success('Borrador guardado correctamente')
        
      } catch (error) {
        console.error('Error guardando borrador:', error)
        this.$toast.error('Error guardando borrador')
      } finally {
        this.guardando = false
      }
    },
    
    async limpiarHuerfanos() {
      if (!this.editandoFormulario) {
        this.$toast.warning('Debe estar en modo de edición para limpiar archivos')
        return
      }
      
      try {
        const response = await this.$api.post('/api/formulario-anci/limpiar-huerfanos', {
          formularioId: this.formularioId,
          accion: 'MARCAR'
        })
        
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        
        const resultado = response.data.data
        
        if (resultado.archivosHuerfanosDetectados > 0) {
          this.$toast.warning(`Se detectaron ${resultado.archivosHuerfanosDetectados} archivos huérfanos`)
        } else {
          this.$toast.success('No se detectaron archivos huérfanos')
        }
        
      } catch (error) {
        console.error('Error limpiando huérfanos:', error)
        this.$toast.error('Error limpiando archivos: ' + error.message)
      }
    },
    
    async validarFormularioCompleto() {
      this.validando = true
      
      try {
        // TODO: Implementar validación completa
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simular validación
        
        this.formularioValido = true
        this.$toast.success('Formulario válido para envío a ANCI')
        
      } catch (error) {
        console.error('Error validando formulario:', error)
        this.$toast.error('Error validando formulario')
      } finally {
        this.validando = false
      }
    },
    
    async completarFormulario() {
      if (!this.formularioValido) {
        this.$toast.warning('Debe validar el formulario antes de enviarlo')
        return
      }
      
      // TODO: Implementar envío final a ANCI
      this.$toast.success('Formulario enviado a ANCI correctamente')
      
      this.$emit('formulario-completado', {
        formularioId: this.formularioId,
        empresaId: this.empresaId,
        incidenteId: this.incidenteId
      })
    },
    
    async crearBackup() {
      this.creandoBackup = true
      
      try {
        // TODO: Implementar creación de backup
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.$toast.success('Backup creado correctamente')
        
      } catch (error) {
        console.error('Error creando backup:', error)
        this.$toast.error('Error creando backup')
      } finally {
        this.creandoBackup = false
      }
    },
    
    async verEstadisticas() {
      try {
        const response = await this.$api.get(`/api/formulario-anci/estadisticas/${this.formularioId}`)
        
        if (!response.data.success) {
          throw new Error(response.data.error)
        }
        
        this.estadisticasDetalladas = response.data.data
        this.mostrarModalEstadisticas = true
        
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
        this.$toast.error('Error cargando estadísticas')
      }
    },
    
    // Métodos de UI
    toggleSeccion(seccion) {
      seccion.expandida = !seccion.expandida
      
      if (seccion.expandida) {
        this.seccionesExpandidas.add(seccion.codigoSeccion)
      } else {
        this.seccionesExpandidas.delete(seccion.codigoSeccion)
      }
    },
    
    expandirTodas() {
      this.secciones.forEach(seccion => {
        seccion.expandida = true
        this.seccionesExpandidas.add(seccion.codigoSeccion)
      })
    },
    
    contraerTodas() {
      this.secciones.forEach(seccion => {
        seccion.expandida = false
      })
      this.seccionesExpandidas.clear()
    },
    
    mostrarSoloObligatorias() {
      this.filtroActivo = this.filtroActivo === 'obligatorias' ? null : 'obligatorias'
    },
    
    // Métodos de utilidad
    getClasesSeccion(seccion) {
      const estado = this.getEstadoSeccion(seccion)
      return {
        'seccion-completada': estado === 'completado',
        'seccion-parcial': estado === 'parcial',
        'seccion-obligatoria': seccion.esObligatorio,
        'seccion-taxonomia': seccion.tipoSeccion === 'TAXONOMIA',
        'seccion-especial': seccion.tipoSeccion === 'ESPECIAL',
        'seccion-expandida': seccion.expandida
      }
    },
    
    getEstadoSeccion(seccion) {
      const datos = this.datosFormulario[seccion.codigoSeccion] || {}
      const campos = seccion.camposJSON?.campos || []
      const camposRequeridos = campos.filter(c => c.requerido)
      
      if (camposRequeridos.length === 0) {
        return Object.keys(datos).length > 0 ? 'completado' : 'vacio'
      }
      
      const camposCompletos = camposRequeridos.filter(campo => {
        const valor = datos[campo.nombre]
        return valor && valor.toString().trim() !== ''
      })
      
      if (camposCompletos.length === camposRequeridos.length) return 'completado'
      if (camposCompletos.length > 0) return 'parcial'
      return 'vacio'
    },
    
    getEstadoSeccionLabel(seccion) {
      const estado = this.getEstadoSeccion(seccion)
      const labels = {
        completado: 'Completado',
        parcial: 'Parcial',
        vacio: 'Pendiente'
      }
      return labels[estado] || 'Pendiente'
    },
    
    getTipoSeccionLabel(tipo) {
      const labels = {
        FIJA: 'Sección Fija',
        TAXONOMIA: 'Taxonomía',
        ESPECIAL: 'Sección Especial',
        CONDICIONAL: 'Condicional'
      }
      return labels[tipo] || tipo
    },
    
    getTipoEmpresaLabel(tipo) {
      const labels = {
        OIV: 'Operador de Infraestructura Vital',
        PSE: 'Proveedor de Servicios Esenciales',
        AMBAS: 'OIV y PSE'
      }
      return labels[tipo] || tipo
    },
    
    getArchivosSeccion(seccion) {
      const archivos = this.archivosFormulario[seccion.codigoSeccion] || []
      return archivos.length
    },
    
    getComentariosSeccion(seccion) {
      const comentarios = this.comentariosFormulario[seccion.codigoSeccion] || []
      return comentarios.length
    },
    
    getCamposCompletados(seccion) {
      const datos = this.datosFormulario[seccion.codigoSeccion] || {}
      const campos = seccion.camposJSON?.campos || []
      return campos.filter(campo => {
        const valor = datos[campo.nombre]
        return valor && valor.toString().trim() !== ''
      }).length
    },
    
    getCamposTotales(seccion) {
      return seccion.camposJSON?.campos?.length || 0
    },
    
    getProgressClass(porcentaje) {
      if (porcentaje >= 100) return 'progress-complete'
      if (porcentaje >= 75) return 'progress-high'
      if (porcentaje >= 50) return 'progress-medium'
      if (porcentaje >= 25) return 'progress-low'
      return 'progress-minimal'
    },
    
    formatFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleString()
    },
    
    // Configuración y limpieza
    configurarAutoGuardado() {
      // Auto-guardar cada 30 segundos si hay cambios
      this.timerAutoGuardado = setInterval(() => {
        if (this.editandoFormulario && this.tokenEdicion) {
          this.guardarBorrador()
        }
      }, 30000)
    },
    
    programarAutoGuardado() {
      // Programar guardado en 3 segundos después del último cambio
      clearTimeout(this.autoGuardadoTimeout)
      this.autoGuardadoTimeout = setTimeout(() => {
        if (this.editandoFormulario) {
          this.guardarBorrador()
        }
      }, 3000)
    },
    
    configurarEventosVentana() {
      // Advertir al salir si hay cambios sin guardar
      window.addEventListener('beforeunload', this.advertirSalida)
    },
    
    advertirSalida(event) {
      if (this.editandoFormulario && this.tokenEdicion) {
        event.preventDefault()
        event.returnValue = '¿Está seguro que desea salir? Hay cambios sin finalizar.'
        return event.returnValue
      }
    },
    
    limpiarRecursos() {
      // Limpiar timers
      if (this.timerAutoGuardado) {
        clearInterval(this.timerAutoGuardado)
      }
      if (this.autoGuardadoTimeout) {
        clearTimeout(this.autoGuardadoTimeout)
      }
      
      // Remover event listeners
      window.removeEventListener('beforeunload', this.advertirSalida)
      
      // Finalizar edición si está activa
      if (this.editandoFormulario && this.tokenEdicion) {
        this.finalizarEdicion()
      }
    },
    
    // Handlers de eventos
    actualizarArchivosSeccion(codigoSeccion, archivos) {
      this.$set(this.archivosFormulario, codigoSeccion, archivos)
    },
    
    actualizarComentariosSeccion(codigoSeccion, comentarios) {
      this.$set(this.comentariosFormulario, codigoSeccion, comentarios)
    },
    
    manejarArchivoSubido(evento) {
      this.$toast.success(`Archivo "${evento.nombreOriginal}" subido correctamente`)
      // Actualizar estadísticas
      if (this.estadisticas) {
        this.estadisticas.totalArchivos = (this.estadisticas.totalArchivos || 0) + 1
      }
    },
    
    manejarArchivoEliminado(evento) {
      this.$toast.info(`Archivo eliminado correctamente`)
      // Actualizar estadísticas
      if (this.estadisticas) {
        this.estadisticas.totalArchivos = Math.max((this.estadisticas.totalArchivos || 0) - 1, 0)
      }
    },
    
    validarSeccion(codigoSeccion) {
      // TODO: Implementar validación por sección
      console.log('Validando sección:', codigoSeccion)
    },
    
    validarCampoSeccion(campo, valor, esValido) {
      // TODO: Implementar validación por campo
      console.log('Validando campo:', campo, valor, esValido)
    },
    
    irASeccionError(codigoSeccion) {
      const seccion = this.secciones.find(s => s.codigoSeccion === codigoSeccion)
      if (seccion) {
        seccion.expandida = true
        this.$nextTick(() => {
          const elemento = document.querySelector(`[data-seccion="${codigoSeccion}"]`)
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
      }
    },
    
    mostrarSubirArchivo(seccion) {
      // TODO: Implementar modal de subida de archivos
      console.log('Mostrar subir archivo para:', seccion.codigoSeccion)
    },
    
    mostrarAgregarComentario(seccion) {
      // TODO: Implementar modal de agregar comentario
      console.log('Mostrar agregar comentario para:', seccion.codigoSeccion)
    }
  }
}
</script>

<style scoped>
.formulario-anci-dinamico-v3 {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header del formulario */
.formulario-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.titulo-seccion {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.header-icon {
  font-size: 2rem;
  margin-top: 5px;
  opacity: 0.9;
}

.titulo-info {
  flex: 1;
}

.formulario-titulo {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.2;
}

.empresa-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  opacity: 0.95;
}

.empresa-nombre {
  font-weight: 500;
}

.separador {
  opacity: 0.7;
}

.empresa-tipo {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-editar, .btn-finalizar {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.edicion-indicator {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px 20px;
  backdrop-filter: blur(10px);
}

.indicator-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.indicator-icon {
  color: #ffd700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Estadísticas */
.formulario-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 4px;
}

/* Barra de progreso */
.progress-container {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-weight: 500;
  color: #2d3748;
}

.progress-fraction {
  font-size: 0.9rem;
  color: #718096;
}

.progress-bar {
  height: 12px;
  background: #edf2f7;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
  position: relative;
}

.progress-minimal { background: linear-gradient(90deg, #fc8181, #f56565); }
.progress-low { background: linear-gradient(90deg, #f6ad55, #ed8936); }
.progress-medium { background: linear-gradient(90deg, #68d391, #48bb78); }
.progress-high { background: linear-gradient(90deg, #4fd1c7, #38b2ac); }
.progress-complete { background: linear-gradient(90deg, #9f7aea, #805ad5); }

/* Estados de carga y error */
.loading-container, .error-container {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 60px 40px;
  text-align: center;
  margin: 40px 0;
}

.loading-spinner {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 1.1rem;
  color: #718096;
}

.error-content {
  color: #e53e3e;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-content h3 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.error-content p {
  margin: 0 0 20px 0;
  color: #718096;
}

/* Controles del formulario */
.formulario-controles {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.controles-izquierda, .controles-derecha {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Acordeón dinámico */
.acordeon-dinamico {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.seccion-item {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.seccion-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.seccion-item.seccion-expandida {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.seccion-obligatoria {
  border-left: 4px solid #f56565;
}

.seccion-taxonomia {
  border-left: 4px solid #e83e8c;
}

.seccion-especial {
  border-left: 4px solid #fd7e14;
}

.seccion-header {
  padding: 20px 25px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.seccion-header:hover {
  background: #f7fafc;
}

.seccion-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.seccion-principal {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  flex: 1;
}

.seccion-numero {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.seccion-indicator {
  width: 4px;
  height: 35px;
  border-radius: 2px;
  flex-shrink: 0;
}

.seccion-icono {
  font-size: 1.3rem;
  color: #667eea;
  margin-top: 6px;
  flex-shrink: 0;
}

.seccion-info {
  flex: 1;
  min-width: 0;
}

.seccion-titulo {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.3;
}

.seccion-descripcion {
  margin: 0;
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.4;
}

.seccion-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.seccion-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-obligatorio {
  background: #fed7d7;
  color: #c53030;
}

.badge-tipo {
  background: #e6fffa;
  color: #234e52;
}

.badge-fija { background: #ebf8ff; color: #2a69ac; }
.badge-taxonomia { background: #fbb6ce; color: #97266d; }
.badge-especial { background: #feebc8; color: #9c4221; }

.badge-estado {
  font-weight: 600;
}

.badge-completado { background: #c6f6d5; color: #22543d; }
.badge-parcial { background: #fefcbf; color: #744210; }
.badge-vacio { background: #fed7d7; color: #742a2a; }

.seccion-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #718096;
}

.seccion-toggle {
  margin-left: 15px;
  margin-top: 6px;
}

.toggle-icon {
  font-size: 1.1rem;
  color: #a0aec0;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* Contenido de sección */
.seccion-content-enter-active, .seccion-content-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.seccion-content-enter, .seccion-content-leave-to {
  max-height: 0;
  opacity: 0;
}

.seccion-content-enter-to, .seccion-content-leave {
  max-height: 2000px;
  opacity: 1;
}

.seccion-contenido {
  border-top: 1px solid #e0e6ed;
  background: #f7fafc;
}

.contenido-wrapper {
  padding: 25px;
}

.seccion-instrucciones {
  background: #e6fffa;
  border: 1px solid #b2f5ea;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #234e52;
  font-size: 0.9rem;
}

.seccion-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 25px;
}

.campos-container {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 20px;
}

.recursos-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-recursos {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  overflow: hidden;
}

.panel-header {
  background: #f7fafc;
  border-bottom: 1px solid #e0e6ed;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-titulo {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contador {
  font-weight: normal;
  color: #718096;
  font-size: 0.85rem;
}

.btn-panel {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-panel:hover {
  background: #5a67d8;
}

/* Acciones del formulario */
.formulario-acciones {
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  padding: 30px;
  margin-top: 30px;
  text-align: center;
}

.acciones-principales {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.acciones-secundarias {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 1024px) {
  .seccion-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .recursos-container {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .formulario-anci-dinamico-v3 {
    padding: 15px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .formulario-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .formulario-controles {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controles-izquierda, .controles-derecha {
    justify-content: center;
  }
  
  .seccion-header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .seccion-meta {
    align-items: flex-start;
    width: 100%;
  }
  
  .recursos-container {
    flex-direction: column;
  }
  
  .acciones-principales {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-lg {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .formulario-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .seccion-principal {
    flex-direction: column;
    gap: 10px;
  }
  
  .seccion-numero {
    align-self: flex-start;
  }
}
</style>