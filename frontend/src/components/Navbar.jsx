import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsuario(decoded);
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        setUsuario(null);
        navigate('/');
    };

    // Nueva función para redirigir según el rol
    const irAInicioRol = () => {
        if (!usuario) return navigate('/');
        if (usuario.rol === 'admin') return navigate('/admin');
        if (usuario.rol === 'agente') return navigate('/agente');
        if (usuario.rol === 'cliente') return navigate('/cliente');
        return navigate('/');
    };

    return (
        <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
            {/* Cambia el Link por un span/button con onClick */}
            <span
                className="text-lg font-bold cursor-pointer"
                onClick={irAInicioRol}
            >
                InmobiliariaApp
            </span>
            <div className="flex gap-4 items-center">
                {usuario && usuario.rol === 'admin' && (
                    <>
                        <Link to="/admin" className="hover:underline">Panel admin</Link>
                        <Link to="/admin/registrar-propiedad" className="hover:underline">Registrar propiedad</Link>
                        <Link to="/admin/panel-propiedades" className="hover:underline">Ver propiedades</Link>
                        <Link to="/admin/registrar-cliente" className="hover:underline">Registrar cliente</Link>
                        <Link to="/admin/panel-clientes" className="hover:underline">Ver clientes</Link>
                        <Link to="/admin/panel-negociaciones" className="hover:underline">Negociaciones</Link>
                    </>
                )}

                {usuario && usuario.rol === 'agente' && (
                    <>
                        <Link to="/agente" className="hover:underline">Panel agente</Link>
                        <Link to="/agente/registrar-propiedad" className="hover:underline">Registrar propiedad</Link>
                        <Link to="/agente/panel-propiedades" className="hover:underline">Mis propiedades</Link>
                        <Link to="/agente/registrar-cliente" className="hover:underline">Registrar cliente</Link>
                        <Link to="/agente/panel-clientes" className="hover:underline">Mis clientes</Link>
                        <Link to="/agente/panel-negociaciones" className="hover:underline">Mis negociaciones</Link>
                    </>
                )}

                {usuario && usuario.rol === 'cliente' && (
                    <>
                        <Link to="/cliente" className="hover:underline">Inicio cliente</Link>
                    </>
                )}

                {!usuario && (
                    <>
                        <Link to="/login" className="hover:underline">Iniciar sesión</Link>
                        <Link to="/registro" className="hover:underline">Registrarse</Link>
                    </>
                )}

                {usuario && (
                    <>
                        <button
                            onClick={cerrarSesion}
                            className="ml-3 bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 text-sm"
                        >
                            Cerrar sesión
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
