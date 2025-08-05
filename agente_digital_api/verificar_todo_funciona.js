// =====================================================================
// VERIFICACIÓN COMPLETA DE LA SOLUCIÓN
// Ejecutar después de aplicar solucion_definitiva.js
// =====================================================================

console.log('🔍 VERIFICANDO QUE TODO FUNCIONE...\n');

// Función auxiliar para verificar elementos
function verificarElemento(selector, descripcion) {
    const elemento = document.querySelector(selector);
    if (elemento) {
        console.log(`✅ ${descripcion}: ENCONTRADO`);
        return true;
    } else {
        console.log(`❌ ${descripcion}: NO ENCONTRADO`);
        return false;
    }
}

// Obtener componente
const comp = window.debugAcordeon || document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent;

if (!comp) {
    console.error('❌ No se encontró el componente. Ejecuta primero solucion_definitiva.js');
} else {
    console.log('✅ Componente encontrado\n');
    
    // 1. VERIFICAR ARCHIVOS
    console.log('📎 VERIFICACIÓN DE ARCHIVOS:');
    const archivosS2 = comp.ctx.archivosSeccion2?.value?.length || 0;
    const archivosS3 = comp.ctx.archivosSeccion3?.value?.length || 0;
    const archivosS5 = comp.ctx.archivosSeccion5?.value?.length || 0;
    const archivosS6 = comp.ctx.archivosSeccion6?.value?.length || 0;
    const totalArchivos = archivosS2 + archivosS3 + archivosS5 + archivosS6;
    
    console.log(`  Sección 2: ${archivosS2} archivos`);
    console.log(`  Sección 3: ${archivosS3} archivos`);
    console.log(`  Sección 5: ${archivosS5} archivos`);
    console.log(`  Sección 6: ${archivosS6} archivos`);
    console.log(`  TOTAL: ${totalArchivos} archivos`);
    
    if (totalArchivos > 0) {
        console.log('  ✅ Archivos cargados correctamente');
        
        // Verificar botones de gestión
        setTimeout(() => {
            const botonesVer = document.querySelectorAll('.btn-ver-archivo').length;
            const botonesEliminar = document.querySelectorAll('.btn-eliminar-archivo').length;
            console.log(`\n  📌 Botones de gestión:`);
            console.log(`    - Botones Ver: ${botonesVer}`);
            console.log(`    - Botones Eliminar: ${botonesEliminar}`);
            
            if (botonesVer > 0 && botonesEliminar > 0) {
                console.log('    ✅ Botones de gestión presentes');
            } else {
                console.log('    ⚠️ Faltan botones de gestión');
            }
        }, 500);
    } else {
        console.log('  ❌ NO SE CARGARON ARCHIVOS');
    }
    
    // 2. VERIFICAR TAXONOMÍAS
    console.log('\n🏷️ VERIFICACIÓN DE TAXONOMÍAS:');
    const taxonomias = comp.ctx.taxonomiasSeleccionadas?.value || [];
    console.log(`  Total taxonomías: ${taxonomias.length}`);
    
    if (taxonomias.length > 0) {
        console.log('  ✅ Taxonomías cargadas');
        
        // Verificar justificaciones
        let conJustificacion = 0;
        taxonomias.forEach((tax, idx) => {
            if (tax.justificacion && tax.justificacion.trim()) {
                conJustificacion++;
            }
        });
        console.log(`  📝 Taxonomías con justificación: ${conJustificacion}/${taxonomias.length}`);
        
        // Verificar checkboxes marcados
        setTimeout(() => {
            const checkboxesMarcados = document.querySelectorAll('.taxonomia-checkbox:checked').length;
            console.log(`  ☑️ Checkboxes marcados: ${checkboxesMarcados}`);
            
            if (checkboxesMarcados === taxonomias.length) {
                console.log('  ✅ Todos los checkboxes están marcados correctamente');
            } else {
                console.log(`  ⚠️ Discrepancia en checkboxes (esperados: ${taxonomias.length}, marcados: ${checkboxesMarcados})`);
            }
        }, 500);
    } else {
        console.log('  ❌ NO SE CARGARON TAXONOMÍAS');
    }
    
    // 3. VERIFICAR SECCIÓN 7 (RESUMEN)
    console.log('\n📊 VERIFICACIÓN DE SECCIÓN 7:');
    const archivosResumen = comp.ctx.todosLosArchivos?.value?.length || 0;
    console.log(`  Archivos en resumen: ${archivosResumen}`);
    
    if (archivosResumen === totalArchivos && archivosResumen > 0) {
        console.log('  ✅ Sección 7 muestra todos los archivos correctamente');
    } else if (archivosResumen > 0) {
        console.log(`  ⚠️ Discrepancia en cantidad (total: ${totalArchivos}, resumen: ${archivosResumen})`);
    } else {
        console.log('  ❌ Sección 7 no muestra archivos');
    }
    
    // 4. VERIFICAR CAMPOS DEL FORMULARIO
    console.log('\n📝 VERIFICACIÓN DE CAMPOS:');
    const formData = comp.ctx.formData?.value || {};
    let camposLlenos = 0;
    let camposVacios = 0;
    
    Object.entries(formData).forEach(([key, value]) => {
        if (value && value !== '') {
            camposLlenos++;
        } else {
            camposVacios++;
        }
    });
    
    console.log(`  Campos llenos: ${camposLlenos}`);
    console.log(`  Campos vacíos: ${camposVacios}`);
    
    if (camposLlenos > 10) {
        console.log('  ✅ Formulario cargado con datos');
    } else {
        console.log('  ⚠️ Pocos campos llenos en el formulario');
    }
    
    // RESUMEN FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE VERIFICACIÓN:');
    console.log('='.repeat(60));
    
    const todoOk = totalArchivos > 0 && taxonomias.length > 0 && archivosResumen > 0 && camposLlenos > 10;
    
    if (todoOk) {
        console.log('✅ TODOS LOS COMPONENTES FUNCIONAN CORRECTAMENTE');
        console.log('\nLa solución ha sido aplicada exitosamente.');
    } else {
        console.log('⚠️ HAY COMPONENTES QUE NO FUNCIONAN CORRECTAMENTE');
        console.log('\nProblemas detectados:');
        if (totalArchivos === 0) console.log('  - No se muestran archivos');
        if (taxonomias.length === 0) console.log('  - No se muestran taxonomías');
        if (archivosResumen === 0) console.log('  - Sección 7 vacía');
        if (camposLlenos <= 10) console.log('  - Formulario sin datos');
        console.log('\nIntenta recargar la página y ejecutar solucion_definitiva.js nuevamente.');
    }
    
    console.log('\n💡 Para inspeccionar manualmente:');
    console.log('  window.debugAcordeon - Componente acordeón');
    console.log('  window.debugIncidente - Datos del incidente');
    console.log('  window.debugVistaDetalle - Componente vista detalle');
}