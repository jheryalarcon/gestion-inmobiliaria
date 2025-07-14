export default function esAdmin(req, res, next) {
    if (req.usuario?.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    next();
}