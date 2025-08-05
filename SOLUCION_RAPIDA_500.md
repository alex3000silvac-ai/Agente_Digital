# SOLUCIÓN RÁPIDA ERROR 500

## EL PROBLEMA:
El backend no puede conectar a SQL Server

## SOLUCIÓN INMEDIATA:

### 1. VERIFICAR EN WINDOWS:
Abre CMD como administrador y ejecuta:
```cmd
cd C:\Pasc\Proyecto_Derecho_Digital\Desarrollos\AgenteDigital_Flask
python test_db_direct.py
```

### 2. SI NO CONECTA, VERIFICAR:
- SQL Server está corriendo
- El servidor se llama "PASC"
- Tu usuario Windows tiene acceso

### 3. CREAR USUARIO SQL (ALTERNATIVA):
En SQL Server Management Studio:
```sql
-- Crear login
CREATE LOGIN app_usuario WITH PASSWORD = 'ClaveSegura123!';

-- Dar acceso a la BD
USE AgenteDigitalDB;
CREATE USER app_usuario FOR LOGIN app_usuario;
ALTER ROLE db_datareader ADD MEMBER app_usuario;
ALTER ROLE db_datawriter ADD MEMBER app_usuario;
```

### 4. CAMBIAR .env PARA USAR SQL AUTH:
```
USE_WINDOWS_AUTH=False
LOCAL_DB_USERNAME=app_usuario
LOCAL_DB_PASSWORD=ClaveSegura123!
```

### 5. VERIFICAR DATOS:
```sql
-- En SSMS
USE AgenteDigitalDB;
SELECT COUNT(*) FROM Inquilino;
SELECT COUNT(*) FROM Usuario WHERE email = 'admin@agentedigital.cl';
```

Si no hay datos, créalos:
```sql
-- Crear inquilino
INSERT INTO Inquilino (NombreInquilino, RutInquilino, DireccionInquilino, Estado)
VALUES ('Empresa Demo', '76.123.456-7', 'Santiago', 'Activo');

-- Crear usuario admin
INSERT INTO Usuario (nombre, email, password_hash, rol, activo)
VALUES ('Admin', 'admin@agentedigital.cl', 
'scrypt:32768:8:1$KJ8kF3zL8hXR5Q9Y$b8f0e5c3d4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
'Administrador', 1);
```

## REINICIA EL BACKEND DESPUÉS DE CADA CAMBIO