<template>
  <div class="prueba-sistema-dinamico p-4">
    <h2 class="text-2xl font-bold mb-4">🧪 Prueba del Sistema Dinámico</h2>
    
    <!-- Selector de empresa -->
    <div class="mb-6 p-4 bg-gray-100 rounded">
      <label class="block mb-2 font-semibold">Seleccionar Empresa:</label>
      <select v-model="empresaSeleccionada" @change="cargarSecciones" class="form-select">
        <option value="">-- Seleccione una empresa --</option>
        <option value="1">Empresa 1 (OIV)</option>
        <option value="2">Empresa 2 (PSE)</option>
        <option value="3">Empresa 3 (AMBAS)</option>
      </select>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="text-center py-8">
      <i class="ph ph-spinner-gap text-4xl animate-spin"></i>
      <p>Cargando secciones dinámicas...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <strong>❌ Error:</strong> {{ error }}
      <div class="mt-2 text-sm">
        <p><strong>Posibles causas:</strong></p>
        <ul class="list-disc list-inside ml-4">
          <li>El servidor Flask no está ejecutándose</li>
          <li>El blueprint no está registrado</li>
          <li>Las tablas de la base de datos no existen</li>
          <li>No hay datos en ANCI_SECCIONES_CONFIG</li>
        </ul>
      </div>
    </div>

    <!-- Información del sistema -->
    <div v-if="informacionSistema" class="mb-6">
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <h3 class="font-bold">✅ Información del Sistema Dinámico:</h3>
        <div class="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p><strong>Total de secciones:</strong> {{ informacionSistema.total_secciones }}</p>
            <p><strong>Secciones fijas:</strong> {{ informacionSistema.secciones_fijas }}</p>
          </div>
          <div>
            <p><strong>Secciones taxonomía:</strong> {{ informacionSistema.secciones_taxonomia }}</p>
            <p><strong>Endpoint funcionando:</strong> ✅</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de secciones -->
    <div v-if="secciones.length > 0" class="space-y-4">
      <h3 class="text-xl font-semibold mb-3">📋 Secciones Disponibles:</h3>
      
      <div v-for="seccion in secciones" :key="seccion.seccion_id" 
           class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
           :class="{
             'border-blue-500 bg-blue-50': seccion.tipo === 'FIJA',
             'border-green-500 bg-green-50': seccion.tipo === 'TAXONOMIA',
             'border-red-500 bg-red-50': seccion.codigo === 'SEC_CSIRT',
             'border-purple-500 bg-purple-50': seccion.tipo === 'ESPECIAL' && seccion.codigo !== 'SEC_CSIRT'
           }">
        
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-lg flex items-center">
            <i :class="`ph ph-${seccion.icono || 'folder'} mr-2`"></i>
            {{ seccion.orden }}. {{ seccion.titulo }}
            <span v-if="seccion.codigo === 'SEC_CSIRT'" class="ml-2 text-red-600">🚨</span>
          </h4>
          <span class="text-sm px-2 py-1 rounded"
                :class="{
                  'bg-blue-200 text-blue-800': seccion.tipo === 'FIJA',
                  'bg-green-200 text-green-800': seccion.tipo === 'TAXONOMIA',
                  'bg-purple-200 text-purple-800': seccion.tipo === 'ESPECIAL'
                }">
            {{ seccion.tipo }}
          </span>
        </div>
        
        <p class="text-sm text-gray-600 mb-2">{{ seccion.descripcion }}</p>
        
        <div class="text-xs text-gray-500 flex flex-wrap gap-4">
          <span>📝 Código: {{ seccion.codigo }}</span>
          <span>💬 Max comentarios: {{ seccion.max_comentarios }}</span>
          <span>📎 Max archivos: {{ seccion.max_archivos }} ({{ seccion.max_size_mb }}MB c/u)</span>
        </div>

        <!-- Mostrar campos si es CSIRT -->
        <div v-if="seccion.codigo === 'SEC_CSIRT'" class="mt-3 p-3 bg-white rounded border">
          <h5 class="font-semibold mb-2 text-red-700">🔍 Campos CSIRT (JSON):</h5>
          <div class="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            <pre>{{ formatearCampos(seccion.campos) }}</pre>
          </div>
        </div>

        <!-- Mostrar algunos campos de taxonomías -->
        <div v-if="seccion.tipo === 'TAXONOMIA'" class="mt-2">
          <button 
            @click="toggleMostrarCampos(seccion.seccion_id)"
            class="text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded">
            {{ mostrandoCampos[seccion.seccion_id] ? 'Ocultar' : 'Mostrar' }} campos
          </button>
          <div v-if="mostrandoCampos[seccion.seccion_id]" class="mt-2 text-xs bg-gray-100 p-2 rounded">
            <pre>{{ formatearCampos(seccion.campos) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-if="!cargando && !error && secciones.length === 0 && empresaSeleccionada" 
         class="text-center py-8 bg-yellow-100 border border-yellow-400 rounded">
      <i class="ph ph-warning text-4xl text-yellow-600 mb-2"></i>
      <p class="text-yellow-700">No se encontraron secciones para esta empresa.</p>
      <p class="text-sm text-yellow-600 mt-2">
        Posiblemente las tablas del sistema dinámico no tengan datos.
      </p>
    </div>

    <!-- Botones de acción -->
    <div class="mt-6 flex gap-4 flex-wrap">
      <button 
        @click="verificarEndpoint" 
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
        <i class="ph ph-globe mr-2"></i>
        Verificar Endpoint
      </button>

      <button 
        @click="mostrarInstrucciones" 
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center">
        <i class="ph ph-info mr-2"></i>
        Ver Instrucciones
      </button>

      <button 
        @click="irAFormulario" 
        :disabled="!empresaSeleccionada"
        class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center disabled:opacity-50">
        <i class="ph ph-file-text mr-2"></i>
        Probar Formulario
      </button>
    </div>

    <!-- Modal de instrucciones -->
    <div v-if="mostrandoInstrucciones" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">📋 Instrucciones de Configuración</h3>
        
        <div class="space-y-4 text-sm">
          <div>
            <h4 class="font-semibold text-blue-600">1. Verificar Base de Datos:</h4>
            <code class="bg-gray-100 p-2 rounded block">
              sqlcmd -S servidor -d base_datos -i verificar_sistema_dinamico.sql
            </code>
          </div>

          <div>
            <h4 class="font-semibold text-green-600">2. Si no hay datos, ejecutar:</h4>
            <code class="bg-gray-100 p-2 rounded block mb-1">
              sqlcmd -S servidor -d base_datos -i crear_sistema_dinamico.sql
            </code>
            <code class="bg-gray-100 p-2 rounded block">
              sqlcmd -S servidor -d base_datos -i actualizar_sistema_dinamico_csirt.sql
            </code>
          </div>

          <div>
            <h4 class="font-semibold text-purple-600">3. Reiniciar servidor Flask</h4>
            <p>Después de registrar el blueprint</p>
          </div>
        </div>

        <button 
          @click="mostrandoInstrucciones = false"
          class="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default {
  name: 'PruebaSistemaDinamico',
  data() {
    return {
      empresaSeleccionada: '',
      secciones: [],
      informacionSistema: null,
      cargando: false,
      error: null,
      mostrandoInstrucciones: false,
      mostrandoCampos: {}
    };
  },
  methods: {
    async cargarSecciones() {
      if (!this.empresaSeleccionada) {
        this.secciones = [];
        this.informacionSistema = null;
        return;
      }

      this.cargando = true;
      this.error = null;

      try {
        console.log(`Cargando secciones para empresa ${this.empresaSeleccionada}`);
        
        const response = await axios.get(
          `${API_URL}/api/incidente-dinamico/secciones-empresa/${this.empresaSeleccionada}`,
          { withCredentials: true }
        );
        
        console.log('Respuesta del servidor:', response.data);
        
        if (response.data.success) {
          this.secciones = response.data.secciones;
          this.informacionSistema = {
            total_secciones: response.data.total_secciones,
            secciones_fijas: response.data.secciones_fijas,
            secciones_taxonomia: response.data.secciones_taxonomia
          };
        } else {
          throw new Error(response.data.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error completo:', error);
        
        if (error.response?.status === 404) {
          this.error = 'Endpoint no encontrado. El blueprint no está registrado o el servidor no está ejecutándose.';
        } else if (error.response?.status === 500) {
          this.error = 'Error del servidor. Posiblemente las tablas de la base de datos no existen.';
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          this.error = 'No se puede conectar al servidor Flask en http://localhost:5000';
        } else {
          this.error = error.response?.data?.error || error.message || 'Error al cargar secciones';
        }
        
        this.secciones = [];
        this.informacionSistema = null;
      } finally {
        this.cargando = false;
      }
    },

    async verificarEndpoint() {
      try {
        const response = await axios.get(`${API_URL}/api/health`, { withCredentials: true });
        alert('✅ Servidor Flask está funcionando\n\nPróximo paso: Verificar si el blueprint está registrado');
      } catch (error) {
        alert('❌ No se puede conectar al servidor Flask\n\nVerificar que esté ejecutándose en http://localhost:5000');
      }
    },

    formatearCampos(camposJson) {
      try {
        const campos = JSON.parse(camposJson);
        return JSON.stringify(campos, null, 2);
      } catch (e) {
        return camposJson;
      }
    },

    toggleMostrarCampos(seccionId) {
      this.$set(this.mostrandoCampos, seccionId, !this.mostrandoCampos[seccionId]);
    },

    mostrarInstrucciones() {
      this.mostrandoInstrucciones = true;
    },

    irAFormulario() {
      if (this.empresaSeleccionada) {
        this.$router.push(`/empresa/${this.empresaSeleccionada}/incidentes/declarar`);
      }
    }
  }
};
</script>

<style scoped>
.prueba-sistema-dinamico {
  max-width: 1200px;
  margin: 0 auto;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Estilos para grid responsivo */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .flex-wrap {
    flex-direction: column;
  }
}

/* Estilos para pre formatting */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Botones */
button:disabled {
  cursor: not-allowed;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
  transition: transform 0.2s;
}
</style>