#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script principal para ejecutar la limpieza completa del sistema
Conserva solo el inquilino 'Empresas Surtika SPA' (ID: 4)
"""

import sys
import os
import subprocess
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

def ejecutar_script_sql():
    """Ejecutar el script SQL de limpieza"""
    print("\n" + "="*60)
    print("PASO 1: EJECUTANDO LIMPIEZA EN BASE DE DATOS")
    print("="*60)
    
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Error: No se pudo conectar a la base de datos")
            return False
        
        # Leer el script SQL
        sql_file = os.path.join(os.path.dirname(__file__), 'limpiar_inquilinos_excepto_surtika.sql')
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Ejecutar el script
        cursor = conn.cursor()
        
        # Dividir el script en comandos individuales (por GO o punto y coma)
        # Para este caso, ejecutaremos el script completo como una transacción
        cursor.execute(sql_script)
        
        print("✅ Script SQL ejecutado exitosamente")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error ejecutando script SQL: {str(e)}")
        if conn:
            conn.close()
        return False

def ejecutar_limpieza_archivos():
    """Ejecutar el script de limpieza de archivos"""
    print("\n" + "="*60)
    print("PASO 2: EJECUTANDO LIMPIEZA DE ARCHIVOS")
    print("="*60)
    
    try:
        # Ejecutar el script de Python directamente
        script_path = os.path.join(os.path.dirname(__file__), 'limpiar_archivos_inquilinos.py')
        
        # Importar y ejecutar la función main directamente
        import limpiar_archivos_inquilinos
        limpiar_archivos_inquilinos.main()
        
        print("✅ Limpieza de archivos completada")
        return True
        
    except Exception as e:
        print(f"❌ Error ejecutando limpieza de archivos: {str(e)}")
        return False

def verificar_resultado_final():
    """Verificar el estado final después de la limpieza"""
    print("\n" + "="*60)
    print("PASO 3: VERIFICACIÓN FINAL")
    print("="*60)
    
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Error: No se pudo conectar a la base de datos")
            return
        
        cursor = conn.cursor()
        
        # Verificar inquilinos restantes
        cursor.execute("SELECT InquilinoID, RazonSocial, RUT FROM Inquilinos ORDER BY InquilinoID")
        inquilinos = cursor.fetchall()
        
        print("\n1. INQUILINOS RESTANTES:")
        print("-" * 40)
        for inq in inquilinos:
            print(f"   ID: {inq[0]}, Razón Social: {inq[1]}, RUT: {inq[2]}")
        
        # Verificar empresas
        cursor.execute("""
            SELECT e.EmpresaID, e.RazonSocial, i.RazonSocial as Inquilino
            FROM Empresas e
            INNER JOIN Inquilinos i ON e.InquilinoID = i.InquilinoID
            ORDER BY e.EmpresaID
        """)
        empresas = cursor.fetchall()
        
        print("\n2. EMPRESAS RESTANTES:")
        print("-" * 40)
        for emp in empresas:
            print(f"   ID: {emp[0]}, Empresa: {emp[1]}, Inquilino: {emp[2]}")
        
        # Estadísticas generales
        print("\n3. ESTADÍSTICAS FINALES:")
        print("-" * 40)
        
        tables = [
            ('Inquilinos', 'SELECT COUNT(*) FROM Inquilinos'),
            ('Empresas', 'SELECT COUNT(*) FROM Empresas'),
            ('Incidentes', 'SELECT COUNT(*) FROM Incidentes'),
            ('UsuariosCliente', 'SELECT COUNT(*) FROM UsuariosCliente'),
            ('CumplimientoEmpresa', 'SELECT COUNT(*) FROM CumplimientoEmpresa'),
            ('EvidenciasCumplimiento', 'SELECT COUNT(*) FROM EvidenciasCumplimiento')
        ]
        
        for table_name, query in tables:
            cursor.execute(query)
            count = cursor.fetchone()[0]
            print(f"   {table_name}: {count} registros")
        
        # Verificar archivos
        print("\n4. VERIFICACIÓN DE ARCHIVOS:")
        print("-" * 40)
        
        uploads_path = os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'uploads')
        if os.path.exists(uploads_path):
            carpetas = [d for d in os.listdir(uploads_path) if os.path.isdir(os.path.join(uploads_path, d))]
            print(f"   Carpetas en uploads: {len(carpetas)}")
            for carpeta in carpetas:
                print(f"     - {carpeta}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ LIMPIEZA COMPLETADA EXITOSAMENTE")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error en verificación: {str(e)}")
        if conn:
            conn.close()

def main():
    """Función principal"""
    print("\n" + "="*70)
    print("SISTEMA DE LIMPIEZA COMPLETA - AGENTE DIGITAL")
    print("="*70)
    print(f"Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nEste proceso eliminará todos los inquilinos excepto:")
    print("  → Empresas Surtika SPA (ID: 4)")
    print("\nSe eliminarán:")
    print("  - Todos los demás inquilinos y sus empresas")
    print("  - Todos los incidentes, cumplimientos y evidencias asociadas")
    print("  - Todos los usuarios de otros inquilinos")
    print("  - Todos los archivos del sistema de archivos")
    print("\n⚠️  ADVERTENCIA: Esta acción es IRREVERSIBLE")
    print("Asegúrese de tener un BACKUP completo antes de continuar.")
    
    respuesta = input("\n¿Está seguro de que desea continuar? (escriba 'SI' para confirmar): ")
    
    if respuesta != 'SI':
        print("\n❌ Operación cancelada por el usuario.")
        return
    
    print("\nIniciando proceso de limpieza...\n")
    
    # Paso 1: Limpieza de base de datos
    if not ejecutar_script_sql():
        print("\n❌ Error en la limpieza de base de datos. Proceso detenido.")
        return
    
    # Paso 2: Limpieza de archivos
    if not ejecutar_limpieza_archivos():
        print("\n⚠️  Advertencia: La limpieza de archivos tuvo errores.")
        print("La base de datos fue limpiada pero algunos archivos pueden permanecer.")
    
    # Paso 3: Verificación final
    verificar_resultado_final()

if __name__ == "__main__":
    main()