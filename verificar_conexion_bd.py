#!/usr/bin/env python3
# Script para verificar conexión a SQL Server

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'agente_digital_api'))

try:
    from app.database import get_db_connection, test_table_exists
    
    print("🔍 Verificando conexión a SQL Server...")
    print("=" * 60)
    
    # Intentar conexión
    conn = get_db_connection()
    
    if conn:
        print("✅ Conexión exitosa a SQL Server")
        
        # Verificar tablas principales
        tablas_criticas = [
            'Empresas',
            'Incidentes', 
            'CumplimientoEmpresa',
            'Inquilinos',
            'UsuariosCliente',
            'OBLIGACIONES'
        ]
        
        print("\n📊 Verificando tablas principales:")
        print("-" * 40)
        
        todas_existen = True
        for tabla in tablas_criticas:
            existe = test_table_exists(tabla)
            estado = "✅ Existe" if existe else "❌ NO EXISTE"
            print(f"{tabla:<25} {estado}")
            if not existe:
                todas_existen = False
        
        # Contar registros en tablas principales
        if todas_existen:
            print("\n📈 Conteo de registros:")
            print("-" * 40)
            cursor = conn.cursor()
            
            for tabla in ['Inquilinos', 'Empresas', 'Incidentes']:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
                    count = cursor.fetchone()[0]
                    print(f"{tabla:<25} {count} registros")
                except Exception as e:
                    print(f"{tabla:<25} Error: {str(e)}")
            
            cursor.close()
        
        conn.close()
        print("\n✅ Base de datos SQL Server está operativa")
        
    else:
        print("❌ No se pudo conectar a SQL Server")
        print("\nPosibles causas:")
        print("1. SQL Server no está ejecutándose")
        print("2. Credenciales incorrectas en .env")
        print("3. Firewall bloqueando la conexión")
        
except ImportError as e:
    print(f"❌ Error importando módulos: {e}")
    print("Asegúrate de estar en el directorio correcto")
except Exception as e:
    print(f"❌ Error general: {e}")
    import traceback
    traceback.print_exc()