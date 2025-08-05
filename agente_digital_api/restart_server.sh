#!/bin/bash
echo "🔄 Reiniciando servidor Flask..."
echo "================================"

# Matar procesos Flask existentes
echo "1️⃣ Deteniendo procesos Flask..."
pkill -f "flask run" || true
pkill -f "python.*app.py" || true

# Esperar un momento
sleep 2

# Iniciar servidor
echo "2️⃣ Iniciando servidor..."
cd /mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/AgenteDigital_Flask/agente_digital_api

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Ejecutar Flask
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=0.0.0.0 --port=5000

echo "✅ Servidor reiniciado"