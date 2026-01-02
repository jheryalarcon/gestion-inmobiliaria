import prisma from '../prisma/client.js';
import path from 'path';
import fs from 'fs';

// --- DOCUMENTOS DE PROPIEDAD ---

export const subirDocumentosPropiedad = async (req, res) => {
    const { id } = req.params; // ID de la propiedad
    const { tipo, categoria } = req.body;
    const archivos = req.files; // Array de archivos
    console.log(`📂 Subiendo docs para Propiedad ID: ${id}`);
    console.log(`   - Archivos: ${archivos ? archivos.length : 0}`);
    console.log(`   - Tipo: ${tipo}, Categoria: ${categoria}`);

    if (!archivos || archivos.length === 0) {
        console.warn('⚠️ No llegaron archivos en la request');
        return res.status(400).json({ mensaje: 'No se han subido archivos' });
    }

    try {
        const propiedad = await prisma.propiedad.findUnique({ where: { id: parseInt(id) } });
        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        const documentosCreados = [];

        for (const archivo of archivos) {
            // En un entorno real, aquí subiríamos a S3/Cloudinary.
            // Por ahora, asumimos que Multer ya lo guardó en disco y usamos esa ruta.
            // La URL sería algo como '/uploads/{filename}'
            const url = `/uploads/${archivo.filename}`;

            const doc = await prisma.documentoPropiedad.create({
                data: {
                    nombre: archivo.originalname,
                    url: url,
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
        console.error(error);
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
    const { id } = req.params; // ID del documento

    try {
        const documento = await prisma.documentoPropiedad.findUnique({ where: { id: parseInt(id) } });
        if (!documento) {
            return res.status(404).json({ mensaje: 'Documento no encontrado' });
        }

        // Eliminar archivo físico (opcional, recomendado)
        // const filePath = path.join(__dirname, '..', documento.url);
        // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await prisma.documentoPropiedad.delete({ where: { id: parseInt(id) } });

        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar documento' });
    }
};

// --- DOCUMENTOS DE CLIENTE (PROPIETARIO) ---

export const subirDocumentosCliente = async (req, res) => {
    const { id } = req.params; // ID del cliente
    const { tipo } = req.body; // CEDULA, PAPELETA, ETC
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
            const url = `/uploads/${archivo.filename}`;
            const doc = await prisma.documentoCliente.create({
                data: {
                    nombre: archivo.originalname,
                    url: url,
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
        await prisma.documentoCliente.delete({ where: { id: parseInt(id) } });
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar documento' });
    }
};

// --- DOCUMENTOS DE AGENTE (RRHH) ---

export const subirDocumentosAgente = async (req, res) => {
    const { id } = req.params; // ID del agente
    const { tipo } = req.body; // CONTRATO, IDENTIFICACION, ETC
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
            const url = `/uploads/${archivo.filename}`;
            const doc = await prisma.documentoAgente.create({
                data: {
                    nombre: archivo.originalname,
                    url: url,
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
        await prisma.documentoAgente.delete({ where: { id: parseInt(id) } });
        res.json({ mensaje: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar documento' });
    }
};
