// SCRIPT PARA INYECTAR TAXONOMÍAS DIRECTAMENTE
// ==========================================
// Ejecutar en la consola del navegador mientras estás en el incidente 25

(async function() {
  console.clear();
  console.log('🔧 INYECTANDO TAXONOMÍAS MANUALMENTE');
  console.log('='.repeat(80));
  
  try {
    // 1. Verificar que estamos en el incidente correcto
    const url = window.location.href;
    if (!url.includes('incidente-detalle/25')) {
      console.error('❌ No estás en el incidente 25');
      return;
    }
    
    // 2. Datos de la taxonomía que sabemos que existe
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
    
    // 3. Buscar el componente Vue
    console.log('\n🔍 Buscando componente Vue...');
    
    const app = document.querySelector('#app')?.__vue_app__;
    if (!app) {
      console.error('❌ No se encontró la app Vue');
      return;
    }
    
    // Función para buscar el componente recursivamente
    const buscarComponente = (instance, depth = 0) => {
      if (depth > 10) return null;
      
      // Verificar si tiene taxonomiasSeleccionadas
      if (instance?.proxy?.taxonomiasSeleccionadas !== undefined) {
        return instance.proxy;
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
    
    const componente = buscarComponente(app._instance);
    
    if (!componente) {
      console.error('❌ No se encontró el componente con taxonomiasSeleccionadas');
      return;
    }
    
    console.log('✅ Componente encontrado:', componente);
    
    // 4. Asignar las taxonomías
    console.log('\n📝 Asignando taxonomías...');
    componente.taxonomiasSeleccionadas = taxonomiaData;
    
    // Forzar actualización
    if (componente.$forceUpdate) {
      componente.$forceUpdate();
    }
    
    // 5. Aplicar estilos visuales
    console.log('\n🎨 Aplicando estilos visuales...');
    
    setTimeout(() => {
      // Buscar el elemento de la taxonomía
      const taxonomias = document.querySelectorAll('.taxonomia-item');
      taxonomias.forEach(tax => {
        const titulo = tax.querySelector('.taxonomia-titulo')?.textContent;
        if (titulo && titulo.includes('phishing')) {
          tax.classList.add('seleccionada');
          const checkbox = tax.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = true;
          console.log('✅ Taxonomía marcada visualmente');
        }
      });
      
      // Actualizar badge
      const secciones = document.querySelectorAll('.acordeon-seccion');
      secciones.forEach(seccion => {
        const titulo = seccion.querySelector('.seccion-titulo')?.textContent;
        if (titulo && titulo.includes('Taxonomía')) {
          const badge = seccion.querySelector('.badge-count');
          if (badge) {
            badge.textContent = '1';
            badge.style.display = 'inline-flex';
          }
        }
      });
      
      // Expandir sección de taxonomías
      const seccionTax = Array.from(secciones).find(s => 
        s.textContent.includes('Taxonomía')
      );
      if (seccionTax && !seccionTax.classList.contains('activa')) {
        const header = seccionTax.querySelector('.seccion-header');
        if (header) header.click();
      }
      
      console.log('\n✅ PROCESO COMPLETADO');
      console.log('📊 Estado final:');
      console.log('   - Taxonomías cargadas:', componente.taxonomiasSeleccionadas?.length || 0);
      console.log('   - Total archivos:', componente.totalArchivos || 0);
      
      // Verificar sección 7
      setTimeout(() => {
        const seccion7 = Array.from(secciones).find(s => 
          s.textContent.includes('Resumen de todos los archivos')
        );
        if (seccion7 && !seccion7.classList.contains('activa')) {
          const header = seccion7.querySelector('.seccion-header');
          if (header) header.click();
        }
        
        // Verificar archivos en tabla
        setTimeout(() => {
          const filas = document.querySelectorAll('table tr');
          let filasSeccion4 = 0;
          
          filas.forEach(tr => {
            const celdas = tr.querySelectorAll('td');
            if (celdas.length > 0 && celdas[0]?.textContent?.trim() === '4') {
              filasSeccion4++;
            }
          });
          
          console.log(`\n📄 Archivos de taxonomías en sección 7: ${filasSeccion4}`);
          if (filasSeccion4 === 0) {
            console.log('⚠️ Los archivos no aparecen en la sección 7');
            console.log('Esto indica que todosLosArchivos no incluye las taxonomías');
          }
        }, 500);
      }, 1000);
      
    }, 500);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();