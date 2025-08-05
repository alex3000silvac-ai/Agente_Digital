# Guía de Despliegue en Railway

## Pasos para desplegar Agente Digital en Railway

### 1. Preparación del repositorio

Asegúrate de tener todos estos archivos en tu repositorio:
- `requirements.txt` - Dependencias de Python
- `railway.json` - Configuración de Railway
- `Procfile` - Comando de inicio
- `.env.example` - Variables de entorno de ejemplo

### 2. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Crea una nueva cuenta o inicia sesión
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta tu repositorio

### 3. Configurar base de datos PostgreSQL

1. En tu proyecto Railway, click en "New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la variable `DATABASE_URL`

### 4. Configurar variables de entorno

En la sección "Variables" de tu servicio, agrega:

```env
# Flask
FLASK_ENV=production
SECRET_KEY=[genera-una-clave-segura-de-32-caracteres]
JWT_SECRET_KEY=[genera-otra-clave-segura-de-32-caracteres]

# Frontend URL (para CORS)
CORS_ORIGINS=https://tu-app.railway.app

# Logging
LOG_LEVEL=INFO
```

### 5. Ejecutar migraciones

Una vez desplegado, ejecuta las migraciones:

1. En Railway, ve a tu servicio
2. Click en "Settings" → "Deploy" → "Railway CLI"
3. Ejecuta:
```bash
railway run python migrate_to_postgresql.py
```

### 6. Desplegar

Railway desplegará automáticamente cuando:
- Hagas push a tu repositorio
- Cambies variables de entorno
- Manualmente desde el dashboard

### 7. Verificar despliegue

1. Espera a que el build termine (ver logs)
2. Railway asignará un dominio automáticamente
3. Visita `https://tu-app.railway.app`

## Estructura del proyecto

```
/
├── agente_digital_api/     # Backend Flask
│   ├── app/
│   └── requirements.txt
├── agente_digital_ui/      # Frontend Vue.js
│   ├── src/
│   ├── package.json
│   └── dist/              # Se genera en build
├── railway.json
├── Procfile
└── migrate_to_postgresql.py
```

## Comandos útiles de Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver logs
railway logs

# Ejecutar comandos
railway run python script.py

# Variables de entorno
railway variables
```

## Solución de problemas

### Error de build
- Verifica que `requirements.txt` esté actualizado
- Revisa los logs de build en Railway

### Error de base de datos
- Asegúrate que PostgreSQL esté provisionado
- Verifica que `DATABASE_URL` esté configurada
- Ejecuta las migraciones

### Frontend no carga
- Verifica que el build de Vue.js se complete
- Revisa la configuración de rutas en Flask

## Notas importantes

1. **Seguridad**: Cambia TODAS las claves secretas en producción
2. **Base de datos**: Los datos en SQL Server NO se migran automáticamente
3. **Archivos**: Railway no persiste archivos subidos, usa un servicio externo
4. **Escalamiento**: Railway escala automáticamente según demanda

## Costos estimados

- Plan Hobby: $5/mes (incluye $5 de créditos)
- PostgreSQL: ~$5-10/mes según uso
- Total estimado: $10-15/mes para uso moderado