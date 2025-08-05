# 🚀 Pasos para Activar el Sistema Dinámico

## 📋 Lista de Verificación Completa

### ✅ Archivos Creados/Modificados

1. **Backend:**
   - ✅ `app/__init__.py` - Blueprint registrado
   - ✅ `views/incidente_dinamico_views.py` - Endpoints listos
   - ✅ `modules/incidentes/sistema_dinamico.py` - Lógica completa

2. **Frontend:**
   - ✅ `src/services/incidenteService.js` - Servicio creado
   - ✅ `src/components/SeccionDinamica.vue` - Componente dinámico
   - ✅ `src/components/PruebaSistemaDinamico.vue` - Herramienta de diagnóstico

3. **Base de Datos:**
   - ✅ `verificar_sistema_dinamico.sql` - Script de verificación
   - ✅ `actualizar_sistema_dinamico_csirt.sql` - Actualización CSIRT

## 🔄 Pasos de Activación

### Paso 1: Verificar Base de Datos
```bash
# Ejecutar verificación
sqlcmd -S tu_servidor -d tu_base_datos -U tu_usuario -P tu_password -i verificar_sistema_dinamico.sql
```

**Resultado esperado:**
```
✅ Tabla ANCI_SECCIONES_CONFIG existe
✅ Tabla INCIDENTES_SECCIONES_DATOS existe
✅ Sección CSIRT existe
✅ Sistema dinámico está correctamente configurado
```

### Paso 2: Crear Datos si No Existen
Si la verificación muestra que faltan datos:

```bash
# Solo si no existen las tablas
sqlcmd -S tu_servidor -d tu_base_datos -U tu_usuario -P tu_password -i crear_sistema_dinamico.sql

# Agregar sección CSIRT
sqlcmd -S tu_servidor -d tu_base_datos -U tu_usuario -P tu_password -i actualizar_sistema_dinamico_csirt.sql
```

### Paso 3: Reiniciar Servidor Flask
```bash
# En la carpeta agente_digital_api
cd agente_digital_api
python app_production.py
```

**Buscar en los logs:**
```
✅ Módulo de sistema dinámico registrado
```

### Paso 4: Probar Sistema Dinámico

#### Opción A: Herramienta de Diagnóstico
1. Navegar a: `http://localhost:5173/prueba-sistema-dinamico`
2. Seleccionar una empresa (1, 2 o 3)
3. Verificar que aparezcan las secciones

#### Opción B: Probar Directamente en el Formulario
1. Navegar a: `http://localhost:5173/empresa/3/incidentes/declarar`
2. Verificar que funcione el formulario existente
3. *(El formulario actual todavía usa el sistema estático)*

## 🔍 Diagnóstico de Problemas

### Problema: "No se puede conectar al servidor"
**Causa:** Servidor Flask no ejecutándose
**Solución:**
```bash
cd agente_digital_api
python app_production.py
```

### Problema: "Endpoint no encontrado (404)"
**Causa:** Blueprint no registrado
**Verificar:**
1. Que el archivo `app/__init__.py` tenga la modificación
2. Reiniciar el servidor Flask
3. Buscar en logs: "✅ Módulo de sistema dinámico registrado"

### Problema: "Error del servidor (500)"
**Causa:** Tablas de base de datos no existen
**Solución:**
```bash
sqlcmd -S servidor -d base_datos -i verificar_sistema_dinamico.sql
# Si faltan tablas, ejecutar crear_sistema_dinamico.sql
```

### Problema: "No hay secciones para la empresa"
**Causa:** Tabla ANCI_SECCIONES_CONFIG vacía
**Verificar:**
```sql
SELECT COUNT(*) FROM ANCI_SECCIONES_CONFIG WHERE Activo = 1;
-- Debe retornar > 0
```

### Problema: "La sección CSIRT no aparece"
**Causa:** No se ejecutó el script de actualización
**Solución:**
```bash
sqlcmd -S servidor -d base_datos -i actualizar_sistema_dinamico_csirt.sql
```

## 🎯 Resultados Esperados

### Empresa Tipo OIV (ID: 1)
- **Secciones fijas:** 6 (SEC_1 a SEC_6)
- **Sección especial:** 1 (SEC_CSIRT)
- **Taxonomías:** ~15-20 (solo las que aplican a OIV)
- **Total:** ~22-27 secciones

### Empresa Tipo PSE (ID: 2)
- **Secciones fijas:** 6 (SEC_1 a SEC_6)
- **Sección especial:** 1 (SEC_CSIRT)
- **Taxonomías:** ~15-25 (solo las que aplican a PSE)
- **Total:** ~22-32 secciones

### Empresa Tipo AMBAS (ID: 3)
- **Secciones fijas:** 6 (SEC_1 a SEC_6)
- **Sección especial:** 1 (SEC_CSIRT)
- **Taxonomías:** ~35 (todas las taxonomías)
- **Total:** ~42 secciones

## 🚨 Sección CSIRT Específica

La sección CSIRT debe aparecer con:
- **Código:** SEC_CSIRT
- **Icono:** shield-alt (🛡️)
- **Color:** Rojo (#dc3545)
- **Campos principales:**
  - ✅ Checkbox: "Solicitar asistencia del CSIRT Nacional"
  - ✅ Select: Tipo de asistencia (Análisis Forense, Contención, etc.)
  - ✅ Textarea: Descripción detallada
  - ✅ Radio: Nivel de urgencia (Inmediata/Alta/Media)
  - ✅ Text: Contacto de emergencia
  - ✅ Info: Datos de contacto CSIRT Nacional

## 📞 Contacto CSIRT (Debe aparecer en la sección)
- **Teléfono:** +56 2 2486 3850
- **Email:** soc@csirt.gob.cl
- **Web:** https://www.csirt.gob.cl
- **Horario:** Atención 24 horas, 7 días a la semana

## 🔄 Próximos Pasos (Opcional)

Una vez que el sistema dinámico funcione, se puede:

1. **Migrar el formulario actual:** Reemplazar `CuadernoAnalista.vue` para usar `SeccionDinamica.vue`
2. **Sincronizar taxonomías:** Implementar carga automática desde `TAXONOMIA_INCIDENTES`
3. **Agregar nuevas secciones:** Sin modificar código, solo agregando datos

## ✅ Validación Final

El sistema estará funcionando correctamente cuando:

1. ✅ `http://localhost:5173/prueba-sistema-dinamico` muestre las secciones
2. ✅ Empresa tipo AMBAS muestre ~42 secciones
3. ✅ La sección CSIRT aparezca con borde rojo
4. ✅ Los campos JSON se muestren correctamente
5. ✅ No haya errores en la consola del navegador
6. ✅ No haya errores en los logs del servidor Flask

---

**🎉 ¡Una vez completados estos pasos, el sistema dinámico estará completamente funcional!**