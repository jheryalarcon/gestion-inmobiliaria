import prisma from '../prisma/client.js';

export default async function esPropietarioOAdmin(req, res, next) {
    const { id } = req.params;
    const usuario = req.usuario;

    console.log('Verificando permisos para propiedad:', { id, usuario: { id: usuario.id, rol: usuario.rol } });

    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
        console.log('ID inválido:', id);
        return res.status(400).json({ mensaje: 'ID de propiedad inválido' });
    }

    try {
        const propiedad = await prisma.propiedad.findUnique({
            where: { id: parseInt(id) },
            select: { agenteId: true },
        });

        if (!propiedad) {
            console.log('Propiedad no encontrada:', id);
            return res.status(404).json({ mensaje: 'Propiedad no encontrada' });
        }

        console.log('Propiedad encontrada:', { propiedadId: id, agenteId: propiedad.agenteId });

        if (usuario.rol === 'admin' || propiedad.agenteId === usuario.id) {
            console.log('Permiso concedido');
            return next(); // Tiene permiso
        }

        console.log('Permiso denegado');
        return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta propiedad' });

    } catch (error) {
        console.error('Error en esPropietarioOAdmin:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}
