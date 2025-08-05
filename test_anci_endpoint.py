#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para probar el endpoint de validación ANCI
"""

import requests
import json

# URL base
BASE_URL = "http://localhost:5000"

# 1. Login
print("1. Realizando login...")
login_data = {
    "email": "pascualsoto@gmail.com",
    "password": "Pw_2024%"
}

response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
print(f"   Status: {response.status_code}")
print(f"   Response: {response.text}")

if response.status_code == 200:
    login_result = response.json()
    token = login_result.get('token')
    print(f"   Token obtenido: {token[:50]}...")
    
    # 2. Probar endpoint de validación ANCI
    print("\n2. Probando endpoint de validación ANCI...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/admin/incidentes/5/validar-para-anci", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:500]}...")
    
    if response.status_code == 200:
        data = response.json()
        print("\n   Validación exitosa:")
        print(f"   - Es válido: {data.get('es_valido')}")
        print(f"   - Campos completos: {data.get('campos_completos', [])[:3]}...")
        print(f"   - Campos faltantes: {data.get('campos_faltantes', [])[:3]}...")
    else:
        print(f"\n   Error: {response.text}")
else:
    print("Error en login")