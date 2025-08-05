@echo off
title Instalador Node 20 con NVM - Agente Digital
echo ================================================
echo     INSTALADOR NVM + NODE 20 (WINDOWS)
echo ================================================
echo.

:: Paso 1 - Descargar NVM
echo Descargando NVM para Windows...
powershell -Command "Invoke-WebRequest -Uri https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.exe -OutFile nvm-setup.exe"
start /wait nvm-setup.exe

:: Confirmar que nvm esté disponible
where nvm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: No se encontró 'nvm' en el sistema. Reabre esta ventana y ejecuta de nuevo.
    pause
    exit /b
)

:: Paso 2 - Instalar Node 20
echo.
echo Instalando Node.js v20...
nvm install 20
nvm use 20

:: Verificar versión
echo.
node -v
echo Node instalado correctamente.

:: Paso 3 - Limpiar dependencias antiguas
echo.
echo Limpiando node_modules y package-lock.json...
cd /d "%~dp0"
rmdir /s /q node_modules
del /f /q package-lock.json

:: Paso 4 - Instalar dependencias
echo.
echo Ejecutando npm install...
npm install

echo.
echo ✅ Listo. Ahora puedes correr: npm run dev
pause
