-- CREAR VISTAS PARA MAPEAR NOMBRES DE TABLAS
USE AgenteDigitalDB;
GO

-- Crear vista Usuario que apunte a Usuarios
IF EXISTS (SELECT * FROM sys.views WHERE name = 'Usuario')
    DROP VIEW Usuario;
GO

CREATE VIEW Usuario AS
SELECT 
    UsuarioID,
    Email as email,
    PasswordHash as password_hash,
    NombreCompleto as nombre,
    Rol as rol,
    EstadoActivo as activo,
    InquilinoID,
    FechaCreacion as fecha_creacion,
    UltimoAcceso as ultimo_acceso
FROM Usuarios;
GO

-- Crear vista Inquilino que apunte a Inquilinos
IF EXISTS (SELECT * FROM sys.views WHERE name = 'Inquilino')
    DROP VIEW Inquilino;
GO

CREATE VIEW Inquilino AS
SELECT 
    InquilinoID,
    RazonSocial as NombreInquilino,
    RUT as RutInquilino,
    'Santiago' as DireccionInquilino,
    CASE WHEN EstadoActivo = 1 THEN 'Activo' ELSE 'Inactivo' END as Estado,
    FechaCreacion
FROM Inquilinos;
GO

-- Crear vista Empresa que apunte a Empresas
IF EXISTS (SELECT * FROM sys.views WHERE name = 'Empresa')
    DROP VIEW Empresa;
GO

CREATE VIEW Empresa AS
SELECT 
    EmpresaID,
    RazonSocial as NombreEmpresa,
    RUT as RutEmpresa,
    Direccion as DireccionEmpresa,
    TipoEmpresa,
    CASE WHEN EstadoActivo = 1 THEN 'Activo' ELSE 'Inactivo' END as Estado,
    InquilinoID,
    FechaCreacion
FROM Empresas;
GO

-- Crear vista Incidente que apunte a Incidentes
IF EXISTS (SELECT * FROM sys.views WHERE name = 'Incidente')
    DROP VIEW Incidente;
GO

CREATE VIEW Incidente AS
SELECT 
    IncidenteID,
    Titulo,
    FechaCreacion as FechaHoraIncidente,
    FechaDeteccion as FechaHoraDeteccion,
    FechaCreacion as FechaReporte,
    'Ciberseguridad' as TipoIncidente,
    Criticidad as Severidad,
    EstadoActual as EstadoIncidente,
    DescripcionInicial as Descripcion,
    'N/A' as ImpactoOperacional,
    SistemasAfectados as ServiciosAfectados,
    1 as UsuarioID,
    EmpresaID,
    1 as InquilinoID
FROM Incidentes;
GO

PRINT 'Vistas creadas exitosamente';
PRINT '';
PRINT 'Verificando:';
SELECT 'Vista Usuario' as Vista, COUNT(*) as Registros FROM Usuario
UNION ALL
SELECT 'Vista Inquilino', COUNT(*) FROM Inquilino
UNION ALL
SELECT 'Vista Empresa', COUNT(*) FROM Empresa;
GO