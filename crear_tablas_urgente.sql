-- CREAR TODAS LAS TABLAS NECESARIAS
-- Ejecutar en SQL Server Management Studio

USE AgenteDigitalDB;
GO

-- 1. Tabla Inquilino
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inquilino')
BEGIN
    CREATE TABLE Inquilino (
        InquilinoID INT IDENTITY(1,1) PRIMARY KEY,
        NombreInquilino NVARCHAR(200) NOT NULL,
        RutInquilino NVARCHAR(20),
        DireccionInquilino NVARCHAR(500),
        Estado NVARCHAR(50) DEFAULT 'Activo',
        FechaCreacion DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla Inquilino creada';
END
GO

-- 2. Tabla Usuario
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuario')
BEGIN
    CREATE TABLE Usuario (
        UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(500) NOT NULL,
        rol NVARCHAR(50) NOT NULL,
        activo BIT DEFAULT 1,
        fecha_creacion DATETIME DEFAULT GETDATE(),
        ultimo_acceso DATETIME,
        InquilinoID INT NULL,
        FOREIGN KEY (InquilinoID) REFERENCES Inquilino(InquilinoID)
    );
    PRINT 'Tabla Usuario creada';
END
GO

-- 3. Tabla Empresa
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Empresa')
BEGIN
    CREATE TABLE Empresa (
        EmpresaID INT IDENTITY(1,1) PRIMARY KEY,
        NombreEmpresa NVARCHAR(200) NOT NULL,
        RutEmpresa NVARCHAR(20),
        DireccionEmpresa NVARCHAR(500),
        TipoEmpresa NVARCHAR(50),
        Estado NVARCHAR(50) DEFAULT 'Activo',
        InquilinoID INT NOT NULL,
        FechaCreacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (InquilinoID) REFERENCES Inquilino(InquilinoID)
    );
    PRINT 'Tabla Empresa creada';
END
GO

-- 4. Tabla Incidente
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Incidente')
BEGIN
    CREATE TABLE Incidente (
        IncidenteID INT IDENTITY(1,1) PRIMARY KEY,
        FechaHoraIncidente DATETIME NOT NULL,
        FechaHoraDeteccion DATETIME,
        FechaReporte DATETIME DEFAULT GETDATE(),
        TipoIncidente NVARCHAR(100),
        Severidad NVARCHAR(50),
        EstadoIncidente NVARCHAR(50) DEFAULT 'Activo',
        Descripcion NVARCHAR(MAX),
        ImpactoOperacional NVARCHAR(MAX),
        ServiciosAfectados NVARCHAR(MAX),
        UsuarioID INT NOT NULL,
        EmpresaID INT NOT NULL,
        InquilinoID INT NOT NULL,
        FOREIGN KEY (UsuarioID) REFERENCES Usuario(UsuarioID),
        FOREIGN KEY (EmpresaID) REFERENCES Empresa(EmpresaID),
        FOREIGN KEY (InquilinoID) REFERENCES Inquilino(InquilinoID)
    );
    PRINT 'Tabla Incidente creada';
END
GO

-- 5. Insertar datos iniciales

-- Inquilino de prueba
IF NOT EXISTS (SELECT * FROM Inquilino)
BEGIN
    INSERT INTO Inquilino (NombreInquilino, RutInquilino, DireccionInquilino)
    VALUES ('Empresa Demo S.A.', '76.123.456-7', 'Av. Providencia 123, Santiago');
    PRINT 'Inquilino de prueba creado';
END
GO

-- Usuario administrador
IF NOT EXISTS (SELECT * FROM Usuario WHERE email = 'admin@agentedigital.cl')
BEGIN
    INSERT INTO Usuario (nombre, email, password_hash, rol, activo)
    VALUES ('Administrador', 'admin@agentedigital.cl', 
            'scrypt:32768:8:1$KJ8kF3zL8hXR5Q9Y$b8f0e5c3d4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', 
            'Administrador', 1);
    PRINT 'Usuario admin creado';
END
GO

-- Empresa de prueba
IF NOT EXISTS (SELECT * FROM Empresa)
BEGIN
    DECLARE @InquilinoID INT;
    SELECT TOP 1 @InquilinoID = InquilinoID FROM Inquilino;
    
    INSERT INTO Empresa (NombreEmpresa, RutEmpresa, TipoEmpresa, InquilinoID)
    VALUES ('Empresa Demo S.A.', '76.123.456-7', 'OIV', @InquilinoID);
    PRINT 'Empresa de prueba creada';
END
GO

PRINT '';
PRINT '=== VERIFICACIÓN FINAL ===';
SELECT 'Inquilinos' as Tabla, COUNT(*) as Total FROM Inquilino
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM Usuario
UNION ALL
SELECT 'Empresas', COUNT(*) FROM Empresa;

PRINT '';
PRINT 'TABLAS CREADAS - Reinicia el backend de Python ahora';
GO