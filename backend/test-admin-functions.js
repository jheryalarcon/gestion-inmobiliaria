import axios from 'axios';

// Configuración
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'TU_TOKEN_AQUI'; // Reemplazar con un token válido

// Función para probar las funcionalidades administrativas
async function testAdminFunctions() {
    console.log('🧪 Iniciando pruebas de funcionalidades administrativas...\n');

    try {
        // 1. Probar obtener propiedades
        console.log('1️⃣ Probando obtener propiedades...');
        const propiedadesRes = await axios.get(`${BASE_URL}/propiedades`, {
            headers: { Authorization: `Bearer ${TEST_TOKEN}` }
        });
        console.log(`✅ Propiedades obtenidas: ${propiedadesRes.data.length}`);
        
        if (propiedadesRes.data.length > 0) {
            const primeraPropiedad = propiedadesRes.data[0];
            console.log(`   Primera propiedad: ${primeraPropiedad.titulo} (ID: ${primeraPropiedad.id})`);
            
            // 2. Probar obtener propiedad por ID
            console.log('\n2️⃣ Probando obtener propiedad por ID...');
            const propiedadRes = await axios.get(`${BASE_URL}/propiedades/${primeraPropiedad.id}`, {
                headers: { Authorization: `Bearer ${TEST_TOKEN}` }
            });
            console.log(`✅ Propiedad obtenida: ${propiedadRes.data.titulo}`);
            
            // 3. Probar actualizar estado de propiedad
            console.log('\n3️⃣ Probando actualizar estado de propiedad...');
            const nuevoEstado = 'reservada';
            const estadoRes = await axios.patch(`${BASE_URL}/propiedades/${primeraPropiedad.id}/estado`, 
                { nuevoEstado },
                { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
            );
            console.log(`✅ Estado actualizado: ${estadoRes.data.mensaje}`);
            
            // 4. Probar actualizar propiedad
            console.log('\n4️⃣ Probando actualizar propiedad...');
            const datosActualizados = {
                titulo: `${primeraPropiedad.titulo} (Actualizado)`,
                precio: primeraPropiedad.precio + 1000
            };
            const actualizarRes = await axios.put(`${BASE_URL}/propiedades/${primeraPropiedad.id}`, 
                datosActualizados,
                { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
            );
            console.log(`✅ Propiedad actualizada: ${actualizarRes.data.mensaje}`);
            
            // 5. Probar eliminar propiedad (soft delete)
            console.log('\n5️⃣ Probando eliminar propiedad...');
            const eliminarRes = await axios.delete(`${BASE_URL}/propiedades/${primeraPropiedad.id}`, {
                headers: { Authorization: `Bearer ${TEST_TOKEN}` }
            });
            console.log(`✅ Propiedad eliminada: ${eliminarRes.data.mensaje}`);
        } else {
            console.log('⚠️ No hay propiedades para probar');
        }
        
        console.log('\n🎉 Todas las pruebas completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('💡 Sugerencia: Verifica que el token sea válido');
        } else if (error.response?.status === 403) {
            console.log('💡 Sugerencia: Verifica que el usuario tenga permisos de administrador');
        }
    }
}

// Ejecutar pruebas
testAdminFunctions();
