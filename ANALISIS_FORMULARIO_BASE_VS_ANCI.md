# Análisis: Formulario Base (Semilla) vs Reporte ANCI

## Fecha: 2025-07-17

### RELACIÓN ENTRE PROCESOS

El **formulario base (semilla)** sirve como **materia prima** para generar el **reporte ANCI**. Ambos procesos están íntimamente relacionados:

#### FORMULARIO BASE → REPORTE ANCI
```
SEMILLA/INCIDENTE BASE
    ↓
DATOS ESTRUCTURADOS
    ↓
REPORTE ANCI AUTOMÁTICO
    ↓
ENVÍO A AUTORIDADES
```

### MAPEO DE CAMPOS CRÍTICOS

#### SECCIÓN 1: IDENTIFICACIÓN
| Campo Formulario Base | Campo ANCI | Uso en Reporte |
|----------------------|------------|-----------------|
| Tipo de registro | Tipo de Incidente | Clasificación inicial |
| Título del incidente | Descripción breve | Encabezado del reporte |
| Fecha detección | Fecha detección | Campo obligatorio ANCI |
| Fecha ocurrencia | Fecha ocurrencia | Campo obligatorio ANCI |
| Criticidad | Nivel de criticidad | Priorización del caso |
| Alcance geográfico | Alcance del incidente | Evaluación de impacto |

#### SECCIÓN 4: TAXONOMÍAS
**CRÍTICO**: Las taxonomías seleccionadas determinan:
- Tipo de reporte ANCI requerido
- Campos específicos a completar
- Plazos de envío (2h, 12h, 72h)
- Autoridades competentes

### FLUJO DE ARCHIVOS/EVIDENCIAS

```
EVIDENCIAS EN FORMULARIO BASE
    ↓
Se adjuntan por sección:
- Sección 2: Evidencias de alcance
- Sección 3: Evidencias de análisis
- Sección 4: Evidencias por taxonomía
- Sección 5: Evidencias de acciones
- Sección 6: Evidencias de análisis final
    ↓
MIGRAN AUTOMÁTICAMENTE AL REPORTE ANCI
    ↓
Se organizan según requisitos ANCI
```

### CORRECCIONES IMPLEMENTADAS

#### 1. **Tipo de Registro** - Alineado con propósito ANCI:
- ✅ "Para análisis interno" → No requiere reporte ANCI inmediato
- ✅ "Para Auditoría" → Requiere documentación completa
- ✅ "Registro General" → Seguimiento estándar

#### 2. **Criticidad** - Según escalas ANCI:
- ✅ "Baja" → Reporte en 72 horas
- ✅ "Media" → Reporte en 24 horas  
- ✅ "Alta" → Reporte en 2-12 horas

#### 3. **Alcance Geográfico** - Impacto territorial:
- ✅ "Local" → Empresa/sucursal específica
- ✅ "País" → Nacional
- ✅ "Regional" → Múltiples países
- ✅ "Global" → Impacto mundial

### ESTRUCTURA DE COPIA PARA EDICIÓN

Cuando se edita un incidente existente:

```javascript
// Debe traer TODA la información del incidente base
const incidenteBase = {
  // Datos generales
  identificacion: { ... },
  descripcion: { ... },
  analisisPreliminar: { ... },
  
  // Taxonomías con sus campos específicos
  taxonomiasSeleccionadas: [
    {
      id: "INC_USO_UNRI_ACNA",
      justificacion: "Texto guardado previamente",
      descripcionProblema: "Detalles específicos",
      archivos: [...]
    }
  ],
  
  // Archivos por sección
  archivosPorSeccion: {
    seccion2: [...],
    seccion3: [...],
    taxonomias: {...}
  }
}
```

### RECOMENDACIONES DE IMPLEMENTACIÓN

1. **Versionado**: Cada cambio debe crear una nueva versión manteniendo el historial
2. **Sincronización**: Los cambios en la semilla deben reflejarse en reportes ANCI pendientes
3. **Validación**: Antes de generar reporte ANCI, validar completitud de campos obligatorios
4. **Trazabilidad**: Mantener relación entre incidente base y todos sus reportes ANCI

### CAMPOS OBLIGATORIOS PARA REPORTE ANCI

Basándose en la información de `anci.txt`:

#### NIVEL 2 (Significativo) - 12 horas:
- Identificación completa
- Al menos una taxonomía seleccionada con justificación
- Descripción detallada del incidente
- Impacto preliminar

#### NIVEL 3 (Crítico) - 2 horas:
- Todos los campos de Nivel 2 +
- Medidas de contención inmediatas
- Evaluación de riesgo para seguridad pública
- Contacto de emergencia activo

### INTEGRACIÓN CON SISTEMA ANCI

El formulario base debe:
1. **Guardar automáticamente** cada cambio
2. **Permitir edición continua** hasta marcar como "Completado"
3. **Generar automáticamente** el formato ANCI cuando se solicite
4. **Mantener sincronización** entre ambos formularios
5. **Preservar evidencias** en estructura compatible con ANCI

---

**Este análisis asegura que el formulario base sea la fuente única de verdad para todos los reportes ANCI generados.**