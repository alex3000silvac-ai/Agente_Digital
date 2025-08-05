// =====================================================
// VERIFICACIÓN VISTA DETALLE INCIDENTE ANCI
// =====================================================
// Verifica el estado de los 3 componentes principales
// =====================================================

console.log('🔍 VERIFICANDO VISTA DETALLE ANCI...\n');

function verificarVistaDetalleANCI() {
    const resultados = {
        componente: false,
        expediente: false,
        exportacion: false,
        reloj: false,
        datos: {}
    };
    
    // 1. Verificar componente principal
    const vistaDetalle = document.querySelector('.vista-detalle-anci')?.__vueParentComponent;
    
    if (!vistaDetalle) {
        console.error('❌ No se encontró el componente VistaDetalleIncidenteANCI');
        return resultados;
    }
    
    resultados.componente = true;
    console.log('✅ Componente principal encontrado');
    
    const ctx = vistaDetalle.ctx;
    const incidente = ctx.incidente?.value;
    
    // 2. Verificar datos del expediente
    console.log('\n📄 VERIFICANDO EXPEDIENTE SEMILLA:');
    if (incidente && incidente.IncidenteID) {
        resultados.expediente = true;
        resultados.datos = {
            id: incidente.IncidenteID,
            titulo: incidente.Titulo,
            tipoEmpresa: incidente.TipoEmpresa,
            reporteAnciId: incidente.ReporteAnciID,
            fechaTransformacion: incidente.FechaTransformacionANCI,
            totalEvidencias: incidente.TotalEvidencias,
            completitud: incidente.Completitud
        };
        
        console.log(`   ✅ ID: ${incidente.IncidenteID}`);
        console.log(`   ✅ Título: ${incidente.Titulo}`);
        console.log(`   ✅ Tipo: ${incidente.TipoEmpresa}`);
        console.log(`   ✅ ANCI ID: ${incidente.ReporteAnciID}`);
        console.log(`   ✅ Evidencias: ${incidente.TotalEvidencias || 0}`);
        console.log(`   ✅ Completitud: ${incidente.Completitud || 0}%`);
    } else {
        console.log('   ❌ No se encontraron datos del incidente');
    }
    
    // 3. Verificar funciones de exportación
    console.log('\n📊 VERIFICANDO EXPORTACIÓN:');
    const funcionesExportacion = {
        'PDF': ctx.exportarPDF,
        'Word': ctx.exportarWord,
        'Texto': ctx.exportarTexto
    };
    
    let funcionesOk = 0;
    for (const [formato, funcion] of Object.entries(funcionesExportacion)) {
        if (typeof funcion === 'function') {
            console.log(`   ✅ Exportar ${formato}: Función disponible`);
            funcionesOk++;
        } else {
            console.log(`   ❌ Exportar ${formato}: No disponible`);
        }
    }
    
    if (funcionesOk >= 2) {
        resultados.exportacion = true;
    }
    
    // 4. Verificar reloj de cuenta regresiva
    console.log('\n⏰ VERIFICANDO RELOJ:');
    
    // Verificar reloj flotante
    const relojFlotante = document.getElementById('reloj-cuenta-regresiva-anci');
    if (relojFlotante && relojFlotante.style.display !== 'none') {
        console.log('   ✅ Reloj flotante: Visible');
        console.log(`      - Contenido: ${relojFlotante.textContent.trim()}`);
    } else {
        console.log('   ⚠️  Reloj flotante: No visible');
    }
    
    // Verificar tiempo en tarjeta
    const tiempoGrande = document.querySelector('.tiempo-grande');
    if (tiempoGrande) {
        console.log('   ✅ Tiempo en tarjeta: Visible');
        console.log(`      - Valor: ${tiempoGrande.textContent}`);
    } else {
        console.log('   ⚠️  Tiempo en tarjeta: No encontrado');
    }
    
    // Verificar plazos
    const plazos = ctx.plazos?.value;
    if (plazos) {
        console.log('   ✅ Datos de plazos disponibles:');
        console.log(`      - Preliminar: ${plazos.preliminar.tiempoRestante} ${plazos.preliminar.completado ? '(Completado)' : ''}`);
        console.log(`      - Completo: ${plazos.completo.tiempoRestante} ${plazos.completo.completado ? '(Completado)' : ''}`);
        console.log(`      - Final: ${plazos.final.tiempoRestante} ${plazos.final.completado ? '(Completado)' : ''}`);
        resultados.reloj = true;
    }
    
    // 5. Verificar tarjetas
    console.log('\n🎴 VERIFICANDO TARJETAS:');
    const tarjetas = {
        'Expediente Semilla': '.tarjeta-semilla',
        'Informe ANCI': '.tarjeta-anci',
        'Cuenta Regresiva': '.tarjeta-cuenta-regresiva'
    };
    
    for (const [nombre, selector] of Object.entries(tarjetas)) {
        const tarjeta = document.querySelector(selector);
        if (tarjeta) {
            console.log(`   ✅ ${nombre}: Presente`);
            
            // Verificar si es clickeable
            const onClick = tarjeta.onclick || tarjeta.__vueParentComponent?.ctx?.onClick;
            if (onClick || tarjeta.style.cursor === 'pointer') {
                console.log(`      - Clickeable: ✅`);
            }
        } else {
            console.log(`   ❌ ${nombre}: No encontrada`);
        }
    }
    
    // RESUMEN FINAL
    const totalPruebas = 4;
    const pruebasExitosas = [
        resultados.componente,
        resultados.expediente,
        resultados.exportacion,
        resultados.reloj
    ].filter(v => v === true).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE VERIFICACIÓN:');
    console.log('='.repeat(50));
    console.log(`Componente cargado: ${resultados.componente ? '✅' : '❌'}`);
    console.log(`Datos del expediente: ${resultados.expediente ? '✅' : '❌'}`);
    console.log(`Funciones exportación: ${resultados.exportacion ? '✅' : '❌'}`);
    console.log(`Reloj cuenta regresiva: ${resultados.reloj ? '✅' : '❌'}`);
    console.log(`\nPuntuación: ${pruebasExitosas}/${totalPruebas}`);
    
    if (pruebasExitosas === totalPruebas) {
        console.log('\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!');
    } else if (pruebasExitosas >= 2) {
        console.log('\n⚠️ Algunas funciones necesitan corrección.');
        console.log('Ejecuta: fix_vista_detalle_anci_completo.js');
    } else {
        console.log('\n❌ Varios componentes no funcionan correctamente.');
        console.log('Ejecuta: fix_vista_detalle_anci_completo.js');
    }
    
    return resultados;
}

// Ejecutar verificación
const resultado = verificarVistaDetalleANCI();

// Guardar para análisis
window.verificacionVistaANCI = resultado;

console.log('\n💡 Resultado guardado en window.verificacionVistaANCI');
console.log('💡 Para ver los datos del incidente: window.verificacionVistaANCI.datos');
console.log('💡 Para aplicar correcciones: ejecutar fix_vista_detalle_anci_completo.js');