// =====================================================
// SCRIPT DE VERIFICACIÓN - SECCIÓN 4 ANCI CORREGIDA
// =====================================================
// Ejecutar en consola después de aplicar las correcciones
// =====================================================

console.log('🔍 VERIFICANDO CORRECCIONES EN SECCIÓN 4...\n');

function verificarSeccion4ANCI() {
    const resultados = {
        componente: false,
        taxonomias: false,
        estilos: false,
        funciones: false,
        total: 0
    };
    
    // 1. Verificar componente
    const componente = document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    if (componente) {
        resultados.componente = true;
        console.log('✅ Componente AcordeonIncidenteANCI encontrado');
    } else {
        console.log('❌ Componente no encontrado');
        return resultados;
    }
    
    const ctx = componente.ctx;
    
    // 2. Verificar taxonomías
    const taxonomiasSeleccionadas = ctx.taxonomiasSeleccionadas?.value || [];
    if (taxonomiasSeleccionadas.length > 0) {
        resultados.taxonomias = true;
        console.log(`✅ ${taxonomiasSeleccionadas.length} taxonomías seleccionadas encontradas`);
        
        // Mostrar detalles
        taxonomiasSeleccionadas.forEach((tax, idx) => {
            console.log(`   ${idx + 1}. ${tax.id}: ${tax.nombre || tax.categoria}`);
            console.log(`      - Justificación: ${tax.justificacion ? '✅' : '❌'}`);
            console.log(`      - Archivos: ${tax.archivos?.length || 0}`);
        });
    } else {
        console.log('⚠️  No hay taxonomías seleccionadas');
    }
    
    // 3. Verificar estilos aplicados
    console.log('\n📊 VERIFICANDO ESTILOS:');
    
    const taxonomiaItems = document.querySelectorAll('.taxonomia-item');
    let itemsConEstilo = 0;
    
    taxonomiaItems.forEach(item => {
        if (item.classList.contains('taxonomia-seleccionada') || item.classList.contains('seleccionada')) {
            itemsConEstilo++;
            const computed = window.getComputedStyle(item);
            console.log(`   ✅ Item con clase aplicada`);
            console.log(`      - Background: ${computed.background.substring(0, 50)}...`);
            console.log(`      - Border-left: ${computed.borderLeft}`);
        }
    });
    
    if (itemsConEstilo > 0) {
        resultados.estilos = true;
        console.log(`\n✅ ${itemsConEstilo} taxonomías con estilos correctos`);
    } else {
        console.log('\n❌ No se encontraron taxonomías con estilos aplicados');
    }
    
    // 4. Verificar funciones
    console.log('\n🔧 VERIFICANDO FUNCIONES:');
    
    if (typeof ctx.taxonomiaSeleccionada === 'function') {
        console.log('✅ Función taxonomiaSeleccionada existe');
        
        // Probar con una taxonomía
        if (taxonomiasSeleccionadas.length > 0) {
            const testId = taxonomiasSeleccionadas[0].id;
            const resultado = ctx.taxonomiaSeleccionada(testId);
            console.log(`   - Test con ID ${testId}: ${resultado ? '✅ Funciona' : '❌ No funciona'}`);
        }
    }
    
    if (typeof ctx.obtenerTaxonomiaSeleccionada === 'function') {
        console.log('✅ Función obtenerTaxonomiaSeleccionada existe');
        resultados.funciones = true;
    }
    
    // 5. Verificar visibilidad de elementos
    console.log('\n👁️  VERIFICANDO VISIBILIDAD:');
    
    const elementosVerificar = {
        'Comentarios': '.taxonomia-seleccionada textarea',
        'Archivos': '.taxonomia-seleccionada .archivo-item',
        'Botones': '.taxonomia-seleccionada button'
    };
    
    for (const [nombre, selector] of Object.entries(elementosVerificar)) {
        const elementos = document.querySelectorAll(selector);
        if (elementos.length > 0) {
            console.log(`✅ ${nombre}: ${elementos.length} elementos visibles`);
        } else {
            console.log(`⚠️  ${nombre}: No se encontraron elementos`);
        }
    }
    
    // Calcular resultado total
    resultados.total = Object.values(resultados).filter(v => v === true).length - 1; // -1 por 'total'
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE VERIFICACIÓN:');
    console.log('='.repeat(50));
    console.log(`Componente: ${resultados.componente ? '✅' : '❌'}`);
    console.log(`Taxonomías: ${resultados.taxonomias ? '✅' : '❌'}`);
    console.log(`Estilos: ${resultados.estilos ? '✅' : '❌'}`);
    console.log(`Funciones: ${resultados.funciones ? '✅' : '❌'}`);
    console.log(`\nPuntuación: ${resultados.total}/4`);
    
    if (resultados.total === 4) {
        console.log('\n🎉 ¡TODAS LAS CORRECCIONES FUNCIONAN CORRECTAMENTE!');
    } else if (resultados.total >= 2) {
        console.log('\n⚠️  Algunas correcciones funcionan, pero hay problemas pendientes');
    } else {
        console.log('\n❌ Las correcciones no se aplicaron correctamente');
        console.log('   Intenta recargar la página y ejecutar el fix universal');
    }
    
    return resultados;
}

// Ejecutar verificación
const resultado = verificarSeccion4ANCI();

// Guardar para debug
window.verificacionSeccion4 = resultado;

console.log('\n💡 Resultado guardado en window.verificacionSeccion4');