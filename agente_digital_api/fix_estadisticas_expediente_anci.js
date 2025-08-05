// =====================================================
// FIX URGENTE - ESTADÍSTICAS EXPEDIENTE SEMILLA
// =====================================================
// Calcula y muestra las estadísticas reales del incidente
// =====================================================

console.log('🔧 APLICANDO FIX URGENTE PARA ESTADÍSTICAS...\n');

async function calcularEstadisticasIncidente() {
    // 1. BUSCAR COMPONENTE
    const vistaDetalle = document.querySelector('.vista-detalle-anci')?.__vueParentComponent;
    
    if (!vistaDetalle) {
        console.error('❌ No se encontró el componente VistaDetalleIncidenteANCI');
        return false;
    }
    
    console.log('✅ Componente encontrado');
    const ctx = vistaDetalle.ctx;
    const incidente = ctx.incidente?.value;
    
    if (!incidente || !incidente.IncidenteID) {
        console.error('❌ No hay datos del incidente');
        return false;
    }
    
    console.log(`📊 Calculando estadísticas para incidente ${incidente.IncidenteID}...`);
    
    try {
        // 2. OBTENER DATOS COMPLETOS DEL INCIDENTE
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/incidentes/${incidente.IncidenteID}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error obteniendo datos');
        
        const datosCompletos = await response.json();
        console.log('✅ Datos obtenidos del servidor');
        
        // 3. CALCULAR ESTADÍSTICAS REALES
        let totalEvidencias = 0;
        let totalComentarios = 0;
        let camposLlenos = 0;
        let totalCampos = 0;
        
        // Contar evidencias/archivos
        if (datosCompletos.archivos) {
            for (const seccion in datosCompletos.archivos) {
                if (Array.isArray(datosCompletos.archivos[seccion])) {
                    totalEvidencias += datosCompletos.archivos[seccion].length;
                }
            }
        }
        
        // Contar campos con contenido para calcular completitud
        const camposRequeridos = [
            'Titulo',
            'TipoRegistro',
            'FechaDeteccion',
            'FechaOcurrencia',
            'Criticidad',
            'AlcanceGeografico',
            'DescripcionInicial',
            'AnciImpactoPreliminar',
            'SistemasAfectados',
            'ServiciosInterrumpidos',
            'OrigenIncidente',
            'AnciTipoAmenaza',
            'ResponsableCliente',
            'AccionesInmediatas',
            'CausaRaiz',
            'LeccionesAprendidas',
            'PlanMejora'
        ];
        
        camposRequeridos.forEach(campo => {
            totalCampos++;
            if (datosCompletos[campo] && datosCompletos[campo].toString().trim() !== '') {
                camposLlenos++;
            }
        });
        
        // Contar taxonomías como parte de la completitud
        if (datosCompletos.taxonomias_seleccionadas && datosCompletos.taxonomias_seleccionadas.length > 0) {
            camposLlenos += 2; // Bonus por tener taxonomías
            totalCampos += 2;
            
            // Contar comentarios/justificaciones en taxonomías
            datosCompletos.taxonomias_seleccionadas.forEach(tax => {
                if (tax.justificacion || tax.porque_seleccionada) {
                    totalComentarios++;
                }
                if (tax.descripcionProblema || tax.descripcion_problema) {
                    totalComentarios++;
                }
            });
        }
        
        // Contar campos CSIRT si están llenos
        if (datosCompletos.SolicitarCSIRT) {
            if (datosCompletos.ObservacionesCSIRT) totalComentarios++;
        }
        
        // Calcular porcentaje de completitud
        const completitud = totalCampos > 0 ? Math.round((camposLlenos / totalCampos) * 100) : 0;
        
        // 4. ACTUALIZAR LAS ESTADÍSTICAS EN EL OBJETO
        incidente.TotalEvidencias = totalEvidencias;
        incidente.TotalComentarios = totalComentarios;
        incidente.Completitud = completitud;
        
        console.log('\n📊 ESTADÍSTICAS CALCULADAS:');
        console.log(`   - Total Evidencias: ${totalEvidencias}`);
        console.log(`   - Total Comentarios: ${totalComentarios}`);
        console.log(`   - Completitud: ${completitud}%`);
        console.log(`   - Campos llenos: ${camposLlenos}/${totalCampos}`);
        
        // 5. ACTUALIZAR VISUALMENTE LOS ELEMENTOS
        const statNumeros = document.querySelectorAll('.estadisticas-mini .stat-numero');
        if (statNumeros.length >= 3) {
            statNumeros[0].textContent = totalEvidencias.toString();
            statNumeros[1].textContent = totalComentarios.toString();
            statNumeros[2].textContent = completitud + '%';
            
            // Agregar animación de actualización
            statNumeros.forEach(stat => {
                stat.style.color = '#60a5fa';
                stat.style.transform = 'scale(1.2)';
                stat.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    stat.style.color = '';
                    stat.style.transform = 'scale(1)';
                }, 300);
            });
        }
        
        // 6. AGREGAR INDICADORES VISUALES DE COMPLETITUD
        const tarjetaSemilla = document.querySelector('.tarjeta-semilla');
        if (tarjetaSemilla) {
            // Remover clases anteriores
            tarjetaSemilla.classList.remove('completitud-baja', 'completitud-media', 'completitud-alta');
            
            // Agregar clase según completitud
            if (completitud < 33) {
                tarjetaSemilla.classList.add('completitud-baja');
            } else if (completitud < 66) {
                tarjetaSemilla.classList.add('completitud-media');
            } else {
                tarjetaSemilla.classList.add('completitud-alta');
            }
        }
        
        // 7. AGREGAR ESTILOS PARA INDICADORES
        if (!document.getElementById('fix-estadisticas-styles')) {
            const estilos = `
                <style id="fix-estadisticas-styles">
                    .estadisticas-mini {
                        background: rgba(255, 255, 255, 0.05);
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                    }
                    
                    .stat-mini {
                        text-align: center;
                        padding: 10px;
                    }
                    
                    .stat-numero {
                        font-size: 24px;
                        font-weight: bold;
                        color: #60a5fa;
                    }
                    
                    .tarjeta-semilla.completitud-baja .stat-numero:last-of-type {
                        color: #ef4444;
                    }
                    
                    .tarjeta-semilla.completitud-media .stat-numero:last-of-type {
                        color: #f59e0b;
                    }
                    
                    .tarjeta-semilla.completitud-alta .stat-numero:last-of-type {
                        color: #10b981;
                    }
                    
                    /* Barra de progreso visual */
                    .barra-completitud {
                        width: 100%;
                        height: 4px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 2px;
                        margin-top: 10px;
                        overflow: hidden;
                    }
                    
                    .barra-completitud-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #3b82f6, #60a5fa);
                        transition: width 0.5s ease;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', estilos);
        }
        
        // 8. AGREGAR BARRA DE PROGRESO
        const estadisticasContainer = document.querySelector('.estadisticas-mini');
        if (estadisticasContainer && !estadisticasContainer.querySelector('.barra-completitud')) {
            const barraHTML = `
                <div class="barra-completitud">
                    <div class="barra-completitud-fill" style="width: ${completitud}%"></div>
                </div>
            `;
            estadisticasContainer.insertAdjacentHTML('beforeend', barraHTML);
        }
        
        // 9. ACTUALIZAR TAMBIÉN AL ABRIR EL EXPEDIENTE
        const btnExpediente = document.querySelector('.tarjeta-semilla .btn-tarjeta-accion');
        if (btnExpediente) {
            const clickOriginal = btnExpediente.onclick;
            btnExpediente.onclick = function(e) {
                // Ejecutar función original si existe
                if (clickOriginal) clickOriginal.call(this, e);
                
                // Recalcular estadísticas al abrir
                setTimeout(() => {
                    calcularEstadisticasIncidente();
                }, 1000);
            };
        }
        
        console.log('\n✅ ESTADÍSTICAS ACTUALIZADAS EXITOSAMENTE');
        
        // Guardar para debug
        window.estadisticasIncidente = {
            totalEvidencias,
            totalComentarios,
            completitud,
            camposLlenos,
            totalCampos,
            datosCompletos
        };
        
        return true;
        
    } catch (error) {
        console.error('❌ Error calculando estadísticas:', error);
        
        // Valores por defecto si hay error
        incidente.TotalEvidencias = 0;
        incidente.TotalComentarios = 0;
        incidente.Completitud = 0;
        
        return false;
    }
}

// EJECUTAR FIX
calcularEstadisticasIncidente().then(resultado => {
    if (resultado) {
        console.log('\n💡 Estadísticas guardadas en window.estadisticasIncidente');
        
        // Actualizar cada 30 segundos
        setInterval(calcularEstadisticasIncidente, 30000);
        console.log('⏱️ Las estadísticas se actualizarán cada 30 segundos');
    }
});

// INSTRUCCIONES
console.log('\n📝 INSTRUCCIONES:');
console.log('1. Las estadísticas se calculan basándose en los datos reales');
console.log('2. Se actualizan automáticamente cada 30 segundos');
console.log('3. La completitud incluye todos los campos importantes');
console.log('4. Para ver detalles: window.estadisticasIncidente');