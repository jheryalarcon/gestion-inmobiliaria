import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const emailToTest = 'jheryalarcon98@gmail.com'; // O cambiar por el que usas para probar

    const usuario = await prisma.usuario.findUnique({
        where: { email: emailToTest }
    });

    if (!usuario) {
        console.log(`Usuario con email ${emailToTest} no encontrado.`);
        return;
    }

    console.log('--- DATOS DEL USUARIO ---');
    console.log('Email:', usuario.email);
    console.log('Token de recuperación actual:', usuario.token_recuperacion);
    console.log('Expiración del token:', usuario.token_recuperacion_expiracion);
    console.log('¿Expirado?:', usuario.token_recuperacion_expiracion && new Date() > usuario.token_recuperacion_expiracion ? 'SÍ' : 'NO');
    console.log('Hora actual (backend):', new Date());
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
