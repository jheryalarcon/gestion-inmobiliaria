import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

export default async function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar que el usuario existe y está activo
        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: { id: true, rol: true, activo: true, name: true, email: true }
        });

        if (!usuario) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                mensaje: 'Tu cuenta está inactiva, contacta al administrador'
            });
        }

        req.usuario = {
            id: usuario.id,
            rol: usuario.rol,
            name: usuario.name,
            email: usuario.email
        };
        next();
    } catch (err) {
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
}
