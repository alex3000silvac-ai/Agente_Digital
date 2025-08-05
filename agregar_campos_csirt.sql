-- Script para agregar campos CSIRT a la tabla Incidentes
-- Fecha: 2025-07-18
-- Descripción: Agrega campos para gestionar solicitudes de ayuda al CSIRT

USE AgenteDigitalDB;
GO

-- Verificar si las columnas ya existen antes de agregarlas
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'SolicitarCSIRT' AND Object_ID = Object_ID(N'dbo.Incidentes'))
BEGIN
    ALTER TABLE dbo.Incidentes ADD SolicitarCSIRT BIT DEFAULT 0;
    PRINT 'Columna SolicitarCSIRT agregada exitosamente';
END
ELSE
    PRINT 'La columna SolicitarCSIRT ya existe';
GO

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'TipoApoyoCSIRT' AND Object_ID = Object_ID(N'dbo.Incidentes'))
BEGIN
    ALTER TABLE dbo.Incidentes ADD TipoApoyoCSIRT NVARCHAR(100) NULL;
    PRINT 'Columna TipoApoyoCSIRT agregada exitosamente';
END
ELSE
    PRINT 'La columna TipoApoyoCSIRT ya existe';
GO

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'UrgenciaCSIRT' AND Object_ID = Object_ID(N'dbo.Incidentes'))
BEGIN
    ALTER TABLE dbo.Incidentes ADD UrgenciaCSIRT NVARCHAR(50) NULL;
    PRINT 'Columna UrgenciaCSIRT agregada exitosamente';
END
ELSE
    PRINT 'La columna UrgenciaCSIRT ya existe';
GO

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'ObservacionesCSIRT' AND Object_ID = Object_ID(N'dbo.Incidentes'))
BEGIN
    ALTER TABLE dbo.Incidentes ADD ObservacionesCSIRT NVARCHAR(4000) NULL;
    PRINT 'Columna ObservacionesCSIRT agregada exitosamente';
END
ELSE
    PRINT 'La columna ObservacionesCSIRT ya existe';
GO

-- Agregar campo para tipo de registro si no existe
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'TipoRegistro' AND Object_ID = Object_ID(N'dbo.Incidentes'))
BEGIN
    ALTER TABLE dbo.Incidentes ADD TipoRegistro NVARCHAR(50) DEFAULT 'Registro General';
    PRINT 'Columna TipoRegistro agregada exitosamente';
END
ELSE
    PRINT 'La columna TipoRegistro ya existe';
GO

-- Verificar las columnas agregadas
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Incidentes'
AND COLUMN_NAME IN ('SolicitarCSIRT', 'TipoApoyoCSIRT', 'UrgenciaCSIRT', 'ObservacionesCSIRT', 'TipoRegistro')
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '✅ Script ejecutado exitosamente';
PRINT 'Las siguientes columnas han sido verificadas/agregadas:';
PRINT '  - SolicitarCSIRT (BIT)';
PRINT '  - TipoApoyoCSIRT (NVARCHAR 100)';
PRINT '  - UrgenciaCSIRT (NVARCHAR 50)';
PRINT '  - ObservacionesCSIRT (NVARCHAR 4000)';
PRINT '  - TipoRegistro (NVARCHAR 50)';