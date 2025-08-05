// DIAGNÓSTICO COMPLETO DE TAXONOMÍAS
// ==================================

(async function() {
  console.clear();
  console.log('🔍 DIAGNÓSTICO DE TAXONOMÍAS - INCIDENTE 25');
  console.log('='.repeat(80));
  
  // 1. Verificar que estamos en el incidente correcto
  const url = window.location.href;
  console.log('URL actual:', url);
  
  // 2. Intentar llamar al endpoint directamente
  console.log('\n1️⃣ LLAMANDO AL ENDPOINT DE TAXONOMÍAS...');
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/incidentes/25/taxonomias');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta del endpoint:', data);
      
      if (data.taxonomias && data.taxonomias.length > 0) {
        console.log(`\n📋 TAXONOMÍAS ENCONTRADAS: ${data.taxonomias.length}`);
        data.taxonomias.forEach(tax => {
          console.log(`\n- ID: ${tax.id || tax.Id_Taxonomia}`);
          console.log(`  Nombre: ${tax.nombre}`);
          console.log(`  Justificación: ${tax.justificacion}`);
          console.log(`  Archivos: ${tax.archivos ? tax.archivos.length : 0}`);
          if (tax.archivos) {
            tax.archivos.forEach(archivo => {
              console.log(`    📎 ${archivo.nombreOriginal || archivo.nombre}`);
            });
          }
        });
        
        // Guardar para inyección manual
        window.taxonomiasDelServidor = data.taxonomias;
        console.log('\n💡 Taxonomías guardadas en window.taxonomiasDelServidor');
      } else {
        console.log('⚠️ No hay taxonomías en la respuesta');
      }
    } else {
      console.error('❌ Error en endpoint:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error llamando endpoint:', error);
  }
  
  // 3. Buscar el componente Vue
  console.log('\n2️⃣ BUSCANDO COMPONENTE VUE...');
  
  const app = document.querySelector('#app')?.__vue_app__;
  if (!app) {
    console.error('❌ No se encontró la app Vue');
    return;
  }
  
  let componente = null;
  const buscarComponente = (instance, depth = 0) => {
    if (depth > 10) return;
    
    if (instance?.proxy?.taxonomiasSeleccionadas !== undefined) {
      componente = instance.proxy;
      return;
    }
    
    if (instance?.subTree) buscarComponente(instance.subTree, depth + 1);
    if (instance?.component) buscarComponente(instance.component, depth + 1);
    if (instance?.children && Array.isArray(instance.children)) {
      instance.children.forEach(child => buscarComponente(child, depth + 1));
    }
  };
  
  buscarComponente(app._instance);
  
  if (componente) {
    console.log('✅ Componente encontrado');
    console.log('taxonomiasSeleccionadas:', componente.taxonomiasSeleccionadas);
    console.log('taxonomiasDisponibles:', componente.taxonomiasDisponibles?.length || 0);
    
    // Verificar función cargarTaxonomiasDelIncidente
    if (componente.cargarTaxonomiasDelIncidente) {
      console.log('\n3️⃣ LLAMANDO A cargarTaxonomiasDelIncidente()...');
      try {
        await componente.cargarTaxonomiasDelIncidente();
        console.log('✅ Función ejecutada');
        console.log('taxonomiasSeleccionadas después:', componente.taxonomiasSeleccionadas);
      } catch (error) {
        console.error('❌ Error:', error);
      }
    } else {
      console.log('❌ No se encontró la función cargarTaxonomiasDelIncidente');
    }
    
    window.vueComponent = componente;
    console.log('\n💡 Componente guardado en window.vueComponent');
  } else {
    console.error('❌ No se encontró el componente con taxonomías');
  }
  
  // 4. Verificar sección de taxonomías
  console.log('\n4️⃣ VERIFICANDO SECCIÓN DE TAXONOMÍAS...');
  
  const secciones = document.querySelectorAll('.acordeon-seccion');
  let seccionTaxonomia = null;
  
  secciones.forEach(seccion => {
    const titulo = seccion.querySelector('.seccion-titulo')?.textContent || '';
    if (titulo.includes('Taxonomía')) {
      seccionTaxonomia = seccion;
    }
  });
  
  if (seccionTaxonomia) {
    // Contar taxonomías marcadas
    const marcadas = seccionTaxonomia.querySelectorAll('.taxonomia-item.seleccionada');
    console.log(`Taxonomías marcadas visualmente: ${marcadas.length}`);
    
    // Verificar badge
    const badge = seccionTaxonomia.querySelector('.badge-count');
    if (badge) {
      console.log(`Badge muestra: ${badge.textContent}`);
    }
  }
  
  // 5. Inyectar manualmente si hay datos del servidor
  if (window.taxonomiasDelServidor && window.taxonomiasDelServidor.length > 0 && componente) {
    console.log('\n5️⃣ INYECTANDO TAXONOMÍAS MANUALMENTE...');
    
    componente.taxonomiasSeleccionadas = window.taxonomiasDelServidor;
    
    if (componente.$forceUpdate) {
      componente.$forceUpdate();
      console.log('✅ Componente actualizado');
    }
    
    // Esperar y verificar sección 7
    setTimeout(() => {
      console.log('\n6️⃣ VERIFICANDO SECCIÓN 7...');
      
      const seccion7 = Array.from(secciones).find(s => 
        s.textContent.includes('Resumen de todos los archivos')
      );
      
      if (seccion7) {
        const tabla = seccion7.querySelector('table');
        if (tabla) {
          const filasTax = tabla.querySelectorAll('tr td:first-child');
          let contadorSeccion4 = 0;
          
          filasTax.forEach(td => {
            if (td.textContent.trim() === '4') {
              contadorSeccion4++;
            }
          });
          
          console.log(`Archivos de sección 4 (taxonomías) en tabla: ${contadorSeccion4}`);
        }
      }
    }, 1000);
  }
  
  console.log('\n✅ DIAGNÓSTICO COMPLETADO');
  console.log('\nAcciones disponibles:');
  console.log('- window.taxonomiasDelServidor (datos del servidor)');
  console.log('- window.vueComponent (componente Vue)');
  console.log('- window.vueComponent.cargarTaxonomiasDelIncidente() (recargar)');
})();