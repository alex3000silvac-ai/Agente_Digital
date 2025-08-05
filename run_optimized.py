#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Flask Optimizado y Limpio
Versión refactorizada sin código redundante
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Configuración de entorno
os.environ['TEST_MODE'] = 'true'
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

def create_app():
    """Crear aplicación Flask optimizada"""
    app = Flask(__name__)
    
    # Configuración básica
    app.config.update({
        'SECRET_KEY': 'dev-key-for-testing',
        'MAX_CONTENT_LENGTH': 100 * 1024 * 1024,  # 100MB
        'JSON_SORT_KEYS': False
    })
    
    # Configurar CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Registrar manejadores de errores globales
    try:
        from agente_digital_api.app.error_handlers import register_error_handlers
        register_error_handlers(app)
        print("✅ Sistema de manejo de errores activado")
    except ImportError as e:
        print(f"⚠️ Sistema de errores no disponible: {e}")
    
    # Registrar blueprints principales
    blueprints_registered = 0
    
    # Blueprint de autenticación
    try:
        from agente_digital_api.app.routes import auth_bp
        app.register_blueprint(auth_bp)
        blueprints_registered += 1
        print("✅ Módulo de autenticación cargado")
    except ImportError as e:
        print(f"⚠️ Módulo auth no disponible: {e}")
    
    # Blueprint de administración
    try:
        from agente_digital_api.app.admin_views import admin_api_bp
        app.register_blueprint(admin_api_bp)
        blueprints_registered += 1
        print("✅ Módulo de administración cargado")
    except ImportError as e:
        print(f"⚠️ Módulo admin no disponible: {e}")
    
    # Endpoints básicos del sistema
    @app.route('/health')
    def health_check():
        """Health check optimizado"""
        return jsonify({
            'status': 'healthy',
            'blueprints': blueprints_registered,
            'mode': 'optimized'
        })
    
    @app.route('/ping')
    def ping():
        """Ping básico para verificación de conectividad"""
        return jsonify({'status': 'ok'})
    
    @app.route('/api/info')
    def api_info():
        """Información de la API"""
        admin_routes = [rule.rule for rule in app.url_map.iter_rules() 
                       if rule.rule.startswith('/api/admin/')]
        
        return jsonify({
            'api_version': '1.0.0',
            'endpoints_available': len(admin_routes),
            'health_check': '/health',
            'documentation': '/api/info'
        })
    
    print(f"🎯 Aplicación creada con {blueprints_registered} módulos")
    return app

def show_available_routes(app):
    """Mostrar rutas disponibles del sistema"""
    print("\n📋 RUTAS PRINCIPALES DISPONIBLES:")
    
    core_routes = []
    admin_routes = []
    
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/admin/'):
            admin_routes.append(f"  {rule.rule} [{', '.join(sorted(rule.methods - {'OPTIONS', 'HEAD'}))}]")
        elif rule.rule in ['/health', '/ping', '/api/info']:
            core_routes.append(f"  {rule.rule} [GET]")
    
    if core_routes:
        print("🔧 Sistema:")
        for route in sorted(core_routes):
            print(route)
    
    if admin_routes:
        print("🏢 Administración:")
        for route in sorted(admin_routes):
            print(route)
    
    print(f"\n✅ Total: {len(core_routes + admin_routes)} endpoints activos")

if __name__ == '__main__':
    print("🚀 INICIANDO SERVIDOR FLASK OPTIMIZADO")
    print("=" * 50)
    
    # Crear aplicación
    app = create_app()
    
    # Mostrar información del sistema
    show_available_routes(app)
    
    print("\n🌐 Servidor disponible en:")
    print("  - http://localhost:5000")
    print("  - Health check: http://localhost:5000/health")
    print("  - API info: http://localhost:5000/api/info")
    
    # Iniciar servidor
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True,
        use_reloader=True
    )