// INYECTAR TAXONOMÍAS MANUALMENTE
// ================================
// Usar cuando el endpoint falla pero sabemos que los datos existen

(function() {
  console.clear();
  console.log('💉 INYECCIÓN MANUAL DE TAXONOMÍAS');
  console.log('='.repeat(80));
  
  // Datos de la taxonomía que sabemos que existe (del test directo)
  const taxonomiasDelIncidente = [{
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
  
  // 1. Buscar el componente Vue
  console.log('\n1️⃣ Buscando componente Vue...');
  
  const app = document.querySelector('#app')?.__vue_app__;
  if (!app) {
    console.error('❌ No se encontró la app Vue');
    return;
  }
  
  let componente = null;
  const buscarComponente = (instance, depth = 0, path = '') => {
    if (depth > 15) return false;
    
    // Buscar por proxy
    if (instance?.proxy) {
      if (instance.proxy.taxonomiasSeleccionadas !== undefined) {
        componente = instance.proxy;
        console.log(`✅ Componente encontrado en: ${path}`);
        return true;
      }
    }
    
    // Buscar por setupState
    if (instance?.setupState) {
      if (instance.setupState.taxonomiasSeleccionadas !== undefined) {
        componente = instance.setupState;
        console.log(`✅ Componente encontrado en setupState: ${path}`);
        return true;
      }
    }
    
    // Buscar en hijos
    if (instance?.subTree) {
      if (buscarComponente(instance.subTree, depth + 1, path + '.subTree')) return true;
    }
    
    if (instance?.component) {
      if (buscarComponente(instance.component, depth + 1, path + '.component')) return true;
    }
    
    if (instance?.children && Array.isArray(instance.children)) {
      for (let i = 0; i < instance.children.length; i++) {
        if (buscarComponente(instance.children[i], depth + 1, path + `.children[${i}]`)) return true;
      }
    }
    
    return false;
  };
  
  buscarComponente(app._instance, 0, 'root');
  
  if (!componente) {
    console.error('❌ No se encontró el componente con taxonomías');
    
    // Método alternativo: buscar por clase
    console.log('\n2️⃣ Buscando por clase CSS...');
    const acordeon = document.querySelector('.acordeon-incidente-mejorado');
    if (acordeon) {
      // Buscar en el árbol de componentes Vue
      let current = acordeon;
      while (current) {
        if (current.__vueParentComponent?.proxy?.taxonomiasSeleccionadas !== undefined) {
          componente = current.__vueParentComponent.proxy;
          console.log('✅ Componente encontrado por DOM');
          break;
        }
        if (current.__vueParentComponent?.setupState?.taxonomiasSeleccionadas !== undefined) {
          componente = current.__vueParentComponent.setupState;
          console.log('✅ Componente encontrado por DOM (setupState)');
          break;
        }
        current = current.parentElement;
      }
    }
  }
  
  if (!componente) {
    console.error('❌ No se pudo encontrar el componente de ninguna manera');
    return;
  }
  
  // 2. Asignar las taxonomías
  console.log('\n3️⃣ Asignando taxonomías...');
  componente.taxonomiasSeleccionadas = taxonomiasDelIncidente;
  console.log('✅ Taxonomías asignadas:', componente.taxonomiasSeleccionadas);
  
  // Forzar actualización
  if (componente.$forceUpdate) {
    componente.$forceUpdate();
    console.log('✅ Componente actualizado');
  }
  
  // Guardar referencia global
  window.vueComponenteTax = componente;
  console.log('\n💡 Componente guardado en window.vueComponenteTax');
  
  // 3. Actualizar visualmente después de un momento
  setTimeout(() => {
    console.log('\n4️⃣ Actualizando elementos visuales...');
    
    // Buscar sección de taxonomías
    const secciones = document.querySelectorAll('.acordeon-seccion');
    let seccionTaxonomia = null;
    
    secciones.forEach(seccion => {
      const titulo = seccion.querySelector('.seccion-titulo')?.textContent || '';
      if (titulo.includes('Taxonomía')) {
        seccionTaxonomia = seccion;
      }
    });
    
    if (seccionTaxonomia) {
      // Actualizar badge
      const badge = seccionTaxonomia.querySelector('.badge-count');
      if (badge) {
        badge.textContent = '1';
        badge.style.display = 'inline-flex';
        console.log('✅ Badge actualizado');
      }
      
      // Expandir sección
      if (!seccionTaxonomia.classList.contains('activa')) {
        const header = seccionTaxonomia.querySelector('.seccion-header');
        if (header) {
          header.click();
          console.log('✅ Sección expandida');
        }
      }
    }
    
    // 4. Verificar sección 7
    setTimeout(() => {
      console.log('\n5️⃣ Verificando sección 7...');
      
      const seccion7 = Array.from(secciones).find(s => 
        s.textContent.includes('Resumen de todos los archivos')
      );
      
      if (seccion7) {
        // Expandir
        if (!seccion7.classList.contains('activa')) {
          const header = seccion7.querySelector('.seccion-header');
          if (header) header.click();
        }
        
        // Verificar archivos
        setTimeout(() => {
          const tabla = seccion7.querySelector('table');
          if (tabla) {
            const filas = tabla.querySelectorAll('tbody tr');
            let filasSeccion4 = 0;
            
            filas.forEach(fila => {
              const celdas = fila.querySelectorAll('td');
              if (celdas.length > 0 && celdas[0]?.textContent?.trim() === '4') {
                filasSeccion4++;
              }
            });
            
            console.log(`\n📊 RESULTADO FINAL:`);
            console.log(`   - Taxonomías cargadas: 1`);
            console.log(`   - Archivos en sección 4: ${filasSeccion4}`);
            
            if (filasSeccion4 === 0) {
              console.log('\n⚠️ Los archivos de taxonomías NO aparecen en sección 7');
              console.log('Verificar el computed property "todosLosArchivos"');
            } else {
              console.log('\n✅ Los archivos de taxonomías SÍ aparecen en sección 7');
            }
          }
        }, 500);
      }
    }, 1000);
    
  }, 500);
  
  console.log('\n✅ INYECCIÓN COMPLETADA');
})();