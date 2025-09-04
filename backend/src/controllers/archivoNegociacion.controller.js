import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Subir archivo adjunto a una negociación
export const subirArchivo = async (req, res) => {
    try {
        const { negociacionId, tipo } = req.body;
        const agenteId = req.usuario.id;

        // Verificar que la negociación existe y el usuario es el agente responsable
        const negociacion = await prisma.negociacion.findFirst({
            where: {
                id: parseInt(negociacionId),
                agenteId: agenteId,
                activo: true
            }
        });

        if (!negociacion) {
            return res.status(403).json({
                error: 'No tienes permisos para subir archivos a esta negociación'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'No se ha seleccionado ningún archivo'
            });
        }

        // Crear registro en la base de datos
        const archivo = await prisma.archivoNegociacion.create({
            data: {
                negociacionId: parseInt(negociacionId),
                agenteId: agenteId,
                nombre_archivo: req.file.originalname,
                nombre_guardado: req.file.filename,
                tipo: tipo || 'otros',
                url: req.file.path,
                tamano: req.file.size
            }
        });

        res.status(201).json({
            mensaje: 'Archivo subido correctamente',
            archivo: {
                id: archivo.id,
                nombre_archivo: archivo.nombre_archivo,
                tipo: archivo.tipo,
                fecha_subida: archivo.fecha_subida,
                tamano: archivo.tamano
            }
        });

    } catch (error) {
        console.error('Error al subir archivo:', error);
        res.status(500).json({
            error: 'Error interno del servidor al subir el archivo'
        });
    }
};

// Obtener archivos de una negociación
export const obtenerArchivos = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const usuarioId = req.usuario.id;
        const rol = req.usuario.rol;

        // Verificar que la negociación existe
        const negociacion = await prisma.negociacion.findFirst({
            where: {
                id: parseInt(negociacionId),
                activo: true
            },
            include: {
                agente: true
            }
        });

        if (!negociacion) {
            return res.status(404).json({
                error: 'Negociación no encontrada'
            });
        }

        // Verificar permisos: solo el agente responsable o admin puede ver
        if (rol !== 'admin' && negociacion.agenteId !== usuarioId) {
            return res.status(403).json({
                error: 'No tienes permisos para ver los archivos de esta negociación'
            });
        }

        // Obtener archivos
        const archivos = await prisma.archivoNegociacion.findMany({
            where: {
                negociacionId: parseInt(negociacionId),
                activo: true
            },
            orderBy: {
                fecha_subida: 'desc'
            },
            select: {
                id: true,
                nombre_archivo: true,
                tipo: true,
                fecha_subida: true,
                tamano: true,
                agente: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.json({
            archivos,
            total: archivos.length
        });

    } catch (error) {
        console.error('Error al obtener archivos:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener los archivos'
        });
    }
};

// Descargar archivo
export const descargarArchivo = async (req, res) => {
    try {
        const { archivoId } = req.params;
        const usuarioId = req.usuario.id;
        const rol = req.usuario.rol;

        // Obtener archivo con información de la negociación
        const archivo = await prisma.archivoNegociacion.findFirst({
            where: {
                id: parseInt(archivoId),
                activo: true
            },
            include: {
                negociacion: {
                    select: {
                        agenteId: true
                    }
                }
            }
        });

        if (!archivo) {
            return res.status(404).json({
                error: 'Archivo no encontrado'
            });
        }

        // Verificar permisos: solo el agente responsable o admin puede descargar
        if (rol !== 'admin' && archivo.negociacion.agenteId !== usuarioId) {
            return res.status(403).json({
                error: 'No tienes permisos para descargar este archivo'
            });
        }

        // Verificar que el archivo existe en el sistema de archivos
        if (!fs.existsSync(archivo.url)) {
            return res.status(404).json({
                error: 'El archivo no se encuentra en el servidor'
            });
        }

        // Enviar archivo para descarga
        res.download(archivo.url, archivo.nombre_archivo);

    } catch (error) {
        console.error('Error al descargar archivo:', error);
        res.status(500).json({
            error: 'Error interno del servidor al descargar el archivo'
        });
    }
};

// Obtener estadísticas de archivos por negociación
export const obtenerEstadisticas = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const usuarioId = req.usuario.id;
        const rol = req.usuario.rol;

        // Verificar permisos
        const negociacion = await prisma.negociacion.findFirst({
            where: {
                id: parseInt(negociacionId),
                activo: true
            }
        });

        if (!negociacion) {
            return res.status(404).json({
                error: 'Negociación no encontrada'
            });
        }

        if (rol !== 'admin' && negociacion.agenteId !== usuarioId) {
            return res.status(403).json({
                error: 'No tienes permisos para ver las estadísticas de esta negociación'
            });
        }

        // Obtener estadísticas
        const totalArchivos = await prisma.archivoNegociacion.count({
            where: {
                negociacionId: parseInt(negociacionId),
                activo: true
            }
        });

        const archivosPorTipo = await prisma.archivoNegociacion.groupBy({
            by: ['tipo'],
            where: {
                negociacionId: parseInt(negociacionId),
                activo: true
            },
            _count: {
                tipo: true
            }
        });

        const tamanoTotal = await prisma.archivoNegociacion.aggregate({
            where: {
                negociacionId: parseInt(negociacionId),
                activo: true
            },
            _sum: {
                tamano: true
            }
        });

        res.json({
            totalArchivos,
            archivosPorTipo,
            tamanoTotal: tamanoTotal._sum.tamano || 0
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener las estadísticas'
        });
    }
};
