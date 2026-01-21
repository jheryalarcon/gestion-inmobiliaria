
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando limpieza de clientes duplicados/incorrectos ---');

    const emailsToDelete = [
        'jflarconm@pucesd.edu.ec',  // Falta la 'a'
        'jfalarconmmm@pucesd.edu.ec' // Sobran 'm'
    ];

    for (const email of emailsToDelete) {
        // Buscar el cliente primero para ver si tiene relaciones
        const cliente = await prisma.cliente.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } }
        });

        if (cliente) {
            console.log(`Encontrado cliente a eliminar: ${cliente.nombre} (${cliente.email})`);

            // 1. Eliminar (o desvincular) Negociaciones
            const negociaciones = await prisma.negociacion.deleteMany({
                where: { clienteId: cliente.id }
            });
            console.log(` - ${negociaciones.count} negociaciones eliminadas.`);

            // 2. Eliminar Seguimientos (si no cascada, aunque suelen ir con negociación)
            // (Prisma suele manejar cascade si está en schema, pero mejor prevenir)

            // 3. Eliminar Cliente
            await prisma.cliente.delete({
                where: { id: cliente.id }
            });
            console.log(`✅ Cliente eliminado correctamente.`);
        } else {
            console.log(`No se encontró cliente con email: ${email}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
