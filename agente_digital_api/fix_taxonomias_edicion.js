// =====================================================
// FIX PARA TAXONOMÍAS EN MODO EDICIÓN
// =====================================================
// Problema: Las taxonomías seleccionadas no se marcan en la edición
// Causa: Se cargan antes de que las taxonomías disponibles estén listas
// =====================================================

console.log('🔧 APLICANDO FIX PARA TAXONOMÍAS EN EDICIÓN...\n');

// Esperar a que el componente esté cargado
setTimeout(() => {
    // Obtener el componente
    const comp = document.querySelector('.acordeon-incidente-mejorado')?.__vueParentComponent || 
                 document.querySelector('.acordeon-incidente-anci')?.__vueParentComponent;
    
    if (!comp) {
        console.error('❌ No se encontró el componente');
        return;
    }
    
    console.log('✅ Componente encontrado');
    
    // Verificar estado actual
    console.log('📊 Estado actual:');
    console.log('- Taxonomías disponibles:', comp.ctx.taxonomiasDisponibles?.value?.length || 0);
    console.log('- Taxonomías seleccionadas:', comp.ctx.taxonomiasSeleccionadas?.value?.length || 0);
    console.log('- Modo:', comp.props.modo);
    console.log('- IncidenteId:', comp.props.incidenteId);
    
    // Si hay taxonomías en datosIniciales pero no se cargaron
    if (comp.props.datosIniciales?.taxonomias_seleccionadas?.length > 0 && 
        comp.ctx.taxonomiasSeleccionadas?.value?.length === 0) {
        
        console.log('⚠️ Detectado: Taxonomías no cargadas correctamente');
        console.log('🔄 Aplicando fix...');
        
        // Función para procesar taxonomías cuando estén disponibles
        const procesarTaxonomias = () => {
            if (comp.ctx.taxonomiasDisponibles?.value?.length > 0) {
                console.log('✅ Taxonomías disponibles cargadas, procesando seleccionadas...');
                
                // Mapear las taxonomías seleccionadas con los datos completos
                comp.ctx.taxonomiasSeleccionadas.value = comp.props.datosIniciales.taxonomias_seleccionadas.map(taxSeleccionada => {
                    // Buscar la taxonomía completa
                    const taxCompleta = comp.ctx.taxonomiasDisponibles.value.find(t => 
                        t.id === taxSeleccionada.id || 
                        t.TaxonomiaID === taxSeleccionada.TaxonomiaID ||
                        t.id === taxSeleccionada.TaxonomiaID
                    );
                    
                    if (taxCompleta) {
                        console.log(`✅ Taxonomía encontrada: ${taxCompleta.nombre || taxCompleta.Nombre}`);
                        return {
                            ...taxCompleta,
                            id: taxCompleta.id || taxCompleta.TaxonomiaID,
                            nombre: taxCompleta.nombre || taxCompleta.Nombre,
                            justificacion: taxSeleccionada.justificacion || taxSeleccionada.Justificacion || '',
                            descripcionProblema: taxSeleccionada.descripcionProblema || '',
                            archivos: taxSeleccionada.archivos || [],
                            seleccionada: true
                        };
                    } else {
                        console.log(`⚠️ Taxonomía no encontrada, usando datos originales:`, taxSeleccionada);
                        return {
                            ...taxSeleccionada,
                            seleccionada: true
                        };
                    }
                });
                
                console.log(`✅ ${comp.ctx.taxonomiasSeleccionadas.value.length} taxonomías procesadas`);
                
                // Forzar actualización visual
                comp.proxy.$forceUpdate();
                
                // Abrir sección 4 para verificar
                if (comp.ctx.seccionesAbiertas?.value) {
                    comp.ctx.seccionesAbiertas.value[4] = true;
                }
                
                return true;
            }
            return false;
        };
        
        // Intentar procesar inmediatamente
        if (!procesarTaxonomias()) {
            console.log('⏳ Esperando a que se carguen las taxonomías disponibles...');
            
            // Configurar observador para cuando se carguen
            let intentos = 0;
            const checkInterval = setInterval(() => {
                intentos++;
                if (procesarTaxonomias() || intentos > 20) {
                    clearInterval(checkInterval);
                    if (intentos > 20) {
                        console.error('❌ Timeout esperando taxonomías disponibles');
                    }
                }
            }, 250);
        }
    } else if (comp.ctx.taxonomiasSeleccionadas?.value?.length > 0) {
        console.log('✅ Las taxonomías ya están cargadas correctamente');
        
        // Verificar que tienen el formato correcto
        comp.ctx.taxonomiasSeleccionadas.value.forEach((tax, idx) => {
            console.log(`${idx + 1}. ${tax.nombre || tax.Nombre || tax.id}:`, {
                justificacion: tax.justificacion ? '✓' : '✗',
                seleccionada: tax.seleccionada ? '✓' : '✗'
            });
        });
    } else {
        console.log('ℹ️ No hay taxonomías seleccionadas para este incidente');
    }
    
    // Debug adicional
    console.log('\n🔍 Debug adicional:');
    if (comp.props.datosIniciales) {
        console.log('Datos iniciales taxonomías:', comp.props.datosIniciales.taxonomias_seleccionadas);
    }
    
}, 1000);

console.log('⏳ Esperando a que el componente se cargue...');