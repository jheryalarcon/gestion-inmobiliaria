import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function poblarDatos() {
    try {
        console.log('🌱 Poblando base de datos con datos de ejemplo...\n');

        // 1. Crear usuarios
        console.log('👥 Creando usuarios...');
        
        // Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await prisma.usuario.upsert({
            where: { email: 'admin@inmobiliaria.com' },
            update: {},
            create: {
                name: 'Administrador',
                email: 'admin@inmobiliaria.com',
                telefono: '0999123456',
                password: adminPassword,
                rol: 'admin'
            }
        });
        console.log(`✅ Admin creado: ${admin.name}`);

        // Agente
        const agentePassword = await bcrypt.hash('agente123', 10);
        const agente = await prisma.usuario.upsert({
            where: { email: 'agente@inmobiliaria.com' },
            update: {},
            create: {
                name: 'María González',
                email: 'agente@inmobiliaria.com',
                telefono: '0987654321',
                password: agentePassword,
                rol: 'agente'
            }
        });
        console.log(`✅ Agente creado: ${agente.name}`);

        // Cliente
        const clientePassword = await bcrypt.hash('cliente123', 10);
        const cliente = await prisma.usuario.upsert({
            where: { email: 'cliente@inmobiliaria.com' },
            update: {},
            create: {
                name: 'Carlos Pérez',
                email: 'cliente@inmobiliaria.com',
                telefono: '0976543210',
                password: clientePassword,
                rol: 'cliente'
            }
        });
        console.log(`✅ Cliente creado: ${cliente.name}`);

        // 2. Crear propiedades
        console.log('\n🏠 Creando propiedades...');

        const propiedades = [
            {
                titulo: 'Casa moderna en Quito Norte',
                descripcion: 'Hermosa casa de 3 habitaciones con jardín privado, ubicada en una zona residencial tranquila. Ideal para familias.',
                tipo_propiedad: 'casa',
                estado_propiedad: 'nueva',
                transaccion: 'venta',
                precio: 180000,
                moneda: 'USD',
                direccion: 'Av. Amazonas N45-123',
                ciudad: 'Quito',
                provincia: 'Pichincha',
                area_terreno: 300,
                area_construccion: 150,
                nro_habitaciones: 3,
                nro_banos: 2,
                nro_parqueaderos: 2,
                nro_pisos: 2,
                anio_construccion: 2020,
                estado_publicacion: 'disponible',
                agenteId: agente.id
            },
            {
                titulo: 'Departamento en el centro de Guayaquil',
                descripcion: 'Departamento de 2 habitaciones con vista al mar, en edificio con amenities completos.',
                tipo_propiedad: 'departamento',
                estado_propiedad: 'usada',
                transaccion: 'alquiler',
                precio: 800,
                moneda: 'USD',
                direccion: 'Malecón 2000, Torre A, Piso 15',
                ciudad: 'Guayaquil',
                provincia: 'Guayas',
                area_terreno: 0,
                area_construccion: 85,
                nro_habitaciones: 2,
                nro_banos: 2,
                nro_parqueaderos: 1,
                nro_pisos: 1,
                anio_construccion: 2018,
                estado_publicacion: 'disponible',
                agenteId: agente.id
            },
            {
                titulo: 'Terreno comercial en Cuenca',
                descripcion: 'Terreno de 500m² en zona comercial estratégica, ideal para construcción de local comercial.',
                tipo_propiedad: 'terreno',
                estado_propiedad: 'nueva',
                transaccion: 'venta',
                precio: 95000,
                moneda: 'USD',
                direccion: 'Av. Solano y Calle Larga',
                ciudad: 'Cuenca',
                provincia: 'Azuay',
                area_terreno: 500,
                area_construccion: 0,
                nro_habitaciones: 0,
                nro_banos: 0,
                nro_parqueaderos: 0,
                nro_pisos: 0,
                anio_construccion: null,
                estado_publicacion: 'disponible',
                agenteId: agente.id
            },
            {
                titulo: 'Casa de lujo en Samborondón',
                descripcion: 'Mansión de 5 habitaciones con piscina, jardín de 1000m² y vista al río. Casa de lujo con acabados de primera.',
                tipo_propiedad: 'casa',
                estado_propiedad: 'nueva',
                transaccion: 'venta',
                precio: 450000,
                moneda: 'USD',
                direccion: 'Urbanización Los Ceibos, Casa 25',
                ciudad: 'Samborondón',
                provincia: 'Guayas',
                area_terreno: 1000,
                area_construccion: 400,
                nro_habitaciones: 5,
                nro_banos: 4,
                nro_parqueaderos: 4,
                nro_pisos: 2,
                anio_construccion: 2022,
                estado_publicacion: 'disponible',
                agenteId: agente.id
            },
            {
                titulo: 'Local comercial en el centro de Quito',
                descripcion: 'Local comercial de 60m² en planta baja, ubicado en zona de alto tráfico comercial.',
                tipo_propiedad: 'local_comercial',
                estado_propiedad: 'usada',
                transaccion: 'alquiler',
                precio: 1200,
                moneda: 'USD',
                direccion: 'Calle Venezuela y Espejo',
                ciudad: 'Quito',
                provincia: 'Pichincha',
                area_terreno: 0,
                area_construccion: 60,
                nro_habitaciones: 0,
                nro_banos: 1,
                nro_parqueaderos: 0,
                nro_pisos: 1,
                anio_construccion: 2015,
                estado_publicacion: 'disponible',
                agenteId: agente.id
            }
        ];

        for (const propData of propiedades) {
            const propiedad = await prisma.propiedad.create({
                data: propData
            });
            console.log(`✅ Propiedad creada: ${propiedad.titulo}`);
        }

        // 3. Crear imágenes de ejemplo
        console.log('\n🖼️ Creando imágenes de ejemplo...');
        
        const propiedadesConImagenes = await prisma.propiedad.findMany();
        
        for (const propiedad of propiedadesConImagenes) {
            // Crear 2-3 imágenes por propiedad
            const numImagenes = Math.floor(Math.random() * 2) + 2; // 2-3 imágenes
            
            for (let i = 1; i <= numImagenes; i++) {
                await prisma.imagen.create({
                    data: {
                        url: `https://picsum.photos/800/600?random=${propiedad.id}${i}`,
                        propiedadId: propiedad.id
                    }
                });
            }
            console.log(`✅ ${numImagenes} imágenes creadas para: ${propiedad.titulo}`);
        }

        // 4. Crear algunos favoritos
        console.log('\n❤️ Creando favoritos de ejemplo...');
        
        const propiedadesParaFavoritos = await prisma.propiedad.findMany({
            take: 3
        });

        for (const propiedad of propiedadesParaFavoritos) {
            await prisma.favorito.create({
                data: {
                    usuarioId: cliente.id,
                    propiedadId: propiedad.id
                }
            });
        }
        console.log(`✅ ${propiedadesParaFavoritos.length} favoritos creados`);

        console.log('\n🎉 Base de datos poblada exitosamente!');
        console.log('\n📋 Resumen:');
        console.log(`👥 Usuarios: 3 (admin, agente, cliente)`);
        console.log(`🏠 Propiedades: ${propiedades.length}`);
        console.log(`🖼️ Imágenes: ${propiedadesConImagenes.length * 2} (aprox.)`);
        console.log(`❤️ Favoritos: ${propiedadesParaFavoritos.length}`);
        
        console.log('\n🔑 Credenciales de acceso:');
        console.log('👑 Admin: admin@inmobiliaria.com / admin123');
        console.log('👨‍💼 Agente: agente@inmobiliaria.com / agente123');
        console.log('👤 Cliente: cliente@inmobiliaria.com / cliente123');

    } catch (error) {
        console.error('❌ Error al poblar datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

poblarDatos();
