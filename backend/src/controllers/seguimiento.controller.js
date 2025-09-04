import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ OBTENER SEGUIMIENTOS DE UNA NEGOCIACIÓN
const obtenerSeguimientos = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ mensaje: '❌ Token no proporcionado' });
        }

        // Verificar que la negociación existe y está activa
        const negociacion = await prisma.negociacion.findFirst({
            where: { 
                id: parseInt(negociacionId),
                activo: true 
            },
            include: {
                agente: {
                    select: { id: true, name: true, email: true, rol: true }
                }
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // Obtener seguimientos ordenados por fecha (más recientes primero)
        const seguimientos = await prisma.seguimiento.findMany({
            where: { 
                negociacionId: parseInt(negociacionId),
                activo: true 
            },
            include: {
                agente: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { fecha: 'desc' }
        });

        res.json({
            mensaje: '✅ Seguimientos obtenidos correctamente',
            seguimientos,
            total: seguimientos.length
        });

    } catch (error) {
        console.error('Error al obtener seguimientos:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

// ✅ CREAR NUEVO SEGUIMIENTO
const crearSeguimiento = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const { comentario, tipo = 'otro' } = req.body;
        const agenteId = req.usuario.id;

        // ✅ REGLA: Validar campos requeridos
        if (!comentario || comentario.trim().length === 0) {
            return res.status(400).json({ 
                mensaje: '❌ El comentario es obligatorio' 
            });
        }

        if (comentario.trim().length > 1000) {
            return res.status(400).json({ 
                mensaje: '❌ El comentario no puede exceder 1000 caracteres' 
            });
        }

        // ✅ REGLA: Verificar que la negociación existe y está activa
        const negociacion = await prisma.negociacion.findFirst({
            where: { 
                id: parseInt(negociacionId),
                activo: true 
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // ✅ REGLA: Solo el agente responsable puede registrar seguimientos
        if (negociacion.agenteId !== agenteId) {
            return res.status(403).json({ 
                mensaje: '❌ Solo el agente responsable puede registrar seguimientos en esta negociación' 
            });
        }

        // ✅ REGLA: Verificar que el tipo de seguimiento sea válido
        const tiposValidos = ['llamada', 'visita', 'mensaje', 'email', 'reunion', 'documento', 'otro'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ 
                mensaje: '❌ Tipo de seguimiento inválido' 
            });
        }

        // Crear el seguimiento
        const seguimiento = await prisma.seguimiento.create({
            data: {
                negociacionId: parseInt(negociacionId),
                agenteId,
                comentario: comentario.trim(),
                tipo,
                fecha: new Date()
            },
            include: {
                agente: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        res.status(201).json({
            mensaje: '✅ Seguimiento registrado correctamente',
            seguimiento
        });

    } catch (error) {
        console.error('Error al crear seguimiento:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

// ✅ OBTENER SEGUIMIENTOS POR NEGOCIACIÓN (con paginación)
const obtenerSeguimientosPaginados = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Verificar que la negociación existe
        const negociacion = await prisma.negociacion.findFirst({
            where: { 
                id: parseInt(negociacionId),
                activo: true 
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // Obtener seguimientos con paginación
        const [seguimientos, total] = await Promise.all([
            prisma.seguimiento.findMany({
                where: { 
                    negociacionId: parseInt(negociacionId),
                    activo: true 
                },
                include: {
                    agente: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { fecha: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.seguimiento.count({
                where: { 
                    negociacionId: parseInt(negociacionId),
                    activo: true 
                }
            })
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            mensaje: '✅ Seguimientos obtenidos correctamente',
            seguimientos,
            paginacion: {
                pagina: parseInt(page),
                limite: parseInt(limit),
                total,
                paginas: totalPages
            }
        });

    } catch (error) {
        console.error('Error al obtener seguimientos paginados:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

// ✅ OBTENER ESTADÍSTICAS DE SEGUIMIENTOS
const obtenerEstadisticasSeguimientos = async (req, res) => {
    try {
        const { negociacionId } = req.params;

        // Verificar que la negociación existe
        const negociacion = await prisma.negociacion.findFirst({
            where: { 
                id: parseInt(negociacionId),
                activo: true 
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // Obtener estadísticas
        const [totalSeguimientos, seguimientosPorTipo, seguimientosPorMes] = await Promise.all([
            // Total de seguimientos
            prisma.seguimiento.count({
                where: { 
                    negociacionId: parseInt(negociacionId),
                    activo: true 
                }
            }),
            // Seguimientos por tipo
            prisma.seguimiento.groupBy({
                by: ['tipo'],
                where: { 
                    negociacionId: parseInt(negociacionId),
                    activo: true 
                },
                _count: { tipo: true }
            }),
            // Seguimientos por mes (últimos 6 meses)
            prisma.seguimiento.groupBy({
                by: ['fecha'],
                where: { 
                    negociacionId: parseInt(negociacionId),
                    activo: true,
                    fecha: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                },
                _count: { fecha: true }
            })
        ]);

        res.json({
            mensaje: '✅ Estadísticas obtenidas correctamente',
            estadisticas: {
                totalSeguimientos,
                seguimientosPorTipo,
                seguimientosPorMes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

export default {
    obtenerSeguimientos,
    crearSeguimiento,
    obtenerSeguimientosPaginados,
    obtenerEstadisticasSeguimientos
};
