<template>
  <div class="acordeon-incidente-mejorado">
    <!-- HEADER MEJORADO CON MEJORES ICONOS -->
    <div class="acordeon-header">
      <div class="header-icon-container">
        <i class="fas fa-shield-virus header-icon"></i>
      </div>
      <h2 class="acordeon-titulo">
        Registro Incidente Gestión Ley Ciberseguridad 21.663
      </h2>
      <div class="empresa-info">
        <div class="info-item">
          <i class="fas fa-building"></i>
          <span>{{ empresaInfo.nombre || 'Cargando...' }}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-tag"></i>
          <span class="tipo-badge" :class="'tipo-' + (empresaInfo.tipo || 'pse').toLowerCase()">
            {{ empresaInfo.tipo || 'PSE' }}
          </span>
        </div>
        <div class="info-item">
          <i class="fas fa-users"></i>
          <span>{{ empresaInfo.inquilino || 'Sin asignar' }}</span>
        </div>
      </div>
    </div>

    <!-- ACORDEÓN DE 7 SECCIONES (ESTRUCTURA EXACTA) -->
    <div class="acordeon-container">
      
      <!-- SECCIÓN 1: Identificación General -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[1] }">
        <div class="seccion-header" @click="toggleSeccion(1)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[1] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-id-badge"></i>
          </div>
          <span class="seccion-numero">1</span>
          <span class="seccion-titulo">Identificación General</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(1)" class="fas fa-check-circle text-green-500"></i>
            <i v-else class="fas fa-circle text-gray-400"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[1]" class="seccion-contenido">
          <!-- 1.1 Tipo de registro -->
          <div class="campo-grupo">
            <label class="campo-label">
              1.1 Tipo de registro del Incidente <span class="requerido">*</span>
            </label>
            <select v-model="formData['1.1']" name="tipo_registro" class="campo-input" required>
              <option value="">Seleccionar tipo</option>
              <option value="Incidente de Seguridad">Incidente de Seguridad</option>
              <option value="Brecha de Datos">Brecha de Datos</option>
              <option value="Ataque Cibernético">Ataque Cibernético</option>
            </select>
          </div>

          <!-- 1.2 Título -->
          <div class="campo-grupo">
            <label class="campo-label">
              1.2 Título del Incidente <span class="requerido">*</span>
            </label>
            <input 
              v-model="formData['1.2']" 
              type="text" 
              class="campo-input"
              placeholder="Ingrese el título del incidente"
            />
          </div>

          <!-- 1.3 Fecha detección -->
          <div class="campo-grupo">
            <label class="campo-label">
              1.3 Fecha y hora de Detección <span class="requerido">*</span>
            </label>
            <input 
              v-model="formData['1.3']" 
              type="datetime-local" 
              name="fecha_deteccion"
              class="campo-input"
              required
            />
          </div>

          <!-- 1.4 Fecha ocurrencia -->
          <div class="campo-grupo">
            <label class="campo-label">
              1.4 Fecha y hora de ocurrencia <span class="requerido">*</span>
            </label>
            <input 
              v-model="formData['1.4']" 
              type="datetime-local" 
              name="fecha_ocurrencia"
              class="campo-input"
              required
            />
          </div>

          <!-- 1.5 Criticidad -->
          <div class="campo-grupo">
            <label class="campo-label">
              1.5 Criticidad <span class="requerido">*</span>
            </label>
            <select v-model="formData['1.5']" name="criticidad" class="campo-input" required>
              <option value="">Seleccionar criticidad</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <!-- 1.6 Alcance geográfico -->
          <div class="campo-grupo">
            <label class="campo-label">1.6 Alcance Geográfico</label>
            <select v-model="formData['1.6']" name="alcance_geografico" class="campo-input">
              <option value="">Seleccionar alcance</option>
              <option value="Local">Local</option>
              <option value="Regional">Regional</option>
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </div>

          <!-- 1.7 Solicitud de Apoyo CSIRT -->
          <div class="campo-grupo">
            <label>
              <input 
                type="checkbox" 
                name="solicitar_csirt" 
                value="1"
                v-model="formData['1.7.solicitar_csirt']"
              />
              ¿Solicitar ayuda a CSIRT?
            </label>
          </div>
            
          <!-- Campos adicionales si solicita CSIRT -->
            <div v-if="formData['1.7.solicitar_csirt']" class="campos-csirt">
              <div class="campo-grupo">
                <label class="campo-label">Tipo de apoyo requerido</label>
                <select v-model="formData['1.7.tipo_apoyo']" class="campo-input">
                  <option value="">Seleccione...</option>
                  <option value="Análisis técnico">Análisis técnico</option>
                  <option value="Contención">Contención</option>
                  <option value="Investigación forense">Investigación forense</option>
                  <option value="Coordinación">Coordinación</option>
                  <option value="Asesoría legal">Asesoría legal</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div class="campo-grupo">
                <label class="campo-label">Urgencia del apoyo</label>
                <select v-model="formData['1.7.urgencia']" class="campo-input">
                  <option value="">Seleccione...</option>
                  <option value="Inmediata">Inmediata (2 horas)</option>
                  <option value="Urgente">Urgente (24 horas)</option>
                  <option value="Normal">Normal (72 horas)</option>
                </select>
              </div>

              <div class="campo-grupo">
                <label class="campo-label">Observaciones para CSIRT</label>
                <textarea 
                  v-model="formData['1.7.observaciones_csirt']" 
                  class="campo-textarea"
                  rows="3"
                  placeholder="Información adicional para el CSIRT..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: Descripción y Alcance -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[2] }">
        <div class="seccion-header" @click="toggleSeccion(2)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[2] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-chart-area"></i>
          </div>
          <span class="seccion-numero">2</span>
          <span class="seccion-titulo">Descripción y Alcance</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(2)" class="fas fa-check-circle text-green-500"></i>
            <i v-else class="fas fa-circle text-gray-400"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[2]" class="seccion-contenido">
          <!-- 2.1 Descripción -->
          <div class="campo-grupo">
            <label class="campo-label">
              2.1 Descripción inicial detallada <span class="requerido">*</span>
            </label>
            <textarea 
              v-model="formData['2.1']" 
              class="campo-textarea"
              rows="4"
              placeholder="Describa detalladamente el incidente..."
            ></textarea>
          </div>

          <!-- 2.2 Impacto -->
          <div class="campo-grupo">
            <label class="campo-label">
              2.2 Impacto Preliminar Observado <span class="requerido">*</span>
            </label>
            <textarea 
              v-model="formData['2.2']" 
              class="campo-textarea"
              rows="3"
              placeholder="Describa el impacto observado..."
            ></textarea>
          </div>

          <!-- 2.3 Sistemas afectados -->
          <div class="campo-grupo">
            <label class="campo-label">
              2.3 Sistemas, activos o personal afectado <span class="requerido">*</span>
            </label>
            <textarea 
              v-model="formData['2.3']" 
              class="campo-textarea"
              rows="3"
              placeholder="Liste los sistemas, activos o personal afectado..."
            ></textarea>
          </div>

          <!-- 2.4 Servicios interrumpidos -->
          <div class="campo-grupo">
            <label class="campo-label">
              2.4 Servicios interrumpidos y duración <span class="requerido">*</span>
            </label>
            <textarea 
              v-model="formData['2.4']" 
              class="campo-textarea"
              rows="3"
              placeholder="Indique servicios interrumpidos y su duración..."
            ></textarea>
          </div>

          <!-- 2.5 Evidencias -->
          <div class="campo-grupo">
            <label class="campo-label">2.5 Subir evidencias - descripción</label>
            <div class="evidencias-container">
              <GestorArchivosSeccion
                :seccion="2"
                :campo="5"
                :archivos="archivosSeccion2"
                @archivo-agregado="agregarArchivo(2, 5, $event)"
                @archivo-eliminado="eliminarArchivo(2, 5, $event)"
                @comentario-actualizado="actualizarComentario(2, 5, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: Análisis Preliminar -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[3] }">
        <div class="seccion-header" @click="toggleSeccion(3)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[3] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-search"></i>
          </div>
          <span class="seccion-numero">3</span>
          <span class="seccion-titulo">Análisis Preliminar</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(3)" class="fas fa-check-circle text-green-500"></i>
            <i v-else class="fas fa-circle text-gray-400"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[3]" class="seccion-contenido">
          <!-- 3.1 Tipo amenaza -->
          <div class="campo-grupo">
            <label class="campo-label">
              3.1 Tipo Amenaza Probable <span class="requerido">*</span>
            </label>
            <select v-model="formData['3.1']" class="campo-input">
              <option value="">Seleccione...</option>
              <option value="Malware">Malware</option>
              <option value="Phishing">Phishing</option>
              <option value="DDoS">Ataque de Denegación de Servicio (DDoS)</option>
              <option value="Ransomware">Ransomware</option>
              <option value="Intrusión">Intrusión</option>
              <option value="Ingeniería Social">Ingeniería Social</option>
              <option value="Fuga de Información">Fuga de Información</option>
              <option value="Vulnerabilidad">Explotación de Vulnerabilidad</option>
              <option value="Acceso No Autorizado">Acceso No Autorizado</option>
              <option value="Sabotaje">Sabotaje</option>
              <option value="Error Humano">Error Humano</option>
              <option value="Falla Técnica">Falla Técnica</option>
              <option value="Desconocido">Desconocido</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <!-- 3.2 Origen/vector -->
          <div class="campo-grupo">
            <label class="campo-label">
              3.2 Origen/vector de ataque probable <span class="requerido">*</span>
            </label>
            <select v-model="formData['3.2']" class="campo-input">
              <option value="">Seleccione...</option>
              <option value="Email">Email</option>
              <option value="Web/Internet">Web/Internet</option>
              <option value="USB/Dispositivo Extraíble">USB/Dispositivo Extraíble</option>
              <option value="Red Interna">Red Interna</option>
              <option value="Acceso Remoto">Acceso Remoto</option>
              <option value="Aplicación Web">Aplicación Web</option>
              <option value="Redes Sociales">Redes Sociales</option>
              <option value="Teléfono">Teléfono</option>
              <option value="Físico">Acceso Físico</option>
              <option value="Insider">Amenaza Interna</option>
              <option value="WiFi">Red WiFi</option>
              <option value="Proveedor/Tercero">Proveedor/Tercero</option>
              <option value="Sistema Operativo">Sistema Operativo</option>
              <option value="Aplicación">Aplicación</option>
              <option value="Desconocido">Desconocido</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <!-- 3.3 Responsable -->
          <div class="campo-grupo">
            <label class="campo-label">
              3.3 Responsable del cliente
            </label>
            <input 
              v-model="formData['3.3']" 
              type="text" 
              class="campo-input"
              placeholder="Persona con mayores antecedentes del evento"
            />
          </div>

          <!-- 3.4 Evidencias -->
          <div class="campo-grupo">
            <label class="campo-label">3.4 Subir evidencias - descripción</label>
            <div class="evidencias-container">
              <GestorArchivosSeccion
                :seccion="3"
                :campo="4"
                :archivos="archivosSeccion3"
                @archivo-agregado="agregarArchivo(3, 4, $event)"
                @archivo-eliminado="eliminarArchivo(3, 4, $event)"
                @comentario-actualizado="actualizarComentario(3, 4, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECCION 4 -->
      <div class="acordeon-seccion" :class="{activa: seccionesAbiertas[4]}">
        <div class="seccion-header" @click="toggleSeccion(4)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[4] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-tags"></i>
          </div>
          <span class="seccion-numero">4</span>
          <span class="seccion-titulo">Clasificación de Taxonomías</span>
          <span class="seccion-estado">
            <span v-if="taxonomiasSeleccionadas.length > 0" class="badge-count">{{ taxonomiasSeleccionadas.length }}</span>
            <i v-if="seccionCompleta(4)" class="fas fa-check-circle text-green-500"></i>
            <i v-else class="fas fa-circle text-gray-400"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[4]" class="seccion-contenido">
          <!-- 4.1 Selección de taxonomías -->
          <div class="campo-grupo">
            <label class="campo-label">
              4.1 Selección de taxonomía <span class="requerido">*</span>
            </label>
            <div class="taxonomias-selector">
              <div class="selector-header">
                <p class="text-sm text-gray-400">
                  Mostrando taxonomías para empresa tipo: <strong class="text-blue-400">{{ empresaInfo.tipo || 'PSE' }}</strong>
                </p>
                <div class="buscador-taxonomias">
                  <i class="fas fa-search"></i>
                  <input 
                    v-model="busquedaTaxonomia"
                    type="text" 
                    placeholder="Buscar taxonomía..."
                    class="input-busqueda"
                  />
                </div>
              </div>
              
              <div class="taxonomias-lista">
                <div v-if="cargandoTaxonomias" class="text-center py-8 text-gray-400">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Cargando taxonomías...</p>
                </div>
                <div v-else-if="taxonomiasFiltradas.length === 0" class="text-center py-8 text-gray-400">
                  <i class="fas fa-inbox text-2xl mb-2"></i>
                  <p>No se encontraron taxonomías</p>
                </div>
                <div 
                  v-for="tax in taxonomiasFiltradas" 
                  :key="tax.id"
                  :id="`taxonomia-${tax.id}`"
                  class="taxonomia-item"
                  :class="{ 'taxonomia-seleccionada': taxonomiaSeleccionada(tax.id) }"
                >
                  <!-- Checkbox de taxonomía -->
                  <div class="taxonomia-selector" @click="toggleTaxonomia(tax)">
                    <input 
                      type="checkbox" 
                      :id="`checkbox-${tax.id}`"
                      :checked="taxonomiaSeleccionada(tax.id)"
                      @click.stop
                      @change="toggleTaxonomia(tax)"
                    />
                    <div class="taxonomia-info">
                      <div class="taxonomia-codigo">{{ tax.id }}</div>
                      <div class="taxonomia-nombre">{{ tax.nombre }}</div>
                      <div class="taxonomia-descripcion">
                        <span class="tax-area">{{ tax.area }}</span>
                        <span class="tax-separador">•</span>
                        <span class="tax-efecto">{{ tax.efecto }}</span>
                        <span class="tax-separador">•</span>
                        <span class="tax-categoria">{{ tax.categoria }}</span>
                      </div>
                    </div>
                    <span class="taxonomia-tipo" :class="'tipo-' + tax.tipo.toLowerCase()">
                      {{ tax.tipo }}
                    </span>
                  </div>
                  
                  <!-- CAMPOS INMEDIATAMENTE DEBAJO DE ESTA TAXONOMÍA -->
                  <div 
                    v-if="taxonomiaSeleccionada(tax.id)"
                    :id="`campos-${tax.id}`"
                    class="campos-taxonomia"
                    style="margin-left: 30px; border-left: 3px solid #007bff; padding-left: 15px; margin-top: 10px; background: #f8f9fa; padding: 15px; border-radius: 5px;"
                  >
                    <h5 style="color: #007bff; margin-bottom: 15px;">📋 Campos para: {{ tax.id }}</h5>
                    
                    <!-- 4.2.1 ¿Por qué fue seleccionada? OBLIGATORIO -->
                    <div class="campo-grupo">
                      <label class="campo-label">
                        4.2.1 ¿Por qué fue seleccionada esta taxonomía? <span class="requerido">*</span>
                      </label>
                      <textarea 
                        v-model="obtenerTaxonomiaSeleccionada(tax.id).justificacion"
                        :name="`porque_${tax.id}`"
                        class="campo-textarea"
                        rows="3"
                        placeholder="Explique por qué esta taxonomía aplica al incidente..."
                        required
                      ></textarea>
                    </div>

                    <!-- 4.3.1 Descripción acabada del problema -->
                    <div class="campo-grupo">
                      <label class="campo-label">4.3.1 Descripción acabada del problema</label>
                      <textarea 
                        v-model="obtenerTaxonomiaSeleccionada(tax.id).descripcionProblema"
                        :name="`descripcion_${tax.id}`"
                        class="campo-textarea"
                        rows="3"
                        placeholder="Detalle específico del problema relacionado con esta taxonomía..."
                      ></textarea>
                    </div>

                    <!-- 4.4.1 Evidencias -->
                    <div class="campo-grupo">
                      <label class="campo-label">4.4.1 Evidencias</label>
                      <button 
                        @click="abrirSelectorArchivos(tax.id)" 
                        type="button"
                        class="btn-subir-evidencia"
                      >
                        📎 Subir Evidencias
                      </button>
                      <div :id="`archivos-${tax.id}`" class="archivos-lista">
                        <div 
                          v-for="archivo in obtenerTaxonomiaSeleccionada(tax.id).archivos" 
                          :key="archivo.id" 
                          class="archivo-item"
                        >
                          <i class="fas fa-file"></i>
                          <span>{{ archivo.nombre }}</span>
                          <button @click="eliminarArchivoTaxonomia(tax.id, archivo.id)" class="btn-eliminar">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- BOTÓN GUARDAR TAXONOMÍA -->
                    <div class="campo-grupo" style="text-align: center; margin-top: 20px;">
                      <button 
                        @click="guardarTaxonomia(tax.id)"
                        type="button"
                        class="btn-guardar-taxonomia"
                        style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-weight: bold;"
                      >
                        💾 Guardar Taxonomía {{ tax.id }}
                      </button>
                    </div>
                  </div>
                </div>

        </div>
      </div>

      <!-- SECCIÓN 5: Acciones Inmediatas -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[5] }">
        <div class="seccion-header" @click="toggleSeccion(5)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[5] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <span class="seccion-numero">5</span>
          <span class="seccion-titulo">Acciones Inmediatas</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(5)" class="fas fa-check-circle text-green-500"></i>
            <i v-else class="fas fa-circle text-gray-400"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[5]" class="seccion-contenido">
          <!-- 5.1 Medidas -->
          <div class="campo-grupo">
            <label class="campo-label">
              5.1 Medidas de contención Iniciales <span class="requerido">*</span>
            </label>
            <textarea 
              v-model="formData['5.1']" 
              class="campo-textarea"
              rows="4"
              placeholder="Describa las medidas de contención aplicadas..."
            ></textarea>
          </div>

          <!-- 5.2 Evidencias -->
          <div class="campo-grupo">
            <label class="campo-label">5.2 Evidencia Acciones</label>
            <div class="evidencias-container">
              <GestorArchivosSeccion
                :seccion="5"
                :campo="2"
                :archivos="archivosSeccion5"
                @archivo-agregado="agregarArchivo(5, 2, $event)"
                @archivo-eliminado="eliminarArchivo(5, 2, $event)"
                @comentario-actualizado="actualizarComentario(5, 2, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 6: Análisis de Causa Raíz -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[6] }">
        <div class="seccion-header" @click="toggleSeccion(6)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[6] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-diagnoses"></i>
          </div>
          <span class="seccion-numero">6</span>
          <span class="seccion-titulo">Análisis de Causa Raíz</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(6)" class="fas fa-check-circle text-green-500"></i>
            <i v-else class="fas fa-circle text-gray-400"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[6]" class="seccion-contenido">
          <!-- 6.1 Análisis -->
          <div class="campo-grupo">
            <label class="campo-label">
              6.1 Análisis de Causa Raíz <span class="requerido">*</span>
            </label>
            <textarea 
              v-model="formData['6.1']" 
              class="campo-textarea"
              rows="4"
              placeholder="Análisis detallado de la causa raíz..."
            ></textarea>
          </div>

          <!-- 6.2 Lecciones -->
          <div class="campo-grupo">
            <label class="campo-label">6.2 Lecciones aprendidas</label>
            <textarea 
              v-model="formData['6.2']" 
              class="campo-textarea"
              rows="3"
              placeholder="Lecciones aprendidas del incidente..."
            ></textarea>
          </div>

          <!-- 6.3 Recomendaciones -->
          <div class="campo-grupo">
            <label class="campo-label">6.3 Recomendaciones de mejora</label>
            <textarea 
              v-model="formData['6.3']" 
              class="campo-textarea"
              rows="3"
              placeholder="Recomendaciones para evitar futuros incidentes..."
            ></textarea>
          </div>

          <!-- 6.4 Evidencias -->
          <div class="campo-grupo">
            <label class="campo-label">6.4 Subir Evidencias - Descripción</label>
            <div class="evidencias-container">
              <GestorArchivosSeccion
                :seccion="6"
                :campo="4"
                :archivos="archivosSeccion6"
                @archivo-agregado="agregarArchivo(6, 4, $event)"
                @archivo-eliminado="eliminarArchivo(6, 4, $event)"
                @comentario-actualizado="actualizarComentario(6, 4, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 7: Resumen de archivos -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[7] }">
        <div class="seccion-header" @click="toggleSeccion(7)">
          <i class="fas fa-chevron-right seccion-chevron" :class="{ rotated: seccionesAbiertas[7] }"></i>
          <div class="seccion-icon">
            <i class="fas fa-file-invoice"></i>
          </div>
          <span class="seccion-numero">7</span>
          <span class="seccion-titulo">Resumen de todos los archivos</span>
          <span class="seccion-estado">
            <span class="badge-archivos">
              <i class="fas fa-paperclip"></i>
              {{ totalArchivos }}
            </span>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[7]" class="seccion-contenido">
          <ResumenArchivosIncidente
            :archivos="todosLosArchivos"
          />
        </div>
      </div>

    </div>

    <!-- BOTONES DE ACCIÓN (MANTENER EXACTOS) -->
    <div class="acciones-footer">
      <button @click="guardarBorrador" class="btn btn-secondary">
        <i class="fas fa-save"></i>
        Guardar Borrador
      </button>
      <button @click="validarFormulario" class="btn btn-warning">
        <i class="fas fa-check"></i>
        Validar
      </button>
      <button @click="guardarIncidente" class="btn btn-primary" :disabled="!formularioValido">
        <i class="fas fa-paper-plane"></i>
        Guardar Incidente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import GestorArchivosSeccion from './GestorArchivosSeccion.vue'
import ResumenArchivosIncidente from './ResumenArchivosIncidente.vue'

// Props
const props = defineProps({
  empresaId: {
    type: [String, Number],
    required: true
  },
  empresaInfo: {
    type: Object,
    default: () => ({
      nombre: '',
      tipo: 'PSE',
      inquilino: ''
    })
  },
  incidenteId: {
    type: [String, Number],
    default: null
  },
  modo: {
    type: String,
    default: 'crear' // crear, editar
  }
})

// Emits
const emit = defineEmits(['incidente-guardado', 'error'])

// Estado del formulario
const formData = ref({
  '1.1': '', // Tipo de registro
  '1.2': '', // Título
  '1.3': '', // Fecha detección
  '1.4': '', // Fecha ocurrencia
  '1.5': '', // Criticidad
  '1.6': '', // Alcance geográfico
  '1.7.solicitar_csirt': false, // Solicitar CSIRT
  '1.7.tipo_apoyo': '', // Tipo de apoyo CSIRT
  '1.7.urgencia': '', // Urgencia apoyo
  '1.7.observaciones_csirt': '', // Observaciones CSIRT
  '2.1': '', // Descripción inicial
  '2.2': '', // Impacto preliminar
  '2.3': '', // Sistemas afectados
  '2.4': '', // Servicios interrumpidos
  '3.1': '', // Tipo amenaza
  '3.2': '', // Origen/vector
  '3.3': '', // Responsable
  '5.1': '', // Medidas contención
  '6.1': '', // Análisis causa raíz
  '6.2': '', // Lecciones aprendidas
  '6.3': ''  // Recomendaciones
})
const seccionesAbiertas = ref({ 1: true }) // Sección 1 abierta por defecto
const taxonomiasDisponibles = ref([])
const taxonomiasSeleccionadas = ref([])
const busquedaTaxonomia = ref('')
const cargandoTaxonomias = ref(false)
const dragOver = ref(false)

// Archivos por sección (mantener estructura exacta)
const archivosSeccion2 = ref([])
const archivosSeccion3 = ref([])
const archivosSeccion5 = ref([])
const archivosSeccion6 = ref([])

// Variables para modo edición
const modoEdicion = ref(false)
const incidenteOriginal = ref(null)
const metadata = ref({})

// Estado de validación
const erroresValidacion = ref({})
const formularioValido = computed(() => {
  return validarRequeridos()
})

// Computed
const totalArchivos = computed(() => {
  let total = archivosSeccion2.value.length +
              archivosSeccion3.value.length +
              archivosSeccion5.value.length +
              archivosSeccion6.value.length
  
  // Sumar archivos de taxonomías
  taxonomiasSeleccionadas.value.forEach(tax => {
    total += (tax.archivos || []).length
  })
  
  return total
})

const todosLosArchivos = computed(() => {
  const archivos = []
  
  // Sección 2
  archivosSeccion2.value.forEach((archivo, idx) => {
    archivos.push({
      submodulo: '2',
      item: `2.5.${idx + 1}`,
      nombre: archivo.nombre,
      descripcion: archivo.descripcion,
      fechaCarga: archivo.fechaCarga,
      seccion: 'Descripción y Alcance'
    })
  })
  
  // Agregar de otras secciones...
  
  return archivos
})

// Computed para filtrar taxonomías según búsqueda
const taxonomiasFiltradas = computed(() => {
  if (!busquedaTaxonomia.value) return taxonomiasDisponibles.value
  
  const busqueda = busquedaTaxonomia.value.toLowerCase()
  return taxonomiasDisponibles.value.filter(tax => 
    tax.id.toLowerCase().includes(busqueda) ||
    tax.nombre.toLowerCase().includes(busqueda) ||
    tax.area.toLowerCase().includes(busqueda) ||
    tax.categoria.toLowerCase().includes(busqueda) ||
    tax.descripcion.toLowerCase().includes(busqueda)
  )
})

// Métodos
function toggleSeccion(numero) {
  seccionesAbiertas.value[numero] = !seccionesAbiertas.value[numero]
}

function seccionCompleta(numero) {
  // Lógica para determinar si una sección está completa
  switch(numero) {
    case 1:
      return formData.value['1.1'] && formData.value['1.2'] && 
             formData.value['1.3'] && formData.value['1.4'] && 
             formData.value['1.5']
    case 2:
      return formData.value['2.1'] && formData.value['2.2'] && 
             formData.value['2.3'] && formData.value['2.4']
    case 3:
      return formData.value['3.1'] && formData.value['3.2']
    case 4:
      return taxonomiasSeleccionadas.value.length > 0 &&
             taxonomiasSeleccionadas.value.every(t => t.justificacion)
    case 5:
      return formData.value['5.1']
    case 6:
      return formData.value['6.1']
    case 7:
      return true // Siempre completa (es automática)
    default:
      return false
  }
}

async function cargarTaxonomias() {
  try {
    cargandoTaxonomias.value = true
    const tipoEmpresa = props.empresaInfo.tipo || 'PSE'
    console.log('🔍 Cargando taxonomías para tipo:', tipoEmpresa)
    
    // Intentar endpoint principal con tipo_empresa
    let response = await fetch(`http://localhost:5000/api/admin/taxonomias/flat?tipo_empresa=${tipoEmpresa}`)
    console.log('📡 Respuesta status:', response.status)
    
    if (!response.ok) {
      console.log('⚠️ Intentando endpoint alternativo...')
      response = await fetch('http://localhost:5000/api/admin/taxonomias/flat')
    }
    
    const data = await response.json()
    console.log('📋 Datos recibidos:', data)
    
    // El endpoint devuelve directamente un array de taxonomías
    let todasTaxonomias = Array.isArray(data) ? data : (data.taxonomias || [])
    console.log(`📊 Total taxonomías recibidas: ${todasTaxonomias.length}`)
    
    // Filtrar y mapear taxonomías con todos los campos del modelo antiguo
    taxonomiasDisponibles.value = todasTaxonomias
      .filter(tax => {
        // Verificar tipo de empresa - el endpoint devuelve en minúsculas
        const tipoTax = (tax.aplica_para || tax.AplicaTipoEmpresa || tax.tipo || '').toUpperCase()
        // PSE ve: PSE + AMBAS
        // OIV ve: OIV + AMBAS
        const aplica = tipoTax === 'AMBAS' || tipoTax === tipoEmpresa.toUpperCase()
        if (!aplica && tipoTax !== '') {
          console.log(`❌ Taxonomía excluida: ${tax.id} - Tipo: ${tipoTax} (buscando ${tipoEmpresa})`)
        }
        return aplica || tipoTax === '' || tipoTax === null
      })
      .map(tax => ({
        id: tax.id || tax.ID_Incidente || tax.Id_Incidente,
        nombre: `${tax.categoria || ''} - ${tax.subcategoria || ''}`.trim() || 'Sin nombre',
        area: tax.area || tax.Area || '',
        efecto: tax.efecto || tax.Efecto || '',
        categoria: tax.categoria || tax.Categoria_del_Incidente || '',
        subcategoria: tax.subcategoria || tax.Subcategoria_del_Incidente || '',
        descripcion: `${tax.area || ''} - ${tax.efecto || ''} - ${tax.subcategoria || ''}`.replace(/\s+-\s+$/, '').replace(/^\s+-\s+/, '').trim(),
        tipo: (tax.aplica_para || tax.AplicaTipoEmpresa || 'PSE').toUpperCase()
      }))
    
    console.log(`✅ ${taxonomiasDisponibles.value.length} taxonomías aplicables para ${tipoEmpresa}`)
    console.log('🎯 Primeras 3 taxonomías:', taxonomiasDisponibles.value.slice(0, 3))
    
  } catch (error) {
    console.error('❌ Error cargando taxonomías:', error)
    console.error('Detalle del error:', error.message)
    
    // Cargar taxonomías de demo con estructura completa
    const tipoEmpresa = props.empresaInfo.tipo || 'PSE'
    taxonomiasDisponibles.value = [
      { 
        id: 'INC_USO_UNRI_AFBE', 
        nombre: 'Ataque de fuerza bruta exitoso',
        area: 'Uso no autorizado',
        efecto: 'Redes e infraestructura',
        categoria: 'Ataque de fuerza bruta',
        subcategoria: 'Exitoso',
        tipo: tipoEmpresa, 
        descripcion: 'Uso no autorizado de redes - Ataque de fuerza bruta exitoso' 
      },
      { 
        id: 'INC_CONF_EXDA_FDP', 
        nombre: 'Filtración de datos personales',
        area: 'Confidencialidad',
        efecto: 'Exfiltración de datos',
        categoria: 'Filtración de datos',
        subcategoria: 'Personales',
        tipo: 'AMBAS', 
        descripcion: 'Exfiltración y/o exposición de datos - Filtración de datos personales' 
      },
      { 
        id: 'INC_DISP_INDS_DSEV', 
        nombre: 'Denegación de servicio',
        area: 'Disponibilidad',
        efecto: 'Indisponibilidad',
        categoria: 'Denegación de servicio',
        subcategoria: 'Servicios esenciales',
        tipo: tipoEmpresa, 
        descripcion: 'Indisponibilidad y/o denegación de servicio' 
      },
      {
        id: 'INC_INT_MODI_MOSI',
        nombre: 'Modificación no autorizada',
        area: 'Integridad',
        efecto: 'Modificación',
        categoria: 'Modificación de información',
        subcategoria: 'Sistema',
        tipo: 'AMBAS',
        descripcion: 'Integridad - Modificación de información'
      },
      {
        id: 'INC_CONF_ROBO_RCRE',
        nombre: 'Robo de credenciales',
        area: 'Confidencialidad',
        efecto: 'Robo',
        categoria: 'Robo de credenciales',
        subcategoria: 'Credenciales de acceso',
        tipo: tipoEmpresa,
        descripcion: 'Confidencialidad - Robo de credenciales'
      }
    ]
    console.log('ℹ️ Usando taxonomías de demostración')
  } finally {
    cargandoTaxonomias.value = false
  }
}

function taxonomiaSeleccionada(taxId) {
  return taxonomiasSeleccionadas.value.some(t => t.id === taxId)
}

function obtenerTaxonomiaSeleccionada(taxId) {
  let tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
  if (!tax) {
    // Si no existe, crear una entrada vacía
    tax = {
      id: taxId,
      justificacion: '',
      descripcionProblema: '',
      archivos: []
    }
    taxonomiasSeleccionadas.value.push(tax)
  }
  return tax
}

function toggleTaxonomia(tax) {
  const index = taxonomiasSeleccionadas.value.findIndex(t => t.id === tax.id)
  
  if (index > -1) {
    // Si deselecciona, confirmar si hay datos
    const taxSeleccionada = taxonomiasSeleccionadas.value[index]
    if (taxSeleccionada.justificacion || taxSeleccionada.descripcionProblema || (taxSeleccionada.archivos && taxSeleccionada.archivos.length > 0)) {
      if (!confirm('¿Está seguro de deseleccionar esta taxonomía? Se perderán todos los datos asociados.')) {
        return
      }
    }
    taxonomiasSeleccionadas.value.splice(index, 1)
  } else {
    // Agregar con todos los campos del modelo
    taxonomiasSeleccionadas.value.push({
      id: tax.id,
      nombre: tax.nombre,
      area: tax.area,
      efecto: tax.efecto,
      categoria: tax.categoria,
      subcategoria: tax.subcategoria,
      descripcion: tax.descripcion,
      tipo: tax.tipo,
      justificacion: '',
      descripcionProblema: '',
      archivos: []
    })
  }
}

function agregarArchivo(seccion, campo, archivo) {
  const archivoConMetadata = {
    ...archivo,
    seccion,
    campo,
    id: `${seccion}.${campo}.${Date.now()}`
  }
  
  switch(seccion) {
    case 2:
      archivosSeccion2.value.push(archivoConMetadata)
      break
    case 3:
      archivosSeccion3.value.push(archivoConMetadata)
      break
    case 5:
      archivosSeccion5.value.push(archivoConMetadata)
      break
    case 6:
      archivosSeccion6.value.push(archivoConMetadata)
      break
  }
}

function eliminarArchivo(seccion, campo, archivoId) {
  switch(seccion) {
    case 2:
      archivosSeccion2.value = archivosSeccion2.value.filter(a => a.id !== archivoId)
      break
    case 3:
      archivosSeccion3.value = archivosSeccion3.value.filter(a => a.id !== archivoId)
      break
    case 5:
      archivosSeccion5.value = archivosSeccion5.value.filter(a => a.id !== archivoId)
      break
    case 6:
      archivosSeccion6.value = archivosSeccion6.value.filter(a => a.id !== archivoId)
      break
  }
}

function actualizarComentario(seccion, campo, data) {
  // Actualizar comentario del archivo
  console.log('Actualizando comentario:', { seccion, campo, data })
}

function agregarArchivoTaxonomia(taxId, archivo) {
  const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
  if (tax) {
    if (!tax.archivos) tax.archivos = []
    tax.archivos.push({
      ...archivo,
      id: `tax.${taxId}.${Date.now()}`
    })
  }
}

async function eliminarArchivoTaxonomia(taxId, archivoId) {
  if (!confirm('¿Está seguro de eliminar este archivo permanentemente?')) {
    return
  }
  
  try {
    // Llamar API para eliminar archivo físicamente
    const response = await fetch(`/api/taxonomias/eliminar-evidencia/${archivoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taxonomia_id: taxId,
        incidente_id: props.incidenteId,
        empresa_id: props.empresaId
      })
    })
    
    if (!response.ok) {
      throw new Error('Error eliminando archivo')
    }
    
    // Eliminar del estado local
    const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
    if (tax && tax.archivos) {
      tax.archivos = tax.archivos.filter(a => a.id !== archivoId)
    }
    
    console.log('✅ Archivo eliminado exitosamente')
  } catch (error) {
    console.error('❌ Error eliminando archivo:', error)
    alert('Error al eliminar el archivo. Por favor intente nuevamente.')
  }
}

function actualizarComentarioTaxonomia(taxId, data) {
  console.log('Actualizando comentario taxonomía:', { taxId, data })
}

function actualizarComentarioArchivoTax(taxId, archivoId, comentario) {
  const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
  if (tax && tax.archivos) {
    const archivo = tax.archivos.find(a => a.id === archivoId)
    if (archivo) {
      archivo.comentario = comentario
      guardarBorradorAutomatico()
    }
  }
}

function eliminarTaxonomiaSeleccionada(taxId) {
  const index = taxonomiasSeleccionadas.value.findIndex(t => t.id === taxId)
  if (index > -1) {
    const tax = taxonomiasSeleccionadas.value[index]
    if (tax.archivos && tax.archivos.length > 0) {
      if (!confirm(`Esta taxonomía tiene ${tax.archivos.length} archivo(s) adjunto(s). ¿Está seguro de eliminarla?`)) {
        return
      }
    }
    taxonomiasSeleccionadas.value.splice(index, 1)
  }
}

function abrirSelectorArchivos(taxId) {
  // Buscar el input file correspondiente a esta taxonomía
  const fileInput = document.querySelector(`input[ref="fileInput_${taxId}"]`)
  if (fileInput) {
    fileInput.click()
  } else {
    // Fallback: crear un input temporal
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip'
    input.onchange = (event) => {
      const files = Array.from(event.target.files)
      files.forEach(file => procesarArchivo(file, taxId))
    }
    input.click()
  }
}

function subirEvidencia(taxId) {
  // Alias para abrirSelectorArchivos - misma funcionalidad
  abrirSelectorArchivos(taxId)
}

function eliminarArchivoTax(taxId, archivoId) {
  // Alias para eliminarArchivoTaxonomia - misma funcionalidad
  eliminarArchivoTaxonomia(taxId, archivoId)
}

// Funciones para drag and drop
function onDragOver(event) {
  dragOver.value = true
}

function onDragLeave(event) {
  dragOver.value = false
}

async function onDropArchivos(event, taxId) {
  dragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  
  for (const file of files) {
    await procesarArchivo(file, taxId)
  }
}

async function onFileSelect(event, taxId) {
  const files = Array.from(event.target.files)
  
  for (const file of files) {
    await procesarArchivo(file, taxId)
  }
  
  // Limpiar input
  event.target.value = ''
}

async function procesarArchivo(file, taxId) {
  // Validar tamaño
  if (file.size > 10 * 1024 * 1024) {
    alert(`El archivo ${file.name} excede el límite de 10MB`)
    return
  }
  
  // Validar tipo
  const tiposPermitidos = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt', '.zip']
  const extension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'))
  if (!tiposPermitidos.includes(extension)) {
    alert(`Tipo de archivo no permitido: ${extension}`)
    return
  }
  
  try {
    // Crear FormData para subir archivo
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('taxonomia_id', taxId)
    formData.append('empresa_id', props.empresaId)
    formData.append('incidente_id', props.incidenteId || 'nuevo')
    
    // Subir archivo
    const response = await fetch('/api/taxonomias/subir-evidencia', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Error subiendo archivo')
    }
    
    const resultado = await response.json()
    
    // Agregar archivo a la taxonomía con fecha/hora automática
    const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
    if (tax) {
      if (!tax.archivos) tax.archivos = []
      tax.archivos.push({
        id: resultado.archivo_id || `tax.${taxId}.${Date.now()}`,
        nombre: file.name,
        tamaño: file.size,
        tipo: file.type,
        fechaCarga: new Date().toISOString(),
        comentario: '',
        ruta: resultado.ruta || '',
        hash: resultado.hash || ''
      })
    }
    
    console.log('✅ Archivo subido exitosamente:', file.name)
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error)
    alert('Error al subir el archivo. Por favor intente nuevamente.')
  }
}

// Funciones auxiliares
function getIconoArchivo(nombreArchivo) {
  const ext = nombreArchivo.toLowerCase().split('.').pop()
  const iconos = {
    pdf: 'fas fa-file-pdf text-red-500',
    doc: 'fas fa-file-word text-blue-500',
    docx: 'fas fa-file-word text-blue-500',
    xls: 'fas fa-file-excel text-green-500',
    xlsx: 'fas fa-file-excel text-green-500',
    png: 'fas fa-file-image text-purple-500',
    jpg: 'fas fa-file-image text-purple-500',
    jpeg: 'fas fa-file-image text-purple-500',
    txt: 'fas fa-file-alt text-gray-500',
    zip: 'fas fa-file-archive text-yellow-500'
  }
  return iconos[ext] || 'fas fa-file text-gray-400'
}

function formatearTamaño(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatearFechaHora(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calcularTamañoTotal(archivos) {
  if (!archivos || archivos.length === 0) return '0 B'
  const total = archivos.reduce((sum, archivo) => sum + (archivo.tamaño || 0), 0)
  return formatearTamaño(total)
}

function verArchivo(archivo) {
  // TODO: Implementar vista previa o descarga
  console.log('Ver archivo:', archivo)
  if (archivo.ruta) {
    window.open(`/api/taxonomias/ver-evidencia/${archivo.id}`, '_blank')
  } else {
    alert('Vista previa no disponible en este momento')
  }
}

function guardarBorradorAutomatico() {
  // Guardar borrador automáticamente
  console.log('Guardando borrador automático...')
  // TODO: Implementar guardado automático
}

// FUNCIÓN CRÍTICA: Guardar taxonomía según especificaciones técnicas
async function guardarTaxonomia(taxonomiaId) {
  const tax = obtenerTaxonomiaSeleccionada(taxonomiaId)
  
  // VALIDACIÓN OBLIGATORIA: Campo "por qué" es requerido
  if (!tax.justificacion || tax.justificacion.trim() === '') {
    alert('El campo "Por qué fue seleccionada" es obligatorio')
    return
  }
  
  try {
    // Preparar datos para guardar
    const datos = {
      taxonomia_id: taxonomiaId,
      porque_seleccionada: tax.justificacion,
      descripcion_problema: tax.descripcionProblema || '',
      incidente_id: props.incidenteId,
      empresa_id: props.empresaId
      // archivos se manejan por separado
    }
    
    // Llamada AJAX para guardar
    const response = await fetch('/api/incidentes/guardar-taxonomia', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(datos)
    })
    
    if (response.ok) {
      alert('Taxonomía guardada correctamente')
      // Marcar como guardada visualmente
      const taxonomiaElement = document.querySelector(`#taxonomia-${taxonomiaId}`)
      if (taxonomiaElement) {
        taxonomiaElement.classList.add('guardada')
      }
      console.log(`✅ Taxonomía ${taxonomiaId} guardada exitosamente`)
    } else {
      throw new Error('Error del servidor')
    }
  } catch (error) {
    console.error('❌ Error guardando taxonomía:', error)
    alert('Error guardando taxonomía. Intente nuevamente.')
  }
}

function validarRequeridos() {
  // Validar campos requeridos
  const requeridos = {
    '1.1': formData.value['1.1'],
    '1.2': formData.value['1.2'],
    '1.3': formData.value['1.3'],
    '1.4': formData.value['1.4'],
    '1.5': formData.value['1.5'],
    '2.1': formData.value['2.1'],
    '2.2': formData.value['2.2'],
    '2.3': formData.value['2.3'],
    '2.4': formData.value['2.4'],
    '3.1': formData.value['3.1'],
    '3.2': formData.value['3.2'],
    '5.1': formData.value['5.1'],
    '6.1': formData.value['6.1']
  }
  
  // Validar taxonomías
  if (taxonomiasSeleccionadas.value.length === 0) return false
  if (!taxonomiasSeleccionadas.value.every(t => t.justificacion)) return false
  
  return Object.values(requeridos).every(v => v && v.toString().trim() !== '')
}

function guardarBorrador() {
  console.log('Guardando borrador...')
  localStorage.setItem(`incidente_borrador_${props.incidenteId || 'nuevo'}`, JSON.stringify({
    formData: formData.value,
    taxonomias: taxonomiasSeleccionadas.value,
    archivos: {
      seccion2: archivosSeccion2.value,
      seccion3: archivosSeccion3.value,
      seccion5: archivosSeccion5.value,
      seccion6: archivosSeccion6.value
    }
  }))
  alert('Borrador guardado localmente')
}

function validarFormulario() {
  if (validarRequeridos()) {
    alert('✅ Formulario válido')
  } else {
    alert('❌ Complete todos los campos requeridos')
  }
}

async function guardarIncidente() {
  if (!validarRequeridos()) {
    alert('Complete todos los campos requeridos')
    return
  }
  
  try {
    // Preparar datos con formato garantizado
    const datosIncidente = {
      // Mantener EXACTAMENTE el mismo formato
      ...formData.value,
      taxonomias_seleccionadas: taxonomiasSeleccionadas.value,
      archivos: {
        seccion_2: archivosSeccion2.value,
        seccion_3: archivosSeccion3.value,
        seccion_5: archivosSeccion5.value,
        seccion_6: archivosSeccion6.value
      },
      empresa_id: props.empresaId,
      tipo_empresa: props.empresaInfo.tipo
    }
    
    // Llamar API para guardar
    const url = props.modo === 'editar' 
      ? `/api/admin/incidentes/${props.incidenteId}`
      : `/api/admin/incidentes`
    
    const response = await fetch(url, {
      method: props.modo === 'editar' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosIncidente)
    })
    
    if (!response.ok) throw new Error('Error guardando incidente')
    
    const resultado = await response.json()
    emit('incidente-guardado', resultado)
    
  } catch (error) {
    console.error('Error:', error)
    emit('error', error.message)
  }
}

async function cargarIncidenteExistente() {
  if (!props.incidenteId || props.modo !== 'editar') return
  
  try {
    console.log(`🔄 Cargando incidente ${props.incidenteId} para edición (COPIA COMPLETA)...`)
    
    const response = await fetch(`/api/admin/incidentes/${props.incidenteId}`)
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar el incidente`)
    }
    
    const datos = await response.json()
    console.log('📋 Datos completos del incidente:', datos)
    
    // === CARGA COMPLETA - COPIA EXACTA DEL INCIDENTE BASE ===
    
    // 1. Cargar TODOS los datos del formulario
    if (datos.formData) {
      formData.value = { ...datos.formData }
      console.log('✅ FormData cargado:', Object.keys(formData.value).length, 'campos')
    }
    
    // 2. Cargar taxonomías con TODA su información
    if (datos.taxonomias_seleccionadas && Array.isArray(datos.taxonomias_seleccionadas)) {
      taxonomiasSeleccionadas.value = datos.taxonomias_seleccionadas.map(tax => ({
        // Datos básicos de la taxonomía
        id: tax.id,
        nombre: tax.nombre || '',
        area: tax.area || '',
        efecto: tax.efecto || '',
        categoria: tax.categoria || '',
        subcategoria: tax.subcategoria || '',
        tipo: tax.tipo || '',
        descripcion: tax.descripcion || '',
        
        // Campos completados por el usuario
        justificacion: tax.justificacion || '',
        descripcionProblema: tax.descripcionProblema || '',
        archivos: tax.archivos || [],
        
        // Metadatos
        fechaSeleccion: tax.fechaSeleccion || new Date().toISOString(),
        usuarioSeleccion: tax.usuarioSeleccion || 'Usuario actual'
      }))
      console.log(`✅ ${taxonomiasSeleccionadas.value.length} taxonomías cargadas con sus datos completos`)
    }
    
    // 3. Restaurar TODOS los archivos por sección
    if (datos.archivos) {
      archivosSeccion2.value = datos.archivos.seccion_2 || []
      archivosSeccion3.value = datos.archivos.seccion_3 || []
      archivosSeccion5.value = datos.archivos.seccion_5 || []
      archivosSeccion6.value = datos.archivos.seccion_6 || []
      
      // Archivos de taxonomías específicas
      if (datos.archivos.taxonomias) {
        // Restaurar archivos en cada taxonomía
        Object.keys(datos.archivos.taxonomias).forEach(taxId => {
          const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
          if (tax) {
            tax.archivos = datos.archivos.taxonomias[taxId] || []
          }
        })
      }
      
      console.log('✅ Archivos restaurados:', {
        seccion2: archivosSeccion2.value.length,
        seccion3: archivosSeccion3.value.length,
        seccion5: archivosSeccion5.value.length,
        seccion6: archivosSeccion6.value.length
      })
    }
    
    // 4. Cargar metadatos del incidente
    if (datos.metadata) {
      console.log('📋 Metadatos del incidente:', {
        fechaCreacion: datos.metadata.fechaCreacion,
        ultimaModificacion: datos.metadata.ultimaModificacion,
        version: datos.metadata.version,
        estadoActual: datos.metadata.estadoActual
      })
    }
    
    // 5. Marcar como modo edición
    modoEdicion.value = true
    
    console.log('✅ INCIDENTE CARGADO COMPLETAMENTE PARA EDICIÓN')
    console.log('📊 Resumen de la carga:')
    console.log(`   - ID del incidente: ${props.incidenteId}`)
    console.log(`   - Campos del formulario: ${Object.keys(formData.value).length}`)
    console.log(`   - Taxonomías seleccionadas: ${taxonomiasSeleccionadas.value.length}`)
    console.log(`   - Total de archivos: ${(archivosSeccion2.value?.length || 0) + (archivosSeccion3.value?.length || 0) + (archivosSeccion5.value?.length || 0) + (archivosSeccion6.value?.length || 0)}`)
    
  } catch (error) {
    console.error('❌ Error crítico cargando incidente para edición:', error)
    emit('error', `Error cargando incidente: ${error.message}`)
    alert(`No se pudo cargar el incidente ${props.incidenteId}. ${error.message}`)
  }
}

// Función para cargar información de la empresa
async function cargarInfoEmpresa() {
  if (!props.empresaId) return
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/empresas/${props.empresaId}`)
    if (response.ok) {
      const data = await response.json()
      // Actualizar empresaInfo si viene vacío
      if (!props.empresaInfo.tipo) {
        props.empresaInfo.tipo = data.TipoEmpresa || data.tipo_empresa || 'PSE'
        props.empresaInfo.nombre = data.RazonSocial || data.nombre || ''
        console.log('📢 Tipo empresa actualizado:', props.empresaInfo.tipo)
      }
    }
  } catch (error) {
    console.error('Error cargando info empresa:', error)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Acordeón montado con props:', {
    empresaId: props.empresaId,
    empresaInfo: props.empresaInfo,
    modo: props.modo
  })
  
  // Si no tenemos tipo de empresa, cargarlo primero
  if (!props.empresaInfo.tipo) {
    await cargarInfoEmpresa()
  }
  
  // Luego cargar taxonomías
  cargarTaxonomias()
  
  if (props.modo === 'editar') {
    cargarIncidenteExistente()
  }
})
</script>

<style scoped>
/* ESTILOS MODERNOS 3D PROFESIONALES */
.acordeon-incidente-mejorado {
  @apply bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 min-h-screen p-6;
  perspective: 1000px;
}

.acordeon-header {
  @apply relative rounded-2xl p-8 mb-8 overflow-hidden;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  transform: translateZ(20px);
  transition: all 0.3s ease;
}

.acordeon-header:hover {
  transform: translateZ(30px) translateY(-2px);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.header-icon-container {
  @apply absolute top-0 right-0 p-6;
}

.header-icon {
  @apply text-6xl text-blue-400 opacity-20;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.acordeon-titulo {
  @apply text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4;
  text-shadow: 0 2px 20px rgba(59, 130, 246, 0.3);
}

.empresa-info {
  @apply flex justify-center items-center gap-6 flex-wrap;
}

.info-item {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.info-item i {
  @apply text-blue-400;
}

.tipo-badge {
  @apply px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.acordeon-container {
  @apply space-y-4;
}

.acordeon-seccion {
  @apply relative rounded-xl overflow-hidden;
  background: linear-gradient(145deg, #1f2937, #111827);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.acordeon-seccion:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.acordeon-seccion.activa {
  box-shadow: 
    0 20px 50px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(59, 130, 246, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.seccion-header {
  @apply relative flex items-center p-5 cursor-pointer;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  transition: all 0.3s ease;
}

.seccion-header:hover {
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
}

.seccion-chevron {
  @apply text-gray-400 transition-all duration-300;
}

.seccion-chevron.rotated {
  @apply rotate-90 text-blue-400;
}

.seccion-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center ml-3 mr-2;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.seccion-icon i {
  @apply text-lg;
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
}

.seccion-numero {
  @apply mx-3 font-bold text-xl;
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.seccion-titulo {
  @apply flex-1 font-semibold text-lg text-gray-200;
  letter-spacing: 0.5px;
}

.seccion-estado {
  @apply ml-auto flex items-center gap-2;
}

.seccion-contenido {
  @apply p-8;
  background: linear-gradient(180deg, rgba(31, 41, 55, 0.5), rgba(17, 24, 39, 0.8));
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.campo-grupo {
  @apply mb-8;
}

.campo-label {
  @apply block text-sm font-semibold text-gray-300 mb-3 tracking-wide;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.requerido {
  @apply text-red-400;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
}

.campo-input, .campo-textarea {
  @apply w-full px-4 py-3 rounded-lg text-white;
  background: linear-gradient(145deg, #1f2937, #111827);
  border: 1px solid rgba(75, 85, 99, 0.5);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.campo-input:focus, .campo-textarea:focus {
  @apply outline-none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(59, 130, 246, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.campo-input::placeholder, .campo-textarea::placeholder {
  @apply text-gray-500;
}

.campo-textarea {
  @apply resize-none;
  min-height: 100px;
}

select.campo-input {
  @apply cursor-pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.evidencias-container {
  @apply bg-gray-700 rounded-lg p-4;
}

/* Estilos modernos 3D para taxonomías */
.taxonomias-selector {
  @apply rounded-xl p-6;
  background: linear-gradient(145deg, #1f2937, #111827);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -2px 4px rgba(255, 255, 255, 0.05);
}

.taxonomias-lista {
  @apply space-y-3 max-h-96 overflow-y-auto pr-2;
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.taxonomias-lista::-webkit-scrollbar {
  width: 8px;
}

.taxonomias-lista::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

.taxonomias-lista::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.taxonomias-lista::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.taxonomia-item {
  @apply relative flex items-start p-4 rounded-lg cursor-pointer;
  background: linear-gradient(145deg, #2d3748, #1a202c);
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transform: translateZ(0);
  transition: all 0.3s ease;
}

.taxonomia-item:hover {
  transform: translateY(-2px) translateZ(5px);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, #374151, #1f2937);
}

.taxonomia-item.seleccionada {
  background: linear-gradient(145deg, #2563eb, #1d4ed8);
  box-shadow: 
    0 8px 16px rgba(37, 99, 235, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.taxonomia-item.seleccionada:hover {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  transform: translateY(-2px) translateZ(5px) scale(1.02);
}

.taxonomia-item input[type="checkbox"] {
  @apply w-5 h-5 rounded;
  accent-color: #3b82f6;
}

.taxonomia-info {
  @apply flex-1 ml-4;
}

.taxonomia-nombre {
  @apply font-semibold text-gray-100 mb-1 block;
}

.taxonomia-item .taxonomia-descripcion {
  @apply text-sm text-gray-400 mt-1;
}

.taxonomia-tipo {
  @apply absolute top-4 right-4 px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.tipo-oiv {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.tipo-pse {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.tipo-ambas {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  color: white;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
}

/* Badges y contadores */
.badge-count {
  @apply px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold mr-2;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.badge-archivos {
  @apply flex items-center gap-1 px-3 py-1 bg-gray-700 rounded-full text-sm;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.taxonomia-detalle {
  @apply mt-6 p-6 rounded-xl;
  background: linear-gradient(145deg, #2d3748, #1a202c);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.taxonomia-detalle-titulo {
  @apply font-medium text-white mb-4 flex items-center gap-3;
}

/* Nuevos estilos para la sección 4 mejorada */
.selector-header {
  @apply flex justify-between items-center mb-4;
}

.buscador-taxonomias {
  @apply relative;
}

.buscador-taxonomias i {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}

.input-busqueda {
  @apply pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

.taxonomia-codigo {
  @apply text-xs font-mono text-blue-400 mb-1;
}

.tax-area, .tax-efecto, .tax-categoria {
  @apply text-xs;
}

.tax-separador {
  @apply mx-2 text-gray-600;
}

.detalle-header {
  @apply flex justify-between items-center mb-4 pb-4 border-b border-gray-600;
}

.numero-tax {
  @apply inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold mr-3;
}

.codigo-tax {
  @apply font-mono text-sm text-blue-400 mr-3;
}

.nombre-tax {
  @apply font-semibold text-lg;
}

.btn-eliminar-tax {
  @apply p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all;
}

/* Estilos para el área de carga de archivos */
.evidencias-taxonomia {
  @apply space-y-4;
}

.upload-area {
  @apply relative border-2 border-dashed border-gray-600 rounded-xl p-8 text-center transition-all;
  background: linear-gradient(145deg, #1f2937, #111827);
}

.upload-area.drag-over {
  @apply border-blue-500 bg-blue-900/20;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.upload-content {
  @apply flex flex-col items-center;
}

.btn-seleccionar-archivo {
  @apply px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-seleccionar-archivo:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
}

/* Lista de archivos */
.archivos-taxonomia-lista {
  @apply space-y-3;
}

.archivo-taxonomia {
  @apply bg-gray-800 rounded-lg p-4 border border-gray-700;
  transition: all 0.2s ease;
}

.archivo-taxonomia:hover {
  @apply border-gray-600;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.archivo-header {
  @apply flex items-center gap-3;
}

.archivo-icon {
  @apply text-2xl;
}

.archivo-info-tax {
  @apply flex-1;
}

.archivo-nombre {
  @apply font-medium text-white;
}

.archivo-meta {
  @apply flex items-center gap-2 text-xs text-gray-400 mt-1;
}

.archivo-separador {
  @apply text-gray-600;
}

.archivo-acciones {
  @apply flex gap-2;
}

.btn-accion-archivo {
  @apply p-2 rounded hover:bg-gray-700 transition-all;
}

.btn-accion-archivo.danger {
  @apply text-red-400 hover:text-red-300 hover:bg-red-900/20;
}

/* Comentario del archivo */
.archivo-comentario-section {
  @apply mt-3 pt-3 border-t border-gray-700;
}

.comentario-label {
  @apply text-sm text-gray-300 flex items-center gap-2 mb-2;
}

.comentario-archivo {
  @apply w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white resize-none;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

/* Resumen de archivos */
.resumen-archivos-tax {
  @apply flex items-center gap-2 mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400;
}

.resumen-archivos-tax .separador {
  @apply text-gray-600;
}

/* Mensaje sin taxonomías */
.mensaje-sin-taxonomias {
  @apply text-center py-12;
}

/* Transiciones para taxonomías */
.taxonomia-transition-enter-active,
.taxonomia-transition-leave-active {
  transition: all 0.3s ease;
}

.taxonomia-transition-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.taxonomia-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Botones de acción modernos 3D */
.acciones-footer {
  @apply mt-12 flex justify-end gap-4 p-6 rounded-xl;
  background: linear-gradient(145deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8));
  backdrop-filter: blur(10px);
  box-shadow: 
    0 -10px 30px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.btn {
  @apply relative px-8 py-4 rounded-lg font-bold uppercase tracking-wider flex items-center gap-3;
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn:hover::before {
  opacity: 1;
}

.btn:active {
  transform: translateZ(0) translateY(2px);
}

.btn i {
  font-size: 1.2rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 
    0 10px 25px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -3px 0 rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 
    0 15px 35px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -3px 0 rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  @apply opacity-50 cursor-not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: linear-gradient(135deg, #4b5563, #374151);
  color: white;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -3px 0 rgba(0, 0, 0, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -3px 0 rgba(0, 0, 0, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 
    0 10px 25px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -3px 0 rgba(0, 0, 0, 0.2);
}

.btn-warning:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 
    0 15px 35px rgba(245, 158, 11, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -3px 0 rgba(0, 0, 0, 0.2);
}

/* Indicador visual sutil para taxonomías seleccionadas */
.taxonomia-seleccionada {
  background-color: #f8f9fa; /* Gris muy suave */
  border-left: 3px solid #28a745; /* Verde institucional */
}

.taxonomia-campos-dinamicos {
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.taxonomia-campos-dinamicos h4 {
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #dee2e6;
}
</style>