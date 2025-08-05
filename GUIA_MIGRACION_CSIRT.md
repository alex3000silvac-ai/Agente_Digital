# 📋 Guía de Migración - Integración CSIRT al Sistema Dinámico

## 🎯 Objetivo
Integrar la sección CSIRT (Computer Security Incident Response Team) al sistema dinámico existente para cumplir con los requisitos de la plantilla ANCI.

## 📊 Estado Actual
- ✅ Tablas dinámicas ya existen: `ANCI_SECCIONES_CONFIG`, `INCIDENTES_SECCIONES_DATOS`, etc.
- ❌ Falta sección CSIRT en el formulario
- ❌ Faltan campos ANCI requeridos: estadoActual, reporteAnciId, fechaDeclaracionAnci

## 🚀 Pasos de Implementación

### 1. Ejecutar Script SQL de Actualización

```bash
# Opción 1: Usando sqlcmd (SQL Server)
sqlcmd -S nombre_servidor -d nombre_base_datos -U usuario -P contraseña -i actualizar_sistema_dinamico_csirt.sql

# Opción 2: Usando SQL Server Management Studio
# 1. Abrir SSMS
# 2. Conectarse a la base de datos
# 3. Abrir el archivo actualizar_sistema_dinamico_csirt.sql
# 4. Ejecutar (F5)

# Opción 3: Usando Azure Data Studio
# Similar a SSMS, abrir y ejecutar el archivo
```

**Verificar la ejecución:**
```sql
-- Verificar que la sección CSIRT se agregó
SELECT * FROM ANCI_SECCIONES_CONFIG WHERE CodigoSeccion = 'SEC_CSIRT';

-- Verificar campos actualizados en SEC_1
SELECT CamposJSON FROM ANCI_SECCIONES_CONFIG WHERE CodigoSeccion = 'SEC_1';

-- Ver estadísticas del sistema
SELECT 
    COUNT(*) as TotalSecciones,
    SUM(CASE WHEN TipoSeccion = 'FIJA' THEN 1 ELSE 0 END) as SeccionesFijas,
    SUM(CASE WHEN TipoSeccion = 'ESPECIAL' THEN 1 ELSE 0 END) as SeccionesEspeciales
FROM ANCI_SECCIONES_CONFIG WHERE Activo = 1;
```

### 2. Actualizar Componentes Vue

#### A. Modificar el servicio de incidentes

**Archivo:** `agente_digital_ui/src/services/incidenteService.js`

```javascript
// Agregar método para obtener secciones dinámicas
export async function obtenerSeccionesDinamicas(empresaId) {
  try {
    const response = await axios.get(`${API_URL}/api/incidentes/secciones/${empresaId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo secciones:', error);
    throw error;
  }
}

// Agregar método para guardar datos de sección
export async function guardarSeccionIncidente(incidenteId, seccionId, datos) {
  try {
    const response = await axios.post(
      `${API_URL}/api/incidentes/${incidenteId}/seccion/${seccionId}`,
      { datosJSON: JSON.stringify(datos) }
    );
    return response.data;
  } catch (error) {
    console.error('Error guardando sección:', error);
    throw error;
  }
}
```

#### B. Crear componente dinámico para secciones

**Archivo nuevo:** `agente_digital_ui/src/components/SeccionDinamica.vue`

```vue
<template>
  <div class="seccion-dinamica">
    <div v-for="campo in campos" :key="campo.nombre" class="mb-3">
      <!-- Campo de texto -->
      <div v-if="campo.tipo === 'text'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <input
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          type="text"
          class="form-control"
          :placeholder="campo.placeholder"
          :required="campo.requerido"
          :readonly="campo.soloLectura"
          :disabled="!cumpleCondicional(campo)"
        />
      </div>

      <!-- Campo checkbox -->
      <div v-else-if="campo.tipo === 'checkbox'" class="form-check">
        <input
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          type="checkbox"
          class="form-check-input"
          :disabled="!cumpleCondicional(campo)"
        />
        <label :for="campo.nombre" class="form-check-label">
          {{ campo.etiqueta }}
        </label>
      </div>

      <!-- Campo select -->
      <div v-else-if="campo.tipo === 'select'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <select
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          class="form-select"
          :required="campo.requerido && cumpleCondicional(campo)"
          :disabled="!cumpleCondicional(campo)"
        >
          <option value="">Seleccione...</option>
          <option v-for="opcion in campo.opciones" :key="opcion" :value="opcion">
            {{ opcion }}
          </option>
        </select>
      </div>

      <!-- Campo textarea -->
      <div v-else-if="campo.tipo === 'textarea'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <textarea
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          class="form-control"
          :rows="campo.filas || 3"
          :placeholder="campo.placeholder"
          :required="campo.requerido && cumpleCondicional(campo)"
          :disabled="!cumpleCondicional(campo)"
        ></textarea>
      </div>

      <!-- Campo datetime-local -->
      <div v-else-if="campo.tipo === 'datetime-local'" class="form-group">
        <label :for="campo.nombre" class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <input
          :id="campo.nombre"
          v-model="valores[campo.nombre]"
          type="datetime-local"
          class="form-control"
          :required="campo.requerido"
          :readonly="campo.soloLectura"
          :disabled="!cumpleCondicional(campo)"
        />
      </div>

      <!-- Campo radio -->
      <div v-else-if="campo.tipo === 'radio'" class="form-group">
        <label class="form-label">
          {{ campo.etiqueta }}
          <span v-if="campo.requerido" class="text-danger">*</span>
        </label>
        <div v-for="opcion in campo.opciones" :key="opcion" class="form-check">
          <input
            :id="`${campo.nombre}_${opcion}`"
            v-model="valores[campo.nombre]"
            type="radio"
            class="form-check-input"
            :value="opcion"
            :disabled="!cumpleCondicional(campo)"
          />
          <label :for="`${campo.nombre}_${opcion}`" class="form-check-label">
            {{ opcion }}
          </label>
        </div>
      </div>
    </div>

    <!-- Información adicional (para CSIRT) -->
    <div v-if="informacionContacto" class="alert alert-info mt-4">
      <h6 class="alert-heading">
        <i class="fas fa-info-circle"></i> {{ informacionContacto.titulo }}
      </h6>
      <div class="small">
        <p class="mb-1"><strong>Teléfono:</strong> {{ informacionContacto.telefono }}</p>
        <p class="mb-1"><strong>Email:</strong> {{ informacionContacto.email }}</p>
        <p class="mb-1"><strong>Web:</strong> {{ informacionContacto.web }}</p>
        <p class="mb-0"><strong>Horario:</strong> {{ informacionContacto.horario }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeccionDinamica',
  props: {
    configuracion: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valores: {}
    };
  },
  computed: {
    campos() {
      try {
        const config = JSON.parse(this.configuracion.CamposJSON || '{}');
        return config.campos || [];
      } catch (e) {
        console.error('Error parseando campos:', e);
        return [];
      }
    },
    informacionContacto() {
      try {
        const config = JSON.parse(this.configuracion.CamposJSON || '{}');
        return config.informacionContacto || null;
      } catch (e) {
        return null;
      }
    }
  },
  watch: {
    valores: {
      handler(newVal) {
        this.$emit('update:modelValue', newVal);
      },
      deep: true
    },
    modelValue: {
      handler(newVal) {
        this.valores = { ...newVal };
      },
      immediate: true
    }
  },
  methods: {
    cumpleCondicional(campo) {
      if (!campo.condicional) return true;
      return !!this.valores[campo.condicional];
    }
  }
};
</script>

<style scoped>
.seccion-dinamica {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>
```

#### C. Actualizar CuadernoAnalista.vue

**Archivo:** `agente_digital_ui/src/components/CuadernoAnalista.vue`

Agregar al template (después de las secciones fijas existentes):

```vue
<!-- Secciones Dinámicas (incluye CSIRT) -->
<div v-for="seccion in seccionesDinamicas" :key="seccion.SeccionID" class="accordion-item">
  <h2 class="accordion-header" :id="`heading-${seccion.CodigoSeccion}`">
    <button 
      class="accordion-button collapsed" 
      type="button" 
      data-bs-toggle="collapse" 
      :data-bs-target="`#collapse-${seccion.CodigoSeccion}`"
      :class="{ 'text-success': tieneDatos(seccion) }">
      <i :class="`fas fa-${seccion.IconoSeccion || 'folder'} me-2`"></i>
      {{ seccion.Titulo }}
      <span v-if="seccion.CodigoSeccion === 'SEC_CSIRT' && datosSeccion[seccion.SeccionID]?.solicitarAyudaCSIRT" 
            class="badge bg-danger ms-2">
        Ayuda Solicitada
      </span>
    </button>
  </h2>
  <div 
    :id="`collapse-${seccion.CodigoSeccion}`" 
    class="accordion-collapse collapse" 
    data-bs-parent="#accordionIncidente">
    <div class="accordion-body">
      <SeccionDinamica 
        :configuracion="seccion"
        v-model="datosSeccion[seccion.SeccionID]"
        @update:modelValue="actualizarSeccion(seccion.SeccionID, $event)"
      />
      
      <!-- Sección de comentarios -->
      <div class="mt-4">
        <h6>Comentarios ({{ comentarios[seccion.SeccionID]?.length || 0 }}/{{ seccion.MaxComentarios }})</h6>
        <!-- Aquí va la lógica de comentarios -->
      </div>
      
      <!-- Sección de archivos -->
      <div class="mt-4">
        <h6>Archivos adjuntos ({{ archivos[seccion.SeccionID]?.length || 0 }}/{{ seccion.MaxArchivos }})</h6>
        <!-- Aquí va la lógica de archivos -->
      </div>
    </div>
  </div>
</div>
```

Actualizar el script:

```javascript
import SeccionDinamica from './SeccionDinamica.vue';
import { obtenerSeccionesDinamicas, guardarSeccionIncidente } from '@/services/incidenteService';

export default {
  components: {
    // ... otros componentes
    SeccionDinamica
  },
  data() {
    return {
      // ... datos existentes
      seccionesDinamicas: [],
      datosSeccion: {},
      comentarios: {},
      archivos: {}
    };
  },
  async mounted() {
    // Cargar secciones dinámicas para la empresa
    await this.cargarSeccionesDinamicas();
  },
  methods: {
    async cargarSeccionesDinamicas() {
      try {
        const empresaId = this.$route.params.empresaId;
        this.seccionesDinamicas = await obtenerSeccionesDinamicas(empresaId);
        
        // Inicializar datos para cada sección
        this.seccionesDinamicas.forEach(seccion => {
          this.$set(this.datosSeccion, seccion.SeccionID, {});
        });
      } catch (error) {
        console.error('Error cargando secciones:', error);
      }
    },
    
    actualizarSeccion(seccionId, datos) {
      this.$set(this.datosSeccion, seccionId, datos);
    },
    
    tieneDatos(seccion) {
      const datos = this.datosSeccion[seccion.SeccionID];
      return datos && Object.keys(datos).some(key => datos[key]);
    },
    
    async guardarIncidente() {
      try {
        // ... código existente para guardar datos básicos
        
        // Guardar datos de cada sección dinámica
        for (const seccion of this.seccionesDinamicas) {
          const datos = this.datosSeccion[seccion.SeccionID];
          if (datos && Object.keys(datos).length > 0) {
            await guardarSeccionIncidente(this.incidenteId, seccion.SeccionID, datos);
          }
        }
        
        // ... resto del código
      } catch (error) {
        console.error('Error guardando incidente:', error);
      }
    }
  }
};
```

### 3. Actualizar el Backend (Flask)

#### A. Crear endpoint para secciones dinámicas

**Archivo:** `agente_digital_api/app/views/incidente_views.py`

```python
@incidente_bp.route('/api/incidentes/secciones/<int:empresa_id>', methods=['GET'])
@verificar_token
def obtener_secciones_empresa(empresa_id):
    """Obtiene las secciones dinámicas aplicables a una empresa"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Obtener tipo de empresa
            cursor.execute("""
                SELECT Tipo_Empresa FROM Empresas WHERE EmpresaID = ?
            """, (empresa_id,))
            
            result = cursor.fetchone()
            if not result:
                return jsonify({'error': 'Empresa no encontrada'}), 404
                
            tipo_empresa = result[0]
            
            # Obtener secciones aplicables
            query = """
                SELECT 
                    SeccionID,
                    CodigoSeccion,
                    TipoSeccion,
                    NumeroOrden,
                    Titulo,
                    Descripcion,
                    CamposJSON,
                    IconoSeccion,
                    MaxComentarios,
                    MaxArchivos,
                    EsRequerida
                FROM ANCI_SECCIONES_CONFIG
                WHERE Activo = 1
                AND (
                    TipoSeccion = 'FIJA' OR
                    TipoSeccion = 'ESPECIAL' OR
                    (TipoSeccion = 'TAXONOMIA' AND 
                     ((AplicaOIV = 1 AND ? = 'OIV') OR
                      (AplicaPSE = 1 AND ? = 'PSE') OR
                      (AplicaAMBAS = 1 AND ? = 'AMBAS')))
                )
                ORDER BY NumeroOrden
            """
            
            cursor.execute(query, (tipo_empresa, tipo_empresa, tipo_empresa))
            
            columns = [column[0] for column in cursor.description]
            secciones = []
            
            for row in cursor.fetchall():
                seccion = dict(zip(columns, row))
                secciones.append(seccion)
                
            return jsonify(secciones), 200
            
    except Exception as e:
        logger.error(f"Error obteniendo secciones: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@incidente_bp.route('/api/incidentes/<int:incidente_id>/seccion/<int:seccion_id>', methods=['POST'])
@verificar_token
def guardar_seccion_incidente(incidente_id, seccion_id):
    """Guarda o actualiza datos de una sección específica"""
    try:
        datos_json = request.json.get('datosJSON', '{}')
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Verificar si ya existe
            cursor.execute("""
                SELECT DatoID FROM INCIDENTES_SECCIONES_DATOS
                WHERE IncidenteID = ? AND SeccionID = ?
            """, (incidente_id, seccion_id))
            
            existe = cursor.fetchone()
            
            if existe:
                # Actualizar
                cursor.execute("""
                    UPDATE INCIDENTES_SECCIONES_DATOS
                    SET DatosJSON = ?,
                        FechaActualizacion = GETDATE(),
                        ActualizadoPor = ?
                    WHERE IncidenteID = ? AND SeccionID = ?
                """, (datos_json, session.get('usuario'), incidente_id, seccion_id))
            else:
                # Insertar
                cursor.execute("""
                    INSERT INTO INCIDENTES_SECCIONES_DATOS
                    (IncidenteID, SeccionID, DatosJSON, ActualizadoPor)
                    VALUES (?, ?, ?, ?)
                """, (incidente_id, seccion_id, datos_json, session.get('usuario')))
                
            conn.commit()
            
            # Registrar en auditoría
            cursor.execute("""
                INSERT INTO INCIDENTES_AUDITORIA
                (IncidenteID, SeccionID, TipoAccion, Usuario, FechaAccion)
                VALUES (?, ?, 'ACTUALIZAR_SECCION', ?, GETDATE())
            """, (incidente_id, seccion_id, session.get('usuario')))
            
            conn.commit()
            
            return jsonify({'mensaje': 'Sección guardada exitosamente'}), 200
            
    except Exception as e:
        logger.error(f"Error guardando sección: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500
```

### 4. Pruebas y Validación

#### A. Verificar secciones en la base de datos

```sql
-- Ver todas las secciones activas
SELECT 
    SeccionID,
    CodigoSeccion,
    TipoSeccion,
    Titulo,
    CASE 
        WHEN CodigoSeccion = 'SEC_CSIRT' THEN '🚨 NUEVA'
        ELSE '✓'
    END as Estado
FROM ANCI_SECCIONES_CONFIG
WHERE Activo = 1
ORDER BY NumeroOrden;

-- Verificar campos CSIRT
SELECT 
    JSON_VALUE(CamposJSON, '$.campos[0].nombre') as PrimerCampo,
    JSON_VALUE(CamposJSON, '$.campos[0].etiqueta') as Etiqueta
FROM ANCI_SECCIONES_CONFIG
WHERE CodigoSeccion = 'SEC_CSIRT';
```

#### B. Probar en el navegador

1. Navegar a: `http://localhost:5173/empresa/3/incidentes/declarar`
2. Verificar que aparezcan:
   - Las 6 secciones fijas
   - La sección CSIRT (con shield icon)
   - Las secciones de taxonomía según el tipo de empresa

3. Probar la sección CSIRT:
   - Activar el checkbox "Solicitar asistencia del CSIRT Nacional"
   - Verificar que se habiliten los campos condicionales
   - Llenar todos los campos
   - Guardar y verificar en la base de datos

### 5. Verificación Final

```sql
-- Ver datos guardados de CSIRT para un incidente
SELECT 
    i.IncidenteID,
    i.Titulo,
    sd.DatosJSON
FROM Incidentes i
LEFT JOIN INCIDENTES_SECCIONES_DATOS sd ON i.IncidenteID = sd.IncidenteID
LEFT JOIN ANCI_SECCIONES_CONFIG sc ON sd.SeccionID = sc.SeccionID
WHERE sc.CodigoSeccion = 'SEC_CSIRT'
AND i.IncidenteID = [ID_DE_PRUEBA];
```

## 📋 Checklist de Implementación

- [ ] Ejecutar script SQL `actualizar_sistema_dinamico_csirt.sql`
- [ ] Verificar que la sección CSIRT se creó en la BD
- [ ] Crear componente `SeccionDinamica.vue`
- [ ] Actualizar `CuadernoAnalista.vue`
- [ ] Actualizar servicio `incidenteService.js`
- [ ] Actualizar backend con nuevos endpoints
- [ ] Probar creación de incidente con CSIRT
- [ ] Verificar datos en la base de datos
- [ ] Validar que todos los campos ANCI están presentes

## 🎯 Resultado Esperado

Al completar esta migración:
1. ✅ El formulario mostrará dinámicamente todas las secciones según el tipo de empresa
2. ✅ La sección CSIRT estará disponible con todos sus campos
3. ✅ Los campos faltantes de ANCI (estado, reporte ID, fecha declaración) estarán presentes
4. ✅ El sistema será completamente dinámico y adaptable a futuros cambios

## 🆘 Troubleshooting

**Problema:** La sección CSIRT no aparece
- Verificar que el script SQL se ejecutó correctamente
- Revisar que `Activo = 1` en la tabla `ANCI_SECCIONES_CONFIG`

**Problema:** Los campos no se guardan
- Verificar permisos en la base de datos
- Revisar logs del servidor Flask
- Verificar que el JSON sea válido

**Problema:** Error al cargar secciones dinámicas
- Verificar que el endpoint está registrado en Flask
- Revisar CORS si hay errores de origen cruzado
- Verificar el token de autenticación