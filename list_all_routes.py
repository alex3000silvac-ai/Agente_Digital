#!/usr/bin/env python3
"""
Listar todas las rutas disponibles en el servidor Flask
"""

import requests

print("🔍 LISTANDO TODAS LAS RUTAS DISPONIBLES")
print("=======================================")

# Primero intentar obtener las rutas del servidor
try:
    # Intentar diferentes endpoints comunes
    endpoints_to_test = [
        "/",
        "/api",
        "/api/",
        "/api/admin",
        "/api/admin/",
        "/api/inquilinos",
        "/admin/inquilinos",
        "/inquilinos",
        "/api/admin/inquilinos",
        "/api/admin/test",
        "/test",
        "/health"
    ]
    
    print("\n📋 Probando endpoints:")
    for endpoint in endpoints_to_test:
        try:
            url = f"http://localhost:5000{endpoint}"
            response = requests.get(url, timeout=2)
            if response.status_code != 404:
                print(f"✅ {endpoint} -> Status: {response.status_code}")
            else:
                print(f"❌ {endpoint} -> 404 Not Found")
        except Exception as e:
            print(f"❌ {endpoint} -> Error: {type(e).__name__}")
            
    # Intentar encontrar un endpoint de debug
    print("\n🔧 Intentando endpoints de debug:")
    debug_endpoints = [
        "/debug/routes",
        "/_debug",
        "/routes",
        "/api/routes"
    ]
    
    for endpoint in debug_endpoints:
        try:
            url = f"http://localhost:5000{endpoint}"
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                print(f"✅ Encontrado: {endpoint}")
                print(response.text[:500])
        except:
            pass
            
except Exception as e:
    print(f"❌ Error general: {e}")

print("\n💡 NOTA: Si todos devuelven 404, puede ser que:")
print("   1. El servidor está usando un prefijo diferente")
print("   2. Hay un problema con el registro de blueprints")
print("   3. El servidor no se reinició correctamente")