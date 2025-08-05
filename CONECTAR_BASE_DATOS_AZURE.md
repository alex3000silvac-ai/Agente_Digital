# CONECTAR BASE DE DATOS AZURE

## 1. VARIABLES DE ENTORNO EN AZURE APP SERVICE

Ve a tu App Service → Configuration → Application Settings

Asegúrate de tener TODAS estas variables:

```
DATABASE_TYPE = azure
AZURE_DB_SERVER = agentedigitalserver.database.windows.net
AZURE_DB_DATABASE = AgenteDigitalDB
AZURE_DB_USERNAME = adminagente
AZURE_DB_PASSWORD = Agente2024!
DB_DRIVER = ODBC Driver 17 for SQL Server
SECRET_KEY = tu-clave-secreta-aqui
JWT_SECRET_KEY = tu-clave-jwt-aqui
```

## 2. COMANDO DE INICIO

En Configuration → General Settings → Startup Command:
```
gunicorn --bind=0.0.0.0:8000 --timeout 600 run:app
```

## 3. VERIFICAR CONEXIÓN

Después de configurar, reinicia el App Service y prueba:
```
https://agentedigital-backend-babehxbqbhbvcmag.centralus-01.azurewebsites.net/api/health
```

## 4. SI NO CONECTA

### Verificar Firewall de SQL
1. Ve a tu SQL Server en Azure
2. Security → Firewalls and virtual networks
3. Agregar: "Allow Azure services and resources to access this server" = YES
4. Guardar

### Verificar Usuario SQL
Conéctate a la BD con Azure Data Studio o SSMS:
```sql
SELECT name FROM sys.database_principals WHERE name = 'adminagente';
```

Si no existe el usuario:
```sql
CREATE USER adminagente WITH PASSWORD = 'Agente2024!';
ALTER ROLE db_datareader ADD MEMBER adminagente;
ALTER ROLE db_datawriter ADD MEMBER adminagente;
```

## 5. PROBAR LOCALMENTE

Para verificar que las credenciales funcionan:
```python
import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=agentedigitalserver.database.windows.net;"
    "DATABASE=AgenteDigitalDB;"
    "UID=adminagente;"
    "PWD=Agente2024!"
)

try:
    conn = pyodbc.connect(conn_str)
    print("✅ Conexión exitosa")
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
```