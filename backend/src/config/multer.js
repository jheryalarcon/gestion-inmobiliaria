import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Ruta para guardar archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta al directorio uploads (backend/uploads/)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Crear la carpeta uploads si no existe
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ diskStorage: guarda en disco y genera archivo.filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // ✅ 10MB por archivo
    },
    fileFilter: (req, file, cb) => {
        const extPermitidas = /pdf|jpeg|jpg|png/;
        const mimesPermitidos = /application\/pdf|image\/jpeg|image\/jpg|image\/png/;
        const extname = extPermitidas.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimesPermitidos.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Formato de archivo no permitido. Solo se aceptan PDF, JPG y PNG (máx. 10 MB).'));
    },
});


// ✅ memoryStorage para imágenes de propiedades → van a Cloudinary (necesita file.buffer)
const storageMemory = multer.memoryStorage();

const uploadPropiedadImg = multer({
    storage: storageMemory,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por imagen
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = /jpeg|jpg|png|webp/;
        const extname = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
        const mimetype = tiposPermitidos.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP).'));
    },
});

// Configuración específica para archivos de negociación (también va a Cloudinary)
const storageNegociacion = multer.memoryStorage();

const uploadNegociacion = multer({
    storage: storageNegociacion,
    limits: {
        fileSize: 5 * 1024 * 1024, // ✅ 5MB por archivo
    },
    fileFilter: (req, file, cb) => {
        // Permitir PDF, JPG, PNG
        const tiposPermitidos = /pdf|jpeg|jpg|png/;
        const mimetype = tiposPermitidos.test(file.mimetype);
        const extname = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) return cb(null, true);
        cb(new Error('Solo se permiten archivos PDF, JPG y PNG'));
    },
});

// ✅ memoryStorage para documentos de propiedad/cliente/agente → van a Cloudinary
const uploadDocumento = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = /pdf|jpeg|jpg|png/;
        const extname = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
        const mimetype = tiposPermitidos.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Solo se permiten archivos PDF, JPG y PNG'));
    },
});

export { upload as default, uploadNegociacion, uploadPropiedadImg, uploadDocumento };

