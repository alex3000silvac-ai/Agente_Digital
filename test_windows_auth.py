import pyodbc

print("=== PROBANDO AUTENTICACIÓN WINDOWS ===\n")

server = "PASC"
database = "AgenteDigitalDB"

# Probar con autenticación Windows
try:
    conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};Trusted_Connection=yes"
    print(f"Probando: {conn_str}")
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT SYSTEM_USER, USER_NAME()")
    result = cursor.fetchone()
    
    print(f"\n✅ CONEXIÓN EXITOSA!")
    print(f"Usuario Windows: {result[0]}")
    print(f"Usuario DB: {result[1]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    
print("\n=== VERIFICANDO TABLA Usuario ===")
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM Usuario WHERE email = 'admin@agentedigital.cl'")
    count = cursor.fetchone()[0]
    
    if count > 0:
        print("✅ Usuario admin@agentedigital.cl existe en la BD")
    else:
        print("❌ Usuario admin@agentedigital.cl NO existe")
        print("\nCreando usuario admin...")
        
        # Crear usuario admin
        cursor.execute("""
            INSERT INTO Usuario (nombre, email, password_hash, rol, activo)
            VALUES ('Administrador', 'admin@agentedigital.cl', 
                    'scrypt:32768:8:1$KJ8kF3zL8hXR5Q9Y$b8f0e5c3d4a5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1', 
                    'Administrador', 1)
        """)
        conn.commit()
        print("✅ Usuario admin creado")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error verificando usuario: {str(e)}")