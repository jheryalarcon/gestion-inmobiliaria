
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando última propiedad registrada...');
    const lastProp = await prisma.propiedad.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            propietarios: {
                include: { cliente: true }
            }
        }
    });

    if (!lastProp) {
        console.log('❌ No hay propiedades en la base de datos.');
        return;
    }

    console.log(`🏠 Propiedad: ${lastProp.titulo} (ID: ${lastProp.id})`);
    console.log(`   Tipo Contrato: ${lastProp.tipo_contrato}`); // ADDED
    console.log(`🆔 Codigo Interno: ${lastProp.codigo_interno}`);
    console.log(`👤 Propietario ID Legacy: ${lastProp.propietarioId}`);

    if (lastProp.propietarios.length === 0) {
        console.log('⚠️ LA RELACIÓN PROPIETARIOS ESTÁ VACÍA.');
    } else {
        console.log(`✅ Se encontraron ${lastProp.propietarios.length} propietarios en la relación:`);
        lastProp.propietarios.forEach(p => {
            console.log(`   - Cliente ID: ${p.clienteId}`);
            console.log(`   - Nombre: ${p.cliente ? p.cliente.nombre : 'NULL (Cliente no encontrado)'}`);
            console.log(`   - Principal: ${p.es_principal}`);
        });
    }

    // Check Documents Global
    console.log('--- BUSCANDO DOCUMENTOS RECIENTES (GLOBAL) ---');
    const allDocs = await prisma.documentoPropiedad.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { propiedad: true }
    });
    console.log(`TOTAL RECIENTES: ${allDocs.length}`);
    allDocs.forEach(d => {
        console.log(`DOC [${d.id}] Prop: ${d.propiedadId} Tipo: ${d.tipo}`);
        console.log(`   Nombre: ${d.nombre}`);
        console.log(`   URL: ${d.url}`);
    });
    console.log('--- FIN GLOBAL ---');

    // Check if propietarioId exists and if headers match
    if (lastProp.propietarios.length === 0 && lastProp.propietarioId) {
        console.log('🔄 Intentando buscar Cliente Legacy...');
        const legacyClient = await prisma.cliente.findUnique({ where: { id: lastProp.propietarioId } });
        console.log('   - Cliente Legacy:', legacyClient ? legacyClient.nombre : 'NO ENCONTRADO');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
