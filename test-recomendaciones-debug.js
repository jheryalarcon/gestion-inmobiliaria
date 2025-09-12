// Script para probar el endpoint de recomendaciones
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testRecomendaciones() {
    try {
        console.log('🔍 Probando endpoint de recomendaciones...');
        
        // Primero, intentar obtener un token de usuario
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'cliente@test.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Token obtenido:', token ? 'SÍ' : 'NO');
        
        // Probar el endpoint de recomendaciones
        const recomendacionesResponse = await axios.get(`${BASE_URL}/api/propiedades/recomendaciones?limit=6&k=3`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Recomendaciones obtenidas:', recomendacionesResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
    }
}

testRecomendaciones();

