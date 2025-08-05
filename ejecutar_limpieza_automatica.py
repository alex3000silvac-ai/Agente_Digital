#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para ejecutar la limpieza automáticamente sin confirmación
USAR CON PRECAUCIÓN - No pide confirmación
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

def ejecutar_limpieza_sql():
    """Ejecutar la limpieza de base de datos"""
    print("\n" + "="*60)
    print("EJECUTANDO LIMPIEZA EN BASE DE DATOS")
    print("="*60)
    
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Error: No se pudo conectar a la base de datos")
            return False
        
        cursor = conn.cursor()
        
        # ID del inquilino a conservar
        INQUILINO_SURTIKA_ID = 4
        
        print(f"Conservando solo Inquilino ID: {INQUILINO_SURTIKA_ID} (Empresas Surtika SPA)")
        print("")
        
        # Comenzar transacción
        conn.autocommit = False
        
        try:
            # 1. Eliminar auditoría y logs
            print("1. Eliminando datos de auditoría...")
            
            cursor.execute("""
                DELETE aa FROM AuditoriaAccesos aa
                WHERE aa.UsuarioID IN (
                    SELECT UsuarioClienteID FROM UsuariosCliente WHERE InquilinoID != ?
                )
            """, (INQUILINO_SURTIKA_ID,))
            print(f"   - AuditoriaAccesos: {cursor.rowcount} registros eliminados")
            
            cursor.execute("""
                DELETE FROM SesionesActivas
                WHERE UsuarioID IN (
                    SELECT UsuarioClienteID FROM UsuariosCliente WHERE InquilinoID != ?
                )
            """, (INQUILINO_SURTIKA_ID,))
            print(f"   - SesionesActivas: {cursor.rowcount} registros eliminados")
            
            # 2. Eliminar evidencias de incidentes
            print("\n2. Eliminando evidencias de incidentes...")
            
            # Primero obtener IDs de incidentes a eliminar
            cursor.execute("""
                SELECT i.IncidenteID 
                FROM Incidentes i
                INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
                WHERE e.InquilinoID != ?
            """, (INQUILINO_SURTIKA_ID,))
            incidentes_ids = [row[0] for row in cursor.fetchall()]
            
            if incidentes_ids:
                # Eliminar datos relacionados
                for table in ['EVIDENCIAS_TAXONOMIA', 'COMENTARIOS_TAXONOMIA', 'INCIDENTE_TAXONOMIA',
                             'INCIDENTES_ARCHIVOS', 'INCIDENTES_COMENTARIOS', 'INCIDENTES_SECCIONES_DATOS',
                             'INCIDENTES_AUDITORIA', 'HistorialIncidentes', 'EvidenciasIncidentes',
                             'AnciPlazos', 'AnciNotificaciones', 'AnciAutorizaciones']:
                    cursor.execute(f"DELETE FROM {table} WHERE IncidenteID IN ({','.join(['?']*len(incidentes_ids))})", incidentes_ids)
                    if cursor.rowcount > 0:
                        print(f"   - {table}: {cursor.rowcount} registros eliminados")
                
                # Eliminar ReportesANCI
                cursor.execute("DELETE FROM ReportesANCI WHERE IncidenteID IN ({})".format(','.join(['?']*len(incidentes_ids))), incidentes_ids)
                if cursor.rowcount > 0:
                    print(f"   - ReportesANCI: {cursor.rowcount} registros eliminados")
                
                # Eliminar incidentes
                cursor.execute("DELETE FROM Incidentes WHERE IncidenteID IN ({})".format(','.join(['?']*len(incidentes_ids))), incidentes_ids)
                print(f"\n3. Incidentes eliminados: {cursor.rowcount}")
            
            # 3. Eliminar cumplimiento
            print("\n4. Eliminando datos de cumplimiento...")
            
            cursor.execute("""
                DELETE FROM EvidenciasCumplimiento
                WHERE InquilinoID != ?
            """, (INQUILINO_SURTIKA_ID,))
            print(f"   - EvidenciasCumplimiento: {cursor.rowcount} registros eliminados")
            
            # Obtener IDs de cumplimiento a eliminar
            cursor.execute("""
                SELECT c.CumplimientoID 
                FROM CumplimientoEmpresa c
                INNER JOIN Empresas e ON c.EmpresaID = e.EmpresaID
                WHERE e.InquilinoID != ?
            """, (INQUILINO_SURTIKA_ID,))
            cumplimiento_ids = [row[0] for row in cursor.fetchall()]
            
            if cumplimiento_ids:
                cursor.execute("DELETE FROM HistorialCumplimiento WHERE CumplimientoID IN ({})".format(','.join(['?']*len(cumplimiento_ids))), cumplimiento_ids)
                print(f"   - HistorialCumplimiento: {cursor.rowcount} registros eliminados")
                
                cursor.execute("DELETE FROM CumplimientoEmpresa WHERE CumplimientoID IN ({})".format(','.join(['?']*len(cumplimiento_ids))), cumplimiento_ids)
                print(f"   - CumplimientoEmpresa: {cursor.rowcount} registros eliminados")
            
            # 4. Eliminar usuarios
            print("\n5. Eliminando usuarios...")
            
            cursor.execute("DELETE FROM UsuariosCliente WHERE InquilinoID != ?", (INQUILINO_SURTIKA_ID,))
            print(f"   - UsuariosCliente: {cursor.rowcount} registros eliminados")
            
            cursor.execute("DELETE FROM Usuarios WHERE InquilinoID != ?", (INQUILINO_SURTIKA_ID,))
            print(f"   - Usuarios: {cursor.rowcount} registros eliminados")
            
            # 5. Eliminar empresas
            print("\n6. Eliminando empresas...")
            
            cursor.execute("DELETE FROM Empresas WHERE InquilinoID != ?", (INQUILINO_SURTIKA_ID,))
            print(f"   - Empresas: {cursor.rowcount} registros eliminados")
            
            # 6. Eliminar inquilinos
            print("\n7. Eliminando inquilinos...")
            
            cursor.execute("DELETE FROM InquilinosConfig WHERE InquilinoID != ?", (INQUILINO_SURTIKA_ID,))
            print(f"   - InquilinosConfig: {cursor.rowcount} registros eliminados")
            
            cursor.execute("DELETE FROM Inquilinos WHERE InquilinoID != ?", (INQUILINO_SURTIKA_ID,))
            print(f"   - Inquilinos: {cursor.rowcount} registros eliminados")
            
            # 7. Limpiar datos huérfanos
            print("\n8. Limpiando datos huérfanos...")
            
            cursor.execute("DELETE FROM SolucionesPropuestas WHERE InquilinoID NOT IN (SELECT InquilinoID FROM Inquilinos)")
            if cursor.rowcount > 0:
                print(f"   - SolucionesPropuestas huérfanas: {cursor.rowcount} registros eliminados")
            
            # Confirmar transacción
            conn.commit()
            print("\n✅ LIMPIEZA DE BASE DE DATOS COMPLETADA")
            
            # Verificar resultado
            cursor.execute("SELECT COUNT(*) FROM Inquilinos")
            count = cursor.fetchone()[0]
            print(f"\nInquilinos restantes: {count}")
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            conn.rollback()
            print(f"\n❌ Error: {str(e)}")
            print("⚠️ Transacción revertida")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False
    finally:
        if conn:
            conn.close()

def limpiar_archivos():
    """Limpiar archivos del sistema"""
    print("\n" + "="*60)
    print("LIMPIANDO ARCHIVOS DEL SISTEMA")
    print("="*60)
    
    INQUILINO_SURTIKA_ID = 4
    archivos_eliminados = 0
    carpetas_eliminadas = 0
    
    try:
        uploads_paths = [
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'uploads'),
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'app', 'uploads'),
            os.path.join(os.path.dirname(__file__), 'uploads')
        ]
        
        for uploads_path in uploads_paths:
            if not os.path.exists(uploads_path):
                continue
                
            print(f"\nRevisando: {uploads_path}")
            
            for item in os.listdir(uploads_path):
                item_path = os.path.join(uploads_path, item)
                
                if os.path.isdir(item_path) and item.startswith('inquilino_'):
                    try:
                        inquilino_id = int(item.split('_')[1])
                        if inquilino_id != INQUILINO_SURTIKA_ID:
                            import shutil
                            shutil.rmtree(item_path)
                            carpetas_eliminadas += 1
                            print(f"   ✅ Eliminada carpeta: {item}")
                    except Exception as e:
                        print(f"   ❌ Error al eliminar {item}: {str(e)}")
        
        print(f"\n✅ Carpetas eliminadas: {carpetas_eliminadas}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def verificar_resultado():
    """Verificar el resultado final"""
    print("\n" + "="*60)
    print("VERIFICACIÓN FINAL")
    print("="*60)
    
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            return
        
        cursor = conn.cursor()
        
        # Mostrar inquilinos restantes
        cursor.execute("SELECT InquilinoID, RazonSocial, RUT FROM Inquilinos")
        inquilinos = cursor.fetchall()
        
        print("\nINQUILINOS RESTANTES:")
        for inq in inquilinos:
            print(f"  - ID: {inq[0]}, {inq[1]}, RUT: {inq[2]}")
        
        # Estadísticas
        print("\nESTADÍSTICAS:")
        tables = [
            ('Empresas', 'SELECT COUNT(*) FROM Empresas'),
            ('Incidentes', 'SELECT COUNT(*) FROM Incidentes'),
            ('Usuarios', 'SELECT COUNT(*) FROM UsuariosCliente'),
            ('Cumplimientos', 'SELECT COUNT(*) FROM CumplimientoEmpresa')
        ]
        
        for name, query in tables:
            cursor.execute(query)
            count = cursor.fetchone()[0]
            print(f"  - {name}: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        if conn:
            conn.close()

def main():
    print("\n" + "="*70)
    print("LIMPIEZA AUTOMÁTICA - CONSERVANDO SOLO EMPRESAS SURTIKA SPA")
    print("="*70)
    print(f"Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ejecutar limpieza SQL
    if ejecutar_limpieza_sql():
        # Ejecutar limpieza de archivos
        limpiar_archivos()
    
    # Verificar resultado
    verificar_resultado()
    
    print("\n" + "="*70)
    print("PROCESO COMPLETADO")
    print("="*70)
    print(f"Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()