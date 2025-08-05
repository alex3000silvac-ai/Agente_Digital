// DEBUG FINAL - EJECUTAR EN CONSOLA DEL NAVEGADOR
// ================================================
// En http://localhost:5173/incidente-detalle/25

console.clear();
console.log('🔍 DEBUG FINAL DE TAXONOMÍAS');
console.log('='.repeat(80));

// 1. Forzar recarga de datos
console.log('\n1️⃣ FORZANDO RECARGA DE DATOS...');
try {
  // Buscar el componente de varias formas
  let vm = null;
  
  // Método 1: Por función global
  if (window.debugTaxonomias) {
    vm = { debugTaxonomias: window.debugTaxonomias };
  }
  
  // Método 2: Por Vue DevTools
  if (!vm && window.$vm) {
    vm = window.$vm;
  }
  
  // Método 3: Por búsqueda en DOM
  if (!vm) {
    const app = document.querySelector('#app').__vue_app__;
    const buscarComponente = (instance) => {
      if (instance?.proxy?.cargarIncidenteExistente) {
        return instance.proxy;
      }
      if (instance?.subTree?.component) {
        const result = buscarComponente(instance.subTree.component);
        if (result) return result;
      }
      if (instance?.children) {
        for (let child of instance.children) {
          const result = buscarComponente(child);
          if (result) return result;
        }
      }
      return null;
    };
    vm = buscarComponente(app._instance);
  }
  
  if (vm && vm.cargarIncidenteExistente) {
    console.log('✅ Componente encontrado, recargando datos...');
    await vm.cargarIncidenteExistente();
    console.log('✅ Datos recargados');
    
    // Esperar un momento para que Vue actualice el DOM
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar estado después de recargar
    console.log('\n2️⃣ ESTADO DESPUÉS DE RECARGAR:');
    console.log('Taxonomías seleccionadas:', vm.taxonomiasSeleccionadas);
    console.log('Total archivos:', vm.totalArchivos);
    
    // Verificar función debugTaxonomias
    if (vm.debugTaxonomias) {
      vm.debugTaxonomias();
    }
  } else {
    console.log('❌ No se pudo encontrar el componente');
  }
} catch (error) {
  console.error('Error:', error);
}

// 3. Verificar DOM actualizado
console.log('\n3️⃣ VERIFICANDO DOM ACTUALIZADO...');
setTimeout(() => {
  const taxItems = document.querySelectorAll('.taxonomia-item');
  console.log(`Elementos .taxonomia-item: ${taxItems.length}`);
  
  const seleccionadas = document.querySelectorAll('.taxonomia-item.seleccionada');
  console.log(`Taxonomías seleccionadas: ${seleccionadas.length}`);
  
  // Verificar checkboxes
  const checkboxes = document.querySelectorAll('.taxonomia-item input[type="checkbox"]:checked');
  console.log(`Checkboxes marcados: ${checkboxes.length}`);
  
  // Verificar tabla de archivos
  const tabla = document.querySelector('table');
  if (tabla) {
    const filas = tabla.querySelectorAll('tr');
    let filasSeccion4 = 0;
    filas.forEach(tr => {
      const celdas = tr.querySelectorAll('td');
      if (celdas[0]?.textContent?.trim() === '4') {
        filasSeccion4++;
        console.log(`Archivo sección 4: ${celdas[3]?.textContent}`);
      }
    });
    console.log(`Total archivos sección 4 en tabla: ${filasSeccion4}`);
  }
}, 1500);

// 4. Solución temporal - Marcar manualmente
console.log('\n4️⃣ APLICANDO SOLUCIÓN TEMPORAL...');
setTimeout(() => {
  const taxId = 'INC_USO_PHIP_ECDP';
  const elemento = document.querySelector(`[data-taxonomy-id="${taxId}"]`);
  if (elemento) {
    elemento.classList.add('seleccionada');
    const checkbox = elemento.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = true;
    console.log(`✅ Taxonomía ${taxId} marcada manualmente`);
  }
  
  // Expandir sección 4
  const seccion4 = document.querySelector('.acordeon-seccion:nth-child(4)');
  if (seccion4 && !seccion4.classList.contains('activa')) {
    const header = seccion4.querySelector('.seccion-header');
    if (header) {
      header.click();
      console.log('✅ Sección 4 expandida');
    }
  }
}, 2000);