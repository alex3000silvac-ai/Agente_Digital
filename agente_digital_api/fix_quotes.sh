#!/bin/bash

# Script para corregir caracteres problemáticos

FILE="/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/AgenteDigital_Flask/agente_digital_ui/src/components/ModuloAcompanamiento.vue"

# Crear backup
cp "$FILE" "$FILE.backup_quotes"

# Reemplazar caracteres problemáticos
# Comillas simples curvas
sed -i "s/'/'/g" "$FILE"
sed -i "s/'/'/g" "$FILE"

# Comillas dobles curvas
sed -i 's/"/"/g' "$FILE"
sed -i 's/"/"/g' "$FILE"

# Guiones largos
sed -i 's/–/-/g' "$FILE"
sed -i 's/—/-/g' "$FILE"

# Puntos suspensivos
sed -i 's/…/.../g' "$FILE"

echo "✅ Caracteres corregidos exitosamente"
echo "📄 Backup guardado en: $FILE.backup_quotes"