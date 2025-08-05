// INYECCIÓN DIRECTA DE TAXONOMÍAS
// ================================

(function() {
  console.clear();
  console.log('💉 INYECCIÓN DIRECTA DE TAXONOMÍAS');
  console.log('='.repeat(80));
  
  // 1. Primero, expandir la sección de taxonomías
  console.log('\n1️⃣ Expandiendo sección de taxonomías...');
  
  const secciones = document.querySelectorAll('.acordeon-seccion');
  let seccionTaxonomia = null;
  
  secciones.forEach(seccion => {
    const titulo = seccion.querySelector('.seccion-titulo')?.textContent || '';
    if (titulo.includes('Taxonomía') || titulo.includes('taxonomía')) {
      seccionTaxonomia = seccion;
      
      // Expandir si no está activa
      if (!seccion.classList.contains('activa')) {
        const header = seccion.querySelector('.seccion-header');
        if (header) {
          header.click();
          console.log('✅ Sección de taxonomías expandida');
        }
      }
    }
  });
  
  if (!seccionTaxonomia) {
    console.error('❌ No se encontró la sección de taxonomías');
    return;
  }
  
  // 2. Buscar y marcar la taxonomía específica
  setTimeout(() => {
    console.log('\n2️⃣ Buscando taxonomías...');
    
    const taxonomias = seccionTaxonomia.querySelectorAll('.taxonomia-item');
    console.log(`Encontradas ${taxonomias.length} taxonomías`);
    
    let taxonomiaPhishing = null;
    
    taxonomias.forEach(tax => {
      const texto = tax.textContent || '';
      if (texto.includes('phishing') || texto.includes('INC_USO_PHIP_ECDP')) {
        taxonomiaPhishing = tax;
        console.log('✅ Encontrada taxonomía de phishing');
        
        // Marcar como seleccionada
        tax.classList.add('seleccionada');
        
        // Marcar el checkbox
        const checkbox = tax.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
          checkbox.checked = true;
          
          // Disparar evento change
          const event = new Event('change', { bubbles: true });
          checkbox.dispatchEvent(event);
          
          console.log('✅ Checkbox marcado');
        }
        
        // Expandir la taxonomía
        if (!tax.classList.contains('expandida')) {
          const botonExpandir = tax.querySelector('.toggle-icon, .expandir-btn, [class*="expand"]');
          if (botonExpandir) {
            botonExpandir.click();
            console.log('✅ Taxonomía expandida');
          }
        }
      }
    });
    
    // 3. Rellenar los campos de justificación y descripción
    if (taxonomiaPhishing) {
      setTimeout(() => {
        console.log('\n3️⃣ Rellenando campos...');
        
        // Buscar campos dentro de la taxonomía
        const campos = taxonomiaPhishing.querySelectorAll('textarea, input[type="text"]');
        
        campos.forEach(campo => {
          const label = campo.previousElementSibling?.textContent || 
                       campo.closest('label')?.textContent || '';
          
          if (label.includes('Justificación') && !campo.value) {
            campo.value = 'asdfsadf sdf sadf s sdf sadf sdf';
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ Justificación rellenada');
          } else if (label.includes('Descripción') && !campo.value) {
            campo.value = 'dfsffffffffffffffffffffffffffffffffffffffffffffffff ffffffffffffff22222';
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ Descripción rellenada');
          }
        });
        
        // 4. Simular archivo adjunto
        console.log('\n4️⃣ Agregando referencia de archivo...');
        
        const archivoInfo = taxonomiaPhishing.querySelector('.archivos-lista, .archivos-container, [class*="archivo"]');
        if (archivoInfo && !archivoInfo.textContent.includes('.pdf')) {
          const archivoHTML = `
            <div class="archivo-item" style="padding: 8px; background: rgba(16, 185, 129, 0.1); border-radius: 4px; margin-top: 8px;">
              <i class="ph-file-pdf" style="color: #10b981;"></i>
              <span style="margin-left: 8px;">evidencia_Actividades_de_phishing_o_fraude_en_infraestructura_propia.pdf</span>
              <span style="margin-left: 8px; color: #6b7280; font-size: 0.875rem;">(50 KB)</span>
            </div>
          `;
          archivoInfo.insertAdjacentHTML('beforeend', archivoHTML);
          console.log('✅ Referencia de archivo agregada');
        }
        
        // 5. Actualizar el badge
        const badge = seccionTaxonomia.querySelector('.badge-count');
        if (badge) {
          badge.textContent = '1';
          badge.style.display = 'inline-flex';
          badge.style.backgroundColor = '#10b981';
          console.log('✅ Badge actualizado');
        }
        
        // 6. Expandir sección 7
        setTimeout(() => {
          console.log('\n5️⃣ Expandiendo sección 7...');
          
          const seccion7 = Array.from(secciones).find(s => 
            s.textContent.includes('Resumen de todos los archivos')
          );
          
          if (seccion7 && !seccion7.classList.contains('activa')) {
            const header = seccion7.querySelector('.seccion-header');
            if (header) {
              header.click();
              console.log('✅ Sección 7 expandida');
              
              // Verificar si hay archivos de taxonomía
              setTimeout(() => {
                const tabla = seccion7.querySelector('table');
                if (tabla) {
                  const filas = tabla.querySelectorAll('tr');
                  let encontrado = false;
                  
                  filas.forEach(tr => {
                    const celdas = tr.querySelectorAll('td');
                    if (celdas.length > 0 && celdas[0]?.textContent?.trim() === '4') {
                      encontrado = true;
                    }
                  });
                  
                  if (!encontrado) {
                    console.log('⚠️ No se encontraron archivos de sección 4 en la tabla');
                    
                    // Intentar agregar fila manualmente
                    const tbody = tabla.querySelector('tbody');
                    if (tbody) {
                      const nuevaFila = `
                        <tr>
                          <td class="text-center">4</td>
                          <td>Taxonomía del Incidente</td>
                          <td>INC_USO_PHIP_ECDP</td>
                          <td>evidencia_phishing.pdf</td>
                          <td>PDF</td>
                          <td>50 KB</td>
                          <td>19/07/2025</td>
                        </tr>
                      `;
                      tbody.insertAdjacentHTML('beforeend', nuevaFila);
                      console.log('✅ Fila agregada manualmente a la tabla');
                    }
                  } else {
                    console.log('✅ Archivos de sección 4 encontrados en la tabla');
                  }
                }
              }, 500);
            }
          }
        }, 1000);
        
        console.log('\n✅ PROCESO COMPLETADO');
        console.log('La taxonomía debería estar visible con:');
        console.log('- ✓ Checkbox marcado');
        console.log('- ✓ Borde verde');
        console.log('- ✓ Campos rellenados');
        console.log('- ✓ Archivo visible');
        
      }, 500);
    }
    
  }, 500);
})();