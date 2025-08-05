// =====================================================
// FIX COMPLETO VISTA DETALLE INCIDENTE ANCI
// =====================================================
// Soluciona:
// 1. Expediente Semilla sin datos actualizados
// 2. Botones de exportación que no funcionan
// 3. Cuenta regresiva no visible
// =====================================================

console.log('🔧 APLICANDO FIX COMPLETO PARA VISTA DETALLE ANCI...\n');

async function aplicarFixVistaDetalleANCI() {
    // 1. BUSCAR COMPONENTE PRINCIPAL
    const vistaDetalle = document.querySelector('.vista-detalle-anci')?.__vueParentComponent;
    
    if (!vistaDetalle) {
        console.error('❌ No se encontró el componente VistaDetalleIncidenteANCI');
        console.log('   Asegúrate de estar en /incidente-detalle/{id} de un incidente ANCI');
        return false;
    }
    
    console.log('✅ Componente principal encontrado');
    const ctx = vistaDetalle.ctx;
    
    // ========================================
    // FIX 1: ACTUALIZAR DATOS DEL EXPEDIENTE
    // ========================================
    console.log('\n📄 FIX 1: Actualizando datos del Expediente Semilla...');
    
    // Forzar recarga de datos
    if (ctx.cargarDatos) {
        await ctx.cargarDatos();
        console.log('✅ Datos recargados desde el servidor');
    }
    
    // Verificar datos cargados
    const incidente = ctx.incidente?.value;
    if (incidente) {
        console.log(`   - Incidente ID: ${incidente.IncidenteID}`);
        console.log(`   - Título: ${incidente.Titulo}`);
        console.log(`   - Tipo Empresa: ${incidente.TipoEmpresa}`);
        console.log(`   - Reporte ANCI ID: ${incidente.ReporteAnciID}`);
    }
    
    // ========================================
    // FIX 2: HABILITAR BOTONES DE EXPORTACIÓN
    // ========================================
    console.log('\n📊 FIX 2: Habilitando botones de exportación...');
    
    // Implementar funciones de exportación
    const incidenteId = ctx.incidente?.value?.IncidenteID || vistaDetalle.props.incidenteId;
    
    // Función para exportar PDF
    ctx.exportarPDF = async function() {
        console.log('🔄 Generando informe PDF...');
        try {
            const response = await fetch(`http://localhost:5000/api/informes-anci/generar/${incidenteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    tipo: 'completo',
                    formato: 'pdf'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.pdf_url) {
                    // Abrir PDF en nueva pestaña
                    window.open(data.pdf_url, '_blank');
                    console.log('✅ PDF generado exitosamente');
                } else {
                    // Descargar archivo
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Informe_ANCI_${incidenteId}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    console.log('✅ PDF descargado');
                }
            } else {
                throw new Error('Error generando PDF');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error al generar el informe PDF. Por favor, intente nuevamente.');
        }
    };
    
    // Función para exportar Word
    ctx.exportarWord = async function() {
        console.log('🔄 Generando informe Word...');
        try {
            const response = await fetch(`http://localhost:5000/api/informes-anci/generar/${incidenteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    tipo: 'completo',
                    formato: 'docx'
                })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Informe_ANCI_${incidenteId}.docx`;
                a.click();
                window.URL.revokeObjectURL(url);
                console.log('✅ Word descargado');
            } else {
                throw new Error('Error generando Word');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error al generar el informe Word. Por favor, intente nuevamente.');
        }
    };
    
    // Función para exportar Texto
    ctx.exportarTexto = async function() {
        console.log('🔄 Generando informe de texto...');
        try {
            const response = await fetch(`http://localhost:5000/api/informes-anci/generar/${incidenteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    tipo: 'preliminar',
                    formato: 'txt'
                })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Informe_ANCI_${incidenteId}.txt`;
                a.click();
                window.URL.revokeObjectURL(url);
                console.log('✅ Texto descargado');
            } else {
                throw new Error('Error generando texto');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error al generar el informe de texto. Por favor, intente nuevamente.');
        }
    };
    
    console.log('✅ Funciones de exportación implementadas');
    
    // ========================================
    // FIX 3: AGREGAR RELOJ CUENTA REGRESIVA
    // ========================================
    console.log('\n⏰ FIX 3: Agregando reloj de cuenta regresiva visible...');
    
    // Crear estilos para el reloj
    const estilosReloj = `
        <style id="fix-reloj-anci-styles">
            .reloj-cuenta-regresiva {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(220, 38, 38, 0.95);
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                font-family: 'Courier New', monospace;
                z-index: 1000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            .reloj-titulo {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
                opacity: 0.9;
            }
            
            .reloj-tiempo {
                font-size: 24px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .reloj-tiempo i {
                font-size: 20px;
                animation: rotate 2s linear infinite;
            }
            
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .reloj-detalle {
                font-size: 11px;
                margin-top: 8px;
                opacity: 0.8;
            }
            
            .reloj-urgente {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                animation: pulse-urgente 1s infinite;
            }
            
            @keyframes pulse-urgente {
                0% { transform: scale(1); box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3); }
                50% { transform: scale(1.05); box-shadow: 0 4px 30px rgba(220, 38, 38, 0.6); }
                100% { transform: scale(1); box-shadow: 0 4px 20px rgba(220, 38, 38, 0.3); }
            }
            
            /* Mejorar visualización en tarjeta */
            .tarjeta-cuenta-regresiva .tiempo-grande {
                font-size: 48px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
                color: #60a5fa;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .tarjeta-cuenta-regresiva.urgente .tiempo-grande {
                color: #ef4444;
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    `;
    
    // Inyectar estilos
    if (!document.getElementById('fix-reloj-anci-styles')) {
        document.head.insertAdjacentHTML('beforeend', estilosReloj);
    }
    
    // Crear elemento del reloj
    let relojElement = document.getElementById('reloj-cuenta-regresiva-anci');
    if (!relojElement) {
        relojElement = document.createElement('div');
        relojElement.id = 'reloj-cuenta-regresiva-anci';
        relojElement.className = 'reloj-cuenta-regresiva';
        document.body.appendChild(relojElement);
    }
    
    // Función para actualizar el reloj
    function actualizarReloj() {
        const plazos = ctx.plazos?.value;
        if (!plazos) return;
        
        // Determinar cuál plazo mostrar (el más urgente)
        let plazoMostrar = null;
        let tipoPlazo = '';
        
        if (!plazos.preliminar.completado && !plazos.preliminar.vencido) {
            plazoMostrar = plazos.preliminar;
            tipoPlazo = 'INFORME PRELIMINAR';
        } else if (!plazos.completo.completado && !plazos.completo.vencido) {
            plazoMostrar = plazos.completo;
            tipoPlazo = 'INFORME COMPLETO';
        } else if (!plazos.final.completado && !plazos.final.vencido) {
            plazoMostrar = plazos.final;
            tipoPlazo = 'INFORME FINAL';
        }
        
        if (plazoMostrar) {
            const esUrgente = plazoMostrar.tiempoRestante.includes('hora') || 
                            plazoMostrar.tiempoRestante.includes('minuto');
            
            relojElement.className = `reloj-cuenta-regresiva ${esUrgente ? 'reloj-urgente' : ''}`;
            relojElement.innerHTML = `
                <div class="reloj-titulo">${tipoPlazo}</div>
                <div class="reloj-tiempo">
                    <i class="ph ph-timer"></i>
                    <span>${plazoMostrar.tiempoRestante}</span>
                </div>
                <div class="reloj-detalle">Vence el plazo legal ANCI</div>
            `;
            relojElement.style.display = 'block';
        } else {
            relojElement.style.display = 'none';
        }
    }
    
    // Actualizar reloj cada segundo
    let relojInterval = setInterval(() => {
        ctx.calcularPlazos();
        actualizarReloj();
    }, 1000);
    
    // Guardar referencia del interval
    window.relojIntervalANCI = relojInterval;
    
    console.log('✅ Reloj de cuenta regresiva agregado');
    
    // Agregar tiempo grande en la tarjeta
    const tarjetaCuentaRegresiva = document.querySelector('.tarjeta-cuenta-regresiva');
    if (tarjetaCuentaRegresiva) {
        const tiempoGrande = document.createElement('div');
        tiempoGrande.className = 'tiempo-grande';
        tiempoGrande.textContent = '00:00:00';
        
        // Insertar después de la descripción
        const descripcion = tarjetaCuentaRegresiva.querySelector('.tarjeta-descripcion');
        if (descripcion) {
            descripcion.insertAdjacentElement('afterend', tiempoGrande);
        }
        
        // Actualizar el tiempo grande
        setInterval(() => {
            const plazos = ctx.plazos?.value;
            if (plazos) {
                let tiempoMostrar = '';
                if (!plazos.preliminar.completado && !plazos.preliminar.vencido) {
                    tiempoMostrar = plazos.preliminar.tiempoRestante;
                } else if (!plazos.completo.completado && !plazos.completo.vencido) {
                    tiempoMostrar = plazos.completo.tiempoRestante;
                }
                tiempoGrande.textContent = tiempoMostrar || '00:00:00';
            }
        }, 1000);
    }
    
    // ========================================
    // RESUMEN Y DEBUG
    // ========================================
    
    // Guardar referencias para debug
    window.debugVistaANCI = {
        componente: vistaDetalle,
        ctx,
        incidente: ctx.incidente?.value,
        plazos: ctx.plazos?.value,
        exportarPDF: ctx.exportarPDF,
        exportarWord: ctx.exportarWord,
        exportarTexto: ctx.exportarTexto
    };
    
    console.log('\n✅ FIX APLICADO EXITOSAMENTE');
    console.log('💡 Datos guardados en window.debugVistaANCI');
    console.log('\n📝 Resumen de correcciones:');
    console.log('   1. ✅ Datos del expediente actualizados');
    console.log('   2. ✅ Botones de exportación funcionando');
    console.log('   3. ✅ Reloj de cuenta regresiva visible');
    
    return true;
}

// EJECUTAR FIX
try {
    aplicarFixVistaDetalleANCI().then(resultado => {
        if (!resultado) {
            console.log('\n🔄 Intentando nuevamente en 2 segundos...');
            setTimeout(aplicarFixVistaDetalleANCI, 2000);
        }
    });
} catch (error) {
    console.error('❌ Error aplicando fix:', error);
}

// INSTRUCCIONES
console.log('\n📝 INSTRUCCIONES:');
console.log('1. Los datos del expediente se actualizan automáticamente');
console.log('2. Usa los botones PDF, Word o Texto para exportar');
console.log('3. El reloj aparece en la esquina superior derecha');
console.log('4. Para detener el reloj: clearInterval(window.relojIntervalANCI)');