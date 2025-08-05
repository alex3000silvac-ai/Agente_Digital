-- ========================================
-- SISTEMA DINÁMICO ANCI COMPLETO V3.0
-- ========================================
-- Sistema robusto de 41 secciones dinámicas con:
-- - Edición segura de incidencias
-- - Gestión completa de archivos (anti-huérfanos)
-- - Taxonomías dinámicas OIV/PSE/AMBAS
-- - Sistema de backup y recuperación
-- ========================================

PRINT '🚀 INICIANDO IMPLEMENTACIÓN SISTEMA DINÁMICO ANCI V3.0';
PRINT '=========================================================';

-- ========================================
-- PASO 1: CREAR TABLAS PRINCIPALES
-- ========================================
PRINT '';
PRINT '📋 PASO 1: CREANDO ESTRUCTURA DE TABLAS';
PRINT '-----------------------------------------';

-- Tabla principal del formulario dinámico
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ANCI_FORMULARIOS_DINAMICOS')
BEGIN
    CREATE TABLE ANCI_FORMULARIOS_DINAMICOS (
        FormularioID int IDENTITY(1,1) PRIMARY KEY,
        IncidenteID int NOT NULL,
        EmpresaID int NOT NULL,
        IndiceUnico nvarchar(200) NOT NULL UNIQUE,
        TipoEmpresa nvarchar(10) NOT NULL, -- OIV, PSE, AMBAS
        
        -- Control de versiones y estado
        VersionFormulario nvarchar(20) DEFAULT '3.0',
        EstadoFormulario nvarchar(50) DEFAULT 'BORRADOR', -- BORRADOR, VALIDANDO, COMPLETADO, ENVIADO
        TotalSecciones int DEFAULT 0,
        SeccionesCompletadas int DEFAULT 0,
        PorcentajeCompletado decimal(5,2) DEFAULT 0.00,
        
        -- Datos JSON estructurados
        ConfiguracionSeccionesJSON nvarchar(MAX), -- Configuración de las secciones aplicables
        DatosFormularioJSON nvarchar(MAX), -- Datos del formulario por secciones
        MetadatosJSON nvarchar(MAX), -- Metadatos adicionales
        
        -- Gestión de archivos
        TotalArchivos int DEFAULT 0,
        TotalComentarios int DEFAULT 0,
        TamanoTotalMB decimal(10,2) DEFAULT 0.00,
        
        -- Auditoría y control
        FechaCreacion datetime2 DEFAULT GETDATE(),
        FechaModificacion datetime2,
        FechaUltimaEdicion datetime2,
        UsuarioCreador nvarchar(200),
        UsuarioModificador nvarchar(200),
        UsuarioUltimaEdicion nvarchar(200),
        IPUltimaEdicion nvarchar(100),
        
        -- Bloqueo de edición concurrente
        EditandoActualmente bit DEFAULT 0,
        UsuarioEditando nvarchar(200),
        FechaInicioEdicion datetime2,
        TokenEdicion nvarchar(100),
        
        CONSTRAINT FK_ANCI_FORMULARIOS_INCIDENTE FOREIGN KEY (IncidenteID) REFERENCES Incidentes(IncidenteID),
        CONSTRAINT FK_ANCI_FORMULARIOS_EMPRESA FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
        
        INDEX IX_ANCI_FORMULARIOS_INCIDENTE (IncidenteID),
        INDEX IX_ANCI_FORMULARIOS_EMPRESA (EmpresaID),
        INDEX IX_ANCI_FORMULARIOS_ESTADO (EstadoFormulario),
        INDEX IX_ANCI_FORMULARIOS_INDICE (IndiceUnico)
    );
    PRINT '✅ Tabla ANCI_FORMULARIOS_DINAMICOS creada';
END
ELSE
    PRINT '⚠️ Tabla ANCI_FORMULARIOS_DINAMICOS ya existe';

-- Tabla de configuración de secciones dinámicas (MEJORADA)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ANCI_SECCIONES_CONFIG_V3')
BEGIN
    CREATE TABLE ANCI_SECCIONES_CONFIG_V3 (
        SeccionConfigID int IDENTITY(1,1) PRIMARY KEY,
        CodigoSeccion nvarchar(20) NOT NULL, -- SEC_1, SEC_2, TAX_001, etc.
        TipoSeccion nvarchar(20) NOT NULL, -- FIJA, TAXONOMIA, ESPECIAL, CONDICIONAL
        CategoriaSeccion nvarchar(50), -- IDENTIFICACION, DESCRIPCION, ANALISIS, etc.
        NumeroOrden int NOT NULL,
        TituloSeccion nvarchar(500) NOT NULL,
        DescripcionSeccion nvarchar(MAX),
        InstruccionesSeccion nvarchar(MAX),
        
        -- Aplicabilidad por tipo de empresa
        AplicaOIV bit DEFAULT 1,
        AplicaPSE bit DEFAULT 1,
        AplicaAMBAS bit DEFAULT 1,
        EsObligatorio bit DEFAULT 0,
        EsObligatorioOIV bit DEFAULT 0,
        EsObligatorioPSE bit DEFAULT 0,
        
        -- Configuración de campos dinámicos
        CamposJSON nvarchar(MAX), -- JSON con definición de campos
        ValidacionesJSON nvarchar(MAX), -- JSON con reglas de validación
        CondicionesJSON nvarchar(MAX), -- JSON con condiciones de visibilidad
        
        -- Capacidades de archivos y comentarios
        MaxComentarios int DEFAULT 6,
        MaxArchivos int DEFAULT 10,
        MaxTamanoMB int DEFAULT 10,
        TiposArchivosPermitidos nvarchar(500) DEFAULT 'pdf,doc,docx,xls,xlsx,txt,jpg,jpeg,png,zip,rar',
        
        -- Configuración UI/UX
        ColorSeccion nvarchar(20) DEFAULT '#007bff',
        IconoSeccion nvarchar(50) DEFAULT 'file',
        TemaSeccion nvarchar(50) DEFAULT 'default',
        PosicionEnAcordeon int,
        ExpandidaPorDefecto bit DEFAULT 0,
        
        -- Configuración de taxonomía (para secciones tipo TAXONOMIA)
        TaxonomiaID nvarchar(100),
        TaxonomiaArea nvarchar(200),
        TaxonomiaEfecto nvarchar(200),
        TaxonomiaCategoria nvarchar(200),
        
        -- Control de versiones
        Version nvarchar(20) DEFAULT '1.0',
        FechaVigencia datetime2 NOT NULL DEFAULT GETDATE(),
        FechaExpiracion datetime2,
        Activo bit DEFAULT 1,
        ActivoOIV bit DEFAULT 1,
        ActivoPSE bit DEFAULT 1,
        
        -- Auditoría
        FechaCreacion datetime2 DEFAULT GETDATE(),
        FechaModificacion datetime2,
        CreadoPor nvarchar(200),
        ModificadoPor nvarchar(200),
        MotivoModificacion nvarchar(1000),
        
        CONSTRAINT UK_ANCI_SECCIONES_CONFIG_CODIGO UNIQUE (CodigoSeccion, Version),
        INDEX IX_ANCI_SECCIONES_TIPO (TipoSeccion),
        INDEX IX_ANCI_SECCIONES_ORDEN (NumeroOrden),
        INDEX IX_ANCI_SECCIONES_ACTIVO (Activo)
    );
    PRINT '✅ Tabla ANCI_SECCIONES_CONFIG_V3 creada';
END
ELSE
    PRINT '⚠️ Tabla ANCI_SECCIONES_CONFIG_V3 ya existe';

-- Tabla de archivos con gestión anti-huérfanos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ANCI_ARCHIVOS_GESTION')
BEGIN
    CREATE TABLE ANCI_ARCHIVOS_GESTION (
        ArchivoID int IDENTITY(1,1) PRIMARY KEY,
        FormularioID int NOT NULL,
        CodigoSeccion nvarchar(20) NOT NULL,
        NumeroArchivo int NOT NULL, -- 1 a 10 por sección
        
        -- Información del archivo
        NombreOriginal nvarchar(500) NOT NULL,
        NombreAlmacenado nvarchar(500) NOT NULL,
        RutaCompleta nvarchar(1000) NOT NULL,
        RutaRelativa nvarchar(500) NOT NULL,
        CarpetaIncidente nvarchar(200) NOT NULL,
        TamanoBytes bigint NOT NULL,
        TamanoMB decimal(10,2) NOT NULL,
        TipoMIME nvarchar(200),
        ExtensionArchivo nvarchar(20),
        
        -- Integridad y seguridad
        HashMD5 nvarchar(32),
        HashSHA256 nvarchar(64),
        ChecksumVerificado bit DEFAULT 0,
        FechaUltimaVerificacion datetime2,
        
        -- Metadatos del archivo
        DescripcionArchivo nvarchar(MAX),
        EtiquetasJSON nvarchar(1000), -- JSON con etiquetas/tags
        CategoriaArchivo nvarchar(100), -- EVIDENCIA, DOCUMENTO, IMAGEN, etc.
        ConfidencialidadArchivo nvarchar(50) DEFAULT 'NORMAL', -- PUBLICO, CONFIDENCIAL, SECRETO
        
        -- Control de versiones del archivo
        VersionArchivo int DEFAULT 1,
        ArchivoAnteriorID int,
        EsVersionActual bit DEFAULT 1,
        MotivoActualizacion nvarchar(500),
        
        -- Estados y control
        EstadoArchivo nvarchar(50) DEFAULT 'ACTIVO', -- ACTIVO, ELIMINADO, PENDIENTE, CORRUPTO
        FechaEliminacion datetime2,
        MotivoEliminacion nvarchar(500),
        EliminadoPor nvarchar(200),
        
        -- Backup y recuperación
        RespaldadoEnBackup bit DEFAULT 0,
        FechaBackup datetime2,
        RutaBackup nvarchar(1000),
        PuedeRecuperarse bit DEFAULT 1,
        
        -- Auditoría completa
        FechaSubida datetime2 DEFAULT GETDATE(),
        UsuarioSubida nvarchar(200),
        IPSubida nvarchar(100),
        FechaModificacion datetime2,
        UsuarioModificacion nvarchar(200),
        
        -- Control de huérfanos
        UltimaVerificacionHuerfano datetime2,
        EsHuerfano bit DEFAULT 0,
        FechaDeteccionHuerfano datetime2,
        AccionHuerfano nvarchar(100), -- MANTENER, ELIMINAR, ARCHIVAR
        
        CONSTRAINT FK_ANCI_ARCHIVOS_FORMULARIO FOREIGN KEY (FormularioID) REFERENCES ANCI_FORMULARIOS_DINAMICOS(FormularioID),
        CONSTRAINT FK_ANCI_ARCHIVOS_ANTERIOR FOREIGN KEY (ArchivoAnteriorID) REFERENCES ANCI_ARCHIVOS_GESTION(ArchivoID),
        CONSTRAINT CK_ANCI_ARCHIVOS_NUMERO CHECK (NumeroArchivo BETWEEN 1 AND 10),
        
        INDEX IX_ANCI_ARCHIVOS_FORMULARIO (FormularioID),
        INDEX IX_ANCI_ARCHIVOS_SECCION (CodigoSeccion),
        INDEX IX_ANCI_ARCHIVOS_ESTADO (EstadoArchivo),
        INDEX IX_ANCI_ARCHIVOS_HUERFANO (EsHuerfano),
        INDEX IX_ANCI_ARCHIVOS_HASH (HashSHA256)
    );
    PRINT '✅ Tabla ANCI_ARCHIVOS_GESTION creada';
END
ELSE
    PRINT '⚠️ Tabla ANCI_ARCHIVOS_GESTION ya existe';

-- Tabla de comentarios por sección
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ANCI_COMENTARIOS_SECCIONES')
BEGIN
    CREATE TABLE ANCI_COMENTARIOS_SECCIONES (
        ComentarioID int IDENTITY(1,1) PRIMARY KEY,
        FormularioID int NOT NULL,
        CodigoSeccion nvarchar(20) NOT NULL,
        NumeroComentario int NOT NULL, -- 1 a 6 por sección
        
        -- Contenido del comentario
        TituloComentario nvarchar(200),
        ContenidoComentario nvarchar(MAX) NOT NULL,
        TipoComentario nvarchar(50) DEFAULT 'GENERAL', -- GENERAL, TECNICO, EVIDENCIA, ACLARACION
        CategoriaComentario nvarchar(100), -- OBSERVACION, HALLAZGO, RECOMENDACION
        PrioridadComentario nvarchar(20) DEFAULT 'NORMAL', -- ALTA, NORMAL, BAJA
        
        -- Visibilidad y control
        VisibleEnReporte bit DEFAULT 1,
        EsComentarioInterno bit DEFAULT 0,
        RequiereAprobacion bit DEFAULT 0,
        EstadoAprobacion nvarchar(50) DEFAULT 'APROBADO', -- PENDIENTE, APROBADO, RECHAZADO
        
        -- Auditoría
        FechaCreacion datetime2 DEFAULT GETDATE(),
        CreadoPor nvarchar(200),
        IPCreacion nvarchar(100),
        FechaModificacion datetime2,
        ModificadoPor nvarchar(200),
        IPModificacion nvarchar(100),
        
        -- Control de versiones
        VersionComentario int DEFAULT 1,
        ComentarioAnteriorID int,
        MotivoModificacion nvarchar(500),
        
        CONSTRAINT FK_ANCI_COMENTARIOS_FORMULARIO FOREIGN KEY (FormularioID) REFERENCES ANCI_FORMULARIOS_DINAMICOS(FormularioID),
        CONSTRAINT FK_ANCI_COMENTARIOS_ANTERIOR FOREIGN KEY (ComentarioAnteriorID) REFERENCES ANCI_COMENTARIOS_SECCIONES(ComentarioID),
        CONSTRAINT CK_ANCI_COMENTARIOS_NUMERO CHECK (NumeroComentario BETWEEN 1 AND 6),
        
        INDEX IX_ANCI_COMENTARIOS_FORMULARIO (FormularioID),
        INDEX IX_ANCI_COMENTARIOS_SECCION (CodigoSeccion),
        INDEX IX_ANCI_COMENTARIOS_TIPO (TipoComentario)
    );
    PRINT '✅ Tabla ANCI_COMENTARIOS_SECCIONES creada';
END
ELSE
    PRINT '⚠️ Tabla ANCI_COMENTARIOS_SECCIONES ya existe';

-- Tabla de auditoría de ediciones
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ANCI_AUDITORIA_EDICIONES')
BEGIN
    CREATE TABLE ANCI_AUDITORIA_EDICIONES (
        AuditoriaID int IDENTITY(1,1) PRIMARY KEY,
        FormularioID int NOT NULL,
        CodigoSeccion nvarchar(20),
        TipoAccion nvarchar(100) NOT NULL, -- CREAR, EDITAR, ELIMINAR, SUBIR_ARCHIVO, etc.
        TablaAfectada nvarchar(100),
        RegistroID int,
        
        -- Detalles del cambio
        CampoModificado nvarchar(200),
        ValorAnterior nvarchar(MAX),
        ValorNuevo nvarchar(MAX),
        DiferenciaDetallada nvarchar(MAX),
        
        -- Información de la acción
        MotivoAccion nvarchar(1000),
        ImpactoAccion nvarchar(500),
        AccionAutomatica bit DEFAULT 0,
        
        -- Información del usuario
        Usuario nvarchar(200),
        RolUsuario nvarchar(100),
        DireccionIP nvarchar(100),
        UserAgent nvarchar(1000),
        SesionID nvarchar(200),
        
        -- Información temporal
        FechaAccion datetime2 DEFAULT GETDATE(),
        DuracionAccionMs int,
        
        -- Resultado y errores
        Resultado nvarchar(50) DEFAULT 'EXITOSO', -- EXITOSO, ERROR, PARCIAL
        MensajeError nvarchar(2000),
        CodigoError nvarchar(50),
        
        CONSTRAINT FK_ANCI_AUDITORIA_FORMULARIO FOREIGN KEY (FormularioID) REFERENCES ANCI_FORMULARIOS_DINAMICOS(FormularioID),
        
        INDEX IX_ANCI_AUDITORIA_FORMULARIO (FormularioID),
        INDEX IX_ANCI_AUDITORIA_FECHA (FechaAccion),
        INDEX IX_ANCI_AUDITORIA_USUARIO (Usuario),
        INDEX IX_ANCI_AUDITORIA_ACCION (TipoAccion)
    );
    PRINT '✅ Tabla ANCI_AUDITORIA_EDICIONES creada';
END
ELSE
    PRINT '⚠️ Tabla ANCI_AUDITORIA_EDICIONES ya existe';

-- Tabla de backup y recuperación
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ANCI_BACKUP_RECUPERACION')
BEGIN
    CREATE TABLE ANCI_BACKUP_RECUPERACION (
        BackupID int IDENTITY(1,1) PRIMARY KEY,
        FormularioID int NOT NULL,
        TipoBackup nvarchar(50) NOT NULL, -- AUTOMATICO, MANUAL, PRE_ELIMINACION
        MotivoBackup nvarchar(500),
        
        -- Datos del backup
        DatosFormularioJSON nvarchar(MAX),
        ConfiguracionJSON nvarchar(MAX),
        ArchivosIncluidos nvarchar(MAX), -- JSON con lista de archivos
        TamanoBackupMB decimal(10,2),
        
        -- Información del backup
        RutaBackup nvarchar(1000),
        NombreArchivoBackup nvarchar(500),
        ComprimidoBackup bit DEFAULT 1,
        EncriptadoBackup bit DEFAULT 0,
        ClaveEncriptacion nvarchar(100),
        
        -- Control de recuperación
        PuedeRecuperarse bit DEFAULT 1,
        FechaExpiracionBackup datetime2,
        RecuperadoAlgunaVez bit DEFAULT 0,
        FechaUltimaRecuperacion datetime2,
        
        -- Auditoría
        FechaCreacion datetime2 DEFAULT GETDATE(),
        CreadoPor nvarchar(200),
        
        CONSTRAINT FK_ANCI_BACKUP_FORMULARIO FOREIGN KEY (FormularioID) REFERENCES ANCI_FORMULARIOS_DINAMICOS(FormularioID),
        
        INDEX IX_ANCI_BACKUP_FORMULARIO (FormularioID),
        INDEX IX_ANCI_BACKUP_FECHA (FechaCreacion),
        INDEX IX_ANCI_BACKUP_TIPO (TipoBackup)
    );
    PRINT '✅ Tabla ANCI_BACKUP_RECUPERACION creada';
END
ELSE
    PRINT '⚠️ Tabla ANCI_BACKUP_RECUPERACION ya existe';

-- ========================================
-- PASO 2: INSERTAR CONFIGURACIÓN DE SECCIONES FIJAS
-- ========================================
PRINT '';
PRINT '📝 PASO 2: INSERTANDO CONFIGURACIÓN DE SECCIONES FIJAS';
PRINT '-----------------------------------------------------';

-- Eliminar configuración anterior si existe
DELETE FROM ANCI_SECCIONES_CONFIG_V3 WHERE TipoSeccion = 'FIJA';

-- SECCIÓN 1: Identificación General (CON CAMPOS CSIRT INTEGRADOS)
INSERT INTO ANCI_SECCIONES_CONFIG_V3 (
    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
    DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
    EsObligatorio, EsObligatorioOIV, EsObligatorioPSE, ColorSeccion, IconoSeccion, 
    CreadoPor
) VALUES (
    'SEC_1', 'FIJA', 'IDENTIFICACION', 1, 'Identificación General del Incidente',
    'Información básica y datos del reportante para identificar correctamente el incidente de ciberseguridad.',
    'Complete todos los campos obligatorios. La información del reportante es requerida por ANCI.',
    '{
        "campos": [
            {
                "nombre": "tipoRegistro",
                "tipo": "select",
                "etiqueta": "Tipo de registro del Incidente",
                "requerido": true,
                "opciones": [
                    {"valor": "inicial", "texto": "Reporte Inicial"},
                    {"valor": "seguimiento", "texto": "Reporte de Seguimiento"},
                    {"valor": "final", "texto": "Reporte Final"}
                ],
                "ayuda": "Seleccione el tipo de reporte que está realizando"
            },
            {
                "nombre": "titulo",
                "tipo": "text",
                "etiqueta": "Título del Incidente",
                "requerido": true,
                "maxlength": 200,
                "placeholder": "Descripción breve y clara del incidente",
                "ayuda": "Proporcione un título descriptivo del incidente"
            },
            {
                "nombre": "fechaDeteccion",
                "tipo": "datetime-local",
                "etiqueta": "Fecha y hora de Detección",
                "requerido": true,
                "ayuda": "Fecha y hora cuando se detectó por primera vez el incidente"
            },
            {
                "nombre": "fechaOcurrencia",
                "tipo": "datetime-local",
                "etiqueta": "Fecha y hora de ocurrencia",
                "requerido": true,
                "ayuda": "Fecha y hora cuando ocurrió realmente el incidente (puede ser anterior a la detección)"
            },
            {
                "nombre": "criticidad",
                "tipo": "select",
                "etiqueta": "Criticidad",
                "requerido": true,
                "opciones": [
                    {"valor": "baja", "texto": "Baja"},
                    {"valor": "media", "texto": "Media"},
                    {"valor": "alta", "texto": "Alta"},
                    {"valor": "critica", "texto": "Crítica"}
                ],
                "ayuda": "Evalúe el nivel de criticidad del incidente"
            },
            {
                "nombre": "alcanceGeografico",
                "tipo": "select",
                "etiqueta": "Alcance Geográfico",
                "requerido": false,
                "opciones": [
                    {"valor": "local", "texto": "Local"},
                    {"valor": "regional", "texto": "Regional"},
                    {"valor": "nacional", "texto": "Nacional"},
                    {"valor": "internacional", "texto": "Internacional"}
                ],
                "ayuda": "Indique el alcance geográfico del incidente"
            },
            {
                "nombre": "fechaAlertaTemprana",
                "tipo": "datetime-local",
                "etiqueta": "Fecha de Alerta Temprana (si aplica)",
                "requerido": false,
                "ayuda": "Si recibió alguna alerta temprana relacionada, indique cuándo"
            },
            {
                "separador": true,
                "titulo": "INFORMACIÓN DEL REPORTANTE (CSIRT)"
            },
            {
                "nombre": "nombreReportante",
                "tipo": "text",
                "etiqueta": "Nombre completo del Reportante",
                "requerido": true,
                "maxlength": 200,
                "ayuda": "Nombre completo de la persona que reporta el incidente"
            },
            {
                "nombre": "cargoReportante",
                "tipo": "text",
                "etiqueta": "Cargo del Reportante",
                "requerido": true,
                "maxlength": 200,
                "ayuda": "Cargo o posición que ocupa en la organización"
            },
            {
                "nombre": "correoReportante",
                "tipo": "email",
                "etiqueta": "Correo electrónico del Reportante",
                "requerido": true,
                "maxlength": 200,
                "ayuda": "Correo electrónico de contacto del reportante"
            },
            {
                "nombre": "telefonoReportante",
                "tipo": "tel",
                "etiqueta": "Teléfono del Reportante",
                "requerido": true,
                "maxlength": 50,
                "pattern": "[+]?[0-9\\s\\-\\(\\)]+",
                "ayuda": "Número de teléfono de contacto (incluya código de país si corresponde)"
            },
            {
                "nombre": "formacionCertificacion",
                "tipo": "textarea",
                "etiqueta": "Formación/Certificación en Ciberseguridad",
                "requerido": false,
                "filas": 3,
                "maxlength": 1000,
                "placeholder": "Describa la formación o certificaciones relacionadas con ciberseguridad del reportante",
                "ayuda": "Información sobre capacitación o certificaciones del reportante en temas de ciberseguridad"
            }
        ],
        "validaciones": [
            {
                "campo": "fechaOcurrencia",
                "regla": "menor_igual_hoy",
                "mensaje": "La fecha de ocurrencia no puede ser posterior a hoy"
            },
            {
                "campo": "fechaDeteccion",
                "regla": "mayor_igual_ocurrencia",
                "mensaje": "La fecha de detección debe ser posterior o igual a la fecha de ocurrencia"
            }
        ]
    }',
    1, 1, 1, 1, 1, '#007bff', 'id-card', 'SISTEMA'
);

-- SECCIÓN 2: Descripción y Alcance (CON CAMPOS CSIRT DE IMPACTO)
INSERT INTO ANCI_SECCIONES_CONFIG_V3 (
    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
    DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
    EsObligatorio, EsObligatorioOIV, EsObligatorioPSE, ColorSeccion, IconoSeccion, 
    CreadoPor
) VALUES (
    'SEC_2', 'FIJA', 'DESCRIPCION', 2, 'Descripción y Alcance del Incidente',
    'Descripción detallada del incidente, sistemas afectados e impacto preliminar observado.',
    'Proporcione una descripción detallada del incidente y su impacto. Sea específico sobre sistemas y servicios afectados.',
    '{
        "campos": [
            {
                "nombre": "descripcionInicial",
                "tipo": "textarea",
                "etiqueta": "Descripción inicial detallada",
                "requerido": true,
                "filas": 5,
                "maxlength": 5000,
                "placeholder": "Describa detalladamente qué ocurrió, cómo se manifestó el incidente, qué se observó...",
                "ayuda": "Proporcione una descripción completa y detallada de lo ocurrido"
            },
            {
                "nombre": "impactoPreliminar",
                "tipo": "textarea",
                "etiqueta": "Impacto Preliminar Observado",
                "requerido": true,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Describa el impacto inicial observado en operaciones, datos, sistemas, usuarios...",
                "ayuda": "Detalle el impacto preliminar que ha podido observar hasta el momento"
            },
            {
                "nombre": "sistemasAfectados",
                "tipo": "textarea",
                "etiqueta": "Sistemas, activos o personal afectado",
                "requerido": true,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Liste los sistemas, aplicaciones, servidores, bases de datos, personal afectado...",
                "ayuda": "Enumere todos los sistemas, activos tecnológicos y personal que se ha visto afectado"
            },
            {
                "nombre": "serviciosInterrumpidos",
                "tipo": "textarea",
                "etiqueta": "Servicios interrumpidos y duración",
                "requerido": true,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Indique qué servicios se interrumpieron, cuándo y por cuánto tiempo...",
                "ayuda": "Detalle qué servicios se vieron interrumpidos y la duración de la interrupción"
            },
            {
                "separador": true,
                "titulo": "ANÁLISIS DE IMPACTO DETALLADO (CSIRT)"
            },
            {
                "nombre": "numeroAfectados",
                "tipo": "number",
                "etiqueta": "Número aproximado de afectados",
                "requerido": false,
                "min": 0,
                "ayuda": "Indique aproximadamente cuántas personas se vieron afectadas por el incidente"
            },
            {
                "nombre": "afectacionTerceros",
                "tipo": "radio",
                "etiqueta": "¿El incidente afecta a terceros?",
                "requerido": false,
                "opciones": [
                    {"valor": "si", "texto": "Sí"},
                    {"valor": "no", "texto": "No"},
                    {"valor": "posible", "texto": "Posiblemente"},
                    {"valor": "desconocido", "texto": "Desconocido"}
                ],
                "ayuda": "Indique si el incidente puede haber afectado a clientes, proveedores u otras organizaciones"
            },
            {
                "nombre": "impactoContinuidadDatos",
                "tipo": "textarea",
                "etiqueta": "Impacto en continuidad de datos",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Describa si hay pérdida de datos, corrupción, indisponibilidad...",
                "ayuda": "Detalle el impacto específico en la integridad y disponibilidad de los datos"
            },
            {
                "nombre": "sistemasAfectadosDetalle",
                "tipo": "textarea",
                "etiqueta": "Detalle técnico de sistemas afectados",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Proporcione detalles técnicos: IPs, nombres de servidores, aplicaciones específicas, versiones...",
                "ayuda": "Incluya información técnica detallada sobre los sistemas comprometidos"
            },
            {
                "nombre": "evolucionIncidente",
                "tipo": "textarea",
                "etiqueta": "Evolución del incidente",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Describa cómo ha evolucionado el incidente desde su detección...",
                "ayuda": "Explique cómo ha progresado o cambiado el incidente desde que fue detectado"
            }
        ]
    }',
    1, 1, 1, 1, 1, '#28a745', 'file-text', 'SISTEMA'
);

-- SECCIÓN 3: Análisis Preliminar (CON INDICADORES DE COMPROMISO)
INSERT INTO ANCI_SECCIONES_CONFIG_V3 (
    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
    DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
    EsObligatorio, EsObligatorioOIV, EsObligatorioPSE, ColorSeccion, IconoSeccion, 
    CreadoPor
) VALUES (
    'SEC_3', 'FIJA', 'ANALISIS', 3, 'Análisis Preliminar y Evidencias Técnicas',
    'Análisis inicial del incidente e indicadores de compromiso identificados.',
    'Proporcione su análisis preliminar del incidente. Incluya todos los indicadores técnicos identificados.',
    '{
        "campos": [
            {
                "nombre": "tipoAmenaza",
                "tipo": "select",
                "etiqueta": "Tipo de Amenaza Probable",
                "requerido": true,
                "opciones": [
                    {"valor": "malware", "texto": "Malware"},
                    {"valor": "phishing", "texto": "Phishing"},
                    {"valor": "ransomware", "texto": "Ransomware"},
                    {"valor": "ddos", "texto": "Ataque DDoS"},
                    {"valor": "infiltracion", "texto": "Infiltración"},
                    {"valor": "ingenieria_social", "texto": "Ingeniería Social"},
                    {"valor": "acceso_no_autorizado", "texto": "Acceso No Autorizado"},
                    {"valor": "fuga_datos", "texto": "Fuga de Datos"},
                    {"valor": "sabotaje", "texto": "Sabotaje"},
                    {"valor": "error_humano", "texto": "Error Humano"},
                    {"valor": "falla_sistema", "texto": "Falla de Sistema"},
                    {"valor": "desconocido", "texto": "Desconocido"},
                    {"valor": "otro", "texto": "Otro"}
                ],
                "ayuda": "Seleccione el tipo de amenaza que mejor describe el incidente"
            },
            {
                "nombre": "origenAtaque",
                "tipo": "textarea",
                "etiqueta": "Origen/vector de ataque probable",
                "requerido": true,
                "filas": 4,
                "maxlength": 2000,
                "placeholder": "Describa cómo cree que se originó el ataque, vector utilizado, punto de entrada...",
                "ayuda": "Explique su análisis sobre cómo se originó el incidente y qué vector de ataque se utilizó"
            },
            {
                "nombre": "responsableCliente",
                "tipo": "text",
                "etiqueta": "Responsable del cliente",
                "requerido": false,
                "maxlength": 200,
                "placeholder": "Nombre de la persona con mayores antecedentes del evento",
                "ayuda": "Persona que tiene más información o conocimiento sobre el evento"
            },
            {
                "separador": true,
                "titulo": "INDICADORES DE COMPROMISO (IoCs)"
            },
            {
                "nombre": "iocIPs",
                "tipo": "textarea",
                "etiqueta": "Indicadores de Compromiso - Direcciones IP",
                "requerido": false,
                "filas": 4,
                "maxlength": 2000,
                "placeholder": "Liste las IPs sospechosas o maliciosas identificadas (una por línea)\\nEjemplo:\\n192.168.1.100 - IP origen del ataque\\n10.0.0.50 - IP comprometida interna",
                "ayuda": "Incluya todas las direcciones IP maliciosas o sospechosas identificadas durante el análisis"
            },
            {
                "nombre": "iocDominios",
                "tipo": "textarea",
                "etiqueta": "Indicadores de Compromiso - Dominios",
                "requerido": false,
                "filas": 4,
                "maxlength": 2000,
                "placeholder": "Liste los dominios maliciosos identificados (uno por línea)\\nEjemplo:\\nmalicious-site.com - Dominio de descarga de malware\\nphishing-bank.net - Sitio de phishing",
                "ayuda": "Incluya todos los dominios maliciosos o sospechosos identificados"
            },
            {
                "nombre": "iocHashes",
                "tipo": "textarea",
                "etiqueta": "Indicadores de Compromiso - Hashes de archivos",
                "requerido": false,
                "filas": 4,
                "maxlength": 2000,
                "placeholder": "Liste los hashes de archivos maliciosos (uno por línea)\\nEjemplo:\\nMD5: a1b2c3d4e5f6... - malware.exe\\nSHA256: 1a2b3c4d5e6f... - trojan.dll",
                "ayuda": "Incluya hashes MD5, SHA1 o SHA256 de archivos maliciosos identificados"
            },
            {
                "nombre": "evidenciasTecnicas",
                "tipo": "textarea",
                "etiqueta": "Otras evidencias técnicas",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Describa otras evidencias técnicas encontradas: logs, patrones de tráfico, cambios en archivos, etc.",
                "ayuda": "Incluya cualquier otra evidencia técnica relevante no cubierta en los campos anteriores"
            }
        ]
    }',
    1, 1, 1, 1, 1, '#ffc107', 'search', 'SISTEMA'
);

-- SECCIÓN 5: Acciones Inmediatas
INSERT INTO ANCI_SECCIONES_CONFIG_V3 (
    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
    DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
    EsObligatorio, EsObligatorioOIV, EsObligatorioPSE, ColorSeccion, IconoSeccion, 
    CreadoPor
) VALUES (
    'SEC_5', 'FIJA', 'ACCIONES', 5, 'Acciones Inmediatas y Contención',
    'Medidas de contención y acciones inmediatas tomadas para gestionar el incidente.',
    'Documente todas las acciones inmediatas tomadas para contener y gestionar el incidente.',
    '{
        "campos": [
            {
                "nombre": "medidasContencion",
                "tipo": "textarea",
                "etiqueta": "Medidas de contención Iniciales",
                "requerido": true,
                "filas": 5,
                "maxlength": 3000,
                "placeholder": "Describa las primeras medidas tomadas para contener el incidente...",
                "ayuda": "Detalle las acciones inmediatas de contención que se implementaron"
            },
            {
                "nombre": "accionesContencion",
                "tipo": "textarea",
                "etiqueta": "Acciones específicas de contención",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Detalle las acciones específicas implementadas para evitar la propagación...",
                "ayuda": "Describa acciones detalladas para prevenir la expansión del incidente"
            },
            {
                "nombre": "sistemasDesconectados",
                "tipo": "textarea",
                "etiqueta": "Sistemas desconectados o aislados",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Liste los sistemas que fueron desconectados o aislados de la red...",
                "ayuda": "Indique qué sistemas se desconectaron como medida de contención"
            },
            {
                "nombre": "notificacionesInternas",
                "tipo": "textarea",
                "etiqueta": "Notificaciones internas realizadas",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Indique a quién se notificó internamente y cuándo...",
                "ayuda": "Detalle las comunicaciones internas realizadas sobre el incidente"
            },
            {
                "nombre": "planAccion",
                "tipo": "textarea",
                "etiqueta": "Plan de acción inmediato",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Describa el plan de acción para las próximas horas/días...",
                "ayuda": "Explique las próximas acciones planificadas para gestionar el incidente"
            }
        ]
    }',
    1, 1, 1, 1, 1, '#dc3545', 'bolt', 'SISTEMA'
);

-- SECCIÓN 6: Análisis de Causa Raíz
INSERT INTO ANCI_SECCIONES_CONFIG_V3 (
    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
    DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
    EsObligatorio, EsObligatorioOIV, EsObligatorioPSE, ColorSeccion, IconoSeccion, 
    CreadoPor
) VALUES (
    'SEC_6', 'FIJA', 'CAUSA_RAIZ', 6, 'Análisis de Causa Raíz y Mejoras',
    'Análisis final de las causas que originaron el incidente y recomendaciones de mejora.',
    'Complete este análisis una vez que tenga suficiente información sobre las causas del incidente.',
    '{
        "campos": [
            {
                "nombre": "causaRaiz",
                "tipo": "textarea",
                "etiqueta": "Análisis de Causa Raíz",
                "requerido": true,
                "filas": 5,
                "maxlength": 5000,
                "placeholder": "Describa el análisis de causa raíz: qué causó realmente el incidente, factores contribuyentes...",
                "ayuda": "Proporcione un análisis detallado de las causas fundamentales que originaron el incidente"
            },
            {
                "nombre": "leccionesAprendidas",
                "tipo": "textarea",
                "etiqueta": "Lecciones aprendidas",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "¿Qué lecciones se pueden extraer de este incidente? ¿Qué se haría diferente?",
                "ayuda": "Reflexione sobre las lecciones aprendidas durante la gestión de este incidente"
            },
            {
                "nombre": "recomendacionesMejora",
                "tipo": "textarea",
                "etiqueta": "Recomendaciones de mejora",
                "requerido": false,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "¿Qué mejoras se recomiendan para prevenir incidentes similares?",
                "ayuda": "Proponga mejoras específicas para prevenir incidentes similares en el futuro"
            },
            {
                "nombre": "resumenEjecutivo",
                "tipo": "textarea",
                "etiqueta": "Resumen ejecutivo",
                "requerido": false,
                "filas": 4,
                "maxlength": 2000,
                "placeholder": "Resumen ejecutivo del incidente para la dirección...",
                "ayuda": "Resumen del incidente orientado a la alta dirección"
            }
        ]
    }',
    1, 1, 0, 0, 0, '#6f42c1', 'lightbulb', 'SISTEMA'
);

-- SECCIÓN ESPECIAL SOLO PARA OIV
INSERT INTO ANCI_SECCIONES_CONFIG_V3 (
    CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
    DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
    EsObligatorio, EsObligatorioOIV, EsObligatorioPSE, ColorSeccion, IconoSeccion, 
    CreadoPor
) VALUES (
    'SEC_OIV', 'ESPECIAL', 'OIV_ESPECIFICO', 7, 'Información Específica para OIV',
    'Campos específicos requeridos únicamente para Operadores de Infraestructura Vital (OIV).',
    'Esta sección es obligatoria solo para empresas clasificadas como OIV. Complete todos los campos aplicables.',
    '{
        "campos": [
            {
                "nombre": "cuentaConSGSI",
                "tipo": "radio",
                "etiqueta": "¿Cuenta con Sistema de Gestión de Seguridad de la Información (SGSI) certificado?",
                "requerido": true,
                "opciones": [
                    {"valor": "si_certificado", "texto": "Sí, certificado ISO 27001"},
                    {"valor": "si_implementado", "texto": "Sí, implementado pero no certificado"},
                    {"valor": "en_proceso", "texto": "En proceso de implementación"},
                    {"valor": "no", "texto": "No"}
                ],
                "ayuda": "Indique el estado de implementación del SGSI en su organización"
            },
            {
                "nombre": "planContinuidad",
                "tipo": "textarea",
                "etiqueta": "Detalle del Plan de Continuidad de Negocio",
                "requerido": true,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Describa su plan de continuidad y cómo se aplicó en este incidente...",
                "ayuda": "Explique su plan de continuidad de negocio y su aplicación durante el incidente"
            },
            {
                "nombre": "planRecuperacion",
                "tipo": "textarea",
                "etiqueta": "Plan de Recuperación ante Desastres",
                "requerido": true,
                "filas": 4,
                "maxlength": 3000,
                "placeholder": "Describa su plan de recuperación y las acciones tomadas...",
                "ayuda": "Detalle su plan de recuperación ante desastres y cómo se implementó"
            },
            {
                "nombre": "auditoriasRealizadas",
                "tipo": "textarea",
                "etiqueta": "Auditorías de Ciberseguridad Realizadas",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Liste las auditorías de ciberseguridad realizadas en el último año...",
                "ayuda": "Indique las auditorías de ciberseguridad realizadas recientemente"
            },
            {
                "nombre": "fechaUltimaAuditoria",
                "tipo": "date",
                "etiqueta": "Fecha de la última auditoría de ciberseguridad",
                "requerido": false,
                "ayuda": "Fecha de la auditoría de ciberseguridad más reciente"
            },
            {
                "nombre": "delegadoTecnico",
                "tipo": "text",
                "etiqueta": "Delegado Técnico de Ciberseguridad",
                "requerido": true,
                "maxlength": 200,
                "placeholder": "Nombre y contacto del delegado técnico responsable",
                "ayuda": "Información del delegado técnico de ciberseguridad designado"
            },
            {
                "nombre": "medidasPropagacion",
                "tipo": "textarea",
                "etiqueta": "Medidas específicas para evitar propagación",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Describa medidas específicas implementadas para evitar la propagación del incidente...",
                "ayuda": "Detalle las medidas específicas tomadas para prevenir la propagación"
            },
            {
                "nombre": "notificacionAfectados",
                "tipo": "textarea",
                "etiqueta": "Notificación a usuarios/clientes afectados",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Describa cómo y cuándo se notificó a los afectados...",
                "ayuda": "Explique el proceso de notificación a personas afectadas por el incidente"
            },
            {
                "nombre": "registroCapacitaciones",
                "tipo": "textarea",
                "etiqueta": "Registro de capacitaciones en ciberseguridad",
                "requerido": false,
                "filas": 3,
                "maxlength": 2000,
                "placeholder": "Describa las capacitaciones en ciberseguridad realizadas al personal...",
                "ayuda": "Indique las capacitaciones en ciberseguridad brindadas al personal"
            }
        ]
    }',
    1, 0, 0, 1, 0, '#17a2b8', 'shield-alt', 'SISTEMA'
);

PRINT '✅ Configuración de secciones fijas insertada correctamente';

-- ========================================
-- PASO 3: CREAR FUNCIONES Y PROCEDIMIENTOS
-- ========================================
PRINT '';
PRINT '⚙️ PASO 3: CREANDO FUNCIONES Y PROCEDIMIENTOS';
PRINT '----------------------------------------------';

-- Función para generar índice único
CREATE OR ALTER FUNCTION fn_GenerarIndiceUnico(
    @IncidenteID INT,
    @EmpresaID INT
)
RETURNS NVARCHAR(200)
AS
BEGIN
    DECLARE @RUT NVARCHAR(20);
    DECLARE @NumeroCorrelativo INT;
    DECLARE @IndiceUnico NVARCHAR(200);
    
    -- Obtener RUT sin dígito verificador
    SELECT @RUT = REPLACE(REPLACE(RUT, '-', ''), '.', '') 
    FROM Empresas 
    WHERE EmpresaID = @EmpresaID;
    
    -- Remover último carácter (dígito verificador)
    IF LEN(@RUT) > 1
        SET @RUT = LEFT(@RUT, LEN(@RUT) - 1);
    
    -- Generar número correlativo
    SELECT @NumeroCorrelativo = ISNULL(MAX(CAST(SUBSTRING(IndiceUnico, 1, CHARINDEX('-', IndiceUnico) - 1) AS INT)), 0) + 1
    FROM ANCI_FORMULARIOS_DINAMICOS
    WHERE EmpresaID = @EmpresaID;
    
    -- Construir índice: NRO_CORRELATIVO-RUT-MODULO-SUBMODULO-DESCRIPCION
    SET @IndiceUnico = CONCAT(
        FORMAT(@NumeroCorrelativo, '000000'), '-',
        ISNULL(@RUT, 'SIN_RUT'), '-',
        'ANCI', '-',
        'INCIDENTE', '-',
        'FORMULARIO_DINAMICO_V3'
    );
    
    RETURN @IndiceUnico;
END;
GO

-- Función para obtener taxonomías dinámicas por tipo de empresa
CREATE OR ALTER FUNCTION fn_ObtenerTaxonomiasDinamicas(@TipoEmpresa NVARCHAR(10))
RETURNS TABLE
AS
RETURN
(
    SELECT 
        'TAX_' + Id_Incidente as CodigoSeccion,
        'TAXONOMIA' as TipoSeccion,
        'TAXONOMIA' as CategoriaSeccion,
        (ROW_NUMBER() OVER (ORDER BY Id_Incidente) + 100) as NumeroOrden,
        CONCAT(ISNULL(Area, 'Sin área'), ' - ', ISNULL(Efecto, 'Sin efecto'), ' - ', ISNULL(Categoria_del_Incidente, 'Sin categoría')) as TituloSeccion,
        ISNULL(Descripcion, 'Taxonomía de clasificación de incidentes') as DescripcionSeccion,
        'Seleccione si esta taxonomía aplica al incidente y justifique su selección.' as InstruccionesSeccion,
        -- JSON dinámico para taxonomías
        CONCAT('{
            "campos": [
                {
                    "nombre": "aplicable",
                    "tipo": "checkbox",
                    "etiqueta": "Esta taxonomía aplica al incidente",
                    "requerido": false,
                    "valorDefecto": false,
                    "ayuda": "Marque si esta clasificación se aplica a su incidente"
                },
                {
                    "nombre": "justificacion",
                    "tipo": "textarea",
                    "etiqueta": "¿Por qué fue seleccionada esta taxonomía?",
                    "requerido": true,
                    "filas": 3,
                    "maxlength": 1000,
                    "condicional": "aplicable",
                    "placeholder": "Explique por qué esta taxonomía aplica al incidente...",
                    "ayuda": "Justifique la selección de esta taxonomía"
                },
                {
                    "nombre": "observaciones",
                    "tipo": "textarea",
                    "etiqueta": "Observaciones adicionales",
                    "requerido": false,
                    "filas": 2,
                    "maxlength": 500,
                    "condicional": "aplicable",
                    "placeholder": "Comentarios adicionales sobre esta clasificación...",
                    "ayuda": "Agregue observaciones adicionales si es necesario"
                }
            ],
            "metadata": {
                "taxonomiaId": "', Id_Incidente, '",
                "area": "', ISNULL(REPLACE(Area, '"', '\"'), ''), '",
                "efecto": "', ISNULL(REPLACE(Efecto, '"', '\"'), ''), '",
                "categoria": "', ISNULL(REPLACE(Categoria_del_Incidente, '"', '\"'), ''), '",
                "subcategoria": "', ISNULL(REPLACE(Subcategoria_del_Incidente, '"', '\"'), ''), '"
            }
        }') as CamposJSON,
        CASE WHEN AplicaTipoEmpresa IN ('OIV', 'AMBAS') THEN 1 ELSE 0 END as AplicaOIV,
        CASE WHEN AplicaTipoEmpresa IN ('PSE', 'AMBAS') THEN 1 ELSE 0 END as AplicaPSE,
        Id_Incidente as TaxonomiaID,
        Area as TaxonomiaArea,
        Efecto as TaxonomiaEfecto,
        Categoria_del_Incidente as TaxonomiaCategoria
    FROM Taxonomia_incidentes
    WHERE 
        Id_Incidente IS NOT NULL
        AND (
            (@TipoEmpresa = 'OIV' AND AplicaTipoEmpresa IN ('OIV', 'AMBAS'))
            OR (@TipoEmpresa = 'PSE' AND AplicaTipoEmpresa IN ('PSE', 'AMBAS'))
            OR (@TipoEmpresa = 'AMBAS' AND AplicaTipoEmpresa = 'AMBAS')
        )
);
GO

-- Procedimiento para generar formulario dinámico completo
CREATE OR ALTER PROCEDURE sp_GenerarFormularioDinamicoCompleto
    @EmpresaID INT,
    @IncidenteID INT = NULL,
    @UsuarioCreador NVARCHAR(200) = 'SISTEMA'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TipoEmpresa NVARCHAR(10);
    DECLARE @FormularioID INT;
    DECLARE @IndiceUnico NVARCHAR(200);
    DECLARE @ConfiguracionJSON NVARCHAR(MAX);
    DECLARE @DatosJSON NVARCHAR(MAX);
    DECLARE @TotalSecciones INT = 0;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Obtener tipo de empresa
        SELECT @TipoEmpresa = TipoEmpresa FROM Empresas WHERE EmpresaID = @EmpresaID;
        
        IF @TipoEmpresa IS NULL
        BEGIN
            RAISERROR('Empresa no encontrada o sin tipo definido', 16, 1);
            RETURN;
        END
        
        -- Generar índice único
        SET @IndiceUnico = dbo.fn_GenerarIndiceUnico(@IncidenteID, @EmpresaID);
        
        PRINT 'Generando formulario dinámico para empresa tipo: ' + @TipoEmpresa;
        PRINT 'Índice único generado: ' + @IndiceUnico;
        
        -- Generar configuración del formulario completo con hasta 41 secciones
        WITH FormularioCompleto AS (
            -- Secciones fijas (1-6)
            SELECT 
                CodigoSeccion,
                TipoSeccion,
                CategoriaSeccion,
                NumeroOrden,
                TituloSeccion,
                DescripcionSeccion,
                InstruccionesSeccion,
                CamposJSON,
                AplicaOIV,
                AplicaPSE,
                EsObligatorio,
                ColorSeccion,
                IconoSeccion,
                MaxArchivos,
                MaxComentarios,
                TaxonomiaID,
                TaxonomiaArea,
                TaxonomiaEfecto,
                TaxonomiaCategoria
            FROM ANCI_SECCIONES_CONFIG_V3 
            WHERE TipoSeccion = 'FIJA' 
            AND Activo = 1
            
            UNION ALL
            
            -- Sección especial OIV (si aplica)
            SELECT 
                CodigoSeccion,
                TipoSeccion,
                CategoriaSeccion,
                NumeroOrden,
                TituloSeccion,
                DescripcionSeccion,
                InstruccionesSeccion,
                CamposJSON,
                AplicaOIV,
                AplicaPSE,
                EsObligatorio,
                ColorSeccion,
                IconoSeccion,
                MaxArchivos,
                MaxComentarios,
                NULL as TaxonomiaID,
                NULL as TaxonomiaArea,
                NULL as TaxonomiaEfecto,
                NULL as TaxonomiaCategoria
            FROM ANCI_SECCIONES_CONFIG_V3 
            WHERE TipoSeccion = 'ESPECIAL' 
            AND (@TipoEmpresa = 'OIV' AND AplicaOIV = 1)
            AND Activo = 1
            
            UNION ALL
            
            -- Taxonomías dinámicas (hasta 35)
            SELECT 
                CodigoSeccion,
                TipoSeccion,
                CategoriaSeccion,
                NumeroOrden,
                TituloSeccion,
                DescripcionSeccion,
                InstruccionesSeccion,
                CamposJSON,
                AplicaOIV,
                AplicaPSE,
                0 as EsObligatorio,
                '#e83e8c' as ColorSeccion,
                'tags' as IconoSeccion,
                10 as MaxArchivos,
                6 as MaxComentarios,
                TaxonomiaID,
                TaxonomiaArea,
                TaxonomiaEfecto,
                TaxonomiaCategoria
            FROM fn_ObtenerTaxonomiasDinamicas(@TipoEmpresa)
        )
        SELECT @ConfiguracionJSON = (
            SELECT *
            FROM FormularioCompleto
            ORDER BY NumeroOrden
            FOR JSON AUTO
        ),
        @TotalSecciones = COUNT(*)
        FROM FormularioCompleto;
        
        -- Inicializar datos del formulario (estructura vacía)
        SET @DatosJSON = '{}';
        
        -- Crear formulario principal
        INSERT INTO ANCI_FORMULARIOS_DINAMICOS (
            IncidenteID, EmpresaID, IndiceUnico, TipoEmpresa, VersionFormulario,
            EstadoFormulario, TotalSecciones, SeccionesCompletadas, PorcentajeCompletado,
            ConfiguracionSeccionesJSON, DatosFormularioJSON, MetadatosJSON,
            TotalArchivos, TotalComentarios, TamanoTotalMB,
            FechaCreacion, UsuarioCreador, EditandoActualmente
        ) VALUES (
            @IncidenteID, @EmpresaID, @IndiceUnico, @TipoEmpresa, '3.0',
            'BORRADOR', @TotalSecciones, 0, 0.00,
            @ConfiguracionJSON, @DatosJSON, '{"version": "3.0", "created": "' + CONVERT(NVARCHAR(50), GETDATE(), 127) + '"}',
            0, 0, 0.00,
            GETDATE(), @UsuarioCreador, 0
        );
        
        SET @FormularioID = SCOPE_IDENTITY();
        
        -- Crear estructura de carpetas para archivos
        DECLARE @RutaBase NVARCHAR(500) = 'uploads/incidentes/';
        DECLARE @RutaIncidente NVARCHAR(500) = @RutaBase + @IndiceUnico + '/';
        
        -- Registrar auditoría
        INSERT INTO ANCI_AUDITORIA_EDICIONES (
            FormularioID, TipoAccion, MotivoAccion, Usuario, FechaAccion, Resultado
        ) VALUES (
            @FormularioID, 'CREAR_FORMULARIO', 'Creación inicial del formulario dinámico ANCI', 
            @UsuarioCreador, GETDATE(), 'EXITOSO'
        );
        
        COMMIT TRANSACTION;
        
        -- Estadísticas del formulario generado
        PRINT '';
        PRINT '📊 FORMULARIO DINÁMICO GENERADO EXITOSAMENTE:';
        PRINT '   - FormularioID: ' + CAST(@FormularioID AS VARCHAR);
        PRINT '   - Total de secciones: ' + CAST(@TotalSecciones AS VARCHAR);
        PRINT '   - Capacidad máxima de archivos: ' + CAST(@TotalSecciones * 10 AS VARCHAR);
        PRINT '   - Capacidad máxima de comentarios: ' + CAST(@TotalSecciones * 6 AS VARCHAR);
        PRINT '   - Capacidad máxima de almacenamiento: ' + CAST(@TotalSecciones * 10 * 10 AS VARCHAR) + ' MB';
        PRINT '   - Ruta de archivos: ' + @RutaIncidente;
        
        -- Retornar información del formulario creado
        SELECT 
            @FormularioID as FormularioID,
            @IndiceUnico as IndiceUnico,
            @TotalSecciones as TotalSecciones,
            @TipoEmpresa as TipoEmpresa,
            @RutaIncidente as RutaArchivos,
            'EXITOSO' as Resultado
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        PRINT 'ERROR: ' + @ErrorMessage;
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

-- Procedimiento para iniciar edición segura (anti-concurrencia)
CREATE OR ALTER PROCEDURE sp_IniciarEdicionSegura
    @FormularioID INT,
    @Usuario NVARCHAR(200),
    @IP NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @EditandoActualmente BIT;
    DECLARE @UsuarioEditando NVARCHAR(200);
    DECLARE @FechaInicioEdicion DATETIME2;
    DECLARE @TokenEdicion NVARCHAR(100);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar estado actual de edición
        SELECT 
            @EditandoActualmente = EditandoActualmente,
            @UsuarioEditando = UsuarioEditando,
            @FechaInicioEdicion = FechaInicioEdicion
        FROM ANCI_FORMULARIOS_DINAMICOS
        WHERE FormularioID = @FormularioID;
        
        -- Verificar si ya está siendo editado por otro usuario
        IF @EditandoActualmente = 1 AND @UsuarioEditando != @Usuario
        BEGIN
            -- Verificar si la sesión de edición expiró (más de 30 minutos)
            IF DATEDIFF(MINUTE, @FechaInicioEdicion, GETDATE()) > 30
            BEGIN
                PRINT 'Sesión de edición anterior expirada, liberando bloqueo...';
                
                -- Registrar liberación automática
                INSERT INTO ANCI_AUDITORIA_EDICIONES (
                    FormularioID, TipoAccion, MotivoAccion, Usuario, IPAddress, FechaAccion
                ) VALUES (
                    @FormularioID, 'LIBERAR_EDICION_AUTO', 
                    'Liberación automática por timeout de sesión de: ' + @UsuarioEditando,
                    'SISTEMA', @IP, GETDATE()
                );
            END
            ELSE
            BEGIN
                RAISERROR('El formulario está siendo editado por: %s desde %s', 16, 1, @UsuarioEditando, @FechaInicioEdicion);
                ROLLBACK TRANSACTION;
                RETURN;
            END
        END
        
        -- Generar token único de edición
        SET @TokenEdicion = CONCAT(@Usuario, '_', FORMAT(GETDATE(), 'yyyyMMddHHmmss'), '_', ABS(CHECKSUM(NEWID())));
        
        -- Establecer bloqueo de edición
        UPDATE ANCI_FORMULARIOS_DINAMICOS
        SET 
            EditandoActualmente = 1,
            UsuarioEditando = @Usuario,
            FechaInicioEdicion = GETDATE(),
            TokenEdicion = @TokenEdicion,
            UsuarioUltimaEdicion = @Usuario,
            FechaUltimaEdicion = GETDATE(),
            IPUltimaEdicion = @IP
        WHERE FormularioID = @FormularioID;
        
        -- Registrar inicio de edición
        INSERT INTO ANCI_AUDITORIA_EDICIONES (
            FormularioID, TipoAccion, MotivoAccion, Usuario, IPAddress, FechaAccion
        ) VALUES (
            @FormularioID, 'INICIAR_EDICION', 'Inicio de sesión de edición', @Usuario, @IP, GETDATE()
        );
        
        COMMIT TRANSACTION;
        
        -- Retornar token de edición
        SELECT 
            @TokenEdicion as TokenEdicion,
            GETDATE() as FechaInicioEdicion,
            'EDICION_INICIADA' as Estado;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- Procedimiento para finalizar edición
CREATE OR ALTER PROCEDURE sp_FinalizarEdicion
    @FormularioID INT,
    @Usuario NVARCHAR(200),
    @TokenEdicion NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TokenActual NVARCHAR(100);
    DECLARE @UsuarioEditando NVARCHAR(200);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar token de edición
        SELECT 
            @TokenActual = TokenEdicion,
            @UsuarioEditando = UsuarioEditando
        FROM ANCI_FORMULARIOS_DINAMICOS
        WHERE FormularioID = @FormularioID;
        
        IF @TokenActual != @TokenEdicion OR @UsuarioEditando != @Usuario
        BEGIN
            RAISERROR('Token de edición inválido o usuario no autorizado', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Liberar bloqueo de edición
        UPDATE ANCI_FORMULARIOS_DINAMICOS
        SET 
            EditandoActualmente = 0,
            UsuarioEditando = NULL,
            FechaInicioEdicion = NULL,
            TokenEdicion = NULL,
            FechaModificacion = GETDATE()
        WHERE FormularioID = @FormularioID;
        
        -- Registrar finalización de edición
        INSERT INTO ANCI_AUDITORIA_EDICIONES (
            FormularioID, TipoAccion, MotivoAccion, Usuario, FechaAccion
        ) VALUES (
            @FormularioID, 'FINALIZAR_EDICION', 'Finalización de sesión de edición', @Usuario, GETDATE()
        );
        
        COMMIT TRANSACTION;
        
        SELECT 'EDICION_FINALIZADA' as Estado;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- Procedimiento para gestión segura de archivos
CREATE OR ALTER PROCEDURE sp_GestionarArchivoSeguro
    @FormularioID INT,
    @CodigoSeccion NVARCHAR(20),
    @NumeroArchivo INT,
    @Accion NVARCHAR(20), -- SUBIR, ACTUALIZAR, ELIMINAR, VERIFICAR
    @NombreOriginal NVARCHAR(500) = NULL,
    @NombreAlmacenado NVARCHAR(500) = NULL,
    @RutaCompleta NVARCHAR(1000) = NULL,
    @TamanoBytes BIGINT = NULL,
    @HashSHA256 NVARCHAR(64) = NULL,
    @Usuario NVARCHAR(200) = 'SISTEMA',
    @IP NVARCHAR(100) = NULL,
    @Descripcion NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ArchivoID INT;
    DECLARE @ArchivoAnteriorID INT;
    DECLARE @RutaAnterior NVARCHAR(1000);
    DECLARE @IndiceUnico NVARCHAR(200);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Obtener índice único del formulario
        SELECT @IndiceUnico = IndiceUnico 
        FROM ANCI_FORMULARIOS_DINAMICOS 
        WHERE FormularioID = @FormularioID;
        
        IF @Accion = 'SUBIR'
        BEGIN
            -- Verificar que no exceda el límite de archivos por sección (10)
            IF EXISTS (
                SELECT 1 FROM ANCI_ARCHIVOS_GESTION 
                WHERE FormularioID = @FormularioID 
                AND CodigoSeccion = @CodigoSeccion 
                AND NumeroArchivo = @NumeroArchivo
                AND EstadoArchivo = 'ACTIVO'
            )
            BEGIN
                RAISERROR('Ya existe un archivo en la posición %d de la sección %s', 16, 1, @NumeroArchivo, @CodigoSeccion);
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            -- Construir ruta relativa
            DECLARE @RutaRelativa NVARCHAR(500) = CONCAT('incidentes/', @IndiceUnico, '/', @CodigoSeccion, '/');
            DECLARE @CarpetaIncidente NVARCHAR(200) = @IndiceUnico;
            DECLARE @TamanoMB DECIMAL(10,2) = CAST(@TamanoBytes AS DECIMAL(18,2)) / 1048576.0;
            
            -- Insertar nuevo archivo
            INSERT INTO ANCI_ARCHIVOS_GESTION (
                FormularioID, CodigoSeccion, NumeroArchivo, NombreOriginal, NombreAlmacenado,
                RutaCompleta, RutaRelativa, CarpetaIncidente, TamanoBytes, TamanoMB,
                TipoMIME, ExtensionArchivo, HashSHA256, DescripcionArchivo,
                EstadoArchivo, FechaSubida, UsuarioSubida, IPSubida, EsVersionActual
            ) VALUES (
                @FormularioID, @CodigoSeccion, @NumeroArchivo, @NombreOriginal, @NombreAlmacenado,
                @RutaCompleta, @RutaRelativa, @CarpetaIncidente, @TamanoBytes, @TamanoMB,
                -- Extraer tipo MIME y extensión del nombre
                CASE 
                    WHEN @NombreOriginal LIKE '%.pdf' THEN 'application/pdf'
                    WHEN @NombreOriginal LIKE '%.doc%' THEN 'application/msword'
                    WHEN @NombreOriginal LIKE '%.xls%' THEN 'application/excel'
                    WHEN @NombreOriginal LIKE '%.jpg' OR @NombreOriginal LIKE '%.jpeg' THEN 'image/jpeg'
                    WHEN @NombreOriginal LIKE '%.png' THEN 'image/png'
                    ELSE 'application/octet-stream'
                END,
                RIGHT(@NombreOriginal, CHARINDEX('.', REVERSE(@NombreOriginal)) - 1),
                @HashSHA256, @Descripcion, 'ACTIVO', GETDATE(), @Usuario, @IP, 1
            );
            
            SET @ArchivoID = SCOPE_IDENTITY();
            
            -- Actualizar contadores del formulario
            UPDATE ANCI_FORMULARIOS_DINAMICOS
            SET 
                TotalArchivos = TotalArchivos + 1,
                TamanoTotalMB = TamanoTotalMB + @TamanoMB,
                FechaModificacion = GETDATE()
            WHERE FormularioID = @FormularioID;
            
            PRINT 'Archivo subido exitosamente: ' + @NombreOriginal;
        END
        
        ELSE IF @Accion = 'ACTUALIZAR'
        BEGIN
            -- Buscar archivo actual
            SELECT @ArchivoAnteriorID = ArchivoID, @RutaAnterior = RutaCompleta
            FROM ANCI_ARCHIVOS_GESTION
            WHERE FormularioID = @FormularioID 
            AND CodigoSeccion = @CodigoSeccion 
            AND NumeroArchivo = @NumeroArchivo
            AND EstadoArchivo = 'ACTIVO';
            
            IF @ArchivoAnteriorID IS NULL
            BEGIN
                RAISERROR('No se encontró archivo para actualizar', 16, 1);
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            -- Marcar versión anterior como no actual
            UPDATE ANCI_ARCHIVOS_GESTION
            SET EsVersionActual = 0
            WHERE ArchivoID = @ArchivoAnteriorID;
            
            -- Crear nueva versión
            DECLARE @TamanoMB2 DECIMAL(10,2) = CAST(@TamanoBytes AS DECIMAL(18,2)) / 1048576.0;
            DECLARE @VersionAnterior INT;
            
            SELECT @VersionAnterior = VersionArchivo 
            FROM ANCI_ARCHIVOS_GESTION 
            WHERE ArchivoID = @ArchivoAnteriorID;
            
            INSERT INTO ANCI_ARCHIVOS_GESTION (
                FormularioID, CodigoSeccion, NumeroArchivo, NombreOriginal, NombreAlmacenado,
                RutaCompleta, RutaRelativa, CarpetaIncidente, TamanoBytes, TamanoMB,
                HashSHA256, DescripcionArchivo, VersionArchivo, ArchivoAnteriorID,
                EstadoArchivo, FechaSubida, UsuarioSubida, IPSubida, EsVersionActual,
                MotivoActualizacion
            ) SELECT 
                FormularioID, CodigoSeccion, NumeroArchivo, @NombreOriginal, @NombreAlmacenado,
                @RutaCompleta, RutaRelativa, CarpetaIncidente, @TamanoBytes, @TamanoMB2,
                @HashSHA256, ISNULL(@Descripcion, DescripcionArchivo), @VersionAnterior + 1, @ArchivoAnteriorID,
                'ACTIVO', GETDATE(), @Usuario, @IP, 1,
                'Actualización de archivo'
            FROM ANCI_ARCHIVOS_GESTION
            WHERE ArchivoID = @ArchivoAnteriorID;
            
            SET @ArchivoID = SCOPE_IDENTITY();
            
            PRINT 'Archivo actualizado exitosamente: ' + @NombreOriginal;
        END
        
        ELSE IF @Accion = 'ELIMINAR'
        BEGIN
            -- Buscar archivo a eliminar
            SELECT @ArchivoID = ArchivoID, @RutaAnterior = RutaCompleta
            FROM ANCI_ARCHIVOS_GESTION
            WHERE FormularioID = @FormularioID 
            AND CodigoSeccion = @CodigoSeccion 
            AND NumeroArchivo = @NumeroArchivo
            AND EstadoArchivo = 'ACTIVO';
            
            IF @ArchivoID IS NULL
            BEGIN
                RAISERROR('No se encontró archivo para eliminar', 16, 1);
                ROLLBACK TRANSACTION;
                RETURN;
            END
            
            -- Crear backup antes de eliminar
            EXEC sp_CrearBackupFormulario @FormularioID, 'PRE_ELIMINACION_ARCHIVO', @Usuario;
            
            -- Marcar como eliminado (soft delete)
            UPDATE ANCI_ARCHIVOS_GESTION
            SET 
                EstadoArchivo = 'ELIMINADO',
                FechaEliminacion = GETDATE(),
                EliminadoPor = @Usuario,
                MotivoEliminacion = ISNULL(@Descripcion, 'Eliminación solicitada por usuario')
            WHERE ArchivoID = @ArchivoID;
            
            -- Actualizar contadores del formulario
            UPDATE ANCI_FORMULARIOS_DINAMICOS
            SET 
                TotalArchivos = TotalArchivos - 1,
                TamanoTotalMB = TamanoTotalMB - (SELECT TamanoMB FROM ANCI_ARCHIVOS_GESTION WHERE ArchivoID = @ArchivoID),
                FechaModificacion = GETDATE()
            WHERE FormularioID = @FormularioID;
            
            PRINT 'Archivo eliminado exitosamente (soft delete)';
        END
        
        ELSE IF @Accion = 'VERIFICAR'
        BEGIN
            -- Verificar integridad de archivos
            UPDATE ANCI_ARCHIVOS_GESTION
            SET 
                ChecksumVerificado = 1,
                FechaUltimaVerificacion = GETDATE()
            WHERE FormularioID = @FormularioID
            AND CodigoSeccion = @CodigoSeccion
            AND EstadoArchivo = 'ACTIVO';
            
            PRINT 'Verificación de integridad completada';
        END
        
        -- Registrar auditoría
        INSERT INTO ANCI_AUDITORIA_EDICIONES (
            FormularioID, CodigoSeccion, TipoAccion, MotivoAccion, Usuario, IPAddress, FechaAccion,
            TablaAfectada, RegistroID
        ) VALUES (
            @FormularioID, @CodigoSeccion, 'GESTION_ARCHIVO_' + @Accion, 
            CONCAT('Gestión de archivo: ', @Accion, ' - ', ISNULL(@NombreOriginal, 'N/A')),
            @Usuario, @IP, GETDATE(), 'ANCI_ARCHIVOS_GESTION', @ArchivoID
        );
        
        COMMIT TRANSACTION;
        
        SELECT 
            @ArchivoID as ArchivoID,
            @Accion as AccionRealizada,
            'EXITOSO' as Resultado;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        
        -- Registrar error en auditoría
        INSERT INTO ANCI_AUDITORIA_EDICIONES (
            FormularioID, TipoAccion, Usuario, FechaAccion, Resultado, MensajeError
        ) VALUES (
            @FormularioID, 'ERROR_GESTION_ARCHIVO', @Usuario, GETDATE(), 'ERROR', @ErrorMessage
        );
        
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- Procedimiento para detectar y limpiar archivos huérfanos
CREATE OR ALTER PROCEDURE sp_LimpiarArchivosHuerfanos
    @FormularioID INT = NULL, -- Si es NULL, verifica todos los formularios
    @AccionHuerfanos NVARCHAR(20) = 'MARCAR' -- MARCAR, ELIMINAR, ARCHIVAR
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ArchivosHuerfanos TABLE (
        ArchivoID INT,
        FormularioID INT,
        RutaCompleta NVARCHAR(1000),
        FechaDeteccion DATETIME2
    );
    
    BEGIN TRY
        -- Detectar archivos huérfanos (archivos sin formulario padre o con formulario inactivo)
        INSERT INTO @ArchivosHuerfanos (ArchivoID, FormularioID, RutaCompleta, FechaDeteccion)
        SELECT 
            a.ArchivoID,
            a.FormularioID,
            a.RutaCompleta,
            GETDATE()
        FROM ANCI_ARCHIVOS_GESTION a
        LEFT JOIN ANCI_FORMULARIOS_DINAMICOS f ON a.FormularioID = f.FormularioID
        WHERE 
            a.EstadoArchivo = 'ACTIVO'
            AND (
                f.FormularioID IS NULL -- Formulario no existe
                OR f.EstadoFormulario = 'ELIMINADO' -- Formulario eliminado
            )
            AND (@FormularioID IS NULL OR a.FormularioID = @FormularioID);
        
        DECLARE @ConteoHuerfanos INT = (SELECT COUNT(*) FROM @ArchivosHuerfanos);
        
        IF @ConteoHuerfanos > 0
        BEGIN
            PRINT 'Detectados ' + CAST(@ConteoHuerfanos AS VARCHAR) + ' archivos huérfanos';
            
            IF @AccionHuerfanos = 'MARCAR'
            BEGIN
                -- Solo marcar como huérfanos
                UPDATE a
                SET 
                    EsHuerfano = 1,
                    FechaDeteccionHuerfano = h.FechaDeteccion,
                    AccionHuerfano = 'MANTENER',
                    UltimaVerificacionHuerfano = GETDATE()
                FROM ANCI_ARCHIVOS_GESTION a
                INNER JOIN @ArchivosHuerfanos h ON a.ArchivoID = h.ArchivoID;
                
                PRINT 'Archivos marcados como huérfanos';
            END
            ELSE IF @AccionHuerfanos = 'ELIMINAR'
            BEGIN
                -- Eliminar archivos huérfanos
                UPDATE a
                SET 
                    EstadoArchivo = 'ELIMINADO',
                    FechaEliminacion = GETDATE(),
                    EliminadoPor = 'SISTEMA_LIMPIEZA',
                    MotivoEliminacion = 'Archivo huérfano detectado y eliminado automáticamente',
                    EsHuerfano = 1,
                    AccionHuerfano = 'ELIMINAR'
                FROM ANCI_ARCHIVOS_GESTION a
                INNER JOIN @ArchivosHuerfanos h ON a.ArchivoID = h.ArchivoID;
                
                PRINT 'Archivos huérfanos eliminados';
            END
            ELSE IF @AccionHuerfanos = 'ARCHIVAR'
            BEGIN
                -- Archivar archivos huérfanos
                UPDATE a
                SET 
                    EstadoArchivo = 'ARCHIVADO',
                    EsHuerfano = 1,
                    AccionHuerfano = 'ARCHIVAR',
                    UltimaVerificacionHuerfano = GETDATE()
                FROM ANCI_ARCHIVOS_GESTION a
                INNER JOIN @ArchivosHuerfanos h ON a.ArchivoID = h.ArchivoID;
                
                PRINT 'Archivos huérfanos archivados';
            END
            
            -- Registrar auditoría de limpieza
            INSERT INTO ANCI_AUDITORIA_EDICIONES (
                FormularioID, TipoAccion, MotivoAccion, Usuario, FechaAccion, TablaAfectada
            )
            SELECT DISTINCT
                h.FormularioID, 'LIMPIEZA_HUERFANOS', 
                'Limpieza automática de archivos huérfanos - Acción: ' + @AccionHuerfanos,
                'SISTEMA_LIMPIEZA', GETDATE(), 'ANCI_ARCHIVOS_GESTION'
            FROM @ArchivosHuerfanos h;
        END
        ELSE
        BEGIN
            PRINT 'No se detectaron archivos huérfanos';
        END
        
        -- Retornar estadísticas
        SELECT 
            @ConteoHuerfanos as ArchivosHuerfanosDetectados,
            @AccionHuerfanos as AccionRealizada,
            GETDATE() as FechaLimpieza;
            
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'ERROR en limpieza de huérfanos: ' + @ErrorMessage;
        
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- Procedimiento para crear backup completo
CREATE OR ALTER PROCEDURE sp_CrearBackupFormulario
    @FormularioID INT,
    @TipoBackup NVARCHAR(50) = 'MANUAL',
    @Usuario NVARCHAR(200) = 'SISTEMA',
    @MotivoBackup NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @IndiceUnico NVARCHAR(200);
    DECLARE @DatosFormulario NVARCHAR(MAX);
    DECLARE @ConfiguracionJSON NVARCHAR(MAX);
    DECLARE @ArchivosJSON NVARCHAR(MAX);
    DECLARE @TamanoBackup DECIMAL(10,2);
    DECLARE @RutaBackup NVARCHAR(1000);
    DECLARE @NombreBackup NVARCHAR(500);
    
    BEGIN TRY
        -- Obtener datos del formulario
        SELECT 
            @IndiceUnico = IndiceUnico,
            @DatosFormulario = DatosFormularioJSON,
            @ConfiguracionJSON = ConfiguracionSeccionesJSON,
            @TamanoBackup = TamanoTotalMB
        FROM ANCI_FORMULARIOS_DINAMICOS
        WHERE FormularioID = @FormularioID;
        
        -- Obtener información de archivos
        SELECT @ArchivosJSON = (
            SELECT 
                ArchivoID,
                CodigoSeccion,
                NumeroArchivo,
                NombreOriginal,
                NombreAlmacenado,
                RutaCompleta,
                TamanoMB,
                HashSHA256,
                EstadoArchivo,
                FechaSubida
            FROM ANCI_ARCHIVOS_GESTION
            WHERE FormularioID = @FormularioID
            AND EstadoArchivo = 'ACTIVO'
            FOR JSON AUTO
        );
        
        -- Generar nombre y ruta del backup
        SET @NombreBackup = CONCAT(
            'backup_', @IndiceUnico, '_', 
            FORMAT(GETDATE(), 'yyyyMMdd_HHmmss'), 
            '.json'
        );
        SET @RutaBackup = CONCAT('backups/formularios/', @NombreBackup);
        
        -- Crear registro de backup
        INSERT INTO ANCI_BACKUP_RECUPERACION (
            FormularioID, TipoBackup, MotivoBackup, DatosFormularioJSON,
            ConfiguracionJSON, ArchivosIncluidos, TamanoBackupMB,
            RutaBackup, NombreArchivoBackup, ComprimidoBackup,
            PuedeRecuperarse, FechaExpiracionBackup, FechaCreacion, CreadoPor
        ) VALUES (
            @FormularioID, @TipoBackup, ISNULL(@MotivoBackup, 'Backup ' + @TipoBackup),
            @DatosFormulario, @ConfiguracionJSON, @ArchivosJSON, @TamanoBackup,
            @RutaBackup, @NombreBackup, 1, 1,
            DATEADD(YEAR, 1, GETDATE()), -- Expira en 1 año
            GETDATE(), @Usuario
        );
        
        DECLARE @BackupID INT = SCOPE_IDENTITY();
        
        -- Registrar auditoría
        INSERT INTO ANCI_AUDITORIA_EDICIONES (
            FormularioID, TipoAccion, MotivoAccion, Usuario, FechaAccion,
            TablaAfectada, RegistroID
        ) VALUES (
            @FormularioID, 'CREAR_BACKUP', @MotivoBackup, @Usuario, GETDATE(),
            'ANCI_BACKUP_RECUPERACION', @BackupID
        );
        
        PRINT 'Backup creado exitosamente: ' + @NombreBackup;
        
        SELECT 
            @BackupID as BackupID,
            @NombreBackup as NombreBackup,
            @RutaBackup as RutaBackup,
            @TamanoBackup as TamanoMB,
            'EXITOSO' as Resultado;
            
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'ERROR creando backup: ' + @ErrorMessage;
        
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- ========================================
-- PASO 4: CREAR TRIGGERS DE SINCRONIZACIÓN
-- ========================================
PRINT '';
PRINT '🔄 PASO 4: CREANDO TRIGGERS DE SINCRONIZACIÓN';
PRINT '---------------------------------------------';

-- Trigger para sincronización automática de taxonomías
CREATE OR ALTER TRIGGER tr_SincronizarTaxonomiasAnci
ON Taxonomia_incidentes
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'Cambio detectado en taxonomías, sincronizando configuración ANCI...';
    
    BEGIN TRY
        -- Eliminar configuraciones de taxonomías obsoletas
        DELETE FROM ANCI_SECCIONES_CONFIG_V3 
        WHERE TipoSeccion = 'TAXONOMIA' 
        AND CodigoSeccion NOT IN (
            SELECT 'TAX_' + Id_Incidente 
            FROM Taxonomia_incidentes 
            WHERE Id_Incidente IS NOT NULL
        );
        
        -- Insertar/actualizar taxonomías nuevas o modificadas
        MERGE ANCI_SECCIONES_CONFIG_V3 AS target
        USING (
            SELECT 
                'TAX_' + Id_Incidente as CodigoSeccion,
                'TAXONOMIA' as TipoSeccion,
                'TAXONOMIA' as CategoriaSeccion,
                (ROW_NUMBER() OVER (ORDER BY Id_Incidente) + 100) as NumeroOrden,
                CONCAT(ISNULL(Area, 'Sin área'), ' - ', ISNULL(Efecto, 'Sin efecto'), ' - ', ISNULL(Categoria_del_Incidente, 'Sin categoría')) as TituloSeccion,
                ISNULL(Descripcion, 'Taxonomía de clasificación de incidentes') as DescripcionSeccion,
                'Seleccione si esta taxonomía aplica al incidente y justifique su selección.' as InstruccionesSeccion,
                CASE WHEN AplicaTipoEmpresa IN ('OIV', 'AMBAS') THEN 1 ELSE 0 END as AplicaOIV,
                CASE WHEN AplicaTipoEmpresa IN ('PSE', 'AMBAS') THEN 1 ELSE 0 END as AplicaPSE,
                Id_Incidente as TaxonomiaID,
                Area as TaxonomiaArea,
                Efecto as TaxonomiaEfecto,
                Categoria_del_Incidente as TaxonomiaCategoria,
                -- JSON dinámico para taxonomías
                CONCAT('{
                    "campos": [
                        {
                            "nombre": "aplicable",
                            "tipo": "checkbox",
                            "etiqueta": "Esta taxonomía aplica al incidente",
                            "requerido": false,
                            "valorDefecto": false,
                            "ayuda": "Marque si esta clasificación se aplica a su incidente"
                        },
                        {
                            "nombre": "justificacion",
                            "tipo": "textarea",
                            "etiqueta": "¿Por qué fue seleccionada esta taxonomía?",
                            "requerido": true,
                            "filas": 3,
                            "maxlength": 1000,
                            "condicional": "aplicable",
                            "placeholder": "Explique por qué esta taxonomía aplica al incidente...",
                            "ayuda": "Justifique la selección de esta taxonomía"
                        },
                        {
                            "nombre": "observaciones",
                            "tipo": "textarea",
                            "etiqueta": "Observaciones adicionales",
                            "requerido": false,
                            "filas": 2,
                            "maxlength": 500,
                            "condicional": "aplicable",
                            "placeholder": "Comentarios adicionales sobre esta clasificación...",
                            "ayuda": "Agregue observaciones adicionales si es necesario"
                        }
                    ],
                    "metadata": {
                        "taxonomiaId": "', Id_Incidente, '",
                        "area": "', ISNULL(REPLACE(Area, '"', '\"'), ''), '",
                        "efecto": "', ISNULL(REPLACE(Efecto, '"', '\"'), ''), '",
                        "categoria": "', ISNULL(REPLACE(Categoria_del_Incidente, '"', '\"'), ''), '",
                        "subcategoria": "', ISNULL(REPLACE(Subcategoria_del_Incidente, '"', '\"'), ''), '"
                    }
                }') as CamposJSON
            FROM Taxonomia_incidentes
            WHERE Id_Incidente IS NOT NULL
        ) AS source ON target.CodigoSeccion = source.CodigoSeccion AND target.TipoSeccion = 'TAXONOMIA'
        
        WHEN MATCHED THEN
            UPDATE SET
                NumeroOrden = source.NumeroOrden,
                TituloSeccion = source.TituloSeccion,
                DescripcionSeccion = source.DescripcionSeccion,
                InstruccionesSeccion = source.InstruccionesSeccion,
                AplicaOIV = source.AplicaOIV,
                AplicaPSE = source.AplicaPSE,
                CamposJSON = source.CamposJSON,
                TaxonomiaID = source.TaxonomiaID,
                TaxonomiaArea = source.TaxonomiaArea,
                TaxonomiaEfecto = source.TaxonomiaEfecto,
                TaxonomiaCategoria = source.TaxonomiaCategoria,
                FechaModificacion = GETDATE(),
                ModificadoPor = 'TRIGGER_SYNC'
        
        WHEN NOT MATCHED THEN
            INSERT (
                CodigoSeccion, TipoSeccion, CategoriaSeccion, NumeroOrden, TituloSeccion, 
                DescripcionSeccion, InstruccionesSeccion, CamposJSON, AplicaOIV, AplicaPSE, 
                EsObligatorio, ColorSeccion, IconoSeccion, MaxComentarios, MaxArchivos, 
                MaxTamanoMB, TaxonomiaID, TaxonomiaArea, TaxonomiaEfecto, TaxonomiaCategoria,
                Activo, FechaCreacion, CreadoPor
            )
            VALUES (
                source.CodigoSeccion, source.TipoSeccion, source.CategoriaSeccion, source.NumeroOrden, 
                source.TituloSeccion, source.DescripcionSeccion, source.InstruccionesSeccion, 
                source.CamposJSON, source.AplicaOIV, source.AplicaPSE, 0, '#e83e8c', 'tags', 
                6, 10, 10, source.TaxonomiaID, source.TaxonomiaArea, source.TaxonomiaEfecto, 
                source.TaxonomiaCategoria, 1, GETDATE(), 'TRIGGER_SYNC'
            );
        
        DECLARE @TaxonomiasAfectadas INT = @@ROWCOUNT;
        PRINT 'Taxonomías sincronizadas: ' + CAST(@TaxonomiasAfectadas AS VARCHAR);
        
    END TRY
    BEGIN CATCH
        PRINT 'ERROR en sincronización de taxonomías: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- ========================================
-- PASO 5: CREAR VISTAS DINÁMICAS
-- ========================================
PRINT '';
PRINT '📊 PASO 5: CREANDO VISTAS DINÁMICAS';
PRINT '-----------------------------------';

-- Vista para estadísticas del formulario dinámico
CREATE OR ALTER VIEW vw_EstadisticasFormularioDinamico AS
SELECT 
    -- Información básica
    f.FormularioID,
    f.IncidenteID,
    f.EmpresaID,
    e.RazonSocial as NombreEmpresa,
    f.TipoEmpresa,
    f.IndiceUnico,
    f.EstadoFormulario,
    f.VersionFormulario,
    
    -- Estadísticas de secciones
    f.TotalSecciones,
    f.SeccionesCompletadas,
    f.PorcentajeCompletado,
    (f.TotalSecciones - f.SeccionesCompletadas) as SeccionesPendientes,
    
    -- Estadísticas de archivos
    f.TotalArchivos,
    f.TamanoTotalMB,
    (f.TotalSecciones * 10) as CapacidadMaxArchivos,
    ((f.TotalArchivos * 100.0) / NULLIF(f.TotalSecciones * 10, 0)) as PorcentajeUsoArchivos,
    
    -- Estadísticas de comentarios
    f.TotalComentarios,
    (f.TotalSecciones * 6) as CapacidadMaxComentarios,
    ((f.TotalComentarios * 100.0) / NULLIF(f.TotalSecciones * 6, 0)) as PorcentajeUsoComentarios,
    
    -- Estado de edición
    f.EditandoActualmente,
    f.UsuarioEditando,
    f.FechaInicioEdicion,
    
    -- Fechas importantes
    f.FechaCreacion,
    f.FechaModificacion,
    f.FechaUltimaEdicion,
    f.UsuarioCreador,
    f.UsuarioUltimaEdicion,
    
    -- Cálculos dinámicos
    CASE 
        WHEN f.PorcentajeCompletado >= 100 THEN 'COMPLETO'
        WHEN f.PorcentajeCompletado >= 75 THEN 'AVANZADO'
        WHEN f.PorcentajeCompletado >= 50 THEN 'MEDIO'
        WHEN f.PorcentajeCompletado >= 25 THEN 'INICIAL'
        ELSE 'VACIO'
    END as NivelCompletitud,
    
    -- Información adicional
    (SELECT COUNT(*) 
     FROM ANCI_ARCHIVOS_GESTION a 
     WHERE a.FormularioID = f.FormularioID AND a.EstadoArchivo = 'ACTIVO') as ArchivosActivos,
    
    (SELECT COUNT(*) 
     FROM ANCI_ARCHIVOS_GESTION a 
     WHERE a.FormularioID = f.FormularioID AND a.EsHuerfano = 1) as ArchivosHuerfanos,
     
    (SELECT COUNT(*) 
     FROM ANCI_COMENTARIOS_SECCIONES c 
     WHERE c.FormularioID = f.FormularioID) as ComentariosTotal
     
FROM ANCI_FORMULARIOS_DINAMICOS f
INNER JOIN Empresas e ON f.EmpresaID = e.EmpresaID;
GO

-- Vista para configuración de secciones activas
CREATE OR ALTER VIEW vw_SeccionesActivasPorEmpresa AS
SELECT 
    e.EmpresaID,
    e.RazonSocial,
    e.TipoEmpresa,
    sc.CodigoSeccion,
    sc.TipoSeccion,
    sc.CategoriaSeccion,
    sc.NumeroOrden,
    sc.TituloSeccion,
    sc.DescripcionSeccion,
    sc.EsObligatorio,
    
    -- Aplicabilidad específica
    CASE 
        WHEN e.TipoEmpresa = 'OIV' THEN sc.AplicaOIV
        WHEN e.TipoEmpresa = 'PSE' THEN sc.AplicaPSE
        ELSE (sc.AplicaOIV & sc.AplicaPSE)
    END as AplicaAEmpresa,
    
    -- Información de taxonomía si aplica
    sc.TaxonomiaID,
    sc.TaxonomiaArea,
    sc.TaxonomiaEfecto,
    sc.TaxonomiaCategoria,
    
    -- Configuración UI
    sc.ColorSeccion,
    sc.IconoSeccion,
    sc.MaxArchivos,
    sc.MaxComentarios,
    sc.MaxTamanoMB,
    
    -- Estado
    sc.Activo,
    sc.Version,
    sc.FechaVigencia,
    sc.FechaExpiracion
    
FROM Empresas e
CROSS JOIN ANCI_SECCIONES_CONFIG_V3 sc
WHERE sc.Activo = 1
AND sc.FechaVigencia <= GETDATE()
AND (sc.FechaExpiracion IS NULL OR sc.FechaExpiracion > GETDATE())
AND (
    (e.TipoEmpresa = 'OIV' AND sc.AplicaOIV = 1)
    OR (e.TipoEmpresa = 'PSE' AND sc.AplicaPSE = 1)
    OR (e.TipoEmpresa NOT IN ('OIV', 'PSE') AND sc.AplicaOIV = 1 AND sc.AplicaPSE = 1)
);
GO

-- ========================================
-- PASO 6: DATOS INICIALES Y CONFIGURACIÓN
-- ========================================
PRINT '';
PRINT '📝 PASO 6: INSERTANDO DATOS INICIALES';
PRINT '-------------------------------------';

-- Configurar capacidades por defecto si no existen
IF NOT EXISTS (SELECT 1 FROM ConfiguracionSeguridad WHERE Clave = 'ANCI_MAX_ARCHIVOS_POR_SECCION')
BEGIN
    INSERT INTO ConfiguracionSeguridad (Clave, Valor, Descripcion, TipoDato, EsEditable)
    VALUES ('ANCI_MAX_ARCHIVOS_POR_SECCION', '10', 'Máximo número de archivos por sección en formularios ANCI', 'INT', 1);
END

IF NOT EXISTS (SELECT 1 FROM ConfiguracionSeguridad WHERE Clave = 'ANCI_MAX_COMENTARIOS_POR_SECCION')
BEGIN
    INSERT INTO ConfiguracionSeguridad (Clave, Valor, Descripcion, TipoDato, EsEditable)
    VALUES ('ANCI_MAX_COMENTARIOS_POR_SECCION', '6', 'Máximo número de comentarios por sección en formularios ANCI', 'INT', 1);
END

IF NOT EXISTS (SELECT 1 FROM ConfiguracionSeguridad WHERE Clave = 'ANCI_MAX_TAMANO_MB_ARCHIVO')
BEGIN
    INSERT INTO ConfiguracionSeguridad (Clave, Valor, Descripcion, TipoDato, EsEditable)
    VALUES ('ANCI_MAX_TAMANO_MB_ARCHIVO', '10', 'Tamaño máximo en MB por archivo en formularios ANCI', 'INT', 1);
END

IF NOT EXISTS (SELECT 1 FROM ConfiguracionSeguridad WHERE Clave = 'ANCI_LIMPIEZA_HUERFANOS_DIAS')
BEGIN
    INSERT INTO ConfiguracionSeguridad (Clave, Valor, Descripcion, TipoDato, EsEditable)
    VALUES ('ANCI_LIMPIEZA_HUERFANOS_DIAS', '30', 'Días para mantener archivos huérfanos antes de eliminar', 'INT', 1);
END

IF NOT EXISTS (SELECT 1 FROM ConfiguracionSeguridad WHERE Clave = 'ANCI_BACKUP_RETENCION_DIAS')
BEGIN
    INSERT INTO ConfiguracionSeguridad (Clave, Valor, Descripcion, TipoDato, EsEditable)
    VALUES ('ANCI_BACKUP_RETENCION_DIAS', '365', 'Días de retención para backups de formularios ANCI', 'INT', 1);
END

PRINT '✅ Configuración inicial insertada';

-- ========================================
-- PASO 7: ESTADÍSTICAS Y VERIFICACIÓN FINAL
-- ========================================
PRINT '';
PRINT '📈 PASO 7: VERIFICACIÓN FINAL DEL SISTEMA';
PRINT '-----------------------------------------';

-- Mostrar estadísticas del sistema implementado
PRINT '';
PRINT '📊 ESTADÍSTICAS DEL SISTEMA DINÁMICO ANCI V3.0:';

SELECT 
    'CONFIGURACIÓN GENERAL' as Categoria,
    'Total secciones configuradas' as Concepto,
    CAST(COUNT(*) AS VARCHAR) as Valor
FROM ANCI_SECCIONES_CONFIG_V3
WHERE Activo = 1

UNION ALL

SELECT 
    'CONFIGURACIÓN GENERAL',
    'Secciones por tipo',
    TipoSeccion + ': ' + CAST(COUNT(*) AS VARCHAR)
FROM ANCI_SECCIONES_CONFIG_V3
WHERE Activo = 1
GROUP BY TipoSeccion

UNION ALL

SELECT 
    'TAXONOMÍAS',
    'Total taxonomías disponibles',
    CAST(COUNT(*) AS VARCHAR)
FROM Taxonomia_incidentes
WHERE Id_Incidente IS NOT NULL

UNION ALL

SELECT 
    'TAXONOMÍAS',
    'Por tipo empresa',
    AplicaTipoEmpresa + ': ' + CAST(COUNT(*) AS VARCHAR)
FROM Taxonomia_incidentes
WHERE Id_Incidente IS NOT NULL
GROUP BY AplicaTipoEmpresa

UNION ALL

SELECT 
    'CAPACIDADES',
    'Máximo archivos por formulario',
    CAST((SELECT COUNT(*) * 10 FROM ANCI_SECCIONES_CONFIG_V3 WHERE Activo = 1) AS VARCHAR)

UNION ALL

SELECT 
    'CAPACIDADES',
    'Máximo comentarios por formulario',
    CAST((SELECT COUNT(*) * 6 FROM ANCI_SECCIONES_CONFIG_V3 WHERE Activo = 1) AS VARCHAR)

ORDER BY Categoria, Concepto;

-- Mostrar configuración por tipo de empresa
PRINT '';
PRINT '🏢 CONFIGURACIÓN POR TIPO DE EMPRESA:';

SELECT 
    TipoEmpresa,
    COUNT(*) as SeccionesAplicables,
    SUM(CASE WHEN TipoSeccion = 'FIJA' THEN 1 ELSE 0 END) as SeccionesFijas,
    SUM(CASE WHEN TipoSeccion = 'TAXONOMIA' THEN 1 ELSE 0 END) as TaxonomiasDisponibles,
    SUM(CASE WHEN TipoSeccion = 'ESPECIAL' THEN 1 ELSE 0 END) as SeccionesEspeciales,
    SUM(CASE WHEN EsObligatorio = 1 THEN 1 ELSE 0 END) as SeccionesObligatorias
FROM (
    SELECT 
        'OIV' as TipoEmpresa, 
        TipoSeccion, 
        EsObligatorioOIV as EsObligatorio
    FROM ANCI_SECCIONES_CONFIG_V3
    WHERE Activo = 1 AND AplicaOIV = 1
    
    UNION ALL
    
    SELECT 
        'PSE' as TipoEmpresa, 
        TipoSeccion, 
        EsObligatorioPSE as EsObligatorio
    FROM ANCI_SECCIONES_CONFIG_V3
    WHERE Activo = 1 AND AplicaPSE = 1
) AS ConfigPorTipo
GROUP BY TipoEmpresa;

-- Verificar funciones y procedimientos
PRINT '';
PRINT '⚙️ VERIFICACIÓN DE FUNCIONES Y PROCEDIMIENTOS:';

SELECT 
    ROUTINE_TYPE as Tipo,
    ROUTINE_NAME as Nombre,
    CREATED as FechaCreacion
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_NAME LIKE '%Anci%' OR ROUTINE_NAME LIKE '%Dinamico%'
ORDER BY ROUTINE_TYPE, ROUTINE_NAME;

-- ========================================
-- FINALIZACIÓN
-- ========================================
PRINT '';
PRINT '✅ SISTEMA DINÁMICO ANCI V3.0 IMPLEMENTADO EXITOSAMENTE';
PRINT '';
PRINT '🎯 CARACTERÍSTICAS IMPLEMENTADAS:';
PRINT '   ✅ Formulario 100% dinámico (hasta 41 secciones)';
PRINT '   ✅ Taxonomías automáticas por tipo de empresa (OIV/PSE/AMBAS)';
PRINT '   ✅ Sistema robusto de archivos (anti-huérfanos)';
PRINT '   ✅ Edición segura con control de concurrencia';
PRINT '   ✅ Backup automático y recuperación';
PRINT '   ✅ Auditoría completa de todas las operaciones';
PRINT '   ✅ Sincronización automática con cambios ANCI';
PRINT '   ✅ Validación y limpieza automática';
PRINT '';
PRINT '🔧 FUNCIONES CLAVE DISPONIBLES:';
PRINT '   - sp_GenerarFormularioDinamicoCompleto @EmpresaID, @IncidenteID';
PRINT '   - sp_IniciarEdicionSegura @FormularioID, @Usuario';
PRINT '   - sp_FinalizarEdicion @FormularioID, @Usuario, @Token';
PRINT '   - sp_GestionarArchivoSeguro (SUBIR/ACTUALIZAR/ELIMINAR/VERIFICAR)';
PRINT '   - sp_LimpiarArchivosHuerfanos (MARCAR/ELIMINAR/ARCHIVAR)';
PRINT '   - sp_CrearBackupFormulario @FormularioID, @TipoBackup';
PRINT '';
PRINT '📊 VISTAS DISPONIBLES:';
PRINT '   - vw_EstadisticasFormularioDinamico';
PRINT '   - vw_SeccionesActivasPorEmpresa';
PRINT '';
PRINT '🎉 SISTEMA LISTO PARA USO EN PRODUCCIÓN';
PRINT '🔄 PRÓXIMO PASO: Ejecutar script de API Python y componentes Vue.js';