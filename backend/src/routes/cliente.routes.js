import express from 'express';
import { 
    crearCliente, 
    obtenerClientes, 
    obtenerCliente, 
    actualizarCliente, 
    eliminarCliente,
    obtenerEstadisticas,
    desactivarCliente,
    reactivarCliente
} from '../controllers/cliente.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import esAdmin from '../middlewares/esAdmin.js';

const router = express.Router();

// Middleware para verificar si es agente o admin
const esAgenteOAdmin = (req, res, next) => {
    if (req.usuario?.rol === 'agente' || req.usuario?.rol === 'admin') {
        next();
    } else {
        return res.status(403).json({ mensaje: 'Acceso solo para agentes y administradores' });
    }
};

// Rutas para agentes y administradores
router.post('/', verificarToken, esAgenteOAdmin, crearCliente);
router.get('/', verificarToken, esAgenteOAdmin, obtenerClientes);
router.get('/estadisticas', verificarToken, esAgenteOAdmin, obtenerEstadisticas);
router.get('/:id', verificarToken, esAgenteOAdmin, obtenerCliente);
router.put('/:id', verificarToken, esAgenteOAdmin, actualizarCliente);
router.delete('/:id', verificarToken, esAgenteOAdmin, eliminarCliente);

// Rutas para desactivar/reactivar clientes
router.patch('/:id/desactivar', verificarToken, esAgenteOAdmin, desactivarCliente);
router.patch('/:id/reactivar', verificarToken, esAdmin, reactivarCliente);

export default router;
