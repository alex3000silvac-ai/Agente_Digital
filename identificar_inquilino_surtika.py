#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para identificar el ID del inquilino 'Empresas Surtika SPA'
y mostrar información relacionada antes de la limpieza
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

def main():
    """Identificar el inquilino Surtika y mostrar información"""
    conn = None
    try:
        print("=== IDENTIFICACIÓN DEL INQUILINO SURTIKA ===\n")
        
        conn = get_db_connection()
        if not conn:
            print("❌ Error: No se pudo conectar a la base de datos")
            return
        
        cursor = conn.cursor()
        
        # 1. Buscar el inquilino Surtika
        print("1. Buscando inquilino 'Empresas Surtika SPA'...")
        cursor.execute("""
            SELECT InquilinoID, RazonSocial, RUT, EstadoActivo, FechaCreacion
            FROM Inquilinos
            WHERE RazonSocial LIKE '%Surtika%'
        """)
        
        surtika_data = cursor.fetchone()
        if not surtika_data:
            print("❌ No se encontró el inquilino 'Empresas Surtika SPA'")
            return
        
        surtika_id = surtika_data[0]
        print(f"✅ Inquilino encontrado:")
        print(f"   - ID: {surtika_id}")
        print(f"   - Razón Social: {surtika_data[1]}")
        print(f"   - RUT: {surtika_data[2]}")
        print(f"   - Estado: {'Activo' if surtika_data[3] else 'Inactivo'}")
        print(f"   - Fecha Creación: {surtika_data[4]}")
        
        # 2. Contar empresas del inquilino Surtika
        print(f"\n2. Empresas del inquilino Surtika (ID: {surtika_id})...")
        cursor.execute("""
            SELECT COUNT(*) as Total,
                   SUM(CASE WHEN EstadoActivo = 1 THEN 1 ELSE 0 END) as Activas
            FROM Empresas
            WHERE InquilinoID = ?
        """, (surtika_id,))
        
        empresas_count = cursor.fetchone()
        print(f"   - Total empresas: {empresas_count[0]}")
        print(f"   - Empresas activas: {empresas_count[1]}")
        
        # 3. Listar otros inquilinos que serán eliminados
        print("\n3. Inquilinos que serán ELIMINADOS:")
        cursor.execute("""
            SELECT InquilinoID, RazonSocial, RUT,
                   (SELECT COUNT(*) FROM Empresas WHERE Empresas.InquilinoID = Inquilinos.InquilinoID) as NumEmpresas
            FROM Inquilinos
            WHERE InquilinoID != ?
            ORDER BY RazonSocial
        """, (surtika_id,))
        
        otros_inquilinos = cursor.fetchall()
        if otros_inquilinos:
            print(f"   Se encontraron {len(otros_inquilinos)} inquilinos para eliminar:\n")
            for inq in otros_inquilinos:
                print(f"   - ID: {inq[0]}, Razón Social: {inq[1]}, RUT: {inq[2]}, Empresas: {inq[3]}")
        else:
            print("   No hay otros inquilinos para eliminar.")
        
        # 4. Contar registros relacionados que serán eliminados
        print("\n4. Resumen de datos que serán ELIMINADOS:")
        
        # Incidentes
        cursor.execute("""
            SELECT COUNT(*) 
            FROM Incidentes i
            INNER JOIN Empresas e ON i.EmpresaID = e.EmpresaID
            WHERE e.InquilinoID != ?
        """, (surtika_id,))
        incidentes_count = cursor.fetchone()[0]
        print(f"   - Incidentes: {incidentes_count}")
        
        # Cumplimientos
        cursor.execute("""
            SELECT COUNT(*) 
            FROM CumplimientoEmpresa c
            INNER JOIN Empresas e ON c.EmpresaID = e.EmpresaID
            WHERE e.InquilinoID != ?
        """, (surtika_id,))
        cumplimientos_count = cursor.fetchone()[0]
        print(f"   - Registros de cumplimiento: {cumplimientos_count}")
        
        # Usuarios
        cursor.execute("""
            SELECT COUNT(*) 
            FROM UsuariosCliente
            WHERE InquilinoID != ?
        """, (surtika_id,))
        usuarios_count = cursor.fetchone()[0]
        print(f"   - Usuarios: {usuarios_count}")
        
        # Evidencias
        cursor.execute("""
            SELECT COUNT(*) 
            FROM EvidenciasCumplimiento
            WHERE InquilinoID != ?
        """, (surtika_id,))
        evidencias_count = cursor.fetchone()[0]
        print(f"   - Evidencias de cumplimiento: {evidencias_count}")
        
        # 5. Identificar carpetas de archivos
        print("\n5. Carpetas de archivos que serán eliminadas:")
        uploads_path = os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'uploads')
        if os.path.exists(uploads_path):
            for folder in os.listdir(uploads_path):
                folder_path = os.path.join(uploads_path, folder)
                if os.path.isdir(folder_path) and folder.startswith('inquilino_'):
                    inquilino_id = int(folder.split('_')[1])
                    if inquilino_id != surtika_id:
                        print(f"   - {folder_path}")
        
        print("\n" + "="*50)
        print(f"✅ ID del inquilino a CONSERVAR: {surtika_id} (Empresas Surtika SPA)")
        print("="*50)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()