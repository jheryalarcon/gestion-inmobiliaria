import express from 'express';
import {
    subirDocumentosPropiedad,
    obtenerDocumentosPropiedad,
    eliminarDocumentoPropiedad,
    subirDocumentosCliente,
    obtenerDocumentosCliente,
    eliminarDocumentoCliente,
    subirDocumentosAgente,
    obtenerDocumentosAgente,
    eliminarDocumentoAgente
} from '../controllers/documento.controller.js';
import verificarToken from '../middlewares/verificarToken.js';
import upload from '../config/multer.js'; // Asegúrate de que multer soporte .pdf, .doc

const router = express.Router();

// --- PROPIEDADES ---
// Subir documentos a una propiedad (ID Propiedad)
// POST /api/documentos/propiedad/:id
router.post('/propiedad/:id', verificarToken, upload.array('documentos', 10), subirDocumentosPropiedad);

// Obtener documentos de una propiedad
router.get('/propiedad/:id', verificarToken, obtenerDocumentosPropiedad);

// Eliminar un documento de propiedad (ID Documento)
router.delete('/propiedad/:id', verificarToken, eliminarDocumentoPropiedad);


// --- CLIENTES ---
router.post('/cliente/:id', verificarToken, upload.array('documentos', 10), subirDocumentosCliente);
router.get('/cliente/:id', verificarToken, obtenerDocumentosCliente);
router.delete('/cliente/:id', verificarToken, eliminarDocumentoCliente);

// --- AGENTES (RRHH) ---
router.post('/agente/:id', verificarToken, upload.array('documentos', 10), subirDocumentosAgente);
router.get('/agente/:id', verificarToken, obtenerDocumentosAgente);
router.delete('/agente/:id', verificarToken, eliminarDocumentoAgente);

export default router;
