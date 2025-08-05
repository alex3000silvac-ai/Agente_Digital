# Guía de Implementación - Sección 4 Taxonomías Dinámicas

## 📋 Resumen de Cambios Implementados

### 1. Frontend - Componente Vue.js Mejorado

**Archivo**: `agente_digital_ui/src/components/AcordeonIncidenteMejorado.vue`

#### Nuevas Funcionalidades:
- ✅ Búsqueda de taxonomías en tiempo real
- ✅ Carga dinámica según tipo de empresa (OIV/PSE/AMBAS)
- ✅ Campos obligatorios por taxonomía:
  - ¿Por qué fue seleccionada? (obligatorio)
  - Descripción acabada del problema (opcional)
- ✅ Sistema de carga de archivos con drag & drop
- ✅ Comentarios individuales por archivo
- ✅ Fecha/hora automática de carga
- ✅ Validación de tipos y tamaños de archivo
- ✅ Eliminación física de archivos

#### Campos del Modelo de Taxonomía:
```javascript
{
  id: 'INC_USO_UNRI_AFBE',
  nombre: 'Ataque de fuerza bruta exitoso',
  area: 'Uso no autorizado',
  efecto: 'Redes e infraestructura',
  categoria: 'Ataque de fuerza bruta',
  subcategoria: 'Exitoso',
  descripcion: 'Descripción completa',
  tipo: 'OIV' // o 'PSE' o 'AMBAS'
}
```

### 2. Backend - API de Taxonomías

**Archivo**: `api_taxonomias_incidentes.py`

#### Endpoints Implementados:
1. `GET /api/taxonomias/obtener/<tipo_empresa>` - Obtiene taxonomías filtradas
2. `POST /api/taxonomias/subir-evidencia` - Sube archivo con validaciones
3. `DELETE /api/taxonomias/eliminar-evidencia/<archivo_id>` - Elimina archivo físicamente
4. `GET /api/taxonomias/ver-evidencia/<archivo_id>` - Descarga/visualiza archivo
5. `PUT /api/taxonomias/actualizar-comentario` - Actualiza comentario de archivo

#### Estructura de Carpetas:
```
/uploads/ciberseguridad/
├── {empresa_id}/
    ├── incidentes/
        ├── {incidente_id}/
            ├── taxonomias/
                ├── {taxonomia_id}/
                    ├── 20250117_143022_a1b2c3d4_documento.pdf
                    ├── 20250117_143045_e5f6g7h8_evidencia.jpg
                    └── ...
```

### 3. Base de Datos - Nuevas Tablas

**Archivo**: `sql_taxonomias_archivos.sql`

#### Tablas Creadas:
- `archivos_evidencias_taxonomias` - Registro de archivos subidos
- `incidentes_taxonomias_seleccionadas` - Taxonomías seleccionadas y justificaciones
- `auditoria_archivos_taxonomias` - Log de todas las acciones sobre archivos

## 🚀 Pasos de Implementación

### 1. Ejecutar Script SQL
```bash
mysql -u root -p nombre_base_datos < sql_taxonomias_archivos.sql
```

### 2. Integrar API en Flask Principal
```python
# En tu app.py principal
from api_taxonomias_incidentes import registrar_rutas_taxonomias

# Después de crear la app Flask
registrar_rutas_taxonomias(app)
```

### 3. Configurar Variables de Entorno
```bash
export UPLOAD_PATH=/ruta/segura/uploads/ciberseguridad
```

### 4. Crear Directorios con Permisos
```bash
mkdir -p /uploads/ciberseguridad
chmod 750 /uploads/ciberseguridad
chown www-data:www-data /uploads/ciberseguridad
```

### 5. Actualizar Endpoint de Taxonomías Existente

En tu endpoint actual `/api/admin/taxonomias/flat`, asegúrate de devolver todos los campos:

```python
@app.route('/api/admin/taxonomias/flat')
def obtener_taxonomias_flat():
    tipo_empresa = request.args.get('tipo_empresa', 'PSE')
    
    # Query actualizada
    query = """
    SELECT 
        Id_Incidente,
        Area,
        Efecto,
        Categoria_del_Incidente,
        Subcategoria_del_Incidente,
        Descripcion,
        AplicaTipoEmpresa
    FROM Taxonomia_incidentes
    WHERE AplicaTipoEmpresa IN (?, 'AMBAS')
    ORDER BY Area, Categoria_del_Incidente
    """
    
    # Ejecutar query y devolver resultados
```

## 🔒 Consideraciones de Seguridad

### 1. Validaciones Implementadas:
- ✅ Tamaño máximo: 10MB por archivo
- ✅ Tipos permitidos: PDF, DOC, XLS, imágenes, TXT, ZIP
- ✅ Nombres de archivo sanitizados
- ✅ Hashes MD5 y SHA256 para integridad
- ✅ Permisos restrictivos (640) en archivos

### 2. Prevención de Archivos Huérfanos:
- Eliminación física inmediata
- Backup antes de eliminar
- Procedimiento de limpieza programado
- Auditoría completa de acciones

### 3. Estructura de Permisos:
```bash
/uploads/
├── ciberseguridad/ (750, www-data:www-data)
    ├── {empresa_id}/ (750)
        ├── incidentes/ (750)
            └── archivos (640)
```

## 📊 Monitoreo y Mantenimiento

### 1. Verificar Archivos Huérfanos:
```sql
CALL sp_limpiar_archivos_huerfanos();
```

### 2. Estadísticas por Empresa:
```sql
CALL sp_estadisticas_archivos_empresa(1);
```

### 3. Auditoría de Acciones:
```sql
SELECT * FROM auditoria_archivos_taxonomias 
WHERE fecha_accion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY fecha_accion DESC;
```

## 🧪 Pruebas Recomendadas

### 1. Prueba de Carga de Archivos:
- Subir archivo válido < 10MB
- Intentar subir archivo > 10MB (debe fallar)
- Intentar subir tipo no permitido (debe fallar)
- Probar drag & drop

### 2. Prueba de Eliminación:
- Eliminar archivo individual
- Verificar eliminación física
- Verificar backup creado

### 3. Prueba de Taxonomías:
- Filtrar por tipo OIV
- Filtrar por tipo PSE
- Buscar taxonomías
- Validar campos obligatorios

## 📝 Notas Adicionales

1. **Backups**: Los archivos eliminados se guardan con extensión `.deleted_YYYYMMDD_HHMMSS`

2. **Logs**: Todos los eventos se registran en el log del sistema y en la tabla de auditoría

3. **Rendimiento**: Para grandes volúmenes, considerar:
   - CDN para servir archivos
   - Almacenamiento en S3 o similar
   - Índices adicionales en BD

4. **Integración CSIRT**: Los campos CSIRT ya están distribuidos en las secciones 1-3 del acordeón

## 🔧 Troubleshooting

### Error: "Taxonomías no se cargan"
- Verificar endpoint `/api/admin/taxonomias/flat`
- Revisar tipo de empresa en empresaInfo
- Verificar permisos de BD

### Error: "No se pueden subir archivos"
- Verificar permisos de directorio
- Revisar límite de upload en nginx/apache
- Verificar espacio en disco

### Error: "Archivos no se eliminan"
- Verificar permisos de escritura
- Revisar logs del sistema
- Verificar que existe el archivo

---

**Fecha de implementación**: 17/01/2025  
**Versión**: 1.0  
**Autor**: Sistema de Gestión de Incidentes Ley 21.663