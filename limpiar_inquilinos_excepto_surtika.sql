-- =====================================================
-- SCRIPT DE LIMPIEZA: CONSERVAR SOLO INQUILINO SURTIKA
-- =====================================================
-- Este script elimina todos los inquilinos excepto 
-- 'Empresas Surtika SPA' (ID: 4) y todos sus datos relacionados
-- 
-- IMPORTANTE: HACER BACKUP ANTES DE EJECUTAR
-- =====================================================

BEGIN TRANSACTION;

BEGIN TRY
    -- Variables
    DECLARE @InquilinoSurtikaID INT = 4; -- ID de Empresas Surtika SPA
    DECLARE @RowsDeleted INT;
    DECLARE @TotalDeleted INT = 0;

    PRINT '=== INICIANDO LIMPIEZA DE INQUILINOS ===';
    PRINT 'Conservando solo Inquilino ID: ' + CAST(@InquilinoSurtikaID AS VARCHAR) + ' (Empresas Surtika SPA)';
    PRINT '';

    -- 1. ELIMINAR DATOS DE AUDITORÍA Y LOGS
    PRINT '1. Eliminando datos de auditoría...';
    
    -- Auditoría de accesos de usuarios que no son del inquilino Surtika
    DELETE aa FROM AuditoriaAccesos aa
    WHERE aa.UsuarioID IN (
        SELECT UsuarioClienteID FROM UsuariosCliente WHERE InquilinoID != @InquilinoSurtikaID
    );
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - AuditoriaAccesos: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Sesiones activas
    DELETE FROM SesionesActivas
    WHERE UsuarioID IN (
        SELECT UsuarioClienteID FROM UsuariosCliente WHERE InquilinoID != @InquilinoSurtikaID
    );
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - SesionesActivas: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 2. ELIMINAR EVIDENCIAS E HISTORIAL DE INCIDENTES
    PRINT '';
    PRINT '2. Eliminando evidencias e historial de incidentes...';

    -- Evidencias de taxonomía
    DELETE et FROM EVIDENCIAS_TAXONOMIA et
    INNER JOIN Incidentes i ON et.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - EVIDENCIAS_TAXONOMIA: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Comentarios de taxonomía
    DELETE ct FROM COMENTARIOS_TAXONOMIA ct
    INNER JOIN Incidentes i ON ct.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - COMENTARIOS_TAXONOMIA: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Relación incidente-taxonomía
    DELETE it FROM INCIDENTE_TAXONOMIA it
    INNER JOIN Incidentes i ON it.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - INCIDENTE_TAXONOMIA: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Archivos de incidentes
    DELETE ia FROM INCIDENTES_ARCHIVOS ia
    INNER JOIN Incidentes i ON ia.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - INCIDENTES_ARCHIVOS: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Comentarios de incidentes
    DELETE ic FROM INCIDENTES_COMENTARIOS ic
    INNER JOIN Incidentes i ON ic.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - INCIDENTES_COMENTARIOS: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Datos de secciones de incidentes
    DELETE isd FROM INCIDENTES_SECCIONES_DATOS isd
    INNER JOIN Incidentes i ON isd.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - INCIDENTES_SECCIONES_DATOS: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Auditoría de incidentes
    DELETE ia FROM INCIDENTES_AUDITORIA ia
    INNER JOIN Incidentes i ON ia.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - INCIDENTES_AUDITORIA: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Historial de incidentes
    DELETE hi FROM HistorialIncidentes hi
    INNER JOIN Incidentes i ON hi.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - HistorialIncidentes: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Evidencias de incidentes
    DELETE ei FROM EvidenciasIncidentes ei
    INNER JOIN Incidentes i ON ei.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - EvidenciasIncidentes: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 3. ELIMINAR DATOS ANCI
    PRINT '';
    PRINT '3. Eliminando datos ANCI...';

    -- Plazos ANCI
    DELETE ap FROM AnciPlazos ap
    INNER JOIN Incidentes i ON ap.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - AnciPlazos: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Notificaciones ANCI
    DELETE an FROM AnciNotificaciones an
    INNER JOIN Incidentes i ON an.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - AnciNotificaciones: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Autorizaciones ANCI
    DELETE aa FROM AnciAutorizaciones aa
    INNER JOIN Incidentes i ON aa.IncidenteID = i.IncidenteID
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - AnciAutorizaciones: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Reportes ANCI relacionados con incidentes
    DELETE ra FROM ReportesANCI ra
    WHERE ra.IncidenteID IN (
        SELECT i.IncidenteID 
        FROM Incidentes i
        INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
        WHERE e.InquilinoID != @InquilinoSurtikaID
    );
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - ReportesANCI: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 4. ELIMINAR INCIDENTES
    PRINT '';
    PRINT '4. Eliminando incidentes...';
    
    DELETE i FROM Incidentes i
    INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - Incidentes: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 5. ELIMINAR DATOS DE CUMPLIMIENTO
    PRINT '';
    PRINT '5. Eliminando datos de cumplimiento...';

    -- Evidencias de cumplimiento
    DELETE FROM EvidenciasCumplimiento
    WHERE InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - EvidenciasCumplimiento: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Historial de cumplimiento
    DELETE hc FROM HistorialCumplimiento hc
    INNER JOIN CumplimientoEmpresa ce ON hc.CumplimientoID = ce.CumplimientoID
    INNER JOIN Empresas e ON ce.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - HistorialCumplimiento: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Cumplimiento empresa
    DELETE ce FROM CumplimientoEmpresa ce
    INNER JOIN Empresas e ON ce.EmpresaID = e.EmpresaID
    WHERE e.InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - CumplimientoEmpresa: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 6. ELIMINAR USUARIOS
    PRINT '';
    PRINT '6. Eliminando usuarios...';

    DELETE FROM UsuariosCliente
    WHERE InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - UsuariosCliente: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    DELETE FROM Usuarios
    WHERE InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - Usuarios: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 7. ELIMINAR EMPRESAS
    PRINT '';
    PRINT '7. Eliminando empresas...';

    DELETE FROM Empresas
    WHERE InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - Empresas: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 8. ELIMINAR INQUILINOS
    PRINT '';
    PRINT '8. Eliminando inquilinos...';

    -- Configuración de inquilinos
    DELETE FROM InquilinosConfig
    WHERE InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - InquilinosConfig: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- Inquilinos
    DELETE FROM Inquilinos
    WHERE InquilinoID != @InquilinoSurtikaID;
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - Inquilinos: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- 9. LIMPIAR OTROS DATOS HUÉRFANOS
    PRINT '';
    PRINT '9. Limpiando datos huérfanos...';

    -- Soluciones propuestas sin inquilino válido
    DELETE FROM SolucionesPropuestas
    WHERE InquilinoID NOT IN (SELECT InquilinoID FROM Inquilinos);
    SET @RowsDeleted = @@ROWCOUNT;
    SET @TotalDeleted = @TotalDeleted + @RowsDeleted;
    PRINT '   - SolucionesPropuestas huérfanas: ' + CAST(@RowsDeleted AS VARCHAR) + ' registros eliminados';

    -- RESUMEN FINAL
    PRINT '';
    PRINT '=========================================';
    PRINT 'LIMPIEZA COMPLETADA EXITOSAMENTE';
    PRINT 'Total de registros eliminados: ' + CAST(@TotalDeleted AS VARCHAR);
    PRINT '';
    PRINT 'Verificando datos conservados...';
    
    -- Verificar que solo queda Surtika
    DECLARE @InquilinosRestantes INT;
    SELECT @InquilinosRestantes = COUNT(*) FROM Inquilinos;
    PRINT 'Inquilinos restantes: ' + CAST(@InquilinosRestantes AS VARCHAR);
    
    DECLARE @EmpresasSurtika INT;
    SELECT @EmpresasSurtika = COUNT(*) FROM Empresas WHERE InquilinoID = @InquilinoSurtikaID;
    PRINT 'Empresas de Surtika: ' + CAST(@EmpresasSurtika AS VARCHAR);
    PRINT '=========================================';

    -- Si todo está bien, confirmar la transacción
    COMMIT TRANSACTION;
    PRINT '';
    PRINT '✅ TRANSACCIÓN CONFIRMADA - Cambios aplicados permanentemente';

END TRY
BEGIN CATCH
    -- Si hay algún error, deshacer todo
    ROLLBACK TRANSACTION;
    
    PRINT '';
    PRINT '❌ ERROR: ' + ERROR_MESSAGE();
    PRINT 'Línea: ' + CAST(ERROR_LINE() AS VARCHAR);
    PRINT 'Severidad: ' + CAST(ERROR_SEVERITY() AS VARCHAR);
    PRINT '';
    PRINT '⚠️ TRANSACCIÓN REVERTIDA - No se aplicaron cambios';
END CATCH;

-- Mostrar estado final
PRINT '';
PRINT '=== ESTADO FINAL DE LA BASE DE DATOS ===';
SELECT 'Inquilinos' as Tabla, COUNT(*) as Registros FROM Inquilinos
UNION ALL
SELECT 'Empresas', COUNT(*) FROM Empresas
UNION ALL
SELECT 'Incidentes', COUNT(*) FROM Incidentes
UNION ALL
SELECT 'UsuariosCliente', COUNT(*) FROM UsuariosCliente
UNION ALL
SELECT 'CumplimientoEmpresa', COUNT(*) FROM CumplimientoEmpresa
ORDER BY Tabla;