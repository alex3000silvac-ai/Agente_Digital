# Guía de Despliegue: Railway + Supabase + GitHub

## Arquitectura

- **Frontend + Backend**: Railway
- **Base de Datos**: Supabase (PostgreSQL)
- **Repositorio**: GitHub

## Paso 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Configura:
   - Project name: `agente-digital`
   - Database Password: (guárdala segura)
   - Region: Selecciona la más cercana

### 1.2 Ejecutar migraciones

1. En Supabase Dashboard, ve a "SQL Editor"
2. Crea una nueva query
3. Pega y ejecuta el contenido de `supabase_migration.sql`
4. Ejecuta el contenido de `supabase_rls_policies.sql` (opcional pero recomendado)

### 1.3 Crear usuario administrador

Opción A - Usando SQL:
1. En SQL Editor, ejecuta `insert_admin_user.sql`

Opción B - Usando Python (recomendado):
```bash
# Instalar dependencias
pip install psycopg2-binary werkzeug

# Ejecutar script con tu URL de Supabase
python create_admin_user.py "postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres"
```

### 1.4 Obtener credenciales

En Supabase Dashboard > Settings > Database:
- Connection string > URI (para `SUPABASE_DB_URL`)
- API > URL (para `SUPABASE_URL`)
- API > anon key (para `SUPABASE_ANON_KEY`)

## Paso 2: Preparar GitHub

### 2.1 Crear repositorio

```bash
# Inicializar git si no existe
git init

# Agregar archivos
git add .

# Crear commit
git commit -m "Initial commit - Agente Digital"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/agente-digital.git
git push -u origin main
```

### 2.2 Estructura necesaria

Asegúrate de tener estos archivos en tu repositorio:
```
/
├── agente_digital_api/
├── agente_digital_ui/
├── requirements.txt
├── railway.json
├── Procfile
├── .env.example
└── README.md
```

## Paso 3: Desplegar en Railway

### 3.1 Crear proyecto

1. Ve a [railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio `agente-digital`

### 3.2 Configurar variables de entorno

En Railway Dashboard > Variables, agrega:

```env
# Flask
FLASK_ENV=production
SECRET_KEY=[genera-32-caracteres-aleatorios]
JWT_SECRET_KEY=[genera-otros-32-caracteres]

# Supabase
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]

# CORS (actualizar con tu dominio de Railway)
CORS_ORIGINS=https://tu-app.railway.app

# Puerto (Railway lo asigna automáticamente)
PORT=8080
```

### 3.3 Desplegar

Railway comenzará automáticamente el despliegue. Puedes ver el progreso en:
- Deploy Logs: Para ver el proceso de build
- Observability: Para ver logs en tiempo real

## Paso 4: Verificar despliegue

1. Railway asignará un dominio automático: `https://tu-app.railway.app`
2. Visita la URL
3. Intenta hacer login con:
   - Email: `admin@surtika.cl`
   - Contraseña: `admin123`

## Solución de problemas

### Error de conexión a base de datos

1. Verifica que `SUPABASE_DB_URL` esté correcta
2. En Supabase, verifica que no hayas excedido el límite de conexiones
3. Revisa los logs en Railway

### Frontend no carga

1. Verifica que el build de Vue.js se complete
2. Revisa que `npm install` y `npm run build` se ejecuten correctamente
3. Verifica la consola del navegador para errores

### Error 500 en login

1. Verifica que las tablas se crearon correctamente en Supabase
2. Confirma que el usuario admin existe
3. Revisa los logs del servidor en Railway

## Comandos útiles

### Railway CLI

```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Ver logs
railway logs

# Ejecutar comandos
railway run python create_admin_user.py
```

### Actualizar la aplicación

```bash
# Hacer cambios
git add .
git commit -m "Descripción del cambio"
git push

# Railway detectará el push y redesplegar automáticamente
```

## Seguridad

1. **Cambiar contraseñas**: El usuario admin debe cambiar su contraseña inmediatamente
2. **Claves secretas**: Genera claves únicas para SECRET_KEY y JWT_SECRET_KEY
3. **RLS**: Considera habilitar Row Level Security en Supabase
4. **Backups**: Configura backups automáticos en Supabase

## Costos estimados

- **Railway**: Plan Hobby $5/mes (incluye $5 de créditos)
- **Supabase**: Plan Free incluye:
  - 500MB de base de datos
  - 2GB de transferencia
  - 50MB de archivos
- **Total**: ~$5/mes para uso básico

## Próximos pasos

1. Configurar un dominio personalizado
2. Implementar CI/CD con GitHub Actions
3. Configurar monitoreo y alertas
4. Implementar backups automáticos
5. Configurar SSL personalizado