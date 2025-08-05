-- =====================================================
-- SCRIPT DE VERIFICACIÓN DEL SISTEMA DINÁMICO
-- =====================================================
-- Este script verifica si las tablas y datos del sistema
-- dinámico están correctamente configurados
-- =====================================================

-- 1. Verificar si existen las tablas del sistema dinámico
PRINT '1. VERIFICANDO TABLAS DEL SISTEMA DINÁMICO'
PRINT '=========================================='

IF EXISTS (SELECT * FROM sysobjects WHERE name='ANCI_SECCIONES_CONFIG' AND xtype='U')
    PRINT '✅ Tabla ANCI_SECCIONES_CONFIG existe'
ELSE
    PRINT '❌ Tabla ANCI_SECCIONES_CONFIG NO existe'

IF EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_SECCIONES_DATOS' AND xtype='U')
    PRINT '✅ Tabla INCIDENTES_SECCIONES_DATOS existe'
ELSE
    PRINT '❌ Tabla INCIDENTES_SECCIONES_DATOS NO existe'

IF EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_COMENTARIOS' AND xtype='U')
    PRINT '✅ Tabla INCIDENTES_COMENTARIOS existe'
ELSE
    PRINT '❌ Tabla INCIDENTES_COMENTARIOS NO existe'

IF EXISTS (SELECT * FROM sysobjects WHERE name='INCIDENTES_ARCHIVOS' AND xtype='U')
    PRINT '✅ Tabla INCIDENTES_ARCHIVOS existe'
ELSE
    PRINT '❌ Tabla INCIDENTES_ARCHIVOS NO existe'

-- 2. Verificar contenido de ANCI_SECCIONES_CONFIG
PRINT ''
PRINT '2. CONTENIDO DE ANCI_SECCIONES_CONFIG'
PRINT '======================================'

SELECT 
    SeccionID,
    CodigoSeccion,
    TipoSeccion,
    NumeroOrden,
    Titulo,
    CASE 
        WHEN Activo = 1 THEN 'Activa'
        ELSE 'Inactiva'
    END as Estado,
    CASE 
        WHEN CodigoSeccion = 'SEC_CSIRT' THEN '🚨 CSIRT'
        WHEN TipoSeccion = 'FIJA' THEN '📌 Fija'
        WHEN TipoSeccion = 'TAXONOMIA' THEN '🏷️ Taxonomía'
        ELSE '⚡ Especial'
    END as Tipo
FROM ANCI_SECCIONES_CONFIG
ORDER BY NumeroOrden;

-- 3. Verificar si existe la sección CSIRT específicamente
PRINT ''
PRINT '3. VERIFICANDO SECCIÓN CSIRT'
PRINT '============================'

IF EXISTS (SELECT 1 FROM ANCI_SECCIONES_CONFIG WHERE CodigoSeccion = 'SEC_CSIRT')
BEGIN
    PRINT '✅ Sección CSIRT existe'
    
    SELECT 
        'SeccionID: ' + CAST(SeccionID AS VARCHAR) + 
        ', Orden: ' + CAST(NumeroOrden AS VARCHAR) +
        ', Título: ' + Titulo as Info
    FROM ANCI_SECCIONES_CONFIG 
    WHERE CodigoSeccion = 'SEC_CSIRT';
    
    -- Mostrar primeros 500 caracteres del JSON
    SELECT 
        LEFT(CamposJSON, 500) + '...' as 'Primeros 500 caracteres del CamposJSON'
    FROM ANCI_SECCIONES_CONFIG 
    WHERE CodigoSeccion = 'SEC_CSIRT';
END
ELSE
BEGIN
    PRINT '❌ Sección CSIRT NO existe - Necesita ejecutar actualizar_sistema_dinamico_csirt.sql'
END

-- 4. Verificar campos de SEC_1
PRINT ''
PRINT '4. VERIFICANDO CAMPOS ACTUALIZADOS EN SEC_1'
PRINT '==========================================='

IF EXISTS (SELECT 1 FROM ANCI_SECCIONES_CONFIG WHERE CodigoSeccion = 'SEC_1')
BEGIN
    DECLARE @campos NVARCHAR(MAX)
    SELECT @campos = CamposJSON FROM ANCI_SECCIONES_CONFIG WHERE CodigoSeccion = 'SEC_1'
    
    IF @campos LIKE '%estadoActual%'
        PRINT '✅ Campo estadoActual presente en SEC_1'
    ELSE
        PRINT '❌ Campo estadoActual NO encontrado en SEC_1'
        
    IF @campos LIKE '%reporteAnciId%'
        PRINT '✅ Campo reporteAnciId presente en SEC_1'
    ELSE
        PRINT '❌ Campo reporteAnciId NO encontrado en SEC_1'
        
    IF @campos LIKE '%fechaDeclaracionAnci%'
        PRINT '✅ Campo fechaDeclaracionAnci presente en SEC_1'
    ELSE
        PRINT '❌ Campo fechaDeclaracionAnci NO encontrado en SEC_1'
END

-- 5. Contar secciones por tipo
PRINT ''
PRINT '5. RESUMEN DE SECCIONES'
PRINT '======================='

SELECT 
    TipoSeccion,
    COUNT(*) as Total,
    STRING_AGG(CodigoSeccion, ', ') WITHIN GROUP (ORDER BY NumeroOrden) as Codigos
FROM ANCI_SECCIONES_CONFIG
WHERE Activo = 1
GROUP BY TipoSeccion
ORDER BY 
    CASE TipoSeccion 
        WHEN 'FIJA' THEN 1
        WHEN 'ESPECIAL' THEN 2
        WHEN 'TAXONOMIA' THEN 3
    END;

-- 6. Verificar si hay datos de prueba
PRINT ''
PRINT '6. DATOS DE INCIDENTES EN SISTEMA DINÁMICO'
PRINT '=========================================='

DECLARE @totalIncidentes INT, @incidentesConDatos INT

SELECT @totalIncidentes = COUNT(DISTINCT IncidenteID) FROM Incidentes
SELECT @incidentesConDatos = COUNT(DISTINCT IncidenteID) FROM INCIDENTES_SECCIONES_DATOS

PRINT 'Total incidentes en sistema: ' + CAST(@totalIncidentes AS VARCHAR)
PRINT 'Incidentes con datos dinámicos: ' + CAST(@incidentesConDatos AS VARCHAR)

-- Mostrar últimos 5 incidentes con datos dinámicos
IF @incidentesConDatos > 0
BEGIN
    PRINT ''
    PRINT 'Últimos incidentes con datos dinámicos:'
    
    SELECT TOP 5
        i.IncidenteID,
        i.IDVisible,
        i.Titulo,
        COUNT(DISTINCT sd.SeccionID) as SeccionesConDatos,
        MAX(sd.FechaActualizacion) as UltimaActualizacion
    FROM Incidentes i
    INNER JOIN INCIDENTES_SECCIONES_DATOS sd ON i.IncidenteID = sd.IncidenteID
    GROUP BY i.IncidenteID, i.IDVisible, i.Titulo
    ORDER BY MAX(sd.FechaActualizacion) DESC;
END

-- 7. Verificar vistas
PRINT ''
PRINT '7. VERIFICANDO VISTAS'
PRINT '===================='

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_IncidentesConCSIRT')
    PRINT '✅ Vista vw_IncidentesConCSIRT existe'
ELSE
    PRINT '❌ Vista vw_IncidentesConCSIRT NO existe'

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_IncidentesSeccionesCompletas')
    PRINT '✅ Vista vw_IncidentesSeccionesCompletas existe'
ELSE
    PRINT '❌ Vista vw_IncidentesSeccionesCompletas NO existe'

-- 8. Recomendaciones finales
PRINT ''
PRINT '8. RECOMENDACIONES'
PRINT '=================='
PRINT ''

IF NOT EXISTS (SELECT 1 FROM ANCI_SECCIONES_CONFIG)
BEGIN
    PRINT '⚠️  No hay secciones configuradas. Ejecute:'
    PRINT '   1. crear_sistema_dinamico.sql'
    PRINT '   2. actualizar_sistema_dinamico_csirt.sql'
END
ELSE IF NOT EXISTS (SELECT 1 FROM ANCI_SECCIONES_CONFIG WHERE CodigoSeccion = 'SEC_CSIRT')
BEGIN
    PRINT '⚠️  Sistema dinámico existe pero falta CSIRT. Ejecute:'
    PRINT '   - actualizar_sistema_dinamico_csirt.sql'
END
ELSE
BEGIN
    PRINT '✅ Sistema dinámico está correctamente configurado'
    PRINT ''
    PRINT 'Próximos pasos:'
    PRINT '1. Actualizar el frontend para usar el sistema dinámico'
    PRINT '2. Implementar los endpoints en el backend'
    PRINT '3. Probar la creación de incidentes'
END

PRINT ''
PRINT '=========================================='
PRINT 'Verificación completada'