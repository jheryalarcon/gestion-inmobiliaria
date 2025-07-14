/*
import { Navigate } from 'react-router-dom';

function RutaPrivada({ children, rolRequerido }) {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/" />;
    }

    // Si hay un rol requerido y no coincide, redirige al inicio general
    if (rolRequerido && usuario.rol !== rolRequerido) {
        return <Navigate to="/inicio" />;
    }

    return children;
}

export default RutaPrivada;
*/


import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function RutaPrivada({ rolRequerido, children }) {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" />;

    try {
        const usuario = jwtDecode(token);
        if (Array.isArray(rolRequerido)) {
            if (!rolRequerido.includes(usuario.rol)) return <Navigate to="/" />;
        } else {
            if (usuario.rol !== rolRequerido) return <Navigate to="/" />;
        }
        return children;
    } catch (e) {
        return <Navigate to="/login" />;
    }
}
