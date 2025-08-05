#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para eliminar archivos del sistema de archivos de inquilinos
que no sean 'Empresas Surtika SPA' (ID: 4)
"""

import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

def main():
    """Limpiar archivos de inquilinos que no sean Surtika"""
    
    INQUILINO_SURTIKA_ID = 4
    archivos_eliminados = 0
    carpetas_eliminadas = 0
    espacio_liberado_mb = 0
    
    print("=== LIMPIEZA DE ARCHIVOS DEL SISTEMA ===")
    print(f"Conservando solo archivos del Inquilino ID: {INQUILINO_SURTIKA_ID} (Empresas Surtika SPA)")
    print("")
    
    try:
        # Rutas de uploads
        uploads_paths = [
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'uploads'),
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'app', 'uploads'),
            os.path.join(os.path.dirname(__file__), 'uploads')
        ]
        
        for uploads_path in uploads_paths:
            if not os.path.exists(uploads_path):
                continue
                
            print(f"\nRevisando directorio: {uploads_path}")
            
            # 1. Eliminar carpetas de inquilinos
            for item in os.listdir(uploads_path):
                item_path = os.path.join(uploads_path, item)
                
                # Carpetas inquilino_X
                if os.path.isdir(item_path) and item.startswith('inquilino_'):
                    try:
                        inquilino_id = int(item.split('_')[1])
                        if inquilino_id != INQUILINO_SURTIKA_ID:
                            # Calcular tamaño antes de eliminar
                            size_mb = get_directory_size(item_path) / (1024 * 1024)
                            espacio_liberado_mb += size_mb
                            
                            print(f"\n   Eliminando carpeta: {item_path}")
                            print(f"   Tamaño: {size_mb:.2f} MB")
                            
                            # Contar archivos
                            file_count = count_files_in_directory(item_path)
                            archivos_eliminados += file_count
                            
                            # Eliminar carpeta completa
                            shutil.rmtree(item_path)
                            carpetas_eliminadas += 1
                            print(f"   ✅ Eliminada ({file_count} archivos)")
                    except Exception as e:
                        print(f"   ❌ Error al eliminar {item_path}: {str(e)}")
                
                # Archivos sueltos con patrones específicos
                elif os.path.isfile(item_path):
                    should_delete = False
                    
                    # Archivos que empiezan con inc_ pero no son del inquilino 4
                    if item.startswith('inc_') and '_inquilino_' in item:
                        if f'_inquilino_{INQUILINO_SURTIKA_ID}_' not in item:
                            should_delete = True
                    
                    # Archivos con UUID que no pertenecen a Surtika
                    # (requeriría verificación en BD, por ahora los conservamos)
                    
                    if should_delete:
                        try:
                            size_mb = os.path.getsize(item_path) / (1024 * 1024)
                            espacio_liberado_mb += size_mb
                            
                            print(f"\n   Eliminando archivo: {item}")
                            print(f"   Tamaño: {size_mb:.2f} MB")
                            
                            os.remove(item_path)
                            archivos_eliminados += 1
                            print(f"   ✅ Eliminado")
                        except Exception as e:
                            print(f"   ❌ Error al eliminar {item}: {str(e)}")
        
        # 2. Limpiar carpetas temporales
        print("\n\nLimpiando carpetas temporales...")
        temp_paths = [
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'app', 'temp_incidentes'),
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'temp_incidentes')
        ]
        
        for temp_path in temp_paths:
            if os.path.exists(temp_path):
                print(f"\nRevisando: {temp_path}")
                for item in os.listdir(temp_path):
                    item_path = os.path.join(temp_path, item)
                    # Eliminar archivos JSON temporales que no sean del inquilino 4
                    if item.endswith('.json') and f'_{INQUILINO_SURTIKA_ID}_' not in item:
                        try:
                            size_mb = os.path.getsize(item_path) / (1024 * 1024)
                            espacio_liberado_mb += size_mb
                            
                            os.remove(item_path)
                            archivos_eliminados += 1
                            print(f"   ✅ Eliminado: {item}")
                        except Exception as e:
                            print(f"   ❌ Error al eliminar {item}: {str(e)}")
        
        # 3. Verificar archivos huérfanos en BD
        print("\n\nVerificando archivos huérfanos en base de datos...")
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            
            # Verificar evidencias de cumplimiento
            cursor.execute("""
                SELECT COUNT(*) as Total,
                       SUM(CAST(TamanoArchivoKB as BIGINT)) / 1024.0 as TotalMB
                FROM EvidenciasCumplimiento
                WHERE InquilinoID != ?
            """, (INQUILINO_SURTIKA_ID,))
            
            result = cursor.fetchone()
            if result and result[0] > 0:
                print(f"\n   ⚠️ Evidencias de cumplimiento huérfanas en BD: {result[0]} registros")
                print(f"   Tamaño estimado: {result[1]:.2f} MB")
            
            cursor.close()
            conn.close()
        
        # Resumen final
        print("\n" + "="*50)
        print("RESUMEN DE LIMPIEZA DE ARCHIVOS")
        print("="*50)
        print(f"✅ Carpetas eliminadas: {carpetas_eliminadas}")
        print(f"✅ Archivos eliminados: {archivos_eliminados}")
        print(f"✅ Espacio liberado: {espacio_liberado_mb:.2f} MB")
        print(f"\n📁 Se conservaron solo los archivos del Inquilino ID: {INQUILINO_SURTIKA_ID}")
        print("   (Empresas Surtika SPA)")
        
    except Exception as e:
        print(f"\n❌ Error general: {str(e)}")
        import traceback
        traceback.print_exc()

def get_directory_size(path):
    """Calcular el tamaño total de un directorio en bytes"""
    total = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                if os.path.exists(fp):
                    total += os.path.getsize(fp)
    except:
        pass
    return total

def count_files_in_directory(path):
    """Contar el número total de archivos en un directorio"""
    count = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            count += len(filenames)
    except:
        pass
    return count

if __name__ == "__main__":
    print("\n⚠️  ADVERTENCIA: Este script eliminará archivos permanentemente.")
    print("Asegúrese de tener un backup antes de continuar.")
    
    respuesta = input("\n¿Desea continuar? (s/N): ")
    if respuesta.lower() == 's':
        main()
    else:
        print("\nOperación cancelada.")