-- ========================================
-- SISTEMA DINÁMICO DE INCIDENTES ANCI V2
-- ========================================
-- Sistema completamente flexible que permite:
-- - Agregar/quitar secciones dinámicamente
-- - Campos definidos por JSON (no estáticos)
-- - Adapatarse a cambios de ANCI sin modificar código
-- - Secciones CSIRT y cualquier nueva que se requiera
-- ========================================

-- 1. TABLA PRINCIPAL DE INCIDENTES (ya existe, solo referencia)
-- La tabla Incidentes mantiene solo datos mínimos esenciales

-- 2. TABLA DE CONFIGURACIÓN DE SECCIONES
-- Define TODAS las secciones dinámicamente
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ANCI_SECCIONES_CONFIG' AND xtype='U')
CREATE TABLE ANCI_SECCIONES_CONFIG (
    SeccionID INT PRIMARY KEY IDENTITY(1,1),
    CodigoSeccion NVARCHAR(50) NOT NULL UNIQUE,  -- 'SEC_1', 'SEC_CSIRT', 'TAX_1', etc
    TipoSeccion NVARCHAR(20) NOT NULL,            -- 'FIJA', 'TAXONOMIA', 'ESPECIAL'
    NumeroOrden INT NOT NULL,                     -- Orden de aparición
    Titulo NVARCHAR(200) NOT NULL,                -- Título de la sección
    Descripcion NVARCHAR(MAX),                    -- Descripción detallada
    CamposJSON NVARCHAR(MAX),                     -- Definición COMPLETA de campos en JSON
    ValidacionesJSON NVARCHAR(MAX),               -- Reglas de validación en JSON
    AplicaOIV BIT DEFAULT 1,                      -- Si aplica a empresas OIV
    AplicaPSE BIT DEFAULT 1,                      -- Si aplica a empresas PSE
    AplicaAMBAS BIT DEFAULT 1,                    -- Si aplica a empresas AMBAS
    Activo BIT DEFAULT 1,                         -- Si la sección está activa
    EsRequerida BIT DEFAULT 0,                    -- Si es obligatoria
    ColorIndicador NVARCHAR(20) DEFAULT '#28a745',
    IconoSeccion NVARCHAR(50),
    MaxComentarios INT DEFAULT 6,
    MaxArchivos INT DEFAULT 10,
    MaxSizeMB INT DEFAULT 10,
    VersionFormulario INT DEFAULT 1,              -- Para control de versiones
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FechaActualizacion DATETIME DEFAULT GETDATE(),
    CreadoPor NVARCHAR(100),
    ActualizadoPor NVARCHAR(100)
);

-- 3. TABLA DE DATOS DE INCIDENTES POR SECCIÓN
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_SECCIONES_DATOS' AND xtype='U')
CREATE TABLE INCIDENTES_SECCIONES_DATOS (
    DatoID INT PRIMARY KEY IDENTITY(1,1),
    IncidenteID INT NOT NULL,
    SeccionID INT NOT NULL,
    DatosJSON NVARCHAR(MAX),                      -- TODOS los datos en JSON
    EstadoSeccion NVARCHAR(20) DEFAULT 'VACIO',
    PorcentajeCompletado INT DEFAULT 0,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FechaActualizacion DATETIME DEFAULT GETDATE(),
    ActualizadoPor NVARCHAR(100),
    VersionDatos INT DEFAULT 1,                   -- Versión de los datos
    FOREIGN KEY (IncidenteID) REFERENCES Incidentes(IncidenteID) ON DELETE CASCADE,
    FOREIGN KEY (SeccionID) REFERENCES ANCI_SECCIONES_CONFIG(SeccionID),
    UNIQUE(IncidenteID, SeccionID)
);

-- 4. TABLA DE COMENTARIOS POR SECCIÓN
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_COMENTARIOS' AND xtype='U')
CREATE TABLE INCIDENTES_COMENTARIOS (
    ComentarioID INT PRIMARY KEY IDENTITY(1,1),
    IncidenteID INT NOT NULL,
    SeccionID INT NOT NULL,
    NumeroComentario INT NOT NULL,
    Comentario NVARCHAR(MAX) NOT NULL,
    TipoComentario NVARCHAR(50),
    FechaCreacion DATETIME DEFAULT GETDATE(),
    CreadoPor NVARCHAR(100),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (IncidenteID) REFERENCES Incidentes(IncidenteID) ON DELETE CASCADE,
    FOREIGN KEY (SeccionID) REFERENCES ANCI_SECCIONES_CONFIG(SeccionID)
);

-- 5. TABLA DE ARCHIVOS POR SECCIÓN
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_ARCHIVOS' AND xtype='U')
CREATE TABLE INCIDENTES_ARCHIVOS (
    ArchivoID INT PRIMARY KEY IDENTITY(1,1),
    IncidenteID INT NOT NULL,
    SeccionID INT NOT NULL,
    NumeroArchivo INT NOT NULL,
    NombreOriginal NVARCHAR(255) NOT NULL,
    NombreServidor NVARCHAR(255) NOT NULL UNIQUE,
    RutaArchivo NVARCHAR(500) NOT NULL,
    TipoArchivo NVARCHAR(50),
    TamanoKB INT NOT NULL,
    HashArchivo NVARCHAR(64),
    Descripcion NVARCHAR(500),
    FechaSubida DATETIME DEFAULT GETDATE(),
    SubidoPor NVARCHAR(100),
    Activo BIT DEFAULT 1,
    FOREIGN KEY (IncidenteID) REFERENCES Incidentes(IncidenteID) ON DELETE CASCADE,
    FOREIGN KEY (SeccionID) REFERENCES ANCI_SECCIONES_CONFIG(SeccionID)
);

-- 6. TABLA DE AUDITORÍA
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_AUDITORIA' AND xtype='U')
CREATE TABLE INCIDENTES_AUDITORIA (
    AuditoriaID INT PRIMARY KEY IDENTITY(1,1),
    IncidenteID INT NOT NULL,
    SeccionID INT,
    TipoAccion NVARCHAR(50) NOT NULL,
    TablaAfectada NVARCHAR(50),
    RegistroID INT,
    DatosAnteriores NVARCHAR(MAX),
    DatosNuevos NVARCHAR(MAX),
    Usuario NVARCHAR(100),
    DireccionIP NVARCHAR(50),
    UserAgent NVARCHAR(500),
    FechaAccion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IncidenteID) REFERENCES Incidentes(IncidenteID) ON DELETE CASCADE
);

-- 7. ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IDX_Secciones_Tipo ON ANCI_SECCIONES_CONFIG(TipoSeccion);
CREATE INDEX IDX_Secciones_Activo ON ANCI_SECCIONES_CONFIG(Activo);
CREATE INDEX IDX_Datos_Incidente ON INCIDENTES_SECCIONES_DATOS(IncidenteID);
CREATE INDEX IDX_Datos_Estado ON INCIDENTES_SECCIONES_DATOS(EstadoSeccion);
CREATE INDEX IDX_Comentarios_Incidente ON INCIDENTES_COMENTARIOS(IncidenteID, SeccionID);
CREATE INDEX IDX_Archivos_Incidente ON INCIDENTES_ARCHIVOS(IncidenteID, SeccionID);
CREATE INDEX IDX_Archivos_Activo ON INCIDENTES_ARCHIVOS(Activo);
CREATE INDEX IDX_Auditoria_Incidente ON INCIDENTES_AUDITORIA(IncidenteID, FechaAccion);

-- 8. INSERTAR LAS SECCIONES INICIALES CON CAMPOS DINÁMICOS
INSERT INTO ANCI_SECCIONES_CONFIG (CodigoSeccion, TipoSeccion, NumeroOrden, Titulo, Descripcion, CamposJSON, IconoSeccion, EsRequerida)
VALUES 
-- Sección 1: Información General
('SEC_1', 'FIJA', 1, 'Información General', 'Datos básicos del incidente', 
'{
  "campos": [
    {"nombre": "titulo", "tipo": "text", "etiqueta": "Título del Incidente", "requerido": true, "placeholder": "Describa brevemente el incidente"},
    {"nombre": "tipoFlujo", "tipo": "select", "etiqueta": "Tipo de Registro", "opciones": ["Informativo", "Interno"], "requerido": true},
    {"nombre": "fechaDeteccion", "tipo": "datetime-local", "etiqueta": "Fecha y Hora de Detección", "requerido": true},
    {"nombre": "fechaOcurrencia", "tipo": "datetime-local", "etiqueta": "Fecha y Hora de Ocurrencia", "requerido": false},
    {"nombre": "criticidad", "tipo": "select", "etiqueta": "Criticidad", "opciones": ["Baja", "Media", "Alta", "Crítica"], "requerido": true},
    {"nombre": "alcanceGeografico", "tipo": "select", "etiqueta": "Alcance Geográfico", "opciones": ["Local", "Regional", "Nacional", "Internacional"], "requerido": false},
    {"nombre": "estadoActual", "tipo": "select", "etiqueta": "Estado del Incidente", "opciones": ["Activo", "En Investigación", "Contenido", "Erradicado", "Cerrado"], "requerido": true},
    {"nombre": "idVisible", "tipo": "text", "etiqueta": "ID Visible", "soloLectura": true},
    {"nombre": "reporteAnciId", "tipo": "text", "etiqueta": "ID Reporte ANCI", "placeholder": "ANCI-2024-XXX"},
    {"nombre": "fechaDeclaracionAnci", "tipo": "datetime-local", "etiqueta": "Fecha Declaración ANCI"}
  ]
}', 'info-circle', 1),

-- Sección 2: Descripción del Incidente
('SEC_2', 'FIJA', 2, 'Descripción del Incidente', 'Descripción detallada del incidente', 
'{
  "campos": [
    {"nombre": "descripcionInicial", "tipo": "textarea", "etiqueta": "Descripción Inicial Detallada", "requerido": true, "filas": 5},
    {"nombre": "impactoPreliminar", "tipo": "textarea", "etiqueta": "Impacto Preliminar Observado", "filas": 4},
    {"nombre": "sistemasAfectados", "tipo": "textarea", "etiqueta": "Sistemas, Activos o Personal Afectado", "requerido": true, "filas": 4},
    {"nombre": "serviciosInterrumpidos", "tipo": "text", "etiqueta": "Servicios Interrumpidos y Duración"}
  ]
}', 'file-text', 1),

-- Sección 3: Análisis del Incidente
('SEC_3', 'FIJA', 3, 'Análisis del Incidente', 'Análisis técnico y de impacto', 
'{
  "campos": [
    {"nombre": "tipoAmenaza", "tipo": "text", "etiqueta": "Tipo de Amenaza Probable"},
    {"nombre": "vectorAtaque", "tipo": "text", "etiqueta": "Origen / Vector de Ataque Probable", "requerido": true},
    {"nombre": "responsableCliente", "tipo": "text", "etiqueta": "Responsable del Cliente"},
    {"nombre": "analisisTecnico", "tipo": "textarea", "etiqueta": "Análisis Técnico Detallado", "filas": 5}
  ]
}', 'search', 1),

-- Sección 4: Acciones Inmediatas
('SEC_4', 'FIJA', 4, 'Acciones Inmediatas', 'Medidas tomadas inmediatamente', 
'{
  "campos": [
    {"nombre": "medidasContencion", "tipo": "textarea", "etiqueta": "Medidas de Contención Iniciales", "requerido": true, "filas": 5},
    {"nombre": "accionesRealizadas", "tipo": "textarea", "etiqueta": "Acciones Realizadas", "filas": 4},
    {"nombre": "tiempoRespuesta", "tipo": "text", "etiqueta": "Tiempo de Respuesta Inicial"}
  ]
}', 'shield', 1),

-- Sección 5: Análisis Final
('SEC_5', 'FIJA', 5, 'Análisis Final', 'Análisis de causa raíz y lecciones', 
'{
  "campos": [
    {"nombre": "analisisCausaRaiz", "tipo": "textarea", "etiqueta": "Análisis de Causa Raíz", "filas": 5},
    {"nombre": "leccionesAprendidas", "tipo": "textarea", "etiqueta": "Lecciones Aprendidas", "filas": 4},
    {"nombre": "recomendacionesMejora", "tipo": "textarea", "etiqueta": "Recomendaciones de Mejora", "filas": 4}
  ]
}', 'check-circle', 0),

-- Sección 6: Información ANCI
('SEC_6', 'FIJA', 6, 'Información ANCI', 'Datos específicos para reporte ANCI', 
'{
  "campos": [
    {"nombre": "categoriaAnci", "tipo": "select", "etiqueta": "Categoría ANCI", "opciones": ["Código Dañino", "Denegación de Servicio", "Recopilación de Información", "Intrusión", "Intento de Intrusión", "Fraude", "Abuso de Privilegios", "Otro"]},
    {"nombre": "subcategoriaAnci", "tipo": "text", "etiqueta": "Subcategoría ANCI"},
    {"nombre": "afectacionDatos", "tipo": "select", "etiqueta": "Afectación a Datos", "opciones": ["Confidencialidad", "Integridad", "Disponibilidad", "Múltiple"]},
    {"nombre": "datosComprometidos", "tipo": "textarea", "etiqueta": "Descripción de Datos Comprometidos", "filas": 3}
  ]
}', 'file-shield', 0),

-- NUEVA Sección CSIRT
('SEC_CSIRT', 'ESPECIAL', 7, 'Solicitud de Asistencia CSIRT', 'Gestión de ayuda del CSIRT Nacional', 
'{
  "campos": [
    {"nombre": "solicitarAyudaCSIRT", "tipo": "checkbox", "etiqueta": "Solicitar asistencia del CSIRT Nacional"},
    {"nombre": "tipoAyudaCSIRT", "tipo": "select", "etiqueta": "Tipo de Asistencia Requerida", "opciones": ["Análisis Forense", "Contención del Incidente", "Asesoría Técnica", "Coordinación de Respuesta", "Recuperación de Sistemas", "Análisis de Malware", "Otro"], "condicional": "solicitarAyudaCSIRT"},
    {"nombre": "descripcionAyudaCSIRT", "tipo": "textarea", "etiqueta": "Descripción de la Asistencia Solicitada", "filas": 4, "condicional": "solicitarAyudaCSIRT"},
    {"nombre": "contactoCSIRT", "tipo": "text", "etiqueta": "Contacto de Emergencia para CSIRT", "condicional": "solicitarAyudaCSIRT"},
    {"nombre": "urgenciaCSIRT", "tipo": "radio", "etiqueta": "Nivel de Urgencia", "opciones": ["Inmediata", "Alta", "Media"], "valorDefecto": "Media", "condicional": "solicitarAyudaCSIRT"},
    {"nombre": "fechaSolicitudCSIRT", "tipo": "datetime-local", "etiqueta": "Fecha de Solicitud CSIRT", "soloLectura": true, "condicional": "solicitarAyudaCSIRT"},
    {"nombre": "estadoSolicitudCSIRT", "tipo": "text", "etiqueta": "Estado de la Solicitud", "soloLectura": true}
  ],
  "informacionAdicional": {
    "telefono": "+56 2 2486 3850",
    "email": "soc@csirt.gob.cl",
    "web": "www.csirt.gob.cl"
  }
}', 'shield-alt', 0);

-- 9. PROCEDIMIENTO PARA CARGAR TAXONOMÍAS DESDE LA TABLA EXISTENTE
GO
CREATE OR ALTER PROCEDURE sp_CargarTaxonomiasComoSecciones
AS
BEGIN
    DECLARE @contador INT = 8;  -- Empezamos después de las secciones fijas y CSIRT
    
    -- Solo insertar si no existen taxonomías
    IF NOT EXISTS (SELECT 1 FROM ANCI_SECCIONES_CONFIG WHERE TipoSeccion = 'TAXONOMIA')
    BEGIN
        INSERT INTO ANCI_SECCIONES_CONFIG (
            CodigoSeccion, TipoSeccion, NumeroOrden, Titulo, 
            Descripcion, CamposJSON, AplicaOIV, AplicaPSE, IconoSeccion
        )
        SELECT TOP 35
            'TAX_' + CAST(ROW_NUMBER() OVER (ORDER BY Id_Incidente) AS NVARCHAR(10)),
            'TAXONOMIA',
            @contador + ROW_NUMBER() OVER (ORDER BY Id_Incidente) - 1,
            CONCAT(Area, ' - ', Efecto),
            CONCAT('Categoría: ', Categoria_del_Incidente, ' | Subcategoría: ', Subcategoria_del_Incidente),
            '{
              "campos": [
                {"nombre": "aplica", "tipo": "checkbox", "etiqueta": "Esta taxonomía aplica al incidente"},
                {"nombre": "descripcionImpacto", "tipo": "textarea", "etiqueta": "Descripción del impacto específico", "filas": 3, "condicional": "aplica"},
                {"nombre": "medidasEspecificas", "tipo": "textarea", "etiqueta": "Medidas específicas tomadas", "filas": 3, "condicional": "aplica"}
              ]
            }',
            CASE WHEN Tipo_Empresa IN ('OIV', 'AMBAS') THEN 1 ELSE 0 END,
            CASE WHEN Tipo_Empresa IN ('PSE', 'AMBAS') THEN 1 ELSE 0 END,
            'tag'
        FROM TAXONOMIA_INCIDENTES
        WHERE Activo = 1
        ORDER BY Id_Incidente;
        
        PRINT 'Taxonomías cargadas como secciones dinámicas'
    END
END;
GO

-- 10. PROCEDIMIENTO PARA AGREGAR NUEVA SECCIÓN
CREATE OR ALTER PROCEDURE sp_AgregarNuevaSeccion
    @CodigoSeccion NVARCHAR(50),
    @Titulo NVARCHAR(200),
    @Descripcion NVARCHAR(MAX),
    @CamposJSON NVARCHAR(MAX),
    @TipoSeccion NVARCHAR(20) = 'ESPECIAL'
AS
BEGIN
    DECLARE @MaxOrden INT;
    SELECT @MaxOrden = MAX(NumeroOrden) FROM ANCI_SECCIONES_CONFIG;
    
    INSERT INTO ANCI_SECCIONES_CONFIG (
        CodigoSeccion, TipoSeccion, NumeroOrden, Titulo, 
        Descripcion, CamposJSON, IconoSeccion
    )
    VALUES (
        @CodigoSeccion, @TipoSeccion, @MaxOrden + 1, @Titulo,
        @Descripcion, @CamposJSON, 'folder'
    );
    
    SELECT SCOPE_IDENTITY() AS NuevaSeccionID;
END;
GO

-- 11. VISTA PARA FACILITAR CONSULTAS
CREATE OR ALTER VIEW vw_IncidentesSeccionesCompletas AS
SELECT 
    i.IncidenteID,
    i.IDVisible,
    i.Titulo AS TituloIncidente,
    i.EmpresaID,
    e.Tipo_Empresa,
    sc.SeccionID,
    sc.CodigoSeccion,
    sc.TipoSeccion,
    sc.NumeroOrden,
    sc.Titulo AS TituloSeccion,
    sc.CamposJSON,
    sd.DatosJSON,
    sd.EstadoSeccion,
    sd.PorcentajeCompletado,
    (SELECT COUNT(*) FROM INCIDENTES_COMENTARIOS WHERE IncidenteID = i.IncidenteID AND SeccionID = sc.SeccionID AND Activo = 1) AS TotalComentarios,
    (SELECT COUNT(*) FROM INCIDENTES_ARCHIVOS WHERE IncidenteID = i.IncidenteID AND SeccionID = sc.SeccionID AND Activo = 1) AS TotalArchivos
FROM Incidentes i
INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
CROSS JOIN ANCI_SECCIONES_CONFIG sc
LEFT JOIN INCIDENTES_SECCIONES_DATOS sd ON i.IncidenteID = sd.IncidenteID AND sc.SeccionID = sd.SeccionID
WHERE sc.Activo = 1
AND (
    (sc.AplicaOIV = 1 AND e.Tipo_Empresa = 'OIV') OR
    (sc.AplicaPSE = 1 AND e.Tipo_Empresa = 'PSE') OR
    (sc.AplicaAMBAS = 1 AND e.Tipo_Empresa = 'AMBAS') OR
    sc.TipoSeccion = 'FIJA' OR
    sc.TipoSeccion = 'ESPECIAL'
);
GO

-- 12. EJECUTAR CARGA INICIAL DE TAXONOMÍAS
EXEC sp_CargarTaxonomiasComoSecciones;

PRINT '✅ SISTEMA DINÁMICO V2 CREADO EXITOSAMENTE';
PRINT '📌 Características:';
PRINT '   - Campos 100% dinámicos definidos por JSON';
PRINT '   - Sección CSIRT incluida';
PRINT '   - Fácil agregar nuevas secciones sin modificar código';
PRINT '   - Adaptable a cambios de ANCI';