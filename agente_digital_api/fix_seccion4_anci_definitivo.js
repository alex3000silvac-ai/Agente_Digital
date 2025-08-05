// =====================================================
// FIX DEFINITIVO SECCIÓN 4 - TAXONOMÍAS ANCI
// =====================================================
// Solución para visualización correcta de taxonomías seleccionadas
// en incidentes ANCI - Aplicable desde la consola del navegador
// =====================================================

console.log('🔧 APLICANDO FIX DEFINITIVO PARA SECCIÓN 4 ANCI...\n');

function aplicarFixSeccion4ANCI() {
    // 1. INYECTAR ESTILOS CSS CORRECTIVOS
    const estilosCSS = `
        <style id="fix-seccion4-anci-styles">
            /* Asegurar que las taxonomías seleccionadas se destaquen */
            .taxonomia-item.seleccionada,
            .taxonomia-item.taxonomia-seleccionada {
                background: linear-gradient(145deg, #e3f2fd, #bbdefb) !important;
                border-left: 4px solid #2196f3 !important;
                box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2) !important;
                padding-left: 16px !important;
            }
            
            .taxonomia-item.seleccionada:hover,
            .taxonomia-item.taxonomia-seleccionada:hover {
                background: linear-gradient(145deg, #bbdefb, #90caf9) !important;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
                transform: translateY(-2px);
            }
            
            /* Estilos para el checkbox */
            .taxonomia-item.seleccionada input[type="checkbox"],
            .taxonomia-item.taxonomia-seleccionada input[type="checkbox"] {
                accent-color: #2196f3 !important;
            }
            
            /* Asegurar que el contenido dentro de taxonomías seleccionadas sea visible */
            .taxonomia-seleccionada {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                margin-top: 15px !important;
                padding: 20px !important;
                background-color: rgba(33, 150, 243, 0.05) !important;
                border-radius: 8px !important;
                border: 1px solid rgba(33, 150, 243, 0.2) !important;
            }
            
            /* Estilos para la justificación/comentarios */
            .taxonomia-seleccionada textarea {
                width: 100% !important;
                min-height: 100px !important;
                padding: 10px !important;
                border: 1px solid #495057 !important;
                border-radius: 5px !important;
                background-color: #2b3035 !important;
                color: #ffffff !important;
                resize: vertical !important;
            }
            
            /* Estilos para archivos adjuntos */
            .taxonomia-archivos {
                margin-top: 15px !important;
                padding: 15px !important;
                background-color: rgba(255, 255, 255, 0.05) !important;
                border-radius: 5px !important;
            }
            
            .archivo-item {
                display: flex !important;
                align-items: center !important;
                padding: 8px 12px !important;
                background: rgba(255, 255, 255, 0.1) !important;
                border-radius: 4px !important;
                margin-bottom: 8px !important;
                color: #e2e8f0 !important;
            }
            
            .archivo-item i {
                margin-right: 8px !important;
                color: #60a5fa !important;
            }
            
            /* Botones de edición */
            .btn-editar-taxonomia {
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 8px 16px !important;
                background: #2563eb !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: all 0.2s !important;
            }
            
            .btn-editar-taxonomia:hover {
                background: #1d4ed8 !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3) !important;
            }
            
            /* Hacer más visible el título de la taxonomía */
            .taxonomia-item.seleccionada .taxonomia-nombre,
            .taxonomia-item.taxonomia-seleccionada .taxonomia-nombre {
                color: #1565c0 !important;
                font-weight: 600 !important;
            }
            
            /* Indicador visual adicional */
            .taxonomia-item.seleccionada::before,
            .taxonomia-item.taxonomia-seleccionada::before {
                content: '✓';
                position: absolute;
                right: 20px;
                top: 20px;
                background: #2196f3;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
        </style>
    `;
    
    // Inyectar estilos si no existen
    if (!document.getElementById('fix-seccion4-anci-styles')) {
        document.head.insertAdjacentHTML('beforeend', estilosCSS);
        console.log('✅ Estilos CSS inyectados');
    }
    
    // 2. BUSCAR COMPONENTE ANCI
    const componente = document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (!componente) {
        console.error('❌ No se encontró el componente AcordeonIncidenteANCI');
        console.log('   Asegúrate de estar en la página de edición de un incidente ANCI');
        return false;
    }
    
    console.log('✅ Componente encontrado');
    const ctx = componente.ctx;
    
    // 3. VERIFICAR DATOS
    const taxonomiasSeleccionadas = ctx.taxonomiasSeleccionadas?.value || [];
    const taxonomiasDisponibles = ctx.taxonomiasDisponibles?.value || [];
    
    console.log('\n📊 ESTADO ACTUAL:');
    console.log(`   - Taxonomías seleccionadas: ${taxonomiasSeleccionadas.length}`);
    console.log(`   - Taxonomías disponibles: ${taxonomiasDisponibles.length}`);
    
    if (taxonomiasSeleccionadas.length > 0) {
        console.log('\n📋 Detalle de taxonomías seleccionadas:');
        taxonomiasSeleccionadas.forEach((tax, idx) => {
            console.log(`   ${idx + 1}. ${tax.id} - ${tax.nombre || tax.categoria}`);
            console.log(`      Justificación: ${tax.justificacion ? '✅ ' + tax.justificacion.substring(0, 50) + '...' : '❌ Sin justificación'}`);
            console.log(`      Archivos: ${tax.archivos?.length || 0}`);
        });
    }
    
    // 4. FORZAR ACTUALIZACIÓN VISUAL
    setTimeout(() => {
        // Aplicar clases a elementos existentes
        const taxonomiaItems = document.querySelectorAll('.taxonomia-item');
        let aplicados = 0;
        
        taxonomiaItems.forEach(item => {
            const taxId = item.getAttribute('data-taxonomy-id') || 
                         item.querySelector('input[type="checkbox"]')?.id?.replace('checkbox-', '');
            
            if (taxId && ctx.taxonomiaSeleccionada(taxId)) {
                item.classList.add('seleccionada');
                item.classList.add('taxonomia-seleccionada');
                aplicados++;
                
                // Asegurar que el checkbox esté marcado
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = true;
                
                // Buscar el contenedor de campos adicionales
                const camposContainer = item.querySelector('.taxonomia-seleccionada');
                if (camposContainer) {
                    camposContainer.style.display = 'block';
                    camposContainer.style.opacity = '1';
                }
            }
        });
        
        console.log(`\n✅ Estilos aplicados a ${aplicados} taxonomías`);
        
        // 5. ABRIR SECCIÓN 4
        if (ctx.seccionesAbiertas?.value) {
            ctx.seccionesAbiertas.value[4] = true;
            console.log('✅ Sección 4 abierta automáticamente');
        }
        
    }, 500);
    
    // 6. MEJORAR FUNCIÓN DE COMPARACIÓN
    if (ctx.taxonomiaSeleccionada) {
        const funcionOriginal = ctx.taxonomiaSeleccionada;
        ctx.taxonomiaSeleccionada = function(taxId) {
            const idStr = String(taxId);
            const resultado = taxonomiasSeleccionadas.some(t => 
                String(t.id || t.Id_Taxonomia || t.taxonomia_id) === idStr
            );
            return resultado;
        };
        console.log('✅ Función de comparación mejorada');
    }
    
    // 7. FORZAR ACTUALIZACIÓN DEL COMPONENTE
    if (componente.proxy?.$forceUpdate) {
        componente.proxy.$forceUpdate();
        console.log('✅ Componente actualizado');
    }
    
    // Guardar referencia para debug
    window.debugSeccion4ANCI = {
        componente,
        ctx,
        seleccionadas: taxonomiasSeleccionadas,
        disponibles: taxonomiasDisponibles.slice(0, 5)
    };
    
    console.log('\n✅ FIX APLICADO EXITOSAMENTE');
    console.log('💡 Datos guardados en window.debugSeccion4ANCI para debug');
    
    return true;
}

// EJECUTAR FIX
try {
    const resultado = aplicarFixSeccion4ANCI();
    
    if (!resultado) {
        console.log('\n🔄 Intentando nuevamente en 2 segundos...');
        setTimeout(aplicarFixSeccion4ANCI, 2000);
    }
} catch (error) {
    console.error('❌ Error aplicando fix:', error);
}

// INSTRUCCIONES
console.log('\n📝 INSTRUCCIONES:');
console.log('1. Si no ves cambios, recarga la página y ejecuta el script nuevamente');
console.log('2. Para verificar el estado: window.debugSeccion4ANCI');
console.log('3. Para ejecutar verificación: copiar y pegar el contenido de verificar_fix_seccion4_anci.js');