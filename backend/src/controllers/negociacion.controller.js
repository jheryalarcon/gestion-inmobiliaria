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
        // LÓGICA DE ASIGNACIÓN DE AGENTE:
        // 1. Si es ADMIN y envía un agenteId específico -> Se asigna a ese agente
        // 2. Por defecto -> Se asigna al agente dueño del cliente
        let agenteResponsableId = cliente.agenteId;

        if (usuario.rol === 'admin' && req.body.agenteId) {
            // Verificar que el agente asignado exista
            const agenteAsignado = await prisma.usuario.findUnique({
                where: { id: parseInt(req.body.agenteId) }
            });

            if (!agenteAsignado || (agenteAsignado.rol !== 'agente' && agenteAsignado.rol !== 'admin')) {
                return res.status(400).json({ mensaje: 'El agente asignado no es válido' });
            }
            agenteResponsableId = parseInt(req.body.agenteId);
        }

        const negociacion = await prisma.negociacion.create({
            data: {
                clienteId: parseInt(clienteId),
                propiedadId: parseInt(propiedadId),
                agenteId: agenteResponsableId,
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



        // 📋 AUDITORÍA: Registrar creación
        const nombreUsuario = usuario.name || usuario.email;
        const rolUsuario = usuario.rol === 'admin' ? 'Administrador' : 'Agente';
        await prisma.seguimiento.create({
            data: {
                negociacionId: negociacion.id,
                agenteId: usuario.id,
                fecha: new Date(),
                tipo: 'otro',
                comentario: `✨ Negociación Creada.\n👮 Acción realizada por: ${nombreUsuario} (${rolUsuario}).`
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

        // 🛡️ INICIO DE TRANSACCIÓN PARA PREVENIR RACE CONDITIONS
        // (Evita Doble Booking al verificar disponibilidad y reservar en el mismo bloque atómico)
        const resultadoFinal = await prisma.$transaction(async (tx) => {

            const negociacion = await tx.negociacion.findUnique({
                where: { id: parseInt(id) },
                include: { propiedad: true }
            });

            if (!negociacion) {
                throw new Error('NOT_FOUND'); // Manejado en catch
            }

            if (!negociacion.activo) {
                throw new Error('INACTIVE');
            }

            // ✅ REGLAS DE PERMISOS (Igual que antes, pero dentro de TX)
            const esAgenteResponsable = negociacion.propiedad.agenteId === usuario.id;
            const esAdmin = usuario.rol === 'admin';
            const esDueñoNegociacion = negociacion.agenteId === usuario.id;

            if (usuario.rol === 'agente') {
                if (esDueñoNegociacion) {
                    // OK
                } else if (esAgenteResponsable) {
                    const etapasPermitidasParaCaptador = ['cierre', 'finalizada', 'cancelada'];
                    if (!etapasPermitidasParaCaptador.includes(etapa)) {
                        throw new Error('FORBIDDEN_CAPTADOR');
                    }
                } else {
                    throw new Error('FORBIDDEN_ACCESS');
                }
            }

            // ⛔ REGLA DE CONGELAMIENTO & DISPONIBILIDAD (CRÍTICO)
            const estadoPropiedad = negociacion.propiedad.estado_publicacion;
            const esTransicionCierreFinal = estadoPropiedad === 'reservada' && negociacion.etapa === 'cierre' && etapa === 'finalizada';

            if (estadoPropiedad !== 'disponible' && etapa !== 'cancelada' && !esTransicionCierreFinal) {
                throw new Error(`PROPERTY_${estadoPropiedad}`);
            }

            // 🔐 AUTORIDAD PARA CIERRE
            if ((etapa === 'cierre' || etapa === 'finalizada') && !esAdmin && !esAgenteResponsable) {
                throw new Error('AUTHORIZATION_REQUIRED');
            }

            // ✅ ACTUALIZAR NEGOCIACIÓN
            const negociacionActualizada = await tx.negociacion.update({
                where: { id: parseInt(id) },
                data: {
                    etapa,
                    fecha_cambio_etapa: new Date()
                },
                include: {
                    cliente: {
                        select: { id: true, nombre: true, email: true, telefono: true, tipo_cliente: true }
                    },
                    propiedad: {
                        select: { id: true, titulo: true, precio: true, direccion: true, ciudad: true, estado_publicacion: true }
                    },
                    agente: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });

            // 🛡️ MÁSCARA DE PRIVACIDAD
            if (usuario.rol !== 'admin' && negociacion.agenteId !== usuario.id) {
                negociacionActualizada.cliente.nombre = 'Cliente Protegido';
                negociacionActualizada.cliente.email = 'confidencial@sistema.com';
                negociacionActualizada.cliente.telefono = '***********';
            }

            // 🤖 AUTOMATIZACIÓN DE ESTADOS DE PROPIEDAD Y ROLLBACKS
            let nuevoEstadoPropiedad = null;

            if (etapa === 'cierre') {
                // Cierre -> Reservada
                // 🔒 CRÍTICO: Asegurar que NO se haya reservado en milisegundos previos (Check extra optimista)
                // Aunque el check de arriba lo cubre en esta TX serializada (dependiendo del aislamiento),
                // verificamos que la propiedad siga disponible antes de marcar.
                // Sin embargo, si llegamos aquí, "negociacion" leída al inicio decía disponible.
                nuevoEstadoPropiedad = 'reservada';
            } else if (etapa === 'finalizada') {
                if (negociacion.propiedad.transaccion === 'venta') {
                    nuevoEstadoPropiedad = 'vendida';
                } else {
                    nuevoEstadoPropiedad = 'arrendada';
                }
            } else if (etapa === 'cancelada') {
                // LÓGICA DE REVERSA
                const etapaAnterior = negociacion.etapa;
                if (estadoPropiedad === 'reservada' && etapaAnterior === 'cierre') {
                    nuevoEstadoPropiedad = 'disponible';
                } else if ((estadoPropiedad === 'vendida' || estadoPropiedad === 'arrendada') && etapaAnterior === 'finalizada') {
                    nuevoEstadoPropiedad = 'disponible';
                }
            }

            if (nuevoEstadoPropiedad) {
                await tx.propiedad.update({
                    where: { id: negociacion.propiedadId },
                    data: { estado_publicacion: nuevoEstadoPropiedad }
                });
                // Actualizamos el objeto de retorno visualmente para el frontend
                negociacionActualizada.propiedad.estado_publicacion = nuevoEstadoPropiedad;
            }

            // 📋 AUDITORÍA
            const etapaAnterior = negociacion.etapa;
            const nombreUsuario = usuario.name || usuario.email;
            const rolUsuario = usuario.rol === 'admin' ? 'Administrador' : (esAgenteResponsable ? 'Agente Captador' : 'Agente Comprador');

            await tx.seguimiento.create({
                data: {
                    negociacionId: parseInt(id),
                    agenteId: usuario.id,
                    fecha: new Date(),
                    tipo: 'otro',
                    comentario: `🔄 Cambio de Etapa: "${etapaAnterior}" ➝ "${etapa}".\n👮 Acción realizada por: ${nombreUsuario} (${rolUsuario}).`
                }
            });

            return { negociacionActualizada, fecha_cambio: negociacionActualizada.fecha_cambio_etapa };
        });

        // Respuesta Exitosa fuera de la transacción
        res.json({
            mensaje: `✅ Etapa de negociación actualizada correctamente a "${etapa}"`,
            negociacion: result.negociacionActualizada,
            fecha_cambio: result.fecha_cambio
        });

    } catch (error) {
        console.error('Error al actualizar negociación:', error.message);

        // Manejo de errores específicos lanzados desde la transacción
        if (error.message === 'NOT_FOUND') return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        if (error.message === 'INACTIVE') return res.status(400).json({ mensaje: 'No se puede actualizar una negociación inactiva' });
        if (error.message === 'FORBIDDEN_CAPTADOR') return res.status(403).json({ mensaje: '⛔ Como Agente Captador, solo puedes intervenir para Cerrar, Finalizar o Cancelar.' });
        if (error.message === 'FORBIDDEN_ACCESS') return res.status(403).json({ mensaje: '❌ Acceso denegado. No tienes permisos sobre esta negociación.' });
        if (error.message === 'AUTHORIZATION_REQUIRED') return res.status(403).json({ mensaje: '⛔ Solo el Agente Responsable (Captador) puede autorizar el Cierre o Finalización.' });
        if (error.message.startsWith('PROPERTY_')) {
            const estado = error.message.split('_')[1];
            return res.status(400).json({ mensaje: `⛔ La propiedad se encuentra en estado "${estado}" y las negociaciones están pausadas.` });
        }

        res.status(500).json({ mensaje: 'Error interno del servidor al actualizar la negociación', detalle: error.message });
    }
};

// Desactivar negociación (soft delete)
export const desactivarNegociacion = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // 🛡️ INICIO DE TRANSACCIÓN ATÓMICA
        // Garantiza que la liberación de la propiedad y la desactivación de la negociación ocurran juntas.
        const resultadoFinal = await prisma.$transaction(async (tx) => {
            const negociacion = await tx.negociacion.findUnique({
                where: { id: parseInt(id) },
                include: { propiedad: true }
            });

            if (!negociacion) {
                throw new Error('NOT_FOUND');
            }

            if (!negociacion.activo) {
                throw new Error('ALREADY_INACTIVE');
            }

            // Verificar permisos: solo el agente responsable puede desactivar
            if (usuario.rol === 'agente' && negociacion.agenteId !== usuario.id) {
                throw new Error('FORBIDDEN');
            }

            // 🛡️ LÓGICA DE REVERSIÓN (ROLLBACK) AUTOMÁTICA
            // Si eliminamos una negociación que tenía la propiedad "Reservada", "Vendida" o "Arrendada",
            // debemos liberarla automáticamente a "Disponible" para que no quede zombie.
            const etapaActual = negociacion.etapa;
            const propiedad = negociacion.propiedad;
            const estadosQueBloquean = ['reservada', 'vendida', 'arrendada'];

            // ¿Esta negociación era la culpable del bloqueo?
            if (['cierre', 'finalizada'].includes(etapaActual) && estadosQueBloquean.includes(propiedad.estado_publicacion)) {
                // TODO: Idealmente verificaríamos si NO existen otras negociaciones ganadas,
                // pero por ahora asumimos que si ESTA estaba en cierre/finalizada, era la ganadora.
                await tx.propiedad.update({
                    where: { id: propiedad.id },
                    data: { estado_publicacion: 'disponible' }
                });
            }

            const negociacionDesactivada = await tx.negociacion.update({
                where: { id: parseInt(id) },
                data: { activo: false },
                include: {
                    cliente: { select: { id: true, nombre: true } },
                    propiedad: { select: { id: true, titulo: true, estado_publicacion: true } }
                }
            });

            // 📋 AUDITORÍA: Registrar desactivación
            const nombreUsuario = usuario.name || usuario.email;
            await tx.seguimiento.create({
                data: {
                    negociacionId: parseInt(id),
                    agenteId: usuario.id,
                    fecha: new Date(),
                    tipo: 'otro',
                    comentario: `🗑️ Negociación Eliminada (Soft Delete).\n🔓 Propiedad Liberada (si estaba bloqueada).\n👮 Acción realizada por: ${nombreUsuario}.`
                }
            });

            return negociacionDesactivada;
        });

        res.json({
            mensaje: '✅ Negociación desactivada correctamente',
            negociacion: resultadoFinal
        });

    } catch (error) {
        console.error('Error al desactivar negociación:', error);

        if (error.message === 'NOT_FOUND') return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        if (error.message === 'ALREADY_INACTIVE') return res.status(400).json({ mensaje: 'La negociación ya está inactiva' });
        if (error.message === 'FORBIDDEN') return res.status(403).json({ mensaje: 'No tienes permisos para desactivar esta negociación' });

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
