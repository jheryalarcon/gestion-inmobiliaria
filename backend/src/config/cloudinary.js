import { v2 as cloudinary } from 'cloudinary';
import { Console } from 'console';

// Configuración de Cloudinary usando las variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube un archivo a Cloudinary usando un stream (desde la memoria)
 * @param {Buffer} fileBuffer Buffer del archivo extraído por Multer en memoria
 * @param {String} folder Carpeta destino en Cloudinary ('propiedades' o 'negociaciones')
 * @returns {Promise<Object>} Resultado de la subida con la URL segura y el public_id
 */
export const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `inmobiliaria/${folder}`, // Organizar en subcarpetas
                resource_type: 'auto', // Permite imágenes, pdfs, etc.
            },
            (error, result) => {
                if (error) {
                    console.error(`Error subiendo a Cloudinary (${folder}):`, error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Finalizamos escribiendo el buffer en el stream
        uploadStream.end(fileBuffer);
    });
};

/**
 * Elimina un recurso de Cloudinary dado su public_id
 * @param {String} publicId ID público del archivo en Cloudinary
 * @param {String} resourceType Tipo de recurso ('image', 'raw', 'video') - opcional, default 'image'
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        console.error(`Error eliminando de Cloudinary (${publicId}):`, error);
        throw error;
    }
};

/**
 * Extrae el public_id de una URL completa de Cloudinary
 * @param {String} url URL de Cloudinary (ej: https://res.cloudinary.com/.../v1234/inmobiliaria/propiedades/asd.jpg)
 */
export const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    // Extrae todo después de "upload/v[version]/" hasta antes de la extensión
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return null;

    // parts[uploadIndex + 1] es la versión (vXXXX)
    // lo que sigue es el public ID
    const idConExt = parts.slice(uploadIndex + 2).join('/');
    return idConExt.split('.')[0]; // remover extensión .jpg, .png, etc.
};

export default cloudinary;
