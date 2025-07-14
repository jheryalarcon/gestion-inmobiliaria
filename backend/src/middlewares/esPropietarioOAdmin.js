import prisma from '../prisma/client.js';

export default async function esPropietarioOAdmin(req, res, next) {
    const { id } = req.params;
    const usuario = req.usuario;

    try {
        const propiedad = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) },
            select: { agenteId: true },
        });

        if (!propiedad) {
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        if (usuario.rol === 'admin' || propiedad.agenteId === usuario.id) {
            return next(); // Tiene permiso
        }

        return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta propiedad' });

    } catch (error) {
        console.error('Error en esPropietarioOAdmin:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
