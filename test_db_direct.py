import pyodbc
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv('.env')

print("=== VERIFICANDO CONEXIÓN DIRECTA ===\n")

# Leer configuración
server = os.getenv('LOCAL_DB_SERVER', 'PASC')
database = os.getenv('LOCAL_DB_DATABASE', 'AgenteDigitalDB')
use_windows_auth = os.getenv('USE_WINDOWS_AUTH', 'True').lower() == 'true'

print(f"Servidor: {server}")
print(f"Base de datos: {database}")
print(f"Autenticación Windows: {use_windows_auth}")

# Intentar conexión
try:
    if use_windows_auth:
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes"
    else:
        username = os.getenv('LOCAL_DB_USERNAME')
        password = os.getenv('LOCAL_DB_PASSWORD')
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
    
    print(f"\nCadena de conexión: {conn_str}")
    
    conn = pyodbc.connect(conn_str)
    print("✅ CONEXIÓN EXITOSA\n")
    
    # Verificar tabla Inquilino
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM Inquilino")
    count = cursor.fetchone()[0]
    print(f"Total de inquilinos en la BD: {count}")
    
    if count == 0:
        print("\n⚠️ No hay inquilinos en la base de datos")
        print("Creando inquilino de prueba...")
        
        cursor.execute("""
            INSERT INTO Inquilino (NombreInquilino, RutInquilino, DireccionInquilino, Estado)
            VALUES ('Empresa Demo S.A.', '76.123.456-7', 'Av. Providencia 123, Santiago', 'Activo')
        """)
        conn.commit()
        print("✅ Inquilino de prueba creado")
    else:
        print("\nPrimeros 5 inquilinos:")
        cursor.execute("SELECT TOP 5 InquilinoID, NombreInquilino FROM Inquilino")
        for row in cursor.fetchall():
            print(f"  ID: {row[0]}, Nombre: {row[1]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("\nPosibles soluciones:")
    print("1. Verificar que SQL Server esté corriendo")
    print("2. Verificar el nombre del servidor (PASC)")
    print("3. Verificar que tu usuario Windows tenga acceso a la BD")
    print("4. Verificar que la BD 'AgenteDigitalDB' exista")