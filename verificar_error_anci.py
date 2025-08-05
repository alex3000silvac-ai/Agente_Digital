#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar el error al validar incidente para ANCI
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agente_digital_api.app.database import get_db_connection

def main():
    """Verificar estructura de tablas para ANCI"""
    print("=== VERIFICACIÓN DE ESTRUCTURA PARA ANCI ===\n")
    
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            print("❌ Error: No se pudo conectar a la base de datos")
            return
        
        cursor = conn.cursor()
        
        # 1. Verificar tabla Incidentes
        print("1. Verificando tabla Incidentes...")
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Incidentes'
            AND COLUMN_NAME IN ('IncidenteID', 'EmpresaID', 'Titulo', 'FechaDeteccion', 
                               'FechaOcurrencia', 'Criticidad', 'DescripcionInicial',
                               'AnciImpactoPreliminar', 'SistemasAfectados', 'ServiciosInterrumpidos',
                               'OrigenIncidente', 'AnciTipoAmenaza', 'ResponsableCliente',
                               'AccionesInmediatas', 'CausaRaiz', 'TipoFlujo', 'ReporteAnciID',
                               'TipoRegistro')
            ORDER BY COLUMN_NAME
        """)
        
        columnas = cursor.fetchall()
        print(f"   Columnas encontradas: {len(columnas)}")
        for col in columnas:
            print(f"   - {col[0]}: {col[1]} (Nullable: {col[2]})")
        
        # 2. Verificar el incidente específico
        print("\n2. Verificando incidente ID 5...")
        cursor.execute("""
            SELECT TOP 1
                IncidenteID,
                EmpresaID,
                Titulo,
                Criticidad,
                TipoRegistro,
                ReporteAnciID
            FROM Incidentes
            WHERE IncidenteID = 5
        """)
        
        incidente = cursor.fetchone()
        if incidente:
            print("   ✅ Incidente encontrado:")
            print(f"   - ID: {incidente[0]}")
            print(f"   - EmpresaID: {incidente[1]}")
            print(f"   - Título: {incidente[2]}")
            print(f"   - Criticidad: {incidente[3]}")
            print(f"   - TipoRegistro: {incidente[4]}")
            print(f"   - ReporteAnciID: {incidente[5]}")
        else:
            print("   ❌ Incidente no encontrado")
        
        # 3. Verificar tabla INCIDENTE_TAXONOMIA
        print("\n3. Verificando tabla INCIDENTE_TAXONOMIA...")
        cursor.execute("""
            SELECT COUNT(*) as Total
            FROM INCIDENTE_TAXONOMIA
            WHERE IncidenteID = 5
        """)
        
        taxonomias = cursor.fetchone()[0]
        print(f"   Taxonomías asignadas: {taxonomias}")
        
        # 4. Verificar tabla Empresas
        print("\n4. Verificando estructura de tabla Empresas...")
        cursor.execute("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Empresas'
            AND COLUMN_NAME IN ('EmpresaID', 'RazonSocial', 'RUT', 'TipoEmpresa')
        """)
        
        cols_empresa = cursor.fetchall()
        print(f"   Columnas de Empresas encontradas: {[col[0] for col in cols_empresa]}")
        
        # 5. Verificar si existe tabla INFORMES_ANCI
        print("\n5. Verificando tabla INFORMES_ANCI...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'INFORMES_ANCI'
        """)
        
        existe_informes = cursor.fetchone()[0] > 0
        print(f"   Tabla INFORMES_ANCI existe: {'Sí' if existe_informes else 'No'}")
        
        # 6. Proponer query corregida
        print("\n6. Query corregida para validar incidente:")
        print("""
        SELECT 
            i.IncidenteID,
            i.Titulo,
            i.FechaDeteccion,
            i.FechaOcurrencia,
            i.Criticidad,
            i.DescripcionInicial,
            i.AnciImpactoPreliminar,
            i.SistemasAfectados,
            i.ServiciosInterrumpidos,
            i.OrigenIncidente,
            i.AnciTipoAmenaza,
            i.ResponsableCliente,
            i.AccionesInmediatas,
            i.CausaRaiz,
            i.TipoRegistro,
            i.ReporteAnciID
        FROM Incidentes i
        WHERE i.IncidenteID = ?
        """)
        
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