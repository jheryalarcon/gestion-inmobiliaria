import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const optimizarImagen = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        await Promise.all(
            req.files.map(async (file, index) => {
                try {
                    // Solo procesar imágenes
                    if (!file.mimetype.startsWith('image/')) return;

                    const nombreArchivoOriginal = file.filename;
                    const nombreSinExt = path.parse(nombreArchivoOriginal).name;
                    const nuevoNombre = `${nombreSinExt}.webp`;
                    const rutaOriginal = file.path;
                    const rutaNueva = path.join(path.dirname(rutaOriginal), nuevoNombre);

                    console.log(`🖼️ Optimizando imagen: ${nombreArchivoOriginal} -> ${nuevoNombre}`);

                    // Procesar con Sharp
                    await sharp(rutaOriginal)
                        .resize({ width: 1024, withoutEnlargement: true }) // Redimensionar si es muy grande
                        .toFormat('webp', { quality: 80 }) // Convertir a WebP con calidad 80
                        .toFile(rutaNueva);

                    // Eliminar archivo original si es diferente (ej. jpg -> webp)
                    if (rutaOriginal !== rutaNueva) {
                        try {
                            await fs.unlink(rutaOriginal);
                        } catch (err) {
                            console.error('Error al eliminar imagen original:', err);
                        }
                    }

                    // Actualizar información del archivo en req.files
                    // Esto es CRUCIAL para que el controlador guarde la ruta correcta en la BD
                    req.files[index].filename = nuevoNombre;
                    req.files[index].path = rutaNueva;
                    req.files[index].mimetype = 'image/webp';

                } catch (error) {
                    console.error(`❌ Error optimizando imagen ${file.filename}:`, error);
                    // Si falla la optimización, dejamos el archivo original (fail-safe)
                }
            })
        );
        next();
    } catch (error) {
        console.error('Error en middleware de optimización:', error);
        next(); // Continuar aunque falle, para no romper el flujo
    }
};

export default optimizarImagen;
