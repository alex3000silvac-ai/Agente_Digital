import pyodbc
import sys

print("=== PROBANDO CONEXIONES SQL SERVER ===\n")

# Lista de servidores a probar
servers = [
    "localhost",
    "127.0.0.1", 
    "(local)",
    ".\SQLEXPRESS",
    "localhost\SQLEXPRESS",
    "."
]

# Configuración
database = "AgenteDigitalDB"
username = "app_usuario"
password = "ClaveSegura123!"

for server in servers:
    print(f"Probando: {server}")
    try:
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
        conn = pyodbc.connect(conn_str, timeout=5)
        print(f"✅ ÉXITO con: {server}")
        conn.close()
        print(f"\nUSA ESTE EN .env:\nLOCAL_DB_SERVER={server}\n")
        break
    except Exception as e:
        print(f"❌ Falló: {str(e)[:100]}...\n")

print("\n=== VERIFICANDO SERVICIOS ===")
import subprocess
try:
    result = subprocess.run(['sc', 'query', 'MSSQLSERVER'], capture_output=True, text=True)
    if "RUNNING" in result.stdout:
        print("✅ SQL Server (MSSQLSERVER) está corriendo")
    else:
        print("❌ SQL Server (MSSQLSERVER) NO está corriendo")
except:
    pass

try:
    result = subprocess.run(['sc', 'query', 'MSSQL$SQLEXPRESS'], capture_output=True, text=True)
    if "RUNNING" in result.stdout:
        print("✅ SQL Server Express está corriendo")
    else:
        print("❌ SQL Server Express NO está corriendo")
except:
    pass