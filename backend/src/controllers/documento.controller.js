import prisma from '../prisma/client.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary.js';

// --- DOCUMENTOS DE PROPIEDAD ---

export const subirDocumentosPropiedad = async (req, res) => {
    const { id } = req.params;
    const { tipo, categoria } = req.body;
    const archivos = req.files;

    if (!archivos || archivos.length === 0) {
        return res.status(400).json({ mensaje: 'No se han subido archivos' });
    }

    try {
        const propiedad = await prisma.propiedad.findUnique({ where: { id: parseInt(id) } });
        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        // Si es documento de comercialización, eliminar el tipo contrario para evitar acumulación
        const tiposConflicto = {
            'CONTRATO_EXCLUSIVIDAD': 'AUTORIZACION_VENTA',
            'AUTORIZACION_VENTA': 'CONTRATO_EXCLUSIVIDAD'
        };
        if (tiposConflicto[tipo]) {
            const docsConflictivos = await prisma.documentoPropiedad.findMany({
                where: { propiedadId: parseInt(id), tipo: tiposConflicto[tipo] }
            });
            for (const doc of docsConflictivos) {
                const publicId = doc.cloudinary_id || extractPublicId(doc.url);
                if (publicId) await deleteFromCloudinary(publicId, 'raw').catch(() => {});
                await prisma.documentoPropiedad.delete({ where: { id: doc.id } });
            }
        }

        const documentosCreados = [];

        for (const archivo of archivos) {
            // Subir a Cloudinary desde buffer en memoria
            const result = await uploadToCloudinary(archivo.buffer, 'documentos/propiedades');
            const doc = await prisma.documentoPropiedad.create({
                data: {
                    nombre: archivo.originalname,
                    url: result.secure_url,
                    cloudinary_id: result.public_id,
                    tipo: tipo || 'OTRO',
                    categoria: categoria || 'OTROS',
                    propiedadId: parseInt(id)
                }
            });
            documentosCreados.push(doc);
        }

        res.status(201).json({
            mensaje: 'Documentos subidos correctamente',
            documentos: documentosCreados
        });

    } catch (error) {
        console.error('Error subiendo documentos de propiedad:', error);
        res.status(500).json({ mensaje: 'Error al subir documentos', error: error.message });
    }
};

export const obtenerDocumentosPropiedad = async (req, res) => {
    const { id } = req.params;
    try {
        const documentos = await prisma.documentoPropiedad.findMany({
            where: { propiedadId: parseInt(id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener documentos' });
    }
};

export const eliminarDocumentoPropiedad = async (req, res) => {
    const { id } = req.params;
    try {
        const documento = await prisma.documentoPropiedad.findUnique({ where: { id: parseInt(id) } });
        if (!documento) {
            return res.status(404).json({ mensaje: 'Documento no encontrado' });
        }

        // Eliminar de Cloudinary (intentar con cloudinary_id, luego extraer de URL)
        const publicId = documento.cloudinary_id || extractPublicId(documento.url);
        if (publicId) await deleteFromCloudinary(publicId, 'raw').catch(() => {});

        await prisma.documentoPropiedad.delete({ where: { id: parseInt(id) } });
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar documento' });
    }
};

// --- DOCUMENTOS DE CLIENTE ---

export const subirDocumentosCliente = async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.body;
    const archivos = req.files;

    if (!archivos || archivos.length === 0) {
        return res.status(400).json({ mensaje: 'No se han subido archivos' });
    }

    try {
        const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(id) } });
        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        const documentosCreados = [];

        for (const archivo of archivos) {
            const result = await uploadToCloudinary(archivo.buffer, 'documentos/clientes');
            const doc = await prisma.documentoCliente.create({
                data: {
                    nombre: archivo.originalname,
                    url: result.secure_url,
                    cloudinary_id: result.public_id,
                    tipo: tipo || 'OTRO',
                    clienteId: parseInt(id)
                }
            });
            documentosCreados.push(doc);
        }

        res.status(201).json({
            mensaje: 'Documentos de cliente subidos correctamente',
            documentos: documentosCreados
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al subir documentos de cliente', error: error.message });
    }
};

export const obtenerDocumentosCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const documentos = await prisma.documentoCliente.findMany({
            where: { clienteId: parseInt(id) }
        });
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener documentos de cliente' });
    }
};

export const eliminarDocumentoCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const documento = await prisma.documentoCliente.findUnique({ where: { id: parseInt(id) } });
        if (!documento) return res.status(404).json({ mensaje: 'Documento no encontrado' });

        const publicId = documento.cloudinary_id || extractPublicId(documento.url);
        if (publicId) await deleteFromCloudinary(publicId, 'raw').catch(() => {});

        await prisma.documentoCliente.delete({ where: { id: parseInt(id) } });
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar documento' });
    }
};

// --- DOCUMENTOS DE AGENTE ---

export const subirDocumentosAgente = async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.body;
    const archivos = req.files;

    if (!archivos || archivos.length === 0) {
        return res.status(400).json({ mensaje: 'No se han subido archivos' });
    }

    try {
        const agente = await prisma.usuario.findUnique({
            where: { id: parseInt(id), rol: 'agente' }
        });
        if (!agente) {
            return res.status(404).json({ mensaje: 'Agente no encontrado' });
        }

        const documentosCreados = [];

        for (const archivo of archivos) {
            const result = await uploadToCloudinary(archivo.buffer, 'documentos/agentes');
            const doc = await prisma.documentoAgente.create({
                data: {
                    nombre: archivo.originalname,
                    url: result.secure_url,
                    cloudinary_id: result.public_id,
                    tipo: tipo || 'OTRO',
                    agenteId: parseInt(id)
                }
            });
            documentosCreados.push(doc);
        }

        res.status(201).json({
            mensaje: 'Documentos de agente subidos correctamente',
            documentos: documentosCreados
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al subir documentos de agente', error: error.message });
    }
};

export const obtenerDocumentosAgente = async (req, res) => {
    const { id } = req.params;
    try {
        const documentos = await prisma.documentoAgente.findMany({
            where: { agenteId: parseInt(id) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener documentos de agente' });
    }
};

export const eliminarDocumentoAgente = async (req, res) => {
    const { id } = req.params;
    try {
        const documento = await prisma.documentoAgente.findUnique({ where: { id: parseInt(id) } });
        if (!documento) return res.status(404).json({ mensaje: 'Documento no encontrado' });

        const publicId = documento.cloudinary_id || extractPublicId(documento.url);
        if (publicId) await deleteFromCloudinary(publicId, 'raw').catch(() => {});

        await prisma.documentoAgente.delete({ where: { id: parseInt(id) } });
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar documento' });
    }
};
