import express from 'express';
import { body } from 'express-validator';
import verificarToken from '../middlewares/verificarToken.js';
import notaInternaController from '../controllers/notaInterna.controller.js';

const router = express.Router();

// ✅ VALIDACIONES
const validarCrearNotaInterna = [
    body('contenido')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('El contenido de la nota debe tener entre 1 y 2000 caracteres')
];

// ✅ RUTAS

// GET /api/notas-internas/:negociacionId - Obtener notas internas del agente responsable
router.get('/:negociacionId', 
    verificarToken, 
    notaInternaController.obtenerNotasInternas
);

// POST /api/notas-internas/:negociacionId - Crear nueva nota interna
router.post('/:negociacionId', 
    verificarToken, 
    validarCrearNotaInterna,
    notaInternaController.crearNotaInterna
);

// GET /api/notas-internas/:negociacionId/estadisticas - Obtener estadísticas
router.get('/:negociacionId/estadisticas', 
    verificarToken, 
    notaInternaController.obtenerEstadisticasNotas
);

export default router;
