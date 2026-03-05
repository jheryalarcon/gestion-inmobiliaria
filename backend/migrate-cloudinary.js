import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function migrateImages() {
    console.log('--- Iniciando migración de IMÁGENES DE PROPIEDADES ---');
    const imagenes = await prisma.imagen.findMany({
        where: {
            url: { startsWith: '/uploads/' }
        }
    });

    console.log(`🔍 Encontradas ${imagenes.length} imágenes listadas en base de datos.`);

    for (const imagen of imagenes) {
        // Remover el primer '/' de '/uploads/archivo.webp' para que junte bien
        const cleanUrl = imagen.url.replace(/^\/+/, '');
        const filePath = path.join(process.cwd(), cleanUrl);

        if (fs.existsSync(filePath)) {
            console.log(`Subiendo: ${imagen.url}...`);
            try {
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'inmobiliaria/propiedades'
                });

                await prisma.imagen.update({
                    where: { id: imagen.id },
                    data: { url: result.secure_url }
                });
                console.log(`✅ Migrada exitosamente: ${result.secure_url}`);
            } catch (error) {
                console.error(`❌ Error subiendo ${imagen.url}:`, error.message);
            }
        } else {
            console.warn(`⚠️ Archivo no existe físicamente en disco: ${filePath}`);
        }
    }
}

async function migrateArchivos() {
    console.log('\n--- Iniciando migración de ARCHIVOS DE NEGOCIACIONES ---');
    const archivos = await prisma.archivoNegociacion.findMany();
    // Filtramos los que aún sean locales
    const archivosLocales = archivos.filter(a => !a.url.startsWith('http'));

    console.log(`🔍 Encontrados ${archivosLocales.length} archivos de negociaciones locales.`);

    for (const archivo of archivosLocales) {
        const filePath = path.resolve(archivo.url);

        if (fs.existsSync(filePath)) {
            console.log(`Subiendo archivo: ${archivo.nombre_archivo}...`);
            try {
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'inmobiliaria/negociaciones',
                    resource_type: 'auto' // Permite pdfs
                });

                await prisma.archivoNegociacion.update({
                    where: { id: archivo.id },
                    data: {
                        url: result.secure_url,
                        nombre_guardado: result.public_id
                    }
                });
                console.log(`✅ Archivo migrado exitosamente: ${result.secure_url}`);
            } catch (error) {
                console.error(`❌ Error subiendo ${archivo.nombre_archivo}:`, error.message);
            }
        } else {
            console.warn(`⚠️ Archivo no existe físicamente en disco: ${filePath}`);
        }
    }
}

async function start() {
    try {
        await migrateImages();
        await migrateArchivos();
        console.log('\n🎉🎊 ¡MIGRACIÓN COMPLETADA! 🎊🎉');
    } catch (e) {
        console.error('Error general en la migración:', e);
    } finally {
        await prisma.$disconnect();
    }
}

start();
