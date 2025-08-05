@echo off
echo === SCRIPT DE EMERGENCIA - RESTAURAR ESTADO ANTERIOR ===
echo.
echo Este script te permite volver al estado anterior del codigo
echo.
echo Ultimos commits:
git log --oneline -10
echo.
echo ADVERTENCIA: Esto deshara TODOS los cambios no guardados!
echo.
set /p confirm="Estas seguro que quieres restaurar? (S/N): "
if /i "%confirm%" == "S" (
    git reset --hard HEAD~1
    echo.
    echo Estado restaurado exitosamente!
) else (
    echo Operacion cancelada.
)
echo.
pause