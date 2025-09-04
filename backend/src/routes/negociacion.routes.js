import express from 'express';
import {
    crearNegociacion,
    obtenerNegociaciones,
    obtenerNegociacion,
    actualizarNegociacion,
    desactivarNegociacion,
    obtenerEstadisticas
} from '../controllers/negociacion.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import esAdmin from '../middlewares/esAdmin.js';
import { body } from 'express-validator';

const router = express.Router();

// Middleware para agentes y administradores
const esAgenteOAdmin = (req, res, next) => {
    if (req.usuario?.rol === 'agente' || req.usuario?.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ mensaje: 'Acceso solo para agentes y administradores' });
    }
};

// Validaciones
const validarCrearNegociacion = [
    body('clienteId')
        .isInt({ min: 1 })
        .withMessage('ID de cliente debe ser un número válido'),
    body('propiedadId')
        .isInt({ min: 1 })
        .withMessage('ID de propiedad debe ser un número válido')
];

const validarActualizarNegociacion = [
    body('etapa')
        .isIn(['interes', 'negociacion', 'cierre', 'finalizada', 'cancelada'])
        .withMessage('Etapa debe ser una de las opciones válidas: interes, negociacion, cierre, finalizada, cancelada')
];

// Rutas
router.post('/', verificarToken, esAgenteOAdmin, validarCrearNegociacion, crearNegociacion);
router.get('/', verificarToken, esAgenteOAdmin, obtenerNegociaciones);
router.get('/estadisticas', verificarToken, esAgenteOAdmin, obtenerEstadisticas);
router.get('/:id', verificarToken, esAgenteOAdmin, obtenerNegociacion);
router.put('/:id', verificarToken, esAgenteOAdmin, validarActualizarNegociacion, actualizarNegociacion);
router.patch('/:id/desactivar', verificarToken, esAgenteOAdmin, desactivarNegociacion);

export default router;
