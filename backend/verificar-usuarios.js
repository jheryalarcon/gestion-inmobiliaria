import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarUsuarios() {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                rol: true
            }
        });

        console.log(`👥 Total de usuarios: ${usuarios.length}`);
        
        if (usuarios.length > 0) {
            console.log('\n👤 Usuarios encontrados:');
            usuarios.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.rol}) - ${user.email}`);
            });
        } else {
            console.log('❌ No hay usuarios en la base de datos');
        }

    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verificarUsuarios();
