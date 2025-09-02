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
    if (!telefono?.trim()) errores.push('El teléfono es obligatorio');
    if (!email?.trim()) errores.push('El correo electrónico es obligatorio');
    if (!tipo_cliente) errores.push('El tipo de cliente es obligatorio');

    // Validación de email único
    if (email) {
        const clienteExistente = await prisma.cliente.findUnique({
            where: { email: email.trim() }
        });
        if (clienteExistente) {
            errores.push('El correo electrónico ya está registrado');
        }
    }

    // Validación de formato de email
    if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        errores.push('Formato de correo electrónico inválido');
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
                rol: 'agente',
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
    const { page = 1, limit = 10, search = '', tipo_cliente = '', estado = 'activo' } = req.query;

    try {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Construir filtros
        const where = {};
        
        // Filtro por rol
        if (usuario.rol === 'agente') {
            where.agenteId = usuario.id;
        }
        
        // Filtro por estado (activo/inactivo)
        if (estado === 'activo') {
            where.activo = true;
        } else if (estado === 'inactivo') {
            where.activo = false;
        }
        // Si estado es 'todos', no se aplica filtro
        
        // Filtro de búsqueda
        if (search) {
            where.OR = [
                { nombre: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { telefono: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        // Filtro por tipo de cliente
        if (tipo_cliente) {
            where.tipo_cliente = tipo_cliente;
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
                    }
                },
                orderBy: { createdAt: 'desc' },
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
        tipo_cliente,
        observaciones,
        agenteId
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
        if (!telefono?.trim()) errores.push('El teléfono es obligatorio');
        if (!email?.trim()) errores.push('El correo electrónico es obligatorio');
        if (!tipo_cliente) errores.push('El tipo de cliente es obligatorio');

        // Validación de email único (excluyendo el cliente actual)
        if (email) {
            const emailDuplicado = await prisma.cliente.findFirst({
                where: { 
                    email: email.trim(),
                    id: { not: parseInt(id) }
                }
            });
            if (emailDuplicado) {
                errores.push('El correo electrónico ya está registrado por otro cliente');
            }
        }

        // Validación de formato de email
        if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            errores.push('Formato de correo electrónico inválido');
        }

        // En edición no se valida el agenteId ya que no se puede cambiar
        // La relación con el agente se mantiene fija

        if (errores.length > 0) {
            return res.status(400).json({ 
                mensaje: 'Validación fallida', 
                errores 
            });
        }

        const datosActualizados = {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
            email: email.trim(),
            tipo_cliente,
            observaciones: observaciones?.trim() || null,
        };

        // No se permite cambiar el agente asignado (relación fija)
        // El agenteId se mantiene como está en la base de datos

        const cliente = await prisma.cliente.update({
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
            cliente
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ 
            mensaje: 'Error interno del servidor al actualizar el cliente' 
        });
    }
};

// Eliminar un cliente (soft delete)
export const eliminarCliente = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
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
                mensaje: 'No tienes permisos para eliminar este cliente' 
            });
        }

        await prisma.cliente.delete({
            where: { id: parseInt(id) }
        });

        res.json({ 
            mensaje: 'Cliente eliminado correctamente' 
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ 
            mensaje: 'Error interno del servidor al eliminar el cliente' 
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
