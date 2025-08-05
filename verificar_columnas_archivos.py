#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar las columnas de la tabla INCIDENTES_ARCHIVOS
"""

import pyodbc

# Configuración
server = '192.168.100.125'
database = 'AgenteDigitalDB'
username = 'app_usuario'
password = 'ClaveSegura123!'
driver = 'ODBC Driver 17 for SQL Server'

try:
    conn_str = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("✅ Conexión exitosa")
    
    # Obtener columnas de la tabla INCIDENTES_ARCHIVOS
    print("\n📋 Columnas de la tabla INCIDENTES_ARCHIVOS:")
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'INCIDENTES_ARCHIVOS'
        ORDER BY ORDINAL_POSITION
    """)
    
    columnas = cursor.fetchall()
    for col in columnas:
        print(f"  - {col.COLUMN_NAME}: {col.DATA_TYPE}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")