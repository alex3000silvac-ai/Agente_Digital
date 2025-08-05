#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Flask con todas las rutas funcionando correctamente
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Configurar modo de prueba
os.environ['TEST_MODE'] = 'true'

# Agregar el directorio de la aplicación al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

def create_fixed_app():
    """Crear aplicación Flask con todas las rutas funcionando"""
    app = Flask(__name__)
    
    # Configuración básica
    app.config['SECRET_KEY'] = 'dev-key-for-testing'
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
    
    # Registrar manejadores de errores globales
    try:
        from agente_digital_api.app.error_handlers import register_error_handlers
        register_error_handlers(app)
        print("✅ Manejadores de errores globales registrados")
    except Exception as e:
        print(f"⚠️ Error registrando manejadores: {e}")
    
    # CORS COMPLETO para todas las rutas 
    CORS(app, resources={
        r"/*": {  # TODAS las rutas, incluyendo /health y /ping
            "origins": ["http://localhost:3000", "http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Registrar todos los blueprints
    try:
        from agente_digital_api.app.routes import auth_bp
        app.register_blueprint(auth_bp)
        print("✅ Blueprint auth registrado")
    except Exception as e:
        print(f"❌ Error importando auth: {e}")
    
    try:
        from agente_digital_api.app.admin_views import admin_api_bp
        app.register_blueprint(admin_api_bp)
        print("✅ Blueprint admin_api registrado")
        
        # Verificar que las rutas de incidentes están presentes
        incidentes_routes = [rule for rule in app.url_map.iter_rules() if 'incidentes' in rule.rule]
        print(f"✅ {len(incidentes_routes)} rutas de incidentes registradas")
        
        # Mostrar la ruta específica que necesitamos
        target_route = [rule for rule in app.url_map.iter_rules() if rule.rule == '/api/admin/empresas/<int:empresa_id>/incidentes' and 'POST' in rule.methods]
        if target_route:
            print("✅ Ruta POST /api/admin/empresas/<int:empresa_id>/incidentes ENCONTRADA")
        else:
            print("❌ Ruta POST /api/admin/empresas/<int:empresa_id>/incidentes NO ENCONTRADA")
            
        # Verificar ruta de taxonomías
        taxonomias_route = [rule for rule in app.url_map.iter_rules() if rule.rule == '/api/admin/taxonomias/jerarquica' and 'GET' in rule.methods]
        if taxonomias_route:
            print("✅ Ruta GET /api/admin/taxonomias/jerarquica ENCONTRADA")
        else:
            print("❌ Ruta GET /api/admin/taxonomias/jerarquica NO ENCONTRADA")
            
    except Exception as e:
        print(f"❌ Error importando admin_views: {e}")
        import traceback
        traceback.print_exc()
    
    # Health check
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy', 
            'mode': 'fixed',
            'admin_routes': len([rule for rule in app.url_map.iter_rules() if 'admin' in rule.rule])
        })
    
    # Ping endpoint para verificación rápida
    @app.route('/ping')
    def ping():
        return jsonify({'status': 'ok', 'server': 'flask'})
    
    # Endpoint de prueba para verificar rutas
    @app.route('/debug/routes')
    def debug_routes():
        rules = []
        for rule in app.url_map.iter_rules():
            rules.append({
                'rule': rule.rule,
                'methods': list(rule.methods),
                'endpoint': rule.endpoint
            })
        return jsonify(rules)
    
    return app

if __name__ == '__main__':
    app = create_fixed_app()
    
    print("🚀 Iniciando servidor Flask CORREGIDO")
    print("📊 Rutas disponibles:")
    
    # Mostrar rutas relevantes
    for rule in app.url_map.iter_rules():
        if 'incidentes' in rule.rule or 'empresas' in rule.rule:
            print(f"  - {rule.rule} [{', '.join(rule.methods)}]")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )