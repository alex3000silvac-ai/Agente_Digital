#!/usr/bin/env python3
"""
Script de prueba para verificar el sistema dinámico de incidentes
"""

import pyodbc
import json
from datetime import datetime
import sys

# Configuración de conexión
CONNECTION_STRING = """
DRIVER={ODBC Driver 17 for SQL Server};
SERVER=tu_servidor;
DATABASE=tu_base_datos;
UID=tu_usuario;
PWD=tu_contraseña;
"""

def conectar_db():
    """Establece conexión con la base de datos"""
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        print("✅ Conexión exitosa a la base de datos")
        return conn
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        sys.exit(1)

def verificar_secciones():
    """Verifica las secciones creadas en el sistema"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("\n📋 VERIFICANDO SECCIONES DEL SISTEMA DINÁMICO")
    print("=" * 60)
    
    # Contar secciones por tipo
    cursor.execute("""
        SELECT 
            TipoSeccion,
            COUNT(*) as Total
        FROM ANCI_SECCIONES_CONFIG
        WHERE Activo = 1
        GROUP BY TipoSeccion
    """)
    
    print("\n📊 Resumen de secciones:")
    for row in cursor.fetchall():
        print(f"   - {row.TipoSeccion}: {row.Total} secciones")
    
    # Verificar sección CSIRT
    cursor.execute("""
        SELECT 
            SeccionID,
            CodigoSeccion,
            Titulo,
            NumeroOrden
        FROM ANCI_SECCIONES_CONFIG
        WHERE CodigoSeccion = 'SEC_CSIRT'
    """)
    
    csirt = cursor.fetchone()
    if csirt:
        print(f"\n✅ Sección CSIRT encontrada:")
        print(f"   - ID: {csirt.SeccionID}")
        print(f"   - Código: {csirt.CodigoSeccion}")
        print(f"   - Título: {csirt.Titulo}")
        print(f"   - Orden: {csirt.NumeroOrden}")
    else:
        print("\n❌ Sección CSIRT NO encontrada")
    
    # Mostrar campos de la sección 1
    cursor.execute("""
        SELECT CamposJSON
        FROM ANCI_SECCIONES_CONFIG
        WHERE CodigoSeccion = 'SEC_1'
    """)
    
    sec1 = cursor.fetchone()
    if sec1:
        print("\n📝 Campos de la Sección 1 (Información General):")
        try:
            campos = json.loads(sec1.CamposJSON)
            for campo in campos.get('campos', []):
                print(f"   - {campo['nombre']}: {campo['etiqueta']}")
        except:
            print("   Error parseando campos JSON")
    
    cursor.close()
    conn.close()

def verificar_secciones_empresa(empresa_id):
    """Verifica qué secciones aplican a una empresa específica"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print(f"\n🏢 VERIFICANDO SECCIONES PARA EMPRESA ID: {empresa_id}")
    print("=" * 60)
    
    # Obtener tipo de empresa
    cursor.execute("""
        SELECT EmpresaID, RazonSocial, Tipo_Empresa
        FROM Empresas
        WHERE EmpresaID = ?
    """, (empresa_id,))
    
    empresa = cursor.fetchone()
    if not empresa:
        print(f"❌ Empresa con ID {empresa_id} no encontrada")
        return
    
    print(f"\nEmpresa: {empresa.RazonSocial}")
    print(f"Tipo: {empresa.Tipo_Empresa}")
    
    # Obtener secciones aplicables
    cursor.execute("""
        SELECT 
            SeccionID,
            CodigoSeccion,
            TipoSeccion,
            NumeroOrden,
            Titulo
        FROM ANCI_SECCIONES_CONFIG
        WHERE Activo = 1
        AND (
            TipoSeccion = 'FIJA' OR
            TipoSeccion = 'ESPECIAL' OR
            (TipoSeccion = 'TAXONOMIA' AND 
             ((AplicaOIV = 1 AND ? = 'OIV') OR
              (AplicaPSE = 1 AND ? = 'PSE') OR
              (AplicaAMBAS = 1 AND ? = 'AMBAS')))
        )
        ORDER BY NumeroOrden
    """, (empresa.Tipo_Empresa, empresa.Tipo_Empresa, empresa.Tipo_Empresa))
    
    secciones = cursor.fetchall()
    print(f"\n📋 Total de secciones aplicables: {len(secciones)}")
    
    print("\nDetalle de secciones:")
    for i, sec in enumerate(secciones, 1):
        emoji = "🔧" if sec.TipoSeccion == "FIJA" else "🏷️" if sec.TipoSeccion == "TAXONOMIA" else "⚡"
        print(f"{i:2d}. {emoji} [{sec.CodigoSeccion}] {sec.Titulo}")
    
    cursor.close()
    conn.close()

def crear_incidente_prueba(empresa_id):
    """Crea un incidente de prueba con datos en la sección CSIRT"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print(f"\n🆕 CREANDO INCIDENTE DE PRUEBA")
    print("=" * 60)
    
    try:
        # Crear incidente básico
        cursor.execute("""
            INSERT INTO Incidentes (
                EmpresaID,
                IDVisible,
                Titulo,
                EstadoActual,
                Criticidad,
                FechaDeteccion,
                FechaCreacion,
                CreadoPor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            empresa_id,
            f"INC-TEST-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "Incidente de prueba - Sistema Dinámico",
            "Activo",
            "Alta",
            datetime.now(),
            datetime.now(),
            "script_prueba"
        ))
        
        # Obtener ID del incidente creado
        cursor.execute("SELECT SCOPE_IDENTITY()")
        incidente_id = cursor.fetchone()[0]
        print(f"✅ Incidente creado con ID: {incidente_id}")
        
        # Obtener ID de la sección CSIRT
        cursor.execute("""
            SELECT SeccionID FROM ANCI_SECCIONES_CONFIG
            WHERE CodigoSeccion = 'SEC_CSIRT'
        """)
        csirt_seccion = cursor.fetchone()
        
        if csirt_seccion:
            # Crear datos para la sección CSIRT
            datos_csirt = {
                "solicitarAyudaCSIRT": True,
                "fechaSolicitudCSIRT": datetime.now().isoformat(),
                "tipoAyudaCSIRT": "Análisis Forense",
                "descripcionAyudaCSIRT": "Se requiere análisis forense del servidor comprometido",
                "urgenciaCSIRT": "Alta",
                "contactoCSIRT": "Juan Pérez - +56912345678 - jperez@empresa.cl",
                "estadoSolicitudCSIRT": "Pendiente"
            }
            
            cursor.execute("""
                INSERT INTO INCIDENTES_SECCIONES_DATOS (
                    IncidenteID,
                    SeccionID,
                    DatosJSON,
                    EstadoSeccion,
                    PorcentajeCompletado,
                    ActualizadoPor
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                incidente_id,
                csirt_seccion.SeccionID,
                json.dumps(datos_csirt, ensure_ascii=False),
                "COMPLETO",
                100,
                "script_prueba"
            ))
            
            print("✅ Datos CSIRT agregados al incidente")
        
        conn.commit()
        
        # Verificar datos guardados
        cursor.execute("""
            SELECT 
                sc.Titulo,
                sd.DatosJSON,
                sd.EstadoSeccion
            FROM INCIDENTES_SECCIONES_DATOS sd
            INNER JOIN ANCI_SECCIONES_CONFIG sc ON sd.SeccionID = sc.SeccionID
            WHERE sd.IncidenteID = ?
        """, (incidente_id,))
        
        print("\n📄 Datos guardados:")
        for row in cursor.fetchall():
            print(f"\nSección: {row.Titulo}")
            print(f"Estado: {row.EstadoSeccion}")
            try:
                datos = json.loads(row.DatosJSON)
                for key, value in datos.items():
                    print(f"  - {key}: {value}")
            except:
                print("  Error parseando datos")
        
    except Exception as e:
        print(f"❌ Error creando incidente: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def verificar_vista_csirt():
    """Verifica la vista de incidentes con CSIRT"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("\n🔍 VERIFICANDO VISTA DE INCIDENTES CON CSIRT")
    print("=" * 60)
    
    try:
        cursor.execute("""
            SELECT TOP 10
                IncidenteID,
                IDVisible,
                Titulo,
                Criticidad,
                SolicitóCSIRT,
                UrgenciaCSIRT
            FROM vw_IncidentesConCSIRT
            ORDER BY FechaUltimoCambio DESC
        """)
        
        incidentes = cursor.fetchall()
        if incidentes:
            print(f"\nÚltimos {len(incidentes)} incidentes:")
            for inc in incidentes:
                csirt_icon = "🚨" if inc.SolicitóCSIRT == "Sí" else "  "
                print(f"{csirt_icon} [{inc.IDVisible}] {inc.Titulo[:50]}... - Criticidad: {inc.Criticidad}")
                if inc.SolicitóCSIRT == "Sí":
                    print(f"   └─ Urgencia CSIRT: {inc.UrgenciaCSIRT}")
        else:
            print("No se encontraron incidentes en la vista")
            
    except Exception as e:
        print(f"❌ Error verificando vista: {e}")
        print("   La vista vw_IncidentesConCSIRT puede no estar creada")
    finally:
        cursor.close()
        conn.close()

def menu_principal():
    """Menú principal del script de prueba"""
    while True:
        print("\n" + "="*60)
        print("🧪 PRUEBA DEL SISTEMA DINÁMICO DE INCIDENTES")
        print("="*60)
        print("1. Verificar secciones del sistema")
        print("2. Verificar secciones para una empresa")
        print("3. Crear incidente de prueba con CSIRT")
        print("4. Verificar vista de incidentes con CSIRT")
        print("5. Salir")
        print("-"*60)
        
        opcion = input("\nSeleccione una opción (1-5): ")
        
        if opcion == "1":
            verificar_secciones()
        elif opcion == "2":
            empresa_id = input("\nIngrese el ID de la empresa: ")
            try:
                verificar_secciones_empresa(int(empresa_id))
            except ValueError:
                print("❌ ID de empresa inválido")
        elif opcion == "3":
            empresa_id = input("\nIngrese el ID de la empresa para el incidente: ")
            try:
                crear_incidente_prueba(int(empresa_id))
            except ValueError:
                print("❌ ID de empresa inválido")
        elif opcion == "4":
            verificar_vista_csirt()
        elif opcion == "5":
            print("\n👋 ¡Hasta luego!")
            break
        else:
            print("❌ Opción inválida")
        
        input("\nPresione ENTER para continuar...")

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║     SCRIPT DE PRUEBA - SISTEMA DINÁMICO DE INCIDENTES   ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Este script verifica:                                   ║
    ║  - Creación de secciones dinámicas                      ║
    ║  - Sección CSIRT                                        ║
    ║  - Campos actualizados ANCI                            ║
    ║  - Guardado de datos JSON                              ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    print("⚠️  IMPORTANTE: Actualice CONNECTION_STRING antes de ejecutar")
    print("   Edite las líneas 11-16 con sus credenciales\n")
    
    menu_principal()