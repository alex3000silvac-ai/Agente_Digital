-- Script para crear trigger de historial automático
-- Este trigger registrará automáticamente los cambios en la tabla CumplimientoEmpresa

-- Primero, eliminar el trigger si ya existe
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_CumplimientoEmpresa_Historial')
BEGIN
    DROP TRIGGER trg_CumplimientoEmpresa_Historial
END
GO

-- Crear el trigger para registrar cambios automáticamente
CREATE TRIGGER trg_CumplimientoEmpresa_Historial
ON CumplimientoEmpresa
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Registrar cambios en Estado
    INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
    SELECT 
        i.CumplimientoID,
        'Estado',
        d.Estado,
        i.Estado,
        GETDATE(),
        SYSTEM_USER
    FROM inserted i
    INNER JOIN deleted d ON i.CumplimientoID = d.CumplimientoID
    WHERE ISNULL(i.Estado, '') != ISNULL(d.Estado, '');
    
    -- Registrar cambios en PorcentajeAvance
    INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
    SELECT 
        i.CumplimientoID,
        'PorcentajeAvance',
        CAST(d.PorcentajeAvance AS NVARCHAR(10)),
        CAST(i.PorcentajeAvance AS NVARCHAR(10)),
        GETDATE(),
        SYSTEM_USER
    FROM inserted i
    INNER JOIN deleted d ON i.CumplimientoID = d.CumplimientoID
    WHERE ISNULL(i.PorcentajeAvance, -1) != ISNULL(d.PorcentajeAvance, -1);
    
    -- Registrar cambios en Responsable
    INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
    SELECT 
        i.CumplimientoID,
        'Responsable',
        d.Responsable,
        i.Responsable,
        GETDATE(),
        SYSTEM_USER
    FROM inserted i
    INNER JOIN deleted d ON i.CumplimientoID = d.CumplimientoID
    WHERE ISNULL(i.Responsable, '') != ISNULL(d.Responsable, '');
    
    -- Registrar cambios en FechaTermino
    INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
    SELECT 
        i.CumplimientoID,
        'FechaTermino',
        CONVERT(NVARCHAR(10), d.FechaTermino, 120),
        CONVERT(NVARCHAR(10), i.FechaTermino, 120),
        GETDATE(),
        SYSTEM_USER
    FROM inserted i
    INNER JOIN deleted d ON i.CumplimientoID = d.CumplimientoID
    WHERE ISNULL(i.FechaTermino, '1900-01-01') != ISNULL(d.FechaTermino, '1900-01-01');
    
    -- Registrar cambios en ObservacionesCiberseguridad (si la columna existe)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CumplimientoEmpresa') AND name = 'ObservacionesCiberseguridad')
    BEGIN
        INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
        SELECT 
            i.CumplimientoID,
            'ObservacionesCiberseguridad',
            d.ObservacionesCiberseguridad,
            i.ObservacionesCiberseguridad,
            GETDATE(),
            SYSTEM_USER
        FROM inserted i
        INNER JOIN deleted d ON i.CumplimientoID = d.CumplimientoID
        WHERE ISNULL(i.ObservacionesCiberseguridad, '') != ISNULL(d.ObservacionesCiberseguridad, '');
    END
    
    -- Registrar cambios en ObservacionesLegales (si la columna existe)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CumplimientoEmpresa') AND name = 'ObservacionesLegales')
    BEGIN
        INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
        SELECT 
            i.CumplimientoID,
            'ObservacionesLegales',
            d.ObservacionesLegales,
            i.ObservacionesLegales,
            GETDATE(),
            SYSTEM_USER
        FROM inserted i
        INNER JOIN deleted d ON i.CumplimientoID = d.CumplimientoID
        WHERE ISNULL(i.ObservacionesLegales, '') != ISNULL(d.ObservacionesLegales, '');
    END
END
GO

-- Verificar que el trigger se creó correctamente
SELECT 
    name AS TriggerName,
    create_date AS CreatedDate,
    modify_date AS ModifiedDate,
    is_disabled AS IsDisabled
FROM sys.triggers
WHERE parent_id = OBJECT_ID('CumplimientoEmpresa')

-- Insertar un registro de prueba en el historial para verificar
DECLARE @TestCumplimientoID INT = (SELECT TOP 1 CumplimientoID FROM CumplimientoEmpresa)

IF @TestCumplimientoID IS NOT NULL
BEGIN
    INSERT INTO HistorialCumplimiento (CumplimientoID, CampoModificado, ValorAnterior, ValorNuevo, FechaCambio, UsuarioCambio)
    VALUES (@TestCumplimientoID, 'Test', 'Valor Anterior Test', 'Valor Nuevo Test', GETDATE(), 'Sistema - Prueba de Trigger')
    
    PRINT 'Registro de prueba insertado para CumplimientoID: ' + CAST(@TestCumplimientoID AS NVARCHAR(10))
END