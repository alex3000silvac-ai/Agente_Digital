# Documentación de Módulos de Incidentes

## Descripción General

Se han creado dos módulos exclusivos para el manejo de incidentes siguiendo las especificaciones del archivo `incidente.txt`:

1. **incidentes_crear.py**: Módulo exclusivo para la creación de incidentes
2. **incidentes_editar.py**: Módulo exclusivo para la edición de incidentes

## Características Implementadas

### 1. Índice Único
- Formato: `CORRELATIVO_RUT_MODULO_SUBMODULO_DESCRIPCION`
- Este índice acompaña toda la vida del incidente
- Se usa como referencia única para todas las operaciones

### 2. Sistema de Archivos Temporales
- **Semilla Original**: Archivo temporal creado al crear un incidente por primera vez
- **Semilla Base**: Estado del archivo cuando se graba y se vuelve a abrir
- Los archivos temporales se mantienen mientras se edita el incidente

### 3. Estructura de Evidencias
- Sistema jerárquico de numeración (ej: 2.5.1, 2.5.2 para múltiples archivos)
- Las evidencias se guardan en carpetas separadas por seguridad
- Cada evidencia incluye: número, archivo, descripción y fecha de carga

### 4. Taxonomías
- Se filtran según el tipo de empresa (OIV, PSE o AMBAS)
- Cada taxonomía seleccionada requiere justificación
- Pueden seleccionarse múltiples taxonomías

## Endpoints Disponibles

### Módulo de Creación

1. **POST /api/incidentes/crear**
   - Crea un nuevo incidente
   - Genera índice único automáticamente
   - Crea archivo temporal (semilla original)

2. **GET /api/incidentes/taxonomias**
   - Obtiene taxonomías disponibles según tipo de empresa
   - Parámetro: `tipo_empresa` (OIV/PSE/AMBAS)

3. **POST /api/incidentes/borrador**
   - Guarda borrador en archivo temporal
   - Actualiza estado a semilla base

4. **POST /api/incidentes/evidencia**
   - Carga evidencias para una sección específica
   - Maneja numeración jerárquica automática

### Módulo de Edición

1. **GET /api/incidentes/editar/obtener**
   - Carga incidente usando índice único
   - Crea o carga archivo temporal

2. **PUT /api/incidentes/editar/actualizar**
   - Actualiza incidente existente
   - Mantiene histórico en archivo temporal

3. **DELETE /api/incidentes/editar/eliminar-evidencia**
   - Elimina evidencia específica
   - Elimina archivo físico y registro en BD

4. **GET /api/incidentes/editar/resumen-evidencias**
   - Obtiene resumen de todas las evidencias
   - Formato según especificación (sección 7)

5. **POST /api/incidentes/editar/revertir**
   - Revierte cambios al estado original
   - Elimina archivo temporal

## Campos Requeridos por Sección

### 1. Identificación General
- tipo_registro *
- titulo_incidente *
- fecha_deteccion *
- fecha_ocurrencia *
- criticidad *
- alcance_geografico

### 2. Descripción y Alcance
- descripcion_detallada *
- impacto_preliminar *
- sistemas_afectados *
- servicios_interrumpidos *
- evidencias (opcional)

### 3. Análisis Preliminar
- tipo_amenaza *
- origen_ataque *
- responsable_cliente
- evidencias (opcional)

### 4. Clasificación de Taxonomías
- Selección de taxonomías (requerido para OIV/PSE)
- porque_seleccionada * (por cada taxonomía)
- observaciones_adicionales
- evidencias (opcional)

### 5. Acciones Inmediatas
- medidas_contencion * (requerido para OIV/PSE)
- evidencias

### 6. Análisis de Causa Raíz
- analisis_causa_raiz * (OIV/PSE)
- lecciones_aprendidas
- recomendaciones_mejora
- evidencias

## Ejemplo de Uso

### Crear Incidente
```javascript
const datos = {
    inquilino_id: 1,
    empresa_id: 3,
    tipo_registro: "Incidente de Seguridad",
    titulo_incidente: "Ataque DDoS detectado",
    fecha_deteccion: "2025-01-17T10:30:00",
    fecha_ocurrencia: "2025-01-17T10:00:00",
    criticidad: "Alta",
    descripcion_detallada: "Se detectó un ataque DDoS...",
    impacto_preliminar: "Servicios web no disponibles",
    sistemas_afectados: "Servidor web principal",
    servicios_interrumpidos: "Portal web - 30 minutos",
    tipo_amenaza: "DDoS",
    origen_ataque: "IPs externas múltiples",
    medidas_contencion: "Activación de mitigación DDoS",
    taxonomias: [
        {
            id: 5,
            porque_seleccionada: "Ataque de denegación de servicio",
            observaciones: "Patrón típico de botnet"
        }
    ]
};

fetch('/api/incidentes/crear', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(datos)
});
```

### Editar Incidente
```javascript
// Primero obtener el incidente
fetch('/api/incidentes/editar/obtener?indice_unico=1_12345678_1_1_INCIDENTE_NUEVO', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});

// Luego actualizar
const actualizacion = {
    indice_unico: "1_12345678_1_1_INCIDENTE_NUEVO",
    estado: "resuelto",
    analisis_causa_raiz: "Vulnerabilidad en firewall",
    lecciones_aprendidas: "Necesidad de actualizar reglas",
    recomendaciones_mejora: "Implementar rate limiting"
};

fetch('/api/incidentes/editar/actualizar', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(actualizacion)
});
```

## Seguridad

1. **Autenticación**: Todos los endpoints requieren token JWT
2. **Carpetas Separadas**: Evidencias se guardan en carpetas seguras
3. **Validación**: Campos requeridos se validan antes de guardar
4. **Transacciones**: Operaciones de BD usan transacciones para integridad

## Notas Importantes

1. El sistema es multi-tenant (soporta múltiples inquilinos)
2. Los archivos temporales permiten recuperar trabajo no guardado
3. Las evidencias nunca se eliminan al editar, solo se pueden agregar nuevas
4. El índice único es inmutable una vez creado