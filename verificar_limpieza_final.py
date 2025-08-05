#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar el resultado final de la limpieza
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

def main():
    """Verificar el estado final después de la limpieza"""
    print("\n" + "="*70)
    print("VERIFICACIÓN FINAL DE LA LIMPIEZA")
    print("="*70)
    
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Error: No se pudo conectar a la base de datos")
            return
        
        cursor = conn.cursor()
        
        # 1. Verificar inquilinos
        print("\n1. INQUILINOS EN EL SISTEMA:")
        print("-" * 50)
        cursor.execute("""
            SELECT InquilinoID, RazonSocial, RUT, EstadoActivo, FechaCreacion
            FROM Inquilinos
            ORDER BY InquilinoID
        """)
        
        inquilinos = cursor.fetchall()
        if inquilinos:
            for inq in inquilinos:
                estado = "Activo" if inq[3] else "Inactivo"
                print(f"ID: {inq[0]}")
                print(f"Razón Social: {inq[1]}")
                print(f"RUT: {inq[2]}")
                print(f"Estado: {estado}")
                print(f"Fecha Creación: {inq[4]}")
                print()
        else:
            print("❌ No se encontraron inquilinos")
        
        # 2. Verificar empresas
        print("\n2. EMPRESAS EN EL SISTEMA:")
        print("-" * 50)
        cursor.execute("""
            SELECT e.EmpresaID, e.RazonSocial, e.RUT, e.TipoEmpresa,
                   i.RazonSocial as Inquilino
            FROM Empresas e
            INNER JOIN Inquilinos i ON e.InquilinoID = i.InquilinoID
            ORDER BY e.EmpresaID
        """)
        
        empresas = cursor.fetchall()
        if empresas:
            for emp in empresas:
                print(f"ID: {emp[0]}")
                print(f"Empresa: {emp[1]}")
                print(f"RUT: {emp[2]}")
                print(f"Tipo: {emp[3] if emp[3] else 'No especificado'}")
                print(f"Inquilino: {emp[4]}")
                print()
        else:
            print("No hay empresas registradas")
        
        # 3. Estadísticas generales
        print("\n3. ESTADÍSTICAS GENERALES:")
        print("-" * 50)
        
        tables = [
            ('Inquilinos', 'SELECT COUNT(*) FROM Inquilinos'),
            ('Empresas', 'SELECT COUNT(*) FROM Empresas'),
            ('Usuarios (tabla general)', 'SELECT COUNT(*) FROM Usuarios'),
            ('UsuariosCliente', 'SELECT COUNT(*) FROM UsuariosCliente'),
            ('Incidentes', 'SELECT COUNT(*) FROM Incidentes'),
            ('CumplimientoEmpresa', 'SELECT COUNT(*) FROM CumplimientoEmpresa'),
            ('EvidenciasCumplimiento', 'SELECT COUNT(*) FROM EvidenciasCumplimiento'),
            ('INCIDENTE_TAXONOMIA', 'SELECT COUNT(*) FROM INCIDENTE_TAXONOMIA'),
            ('EVIDENCIAS_TAXONOMIA', 'SELECT COUNT(*) FROM EVIDENCIAS_TAXONOMIA'),
            ('ReportesANCI', 'SELECT COUNT(*) FROM ReportesANCI'),
            ('AuditoriaAccesos', 'SELECT COUNT(*) FROM AuditoriaAccesos'),
            ('SesionesActivas', 'SELECT COUNT(*) FROM SesionesActivas')
        ]
        
        for table_name, query in tables:
            try:
                cursor.execute(query)
                count = cursor.fetchone()[0]
                print(f"{table_name}: {count} registros")
            except:
                print(f"{table_name}: Error al consultar")
        
        # 4. Verificar archivos
        print("\n4. VERIFICACIÓN DE ARCHIVOS:")
        print("-" * 50)
        
        uploads_paths = [
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'uploads'),
            os.path.join(os.path.dirname(__file__), 'agente_digital_api', 'app', 'uploads'),
            os.path.join(os.path.dirname(__file__), 'uploads')
        ]
        
        for uploads_path in uploads_paths:
            if os.path.exists(uploads_path):
                print(f"\nDirectorio: {uploads_path}")
                carpetas = [d for d in os.listdir(uploads_path) 
                          if os.path.isdir(os.path.join(uploads_path, d))]
                archivos = [f for f in os.listdir(uploads_path) 
                          if os.path.isfile(os.path.join(uploads_path, f))]
                
                print(f"  Carpetas: {len(carpetas)}")
                for carpeta in carpetas:
                    print(f"    - {carpeta}")
                
                if archivos:
                    print(f"  Archivos sueltos: {len(archivos)}")
                    for archivo in archivos[:5]:  # Mostrar solo los primeros 5
                        print(f"    - {archivo}")
                    if len(archivos) > 5:
                        print(f"    ... y {len(archivos) - 5} más")
        
        # 5. Verificar integridad referencial
        print("\n5. VERIFICACIÓN DE INTEGRIDAD:")
        print("-" * 50)
        
        # Verificar si hay empresas sin inquilino válido
        cursor.execute("""
            SELECT COUNT(*) 
            FROM Empresas e
            LEFT JOIN Inquilinos i ON e.InquilinoID = i.InquilinoID
            WHERE i.InquilinoID IS NULL
        """)
        huerfanas = cursor.fetchone()[0]
        if huerfanas > 0:
            print(f"⚠️ Empresas huérfanas (sin inquilino): {huerfanas}")
        else:
            print("✅ No hay empresas huérfanas")
        
        # Verificar usuarios sin inquilino válido
        cursor.execute("""
            SELECT COUNT(*) 
            FROM UsuariosCliente u
            LEFT JOIN Inquilinos i ON u.InquilinoID = i.InquilinoID
            WHERE i.InquilinoID IS NULL
        """)
        usuarios_huerfanos = cursor.fetchone()[0]
        if usuarios_huerfanos > 0:
            print(f"⚠️ Usuarios huérfanos (sin inquilino): {usuarios_huerfanos}")
        else:
            print("✅ No hay usuarios huérfanos")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*70)
        print("✅ VERIFICACIÓN COMPLETADA")
        print("="*70)
        
    except Exception as e:
        print(f"❌ Error en verificación: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            try:
                conn.close()
            except:
                pass

if __name__ == "__main__":
    main()