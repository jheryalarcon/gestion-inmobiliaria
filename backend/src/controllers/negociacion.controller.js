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
            mensaje: 'Negociación creada correctamente',
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
        incluirInactivas = 'false',
        agenteId = '', // 🆕 Nuevo filtro
        page = 1,
        limit = 10
    } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros
        const where = {};

        // 🆕 LÓGICA DE VISUALIZACIÓN:
        // Si incluirInactivas es FALSE (por defecto), solo mostramos:
        // 1. Negociaciones ACTIVAS
        // 2. Propiedades NO inactivas
        if (incluirInactivas !== 'true') {
            where.activo = true;
            where.propiedad = {
                estado_publicacion: { not: 'inactiva' }
            };
        } else {
            // Si es TRUE, mostramos TODO (incluido soft-deleted y propiedades inactivas)
            // No agregamos restricciones.
        }

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
            // 💡 Si filtramos por una propiedad específica, IGNORAMOS el filtro de inactivas
            if (incluirInactivas !== 'true') {
                delete where.propiedad;
            }
        }

        // 🆕 Filtro por Agente (Solo Admin puede usarlo libremente, Agentes tienen restricción abajo)
        if (agenteId && !isNaN(parseInt(agenteId))) {
            where.agenteId = parseInt(agenteId);
        }

        // --- LÓGICA DE PRIVACIDAD AVANZADA ---
        if (usuario.rol === 'agente') {
            // 🛡️ REGLA ESTRICTA: Solo ves lo que es tuyo o de tus propiedades
            where.OR = [
                { agenteId: usuario.id }, // Soy el comprador
                { propiedad: { agenteId: usuario.id } } // Soy el captador
            ];

            // ⚠️ Si un agente intenta filtrar por OTRO agente, esta lógica de arriba 
            // más 'where.agenteId' podría generar conflicto (AND).
            // Si el agente filtra por "Agente B", el where final sería:
            // (agenteId = B) AND (agenteId = Yo OR propiedad.agenteId = Yo).
            // Esto es correcto: Solo verá negociaciones de B donde B le está vendiendo SU propiedad (si aplica).
        }

        // Búsqueda por nombre de cliente, título de propiedad o CÓDIGO
        if (search) {
            const searchFilters = [
                {
                    cliente: {
                        nombre: { contains: search, mode: 'insensitive' }
                    }
                },
                {
                    cliente: {
                        email: { contains: search, mode: 'insensitive' }
                    }
                },
                {
                    cliente: {
                        cedula: { contains: search, mode: 'insensitive' }
                    }
                },
                {
                    propiedad: {
                        titulo: { contains: search, mode: 'insensitive' }
                    }
                },
                {
                    propiedad: {
                        codigo_interno: { contains: search, mode: 'insensitive' } // 🆕 Búsqueda por código
                    }
                }
            ];

            // Si ya existe un where.OR (por la restricción de agente), debemos combinarlo cuidadosamente
            if (where.OR) {
                // Prisma: AND [ (Restricción Agente), (Search OR) ]
                where.AND = [
                    { OR: where.OR },
                    { OR: searchFilters }
                ];
                delete where.OR; // Movemos la restricción original dentro del AND
            } else {
                where.OR = searchFilters;
            }
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
                            tipo_cliente: true,
                            cedula: true
                        }
                    },
                    propiedad: {
                        select: {
                            id: true,
                            titulo: true,
                            precio: true,
                            direccion: true,
                            ciudad: true,
                            estado_publicacion: true,
                            codigo_interno: true,
                            agenteId: true,
                            agente: { // 🆕 INCLUIR DATOS DEL CAPTADOR
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
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
                        estado_publicacion: true,
                        agenteId: true
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
        // REGLA: Verificar que la etapa sea válida
        const etapasValidas = ['interes', 'negociacion', 'cierre', 'finalizada', 'cancelada'];
        if (!etapasValidas.includes(etapa)) {
            return res.status(400).json({
                mensaje: '❌ Etapa inválida. Las etapas permitidas son: ' + etapasValidas.join(', ')
            });
        }

        //  INICIO DE TRANSACCIÓN PARA PREVENIR RACE CONDITIONS
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
                    // ✅ EXCEPCIÓN: Si la negociación está en 'cierre' (propiedad reservada), el Captador PUEDE retrocederla.
                    const esRetrocesoPermitido = negociacion.etapa === 'cierre' && ['interes', 'negociacion'].includes(etapa);
                    // ✅ EXCEPCIÓN: Deshacer Finalización (Finaliada -> Cierre)
                    const esDeshacerFinalizacion = negociacion.etapa === 'finalizada' && etapa === 'cierre';

                    if (!etapasPermitidasParaCaptador.includes(etapa) && !esRetrocesoPermitido && !esDeshacerFinalizacion) {
                        throw new Error('FORBIDDEN_CAPTADOR');
                    }
                } else {
                    throw new Error('FORBIDDEN_ACCESS');
                }
            }

            // ⛔ REGLA DE CONGELAMIENTO & DISPONIBILIDAD (CRÍTICO)
            const estadoPropiedad = negociacion.propiedad.estado_publicacion;
            const esTransicionCierreFinal = estadoPropiedad === 'reservada' && negociacion.etapa === 'cierre' && etapa === 'finalizada';

            // ✅ RETROCESO LÓGICO
            // 1. Cierre -> Negociación/Interés (Libera propiedad)
            const esRetrocesoDesdeCierre = estadoPropiedad === 'reservada' && negociacion.etapa === 'cierre' && ['interes', 'negociacion'].includes(etapa);
            // 2. Finalizada -> Cierre (Mantiene propiedad reservada)
            const esDeshacerFinalizacionGlobal = (estadoPropiedad === 'vendida' || estadoPropiedad === 'arrendada') && negociacion.etapa === 'finalizada' && etapa === 'cierre';

            if (estadoPropiedad !== 'disponible' && etapa !== 'cancelada' && !esTransicionCierreFinal && !esRetrocesoDesdeCierre && !esDeshacerFinalizacionGlobal) {
                throw new Error(`PROPERTY_${estadoPropiedad}`);
            }

            // 🔐 AUTORIDAD PARA CIERRE Y FINALIZACION
            // Solo el Agente Responsable (Captador) o Admin pueden mover a Cierre/Finalizada
            if ((etapa === 'cierre' || etapa === 'finalizada') && !esAdmin && !esAgenteResponsable) {
                throw new Error('AUTHORIZATION_REQUIRED_STRICT'); // Mensaje específico para esta nueva regla
            }

            // Permitimos también al Dueño de la Negociación hacer estos cambios SI NO SON CIERRE/FINALIZADA
            // (La regla de arriba ya filtró closure/finalized para no captadores)
            if (!esAdmin && !esAgenteResponsable && !esDueñoNegociacion) {
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
            } else if (esRetrocesoDesdeCierre) {
                // ✅ RETROCESO AUTOMÁTICO: Si volvemos de cierre a negociacion/interes, liberamos la propiedad.
                nuevoEstadoPropiedad = 'disponible';
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
            negociacion: resultadoFinal.negociacionActualizada,
            fecha_cambio: resultadoFinal.fecha_cambio
        });

    } catch (error) {
        console.error('Error al actualizar negociación:', error.message);

        // Manejo de errores específicos lanzados desde la transacción
        if (error.message === 'NOT_FOUND') return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        if (error.message === 'INACTIVE') return res.status(400).json({ mensaje: 'No se puede actualizar una negociación inactiva' });
        if (error.message === 'FORBIDDEN_CAPTADOR') return res.status(403).json({ mensaje: '⛔ Como Agente Captador, solo puedes intervenir para Cerrar, Finalizar o Cancelar.' });
        if (error.message === 'FORBIDDEN_ACCESS') return res.status(403).json({ mensaje: '❌ Acceso denegado. No tienes permisos sobre esta negociación.' });
        if (error.message === 'AUTHORIZATION_REQUIRED') return res.status(403).json({ mensaje: '⛔ No tienes permisos para modificar esta negociación.' });
        if (error.message === 'AUTHORIZATION_REQUIRED_STRICT') return res.status(403).json({ mensaje: '⛔ Solo el Agente Captador (o Admin) puede marcar como Cerrada o Finalizada.' });
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

            // Verificar permisos: Permiso al Dueño de Negociación O al Captador (Dueño de Propiedad)
            const esDueñoNegociacion = negociacion.agenteId === usuario.id;
            const esAgenteResponsable = negociacion.propiedad.agenteId === usuario.id;

            if (usuario.rol === 'agente' && !esDueñoNegociacion && !esAgenteResponsable) {
                throw new Error('FORBIDDEN');
            }

            // 🛡️ REGLA UNIVERSAL: Nadie (ni Admin) elimina Cierre/Finalizada.
            // Para mantener la integridad financiera y de reservas.
            if (['cierre', 'finalizada'].includes(negociacion.etapa)) {
                throw new Error('CANNOT_DELETE_LOCKED_STAGE');
            }

            // 🛡️ REGLA "ERROR DE DEDO": Agentes solo pueden eliminar en etapa INICIAL (Interés)
            // Si la negociación ya avanzó (Negociación, Cierre, Finalizada, Cancelada), 
            // ya existe historial relevante y NO debe borrarse. Debe usarse "Cancelar".
            // NOTA: Cierre y Finalizada ya están bloqueadas arriba para todos.
            // Aquí bloqueamos "Negociación" y "Cancelada" solo para Agentes.
            // El Admin SÍ puede borrar Negociación/Cancelada si desea limpiar.
            if (negociacion.etapa !== 'interes' && usuario.rol !== 'admin') {
                throw new Error('CANNOT_DELETE_ADVANCED_STAGE');
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
        if (error.message === 'CANNOT_DELETE_LOCKED_STAGE') return res.status(403).json({ mensaje: '⛔ No puedes eliminar una negociación en Cierre o Finalizada. Esta acción está prohibida para mantener la integridad de los datos. Debes Cancelarla.' });
        if (error.message === 'CANNOT_DELETE_ADVANCED_STAGE') return res.status(403).json({ mensaje: '⛔ Solo puedes eliminar negociaciones en etapa inicial (Interés). Si la negociación avanzó, debes usar la opción de Cancelar.' });

        res.status(500).json({ mensaje: 'Error interno del servidor al desactivar la negociación' });
    }
};

// Restaurar negociación eliminada (Solo Admin)
export const restaurarNegociacion = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        if (usuario.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Solo los administradores pueden restaurar negociaciones.' });
        }

        const resultadoRestauracion = await prisma.$transaction(async (tx) => {
            const negociacion = await tx.negociacion.findUnique({
                where: { id: parseInt(id) },
                include: { propiedad: true }
            });

            if (!negociacion) {
                throw new Error('NOT_FOUND');
            }

            if (negociacion.activo) {
                throw new Error('ALREADY_ACTIVE');
            }

            // 🛡️ VERIFICACIÓN DE ESTADO DE PROPIEDAD
            // Si vamos a revivir una negociación que bloquea la propiedad (Cierre/Finalizada),
            // debemos asegurarnos que la propiedad esté DISPONIBLE actualmente.
            const estadosQueBloquean = ['cierre', 'finalizada'];
            if (estadosQueBloquean.includes(negociacion.etapa)) {
                if (negociacion.propiedad.estado_publicacion !== 'disponible') {
                    throw new Error(`PROPERTY_BUSY:${negociacion.propiedad.estado_publicacion}`);
                }
            }

            // REACTIVAR
            const negociacionRestaurada = await tx.negociacion.update({
                where: { id: parseInt(id) },
                data: { activo: true },
                include: {
                    cliente: { select: { id: true, nombre: true } },
                    propiedad: { select: { id: true, titulo: true, estado_publicacion: true } }
                }
            });

            // 🔄 RESTAURAR ESTADO DE PROPIEDAD SI ES NECESARIO
            let nuevoEstadoPropiedad = null;
            if (negociacion.etapa === 'cierre') {
                nuevoEstadoPropiedad = 'reservada';
            } else if (negociacion.etapa === 'finalizada') {
                nuevoEstadoPropiedad = negociacion.propiedad.transaccion === 'venta' ? 'vendida' : 'arrendada';
            }

            if (nuevoEstadoPropiedad) {
                await tx.propiedad.update({
                    where: { id: negociacion.propiedadId },
                    data: { estado_publicacion: nuevoEstadoPropiedad }
                });
                negociacionRestaurada.propiedad.estado_publicacion = nuevoEstadoPropiedad;
            }

            // 📋 AUDITORÍA
            const nombreUsuario = usuario.name || usuario.email;
            await tx.seguimiento.create({
                data: {
                    negociacionId: parseInt(id),
                    agenteId: usuario.id,
                    fecha: new Date(),
                    tipo: 'otro',
                    comentario: `♻️ Negociación Restaurada.\n👮 Acción realizada por: ${nombreUsuario} (Admin).`
                }
            });

            return negociacionRestaurada;
        });

        res.json({
            mensaje: '✅ Negociación restaurada correctamente',
            negociacion: resultadoRestauracion
        });

    } catch (error) {
        console.error('Error al restaurar negociación:', error);
        if (error.message === 'NOT_FOUND') return res.status(404).json({ mensaje: 'Negociación no encontrada' });
        if (error.message === 'ALREADY_ACTIVE') return res.status(400).json({ mensaje: 'La negociación ya está activa' });
        if (error.message.startsWith('PROPERTY_BUSY')) {
            const estado = error.message.split(':')[1];
            return res.status(409).json({ mensaje: `⚠️ No se puede restaurar. La propiedad ahora está "${estado}" por otra gestión.` });
        }
        res.status(500).json({ mensaje: 'Error interno al restaurar' });
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
