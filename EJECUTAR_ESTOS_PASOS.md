# PASOS PARA HACER FUNCIONAR LA APLICACIÓN

## 1. EN SQL SERVER MANAGEMENT STUDIO
Ejecuta el archivo: `insertar_datos_prueba.sql`
Esto creará el usuario admin y datos de prueba.

## 2. VERIFICA EL CÓDIGO
El backend está esperando tablas con nombres en singular:
- Usuario (pero tienes Usuarios)
- Inquilino (pero tienes Inquilinos)
- Empresa (pero tienes Empresas)

## 3. SOLUCIÓN RÁPIDA - CREAR VISTAS
Ejecuta este SQL para crear vistas que mapeen los nombres:

```sql
USE AgenteDigitalDB;
GO

-- Crear vista Usuario que apunte a Usuarios
CREATE OR ALTER VIEW Usuario AS
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
CREATE OR ALTER VIEW Inquilino AS
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
CREATE OR ALTER VIEW Empresa AS
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

PRINT 'Vistas creadas exitosamente';
```

## 4. REINICIA EL BACKEND
Ctrl+C y ejecuta: `python run.py`

## 5. PRUEBA LA APLICACIÓN
http://localhost:5173
Login: admin@agentedigital.cl / Admin123!