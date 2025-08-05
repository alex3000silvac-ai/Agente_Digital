// SCRIPT MEJORADO PARA EXPLORAR VUE
// =================================

(function() {
  console.clear();
  console.log('🔍 EXPLORANDO ESTRUCTURA VUE v2');
  console.log('='.repeat(80));
  
  // 1. Buscar la app Vue
  const app = document.querySelector('#app')?.__vue_app__;
  
  if (!app) {
    console.error('❌ No se encontró la app Vue');
    return;
  }
  
  console.log('✅ App Vue encontrada');
  
  // 2. Explorar de forma segura
  const componentesConTaxonomias = [];
  
  function explorarSeguro(obj, path = '', nivel = 0) {
    if (!obj || nivel > 10) return;
    
    try {
      // Si tiene proxy, es un componente
      if (obj.proxy) {
        // Intentar obtener las keys de forma segura
        let keys = [];
        try {
          keys = Object.keys(obj.proxy);
        } catch (e) {
          // En producción puede fallar, intentar con setupState
          if (obj.setupState) {
            keys = Object.keys(obj.setupState);
          }
        }
        
        // Buscar propiedades de taxonomías
        const taxProps = keys.filter(k => 
          k.toLowerCase().includes('taxonom') ||
          k.toLowerCase().includes('seleccionad')
        );
        
        if (taxProps.length > 0) {
          console.log(`\n✅ COMPONENTE CON TAXONOMÍAS:`);
          console.log(`   Path: ${path}`);
          console.log(`   Tipo: ${obj.type?.name || 'Anónimo'}`);
          console.log(`   Props de taxonomía:`, taxProps);
          
          componentesConTaxonomias.push({
            path: path,
            obj: obj,
            proxy: obj.proxy,
            props: taxProps
          });
        }
      }
      
      // Explorar subTree
      if (obj.subTree) {
        explorarSeguro(obj.subTree, path + '.subTree', nivel + 1);
      }
      
      // Explorar component
      if (obj.component) {
        explorarSeguro(obj.component, path + '.component', nivel + 1);
      }
      
      // Explorar children (verificar que sea array)
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach((child, i) => {
          explorarSeguro(child, path + `.children[${i}]`, nivel + 1);
        });
      }
      
    } catch (e) {
      console.warn(`Error explorando ${path}:`, e.message);
    }
  }
  
  // 3. Iniciar exploración
  console.log('\n🔍 Iniciando exploración...');
  explorarSeguro(app._instance, 'app._instance');
  
  console.log(`\n📊 Componentes con taxonomías encontrados: ${componentesConTaxonomias.length}`);
  
  // 4. Si encontramos componentes, mostrar cómo acceder
  if (componentesConTaxonomias.length > 0) {
    console.log('\n✅ COMPONENTES ENCONTRADOS:');
    
    componentesConTaxonomias.forEach((comp, i) => {
      console.log(`\n${i + 1}. ${comp.path}`);
      console.log(`   Props:`, comp.props);
      
      // Intentar acceder a las taxonomías
      try {
        comp.props.forEach(prop => {
          const valor = comp.proxy[prop];
          if (valor !== undefined) {
            console.log(`   ${prop}:`, valor);
          }
        });
      } catch (e) {
        console.log('   (No se puede acceder a los valores)');
      }
    });
    
    // Guardar referencia global
    window.vueComponentesTax = componentesConTaxonomias;
    console.log('\n💡 Los componentes se guardaron en window.vueComponentesTax');
    console.log('   Puedes acceder con: window.vueComponentesTax[0].proxy');
  }
  
  // 5. Método alternativo: buscar por DOM
  console.log('\n🔍 BUSCANDO POR DOM:');
  
  const elementosVue = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.__vueParentComponent && !el.__explorado) {
      el.__explorado = true;
      
      try {
        const comp = el.__vueParentComponent;
        const tipo = comp.type?.name || 'Anónimo';
        
        if (tipo.includes('Acordeon') || tipo.includes('Incidente')) {
          elementosVue.push({
            elemento: el,
            clase: el.className,
            tipo: tipo,
            componente: comp
          });
        }
      } catch (e) {}
    }
  });
  
  console.log(`Elementos Vue encontrados: ${elementosVue.length}`);
  
  if (elementosVue.length > 0) {
    console.log('\n📋 ELEMENTOS CON COMPONENTES:');
    elementosVue.forEach((item, i) => {
      console.log(`\n${i + 1}. ${item.tipo}`);
      console.log(`   Clase: ${item.clase}`);
      console.log(`   Elemento:`, item.elemento);
    });
    
    window.vueElementos = elementosVue;
    console.log('\n💡 Los elementos se guardaron en window.vueElementos');
  }
  
  // 6. Buscar específicamente el acordeón
  console.log('\n🔍 BUSCANDO ACORDEÓN ESPECÍFICO:');
  const acordeon = document.querySelector('.acordeon-incidente-mejorado');
  
  if (acordeon) {
    console.log('✅ Acordeón encontrado');
    
    // Buscar componente Vue asociado
    let current = acordeon;
    let found = false;
    
    while (current && !found) {
      if (current.__vueParentComponent) {
        const comp = current.__vueParentComponent;
        console.log(`Componente encontrado: ${comp.type?.name}`);
        
        // Intentar acceder al proxy
        if (comp.proxy) {
          try {
            const keys = Object.keys(comp.proxy);
            console.log('Props disponibles:', keys.slice(0, 10), '...');
            
            if (keys.some(k => k.includes('taxonom'))) {
              console.log('✅ ESTE ES EL COMPONENTE CON TAXONOMÍAS');
              window.acordeonComponent = comp.proxy;
              console.log('💡 Guardado en window.acordeonComponent');
              found = true;
            }
          } catch (e) {
            console.log('No se pueden enumerar las props');
          }
        }
      }
      current = current.parentElement;
    }
  }
  
  console.log('\n✅ EXPLORACIÓN COMPLETADA');
  console.log('Revisa las variables globales:');
  console.log('- window.vueComponentesTax');
  console.log('- window.vueElementos');
  console.log('- window.acordeonComponent');
})();