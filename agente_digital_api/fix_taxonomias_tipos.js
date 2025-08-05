// =====================================================
// FIX PARA TIPOS DE DATOS EN TAXONOMÍAS
// =====================================================
// Problema: Los IDs pueden venir como string o número
// =====================================================

console.log('🔧 APLICANDO FIX DE TIPOS DE DATOS PARA TAXONOMÍAS...\n');

setTimeout(() => {
    const comp = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent || 
                 document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (!comp) {
        console.error('❌ No se encontró el componente');
        return;
    }
    
    console.log('✅ Componente encontrado');
    
    // Analizar el problema
    console.log('\n📊 ANÁLISIS DEL PROBLEMA:');
    
    const seleccionadas = comp.ctx.taxonomiasSeleccionadas.value;
    const disponibles = comp.ctx.taxonomiasDisponibles.value;
    
    if (seleccionadas.length > 0) {
        console.log('Tipos de ID en taxonomías seleccionadas:');
        seleccionadas.forEach((tax, idx) => {
            console.log(`${idx + 1}. ID: ${tax.id} (tipo: ${typeof tax.id})`);
        });
    }
    
    if (disponibles.length > 0) {
        console.log('\nTipos de ID en taxonomías disponibles (primeras 3):');
        disponibles.slice(0, 3).forEach((tax, idx) => {
            console.log(`${idx + 1}. ID: ${tax.id} (tipo: ${typeof tax.id})`);
        });
    }
    
    // APLICAR FIX: Normalizar IDs a string
    console.log('\n🔄 Aplicando fix de normalización...');
    
    // 1. Normalizar taxonomías seleccionadas
    comp.ctx.taxonomiasSeleccionadas.value = comp.ctx.taxonomiasSeleccionadas.value.map(tax => ({
        ...tax,
        id: String(tax.id || tax.TaxonomiaID)
    }));
    
    // 2. Normalizar taxonomías disponibles
    comp.ctx.taxonomiasDisponibles.value = comp.ctx.taxonomiasDisponibles.value.map(tax => ({
        ...tax,
        id: String(tax.id || tax.TaxonomiaID)
    }));
    
    // 3. Reemplazar la función taxonomiaSeleccionada para normalizar la comparación
    const originalFunc = comp.ctx.taxonomiaSeleccionada;
    comp.ctx.taxonomiaSeleccionada = function(taxId) {
        const idStr = String(taxId);
        const result = comp.ctx.taxonomiasSeleccionadas.value.some(t => String(t.id) === idStr);
        console.log(`taxonomiaSeleccionada(${taxId}) -> ${idStr} = ${result}`);
        return result;
    };
    
    console.log('✅ IDs normalizados a string');
    
    // 4. Forzar re-renderizado
    comp.proxy.$forceUpdate();
    
    // 5. Verificar checkboxes después del fix
    setTimeout(() => {
        console.log('\n📋 VERIFICACIÓN POST-FIX:');
        
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="checkbox-"]');
        let marcados = 0;
        
        checkboxes.forEach(cb => {
            if (cb.checked) marcados++;
        });
        
        console.log(`Total checkboxes: ${checkboxes.length}`);
        console.log(`Checkboxes marcados: ${marcados}`);
        console.log(`Taxonomías seleccionadas: ${comp.ctx.taxonomiasSeleccionadas.value.length}`);
        
        if (marcados === 0 && comp.ctx.taxonomiasSeleccionadas.value.length > 0) {
            console.log('\n⚠️ Los checkboxes aún no se marcan. Aplicando fix adicional...');
            
            // Marcar manualmente los checkboxes
            comp.ctx.taxonomiasSeleccionadas.value.forEach(tax => {
                const checkbox = document.querySelector(`#checkbox-${tax.id}`);
                if (checkbox) {
                    checkbox.checked = true;
                    console.log(`✓ Marcado checkbox para taxonomía ${tax.id}`);
                }
            });
        }
        
        // Abrir sección 4
        if (comp.ctx.seccionesAbiertas?.value) {
            comp.ctx.seccionesAbiertas.value[4] = true;
        }
        
    }, 500);
    
    // Guardar para debug
    window.debugTaxonomiasFix = {
        comp,
        seleccionadas: comp.ctx.taxonomiasSeleccionadas.value,
        disponibles: comp.ctx.taxonomiasDisponibles.value.slice(0, 5),
        taxonomiaSeleccionada: comp.ctx.taxonomiaSeleccionada
    };
    
    console.log('\n💡 Guardado en window.debugTaxonomiasFix');
    
}, 1000);