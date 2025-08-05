#!/usr/bin/env python3
"""
Test directo del endpoint de taxonomías
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint():
    """Probar el endpoint directamente"""
    
    print("="*80)
    print("TEST DIRECTO DEL ENDPOINT")
    print("="*80)
    
    # Simular la petición exacta que hace el frontend
    url = f"{BASE_URL}/api/admin/taxonomias/flat?tipo_empresa=PSE"
    
    print(f"\nURL: {url}")
    print("Headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}")
    
    try:
        response = requests.get(
            url,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=10
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nRespuesta JSON:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            if 'taxonomias' in data:
                print(f"\n✅ Total taxonomías en respuesta: {len(data['taxonomias'])}")
                print(f"✅ Valor de 'total' en respuesta: {data.get('total')}")
                
                # Mostrar primeras 5
                print("\nPrimeras 5 taxonomías:")
                for i, tax in enumerate(data['taxonomias'][:5], 1):
                    print(f"\n{i}. ID: {tax.get('id')}")
                    print(f"   Área: {tax.get('area')}")
                    print(f"   Efecto: {tax.get('efecto')}")
                    print(f"   Categoría: {tax.get('categoria')}")
                    print(f"   Aplica para: {tax.get('aplica_para')}")
        else:
            print(f"\n❌ Error: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Error de conexión: {e}")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    # Primero verificar si el servidor está activo
    try:
        health = requests.get(f"{BASE_URL}/health", timeout=2)
        print(f"✅ Servidor activo: {health.status_code}")
    except:
        print("❌ Servidor no está activo en http://localhost:5000")
        print("   Ejecute: python run.py")
    
    test_endpoint()