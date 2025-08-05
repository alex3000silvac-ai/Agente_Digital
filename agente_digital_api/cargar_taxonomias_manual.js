// SCRIPT PARA CARGAR TAXONOMÍAS MANUALMENTE
// ==========================================
// Ejecutar en la consola del navegador mientras estás en el incidente 25

(async function() {
  console.clear();
  console.log('🔧 CARGANDO TAXONOMÍAS MANUALMENTE');
  console.log('='.repeat(80));
  
  try {
    // 1. Verificar que estamos en el incidente correcto
    const url = window.location.href;
    if (!url.includes('incidente-detalle/25')) {
      console.error('❌ No estás en el incidente 25');
      return;
    }
    
    // 2. Intentar cargar las taxonomías del incidente desde el puerto 5000
    console.log('\n1️⃣ Intentando cargar taxonomías desde puerto 5000...');
    
    // Primero verificar qué taxonomías están guardadas
    const token = localStorage.getItem('token');
    
    // Opción 1: Intentar endpoint de taxonomías del incidente si existe
    try {
      const response = await fetch('http://localhost:5000/api/admin/incidentes/25/taxonomias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Taxonomías desde endpoint específico:', data);
      }
    } catch (e) {
      console.log('❌ No existe endpoint de taxonomías específico');
    }
    
    // 3. Buscar el componente Vue
    console.log('\n2️⃣ Buscando componente Vue...');
    
    let componente = null;
    
    // Buscar el componente AcordeonIncidenteMejorado
    const app = document.querySelector('#app')?.__vue_app__;
    if (!app) {
      console.error('❌ No se encontró la app Vue');
      return;
    }
    
    const buscarComponente = (instance, depth = 0) => {
      if (depth > 10) return null; // Evitar recursión infinita
      
      // Verificar si es el componente que buscamos
      if (instance?.type?.name === 'AcordeonIncidenteMejorado' || 
          instance?.proxy?.taxonomiasSeleccionadas !== undefined) {
        return instance.proxy || instance;
      }
      
      // Buscar en subcomponentes
      if (instance?.subTree?.component) {
        const result = buscarComponente(instance.subTree.component, depth + 1);
        if (result) return result;
      }
      
      // Buscar en children
      if (instance?.children) {
        for (let child of instance.children) {
          const result = buscarComponente(child.component || child, depth + 1);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    componente = buscarComponente(app._instance);
    
    if (!componente) {
      console.error('❌ No se encontró el componente AcordeonIncidenteMejorado');
      
      // Intentar método alternativo
      const elementos = document.querySelectorAll('.acordeon-incidente-mejorado');
      for (let el of elementos) {
        if (el.__vueParentComponent?.proxy?.taxonomiasSeleccionadas !== undefined) {
          componente = el.__vueParentComponent.proxy;
          break;
        }
      }
    }
    
    if (componente) {
      console.log('✅ Componente encontrado:', componente);
      
      // 4. Simular datos de taxonomías
      console.log('\n3️⃣ Aplicando datos de taxonomías...');
      
      // Datos de la taxonomía que sabemos que existe
      const taxonomiaSimulada = {
        id: 'INC_USO_PHIP_ECDP',
        Id_Taxonomia: 'INC_USO_PHIP_ECDP',
        nombre: 'Actividades de phishing o fraude en infraestructura propia',
        categoria: 'Envío de correo no deseado o phishing desde infraestructura propia',
        descripcion: 'Uso de los servidores de la institución para generar correos fraudulentos o spam.',
        justificacion: 'asdfsadf sdf sadf s sdf sadf sdf',
        descripcionProblema: 'dfsffffffffffffffffffffffffffffffffffffffffffffffff ffffffffffffff22222',
        archivos: [{
          id: 1,
          nombre: '20250719_230633_evidencia_INC_USO_PHIP_ECDP.pdf',
          nombreOriginal: 'evidencia_Actividades_de_phishing_o_fraude_en_infraestructura_propia.pdf',
          tamaño: 51200,
          tipo: 'application/pdf',
          fechaSubida: '2025-07-19T23:06:33'
        }],
        fechaSeleccion: '2025-07-19T22:40:45',
        usuarioSeleccion: 'Sistema'
      };
      
      // Asignar las taxonomías al componente
      if (componente.taxonomiasSeleccionadas) {
        componente.taxonomiasSeleccionadas = [taxonomiaSimulada];
        console.log('✅ Taxonomías asignadas al componente');
        
        // Forzar actualización si es posible
        if (componente.$forceUpdate) {
          componente.$forceUpdate();
          console.log('✅ Forzada actualización del componente');
        }
        
        // Verificar
        console.log('📋 Taxonomías en el componente:', componente.taxonomiasSeleccionadas);
        console.log('📊 Total archivos:', componente.totalArchivos);
        
        // Ejecutar función debug si existe
        if (componente.debugTaxonomias) {
          componente.debugTaxonomias();
        }
      }
    }
    
    // 5. Aplicar estilos visuales directamente
    console.log('\n4️⃣ Aplicando estilos visuales...');
    
    setTimeout(() => {
      // Marcar la taxonomía como seleccionada
      const taxElement = document.querySelector('[data-taxonomy-id="INC_USO_PHIP_ECDP"]');
      if (taxElement) {
        taxElement.classList.add('seleccionada');
        
        // Marcar el checkbox
        const checkbox = taxElement.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = true;
        }
        
        console.log('✅ Taxonomía marcada visualmente');
      }
      
      // Actualizar contador
      const badge = document.querySelector('.acordeon-seccion:nth-child(4) .badge-count');
      if (badge) {
        badge.textContent = '1';
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
      
      // Expandir sección 7 después de un momento
      setTimeout(() => {
        const secciones = document.querySelectorAll('.acordeon-seccion');
        const seccion7 = Array.from(secciones).find(s => 
          s.textContent.includes('Resumen de todos los archivos')
        );
        
        if (seccion7 && !seccion7.classList.contains('activa')) {
          const header = seccion7.querySelector('.seccion-header');
          if (header) {
            header.click();
            console.log('✅ Sección 7 expandida');
          }
        }
        
        // Verificar si aparecen archivos
        setTimeout(() => {
          const tabla = document.querySelector('table');
          if (tabla) {
            const filas = tabla.querySelectorAll('tr');
            let filasSeccion4 = 0;
            
            filas.forEach(tr => {
              const celdas = tr.querySelectorAll('td');
              if (celdas.length > 0 && celdas[0]?.textContent?.trim() === '4') {
                filasSeccion4++;
                console.log(`📄 Archivo sección 4 encontrado: ${celdas[3]?.textContent}`);
              }
            });
            
            console.log(`\n📊 RESUMEN FINAL:`);
            console.log(`   - Taxonomías marcadas: 1`);
            console.log(`   - Archivos en sección 4: ${filasSeccion4}`);
            
            if (filasSeccion4 === 0) {
              console.log('   ⚠️ Los archivos no aparecen en la tabla');
              console.log('   Esto indica que el componente no está procesando correctamente los archivos');
            }
          }
        }, 1000);
      }, 500);
      
    }, 500);
    
    console.log('\n✅ PROCESO COMPLETADO');
    console.log('Verifica:');
    console.log('1. ¿La taxonomía se ve con borde verde?');
    console.log('2. ¿Los datos aparecen en el formulario?');
    console.log('3. ¿Los archivos aparecen en la sección 7?');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();