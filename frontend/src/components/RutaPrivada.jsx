import { Navigate } from 'react-router-dom';
import { verificarToken } from '../utils/tokenUtils';

export default function RutaPrivada({ rolRequerido, children }) {
    const resultado = verificarToken();

    if (!resultado.valido) {
        return <Navigate to="/login" replace/>;
    }

    const usuario = resultado.usuario;
    const rutasPorRol = {
        admin: '/admin',
        agente: '/agente',
        cliente: '/'
    };

    // Verificar si el usuario tiene el rol requerido
    if (Array.isArray(rolRequerido)) {
        if (!rolRequerido.includes(usuario.rol)) {
            return <Navigate to={rutasPorRol[usuario.rol] || '/'} replace/>;
        }
    } else {
        if (usuario.rol !== rolRequerido) {
            return <Navigate to={rutasPorRol[usuario.rol] || '/'} replace/>;
        }
    }

    return children;
}
