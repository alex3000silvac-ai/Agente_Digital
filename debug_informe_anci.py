#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para debuggear el generador de informes ANCI
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

from app.modules.informes_anci_completo import GeneradorInformeANCICompleto
import traceback

def test_generador():
    """Prueba directa del generador"""
    print("=== TEST DIRECTO DEL GENERADOR DE INFORMES ANCI ===\n")
    
    generador = GeneradorInformeANCICompleto()
    
    try:
        # Primero verificar si hay reportes ANCI
        print("1. Verificando reportes ANCI existentes...")
        from app.database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT TOP 5 ReporteAnciID, IncidenteID, FechaGeneracion FROM ReportesANCI ORDER BY ReporteAnciID DESC")
        reportes = cursor.fetchall()
        
        if reportes:
            print(f"   ✅ Se encontraron {len(reportes)} reportes ANCI:")
            for r in reportes:
                print(f"      - ReporteAnciID: {r[0]}, IncidenteID: {r[1]}, Fecha: {r[2]}")
            
            # Usar el primer reporte encontrado
            reporte_id = reportes[0][0]
            print(f"\n2. Intentando generar informe para ReporteAnciID: {reporte_id}")
            
            filepath = generador.generar_informe_docx(reporte_id)
            print(f"   ✅ Informe generado exitosamente: {filepath}")
            
        else:
            print("   ❌ No se encontraron reportes ANCI en la base de datos")
            print("\n   Creando un reporte ANCI de prueba...")
            
            # Verificar si existe el incidente 5
            cursor.execute("SELECT IncidenteID, Titulo FROM Incidentes WHERE IncidenteID = 5")
            incidente = cursor.fetchone()
            
            if incidente:
                print(f"   ✅ Incidente encontrado: ID={incidente[0]}, Título={incidente[1]}")
                
                # Crear un reporte ANCI
                cursor.execute("""
                    INSERT INTO ReportesANCI (
                        IncidenteID,
                        FechaGeneracion,
                        EstadoReporte,
                        GeneradoPor
                    ) VALUES (?, GETDATE(), 'BORRADOR', 'TEST')
                """, (5,))
                
                conn.commit()
                
                # Obtener el ID del reporte creado
                cursor.execute("SELECT @@IDENTITY")
                reporte_id = cursor.fetchone()[0]
                print(f"   ✅ Reporte ANCI creado con ID: {reporte_id}")
                
                # Generar el informe
                print(f"\n3. Generando informe para ReporteAnciID: {reporte_id}")
                filepath = generador.generar_informe_docx(reporte_id)
                print(f"   ✅ Informe generado exitosamente: {filepath}")
                
            else:
                print("   ❌ No se encontró el incidente 5")
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nTraceback completo:")
        traceback.print_exc()

if __name__ == "__main__":
    test_generador()