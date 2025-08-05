# 🚨 README DE EMERGENCIA - AGENTE DIGITAL

## 🛡️ COMANDOS DE EMERGENCIA

### Si algo se rompe:
```bash
# Ver últimos cambios
git log --oneline -10

# RESTAURAR al estado anterior
./restore-emergency.sh
# o en Windows:
restore-emergency.bat
```

### Para hacer backup:
```bash
# Linux/Mac:
./backup.sh

# Windows:
backup.bat
```

## 📦 STACK ULTRA-ESTABLE IMPLEMENTADO

### Versiones LTS instaladas:
- Node: 18.18.0
- npm: 9.8.1
- Vue: 3.3.8
- Vue Router: 4.2.5
- Vite: 4.5.0
- Pinia: 2.1.7

### Para reinstalar dependencias estables:
```bash
cd agente_digital_ui
./install-stable-stack.sh
# o en Windows:
install-stable-stack.bat
```

## 🚀 INICIAR APLICACIÓN

### Backend (API Flask):
```bash
cd agente_digital_api
python run.py
```

### Frontend (Vue):
```bash
cd agente_digital_ui
npm run dev
```

## 📝 ARCHIVOS IMPORTANTES CREADOS

1. **`.gitignore`** - Protege archivos sensibles
2. **`backup.bat/sh`** - Script de backup automático
3. **`restore-emergency.bat/sh`** - Restaurar estado anterior
4. **`agente_digital_ui/package.json`** - Versiones estables configuradas
5. **`agente_digital_ui/vite.config.js`** - Configuración ultra-defensiva
6. **`agente_digital_ui/.eslintrc.js`** - Validación de código
7. **`agente_digital_ui/.prettierrc.json`** - Formato de código

## ⚠️ IMPORTANTE

- SIEMPRE hacer backup antes de cambios grandes
- Los scripts de backup están configurados para auto-commit
- El .gitignore protege node_modules, .env y otros archivos sensibles
- Las versiones están fijadas para máxima estabilidad

## 🔧 Comandos útiles NPM

```bash
# Verificar salud de dependencias
npm run health-check

# Reparar dependencias si hay problemas
npm run fix-deps

# Construir para producción
npm run build

# Ejecutar tests
npm run test
```

---
Fecha de implementación: $(date)
Stack ultra-estable configurado exitosamente ✅