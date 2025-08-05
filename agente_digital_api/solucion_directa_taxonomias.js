// SOLUCIÓN DIRECTA - EJECUTAR EN CONSOLA
// ======================================

console.clear();
console.log('🔧 APLICANDO SOLUCIÓN DIRECTA');

// 1. Obtener datos del servidor directamente
(async function() {
  try {
    // Cargar datos del incidente
    const response = await fetch('http://localhost:5002/api/incidente/25/cargar_completo', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    
    if (!response.ok) {
      console.error('❌ Error al cargar datos:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Datos cargados del servidor');
    console.log('Taxonomías:', data.incidente?.taxonomias_seleccionadas);
    
    // 2. Buscar el componente Vue de forma más agresiva
    let componente = null;
    
    // Intentar por el store de Pinia si existe
    if (window.Pinia) {
      console.log('Buscando por Pinia store...');
    }
    
    // Buscar por atributos data-v
    const elementos = document.querySelectorAll('[class*="acordeon-incidente"]');
    for (let el of elementos) {
      // Buscar en el árbol de componentes
      let current = el;
      while (current) {
        if (current.__vueParentComponent?.proxy?.taxonomiasSeleccionadas !== undefined) {
          componente = current.__vueParentComponent.proxy;
          console.log('✅ Componente encontrado por __vueParentComponent');
          break;
        }
        current = current.parentElement;
      }
      if (componente) break;
    }
    
    // Si no encontramos el componente, aplicar solución visual directa
    if (!componente) {
      console.log('⚠️ No se encontró el componente, aplicando solución visual...');
      
      // Si hay taxonomías en los datos
      if (data.incidente?.taxonomias_seleccionadas?.length > 0) {
        const taxonomias = data.incidente.taxonomias_seleccionadas;
        
        taxonomias.forEach(tax => {
          console.log(`Procesando taxonomía: ${tax.id}`);
          
          // Buscar el elemento de la taxonomía
          const elemento = document.querySelector(`[data-taxonomy-id="${tax.id}"]`);
          if (elemento) {
            // Marcar como seleccionada
            elemento.classList.add('seleccionada');
            
            // Marcar el checkbox
            const checkbox = elemento.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = true;
            }
            
            // Mostrar el formulario con los datos
            const formulario = elemento.querySelector('.formulario-taxonomia');
            if (formulario) {
              // Llenar justificación
              const textareaJust = formulario.querySelector('textarea[placeholder*="justificación"]');
              if (textareaJust && tax.justificacion) {
                textareaJust.value = tax.justificacion;
              }
              
              // Llenar descripción
              const textareaDesc = formulario.querySelector('textarea[placeholder*="descripción"]');
              if (textareaDesc && tax.descripcionProblema) {
                textareaDesc.value = tax.descripcionProblema;
              }
            }
            
            console.log(`✅ Taxonomía ${tax.id} marcada y datos cargados`);
          } else {
            console.log(`❌ No se encontró elemento para taxonomía ${tax.id}`);
          }
        });
        
        // Actualizar contador de archivos
        const badgeCount = document.querySelector('.acordeon-seccion:nth-child(4) .badge-count');
        if (badgeCount) {
          badgeCount.textContent = taxonomias.length;
        }
      }
    } else {
      // Si encontramos el componente, actualizar sus datos
      console.log('✅ Actualizando datos del componente...');
      
      // Forzar la carga de taxonomías
      if (data.incidente?.taxonomias_seleccionadas) {
        componente.taxonomiasSeleccionadas = data.incidente.taxonomias_seleccionadas;
        console.log('✅ Taxonomías actualizadas en el componente');
        
        // Forzar actualización visual
        if (componente.$forceUpdate) {
          componente.$forceUpdate();
        }
      }
    }
    
    // 3. Verificar archivos en sección 7
    console.log('\n📁 VERIFICANDO ARCHIVOS...');
    
    // Buscar la tabla de archivos
    const tabla = document.querySelector('.seccion-contenido table');
    if (tabla && data.incidente?.taxonomias_seleccionadas) {
      let hayArchivosSeccion4 = false;
      
      data.incidente.taxonomias_seleccionadas.forEach(tax => {
        if (tax.archivos && tax.archivos.length > 0) {
          console.log(`Taxonomía ${tax.id} tiene ${tax.archivos.length} archivos`);
          hayArchivosSeccion4 = true;
        }
      });
      
      if (!hayArchivosSeccion4) {
        console.log('⚠️ Las taxonomías no tienen archivos adjuntos');
      }
    }
    
    // 4. Expandir secciones relevantes
    console.log('\n🔄 EXPANDIENDO SECCIONES...');
    
    // Expandir sección 4 (Taxonomías)
    const seccion4 = document.querySelector('.acordeon-seccion:nth-child(4)');
    if (seccion4 && !seccion4.classList.contains('activa')) {
      const header4 = seccion4.querySelector('.seccion-header');
      if (header4) {
        header4.click();
        console.log('✅ Sección 4 expandida');
      }
    }
    
    // Expandir sección 7 (Resumen archivos)
    setTimeout(() => {
      const seccion7 = Array.from(document.querySelectorAll('.acordeon-seccion')).find(el => 
        el.textContent.includes('Resumen de todos los archivos')
      );
      if (seccion7 && !seccion7.classList.contains('activa')) {
        const header7 = seccion7.querySelector('.seccion-header');
        if (header7) {
          header7.click();
          console.log('✅ Sección 7 expandida');
        }
      }
    }, 500);
    
    console.log('\n✅ PROCESO COMPLETADO');
    console.log('Por favor verifica:');
    console.log('1. ¿La taxonomía está marcada con borde verde?');
    console.log('2. ¿Se ven los datos de justificación y descripción?');
    console.log('3. ¿Aparecen archivos en la sección 7?');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();