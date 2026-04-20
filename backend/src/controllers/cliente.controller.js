import prisma from '../prisma/client.js'

// Crear un nuevo cliente
export const crearCliente = async (req, res) => {
    const {
        nombre,
        telefono,
        email,
        tipo_cliente,
        observaciones,
        agenteId
    } = req.body;

    const usuario = req.usuario;
    const errores = [];

    // Validaciones obligatorias
    if (!nombre?.trim()) errores.push('El nombre es obligatorio');

    // Validación de Teléfono: formato ecuatoriano 10 dígitos
    if (!telefono?.trim()) {
        errores.push('El teléfono es obligatorio');
    } else {
        const soloDigitos = telefono.trim().replace(/\s/g, '');
        const telefonoRegex = /^(09\d{8}|0[2-7]\d{7})$/;
        if (!telefonoRegex.test(soloDigitos)) {
            errores.push('El teléfono debe ser un número ecuatoriano válido de 10 dígitos (ej: 0991234567 o 022345678)');
        }
    }

    if (!tipo_cliente) errores.push('El tipo de cliente es obligatorio');

    // LÓGICA DIFERENCIADA: Prospecto vs Cliente Completo
    const esProspecto = tipo_cliente === 'prospecto';

    // Email
    if (!esProspecto) {
        if (!email?.trim()) {
            errores.push('El correo electrónico es obligatorio para este tipo de cliente');
        }
    }

    // Validación de email único (Solo si se proporcionó)
    if (email?.trim()) {
        // Formato
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            errores.push('Formato de correo electrónico inválido');
        } else {
            // 1. Verificar si el email pertenece a un agente o admin del sistema
            // (NO bloquear si es un usuario con rol 'cliente' del portal)
            const esAgenteOAdmin = await prisma.usuario.findFirst({
                where: {
                    email: email.trim(),
                    rol: { in: ['agente', 'admin'] }
                }
            });

            if (esAgenteOAdmin) {
                errores.push('Este email pertenece a un agente o administrador del sistema y no puede usarse como cliente.');
            }

            // 2. Unicidad en tabla Cliente - Solo validar si el email NO es null/vacío
            const clienteExistente = await prisma.cliente.findFirst({
                where: { email: email.trim() }
            });
            if (clienteExistente) {
                errores.push('Este correo ya pertenece a un cliente registrado en el sistema. Si deseas hacer cambios, edita su ficha directamente.');
            }
        }
    }

    // Validación de cédula (Si se proporciona o si no es prospecto)
    const { cedula } = req.body;

    // Cédula obligatoria NO es requerida para prospectos, PERO si la escriben, debe ser válida.
    if (!esProspecto && (!cedula || !cedula.trim())) {
        errores.push('La cédula/RUC es obligatoria para este tipo de cliente');
    }

    if (cedula && cedula.trim()) {
        // 1. Solo dígitos
        if (!/^\d+$/.test(cedula.trim())) {
            errores.push('La cédula debe contener solo números');
        } else if (cedula.trim().length !== 10) {
            // 2. Exactamente 10 dígitos (cédula ecuatoriana)
            errores.push('La cédula debe tener exactamente 10 dígitos');
        } else {
            // 4. Unicidad en tabla Cliente
            const cedulaExistente = await prisma.cliente.findFirst({
                where: { cedula: cedula.trim() }
            });
            if (cedulaExistente) {
                errores.push('La cédula/RUC ya está registrada en otro cliente.');
            }

            // 5. Cross-check: ¿Pertenece a un Agente o Admin?
            const esAgenteOAdmin = await prisma.usuario.findFirst({
                where: {
                    cedula: cedula.trim(),
                    rol: { in: ['agente', 'admin'] }
                }
            });
            if (esAgenteOAdmin) {
                errores.push('Esta cédula pertenece a un agente o administrador del sistema y no puede usarse como cliente.');
            }
        }
    }

    // Validación de agente para administradores
    if (usuario.rol === 'admin' && !agenteId) {
        errores.push('Debe seleccionar un agente responsable');
    }

    // Validación de agente existente
    if (agenteId) {
        const agente = await prisma.usuario.findFirst({
            where: {
                id: parseInt(agenteId),
                rol: { in: ['agente', 'admin'] },
                activo: true
            }
        });
        if (!agente) {
            errores.push('El agente seleccionado no existe o no está activo');
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            mensaje: 'Validación fallida',
            errores
        });
    }

    try {
        const datosCliente = {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            email: email.trim(),
            cedula: cedula?.trim() || null, // Guardar cédula
            tipo_cliente,
            observaciones: observaciones?.trim() || null,
        };

        // Si es admin, asignar agente seleccionado
        if (usuario.rol === 'admin' && agenteId) {
            datosCliente.agenteId = parseInt(agenteId);
        } else if (usuario.rol === 'agente') {
            // Si es agente, asignarse automáticamente
            datosCliente.agenteId = usuario.id;
        }

        const cliente = await prisma.cliente.create({
            data: datosCliente,
            include: {
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
            mensaje: 'Cliente registrado correctamente',
            cliente
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al registrar el cliente'
        });
    }
};

// Obtener todos los clientes (con filtros según rol)
export const obtenerClientes = async (req, res) => {
    const usuario = req.usuario;
    const {
        page = 1,
        limit = 10,
        search = '',
        tipo_cliente = '',
        estado = 'activo',
        agenteId = '' // 🆕 Nuevo filtro
    } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros
        const where = {};

        // Filtro por rol
        if (usuario.rol === 'agente') {
            where.agenteId = usuario.id;
        } else if (agenteId && !isNaN(parseInt(agenteId))) {
            // 🆕 Si es Admin y filtró por un agente específico
            where.agenteId = parseInt(agenteId);
        }

        // Filtro por estado (activo/inactivo)
        if (estado === 'activo') {
            where.activo = true;
        } else if (estado === 'inactivo') {
            where.activo = false;
        }
        // Si estado es 'todos', no se aplica filtro

        // Filtro de búsqueda (Actualizado con Cédula)
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { telefono: { contains: search, mode: 'insensitive' } },
                { cedula: { contains: search, mode: 'insensitive' } } // Búsqueda por cédula activada
            ];
        }

        // Filtro por tipo de cliente
        if (tipo_cliente) {
            where.tipo_cliente = tipo_cliente;
        }

        // Ordenamiento dinámico
        const { sortBy = 'createdAt', order = 'desc' } = req.query;

        // Mapeo de columnas permitidas para ordenar
        const orderByClause = {};

        if (sortBy === 'ultima_interaccion') {
            // Ordenar por la fecha de la última negociación (más complejo, pero útil)
            // Nota: Prisma tiene limitaciones para ordenar por relaciones anidadas directas en algunos casos,
            // pero podemos intentar ordenar por la fecha de creación del cliente si no hay negociación,
            // o simplificarlo ordenando por createdAt por ahora si da problemas.
            // Una estrategia común es ordenar por una columna calculada o simple.
            // Para mantenerlo simple y robusto:
            orderByClause.updatedAt = order;
        } else if (['nombre', 'email', 'createdAt'].includes(sortBy)) {
            orderByClause[sortBy] = order;
        } else {
            orderByClause.createdAt = 'desc'; // Default fallback
        }

        const [clientes, total] = await Promise.all([
            prisma.cliente.findMany({
                where,
                include: {
                    agente: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    usuario_desactivador: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    negociaciones: {
                        select: { updatedAt: true },
                        orderBy: { updatedAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: orderByClause,
                skip,
                take: parseInt(limit)
            }),
            prisma.cliente.count({ where })
        ]);

        res.json({
            clientes,
            paginacion: {
                pagina: parseInt(page),
                limite: parseInt(limit),
                total,
                paginas: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al obtener los clientes'
        });
    }
};

// Obtener un cliente específico
export const obtenerCliente = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(id) },
            include: {
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                documentos: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!cliente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        // Verificar permisos
        if (usuario.rol === 'agente' && cliente.agenteId !== usuario.id) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para ver este cliente'
            });
        }

        res.json({ cliente });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al obtener el cliente'
        });
    }
};

// Actualizar un cliente
export const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        telefono,
        email,
        cedula,
        tipo_cliente,
        observaciones,
        agenteId // Solo permitido para admin
    } = req.body;

    const usuario = req.usuario;
    const errores = [];

    try {
        // Verificar que el cliente existe
        const clienteExistente = await prisma.cliente.findUnique({
            where: { id: parseInt(id) }
        });

        if (!clienteExistente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        // Verificar permisos
        if (usuario.rol === 'agente' && clienteExistente.agenteId !== usuario.id) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para editar este cliente'
            });
        }

        // Validaciones obligatorias
        if (!nombre?.trim()) errores.push('El nombre es obligatorio');
        if (!telefono?.trim()) {
            errores.push('El teléfono es obligatorio');
        } else {
            const soloDigitosTel = telefono.trim().replace(/\s/g, '');
            const telefonoRegexActual = /^(09\d{8}|0[2-7]\d{7})$/;
            if (!telefonoRegexActual.test(soloDigitosTel)) {
                errores.push('El teléfono debe ser un número ecuatoriano válido de 10 dígitos (ej: 0991234567 o 022345678)');
            }
        }
        if (!tipo_cliente) errores.push('El tipo de cliente es obligatorio');

        // VALIDACIÓN DE CONVERSIÓN DE PROSPECTO
        const estaCambiandoDeProspecto =
            clienteExistente.tipo_cliente === 'prospecto' &&
            tipo_cliente !== 'prospecto';

        const esProspecto = tipo_cliente === 'prospecto';

        // Si NO es prospecto O está convirtiéndose desde prospecto, exigir email y cédula
        if (!esProspecto || estaCambiandoDeProspecto) {
            if (!email?.trim()) {
                errores.push('El email es obligatorio para este tipo de cliente');
            }
            if (!cedula?.trim()) {
                errores.push('La cédula/RUC es obligatoria para este tipo de cliente');
            }
        }

        // Validación de email único (Solo si se proporcionó y excluyendo el cliente actual)
        if (email?.trim()) {
            // 1. Verificar si el email pertenece a un agente o admin del sistema
            // (NO bloquear si es un usuario con rol 'cliente' del portal)
            const esAgenteOAdmin = await prisma.usuario.findFirst({
                where: {
                    email: email.trim(),
                    rol: { in: ['agente', 'admin'] }
                }
            });

            if (esAgenteOAdmin) {
                errores.push('Este email pertenece a un agente o administrador del sistema y no puede usarse como cliente.');
            }

            // 2. Unicidad con otros clientes
            const emailDuplicado = await prisma.cliente.findFirst({
                where: {
                    email: email.trim(),
                    id: { not: parseInt(id) }
                }
            });
            if (emailDuplicado) {
                errores.push('El correo electrónico ya está registrado por otro cliente.');
            }
        }

        // Validación de cedula (Formato y unicidad excluyendo el cliente actual)
        if (cedula?.trim()) {
            if (!/^\d+$/.test(cedula.trim())) {
                errores.push('La cédula debe contener solo números');
            } else if (cedula.trim().length !== 10) {
                errores.push('La cédula debe tener exactamente 10 dígitos');
            } else {
                const cedulaDuplicada = await prisma.cliente.findFirst({
                    where: {
                        cedula: cedula.trim(),
                        id: { not: parseInt(id) }
                    }
                });
                if (cedulaDuplicada) {
                    errores.push('La cédula ya está registrada por otro cliente');
                }

                // Cross-check: ¿Pertenece a un Agente o Admin?
                const esAgenteOAdminCed = await prisma.usuario.findFirst({
                    where: {
                        cedula: cedula.trim(),
                        rol: { in: ['agente', 'admin'] }
                    }
                });
                if (esAgenteOAdminCed) {
                    errores.push('Esta cédula pertenece a un agente o administrador del sistema y no puede usarse como cliente.');
                }
            }
        }

        // Validación de formato de email
        if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            errores.push('Formato de correo electrónico inválido');
        }

        if (errores.length > 0) {
            return res.status(400).json({
                mensaje: 'Validación fallida',
                errores
            });
        }

        // PREPARAR DATOS COMUNES
        const datosActualizados = {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            email: email.trim(),
            cedula: cedula?.trim() || null,
            tipo_cliente,
            observaciones: observaciones?.trim() || null,
        };

        // LÓGICA DE REASIGNACIÓN DE AGENTE
        // Permitir cambio de agente si es Admin O si el cliente actual es PROSPECTO
        if (agenteId && (usuario.rol === 'admin' || clienteExistente.tipo_cliente === 'prospecto')) {
            // Verificar que el nuevo agente exista y esté activo
            const agenteNuevo = await prisma.usuario.findFirst({
                where: {
                    id: parseInt(agenteId),
                    rol: { in: ['agente', 'admin'] },
                    activo: true
                }
            });

            if (agenteNuevo) {
                datosActualizados.agenteId = parseInt(agenteId);
            }
        }

        // ACTUALIZACIÓN SIMPLE
        const clienteActualizado = await prisma.cliente.update({
            where: { id: parseInt(id) },
            data: datosActualizados,
            include: {
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
            mensaje: 'Cliente actualizado correctamente',
            cliente: clienteActualizado
        });

    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al actualizar el cliente'
        });
    }
};



// Obtener estadísticas de clientes
export const obtenerEstadisticas = async (req, res) => {
    const usuario = req.usuario;

    try {
        const where = {};

        // Filtrar por agente si no es admin
        if (usuario.rol === 'agente') {
            where.agenteId = usuario.id;
        }

        const [
            totalClientes,
            clientesPorTipo,
            clientesRecientes
        ] = await Promise.all([
            // Total de clientes
            prisma.cliente.count({ where }),

            // Clientes por tipo
            prisma.cliente.groupBy({
                by: ['tipo_cliente'],
                where,
                _count: {
                    tipo_cliente: true
                }
            }),

            // Clientes registrados en los últimos 30 días
            prisma.cliente.count({
                where: {
                    ...where,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        res.json({
            totalClientes,
            clientesPorTipo,
            clientesRecientes
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al obtener estadísticas'
        });
    }
};

// Desactivar un cliente
export const desactivarCliente = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar que el cliente existe
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(id) }
        });

        if (!cliente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        // Verificar permisos
        if (usuario.rol === 'agente' && cliente.agenteId !== usuario.id) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para desactivar este cliente'
            });
        }

        // Verificar si ya está inactivo
        if (!cliente.activo) {
            return res.status(400).json({
                mensaje: 'El cliente ya está inactivo'
            });
        }

        // 🛡️ REGLA DE INTEGRIDAD DE DATOS (Copiada de eliminarCliente)
        // No se puede desactivar un cliente si tiene procesos activos

        // 1. Verificar negociaciones activas (en curso)
        const negociacionesActivas = await prisma.negociacion.findMany({
            where: {
                clienteId: parseInt(id),
                activo: true,
                etapa: {
                    notIn: ['finalizada', 'cancelada']
                }
            },
            include: {
                propiedad: {
                    select: { titulo: true }
                }
            }
        });

        if (negociacionesActivas.length > 0) {
            const detalles = negociacionesActivas
                .map(n => `• ${n.propiedad.titulo} (${n.etapa})`)
                .join('\n');

            return res.status(400).json({
                mensaje: `⛔ No se puede desactivar al cliente.\nTiene ${negociacionesActivas.length} negociación(es) en curso:\n${detalles}\n\nFinalícelas o cancélelas primero.`
            });
        }

        // 2. Verificar propiedades activas (si es propietario)
        try {
            const propiedadesActivas = await prisma.propiedad.findMany({
                where: {
                    propietarioId: parseInt(id),
                    estado_publicacion: {
                        in: ['disponible', 'reservada']
                    }
                },
                select: {
                    titulo: true,
                    estado_publicacion: true
                }
            });

            if (propiedadesActivas.length > 0) {
                const detalles = propiedadesActivas
                    .map(p => `• ${p.titulo} (${p.estado_publicacion})`)
                    .join('\n');

                return res.status(400).json({
                    mensaje: `⛔ No se puede desactivar al cliente.\nEs propietario de ${propiedadesActivas.length} propiedad(es) activa(s):\n${detalles}\n\nDebe cambiarlas a estado inactivo, vendida o retirada.`
                });
            }
        } catch (e) {
            // Ignorar si no existe la relación
        }

        // Desactivar el cliente
        const clienteDesactivado = await prisma.cliente.update({
            where: { id: parseInt(id) },
            data: {
                activo: false,
                fecha_desactivacion: new Date(),
                desactivado_por: usuario.id
            },
            include: {
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                usuario_desactivador: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            mensaje: 'Cliente desactivado correctamente',
            cliente: clienteDesactivado
        });
    } catch (error) {
        console.error('Error al desactivar cliente:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al desactivar el cliente'
        });
    }
};

// Reactivar un cliente
export const reactivarCliente = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        // Verificar que el cliente existe
        const cliente = await prisma.cliente.findUnique({
            where: { id: parseInt(id) }
        });

        if (!cliente) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        // Solo administradores pueden reactivar clientes
        if (usuario.rol !== 'admin') {
            return res.status(403).json({
                mensaje: 'Solo los administradores pueden reactivar clientes'
            });
        }

        // Verificar si ya está activo
        if (cliente.activo) {
            return res.status(400).json({
                mensaje: 'El cliente ya está activo'
            });
        }

        // Reactivar el cliente
        const clienteReactivado = await prisma.cliente.update({
            where: { id: parseInt(id) },
            data: {
                activo: true,
                fecha_desactivacion: null,
                desactivado_por: null
            },
            include: {
                agente: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                usuario_desactivador: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            mensaje: 'Cliente reactivado correctamente',
            cliente: clienteReactivado
        });
    } catch (error) {
        console.error('Error al reactivar cliente:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor al reactivar el cliente'
        });
    }
};

// Registrar contacto desde formulario público (Lead Capture)
export const registrarContactoPublico = async (req, res) => {
    const { nombre, email, mensaje, propiedadId, telefono } = req.body;
    const errores = [];

    // Validaciones
    if (!nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!email?.trim()) errores.push('El email es obligatorio');
    if (!mensaje?.trim()) errores.push('El mensaje es obligatorio');
    if (!propiedadId) errores.push('ID de propiedad no válido');

    // Teléfono obligatorio con formato Ecuador
    if (!telefono?.trim()) {
        errores.push('El teléfono es obligatorio');
    } else {
        const telefonoRegex = /^(09\d{8}|0[2-7]\d{7})$/;
        if (!telefonoRegex.test(telefono.trim())) {
            errores.push('El teléfono debe ser un número ecuatoriano válido (ej: 0991234567 o 022345678)');
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: 'Datos incompletos', errores });
    }

    try {
        // 1. Obtener la Propiedad y su Agente Responsable
        const propiedad = await prisma.propiedad.findUnique({
            where: { id: parseInt(propiedadId) },
            select: { id: true, agenteId: true, titulo: true, codigo_interno: true, transaccion: true }
        });

        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        // 2. Determinar agente responsable con fallback al primer admin activo
        let agenteResponsableId = propiedad.agenteId;
        if (!agenteResponsableId) {
            const adminFallback = await prisma.usuario.findFirst({
                where: { rol: 'admin', activo: true },
                select: { id: true }
            });
            agenteResponsableId = adminFallback?.id ?? null;
        }

        // 3. Tipo de cliente: siempre 'prospecto' al captar un lead web
        //    El agente lo calificará manualmente (comprador / arrendatario / etc.)
        const tipoCliente = 'prospecto';

        // 4. Buscar si el Cliente ya existe
        let cliente = await prisma.cliente.findFirst({
            where: { email: email.trim() }
        });

        if (cliente) {
            // El cliente YA EXISTE

            // 4.1 Enriquecimiento de Datos: Actualizar teléfono si falta
            if (telefono && telefono.trim() && (!cliente.telefono || cliente.telefono === 'Sin teléfono')) {
                try {
                    console.log(`Enriqueciendo datos del cliente ${cliente.email}: Actualizando teléfono.`);
                    cliente = await prisma.cliente.update({
                        where: { id: cliente.id },
                        data: { telefono: telefono.trim() }
                    });
                } catch (err) {
                    console.error('Error al actualizar teléfono del cliente:', err);
                }
            }

            // Sincronizar telefono con la cuenta de Usuario si existe
            try {
                const usuarioVinculado = await prisma.usuario.findUnique({ where: { email: email.trim() } });
                if (usuarioVinculado && (!usuarioVinculado.telefono || usuarioVinculado.telefono === 'Sin teléfono')) {
                    await prisma.usuario.update({
                        where: { id: usuarioVinculado.id },
                        data: { telefono: telefono.trim() }
                    });
                }
            } catch (err) {
                console.error('Error sincronizando teléfono con cuenta de usuario:', err);
            }

            // 4.2 Reactivación Automática: Si el cliente estaba inactivo, se reactiva
            if (!cliente.activo) {
                try {
                    console.log(`Reactivando cliente ${cliente.email} por nueva interacción.`);
                    cliente = await prisma.cliente.update({
                        where: { id: cliente.id },
                        data: {
                            activo: true,
                            fecha_desactivacion: null,
                            desactivado_por: null
                        }
                    });
                } catch (err) {
                    console.error('Error al reactivar cliente:', err);
                }
            }

            // 4.3 Asignación de Agente Definitivo (si el cliente era huérfano de portal)
            if (!cliente.agenteId) {
                try {
                    console.log(`Asignando cliente huerfano ${cliente.email} al agente captador ${agenteResponsableId}.`);
                    cliente = await prisma.cliente.update({
                        where: { id: cliente.id },
                        data: { agenteId: agenteResponsableId }
                    });
                } catch (err) {
                    console.error('Error al asignar agente al cliente huérfano:', err);
                }
            }

            // Se respeta su agente asignado (Exclusividad)
            if (cliente.agenteId) {
                agenteResponsableId = cliente.agenteId;
            }
        } else {
            // Cliente NUEVO -> Se asigna al agente de la propiedad (Captación)
            cliente = await prisma.cliente.create({
                data: {
                    nombre: nombre.trim(),
                    email: email.trim(),
                    telefono: telefono.trim(),
                    tipo_cliente: tipoCliente,
                    agenteId: agenteResponsableId,
                    observaciones: `Cliente captado vía formulario web — Propiedad: ${propiedad.titulo}`
                }
            });
        }

        // Se respeta su agente asignado (Exclusividad)
        if (cliente.agenteId) {
            agenteResponsableId = cliente.agenteId;
        }

        // 3. Verificar si ya existe una Negociación ACTIVA
        const negociacionExistente = await prisma.negociacion.findUnique({
            where: {
                clienteId_propiedadId: {
                    clienteId: cliente.id,
                    propiedadId: propiedad.id
                }
            }
        });

        if (negociacionExistente && negociacionExistente.activo) {
            // YA EXISTE -> Agregar SEGUIMIENTO
            await prisma.seguimiento.create({
                data: {
                    negociacionId: negociacionExistente.id,
                    agenteId: agenteResponsableId,
                    fecha: new Date(),
                    tipo: 'mensaje',
                    comentario: `Nuevo mensaje web: "${mensaje}"`
                }
            });

            return res.status(200).json({
                mensaje: 'Mensaje añadido a negociación existente',
                negociacionId: negociacionExistente.id
            });

        } else {
            // NO EXISTE o estaba inactiva -> Crear/Reactivar NEGOCIACIÓN
            let nuevaNegociacion;

            if (negociacionExistente) {
                // Reactivar
                nuevaNegociacion = await prisma.negociacion.update({
                    where: { id: negociacionExistente.id },
                    data: {
                        activo: true,
                        etapa: 'interes',
                        agenteId: agenteResponsableId,
                        updatedAt: new Date()
                    }
                });

                await prisma.seguimiento.create({
                    data: {
                        negociacionId: nuevaNegociacion.id,
                        agenteId: agenteResponsableId,
                        fecha: new Date(),
                        tipo: 'mensaje',
                        comentario: `Cliente reactiva interés vía web: "${mensaje}"`
                    }
                });

            } else {
                // Crear desde cero
                nuevaNegociacion = await prisma.negociacion.create({
                    data: {
                        clienteId: cliente.id,
                        propiedadId: propiedad.id,
                        agenteId: agenteResponsableId,
                        etapa: 'interes',
                        fecha_inicio: new Date()
                    }
                });

                await prisma.seguimiento.create({
                    data: {
                        negociacionId: nuevaNegociacion.id,
                        agenteId: agenteResponsableId,
                        fecha: new Date(),
                        tipo: 'mensaje',
                        comentario: `Primer contacto web: "${mensaje}"`
                    }
                });
            }

            return res.status(201).json({
                mensaje: 'Solicitud recibida correctamente',
                negociacionId: nuevaNegociacion.id
            });
        }

    } catch (error) {
        console.error('Error procesando lead público:', error);
        res.status(500).json({ mensaje: 'Error al procesar su solicitud' });
    }
};

// Verificar disponibilidad de email (usado para validacion onBlur en formularios)
export const verificarEmail = async (req, res) => {
    const { email, clienteId } = req.query;
    if (!email?.trim()) {
        return res.status(400).json({ disponible: false, mensaje: 'Email requerido' });
    }
    try {
        const esAgenteOAdmin = await prisma.usuario.findFirst({
            where: { email: email.trim(), rol: { in: ['agente', 'admin'] } }
        });
        if (esAgenteOAdmin) {
            return res.json({ disponible: false, mensaje: 'Este email pertenece a un agente o administrador del sistema.' });
        }
        const whereCliente = { email: email.trim() };
        if (clienteId) whereCliente.id = { not: parseInt(clienteId) };
        const existente = await prisma.cliente.findFirst({ where: whereCliente });
        if (existente) {
            return res.json({ disponible: false, mensaje: 'Este correo ya pertenece a un cliente registrado.' });
        }
        return res.json({ disponible: true });
    } catch (error) {
        console.error('Error verificando email:', error);
        res.status(500).json({ disponible: true });
    }
};

// Verificar disponibilidad de cedula (usado para validacion onBlur en formularios)
export const verificarCedula = async (req, res) => {
    const { cedula, clienteId } = req.query;
    if (!cedula?.trim()) {
        return res.status(400).json({ disponible: false, mensaje: 'Cedula requerida' });
    }
    try {
        const esAgenteOAdmin = await prisma.usuario.findFirst({
            where: { cedula: cedula.trim(), rol: { in: ['agente', 'admin'] } }
        });
        if (esAgenteOAdmin) {
            return res.json({ disponible: false, mensaje: 'Esta cedula pertenece a un agente o administrador del sistema.' });
        }
        const whereCliente = { cedula: cedula.trim() };
        if (clienteId) whereCliente.id = { not: parseInt(clienteId) };
        const existente = await prisma.cliente.findFirst({ where: whereCliente });
        if (existente) {
            return res.json({ disponible: false, mensaje: 'Esta cedula ya esta registrada en otro cliente.' });
        }
        return res.json({ disponible: true });
    } catch (error) {
        console.error('Error verificando cedula:', error);
        res.status(500).json({ disponible: true });
    }
};
