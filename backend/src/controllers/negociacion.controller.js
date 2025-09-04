import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Crear una nueva negociación
export const crearNegociacion = async (req, res) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    const { clienteId, propiedadId } = req.body;
    const usuario = req.usuario;

    try {
        // Verificar que el cliente existe y pertenece al agente
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(clienteId) },
            include: { agente: true }
        });

        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        if (!cliente.activo) {
            return res.status(400).json({ mensaje: 'No se puede crear negociación con un cliente inactivo' });
        }

        // ✅ Verificar que el cliente tenga un agente asignado
        if (!cliente.agenteId) {
            return res.status(400).json({ 
                mensaje: 'No se puede crear negociación para un cliente sin agente asignado' 
            });
        }

        // Verificar permisos: solo el agente responsable puede crear negociaciones
        if (usuario.rol === 'agente' && cliente.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permisos para gestionar este cliente' });
        }

        // Verificar que la propiedad existe
        const propiedad = await prisma.propiedad.findUnique({
            where: { id: parseInt(propiedadId) }
        });

        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        // ✅ SOLO permitir negociaciones con propiedades DISPONIBLES
        if (propiedad.estado_publicacion !== 'disponible') {
            return res.status(400).json({ 
                mensaje: `No se puede crear negociación con una propiedad que no está disponible. Estado actual: ${propiedad.estado_publicacion}` 
            });
        }

        // ✅ Verificar que no existe una negociación duplicada
        // Esto previene múltiples negociaciones entre el mismo cliente y propiedad
        const negociacionExistente = await prisma.negociacion.findFirst({
            where: {
                clienteId: parseInt(clienteId),
                propiedadId: parseInt(propiedadId),
                activo: true
            }
        });

        if (negociacionExistente) {
            return res.status(400).json({ 
                mensaje: 'Ya existe una negociación activa entre este cliente y propiedad' 
            });
        }

        // 🏠 CREAR LA NEGOCIACIÓN
        // LÓGICA DE NEGOCIO: 
        // - El agenteId será SIEMPRE el agente del cliente (quien gestiona la relación)
        // - Los agentes pueden crear negociaciones con propiedades de otros agentes
        // - Esto permite colaboración entre agentes en el mercado inmobiliario
        const negociacion = await prisma.negociacion.create({
            data: {
                clienteId: parseInt(clienteId),
                propiedadId: parseInt(propiedadId),
                agenteId: cliente.agenteId, // Siempre el agente del cliente
                etapa: 'interes'
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        telefono: true
                    }
                },
                propiedad: {
                    select: {
                        id: true,
                        titulo: true,
                        precio: true,
                        direccion: true,
                        ciudad: true
                    }
                },
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            mensaje: '✅ Negociación creada correctamente',
            negociacion
        });

    } catch (error) {
        console.error('Error al crear negociación:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al crear la negociación' });
    }
};

// Obtener negociaciones con filtros
export const obtenerNegociaciones = async (req, res) => {
    const usuario = req.usuario;
    const { 
        search = '', 
        etapa = '', 
        clienteId = '', 
        propiedadId = '',
        page = 1,
        limit = 10
    } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Construir filtros
        const where = {
            activo: true
        };

        // Filtro por etapa
        if (etapa && etapa !== 'todas') {
            where.etapa = etapa;
        }

        // Filtro por cliente
        if (clienteId) {
            where.clienteId = parseInt(clienteId);
        }

        // Filtro por propiedad
        if (propiedadId) {
            where.propiedadId = parseInt(propiedadId);
        }

        // Filtro por agente (agentes solo ven sus negociaciones)
        if (usuario.rol === 'agente') {
            where.agenteId = usuario.id;
        }

        // Búsqueda por nombre de cliente o título de propiedad
        if (search) {
            where.OR = [
                {
                    cliente: {
                        nombre: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    propiedad: {
                        titulo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }

        // Obtener negociaciones
        const [negociaciones, total] = await Promise.all([
            prisma.negociacion.findMany({
                where,
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nombre: true,
                            email: true,
                            telefono: true,
                            tipo_cliente: true
                        }
                    },
                    propiedad: {
                        select: {
                            id: true,
                            titulo: true,
                            precio: true,
                            direccion: true,
                            ciudad: true,
                            estado_publicacion: true
                        }
                    },
                    agente: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { fecha_inicio: 'desc' },
                skip,
                take: parseInt(limit)
            }),
            prisma.negociacion.count({ where })
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            negociaciones,
            paginacion: {
                pagina: parseInt(page),
                limite: parseInt(limit),
                total,
                paginas: totalPages
            }
        });

    } catch (error) {
        console.error('Error al obtener negociaciones:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener las negociaciones' });
    }
};

// Obtener una negociación específica
export const obtenerNegociacion = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const negociacion = await prisma.negociacion.findUnique({
            where: { id: parseInt(id) },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        telefono: true,
                        tipo_cliente: true,
                        observaciones: true
                    }
                },
                propiedad: {
                    select: {
                        id: true,
                        titulo: true,
                        descripcion: true,
                        precio: true,
                        direccion: true,
                        ciudad: true,
                        estado_publicacion: true
                    }
                },
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        }

        // Verificar permisos: agentes solo pueden ver sus negociaciones
        if (usuario.rol === 'agente' && negociacion.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permisos para ver esta negociación' });
        }

        res.json({ negociacion });

    } catch (error) {
        console.error('Error al obtener negociación:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener la negociación' });
    }
};

// Actualizar etapa de la negociación
export const actualizarNegociacion = async (req, res) => {
    const { id } = req.params;
    const { etapa } = req.body;
    const usuario = req.usuario;

    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }

    try {
        // ✅ REGLA: Verificar que la etapa sea válida
        const etapasValidas = ['interes', 'negociacion', 'cierre', 'finalizada', 'cancelada'];
        if (!etapasValidas.includes(etapa)) {
            return res.status(400).json({ 
                mensaje: '❌ Etapa inválida. Las etapas permitidas son: ' + etapasValidas.join(', ')
            });
        }

        const negociacion = await prisma.negociacion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        }

        if (!negociacion.activo) {
            return res.status(400).json({ mensaje: 'No se puede actualizar una negociación inactiva' });
        }

        // ✅ REGLA: El agente solo puede cambiar etapas de sus propias negociaciones
        if (usuario.rol === 'agente' && negociacion.agenteId !== usuario.id) {
            return res.status(403).json({ 
                mensaje: '❌ Acceso denegado. Solo puedes actualizar negociaciones de tus clientes asignados' 
            });
        }

        // ✅ REGLA: El administrador solo puede visualizar, no modificar
        if (usuario.rol === 'admin') {
            return res.status(403).json({ 
                mensaje: '❌ Los administradores no pueden modificar etapas de negociación. Solo pueden visualizar.' 
            });
        }

        // ✅ REGLA: Se registra la fecha de cada cambio de etapa
        const negociacionActualizada = await prisma.negociacion.update({
            where: { id: parseInt(id) },
            data: { 
                etapa,
                fecha_cambio_etapa: new Date() // Registrar fecha del cambio
            },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        telefono: true,
                        tipo_cliente: true
                    }
                },
                propiedad: {
                    select: {
                        id: true,
                        titulo: true,
                        precio: true,
                        direccion: true,
                        ciudad: true,
                        estado_publicacion: true
                    }
                },
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            mensaje: `✅ Etapa de negociación actualizada correctamente a "${etapa}"`,
            negociacion: negociacionActualizada,
            fecha_cambio: negociacionActualizada.fecha_cambio_etapa
        });

    } catch (error) {
        console.error('Error al actualizar negociación:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al actualizar la negociación' });
    }
};

// Desactivar negociación (soft delete)
export const desactivarNegociacion = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const negociacion = await prisma.negociacion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        }

        if (!negociacion.activo) {
            return res.status(400).json({ mensaje: 'La negociación ya está inactiva' });
        }

        // Verificar permisos: solo el agente responsable puede desactivar
        if (usuario.rol === 'agente' && negociacion.agenteId !== usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permisos para desactivar esta negociación' });
        }

        const negociacionDesactivada = await prisma.negociacion.update({
            where: { id: parseInt(id) },
            data: { activo: false },
            include: {
                cliente: {
                    select: {
                        id: true,
                        nombre: true
                    }
                },
                propiedad: {
                    select: {
                        id: true,
                        titulo: true
                    }
                }
            }
        });

        res.json({
            mensaje: '✅ Negociación desactivada correctamente',
            negociacion: negociacionDesactivada
        });

    } catch (error) {
        console.error('Error al desactivar negociación:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al desactivar la negociación' });
    }
};

// Obtener estadísticas de negociaciones
export const obtenerEstadisticas = async (req, res) => {
    const usuario = req.usuario;

    try {
        const where = { activo: true };
        
        // Agentes solo ven sus estadísticas
        if (usuario.rol === 'agente') {
            where.agenteId = usuario.id;
        }

        const [
            totalNegociaciones,
            negociacionesPorEtapa,
            negociacionesRecientes
        ] = await Promise.all([
            // Total de negociaciones
            prisma.negociacion.count({ where }),
            
            // Negociaciones por etapa
            prisma.negociacion.groupBy({
                by: ['etapa'],
                where,
                _count: { etapa: true }
            }),
            
            // Negociaciones de los últimos 30 días
            prisma.negociacion.count({
                where: {
                    ...where,
                    fecha_inicio: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        res.json({
            totalNegociaciones,
            negociacionesPorEtapa,
            negociacionesRecientes
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener estadísticas' });
    }
};
