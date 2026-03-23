import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapa de pesos por tipo de interacción
const PESOS = {
    VISTA: 1,
    FAVORITO: 5,
    CONTACTO: 10,
};

/**
 * POST /api/interacciones
 * Registra una interacción del usuario con una propiedad.
 * Si la misma interacción ya existía (misma user + propiedad + tipo), actualiza la fecha.
 */
export const registrarInteraccion = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { propiedadId, tipo } = req.body;

        // Validaciones básicas
        if (!propiedadId || !tipo) {
            return res.status(400).json({ mensaje: 'propiedadId y tipo son requeridos' });
        }

        const tiposValidos = ['VISTA', 'FAVORITO', 'CONTACTO'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                mensaje: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}`
            });
        }

        const valor_peso = PESOS[tipo];

        // Upsert: si ya existe la interacción exacta, solo actualiza la fecha
        const interaccion = await prisma.interaccionUsuario.upsert({
            where: {
                usuarioId_propiedadId_tipo: {
                    usuarioId,
                    propiedadId: parseInt(propiedadId),
                    tipo,
                }
            },
            update: {
                fecha: new Date(),
                valor_peso,
            },
            create: {
                usuarioId,
                propiedadId: parseInt(propiedadId),
                tipo,
                valor_peso,
            }
        });

        return res.status(201).json({ ok: true, interaccion });
    } catch (error) {
        console.error('Error al registrar interacción:', error);
        return res.status(500).json({ mensaje: 'Error interno al registrar la interacción' });
    }
};
