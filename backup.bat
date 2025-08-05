@echo off
echo Haciendo backup...
git add .
git commit -m "Auto backup %date% %time%"
echo Backup completado!
pause