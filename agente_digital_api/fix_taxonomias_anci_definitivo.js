// =====================================================
// FIX DEFINITIVO PARA TAXONOMÍAS EN EDICIÓN ANCI
// =====================================================
// Aplica el mismo mecanismo que funciona en cargarIncidenteExistente
// =====================================================

console.log('🔧 APLICANDO FIX DEFINITIVO PARA TAXONOMÍAS ANCI...\n');

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
    
    // Verificar datos iniciales
    const datosIniciales = comp.props.datosIniciales;
    const taxonomiasEnDatos = datosIniciales?.taxonomias_seleccionadas || [];
    
    console.log('📊 Estado actual:');
    console.log('- Taxonomías en datos iniciales:', taxonomiasEnDatos.length);
    console.log('- Taxonomías disponibles:', comp.ctx.taxonomiasDisponibles?.value?.length || 0);
    console.log('- Taxonomías seleccionadas actuales:', comp.ctx.taxonomiasSeleccionadas?.value?.length || 0);
    
    if (taxonomiasEnDatos.length > 0) {
        console.log('\n📋 Taxonomías en datos iniciales:');
        taxonomiasEnDatos.forEach((tax, idx) => {
            console.log(`${idx + 1}. ID: ${tax.id || tax.TaxonomiaID}, Justificación: ${tax.justificacion ? '✓' : '✗'}`);
        });
    }
    
    // Si hay taxonomías en datos pero no están cargadas correctamente
    if (taxonomiasEnDatos.length > 0 && comp.ctx.taxonomiasSeleccionadas?.value?.length === 0) {
        console.log('\n⚠️ Las taxonomías no se cargaron correctamente. Aplicando fix...');
        
        // Aplicar el mismo mecanismo que usa cargarIncidenteExistente
        const esperarTaxonomias = setInterval(() => {
            if (comp.ctx.taxonomiasDisponibles.value.length > 0) {
                clearInterval(esperarTaxonomias);
                
                console.log('✅ Taxonomías disponibles cargadas. Procesando seleccionadas...');
                
                // Mapear las taxonomías seleccionadas con sus datos completos
                comp.ctx.taxonomiasSeleccionadas.value = taxonomiasEnDatos.map(taxSeleccionada => {
                    // Buscar la taxonomía completa en las disponibles
                    const taxCompleta = comp.ctx.taxonomiasDisponibles.value.find(t => 
                        t.id === taxSeleccionada.id || 
                        t.id === taxSeleccionada.TaxonomiaID ||
                        t.TaxonomiaID === taxSeleccionada.TaxonomiaID ||
                        t.TaxonomiaID === taxSeleccionada.id
                    );
                    
                    if (taxCompleta) {
                        console.log(`✅ Encontrada: ${taxCompleta.nombre || taxCompleta.Nombre}`);
                        return {
                            ...taxCompleta, // Incluir todos los datos de la taxonomía
                            justificacion: taxSeleccionada.justificacion || taxSeleccionada.Justificacion || '',
                            descripcionProblema: taxSeleccionada.descripcionProblema || '',
                            archivos: taxSeleccionada.archivos || [],
                            fechaSeleccion: taxSeleccionada.fechaSeleccion || new Date().toISOString(),
                            usuarioSeleccion: taxSeleccionada.usuarioSeleccion || 'Usuario actual'
                        };
                    } else {
                        console.log(`⚠️ No encontrada, usando datos originales:`, taxSeleccionada);
                        // Si no se encuentra, usar los datos que vienen del servidor
                        return taxSeleccionada;
                    }
                });
                
                console.log(`\n✅ ${comp.ctx.taxonomiasSeleccionadas.value.length} taxonomías seleccionadas cargadas`);
                console.log('📋 Taxonomías con justificaciones:');
                comp.ctx.taxonomiasSeleccionadas.value.forEach((t, idx) => {
                    console.log(`${idx + 1}. ${t.nombre || t.Nombre}:`, {
                        id: t.id,
                        justificacion: t.justificacion?.substring(0, 50) + '...'
                    });
                });
                
                // Forzar actualización visual
                comp.proxy.$forceUpdate();
                
                // Abrir sección 4
                if (comp.ctx.seccionesAbiertas?.value) {
                    comp.ctx.seccionesAbiertas.value[4] = true;
                }
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => clearInterval(esperarTaxonomias), 5000);
        
    } else if (comp.ctx.taxonomiasSeleccionadas?.value?.length > 0) {
        console.log('\n✅ Las taxonomías ya están cargadas');
        
        // Verificar si necesitan el mapeo completo
        const primeraTab = comp.ctx.taxonomiasSeleccionadas.value[0];
        if (!primeraTab.nombre && !primeraTab.Nombre) {
            console.log('⚠️ Las taxonomías no tienen nombres. Aplicando mapeo...');
            
            // Aplicar mapeo
            comp.ctx.taxonomiasSeleccionadas.value = comp.ctx.taxonomiasSeleccionadas.value.map(taxSeleccionada => {
                const taxCompleta = comp.ctx.taxonomiasDisponibles.value.find(t => 
                    t.id === taxSeleccionada.id || 
                    t.TaxonomiaID === taxSeleccionada.TaxonomiaID
                );
                
                if (taxCompleta) {
                    return {
                        ...taxCompleta,
                        justificacion: taxSeleccionada.justificacion || taxSeleccionada.Justificacion || '',
                        descripcionProblema: taxSeleccionada.descripcionProblema || '',
                        archivos: taxSeleccionada.archivos || []
                    };
                }
                return taxSeleccionada;
            });
            
            comp.proxy.$forceUpdate();
        }
    }
    
    // Guardar referencia para debug
    window.debugTaxonomias = {
        comp: comp,
        disponibles: comp.ctx.taxonomiasDisponibles.value,
        seleccionadas: comp.ctx.taxonomiasSeleccionadas.value,
        datosIniciales: taxonomiasEnDatos
    };
    
    console.log('\n💡 Para inspeccionar: window.debugTaxonomias');
    
}, 1500);

console.log('⏳ Esperando a que el componente se cargue...');