import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tokenPrueba = '1ca1a2d4fe3e680013b5f5cf1e4b20fe680e245e8f4ce883f895a393854700d8';

    const usuario = await prisma.usuario.findFirst({
        where: { token_recuperacion: tokenPrueba }
    });

    if (usuario) {
        console.log('Usuario encontrado con ese token:', usuario.email);
    } else {
        console.log('El token NO existe en la base de datos actualmente.');
    }

    // Veamos todos los tokens activos
    const usuariosConToken = await prisma.usuario.findMany({
        where: { token_recuperacion: { not: null } },
        select: { email: true, token_recuperacion: true }
    });

    console.log('\n--- Usuarios con token de recuperación activo ---');
    console.log(usuariosConToken);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
