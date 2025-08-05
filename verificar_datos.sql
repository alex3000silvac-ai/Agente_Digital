-- VERIFICAR DATOS EXISTENTES
USE AgenteDigitalDB;
GO

-- 1. Verificar inquilinos
SELECT 'Inquilinos' as Tabla, COUNT(*) as Total FROM Inquilinos;
SELECT TOP 5 * FROM Inquilinos;

-- 2. Verificar usuarios
SELECT 'Usuarios' as Tabla, COUNT(*) as Total FROM Usuarios;
SELECT * FROM Usuarios WHERE CorreoElectronico = 'admin@agentedigital.cl' OR email = 'admin@agentedigital.cl';

-- 3. Si no existe admin, crearlo
IF NOT EXISTS (SELECT * FROM Usuarios WHERE CorreoElectronico = 'admin@agentedigital.cl')
BEGIN
    INSERT INTO Usuarios (Nombre, CorreoElectronico, PasswordHash, RolID, Activo)
    VALUES ('Administrador', 'admin@agentedigital.cl', 
            'scrypt:32768:8:1$KJ8kF3zL8hXR5Q9Y$b8f0e5c3d4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', 
            1, 1);
    PRINT 'Usuario admin creado';
END

-- 4. Si no hay inquilinos, crear uno
IF NOT EXISTS (SELECT * FROM Inquilinos)
BEGIN
    INSERT INTO Inquilinos (Nombre, RUT, Direccion, Estado)
    VALUES ('Empresa Demo S.A.', '76.123.456-7', 'Santiago', 1);
END

-- Ver estructura de la tabla Usuarios
EXEC sp_columns Usuarios;