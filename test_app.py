#!/usr/bin/env python3
"""
Script de prueba rápida para verificar que la aplicación puede iniciarse
"""
import os
import sys

# Agregar el directorio de la API al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

try:
    from app import create_app
    print("✅ Importación exitosa")
    
    # Intentar crear la aplicación
    app = create_app()
    print("✅ Aplicación creada exitosamente")
    
    # Verificar rutas
    print("\n📍 Rutas registradas:")
    for rule in app.url_map.iter_rules():
        print(f"  - {rule}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ Prueba completada exitosamente")