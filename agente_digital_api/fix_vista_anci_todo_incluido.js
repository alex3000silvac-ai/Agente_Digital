// =====================================================
// FIX COMPLETO TODO INCLUIDO - VISTA DETALLE ANCI
// =====================================================
// Incluye TODAS las correcciones:
// 1. Estadísticas del Expediente Semilla
// 2. Botones de exportación funcionales
// 3. Reloj de cuenta regresiva visible
// 4. Actualización automática de datos
// =====================================================

console.log('🚀 APLICANDO FIX COMPLETO TODO INCLUIDO...\n');

async function aplicarFixCompletoANCI() {
    // 1. BUSCAR COMPONENTE PRINCIPAL
    const vistaDetalle = document.querySelector('.vista-detalle-anci')?.__vueParentComponent;
    
    if (!vistaDetalle) {
        console.error('❌ No se encontró el componente VistaDetalleIncidenteANCI');
        return false;
    }
    
    console.log('✅ Componente principal encontrado');
    const ctx = vistaDetalle.ctx;
    const incidenteId = ctx.incidente?.value?.IncidenteID || vistaDetalle.props.incidenteId;
    
    // ========================================
    // PARTE 1: CALCULAR ESTADÍSTICAS REALES
    // ========================================
    console.log('\n📊 CALCULANDO ESTADÍSTICAS REALES...');
    
    async function actualizarEstadisticas() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/incidentes/${incidenteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error obteniendo datos');
            
            const datosCompletos = await response.json();
            
            // Calcular estadísticas
            let totalEvidencias = 0;
            let totalComentarios = 0;
            let camposLlenos = 0;
            let totalCampos = 0;
            
            // Contar archivos
            if (datosCompletos.archivos) {
                for (const seccion in datosCompletos.archivos) {
                    if (Array.isArray(datosCompletos.archivos[seccion])) {
                        totalEvidencias += datosCompletos.archivos[seccion].length;
                    }
                }
            }
            
            // Campos para completitud
            const camposImportantes = [
                'Titulo', 'TipoRegistro', 'FechaDeteccion', 'Criticidad',
                'DescripcionInicial', 'AnciImpactoPreliminar', 'SistemasAfectados',
                'OrigenIncidente', 'AnciTipoAmenaza', 'ResponsableCliente',
                'AccionesInmediatas', 'CausaRaiz', 'LeccionesAprendidas'
            ];
            
            camposImportantes.forEach(campo => {
                totalCampos++;
                if (datosCompletos[campo] && datosCompletos[campo].toString().trim()) {
                    camposLlenos++;
                }
            });
            
            // Contar taxonomías
            if (datosCompletos.taxonomias_seleccionadas?.length > 0) {
                camposLlenos += 2;
                totalCampos += 2;
                
                datosCompletos.taxonomias_seleccionadas.forEach(tax => {
                    if (tax.justificacion || tax.porque_seleccionada) totalComentarios++;
                    if (tax.descripcionProblema || tax.descripcion_problema) totalComentarios++;
                });
            }
            
            const completitud = Math.round((camposLlenos / totalCampos) * 100);
            
            // Actualizar valores
            ctx.incidente.value.TotalEvidencias = totalEvidencias;
            ctx.incidente.value.TotalComentarios = totalComentarios;
            ctx.incidente.value.Completitud = completitud;
            
            // Actualizar DOM
            const stats = document.querySelectorAll('.estadisticas-mini .stat-numero');
            if (stats.length >= 3) {
                stats[0].textContent = totalEvidencias;
                stats[1].textContent = totalComentarios;
                stats[2].textContent = completitud + '%';
                
                // Animación
                stats.forEach(stat => {
                    stat.style.transition = 'all 0.3s';
                    stat.style.transform = 'scale(1.2)';
                    stat.style.color = '#60a5fa';
                    setTimeout(() => {
                        stat.style.transform = 'scale(1)';
                    }, 300);
                });
            }
            
            console.log(`✅ Estadísticas: ${totalEvidencias} evidencias, ${totalComentarios} comentarios, ${completitud}% completado`);
            
        } catch (error) {
            console.error('❌ Error calculando estadísticas:', error);
        }
    }
    
    // Ejecutar inmediatamente
    await actualizarEstadisticas();
    
    // ========================================
    // PARTE 2: HABILITAR EXPORTACIÓN
    // ========================================
    console.log('\n📄 HABILITANDO EXPORTACIÓN DE INFORMES...');
    
    ctx.exportarPDF = async function() {
        console.log('🔄 Generando PDF...');
        try {
            alert('Generando informe PDF... Por favor espere.');
            
            const response = await fetch(`http://localhost:5000/api/informes-anci/generar/${incidenteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tipo: 'completo', formato: 'pdf' })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Informe_ANCI_${incidenteId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                console.log('✅ PDF descargado');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error generando PDF. Intente nuevamente.');
        }
    };
    
    ctx.exportarWord = async function() {
        console.log('🔄 Generando Word...');
        try {
            alert('Generando informe Word... Por favor espere.');
            
            const response = await fetch(`http://localhost:5000/api/informes-anci/generar/${incidenteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tipo: 'completo', formato: 'docx' })
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
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error generando Word. Intente nuevamente.');
        }
    };
    
    ctx.exportarTexto = async function() {
        console.log('🔄 Generando texto...');
        try {
            const response = await fetch(`http://localhost:5000/api/informes-anci/generar/${incidenteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tipo: 'preliminar' })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.contenido) {
                    // Crear archivo de texto
                    const blob = new Blob([data.contenido], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Informe_ANCI_${incidenteId}.txt`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    console.log('✅ Texto descargado');
                }
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error generando texto. Intente nuevamente.');
        }
    };
    
    console.log('✅ Funciones de exportación habilitadas');
    
    // ========================================
    // PARTE 3: RELOJ CUENTA REGRESIVA
    // ========================================
    console.log('\n⏰ AGREGANDO RELOJ DE CUENTA REGRESIVA...');
    
    // Estilos del reloj
    if (!document.getElementById('fix-reloj-completo-styles')) {
        const estilos = `
            <style id="fix-reloj-completo-styles">
                /* Reloj flotante */
                .reloj-anci-flotante {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95));
                    color: white;
                    padding: 20px;
                    border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    font-family: 'Segoe UI', monospace;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    min-width: 250px;
                }
                
                .reloj-anci-flotante.urgente {
                    animation: pulso-urgente 1s infinite;
                }
                
                @keyframes pulso-urgente {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .reloj-titulo {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 10px;
                    opacity: 0.9;
                }
                
                .reloj-tiempo {
                    font-size: 32px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .reloj-tiempo i {
                    animation: girar 2s linear infinite;
                }
                
                @keyframes girar {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .reloj-detalles {
                    font-size: 12px;
                    opacity: 0.8;
                }
                
                /* Estadísticas mejoradas */
                .estadisticas-mini {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .stat-numero {
                    font-size: 28px !important;
                    font-weight: bold !important;
                    background: linear-gradient(135deg, #60a5fa, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                /* Barra de progreso */
                .barra-progreso-anci {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    margin-top: 15px;
                    overflow: hidden;
                }
                
                .barra-progreso-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #60a5fa);
                    transition: width 0.5s ease;
                    border-radius: 3px;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', estilos);
    }
    
    // Crear reloj flotante
    let reloj = document.getElementById('reloj-anci-completo');
    if (!reloj) {
        reloj = document.createElement('div');
        reloj.id = 'reloj-anci-completo';
        reloj.className = 'reloj-anci-flotante';
        document.body.appendChild(reloj);
    }
    
    // Función actualizar reloj
    function actualizarReloj() {
        const plazos = ctx.plazos?.value;
        if (!plazos) return;
        
        let plazoActual = null;
        let tipoPlazo = '';
        
        if (!plazos.preliminar.completado && !plazos.preliminar.vencido) {
            plazoActual = plazos.preliminar;
            tipoPlazo = 'INFORME PRELIMINAR';
        } else if (!plazos.completo.completado && !plazos.completo.vencido) {
            plazoActual = plazos.completo;
            tipoPlazo = 'INFORME COMPLETO';
        } else if (!plazos.final.completado && !plazos.final.vencido) {
            plazoActual = plazos.final;
            tipoPlazo = 'INFORME FINAL';
        }
        
        if (plazoActual) {
            const esUrgente = plazoActual.tiempoRestante.includes('hora') || 
                            plazoActual.tiempoRestante.includes('minuto');
            
            reloj.className = `reloj-anci-flotante ${esUrgente ? 'urgente' : ''}`;
            reloj.innerHTML = `
                <div class="reloj-titulo">${tipoPlazo}</div>
                <div class="reloj-tiempo">
                    <i class="ph ph-timer"></i>
                    <span>${plazoActual.tiempoRestante}</span>
                </div>
                <div class="reloj-detalles">
                    Plazo legal ANCI<br>
                    Incidente #${incidenteId}
                </div>
            `;
            reloj.style.display = 'block';
        }
    }
    
    // Actualizar cada segundo
    setInterval(() => {
        ctx.calcularPlazos();
        actualizarReloj();
    }, 1000);
    
    actualizarReloj();
    console.log('✅ Reloj de cuenta regresiva agregado');
    
    // ========================================
    // PARTE 4: MEJORAS VISUALES
    // ========================================
    
    // Agregar barra de progreso
    const estadisticas = document.querySelector('.estadisticas-mini');
    if (estadisticas && !estadisticas.querySelector('.barra-progreso-anci')) {
        const completitud = ctx.incidente.value.Completitud || 0;
        const barra = document.createElement('div');
        barra.className = 'barra-progreso-anci';
        barra.innerHTML = `<div class="barra-progreso-fill" style="width: ${completitud}%"></div>`;
        estadisticas.appendChild(barra);
    }
    
    // Actualizar cada 30 segundos
    setInterval(actualizarEstadisticas, 30000);
    
    // ========================================
    // RESUMEN FINAL
    // ========================================
    
    console.log('\n✅ FIX COMPLETO APLICADO EXITOSAMENTE');
    console.log('📊 Características habilitadas:');
    console.log('   1. ✅ Estadísticas reales calculadas');
    console.log('   2. ✅ Exportación PDF, Word y Texto');
    console.log('   3. ✅ Reloj de cuenta regresiva flotante');
    console.log('   4. ✅ Actualización automática cada 30s');
    
    // Debug
    window.debugANCICompleto = {
        componente: vistaDetalle,
        ctx,
        incidente: ctx.incidente?.value,
        plazos: ctx.plazos?.value,
        estadisticas: {
            evidencias: ctx.incidente.value.TotalEvidencias,
            comentarios: ctx.incidente.value.TotalComentarios,
            completitud: ctx.incidente.value.Completitud
        }
    };
    
    return true;
}

// EJECUTAR TODO
aplicarFixCompletoANCI().then(resultado => {
    if (!resultado) {
        console.log('\n🔄 Reintentando en 2 segundos...');
        setTimeout(aplicarFixCompletoANCI, 2000);
    }
});

console.log('\n💡 Datos guardados en window.debugANCICompleto');