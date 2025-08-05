# MÓDULO DE DIAGNÓSTICO DE INCIDENTES

## Resumen

El módulo de diagnóstico asegura la integridad de los datos de incidentes para garantizar que puedan ser editados con todos sus archivos originarios. Verifica la coherencia entre la base de datos, archivos físicos y estructuras temporales.

## Características Principales

### 1. Diagnóstico Completo
- **Base de Datos**: Verifica existencia del incidente y sus relaciones
- **Archivos Temporales**: Valida semillas (original y base)
- **Estructura de Carpetas**: Confirma la estructura según especificaciones
- **Evidencias**: Compara registros en BD vs archivos físicos
- **Taxonomías**: Verifica integridad de clasificaciones
- **Formato de Índice**: Valida el formato del índice único

### 2. Compatibilidad con Especificaciones

#### Según `incidente.txt`:
- ✅ Verifica índice único con formato: `CORRELATIVO_RUT_MODULO_SUBMODULO_DESCRIPCION`
- ✅ Valida archivos temporales (semilla original y base)
- ✅ Confirma estructura de carpetas por sección (2.5, 3.4, 4.4, 5.2, 6.4)
- ✅ Multi-tenant: Respeta separación por inquilino/empresa

#### Según `tablas_bd.txt`:
- ✅ Usa campo `IDVisible` para el índice único
- ✅ Verifica tabla `EvidenciasIncidentes` para archivos
- ✅ Valida tabla `INCIDENTE_TAXONOMIA` para clasificaciones
- ✅ Revisa `HistorialIncidentes` para trazabilidad

## Endpoints API

### 1. Diagnóstico Individual
```
GET /api/admin/diagnostico/incidente/{indice_unico}
Authorization: Bearer {token}

Respuesta:
{
  "indice_unico": "1_12345678_1_1_INCIDENTE_NUEVO",
  "timestamp": "2025-01-17T10:30:00",
  "diagnosticos": {
    "bd_principal": {
      "existe": true,
      "incidente_id": 123,
      "titulo": "Incidente de prueba",
      "estado": "abierto"
    },
    "archivos_temporales": {
      "archivo_temporal": true,
      "semilla_original": false,
      "semilla_base": false
    },
    "estructura_carpetas": {
      "carpeta_principal": true,
      "estructura_correcta": true,
      "secciones": [...]
    },
    "evidencias_bd": {
      "total_evidencias": 5,
      "por_seccion": {"2.5": 2, "3.4": 3}
    },
    "archivos_fisicos": {
      "archivos_correctos": 4,
      "archivos_faltantes": ["archivo1.pdf"]
    }
  },
  "problemas": ["Archivo no encontrado: archivo1.pdf"],
  "sugerencias": ["Restaurar archivos faltantes desde backup"],
  "puede_editar": true
}
```

### 2. Reparación Automática
```
POST /api/admin/diagnostico/incidente/{indice_unico}/reparar
Authorization: Bearer {token}

Respuesta:
{
  "reparacion": {
    "carpetas_creadas": [
      "/uploads/evidencias/1_12345678_1_1_INCIDENTE_NUEVO",
      "/uploads/evidencias/1_12345678_1_1_INCIDENTE_NUEVO/2.5"
    ],
    "exito": true
  },
  "diagnostico_previo": {
    "problemas": 3,
    "puede_editar": false
  },
  "diagnostico_posterior": {
    "problemas": 1,
    "puede_editar": true
  }
}
```

### 3. Diagnóstico Masivo
```
GET /api/admin/diagnostico/todos
Authorization: Bearer {token}

Respuesta:
{
  "resumen": {
    "total": 50,
    "sin_problemas": 35,
    "con_problemas": 15,
    "criticos": 3
  },
  "incidentes": [
    {
      "indice_unico": "1_12345678_1_1_INCIDENTE_NUEVO",
      "titulo": "Incidente de prueba",
      "problemas": 0,
      "puede_editar": true
    }
  ]
}
```

## Script Standalone

Para diagnóstico desde línea de comandos:

```bash
python diagnosticar_incidente_script.py [indice_unico]
```

Ejemplo:
```bash
python diagnosticar_incidente_script.py 1_12345678_1_1_INCIDENTE_NUEVO
```

Salida:
```
🔍 DIAGNÓSTICO PARA INCIDENTE: 1_12345678_1_1_INCIDENTE_NUEVO
================================================================================

📊 VERIFICANDO BASE DE DATOS
----------------------------------------
✅ Incidente encontrado en BD
   - ID: 123
   - Título: Incidente de prueba
   - Estado: abierto

🌱 VERIFICANDO ARCHIVOS TEMPORALES
----------------------------------------
✅ Archivo temporal existe
   - Estado: semilla_base
   - Timestamp: 2025-01-17T10:30:00

📎 VERIFICANDO EVIDENCIAS EN BD
----------------------------------------
✅ Estadísticas de evidencias:
   - Total evidencias: 5
   - Secciones distintas: 2

📁 VERIFICANDO ARCHIVOS FÍSICOS
----------------------------------------
✅ Carpeta de evidencias existe
   - 2.5: 2 archivos
   - 3.4: 3 archivos

📊 RESUMEN DIAGNÓSTICO
================================================================================
✅ El incidente está en buen estado y puede ser editado
```

## Problemas Comunes y Soluciones

### 1. Archivo Temporal Faltante
**Problema**: No existe archivo temporal para edición
**Solución**: Se crea automáticamente al abrir para edición

### 2. Carpeta de Evidencias Faltante
**Problema**: No existe estructura de carpetas
**Solución**: Usar endpoint de reparación o crear manualmente

### 3. Archivos Físicos Faltantes
**Problema**: Registros en BD pero archivos no existen
**Solución**: 
- Restaurar desde backup
- Eliminar referencias huérfanas
- Subir archivos nuevamente

### 4. Formato de Índice Incorrecto
**Problema**: El índice no sigue el formato especificado
**Solución**: Regenerar índice al editar (solo si es posible)

## Integración con Edición

El módulo de edición (`incidentes_editar.py`) debe verificar antes de cargar:

```python
# Verificar integridad antes de editar
diagnostico = diagnosticador.diagnosticar_incidente(indice_unico)

if not diagnostico["puede_editar"]:
    # Intentar reparación automática
    reparacion = diagnosticador.reparar_estructura(indice_unico)
    
    if not reparacion["exito"]:
        return error("No se puede editar el incidente")
```

## Seguridad

1. **Autenticación**: Todos los endpoints requieren token JWT
2. **Validación**: No modifica datos, solo diagnostica
3. **Reparación**: Solo crea estructura, no modifica datos existentes
4. **Auditoría**: Registra quién ejecutó diagnóstico/reparación

## Conclusión

Este módulo garantiza que los incidentes mantengan su integridad para poder ser editados con todos sus archivos originarios, cumpliendo con las especificaciones del sistema y asegurando la continuidad del flujo de trabajo.