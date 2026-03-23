import { Router } from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import { registrarInteraccion } from '../controllers/interaccion.controller.js';

const router = Router();

// POST /api/interacciones - Solo usuarios autenticados (clientes logueados)
router.post('/', verificarToken, registrarInteraccion);

export default router;
