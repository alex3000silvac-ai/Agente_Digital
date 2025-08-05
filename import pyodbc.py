import pyodbc

try:
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost;"  # o el nombre/IP correcto de tu servidor SQL
        "DATABASE=TAXONOMIA_INCIDENTES;"
        "UID=tu_usuario;"
        "PWD=tu_contraseña;"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT TOP 1 * FROM taxonomia")  # Ajusta si tu tabla tiene otro nombre
    row = cursor.fetchone()
    print("✅ Conexión exitosa. Primer resultado:", row)
except Exception as e:
    print("❌ Error de conexión a la base de datos:", e)
