import requests
import json

print("=== PROBANDO GENERACIÓN DE DOCUMENTO ANCI ===\n")

# Primero hacer login
login_url = "http://localhost:5000/api/auth/login"
login_data = {
    "email": "admin@agentedigital.cl",
    "password": "Admin123!"
}

try:
    # Login
    print("1. Haciendo login...")
    login_response = requests.post(login_url, json=login_data)
    if login_response.status_code != 200:
        print(f"Error en login: {login_response.status_code}")
        print(login_response.text)
        exit(1)
    
    token = login_response.json().get('token')
    print("✓ Login exitoso")
    
    # Probar generación de documento
    print("\n2. Generando documento ANCI...")
    headers = {'Authorization': f'Bearer {token}'}
    
    # Intentar generar documento para incidente 33
    url = "http://localhost:5000/api/incidente/33/generar-documento-anci"
    data = {
        "tipo_reporte": "preliminar",
        "formato": "word"
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {response.headers}")
    
    if response.status_code == 200:
        print("✓ Documento generado exitosamente")
        # Guardar el archivo si es exitoso
        with open("documento_anci_test.docx", "wb") as f:
            f.write(response.content)
        print("Documento guardado como: documento_anci_test.docx")
    else:
        print(f"✗ Error: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")