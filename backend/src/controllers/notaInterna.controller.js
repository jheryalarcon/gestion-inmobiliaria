import { PrismaClient } from '@prisma/client';
import { cifrar, descifrar, estaCifrado } from '../utils/cifrado.js';
const prisma = new PrismaClient();

// ✅ OBTENER NOTAS INTERNAS DEL AGENTE RESPONSABLE (Vendedor o Captador)
const obtenerNotasInternas = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const agenteId = req.usuario.id;

        // ✅ REGLA: Verificar que la negociación existe y está activa
        const negociacion = await prisma.negociacion.findFirst({
            where: {
                id: parseInt(negociacionId),
                activo: true
            },
            include: {
                propiedad: true
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // ✅ REGLA DE PERMISOS AMPLIADA:
        // Permitir acceso si soy el Vendedor (Dueño Negociación) O el Captador (Dueño Propiedad)
        const esVendedor = negociacion.agenteId === agenteId;
        const esCaptador = negociacion.propiedad.agenteId === agenteId;

        if (!esVendedor && !esCaptador) {
            return res.status(403).json({
                mensaje: '❌ No tienes permisos para acceder a las notas internas de esta negociación'
            });
        }

        // Obtener notas internas PROPIAS del agente, ordenadas por fecha
        const notasInternas = await prisma.notaInterna.findMany({
            where: {
                negociacionId: parseInt(negociacionId),
                agenteId: agenteId // 🔒 Clave: Solo mis notas
            },
            orderBy: { fecha: 'desc' }
        });

        // 🔓 Descifrar el contenido de cada nota
        const notasDescifradas = notasInternas.map(nota => {
            try {
                return {
                    ...nota,
                    contenido: descifrar(nota.contenido)
                };
            } catch {
                // Nota en texto plano (pre-migración) → devolver tal cual
                return {
                    ...nota,
                    contenido: nota.contenido,
                    migracion_pendiente: !estaCifrado(nota.contenido)
                };
            }
        });

        res.json({
            mensaje: '✅ Notas internas obtenidas correctamente',
            notasInternas: notasDescifradas,
            total: notasDescifradas.length
        });

    } catch (error) {
        console.error('Error al obtener notas internas:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

//  CREAR NUEVA NOTA INTERNA
const crearNotaInterna = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const { contenido } = req.body;
        const agenteId = req.usuario.id;

        //  REGLA: Validar campos requeridos
        if (!contenido || contenido.trim().length === 0) {
            return res.status(400).json({
                mensaje: '❌ El contenido de la nota es obligatorio'
            });
        }

        if (contenido.trim().length > 2000) {
            return res.status(400).json({
                mensaje: '❌ El contenido de la nota no puede exceder 2000 caracteres'
            });
        }

        //  REGLA: Verificar que la negociación existe y está activa
        const negociacion = await prisma.negociacion.findFirst({
            where: {
                id: parseInt(negociacionId),
                activo: true
            },
            include: {
                propiedad: true
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // ✅ REGLA DE PERMISOS AMPLIADA:
        const esVendedor = negociacion.agenteId === agenteId;
        const esCaptador = negociacion.propiedad.agenteId === agenteId;

        if (!esVendedor && !esCaptador) {
            return res.status(403).json({
                mensaje: '❌ No tienes permisos para crear notas internas en esta negociación'
            });
        }

        // ✅ REGLA: Verificar que el usuario sea agente (o admin actuando como agente)
        // Nota: Los admins no deberían crear notas personales aquí por diseño, pero si tienen rol, ok.

        // 🔐 Cifrar el contenido antes de guardar en la BD
        const contenidoCifrado = cifrar(contenido.trim());

        // Crear la nota interna
        const notaInterna = await prisma.notaInterna.create({
            data: {
                negociacionId: parseInt(negociacionId),
                agenteId,
                contenido: contenidoCifrado,
                fecha: new Date()
            }
        });

        // 🔓 Devolver al cliente con el contenido descifrado (no el cifrado)
        res.status(201).json({
            mensaje: '✅ Nota interna creada correctamente',
            notaInterna: {
                ...notaInterna,
                contenido: contenido.trim() // texto original, ya validado y limpio
            }
        });

    } catch (error) {
        console.error('Error al crear nota interna:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

// ✅ OBTENER ESTADÍSTICAS DE NOTAS INTERNAS
const obtenerEstadisticasNotas = async (req, res) => {
    try {
        const { negociacionId } = req.params;
        const agenteId = req.usuario.id;

        // ✅ REGLA: Verificar que la negociación existe
        const negociacion = await prisma.negociacion.findFirst({
            where: {
                id: parseInt(negociacionId),
                activo: true
            },
            include: {
                propiedad: true
            }
        });

        if (!negociacion) {
            return res.status(404).json({ mensaje: '❌ Negociación no encontrada' });
        }

        // ✅ REGLA DE PERMISOS AMPLIADA:
        const esVendedor = negociacion.agenteId === agenteId;
        const esCaptador = negociacion.propiedad.agenteId === agenteId;

        if (!esVendedor && !esCaptador) {
            return res.status(403).json({
                mensaje: '❌ No tienes permisos para acceder a las estadísticas de notas internas'
            });
        }

        // Obtener estadísticas
        const [totalNotas, notasPorMes] = await Promise.all([
            // Total de notas
            prisma.notaInterna.count({
                where: {
                    negociacionId: parseInt(negociacionId),
                    agenteId: agenteId
                }
            }),
            // Notas por mes (últimos 6 meses)
            prisma.notaInterna.groupBy({
                by: ['fecha'],
                where: {
                    negociacionId: parseInt(negociacionId),
                    agenteId: agenteId,
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
                totalNotas,
                notasPorMes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ mensaje: '❌ Error interno del servidor' });
    }
};

export default {
    obtenerNotasInternas,
    crearNotaInterna,
    obtenerEstadisticasNotas
};
