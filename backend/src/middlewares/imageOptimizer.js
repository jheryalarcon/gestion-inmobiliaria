import sharp from 'sharp';

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

                    console.log(`🖼️ Optimizando imagen en memoria: ${file.originalname}`);

                    // Procesar con Sharp desde buffer a buffer
                    const bufferOptimizado = await sharp(file.buffer)
                        .resize({ width: 1024, withoutEnlargement: true }) // Redimensionar si es muy grande
                        .toFormat('webp', { quality: 80 }) // Convertir a WebP
                        .toBuffer();

                    // Actualizar información del archivo en req.files
                    req.files[index].buffer = bufferOptimizado;
                    req.files[index].mimetype = 'image/webp';
                    req.files[index].originalname = file.originalname.replace(/\\.[^/.]+$/, "") + ".webp";

                } catch (error) {
                    console.error(`❌ Error optimizando imagen ${file.originalname}:`, error);
                    // Si falla la optimización, dejamos el archivo original (buffer intacto)
                }
            })
        );
        next();
    } catch (error) {
        console.error('Error en middleware de optimización:', error);
        next(); // Continuar aunque falle
    }
};

export default optimizarImagen;

