// =====================================================================
// VERIFICACIÓN DE LA SOLUCIÓN
// Ejecuta este código después de recargar la página con Ctrl+F5
// =====================================================================

console.log('🔍 VERIFICANDO SOLUCIÓN...\n');

// 1. Verificar que los datos lleguen al componente
const comp = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent;

if (!comp) {
    console.error('❌ No se encontró el componente');
    console.log('Intenta recargar la página');
} else {
    console.log('✅ Componente encontrado');
    
    // Verificar props
    console.log('\n📋 PROPS:');
    console.log('- modo:', comp.props.modo);
    console.log('- datosIniciales:', !!comp.props.datosIniciales);
    console.log('- Claves en datosIniciales:', comp.props.datosIniciales ? Object.keys(comp.props.datosIniciales) : 'N/A');
    
    // Verificar datos cargados
    console.log('\n📁 DATOS CARGADOS:');
    console.log('- Campos formulario:', Object.keys(comp.ctx.formData?.value || {}).length);
    console.log('- Archivos S2:', comp.ctx.archivosSeccion2?.value?.length || 0);
    console.log('- Archivos S3:', comp.ctx.archivosSeccion3?.value?.length || 0);
    console.log('- Archivos S5:', comp.ctx.archivosSeccion5?.value?.length || 0);
    console.log('- Archivos S6:', comp.ctx.archivosSeccion6?.value?.length || 0);
    console.log('- Taxonomías:', comp.ctx.taxonomiasSeleccionadas?.value?.length || 0);
    
    // Verificar archivos en detalle
    if (comp.props.datosIniciales?.archivos || comp.props.datosIniciales?.archivos_existentes) {
        console.log('\n📎 ARCHIVOS EN DATOS INICIALES:');
        const archivos = comp.props.datosIniciales.archivos || comp.props.datosIniciales.archivos_existentes;
        Object.entries(archivos).forEach(([key, value]) => {
            console.log(`- ${key}:`, Array.isArray(value) ? `${value.length} archivos` : value);
        });
    }
    
    // Verificar taxonomías en detalle
    if (comp.props.datosIniciales?.taxonomias_seleccionadas) {
        console.log('\n🏷️ TAXONOMÍAS EN DATOS INICIALES:', comp.props.datosIniciales.taxonomias_seleccionadas.length);
        comp.props.datosIniciales.taxonomias_seleccionadas.forEach((tax, idx) => {
            console.log(`${idx + 1}. ${tax.id || tax.nombre} - Justificación: ${tax.justificacion ? '✓' : '✗'}`);
        });
    }
    
    // Mostrar estado actual
    console.log('\n📊 ESTADO ACTUAL:');
    const totalArchivos = (comp.ctx.archivosSeccion2?.value?.length || 0) +
                         (comp.ctx.archivosSeccion3?.value?.length || 0) +
                         (comp.ctx.archivosSeccion5?.value?.length || 0) +
                         (comp.ctx.archivosSeccion6?.value?.length || 0);
    
    console.log('- Total archivos cargados:', totalArchivos);
    console.log('- Total taxonomías:', comp.ctx.taxonomiasSeleccionadas?.value?.length || 0);
    console.log('- Sección 7 (resumen):', comp.ctx.todosLosArchivos?.value?.length || 0);
    
    if (totalArchivos === 0) {
        console.log('\n⚠️ NO SE CARGARON ARCHIVOS');
        console.log('Posibles causas:');
        console.log('1. Los datos iniciales tienen un formato diferente');
        console.log('2. La función cargarIncidenteExistente sobrescribió los datos');
        console.log('3. Los archivos vienen con claves numéricas en lugar de "seccion_X"');
    }
    
    if (comp.ctx.taxonomiasSeleccionadas?.value?.length === 0) {
        console.log('\n⚠️ NO SE CARGARON TAXONOMÍAS');
    }
    
    // Abrir secciones para verificar visualmente
    console.log('\n🔓 Abriendo secciones...');
    if (comp.ctx.seccionesAbiertas?.value) {
        [2, 3, 4, 5, 6, 7].forEach(i => {
            comp.ctx.seccionesAbiertas.value[i] = true;
        });
    }
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('Si no ves datos, ejecuta el script de solución manual.');
}

// Guardar referencia para depuración
window.debugComp = comp;