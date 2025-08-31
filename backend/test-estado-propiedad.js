import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// Función para probar la actualización de estado
async function testActualizarEstado() {
    try {
        // Primero necesitamos obtener un token válido
        console.log('🔍 Probando actualización de estado de propiedad...');
        
        // Obtener propiedades para ver si hay alguna disponible
        const response = await axios.get(`${BASE_URL}/propiedades`);
        console.log('Propiedades disponibles:', response.data.length);
        
        if (response.data.length > 0) {
            const primeraPropiedad = response.data[0];
            console.log('Propiedad a probar:', {
                id: primeraPropiedad.id,
                titulo: primeraPropiedad.titulo,
                estado_actual: primeraPropiedad.estado_publicacion
            });
            
            // Probar actualización de estado
            const nuevoEstado = 'reservada';
            console.log(`Intentando cambiar estado a: ${nuevoEstado}`);
            
            const updateResponse = await axios.patch(
                `${BASE_URL}/propiedades/${primeraPropiedad.id}/estado`,
                { nuevoEstado },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Estado actualizado correctamente:', updateResponse.data);
        } else {
            console.log('❌ No hay propiedades disponibles para probar');
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
    }
}

// Ejecutar la prueba
testActualizarEstado();
