# static_files.py
# Servir archivos estáticos del frontend en producción

from flask import send_from_directory, send_file
import os

def configure_static_files(app):
    """Configura el servicio de archivos estáticos del frontend"""
    
    # Ruta al directorio de build del frontend
    frontend_build_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '../../agente_digital_ui/dist')
    )
    
    # Servir archivos estáticos
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        # Si es una petición a la API, dejar que Flask la maneje
        if path.startswith('api/'):
            return None
            
        # Intentar servir el archivo solicitado
        if path and os.path.exists(os.path.join(frontend_build_path, path)):
            return send_from_directory(frontend_build_path, path)
        
        # Para rutas del frontend (Vue Router), servir index.html
        return send_file(os.path.join(frontend_build_path, 'index.html'))
    
    return app