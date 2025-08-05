#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyodbc

server = '192.168.100.125'
database = 'AgenteDigitalDB'
username = 'app_usuario'
password = 'ClaveSegura123!'
driver = 'ODBC Driver 17 for SQL Server'

try:
    conn_str = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print('Columnas de la tabla Inquilinos:')
    cursor.execute("""
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Inquilinos'
        ORDER BY ORDINAL_POSITION
    """)
    for col in cursor.fetchall():
        print(f'  - {col[0]}')

    print('\nColumnas de la tabla Empresas:')
    cursor.execute("""
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Empresas'
        ORDER BY ORDINAL_POSITION
    """)
    for col in cursor.fetchall():
        print(f'  - {col[0]}')

    conn.close()
    
except Exception as e:
    print(f"Error: {e}")