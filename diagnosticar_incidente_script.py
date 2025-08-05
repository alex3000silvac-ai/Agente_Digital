#!/usr/bin/env python3
"""
Script de Diagnóstico de Incidentes - Versión Standalone
Uso: python diagnosticar_incidente_script.py [indice_unico]
"""

import sys
import os
import json
from datetime import datetime

# Agregar el path del proyecto
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

class DiagnosticoStandalone:
    def __init__(self):
        self.ruta_uploads = os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'uploads')
        self.ruta_temp = os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'app', 'temp_incidentes')
        
    def diagnosticar(self, indice_unico):
        """Ejecuta diagnóstico completo"""
        print(f"🔍 DIAGNÓSTICO PARA INCIDENTE: {indice_unico}")
        print("=" * 80)
        
        conn = None
        try:
            conn = get_db_connection()
            if not conn:
                print("❌ ERROR: No se pudo conectar a la base de datos")
                return
            
            cursor = conn.cursor()
            
            # 1. Verificar en BD
            print("\n📊 VERIFICANDO BASE DE DATOS")
            print("-" * 40)
            
            cursor.execute("""
                SELECT IncidenteID, IDVisible, Titulo, EstadoActual, 
                       EmpresaID, FechaCreacion, FechaModificacion
                FROM Incidentes 
                WHERE IDVisible = ? OR indice_unico = ?
            """, (indice_unico, indice_unico))
            
            resultado = cursor.fetchone()
            
            if resultado:
                print(f"✅ Incidente encontrado en BD")
                print(f"   - ID: {resultado[0]}")
                print(f"   - IDVisible: {resultado[1]}")
                print(f"   - Título: {resultado[2]}")
                print(f"   - Estado: {resultado[3]}")
                print(f"   - Empresa ID: {resultado[4]}")
                print(f"   - Creado: {resultado[5]}")
                print(f"   - Modificado: {resultado[6]}")
                
                incidente_id = resultado[0]
            else:
                print(f"❌ Incidente NO encontrado con índice: {indice_unico}")
                return
            
            # 2. Verificar archivos temporales
            print("\n🌱 VERIFICANDO ARCHIVOS TEMPORALES")
            print("-" * 40)
            
            archivo_temp = os.path.join(self.ruta_temp, f"{indice_unico}.json")
            if os.path.exists(archivo_temp):
                print(f"✅ Archivo temporal existe: {archivo_temp}")
                try:
                    with open(archivo_temp, 'r', encoding='utf-8') as f:
                        datos = json.load(f)
                    print(f"   - Estado: {datos.get('estado_temporal', 'desconocido')}")
                    print(f"   - Timestamp: {datos.get('timestamp_creacion') or datos.get('timestamp_actualizacion')}")
                except Exception as e:
                    print(f"   ⚠️ Error leyendo archivo: {e}")
            else:
                print(f"❌ No existe archivo temporal")
                print(f"   Esperado en: {archivo_temp}")
            
            # 3. Verificar evidencias en BD
            print("\n📎 VERIFICANDO EVIDENCIAS EN BD")
            print("-" * 40)
            
            cursor.execute("""
                SELECT COUNT(*) as total,
                       COUNT(DISTINCT Seccion) as secciones,
                       SUM(CASE WHEN RutaArchivo IS NOT NULL THEN 1 ELSE 0 END) as con_archivo
                FROM EvidenciasIncidentes 
                WHERE IncidenteID = ?
            """, (incidente_id,))
            
            stats = cursor.fetchone()
            print(f"✅ Estadísticas de evidencias:")
            print(f"   - Total evidencias: {stats[0]}")
            print(f"   - Secciones distintas: {stats[1]}")
            print(f"   - Con archivo asociado: {stats[2]}")
            
            # Detalle por sección
            cursor.execute("""
                SELECT Seccion, COUNT(*) as cantidad
                FROM EvidenciasIncidentes 
                WHERE IncidenteID = ?
                GROUP BY Seccion
                ORDER BY Seccion
            """, (incidente_id,))
            
            print("\n   Evidencias por sección:")
            for row in cursor.fetchall():
                print(f"   - {row[0] or 'Sin sección'}: {row[1]} archivos")
            
            # 4. Verificar archivos físicos
            print("\n📁 VERIFICANDO ARCHIVOS FÍSICOS")
            print("-" * 40)
            
            carpeta_evidencias = os.path.join(self.ruta_uploads, "evidencias", indice_unico)
            
            if os.path.exists(carpeta_evidencias):
                print(f"✅ Carpeta de evidencias existe: {carpeta_evidencias}")
                
                total_archivos = 0
                for root, dirs, files in os.walk(carpeta_evidencias):
                    for d in dirs:
                        subdir = os.path.join(root, d)
                        archivos = os.listdir(subdir)
                        if archivos:
                            print(f"   - {d}: {len(archivos)} archivos")
                            total_archivos += len(archivos)
                
                print(f"\n   Total archivos físicos: {total_archivos}")
            else:
                print(f"❌ No existe carpeta de evidencias")
                print(f"   Esperada en: {carpeta_evidencias}")
            
            # 5. Verificar integridad archivo vs BD
            print("\n🔄 VERIFICANDO INTEGRIDAD ARCHIVOS vs BD")
            print("-" * 40)
            
            cursor.execute("""
                SELECT RutaArchivo, NombreArchivo, Seccion
                FROM EvidenciasIncidentes 
                WHERE IncidenteID = ? AND RutaArchivo IS NOT NULL
            """, (incidente_id,))
            
            archivos_ok = 0
            archivos_faltantes = []
            
            for row in cursor.fetchall():
                if row[0] and os.path.exists(row[0]):
                    archivos_ok += 1
                else:
                    archivos_faltantes.append({
                        "ruta": row[0],
                        "nombre": row[1],
                        "seccion": row[2]
                    })
            
            print(f"✅ Archivos verificados: {archivos_ok}")
            if archivos_faltantes:
                print(f"❌ Archivos faltantes: {len(archivos_faltantes)}")
                for af in archivos_faltantes[:5]:  # Mostrar solo los primeros 5
                    print(f"   - {af['nombre']} (Sección {af['seccion']})")
                if len(archivos_faltantes) > 5:
                    print(f"   ... y {len(archivos_faltantes) - 5} más")
            
            # 6. Verificar taxonomías
            print("\n🏷️ VERIFICANDO TAXONOMÍAS")
            print("-" * 40)
            
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INCIDENTE_TAXONOMIA 
                WHERE IncidenteID = ?
            """, (incidente_id,))
            
            num_taxonomias = cursor.fetchone()[0]
            print(f"✅ Taxonomías asignadas: {num_taxonomias}")
            
            # 7. Resumen final
            print("\n📊 RESUMEN DIAGNÓSTICO")
            print("=" * 80)
            
            problemas = []
            
            if not os.path.exists(archivo_temp):
                problemas.append("Falta archivo temporal")
            
            if not os.path.exists(carpeta_evidencias):
                problemas.append("Falta carpeta de evidencias")
            
            if archivos_faltantes:
                problemas.append(f"{len(archivos_faltantes)} archivos faltantes")
            
            if problemas:
                print("⚠️ PROBLEMAS ENCONTRADOS:")
                for p in problemas:
                    print(f"   - {p}")
                print("\n🔧 RECOMENDACIONES:")
                print("   1. Ejecutar reparación de estructura")
                print("   2. Verificar permisos de carpetas")
                print("   3. Restaurar archivos faltantes desde backup")
            else:
                print("✅ El incidente está en buen estado y puede ser editado")
            
        except Exception as e:
            print(f"\n🚨 ERROR GENERAL: {e}")
            import traceback
            traceback.print_exc()
            
        finally:
            if conn:
                conn.close()

def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("Uso: python diagnosticar_incidente_script.py [indice_unico]")
        print("\nEjemplo:")
        print("  python diagnosticar_incidente_script.py 1_12345678_1_1_INCIDENTE_NUEVO")
        sys.exit(1)
    
    indice_unico = sys.argv[1]
    
    diagnostico = DiagnosticoStandalone()
    diagnostico.diagnosticar(indice_unico)

if __name__ == "__main__":
    main()