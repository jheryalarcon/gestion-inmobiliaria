import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Crear nuevo agente inmobiliario
export const crearAgente = async (req, res) => {
    try {
        const { name, email, telefono, password } = req.body;
        const adminId = req.usuario.id;

        // Verificar que solo administradores puedan crear agentes
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'Solo los administradores pueden crear agentes'
            });
        }

        // Validaciones
        if (!name || !email || !telefono || !password) {
            return res.status(400).json({
                error: 'El nombre, email, teléfono y contraseña son obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de email inválido'
            });
        }

        // Validar formato de teléfono (solo números, mínimo 7 dígitos)
        const telefonoRegex = /^[0-9]{7,15}$/;
        if (!telefonoRegex.test(telefono)) {
            return res.status(400).json({
                error: 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos'
            });
        }

        // Validar contraseña (mínimo 6 caracteres)
        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar que el email no esté duplicado
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                error: 'Ya existe un usuario con este email'
            });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear el agente
        const nuevoAgente = await prisma.usuario.create({
            data: {
                name,
                email,
                telefono,
                password: hashedPassword,
                rol: 'agente',
                activo: true
            }
        });

        // Retornar respuesta exitosa (sin contraseña)
        res.status(201).json({
            mensaje: '✅ Agente creado exitosamente',
            agente: {
                id: nuevoAgente.id,
                name: nuevoAgente.name,
                email: nuevoAgente.email,
                telefono: nuevoAgente.telefono,
                rol: nuevoAgente.rol,
                activo: nuevoAgente.activo,
                createdAt: nuevoAgente.createdAt
            }
        });

    } catch (error) {
        console.error('Error al crear agente:', error);
        res.status(500).json({
            error: 'Error interno del servidor al crear el agente'
        });
    }
};

// Obtener lista de agentes
export const obtenerAgentes = async (req, res) => {
    try {
        // Verificar que solo administradores puedan ver la lista
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'Solo los administradores pueden ver la lista de agentes'
            });
        }

        const { page = 1, limit = 10, search = '', estado = 'activo' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros de búsqueda
        const whereClause = {
            rol: 'agente'
        };

        // Agregar filtro de estado
        if (estado === 'activo') {
            whereClause.activo = true;
        } else if (estado === 'inactivo') {
            whereClause.activo = false;
        }
        // Si estado es 'todos', no se agrega filtro de activo

        // Agregar filtro de búsqueda si hay texto
        if (search && search.trim() !== '') {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { telefono: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Obtener agentes con paginación
        const [agentes, total] = await Promise.all([
            prisma.usuario.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    telefono: true,
                    rol: true,
                    activo: true,
                    createdAt: true,
                    _count: {
                        select: {
                            propiedades: true,
                            clientes: true,
                            negociaciones: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: parseInt(limit)
            }),
            prisma.usuario.count({ where: whereClause })
        ]);

        // Calcular paginación
        const totalPaginas = Math.ceil(total / parseInt(limit));

        res.json({
            agentes,
            paginacion: {
                pagina: parseInt(page),
                limite: parseInt(limit),
                total,
                totalPaginas
            }
        });

    } catch (error) {
        console.error('Error al obtener agentes:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener los agentes'
        });
    }
};

// Obtener agente por ID
export const obtenerAgentePorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que solo administradores puedan ver detalles
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'Solo los administradores pueden ver detalles de agentes'
            });
        }

        const agente = await prisma.usuario.findFirst({
            where: {
                id: parseInt(id),
                rol: 'agente'
            },
            select: {
                id: true,
                name: true,
                email: true,
                telefono: true,
                rol: true,
                activo: true,
                createdAt: true,
                propiedades: {
                    where: { estado_publicacion: { not: 'inactiva' } },
                    select: {
                        id: true,
                        titulo: true,
                        estado_publicacion: true,
                        createdAt: true
                    }
                },
                clientes: {
                    where: { activo: true },
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                        createdAt: true
                    }
                },
                negociaciones: {
                    where: { activo: true },
                    select: {
                        id: true,
                        etapa: true,
                        fecha_inicio: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!agente) {
            return res.status(404).json({
                error: 'Agente no encontrado'
            });
        }

        res.json({ agente });

    } catch (error) {
        console.error('Error al obtener agente:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener el agente'
        });
    }
};

// Actualizar estado del agente (activar/desactivar)
export const actualizarEstadoAgente = async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;

        // Verificar que solo administradores puedan cambiar estado
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'Solo los administradores pueden cambiar el estado de agentes'
            });
        }

        // Verificar que el agente existe
        const agente = await prisma.usuario.findFirst({
            where: {
                id: parseInt(id),
                rol: 'agente'
            }
        });

        if (!agente) {
            return res.status(404).json({
                error: 'Agente no encontrado'
            });
        }

        // No permitir desactivar al administrador actual
        if (parseInt(id) === req.usuario.id) {
            return res.status(400).json({
                error: 'No puedes desactivar tu propia cuenta'
            });
        }

        // Actualizar estado
        const agenteActualizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { activo },
            select: {
                id: true,
                name: true,
                email: true,
                activo: true,
                updatedAt: true
            }
        });

        res.json({
            mensaje: `Agente ${activo ? 'activado' : 'desactivado'} correctamente`,
            agente: agenteActualizado
        });

    } catch (error) {
        console.error('Error al actualizar estado del agente:', error);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar el estado del agente'
        });
    }
};

// Actualizar agente
export const actualizarAgente = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, telefono, activo } = req.body;

        // Verificar que solo administradores puedan actualizar agentes
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'Solo los administradores pueden actualizar agentes'
            });
        }

        // Validaciones
        if (!name || !email || !telefono) {
            return res.status(400).json({
                error: 'El nombre, email y teléfono son obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Formato de email inválido'
            });
        }

        // Validar formato de teléfono (solo números, mínimo 7 dígitos)
        const telefonoRegex = /^[0-9]{7,15}$/;
        if (!telefonoRegex.test(telefono)) {
            return res.status(400).json({
                error: 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos'
            });
        }

        // Verificar que el agente existe
        const agenteExistente = await prisma.usuario.findFirst({
            where: {
                id: parseInt(id),
                rol: 'agente'
            }
        });

        if (!agenteExistente) {
            return res.status(404).json({
                error: 'Agente no encontrado'
            });
        }

        // Verificar que el email no esté duplicado (excluyendo el agente actual)
        const emailDuplicado = await prisma.usuario.findFirst({
            where: {
                email: email,
                id: { not: parseInt(id) }
            }
        });

        if (emailDuplicado) {
            return res.status(400).json({
                error: 'Ya existe un usuario con este email'
            });
        }

        // Actualizar el agente
        const agenteActualizado = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                telefono,
                activo: activo !== undefined ? activo : agenteExistente.activo
            },
            select: {
                id: true,
                name: true,
                email: true,
                telefono: true,
                rol: true,
                activo: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({
            mensaje: '✅ Agente actualizado exitosamente',
            agente: agenteActualizado
        });

    } catch (error) {
        console.error('Error al actualizar agente:', error);
        res.status(500).json({
            error: 'Error interno del servidor al actualizar el agente'
        });
    }
};

// Obtener estadísticas de agentes
export const obtenerEstadisticasAgentes = async (req, res) => {
    try {
        // Verificar que solo administradores puedan ver estadísticas
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'Solo los administradores pueden ver estadísticas de agentes'
            });
        }

        const estadisticas = await prisma.usuario.groupBy({
            by: ['activo'],
            where: { rol: 'agente' },
            _count: true
        });

        const totalAgentes = await prisma.usuario.count({
            where: { rol: 'agente' }
        });

        const agentesActivos = await prisma.usuario.count({
            where: { 
                rol: 'agente',
                activo: true
            }
        });

        const agentesInactivos = totalAgentes - agentesActivos;

        res.json({
            estadisticas: {
                total: totalAgentes,
                activos: agentesActivos,
                inactivos: agentesInactivos
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener estadísticas'
        });
    }
};
