@echo off
echo === VERIFICANDO SQL SERVER ===
echo.

echo 1. Verificando servicios SQL Server:
sc query MSSQLSERVER
echo.

echo 2. Verificando IP local:
ipconfig | findstr IPv4
echo.

echo 3. Probando conexión a localhost:
ping localhost -n 1
echo.

echo 4. Probando puerto SQL (1433):
netstat -an | findstr :1433
echo.

echo === PRUEBA DE CONEXIÓN ===
sqlcmd -S localhost -U app_usuario -P ClaveSegura123! -Q "SELECT 'Conexión exitosa'"
echo.

pause