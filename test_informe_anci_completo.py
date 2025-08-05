#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba para el generador de informes ANCI completos
"""

import requests
import json
import os

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

if response.status_code == 200:
    login_result = response.json()
    token = login_result.get('token')
    print(f"   Token obtenido exitosamente")
    
    # 2. Verificar si existe un reporte ANCI para el incidente 5
    print("\n2. Verificando reportes ANCI existentes...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Primero buscar si existe un reporte ANCI
    # Como no tenemos un endpoint específico, vamos a generar directamente desde el incidente
    
    # 3. Generar informe ANCI completo
    print("\n3. Generando informe ANCI completo desde incidente 5...")
    response = requests.post(
        f"{BASE_URL}/api/admin/incidentes/5/generar-informe-anci-completo",
        headers=headers
    )
    
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        # Guardar el archivo
        filename = "Informe_ANCI_Completo_Test.docx"
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"   ✅ Informe guardado como: {filename}")
        print(f"   Tamaño: {len(response.content)} bytes")
    else:
        print(f"   ❌ Error: {response.text}")
    
    # 4. Validar campos de un reporte (si tenemos el ID)
    # Este endpoint requiere conocer el ID del reporte ANCI
    print("\n4. Para validar campos completos, necesitamos el ID del reporte ANCI")
    print("   (Este paso requiere conocer el ReporteAnciID)")
    
else:
    print("❌ Error en login")