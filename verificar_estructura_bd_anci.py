#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar la estructura de las tablas relacionadas con ANCI
"""

import pyodbc
from datetime import datetime

# Configuración de conexión
server = '192.168.100.125'
database = 'AgenteDigitalDB'
username = 'app_usuario'
password = 'ClaveSegura123!'
driver = 'ODBC Driver 17 for SQL Server'

def verificar_estructura():
    """Verificar estructura de las tablas"""
    try:
        # Conexión a la base de datos
        conn_str = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print("✅ Conexión exitosa a la base de datos")
        
        # 1. Verificar tabla Incidentes
        print("\n📋 Verificando tabla Incidentes...")
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Incidentes'
            AND COLUMN_NAME IN ('IncidenteID', 'EmpresaID', 'Titulo', 'TipoRegistro', 'Criticidad')
            ORDER BY ORDINAL_POSITION
        """)
        
        print("Columnas de Incidentes:")
        for row in cursor.fetchall():
            print(f"  - {row.COLUMN_NAME}: {row.DATA_TYPE} (Nullable: {row.IS_NULLABLE})")
        
        # 2. Verificar tabla Empresas
        print("\n📋 Verificando tabla Empresas...")
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Empresas'
            AND COLUMN_NAME IN ('EmpresaID', 'RazonSocial', 'InquilinoID', 'TipoEmpresa')
            ORDER BY ORDINAL_POSITION
        """)
        
        print("Columnas de Empresas:")
        for row in cursor.fetchall():
            print(f"  - {row.COLUMN_NAME}: {row.DATA_TYPE} (Nullable: {row.IS_NULLABLE})")
        
        # 3. Verificar datos del incidente 5
        print("\n📋 Verificando incidente ID 5...")
        cursor.execute("""
            SELECT 
                i.IncidenteID,
                i.Titulo,
                i.EmpresaID,
                i.TipoRegistro,
                i.Criticidad,
                e.RazonSocial as NombreEmpresa,
                e.TipoEmpresa
            FROM Incidentes i
            INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
            WHERE i.IncidenteID = 5
        """)
        
        incidente = cursor.fetchone()
        if incidente:
            print("Datos del incidente 5:")
            print(f"  - ID: {incidente.IncidenteID}")
            print(f"  - Título: {incidente.Titulo}")
            print(f"  - EmpresaID: {incidente.EmpresaID}")
            print(f"  - TipoRegistro: {incidente.TipoRegistro}")
            print(f"  - Criticidad: {incidente.Criticidad}")
            print(f"  - Empresa: {incidente.NombreEmpresa}")
            print(f"  - TipoEmpresa: {incidente.TipoEmpresa}")
        else:
            print("⚠️ No se encontró el incidente 5")
        
        # 4. Verificar si existe tabla ReportesANCI
        print("\n📋 Verificando tabla ReportesANCI...")
        cursor.execute("""
            SELECT COUNT(*) as existe
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = 'ReportesANCI'
        """)
        
        if cursor.fetchone().existe > 0:
            print("✅ La tabla ReportesANCI existe")
            
            # Verificar estructura
            cursor.execute("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'ReportesANCI'
                ORDER BY ORDINAL_POSITION
            """)
            
            print("Columnas de ReportesANCI:")
            for row in cursor.fetchall():
                print(f"  - {row.COLUMN_NAME}: {row.DATA_TYPE} (Nullable: {row.IS_NULLABLE})")
        else:
            print("⚠️ La tabla ReportesANCI NO existe")
        
        conn.close()
        print("\n✅ Verificación completada")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    verificar_estructura()