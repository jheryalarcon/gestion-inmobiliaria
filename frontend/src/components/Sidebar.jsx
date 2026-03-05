import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { obtenerUsuario } from '../utils/tokenUtils';
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    UserPlus,
    Briefcase,
    BadgeCheck,
    Building2,
    Wallet
} from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Función para manejar el resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Si pasamos a escritorio y estaba cerrado (por defecto móvil), abrirlo
            if (!mobile && !isOpen) setIsOpen(true);
            // Si pasamos a móvil, cerrarlo por defecto para no tapar contenidos
            if (mobile) setIsOpen(false);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Check initial size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const location = useLocation();
    const navigate = useNavigate();
    const usuario = obtenerUsuario();

    // Comunicar el estado del sidebar a los layouts (útil para desktop)
    useEffect(() => {
        // En mobile no queremos que afecte al layout push
        const detail = { isOpen: isMobile ? false : isOpen, isMobile };
        const event = new CustomEvent('sidebarToggle', { detail });
        window.dispatchEvent(event);
    }, [isOpen, isMobile]);

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleExpanded = (itemTitle) => {
        // En modo colapsado (desktop), al expandir un item se debe abrir el menú
        if (!isOpen && !isMobile) setIsOpen(true);

        setExpandedItems(prev => {
            if (prev[itemTitle]) {
                return { ...prev, [itemTitle]: false };
            }
            const newState = {};
            currentMenuItems.forEach(item => {
                newState[item.title] = item.title === itemTitle;
            });
            return newState;
        });
    };

    const menuItems = {
        admin: [

            {
                title: 'Propiedades',
                icon: <Building2 className="w-5 h-5" />,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                items: [
                    {
                        name: 'Panel de Propiedades',
                        path: '/admin/panel-propiedades',
                        icon: <LayoutDashboard className="w-4 h-4" />
                    },
                    {
                        name: 'Registrar Propiedad',
                        path: '/admin/registrar-propiedad',
                        icon: <PlusCircle className="w-4 h-4" />
                    },
                ]
            },
            {
                title: 'Clientes',
                icon: <Users className="w-5 h-5" />,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                items: [
                    {
                        name: 'Panel de Clientes',
                        path: '/admin/panel-clientes',
                        icon: <Users className="w-4 h-4" />
                    },
                    {
                        name: 'Registrar Cliente',
                        path: '/admin/registrar-cliente',
                        icon: <UserPlus className="w-4 h-4" />
                    },
                ]
            },
            {
                title: 'Negociaciones',
                icon: <Wallet className="w-5 h-5" />,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                items: [
                    {
                        name: 'Panel de Negociaciones',
                        path: '/admin/panel-negociaciones',
                        icon: <Briefcase className="w-4 h-4" />
                    },
                ]
            },
            {
                title: 'Agentes',
                icon: <BadgeCheck className="w-5 h-5" />,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                items: [
                    {
                        name: 'Panel de Agentes',
                        path: '/admin/panel-agentes',
                        icon: <Users className="w-4 h-4" />
                    },
                    {
                        name: 'Registrar Agente',
                        path: '/admin/registrar-agente',
                        icon: <UserPlus className="w-4 h-4" />
                    },
                ]
            }
        ],
        agente: [

            {
                title: 'Propiedades',
                icon: <Building2 className="w-5 h-5" />,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                items: [
                    {
                        name: 'Mis Propiedades',
                        path: '/agente/panel-propiedades',
                        icon: <LayoutDashboard className="w-4 h-4" />
                    },
                    {
                        name: 'Registrar Propiedad',
                        path: '/agente/registrar-propiedad',
                        icon: <PlusCircle className="w-4 h-4" />
                    },
                ]
            },
            {
                title: 'Clientes',
                icon: <Users className="w-5 h-5" />,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                items: [
                    {
                        name: 'Mis Clientes',
                        path: '/agente/panel-clientes',
                        icon: <Users className="w-4 h-4" />
                    },
                    {
                        name: 'Registrar Cliente',
                        path: '/agente/registrar-cliente',
                        icon: <UserPlus className="w-4 h-4" />
                    },
                ]
            },
            {
                title: 'Negociaciones',
                icon: <Wallet className="w-5 h-5" />,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                items: [
                    {
                        name: 'Mis Negociaciones',
                        path: '/agente/panel-negociaciones',
                        icon: <Briefcase className="w-4 h-4" />
                    },
                ]
            }
        ],
        cliente: [
            {
                title: 'Dashboard',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                ),
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                items: [
                    {
                        name: 'Mi Panel',
                        path: '/',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    },
                ]
            },
            {
                title: 'Propiedades',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                items: [
                    {
                        name: 'Ver Propiedades',
                        path: '/propiedades',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    },
                    {
                        name: 'Mis Favoritos',
                        path: '/favoritos',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    },
                ]
            },
            {
                title: 'Negociaciones',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                items: [
                    {
                        name: 'Mis Negociaciones',
                        path: '/negociaciones',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    },
                ]
            }
        ]
    };

    const currentMenuItems = menuItems[usuario?.rol] || [];

    // Trigger de menú móvil flotante (solo visible cuando está cerrado en móvil)
    if (isMobile && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 p-2.5 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-50 border border-gray-200 transition-all active:scale-95"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        );
    }

    return (
        <>
            {/* Overlay para móvil */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div
                className={`
                    ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-72' : 'fixed inset-y-0 left-0 z-40 h-screen'} 
                    ${!isMobile && !isOpen ? 'w-20' : 'w-72'}
                    bg-white border-r border-gray-200 shadow-xl
                    transition-all duration-500 ease-in-out flex flex-col
                `}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    {(!isMobile && !isOpen) ? (
                        <div
                            className="w-full flex justify-center py-2 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setIsOpen(true)}
                            title="Expandir menú"
                        >
                            <img
                                src="/logo-circular.png"
                                alt="Logo"
                                className="w-10 h-10 object-cover rounded-full shadow-md"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-start">
                            <img
                                src="/logo-rectangular.jpg"
                                alt="PropTech Hub"
                                className="h-10 w-auto object-contain mb-1"
                            />
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider ml-1">
                                {usuario?.rol || 'Panel'}
                            </p>
                        </div>
                    )}

                    {(!isMobile && isOpen) || (isMobile && isOpen) ? (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : null}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 py-6 px-3 space-y-2 scrollbar-hide ${(!isOpen && !isMobile) ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
                    {currentMenuItems.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-1">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleExpanded(section.title)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                    ${expandedItems[section.title]
                                        ? 'bg-slate-50 text-slate-900'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    ${!isOpen && !isMobile ? 'justify-center' : ''}
                                `}
                            >
                                <div className={`p-2 rounded-lg transition-colors duration-200 ${expandedItems[section.title] ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500 group-hover:text-orange-500 group-hover:bg-white group-hover:shadow-sm'
                                    }`}>
                                    {section.icon}
                                </div>

                                {(isOpen || isMobile) ? (
                                    <>
                                        <span className="font-medium text-sm flex-1 text-left">
                                            {section.title}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedItems[section.title] ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </>
                                ) : (
                                    /* Tooltip para modo colapsado */
                                    <div className="absolute left-full ml-6 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {section.title}
                                        {/* Triangulito del tooltip */}
                                        <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                                    </div>
                                )}
                            </button>

                            {/* Section Items */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out
                                ${(expandedItems[section.title] && (isOpen || isMobile)) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                            `}>
                                <div className="pt-1 pb-2 space-y-1">
                                    {section.items.map((item, itemIndex) => {
                                        const active = isActive(item.path);
                                        return (
                                            <Link
                                                key={itemIndex}
                                                to={item.path}
                                                // En móvil cerramos el menú al navegar
                                                onClick={() => isMobile && setIsOpen(false)}
                                                className={`
                                                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ml-4 mr-1
                                                    ${active
                                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                                                        : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'}
                                                `}
                                            >
                                                {/* Punto indicador o icono */}
                                                <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="font-medium">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Separator if needed (optional, keeping clean for now) */}
                            {sectionIndex < currentMenuItems.length - 1 && <div className="h-2" />}
                        </div>
                    ))}
                </nav>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                    <div
                        className={`flex items-center gap-3 ${!isOpen && !isMobile ? 'justify-center cursor-pointer hover:bg-slate-100 p-1 rounded-lg transition-colors' : ''}`}
                        onClick={() => {
                            if (!isOpen && !isMobile) setIsOpen(true);
                        }}
                        title={!isOpen && !isMobile ? "Expandir menú" : ""}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                                {(usuario?.nombre || usuario?.name)?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {(isOpen || isMobile) && (
                            <div className="flex-1 min-w-0 transition-opacity duration-200">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {usuario?.nombre || usuario?.name || 'Usuario'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {usuario?.email}
                                </p>
                            </div>
                        )}

                        {(isOpen || isMobile) && (
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('usuario');
                                    window.dispatchEvent(new Event('authChange'));
                                    navigate('/');
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cerrar sesión"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
