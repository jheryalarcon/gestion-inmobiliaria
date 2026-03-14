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
    obtenerPropiedadesParaNegociaciones,
    obtenerPropiedadesRelacionadas,
    obtenerRecomendaciones,
    obtenerCodigoPreview,
    obtenerMetadataFiltros
} from '../controllers/propiedad.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import esPropietarioOAdmin from '../middlewares/esPropietarioOAdmin.js';
import esAdmin from '../middlewares/esAdmin.js'
import upload, { uploadPropiedadImg } from '../config/multer.js';
import optimizarImagen from '../middlewares/imageOptimizer.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/publicas', obtenerPropiedadesPublicas);
router.get('/publica/:id', obtenerPropiedadPublicaPorId);
router.get('/relacionadas', obtenerPropiedadesRelacionadas);

// Ruta para obtener las últimas propiedades
router.get('/ultimas', obtenerUltimasPropiedades);

router.post(
    '/',
    verificarToken,
    uploadPropiedadImg.array('imagenes', 15),
    optimizarImagen,
    crearPropiedad
);

router.get('/', verificarToken, obtenerPropiedades);
// NUEVA RUTA: Propiedades para negociaciones (solo disponibles)
router.get('/negociaciones/disponibles', verificarToken, obtenerPropiedadesParaNegociaciones);
// RUTA: Recomendaciones basadas en favoritos (requiere autenticación)
router.get('/recomendaciones', verificarToken, obtenerRecomendaciones);
router.get('/filtros-metadata', verificarToken, obtenerMetadataFiltros); // NUEVA RUTA
router.get('/preview-codigo', verificarToken, obtenerCodigoPreview);
router.get('/:id', verificarToken, obtenerPropiedadPorId);
router.put('/:id', verificarToken, esPropietarioOAdmin, uploadPropiedadImg.array('imagenes', 15), optimizarImagen, actualizarPropiedad);
router.patch('/:id/estado', verificarToken, esPropietarioOAdmin, actualizarEstadoPropiedad);
router.delete('/:id', verificarToken, esAdmin, eliminarPropiedad);



export default router;

