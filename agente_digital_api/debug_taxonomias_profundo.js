// =====================================================
// DEBUG PROFUNDO DE TAXONOMÍAS
// =====================================================

console.log('🔍 DEBUG PROFUNDO DE TAXONOMÍAS\n');

setTimeout(() => {
    const comp = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent || 
                 document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (!comp) {
        console.error('❌ No se encontró el componente');
        return;
    }
    
    console.log('📊 ANÁLISIS DE DATOS:\n');
    
    // 1. Taxonomías disponibles
    console.log('1. TAXONOMÍAS DISPONIBLES:');
    const disponibles = comp.ctx.taxonomiasDisponibles.value;
    console.log(`   Total: ${disponibles.length}`);
    if (disponibles.length > 0) {
        console.log('   Primeras 3:');
        disponibles.slice(0, 3).forEach(tax => {
            console.log(`   - ID: ${tax.id} (tipo: ${typeof tax.id})`);
            console.log(`     TaxonomiaID: ${tax.TaxonomiaID} (tipo: ${typeof tax.TaxonomiaID})`);
            console.log(`     Nombre: ${tax.nombre || tax.Nombre}`);
        });
    }
    
    // 2. Taxonomías seleccionadas
    console.log('\n2. TAXONOMÍAS SELECCIONADAS:');
    const seleccionadas = comp.ctx.taxonomiasSeleccionadas.value;
    console.log(`   Total: ${seleccionadas.length}`);
    if (seleccionadas.length > 0) {
        seleccionadas.forEach((tax, idx) => {
            console.log(`   ${idx + 1}. ID: ${tax.id} (tipo: ${typeof tax.id})`);
            console.log(`      TaxonomiaID: ${tax.TaxonomiaID} (tipo: ${typeof tax.TaxonomiaID})`);
            console.log(`      Nombre: ${tax.nombre || tax.Nombre}`);
            console.log(`      Justificación: ${tax.justificacion ? '✓' : '✗'}`);
        });
    }
    
    // 3. Verificar función taxonomiaSeleccionada
    console.log('\n3. VERIFICACIÓN DE FUNCIÓN taxonomiaSeleccionada:');
    if (seleccionadas.length > 0 && disponibles.length > 0) {
        const primeraTaxSeleccionada = seleccionadas[0];
        const idBuscar = primeraTaxSeleccionada.id || primeraTaxSeleccionada.TaxonomiaID;
        
        console.log(`   Buscando ID: ${idBuscar} (tipo: ${typeof idBuscar})`);
        
        // Probar la función
        const resultado = comp.ctx.taxonomiaSeleccionada(idBuscar);
        console.log(`   Resultado de taxonomiaSeleccionada(${idBuscar}): ${resultado}`);
        
        // Buscar manualmente
        const encontrada = seleccionadas.some(t => t.id === idBuscar);
        console.log(`   Búsqueda manual con ===: ${encontrada}`);
        
        const encontrada2 = seleccionadas.some(t => t.id == idBuscar);
        console.log(`   Búsqueda manual con ==: ${encontrada2}`);
        
        // Verificar todos los IDs en seleccionadas
        console.log('\n   IDs en taxonomías seleccionadas:');
        seleccionadas.forEach(t => {
            console.log(`   - t.id = ${t.id} (${typeof t.id})`);
        });
    }
    
    // 4. Verificar checkboxes en el DOM
    console.log('\n4. CHECKBOXES EN EL DOM:');
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="checkbox-"]');
    console.log(`   Total checkboxes: ${checkboxes.length}`);
    
    checkboxes.forEach((cb, idx) => {
        if (idx < 5) { // Solo los primeros 5
            const taxId = cb.id.replace('checkbox-', '');
            console.log(`   - ${cb.id}: checked=${cb.checked}, taxId=${taxId}`);
        }
    });
    
    // 5. Probar asignación directa
    console.log('\n5. PRUEBA DE ASIGNACIÓN DIRECTA:');
    if (seleccionadas.length > 0 && checkboxes.length > 0) {
        const primeraTax = seleccionadas[0];
        const idParaBuscar = primeraTax.id || primeraTax.TaxonomiaID;
        const checkboxParaMarcar = document.querySelector(`#checkbox-${idParaBuscar}`);
        
        if (checkboxParaMarcar) {
            console.log(`   Checkbox encontrado para ID ${idParaBuscar}`);
            console.log(`   Estado actual: ${checkboxParaMarcar.checked}`);
            
            // Intentar marcarlo directamente
            checkboxParaMarcar.checked = true;
            console.log(`   Estado después de marcar: ${checkboxParaMarcar.checked}`);
        } else {
            console.log(`   ❌ No se encontró checkbox para ID ${idParaBuscar}`);
        }
    }
    
    // 6. Datos iniciales
    console.log('\n6. DATOS INICIALES:');
    const datosIniciales = comp.props.datosIniciales;
    if (datosIniciales?.taxonomias_seleccionadas) {
        console.log(`   Taxonomías en datos iniciales: ${datosIniciales.taxonomias_seleccionadas.length}`);
        datosIniciales.taxonomias_seleccionadas.forEach((tax, idx) => {
            console.log(`   ${idx + 1}. ID en datos: ${tax.id || tax.TaxonomiaID} (tipo: ${typeof (tax.id || tax.TaxonomiaID)})`);
        });
    }
    
    // Guardar para inspección
    window.debugTaxonomiasProfundo = {
        comp,
        disponibles,
        seleccionadas,
        datosIniciales: datosIniciales?.taxonomias_seleccionadas,
        checkboxes: Array.from(checkboxes).map(cb => ({
            id: cb.id,
            checked: cb.checked
        }))
    };
    
    console.log('\n💡 Guardado en window.debugTaxonomiasProfundo');
    
}, 1500);