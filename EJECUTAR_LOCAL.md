# EJECUTAR TODO LOCALMENTE

## 1. BACKEND (Terminal 1)
```bash
cd agente_digital_api
python run.py
```

Deberías ver:
```
* Running on http://127.0.0.1:5000
```

## 2. FRONTEND (Terminal 2)
```bash
cd agente_digital_ui
npm run dev
```

Deberías ver:
```
VITE v4.5.0  ready in X ms
➜  Local:   http://localhost:5173/
```

## 3. ACCEDER A LA APLICACIÓN
Abre: http://localhost:5173

## 4. CREDENCIALES
- Email: admin@agentedigital.cl
- Password: Admin123!

## 5. VERIFICAR BASE DE DATOS LOCAL
El backend usará la configuración local de `.env`:
- DB local en 192.168.64.1
- Usuario: app_usuario
- Clave: ClaveSegura123!

## SI HAY PROBLEMAS:
1. Verifica que SQL Server esté corriendo
2. Verifica el archivo `.env` en `agente_digital_api`
3. Prueba: http://localhost:5000/api/health