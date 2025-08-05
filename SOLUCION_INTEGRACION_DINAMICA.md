# 🔧 Solución: Integración del Sistema Dinámico

## 🔍 Diagnóstico del Problema

El sistema no muestra los campos dinámicos porque:

1. **Backend**: El blueprint `incidente_dinamico_bp` NO está registrado en Flask
2. **Frontend**: El `CuadernoAnalista.vue` usa secciones estáticas, no dinámicas
3. **Base de datos**: No sabemos si las tablas dinámicas tienen datos

## 🚀 Plan de Solución

### Paso 1: Registrar Blueprint en Flask

**Archivo:** `agente_digital_api/app/__init__.py`

Agregar después de la línea 98:

```python
# Módulo de sistema dinámico de incidentes
try:
    from .views.incidente_dinamico_views import incidente_dinamico_bp
    app.register_blueprint(incidente_dinamico_bp)
    modules_registered += 1
    print("✅ Módulo de sistema dinámico registrado")
except ImportError as e:
    print(f"⚠️ Módulo de sistema dinámico no disponible: {e}")
```

### Paso 2: Actualizar el servicio en el frontend

**Archivo:** `agente_digital_ui/src/services/incidenteService.js`

```javascript
// Agregar estas funciones al archivo existente

// Obtener secciones dinámicas para una empresa
export async function obtenerSeccionesDinamicas(empresaId) {
  try {
    const response = await axios.get(
      `${API_URL}/api/incidente-dinamico/secciones-empresa/${empresaId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error obteniendo secciones dinámicas:', error);
    throw error;
  }
}

// Guardar datos de una sección
export async function guardarSeccionDinamica(incidenteId, seccionId, datos) {
  try {
    const response = await axios.put(
      `${API_URL}/api/incidente-dinamico/${incidenteId}/seccion/${seccionId}`,
      { datos },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error guardando sección:', error);
    throw error;
  }
}

// Cargar incidente completo con sistema dinámico
export async function cargarIncidenteDinamico(incidenteId) {
  try {
    const response = await axios.get(
      `${API_URL}/api/incidente-dinamico/${incidenteId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error cargando incidente dinámico:', error);
    throw error;
  }
}
```

### Paso 3: Crear componente de prueba para verificar el sistema

**Archivo nuevo:** `agente_digital_ui/src/components/PruebaSistemaDinamico.vue`

```vue
<template>
  <div class="prueba-sistema-dinamico p-4">
    <h2 class="text-2xl font-bold mb-4">Prueba del Sistema Dinámico</h2>
    
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
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Información del sistema -->
    <div v-if="secciones.length > 0" class="mb-6">
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <h3 class="font-bold">Información del Sistema Dinámico:</h3>
        <ul class="mt-2">
          <li>Total de secciones: {{ secciones.length }}</li>
          <li>Secciones fijas: {{ seccionesFijas }}</li>
          <li>Secciones de taxonomía: {{ seccionesTaxonomia }}</li>
          <li>Secciones especiales: {{ seccionesEspeciales }}</li>
        </ul>
      </div>
    </div>

    <!-- Lista de secciones -->
    <div v-if="secciones.length > 0" class="space-y-4">
      <h3 class="text-xl font-semibold mb-3">Secciones Disponibles:</h3>
      
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
          </h4>
          <span class="text-sm px-2 py-1 rounded"
                :class="{
                  'bg-blue-200': seccion.tipo === 'FIJA',
                  'bg-green-200': seccion.tipo === 'TAXONOMIA',
                  'bg-purple-200': seccion.tipo === 'ESPECIAL'
                }">
            {{ seccion.tipo }}
          </span>
        </div>
        
        <p class="text-sm text-gray-600 mb-2">{{ seccion.descripcion }}</p>
        
        <div class="text-xs text-gray-500">
          <span class="mr-4">Código: {{ seccion.codigo }}</span>
          <span class="mr-4">Max comentarios: {{ seccion.max_comentarios }}</span>
          <span>Max archivos: {{ seccion.max_archivos }} ({{ seccion.max_size_mb }}MB c/u)</span>
        </div>

        <!-- Mostrar campos si es CSIRT -->
        <div v-if="seccion.codigo === 'SEC_CSIRT'" class="mt-3 p-3 bg-white rounded">
          <h5 class="font-semibold mb-2">Campos CSIRT:</h5>
          <pre class="text-xs bg-gray-100 p-2 rounded overflow-x-auto">{{ formatearCampos(seccion.campos) }}</pre>
        </div>
      </div>
    </div>

    <!-- Botón para verificar base de datos -->
    <div class="mt-6">
      <button @click="verificarBaseDatos" class="btn btn-primary">
        <i class="ph ph-database mr-2"></i>
        Verificar Estado de Base de Datos
      </button>
    </div>
  </div>
</template>

<script>
import { obtenerSeccionesDinamicas } from '@/services/incidenteService';

export default {
  name: 'PruebaSistemaDinamico',
  data() {
    return {
      empresaSeleccionada: '',
      secciones: [],
      cargando: false,
      error: null
    };
  },
  computed: {
    seccionesFijas() {
      return this.secciones.filter(s => s.tipo === 'FIJA').length;
    },
    seccionesTaxonomia() {
      return this.secciones.filter(s => s.tipo === 'TAXONOMIA').length;
    },
    seccionesEspeciales() {
      return this.secciones.filter(s => s.tipo === 'ESPECIAL').length;
    }
  },
  methods: {
    async cargarSecciones() {
      if (!this.empresaSeleccionada) {
        this.secciones = [];
        return;
      }

      this.cargando = true;
      this.error = null;

      try {
        const response = await obtenerSeccionesDinamicas(this.empresaSeleccionada);
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
          this.secciones = response.secciones;
        } else {
          throw new Error(response.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error completo:', error);
        this.error = error.response?.data?.error || error.message || 'Error al cargar secciones';
        this.secciones = [];
      } finally {
        this.cargando = false;
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

    verificarBaseDatos() {
      alert('Ejecute el script SQL: verificar_sistema_dinamico.sql para ver el estado de la base de datos');
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
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
```

### Paso 4: Agregar ruta temporal para probar

**Archivo:** `agente_digital_ui/src/router/index.js`

Agregar esta ruta:

```javascript
{
  path: '/prueba-sistema-dinamico',
  name: 'PruebaSistemaDinamico',
  component: () => import('@/components/PruebaSistemaDinamico.vue'),
  meta: { requiresAuth: true }
}
```

## 📋 Pasos de Implementación

1. **Primero**: Ejecutar el SQL de verificación
   ```bash
   sqlcmd -S servidor -d base_datos -i verificar_sistema_dinamico.sql
   ```

2. **Si no hay datos**: Ejecutar los scripts de creación
   ```bash
   sqlcmd -S servidor -d base_datos -i crear_sistema_dinamico.sql
   sqlcmd -S servidor -d base_datos -i actualizar_sistema_dinamico_csirt.sql
   ```

3. **Backend**: Agregar el registro del blueprint en `app/__init__.py`

4. **Frontend**: 
   - Actualizar `incidenteService.js`
   - Crear `PruebaSistemaDinamico.vue`
   - Agregar la ruta de prueba

5. **Probar**: Navegar a `http://localhost:5173/prueba-sistema-dinamico`

## 🎯 Resultado Esperado

Cuando todo funcione correctamente:
- La página de prueba mostrará las secciones dinámicas
- Empresa tipo OIV: ~20 secciones
- Empresa tipo PSE: ~25 secciones  
- Empresa tipo AMBAS: ~41 secciones
- La sección CSIRT aparecerá con borde rojo

## 🐛 Troubleshooting

**Error: "No se puede conectar al endpoint"**
- Verificar que el blueprint está registrado
- Reiniciar el servidor Flask

**Error: "No hay secciones"**
- Ejecutar los scripts SQL de creación
- Verificar que la tabla ANCI_SECCIONES_CONFIG tiene datos

**Error: "CORS"**
- Verificar que el puerto 5173 está en la lista de CORS en Flask