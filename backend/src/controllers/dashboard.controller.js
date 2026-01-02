import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerEstadisticas = async (req, res) => {
    try {
        // Ejecutar consultas en paralelo para mayor eficiencia
        const [
            totalPropiedades,
            propiedadesDisponibles,
            totalAgentes,
            totalClientes
        ] = await Promise.all([
            prisma.propiedad.count(),
            prisma.propiedad.count({ where: { estado_publicacion: 'disponible' } }),
            prisma.usuario.count({ where: { rol: 'agente' } }),
            prisma.cliente.count()
        ]);

        res.json({
            estadisticas: {
                totalPropiedades,
                propiedadesDisponibles,
                totalAgentes,
                totalClientes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({
            error: 'Error interno del servidor al obtener las estadísticas'
        });
    }
};
