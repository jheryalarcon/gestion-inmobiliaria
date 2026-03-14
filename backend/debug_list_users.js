import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.usuario.findMany({
        select: { email: true, token_recuperacion: true }
    });
    console.log(users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
