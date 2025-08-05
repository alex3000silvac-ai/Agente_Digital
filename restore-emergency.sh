#!/bin/bash
echo "=== SCRIPT DE EMERGENCIA - RESTAURAR ESTADO ANTERIOR ==="
echo ""
echo "Este script te permite volver al estado anterior del código"
echo ""
echo "Últimos commits:"
git log --oneline -10
echo ""
echo "ADVERTENCIA: Esto deshará TODOS los cambios no guardados!"
echo ""
read -p "¿Estás seguro que quieres restaurar? (s/n): " confirm
if [[ $confirm == [sS] ]]; then
    git reset --hard HEAD~1
    echo ""
    echo "Estado restaurado exitosamente!"
else
    echo "Operación cancelada."
fi