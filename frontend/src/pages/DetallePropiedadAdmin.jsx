// Removido react-photo-view para evitar conflictos
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../components/Spinner.jsx';
import MapaSoloLectura from '../components/MapaSoloLectura.jsx';
import { Handshake, Scale, ScrollText, Building2, Zap, FileText } from 'lucide-react';


// Componente de Acordeón Reutilizable
const AccordionItem = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
            >
                <div className="p-6 border-t border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function DetallePropiedadAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [imagenActual, setImagenActual] = useState(0);
    const [activeTab, setActiveTab] = useState('general');
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUsuario(decoded);

            // Verificar que sea admin o agente
            if (decoded.rol !== 'admin' && decoded.rol !== 'agente') {
                toast.error('No tienes permisos para acceder a esta página');
                navigate('/');
                return;
            }

            // Cargar propiedad con endpoint administrativo
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                console.log('Datos de la propiedad recibidos:', res.data);
                console.log('Imágenes de la propiedad:', res.data.imagenes);
                console.log('Agente de la propiedad:', res.data.agente);
                console.log('Estado de publicación:', res.data.estado_publicacion);
                console.log('URLs de imágenes:', res.data.imagenes?.map(img => img.url));
                setPropiedad(res.data);
                setLoading(false);
            }).catch(err => {
                if (err.response?.status === 403) {
                    toast.error('No tienes permisos para ver esta propiedad');
                } else {
                    toast.error('Error al cargar la propiedad');
                }
                navigate(decoded.rol === 'admin' ? '/admin' : '/agente');
            });
        } catch (error) {
            console.error('Error al decodificar token:', error);
            navigate('/login');
        }
    }, [id, navigate]);

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(precio);
    };

    const getEstadoColor = (estado) => {
        const colores = {
            'disponible': 'bg-green-100 text-green-800',
            'reservada': 'bg-yellow-100 text-yellow-800',
            'vendida': 'bg-purple-100 text-purple-800',
            'arrendada': 'bg-blue-100 text-blue-800',
            'inactiva': 'bg-gray-100 text-gray-800'
        };
        return colores[estado] || 'bg-gray-100 text-gray-800';
    };

    // Funciones para el modal de imágenes
    const abrirModal = (index) => {
        setImagenActual(index);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
    };

    const imagenAnterior = () => {
        setImagenActual((prev) =>
            prev === 0 ? propiedad.imagenes.length - 1 : prev - 1
        );
    };

    const imagenSiguiente = () => {
        setImagenActual((prev) =>
            prev === propiedad.imagenes.length - 1 ? 0 : prev + 1
        );
    };

    // Manejar teclas del teclado
    useEffect(() => {
        const manejarTeclado = (e) => {
            if (!modalAbierto) return;

            if (e.key === 'Escape') {
                cerrarModal();
            } else if (e.key === 'ArrowLeft') {
                imagenAnterior();
            } else if (e.key === 'ArrowRight') {
                imagenSiguiente();
            }
        };

        document.addEventListener('keydown', manejarTeclado);
        return () => document.removeEventListener('keydown', manejarTeclado);
    }, [modalAbierto, propiedad]);

    const getTransaccionColor = (transaccion) => {
        const colores = {
            'venta': 'bg-blue-100 text-blue-800',
            'alquiler': 'bg-purple-100 text-purple-800',
            'venta_alquiler': 'bg-indigo-100 text-indigo-800'
        };
        return colores[transaccion] || 'bg-gray-100 text-gray-800';
        return colores[transaccion] || 'bg-gray-100 text-gray-800';
    };

    // Función para construir historial de actividad
    const buildActivityHistory = () => {
        if (!propiedad) return [];

        const events = [];

        // Evento: Creación de propiedad
        events.push({
            type: 'created',
            date: new Date(propiedad.createdAt),
            description: 'Propiedad registrada en el sistema',
            user: propiedad.agente?.name || 'Sistema',
            icon: '🏠'
        });

        // Evento: Captación (si existe)
        if (propiedad.fecha_captacion) {
            events.push({
                type: 'captacion',
                date: new Date(propiedad.fecha_captacion),
                description: 'Propiedad captada',
                user: propiedad.agente?.name || 'Agente',
                icon: '📋'
            });
        }

        // Evento: Última actualización (si difiere de creación)
        if (propiedad.updatedAt !== propiedad.createdAt) {
            events.push({
                type: 'updated',
                date: new Date(propiedad.updatedAt),
                description: 'Información actualizada',
                user: propiedad.agente?.name || 'Sistema',
                icon: '✏️'
            });
        }

        // Evento: Desactivación (si existe)
        if (propiedad.fecha_desactivacion) {
            events.push({
                type: 'deactivated',
                date: new Date(propiedad.fecha_desactivacion),
                description: 'Propiedad desactivada',
                user: 'Administrador',
                icon: '🚫'
            });
        }

        // Eventos: Negociaciones activas
        if (propiedad.negociaciones && propiedad.negociaciones.length > 0) {
            propiedad.negociaciones.forEach(neg => {
                events.push({
                    type: 'negotiation',
                    date: new Date(), // Idealmente usar fecha de creación de negociación
                    description: `Negociación en etapa: ${neg.etapa}`,
                    user: 'Agente',
                    icon: '🤝'
                });
            });
        }

        // Eventos: Documentos subidos
        if (propiedad.documentos && propiedad.documentos.length > 0) {
            propiedad.documentos.forEach(doc => {
                events.push({
                    type: 'document',
                    date: new Date(), // Idealmente usar fecha de subida
                    description: `Documento agregado: ${doc.nombre}`,
                    user: 'Agente',
                    icon: '📄'
                });
            });
        }

        // Ordenar por fecha (más reciente primero)
        return events.sort((a, b) => b.date - a.date);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-center items-center h-64">
                    <Spinner size="md" text="Cargando propiedad..." />
                </div>
            </div>
        );
    }

    if (!propiedad) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Propiedad no encontrada</h2>
                    <p className="text-gray-600 mb-6">La propiedad que buscas no existe o no tienes permisos para verla.</p>
                    <button
                        onClick={() => navigate(usuario?.rol === 'admin' ? '/admin' : '/agente')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {/* Header con acciones administrativas */}
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Título y código */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                                {propiedad.titulo}
                            </h1>
                            {propiedad.codigo_interno && (
                                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-gray-900 text-white shadow-sm">
                                    {propiedad.codigo_interno}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-propiedades`)}
                            className="bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition duration-200 flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver
                        </button>
                        <button
                            onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-negociaciones?propiedadId=${propiedad.id}`)}
                            className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition duration-200 flex items-center gap-2 shadow-md hover:shadow-lg relative"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Ver Negociaciones
                            {propiedad.negociaciones && propiedad.negociaciones.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                                    {propiedad.negociaciones.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/editar-propiedad/${propiedad.id}`)}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Propiedad
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`${activeTab === 'general'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('negociaciones')}
                            className={`${activeTab === 'negociaciones'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors relative`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Negociaciones
                            {propiedad.negociaciones && propiedad.negociaciones.length > 0 && (
                                <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                                    {propiedad.negociaciones.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('documentos')}
                            className={`${activeTab === 'documentos'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Documentos
                            {propiedad.documentos && propiedad.documentos.length > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                                    {propiedad.documentos.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('actividad')}
                            className={`${activeTab === 'actividad'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Actividad
                        </button>
                    </nav>
                </div>
            </div>

            {/* Contenido Principal */}
            {activeTab === 'general' && (
                <div className="max-w-7xl mx-auto space-y-6 pt-6">
                    {/* Galería de imágenes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Galería de Imágenes</h3>
                            <p className="text-sm text-gray-600">{propiedad.imagenes?.length || 0} imagen(es)</p>
                        </div>
                        <div className="p-4">
                            {propiedad.imagenes && propiedad.imagenes.length > 0 ? (
                                <div className="relative group">
                                    <div
                                        ref={scrollContainerRef}
                                        className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x scroll-smooth"
                                    >
                                        {propiedad.imagenes.map((imagen, index) => {
                                            return (
                                                <div
                                                    key={`gallery-${index}`}
                                                    className="flex-none w-72 h-48 relative cursor-pointer snap-center"
                                                    onClick={() => abrirModal(index)}
                                                >
                                                    <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                                        <img
                                                            src={imagen.url}
                                                            alt={`${propiedad.titulo} - Imagen ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = `
                                                                    <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                                        <div class="text-center text-gray-500">
                                                                            <svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                                            </svg>
                                                                            <span class="text-xs">Error</span>
                                                                        </div>
                                                                    </div>
                                                                `;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Botones de desplazamiento */}
                                    {propiedad.imagenes.length > 3 && (
                                        <>
                                            <button
                                                onClick={() => scroll('left')}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-700 hover:text-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                aria-label="Desplazar izquierda"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => scroll('right')}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg text-gray-700 hover:text-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                                aria-label="Desplazar derecha"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p>No hay imágenes disponibles</p>
                                </div>
                            )
                            }
                        </div>
                    </div>

                    {/* Resumen Ejecutivo */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Información General
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    {propiedad.transaccion === 'alquiler' ? 'Precio de Arriendo' : 'Precio de Venta'}
                                </label>
                                <p className="text-2xl font-bold text-green-600">{formatearPrecio(propiedad.precio)}</p>
                            </div>

                            {/* Valor de Garantía - Solo para alquiler */}
                            {propiedad.transaccion === 'alquiler' && propiedad.valor_garantia && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Valor de Garantía</label>
                                    <p className="text-2xl font-bold text-orange-600">{formatearPrecio(propiedad.valor_garantia)}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tipo</label>
                                <p className="text-lg font-medium text-gray-900 capitalize">{propiedad.tipo_propiedad}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Transacción</label>
                                <div className="mt-1">
                                    <span className="text-lg font-medium text-gray-900 capitalize">
                                        {propiedad.transaccion}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Estado</label>
                                <div className="mt-1">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(propiedad.estado_publicacion)}`}>
                                        {propiedad.estado_publicacion}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Audit / Metadata Footer - REFINED */}
                        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                            {/* 1. Fecha de Registro */}
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>
                                    <span className="font-semibold">Registro:</span> {new Date(propiedad.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* 2. Fecha de Captación */}
                            {propiedad.fecha_captacion && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>
                                        <span className="font-semibold">Captación:</span> {new Date(propiedad.fecha_captacion).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {/* 3. Última Actualización */}
                            {propiedad.updatedAt !== propiedad.createdAt && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span>
                                        <span className="font-semibold">Actualización:</span> {new Date(propiedad.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {/* 4. Fecha de Desactivación */}
                            {propiedad.fecha_desactivacion && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <span>
                                        <span className="font-semibold">Desactivación:</span> {new Date(propiedad.fecha_desactivacion).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contenedor de Acordeones */}
                    <div className="space-y-4">
                        {/* 1. Descripción y Características */}
                        <AccordionItem
                            title="Descripción y Características"
                            icon={(
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            defaultOpen={true}
                        >
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Descripción para el portal público</h4>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                                        {propiedad.descripcion || 'No hay descripción disponible.'}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Características Físicas</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {propiedad.anio_construccion && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Año Construcción</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.anio_construccion}</span>
                                            </div>
                                        )}
                                        {propiedad.area_terreno && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Área Terreno</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.area_terreno} m²</span>
                                            </div>
                                        )}
                                        {propiedad.area_construccion && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Área Construcción</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.area_construccion} m²</span>
                                            </div>
                                        )}
                                        {propiedad.nro_pisos && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Pisos</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.nro_pisos}</span>
                                            </div>
                                        )}
                                        {propiedad.nro_habitaciones && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10v9h2v-2h14v2h2v-9a2 2 0 00-2-2H5a2 2 0 00-2 2zM5 8a2 2 0 012-2h4a2 2 0 012 2v2H5V8z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Habitaciones</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.nro_habitaciones}</span>
                                            </div>
                                        )}
                                        {propiedad.nro_banos && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 14h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5zM6 14V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Baños</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.nro_banos}</span>
                                            </div>
                                        )}
                                        {propiedad.nro_parqueaderos && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-50 p-2 rounded-lg">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l2-4h10l2 4v6h-2v-2H7v2H5v-6zm2-4h10l-1.5 3H8.5L7 6zm10 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">Parqueaderos</span>
                                                </div>
                                                <span className="text-sm text-gray-900">{propiedad.nro_parqueaderos}</span>
                                            </div>
                                        )}
                                        {(!propiedad.nro_habitaciones && !propiedad.nro_banos && !propiedad.area_terreno && !propiedad.area_construccion && !propiedad.nro_parqueaderos && !propiedad.nro_pisos && !propiedad.anio_construccion) && (
                                            <p className="text-sm text-center text-gray-500 italic">No hay características registradas.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Información de Negocio */}
                        <AccordionItem
                            title="Información de Negocio"
                            icon={(
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            )}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Propietarios - Full Width */}
                                <div className="md:col-span-2">
                                    {propiedad.propietarios && propiedad.propietarios.length > 0 ? (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Propietario(s)</label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {propiedad.propietarios.map((prop, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 pr-4">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{prop.cliente.nombre}</p>
                                                            <div className="flex items-center gap-1">
                                                                {prop.es_principal && (
                                                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Principal</span>
                                                                )}
                                                                {prop.porcentaje > 0 && (
                                                                    <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-200 rounded">{prop.porcentaje}%</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Propietario</label>
                                            <p className="text-sm text-gray-400 italic">Sin propietario asignado</p>
                                        </div>
                                    )}
                                </div>

                                {/* Precio y Comisión */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Precio de Venta</label>
                                    <p className="text-lg font-semibold text-gray-900">{formatearPrecio(propiedad.precio)}</p>
                                    {propiedad.precio_minimo && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mínimo: <span className="font-medium text-gray-700">{formatearPrecio(propiedad.precio_minimo)}</span>
                                        </p>
                                    )}
                                </div>

                                {propiedad.comision && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Comisión Pactada</label>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-lg font-semibold text-gray-900">
                                                {propiedad.tipo_comision === 'porcentaje'
                                                    ? `${propiedad.comision}%`
                                                    : formatearPrecio(propiedad.comision)}
                                            </p>
                                            {propiedad.tipo_comision === 'porcentaje' && (
                                                <span className="text-xs text-gray-500">
                                                    ({formatearPrecio((propiedad.precio * propiedad.comision) / 100)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Valor de Garantía (solo para alquileres) */}
                                {propiedad.transaccion === 'alquiler' && propiedad.valor_garantia && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Valor de Garantía</label>
                                        <p className="text-lg font-semibold text-orange-600">
                                            {formatearPrecio(propiedad.valor_garantia)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Depósito requerido para alquiler
                                        </p>
                                    </div>
                                )}

                                {/* Datos del Contrato */}
                                <div className="md:col-span-2 border-t border-gray-100 pt-3 mt-1">
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Detalles del Contrato</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 block">Tipo</span>
                                            <span className="text-sm font-medium text-gray-900 capitalize">{propiedad.tipo_contrato || 'No definido'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">Captación</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {propiedad.fecha_captacion ? new Date(propiedad.fecha_captacion).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">Vencimiento</span>
                                            <span className={`text-sm font-medium ${propiedad.fecha_fin_contrato && new Date(propiedad.fecha_fin_contrato) < new Date()
                                                ? 'text-red-600'
                                                : 'text-gray-900'
                                                }`}>
                                                {propiedad.fecha_fin_contrato ? new Date(propiedad.fecha_fin_contrato).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                        {propiedad.fecha_captacion && propiedad.fecha_fin_contrato && (
                                            <div>
                                                <span className="text-xs text-gray-400 block">Duración</span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {Math.round((new Date(propiedad.fecha_fin_contrato) - new Date(propiedad.fecha_captacion)) / (1000 * 60 * 60 * 24 * 30))} meses
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Agente Captador */}
                                {propiedad.agente && (
                                    <div className="md:col-span-2 border-t border-gray-100 pt-3 mt-1">
                                        <label className="text-sm font-medium text-gray-500 mb-2 block">Agente Responsable</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {propiedad.agente.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{propiedad.agente.name}</p>
                                                <p className="text-xs text-gray-500">{propiedad.agente.email}</p>
                                            </div>
                                            <span className="ml-auto text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium border border-indigo-100">
                                                Captador
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AccordionItem>

                        {/* Amenidades */}
                        {/* Amenidades */}
                        <AccordionItem
                            title="Amenidades y Servicios"
                            icon={(
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            )}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {propiedad.tiene_piscina && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Piscina</span>
                                    </div>
                                )}
                                {propiedad.tiene_seguridad && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Seguridad</span>
                                    </div>
                                )}
                                {propiedad.tiene_ascensor && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Ascensor</span>
                                    </div>
                                )}
                                {propiedad.tiene_area_bbq && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Área BBQ</span>
                                    </div>
                                )}
                                {propiedad.tiene_terraza && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Terraza</span>
                                    </div>
                                )}
                                {propiedad.tiene_balcon && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Balcón</span>
                                    </div>
                                )}
                                {propiedad.tiene_patio && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Patio</span>
                                    </div>
                                )}
                                {propiedad.tiene_bodega && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Bodega</span>
                                    </div>
                                )}
                                {propiedad.tiene_areas_comunales && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Áreas Comunales</span>
                                    </div>
                                )}
                                {propiedad.tiene_gas_centralizado && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Gas Centralizado</span>
                                    </div>
                                )}
                                {propiedad.tiene_cisterna && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Cisterna</span>
                                    </div>
                                )}
                                {propiedad.tiene_lavanderia && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Lavandería</span>
                                    </div>
                                )}
                                {propiedad.amoblado && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Amoblado</span>
                                    </div>
                                )}
                                {!propiedad.tiene_piscina && !propiedad.tiene_seguridad && !propiedad.tiene_ascensor &&
                                    !propiedad.tiene_area_bbq && !propiedad.tiene_terraza && !propiedad.tiene_balcon &&
                                    !propiedad.tiene_patio && !propiedad.tiene_bodega && !propiedad.tiene_areas_comunales &&
                                    !propiedad.tiene_gas_centralizado && !propiedad.tiene_cisterna && !propiedad.tiene_lavanderia &&
                                    !propiedad.amoblado && (
                                        <div className="col-span-2 text-center py-4">
                                            <p className="text-sm text-gray-400 italic">No se han registrado amenidades</p>
                                        </div>
                                    )}
                            </div>
                        </AccordionItem>

                        {/* Ubicación */}
                        <AccordionItem
                            title="Ubicación Geográfica"
                            icon={(
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        >
                            {/* Grid container: 1 columna en móvil, 2 columnas en desktop si hay mapa */}
                            <div className={`grid grid-cols-1 ${propiedad.latitud && propiedad.longitud ? 'md:grid-cols-2 gap-8' : ''}`}>

                                {/* Columna Izquierda: Datos de Texto */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Provincia</label>
                                        <p className="text-gray-900">{propiedad.provincia ? propiedad.provincia.replace(/-/g, ' ') : <span className="text-gray-400 italic">No registrado</span>}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ciudad</label>
                                        <p className="text-gray-900">{propiedad.ciudad || <span className="text-gray-400 italic">No registrado</span>}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Sector / Barrio</label>
                                        <p className="text-gray-900">{propiedad.sector || <span className="text-gray-400 italic">No registrado</span>}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Dirección Exacta</label>
                                        <p className="text-gray-900">{propiedad.direccion || <span className="text-gray-400 italic">No registrado</span>}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Referencia</label>
                                        <p className="text-gray-900">{propiedad.referencia || <span className="text-gray-400 italic">No registrado</span>}</p>
                                    </div>
                                </div>

                                {/* Columna Derecha: Mapa de Ubicación */}
                                {
                                    (propiedad.latitud && propiedad.longitud) && (
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                <h3 className="text-sm font-semibold text-gray-900">Mapa de Ubicación</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                                    <span>Lat: {Number(propiedad.latitud).toFixed(4)}</span>
                                                    <span>Lng: {Number(propiedad.longitud).toFixed(4)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-grow min-h-[300px] p-2">
                                                <MapaSoloLectura
                                                    lat={Number(propiedad.latitud)}
                                                    lng={Number(propiedad.longitud)}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </AccordionItem>


                    </div >
                </div >
            )
            }

            {/* Tab: Negociaciones */}
            {
                activeTab === 'negociaciones' && (
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Negociaciones Activas</h2>
                                {propiedad.negociaciones && propiedad.negociaciones.length > 0 ? (
                                    <div className="space-y-4">
                                        {propiedad.negociaciones.map((neg, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${neg.etapa === 'interes' ? 'bg-blue-100' :
                                                            neg.etapa === 'negociacion' ? 'bg-yellow-100' :
                                                                neg.etapa === 'cierre' ? 'bg-green-100' :
                                                                    neg.etapa === 'finalizada' ? 'bg-gray-100' : 'bg-red-100'
                                                            }`}>
                                                            {neg.etapa === 'interes' ? '👁️' :
                                                                neg.etapa === 'negociacion' ? '💬' :
                                                                    neg.etapa === 'cierre' ? '🤝' :
                                                                        neg.etapa === 'finalizada' ? '✅' : '❌'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">Negociación #{neg.id}</h3>
                                                            <p className="text-sm text-gray-600 capitalize">Etapa: {neg.etapa}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-negociaciones`)}
                                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                                    >
                                                        Ver Detalle
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">No hay negociaciones activas</p>
                                        <p className="text-gray-400 text-sm mt-2">Las negociaciones aparecerán aquí cuando se creen</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Tab: Documentos */}
            {
                activeTab === 'documentos' && (
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentos Adjuntos</h2>
                                {propiedad.documentos && propiedad.documentos.length > 0 ? (() => {
                                    // Categorizar documentos
                                    const categorias = {
                                        COMERCIAL: {
                                            nombre: 'Documentos de Comercialización', // Cambiado para match
                                            tipos: ['CONTRATO_EXCLUSIVIDAD', 'AUTORIZACION_VENTA'],
                                            color: 'orange', // Orange
                                            icon: <Handshake className="w-5 h-5" />
                                        },
                                        LEGAL: {
                                            nombre: 'Documentos Legales de Propiedad',
                                            tipos: ['ESCRITURA', 'CERTIFICADO_GRAVAMEN', 'PODER', 'OTRO'],
                                            color: 'blue',
                                            icon: <Scale className="w-5 h-5" />
                                        },
                                        TECNICO: {
                                            nombre: 'Documentos Técnicos',
                                            tipos: ['PAGO_PREDIAL', 'PLANO', 'CERTIFICADO_USO_SUELO', 'FICHA_CATASTRAL'],
                                            color: 'emerald',
                                            icon: <ScrollText className="w-5 h-5" />
                                        },
                                        PH: {
                                            nombre: 'Régimen de Propiedad Horizontal',
                                            tipos: ['REGLAMENTO_PH', 'CERTIFICADO_ALICUOTA', 'CERTIFICADO_EXPENSAS'],
                                            color: 'indigo',
                                            icon: <Building2 className="w-5 h-5" />
                                        },
                                        SERVICIOS: {
                                            nombre: 'Servicios Básicos',
                                            tipos: ['PLANILLA_LUZ', 'PLANILLA_AGUA', 'PLANILLA_ALICUOTA'],
                                            color: 'amber',
                                            icon: <Zap className="w-5 h-5" />
                                        }
                                    };

                                    const documentosPorCategoria = {};
                                    Object.keys(categorias).forEach(cat => {
                                        documentosPorCategoria[cat] = propiedad.documentos.filter(doc =>
                                            categorias[cat].tipos.includes(doc.tipo)
                                        );
                                    });

                                    // Documentos sin categoría
                                    const tiposCategorizados = Object.values(categorias).flatMap(c => c.tipos);
                                    const documentosSinCategoria = propiedad.documentos.filter(doc =>
                                        !tiposCategorizados.includes(doc.tipo)
                                    );

                                    return (
                                        <div className="space-y-4">
                                            {Object.entries(categorias).map(([key, categoria]) => {
                                                const docs = documentosPorCategoria[key];
                                                if (docs.length === 0) return null;

                                                return (
                                                    <AccordionItem
                                                        key={key}
                                                        title={`${categoria.nombre} (${docs.length})`}
                                                        icon={React.cloneElement(categoria.icon, { className: `w-5 h-5 text-${categoria.color}-600` })}
                                                        defaultOpen={true}
                                                    >
                                                        <div className="space-y-2">
                                                            {docs.map((doc, idx) => (
                                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <div className={`w-10 h-10 bg-${categoria.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                                            {/* Replicar el ícono con el color correcto */}
                                                                            {React.cloneElement(categoria.icon, { className: `w-5 h-5 text-${categoria.color}-600` })}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-gray-900 text-sm truncate" title={doc.nombre}>{doc.nombre}</p>
                                                                            <span className={`text-xs px-2 py-0.5 rounded-full bg-${categoria.color}-100 text-${categoria.color}-700 inline-block mt-1 whitespace-nowrap`}>
                                                                                {doc.tipo.replace(/_/g, ' ')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={`${import.meta.env.VITE_BACKEND_URL}${doc.url}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                        <span className="hidden sm:inline">Descargar</span>
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </AccordionItem>
                                                );
                                            })}

                                            {/* Documentos sin categoría */}
                                            {documentosSinCategoria.length > 0 && (
                                                <AccordionItem
                                                    title={`Otros Documentos (${documentosSinCategoria.length})`}
                                                    icon={(
                                                        <FileText className="w-5 h-5 text-gray-500" />
                                                    )}
                                                    defaultOpen={true}
                                                >
                                                    <div className="space-y-2">
                                                        {documentosSinCategoria.map((doc, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium text-gray-900 text-sm truncate" title={doc.nombre}>{doc.nombre}</p>
                                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                                                                                {doc.tipo}
                                                                            </span>
                                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                                                                                {doc.categoria}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    href={`${import.meta.env.VITE_BACKEND_URL}${doc.url}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                    <span className="hidden sm:inline">Descargar</span>
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionItem>
                                            )}
                                        </div>
                                    );
                                })() : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">No hay documentos adjuntos</p>
                                        <p className="text-gray-400 text-sm mt-2">Los documentos aparecerán aquí cuando se suban</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Tab: Actividad */}
            {
                activeTab === 'actividad' && (
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Actividad</h2>
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {buildActivityHistory().map((event, idx) => (
                                            <li key={idx}>
                                                <div className="relative pb-8">
                                                    {idx !== buildActivityHistory().length - 1 && (
                                                        <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                    )}
                                                    <div className="relative flex items-start space-x-3">
                                                        <div>
                                                            <div className="relative px-1">
                                                                <div className="h-10 w-10 bg-gray-100 rounded-full ring-8 ring-white flex items-center justify-center text-xl">
                                                                    {event.icon}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div>
                                                                <div className="text-sm">
                                                                    <span className="font-medium text-gray-900">{event.description}</span>
                                                                </div>
                                                                <p className="mt-0.5 text-sm text-gray-500">
                                                                    {event.user} • {event.date.toLocaleString('es-EC', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de pantalla completa para imágenes */}
            {
                modalAbierto && propiedad.imagenes && (
                    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Botón cerrar */}
                            <button
                                onClick={cerrarModal}
                                className="absolute top-6 right-6 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Botón anterior */}
                            {propiedad.imagenes.length > 1 && (
                                <button
                                    onClick={imagenAnterior}
                                    className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}

                            {/* Botón siguiente */}
                            {propiedad.imagenes.length > 1 && (
                                <button
                                    onClick={imagenSiguiente}
                                    className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}

                            {/* Imagen principal */}
                            <div className="max-w-4xl max-h-full mx-16">
                                <img
                                    src={`${propiedad.imagenes[imagenActual].url}?t=${Date.now()}&v=${Math.random()}`}
                                    alt={`${propiedad.titulo} - Imagen ${imagenActual + 1}`}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {/* Contador de imágenes */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                {imagenActual + 1} / {propiedad.imagenes.length}
                            </div>

                            {/* Miniaturas en la parte inferior */}
                            {propiedad.imagenes.length > 1 && (
                                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
                                    {propiedad.imagenes.map((imagen, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setImagenActual(index)}
                                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${index === imagenActual
                                                ? 'border-white scale-110'
                                                : 'border-transparent opacity-60 hover:opacity-90 hover:scale-105'
                                                }`}
                                        >
                                            <img
                                                src={imagen.url}
                                                alt={`Miniatura ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
