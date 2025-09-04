import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Ruta para guardar imágenes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, nombre);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // ✅ 5MB por archivo
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = /jpeg|jpg|png|webp/;
        const mimetype = tiposPermitidos.test(file.mimetype);
        const extname = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Formato de archivo no permitido'));
    },
});

// Configuración específica para archivos de negociación
const storageNegociacion = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/negociaciones/'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = `negociacion-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, nombre);
    },
});

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

export { upload as default, uploadNegociacion };
