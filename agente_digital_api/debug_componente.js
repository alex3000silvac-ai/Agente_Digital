// =============================================================================
// SCRIPT DE DEPURACIÓN PARA EJECUTAR EN LA CONSOLA DEL NAVEGADOR
// =============================================================================
// 1. Abre la página del incidente en el navegador
// 2. Abre la consola (F12)
// 3. Copia y pega todo este código

console.log('🔍 INICIANDO DEPURACIÓN DEL COMPONENTE');

// Obtener el componente Vue
const comp = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent;

if (!comp) {
    console.error('❌ No se encontró el componente AcordeonIncidenteMejorado');
    console.log('Intenta con: const comp = document.querySelector("#app").__vue__');
} else {
    console.log('✅ Componente encontrado');
    
    // Verificar props
    console.log('\n📋 PROPS DEL COMPONENTE:');
    console.log('- modo:', comp.props.modo);
    console.log('- incidenteId:', comp.props.incidenteId);
    console.log('- empresaId:', comp.props.empresaId);
    
    // Verificar datos cargados
    console.log('\n📁 ARCHIVOS CARGADOS:');
    console.log('- Sección 2:', comp.ctx.archivosSeccion2?.value?.length || 0, 'archivos');
    console.log('- Sección 3:', comp.ctx.archivosSeccion3?.value?.length || 0, 'archivos');
    console.log('- Sección 5:', comp.ctx.archivosSeccion5?.value?.length || 0, 'archivos');
    console.log('- Sección 6:', comp.ctx.archivosSeccion6?.value?.length || 0, 'archivos');
    
    // Mostrar detalles de archivos sección 2
    if (comp.ctx.archivosSeccion2?.value?.length > 0) {
        console.log('\nArchivos en Sección 2:');
        comp.ctx.archivosSeccion2.value.forEach((archivo, idx) => {
            console.log(`  ${idx + 1}. ${archivo.nombre} (${archivo.id})`);
        });
    }
    
    // Verificar taxonomías
    console.log('\n🏷️ TAXONOMÍAS SELECCIONADAS:', comp.ctx.taxonomiasSeleccionadas?.value?.length || 0);
    if (comp.ctx.taxonomiasSeleccionadas?.value?.length > 0) {
        comp.ctx.taxonomiasSeleccionadas.value.forEach((tax, idx) => {
            console.log(`\n  ${idx + 1}. ${tax.nombre || tax.id}`);
            console.log(`     - ID: ${tax.id}`);
            console.log(`     - Justificación: ${tax.justificacion ? tax.justificacion.substring(0, 50) + '...' : 'SIN JUSTIFICACIÓN'}`);
            console.log(`     - Archivos: ${tax.archivos?.length || 0}`);
        });
    }
    
    // Verificar FormData
    console.log('\n📝 DATOS DEL FORMULARIO:');
    const formData = comp.ctx.formData?.value || {};
    console.log('- Título (1.2):', formData['1.2']);
    console.log('- Descripción (2.1):', formData['2.1']?.substring(0, 50) + '...');
    console.log('- Total campos:', Object.keys(formData).length);
    
    // Intentar recargar datos
    console.log('\n🔄 INTENTANDO RECARGAR DATOS...');
    
    if (typeof comp.ctx.cargarIncidenteExistente === 'function') {
        console.log('Ejecutando cargarIncidenteExistente()...');
        comp.ctx.cargarIncidenteExistente();
        
        // Verificar después de 2 segundos
        setTimeout(() => {
            console.log('\n📊 VERIFICACIÓN DESPUÉS DE RECARGA:');
            console.log('- Archivos S2:', comp.ctx.archivosSeccion2?.value?.length || 0);
            console.log('- Archivos S3:', comp.ctx.archivosSeccion3?.value?.length || 0);
            console.log('- Taxonomías:', comp.ctx.taxonomiasSeleccionadas?.value?.length || 0);
        }, 2000);
    } else {
        console.error('❌ No se encontró la función cargarIncidenteExistente');
    }
}

// Verificar llamadas al backend
console.log('\n🌐 PROBANDO LLAMADA DIRECTA AL BACKEND...');

fetch('http://localhost:5000/api/admin/incidentes/5', {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
})
.then(response => {
    console.log('Status:', response.status);
    if (response.status === 401) {
        console.error('❌ Error 401: Token inválido o expirado');
        console.log('Intenta hacer login nuevamente');
    }
    return response.json();
})
.then(data => {
    console.log('\n✅ RESPUESTA DEL BACKEND:');
    console.log('- IncidenteID:', data.IncidenteID);
    console.log('- Título:', data.Titulo);
    
    if (data.archivos) {
        console.log('\n📎 Archivos en respuesta:');
        Object.entries(data.archivos).forEach(([seccion, archivos]) => {
            if (Array.isArray(archivos) && archivos.length > 0) {
                console.log(`  ${seccion}: ${archivos.length} archivos`);
            }
        });
    } else {
        console.error('❌ No hay archivos en la respuesta');
    }
    
    if (data.taxonomias_seleccionadas) {
        console.log('\n🏷️ Taxonomías en respuesta:', data.taxonomias_seleccionadas.length);
        data.taxonomias_seleccionadas.forEach(t => {
            console.log(`  - ${t.id}: ${t.justificacion ? '✓ Con justificación' : '✗ SIN JUSTIFICACIÓN'}`);
        });
    } else {
        console.error('❌ No hay taxonomías en la respuesta');
    }
    
    // Guardar para inspección
    window.debugBackendData = data;
    console.log('\n💾 Datos guardados en window.debugBackendData');
})
.catch(error => {
    console.error('❌ Error llamando al backend:', error);
});

console.log('\n🎯 FIN DE LA DEPURACIÓN');
console.log('Si no ves archivos o taxonomías, revisa los mensajes de error arriba.');