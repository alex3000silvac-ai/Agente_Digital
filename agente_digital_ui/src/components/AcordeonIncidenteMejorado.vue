<template>
  <div class="acordeon-incidente-mejorado">
    <!-- HEADER CON NAVEGACIÓN ESTILO ACOMPAÑAMIENTO -->
    <div class="header-con-navegacion">
      <button class="btn-volver" @click="volverAIncidentes">
        <i class="ph ph-arrow-left"></i>
        Volver
      </button>
      <div class="header-info">
        <h1 class="titulo-principal">
          <i class="ph ph-shield-warning" style="margin-right: 0.5rem; color: #60a5fa;"></i>
          {{ modo === 'editar' ? 'Editar' : 'Registro' }} Incidente Gestión Ley Ciberseguridad 21.663
          <span v-if="modo === 'editar' && incidenteId" class="text-base text-gray-400 ml-2">
            (ID: {{ incidenteId }})
          </span>
        </h1>
        <div class="empresa-detalle">
          <span class="empresa-nombre">{{ empresaInfo.nombre || 'Cargando...' }}</span>
          <span class="tipo-badge" :class="'tipo-' + (empresaInfo.tipo || 'pse').toLowerCase()">
            {{ empresaInfo.tipo || 'PSE' }}
          </span>
        </div>
      </div>
    </div>

    <!-- ACORDEONES ESTILO ACOMPAÑAMIENTO -->
    <div class="acordeones-container">
      
      <!-- SECCIÓN 1: Identificación General -->
      <div class="accordion-item">
        <button 
          class="accordion-header" 
          @click="toggleSeccion(1)"
          :aria-expanded="seccionesAbiertas[1]"
        >
          <div class="header-content">
            <div class="header-text">
              <span class="description-text">
                <i class="ph ph-identification-card" style="margin-right: 0.5rem; color: #007bff; font-size: 18px;"></i>
                1 Identificación General del Incidente
                <i v-if="props.seccionCongelada === 1" class="ph ph-lock" style="margin-left: 0.5rem; color: #f59e0b;" title="Sección congelada para mantener integridad del reporte ANCI"></i>
              </span>
            </div>
            <div class="status-indicators">
              <span v-if="seccionCompleta(1)" class="stat-badge vigente">
                <i class="ph ph-check-circle"></i> Completa
              </span>
              <span v-else class="stat-badge por-vencer">
                <i class="ph ph-warning-circle"></i> Pendiente
              </span>
            </div>
          </div>
          <i class="ph ph-caret-down transition-transform" :class="{ 'rotate-180': seccionesAbiertas[1] }"></i>
        </button>
        
        <transition name="accordion-fade">
          <div v-show="seccionesAbiertas[1]" class="accordion-content">
            <!-- Alerta de sección congelada -->
            <div v-if="props.seccionCongelada === 1" class="alerta-seccion-congelada">
              <i class="ph ph-lock"></i>
              <div class="alerta-texto">
                <strong>Sección Congelada</strong>
                <p>Esta sección está bloqueada para mantener la integridad del reporte ANCI generado.</p>
              </div>
            </div>
            
            <!-- FORMULARIO GRID ESTILO ACOMPAÑAMIENTO -->
            <div class="form-grid">
              <div class="form-field">
                <label class="form-label">
                  1.1 Tipo de registro del Incidente <span class="required-asterisk">*</span>
                </label>
                <select v-model="formData['1.1']" name="tipo_registro" class="form-input" required :disabled="modo === 'editar' || props.seccionCongelada === 1">
                  <option value="">Seleccionar tipo</option>
                  <option value="Para analisis interno">Para análisis interno</option>
                  <option value="Para Auditoria">Para Auditoría</option>
                  <option value="Registro General">Registro General</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">
                  1.2 Título del Incidente <span class="required-asterisk">*</span>
                </label>
                <input 
                  v-model="formData['1.2']" 
                  type="text" 
                  class="form-input"
                  placeholder="Ingrese el título del incidente"
                  :disabled="modo === 'editar' || props.seccionCongelada === 1"
                />
              </div>

              <div class="form-field">
                <label class="form-label">
                  1.3 Fecha y hora de Detección <span class="required-asterisk">*</span>
                </label>
                <input 
                  v-model="formData['1.3']" 
                  type="datetime-local" 
                  name="fecha_deteccion"
                  class="form-input"
                  :disabled="modo === 'editar' || props.seccionCongelada === 1"
                  required
                />
              </div>

              <div class="form-field">
                <label class="form-label">
                  1.4 Fecha y hora de ocurrencia <span class="required-asterisk">*</span>
                </label>
                <input 
                  v-model="formData['1.4']" 
                  type="datetime-local" 
                  name="fecha_ocurrencia"
                  class="form-input"
                  :disabled="modo === 'editar' || props.seccionCongelada === 1"
                  required
                />
              </div>

              <div class="form-field">
                <label class="form-label">
                  1.5 Criticidad <span class="required-asterisk">*</span>
                </label>
                <select v-model="formData['1.5']" name="criticidad" class="form-input" required :disabled="modo === 'editar' || props.seccionCongelada === 1">
                  <option value="">Seleccionar criticidad</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div class="form-field">
                <label class="form-label">1.6 Alcance Geográfico</label>
                <select v-model="formData['1.6']" name="alcance_geografico" class="form-input" :disabled="props.seccionCongelada === 1">
                  <option value="">Seleccionar alcance</option>
                  <option value="Local">Local</option>
                  <option value="Pais">País</option>
                  <option value="Regional">Regional</option>
                  <option value="Global">Global</option>
                </select>
              </div>

              <!-- 1.7 Solicitud de Apoyo CSIRT - Estilo switch -->
              <div class="form-field full-width">
                <label class="checkbox-field">
                  <input 
                    type="checkbox" 
                    name="solicitar_csirt" 
                    value="1"
                    v-model="formData['1.7.solicitar_csirt']"
                    class="form-checkbox"
                    :disabled="props.seccionCongelada === 1"
                  />
                  <span class="checkbox-label">
                    <i class="ph ph-headset" style="margin-right: 0.5rem;"></i>
                    ¿Solicitar ayuda a CSIRT?
                  </span>
                </label>
              </div>
            </div>
            
            <!-- Campos adicionales si solicita CSIRT - Estilo acompañamiento -->
            <div v-if="formData['1.7.solicitar_csirt']" class="csirt-section">
              <div class="section-divider">
                <i class="ph ph-headset"></i>
                <span>Detalles de Solicitud CSIRT</span>
              </div>
              <div class="form-grid">
                <div class="form-field">
                  <label class="form-label">Tipo de apoyo requerido</label>
                  <select v-model="formData['1.7.tipo_apoyo']" class="form-input" :disabled="props.seccionCongelada === 1">
                    <option value="">Seleccione...</option>
                    <option value="Análisis técnico">Análisis técnico</option>
                    <option value="Contención">Contención</option>
                    <option value="Investigación forense">Investigación forense</option>
                    <option value="Coordinación">Coordinación</option>
                    <option value="Asesoría legal">Asesoría legal</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                
                <div class="form-field">
                  <label class="form-label">Urgencia del apoyo</label>
                  <select v-model="formData['1.7.urgencia']" class="form-input" :disabled="props.seccionCongelada === 1">
                    <option value="">Seleccione...</option>
                    <option value="Inmediata">Inmediata (2 horas)</option>
                    <option value="Urgente">Urgente (24 horas)</option>
                    <option value="Normal">Normal (72 horas)</option>
                  </select>
                </div>
                
                <div class="form-field full-width">
                  <label class="form-label">Observaciones para CSIRT</label>
                  <textarea 
                    v-model="formData['1.7.observaciones_csirt']" 
                    class="form-input"
                    rows="3"
                    placeholder="Información adicional para el CSIRT..."
                    style="resize: vertical;"
                    :disabled="props.seccionCongelada === 1"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      </div>

      <!-- SECCIÓN 2: Descripción y Alcance -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[2] }">
        <div class="seccion-header" @click="toggleSeccion(2)">
          <div class="seccion-icon">
            <i class="ph ph-file-text" style="color: #28a745; font-size: 18px;"></i>
          </div>
          <span class="seccion-numero">2</span>
          <span class="seccion-titulo">Descripción y Alcance</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(2)" class="ph ph-check-circle" style="color: #22c55e; font-size: 16px;"></i>
            <i v-else class="ph ph-clock" style="color: #f59e0b; font-size: 16px;"></i>
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
          <div class="seccion-icon">
            <i class="ph ph-magnifying-glass" style="color: #ffc107; font-size: 18px;"></i>
          </div>
          <span class="seccion-numero">3</span>
          <span class="seccion-titulo">Análisis Preliminar</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(3)" class="ph ph-check-circle" style="color: #22c55e; font-size: 16px;"></i>
            <i v-else class="ph ph-clock" style="color: #f59e0b; font-size: 16px;"></i>
          </span>
        </div>
        
        <div v-show="seccionesAbiertas[3]" class="seccion-contenido">
          <!-- 3.1 Tipo amenaza -->
          <div class="campo-grupo">
            <label class="campo-label">
              3.1 Tipo Amenaza Probable <span class="requerido">*</span>
            </label>
            <input 
              v-model="formData['3.1']" 
              type="text" 
              class="campo-input"
              placeholder="Describa el tipo de amenaza identificada..."
            />
          </div>

          <!-- 3.2 Origen/vector -->
          <div class="campo-grupo">
            <label class="campo-label">
              3.2 Origen/vector de ataque probable <span class="requerido">*</span>
            </label>
            <input 
              v-model="formData['3.2']" 
              type="text" 
              class="campo-input"
              placeholder="Describa el origen o vector del ataque..."
            />
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
          <div class="seccion-icon">
            <i class="ph ph-tag" style="color: #17a2b8; font-size: 18px;"></i>
          </div>
          <span class="seccion-numero">4</span>
          <span class="seccion-titulo">Clasificación de Taxonomías</span>
          <span class="seccion-estado">
            <span v-if="taxonomiasSeleccionadas.length > 0" class="badge-count">{{ taxonomiasSeleccionadas.length }}</span>
            <i v-if="seccionCompleta(4)" class="ph ph-check-circle" style="color: #22c55e; font-size: 16px;"></i>
            <i v-else class="ph ph-clock" style="color: #f59e0b; font-size: 16px;"></i>
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
                <p class="text-sm text-white">
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
                <div v-if="cargandoTaxonomias" class="text-center py-8 text-white">
                  <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Cargando taxonomías...</p>
                </div>
                <div v-else-if="taxonomiasFiltradas.length === 0" class="text-center py-8 text-white">
                  <i class="fas fa-inbox text-2xl mb-2"></i>
                  <p>No se encontraron taxonomías</p>
                </div>
                <div 
                  v-for="tax in taxonomiasFiltradas" 
                  :key="tax.id"
                  :id="`taxonomia-${tax.id}`"
                  :data-taxonomy-id="tax.id"
                  class="taxonomia-item"
                  :class="{ 'seleccionada': taxonomiaSeleccionada(tax.id) }"
                >
                  <!-- Checkbox de taxonomía -->
                  <div class="taxonomia-selector">
                    <input 
                      type="checkbox" 
                      :id="`checkbox-${tax.id}`"
                      :checked="taxonomiaSeleccionada(tax.id)"
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
                    class="taxonomia-seleccionada"
                  >
                    <!-- PASO 1: Título ocupando 100% del ancho -->
                    <div class="taxonomia-titulo" style="
                        width: 100%;
                        background-color: #495057;
                        color: white;
                        padding: 15px;
                        border-left: 4px solid #28a745;
                        margin-bottom: 0;
                        border-radius: 5px 5px 0 0;
                    ">
                        ☑️ {{ tax.id }} - {{ tax.nombre }}
                    </div>
                    
                    <!-- PASO 2: Formulario DEBAJO ocupando 100% del ancho -->
                    <div class="taxonomia-campos" style="
                        width: 100%;
                        background-color: #1f2937;
                        color: white;
                        padding: 20px;
                        border-left: 4px solid #28a745;
                        border-radius: 0 0 5px 5px;
                        margin-top: 0;
                    ">
                    
                        <label style="color: white; display: block; margin-bottom: 5px;">
                            4.2.1 ¿Por qué fue seleccionada esta taxonomía? *
                        </label>
                        <textarea 
                            v-model="obtenerTaxonomiaSeleccionada(tax.id).justificacion"
                            :name="`porque_${tax.id}`"
                            style="
                            width: 100%;
                            background-color: #495057;
                            color: #ffffff;
                            border: 1px solid #6c757d;
                            padding: 10px;
                            border-radius: 4px;
                            margin-bottom: 15px;
                        " 
                            placeholder="Explique por qué esta taxonomía aplica al incidente..."
                            rows="3"
                            required
                        ></textarea>
                        
                        <label style="color: white; display: block; margin-bottom: 5px;">
                            4.3.1 Descripción acabada del problema
                        </label>
                        <textarea 
                            v-model="obtenerTaxonomiaSeleccionada(tax.id).descripcionProblema"
                            :name="`descripcion_${tax.id}`"
                            style="
                            width: 100%;
                            background-color: #495057;
                            color: #ffffff;
                            border: 1px solid #6c757d;
                            padding: 10px;
                            border-radius: 4px;
                        " 
                            placeholder="Detalle específico del problema..."
                            rows="3"
                        ></textarea>

                        
                        <!-- 4.4.1 Evidencias -->
                        <label style="color: white; display: block; margin-bottom: 5px; margin-top: 15px;">
                            <i class="fas fa-paperclip" style="color: white; margin-right: 5px;"></i>
                            4.4.1 Evidencias
                        </label>
                        <div style="border: 2px dashed #adb5bd; border-radius: 8px; padding: 20px; text-align: center; background: #495057; color: white; margin-bottom: 15px;">
                            <input 
                              :ref="`fileInput_${tax.id}`"
                              type="file" 
                              @change="procesarArchivo($event, tax.id)"
                              style="display: none;"
                              multiple
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip"
                            />
                            <button 
                              @click="$refs[`fileInput_${tax.id}`][0].click()" 
                              type="button"
                              style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 500;"
                            >
                              <i class="fas fa-upload" style="margin-right: 8px;"></i>
                              Seleccionar Archivos
                            </button>
                            <p style="margin: 10px 0 0 0; color: white; font-size: 12px;">
                              Formatos: PDF, DOC, XLS, Imágenes, TXT, ZIP (Máx 10MB)
                            </p>
                        </div>
                        
                        <!-- Lista de archivos subidos -->
                        <div v-if="obtenerTaxonomiaSeleccionada(tax.id).archivos && obtenerTaxonomiaSeleccionada(tax.id).archivos.length > 0" style="margin-top: 15px;">
                            <h5 style="color: #ffc107; font-size: 14px; margin-bottom: 10px;">
                              <i class="fas fa-paperclip"></i> Archivos adjuntos:
                            </h5>
                            <div 
                              v-for="archivo in obtenerTaxonomiaSeleccionada(tax.id).archivos" 
                              :key="archivo.id" 
                              style="display: flex; align-items: center; padding: 12px; background: #495057; border: 1px solid #6c757d; border-radius: 6px; margin-bottom: 8px;"
                            >
                              <i class="fas fa-file" style="color: #17a2b8; margin-right: 12px; font-size: 18px;"></i>
                              <div style="flex: 1;">
                                <div style="color: white; font-weight: 500;">{{ archivo.nombre }}</div>
                                <div style="color: #adb5bd; font-size: 12px; margin-top: 2px;">
                                  {{ archivo.tamaño ? `${(archivo.tamaño / 1024).toFixed(1)} KB` : 'Tamaño desconocido' }}
                                  <span v-if="archivo.existente" style="color: #28a745; margin-left: 10px;">
                                    <i class="fas fa-check-circle"></i> Guardado
                                  </span>
                                  <span v-else style="color: #ffc107; margin-left: 10px;">
                                    <i class="fas fa-exclamation-triangle"></i> Pendiente de guardar
                                  </span>
                                </div>
                              </div>
                              <div style="display: flex; gap: 8px;">
                                <button 
                                  @click.stop.prevent="visualizarArchivoTaxonomia(archivo)"
                                  style="background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;"
                                  title="Ver archivo"
                                  type="button"
                                >
                                  <i class="fas fa-eye"></i>
                                </button>
                                <button 
                                  @click.stop="eliminarArchivoTaxonomia(tax.id, archivo)"
                                  :disabled="archivo.existente || archivo.origen === 'guardado'"
                                  :style="{
                                    background: (archivo.existente || archivo.origen === 'guardado') ? '#6c757d' : '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: (archivo.existente || archivo.origen === 'guardado') ? 'not-allowed' : 'pointer',
                                    opacity: (archivo.existente || archivo.origen === 'guardado') ? '0.5' : '1'
                                  }"
                                  :title="(archivo.existente || archivo.origen === 'guardado') ? 'No se pueden eliminar archivos guardados' : 'Eliminar archivo'"
                                  type="button"
                                >
                                  <i class="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                            <div v-if="obtenerTaxonomiaSeleccionada(tax.id).archivos.some(a => !a.existente)" 
                                 style="background: #6c757d; color: white; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 13px;">
                              <i class="fas fa-info-circle"></i>
                              <strong>Nota:</strong> Los archivos nuevos se guardarán cuando guarde el incidente completo.
                            </div>
                        </div>
                        
                        <!-- BOTÓN PARA ACEPTAR MODIFICACIONES -->
                        <div style="margin-top: 20px; text-align: center;">
                          <button 
                            @click="guardarTaxonomia(tax.id)"
                            type="button"
                            style="
                              background: linear-gradient(135deg, #28a745, #20c997);
                              color: white;
                              border: none;
                              padding: 12px 24px;
                              border-radius: 8px;
                              cursor: pointer;
                              font-weight: 600;
                              box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
                              transition: all 0.3s ease;
                              margin-right: 10px;
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(40, 167, 69, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(40, 167, 69, 0.3)'"
                          >
                            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                            Aceptar Modificaciones
                          </button>
                          <button 
                            @click="cancelarEdicionTaxonomia(tax.id)"
                            type="button"
                            style="
                              background: linear-gradient(135deg, #6c757d, #5a6268);
                              color: white;
                              border: none;
                              padding: 12px 24px;
                              border-radius: 8px;
                              cursor: pointer;
                              font-weight: 600;
                              box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
                              transition: all 0.3s ease;
                            "
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(108, 117, 125, 0.4)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(108, 117, 125, 0.3)'"
                          >
                            <i class="fas fa-times-circle" style="margin-right: 8px;"></i>
                            Cancelar
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      <!-- SECCIÓN 5: Acciones Inmediatas -->
      <div class="acordeon-seccion" :class="{ activa: seccionesAbiertas[5] }">
        <div class="seccion-header" @click="toggleSeccion(5)">
          <div class="seccion-icon">
            <i class="ph ph-wrench" style="color: #dc3545; font-size: 18px;"></i>
          </div>
          <span class="seccion-numero">5</span>
          <span class="seccion-titulo">Acciones Inmediatas</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(5)" class="ph ph-check-circle" style="color: #22c55e; font-size: 16px;"></i>
            <i v-else class="ph ph-clock" style="color: #f59e0b; font-size: 16px;"></i>
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
          <div class="seccion-icon">
            <i class="ph ph-shield-check" style="color: #6f42c1; font-size: 18px;"></i>
          </div>
          <span class="seccion-numero">6</span>
          <span class="seccion-titulo">Análisis de Causa Raíz</span>
          <span class="seccion-estado">
            <i v-if="seccionCompleta(6)" class="ph ph-check-circle" style="color: #22c55e; font-size: 16px;"></i>
            <i v-else class="ph ph-clock" style="color: #f59e0b; font-size: 16px;"></i>
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
          <div class="seccion-icon">
            <i class="ph ph-folder-open" style="color: #fd7e14; font-size: 18px;"></i>
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
      
      <!-- Botón Transformar a ANCI (solo en modo editar y si todos los campos están completos) -->
      <button 
        v-if="modo === 'editar' && !esIncidenteAnci && formularioValido" 
        @click="abrirDialogoTransformarAnci" 
        class="btn btn-danger-outline"
        title="Transformar este incidente en un reporte ANCI oficial"
      >
        <i class="ph ph-warning-circle"></i>
        Transformar a ANCI
      </button>
    </div>

    <!-- MODAL DE VALIDACIÓN - CAMPOS FALTANTES -->
    <div v-if="mostrarModalValidacion" class="modal-overlay" @click="cerrarModalValidacion">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="ph ph-warning-circle" style="margin-right: 0.5rem; color: #fbbf24;"></i>
            Campos Requeridos Faltantes
          </h3>
          <button @click="cerrarModalValidacion" class="modal-close-btn">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            Para completar el registro del incidente, debe llenar los siguientes campos obligatorios:
          </p>
          
          <div class="campos-faltantes-lista">
            <div 
              v-for="campo in camposFaltantesModal" 
              :key="campo.codigo"
              class="campo-faltante-item"
            >
              <div class="campo-seccion">
                Sección {{ campo.seccion }}
              </div>
              <div class="campo-detalle">
                <span class="campo-codigo">{{ campo.codigo }}</span>
                <span class="campo-nombre">{{ campo.nombre }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModalValidacion" class="btn-modal-cerrar">
            <i class="ph ph-check-circle" style="margin-right: 0.5rem;"></i>
            Entendido
          </button>
        </div>
      </div>
    </div>
    
    <!-- MODAL DE CONFIRMACIÓN PARA TRANSFORMAR A ANCI -->
    <div v-if="mostrandoDialogoAnci" class="modal-overlay" @click="cancelarTransformacionAnci">
      <div class="modal-content modal-anci" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="ph ph-warning-circle" style="margin-right: 0.5rem; color: #ef4444;"></i>
            Transformar a Reporte ANCI
          </h3>
          <button @click="cancelarTransformacionAnci" class="modal-close-btn">
            <i class="ph ph-x"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="alerta-anci">
            <i class="ph ph-warning"></i>
            <p>
              Esta acción convertirá el incidente en un reporte oficial para la ANCI. 
              Se activarán los plazos legales y se enviarán alertas automáticas al delegado de ciberseguridad.
            </p>
          </div>
          
          <div class="plazos-info">
            <h4>Plazos Legales Aplicables</h4>
            <div class="plazo-item">
              <span class="plazo-tipo">📋 Reporte Inicial:</span>
              <span class="plazo-tiempo">{{ empresaInfo.tipo === 'OIV' ? '2 horas' : '4 horas' }}</span>
            </div>
            <div class="plazo-item">
              <span class="plazo-tipo">📊 Reporte Final:</span>
              <span class="plazo-tiempo">72 horas</span>
            </div>
          </div>
          
          <div class="consecuencias-info">
            <h4>Consecuencias de esta acción:</h4>
            <ul>
              <li>✓ La sección 1 quedará congelada permanentemente</li>
              <li>✓ Se generará el primer reporte ANCI automáticamente</li>
              <li>✓ Se activarán alertas automáticas de vencimiento</li>
              <li>✓ El incidente aparecerá en la vista de cuenta regresiva</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cancelarTransformacionAnci" class="btn-modal-secundario">
            <i class="ph ph-x-circle" style="margin-right: 0.5rem;"></i>
            Cancelar
          </button>
          <button @click="confirmarTransformacionAnci" class="btn-modal-peligro">
            <i class="ph ph-warning-circle" style="margin-right: 0.5rem;"></i>
            Sí, Transformar a ANCI
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import GestorArchivosSeccion from './GestorArchivosSeccion.vue'
import ResumenArchivosIncidente from './ResumenArchivosIncidente.vue'
import ArchivosAdjuntos from './ArchivosAdjuntos.vue'

// Props
const props = defineProps({
  empresaId: {
    type: [String, Number],
    required: true
  },
  incidenteId: {
    type: [String, Number],
    required: false
  },
  inquilinoId: {
    type: [String, Number],
    required: false
  },
  modo: {
    type: String,
    default: 'crear' // 'crear' o 'editar'
  },
  datosIniciales: {
    type: Object,
    default: null
  },
  empresaInfo: {
    type: Object,
    default: () => ({
      nombre: '',
      tipo: 'PSE',
      inquilino: ''
    })
  },
  seccionCongelada: {
    type: Number,
    default: null
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
const archivosEliminados = ref([]) // Para rastrear archivos eliminados

// Variables para modo edición
const modoEdicion = ref(false)
const incidenteOriginal = ref(null)
const metadata = ref({})

// Variables para ANCI
const esIncidenteAnci = ref(false)
const mostrandoDialogoAnci = ref(false)

// Estado de validación
const erroresValidacion = ref({})
const formularioValido = computed(() => {
  return validarRequeridos()
})

// Modal de validación
const mostrarModalValidacion = ref(false)
const camposFaltantesModal = ref([])

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
      ...archivo,
      submodulo: '2',
      item: `2.5.${idx + 1}`,
      seccion: 'Descripción y Alcance del Incidente'
    })
  })
  
  // Sección 3
  archivosSeccion3.value.forEach((archivo, idx) => {
    archivos.push({
      ...archivo,
      submodulo: '3',
      item: `3.4.${idx + 1}`,
      seccion: 'Origen y Tipo de Incidente'
    })
  })
  
  // Sección 4 (Taxonomías)
  taxonomiasSeleccionadas.value.forEach((tax, taxIdx) => {
    if (tax.archivos && tax.archivos.length > 0) {
      tax.archivos.forEach((archivo, idx) => {
        archivos.push({
          ...archivo,
          submodulo: '4',
          item: `4.${taxIdx + 1}.${idx + 1}`,
          seccion: 'Taxonomías',
          taxonomia: tax.nombre
        })
      })
    }
  })
  
  // Sección 5
  archivosSeccion5.value.forEach((archivo, idx) => {
    archivos.push({
      ...archivo,
      submodulo: '5',
      item: `5.2.${idx + 1}`,
      seccion: 'Acciones Inmediatas y Medidas de Contención'
    })
  })
  
  // Sección 6
  archivosSeccion6.value.forEach((archivo, idx) => {
    archivos.push({
      ...archivo,
      submodulo: '6',
      item: `6.4.${idx + 1}`,
      seccion: 'Lecciones Aprendidas'
    })
  })
  
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

// Función para volver a la lista de incidentes
function volverAIncidentes() {
  router.push({ 
    name: 'VistaListaIncidentes', 
    params: { 
      inquilinoId: route.params.inquilinoId,
      empresaId: route.params.empresaId 
    } 
  })
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

function mostrarFormularioTaxonomia(taxId) {
  const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
  return tax && !tax.guardada // Solo mostrar formulario si NO está guardada
}

function esTaxonomiaSeleccionada(taxId) {
  return taxonomiasSeleccionadas.value.some(t => t.id === taxId)
}

// Función debug para verificar estado de taxonomías
function debugTaxonomias() {
  console.log('🔍 DEBUG TAXONOMÍAS:', {
    disponibles: taxonomiasDisponibles.value.length,
    seleccionadas: taxonomiasSeleccionadas.value.length,
    seleccionadas_ids: taxonomiasSeleccionadas.value.map(t => t.id),
    seleccionadas_completas: taxonomiasSeleccionadas.value.map(t => ({
      id: t.id,
      Id_Taxonomia: t.Id_Taxonomia,
      nombre: t.nombre || 'Sin nombre',
      justificacion: t.justificacion || 'VACÍO',
      descripcionProblema: t.descripcionProblema || 'VACÍO',
      tiene_id: !!t.id,
      tiene_justificacion: !!t.justificacion
    }))
  })
  
  // Mostrar datos crudos para debug
  console.log('📋 TAXONOMÍAS SELECCIONADAS RAW:', taxonomiasSeleccionadas.value)
  
  // Verificar datos del incidente
  console.log('📄 DATOS DEL INCIDENTE:', {
    incidenteId: props.incidenteId,
    datosIniciales: props.datosIniciales,
    taxonomias_en_datos: props.datosIniciales?.taxonomias_seleccionadas
  })
  
  return taxonomiasSeleccionadas.value
}

// Exponer función debug globalmente para testing
window.debugTaxonomias = debugTaxonomias

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
    id: `${seccion}.${campo}.${Date.now()}`,
    existente: false // Marcar como archivo nuevo
  }
  
  // Asegurar que el archivo tenga la propiedad 'file' si viene con 'archivo'
  if (archivo.archivo && !archivo.file) {
    archivoConMetadata.file = archivo.archivo
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

function eliminarArchivo(seccion, campo, archivo) {
  // Si es un archivo existente/guardado, agregarlo a la lista de eliminados
  if (archivo.existente || archivo.origen === 'guardado' || archivo.id) {
    archivosEliminados.value.push({
      id: archivo.id,
      seccion: seccion,
      campo: campo,
      nombre: archivo.nombre
    })
  }
  
  // Eliminar de la lista correspondiente
  switch(seccion) {
    case 2:
      archivosSeccion2.value = archivosSeccion2.value.filter(a => {
        // Comparar por ID si existe, o por nombre/tamaño para archivos nuevos
        if (archivo.id && a.id) {
          return a.id !== archivo.id
        }
        return !(a.nombre === archivo.nombre && a.tamaño === archivo.tamaño)
      })
      break
    case 3:
      archivosSeccion3.value = archivosSeccion3.value.filter(a => {
        if (archivo.id && a.id) {
          return a.id !== archivo.id
        }
        return !(a.nombre === archivo.nombre && a.tamaño === archivo.tamaño)
      })
      break
    case 5:
      archivosSeccion5.value = archivosSeccion5.value.filter(a => {
        if (archivo.id && a.id) {
          return a.id !== archivo.id
        }
        return !(a.nombre === archivo.nombre && a.tamaño === archivo.tamaño)
      })
      break
    case 6:
      archivosSeccion6.value = archivosSeccion6.value.filter(a => {
        if (archivo.id && a.id) {
          return a.id !== archivo.id
        }
        return !(a.nombre === archivo.nombre && a.tamaño === archivo.tamaño)
      })
      break
  }
}

function actualizarComentario(seccion, campo, data) {
  // Actualizar comentario/descripción del archivo
  console.log('Actualizando comentario:', { seccion, campo, data })
  
  const { archivo, index, comentario } = data
  
  // Buscar el archivo en la sección correspondiente
  let listaArchivos = null
  
  switch(seccion) {
    case 2:
      listaArchivos = archivosSeccion2.value
      break
    case 3:
      listaArchivos = archivosSeccion3.value
      break
    case 5:
      listaArchivos = archivosSeccion5.value
      break
    case 6:
      listaArchivos = archivosSeccion6.value
      break
  }
  
  if (listaArchivos && listaArchivos[index]) {
    listaArchivos[index].descripcion = comentario
    listaArchivos[index].comentario = comentario
    console.log('✅ Comentario actualizado para archivo:', archivo.nombre)
  }
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

async function eliminarArchivoTaxonomia(taxId, archivo) {
  // Mostrar confirmación apropiada según el tipo de archivo
  const mensaje = (archivo.existente || archivo.origen === 'guardado' || archivo.id) 
    ? `¿Está seguro de eliminar el archivo "${archivo.nombre}"?\n\nEsta acción eliminará permanentemente el archivo del sistema.`
    : '¿Está seguro de eliminar este archivo?'
    
  if (!confirm(mensaje)) {
    return
  }
  
  try {
    // Si es un archivo existente/guardado, agregarlo a la lista de eliminados
    if (archivo.existente || archivo.origen === 'guardado' || archivo.id) {
      archivosEliminados.value.push({
        id: archivo.id,
        seccion: 'taxonomia',
        taxonomiaId: taxId,
        nombre: archivo.nombre
      })
    }
    
    // Eliminar de la lista local en ambos casos
    const tax = taxonomiasSeleccionadas.value.find(t => t.id === taxId)
    if (tax && tax.archivos) {
      const index = tax.archivos.findIndex(a => 
        (a.id === archivo.id) || 
        (a.nombre === archivo.nombre && a.tamaño === archivo.tamaño)
      )
      if (index > -1) {
        tax.archivos.splice(index, 1)
        console.log('✅ Archivo eliminado de la lista')
      }
    }
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

function visualizarArchivoTaxonomia(archivo) {
  // Si el archivo no tiene ID, es nuevo y no se puede visualizar
  if (!archivo.id) {
    alert('Este archivo es nuevo y aún no ha sido guardado. Guarde el incidente para poder visualizarlo.')
    return
  }
  
  // Usar la URL del backend directamente (puerto 5000)
  const url = `http://localhost:5000/api/incidentes/archivo/${archivo.id}`
  window.open(url, '_blank', 'noopener,noreferrer')
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

function eliminarArchivoTax(taxId, archivo) {
  // Alias para eliminarArchivoTaxonomia - misma funcionalidad
  eliminarArchivoTaxonomia(taxId, archivo)
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
  
  // Simular guardado exitoso (sin llamadas HTTP hasta que se implemente el backend)
  console.log('💾 Guardando taxonomía:', {
    taxonomia_id: taxonomiaId,
    porque_seleccionada: tax.justificacion,
    descripcion_problema: tax.descripcionProblema || '',
    archivos: tax.archivos ? tax.archivos.length : 0
  })
  
  // Simular un pequeño delay para mostrar que está procesando
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 1. GUARDAR DATOS ORIGINALES PARA PODER CANCELAR
  if (!tax.datosOriginales) {
    tax.datosOriginales = {
      justificacion: tax.justificacion,
      descripcionProblema: tax.descripcionProblema,
      archivos: [...(tax.archivos || [])]
    }
  }
  
  // 2. MARCAR COMO GUARDADA EN EL ESTADO
  tax.guardada = true
  tax.fechaGuardado = new Date().toISOString()
  
  // 2. MINIMIZAR FORMULARIO - No desmarcar, solo cambiar estado para ocultar campos
  // La función taxonomiaSeleccionada() ya verifica tax.guardada para ocultar el formulario
  
  // 3. MARCAR VISUALMENTE EN LA LISTA DE TAXONOMÍAS
  const taxonomiaCard = document.querySelector(`[data-taxonomy-id="${taxonomiaId}"]`)
  if (taxonomiaCard) {
    taxonomiaCard.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)'
    taxonomiaCard.style.borderLeft = '4px solid #28a745'
    taxonomiaCard.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)'
    
    // Agregar indicador visual de guardada
    const titulo = taxonomiaCard.querySelector('.taxonomia-nombre')
    if (titulo && !titulo.querySelector('.guardada-badge')) {
      const badge = document.createElement('span')
      badge.className = 'guardada-badge'
      badge.innerHTML = ' ✅ GUARDADA'
      badge.style.cssText = 'color: #28a745; font-weight: bold; font-size: 12px; margin-left: 10px;'
      titulo.appendChild(badge)
    }
  }
  
  alert('✅ Taxonomía guardada correctamente (modo local)')
  console.log(`✅ Taxonomía ${taxonomiaId} guardada exitosamente`)
}

function cancelarEdicionTaxonomia(taxonomiaId) {
  if (confirm('¿Está seguro de cancelar la edición? Se perderán los cambios no guardados.')) {
    // Restaurar valores originales o limpiar campos
    const tax = obtenerTaxonomiaSeleccionada(taxonomiaId)
    
    // Si era una taxonomía nueva sin datos guardados, simplemente deseleccionar
    if (!tax.guardada && (!tax.justificacion || tax.justificacion.trim() === '')) {
      toggleTaxonomia({ id: taxonomiaId })
      return
    }
    
    // Si tenía datos guardados, restaurar a su estado original
    if (tax.datosOriginales) {
      tax.justificacion = tax.datosOriginales.justificacion || ''
      tax.descripcionProblema = tax.datosOriginales.descripcionProblema || ''
      tax.archivos = tax.datosOriginales.archivos || []
    } else {
      // Limpiar campos si no hay datos originales
      tax.justificacion = ''
      tax.descripcionProblema = ''
      tax.archivos = []
    }
    
    console.log(`↩️ Edición cancelada para taxonomía ${taxonomiaId}`)
  }
}

// FUNCIÓN: Procesar archivos seleccionados para taxonomías
function procesarArchivo(event, taxonomiaId) {
  const files = event.target.files
  if (!files || files.length === 0) return

  const tax = obtenerTaxonomiaSeleccionada(taxonomiaId)
  if (!tax.archivos) {
    tax.archivos = []
  }

  Array.from(files).forEach(file => {
    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} excede el tamaño máximo de 10MB`)
      return
    }

    // Validar tipo de archivo
    const extensionesPermitidas = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'txt', 'zip']
    const extension = file.name.split('.').pop().toLowerCase()
    if (!extensionesPermitidas.includes(extension)) {
      alert(`Tipo de archivo no permitido: ${file.name}`)
      return
    }

    // Agregar archivo a la lista
    const nuevoArchivo = {
      id: Date.now() + Math.random(), // ID temporal
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type,
      file: file, // Archivo real para subir (cambiar a 'file' para consistencia)
      fechaCarga: new Date().toISOString(),
      existente: false // Marcar como archivo nuevo
    }

    tax.archivos.push(nuevoArchivo)
    console.log(`✅ Archivo agregado: ${file.name} a taxonomía ${taxonomiaId}`)
  })

  // Limpiar el input para permitir seleccionar el mismo archivo otra vez
  event.target.value = ''
}

// MAPEO DE CAMPOS PARA VALIDACIÓN DETALLADA
const camposRequeridos = {
  '1.1': 'Tipo de registro del Incidente',
  '1.2': 'Título del Incidente',
  '1.3': 'Fecha y hora de Detección',
  '1.4': 'Fecha y hora de ocurrencia',
  '1.5': 'Criticidad',
  '2.1': 'Descripción del incidente',
  '2.2': 'Cómo se detectó',
  '2.3': 'Acciones tomadas',
  '2.4': 'Estado actual',
  '3.1': 'Tipo de amenaza',
  '3.2': 'Origen/vector',
  '5.1': 'Impacto en confidencialidad',
  '6.1': 'Observaciones y comentarios adicionales'
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

// FUNCIÓN PARA OBTENER CAMPOS FALTANTES DETALLADOS
function obtenerCamposFaltantes() {
  const camposFaltantes = []
  
  // Verificar campos del formulario
  Object.keys(camposRequeridos).forEach(campo => {
    const valor = formData.value[campo]
    if (!valor || valor.toString().trim() === '') {
      camposFaltantes.push({
        seccion: campo.charAt(0),
        codigo: campo,
        nombre: camposRequeridos[campo]
      })
    }
  })
  
  // Verificar taxonomías
  if (taxonomiasSeleccionadas.value.length === 0) {
    camposFaltantes.push({
      seccion: '4',
      codigo: '4.1',
      nombre: 'Debe seleccionar al menos una taxonomía'
    })
  } else {
    // Verificar justificación de taxonomías
    taxonomiasSeleccionadas.value.forEach(tax => {
      if (!tax.justificacion || tax.justificacion.trim() === '') {
        camposFaltantes.push({
          seccion: '4',
          codigo: tax.id,
          nombre: `Justificación para taxonomía ${tax.id} - ${tax.nombre}`
        })
      }
    })
  }
  
  return camposFaltantes
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
  const camposFaltantes = obtenerCamposFaltantes()
  
  if (camposFaltantes.length === 0) {
    alert('✅ Formulario válido - Todos los campos requeridos están completos')
  } else {
    // Mostrar modal con campos faltantes
    camposFaltantesModal.value = camposFaltantes
    mostrarModalValidacion.value = true
  }
}

// Función para cerrar el modal
function cerrarModalValidacion() {
  mostrarModalValidacion.value = false
  camposFaltantesModal.value = []
}

// Función para sanitizar todos los datos antes de enviar
function sanitizarDatosIncidente(datos) {
  const datosSanitizados = {}
  
  for (const [key, value] of Object.entries(datos)) {
    if (typeof value === 'string') {
      // Limpiar strings
      datosSanitizados[key] = value
        .replace(/[<>"'`;\\]/g, '') // Eliminar caracteres SQL peligrosos
        .replace(/[\x00-\x1F\x7F]/g, '') // Eliminar caracteres de control
        .replace(/\s+/g, ' ') // Normalizar espacios
        .trim()
    } else if (key === '1.3' || key === '1.4') {
      // Validar fechas
      if (value) {
        const fecha = new Date(value)
        const ahora = new Date()
        const fechaMinima = new Date('2020-01-01')
        
        if (fecha > ahora) {
          datosSanitizados[key] = ahora.toISOString().slice(0, 16)
        } else if (fecha < fechaMinima) {
          datosSanitizados[key] = fechaMinima.toISOString().slice(0, 16)
        } else {
          datosSanitizados[key] = value
        }
      } else {
        datosSanitizados[key] = null
      }
    } else {
      // Otros valores (arrays, objetos, etc)
      datosSanitizados[key] = value
    }
  }
  
  return datosSanitizados
}

// Funciones para transformación ANCI
function abrirDialogoTransformarAnci() {
  if (!validarRequeridos()) {
    alert('Para transformar a ANCI, primero debe completar todos los campos requeridos')
    return
  }
  mostrandoDialogoAnci.value = true
}

function cancelarTransformacionAnci() {
  mostrandoDialogoAnci.value = false
}

async function confirmarTransformacionAnci() {
  try {
    const token = localStorage.getItem('token')
    
    // Primero validar que el incidente tenga todos los campos requeridos
    const validacionResponse = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/validar-para-anci`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!validacionResponse.ok) {
      let errorMessage = 'Error en la validación'
      try {
        const errorData = await validacionResponse.json()
        errorMessage = errorData.error || errorMessage
        
        // Si hay campos faltantes, mostrarlos
        if (errorData.campos_faltantes) {
          const camposFaltantes = errorData.campos_faltantes.map(c => c.descripcion).join(', ')
          errorMessage = `Campos faltantes: ${camposFaltantes}`
        }
      } catch (e) {
        console.error('Error parseando respuesta:', e)
      }
      throw new Error(errorMessage)
    }
    
    // Transformar a ANCI
    const transformResponse = await fetch(`http://localhost:5000/api/admin/incidentes/${props.incidenteId}/transformar-a-anci`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!transformResponse.ok) {
      const errorData = await transformResponse.json()
      throw new Error(errorData.error || 'Error al transformar a ANCI')
    }
    
    const result = await transformResponse.json()
    alert('Incidente transformado a ANCI exitosamente')
    
    // Recargar la página o redirigir
    mostrandoDialogoAnci.value = false
    window.location.reload()
    
  } catch (err) {
    console.error('Error al transformar a ANCI:', err)
    alert('Error al transformar a ANCI: ' + err.message)
  }
}

async function guardarIncidente() {
  if (!validarRequeridos()) {
    alert('Complete todos los campos requeridos')
    return
  }
  
  // Mostrar indicador de carga
  const loadingIndicator = document.createElement('div')
  loadingIndicator.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-xl z-50 flex items-center gap-3'
  loadingIndicator.innerHTML = `
    <i class="ph-circle-notch animate-spin text-2xl"></i>
    <div>
      <div class="font-bold">Guardando incidente...</div>
      <div class="text-sm">Por favor espere</div>
    </div>
  `
  document.body.appendChild(loadingIndicator)
  
  try {
    // Sanitizar todos los datos del formulario
    const formDataSanitizado = sanitizarDatosIncidente(formData.value)
    
    // Debug de campos CSIRT antes de enviar
    console.log('🔍 Campos CSIRT a enviar:', {
      '1.7.solicitar_csirt': formDataSanitizado['1.7.solicitar_csirt'],
      '1.7.tipo_apoyo': formDataSanitizado['1.7.tipo_apoyo'],
      '1.7.urgencia': formDataSanitizado['1.7.urgencia'],
      '1.7.observaciones_csirt': formDataSanitizado['1.7.observaciones_csirt']
    })
    
    // Preparar datos con formato garantizado
    const datosIncidente = {
      // Usar datos sanitizados
      ...formDataSanitizado,
      taxonomias_seleccionadas: taxonomiasSeleccionadas.value,
      archivos: {
        seccion_2: archivosSeccion2.value,
        seccion_3: archivosSeccion3.value,
        seccion_5: archivosSeccion5.value,
        seccion_6: archivosSeccion6.value
      },
      archivos_eliminados: archivosEliminados.value, // Incluir archivos marcados para eliminar
      empresa_id: props.empresaId,
      tipo_empresa: props.empresaInfo.tipo
    }
    
    // Detectar si hay archivos nuevos para subir
    const hayArchivosNuevos = [
      ...archivosSeccion2.value,
      ...archivosSeccion3.value,
      ...archivosSeccion5.value,
      ...archivosSeccion6.value,
      ...taxonomiasSeleccionadas.value.flatMap(t => t.archivos || [])
    ].some(archivo => archivo.file && !archivo.existente && !archivo.id)
    
    // GUARDADO REAL AL SERVIDOR
    console.log('💾 Guardando incidente en el servidor:', {
      modo: props.modo,
      campos_formulario: Object.keys(datosIncidente).length,
      taxonomias: datosIncidente.taxonomias_seleccionadas.length,
      archivos_totales: Object.values(datosIncidente.archivos).reduce((sum, arr) => sum + arr.length, 0),
      hay_archivos_nuevos: hayArchivosNuevos
    })
    
    // Hacer llamada real al API
    const baseURL = 'http://localhost:5000'
    const url = props.modo === 'editar' 
      ? `${baseURL}/api/incidentes/${props.incidenteId}/actualizar`
      : `${baseURL}/api/incidentes/crear-test`  // TEMPORAL: usar endpoint sin auth
      
    // Obtener token y verificar
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicie sesión nuevamente.')
    }
    
    console.log('🔑 Token presente:', token ? 'Sí' : 'No')
    
    let response
    
    if (hayArchivosNuevos && props.modo === 'editar') {
      // Usar FormData para enviar archivos
      const formData = new FormData()
      
      // Agregar datos del incidente como JSON
      formData.append('datos', JSON.stringify(datosIncidente))
      
      // Agregar archivos nuevos
      const agregarArchivos = (archivos, seccion) => {
        archivos.forEach((archivo, index) => {
          if (archivo.file && !archivo.existente && !archivo.id) {
            formData.append(`archivo_seccion_${seccion}_campo_${archivo.campo || index}`, archivo.file)
          }
        })
      }
      
      agregarArchivos(archivosSeccion2.value, 2)
      agregarArchivos(archivosSeccion3.value, 3)
      agregarArchivos(archivosSeccion5.value, 5)
      agregarArchivos(archivosSeccion6.value, 6)
      
      // Archivos de taxonomías
      taxonomiasSeleccionadas.value.forEach(tax => {
        if (tax.archivos) {
          tax.archivos.forEach((archivo, index) => {
            if (archivo.file && !archivo.existente && !archivo.id) {
              formData.append(`archivo_taxonomia_${tax.id}_${index}`, archivo.file)
            }
          })
        }
      })
      
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir Content-Type, dejar que el navegador lo configure con boundary
        },
        body: formData
      })
    } else {
      // Enviar como JSON si no hay archivos nuevos
      response = await fetch(url, {
        method: props.modo === 'editar' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosIncidente)
      })
    }
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.mensaje || error.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    const resultado = await response.json()
    console.log('✅ Incidente guardado exitosamente:', resultado)
    
    // Quitar indicador de carga
    loadingIndicator.remove()
    
    // Mostrar mensaje de éxito
    const mensajeExito = document.createElement('div')
    mensajeExito.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-xl z-50 flex items-center gap-3'
    mensajeExito.innerHTML = `
      <i class="ph-check-circle text-2xl"></i>
      <div>
        <div class="font-bold">¡Incidente guardado exitosamente!</div>
        <div class="text-sm">ID: ${resultado.incidente_id} - Índice: ${resultado.indice_unico}</div>
      </div>
    `
    document.body.appendChild(mensajeExito)
    
    // Quitar el mensaje después de 5 segundos
    setTimeout(() => {
      mensajeExito.remove()
    }, 5000)
    
    // IMPORTANTE: En modo edición, recargar datos del servidor para refrescar taxonomías
    if (props.modo === 'editar' && props.incidenteId) {
      console.log('🔄 Recargando datos después de guardar para refrescar taxonomías...')
      try {
        // Usar await directamente sin timeout - esperar a que termine completamente
        await cargarIncidenteExistente()
        console.log('✅ Datos y taxonomías recargados exitosamente')
      } catch (error) {
        console.error('❌ Error recargando datos:', error)
      }
    }
    
    // Emitir evento
    emit('incidente-guardado', resultado)
    
    // Redirigir después de 2 segundos (solo si no es modo edición)
    if (props.modo !== 'editar') {
      setTimeout(() => {
        window.location.href = '/incidentes'
      }, 2000)
    }
    
  } catch (error) {
    console.error('❌ Error guardando incidente:', error)
    
    // Quitar indicador de carga
    loadingIndicator.remove()
    
    // Mostrar mensaje de error
    const mensajeError = document.createElement('div')
    mensajeError.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-xl z-50 flex items-center gap-3 max-w-md'
    mensajeError.innerHTML = `
      <i class="ph-x-circle text-2xl"></i>
      <div>
        <div class="font-bold">Error al guardar incidente</div>
        <div class="text-sm">${error.message || 'Error desconocido'}</div>
      </div>
    `
    document.body.appendChild(mensajeError)
    
    // Quitar el mensaje después de 5 segundos
    setTimeout(() => {
      mensajeError.remove()
    }, 5000)
    
    emit('error', `Error guardando incidente: ${error.message}`)
  }
}

async function cargarIncidenteExistente() {
  console.log('🎯 cargarIncidenteExistente llamada con:', {
    incidenteId: props.incidenteId,
    modo: props.modo,
    condicion: !props.incidenteId || props.modo !== 'editar'
  })
  
  if (!props.incidenteId || props.modo !== 'editar') {
    console.log('⚠️ Saliendo de cargarIncidenteExistente por condiciones no cumplidas')
    return
  }
  
  try {
    console.log(`🔄 Cargando incidente ${props.incidenteId} para edición (COPIA COMPLETA)...`)
    
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }
    
    const response = await fetch(`http://localhost:5002/api/incidente/${props.incidenteId}/cargar_completo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo cargar el incidente`)
    }
    
    const respuesta = await response.json()
    console.log('📋 Respuesta completa del endpoint cargar_completo:', respuesta)
    
    // El endpoint cargar_completo devuelve { success: true, incidente: {...} }
    const datos = respuesta.incidente || respuesta
    console.log('📋 Datos del incidente extraídos:', datos)
    
    // === CARGA COMPLETA - ADAPTADA AL FORMATO DE cargar_completo ===
    
    // 1. Cargar TODOS los datos del formulario
    console.log('⚠️ Mapeando campos desde cargar_completo')
    formData.value = {
      '1.1': datos.TipoRegistro || datos.TipoFlujo || '',
      '1.2': datos.Titulo || '',
      '1.3': datos.FechaDeteccion || '',
      '1.4': datos.FechaOcurrencia || '',
      '1.5': datos.Criticidad || '',
      '1.6': datos.AlcanceGeografico || datos.OrigenIncidente || '',
      '1.7.solicitar_csirt': datos.SolicitarCSIRT || false,
      '1.7.tipo_apoyo': datos.TipoApoyoCSIRT || '',
      '1.7.urgencia': datos.UrgenciaCSIRT || '',
      '1.7.observaciones_csirt': datos.ObservacionesCSIRT || '',
      '2.1': datos.DescripcionInicial || datos.DescripcionBreve || '',
      '2.2': datos.AnciImpactoPreliminar || '',
      '2.3': datos.SistemasAfectados || '',
      '2.4': datos.ServiciosInterrumpidos || '',
      '3.1': datos.OrigenIncidente || '',
      '3.2': datos.AnciTipoAmenaza || '',
      '3.3': datos.ResponsableCliente || '',
      '5.1': datos.AccionesInmediatas || '',
      '6.1': datos.CausaRaiz || '',
      '6.2': datos.LeccionesAprendidas || '',
      '6.3': datos.PlanMejora || ''
    }
    console.log('✅ Campos mapeados:', Object.keys(formData.value).length)
    
    // 2. Cargar taxonomías con TODA su información
    if (datos.taxonomias_seleccionadas && Array.isArray(datos.taxonomias_seleccionadas)) {
      console.log('🏷️ Taxonomías recibidas del servidor:', datos.taxonomias_seleccionadas)
      
      // Función para cargar taxonomías seleccionadas sin timeout
      const cargarTaxonomiasSeleccionadas = async () => {
        // Asegurar que las taxonomías disponibles estén cargadas
        if (taxonomiasDisponibles.value.length === 0) {
          console.log('🔄 Taxonomías disponibles no cargadas, cargando...')
          await cargarTaxonomias()
        }
        
        // Mapear las taxonomías seleccionadas con sus datos completos
        taxonomiasSeleccionadas.value = datos.taxonomias_seleccionadas.map(taxSeleccionada => {
          // Buscar la taxonomía completa en las disponibles
          const taxCompleta = taxonomiasDisponibles.value.find(t => t.id === taxSeleccionada.id)
          
          if (taxCompleta) {
            return {
              ...taxCompleta, // Incluir todos los datos de la taxonomía
              justificacion: taxSeleccionada.justificacion || '',
              descripcionProblema: taxSeleccionada.descripcionProblema || '',
              archivos: taxSeleccionada.archivos || [],
              fechaSeleccion: taxSeleccionada.fechaSeleccion || new Date().toISOString(),
              usuarioSeleccion: taxSeleccionada.usuarioSeleccion || 'Usuario actual'
            }
          } else {
            console.warn(`⚠️ Taxonomía ${taxSeleccionada.id} no encontrada en disponibles, usando datos del servidor`)
            // Construir objeto con estructura mínima necesaria
            return {
              id: taxSeleccionada.id,
              nombre: taxSeleccionada.nombre || 'Taxonomía no encontrada',
              justificacion: taxSeleccionada.justificacion || '',
              descripcionProblema: taxSeleccionada.descripcionProblema || '',
              archivos: taxSeleccionada.archivos || [],
              fechaSeleccion: taxSeleccionada.fechaSeleccion || new Date().toISOString()
            }
          }
        })
        
        console.log(`✅ ${taxonomiasSeleccionadas.value.length} taxonomías seleccionadas cargadas`)
        console.log('📋 Taxonomías con justificaciones:', taxonomiasSeleccionadas.value.map(t => ({
          id: t.id,
          nombre: t.nombre || 'Sin nombre',
          justificacion: t.justificacion?.substring(0, 50) + '...'
        })))
        
        return true
      }
      
      // Ejecutar la carga
      await cargarTaxonomiasSeleccionadas()
      
      // Forzar actualización visual de la UI
      await nextTick()
      console.log('🔄 UI actualizada después de cargar taxonomías')
    }
    
    // 3. Restaurar TODOS los archivos por sección
    if (datos.archivos) {
      console.log('📁 Estructura de archivos recibida:', datos.archivos)
      
      // El backend puede enviar con claves numéricas o con prefijo seccion_
      archivosSeccion2.value = datos.archivos.seccion_2 || datos.archivos['2'] || []
      archivosSeccion3.value = datos.archivos.seccion_3 || datos.archivos['3'] || []
      archivosSeccion5.value = datos.archivos.seccion_5 || datos.archivos['5'] || []
      archivosSeccion6.value = datos.archivos.seccion_6 || datos.archivos['6'] || []
      
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
        seccion6: archivosSeccion6.value.length,
        totalComputed: totalArchivos.value,
        todosLosArchivosLength: todosLosArchivos.value.length
      })
      
      // Log detallado de archivos
      if (archivosSeccion2.value.length > 0) {
        console.log('📎 Archivos Sección 2:', archivosSeccion2.value)
      }
    } else {
      console.warn('⚠️ No se recibieron archivos del backend')
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
    modo: props.modo,
    incidenteId: props.incidenteId,
    datosIniciales: props.datosIniciales
  })
  
  // Si no tenemos tipo de empresa, cargarlo primero
  if (!props.empresaInfo.tipo) {
    await cargarInfoEmpresa()
  }
  
  // Luego cargar taxonomías
  cargarTaxonomias()
  
  // IMPORTANTE: En modo edición, SIEMPRE cargar desde el servidor para obtener datos completos
  console.log('🔍 Verificando condiciones para cargar:', {
    modo: props.modo,
    modoEsEditar: props.modo === 'editar',
    incidenteId: props.incidenteId,
    tipoIncidenteId: typeof props.incidenteId,
    hayIncidenteId: !!props.incidenteId,
    condicionCompleta: props.modo === 'editar' && props.incidenteId
  })
  
  if (props.modo === 'editar' && props.incidenteId) {
    console.log('📥 Modo edición: intentando cargar datos...')
    
    // Primero intentar usar datos iniciales si existen
    if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
      console.log('✅ Usando datos iniciales en modo editar')
      // No hacer return, dejar que continúe al procesamiento de datos iniciales
    } else {
      // Solo si no hay datos iniciales, cargar del servidor
      console.log('🔄 No hay datos iniciales, cargando del servidor...')
      await cargarIncidenteExistente()
      
      // Cargar taxonomías específicamente después de cargar el incidente
      // Esto es crucial para edición normal, ANCI y semilla
      console.log('🔄 Cargando taxonomías del incidente específicamente...')
      await cargarTaxonomiasDelIncidente()
      return
    }
  }
  
  // Procesar datos iniciales (tanto en modo crear como editar)
  if (props.datosIniciales) {
    console.log('📥 Cargando datos iniciales proporcionados')
    
    // Detectar si es un incidente ANCI
    esIncidenteAnci.value = props.datosIniciales.ReporteAnciID || props.datosIniciales.TieneReporteANCI || false
    
    // Cargar datos del formulario
    Object.keys(props.datosIniciales).forEach(key => {
      if (key !== 'taxonomias_seleccionadas' && key !== 'archivos_existentes') {
        formData.value[key] = props.datosIniciales[key]
      }
    })
    
    // Cargar taxonomías seleccionadas desde datos iniciales temporalmente
    if (props.datosIniciales.taxonomias_seleccionadas) {
      taxonomiasSeleccionadas.value = props.datosIniciales.taxonomias_seleccionadas
      console.log('📋 Taxonomías cargadas desde datos iniciales:', taxonomiasSeleccionadas.value.length)
    }
    
    // Los archivos existentes se mostrarán pero no se pueden editar directamente
    if (props.datosIniciales.archivos_existentes) {
      console.log('📁 Archivos existentes:', props.datosIniciales.archivos_existentes)
      
      // Cargar archivos existentes en las secciones correspondientes
      for (const [seccion, archivos] of Object.entries(props.datosIniciales.archivos_existentes)) {
        // Convertir archivos al formato esperado por el componente
        const archivosFormateados = archivos.map((archivo, index) => ({
          id: `existente_${seccion}_${index}`,
          nombre: archivo.nombre,
          tamaño: archivo.tamaño,
          tipo: archivo.tipo || 'application/octet-stream',
          descripcion: archivo.descripcion || '',
          comentario: archivo.comentario || '',
          fechaCarga: archivo.fechaCarga || new Date().toISOString(),
          existente: true,  // Marcar como archivo existente
          origen: archivo.origen || 'servidor'
        }))
        
        // Asignar a la sección correspondiente
        if (seccion === '2') {
          archivosSeccion2.value = archivosFormateados
        } else if (seccion === '3') {
          archivosSeccion3.value = archivosFormateados
        } else if (seccion === '5') {
          archivosSeccion5.value = archivosFormateados
        } else if (seccion === '6') {
          archivosSeccion6.value = archivosFormateados
        }
      }
      
      console.log('✅ Archivos existentes cargados en secciones')
    }
    
  } else if (props.modo === 'editar' && props.incidenteId) {
    // Si no hay datos iniciales pero estamos en modo editar, cargar desde el servidor
    cargarIncidenteExistente()
  }
  
  // IMPORTANTE: SIEMPRE cargar taxonomías desde el endpoint cuando hay incidenteId
  // Esto asegura que tengamos los archivos adjuntos de las taxonomías
  // Aplica para: edición normal, edición ANCI, edición semilla
  if (props.incidenteId) {
    console.log('🔄 Cargando taxonomías desde endpoint para modo:', props.modo)
    // Usar setTimeout para asegurar que se ejecute después de procesar datos iniciales
    setTimeout(async () => {
      await cargarTaxonomiasDelIncidente()
    }, 100)
  }
})

// Nueva función para cargar taxonomías del incidente
async function cargarTaxonomiasDelIncidente() {
  try {
    console.log('🔄 Cargando taxonomías del incidente...')
    
    // Usar endpoint simplificado sin autenticación
    const response = await fetch(`http://localhost:5000/api/incidentes/${props.incidenteId}/taxonomias-simple`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Taxonomías cargadas desde endpoint específico:', data)
      
      if (data.taxonomias && data.taxonomias.length > 0) {
        // Asegurarse de que las taxonomías disponibles estén cargadas
        if (taxonomiasDisponibles.value.length === 0) {
          await cargarTaxonomias()
        }
        
        // Mapear las taxonomías con toda su información
        taxonomiasSeleccionadas.value = data.taxonomias.map(tax => {
          const taxCompleta = taxonomiasDisponibles.value.find(t => t.id === tax.id)
          
          if (taxCompleta) {
            return {
              ...taxCompleta,
              justificacion: tax.justificacion || '',
              descripcionProblema: tax.descripcionProblema || '',
              archivos: tax.archivos || [],
              fechaSeleccion: tax.FechaAsignacion || new Date().toISOString()
            }
          } else {
            return {
              ...tax,
              fechaSeleccion: tax.FechaAsignacion || new Date().toISOString()
            }
          }
        })
        
        console.log(`✅ ${taxonomiasSeleccionadas.value.length} taxonomías cargadas y procesadas`)
        
        // Forzar actualización visual
        await nextTick()
      }
    } else {
      console.warn('⚠️ No se pudieron cargar las taxonomías del incidente')
    }
  } catch (error) {
    console.error('❌ Error cargando taxonomías:', error)
  }
}
</script>

<style scoped>
/* ESTILOS MÓDULO ACOMPAÑAMIENTO APLICADOS A INCIDENCIAS */
.acordeon-incidente-mejorado {
  background-color: #1f2937;
  color: #d1d5db;
  min-height: 100vh;
  padding: 1.5rem;
}

/* HEADER CON NAVEGACIÓN ESTILO ACOMPAÑAMIENTO */
.header-con-navegacion {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid #374151;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #374151;
  color: #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  border: 1px solid #4b5563;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-volver:hover {
  background-color: #4b5563;
  color: #e5e7eb;
}

.header-info {
  flex: 1;
}

.titulo-principal {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
}

.empresa-detalle {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.empresa-nombre {
  color: #9ca3af;
  font-size: 0.875rem;
}

.tipo-badge {
  background-color: rgba(79, 70, 229, 0.1);
  color: #a5b4fc;
  border: 1px solid rgba(79, 70, 229, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* ACORDEONES ESTILO ACOMPAÑAMIENTO */
.acordeones-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.accordion-item {
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background-color: #1f2937;
  transition: background-color 0.2s;
}

.accordion-header {
  background-color: #2d3748;
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  width: 100%;
  text-align: left;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  transition: all 0.2s;
}

.accordion-header[aria-expanded="true"] {
  background-color: #1e293b;
  border-bottom: 1px solid #4f46e5;
  border-radius: 0.5rem 0.5rem 0 0;
}

.accordion-header:hover {
  background-color: #374151;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-right: 1rem;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.article-reference {
  font-size: 0.8rem;
  font-weight: 700;
  color: #93c5fd;
  text-transform: uppercase;
}

.description-text {
  color: #d1d5db;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.status-indicators {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
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

/* Alerta de sección congelada */
.alerta-seccion-congelada {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.alerta-seccion-congelada i {
  font-size: 1.5rem;
  color: #f59e0b;
  margin-top: 0.125rem;
}

.alerta-texto strong {
  color: #fbbf24;
  display: block;
  margin-bottom: 0.25rem;
}

.alerta-texto p {
  color: #fde68a;
  margin: 0;
  font-size: 0.875rem;
}

.accordion-content {
  padding: 1.5rem;
  background-color: #111827;
  border-radius: 0 0 0.5rem 0.5rem;
}

/* FORMULARIOS ESTILO ACOMPAÑAMIENTO */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #9ca3af;
  font-size: 0.875rem;
}

.required-asterisk {
  color: #f87171;
}

.form-input {
  width: 100%;
  background-color: #374151;
  border: 1px solid #4b5563;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-input::placeholder {
  color: #6b7280;
}

/* Input de fecha/hora necesita fondo blanco para mostrar calendario */
input[type="datetime-local"].form-input {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  color: #d1d5db;
  font-size: 0.875rem;
}

/* SECCIONES ESPECIALES */
.csirt-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(31, 41, 55, 0.5);
  border: 1px solid #4b5563;
  border-radius: 0.5rem;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #4b5563;
  color: #9ca3af;
  font-weight: 600;
  font-size: 0.875rem;
}

/* TRANSICIONES */
.transition-transform {
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

.accordion-fade-enter-active, .accordion-fade-leave-active {
  transition: all 0.3s ease-out;
  max-height: 1000px;
  opacity: 1;
}

.accordion-fade-enter-from, .accordion-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
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
  @apply transition-all duration-300;
  color: #ffffff !important;
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
  font-size: 18px;
  width: 20px;
  text-align: center;
  /* Los colores se definen inline para cada sección */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.seccion-numero {
  @apply mx-3 font-bold text-xl;
  background: linear-gradient(135deg, #3b82f6, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.seccion-titulo {
  @apply flex-1 font-semibold text-lg;
  color: #ffffff !important;
  letter-spacing: 0.5px;
}

.seccion-estado {
  @apply ml-auto flex items-center gap-2;
}

.seccion-estado::before,
.seccion-estado::after,
.seccion-estado i::before,
.seccion-estado i::after {
  content: none !important;
  display: none !important;
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
  @apply block text-sm font-semibold mb-3 tracking-wide;
  color: #ffffff !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.requerido {
  @apply text-red-400;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
}

.campo-input, .campo-textarea {
  @apply w-full px-4 py-3 rounded-lg;
  background-color: #495057 !important;
  color: #ffffff !important;
  border: 1px solid #6c757d !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  font-size: 14px;
}

.campo-input:focus, .campo-textarea:focus {
  @apply outline-none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.campo-input::placeholder, .campo-textarea::placeholder {
  color: #adb5bd !important;
}

.campo-textarea {
  @apply resize-none;
  min-height: 100px;
}

select.campo-input {
  @apply cursor-pointer;
  background-color: #495057 !important;
  color: #ffffff !important;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

select.campo-input option {
  background-color: #495057 !important;
  color: #ffffff !important;
  padding: 8px 12px;
}

/* CORREGIR: Input de fecha/hora necesita fondo blanco para mostrar calendario */
input[type="datetime-local"].campo-input {
  background-color: #ffffff !important;
  color: #000000 !important;
}

/* Asegurar que la sección 1 sea visible */
.seccion-contenido {
  display: block !important;
}

/* Forzar texto blanco en todo el contenido de las secciones */
.seccion-contenido,
.seccion-contenido * {
  color: #ffffff !important;
}

.seccion-contenido .campo-label,
.seccion-contenido label,
.seccion-contenido p,
.seccion-contenido span:not(.requerido):not(.badge-count):not(.taxonomia-tipo) {
  color: #ffffff !important;
}

/* Mantener colores especiales */
.seccion-contenido .requerido {
  color: #ef4444 !important;
}

/* COLORES INSTITUCIONALES PARA FORMULARIO DE TAXONOMÍAS */
.taxonomia-formulario {
  background-color: #495057 !important;
  border: 1px solid #e9ecef !important;
  border-left: 4px solid #007bff !important;
  border-radius: 5px !important;
  padding: 20px !important;
  margin: 15px 0 !important;
  width: 100% !important;
}

.campo-grupo {
  margin-bottom: 15px !important;
}

.campo-grupo label {
  color: #495057 !important;
  font-weight: 500 !important;
  margin-bottom: 5px !important;
  display: block !important;
}

.campo-grupo textarea {
  background-color: #495057 !important;
  color: #ffffff !important;
  border: 1px solid #6c757d !important;
  border-radius: 4px !important;
  padding: 10px !important;
  width: 100% !important;
  color: #495057 !important;
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
  background: rgba(243, 244, 246, 0.05);
  border: 2px solid #10b981;
  box-shadow: 
    0 4px 12px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.taxonomia-item.seleccionada:hover {
  background: rgba(243, 244, 246, 0.1);
  border-color: #34d399;
  transform: translateY(-2px) translateZ(5px) scale(1.02);
  box-shadow: 
    0 6px 16px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.taxonomia-item input[type="checkbox"] {
  @apply w-5 h-5 rounded;
  accent-color: #3b82f6;
}

.taxonomia-info {
  @apply flex-1 ml-4;
}

.taxonomia-nombre {
  @apply font-semibold text-white mb-1 block;
}

.taxonomia-item .taxonomia-descripcion {
  @apply text-sm text-white mt-1;
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
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
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
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
  color: #ffffff !important;
}

.input-busqueda {
  @apply pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

.taxonomia-codigo {
  @apply text-xs font-mono text-blue-400 mb-1;
}

.tax-area, .tax-efecto {
  @apply text-xs;
}

.tax-categoria {
  @apply text-xs text-blue-400;
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
  @apply flex items-center gap-2 text-xs mt-1;
  color: #ffffff !important;
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
  @apply text-sm text-white flex items-center gap-2 mb-2;
}

.comentario-archivo {
  @apply w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white resize-none;
  @apply focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
}

/* Resumen de archivos */
.resumen-archivos-tax {
  @apply flex items-center gap-2 mt-4 pt-4 border-t border-gray-700 text-sm;
  color: #ffffff !important;
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

/* Botón Transformar a ANCI */
.btn-danger-outline {
  background: transparent;
  color: #ef4444;
  border: 2px solid #ef4444;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
  transition: all 0.3s ease;
}

.btn-danger-outline:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.btn-danger-outline i {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

/* ESTILOS CORRECTOS PARA LAYOUT VERTICAL */
.taxonomia-seleccionada {
    display: block !important;  /* NO flex */
    width: 100% !important;
    margin-bottom: 20px;
}

.taxonomia-titulo {
    width: 100% !important;
    background-color: #495057 !important;
    color: white !important;
    border-left: 4px solid #28a745 !important;
    /* NO azul, NO layout horizontal */
}

.taxonomia-campos {
    width: 100% !important;
    background-color: #1f2937 !important;
    color: white !important;
    border-left: 4px solid #28a745 !important;
    /* NO azul, NO al lado */
}

.taxonomia-campos input,
.taxonomia-campos textarea,
.taxonomia-campos select {
    background-color: #495057 !important;
    color: #ffffff !important;
    border: 1px solid #6c757d !important;
}

.taxonomia-campos input::placeholder,
.taxonomia-campos textarea::placeholder {
    color: #e5e7eb !important;
}

/* FORZAR COLOR BLANCO EN TODOS LOS TEXTOS - MÁXIMA PRIORIDAD */
.acordeon-incidente-mejorado .campo-label,
.acordeon-incidente-mejorado .seccion-contenido label,
.acordeon-incidente-mejorado .seccion-contenido p,
.acordeon-incidente-mejorado .seccion-contenido span,
.acordeon-incidente-mejorado .seccion-contenido div,
.acordeon-incidente-mejorado .campo-input,
.acordeon-incidente-mejorado .campo-textarea,
.acordeon-incidente-mejorado select,
.acordeon-incidente-mejorado option,
.acordeon-incidente-mejorado .taxonomia-info,
.acordeon-incidente-mejorado .taxonomia-nombre,
.acordeon-incidente-mejorado .taxonomia-descripcion,
.acordeon-incidente-mejorado .tax-area,
.acordeon-incidente-mejorado .tax-efecto,
.acordeon-incidente-mejorado .tax-categoria,
.campo-label,
label {
  color: #ffffff !important;
}

/* Color placeholder más claro */
.acordeon-incidente-mejorado .campo-input::placeholder,
.acordeon-incidente-mejorado .campo-textarea::placeholder,
.campo-input::placeholder,
.campo-textarea::placeholder {
  color: #e5e7eb !important;
}

/* MODAL DE VALIDACIÓN ESTILO ACOMPAÑAMIENTO */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: #111827;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  color: #d1d5db;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #374151;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e5e7eb;
  margin: 0;
  display: flex;
  align-items: center;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  color: #e5e7eb;
  background-color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-description {
  color: #9ca3af;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.campos-faltantes-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.campo-faltante-item {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.campo-faltante-item:hover {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

.campo-seccion {
  font-size: 0.75rem;
  font-weight: 600;
  color: #93c5fd;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.campo-detalle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.campo-codigo {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fbbf24;
}

.campo-nombre {
  color: #e5e7eb;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #374151;
}

.btn-modal-cerrar {
  display: flex;
  align-items: center;
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-cerrar:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

/* Animación de rotación para el indicador de carga */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Modal ANCI específico */
.modal-anci .alerta-anci {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.modal-anci .alerta-anci i {
  font-size: 1.5rem;
  color: #ef4444;
  margin-top: 0.125rem;
}

.modal-anci .alerta-anci p {
  color: #fca5a5;
  margin: 0;
  line-height: 1.5;
}

.modal-anci .plazos-info {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.modal-anci .plazos-info h4 {
  color: #f59e0b;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.modal-anci .plazo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.modal-anci .plazo-item:last-child {
  border-bottom: none;
}

.modal-anci .plazo-tipo {
  color: #e2e8f0;
  font-weight: 500;
}

.modal-anci .plazo-tiempo {
  color: #fbbf24;
  font-weight: 600;
}

.modal-anci .consecuencias-info {
  margin-bottom: 1rem;
}

.modal-anci .consecuencias-info h4 {
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.modal-anci .consecuencias-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modal-anci .consecuencias-info li {
  color: #cbd5e1;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.btn-modal-secundario {
  display: flex;
  align-items: center;
  background-color: #4b5563;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-secundario:hover {
  background-color: #374151;
  transform: translateY(-1px);
}

.btn-modal-peligro {
  display: flex;
  align-items: center;
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-peligro:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}
</style>