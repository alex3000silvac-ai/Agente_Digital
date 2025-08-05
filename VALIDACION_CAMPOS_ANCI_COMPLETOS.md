# 🔍 VALIDACIÓN COMPLETA DE CAMPOS ANCI - ANÁLISIS Y CORRECCIONES

## 📋 **CAMPOS ENCONTRADOS EN ReportesANCI vs IMPLEMENTACIÓN**

### ✅ **CAMPOS IMPLEMENTADOS CORRECTAMENTE**

#### **Sección 1: Identificación General**
- ✅ `titulo` → `Titulo` (tabla Incidentes)
- ✅ `tipoFlujo` → `TipoFlujo` (tabla Incidentes)
- ✅ `fechaDeteccion` → `FechaDeteccion` (tabla Incidentes)
- ✅ `fechaOcurrencia` → `FechaOcurrencia` (tabla Incidentes)
- ✅ `criticidad` → `Criticidad` (tabla Incidentes)
- ✅ `alcanceGeografico` → `AlcanceGeografico` (tabla Incidentes)
- ✅ `estadoActual` → `EstadoActual` (tabla Incidentes)

#### **Sección 2: Descripción y Alcance**
- ✅ `descripcionInicial` → `DescripcionInicial` (tabla Incidentes)
- ✅ `sistemasAfectados` → `SistemasAfectados` (tabla Incidentes)
- ✅ `serviciosInterrumpidos` → `ServiciosInterrumpidos` (tabla Incidentes)

#### **Sección 3: Análisis Preliminar**
- ✅ `tipoAmenaza` → `AnciTipoAmenaza` (tabla Incidentes)
- ✅ `origenIncidente` → `OrigenIncidente` (tabla Incidentes)
- ✅ `responsableCliente` → `ResponsableCliente` (tabla Incidentes)

#### **Sección 5: Acciones Inmediatas**
- ✅ `accionesInmediatas` → `AccionesInmediatas` (tabla Incidentes)

#### **Sección 6: Análisis de Causa Raíz**
- ✅ `causaRaiz` → `CausaRaiz` (tabla Incidentes)
- ✅ `leccionesAprendidas` → `LeccionesAprendidas` (tabla Incidentes)
- ✅ `planMejora` → `PlanMejora` (tabla Incidentes)

### ❌ **CAMPOS FALTANTES CRÍTICOS**

#### **Campos de Reportante (ReportesANCI)**
- ❌ `AnciNombreReportante` - **FALTA IMPLEMENTAR**
- ❌ `AnciCargoReportante` - **FALTA IMPLEMENTAR**
- ❌ `AnciCorreoReportante` - **FALTA IMPLEMENTAR**
- ❌ `AnciTelefonoReportante` - **FALTA IMPLEMENTAR**
- ❌ `AnciFormacionCertificacion` - **FALTA IMPLEMENTAR**

#### **Campos de Análisis Avanzado (ReportesANCI)**
- ❌ `AnciFechaAlertaTemprana` - **FALTA IMPLEMENTAR**
- ❌ `AnciImpactoPreliminar` - **FALTA IMPLEMENTAR**
- ❌ `AnciEvolucionIncidente` - **FALTA IMPLEMENTAR**
- ❌ `AnciMedidasContencion` - **FALTA IMPLEMENTAR**
- ❌ `AnciPlanAccion` - **FALTA IMPLEMENTAR**
- ❌ `AnciResumenEjecutivo` - **FALTA IMPLEMENTAR**

#### **Campos de Indicadores de Compromiso (ReportesANCI)**
- ❌ `AnciIoCIPs` - **FALTA IMPLEMENTAR**
- ❌ `AnciIoCDominios` - **FALTA IMPLEMENTAR**
- ❌ `AnciIoCHashes` - **FALTA IMPLEMENTAR**

#### **Campos de Impacto Detallado (ReportesANCI)**
- ❌ `AnciSistemasAfectadosDetalle` - **FALTA IMPLEMENTAR**
- ❌ `AnciImpactoContinuidadDatos` - **FALTA IMPLEMENTAR**
- ❌ `AnciAfectacionTerceros` - **FALTA IMPLEMENTAR**
- ❌ `AnciNumeroAfectados` - **FALTA IMPLEMENTAR**

#### **Campos de Acciones y Notificaciones (ReportesANCI)**
- ❌ `AnciAccionesContencion` - **FALTA IMPLEMENTAR**
- ❌ `AnciSistemasDesconectados` - **FALTA IMPLEMENTAR**
- ❌ `AnciNotificacionesInternas` - **FALTA IMPLEMENTAR**
- ❌ `AnciEstadoActualIncidente` - **FALTA IMPLEMENTAR**

#### **Campos Específicos OIV (ReportesANCI)**
- ❌ `AnciOIVCuentaConSGSI` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVDetallePlanContinuidad` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVActivoPlanRecuperacion` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVAuditoriasRealizadas` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVFechaUltimaAuditoria` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVDelegadoTecnico` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVMedidasPropagacion` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVNotificacionAfectados` - **FALTA IMPLEMENTAR**
- ❌ `AnciOIVRegistroCapacitaciones` - **FALTA IMPLEMENTAR**

#### **Campos de Contacto de Seguimiento (ReportesANCI)**
- ❌ `AnciContactoSeguimientoNombre` - **FALTA IMPLEMENTAR**
- ❌ `AnciContactoSeguimientoHorario` - **FALTA IMPLEMENTAR**
- ❌ `AnciContactoSeguimientoCorreo` - **FALTA IMPLEMENTAR**
- ❌ `AnciContactoSeguimientoTelefono` - **FALTA IMPLEMENTAR**

#### **Campos de Taxonomía y Clasificación**
- ❌ `AnciTipoIncidenteTaxonomia` - **FALTA IMPLEMENTAR**

### ✅ **SECCIÓN CSIRT - IMPLEMENTADA**
- ✅ `solicitarAyudaCSIRT` - **IMPLEMENTADA**
- ✅ `fechaSolicitudCSIRT` - **IMPLEMENTADA**
- ✅ `tipoAyudaCSIRT` - **IMPLEMENTADA**
- ✅ `descripcionAyudaCSIRT` - **IMPLEMENTADA**
- ✅ `urgenciaCSIRT` - **IMPLEMENTADA**
- ✅ `contactoCSIRT` - **IMPLEMENTADA**
- ✅ `estadoSolicitudCSIRT` - **IMPLEMENTADA**
- ✅ `respuestaCSIRT` - **IMPLEMENTADA**
- ✅ `numeroTicketCSIRT` - **IMPLEMENTADA**

## 🔧 **PROPUESTA DE CORRECCIÓN COMPLETA**

### **1. Actualizar ANCI_FORMULARIO_CONFIG con Campos Faltantes**

```sql
-- Actualizar Sección 1 - Agregar campos de reportante
UPDATE ANCI_FORMULARIO_CONFIG
SET CamposJSON = '{
  "campos": [
    {"nombre": "titulo", "tipo": "text", "etiqueta": "Título del Incidente", "requerido": true},
    {"nombre": "tipoFlujo", "tipo": "select", "etiqueta": "Tipo de Registro", "opciones": ["Informativo", "Interno"], "requerido": true},
    {"nombre": "fechaDeteccion", "tipo": "datetime-local", "etiqueta": "Fecha y Hora de Detección", "requerido": true},
    {"nombre": "fechaOcurrencia", "tipo": "datetime-local", "etiqueta": "Fecha y Hora de Ocurrencia", "requerido": false},
    {"nombre": "criticidad", "tipo": "select", "etiqueta": "Criticidad", "opciones": ["Baja", "Media", "Alta", "Crítica"], "requerido": true},
    {"nombre": "alcanceGeografico", "tipo": "select", "etiqueta": "Alcance Geográfico", "opciones": ["Local", "Regional", "Nacional", "Internacional"], "requerido": false},
    {"nombre": "fechaAlertaTemprana", "tipo": "datetime-local", "etiqueta": "Fecha Alerta Temprana ANCI", "requerido": false},
    {"nombre": "nombreReportante", "tipo": "text", "etiqueta": "Nombre del Reportante", "requerido": true},
    {"nombre": "cargoReportante", "tipo": "text", "etiqueta": "Cargo del Reportante", "requerido": true},
    {"nombre": "correoReportante", "tipo": "email", "etiqueta": "Correo del Reportante", "requerido": true},
    {"nombre": "telefonoReportante", "tipo": "tel", "etiqueta": "Teléfono del Reportante", "requerido": true},
    {"nombre": "formacionCertificacion", "tipo": "textarea", "etiqueta": "Formación y Certificaciones en Ciberseguridad", "requerido": false}
  ]
}'
WHERE CodigoSeccion = 'SEC_1';

-- Actualizar Sección 2 - Agregar campos de impacto detallado
UPDATE ANCI_FORMULARIO_CONFIG
SET CamposJSON = '{
  "campos": [
    {"nombre": "descripcionInicial", "tipo": "textarea", "etiqueta": "Descripción Inicial Detallada", "requerido": true, "filas": 4},
    {"nombre": "impactoPreliminar", "tipo": "textarea", "etiqueta": "Impacto Preliminar Observado", "requerido": true, "filas": 4},
    {"nombre": "sistemasAfectados", "tipo": "textarea", "etiqueta": "Sistemas, Activos o Personal Afectado", "requerido": true, "filas": 4},
    {"nombre": "serviciosInterrumpidos", "tipo": "textarea", "etiqueta": "Servicios Interrumpidos y Duración", "requerido": false, "filas": 3},
    {"nombre": "sistemasAfectadosDetalle", "tipo": "textarea", "etiqueta": "Detalle Específico de Sistemas Afectados", "requerido": false, "filas": 4},
    {"nombre": "impactoContinuidadDatos", "tipo": "textarea", "etiqueta": "Impacto en Continuidad de Datos", "requerido": false, "filas": 3},
    {"nombre": "afectacionTerceros", "tipo": "checkbox", "etiqueta": "¿Hubo afectación a terceros?", "requerido": false},
    {"nombre": "numeroAfectados", "tipo": "number", "etiqueta": "Número de Personas Afectadas", "requerido": false, "min": 0},
    {"nombre": "resumenEjecutivo", "tipo": "textarea", "etiqueta": "Resumen Ejecutivo del Incidente", "requerido": false, "filas": 5}
  ]
}'
WHERE CodigoSeccion = 'SEC_2';

-- Actualizar Sección 3 - Agregar indicadores de compromiso
UPDATE ANCI_FORMULARIO_CONFIG
SET CamposJSON = '{
  "campos": [
    {"nombre": "tipoAmenaza", "tipo": "select", "etiqueta": "Tipo de Amenaza Probable", "opciones": ["Malware", "Phishing", "DDoS", "Intrusión", "Fuga de datos", "Insider threat", "Otro"], "requerido": true},
    {"nombre": "origenAtaque", "tipo": "select", "etiqueta": "Origen/Vector de Ataque Probable", "opciones": ["Interno", "Externo", "Mixto", "Desconocido"], "requerido": true},
    {"nombre": "responsableCliente", "tipo": "text", "etiqueta": "Responsable del Cliente", "requerido": false},
    {"nombre": "iocIPs", "tipo": "textarea", "etiqueta": "Indicadores de Compromiso - IPs", "requerido": false, "filas": 3, "placeholder": "Direcciones IP sospechosas (una por línea)"},
    {"nombre": "iocDominios", "tipo": "textarea", "etiqueta": "Indicadores de Compromiso - Dominios", "requerido": false, "filas": 3, "placeholder": "Dominios maliciosos (uno por línea)"},
    {"nombre": "iocHashes", "tipo": "textarea", "etiqueta": "Indicadores de Compromiso - Hashes", "requerido": false, "filas": 3, "placeholder": "Hashes de archivos maliciosos (uno por línea)"}
  ]
}'
WHERE CodigoSeccion = 'SEC_3';

-- Actualizar Sección 5 - Agregar campos de contención detallada
UPDATE ANCI_FORMULARIO_CONFIG
SET CamposJSON = '{
  "campos": [
    {"nombre": "medidasContencion", "tipo": "textarea", "etiqueta": "Medidas de Contención Iniciales", "requerido": true, "filas": 4},
    {"nombre": "accionesContencion", "tipo": "textarea", "etiqueta": "Acciones de Contención Específicas", "requerido": false, "filas": 4},
    {"nombre": "sistemasDesconectados", "tipo": "textarea", "etiqueta": "Sistemas Desconectados/Aislados", "requerido": false, "filas": 3},
    {"nombre": "notificacionesInternas", "tipo": "textarea", "etiqueta": "Notificaciones Internas Realizadas", "requerido": false, "filas": 3},
    {"nombre": "planAccion", "tipo": "textarea", "etiqueta": "Plan de Acción Implementado", "requerido": false, "filas": 4}
  ]
}'
WHERE CodigoSeccion = 'SEC_5';

-- Insertar nueva sección para campos específicos OIV
INSERT INTO ANCI_FORMULARIO_CONFIG (
    CodigoSeccion, TipoSeccion, NumeroOrden, TituloSeccion, DescripcionSeccion, 
    AplicaOIV, AplicaPSE, EsObligatorio, CamposJSON, ColorSeccion, IconoSeccion,
    MaxComentarios, MaxArchivos, MaxTamanoMB, Activo
) VALUES (
    'SEC_OIV', 'CONDICIONAL', 100, 'Información Específica OIV', 
    'Campos específicos para Operadores de Infraestructura Vital',
    1, 0, 0, -- Solo para OIV
    '{
      "campos": [
        {"nombre": "cuentaConSGSI", "tipo": "radio", "etiqueta": "¿Cuenta con Sistema de Gestión de Seguridad de la Información?", "opciones": ["Sí", "No"], "requerido": true},
        {"nombre": "detallePlanContinuidad", "tipo": "textarea", "etiqueta": "Detalle del Plan de Continuidad", "requerido": false, "filas": 4},
        {"nombre": "activoPlanRecuperacion", "tipo": "textarea", "etiqueta": "Plan de Recuperación Activo", "requerido": false, "filas": 4},
        {"nombre": "auditoriasRealizadas", "tipo": "textarea", "etiqueta": "Auditorías de Seguridad Realizadas", "requerido": false, "filas": 3},
        {"nombre": "fechaUltimaAuditoria", "tipo": "date", "etiqueta": "Fecha de Última Auditoría", "requerido": false},
        {"nombre": "delegadoTecnico", "tipo": "text", "etiqueta": "Delegado Técnico Responsable", "requerido": false},
        {"nombre": "medidasPropagacion", "tipo": "textarea", "etiqueta": "Medidas contra Propagación", "requerido": false, "filas": 3},
        {"nombre": "notificacionAfectados", "tipo": "textarea", "etiqueta": "Notificación a Afectados", "requerido": false, "filas": 3},
        {"nombre": "registroCapacitaciones", "tipo": "textarea", "etiqueta": "Registro de Capacitaciones", "requerido": false, "filas": 3}
      ]
    }',
    '#6f42c1', 'building', 6, 10, 10, 1
);

-- Insertar sección de contacto de seguimiento
INSERT INTO ANCI_FORMULARIO_CONFIG (
    CodigoSeccion, TipoSeccion, NumeroOrden, TituloSeccion, DescripcionSeccion, 
    AplicaOIV, AplicaPSE, EsObligatorio, CamposJSON, ColorSeccion, IconoSeccion,
    MaxComentarios, MaxArchivos, MaxTamanoMB, Activo
) VALUES (
    'SEC_CONTACTO', 'FIJA', 101, 'Contacto de Seguimiento', 
    'Información de contacto para seguimiento del incidente',
    1, 1, 1, -- Para OIV y PSE
    '{
      "campos": [
        {"nombre": "contactoSeguimientoNombre", "tipo": "text", "etiqueta": "Nombre del Contacto de Seguimiento", "requerido": true},
        {"nombre": "contactoSeguimientoHorario", "tipo": "text", "etiqueta": "Horario de Disponibilidad", "requerido": true, "placeholder": "Ej: Lunes a Viernes 9:00-18:00"},
        {"nombre": "contactoSeguimientoCorreo", "tipo": "email", "etiqueta": "Correo del Contacto", "requerido": true},
        {"nombre": "contactoSeguimientoTelefono", "tipo": "tel", "etiqueta": "Teléfono del Contacto", "requerido": true},
        {"nombre": "estadoActualIncidente", "tipo": "select", "etiqueta": "Estado Actual del Incidente", "opciones": ["Activo", "Contenido", "En Investigación", "Erradicado", "Recuperación", "Cerrado"], "requerido": true}
      ]
    }',
    '#20c997', 'phone', 6, 10, 10, 1
);
```

### **2. Actualizar Estructura de Tablas**

```sql
-- Agregar campos faltantes a la tabla Incidentes
ALTER TABLE Incidentes ADD 
    AnciNombreReportante NVARCHAR(500),
    AnciCargoReportante NVARCHAR(500),
    AnciCorreoReportante NVARCHAR(500),
    AnciTelefonoReportante NVARCHAR(100),
    AnciFormacionCertificacion NVARCHAR(MAX),
    AnciFechaAlertaTemprana DATETIME2,
    AnciSistemasAfectadosDetalle NVARCHAR(MAX),
    AnciImpactoContinuidadDatos NVARCHAR(MAX),
    AnciAfectacionTerceros BIT,
    AnciNumeroAfectados INT,
    AnciAccionesContencion NVARCHAR(MAX),
    AnciSistemasDesconectados NVARCHAR(MAX),
    AnciNotificacionesInternas NVARCHAR(MAX),
    AnciEstadoActualIncidente NVARCHAR(200),
    AnciContactoSeguimientoNombre NVARCHAR(500),
    AnciContactoSeguimientoHorario NVARCHAR(200),
    AnciContactoSeguimientoCorreo NVARCHAR(500),
    AnciContactoSeguimientoTelefono NVARCHAR(100),
    AnciOIVCuentaConSGSI BIT,
    AnciOIVDetallePlanContinuidad NVARCHAR(MAX),
    AnciOIVActivoPlanRecuperacion NVARCHAR(MAX),
    AnciOIVAuditoriasRealizadas NVARCHAR(MAX),
    AnciOIVFechaUltimaAuditoria DATE,
    AnciOIVDelegadoTecnico NVARCHAR(500),
    AnciOIVMedidasPropagacion NVARCHAR(MAX),
    AnciOIVNotificacionAfectados NVARCHAR(MAX),
    AnciOIVRegistroCapacitaciones NVARCHAR(MAX);
```

### **3. Crear Procedimiento de Validación Completa**

```sql
CREATE OR ALTER PROCEDURE sp_ValidarIncidenteANCI
    @IncidenteID INT
AS
BEGIN
    DECLARE @Resultado TABLE (
        Campo NVARCHAR(100),
        Validacion NVARCHAR(500),
        Estado NVARCHAR(20),
        Mensaje NVARCHAR(1000)
    );

    DECLARE @TipoEmpresa NVARCHAR(10);
    SELECT @TipoEmpresa = e.TipoEmpresa 
    FROM Incidentes i 
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID 
    WHERE i.IncidenteID = @IncidenteID;

    -- Validaciones básicas
    INSERT INTO @Resultado
    SELECT 'Titulo', 'Campo obligatorio', 
           CASE WHEN Titulo IS NOT NULL AND LEN(Titulo) > 0 THEN 'OK' ELSE 'ERROR' END,
           CASE WHEN Titulo IS NOT NULL AND LEN(Titulo) > 0 THEN 'Campo completo' ELSE 'Título del incidente es obligatorio' END
    FROM Incidentes WHERE IncidenteID = @IncidenteID;

    -- Validaciones de reportante
    INSERT INTO @Resultado
    SELECT 'AnciNombreReportante', 'Campo obligatorio ANCI', 
           CASE WHEN AnciNombreReportante IS NOT NULL AND LEN(AnciNombreReportante) > 0 THEN 'OK' ELSE 'ERROR' END,
           CASE WHEN AnciNombreReportante IS NOT NULL AND LEN(AnciNombreReportante) > 0 THEN 'Campo completo' ELSE 'Nombre del reportante es obligatorio para ANCI' END
    FROM Incidentes WHERE IncidenteID = @IncidenteID;

    -- Validaciones específicas OIV
    IF @TipoEmpresa = 'OIV'
    BEGIN
        INSERT INTO @Resultado
        SELECT 'AnciOIVCuentaConSGSI', 'Campo obligatorio para OIV', 
               CASE WHEN AnciOIVCuentaConSGSI IS NOT NULL THEN 'OK' ELSE 'ERROR' END,
               CASE WHEN AnciOIVCuentaConSGSI IS NOT NULL THEN 'Campo completo' ELSE 'Información sobre SGSI es obligatoria para OIV' END
        FROM Incidentes WHERE IncidenteID = @IncidenteID;
    END;

    -- Validación CSIRT para incidentes críticos
    IF EXISTS (SELECT 1 FROM Incidentes WHERE IncidenteID = @IncidenteID AND Criticidad = 'Crítica')
    BEGIN
        INSERT INTO @Resultado
        SELECT 'CSIRT', 'Obligatorio para incidentes críticos',
               CASE WHEN dbo.fn_ValidarCSIRTParaCriticos(@IncidenteID) = 1 THEN 'OK' ELSE 'ERROR' END,
               CASE WHEN dbo.fn_ValidarCSIRTParaCriticos(@IncidenteID) = 1 THEN 'Solicitud CSIRT configurada' ELSE 'Incidentes críticos requieren solicitud CSIRT' END;
    END;

    SELECT * FROM @Resultado;
END
```

## 📊 **RESUMEN DE ESTADO**

### **Campos Implementados: 18/52 (35%)**
### **Campos Faltantes: 34/52 (65%)**

### **Prioridad de Implementación:**
1. **ALTA** - Campos de reportante (obligatorios)
2. **ALTA** - Campos de impacto detallado
3. **MEDIA** - Campos específicos OIV
4. **MEDIA** - Indicadores de compromiso
5. **BAJA** - Campos de seguimiento y contacto

### **Tiempo Estimado de Implementación:**
- **Fase 1 (Crítica)**: 2-3 días
- **Fase 2 (Importante)**: 3-4 días
- **Fase 3 (Complementaria)**: 2-3 días

**Total estimado: 7-10 días de desarrollo**

### **Recomendación:**
Proceder con la implementación por fases, priorizando los campos obligatorios de reportante y los campos de impacto detallado que son fundamentales para cumplir con los requisitos ANCI.