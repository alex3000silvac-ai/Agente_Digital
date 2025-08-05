// SCRIPT MEJORADO PARA INYECTAR TAXONOMÍAS
// =========================================
// Ejecutar en la consola del navegador mientras estás en el incidente 25

(async function() {
  console.clear();
  console.log('🔧 INYECTANDO TAXONOMÍAS - VERSIÓN 2');
  console.log('='.repeat(80));
  
  try {
    // 1. Verificar que estamos en el incidente correcto
    const url = window.location.href;
    if (!url.includes('incidente') && !url.includes('25')) {
      console.warn('⚠️ Puede que no estés en el incidente 25');
    }
    
    // 2. Buscar la app Vue de diferentes maneras
    console.log('\n🔍 Buscando app Vue...');
    
    let app = null;
    
    // Método 1: querySelector directo
    app = document.querySelector('#app')?.__vue_app__;
    
    // Método 2: Buscar en el body
    if (!app) {
      app = document.body.querySelector('[data-v-app]')?.__vue_app__;
    }
    
    // Método 3: Buscar cualquier elemento con __vue_app__
    if (!app) {
      const elementos = document.querySelectorAll('*');
      for (let el of elementos) {
        if (el.__vue_app__) {
          app = el.__vue_app__;
          break;
        }
      }
    }
    
    if (!app) {
      console.error('❌ No se encontró la app Vue');
      console.log('Intentando método alternativo...');
      
      // Método 4: Buscar componentes directamente
      const componentes = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.__vueParentComponent) {
          componentes.push(el.__vueParentComponent);
        }
      });
      
      console.log(`Encontrados ${componentes.length} componentes`);
      
      // Buscar el componente con taxonomiasSeleccionadas
      for (let comp of componentes) {
        if (comp.proxy?.taxonomiasSeleccionadas !== undefined) {
          console.log('✅ Componente encontrado por método alternativo');
          inyectarTaxonomias(comp.proxy);
          return;
        }
      }
    }
    
    console.log('✅ App Vue encontrada:', app);
    
    // 3. Función mejorada para buscar componente
    let componenteEncontrado = null;
    let contadorBusquedas = 0;
    
    const buscarComponenteRecursivo = (instance, path = '') => {
      contadorBusquedas++;
      
      // Log de debug cada 100 búsquedas
      if (contadorBusquedas % 100 === 0) {
        console.log(`Búsquedas realizadas: ${contadorBusquedas}`);
      }
      
      // Verificar el proxy
      if (instance?.proxy) {
        const props = Object.keys(instance.proxy);
        
        // Buscar por nombre de propiedad
        if (props.includes('taxonomiasSeleccionadas') || 
            props.includes('taxonomias') || 
            props.includes('selectedTaxonomies')) {
          console.log(`✅ Encontrado en ${path} - Props:`, props);
          componenteEncontrado = instance.proxy;
          return true;
        }
        
        // Buscar por nombre de componente
        if (instance.type?.name?.includes('Acordeon') || 
            instance.type?.name?.includes('Incidente')) {
          console.log(`🔍 Componente candidato: ${instance.type.name}`);
          if (instance.proxy.taxonomiasSeleccionadas !== undefined) {
            componenteEncontrado = instance.proxy;
            return true;
          }
        }
      }
      
      // Buscar en subTree
      if (instance?.subTree) {
        if (buscarComponenteRecursivo(instance.subTree, path + '/subTree')) {
          return true;
        }
      }
      
      // Buscar en component
      if (instance?.component) {
        if (buscarComponenteRecursivo(instance.component, path + '/component')) {
          return true;
        }
      }
      
      // Buscar en children
      if (instance?.children) {
        for (let i = 0; i < instance.children.length; i++) {
          if (buscarComponenteRecursivo(instance.children[i], path + `/children[${i}]`)) {
            return true;
          }
        }
      }
      
      // Buscar en suspense
      if (instance?.suspense) {
        if (buscarComponenteRecursivo(instance.suspense, path + '/suspense')) {
          return true;
        }
      }
      
      return false;
    };
    
    console.log('\n🔍 Iniciando búsqueda recursiva del componente...');
    buscarComponenteRecursivo(app._instance, 'root');
    
    if (!componenteEncontrado) {
      console.error('❌ No se encontró el componente después de ' + contadorBusquedas + ' búsquedas');
      
      // Intentar buscar por clase CSS
      console.log('\n🔍 Buscando por clase CSS...');
      const acordeon = document.querySelector('.acordeon-incidente-mejorado');
      if (acordeon) {
        console.log('Encontrado elemento del acordeón:', acordeon);
        
        // Buscar el componente Vue asociado
        let el = acordeon;
        while (el) {
          if (el.__vueParentComponent?.proxy?.taxonomiasSeleccionadas !== undefined) {
            componenteEncontrado = el.__vueParentComponent.proxy;
            console.log('✅ Componente encontrado por elemento DOM');
            break;
          }
          el = el.parentElement;
        }
      }
    }
    
    if (componenteEncontrado) {
      inyectarTaxonomias(componenteEncontrado);
    } else {
      console.error('❌ No se pudo encontrar el componente de ninguna manera');
      console.log('Prueba estos comandos para explorar:');
      console.log('1. document.querySelector("#app").__vue_app__._instance');
      console.log('2. document.querySelectorAll("[class*=acordeon]")');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  function inyectarTaxonomias(componente) {
    console.log('\n✅ COMPONENTE ENCONTRADO:', componente);
    
    // Datos de la taxonomía
    const taxonomiaData = [{
      "Id_Taxonomia": "INC_USO_PHIP_ECDP",
      "nombre": "Actividades de phishing o fraude en infraestructura propia",
      "Descripcion": "Uso de los servidores de la institución para generar correos fraudulentos o spam.",
      "AplicaTipoEmpresa": "AMBAS",
      "Comentarios": "Justificación: asdfsadf sdf sadf s sdf sadf sdf\nDescripción del problema: dfsffffffffffffffffffffffffffffffffffffffffffffffff ffffffffffffff22222",
      "FechaAsignacion": "2025-07-19T22:40:45.620000",
      "CreadoPor": "Sistema",
      "categoria": "Envío de correo no deseado o phishing desde infraestructura propia",
      "justificacion": "asdfsadf sdf sadf s sdf sadf sdf",
      "descripcionProblema": "dfsffffffffffffffffffffffffffffffffffffffffffffffff ffffffffffffff22222",
      "id": "INC_USO_PHIP_ECDP",
      "archivos": [{
        "id": 1,
        "nombre": "20250719_230633_evidencia_INC_USO_PHIP_ECDP.pdf",
        "nombreOriginal": "evidencia_Actividades_de_phishing_o_fraude_en_infraestructura_propia.pdf",
        "ruta": "/uploads/incidentes/25/taxonomias/20250719_230633_evidencia_INC_USO_PHIP_ECDP.pdf",
        "tamaño": 51200,
        "fechaSubida": "2025-07-19T23:06:33.276666"
      }]
    }];
    
    // Asignar taxonomías
    console.log('\n📝 Asignando taxonomías...');
    componente.taxonomiasSeleccionadas = taxonomiaData;
    
    // Verificar si se asignaron
    console.log('Taxonomías asignadas:', componente.taxonomiasSeleccionadas);
    
    // Forzar actualización
    if (componente.$forceUpdate) {
      componente.$forceUpdate();
      console.log('✅ Componente actualizado');
    }
    
    // Esperar un momento y aplicar estilos
    setTimeout(() => {
      aplicarEstilosVisuales();
    }, 500);
  }
  
  function aplicarEstilosVisuales() {
    console.log('\n🎨 Aplicando estilos visuales...');
    
    // Buscar taxonomías
    const taxonomias = document.querySelectorAll('.taxonomia-item');
    console.log(`Encontradas ${taxonomias.length} taxonomías`);
    
    taxonomias.forEach(tax => {
      const texto = tax.textContent;
      if (texto && texto.toLowerCase().includes('phishing')) {
        tax.classList.add('seleccionada');
        const checkbox = tax.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = true;
        }
        console.log('✅ Taxonomía marcada');
      }
    });
    
    // Actualizar badges
    const badges = document.querySelectorAll('.badge-count');
    badges.forEach(badge => {
      const seccion = badge.closest('.acordeon-seccion');
      if (seccion && seccion.textContent.includes('Taxonomía')) {
        badge.textContent = '1';
        badge.style.display = 'inline-flex';
        console.log('✅ Badge actualizado');
      }
    });
    
    console.log('\n✅ PROCESO COMPLETADO');
  }
})();