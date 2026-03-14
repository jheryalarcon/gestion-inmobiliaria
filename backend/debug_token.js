import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@inmobiliaria.com';

    // 1. Crear token
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.usuario.update({
        where: { email },
        data: {
            token_recuperacion: token,
            token_recuperacion_expiracion: expiracion
        }
    });

    console.log('Se guardó el token:', token);

    // 2. Buscar por token
    const usuarioEncontrado = await prisma.usuario.findFirst({
        where: { token_recuperacion: token }
    });

    if (usuarioEncontrado) {
        console.log('¡Éxito! Prisma encontró al usuario con ese token:', usuarioEncontrado.email);
    } else {
        console.log('ERROR EXTRAÑO: Prisma NO pudo encontrar al usuario usando el token que acaba de guardar.');
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
