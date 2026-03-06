import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Spinner, { OverlaySpinner } from './Spinner';

export default function LayoutPublic({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(() => {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');

        if (token && usuarioData) {
            try {
                const usuarioCompleto = JSON.parse(usuarioData);
                // Corregir datos antiguos: si tiene 'nombre' en lugar de 'name'
                if (usuarioCompleto.nombre && !usuarioCompleto.name) {
                    usuarioCompleto.name = usuarioCompleto.nombre;
                    delete usuarioCompleto.nombre;
                    localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
                }
                return usuarioCompleto;
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                return null;
            }
        }
        return null;
    });
    const [usuarioCargando, setUsuarioCargando] = useState(false);
    const [dropdownAbierto, setDropdownAbierto] = useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Función para cargar usuario (solo para eventos de cambio de auth)
        const cargarUsuario = () => {
            const token = localStorage.getItem('token');
            const usuarioData = localStorage.getItem('usuario');

            if (token && usuarioData) {
                try {
                    const usuarioCompleto = JSON.parse(usuarioData);
                    setUsuario(usuarioCompleto);
                } catch (error) {
                    setUsuario(null);
                }
            } else {
                setUsuario(null);
            }
            setUsuarioCargando(false);
        };

        // Escuchar cambios de autenticación
        const handleAuthChange = () => {
            setUsuarioCargando(true);
            // Pequeño delay solo cuando hay cambio de auth explícito para dar feedback visual
            setTimeout(cargarUsuario, 500);
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
        setMobileMenuOpen(false); // Cerrar menú móvil al cerrar sesión

        // Disparar evento para actualizar otros componentes
        window.dispatchEvent(new Event('authChange'));

        // Redirigir al inicio
        navigate('/');
    };

    const handleIrAPanel = () => {
        setDropdownAbierto(false);
        setMobileMenuOpen(false);
        if (usuario?.rol === 'admin') {
            navigate('/admin');
        } else if (usuario?.rol === 'agente') {
            navigate('/agente');
        }
        // Los clientes no tienen panel, solo usan el portal público
    };

    const handleIrAFavoritos = () => {
        setDropdownAbierto(false);
        setMobileMenuOpen(false);
        navigate('/favoritos');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <OverlaySpinner show={usuarioCargando} text="Procesando..." />
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/60 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-2 h-20 md:h-24">
                        {/* Logo y nombre */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3 group">
                                <img
                                    src="/logo-rectangular.png"
                                    alt="Constructora PropTech Hub"
                                    className="h-16 md:h-20 w-auto object-contain"
                                />
                            </Link>
                        </div>

                        {/* Navegación Desktop */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {['Inicio', 'Propiedades'].map((item) => {
                                const path = item === 'Inicio' ? '/' : `/${item.toLowerCase()}`;
                                const isActive = location.pathname === path;
                                return (
                                    <Link
                                        key={item}
                                        to={path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'text-white bg-slate-900 shadow-md'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                            }`}
                                    >
                                        {item}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Botones de acción o usuario logueado */}
                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button - Visible solo en móvil */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                            >
                                <span className="sr-only">Abrir menú</span>
                                {mobileMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>

                            <div className="hidden md:flex items-center space-x-4">
                                {usuario ? (
                                    /* Usuario logueado - Dropdown Desktop */
                                    <div className="relative dropdown-container">
                                        <button
                                            onClick={() => setDropdownAbierto(!dropdownAbierto)}
                                            className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
                                        >
                                            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-slate-100">
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
                                                    {usuario.rol === 'cliente' && (
                                                        <button
                                                            onClick={handleIrAFavoritos}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            Mis Favoritos
                                                        </button>
                                                    )}

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
                                    /* Usuario no logueado - Botones Desktop */
                                    <>
                                        <Link
                                            to="/login"
                                            className="text-slate-700 hover:text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            to="/registro"
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-orange-200 transition-all hover:shadow-orange-300 hover:-translate-y-0.5"
                                        >
                                            Registrarse
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-200 shadow-lg animate-fade-in-down origin-top">
                        <div className="px-4 pt-2 pb-4 space-y-1 sm:px-3">
                            {['Inicio', 'Propiedades'].map((item) => (
                                <Link
                                    key={item}
                                    to={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}

                            {usuario ? (
                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <div className="flex items-center px-3 mb-3">
                                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                            {usuario.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{usuario.name}</p>
                                            <p className="text-xs text-gray-500">{usuario.email}</p>
                                        </div>
                                    </div>

                                    {usuario.rol === 'cliente' && (
                                        <Link
                                            to="/favoritos"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors"
                                        >
                                            Mis Favoritos
                                        </Link>
                                    )}

                                    {(usuario.rol === 'admin' || usuario.rol === 'agente') && (
                                        <Link
                                            to={usuario.rol === 'admin' ? '/admin' : '/agente'}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 transition-colors"
                                        >
                                            Mi Panel
                                        </Link>
                                    )}

                                    <button
                                        onClick={handleCerrarSesion}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-3 px-3">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        to="/registro"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-center px-4 py-2 bg-orange-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-orange-700 transition-colors"
                                    >
                                        Registrarse
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Contenido principal */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer Premium - Light Theme */}
            <footer className="bg-slate-50 text-slate-600 py-16 border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
                        {/* Brand Column */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="flex items-center space-x-3">
                                <img
                                    src="/logo-circular.png"
                                    alt="Logo PropTech Hub"
                                    className="w-12 h-12 rounded-full shadow-sm"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">PropTech Hub</h3>
                                    <p className="text-xs text-orange-600 uppercase tracking-widest font-semibold">Soluciones Inmobiliarias Inteligentes</p>
                                </div>
                            </div>
                            <p className="text-slate-500 leading-relaxed text-sm max-w-sm">
                                Conectamos a las personas con su hogar ideal y potenciamos a los agentes con herramientas tecnológicas. Descubre propiedades exclusivas o gestiona tu portafolio inmobiliario en un solo lugar.
                            </p>
                        </div>

                        {/* Links Column 1 */}
                        <div className="md:col-span-3">
                            <h4 className="text-slate-900 font-bold mb-6">Explorar</h4>
                            <ul className="space-y-4">
                                {['Inicio', 'Buscar Propiedades', 'Para Agentes', 'Sobre Nosotros'].map((item) => (
                                    <li key={item}>
                                        <Link to="/" className="text-sm text-slate-500 hover:text-orange-600 transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="md:col-span-4">
                            <h4 className="text-slate-900 font-bold mb-6">Estamos aquí para ayudarte</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start space-x-3 group">
                                    <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-orange-200 group-hover:shadow-md transition-all">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="font-bold text-slate-700">Plataforma 100% Digital</p>
                                        <p className="text-slate-400 text-xs">Acceso desde cualquier dispositivo</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3 group">
                                    <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-orange-200 group-hover:shadow-md transition-all">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="font-bold text-slate-700">+593 98 123 1304</p>
                                        <p className="text-slate-400 text-xs">Lunes - Viernes, 9am - 6pm</p>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3 group">
                                    <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-orange-200 group-hover:shadow-md transition-all">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="pt-1.5">
                                        <p className="font-bold text-slate-700">contacto@proptechhub.com</p>
                                        <p className="text-slate-400 text-xs">Soporte y Atención al Cliente</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                        <p>© 2025 PropTech Hub. Todos los derechos reservados.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-orange-600 transition-colors">Política de Privacidad</a>
                            <a href="#" className="hover:text-orange-600 transition-colors">Términos de Servicio</a>
                        </div>
                    </div>
                </div>
            </footer>
            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/593981231304"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 group flex items-center gap-2 overflow-hidden hover:pr-6"
                aria-label="Contactar por WhatsApp"
            >
                <svg className="w-8 h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
                    Contáctanos
                </span>
            </a>
        </div>
    );
}
