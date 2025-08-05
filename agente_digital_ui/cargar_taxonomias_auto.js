// SCRIPT PARA CARGAR TAXONOMÍAS AUTOMÁTICAMENTE
// ==============================================
// Este script simula la carga automática de taxonomías al editar

(function() {
  console.clear();
  console.log('🔄 CARGANDO TAXONOMÍAS AUTOMÁTICAMENTE');
  console.log('='.repeat(80));
  
  // Datos de la taxonomía guardada (obtenidos de la BD)
  const taxonomiaGuardada = {
    "Id_Taxonomia": "INC_USO_PHIP_ECDP",
    "nombre": "Actividades de phishing o fraude en infraestructura propia",
    "Descripcion": "Uso de los servidores de la institución para generar correos fraudulentos o spam.",
    "categoria": "Envío de correo no deseado o phishing desde infraestructura propia",
    "justificacion": "asdfsadf sdf sadf s sdf sadf sdf",
    "descripcionProblema": "dfsffffffffffffffffffffffffffffffffffffffffffffffff ffffffffffffff22222",
    "archivos": [{
      "nombre": "evidencia_Actividades_de_phishing_o_fraude_en_infraestructura_propia.pdf",
      "tamaño": 51200,
      "tipo": "application/pdf"
    }]
  };
  
  // Esperar a que el componente esté listo
  setTimeout(() => {
    console.log('\n1️⃣ Buscando sección de taxonomías...');
    
    const secciones = document.querySelectorAll('.acordeon-seccion');
    let seccionTaxonomia = null;
    
    secciones.forEach(seccion => {
      const titulo = seccion.querySelector('.seccion-titulo')?.textContent || '';
      if (titulo.includes('Taxonomía')) {
        seccionTaxonomia = seccion;
      }
    });
    
    if (!seccionTaxonomia) {
      console.error('❌ No se encontró la sección de taxonomías');
      return;
    }
    
    // Expandir la sección si no está activa
    if (!seccionTaxonomia.classList.contains('activa')) {
      const header = seccionTaxonomia.querySelector('.seccion-header');
      if (header) {
        header.click();
        console.log('✅ Sección expandida');
      }
    }
    
    // Esperar a que se carguen las taxonomías
    setTimeout(() => {
      console.log('\n2️⃣ Buscando la taxonomía específica...');
      
      const taxonomias = seccionTaxonomia.querySelectorAll('.taxonomia-item');
      let taxonomiaEncontrada = false;
      
      taxonomias.forEach(tax => {
        // Buscar específicamente por el ID
        const idElement = tax.querySelector('[data-taxonomy-id]');
        const taxId = idElement?.dataset.taxonomyId || '';
        const texto = tax.textContent || '';
        
        // Solo marcar la taxonomía específica que fue guardada
        if (taxId === taxonomiaGuardada.Id_Taxonomia || 
            (texto.includes(taxonomiaGuardada.nombre) && 
             texto.includes('INC_USO_PHIP_ECDP'))) {
          
          console.log('✅ Taxonomía específica encontrada:', taxonomiaGuardada.Id_Taxonomia);
          taxonomiaEncontrada = true;
          
          // Marcar solo esta taxonomía
          tax.classList.add('seleccionada');
          
          // Marcar el checkbox
          const checkbox = tax.querySelector('input[type="checkbox"]');
          if (checkbox && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
          
          // Expandir la taxonomía
          if (!tax.classList.contains('expandida')) {
            const botonExpandir = tax.querySelector('.toggle-icon, [class*="expand"], button');
            if (botonExpandir) {
              botonExpandir.click();
              console.log('✅ Taxonomía expandida');
            }
          }
          
          // Rellenar los campos después de expandir
          setTimeout(() => {
            console.log('\n3️⃣ Rellenando campos guardados...');
            
            const campos = tax.querySelectorAll('textarea, input[type="text"]');
            campos.forEach(campo => {
              const label = campo.previousElementSibling?.textContent || 
                          campo.closest('label')?.textContent || 
                          campo.getAttribute('placeholder') || '';
              
              if (label.includes('Justificación')) {
                campo.value = taxonomiaGuardada.justificacion;
                campo.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('✅ Justificación cargada');
              } else if (label.includes('Descripción') || label.includes('problema')) {
                campo.value = taxonomiaGuardada.descripcionProblema;
                campo.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('✅ Descripción cargada');
              }
            });
            
            // Mostrar archivos
            if (taxonomiaGuardada.archivos.length > 0) {
              console.log('\n4️⃣ Mostrando archivos adjuntos...');
              const archivoContainer = tax.querySelector('.archivos-lista, .archivos-container, [class*="archivo"]');
              
              if (archivoContainer) {
                archivoContainer.innerHTML = taxonomiaGuardada.archivos.map(archivo => `
                  <div class="archivo-item" style="padding: 8px; background: rgba(16, 185, 129, 0.1); border-radius: 4px; margin-top: 8px;">
                    <i class="ph-file-pdf" style="color: #10b981;"></i>
                    <span style="margin-left: 8px;">${archivo.nombre}</span>
                    <span style="margin-left: 8px; color: #6b7280; font-size: 0.875rem;">(${(archivo.tamaño / 1024).toFixed(0)} KB)</span>
                  </div>
                `).join('');
                console.log('✅ Archivos mostrados');
              }
            }
          }, 300);
        }
      });
      
      if (taxonomiaEncontrada) {
        // Actualizar el badge
        const badge = seccionTaxonomia.querySelector('.badge-count');
        if (badge) {
          badge.textContent = '1';
          badge.style.display = 'inline-flex';
          badge.style.backgroundColor = '#10b981';
        }
        
        console.log('\n✅ CARGA AUTOMÁTICA COMPLETADA');
        console.log('La taxonomía guardada ha sido cargada correctamente');
      } else {
        console.warn('⚠️ No se encontró la taxonomía específica guardada');
      }
      
    }, 500);
    
  }, 1000); // Esperar a que el componente se monte
  
})();