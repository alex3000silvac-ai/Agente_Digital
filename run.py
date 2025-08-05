#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Archivo principal para ejecutar la aplicación Flask API
Configurado para desarrollo y producción
"""

import sys
import os

# Agregar el directorio de la aplicación al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

# Importar desde la aplicación
from agente_digital_api.app import create_app

def get_app():
    """Crear y configurar la aplicación Flask"""
    return create_app()

if __name__ == '__main__':
    app = get_app()
    # Ejecutar en modo producción
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )