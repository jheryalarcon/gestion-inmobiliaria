import express from 'express';
import { body } from 'express-validator';
import verificarToken from '../middlewares/verificarToken.js';
import esAgenteOAdmin from '../middlewares/esAgenteOAdmin.js';
import seguimientoController from '../controllers/seguimiento.controller.js';

const router = express.Router();

// ✅ VALIDACIONES
const validarCrearSeguimiento = [
    body('comentario')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('El comentario debe tener entre 1 y 1000 caracteres'),
    body('tipo')
        .optional()
        .isIn(['llamada', 'visita', 'mensaje', 'email', 'reunion', 'documento', 'otro'])
        .withMessage('Tipo de seguimiento inválido')
];

// ✅ RUTAS

// GET /api/seguimientos/:negociacionId - Obtener seguimientos de una negociación
router.get('/:negociacionId', 
    verificarToken, 
    seguimientoController.obtenerSeguimientos
);

// GET /api/seguimientos/:negociacionId/paginados - Obtener seguimientos con paginación
router.get('/:negociacionId/paginados', 
    verificarToken, 
    seguimientoController.obtenerSeguimientosPaginados
);

// POST /api/seguimientos/:negociacionId - Crear nuevo seguimiento
router.post('/:negociacionId', 
    verificarToken, 
    esAgenteOAdmin, // Solo agentes y admins pueden crear seguimientos
    validarCrearSeguimiento,
    seguimientoController.crearSeguimiento
);

// GET /api/seguimientos/:negociacionId/estadisticas - Obtener estadísticas
router.get('/:negociacionId/estadisticas', 
    verificarToken, 
    seguimientoController.obtenerEstadisticasSeguimientos
);

export default router;
