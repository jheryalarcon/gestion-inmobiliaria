import express from 'express';
import { obtenerAgentes } from '../controllers/usuarios.controller.js';
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();

router.get('/agentes', verificarToken, obtenerAgentes);

export default router;
