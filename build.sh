#!/bin/bash
# Script de build para Railway

echo "🚀 Iniciando build de Agente Digital..."

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd agente_digital_ui
npm install --legacy-peer-deps

# Construir el frontend
echo "🔨 Construyendo frontend..."
npm run build

# Copiar los archivos construidos
echo "📁 Copiando archivos estáticos..."
cd ..
mkdir -p agente_digital_api/static
cp -r agente_digital_ui/dist/* agente_digital_api/static/

echo "✅ Build completado!"