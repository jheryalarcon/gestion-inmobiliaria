// Removido react-photo-view para evitar conflictos
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../components/Spinner.jsx';

export default function DetallePropiedadAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [imagenActual, setImagenActual] = useState(0);

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
            axios.get(`http://localhost:3000/api/propiedades/${id}`, {
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
            'vendida': 'bg-red-100 text-red-800',
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
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header con acciones administrativas */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {propiedad.titulo}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>ID: #{propiedad.id}</span>
                            <span>•</span>
                            <span>Creada: {new Date(propiedad.createdAt).toLocaleDateString()}</span>
                            {propiedad.updatedAt !== propiedad.createdAt && (
                                <>
                                    <span>•</span>
                                    <span>Actualizada: {new Date(propiedad.updatedAt).toLocaleDateString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/editar-propiedad/${propiedad.id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </button>
                        <button
                            onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-propiedades`)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver
                        </button>
                    </div>
                </div>
            </div>

            {/* Información administrativa */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna principal - Imágenes y detalles */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Galería de imágenes - DISEÑO MASONRY ELEGANTE */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Galería de Imágenes</h3>
                            <p className="text-sm text-gray-600">{propiedad.imagenes?.length || 0} imagen(es)</p>
                        </div>
                        <div className="p-4">
                            {propiedad.imagenes && propiedad.imagenes.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Grid con imágenes rectangulares fijas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {propiedad.imagenes.map((imagen, index) => {
                                            return (
                                                <div 
                                                    key={`masonry-${index}`}
                                                    className="relative group cursor-pointer"
                                                    onClick={() => abrirModal(index)}
                                                >
                                                    <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:scale-105">
                                                        <img
                                                            src={imagen.url}
                                                            alt={`${propiedad.titulo} - Imagen ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onLoad={() => console.log(`✅ Imagen ${index + 1} cargada`)}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = `
                                                                    <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                                        <div class="text-center text-gray-500">
                                                                            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                                                            </svg>
                                                                            <p class="text-sm font-medium">Error al cargar</p>
                                                                        </div>
                                                                    </div>
                                                                `;
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Overlay elegante */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl">
                                                        <div className="absolute bottom-3 left-3 right-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-white text-sm font-medium">
                                                                    Imagen {index + 1}
                                                                </span>
                                                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Badge de número */}
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p>No hay imágenes disponibles</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {propiedad.descripcion || 'No hay descripción disponible.'}
                            </div>
                        </div>
                    </div>

                    {/* Características */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {propiedad.nro_habitaciones && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{propiedad.nro_habitaciones} habitaciones</span>
                                    </div>
                                )}
                                {propiedad.nro_banos && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{propiedad.nro_banos} baños</span>
                                    </div>
                                )}
                                {propiedad.area_terreno && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{propiedad.area_terreno} m² terreno</span>
                                    </div>
                                )}
                                {propiedad.area_construccion && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{propiedad.area_construccion} m² construcción</span>
                                    </div>
                                )}
                                {propiedad.nro_parqueaderos && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{propiedad.nro_parqueaderos} parqueaderos</span>
                                    </div>
                                )}
                                {propiedad.nro_pisos && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{propiedad.nro_pisos} pisos</span>
                                    </div>
                                )}
                                {propiedad.anio_construccion && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Construido en {propiedad.anio_construccion}</span>
                                    </div>
                                )}
                            </div>
                            {(!propiedad.nro_habitaciones && !propiedad.nro_banos && !propiedad.area_terreno && !propiedad.area_construccion && !propiedad.nro_parqueaderos && !propiedad.nro_pisos && !propiedad.anio_construccion) && (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-sm">No hay características especificadas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna lateral - Información administrativa */}
                <div className="space-y-6">
                    {/* Información básica */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Precio</label>
                                    <p className="text-2xl font-bold text-green-600">{formatearPrecio(propiedad.precio)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tipo de Propiedad</label>
                                    <p className="text-gray-900">{propiedad.tipo_propiedad}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Transacción</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTransaccionColor(propiedad.transaccion)}`}>
                                        {propiedad.transaccion}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estado</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(propiedad.estado_publicacion)}`}>
                                        {propiedad.estado_publicacion}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                                    <p className="text-gray-900">{propiedad.direccion}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Ciudad</label>
                                    <p className="text-gray-900">{propiedad.ciudad}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Provincia</label>
                                    <p className="text-gray-900">{propiedad.provincia}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información administrativa */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Administrativa</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Estado de Publicación</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        propiedad.estado_publicacion === 'publicada' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {propiedad.estado_publicacion}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Agente Responsable</label>
                                    <p className="text-gray-900">
                                        {propiedad.agente ? `${propiedad.agente.nombre || propiedad.agente.name || 'Sin nombre'} (${propiedad.agente.email})` : 'No asignado'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                                    <p className="text-gray-900">{new Date(propiedad.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                                    <p className="text-gray-900">{new Date(propiedad.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Modal de pantalla completa para imágenes */}
            {modalAbierto && propiedad.imagenes && (
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
                                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
                                            index === imagenActual 
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
            )}
        </div>
    );
}
