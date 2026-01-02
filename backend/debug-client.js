
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando un cliente para verificar tipo de ID...');
    const cliente = await prisma.cliente.findFirst();

    if (!cliente) {
        console.log('❌ No hay clientes en la base de datos.');
        return;
    }

    console.log(`👤 Cliente: ${cliente.nombre}`);
    console.log(`🆔 ID: ${cliente.id}`);
    console.log(`🆔 Tipo de ID en Runtime: ${typeof cliente.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
