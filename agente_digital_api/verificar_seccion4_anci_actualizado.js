// =====================================================
// VERIFICACIÓN ACTUALIZADA - SECCIÓN 4 ANCI
// =====================================================
// Para ejecutar después del fix definitivo
// =====================================================

console.log('🔍 VERIFICANDO SECCIÓN 4 ANCI...\n');

function verificarSeccion4() {
    const resultados = {
        componente: false,
        taxonomias: false,
        estilos: false,
        funciones: false,
        elementos: false
    };
    
    // 1. Verificar componente correcto
    const componente = document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (componente) {
        resultados.componente = true;
        console.log('✅ Componente AcordeonIncidenteANCI encontrado');
        
        const ctx = componente.ctx;
        
        // 2. Verificar taxonomías
        const taxonomiasSeleccionadas = ctx.taxonomiasSeleccionadas?.value || [];
        console.log(`\n📊 Taxonomías seleccionadas: ${taxonomiasSeleccionadas.length}`);
        
        if (taxonomiasSeleccionadas.length > 0) {
            resultados.taxonomias = true;
            
            taxonomiasSeleccionadas.forEach((tax, idx) => {
                console.log(`   ${idx + 1}. ${tax.id}: ${tax.nombre || tax.categoria}`);
                console.log(`      - Justificación: ${tax.justificacion ? '✅ Presente' : '❌ Ausente'}`);
                console.log(`      - Archivos: ${tax.archivos?.length || 0}`);
            });
        }
        
        // 3. Verificar estilos aplicados
        console.log('\n🎨 VERIFICANDO ESTILOS:');
        const taxonomiaItems = document.querySelectorAll('.taxonomia-item');
        let itemsConEstilo = 0;
        
        taxonomiaItems.forEach(item => {
            const tieneClaseSeleccionada = item.classList.contains('seleccionada') || 
                                          item.classList.contains('taxonomia-seleccionada');
            
            if (tieneClaseSeleccionada) {
                itemsConEstilo++;
                const computed = window.getComputedStyle(item);
                console.log(`   ✅ Taxonomía con estilo aplicado`);
                console.log(`      - Background: ${computed.background.substring(0, 60)}...`);
                console.log(`      - Border-left: ${computed.borderLeft}`);
            }
        });
        
        if (itemsConEstilo > 0) {
            resultados.estilos = true;
            console.log(`\n✅ ${itemsConEstilo} taxonomías con estilos correctos`);
        }
        
        // 4. Verificar funciones
        console.log('\n🔧 VERIFICANDO FUNCIONES:');
        
        if (typeof ctx.taxonomiaSeleccionada === 'function') {
            console.log('✅ Función taxonomiaSeleccionada existe');
            resultados.funciones = true;
            
            // Probar la función
            if (taxonomiasSeleccionadas.length > 0) {
                const testId = taxonomiasSeleccionadas[0].id;
                const resultado = ctx.taxonomiaSeleccionada(testId);
                console.log(`   - Test con ID ${testId}: ${resultado ? '✅ Retorna true' : '❌ Retorna false'}`);
            }
        }
        
        // 5. Verificar elementos visibles
        console.log('\n👁️ VERIFICANDO ELEMENTOS VISIBLES:');
        
        const elementosVerificar = {
            'Campos de justificación': '.taxonomia-seleccionada textarea',
            'Sección de archivos': '.taxonomia-archivos',
            'Botones de acción': '.btn-editar-taxonomia, .btn-guardar-taxonomia',
            'Contenedores de taxonomía seleccionada': '.taxonomia-seleccionada'
        };
        
        let elementosEncontrados = 0;
        for (const [nombre, selector] of Object.entries(elementosVerificar)) {
            const elementos = document.querySelectorAll(selector);
            if (elementos.length > 0) {
                console.log(`✅ ${nombre}: ${elementos.length} elementos encontrados`);
                elementosEncontrados++;
            } else {
                console.log(`⚠️ ${nombre}: No encontrados`);
            }
        }
        
        if (elementosEncontrados >= 2) {
            resultados.elementos = true;
        }
        
    } else {
        console.log('❌ Componente AcordeonIncidenteANCI no encontrado');
        console.log('   Verifica que estés en la página correcta: /incidente-detalle/{id}');
        console.log('   Y que el incidente sea ANCI (tenga ReporteAnciID)');
    }
    
    // RESUMEN FINAL
    const totalPruebas = Object.keys(resultados).length;
    const pruebasExitosas = Object.values(resultados).filter(v => v === true).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE VERIFICACIÓN:');
    console.log('='.repeat(50));
    console.log(`Componente encontrado: ${resultados.componente ? '✅' : '❌'}`);
    console.log(`Taxonomías cargadas: ${resultados.taxonomias ? '✅' : '❌'}`);
    console.log(`Estilos aplicados: ${resultados.estilos ? '✅' : '❌'}`);
    console.log(`Funciones operativas: ${resultados.funciones ? '✅' : '❌'}`);
    console.log(`Elementos visibles: ${resultados.elementos ? '✅' : '❌'}`);
    console.log(`\nPuntuación: ${pruebasExitosas}/${totalPruebas}`);
    
    if (pruebasExitosas === totalPruebas) {
        console.log('\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!');
        console.log('La Sección 4 funciona correctamente.');
    } else if (pruebasExitosas >= 3) {
        console.log('\n⚠️ La mayoría de verificaciones pasaron.');
        console.log('Algunos elementos podrían necesitar ajustes adicionales.');
    } else {
        console.log('\n❌ Varias verificaciones fallaron.');
        console.log('Ejecuta el fix definitivo: fix_seccion4_anci_definitivo.js');
    }
    
    return resultados;
}

// Ejecutar verificación
const resultado = verificarSeccion4();

// Guardar para análisis
window.verificacionSeccion4 = resultado;

console.log('\n💡 Resultado guardado en window.verificacionSeccion4');
console.log('💡 Para aplicar el fix, ejecuta: fix_seccion4_anci_definitivo.js');