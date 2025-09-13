import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function LayoutPublic({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [usuarioCargando, setUsuarioCargando] = useState(true);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);

    useEffect(() => {
        // Función para cargar usuario
        const cargarUsuario = () => {
            const token = localStorage.getItem('token');
            const usuarioData = localStorage.getItem('usuario');
            
            if (token && usuarioData) {
                try {
                    const usuarioDecodificado = jwtDecode(token);
                    const usuarioCompleto = JSON.parse(usuarioData);
                    
                    // Corregir datos antiguos: si tiene 'nombre' en lugar de 'name'
                    if (usuarioCompleto.nombre && !usuarioCompleto.name) {
                        usuarioCompleto.name = usuarioCompleto.nombre;
                        delete usuarioCompleto.nombre;
                        
                        // Actualizar localStorage con los datos corregidos
                        localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
                    }
                    
                    setUsuario(usuarioCompleto);
                } catch (error) {
                    // Token inválido, limpiar datos
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario');
                    setUsuario(null);
                }
            } else {
                setUsuario(null);
            }
            
            // Pequeño delay para suavizar la transición
            setTimeout(() => {
                setUsuarioCargando(false);
            }, 100);
        };

        // Cargar usuario inicial
        cargarUsuario();

        // Escuchar cambios de autenticación
        const handleAuthChange = () => {
            setUsuarioCargando(true);
            cargarUsuario();
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownAbierto && !event.target.closest('.dropdown-container')) {
                setDropdownAbierto(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownAbierto]);

    const handleCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUsuario(null);
        setDropdownAbierto(false);
        
        // Disparar evento para actualizar otros componentes
        window.dispatchEvent(new Event('authChange'));
        
        // Redirigir al inicio
        navigate('/');
    };

    const handleIrAPanel = () => {
        setDropdownAbierto(false);
        if (usuario?.rol === 'admin') {
            navigate('/admin');
        } else if (usuario?.rol === 'agente') {
            navigate('/agente');
        }
        // Los clientes no tienen panel, solo usan el portal público
    };

    const handleIrAFavoritos = () => {
        setDropdownAbierto(false);
        navigate('/favoritos');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo y nombre */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Inmobiliaria</h1>
                                    <p className="text-xs text-gray-500">Sistema Inmobiliario</p>
                                </div>
                            </Link>
                        </div>

                        {/* Navegación */}
                        <nav className="hidden md:flex space-x-8">
                            <Link 
                                to="/" 
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === '/' 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                Inicio
                            </Link>
                            <Link 
                                to="/propiedades" 
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === '/propiedades' 
                                        ? 'text-blue-600 bg-blue-50' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                Propiedades
                            </Link>
                        </nav>

                        {/* Botones de acción o usuario logueado */}
                        <div className="flex items-center space-x-4">
                            {usuarioCargando ? (
                                /* Estado de carga - Skeleton que coincide con el dropdown */
                                <div className="flex items-center space-x-2 text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="hidden md:block w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ) : usuario ? (
                                /* Usuario logueado - Dropdown */
                                <div className="relative dropdown-container">
                                    <button
                                        onClick={() => setDropdownAbierto(!dropdownAbierto)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
                                    >
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                            {usuario.name?.charAt(0) || usuario.email?.charAt(0) || 'U'}
                                        </div>
                                        <span className="hidden md:block">{usuario.email}</span>
                                        <svg 
                                            className={`w-4 h-4 transition-transform ${dropdownAbierto ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown menu */}
                                    {dropdownAbierto && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{usuario.name || 'Usuario'}</p>
                                                <p className="text-xs text-gray-500">{usuario.email}</p>
                                            </div>
                                            
                                            <div className="py-1">
                                                <button
                                                    onClick={handleIrAFavoritos}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Mis Favoritos
                                                </button>

                                                {(usuario.rol === 'admin' || usuario.rol === 'agente') && (
                                                    <button
                                                        onClick={handleIrAPanel}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                        </svg>
                                                        Mi Panel
                                                    </button>
                                                )}

                                                <div className="border-t border-gray-100"></div>
                                                
                                                <button
                                                    onClick={handleCerrarSesion}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Usuario no logueado - Botones de login/registro */
                                <>
                                    <Link 
                                        to="/login" 
                                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link 
                                        to="/registro" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Inmobiliaria</h3>
                                    <p className="text-sm text-gray-400">Sistema Inmobiliario</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">
                                Encuentra tu hogar ideal con nuestro sistema inmobiliario completo. 
                                Propiedades de calidad en las mejores ubicaciones.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/propiedades" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Propiedades
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/registro" className="text-gray-300 hover:text-white text-sm transition-colors">
                                        Registrarse
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+593 981231304</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>info@inmobiliaria.com</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Cuenca, Ecuador</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-700 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                © 2024 Inmobiliaria. Todos los derechos reservados.
                            </p>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Política de Privacidad
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Términos de Servicio
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
