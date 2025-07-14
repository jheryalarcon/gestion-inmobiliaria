import { useNavigate } from 'react-router-dom';

function BotonLogout() {
    const navigate = useNavigate();

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/');
    };

    return (
        <button
            onClick={cerrarSesion}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
            Cerrar sesión
        </button>
    );
}

export default BotonLogout;
