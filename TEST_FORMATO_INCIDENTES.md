# Prueba del Formato de Obligaciones en Incidentes

## Para verificar que el formato se aplique correctamente:

### 1. Limpiar caché del navegador
- Presiona F12 para abrir las herramientas de desarrollo
- Click derecho en el botón de recargar
- Selecciona "Vaciar caché y volver a cargar" (Empty Cache and Hard Reload)

### 2. Verificar en la consola del navegador
Ejecuta estos comandos para verificar que los estilos estén cargados:
```javascript
// Verificar que existan las clases CSS
document.querySelector('.content-section')
document.querySelector('.evidencias-box')
document.querySelector('.section-title')
```

### 3. Pasos para probar el formato:
1. Navegar a la sección "4. Clasificación de Taxonomías"
2. Seleccionar una taxonomía del dropdown
3. Deberías ver:
   - **Sección 1**: "Detalle de la Taxonomía" con los 4 campos
   - **Sección 2**: "Observaciones" con 2 campos de texto
   - **Sección 3**: "Evidencias de Respaldo" con la caja de archivos

### 4. Si no se ve el formato:
Posibles causas:
- El navegador está usando una versión en caché
- Hay un error de JavaScript que impide el renderizado
- El servidor de desarrollo no está recargando los cambios

### 5. Solución rápida:
1. Detener el servidor de desarrollo (Ctrl+C)
2. Ejecutar: `npm run dev` nuevamente
3. Abrir en una ventana de incógnito/privada

### Estructura esperada:
```
┌─────────────────────────────────────────┐
│ Detalle de la Taxonomía                 │
├─────────────────────────────────────────┤
│ ÁREA: ...                               │
│ EFECTO: ...                             │
│ CATEGORÍA: ...                          │
│ SUBCATEGORÍA: ...                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Observaciones                           │
├─────────────────────────────────────────┤
│ [Observaciones Técnicas] [Obs. Impacto] │
│ [        TextArea      ] [  TextArea  ] │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📁 Evidencias de Respaldo          ✓ 3  │
├─────────────────────────────────────────┤
│ 📄 archivo1.pdf                         │
│    Descripción del archivo              │
│ 📄 archivo2.docx                        │
│    Otra descripción                     │
└─────────────────────────────────────────┘
```