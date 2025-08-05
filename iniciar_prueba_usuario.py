#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de inicialización para prueba completa de usuario
"""

import os
import sys
from datetime import datetime

def verificar_configuracion():
    """Verificar que todo está configurado correctamente"""
    print("🔧 VERIFICACIÓN DE CONFIGURACIÓN PARA PRUEBA DE USUARIO")
    print("=" * 60)
    
    # 1. Verificar .env
    env_path = ".env"
    if os.path.exists(env_path):
        print("✅ Archivo .env encontrado")
        with open(env_path, 'r') as f:
            content = f.read()
            if "192.168.100.125" in content:
                print("✅ IP SQL Server correcta: 192.168.100.125")
            if "TEST_MODE=false" in content:
                print("✅ Modo SQL Server activado")
            if "app_usuario" in content:
                print("✅ Usuario SQL Server configurado")
    else:
        print("❌ Archivo .env no encontrado")
        return False
    
    # 2. Verificar capturador
    if os.path.exists("capturador_incidentes.py"):
        print("✅ Capturador de incidentes disponible")
    else:
        print("❌ Capturador de incidentes no encontrado")
        return False
    
    # 3. Verificar directorio de capturas
    if not os.path.exists("capturas_prueba_usuario"):
        os.makedirs("capturas_prueba_usuario")
        print("✅ Directorio de capturas creado")
    else:
        print("✅ Directorio de capturas disponible")
    
    # 4. Verificar conexión SQL Server
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        import pyodbc
        server = os.getenv('DB_SERVER')
        database = os.getenv('DB_DATABASE')
        username = os.getenv('DB_USERNAME')
        password = os.getenv('DB_PASSWORD')
        
        conn_str = (
            f'DRIVER={{ODBC Driver 17 for SQL Server}};'
            f'SERVER={server};'
            f'DATABASE={database};'
            f'UID={username};'
            f'PWD={password};'
            f'Encrypt=no;'
        )
        
        conn = pyodbc.connect(conn_str, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Incidentes")
        count = cursor.fetchone()[0]
        conn.close()
        
        print(f"✅ SQL Server conectado: {count} incidentes existentes")
        
    except Exception as e:
        print(f"❌ Error conexión SQL Server: {e}")
        return False
    
    # 5. Verificar módulo Flask
    sys.path.append('agente_digital_api')
    try:
        from agente_digital_api.app.database import get_db_connection
        conn = get_db_connection()
        if conn:
            conn.close()
            print("✅ Módulo Flask conecta correctamente")
        else:
            print("❌ Módulo Flask no puede conectar")
            return False
    except Exception as e:
        print(f"❌ Error módulo Flask: {e}")
        return False
    
    return True

def generar_instrucciones():
    """Generar archivo de instrucciones para el usuario"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    archivo = f"INSTRUCCIONES_PRUEBA_USUARIO_{timestamp}.txt"
    
    with open(archivo, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("INSTRUCCIONES PARA PRUEBA COMPLETA DE USUARIO\n")
        f.write("=" * 80 + "\n")
        f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("Proyecto: Agente Digital Flask - Cumplimiento Ley 21.663\n")
        f.write("=" * 80 + "\n\n")
        
        f.write("🎯 OBJETIVO DE LA PRUEBA:\n")
        f.write("=" * 25 + "\n")
        f.write("Verificar que el ciclo completo save-edit-save funciona correctamente\n")
        f.write("y que todos los datos se preservan exactamente como se guardaron.\n\n")
        
        f.write("📋 PASOS A SEGUIR:\n")
        f.write("=" * 18 + "\n")
        f.write("1. Iniciar el servidor Flask:\n")
        f.write("   python3 run.py\n\n")
        
        f.write("2. Abrir el frontend en el navegador:\n")
        f.write("   http://localhost:5000\n\n")
        
        f.write("3. Crear un nuevo incidente CON TODOS los campos:\n")
        f.write("   ✅ Título descriptivo\n")
        f.write("   ✅ Descripción detallada\n")
        f.write("   ✅ Criticidad, tipo de flujo, fechas\n")
        f.write("   ✅ Origen, sistemas afectados, acciones inmediatas\n")
        f.write("   ✅ Responsable cliente\n")
        f.write("   ✅ CAMPOS ANCI: alcance, impacto, servicios, amenaza\n")
        f.write("   ✅ Causa raíz, lecciones aprendidas, plan de mejora\n")
        f.write("   ✅ Seleccionar taxonomías (mínimo 2-3)\n")
        f.write("   ✅ Agregar comentarios a las taxonomías\n")
        f.write("   ✅ Subir archivos de evidencia (mínimo 1-2)\n\n")
        
        f.write("4. GUARDAR el incidente:\n")
        f.write("   🔍 Al guardar se generará automáticamente:\n")
        f.write("   📄 capturas_prueba_usuario/01_CREACION_INCIDENTE_[timestamp].txt\n")
        f.write("   📋 Este archivo contendrá TODOS los datos enviados\n\n")
        
        f.write("5. EDITAR el incidente recién creado:\n")
        f.write("   🔍 Al abrir para edición se generará automáticamente:\n")
        f.write("   📄 capturas_prueba_usuario/02_EDICION_INCIDENTE_[id]_[timestamp].txt\n")
        f.write("   📋 Este archivo contendrá TODOS los datos recuperados\n\n")
        
        f.write("📊 ARCHIVOS GENERADOS AUTOMÁTICAMENTE:\n")
        f.write("=" * 40 + "\n")
        f.write("📄 01_CREACION_INCIDENTE_*.txt\n")
        f.write("   - Todos los datos enviados durante la creación\n")
        f.write("   - Campos básicos, ANCI, taxonomías, archivos\n")
        f.write("   - JSON completo de la solicitud\n\n")
        
        f.write("📄 02_EDICION_INCIDENTE_*.txt\n")
        f.write("   - Todos los datos recuperados durante la edición\n")
        f.write("   - Campos preservados, taxonomías, archivos, comentarios\n")
        f.write("   - JSON completo de la respuesta\n\n")
        
        f.write("🔍 VERIFICACIÓN MANUAL:\n")
        f.write("=" * 22 + "\n")
        f.write("1. Comparar ambos archivos TXT\n")
        f.write("2. Verificar que TODOS los campos enviados aparecen en edición\n")
        f.write("3. Verificar que las taxonomías se preservan\n")
        f.write("4. Verificar que los archivos están disponibles\n")
        f.write("5. Verificar que los comentarios se mantienen\n")
        f.write("6. Verificar que los campos ANCI están completos\n\n")
        
        f.write("✅ CRITERIOS DE ÉXITO:\n")
        f.write("=" * 22 + "\n")
        f.write("🎯 Todos los datos enviados durante creación aparecen en edición\n")
        f.write("🎯 Las taxonomías se recuperan con sus comentarios\n")
        f.write("🎯 Los archivos están disponibles para descarga\n")
        f.write("🎯 Los campos ANCI se preservan completamente\n")
        f.write("🎯 No se pierden datos en el ciclo save-edit-save\n\n")
        
        f.write("🚨 IMPORTANTE:\n")
        f.write("=" * 12 + "\n")
        f.write("- Los archivos TXT se generan AUTOMÁTICAMENTE\n")
        f.write("- NO necesitas hacer nada especial, solo usar la aplicación\n")
        f.write("- Cada acción (crear/editar) genera su archivo correspondiente\n")
        f.write("- Los archivos están en el directorio: capturas_prueba_usuario/\n\n")
        
        f.write("=" * 80 + "\n")
        f.write("🎉 SISTEMA LISTO PARA PRUEBA COMPLETA DE USUARIO\n")
        f.write("=" * 80 + "\n")
    
    print(f"✅ Instrucciones generadas: {archivo}")
    return archivo

def main():
    """Función principal"""
    print("🚀 INICIALIZACIÓN DE PRUEBA COMPLETA DE USUARIO")
    print("=" * 55)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 55)
    
    # Verificar configuración
    if verificar_configuracion():
        print("\n🎉 CONFIGURACIÓN COMPLETA - SISTEMA LISTO")
        print("=" * 45)
        
        # Generar instrucciones
        archivo_instrucciones = generar_instrucciones()
        
        print(f"\n📋 PRÓXIMOS PASOS:")
        print("=" * 18)
        print("1. python3 run.py")
        print("2. Abrir http://localhost:5000")
        print("3. Crear incidente con todos los campos")
        print("4. Verificar archivos TXT generados automáticamente")
        print(f"5. Leer instrucciones detalladas: {archivo_instrucciones}")
        
        print(f"\n✅ CAPTURAS AUTOMÁTICAS CONFIGURADAS")
        print("✅ Sistema listo para prueba de usuario")
        print("=" * 55)
        
        return True
    else:
        print("\n❌ CONFIGURACIÓN INCOMPLETA")
        print("📋 Revisar errores arriba y corregir")
        print("=" * 55)
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)