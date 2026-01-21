import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Buscando clientes con emails similares a "alarcon" ---');

    const clientes = await prisma.cliente.findMany({
        where: {
            email: {
                contains: 'alarcon',
                mode: 'insensitive' // Búsqueda case-insensitive si la DB lo soporta (Postgres sí)
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    console.log(`Encontrados: ${clientes.length}`);
    clientes.forEach(c => {
        console.log(`ID: ${c.id} | Nombre: ${c.nombre} | Email: ${c.email} | Telf: ${c.telefono} | Activo: ${c.activo}`);
    });

    console.log('--- Buscando clientes con emails similares a "larcon" (por si el typo) ---');
    const clientesTypos = await prisma.cliente.findMany({
        where: {
            OR: [
                { email: { contains: 'jfla', mode: 'insensitive' } },
                { nombre: { contains: 'Jeremy', mode: 'insensitive' } },
                { nombre: { contains: 'Fernandito', mode: 'insensitive' } }
            ]
        }
    });

    console.log(`Encontrados Typos/Nombres: ${clientesTypos.length}`);
    clientesTypos.forEach(c => {
        console.log(`ID: ${c.id} | Nombre: ${c.nombre} | Email: ${c.email} | Telf: ${c.telefono} | Activo: ${c.activo}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
