import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function RutaPrivada({ rolRequerido, children }) {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/" replace/>;

    const rutasPorRol = {
        admin: '/admin',
        agente: '/agente',
        cliente: '/cliente'
    };

    try {
        const usuario = jwtDecode(token);
        if (Array.isArray(rolRequerido)) {
            if (!rolRequerido.includes(usuario.rol)) return <Navigate to={rutasPorRol[usuario.rol] || '/'} />;
        } else {
            if (usuario.rol !== rolRequerido) return <Navigate to={rutasPorRol[usuario.rol] || '/'} />;
        }
        return children;
    } catch (e) {
        return <Navigate to="/" />;
    }
}
