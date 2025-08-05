import requests
import json

print("=== PROBANDO LOGIN DIRECTO ===\n")

# URL del backend
url = "http://localhost:5000/api/auth/login"

# Credenciales
data = {
    "email": "admin@agentedigital.cl",
    "password": "Admin123!"
}

try:
    # Hacer petición de login
    response = requests.post(url, json=data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}...")
    
    if response.status_code == 200:
        print("\n✅ LOGIN EXITOSO!")
        token = response.json().get('token')
        print(f"Token: {token[:50]}...")
        
        # Probar endpoint de inquilinos
        print("\n=== PROBANDO ENDPOINT INQUILINOS ===")
        headers = {'Authorization': f'Bearer {token}'}
        resp2 = requests.get("http://localhost:5000/api/admin/inquilinos", headers=headers)
        print(f"Status: {resp2.status_code}")
        print(f"Response: {resp2.text[:200]}...")
        
    else:
        print("\n❌ ERROR EN LOGIN")
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("\nAsegúrate de que el backend esté corriendo en http://localhost:5000")