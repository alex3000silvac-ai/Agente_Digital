-- INSERTAR DATOS DE PRUEBA EN LAS TABLAS CORRECTAS
USE AgenteDigitalDB;
GO

-- 1. Verificar si existe usuario admin
DECLARE @AdminExists INT;
SELECT @AdminExists = COUNT(*) FROM Usuarios WHERE Email = 'admin@agentedigital.cl';

IF @AdminExists = 0
BEGIN
    -- Insertar usuario administrador
    INSERT INTO Usuarios (
        Email, 
        PasswordHash, 
        NombreCompleto, 
        Rol, 
        EstadoActivo,
        FechaCreacion
    )
    VALUES (
        'admin@agentedigital.cl',
        'scrypt:32768:8:1$KJ8kF3zL8hXR5Q9Y$b8f0e5c3d4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
        'Administrador del Sistema',
        'Administrador',
        1,
        GETDATE()
    );
    PRINT 'Usuario admin@agentedigital.cl creado';
END
ELSE
    PRINT 'Usuario admin@agentedigital.cl ya existe';

-- 2. Verificar si existen inquilinos
DECLARE @InquilinosCount INT;
SELECT @InquilinosCount = COUNT(*) FROM Inquilinos;

IF @InquilinosCount = 0
BEGIN
    -- Insertar inquilino de prueba
    INSERT INTO Inquilinos (
        RazonSocial,
        RUT,
        EstadoActivo,
        FechaCreacion
    )
    VALUES (
        'Empresa Demo S.A.',
        '76.123.456-7',
        1,
        GETDATE()
    );
    PRINT 'Inquilino de prueba creado';
END

-- 3. Verificar si existen empresas
DECLARE @EmpresasCount INT;
SELECT @EmpresasCount = COUNT(*) FROM Empresas;

IF @EmpresasCount = 0
BEGIN
    DECLARE @InquilinoID INT;
    SELECT TOP 1 @InquilinoID = InquilinoID FROM Inquilinos;
    
    -- Insertar empresa de prueba
    INSERT INTO Empresas (
        InquilinoID,
        RazonSocial,
        RUT,
        TipoEmpresa,
        Direccion,
        Ciudad,
        EmailContacto,
        EstadoActivo,
        FechaCreacion
    )
    VALUES (
        @InquilinoID,
        'Empresa Demo S.A.',
        '76.123.456-7',
        'OIV',
        'Av. Providencia 123',
        'Santiago',
        'contacto@empresademo.cl',
        1,
        GETDATE()
    );
    PRINT 'Empresa de prueba creada';
END

-- 4. Mostrar resumen
PRINT '';
PRINT '=== RESUMEN DE DATOS ===';
SELECT 'Usuarios' as Tabla, COUNT(*) as Total FROM Usuarios
UNION ALL
SELECT 'Inquilinos', COUNT(*) FROM Inquilinos
UNION ALL
SELECT 'Empresas', COUNT(*) FROM Empresas;

-- 5. Mostrar usuario admin
PRINT '';
PRINT 'Usuario administrador:';
SELECT Email, NombreCompleto, Rol, EstadoActivo 
FROM Usuarios 
WHERE Email = 'admin@agentedigital.cl';

GO