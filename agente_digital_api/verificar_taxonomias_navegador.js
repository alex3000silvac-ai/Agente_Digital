// INSTRUCCIONES PARA VERIFICAR TAXONOMÍAS EN EL NAVEGADOR
// =======================================================
// 1. Abre http://localhost:5173/incidente-detalle/25
// 2. Abre la consola del navegador (F12)
// 3. Copia y pega todo este código en la consola

console.log('🔍 INICIANDO VERIFICACIÓN DE TAXONOMÍAS');
console.log('=' + '='.repeat(80));

// 1. Verificar datos del servidor
console.log('\n1️⃣ VERIFICANDO DATOS DEL SERVIDOR...');
const response = await fetch('http://localhost:5002/api/incidente/25/cargar_completo', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
});
const data = await response.json();

console.log('📦 Respuesta completa:', data);
console.log('📋 Incidente:', data.incidente);
console.log('🏷️ Taxonomías seleccionadas:', data.incidente?.taxonomias_seleccionadas);

// 2. Verificar el componente Vue
console.log('\n2️⃣ VERIFICANDO COMPONENTE VUE...');

// Intentar varias formas de obtener el componente
let vm = null;

// Método 1: Buscar por el atributo data-v
const elementos = document.querySelectorAll('[data-v-]');
for (let el of elementos) {
  if (el.__vue__ || el.__vueParentComponent) {
    const comp = el.__vue__ || el.__vueParentComponent;
    if (comp.proxy && comp.proxy.taxonomiasSeleccionadas !== undefined) {
      vm = comp.proxy;
      console.log('✅ Componente encontrado por data-v');
      break;
    }
  }
}

// Método 2: Buscar el componente AcordeonIncidenteMejorado
if (!vm) {
  const app = document.querySelector('#app').__vue_app__;
  const buscarComponente = (instance) => {
    if (instance?.type?.name === 'AcordeonIncidenteMejorado') {
      return instance.proxy;
    }
    if (instance?.subTree?.component) {
      return buscarComponente(instance.subTree.component);
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
  if (vm) {
    console.log('✅ Componente encontrado por nombre');
  }
}

// Método 3: Usar la función debug global
if (!vm && window.debugTaxonomias) {
  console.log('✅ Usando función debug global');
  window.debugTaxonomias();
} else if (vm) {
  console.log('📊 Estado del componente:');
  console.log('   - Taxonomías disponibles:', vm.taxonomiasDisponibles?.length || 0);
  console.log('   - Taxonomías seleccionadas:', vm.taxonomiasSeleccionadas?.length || 0);
  console.log('   - Detalle taxonomías seleccionadas:', vm.taxonomiasSeleccionadas);
}

// 3. Verificar elementos DOM
console.log('\n3️⃣ VERIFICANDO ELEMENTOS DOM...');
const taxItems = document.querySelectorAll('.taxonomia-item');
console.log(`📌 Total elementos .taxonomia-item: ${taxItems.length}`);

taxItems.forEach((item, index) => {
  const taxId = item.dataset.taxonomyId || item.getAttribute('data-taxonomy-id');
  const seleccionada = item.classList.contains('seleccionada');
  console.log(`   ${index + 1}. ID: ${taxId}, Seleccionada: ${seleccionada ? '✅' : '❌'}`);
});

// 4. Verificar checkbox de taxonomías
console.log('\n4️⃣ VERIFICANDO CHECKBOXES...');
const checkboxes = document.querySelectorAll('.taxonomia-item input[type="checkbox"]');
console.log(`📌 Total checkboxes: ${checkboxes.length}`);

checkboxes.forEach((cb, index) => {
  console.log(`   ${index + 1}. Checked: ${cb.checked ? '✅' : '❌'}`);
});

// 5. Forzar visualización para probar estilos
console.log('\n5️⃣ FORZANDO VISUALIZACIÓN...');
const taxId = 'INC_USO_PHIP_ECDP';
const elemento = document.querySelector(`[data-taxonomy-id="${taxId}"]`);
if (elemento) {
  elemento.classList.add('seleccionada');
  console.log(`✅ Taxonomía ${taxId} marcada como seleccionada`);
  console.log('   ¿Se ve el borde verde? Debería tener un borde verde de 2px');
  
  // También marcar el checkbox
  const checkbox = elemento.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.checked = true;
    console.log('✅ Checkbox marcado');
  }
} else {
  console.log(`❌ No se encontró elemento con data-taxonomy-id="${taxId}"`);
}

// 6. Verificar archivos en sección 7
console.log('\n6️⃣ VERIFICANDO SECCIÓN 7 (RESUMEN DE ARCHIVOS)...');
const seccion7 = document.querySelector('.seccion-content'); // Buscar la sección 7
const archivosSeccion4 = document.querySelectorAll('[data-seccion="4"]');
console.log(`📌 Archivos de sección 4 (taxonomías): ${archivosSeccion4.length}`);

// 7. Diagnóstico final
console.log('\n7️⃣ DIAGNÓSTICO:');
if (data.incidente?.taxonomias_seleccionadas?.length > 0) {
  console.log('✅ El servidor SÍ está devolviendo taxonomías');
} else {
  console.log('❌ El servidor NO está devolviendo taxonomías');
}

if (vm?.taxonomiasSeleccionadas?.length > 0) {
  console.log('✅ El componente Vue SÍ tiene taxonomías cargadas');
} else {
  console.log('❌ El componente Vue NO tiene taxonomías cargadas');
}

if (taxItems.length > 0 && Array.from(taxItems).some(el => el.classList.contains('seleccionada'))) {
  console.log('✅ Hay taxonomías marcadas visualmente');
} else {
  console.log('❌ NO hay taxonomías marcadas visualmente');
}

console.log('\n🔍 VERIFICACIÓN COMPLETADA');
console.log('Por favor, reporta los resultados de arriba.');