<template>
  <div class="admin-agente-digital-container">
    <!-- 🚀 HEADER ESPECTACULAR CON PARTÍCULAS FLOTANTES -->
    <header class="hero-header-admin">
      <div class="particles-background">
        <div class="particle" v-for="n in 50" :key="n" 
             :style="{ 
               left: Math.random() * 100 + '%',
               animationDelay: Math.random() * 20 + 's',
               animationDuration: (Math.random() * 3 + 2) + 's'
             }"></div>
      </div>
      
      <div class="cyber-grid-overlay"></div>
      
      <div class="header-content-admin">
        <div class="header-left">
          <div class="admin-badge-container">
            <div class="admin-level-indicator" :style="{ backgroundColor: adminActual?.tipo?.color || '#6366f1' }">
              <i class="ph" :class="adminActual?.tipo?.icono || 'ph-user-gear'"></i>
            </div>
            <div class="admin-info">
              <h1 class="admin-title">
                <span class="title-main">Administradores del Sistema</span>
                <span class="title-glow">AGENTE DIGITAL</span>
              </h1>
              <p class="admin-subtitle">
                Panel de control avanzado • {{ adminActual?.tipo?.nombre || 'Administrador' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="mostrarEstadisticas = !mostrarEstadisticas" 
                  class="btn btn-glass"
                  :class="{ 'active': mostrarEstadisticas }">
            <i class="ph ph-chart-line"></i>
            <span>Estadísticas</span>
          </button>
          
          <button @click="actualizarDatos" 
                  class="btn btn-secondary-glow"
                  :disabled="cargando">
            <i class="ph ph-arrows-clockwise" :class="{ 'animate-spin': cargando }"></i>
            <span>Actualizar</span>
          </button>
          
          <button @click="abrirModalCrear" 
                  class="btn btn-primary-glow"
                  v-if="puedeCrearAdmins">
            <i class="ph ph-plus-circle"></i>
            <span>Nuevo Admin</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 📊 PANEL DE ESTADÍSTICAS DESLIZANTE -->
    <transition name="slide-down">
      <div v-if="mostrarEstadisticas" class="estadisticas-panel">
        <div class="stats-grid">
          <div class="stat-card super-admin">
            <div class="stat-icon">
              <i class="ph ph-crown"></i>
            </div>
            <div class="stat-content">
              <h3>{{ estadisticas.superAdmins }}</h3>
              <p>Super Administradores</p>
              <span class="stat-trend positive">+{{ estadisticas.nuevosEsteMes }}</span>
            </div>
          </div>
          
          <div class="stat-card admin-corp">
            <div class="stat-icon">
              <i class="ph ph-buildings"></i>
            </div>
            <div class="stat-content">
              <h3>{{ estadisticas.adminsCorp }}</h3>
              <p>Admins Corporativos</p>
              <span class="stat-trend">{{ estadisticas.activosHoy }} activos hoy</span>
            </div>
          </div>
          
          <div class="stat-card supervisores">
            <div class="stat-icon">
              <i class="ph ph-users-three"></i>
            </div>
            <div class="stat-content">
              <h3>{{ estadisticas.supervisores }}</h3>
              <p>Supervisores</p>
              <span class="stat-trend">{{ estadisticas.sesionesActivas }} sesiones</span>
            </div>
          </div>
          
          <div class="stat-card actividad">
            <div class="stat-icon">
              <i class="ph ph-activity"></i>
            </div>
            <div class="stat-content">
              <h3>{{ estadisticas.accionesHoy }}</h3>
              <p>Acciones Hoy</p>
              <span class="stat-trend positive">{{ estadisticas.incremento }}% ↗</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 🔍 PANEL DE FILTROS AVANZADO -->
    <div class="filtros-avanzados">
      <div class="filtros-header">
        <h3>
          <i class="ph ph-funnel"></i>
          Filtros Avanzados
        </h3>
        <button @click="limpiarFiltros" class="btn-clear">
          <i class="ph ph-x"></i>
          Limpiar
        </button>
      </div>
      
      <div class="filtros-grid">
        <div class="filtro-grupo">
          <label>Tipo de Administrador</label>
          <select autocomplete="off" v-model="filtros.tipo" class="select-futurista">
            <option value="">Todos los tipos</option>
            <option value="SUPER_ADMIN">🔧 Super Administrador</option>
            <option value="ADMIN_CORP">🏢 Administrador Corporativo</option>
            <option value="SUPERVISOR">👥 Supervisor de Usuarios</option>
          </select>
        </div>
        
        <div class="filtro-grupo">
          <label>Estado</label>
          <select autocomplete="off" v-model="filtros.estado" class="select-futurista">
            <option value="activo">✅ Activos</option>
            <option value="bloqueado">🔒 Bloqueados</option>
            <option value="todos">📊 Todos</option>
          </select>
        </div>
        
        <div class="filtro-grupo">
          <label>Búsqueda</label>
          <div class="input-with-icon">
            <i class="ph ph-magnifying-glass"></i>
            <input autocomplete="off" v-model="filtros.busqueda" 
                   placeholder="Nombre o email..."
                   class="input-futurista"
                   @input="buscarConRetraso">
          </div>
        </div>
        
        <div class="filtro-grupo">
          <label>Última Actividad</label>
          <select autocomplete="off" v-model="filtros.actividad" class="select-futurista">
            <option value="">Cualquier momento</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 🎯 TABLA DE ADMINISTRADORES CON EFECTOS HOLOGRÁFICOS -->
    <div class="tabla-container">
      <div v-if="cargando" class="loading-hologram">
        <div class="hologram-spinner">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>
        <p>Cargando administradores...</p>
      </div>
      
      <div v-else-if="administradores.length === 0" class="empty-state-futurista">
        <div class="empty-hologram">
          <i class="ph ph-robot"></i>
        </div>
        <h3>No hay administradores</h3>
        <p>No se encontraron administradores con los filtros aplicados</p>
        <button @click="limpiarFiltros" class="btn btn-primary-outline">
          <i class="ph ph-funnel-x"></i>
          Limpiar Filtros
        </button>
      </div>
      
      <div v-else class="tabla-admins-futurista">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Administrador</th>
              <th>Tipo & Nivel</th>
              <th>Estado & Actividad</th>
              <th>Estadísticas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in administradores" 
                :key="admin.admin_id"
                class="admin-row"
                :class="{ 
                  'bloqueado': admin.esta_bloqueado,
                  'inactivo': !admin.estado_activo 
                }">
              
              <!-- Columna: Administrador -->
              <td class="admin-info-cell">
                <div class="admin-avatar-container">
                  <div class="admin-avatar" 
                       :style="{ backgroundColor: admin.tipo.color + '20', borderColor: admin.tipo.color }">
                    <i class="ph" :class="admin.tipo.icono"></i>
                  </div>
                  <div class="admin-details">
                    <h4 class="admin-name">{{ admin.nombre }}</h4>
                    <p class="admin-email">{{ admin.email }}</p>
                    <span class="admin-id">ID: {{ admin.admin_id }}</span>
                  </div>
                </div>
              </td>
              
              <!-- Columna: Tipo & Nivel -->
              <td class="tipo-cell">
                <div class="tipo-badge" 
                     :style="{ backgroundColor: admin.tipo.color, color: 'white' }">
                  <i class="ph" :class="admin.tipo.icono"></i>
                  <span>{{ admin.tipo.nombre }}</span>
                  <div class="nivel-indicator">Nivel {{ admin.tipo.nivel }}</div>
                </div>
              </td>
              
              <!-- Columna: Estado & Actividad -->
              <td class="estado-cell">
                <div class="estado-stack">
                  <div class="estado-principal" 
                       :class="{
                         'activo': admin.estado_activo && !admin.esta_bloqueado,
                         'bloqueado': admin.esta_bloqueado,
                         'inactivo': !admin.estado_activo
                       }">
                    <i class="ph" :class="{
                      'ph-check-circle': admin.estado_activo && !admin.esta_bloqueado,
                      'ph-lock': admin.esta_bloqueado,
                      'ph-x-circle': !admin.estado_activo
                    }"></i>
                    <span>{{ obtenerTextoEstado(admin) }}</span>
                  </div>
                  
                  <div class="actividad-info">
                    <span v-if="admin.fecha_ultimo_acceso" class="ultimo-acceso">
                      🕒 {{ formatearFechaRelativa(admin.fecha_ultimo_acceso) }}
                    </span>
                    <span v-else class="sin-acceso">Nunca conectado</span>
                  </div>
                  
                  <div v-if="admin.intentos_fallidos > 0" class="intentos-fallidos">
                    ⚠️ {{ admin.intentos_fallidos }} intento(s) fallido(s)
                  </div>
                </div>
              </td>
              
              <!-- Columna: Estadísticas -->
              <td class="stats-cell">
                <div class="mini-stats">
                  <div class="mini-stat">
                    <i class="ph ph-calendar"></i>
                    <span>{{ formatearFecha(admin.fecha_creacion) }}</span>
                  </div>
                  <div class="mini-stat">
                    <i class="ph ph-user"></i>
                    <span>{{ admin.creado_por || 'Sistema' }}</span>
                  </div>
                </div>
              </td>
              
              <!-- Columna: Acciones -->
              <td class="acciones-cell">
                <div class="acciones-grupo">
                  <button @click="verDetallesAdmin(admin)" 
                          class="btn-accion ver"
                          title="Ver detalles">
                    <i class="ph ph-eye"></i>
                  </button>
                  
                  <button @click="editarAdmin(admin)" 
                          class="btn-accion editar"
                          title="Editar"
                          v-if="puedeEditarAdmin(admin)">
                    <i class="ph ph-pencil"></i>
                  </button>
                  
                  <button @click="cambiarPasswordAdmin(admin)" 
                          class="btn-accion password"
                          title="Cambiar contraseña"
                          v-if="puedeCambiarPassword(admin)">
                    <i class="ph ph-key"></i>
                  </button>
                  
                  <button @click="toggleEstadoAdmin(admin)" 
                          class="btn-accion"
                          :class="admin.estado_activo ? 'bloquear' : 'activar'"
                          :title="admin.estado_activo ? 'Bloquear' : 'Activar'"
                          v-if="puedeToggleEstado(admin)">
                    <i class="ph" :class="admin.estado_activo ? 'ph-lock' : 'ph-lock-open'"></i>
                  </button>
                  
                  <button @click="eliminarAdmin(admin)" 
                          class="btn-accion eliminar"
                          title="Eliminar"
                          v-if="puedeEliminarAdmin(admin)">
                    <i class="ph ph-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginación futurista -->
      <div v-if="total > limite" class="paginacion-futurista">
        <button @click="irPaginaAnterior" 
                :disabled="offset === 0"
                class="btn-pag">
          <i class="ph ph-caret-left"></i>
        </button>
        
        <div class="info-paginacion">
          <span>{{ offset + 1 }} - {{ Math.min(offset + limite, total) }} de {{ total }}</span>
        </div>
        
        <button @click="irPaginaSiguiente" 
                :disabled="offset + limite >= total"
                class="btn-pag">
          <i class="ph ph-caret-right"></i>
        </button>
      </div>
    </div>

    <!-- 🎭 MODAL CREAR ADMINISTRADOR -->
    <transition name="modal-fade">
      <div v-if="mostrarModalCrear" class="modal-overlay" @click="cerrarModalCrear">
        <div class="modal-futurista crear-admin" @click.stop>
          <div class="modal-header-futurista">
            <h3>
              <i class="ph ph-user-plus"></i>
              Crear Nuevo Administrador
            </h3>
            <button @click="cerrarModalCrear" class="btn-close-modal">
              <i class="ph ph-x"></i>
            </button>
          </div>
          
          <form @submit.prevent="crearAdministrador" class="form-crear-admin">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label-futurista">
                  <i class="ph ph-user"></i>
                  Nombre Completo
                </label>
                <input autocomplete="off" v-model="nuevoAdmin.nombre_completo" 
                       class="input-futurista"
                       placeholder="Ingresa el nombre completo"
                       required>
              </div>
              
              <div class="form-group full-width">
                <label class="form-label-futurista">
                  <i class="ph ph-envelope"></i>
                  Email
                </label>
                <input autocomplete="off" v-model="nuevoAdmin.email" 
                       type="email"
                       class="input-futurista"
                       placeholder="admin@empresa.com"
                       required>
              </div>
              
              <div class="form-group">
                <label class="form-label-futurista">
                  <i class="ph ph-shield"></i>
                  Tipo de Administrador
                </label>
                <select autocomplete="off" v-model="nuevoAdmin.tipo_admin" 
                        class="select-futurista" 
                        required>
                  <option value="">Seleccionar tipo...</option>
                  <option value="SUPER_ADMIN" v-if="adminActual?.tipo?.nivel === 1">
                    🔧 Super Administrador
                  </option>
                  <option value="ADMIN_CORP" v-if="adminActual?.tipo?.nivel <= 2">
                    🏢 Administrador Corporativo
                  </option>
                  <option value="SUPERVISOR">
                    👥 Supervisor de Usuarios
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label-futurista">
                  <i class="ph ph-key"></i>
                  Contraseña
                </label>
                <div class="password-input-container">
                  <input autocomplete="off" v-model="nuevoAdmin.password" 
                         :type="mostrarPassword ? 'text' : 'password'"
                         class="input-futurista"
                         placeholder="Mínimo 8 caracteres"
                         required>
                  <button type="button" 
                          @click="mostrarPassword = !mostrarPassword"
                          class="btn-toggle-password">
                    <i class="ph" :class="mostrarPassword ? 'ph-eye-slash' : 'ph-eye'"></i>
                  </button>
                </div>
                
                <!-- Indicador de fuerza de contraseña -->
                <div v-if="nuevoAdmin.password" class="password-strength">
                  <div class="strength-bar">
                    <div class="strength-fill" 
                         :style="{ 
                           width: calcularFuerzaPassword() + '%',
                           backgroundColor: obtenerColorFuerza()
                         }"></div>
                  </div>
                  <span class="strength-text" :style="{ color: obtenerColorFuerza() }">
                    {{ obtenerTextoFuerza() }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Preview del tipo seleccionado -->
            <div v-if="nuevoAdmin.tipo_admin" class="tipo-preview">
              <h4>Preview del Tipo de Administrador:</h4>
              <div class="tipo-card-preview" 
                   :style="{ 
                     backgroundColor: tiposAdmin[nuevoAdmin.tipo_admin]?.color + '20',
                     borderColor: tiposAdmin[nuevoAdmin.tipo_admin]?.color
                   }">
                <div class="tipo-icon" 
                     :style="{ backgroundColor: tiposAdmin[nuevoAdmin.tipo_admin]?.color }">
                  <i class="ph" :class="tiposAdmin[nuevoAdmin.tipo_admin]?.icono"></i>
                </div>
                <div class="tipo-info">
                  <h5>{{ tiposAdmin[nuevoAdmin.tipo_admin]?.nombre }}</h5>
                  <p>{{ tiposAdmin[nuevoAdmin.tipo_admin]?.descripcion }}</p>
                  <span class="nivel-badge">Nivel {{ tiposAdmin[nuevoAdmin.tipo_admin]?.nivel }}</span>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" 
                      @click="cerrarModalCrear" 
                      class="btn btn-secondary">
                <i class="ph ph-x"></i>
                Cancelar
              </button>
              
              <button type="submit" 
                      class="btn btn-primary-glow"
                      :disabled="creandoAdmin || !formularioValido">
                <i class="ph" :class="creandoAdmin ? 'ph-spinner ph-spin' : 'ph-plus-circle'"></i>
                {{ creandoAdmin ? 'Creando...' : 'Crear Administrador' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- 🔍 MODAL DETALLES ADMINISTRADOR -->
    <transition name="modal-fade">
      <div v-if="mostrarModalDetalles" class="modal-overlay" @click="cerrarModalDetalles">
        <div class="modal-futurista detalles-admin" @click.stop>
          <div class="modal-header-futurista">
            <div class="header-admin-details">
              <div class="admin-avatar-large" 
                   :style="{ backgroundColor: adminSeleccionado?.tipo?.color + '20', borderColor: adminSeleccionado?.tipo?.color }">
                <i class="ph" :class="adminSeleccionado?.tipo?.icono"></i>
              </div>
              <div class="admin-details-info">
                <h3>{{ adminSeleccionado?.nombre }}</h3>
                <p>{{ adminSeleccionado?.email }}</p>
                <span class="admin-tipo" 
                      :style="{ backgroundColor: adminSeleccionado?.tipo?.color }">
                  {{ adminSeleccionado?.tipo?.nombre }}
                </span>
              </div>
            </div>
            <button @click="cerrarModalDetalles" class="btn-close-modal">
              <i class="ph ph-x"></i>
            </button>
          </div>
          
          <div class="detalles-content">
            <div class="detalles-grid">
              <!-- Información General -->
              <div class="detalle-seccion">
                <h4>
                  <i class="ph ph-info"></i>
                  Información General
                </h4>
                <div class="info-items">
                  <div class="info-item">
                    <label>ID Administrador:</label>
                    <span>{{ adminSeleccionado?.admin_id }}</span>
                  </div>
                  <div class="info-item">
                    <label>ID Usuario:</label>
                    <span>{{ adminSeleccionado?.usuario_id }}</span>
                  </div>
                  <div class="info-item">
                    <label>Fecha de Creación:</label>
                    <span>{{ formatearFecha(adminSeleccionado?.fecha_creacion) }}</span>
                  </div>
                  <div class="info-item">
                    <label>Creado por:</label>
                    <span>{{ adminSeleccionado?.creado_por || 'Sistema' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Estado y Seguridad -->
              <div class="detalle-seccion">
                <h4>
                  <i class="ph ph-shield-check"></i>
                  Estado y Seguridad
                </h4>
                <div class="info-items">
                  <div class="info-item">
                    <label>Estado:</label>
                    <span class="estado-badge" 
                          :class="obtenerClaseEstado(adminSeleccionado)">
                      {{ obtenerTextoEstado(adminSeleccionado) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <label>Intentos Fallidos:</label>
                    <span :class="{ 'text-warning': adminSeleccionado?.intentos_fallidos > 0 }">
                      {{ adminSeleccionado?.intentos_fallidos || 0 }}
                    </span>
                  </div>
                  <div class="info-item" v-if="adminSeleccionado?.fecha_bloqueado">
                    <label>Fecha de Bloqueo:</label>
                    <span class="text-danger">
                      {{ formatearFecha(adminSeleccionado?.fecha_bloqueado) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Actividad Reciente -->
              <div class="detalle-seccion">
                <h4>
                  <i class="ph ph-activity"></i>
                  Actividad Reciente
                </h4>
                <div class="info-items">
                  <div class="info-item">
                    <label>Último Acceso:</label>
                    <span>
                      {{ adminSeleccionado?.fecha_ultimo_acceso 
                         ? formatearFechaCompleta(adminSeleccionado.fecha_ultimo_acceso)
                         : 'Nunca' }}
                    </span>
                  </div>
                  <div class="info-item">
                    <label>Sesiones Activas:</label>
                    <span class="sesiones-count">
                      {{ sesionesActivas.length }} sesión(es)
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Permisos -->
              <div class="detalle-seccion permisos-seccion">
                <h4>
                  <i class="ph ph-key"></i>
                  Permisos del Sistema
                </h4>
                <div class="permisos-grid" v-if="permisosAdmin.length > 0">
                  <div v-for="permiso in permisosAdmin" 
                       :key="permiso.codigo"
                       class="permiso-item">
                    <div class="permiso-header">
                      <i class="ph ph-check-circle"></i>
                      <span>{{ permiso.nombre }}</span>
                    </div>
                    <small class="permiso-modulo">{{ permiso.modulo }}</small>
                  </div>
                </div>
                <div v-else class="sin-permisos">
                  <i class="ph ph-warning"></i>
                  <span>No hay permisos configurados</span>
                </div>
              </div>
            </div>
            
            <!-- Acciones Disponibles -->
            <div class="acciones-disponibles">
              <button @click="editarAdmin(adminSeleccionado)" 
                      class="btn btn-primary"
                      v-if="puedeEditarAdmin(adminSeleccionado)">
                <i class="ph ph-pencil"></i>
                Editar Administrador
              </button>
              
              <button @click="cambiarPasswordAdmin(adminSeleccionado)" 
                      class="btn btn-warning"
                      v-if="puedeCambiarPassword(adminSeleccionado)">
                <i class="ph ph-key"></i>
                Cambiar Contraseña
              </button>
              
              <button @click="verAuditoriaAdmin(adminSeleccionado)" 
                      class="btn btn-info">
                <i class="ph ph-clock-clockwise"></i>
                Ver Auditoría
              </button>
              
              <button @click="toggleEstadoAdmin(adminSeleccionado)" 
                      class="btn"
                      :class="adminSeleccionado?.estado_activo ? 'btn-danger' : 'btn-success'"
                      v-if="puedeToggleEstado(adminSeleccionado)">
                <i class="ph" :class="adminSeleccionado?.estado_activo ? 'ph-lock' : 'ph-lock-open'"></i>
                {{ adminSeleccionado?.estado_activo ? 'Bloquear' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 🔐 MODAL CAMBIAR CONTRASEÑA -->
    <transition name="modal-fade">
      <div v-if="mostrarModalPassword" class="modal-overlay" @click="cerrarModalPassword">
        <div class="modal-futurista cambiar-password" @click.stop>
          <div class="modal-header-futurista">
            <h3>
              <i class="ph ph-key"></i>
              Cambiar Contraseña
            </h3>
            <button @click="cerrarModalPassword" class="btn-close-modal">
              <i class="ph ph-x"></i>
            </button>
          </div>
          
          <form @submit.prevent="confirmarCambioPassword" class="form-cambiar-password">
            <div class="user-info-password">
              <div class="admin-avatar" 
                   :style="{ backgroundColor: adminPasswordSeleccionado?.tipo?.color + '20', borderColor: adminPasswordSeleccionado?.tipo?.color }">
                <i class="ph" :class="adminPasswordSeleccionado?.tipo?.icono"></i>
              </div>
              <div>
                <h4>{{ adminPasswordSeleccionado?.nombre }}</h4>
                <p>{{ adminPasswordSeleccionado?.email }}</p>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label-futurista">
                <i class="ph ph-key"></i>
                Nueva Contraseña
              </label>
              <div class="password-input-container">
                <input autocomplete="off" v-model="nuevaPassword.password" 
                       :type="mostrarNuevaPassword ? 'text' : 'password'"
                       class="input-futurista"
                       placeholder="Mínimo 8 caracteres"
                       required>
                <button type="button" 
                        @click="mostrarNuevaPassword = !mostrarNuevaPassword"
                        class="btn-toggle-password">
                  <i class="ph" :class="mostrarNuevaPassword ? 'ph-eye-slash' : 'ph-eye'"></i>
                </button>
              </div>
              
              <!-- Indicador de fuerza -->
              <div v-if="nuevaPassword.password" class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" 
                       :style="{ 
                         width: calcularFuerzaNewPassword() + '%',
                         backgroundColor: obtenerColorFuerzaNew()
                       }"></div>
                </div>
                <span class="strength-text" :style="{ color: obtenerColorFuerzaNew() }">
                  {{ obtenerTextoFuerzaNew() }}
                </span>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label-futurista">
                <i class="ph ph-check-circle"></i>
                Confirmar Contraseña
              </label>
              <div class="password-input-container">
                <input autocomplete="off" v-model="nuevaPassword.confirmar" 
                       :type="mostrarConfirmarPassword ? 'text' : 'password'"
                       class="input-futurista"
                       placeholder="Repite la contraseña"
                       required>
                <button type="button" 
                        @click="mostrarConfirmarPassword = !mostrarConfirmarPassword"
                        class="btn-toggle-password">
                  <i class="ph" :class="mostrarConfirmarPassword ? 'ph-eye-slash' : 'ph-eye'"></i>
                </button>
              </div>
              
              <div v-if="nuevaPassword.confirmar && nuevaPassword.password !== nuevaPassword.confirmar" 
                   class="error-message">
                <i class="ph ph-warning"></i>
                Las contraseñas no coinciden
              </div>
            </div>
            
            <div class="password-tips">
              <h5>
                <i class="ph ph-lightbulb"></i>
                Requisitos de Seguridad:
              </h5>
              <ul>
                <li :class="{ 'completed': nuevaPassword.password.length >= 8 }">
                  <i class="ph" :class="nuevaPassword.password.length >= 8 ? 'ph-check' : 'ph-x'"></i>
                  Mínimo 8 caracteres
                </li>
                <li :class="{ 'completed': /[A-Z]/.test(nuevaPassword.password) }">
                  <i class="ph" :class="/[A-Z]/.test(nuevaPassword.password) ? 'ph-check' : 'ph-x'"></i>
                  Al menos una mayúscula
                </li>
                <li :class="{ 'completed': /[a-z]/.test(nuevaPassword.password) }">
                  <i class="ph" :class="/[a-z]/.test(nuevaPassword.password) ? 'ph-check' : 'ph-x'"></i>
                  Al menos una minúscula
                </li>
                <li :class="{ 'completed': /\d/.test(nuevaPassword.password) }">
                  <i class="ph" :class="/\d/.test(nuevaPassword.password) ? 'ph-check' : 'ph-x'"></i>
                  Al menos un número
                </li>
                <li :class="{ 'completed': /[!@#$%^&*(),.?":{}|<>]/.test(nuevaPassword.password) }">
                  <i class="ph" :class="/[!@#$%^&*(),.?\":{}|<>]/.test(nuevaPassword.password) ? 'ph-check' : 'ph-x'"></i>
                  Al menos un carácter especial
                </li>
              </ul>
            </div>
            
            <div class="modal-actions">
              <button type="button" 
                      @click="cerrarModalPassword" 
                      class="btn btn-secondary">
                <i class="ph ph-x"></i>
                Cancelar
              </button>
              
              <button type="submit" 
                      class="btn btn-primary-glow"
                      :disabled="!passwordValida || cambiandoPassword">
                <i class="ph" :class="cambiandoPassword ? 'ph-spinner ph-spin' : 'ph-check'"></i>
                {{ cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ============================================================================
// ESTADO REACTIVO
// ============================================================================

const cargando = ref(false)
const administradores = ref([])
const total = ref(0)
const offset = ref(0)
const limite = ref(20)

// Admin actual logueado (simulado)
const adminActual = ref({
  id: 1,
  tipo: {
    codigo: 'SUPER_ADMIN',
    nombre: 'Super Administrador',
    nivel: 1,
    color: '#dc2626',
    icono: 'ph-crown'
  }
})

// Estados de UI
const mostrarEstadisticas = ref(true)
const mostrarModalCrear = ref(false)
const mostrarModalDetalles = ref(false)
const mostrarModalPassword = ref(false)
const mostrarPassword = ref(false)
const mostrarNuevaPassword = ref(false)
const mostrarConfirmarPassword = ref(false)
const creandoAdmin = ref(false)
const cambiandoPassword = ref(false)

// Datos seleccionados
const adminSeleccionado = ref(null)
const adminPasswordSeleccionado = ref(null)
const sesionesActivas = ref([])
const permisosAdmin = ref([])

// Filtros
const filtros = reactive({
  tipo: '',
  estado: 'activo',
  busqueda: '',
  actividad: ''
})

// Nuevo administrador
const nuevoAdmin = reactive({
  nombre_completo: '',
  email: '',
  tipo_admin: '',
  password: ''
})

// Nueva contraseña
const nuevaPassword = reactive({
  password: '',
  confirmar: ''
})

// Tipos de administradores disponibles
const tiposAdmin = {
  'SUPER_ADMIN': {
    nombre: 'Super Administrador',
    descripcion: 'Acceso total al sistema. Puede gestionar todo incluyendo inquilinos, empresas y configuración general.',
    nivel: 1,
    color: '#dc2626',
    icono: 'ph-crown'
  },
  'ADMIN_CORP': {
    nombre: 'Administrador Corporativo',
    descripcion: 'Gestión de inquilinos y empresas. Puede crear y administrar entidades corporativas.',
    nivel: 2,
    color: '#2563eb', 
    icono: 'ph-buildings'
  },
  'SUPERVISOR': {
    nombre: 'Supervisor de Usuarios',
    descripcion: 'Supervisión de inquilinos y gestión de usuarios. Especializado en administración de credenciales.',
    nivel: 3,
    color: '#16a34a',
    icono: 'ph-users-three'
  }
}

// Estadísticas
const estadisticas = ref({
  superAdmins: 2,
  adminsCorp: 5,
  supervisores: 12,
  activosHoy: 8,
  sesionesActivas: 3,
  accionesHoy: 47,
  nuevosEsteMes: 2,
  incremento: 15
})

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const puedeCrearAdmins = computed(() => {
  return adminActual.value?.tipo?.nivel <= 2
})

const formularioValido = computed(() => {
  return nuevoAdmin.nombre_completo && 
         nuevoAdmin.email && 
         nuevoAdmin.tipo_admin && 
         nuevoAdmin.password &&
         calcularFuerzaPassword() >= 60
})

const passwordValida = computed(() => {
  return nuevaPassword.password &&
         nuevaPassword.confirmar &&
         nuevaPassword.password === nuevaPassword.confirmar &&
         calcularFuerzaNewPassword() >= 60
})

// ============================================================================
// MÉTODOS DE DATOS
// ============================================================================

async function cargarAdministradores() {
  cargando.value = true
  try {
    // TODO: Conectar con API real
    // const response = await fetch('/api/admin-users/administradores')
    // const data = await response.json()
    
    // Datos de demostración
    await new Promise(resolve => setTimeout(resolve, 800))
    
    administradores.value = [
      {
        admin_id: 1,
        usuario_id: 1,
        nombre: 'Admin Principal',
        email: 'admin@agenteDigital.com',
        tipo: tiposAdmin['SUPER_ADMIN'],
        fecha_creacion: '2024-01-15T10:00:00',
        fecha_ultimo_acceso: '2025-01-06T14:30:00',
        estado_activo: true,
        intentos_fallidos: 0,
        esta_bloqueado: false,
        creado_por: 'Sistema'
      },
      {
        admin_id: 2,
        usuario_id: 2,
        nombre: 'María González',
        email: 'maria.gonzalez@empresa.com',
        tipo: tiposAdmin['ADMIN_CORP'],
        fecha_creacion: '2024-02-20T09:15:00',
        fecha_ultimo_acceso: '2025-01-06T12:45:00',
        estado_activo: true,
        intentos_fallidos: 1,
        esta_bloqueado: false,
        creado_por: 'Admin Principal'
      },
      {
        admin_id: 3,
        usuario_id: 3,
        nombre: 'Carlos Rodríguez',
        email: 'carlos@supervision.com',
        tipo: tiposAdmin['SUPERVISOR'],
        fecha_creacion: '2024-03-10T11:20:00',
        fecha_ultimo_acceso: null,
        estado_activo: false,
        intentos_fallidos: 3,
        esta_bloqueado: true,
        creado_por: 'María González'
      }
    ]
    
    // Aplicar filtros
    let filtrados = [...administradores.value]
    
    if (filtros.tipo) {
      filtrados = filtrados.filter(a => a.tipo.codigo === filtros.tipo)
    }
    
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase()
      filtrados = filtrados.filter(a => 
        a.nombre.toLowerCase().includes(busqueda) ||
        a.email.toLowerCase().includes(busqueda)
      )
    }
    
    administradores.value = filtrados
    total.value = filtrados.length
    
  } catch (error) {
    console.error('Error cargando administradores:', error)
  } finally {
    cargando.value = false
  }
}

async function crearAdministrador() {
  creandoAdmin.value = true
  try {
    // TODO: Llamar API real
    // const response = await fetch('/api/admin-users/administradores', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(nuevoAdmin)
    // })
    
    // Simulación
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const nuevoId = Math.max(...administradores.value.map(a => a.admin_id)) + 1
    administradores.value.unshift({
      admin_id: nuevoId,
      usuario_id: nuevoId + 100,
      nombre: nuevoAdmin.nombre_completo,
      email: nuevoAdmin.email,
      tipo: tiposAdmin[nuevoAdmin.tipo_admin],
      fecha_creacion: new Date().toISOString(),
      fecha_ultimo_acceso: null,
      estado_activo: true,
      intentos_fallidos: 0,
      esta_bloqueado: false,
      creado_por: adminActual.value.nombre
    })
    
    // Limpiar formulario
    Object.assign(nuevoAdmin, {
      nombre_completo: '',
      email: '',
      tipo_admin: '',
      password: ''
    })
    
    cerrarModalCrear()
    
    // Notificación de éxito
    alert('✅ Administrador creado exitosamente')
    
  } catch (error) {
    console.error('Error creando administrador:', error)
    alert('❌ Error al crear administrador')
  } finally {
    creandoAdmin.value = false
  }
}

// ============================================================================
// MÉTODOS DE UI
// ============================================================================

function abrirModalCrear() {
  mostrarModalCrear.value = true
}

function cerrarModalCrear() {
  mostrarModalCrear.value = false
  Object.assign(nuevoAdmin, {
    nombre_completo: '',
    email: '',
    tipo_admin: '',
    password: ''
  })
}

function verDetallesAdmin(admin) {
  adminSeleccionado.value = admin
  cargarSesionesAdmin(admin.admin_id)
  cargarPermisosAdmin(admin.admin_id)
  mostrarModalDetalles.value = true
}

function cerrarModalDetalles() {
  mostrarModalDetalles.value = false
  adminSeleccionado.value = null
  sesionesActivas.value = []
  permisosAdmin.value = []
}

function cambiarPasswordAdmin(admin) {
  adminPasswordSeleccionado.value = admin
  nuevaPassword.password = ''
  nuevaPassword.confirmar = ''
  mostrarModalPassword.value = true
}

function cerrarModalPassword() {
  mostrarModalPassword.value = false
  adminPasswordSeleccionado.value = null
  nuevaPassword.password = ''
  nuevaPassword.confirmar = ''
}

async function confirmarCambioPassword() {
  cambiandoPassword.value = true
  try {
    // TODO: Llamar API real
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    cerrarModalPassword()
    alert('✅ Contraseña cambiada exitosamente')
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    alert('❌ Error al cambiar contraseña')
  } finally {
    cambiandoPassword.value = false
  }
}

async function cargarSesionesAdmin(adminId) {
  // Simular datos de sesiones
  sesionesActivas.value = [
    {
      sesion_id: 1,
      dispositivo: 'Chrome - Windows',
      ip_address: '192.168.1.100',
      fecha_inicio: '2025-01-06T14:00:00'
    }
  ]
}

async function cargarPermisosAdmin(adminId) {
  // Simular permisos según tipo
  const admin = administradores.value.find(a => a.admin_id === adminId)
  if (!admin) return
  
  if (admin.tipo.codigo === 'SUPER_ADMIN') {
    permisosAdmin.value = [
      { codigo: 'SISTEMA_CONFIG', nombre: 'Configuración del Sistema', modulo: 'SISTEMA' },
      { codigo: 'INQUILINOS_FULL', nombre: 'Gestión Completa de Inquilinos', modulo: 'INQUILINOS' },
      { codigo: 'EMPRESAS_FULL', nombre: 'Gestión Completa de Empresas', modulo: 'EMPRESAS' },
      { codigo: 'USUARIOS_FULL', nombre: 'Gestión Completa de Usuarios', modulo: 'USUARIOS' },
      { codigo: 'ADMIN_USUARIOS', nombre: 'Administrar Administradores', modulo: 'ADMIN' }
    ]
  } else if (admin.tipo.codigo === 'ADMIN_CORP') {
    permisosAdmin.value = [
      { codigo: 'INQUILINOS_CREATE', nombre: 'Crear Inquilinos', modulo: 'INQUILINOS' },
      { codigo: 'EMPRESAS_CREATE', nombre: 'Crear Empresas', modulo: 'EMPRESAS' },
      { codigo: 'USUARIOS_CORP', nombre: 'Gestión de Usuarios Corporativos', modulo: 'USUARIOS' },
      { codigo: 'REPORTES_CORP', nombre: 'Reportes Corporativos', modulo: 'REPORTES' }
    ]
  } else {
    permisosAdmin.value = [
      { codigo: 'INQUILINOS_VIEW', nombre: 'Ver Inquilinos', modulo: 'INQUILINOS' },
      { codigo: 'USUARIOS_PASSWORD', nombre: 'Gestión de Contraseñas', modulo: 'USUARIOS' },
      { codigo: 'USUARIOS_SUPERVISION', nombre: 'Supervisión de Usuarios', modulo: 'USUARIOS' }
    ]
  }
}

// ============================================================================
// MÉTODOS DE ACCIONES
// ============================================================================

function editarAdmin(admin) {
  console.log('Editando admin:', admin)
  // TODO: Implementar modal de edición
}

function toggleEstadoAdmin(admin) {
  const accion = admin.estado_activo ? 'bloquear' : 'activar'
  if (confirm(`¿Estás seguro de ${accion} a ${admin.nombre}?`)) {
    admin.estado_activo = !admin.estado_activo
    admin.esta_bloqueado = !admin.estado_activo
    
    // TODO: Llamar API para actualizar estado
  }
}

function eliminarAdmin(admin) {
  if (confirm(`¿Estás seguro de eliminar al administrador ${admin.nombre}? Esta acción no se puede deshacer.`)) {
    const index = administradores.value.findIndex(a => a.admin_id === admin.admin_id)
    if (index > -1) {
      administradores.value.splice(index, 1)
      total.value--
      
      // TODO: Llamar API para eliminar
    }
  }
}

function verAuditoriaAdmin(admin) {
  console.log('Ver auditoría de:', admin)
  // TODO: Navegar a página de auditoría filtrada por admin
}

// ============================================================================
// MÉTODOS DE PERMISOS
// ============================================================================

function puedeEditarAdmin(admin) {
  return adminActual.value?.tipo?.nivel <= admin.tipo.nivel
}

function puedeCambiarPassword(admin) {
  return adminActual.value?.tipo?.nivel <= 2 || admin.admin_id === adminActual.value?.id
}

function puedeToggleEstado(admin) {
  return adminActual.value?.tipo?.nivel <= admin.tipo.nivel && admin.admin_id !== adminActual.value?.id
}

function puedeEliminarAdmin(admin) {
  return adminActual.value?.tipo?.nivel === 1 && admin.admin_id !== adminActual.value?.id
}

// ============================================================================
// MÉTODOS DE UTILIDADES
// ============================================================================

function obtenerTextoEstado(admin) {
  if (!admin) return ''
  if (!admin.estado_activo) return 'Inactivo'
  if (admin.esta_bloqueado) return 'Bloqueado'
  return 'Activo'
}

function obtenerClaseEstado(admin) {
  if (!admin) return ''
  if (!admin.estado_activo) return 'inactivo'
  if (admin.esta_bloqueado) return 'bloqueado'
  return 'activo'
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-CL')
}

function formatearFechaCompleta(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleString('es-CL')
}

function formatearFechaRelativa(fecha) {
  if (!fecha) return 'Nunca'
  const ahora = new Date()
  const fechaObj = new Date(fecha)
  const diffMs = ahora - fechaObj
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return 'Hace menos de 1 hora'
  if (diffHours < 24) return `Hace ${diffHours} hora(s)`
  if (diffDays < 7) return `Hace ${diffDays} día(s)`
  return formatearFecha(fecha)
}

// Funciones de validación de contraseña
function calcularFuerzaPassword() {
  const password = nuevoAdmin.password
  if (!password) return 0
  
  let puntos = 0
  if (password.length >= 8) puntos += 20
  if (/[a-z]/.test(password)) puntos += 20
  if (/[A-Z]/.test(password)) puntos += 20
  if (/\d/.test(password)) puntos += 20
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) puntos += 20
  
  return puntos
}

function calcularFuerzaNewPassword() {
  const password = nuevaPassword.password
  if (!password) return 0
  
  let puntos = 0
  if (password.length >= 8) puntos += 20
  if (/[a-z]/.test(password)) puntos += 20
  if (/[A-Z]/.test(password)) puntos += 20
  if (/\d/.test(password)) puntos += 20
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) puntos += 20
  
  return puntos
}

function obtenerColorFuerza() {
  const fuerza = calcularFuerzaPassword()
  if (fuerza < 40) return '#ef4444'
  if (fuerza < 60) return '#f59e0b'
  if (fuerza < 80) return '#3b82f6'
  return '#10b981'
}

function obtenerColorFuerzaNew() {
  const fuerza = calcularFuerzaNewPassword()
  if (fuerza < 40) return '#ef4444'
  if (fuerza < 60) return '#f59e0b'
  if (fuerza < 80) return '#3b82f6'
  return '#10b981'
}

function obtenerTextoFuerza() {
  const fuerza = calcularFuerzaPassword()
  if (fuerza < 40) return 'Débil'
  if (fuerza < 60) return 'Regular'
  if (fuerza < 80) return 'Buena'
  return 'Excelente'
}

function obtenerTextoFuerzaNew() {
  const fuerza = calcularFuerzaNewPassword()
  if (fuerza < 40) return 'Débil'
  if (fuerza < 60) return 'Regular'
  if (fuerza < 80) return 'Buena'
  return 'Excelente'
}

// ============================================================================
// MÉTODOS DE FILTROS Y PAGINACIÓN
// ============================================================================

function limpiarFiltros() {
  Object.assign(filtros, {
    tipo: '',
    estado: 'activo',
    busqueda: '',
    actividad: ''
  })
  offset.value = 0
  cargarAdministradores()
}

function actualizarDatos() {
  cargarAdministradores()
}

function irPaginaAnterior() {
  if (offset.value > 0) {
    offset.value -= limite.value
    cargarAdministradores()
  }
}

function irPaginaSiguiente() {
  if (offset.value + limite.value < total.value) {
    offset.value += limite.value
    cargarAdministradores()
  }
}

// Búsqueda con retraso
let timeoutBusqueda
function buscarConRetraso() {
  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(() => {
    offset.value = 0
    cargarAdministradores()
  }, 500)
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  cargarAdministradores()
})

// Watchers para filtros
watch(() => [filtros.tipo, filtros.estado, filtros.actividad], () => {
  offset.value = 0
  cargarAdministradores()
})
</script>

<style scoped>
/* 🎨 ESTILOS ESPECTACULARES CON EFECTOS FUTURISTAS */

.admin-agente-digital-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: white;
  font-family: 'Inter', sans-serif;
}

/* ============================================================================
   HEADER ESPECTACULAR CON PARTÍCULAS
   ============================================================================ */

.hero-header-admin {
  position: relative;
  background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #1e40af 100%);
  padding: 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
  border-radius: 0 0 2rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.particles-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.cyber-grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

.header-content-admin {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.admin-badge-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-level-indicator {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.6);
  }
}

.admin-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-main {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-glow {
  font-size: 1rem;
  font-weight: 600;
  color: #a5b4fc;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: 0.8;
}

.admin-subtitle {
  color: #c7d2fe;
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ============================================================================
   BOTONES FUTURISTAS
   ============================================================================ */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-glass.active {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.btn-secondary-glow {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-secondary-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
}

.btn-primary-glow {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-primary-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ============================================================================
   PANEL DE ESTADÍSTICAS
   ============================================================================ */

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.estadisticas-panel {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 2rem;
  margin: 0 2rem 2rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.stat-card.super-admin {
  border-left: 4px solid #dc2626;
}

.stat-card.admin-corp {
  border-left: 4px solid #2563eb;
}

.stat-card.supervisores {
  border-left: 4px solid #16a34a;
}

.stat-card.actividad {
  border-left: 4px solid #f59e0b;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: white;
}

.stat-content p {
  margin: 0.25rem 0;
  color: #cbd5e1;
  font-weight: 500;
}

.stat-trend {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.stat-trend.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

/* ============================================================================
   FILTROS AVANZADOS
   ============================================================================ */

.filtros-avanzados {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  margin: 0 2rem 2rem 2rem;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filtros-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-grupo label {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-futurista,
.input-futurista {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.select-futurista:focus,
.input-futurista:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: rgba(15, 23, 42, 0.9);
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
}

.input-with-icon .input-futurista {
  padding-left: 3rem;
}

/* ============================================================================
   TABLA FUTURISTA
   ============================================================================ */

.tabla-container {
  margin: 0 2rem 2rem 2rem;
}

.loading-hologram {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #cbd5e1;
}

.hologram-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 2rem;
}

.ring {
  position: absolute;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.ring-1 {
  width: 80px;
  height: 80px;
  border-top-color: #6366f1;
  animation-duration: 2s;
}

.ring-2 {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: #8b5cf6;
  animation-duration: 1.5s;
  animation-direction: reverse;
}

.ring-3 {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: #f59e0b;
  animation-duration: 1s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state-futurista {
  text-align: center;
  padding: 4rem 2rem;
  color: #cbd5e1;
}

.empty-hologram {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #6366f1;
}

.tabla-admins-futurista {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.admin-table th {
  padding: 1.5rem 1rem;
  text-align: left;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-row:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.01);
}

.admin-row.bloqueado {
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
}

.admin-row.inactivo {
  opacity: 0.6;
}

.admin-table td {
  padding: 1.5rem 1rem;
  vertical-align: middle;
}

/* Columna: Administrador */
.admin-info-cell {
  min-width: 280px;
}

.admin-avatar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 2px solid;
  position: relative;
}

.admin-avatar::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  z-index: -1;
}

.admin-details {
  flex: 1;
}

.admin-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.admin-email {
  margin: 0 0 0.25rem 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.admin-id {
  font-size: 0.8rem;
  color: #64748b;
  font-family: 'Fira Code', monospace;
}

/* Columna: Tipo & Nivel */
.tipo-cell {
  min-width: 200px;
}

.tipo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  flex-direction: column;
}

.tipo-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.tipo-badge:hover::before {
  left: 100%;
}

.nivel-indicator {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

/* Columna: Estado & Actividad */
.estado-cell {
  min-width: 180px;
}

.estado-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.estado-principal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.estado-principal.activo {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.estado-principal.bloqueado {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.estado-principal.inactivo {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.ultimo-acceso,
.sin-acceso {
  font-size: 0.8rem;
  color: #94a3b8;
}

.intentos-fallidos {
  font-size: 0.8rem;
  color: #fbbf24;
}

/* Columna: Estadísticas */
.stats-cell {
  min-width: 150px;
}

.mini-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.mini-stat i {
  color: #6366f1;
}

/* Columna: Acciones */
.acciones-cell {
  min-width: 200px;
}

.acciones-grupo {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-accion {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-accion:hover {
  transform: translateY(-2px);
}

.btn-accion.ver {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.btn-accion.ver:hover {
  background: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.btn-accion.editar {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.btn-accion.editar:hover {
  background: rgba(245, 158, 11, 0.3);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-accion.password {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.btn-accion.password:hover {
  background: rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-accion.bloquear {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-accion.bloquear:hover {
  background: rgba(239, 68, 68, 0.3);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.btn-accion.activar {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.btn-accion.activar:hover {
  background: rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.btn-accion.eliminar {
  background: rgba(220, 38, 38, 0.2);
  color: #ef4444;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.btn-accion.eliminar:hover {
  background: rgba(220, 38, 38, 0.3);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
}

/* Paginación */
.paginacion-futurista {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 0 0 1.5rem 1.5rem;
}

.btn-pag {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pag:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-pag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-paginacion {
  color: #cbd5e1;
  font-weight: 500;
}

/* ============================================================================
   MODALES FUTURISTAS
   ============================================================================ */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-futurista,
.modal-fade-leave-to .modal-futurista {
  transform: scale(0.9) translateY(-50px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-futurista {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-futurista.crear-admin {
  width: 600px;
}

.modal-futurista.detalles-admin {
  width: 800px;
}

.modal-futurista.cambiar-password {
  width: 500px;
}

.modal-header-futurista {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 1.5rem 1.5rem 0 0;
}

.modal-header-futurista h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.btn-close-modal {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close-modal:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

/* Formularios */
.form-crear-admin,
.form-cambiar-password {
  padding: 2rem;
}

.form-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label-futurista {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.9rem;
}

.password-input-container {
  position: relative;
}

.btn-toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.btn-toggle-password:hover {
  color: #e2e8f0;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.tipo-preview {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.tipo-preview h4 {
  margin: 0 0 1rem 0;
  color: #e2e8f0;
  font-size: 1rem;
}

.tipo-card-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid;
}

.tipo-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.tipo-info h5 {
  margin: 0 0 0.25rem 0;
  color: white;
  font-size: 1.1rem;
}

.tipo-info p {
  margin: 0 0 0.5rem 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.nivel-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Modal Detalles */
.header-admin-details {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 3px solid;
}

.admin-details-info h3 {
  margin: 0 0 0.25rem 0;
  color: white;
  font-size: 1.5rem;
}

.admin-details-info p {
  margin: 0 0 0.5rem 0;
  color: #94a3b8;
}

.admin-tipo {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.detalles-content {
  padding: 2rem;
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.detalle-seccion {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
}

.detalle-seccion h4 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  color: #94a3b8;
  font-weight: 500;
}

.info-item span {
  color: white;
  font-weight: 600;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.estado-badge.activo {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.estado-badge.bloqueado {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.estado-badge.inactivo {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.text-warning {
  color: #fbbf24 !important;
}

.text-danger {
  color: #f87171 !important;
}

.sesiones-count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.permisos-seccion {
  grid-column: 1 / -1;
}

.permisos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.permiso-item {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
}

.permiso-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4ade80;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.permiso-modulo {
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sin-permisos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #94a3b8;
}

.acciones-disponibles {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Modal Cambiar Contraseña */
.user-info-password {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}

.user-info-password h4 {
  margin: 0;
  color: white;
  font-size: 1.1rem;
}

.user-info-password p {
  margin: 0.25rem 0 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 0.5rem;
  color: #f87171;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.password-tips {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 2rem;
}

.password-tips h5 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a5b4fc;
  font-size: 1rem;
}

.password-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.password-tips li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.password-tips li.completed {
  color: #4ade80;
}

.password-tips li i {
  font-size: 1rem;
}

/* Botones adicionales */
.btn-secondary {
  background: rgba(107, 114, 128, 0.3);
  color: #e2e8f0;
  border: 1px solid rgba(107, 114, 128, 0.5);
}

.btn-secondary:hover {
  background: rgba(107, 114, 128, 0.5);
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
}

.btn-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.6);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
}

.btn-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.6);
}

/* Clases auxiliares */
.animate-spin {
  animation: spin 1s linear infinite;
}

.ph-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content-admin {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filtros-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-table {
    font-size: 0.875rem;
  }
  
  .admin-table th,
  .admin-table td {
    padding: 1rem 0.5rem;
  }
  
  .modal-futurista {
    width: 95vw;
    margin: 1rem;
  }
  
  .detalles-grid {
    grid-template-columns: 1fr;
  }
}
</style>