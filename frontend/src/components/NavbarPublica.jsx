import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function NavbarPublica() {
    const [usuario, setUsuario] = useState(null);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioData = token ? JSON.parse(localStorage.getItem('usuario')) : null;
        setUsuario(usuarioData);
    }, []);

    // Escuchar cambios en localStorage y eventos personalizados para actualizar el navbar
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            const usuarioData = token ? JSON.parse(localStorage.getItem('usuario')) : null;
            setUsuario(usuarioData);
        };

        const handleAuthChange = () => {
            handleStorageChange();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const cerrarDropdown = (e) => {
            if (dropdownAbierto && !e.target.closest('.dropdown-container')) {
                setDropdownAbierto(false);
            }
        };

        document.addEventListener('click', cerrarDropdown);
        return () => document.removeEventListener('click', cerrarDropdown);
    }, [dropdownAbierto]);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
        setDropdownAbierto(false);
        
        // Disparar evento para actualizar navbar
        window.dispatchEvent(new Event('authChange'));
        
        toast.success('Sesión cerrada exitosamente');
        navigate('/');
    };
    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-blue-600">MiInmobiliaria</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
                            Inicio
                        </Link>
                        <Link to="/propiedades" className="text-gray-700 hover:text-blue-600 transition">
                            Propiedades
                        </Link>
                    </div>

                    {/* Auth Buttons / User Menu */}
                    <div className="flex items-center space-x-4">
                        {!usuario ? (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-gray-700 hover:text-blue-600 transition"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link 
                                    to="/registro" 
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Registrarse
                                </Link>
                            </>
                        ) : (
                            <div className="relative dropdown-container">
                                <button
                                    onClick={() => setDropdownAbierto(!dropdownAbierto)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition focus:outline-none"
                                >
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="hidden md:block text-sm font-medium">
                                        {usuario.name || usuario.email}
                                    </span>
                                    <svg 
                                        className={`w-4 h-4 transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownAbierto && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                                        {usuario.rol === 'cliente' && (
                                            <Link
                                                to="/favoritos"
                                                onClick={() => setDropdownAbierto(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                ❤️ Mis Favoritos
                                            </Link>
                                        )}
                                        <button
                                            onClick={cerrarSesion}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            🚪 Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 