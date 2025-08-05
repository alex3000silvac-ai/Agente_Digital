# Deploy con Railway CLI

## Instalación

1. Instala Node.js si no lo tienes
2. Instala Railway CLI:
```bash
npm install -g @railway/cli
```

## Pasos para deploy

1. **Login en Railway**:
```bash
railway login
```

2. **Crear nuevo proyecto**:
```bash
railway init
```
Selecciona "Empty Project"

3. **Conectar con tu proyecto existente** (si ya lo creaste en Railway):
```bash
railway link
```

4. **Configurar variables de entorno**:
```bash
railway variables set FLASK_ENV=production
railway variables set SECRET_KEY=d47473c4c6d4eb6c2fabbfe28dcdf61a39d490cc42e028a15cd5b135f1863697
railway variables set JWT_SECRET_KEY=ab62d7c9d5c56f3a03985721e19c8d79196707abd14b796cbf15c8f2ee7fd736
railway variables set SUPABASE_DB_URL="tu-url-de-supabase"
railway variables set SUPABASE_URL="tu-supabase-url"
railway variables set SUPABASE_ANON_KEY="tu-anon-key"
railway variables set CORS_ORIGINS="*"
railway variables set DB_DRIVER=PostgreSQL
```

5. **Deploy**:
```bash
railway up
```

6. **Ver logs**:
```bash
railway logs
```

7. **Abrir la app**:
```bash
railway open
```

## Si el CLI también falla

Intenta crear un archivo ZIP del proyecto y subirlo manualmente:

1. Crea un ZIP del proyecto (sin node_modules, venv, etc.)
2. En Railway, crea un nuevo proyecto
3. Usa "Deploy from ZIP"