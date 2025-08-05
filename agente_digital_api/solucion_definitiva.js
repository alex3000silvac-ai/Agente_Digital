// =====================================================================
// SOLUCIÓN DEFINITIVA - NO MODIFICA CÓDIGO EXISTENTE
// Intercepta la función cargarIncidenteExistente para usar datos ya cargados
// =====================================================================

console.log('🚀 APLICANDO SOLUCIÓN DEFINITIVA...\n');

// Esperar a que el componente esté completamente cargado
setTimeout(() => {
    // 1. Obtener referencias a los componentes
    const vistaDetalle = Array.from(document.querySelectorAll('*')).find(el => 
        el.__vue__ && el.__vue__.$options.name === 'VistaDetalleIncidente'
    )?.__vue__;
    
    const acordeon = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent;
    
    if (!vistaDetalle || !acordeon) {
        console.error('❌ No se encontraron los componentes necesarios');
        return;
    }
    
    console.log('✅ Componentes encontrados');
    
    // 2. Obtener los datos del componente padre
    const incidenteData = vistaDetalle.incidente || vistaDetalle.$data?.incidente;
    const datosParaEdicion = vistaDetalle.datosParaEdicion || vistaDetalle.$data?.datosParaEdicion;
    
    if (!incidenteData) {
        console.error('❌ No hay datos de incidente disponibles');
        return;
    }
    
    console.log('📋 Datos disponibles:', {
        incidenteId: incidenteData.IncidenteID,
        tieneArchivos: !!incidenteData.archivos,
        tieneTaxonomias: !!incidenteData.taxonomias_seleccionadas,
        archivosCount: incidenteData.archivos ? Object.keys(incidenteData.archivos).length : 0
    });
    
    // 3. Interceptar y reemplazar la función cargarIncidenteExistente
    const originalCargar = acordeon.ctx.cargarIncidenteExistente;
    
    acordeon.ctx.cargarIncidenteExistente = async function() {
        console.log('🔄 Interceptando cargarIncidenteExistente...');
        
        // En lugar de hacer petición al servidor, usar los datos ya disponibles
        if (datosParaEdicion) {
            console.log('📥 Procesando datos desde el componente padre...');
            
            // Cargar campos del formulario
            Object.entries(datosParaEdicion).forEach(([key, value]) => {
                if (key.match(/^\d+\.\d+/) && acordeon.ctx.formData.value.hasOwnProperty(key)) {
                    acordeon.ctx.formData.value[key] = value;
                }
            });
            
            // Cargar archivos con claves numéricas
            if (incidenteData.archivos) {
                acordeon.ctx.archivosSeccion2.value = incidenteData.archivos['2'] || [];
                acordeon.ctx.archivosSeccion3.value = incidenteData.archivos['3'] || [];
                acordeon.ctx.archivosSeccion5.value = incidenteData.archivos['5'] || [];
                acordeon.ctx.archivosSeccion6.value = incidenteData.archivos['6'] || [];
                
                console.log('✅ Archivos cargados:', {
                    seccion2: acordeon.ctx.archivosSeccion2.value.length,
                    seccion3: acordeon.ctx.archivosSeccion3.value.length,
                    seccion5: acordeon.ctx.archivosSeccion5.value.length,
                    seccion6: acordeon.ctx.archivosSeccion6.value.length
                });
            }
            
            // Cargar taxonomías
            if (incidenteData.taxonomias_seleccionadas && incidenteData.taxonomias_seleccionadas.length > 0) {
                acordeon.ctx.taxonomiasSeleccionadas.value = incidenteData.taxonomias_seleccionadas.map(tax => ({
                    id: tax.id || tax.TaxonomiaID,
                    nombre: tax.nombre || tax.Nombre,
                    seleccionada: true,
                    justificacion: tax.justificacion || tax.Justificacion || ''
                }));
                
                console.log('✅ Taxonomías cargadas:', acordeon.ctx.taxonomiasSeleccionadas.value.length);
            }
            
            // Marcar como cargado
            acordeon.ctx.datosInicialesCargados.value = true;
            
            console.log('✅ Datos cargados exitosamente');
        }
    };
    
    // 4. Ejecutar la carga inmediatamente
    acordeon.ctx.cargarIncidenteExistente();
    
    // 5. Abrir secciones relevantes para verificación visual
    setTimeout(() => {
        [2, 3, 4, 5, 6, 7].forEach(seccion => {
            if (acordeon.ctx.seccionesAbiertas?.value) {
                acordeon.ctx.seccionesAbiertas.value[seccion] = true;
            }
        });
        
        // Forzar actualización visual
        acordeon.proxy.$forceUpdate();
        
        console.log('\n✅ SOLUCIÓN APLICADA EXITOSAMENTE');
        console.log('Verifica que ahora se muestran:');
        console.log('- ✓ Archivos en cada sección con botones de gestión');
        console.log('- ✓ Taxonomías seleccionadas con justificaciones en sección 4');
        console.log('- ✓ Resumen de archivos en sección 7');
        console.log('- ✓ Todos los campos del formulario con datos');
        
        // Guardar referencias para debug
        window.debugVistaDetalle = vistaDetalle;
        window.debugAcordeon = acordeon;
        window.debugIncidente = incidenteData;
    }, 500);
    
}, 1000);

console.log('⏳ Esperando a que los componentes se carguen...');