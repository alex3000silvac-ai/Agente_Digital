-- Script para verificar y agregar columna FechaModificacion a la tabla CumplimientoEmpresa
-- Ejecutar en SQL Server Management Studio

-- 1. Verificar la estructura actual de la tabla
PRINT 'Verificando estructura de tabla CumplimientoEmpresa...'
PRINT '=================================================='

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CumplimientoEmpresa')
BEGIN
    PRINT 'Tabla CumplimientoEmpresa existe.'
    PRINT ''
    PRINT 'Columnas actuales:'
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length,
        c.is_nullable,
        c.is_identity
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('CumplimientoEmpresa')
    ORDER BY c.column_id
END
ELSE
BEGIN
    PRINT 'ADVERTENCIA: La tabla CumplimientoEmpresa NO existe.'
END

-- 2. Verificar si existe la columna FechaModificacion
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CumplimientoEmpresa' 
    AND COLUMN_NAME = 'FechaModificacion'
)
BEGIN
    PRINT ''
    PRINT 'La columna FechaModificacion NO existe. Agregándola...'
    
    -- Agregar la columna FechaModificacion
    ALTER TABLE CumplimientoEmpresa 
    ADD FechaModificacion DATETIME NULL
    
    PRINT 'Columna FechaModificacion agregada exitosamente.'
    
    -- Actualizar registros existentes con la fecha actual
    UPDATE CumplimientoEmpresa 
    SET FechaModificacion = GETDATE() 
    WHERE FechaModificacion IS NULL
    
    PRINT 'Registros existentes actualizados con fecha actual.'
END
ELSE
BEGIN
    PRINT ''
    PRINT 'La columna FechaModificacion YA existe.'
END

-- 3. Verificar y agregar otras columnas útiles si no existen
PRINT ''
PRINT 'Verificando otras columnas recomendadas...'

-- FechaCreacion
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CumplimientoEmpresa' 
    AND COLUMN_NAME = 'FechaCreacion'
)
BEGIN
    PRINT 'Agregando columna FechaCreacion...'
    ALTER TABLE CumplimientoEmpresa 
    ADD FechaCreacion DATETIME DEFAULT GETDATE() NULL
    
    UPDATE CumplimientoEmpresa 
    SET FechaCreacion = GETDATE() 
    WHERE FechaCreacion IS NULL
END

-- UsuarioCreacion
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CumplimientoEmpresa' 
    AND COLUMN_NAME = 'UsuarioCreacion'
)
BEGIN
    PRINT 'Agregando columna UsuarioCreacion...'
    ALTER TABLE CumplimientoEmpresa 
    ADD UsuarioCreacion NVARCHAR(100) NULL
END

-- UsuarioModificacion
IF NOT EXISTS (
    SELECT * 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CumplimientoEmpresa' 
    AND COLUMN_NAME = 'UsuarioModificacion'
)
BEGIN
    PRINT 'Agregando columna UsuarioModificacion...'
    ALTER TABLE CumplimientoEmpresa 
    ADD UsuarioModificacion NVARCHAR(100) NULL
END

-- 4. Crear índice en FechaModificacion para mejorar rendimiento
IF NOT EXISTS (
    SELECT * 
    FROM sys.indexes 
    WHERE name = 'IX_CumplimientoEmpresa_FechaModificacion' 
    AND object_id = OBJECT_ID('CumplimientoEmpresa')
)
BEGIN
    PRINT ''
    PRINT 'Creando índice en FechaModificacion...'
    CREATE INDEX IX_CumplimientoEmpresa_FechaModificacion 
    ON CumplimientoEmpresa(FechaModificacion)
END

-- 5. Mostrar la estructura final de la tabla
PRINT ''
PRINT 'Estructura final de la tabla CumplimientoEmpresa:'
PRINT '=================================================='

SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    c.is_nullable AS IsNullable,
    c.is_identity AS IsIdentity,
    dc.definition AS DefaultValue
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
WHERE c.object_id = OBJECT_ID('CumplimientoEmpresa')
ORDER BY c.column_id

PRINT ''
PRINT 'Script completado exitosamente.'
PRINT '=================================================='