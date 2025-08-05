// =====================================================
// FIX TAXONOMÍAS - COLOR AL EDITAR EXPEDIENTE SEMILLA
// =====================================================
// Corrige el problema de taxonomías seleccionadas
// que no se marcan con color en modo edición
// =====================================================

console.log('🎨 APLICANDO FIX DE COLORES PARA TAXONOMÍAS...\n');

function aplicarFixTaxonomiasColor() {
    // 1. VERIFICAR SI ESTAMOS EN EL MODAL DE EXPEDIENTE SEMILLA
    const modal = document.querySelector('.modal-expediente-semilla');
    const acordeon = document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (!modal || !acordeon) {
        console.error('❌ No se encontró el modal del Expediente Semilla');
        console.log('   Primero haz clic en la tarjeta "Expediente Semilla"');
        return false;
    }
    
    console.log('✅ Modal y componente encontrados');
    const ctx = acordeon.ctx;
    
    // 2. VERIFICAR TAXONOMÍAS SELECCIONADAS
    const taxonomiasSeleccionadas = ctx.taxonomiasSeleccionadas?.value || [];
    console.log(`📋 Taxonomías seleccionadas: ${taxonomiasSeleccionadas.length}`);
    
    if (taxonomiasSeleccionadas.length > 0) {
        console.log('\nTaxonomías en el incidente:');
        taxonomiasSeleccionadas.forEach((tax, idx) => {
            console.log(`   ${idx + 1}. ${tax.id || tax.Id_Taxonomia} - ${tax.nombre || tax.categoria || 'Sin nombre'}`);
        });
    }
    
    // 3. INYECTAR ESTILOS CSS CORRECTIVOS
    if (!document.getElementById('fix-taxonomias-color-styles')) {
        const estilos = `
            <style id="fix-taxonomias-color-styles">
                /* Estilos para taxonomías seleccionadas */
                .taxonomia-item[data-taxonomy-id] {
                    transition: all 0.3s ease;
                }
                
                /* Múltiples selectores para asegurar aplicación */
                .taxonomia-item.seleccionada,
                .taxonomia-item.taxonomia-seleccionada,
                .acordeon-incidente-anci .taxonomia-item.seleccionada,
                .acordeon-incidente-anci .taxonomia-item.taxonomia-seleccionada {
                    background: linear-gradient(145deg, #e3f2fd, #bbdefb) !important;
                    border-left: 4px solid #2196f3 !important;
                    padding-left: 16px !important;
                    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2) !important;
                }
                
                /* Hover en seleccionadas */
                .taxonomia-item.seleccionada:hover,
                .taxonomia-item.taxonomia-seleccionada:hover {
                    background: linear-gradient(145deg, #bbdefb, #90caf9) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3) !important;
                }
                
                /* Checkbox marcado */
                .taxonomia-item.seleccionada input[type="checkbox"],
                .taxonomia-item.taxonomia-seleccionada input[type="checkbox"] {
                    accent-color: #2196f3 !important;
                    transform: scale(1.2);
                }
                
                /* Texto en taxonomías seleccionadas */
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
                    top: 50%;
                    transform: translateY(-50%);
                    background: #2196f3;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                /* Campos de taxonomía seleccionada visibles */
                .taxonomia-seleccionada {
                    display: block !important;
                    opacity: 1 !important;
                    margin-top: 15px !important;
                    padding: 20px !important;
                    background: rgba(33, 150, 243, 0.05) !important;
                    border-radius: 8px !important;
                    border: 1px solid rgba(33, 150, 243, 0.2) !important;
                }
                
                /* Animación al seleccionar */
                @keyframes seleccionarTaxonomia {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); background: #90caf9; }
                    100% { transform: scale(1); }
                }
                
                .taxonomia-item.animando {
                    animation: seleccionarTaxonomia 0.5s ease;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', estilos);
        console.log('✅ Estilos CSS inyectados');
    }
    
    // 4. APLICAR CLASES A ELEMENTOS EXISTENTES
    setTimeout(() => {
        const taxonomiaItems = document.querySelectorAll('.taxonomia-item[data-taxonomy-id]');
        let aplicados = 0;
        
        console.log(`\n🔍 Buscando ${taxonomiaItems.length} items de taxonomía...`);
        
        taxonomiaItems.forEach(item => {
            const taxId = item.getAttribute('data-taxonomy-id');
            
            // Verificar si esta taxonomía está seleccionada
            const estaSeleccionada = taxonomiasSeleccionadas.some(tax => {
                const id1 = String(tax.id || tax.Id_Taxonomia || tax.taxonomia_id);
                const id2 = String(taxId);
                return id1 === id2;
            });
            
            if (estaSeleccionada) {
                // Agregar clases
                item.classList.add('seleccionada');
                item.classList.add('taxonomia-seleccionada');
                item.style.position = 'relative'; // Para el check mark
                
                // Marcar checkbox
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                }
                
                // Animación
                item.classList.add('animando');
                setTimeout(() => item.classList.remove('animando'), 500);
                
                aplicados++;
                console.log(`   ✅ Aplicado color a taxonomía: ${taxId}`);
            }
        });
        
        console.log(`\n✅ Colores aplicados a ${aplicados} taxonomías`);
        
        // 5. HACER VISIBLE LA SECCIÓN 4
        const seccion4 = document.querySelector('[data-seccion="4"]');
        if (seccion4 && ctx.seccionesAbiertas?.value) {
            ctx.seccionesAbiertas.value[4] = true;
            console.log('✅ Sección 4 abierta automáticamente');
        }
        
    }, 500);
    
    // 6. MEJORAR FUNCIÓN DE COMPARACIÓN
    if (ctx.taxonomiaSeleccionada) {
        const funcionOriginal = ctx.taxonomiaSeleccionada;
        
        ctx.taxonomiaSeleccionada = function(taxId) {
            // Normalizar IDs para comparación
            const idStr = String(taxId);
            const resultado = taxonomiasSeleccionadas.some(tax => {
                const taxIdStr = String(tax.id || tax.Id_Taxonomia || tax.taxonomia_id);
                return taxIdStr === idStr;
            });
            
            // Log para debug
            if (resultado) {
                console.log(`   ✓ Taxonomía ${idStr} está seleccionada`);
            }
            
            return resultado;
        };
        
        console.log('✅ Función de comparación mejorada');
    }
    
    // 7. OBSERVER PARA CAMBIOS DINÁMICOS
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('taxonomia-item')) {
                        // Aplicar estilos a nuevos elementos
                        setTimeout(() => {
                            const taxId = node.getAttribute('data-taxonomy-id');
                            if (taxId && ctx.taxonomiaSeleccionada(taxId)) {
                                node.classList.add('seleccionada', 'taxonomia-seleccionada');
                            }
                        }, 100);
                    }
                });
            }
        });
    });
    
    // Observar cambios en el contenedor de taxonomías
    const contenedorTaxonomias = document.querySelector('.taxonomias-disponibles');
    if (contenedorTaxonomias) {
        observer.observe(contenedorTaxonomias, { childList: true, subtree: true });
        console.log('✅ Observer activado para cambios dinámicos');
    }
    
    // 8. FORZAR ACTUALIZACIÓN DEL COMPONENTE
    if (acordeon.proxy?.$forceUpdate) {
        acordeon.proxy.$forceUpdate();
        console.log('✅ Componente actualizado');
    }
    
    console.log('\n✅ FIX DE COLORES APLICADO EXITOSAMENTE');
    console.log('🎨 Las taxonomías seleccionadas ahora se muestran con color azul');
    
    // Guardar para debug
    window.debugTaxonomiasColor = {
        componente: acordeon,
        ctx,
        seleccionadas: taxonomiasSeleccionadas,
        observer
    };
    
    return true;
}

// EJECUTAR FIX
const resultado = aplicarFixTaxonomiasColor();

if (resultado) {
    console.log('\n💡 Debug guardado en window.debugTaxonomiasColor');
    console.log('📝 Para detener el observer: window.debugTaxonomiasColor.observer.disconnect()');
} else {
    console.log('\n⚠️ Primero abre el Expediente Semilla haciendo clic en la tarjeta');
}