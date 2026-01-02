import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const timestamp = Date.now();

        // 1. Buscar un agente para asignar
        const agente = await prisma.usuario.findFirst({
            where: { rol: { in: ['agente', 'admin'] } }
        });

        if (!agente) {
            console.log("No se encontró agente. Creando uno de prueba...");
            throw new Error("No hay agentes en la DB");
        }

        console.log(`Usando agente ID: ${agente.id}`);

        // 2. Crear 2 Clientes Propietarios
        const p1 = await prisma.cliente.create({
            data: {
                nombre: "Carlos Dueño Principal",
                email: `carlos.demo.${timestamp}@test.com`,
                telefono: "0991234567",
                cedula: `100${timestamp.toString().slice(-7)}`,
                tipo_cliente: "propietario"
            }
        });

        const p2 = await prisma.cliente.create({
            data: {
                nombre: "Maria Copropietaria",
                email: `maria.demo.${timestamp}@test.com`,
                telefono: "0997654321",
                cedula: `200${timestamp.toString().slice(-7)}`,
                tipo_cliente: "propietario"
            }
        });

        // 3. Crear Propiedad
        const prop = await prisma.propiedad.create({
            data: {
                titulo: `Casa Demo Copropiedad ${timestamp}`,
                descripcion: "Propiedad de prueba generada para verificar la visualización de múltiples propietarios y porcentajes de participación.",
                tipo_propiedad: "casa",
                estado_propiedad: "bueno",
                transaccion: "venta",
                precio: 185000,
                moneda: "USD",
                direccion: "Calle de Prueba 123",
                ciudad: "Quito",
                provincia: "Pichincha",
                area_terreno: 450,
                area_construccion: 280,
                nro_habitaciones: 4,
                nro_banos: 3,
                nro_parqueaderos: 2,
                agenteId: agente.id,

                // Datos de Negocio
                comision: 3,
                tipo_comision: "porcentaje",
                precio_minimo: 180000,
                tipo_contrato: "exclusiva",
                fecha_fin_contrato: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),

                // Relación Propietarios
                propietarios: {
                    create: [
                        {
                            clienteId: p1.id,
                            porcentaje: 60.00,
                            es_principal: true
                        },
                        {
                            clienteId: p2.id,
                            porcentaje: 40.00,
                            es_principal: false
                        }
                    ]
                },

                // Amenidades
                tiene_piscina: true,
                tiene_area_bbq: true,
                tiene_seguridad: true
            }
        });

        console.log("SUCCESS_PROP_ID:" + prop.id);
        console.log("==========================================");
        console.log(`Propiedad creada exitosamente!`);
        console.log(`ID: ${prop.id}`);
        console.log(`Título: ${prop.titulo}`);
        console.log(`Propietarios: ${p1.nombre} (60%), ${p2.nombre} (40%)`);
        console.log("==========================================");

    } catch (error) {
        console.error("Error al crear datos:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
