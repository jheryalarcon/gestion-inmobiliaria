// Middleware para verificar que el usuario sea agente o administrador
const esAgenteOAdmin = (req, res, next) => {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.usuario) {
            return res.status(401).json({ 
                mensaje: 'No autorizado - Usuario no autenticado'
            });
        }

        // Verificar que el rol sea agente o admin
        if (req.usuario.rol !== 'agente' && req.usuario.rol !== 'admin') {
            return res.status(403).json({ 
                mensaje: 'Acceso denegado - Solo agentes y administradores pueden realizar esta acción'
            });
        }

        // Usuario autorizado, continuar
        next();
    } catch (error) {
        console.error('Error en middleware esAgenteOAdmin:', error);
        return res.status(500).json({ 
            mensaje: 'Error interno del servidor'
        });
    }
};

export default esAgenteOAdmin;
