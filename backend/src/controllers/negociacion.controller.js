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
        if (clienteId && !isNaN(parseInt(clienteId))) {
            where.clienteId = parseInt(clienteId);
        }

        // Filtro por propiedad
        if (propiedadId && !isNaN(parseInt(propiedadId))) {
            where.propiedadId = parseInt(propiedadId);
        }

        // --- LÓGICA DE PRIVACIDAD AVANZADA ---
        if (usuario.rol === 'agente') {
            if (propiedadId && !isNaN(parseInt(propiedadId))) {
                // Si el agente está viendo una propiedad específica:
                // PUEDE ver todas las negociaciones de esa propiedad (para colaboración/competencia)
                // PERO... los datos sensibles se censurarán más adelante si no es el dueño de la negociación.
                // NO aplicamos restricción where.agenteId aquí.
            } else {
                // Si está viendo el panel general (sin filtrar por propiedad):
                // SOLO ve sus propias negociaciones.
                where.agenteId = usuario.id;
            }
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

        // console.log('Consultando negociaciones con filtros:', JSON.stringify(where, null, 2));

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

        // --- SANITIZACIÓN DE DATOS (Anonimización) ---
        const negociacionesSanitizadas = negociaciones.map(negociacion => {
            // Regla: Si soy agente Y NO es mi negociación -> Censurar
            if (usuario.rol === 'agente' && negociacion.agenteId !== usuario.id) {
                const nombreAgente = negociacion.agente?.name || 'Agente';
                return {
                    ...negociacion,
                    cliente: {
                        id: null, // Ocultar ID para evitar navegación a perfil
                        nombre: `Cliente Confidencial de ${nombreAgente.split(' ')[0]}`,
                        email: '---', // Oculto
                        telefono: '---', // Oculto
                        tipo_cliente: '---' // Oculto
                    },
                    esConfidencial: true // Flag para UI frontend
                };
            }
            return {
                ...negociacion,
                esConfidencial: false
            };
        });

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            negociaciones: negociacionesSanitizadas,
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
            where: { id: parseInt(id) },
            include: { propiedad: true }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        }

        if (!negociacion.activo) {
            return res.status(400).json({ mensaje: 'No se puede actualizar una negociación inactiva' });
        }

        // ✅ REGLA: El agente solo puede cambiar etapas de sus propias negociaciones
        // (Excepto Admin o Agente Responsable que podrían necesitar intervenir en pasos finales)
        const esAgenteResponsable = negociacion.propiedad.agenteId === usuario.id;
        const esAdmin = usuario.rol === 'admin';
        const esDueñoNegociacion = negociacion.agenteId === usuario.id;

        if (usuario.rol === 'agente') {
            // Caso A: Soy el Agente Comprador (Dueño de la Negociación)
            if (esDueñoNegociacion) {
                // Tengo control total de MIS etapas (salvo las restringidas más adelante)
            }
            // Caso B: Soy el Agente Responsable (Captador de la Propiedad) pero NO es mi cliente
            else if (esAgenteResponsable) {
                // SOLO puedo intervenir para Cerrar, Finalizar o Cancelar (Rechazar)
                const etapasPermitidasParaCaptador = ['cierre', 'finalizada', 'cancelada'];
                if (!etapasPermitidasParaCaptador.includes(etapa)) {
                    return res.status(403).json({
                        mensaje: '⛔ Como Agente Captador, solo puedes intervenir para Cerrar, Finalizar o Cancelar una negociación ajena. No puedes modificar etapas previas.'
                    });
                }
            }
            // Caso C: No soy ni el comprador ni el captador
            else {
                return res.status(403).json({
                    mensaje: '❌ Acceso denegado. No tienes permisos sobre esta negociación.'
                });
            }
        }

        // ⛔ REGLA DE CONGELAMIENTO (Propiedad No Disponible)
        // Si la propiedad NO está disponible, nadie puede mover negociaciones, EXCEPTO:
        // 1. Si la propiedad está 'reservada' Y estamos moviendo ESTA negociación de 'cierre' a 'finalizada' (Completar venta).
        // 2. Si es para Cancelar (siempre se puede cancelar/perder un cliente).
        const estadoPropiedad = negociacion.propiedad.estado_publicacion;
        const esTransicionCierreFinal = estadoPropiedad === 'reservada' && negociacion.etapa === 'cierre' && etapa === 'finalizada';

        if (estadoPropiedad !== 'disponible' && etapa !== 'cancelada' && !esTransicionCierreFinal) {
            return res.status(400).json({
                mensaje: `⛔ No se puede actualizar la negociación. La propiedad se encuentra en estado "${estadoPropiedad}" y las negociaciones están pausadas.`
            });
        }

        // 🔐 REGLA DE AUTORIDAD PARA CIERRE (Check-in del Responsable)
        // Solo el Admin o el Agente Responsable pueden mover a 'cierre' o 'finalizada'
        if ((etapa === 'cierre' || etapa === 'finalizada') && !esAdmin && !esAgenteResponsable) {
            return res.status(403).json({
                mensaje: '⛔ Solo el Agente Responsable de la propiedad (Captador) puede autorizar el Cierre o Finalización. Por favor contacta al responsable para proceder.'
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

        // 🛡️ MÁSCARA DE PRIVACIDAD
        // Si no soy el dueño de la negociación (ni admin), NO debo ver los datos del cliente
        // Esto protege la cartera del agente comprador frente al agente captador
        if (usuario.rol !== 'admin' && negociacion.agenteId !== usuario.id) {
            negociacionActualizada.cliente.nombre = 'Cliente Protegido';
            negociacionActualizada.cliente.email = 'confidencial@sistema.com';
            negociacionActualizada.cliente.telefono = '***********';
        }

        // 🤖 AUTOMATIZACIÓN DE ESTADOS DE PROPIEDAD
        let nuevoEstadoPropiedad = null;

        if (etapa === 'cierre') {
            // Cierre -> Reservada
            nuevoEstadoPropiedad = 'reservada';
        } else if (etapa === 'finalizada') {
            // Finalizada -> Vendida/Arrendada
            if (negociacion.propiedad.transaccion === 'venta') {
                nuevoEstadoPropiedad = 'vendida';
            } else {
                nuevoEstadoPropiedad = 'arrendada';
            }
        } else if (etapa === 'cancelada') {
            // Si SE CANCELA y estaba Reservada -> Volver a Disponible
            // (Solo si esta negociación era la que la tenía reservada... pero como simplificamos, 
            // asumimos que si estaba reservada y alguien cancela, es probable que fuera esta. 
            // Pero CUIDADO: Si otra estaba en espera y cancela, no debería liberar la propiedad.
            // MEJORA: Solo liberar si la propiedad estaba 'reservada' Y esta negociación estaba en 'cierre')
            if (negociacion.propiedad.estado_publicacion === 'reservada' && negociacion.etapa === 'cierre') {
                nuevoEstadoPropiedad = 'disponible';
            }
        }

        if (nuevoEstadoPropiedad) {
            await prisma.propiedad.update({
                where: { id: negociacion.propiedadId },
                data: { estado_publicacion: nuevoEstadoPropiedad }
            });
        }

        // ❌ ELIMINADO: Auto-cancelación de competencia. 
        // Ahora las otras negociaciones simplemente quedan "Pausadas" (Frozen) 
        // porque la propiedad ya no estará en estado 'disponible'.

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
