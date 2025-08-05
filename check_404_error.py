import requests

print("=== VERIFICANDO ERROR 404 ===\n")

# Primero verificar que el backend está corriendo
try:
    response = requests.get("http://localhost:5000/api/admin/health")
    print(f"Backend status: {response.status_code}")
except:
    print("❌ Backend no está corriendo")
    exit(1)

# Intentar acceder a la ruta que da 404
print("\nProbando ruta que da 404:")
try:
    response = requests.get("http://localhost:5000/admin/incidentes/33")
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    if response.status_code == 404:
        print("✓ Confirmado: La ruta /admin/incidentes/33 (sin /api) devuelve 404")
except Exception as e:
    print(f"Error: {e}")

# Probar la ruta correcta
print("\nProbando ruta correcta con /api:")
try:
    response = requests.get("http://localhost:5000/api/admin/incidentes/33")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ La ruta /api/admin/incidentes/33 funciona correctamente")
except Exception as e:
    print(f"Error: {e}")

print("\nCONCLUSIÓN:")
print("El error 404 viene de algún componente del frontend que está intentando")
print("acceder a /admin/incidentes/33 sin el prefijo /api")
print("\nPosibles causas:")
print("1. Un componente lazy loaded")
print("2. Una imagen o recurso CSS")
print("3. Un iframe oculto")
print("4. Un worker o service worker")
print("5. Una extensión del navegador")