import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads'); // backend/uploads

async function optimizarTodasLasImagenes() {
    console.log('🚀 Iniciando optimización masiva de imágenes...');

    try {
        // 1. Obtener todas las imágenes que NO sean .webp (o todas para asegurar)
        const imagenes = await prisma.imagen.findMany();
        console.log(`📊 Total de imágenes en base de datos: ${imagenes.length}`);

        let optimizadas = 0;
        let errores = 0;
        let yaOptimizadas = 0;

        for (const imagen of imagenes) {
            // Si ya es webp, saltar (asumiendo que ya fue optimizada)
            if (imagen.url.endsWith('.webp')) {
                yaOptimizadas++;
                process.stdout.write('.'); // Progreso visual
                continue;
            }

            try {
                // Obtener nombre de archivo desde la URL "/uploads/archivo.jpg" -> "archivo.jpg"
                const nombreArchivoAntiguo = path.basename(imagen.url);
                const rutaAntigua = path.join(UPLOADS_DIR, nombreArchivoAntiguo);

                // Verificar si el archivo existe
                try {
                    await fs.access(rutaAntigua);
                } catch {
                    console.warn(`\n⚠️ Archivo no encontrado en disco: ${rutaAntigua} (ID: ${imagen.id})`);
                    errores++;
                    continue;
                }

                // Definir nueva ruta
                const nombreSinExt = path.parse(nombreArchivoAntiguo).name;
                const nombreNuevo = `${nombreSinExt}.webp`;
                const rutaNueva = path.join(UPLOADS_DIR, nombreNuevo);

                // Optimizar con Sharp
                const buffer = await sharp(rutaAntigua)
                    .resize({ width: 1024, withoutEnlargement: true })
                    .toFormat('webp', { quality: 80 })
                    .toBuffer();

                await fs.writeFile(rutaNueva, buffer);

                // Actualizar DB
                await prisma.imagen.update({
                    where: { id: imagen.id },
                    data: { url: `/uploads/${nombreNuevo}` }
                });

                // Borrar archivo antiguo si es diferente
                if (rutaAntigua !== rutaNueva) {
                    await fs.unlink(rutaAntigua);
                }

                optimizadas++;
                process.stdout.write('✅'); // Progreso visual

            } catch (err) {
                console.error(`\n❌ Error optimizando imagen ${imagen.id}:`, err.message);
                errores++;
            }
        }

        console.log('\n\n🏁 Resumen final:');
        console.log(`✅ Optimizadas: ${optimizadas}`);
        console.log(`⏭️  Ya estaban optimizadas: ${yaOptimizadas}`);
        console.log(`❌ Errores/No encontrados: ${errores}`);

    } catch (error) {
        console.error('Error general:', error);
    } finally {
        await prisma.$disconnect();
    }
}

optimizarTodasLasImagenes();
