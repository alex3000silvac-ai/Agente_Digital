// =====================================================
// DEBUG PARA VERIFICAR TAXONOMÍAS EN EL FRONTEND
// =====================================================
// Ejecutar en la consola del navegador cuando esté en la página de edición ANCI
// =====================================================

console.log('🔍 INICIANDO DEBUG DE TAXONOMÍAS...\n');

setTimeout(() => {
    // Buscar el componente AcordeonIncidenteANCI
    const comp = document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (!comp) {
        console.error('❌ No se encontró el componente AcordeonIncidenteANCI');
        console.log('   Asegúrate de estar en la página de edición de un incidente ANCI');
        return;
    }
    
    console.log('✅ Componente encontrado');
    
    // 1. Verificar datos iniciales
    console.log('\n📊 DATOS INICIALES:');
    console.log('=====================================');
    
    const datosIniciales = comp.props.datosIniciales;
    if (datosIniciales && datosIniciales.taxonomias_seleccionadas) {
        console.log(`Taxonomías seleccionadas: ${datosIniciales.taxonomias_seleccionadas.length}`);
        datosIniciales.taxonomias_seleccionadas.forEach((tax, idx) => {
            console.log(`\n${idx + 1}. Taxonomía recibida del servidor:`);
            console.log(`   ID: "${tax.id}" (tipo: ${typeof tax.id})`);
            console.log(`   Nombre: ${tax.nombre}`);
            console.log(`   Justificación: ${tax.justificacion ? tax.justificacion.substring(0, 50) + '...' : 'Sin justificación'}`);
        });
    } else {
        console.log('❌ No hay taxonomías seleccionadas en datos iniciales');
    }
    
    // 2. Verificar estado actual del componente
    console.log('\n\n📋 ESTADO ACTUAL DEL COMPONENTE:');
    console.log('=====================================');
    
    const ctx = comp.ctx;
    
    // Taxonomías seleccionadas en el componente
    console.log(`\nTaxonomías seleccionadas: ${ctx.taxonomiasSeleccionadas.value.length}`);
    ctx.taxonomiasSeleccionadas.value.forEach((tax, idx) => {
        console.log(`\n${idx + 1}. Taxonomía en componente:`);
        console.log(`   ID: "${tax.id}" (tipo: ${typeof tax.id})`);
        console.log(`   Área: ${tax.area}`);
        console.log(`   Justificación: ${tax.justificacion ? tax.justificacion.substring(0, 50) + '...' : 'Sin justificación'}`);
    });
    
    // Taxonomías disponibles
    console.log(`\n\nTaxonomías disponibles: ${ctx.taxonomiasDisponibles.value.length}`);
    console.log('Primeras 3 taxonomías disponibles:');
    ctx.taxonomiasDisponibles.value.slice(0, 3).forEach((tax, idx) => {
        console.log(`${idx + 1}. ID: "${tax.id}" (tipo: ${typeof tax.id}) - ${tax.nombre || tax.categoria}`);
    });
    
    // 3. Probar la función de comparación
    console.log('\n\n🔄 PRUEBA DE FUNCIÓN taxonomiaSeleccionada:');
    console.log('=====================================');
    
    if (ctx.taxonomiasSeleccionadas.value.length > 0) {
        const primeraTax = ctx.taxonomiasSeleccionadas.value[0];
        console.log(`\nProbando con ID: "${primeraTax.id}"`);
        
        // Probar la función
        const resultado = ctx.taxonomiaSeleccionada(primeraTax.id);
        console.log(`Resultado: ${resultado ? '✅ SELECCIONADA' : '❌ NO SELECCIONADA'}`);
        
        // Probar manualmente
        const resultadoManual = ctx.taxonomiasSeleccionadas.value.some(t => String(t.id) === String(primeraTax.id));
        console.log(`Verificación manual: ${resultadoManual ? '✅ ENCONTRADA' : '❌ NO ENCONTRADA'}`);
    }
    
    // 4. Verificar checkboxes
    console.log('\n\n✅ VERIFICACIÓN DE CHECKBOXES:');
    console.log('=====================================');
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="checkbox-"]');
    console.log(`Total de checkboxes encontrados: ${checkboxes.length}`);
    
    let marcados = 0;
    checkboxes.forEach(cb => {
        if (cb.checked) {
            marcados++;
            console.log(`✓ Checkbox marcado: ${cb.id}`);
        }
    });
    
    console.log(`\nResumen: ${marcados} de ${checkboxes.length} checkboxes marcados`);
    console.log(`Taxonomías seleccionadas: ${ctx.taxonomiasSeleccionadas.value.length}`);
    
    if (marcados !== ctx.taxonomiasSeleccionadas.value.length) {
        console.log('\n⚠️  INCONSISTENCIA DETECTADA!');
        console.log(`   Esperados: ${ctx.taxonomiasSeleccionadas.value.length} checkboxes marcados`);
        console.log(`   Encontrados: ${marcados} checkboxes marcados`);
    } else {
        console.log('\n✅ Checkboxes consistentes con taxonomías seleccionadas');
    }
    
    // 5. Abrir sección 4 para visualizar
    if (ctx.seccionesAbiertas?.value) {
        ctx.seccionesAbiertas.value[4] = true;
        console.log('\n📂 Sección 4 abierta para visualización');
    }
    
    // Guardar referencia para debug manual
    window.debugTaxonomias = {
        componente: comp,
        contexto: ctx,
        seleccionadas: ctx.taxonomiasSeleccionadas.value,
        disponibles: ctx.taxonomiasDisponibles.value.slice(0, 10),
        datosIniciales: datosIniciales
    };
    
    console.log('\n💡 Datos guardados en window.debugTaxonomias para inspección manual');
    console.log('   Puedes usar: window.debugTaxonomias.seleccionadas');
    
}, 2000); // Esperar 2 segundos para asegurar que todo esté cargado