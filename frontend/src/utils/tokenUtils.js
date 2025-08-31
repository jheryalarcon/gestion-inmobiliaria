import { jwtDecode } from 'jwt-decode';

export const verificarToken = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return { valido: false, mensaje: 'No hay token' };
    }
    
    try {
        const decoded = jwtDecode(token);
        const ahora = Date.now() / 1000;
        
        if (decoded.exp < ahora) {
            localStorage.removeItem('token');
            return { valido: false, mensaje: 'Token expirado' };
        }
        
        return { valido: true, usuario: decoded };
    } catch (error) {
        localStorage.removeItem('token');
        return { valido: false, mensaje: 'Token inválido' };
    }
};

export const obtenerUsuario = () => {
    const resultado = verificarToken();
    return resultado.valido ? resultado.usuario : null;
};
