// SCRIPT PARA EXPLORAR LA ESTRUCTURA VUE
// ======================================

(function() {
  console.clear();
  console.log('🔍 EXPLORANDO ESTRUCTURA VUE');
  console.log('='.repeat(80));
  
  // 1. Buscar la app Vue
  const app = document.querySelector('#app')?.__vue_app__;
  
  if (!app) {
    console.error('❌ No se encontró la app Vue');
    return;
  }
  
  console.log('✅ App Vue encontrada');
  
  // 2. Función para explorar componentes
  const componentes = [];
  let contador = 0;
  
  function explorarComponente(instance, nivel = 0, path = 'root') {
    if (!instance || nivel > 5) return;
    
    contador++;
    
    // Obtener información del componente
    const info = {
      path: path,
      tipo: instance.type?.name || 'Anónimo',
      props: instance.proxy ? Object.keys(instance.proxy) : [],
      tieneTaxonomias: false
    };
    
    // Buscar propiedades relacionadas con taxonomías
    if (instance.proxy) {
      const propsTax = info.props.filter(p => 
        p.toLowerCase().includes('taxonom') || 
        p.toLowerCase().includes('tax') ||
        p.toLowerCase().includes('seleccionad')
      );
      
      if (propsTax.length > 0) {
        info.tieneTaxonomias = true;
        info.propsTaxonomia = propsTax;
        console.log(`\n🎯 COMPONENTE CON TAXONOMÍAS ENCONTRADO:`);
        console.log(`   Path: ${path}`);
        console.log(`   Tipo: ${info.tipo}`);
        console.log(`   Props taxonomía:`, propsTax);
        console.log(`   Instancia:`, instance.proxy);
      }
    }
    
    componentes.push(info);
    
    // Explorar hijos
    if (instance.subTree) {
      explorarComponente(instance.subTree, nivel + 1, path + '/subTree');
    }
    
    if (instance.component) {
      explorarComponente(instance.component, nivel + 1, path + '/component');
    }
    
    if (instance.children) {
      instance.children.forEach((child, i) => {
        explorarComponente(child, nivel + 1, path + `/children[${i}]`);
      });
    }
  }
  
  // 3. Explorar
  console.log('\n🔍 Explorando componentes...');
  explorarComponente(app._instance);
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total componentes explorados: ${contador}`);
  console.log(`   Componentes con taxonomías: ${componentes.filter(c => c.tieneTaxonomias).length}`);
  
  // 4. Mostrar componentes principales
  console.log('\n📋 COMPONENTES PRINCIPALES:');
  const principales = componentes.filter(c => 
    c.tipo !== 'Anónimo' && 
    (c.tipo.includes('Vista') || c.tipo.includes('Acordeon') || c.tipo.includes('Incidente'))
  );
  
  principales.forEach(comp => {
    console.log(`\n   ${comp.tipo}:`);
    console.log(`   - Path: ${comp.path}`);
    console.log(`   - Props (primeras 5):`, comp.props.slice(0, 5));
  });
  
  // 5. Buscar por DOM
  console.log('\n🔍 BUSCANDO POR DOM:');
  const elementos = document.querySelectorAll('[class*="acordeon"], [class*="incidente"], [class*="taxonom"]');
  console.log(`Elementos DOM encontrados: ${elementos.length}`);
  
  elementos.forEach(el => {
    if (el.__vueParentComponent) {
      console.log(`\n   Elemento: ${el.className}`);
      console.log(`   Componente Vue:`, el.__vueParentComponent.type?.name);
    }
  });
  
  // 6. Comando para acceder al componente
  const conTax = componentes.find(c => c.tieneTaxonomias);
  if (conTax) {
    console.log('\n✅ PARA ACCEDER AL COMPONENTE CON TAXONOMÍAS:');
    console.log(`   const comp = document.querySelector('#app').__vue_app__._instance${conTax.path.replace('root', '')}.proxy`);
  }
})();