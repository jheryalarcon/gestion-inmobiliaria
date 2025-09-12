import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { obtenerUsuario } from '../utils/tokenUtils';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState({});
    const location = useLocation();
    const usuario = obtenerUsuario();


    // Comunicar el estado del sidebar a los layouts
    useEffect(() => {
        const event = new CustomEvent('sidebarToggle', { detail: { isOpen } });
        window.dispatchEvent(event);
    }, [isOpen]);

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleExpanded = (itemTitle) => {
        setExpandedItems(prev => {
            // Si la opción actual está expandida, la contraemos
            if (prev[itemTitle]) {
                return { ...prev, [itemTitle]: false };
            }
            // Si no, contraemos todas las demás y expandimos solo la actual
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
                title: 'Dashboard',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                ),
                color: 'from-indigo-500 to-blue-500',
                items: [
                    { 
                        name: 'Panel Principal', 
                        path: '/admin',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Propiedades',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                ),
                color: 'from-blue-500 to-cyan-500',
                items: [
                    { 
                        name: 'Panel de Propiedades', 
                        path: '/admin/panel-propiedades',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                    { 
                        name: 'Registrar Propiedad', 
                        path: '/admin/registrar-propiedad',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Clientes',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
                color: 'from-emerald-500 to-teal-500',
                items: [
                    { 
                        name: 'Panel de Clientes', 
                        path: '/admin/panel-clientes',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                    { 
                        name: 'Registrar Cliente', 
                        path: '/admin/registrar-cliente',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Negociaciones',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                ),
                color: 'from-purple-500 to-pink-500',
                items: [
                    { 
                        name: 'Panel de Negociaciones', 
                        path: '/admin/panel-negociaciones',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Agentes',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ),
                color: 'from-orange-500 to-red-500',
                items: [
                    { 
                        name: 'Panel de Agentes', 
                        path: '/admin/panel-agentes',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                    { 
                        name: 'Registrar Agente', 
                        path: '/admin/registrar-agente',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )
                    },
                ]
            }
        ],
        agente: [
            {
                title: 'Dashboard',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                ),
                color: 'from-indigo-500 to-blue-500',
                items: [
                    { 
                        name: 'Mi Panel', 
                        path: '/agente',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Propiedades',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                ),
                color: 'from-blue-500 to-cyan-500',
                items: [
                    { 
                        name: 'Mis Propiedades', 
                        path: '/agente/panel-propiedades',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                    { 
                        name: 'Registrar Propiedad', 
                        path: '/agente/registrar-propiedad',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Clientes',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
                color: 'from-emerald-500 to-teal-500',
                items: [
                    { 
                        name: 'Mis Clientes', 
                        path: '/agente/panel-clientes',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                    { 
                        name: 'Registrar Cliente', 
                        path: '/agente/registrar-cliente',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Negociaciones',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                ),
                color: 'from-purple-500 to-pink-500',
                items: [
                    { 
                        name: 'Mis Negociaciones', 
                        path: '/agente/panel-negociaciones',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                ]
            }
        ],
        cliente: [
            {
                title: 'Dashboard',
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                ),
                color: 'from-indigo-500 to-blue-500',
                items: [
                    { 
                        name: 'Mi Panel', 
                        path: '/',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Propiedades',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                ),
                color: 'from-blue-500 to-cyan-500',
                items: [
                    { 
                        name: 'Ver Propiedades', 
                        path: '/propiedades',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )
                    },
                    { 
                        name: 'Mis Favoritos', 
                        path: '/favoritos',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )
                    },
                ]
            },
            {
                title: 'Negociaciones',
                icon: (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                ),
                color: 'from-purple-500 to-pink-500',
                items: [
                    { 
                        name: 'Mis Negociaciones', 
                        path: '/negociaciones',
                        icon: (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        )
                    },
                ]
            }
        ]
    };

    const currentMenuItems = menuItems[usuario?.rol] || [];

    return (
        <div className={`bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-2xl transition-all duration-500 ease-in-out ${isOpen ? 'w-72' : 'w-20'} flex flex-col h-screen border-r border-slate-200 sticky top-0 z-10`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366F1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            {/* Header */}
            <div className="relative p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    {isOpen && (
                        <div className="space-y-1">
                            <h2 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                {usuario?.rol === 'admin' ? 'Panel Admin' : 
                                 usuario?.rol === 'agente' ? 'Panel Agente' : 'Panel Cliente'}
                            </h2>
                            <p className="text-xs text-slate-500 capitalize">Sistema Inmobiliario</p>
                        </div>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-slate-200"
                    >
                        <svg className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {currentMenuItems.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-1">
                        {/* Section Header - Clickable */}
                        <button
                            onClick={() => toggleExpanded(section.title)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-slate-100 ${
                                !isOpen ? 'justify-center' : ''
                            }`}
                        >
                            <div className={`p-1.5 rounded-md bg-gradient-to-r ${section.color} shadow-md`}>
                                {section.icon}
                            </div>
                            {isOpen && (
                                <>
                                    <span className="text-sm font-semibold text-slate-700 tracking-wide flex-1 text-left">
                                        {section.title}
                                    </span>
                                    <svg 
                                        className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                                            expandedItems[section.title] ? 'rotate-180' : ''
                                        }`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Section Items - Collapsible */}
                        {isOpen && (
                            <div className={`overflow-hidden transition-all duration-300 ${
                                expandedItems[section.title] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="space-y-0.5 ml-4 pl-3 border-l-2 border-slate-300">
                                    {section.items.map((item, itemIndex) => (
                                        <Link
                                            key={itemIndex}
                                            to={item.path}
                                            className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-300 ${
                                                isActive(item.path)
                                                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-slate-800 shadow-md border border-blue-300 backdrop-blur-sm'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:translate-x-1'
                                            }`}
                                        >
                                            <span className={`transition-transform duration-300 group-hover:scale-110 ${
                                                isActive(item.path) ? 'animate-pulse' : ''
                                            }`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-medium transition-all duration-300">
                                                {item.name}
                                            </span>
                                            {isActive(item.path) && (
                                                <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Separator */}
                        {sectionIndex < currentMenuItems.length - 1 && (
                            <div className="border-t border-slate-200 my-3"></div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="relative p-3 border-t border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50">
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm border border-slate-200 shadow-sm ${!isOpen ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {(usuario?.nombre || usuario?.name)?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{usuario?.nombre || usuario?.name || 'Usuario'}</p>
                            <p className="text-xs text-slate-500 truncate">{usuario?.email || 'usuario@email.com'}</p>
                        </div>
                    )}
                    {isOpen && (
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all duration-200 hover:scale-105"
                            title="Cerrar sesión"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
