-- EJECUTAR EN SQL SERVER MANAGEMENT STUDIO
-- Como usuario administrador (sa o Windows admin)

-- 1. Crear el login
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'app_usuario')
BEGIN
    CREATE LOGIN app_usuario WITH PASSWORD = 'ClaveSegura123!';
    PRINT 'Login app_usuario creado';
END
ELSE
    PRINT 'Login app_usuario ya existe';
GO

-- 2. Dar acceso a la base de datos
USE AgenteDigitalDB;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'app_usuario')
BEGIN
    CREATE USER app_usuario FOR LOGIN app_usuario;
    PRINT 'Usuario app_usuario creado en AgenteDigitalDB';
END
ELSE
    PRINT 'Usuario app_usuario ya existe en AgenteDigitalDB';
GO

-- 3. Asignar permisos
ALTER ROLE db_datareader ADD MEMBER app_usuario;
ALTER ROLE db_datawriter ADD MEMBER app_usuario;
ALTER ROLE db_ddladmin ADD MEMBER app_usuario;
PRINT 'Permisos asignados a app_usuario';
GO

-- 4. Verificar tablas necesarias
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inquilino')
BEGIN
    PRINT 'ERROR: Tabla Inquilino no existe';
END
ELSE
BEGIN
    DECLARE @count INT;
    SELECT @count = COUNT(*) FROM Inquilino;
    PRINT 'Tabla Inquilino existe con ' + CAST(@count AS VARCHAR) + ' registros';
    
    -- Si no hay datos, crear uno de prueba
    IF @count = 0
    BEGIN
        INSERT INTO Inquilino (NombreInquilino, RutInquilino, DireccionInquilino, Estado)
        VALUES ('Empresa Demo S.A.', '76.123.456-7', 'Av. Providencia 123, Santiago', 'Activo');
        PRINT 'Inquilino de prueba creado';
    END
END
GO

-- 5. Verificar usuario admin
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuario')
BEGIN
    PRINT 'ERROR: Tabla Usuario no existe';
END
ELSE
BEGIN
    DECLARE @adminCount INT;
    SELECT @adminCount = COUNT(*) FROM Usuario WHERE email = 'admin@agentedigital.cl';
    
    IF @adminCount = 0
    BEGIN
        INSERT INTO Usuario (nombre, email, password_hash, rol, activo)
        VALUES ('Administrador', 'admin@agentedigital.cl', 
                'scrypt:32768:8:1$KJ8kF3zL8hXR5Q9Y$b8f0e5c3d4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', 
                'Administrador', 1);
        PRINT 'Usuario admin@agentedigital.cl creado';
    END
    ELSE
        PRINT 'Usuario admin@agentedigital.cl ya existe';
END
GO

-- 6. Probar conexión
PRINT '';
PRINT '=== PRUEBA DE CONEXIÓN ===';
PRINT 'Usuario actual: ' + SYSTEM_USER;
PRINT 'Base de datos: ' + DB_NAME();
PRINT '';
PRINT 'TODO LISTO - Reinicia el backend de Python';
GO