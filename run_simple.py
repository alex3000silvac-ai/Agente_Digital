#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Flask simplificado para pruebas
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Configurar modo de prueba
os.environ['TEST_MODE'] = 'true'

# Agregar el directorio de la aplicación al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

def create_simple_app():
    app = Flask(__name__)
    
    # Configuración básica
    app.config['SECRET_KEY'] = 'dev-key-for-testing'
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
    
    # CORS básico
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Importar solo los blueprints necesarios
    try:
        from agente_digital_api.app.routes import auth_bp
        app.register_blueprint(auth_bp)
        print("✅ Blueprint auth registrado")
    except ImportError as e:
        print(f"❌ Error importando auth: {e}")
    
    try:
        from agente_digital_api.app.admin_views import admin_api_bp
        app.register_blueprint(admin_api_bp)
        print("✅ Blueprint admin_api registrado")
    except ImportError as e:
        print(f"❌ Error importando admin_views: {e}")
    
    # Health check
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'mode': 'simple'})
    
    return app

if __name__ == '__main__':
    app = create_simple_app()
    print("🚀 Iniciando servidor Flask simplificado en modo de prueba")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )