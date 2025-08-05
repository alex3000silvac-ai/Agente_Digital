#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar las columnas de la tabla Incidentes
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
    
    # Obtener columnas de la tabla Incidentes
    print("\n📋 Columnas de la tabla Incidentes:")
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Incidentes'
        ORDER BY ORDINAL_POSITION
    """)
    
    columnas = cursor.fetchall()
    for col in columnas:
        print(f"  - {col.COLUMN_NAME}: {col.DATA_TYPE}")
    
    # Buscar columnas que contienen 'Anci'
    print("\n📋 Columnas relacionadas con ANCI en Incidentes:")
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Incidentes'
        AND COLUMN_NAME LIKE '%Anci%'
        ORDER BY COLUMN_NAME
    """)
    
    columnas_anci = cursor.fetchall()
    if columnas_anci:
        for col in columnas_anci:
            print(f"  - {col.COLUMN_NAME}: {col.DATA_TYPE}")
    else:
        print("  No se encontraron columnas con 'Anci' en el nombre")
    
    # Buscar columnas específicas
    print("\n📋 Verificando columnas específicas:")
    columnas_buscar = [
        'DescripcionBreve',
        'DescripcionInicial', 
        'CausaRaiz',
        'LeccionesAprendidas',
        'PlanMejora',
        'ResponsableCliente'
    ]
    
    for col_name in columnas_buscar:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Incidentes'
            AND COLUMN_NAME = ?
        """, (col_name,))
        
        existe = cursor.fetchone()[0] > 0
        print(f"  - {col_name}: {'✅ EXISTE' if existe else '❌ NO EXISTE'}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")