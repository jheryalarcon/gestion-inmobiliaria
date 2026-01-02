import prisma from '../prisma/client.js';
export const obtenerAgentes = async (req, res) => {
    try {
        const agentes = await prisma.usuario.findMany({
            where: {
                activo: true,
                OR: [
                    { rol: 'agente' },
                    { rol: 'admin' }
                ]
            },
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                rol: true
            },
        });

        // ✅ Si no hay agentes, igual devolvemos lista vacía
        res.json(agentes); // incluso si es []
    } catch (error) {
        console.error('Error en obtenerAgentes:', error);
        res.status(500).json({ mensaje: 'Error al obtener agentes' });
    }
};
