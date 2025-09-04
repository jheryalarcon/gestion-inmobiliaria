import express from 'express';
import {
    actualizarEstadoPropiedad,
    actualizarPropiedad,
    crearPropiedad,
    obtenerPropiedades,
    eliminarPropiedad,
    obtenerPropiedadPorId,
    obtenerPropiedadesPublicas,
    obtenerPropiedadPublicaPorId,
    obtenerUltimasPropiedades,
    obtenerPropiedadesParaNegociaciones
} from '../controllers/propiedad.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import esPropietarioOAdmin from '../middlewares/esPropietarioOAdmin.js';
import esAdmin from '../middlewares/esAdmin.js'
import upload from '../config/multer.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/publicas', obtenerPropiedadesPublicas);
router.get('/publica/:id', obtenerPropiedadPublicaPorId);

// Ruta para obtener las últimas propiedades
router.get('/ultimas', obtenerUltimasPropiedades);

router.post(
    '/',
    verificarToken,
    upload.array('imagenes', 5),
    crearPropiedad
);

router.get('/', verificarToken, obtenerPropiedades);
// 🏠 NUEVA RUTA: Propiedades para negociaciones (solo disponibles)
router.get('/negociaciones/disponibles', verificarToken, obtenerPropiedadesParaNegociaciones);
router.get('/:id', verificarToken, obtenerPropiedadPorId);
router.put('/:id', verificarToken, esPropietarioOAdmin, upload.array('imagenes', 5), actualizarPropiedad);
router.patch('/:id/estado', verificarToken, esPropietarioOAdmin, actualizarEstadoPropiedad);
router.delete('/:id', verificarToken, esAdmin, eliminarPropiedad);



export default router;

