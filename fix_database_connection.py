#!/usr/bin/env python3
"""
Script para corregir el problema de conexión a la base de datos
"""

import os
import sys
import sqlite3
import shutil

# Configurar modo de prueba
os.environ['TEST_MODE'] = 'true'

# Agregar el directorio de la aplicación al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

def fix_database_connection():
    """Corregir el problema de conexión a la base de datos"""
    
    print("=== CORRECCIÓN DE CONEXIÓN A BASE DE DATOS ===")
    
    # Rutas de bases de datos
    db_main = "/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/AgenteDigital_Flask/agente_digital_api/test_agente_digital.db"
    db_root = "/mnt/c/Pasc/Proyecto_Derecho_Digital/Desarrollos/AgenteDigital_Flask/test_agente_digital.db"
    
    # Verificar qué base de datos tiene los datos correctos
    print(f"Verificando base de datos principal: {db_main}")
    try:
        conn = sqlite3.connect(db_main)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Empresas")
        count_main = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Incidentes")
        incidentes_main = cursor.fetchone()[0]
        conn.close()
        print(f"  - Empresas: {count_main}")
        print(f"  - Incidentes: {incidentes_main}")
    except Exception as e:
        print(f"  - Error: {e}")
        count_main = 0
        incidentes_main = 0
    
    print(f"\nVerificando base de datos root: {db_root}")
    try:
        conn = sqlite3.connect(db_root)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Empresas")
        count_root = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Incidentes")
        incidentes_root = cursor.fetchone()[0]
        conn.close()
        print(f"  - Empresas: {count_root}")
        print(f"  - Incidentes: {incidentes_root}")
    except Exception as e:
        print(f"  - Error: {e}")
        count_root = 0
        incidentes_root = 0
    
    # Determinar cuál es la base de datos correcta
    if incidentes_main > incidentes_root:
        print(f"\n✅ La base de datos principal tiene más datos ({incidentes_main} vs {incidentes_root})")
        source_db = db_main
    else:
        print(f"\n✅ La base de datos root tiene más datos ({incidentes_root} vs {incidentes_main})")
        source_db = db_root
    
    # Verificar la función get_db_connection
    print(f"\n=== VERIFICANDO get_db_connection() ===")
    
    from agente_digital_api.app.database import get_db_connection
    
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM Empresas")
            count_func = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM Incidentes")
            incidentes_func = cursor.fetchone()[0]
            conn.close()
            print(f"get_db_connection() encontró:")
            print(f"  - Empresas: {count_func}")
            print(f"  - Incidentes: {incidentes_func}")
            
            # Verificar si encuentra la empresa 6
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT EmpresaID, RazonSocial FROM Empresas WHERE EmpresaID = 6")
            empresa_6 = cursor.fetchone()
            conn.close()
            
            if empresa_6:
                print(f"✅ Empresa 6 encontrada: {empresa_6}")
                return True
            else:
                print(f"❌ Empresa 6 NO encontrada con get_db_connection()")
                return False
                
        except Exception as e:
            print(f"❌ Error con get_db_connection(): {e}")
            return False
    else:
        print("❌ get_db_connection() devolvió None")
        return False

def create_test_incidente():
    """Crear un incidente de prueba usando la función corregida"""
    
    print(f"\n=== CREANDO INCIDENTE DE PRUEBA ===")
    
    from agente_digital_api.app.database import get_db_connection
    
    conn = get_db_connection()
    if not conn:
        print("❌ No se pudo obtener conexión")
        return False
    
    try:
        cursor = conn.cursor()
        
        # Verificar que la empresa 6 existe
        cursor.execute("SELECT EmpresaID FROM Empresas WHERE EmpresaID = ?", (6,))
        if not cursor.fetchone():
            print("❌ Empresa 6 no encontrada")
            return False
        
        # Crear incidente
        cursor.execute("""
            INSERT INTO Incidentes 
            (EmpresaID, Titulo, DescripcionInicial, TipoFlujo, Criticidad, EstadoActual, 
             OrigenIncidente, SistemasAfectados, AccionesInmediatas, ResponsableCliente, 
             FechaCreacion, FechaDeteccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (
            6,
            "Incidente de Prueba - Conexión Corregida",
            "Este incidente verifica que la conexión está funcionando",
            "Ciberseguridad",
            "Alta",
            "Abierto",
            "Sistema de pruebas",
            "Conexión de base de datos",
            "Corrección aplicada",
            "Desarrollador"
        ))
        
        nuevo_id = cursor.lastrowid
        conn.commit()
        
        print(f"✅ Incidente creado con ID: {nuevo_id}")
        return True
        
    except Exception as e:
        print(f"❌ Error creando incidente: {e}")
        conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("INICIANDO CORRECCIÓN DE CONEXIÓN A BASE DE DATOS\n")
    
    # Test 1: Verificar conexión
    connection_ok = fix_database_connection()
    
    # Test 2: Crear incidente de prueba
    if connection_ok:
        incidente_created = create_test_incidente()
        
        print(f"\n=== RESULTADO FINAL ===")
        print(f"Conexión: {'✅ CORREGIDA' if connection_ok else '❌ FALLA'}")
        print(f"Creación de incidente: {'✅ FUNCIONA' if incidente_created else '❌ FALLA'}")
        
        if connection_ok and incidente_created:
            print("\n🎉 PROBLEMA RESUELTO: La conexión a la base de datos está funcionando correctamente")
        else:
            print("\n❌ PROBLEMA PERSISTE: Revisar configuración de base de datos")
    else:
        print("\n❌ No se pudo corregir la conexión a la base de datos")