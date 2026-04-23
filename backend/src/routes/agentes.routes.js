import express from 'express';
import { crearAgente, obtenerAgentes, obtenerAgentePorId, actualizarEstadoAgente, actualizarAgente, obtenerEstadisticasAgentes, cambiarPasswordAgente, verificarEmailAgente, verificarCedulaAgente } from '../controllers/agentes.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import esAdmin from '../middlewares/esAdmin.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Aplicar middleware de admin a todas las rutas
router.use(esAdmin);

// Crear nuevo agente
router.post('/crear', crearAgente);

// Obtener lista de agentes con paginación y búsqueda
router.get('/', obtenerAgentes);

// Verificar disponibilidad de email y cédula (deben ir ANTES de /:id para evitar conflictos)
router.get('/verificar/email', verificarEmailAgente);
router.get('/verificar/cedula', verificarCedulaAgente);

// Obtener agente por ID
router.get('/:id', obtenerAgentePorId);

// Actualizar agente
router.put('/:id', actualizarAgente);

// Cambiar contraseña de agente
router.put('/:id/password', cambiarPasswordAgente);

// Actualizar estado del agente (activar/desactivar)
router.patch('/:id/estado', actualizarEstadoAgente);

// Obtener estadísticas de agentes
router.get('/estadisticas/totales', obtenerEstadisticasAgentes);

export default router;
