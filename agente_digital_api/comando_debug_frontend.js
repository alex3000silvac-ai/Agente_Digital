// COMANDO PARA PEGAR EN LA CONSOLA DEL NAVEGADOR
// En http://localhost:5173/incidente-detalle/25

// 1. Primero verificar si hay taxonomías cargadas
console.log('🔍 VERIFICANDO TAXONOMÍAS EN EL FRONTEND');
window.debugTaxonomias();

// 2. Hacer llamada manual al endpoint
fetch('http://localhost:5000/api/incidentes/25/cargar-completo', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('📡 Status:', response.status);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('✅ RESPUESTA DEL BACKEND:');
    console.log(data);
    
    if (data.taxonomias_seleccionadas) {
        console.log('📊 TAXONOMÍAS RECIBIDAS:', data.taxonomias_seleccionadas.length);
        
        data.taxonomias_seleccionadas.forEach((tax, index) => {
            console.log(`\n🏷️ Taxonomía ${index + 1}:`);
            console.log(`   - id: "${tax.id || 'NO TIENE'}"`);
            console.log(`   - Id_Taxonomia: "${tax.Id_Taxonomia || 'NO TIENE'}"`);
            console.log(`   - justificacion: "${tax.justificacion || 'NO TIENE'}"`);
            console.log(`   - descripcionProblema: "${tax.descripcionProblema || 'NO TIENE'}"`);
            console.log(`   - nombre: "${tax.nombre || 'NO TIENE'}"`);
            
            if (!tax.id) {
                console.error('   ❌ FALTA campo "id" - El frontend no lo mostrará');
            }
            if (!tax.justificacion) {
                console.error('   ❌ FALTA campo "justificacion"');
            }
        });
    } else {
        console.error('❌ NO HAY taxonomias_seleccionadas en la respuesta');
    }
})
.catch(error => {
    console.error('❌ Error:', error);
    console.log('Posibles causas:');
    console.log('- El servidor Flask no está corriendo en http://localhost:5000');
    console.log('- Problema de CORS');
    console.log('- Token de autenticación inválido');
});

// 3. Verificar el componente Vue
setTimeout(() => {
    console.log('\n📋 VERIFICANDO COMPONENTE VUE:');
    const app = document.querySelector('#app').__vue_app__;
    if (app) {
        console.log('✅ App Vue encontrada');
        // Intentar encontrar el componente AcordeonIncidenteMejorado
        console.log('Buscar componente con window.debugTaxonomias()');
    } else {
        console.error('❌ No se encontró la app Vue');
    }
}, 1000);