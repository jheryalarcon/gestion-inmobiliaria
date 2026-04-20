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
import { uploadDocumento } from '../config/multer.js'; // memoryStorage → Cloudinary

const router = express.Router();

// --- PROPIEDADES ---
// POST  /api/documentos/propiedad/:propiedadId  → subir documentos a esa propiedad
router.post('/propiedad/:id', verificarToken, uploadDocumento.array('documentos', 10), subirDocumentosPropiedad);
// GET   /api/documentos/propiedad/:propiedadId  → obtener documentos de esa propiedad
router.get('/propiedad/:id', verificarToken, obtenerDocumentosPropiedad);
// DELETE /api/documentos/propiedad/doc/:docId   → eliminar un documento por su ID
router.delete('/propiedad/doc/:id', verificarToken, eliminarDocumentoPropiedad);

// --- CLIENTES ---
router.post('/cliente/:id', verificarToken, uploadDocumento.array('documentos', 10), subirDocumentosCliente);
router.get('/cliente/:id', verificarToken, obtenerDocumentosCliente);
router.delete('/cliente/doc/:id', verificarToken, eliminarDocumentoCliente);

// --- AGENTES (RRHH) ---
router.post('/agente/:id', verificarToken, uploadDocumento.array('documentos', 10), subirDocumentosAgente);
router.get('/agente/:id', verificarToken, obtenerDocumentosAgente);
router.delete('/agente/doc/:id', verificarToken, eliminarDocumentoAgente);

export default router;
