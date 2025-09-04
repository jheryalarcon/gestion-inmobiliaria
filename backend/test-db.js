import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        console.log('Probando conexión a la base de datos...');
        
        // Verificar conexión
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos exitosa');
        
        // Contar usuarios
        const userCount = await prisma.usuario.count();
        console.log(`👥 Usuarios en la base de datos: ${userCount}`);
        
        // Contar propiedades
        const propiedadCount = await prisma.propiedad.count();
        console.log(`🏠 Propiedades en la base de datos: ${propiedadCount}`);
        
        // Contar favoritos
        const favoritoCount = await prisma.favorito.count();
        console.log(`❤️ Favoritos en la base de datos: ${favoritoCount}`);
        
        // Obtener algunas propiedades de ejemplo
        const propiedades = await prisma.propiedad.findMany({
            take: 3,
            include: {
                imagenes: true,
                agente: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        console.log('\n📋 Propiedades de ejemplo:');
        propiedades.forEach((prop, index) => {
            console.log(`${index + 1}. ID: ${prop.id}, Título: ${prop.titulo}, Precio: $${prop.precio}`);
        });
        
        // Obtener algunos usuarios de ejemplo
        const usuarios = await prisma.usuario.findMany({
            take: 3,
            select: {
                id: true,
                name: true,
                email: true,
                rol: true
            }
        });
        
        console.log('\n👤 Usuarios de ejemplo:');
        usuarios.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}, Nombre: ${user.name}, Email: ${user.email}, Rol: ${user.rol}`);
        });
        
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();






