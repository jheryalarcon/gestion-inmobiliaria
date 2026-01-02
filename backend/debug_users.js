
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
    console.log('--- LISTADO DE USUARIOS ---');
    const usuarios = await prisma.usuario.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            rol: true,
            activo: true
        }
    });

    console.log('\n--- FILTRO ACTUAL (Simulacion) ---');
    const filtrados = await prisma.usuario.findMany({
        where: {
            activo: true,
            OR: [
                { rol: 'agente' },
                { rol: 'admin' }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            rol: true
        },
    });

    const output = `
--- LISTADO DE USUARIOS ---
${JSON.stringify(usuarios, null, 2)}

--- FILTRO ACTUAL ---
${JSON.stringify(filtrados, null, 2)}
  `;

    fs.writeFileSync('debug_output.txt', output);
    console.log('Output saved to debug_output.txt');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
