import express from 'express';
import { obtenerEstadisticas } from '../controllers/dashboard.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import esAdmin from '../middlewares/esAdmin.js';

const router = express.Router();

// Proteger todas las rutas
router.use(verificarToken);
router.use(esAdmin);

router.get('/stats', obtenerEstadisticas);

export default router;
