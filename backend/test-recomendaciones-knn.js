/**
 * Tests BDD para el sistema de recomendaciones KNN con Python/scikit-learn
 * Escenarios basados en los requerimientos del usuario
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const PYTHON_SERVICE_URL = 'http://localhost:5001';
let tokenCliente = '';
let tokenAdmin = '';
let clienteId = '';

// Datos de prueba
const clienteTest = {
    nombre: 'Cliente Test KNN',
    email: 'cliente.knn@test.com',
    password: 'password123',
    telefono: '1234567890'
};

const adminTest = {
    email: 'admin@test.com',
    password: 'admin123'
};

// Función auxiliar para hacer login
async function loginAdmin() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, adminTest);
        tokenAdmin = response.data.token;
        console.log('✅ Admin logueado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al loguear admin:', error.response?.data);
        return false;
    }
}

// Función auxiliar para registrar cliente
async function registrarCliente() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/registro`, clienteTest);
        tokenCliente = response.data.token;
        clienteId = response.data.usuario.id;
        console.log('✅ Cliente registrado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al registrar cliente:', error.response?.data);
        return false;
    }
}

// Función auxiliar para obtener propiedades disponibles
async function obtenerPropiedadesDisponibles() {
    try {
        const response = await axios.get(`${BASE_URL}/propiedades/publicas?limit=10`);
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener propiedades:', error.response?.data);
        return [];
    }
}

// Función auxiliar para marcar propiedad como favorita
async function marcarFavorito(propiedadId) {
    try {
        await axios.post(`${BASE_URL}/favoritos`, 
            { propiedadId }, 
            { headers: { Authorization: `Bearer ${tokenCliente}` } }
        );
        return true;
    } catch (error) {
        console.error('❌ Error al marcar favorito:', error.response?.data);
        return false;
    }
}

// Función auxiliar para eliminar favorito
async function eliminarFavorito(propiedadId) {
    try {
        await axios.delete(`${BASE_URL}/favoritos/${propiedadId}`, 
            { headers: { Authorization: `Bearer ${tokenCliente}` } }
        );
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar favorito:', error.response?.data);
        return false;
    }
}

// Función auxiliar para verificar servicio Python
async function verificarServicioPython() {
    try {
        const response = await axios.get(`${PYTHON_SERVICE_URL}/health`);
        return response.data;
    } catch (error) {
        console.error('❌ Servicio Python no disponible:', error.message);
        return null;
    }
}

// Función auxiliar para obtener recomendaciones
async function obtenerRecomendaciones() {
    try {
        const response = await axios.get(`${BASE_URL}/propiedades/recomendaciones`, 
            { headers: { Authorization: `Bearer ${tokenCliente}` } }
        );
        return response.data;
    } catch (error) {
        console.error('❌ Error al obtener recomendaciones:', error.response?.data);
        return null;
    }
}

// ESCENARIOS BDD

async function escenario1_ClienteRecibeRecomendacionesDespuesDeGuardarFavoritos() {
    console.log('\n🧪 ESCENARIO 1: Cliente recibe recomendaciones después de guardar favoritos');
    console.log('Dado que soy un cliente');
    console.log('Y he guardado al menos una propiedad como favorita');
    console.log('Cuando accedo a la sección "Recomendadas para ti"');
    console.log('Entonces el sistema muestra propiedades similares a las que marqué');
    
    // Obtener propiedades disponibles
    const propiedades = await obtenerPropiedadesDisponibles();
    if (propiedades.length < 2) {
        console.log('❌ No hay suficientes propiedades para el test');
        return false;
    }
    
    // Marcar primera propiedad como favorita
    const primeraPropiedad = propiedades[0];
    const marcado = await marcarFavorito(primeraPropiedad.id);
    if (!marcado) {
        console.log('❌ No se pudo marcar la propiedad como favorita');
        return false;
    }
    
    // Obtener recomendaciones
    const recomendaciones = await obtenerRecomendaciones();
    if (!recomendaciones) {
        console.log('❌ No se pudieron obtener recomendaciones');
        return false;
    }
    
    // Verificar que hay recomendaciones
    if (recomendaciones.recomendaciones.length > 0) {
        console.log('✅ El sistema muestra propiedades similares');
        console.log(`   - Recomendaciones encontradas: ${recomendaciones.recomendaciones.length}`);
        console.log(`   - Algoritmo usado: ${recomendaciones.algoritmo}`);
        console.log(`   - K value: ${recomendaciones.k}`);
        return true;
    } else {
        console.log('❌ No se encontraron recomendaciones');
        return false;
    }
}

async function escenario2_ClienteEliminaTodosSusFavoritos() {
    console.log('\n🧪 ESCENARIO 2: Cliente elimina todos sus favoritos');
    console.log('Dado que soy un cliente');
    console.log('Y elimino todas las propiedades marcadas como favoritas');
    console.log('Cuando accedo a "Recomendadas para ti"');
    console.log('Entonces el sistema muestra un mensaje: "Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero"');
    
    // Obtener favoritos actuales
    try {
        const favoritosResponse = await axios.get(`${BASE_URL}/favoritos`, 
            { headers: { Authorization: `Bearer ${tokenCliente}` } }
        );
        const favoritos = favoritosResponse.data;
        
        // Eliminar todos los favoritos
        for (const favorito of favoritos) {
            await eliminarFavorito(favorito.propiedadId);
        }
        
        // Obtener recomendaciones
        const recomendaciones = await obtenerRecomendaciones();
        if (!recomendaciones) {
            console.log('❌ No se pudieron obtener recomendaciones');
            return false;
        }
        
        // Verificar mensaje correcto
        if (!recomendaciones.tieneFavoritos && 
            recomendaciones.mensaje.includes('Aún no podemos recomendarte propiedades')) {
            console.log('✅ El sistema muestra el mensaje correcto');
            console.log(`   - Mensaje: ${recomendaciones.mensaje}`);
            console.log(`   - Tiene favoritos: ${recomendaciones.tieneFavoritos}`);
            return true;
        } else {
            console.log('❌ El mensaje no es el esperado');
            console.log(`   - Mensaje recibido: ${recomendaciones.mensaje}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en el escenario 2:', error.response?.data);
        return false;
    }
}

async function escenario3_ClienteNoTieneCuenta() {
    console.log('\n🧪 ESCENARIO 3: Cliente no tiene cuenta (visitante)');
    console.log('Dado que no estoy registrado');
    console.log('Cuando accedo a la app');
    console.log('Entonces no se muestra la sección de recomendaciones');
    
    try {
        // Intentar obtener recomendaciones sin token
        await axios.get(`${BASE_URL}/propiedades/recomendaciones`);
        console.log('❌ Se permitió acceso sin autenticación');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Se bloqueó el acceso sin autenticación');
            console.log(`   - Status: ${error.response.status}`);
            console.log(`   - Mensaje: ${error.response.data.mensaje}`);
            return true;
        } else {
            console.log('❌ Error inesperado:', error.response?.data);
            return false;
        }
    }
}

async function escenario4_ClienteSinPropiedadesFavoritas() {
    console.log('\n🧪 ESCENARIO 4: Cliente intenta ver recomendaciones sin haber guardado propiedades');
    console.log('Dado que soy un cliente con cuenta activa');
    console.log('Y nunca he marcado propiedades como favoritas');
    console.log('Cuando ingreso a la sección de recomendaciones');
    console.log('Entonces el sistema indica que aún no hay datos suficientes');
    
    // Asegurar que no hay favoritos (ya se eliminaron en escenario 2)
    const recomendaciones = await obtenerRecomendaciones();
    if (!recomendaciones) {
        console.log('❌ No se pudieron obtener recomendaciones');
        return false;
    }
    
    if (!recomendaciones.tieneFavoritos && 
        recomendaciones.recomendaciones.length === 0) {
        console.log('✅ El sistema indica que no hay datos suficientes');
        console.log(`   - Mensaje: ${recomendaciones.mensaje}`);
        console.log(`   - Tiene favoritos: ${recomendaciones.tieneFavoritos}`);
        return true;
    } else {
        console.log('❌ El sistema no indicó correctamente la falta de datos');
        return false;
    }
}

async function escenario5_SistemaSugiereSoloPropiedadesDisponibles() {
    console.log('\n🧪 ESCENARIO 5: Sistema sugiere solo propiedades disponibles');
    console.log('Dado que soy un cliente');
    console.log('Y he guardado propiedades como favoritas');
    console.log('Cuando recibo recomendaciones');
    console.log('Entonces todas las sugerencias están en estado "disponible"');
    
    // Marcar una propiedad como favorita para generar recomendaciones
    const propiedades = await obtenerPropiedadesDisponibles();
    if (propiedades.length < 1) {
        console.log('❌ No hay propiedades disponibles para el test');
        return false;
    }
    
    await marcarFavorito(propiedades[0].id);
    
    // Obtener recomendaciones
    const recomendaciones = await obtenerRecomendaciones();
    if (!recomendaciones || recomendaciones.recomendaciones.length === 0) {
        console.log('❌ No se obtuvieron recomendaciones');
        return false;
    }
    
    // Verificar que todas las recomendaciones están disponibles
    const todasDisponibles = recomendaciones.recomendaciones.every(
        prop => prop.estado_publicacion === 'disponible'
    );
    
    if (todasDisponibles) {
        console.log('✅ Todas las recomendaciones están disponibles');
        console.log(`   - Total recomendaciones: ${recomendaciones.recomendaciones.length}`);
        console.log(`   - Todas disponibles: ${todasDisponibles}`);
        return true;
    } else {
        console.log('❌ Algunas recomendaciones no están disponibles');
        return false;
    }
}

// Función principal para ejecutar todos los tests
async function ejecutarTestsBDD() {
    console.log('🚀 INICIANDO TESTS BDD PARA SISTEMA DE RECOMENDACIONES KNN (Python/scikit-learn)');
    console.log('=' .repeat(80));
    
    // Setup inicial
    console.log('\n📋 SETUP INICIAL');
    
    // Verificar servicio Python
    console.log('🐍 Verificando servicio Python...');
    const pythonService = await verificarServicioPython();
    if (pythonService) {
        console.log('✅ Servicio Python disponible:', pythonService.service);
        console.log(`   - Algoritmo: ${pythonService.algorithm}`);
        console.log(`   - Versión: ${pythonService.version}`);
    } else {
        console.log('⚠️ Servicio Python no disponible - se usará fallback JavaScript');
    }
    
    const adminLogin = await loginAdmin();
    if (!adminLogin) {
        console.log('❌ No se pudo continuar sin login de admin');
        return;
    }
    
    const clienteRegistro = await registrarCliente();
    if (!clienteRegistro) {
        console.log('❌ No se pudo continuar sin registro de cliente');
        return;
    }
    
    // Ejecutar escenarios
    const resultados = [];
    
    resultados.push(await escenario1_ClienteRecibeRecomendacionesDespuesDeGuardarFavoritos());
    resultados.push(await escenario2_ClienteEliminaTodosSusFavoritos());
    resultados.push(await escenario3_ClienteNoTieneCuenta());
    resultados.push(await escenario4_ClienteSinPropiedadesFavoritas());
    resultados.push(await escenario5_SistemaSugiereSoloPropiedadesDisponibles());
    
    // Resumen final
    console.log('\n📊 RESUMEN DE TESTS');
    console.log('=' .repeat(70));
    const exitosos = resultados.filter(r => r).length;
    const total = resultados.length;
    
    console.log(`✅ Tests exitosos: ${exitosos}/${total}`);
    console.log(`❌ Tests fallidos: ${total - exitosos}/${total}`);
    
    if (exitosos === total) {
        console.log('\n🎉 ¡TODOS LOS TESTS BDD PASARON EXITOSAMENTE!');
        console.log('El sistema de recomendaciones KNN con Python/scikit-learn funciona correctamente según las especificaciones.');
        if (pythonService) {
            console.log('🐍 Servicio Python: ACTIVO');
        } else {
            console.log('🔄 Fallback JavaScript: ACTIVO');
        }
    } else {
        console.log('\n⚠️  ALGUNOS TESTS FALLARON');
        console.log('Revisar la implementación del sistema de recomendaciones.');
        if (pythonService) {
            console.log('🐍 Servicio Python: ACTIVO');
        } else {
            console.log('🔄 Fallback JavaScript: ACTIVO');
        }
    }
}

// Ejecutar tests si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    ejecutarTestsBDD().catch(console.error);
}

export { ejecutarTestsBDD };
