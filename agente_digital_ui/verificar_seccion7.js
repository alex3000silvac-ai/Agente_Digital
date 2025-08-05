// VERIFICAR ARCHIVOS EN SECCIÓN 7
// ================================

(function() {
  console.clear();
  console.log('🔍 VERIFICANDO SECCIÓN 7 - RESUMEN DE ARCHIVOS');
  console.log('='.repeat(80));
  
  // 1. Expandir sección 7
  console.log('\n1️⃣ Buscando sección 7...');
  
  const secciones = document.querySelectorAll('.acordeon-seccion');
  let seccion7 = null;
  
  secciones.forEach((seccion, index) => {
    const titulo = seccion.querySelector('.seccion-titulo')?.textContent || '';
    if (titulo.includes('Resumen de todos los archivos') || index === 6) {
      seccion7 = seccion;
      console.log('✅ Sección 7 encontrada');
    }
  });
  
  if (!seccion7) {
    console.error('❌ No se encontró la sección 7');
    return;
  }
  
  // Expandir si no está activa
  if (!seccion7.classList.contains('activa')) {
    const header = seccion7.querySelector('.seccion-header');
    if (header) {
      header.click();
      console.log('✅ Sección 7 expandida');
    }
  }
  
  // 2. Verificar tabla después de un momento
  setTimeout(() => {
    console.log('\n2️⃣ Analizando contenido de la tabla...');
    
    const tabla = seccion7.querySelector('table');
    if (!tabla) {
      console.error('❌ No se encontró tabla en sección 7');
      return;
    }
    
    const filas = tabla.querySelectorAll('tbody tr');
    console.log(`📊 Total de filas en la tabla: ${filas.length}`);
    
    // Analizar archivos por sección
    const archivosPorSeccion = {};
    
    filas.forEach(fila => {
      const celdas = fila.querySelectorAll('td');
      if (celdas.length >= 4) {
        const seccion = celdas[0].textContent.trim();
        const item = celdas[1].textContent.trim();
        const nombreSeccion = celdas[2].textContent.trim();
        const archivo = celdas[3].textContent.trim();
        
        if (!archivosPorSeccion[seccion]) {
          archivosPorSeccion[seccion] = [];
        }
        
        archivosPorSeccion[seccion].push({
          item: item,
          nombreSeccion: nombreSeccion,
          archivo: archivo
        });
      }
    });
    
    console.log('\n📋 RESUMEN POR SECCIÓN:');
    Object.keys(archivosPorSeccion).sort().forEach(seccion => {
      console.log(`\nSección ${seccion}: ${archivosPorSeccion[seccion].length} archivos`);
      archivosPorSeccion[seccion].forEach(item => {
        console.log(`  - ${item.archivo} (${item.nombreSeccion})`);
      });
    });
    
    // 3. Verificar específicamente sección 4 (Taxonomías)
    console.log('\n3️⃣ VERIFICANDO SECCIÓN 4 (TAXONOMÍAS):');
    
    if (archivosPorSeccion['4']) {
      console.log(`✅ Encontrados ${archivosPorSeccion['4'].length} archivos de taxonomías`);
      archivosPorSeccion['4'].forEach(tax => {
        console.log(`   📎 ${tax.archivo}`);
      });
    } else {
      console.log('❌ NO se encontraron archivos de taxonomías en sección 4');
      
      // Verificar si hay taxonomías seleccionadas
      console.log('\n4️⃣ Verificando taxonomías seleccionadas...');
      
      const seccionTaxonomias = Array.from(secciones).find(s => 
        s.querySelector('.seccion-titulo')?.textContent?.includes('Taxonomía')
      );
      
      if (seccionTaxonomias) {
        const taxonomiasSeleccionadas = seccionTaxonomias.querySelectorAll('.taxonomia-item.seleccionada');
        console.log(`Taxonomías seleccionadas: ${taxonomiasSeleccionadas.length}`);
        
        if (taxonomiasSeleccionadas.length > 0) {
          console.log('\n⚠️ HAY TAXONOMÍAS SELECCIONADAS PERO NO APARECEN EN SECCIÓN 7');
          console.log('Esto indica que el computed property "todosLosArchivos" no incluye archivos de taxonomías');
          
          // Intentar buscar el componente Vue
          console.log('\n5️⃣ Buscando componente Vue para diagnosticar...');
          const app = document.querySelector('#app')?.__vue_app__;
          if (app) {
            let componenteEncontrado = null;
            
            const buscar = (instance) => {
              if (instance?.proxy?.todosLosArchivos !== undefined) {
                componenteEncontrado = instance.proxy;
                return true;
              }
              if (instance?.subTree) buscar(instance.subTree);
              if (instance?.component) buscar(instance.component);
              if (instance?.children && Array.isArray(instance.children)) {
                instance.children.forEach(buscar);
              }
            };
            
            buscar(app._instance);
            
            if (componenteEncontrado) {
              console.log('✅ Componente encontrado');
              console.log('todosLosArchivos:', componenteEncontrado.todosLosArchivos);
              console.log('taxonomiasSeleccionadas:', componenteEncontrado.taxonomiasSeleccionadas);
              
              // Guardar referencia global
              window.acordeonDebug = componenteEncontrado;
              console.log('\n💡 Componente guardado en window.acordeonDebug');
              console.log('Puedes inspeccionar:');
              console.log('- window.acordeonDebug.todosLosArchivos');
              console.log('- window.acordeonDebug.taxonomiasSeleccionadas');
            }
          }
        }
      }
    }
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    
  }, 1000);
})();