// =====================================================================
// SOLUCIÓN PARA CARGAR ARCHIVOS Y TAXONOMÍAS
// Ejecuta este código en la consola del navegador
// =====================================================================

console.log('🔧 APLICANDO SOLUCIÓN...');

// Obtener el componente
const comp = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent;

if (!comp) {
    console.error('❌ No se encontró el componente');
} else {
    console.log('✅ Componente encontrado');
    
    // 1. CARGAR ARCHIVOS MANUALMENTE
    console.log('\n📎 Cargando archivos...');
    
    // Hacer petición al backend
    fetch('http://localhost:5000/api/admin/incidentes/5', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Datos recibidos del backend:', data);
        
        // SOLUCIÓN 1: Cargar archivos con las claves numéricas
        if (data.archivos) {
            // El backend envía con claves numéricas, no con "seccion_"
            comp.ctx.archivosSeccion2.value = data.archivos['2'] || [];
            comp.ctx.archivosSeccion3.value = data.archivos['3'] || [];
            comp.ctx.archivosSeccion5.value = data.archivos['5'] || [];
            comp.ctx.archivosSeccion6.value = data.archivos['6'] || [];
            
            console.log('✅ Archivos cargados:');
            console.log('  - Sección 2:', comp.ctx.archivosSeccion2.value.length);
            console.log('  - Sección 3:', comp.ctx.archivosSeccion3.value.length);
            console.log('  - Sección 5:', comp.ctx.archivosSeccion5.value.length);
            console.log('  - Sección 6:', comp.ctx.archivosSeccion6.value.length);
        }
        
        // SOLUCIÓN 2: Cargar taxonomías
        if (data.taxonomias_seleccionadas && data.taxonomias_seleccionadas.length > 0) {
            console.log('\n🏷️ Cargando taxonomías...');
            
            // Asignar directamente las taxonomías
            comp.ctx.taxonomiasSeleccionadas.value = data.taxonomias_seleccionadas;
            
            console.log('✅ Taxonomías cargadas:', comp.ctx.taxonomiasSeleccionadas.value.length);
            
            // Mostrar justificaciones
            comp.ctx.taxonomiasSeleccionadas.value.forEach((tax, idx) => {
                console.log(`  ${idx + 1}. ${tax.id || tax.nombre}`);
                console.log(`     Justificación: ${tax.justificacion ? '✓ ' + tax.justificacion.substring(0, 50) + '...' : '✗ SIN JUSTIFICACIÓN'}`);
            });
        } else {
            console.log('⚠️ No hay taxonomías seleccionadas en los datos');
        }
        
        // SOLUCIÓN 3: Forzar actualización del componente
        console.log('\n🔄 Forzando actualización visual...');
        comp.proxy.$forceUpdate();
        
        // Abrir las secciones para ver los cambios
        if (comp.ctx.seccionesAbiertas) {
            comp.ctx.seccionesAbiertas.value[2] = true; // Abrir sección 2
            comp.ctx.seccionesAbiertas.value[3] = true; // Abrir sección 3
            comp.ctx.seccionesAbiertas.value[4] = true; // Abrir sección 4 (taxonomías)
            comp.ctx.seccionesAbiertas.value[7] = true; // Abrir sección 7 (resumen)
        }
        
        console.log('\n✅ SOLUCIÓN APLICADA');
        console.log('Deberías ver:');
        console.log('- Archivos en las secciones 2, 3, 5 y 6');
        console.log('- Taxonomías con justificaciones en la sección 4');
        console.log('- Resumen de archivos en la sección 7');
        console.log('- Botones de ver/eliminar en cada archivo');
        
        // Guardar datos para inspección
        window.debugData = data;
        window.debugComp = comp;
        
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
}

// VERIFICACIÓN ADICIONAL
setTimeout(() => {
    console.log('\n📊 VERIFICACIÓN FINAL:');
    console.log('Total archivos:', 
        (comp?.ctx?.archivosSeccion2?.value?.length || 0) +
        (comp?.ctx?.archivosSeccion3?.value?.length || 0) +
        (comp?.ctx?.archivosSeccion5?.value?.length || 0) +
        (comp?.ctx?.archivosSeccion6?.value?.length || 0)
    );
    console.log('Total taxonomías:', comp?.ctx?.taxonomiasSeleccionadas?.value?.length || 0);
    
    // Verificar sección 7
    const todosArchivos = comp?.ctx?.todosLosArchivos?.value;
    console.log('Archivos en sección 7:', todosArchivos?.length || 0);
}, 3000);