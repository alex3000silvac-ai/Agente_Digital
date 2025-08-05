#!/usr/bin/env python3
"""
SCRIPT DE VERIFICACIÓN COMPLETA - CAMPOS ANCI
==============================================
Este script verifica que todos los campos ANCI estén implementados correctamente
y que el sistema esté listo para generar reportes completos.
"""

import pyodbc
import json
import sys
from datetime import datetime
from tabulate import tabulate

# Configuración de conexión (actualizar con sus credenciales)
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
        return conn
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        sys.exit(1)

def verificar_campos_incidentes():
    """Verifica que todos los campos ANCI estén en la tabla Incidentes"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("🔍 VERIFICANDO CAMPOS ANCI EN TABLA INCIDENTES")
    print("=" * 60)
    
    campos_esperados = [
        'AnciNombreReportante', 'AnciCargoReportante', 'AnciCorreoReportante',
        'AnciTelefonoReportante', 'AnciFormacionCertificacion', 'AnciFechaAlertaTemprana',
        'AnciSistemasAfectadosDetalle', 'AnciImpactoContinuidadDatos', 'AnciAfectacionTerceros',
        'AnciNumeroAfectados', 'AnciAccionesContencion', 'AnciSistemasDesconectados',
        'AnciNotificacionesInternas', 'AnciEstadoActualIncidente', 'AnciContactoSeguimientoNombre',
        'AnciContactoSeguimientoHorario', 'AnciContactoSeguimientoCorreo', 'AnciContactoSeguimientoTelefono',
        'AnciOIVCuentaConSGSI', 'AnciOIVDetallePlanContinuidad', 'AnciOIVActivoPlanRecuperacion',
        'AnciOIVAuditoriasRealizadas', 'AnciOIVFechaUltimaAuditoria', 'AnciOIVDelegadoTecnico',
        'AnciOIVMedidasPropagacion', 'AnciOIVNotificacionAfectados', 'AnciOIVRegistroCapacitaciones'
    ]
    
    # Verificar existencia de campos
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Incidentes'
        AND COLUMN_NAME LIKE 'Anci%'
        ORDER BY COLUMN_NAME
    """)
    
    campos_existentes = cursor.fetchall()
    campos_encontrados = [campo[0] for campo in campos_existentes]
    
    print(f"\n📊 RESUMEN DE CAMPOS ANCI:")
    print(f"   - Campos esperados: {len(campos_esperados)}")
    print(f"   - Campos encontrados: {len(campos_encontrados)}")
    print(f"   - Campos faltantes: {len(set(campos_esperados) - set(campos_encontrados))}")
    
    # Mostrar campos faltantes
    campos_faltantes = set(campos_esperados) - set(campos_encontrados)
    if campos_faltantes:
        print(f"\n❌ CAMPOS FALTANTES:")
        for campo in sorted(campos_faltantes):
            print(f"   - {campo}")
    else:
        print(f"\n✅ TODOS LOS CAMPOS ANCI IMPLEMENTADOS")
    
    # Mostrar tabla detallada
    if campos_existentes:
        print(f"\n📋 DETALLE DE CAMPOS ANCI EXISTENTES:")
        tabla = []
        for campo in campos_existentes:
            tabla.append([campo[0], campo[1], campo[2]])
        
        print(tabulate(tabla, headers=['Campo', 'Tipo', 'Nulo'], tablefmt='grid'))
    
    cursor.close()
    conn.close()
    
    return len(campos_faltantes) == 0

def verificar_secciones_dinamicas():
    """Verifica la configuración de secciones dinámicas"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("\n⚙️ VERIFICANDO CONFIGURACIÓN DE SECCIONES DINÁMICAS")
    print("=" * 60)
    
    # Verificar tabla de configuración
    cursor.execute("""
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'ANCI_FORMULARIO_CONFIG'
    """)
    
    tabla_existe = cursor.fetchone()[0] > 0
    
    if not tabla_existe:
        print("❌ Tabla ANCI_FORMULARIO_CONFIG no existe")
        cursor.close()
        conn.close()
        return False
    
    # Obtener estadísticas de secciones
    cursor.execute("""
        SELECT 
            TipoSeccion,
            COUNT(*) as Total,
            SUM(CASE WHEN Activo = 1 THEN 1 ELSE 0 END) as Activas
        FROM ANCI_FORMULARIO_CONFIG
        GROUP BY TipoSeccion
        ORDER BY TipoSeccion
    """)
    
    estadisticas = cursor.fetchall()
    
    print(f"\n📊 ESTADÍSTICAS DE SECCIONES:")
    tabla = []
    total_secciones = 0
    total_activas = 0
    
    for stat in estadisticas:
        tabla.append([stat[0], stat[1], stat[2]])
        total_secciones += stat[1]
        total_activas += stat[2]
    
    tabla.append(['TOTAL', total_secciones, total_activas])
    print(tabulate(tabla, headers=['Tipo', 'Total', 'Activas'], tablefmt='grid'))
    
    # Verificar secciones específicas
    secciones_criticas = ['SEC_1', 'SEC_2', 'SEC_3', 'SEC_5', 'SEC_6', 'SEC_CSIRT', 'SEC_OIV', 'SEC_CONTACTO']
    
    cursor.execute("""
        SELECT CodigoSeccion, TituloSeccion, Activo
        FROM ANCI_FORMULARIO_CONFIG
        WHERE CodigoSeccion IN ({})
    """.format(','.join([f"'{s}'" for s in secciones_criticas])))
    
    secciones_encontradas = cursor.fetchall()
    
    print(f"\n🔍 SECCIONES CRÍTICAS:")
    for seccion in secciones_criticas:
        encontrada = any(s[0] == seccion for s in secciones_encontradas)
        if encontrada:
            activa = any(s[0] == seccion and s[2] == 1 for s in secciones_encontradas)
            estado = "✅ ACTIVA" if activa else "⚠️ INACTIVA"
        else:
            estado = "❌ FALTANTE"
        print(f"   - {seccion}: {estado}")
    
    cursor.close()
    conn.close()
    
    return len(secciones_encontradas) >= 6  # Al menos las secciones básicas

def verificar_procedimientos_validacion():
    """Verifica que los procedimientos de validación estén creados"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("\n🔧 VERIFICANDO PROCEDIMIENTOS Y FUNCIONES")
    print("=" * 60)
    
    # Verificar procedimientos
    procedimientos_esperados = [
        'sp_ValidarIncidenteANCICompleto',
        'sp_AgregarCampoASeccion'
    ]
    
    cursor.execute("""
        SELECT name FROM sys.procedures
        WHERE name IN ({})
    """.format(','.join([f"'{p}'" for p in procedimientos_esperados])))
    
    procedimientos_encontrados = [row[0] for row in cursor.fetchall()]
    
    print(f"\n📋 PROCEDIMIENTOS ALMACENADOS:")
    for proc in procedimientos_esperados:
        estado = "✅ EXISTE" if proc in procedimientos_encontrados else "❌ FALTANTE"
        print(f"   - {proc}: {estado}")
    
    # Verificar funciones
    funciones_esperadas = [
        'fn_ValidarCSIRTParaCriticos'
    ]
    
    cursor.execute("""
        SELECT name FROM sys.objects
        WHERE type = 'FN' AND name IN ({})
    """.format(','.join([f"'{f}'" for f in funciones_esperadas])))
    
    funciones_encontradas = [row[0] for row in cursor.fetchall()]
    
    print(f"\n⚙️ FUNCIONES:")
    for func in funciones_esperadas:
        estado = "✅ EXISTE" if func in funciones_encontradas else "❌ FALTANTE"
        print(f"   - {func}: {estado}")
    
    # Verificar vistas
    vistas_esperadas = [
        'vw_IncidentesANCICompletos',
        'vw_IncidentesConCSIRT'
    ]
    
    cursor.execute("""
        SELECT name FROM sys.views
        WHERE name IN ({})
    """.format(','.join([f"'{v}'" for v in vistas_esperadas])))
    
    vistas_encontradas = [row[0] for row in cursor.fetchall()]
    
    print(f"\n👁️ VISTAS:")
    for vista in vistas_esperadas:
        estado = "✅ EXISTE" if vista in vistas_encontradas else "❌ FALTANTE"
        print(f"   - {vista}: {estado}")
    
    cursor.close()
    conn.close()
    
    total_esperado = len(procedimientos_esperados) + len(funciones_esperadas) + len(vistas_esperadas)
    total_encontrado = len(procedimientos_encontrados) + len(funciones_encontradas) + len(vistas_encontradas)
    
    return total_encontrado == total_esperado

def probar_validacion_incidente():
    """Prueba el sistema de validación con un incidente de ejemplo"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("\n🧪 PROBANDO SISTEMA DE VALIDACIÓN")
    print("=" * 60)
    
    try:
        # Buscar un incidente existente
        cursor.execute("""
            SELECT TOP 1 IncidenteID, Titulo, Criticidad
            FROM Incidentes
            WHERE Titulo IS NOT NULL
            ORDER BY FechaCreacion DESC
        """)
        
        incidente = cursor.fetchone()
        
        if not incidente:
            print("⚠️ No hay incidentes para probar")
            cursor.close()
            conn.close()
            return True
        
        print(f"🔍 Probando con incidente: {incidente[0]} - {incidente[1]}")
        
        # Ejecutar validación
        cursor.execute("""
            EXEC sp_ValidarIncidenteANCICompleto @IncidenteID = ?, @MostrarDetalle = 0
        """, (incidente[0],))
        
        resultados = cursor.fetchall()
        
        if resultados:
            print(f"\n📊 RESULTADOS DE VALIDACIÓN:")
            tabla = []
            for resultado in resultados:
                tabla.append([resultado[0], resultado[1], resultado[2], resultado[3]])
            
            print(tabulate(tabla, headers=['Categoría', 'Total', 'Exitosas', 'Errores'], tablefmt='grid'))
        
        # Obtener estado general
        cursor.nextset()
        estado_general = cursor.fetchone()
        
        if estado_general:
            print(f"\n🎯 ESTADO GENERAL: {estado_general[0]}")
            print(f"   - Errores críticos: {estado_general[1]}")
            print(f"   - Mensaje: {estado_general[2]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error en validación: {e}")
        cursor.close()
        conn.close()
        return False

def generar_reporte_final():
    """Genera reporte final del estado del sistema"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    print("\n📊 REPORTE FINAL DEL SISTEMA ANCI")
    print("=" * 60)
    
    # Estadísticas generales
    cursor.execute("""
        SELECT 
            COUNT(*) as TotalIncidentes,
            COUNT(CASE WHEN AnciNombreReportante IS NOT NULL THEN 1 END) as ConReportante,
            COUNT(CASE WHEN AnciContactoSeguimientoNombre IS NOT NULL THEN 1 END) as ConContacto,
            COUNT(CASE WHEN AnciOIVCuentaConSGSI IS NOT NULL THEN 1 END) as ConDatosOIV
        FROM Incidentes
    """)
    
    stats = cursor.fetchone()
    
    print(f"\n📈 ESTADÍSTICAS DE INCIDENTES:")
    print(f"   - Total incidentes: {stats[0]}")
    print(f"   - Con datos reportante: {stats[1]} ({stats[1]/stats[0]*100:.1f}%)")
    print(f"   - Con contacto seguimiento: {stats[2]} ({stats[2]/stats[0]*100:.1f}%)")
    print(f"   - Con datos OIV: {stats[3]} ({stats[3]/stats[0]*100:.1f}%)")
    
    # Verificar integridad CSIRT
    cursor.execute("""
        SELECT COUNT(*) as IncidentesCriticos
        FROM Incidentes
        WHERE Criticidad = 'Crítica'
    """)
    
    criticos = cursor.fetchone()[0]
    print(f"\n🚨 INCIDENTES CRÍTICOS: {criticos}")
    
    if criticos > 0:
        cursor.execute("""
            SELECT COUNT(*) as ConCSIRT
            FROM Incidentes i
            INNER JOIN INCIDENTES_SECCIONES_DATOS sd ON i.IncidenteID = sd.IncidenteID
            INNER JOIN ANCI_SECCIONES_CONFIG sc ON sd.SeccionID = sc.SeccionID
            WHERE i.Criticidad = 'Crítica' 
            AND sc.CodigoSeccion = 'SEC_CSIRT'
            AND sd.DatosJSON LIKE '%"solicitarAyudaCSIRT":true%'
        """)
        
        con_csirt = cursor.fetchone()[0]
        print(f"   - Con solicitud CSIRT: {con_csirt} ({con_csirt/criticos*100:.1f}%)")
    
    cursor.close()
    conn.close()

def main():
    """Función principal del script"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║              VERIFICACIÓN COMPLETA SISTEMA ANCI              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Este script verifica:                                       ║
    ║  ✓ Campos ANCI en tabla Incidentes                         ║
    ║  ✓ Configuración de secciones dinámicas                    ║
    ║  ✓ Procedimientos y funciones de validación                ║
    ║  ✓ Prueba del sistema de validación                        ║
    ║  ✓ Estadísticas generales                                  ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    print(f"🕐 Iniciando verificación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ejecutar verificaciones
    resultados = {
        'campos_incidentes': verificar_campos_incidentes(),
        'secciones_dinamicas': verificar_secciones_dinamicas(),
        'procedimientos': verificar_procedimientos_validacion(),
        'validacion_funciona': probar_validacion_incidente()
    }
    
    # Generar reporte final
    generar_reporte_final()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("🎯 RESUMEN DE VERIFICACIÓN")
    print("=" * 60)
    
    for verificacion, resultado in resultados.items():
        estado = "✅ EXITOSO" if resultado else "❌ FALLIDO"
        print(f"   - {verificacion.replace('_', ' ').title()}: {estado}")
    
    # Determinar estado general
    todas_exitosas = all(resultados.values())
    estado_general = "SISTEMA LISTO" if todas_exitosas else "REQUIERE CORRECCIONES"
    
    print(f"\n🏁 ESTADO FINAL: {estado_general}")
    
    if todas_exitosas:
        print("""
        ✅ SISTEMA COMPLETAMENTE VERIFICADO
        
        El sistema está listo para:
        - Capturar todos los campos ANCI requeridos
        - Validar incidentes antes del envío
        - Generar reportes completos para ANCI
        - Manejar secciones dinámicas
        
        Puede proceder con la implementación del frontend.
        """)
    else:
        print("""
        ⚠️ SISTEMA REQUIERE CORRECCIONES
        
        Ejecute el script de implementación:
        sqlcmd -i implementacion_campos_anci_completos.sql
        
        Luego ejecute este script nuevamente.
        """)
    
    print(f"\n🕐 Verificación completada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    print("⚠️  IMPORTANTE: Actualice CONNECTION_STRING con sus credenciales")
    print("   Edite las líneas 13-17 con sus datos de conexión\n")
    
    respuesta = input("¿Desea continuar con la verificación? (s/n): ")
    if respuesta.lower() in ['s', 'si', 'sí', 'y', 'yes']:
        main()
    else:
        print("👋 Verificación cancelada")