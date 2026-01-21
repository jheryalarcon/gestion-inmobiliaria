import express from 'express';
import { uploadNegociacion } from '../config/multer.js';
import verificarToken from '../middlewares/verificarToken.js';
import esAgenteOAdmin from '../middlewares/esAgenteOAdmin.js';
import {
    subirArchivo,
    obtenerArchivos,
    descargarArchivo,
    obtenerEstadisticas
} from '../controllers/archivoNegociacion.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Subir archivo adjunto (solo agente responsable o admin)
router.post('/subir', esAgenteOAdmin, (req, res, next) => {
    uploadNegociacion.single('archivo')(req, res, (err) => {
        if (err) {
            // Multer errors (File size, file type, etc)
            return res.status(400).json({
                error: err.message || 'Error al subir el archivo'
            });
        }
        next();
    });
}, subirArchivo);

// Obtener archivos de una negociación (agente responsable o admin)
router.get('/negociacion/:negociacionId', esAgenteOAdmin, obtenerArchivos);

// Descargar archivo (agente responsable o admin)
router.get('/descargar/:archivoId', esAgenteOAdmin, descargarArchivo);

// Obtener estadísticas de archivos (agente responsable o admin)
router.get('/estadisticas/:negociacionId', esAgenteOAdmin, obtenerEstadisticas);

export default router;
