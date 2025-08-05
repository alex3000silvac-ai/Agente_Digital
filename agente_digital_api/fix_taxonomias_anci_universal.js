// =====================================================
// FIX UNIVERSAL PARA SECCIÓN 4 (TAXONOMÍAS) EN ANCI
// =====================================================
// Soluciona: visualización, comentarios, archivos y botones
// =====================================================

console.log('🔧 APLICANDO FIX UNIVERSAL PARA TAXONOMÍAS ANCI...\n');

// Función principal de corrección
function aplicarFixTaxonomiasANCI() {
    // 1. INYECTAR ESTILOS CSS FALTANTES
    const estilosCSS = `
        <style id="fix-taxonomias-anci-styles">
            /* Destacar taxonomías seleccionadas */
            .taxonomia-item.seleccionada {
                background-color: #e3f2fd !important;
                border-left: 4px solid #2196f3 !important;
                padding-left: 12px !important;
                transition: all 0.3s ease !important;
            }
            
            .taxonomia-item.seleccionada .taxonomia-header {
                font-weight: 600 !important;
                color: #1976d2 !important;
            }
            
            .taxonomia-item.seleccionada input[type="checkbox"] {
                accent-color: #2196f3 !important;
            }
            
            /* Sección de comentarios visible */
            .taxonomia-comentarios {
                display: block !important;
                margin-top: 10px !important;
                padding: 10px !important;
                background-color: #f5f5f5 !important;
                border-radius: 4px !important;
            }
            
            /* Archivos adjuntos visibles */
            .taxonomia-archivos {
                display: block !important;
                margin-top: 10px !important;
            }
            
            .taxonomia-archivos .archivo-item {
                display: flex !important;
                align-items: center !important;
                padding: 8px !important;
                background: white !important;
                border: 1px solid #e0e0e0 !important;
                border-radius: 4px !important;
                margin-bottom: 8px !important;
            }
            
            /* Botones de edición */
            .taxonomia-acciones {
                display: flex !important;
                gap: 10px !important;
                margin-top: 10px !important;
            }
            
            .btn-editar-taxonomia {
                display: inline-flex !important;
                align-items: center !important;
                padding: 6px 12px !important;
                background: #1976d2 !important;
                color: white !important;
                border: none !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-size: 14px !important;
            }
            
            .btn-editar-taxonomia:hover {
                background: #1565c0 !important;
            }
        </style>
    `;
    
    // Inyectar estilos si no existen
    if (!document.getElementById('fix-taxonomias-anci-styles')) {
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
    
    // 3. VERIFICAR Y CORREGIR DATOS
    console.log('\n📊 VERIFICANDO DATOS DE TAXONOMÍAS:');
    
    const taxonomiasSeleccionadas = ctx.taxonomiasSeleccionadas?.value || [];
    const taxonomiasDisponibles = ctx.taxonomiasDisponibles?.value || [];
    
    console.log(`   - Taxonomías seleccionadas: ${taxonomiasSeleccionadas.length}`);
    console.log(`   - Taxonomías disponibles: ${taxonomiasDisponibles.length}`);
    
    if (taxonomiasSeleccionadas.length === 0) {
        console.log('   ⚠️  No hay taxonomías seleccionadas');
    } else {
        console.log('\n   📋 Taxonomías seleccionadas:');
        taxonomiasSeleccionadas.forEach((tax, idx) => {
            console.log(`      ${idx + 1}. ID: ${tax.id} - ${tax.nombre || tax.categoria}`);
            console.log(`         Comentarios: ${tax.justificacion ? '✅' : '❌'}`);
            console.log(`         Archivos: ${tax.archivos?.length || 0}`);
        });
    }
    
    // 4. CORREGIR FUNCIÓN DE COMPARACIÓN
    const taxonomiaSeleccionadaOriginal = ctx.taxonomiaSeleccionada;
    
    ctx.taxonomiaSeleccionada = function(taxId) {
        // Normalizar ambos IDs a string para comparación
        const idStr = String(taxId);
        const resultado = taxonomiasSeleccionadas.some(t => {
            const tIdStr = String(t.id || t.TaxonomiaID || t.taxonomia_id);
            return tIdStr === idStr;
        });
        
        // Log para debug
        console.log(`   taxonomiaSeleccionada(${taxId}) -> ${idStr} = ${resultado}`);
        
        return resultado;
    };
    
    console.log('\n✅ Función de comparación corregida');
    
    // 5. APLICAR CLASES CSS A ELEMENTOS EXISTENTES
    setTimeout(() => {
        console.log('\n🎨 APLICANDO ESTILOS A ELEMENTOS:');
        
        // Buscar todos los items de taxonomía
        const taxonomiaItems = document.querySelectorAll('[data-taxonomia-id]');
        let aplicados = 0;
        
        taxonomiaItems.forEach(item => {
            const taxId = item.getAttribute('data-taxonomia-id');
            if (ctx.taxonomiaSeleccionada(taxId)) {
                item.classList.add('seleccionada');
                aplicados++;
                
                // Marcar checkbox si existe
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                }
            }
        });
        
        console.log(`   ✅ Estilos aplicados a ${aplicados} taxonomías`);
        
        // 6. MOSTRAR COMENTARIOS Y ARCHIVOS
        taxonomiasSeleccionadas.forEach(tax => {
            const taxElement = document.querySelector(`[data-taxonomia-id="${tax.id}"]`);
            
            if (taxElement) {
                // Buscar o crear sección de comentarios
                let comentariosSection = taxElement.querySelector('.taxonomia-comentarios');
                if (!comentariosSection && tax.justificacion) {
                    comentariosSection = document.createElement('div');
                    comentariosSection.className = 'taxonomia-comentarios';
                    comentariosSection.innerHTML = `
                        <strong>Justificación:</strong>
                        <p>${tax.justificacion}</p>
                    `;
                    taxElement.appendChild(comentariosSection);
                }
                
                // Buscar o crear sección de archivos
                let archivosSection = taxElement.querySelector('.taxonomia-archivos');
                if (!archivosSection && tax.archivos && tax.archivos.length > 0) {
                    archivosSection = document.createElement('div');
                    archivosSection.className = 'taxonomia-archivos';
                    archivosSection.innerHTML = `
                        <strong>Archivos adjuntos (${tax.archivos.length}):</strong>
                        ${tax.archivos.map(archivo => `
                            <div class="archivo-item">
                                <i class="ph ph-file"></i>
                                <span>${archivo.nombre}</span>
                            </div>
                        `).join('')}
                    `;
                    taxElement.appendChild(archivosSection);
                }
                
                // Agregar botones de edición si no existen
                let accionesSection = taxElement.querySelector('.taxonomia-acciones');
                if (!accionesSection) {
                    accionesSection = document.createElement('div');
                    accionesSection.className = 'taxonomia-acciones';
                    accionesSection.innerHTML = `
                        <button class="btn-editar-taxonomia" onclick="editarTaxonomia('${tax.id}')">
                            <i class="ph ph-pencil"></i> Editar
                        </button>
                    `;
                    taxElement.appendChild(accionesSection);
                }
            }
        });
        
        console.log('   ✅ Comentarios y archivos renderizados');
        
    }, 500);
    
    // 7. FORZAR ACTUALIZACIÓN
    if (componente.proxy && componente.proxy.$forceUpdate) {
        componente.proxy.$forceUpdate();
        console.log('\n✅ Componente actualizado');
    }
    
    // 8. ABRIR SECCIÓN 4
    if (ctx.seccionesAbiertas?.value) {
        ctx.seccionesAbiertas.value[4] = true;
        console.log('✅ Sección 4 abierta');
    }
    
    // Guardar referencia para debug
    window.debugTaxonomiasANCI = {
        componente,
        ctx,
        seleccionadas: taxonomiasSeleccionadas,
        disponibles: taxonomiasDisponibles.slice(0, 5),
        taxonomiaSeleccionada: ctx.taxonomiaSeleccionada
    };
    
    console.log('\n✅ FIX APLICADO EXITOSAMENTE');
    console.log('💡 Datos guardados en window.debugTaxonomiasANCI');
    
    return true;
}

// Función global para editar taxonomía
window.editarTaxonomia = function(taxId) {
    console.log(`Editando taxonomía ${taxId}`);
    alert(`Función de edición para taxonomía ${taxId} - Implementar según necesidad`);
};

// EJECUTAR FIX
try {
    const resultado = aplicarFixTaxonomiasANCI();
    
    if (!resultado) {
        console.log('\n🔄 Intentando nuevamente en 2 segundos...');
        setTimeout(aplicarFixTaxonomiasANCI, 2000);
    }
} catch (error) {
    console.error('❌ Error aplicando fix:', error);
}

// INSTRUCCIONES ADICIONALES
console.log('\n📝 INSTRUCCIONES ADICIONALES:');
console.log('1. Si no ves cambios, recarga la página y ejecuta el script nuevamente');
console.log('2. Para debug adicional: window.debugTaxonomiasANCI');
console.log('3. Para verificar una taxonomía: window.debugTaxonomiasANCI.taxonomiaSeleccionada("ID")');