import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPublic from '../components/LayoutPublic';
import { toast } from 'sonner';

export default function DetallePropiedad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [error, setError] = useState('');
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        mensaje: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        // Usar endpoint público sin autenticación
        axios.get(`http://localhost:3000/api/propiedades/publica/${id}`)
            .then(res => setPropiedad(res.data))
            .catch(err => {
                setError(err.response?.data?.mensaje || 'Error al cargar la propiedad');
            });
    }, [id]);

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
        if (!formData.email.trim()) {
            errors.email = 'El email es obligatorio';
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            errors.email = 'Formato de email inválido';
        }
        if (!formData.mensaje.trim()) errors.mensaje = 'El mensaje es obligatorio';
        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Por favor, corrige los errores en el formulario.');
            return;
        }

        setFormErrors({});
        // Simular envío de formulario
        console.log('Datos del formulario de contacto:', formData);
        toast.success('¡Mensaje enviado con éxito! El agente se pondrá en contacto contigo pronto.');
        setFormSubmitted(true);
        setFormData({
            nombre: '',
            email: '',
            mensaje: '',
        });
    };

    if (error) return (
        <LayoutPublic>
            <div className="text-center py-20">
                <p className="text-red-600 text-lg">{error}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Volver al inicio
                </button>
            </div>
        </LayoutPublic>
    );
    
    if (!propiedad) return (
        <LayoutPublic>
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg">Cargando propiedad...</p>
            </div>
        </LayoutPublic>
    );

    const badgeColor = {
        disponible: 'bg-green-500/90 text-white',
        vendida: 'bg-red-500/90 text-white',
        arrendada: 'bg-blue-500/90 text-white',
        reservada: 'bg-yellow-400/90 text-gray-900',
        inactiva: 'bg-gray-400/90 text-white',
    };
    const badgeIcon = {
        disponible: '🏡',
        vendida: '🔴',
        arrendada: '🔵',
        reservada: '🟡',
        inactiva: '⏸️',
    };

    // Función para avanzar/retroceder imagen principal
    const handleMainImageClick = (e) => {
        if (e.type === 'click' && e.button === 0) {
            // Click izquierdo: siguiente imagen
            setImagenSeleccionada((prev) => (prev + 1) % propiedad.imagenes.length);
        } else if (e.type === 'contextmenu') {
            // Click derecho: imagen anterior
            e.preventDefault();
            setImagenSeleccionada((prev) => (prev - 1 + propiedad.imagenes.length) % propiedad.imagenes.length);
        }
    };

    return (
        <LayoutPublic>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                <button
                  onClick={() => navigate(-1)}
                                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 mb-6"
                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Volver
                </button>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                    {propiedad.titulo}
                                </h1>
                                <div className="flex items-center gap-4 text-lg">
                                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                        {propiedad.tipo_propiedad.replace('_', ' ')}
                                    </span>
                                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                        {propiedad.transaccion}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor[propiedad.estado_publicacion]}`}>
                                        {badgeIcon[propiedad.estado_publicacion]} {propiedad.estado_publicacion.charAt(0).toUpperCase() + propiedad.estado_publicacion.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <div className="hidden lg:block text-right">
                                <div className="text-4xl font-bold mb-2">
                                    {Number(propiedad.precio).toLocaleString('es-EC', {
                                        style: 'currency',
                                        currency: propiedad.moneda || 'USD'
                                    })}
                                </div>
                                <p className="text-blue-100">Precio de {propiedad.transaccion}</p>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column - Images */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Main Image */}
                            <div className="relative">
                        <img
                            src={propiedad.imagenes[imagenSeleccionada]?.url.startsWith('http') 
                    ? propiedad.imagenes[imagenSeleccionada].url 
                    : `http://localhost:3000${propiedad.imagenes[imagenSeleccionada]?.url}`}
                            alt="principal"
                                    className="w-full h-80 md:h-96 object-cover cursor-pointer select-none"
                  onClick={handleMainImageClick}
                  onContextMenu={handleMainImageClick}
                />
                                
                                {/* Image Navigation */}
                                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => setImagenSeleccionada((prev) => (prev - 1 + propiedad.imagenes.length) % propiedad.imagenes.length)}
                                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setImagenSeleccionada((prev) => (prev + 1) % propiedad.imagenes.length)}
                                        className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Image Counter */}
                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                    {imagenSeleccionada + 1} / {propiedad.imagenes.length}
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            <div className="p-4">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                  <PhotoProvider>
                    {propiedad.imagenes.map((img, idx) => (
                                <PhotoView key={img.url} src={`http://localhost:3000${img.url}`}>
                                    <img
                                        src={`http://localhost:3000${img.url}`}
                          alt={`thumb-${idx}`}
                          onClick={() => setImagenSeleccionada(idx)}
                                                    className={`h-16 w-24 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                                                        imagenSeleccionada === idx 
                                                            ? 'border-blue-500 ring-2 ring-blue-200' 
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                    />
                                </PhotoView>
                    ))}
                  </PhotoProvider>
                </div>
                            </div>
                        </div>

                        {/* Property Features - Now below images */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Características
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {propiedad.nro_habitaciones && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{propiedad.nro_habitaciones}</div>
                                            <div className="text-sm text-gray-600">Habitaciones</div>
                                        </div>
                                    </div>
                                )}
                                {propiedad.nro_banos && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{propiedad.nro_banos}</div>
                                            <div className="text-sm text-gray-600">Baños</div>
                                        </div>
                                    </div>
                                )}
                                {propiedad.nro_parqueaderos && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{propiedad.nro_parqueaderos}</div>
                                            <div className="text-sm text-gray-600">Parqueaderos</div>
                                        </div>
                                    </div>
                                )}
                                {propiedad.nro_pisos && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{propiedad.nro_pisos}</div>
                                            <div className="text-sm text-gray-600">Pisos</div>
                                        </div>
                                    </div>
                )}
              </div>

                            {/* Additional Property Details */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Información Adicional
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Tipo de Propiedad:</span>
                                        <span className="font-semibold text-gray-900">{propiedad.tipo_propiedad.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Estado Físico:</span>
                                        <span className="font-semibold text-gray-900">{propiedad.estado_propiedad}</span>
                                    </div>
                                    {propiedad.anio_construccion && (
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Año Construcción:</span>
                                            <span className="font-semibold text-gray-900">{propiedad.anio_construccion}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Transacción:</span>
                                        <span className="font-semibold text-gray-900">{propiedad.transaccion}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Property Details */}
                    <div className="space-y-6">
                        
                        {/* Price Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                      {Number(propiedad.precio).toLocaleString('es-EC', {
                        style: 'currency',
                        currency: propiedad.moneda || 'USD'
                      })}
                                </div>
                                <p className="text-gray-600 mb-4">Precio de {propiedad.transaccion}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="font-semibold text-blue-900">{propiedad.area_terreno} m²</div>
                                        <div className="text-blue-600">Terreno</div>
                                    </div>
                                    {propiedad.area_construccion && (
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="font-semibold text-green-900">{propiedad.area_construccion} m²</div>
                                            <div className="text-green-600">Construcción</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Location */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ubicación
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{propiedad.direccion}</div>
                                        <div className="text-sm text-gray-600">{propiedad.ciudad}, {propiedad.provincia}</div>
                                    </div>
                                </div>
                                {propiedad.codigo_postal && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Código Postal</div>
                                            <div className="text-sm text-gray-600">{propiedad.codigo_postal}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Agent Info */}
              {propiedad.agente && (
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Agente Responsable
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {propiedad.agente.name?.charAt(0) || 'A'}
                </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{propiedad.agente.name}</div>
                                        <div className="text-sm text-gray-600">{propiedad.agente.email}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description - Now integrated in right column */}
                        {propiedad.descripcion && (
                            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Descripción
                                </h3>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{propiedad.descripcion}</p>
                </div>
                </div>
                        )}

                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Contactar al Agente
                            </h3>
                  {formSubmitted ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-green-600 font-semibold text-lg">¡Mensaje enviado!</p>
                                    <p className="text-gray-600 mt-2">El agente se pondrá en contacto contigo pronto.</p>
                                </div>
                  ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                          <div>
                                        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">Tu Nombre</label>
                              <input
                                  type="text"
                                  id="nombre"
                                  name="nombre"
                                  value={formData.nombre}
                                  onChange={handleFormChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                  placeholder="Tu nombre completo"
                              />
                                        {formErrors.nombre && <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>}
                          </div>
                          <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Tu Email</label>
                              <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleFormChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                  placeholder="tu@ejemplo.com"
                              />
                                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                          </div>
                          <div>
                                        <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">Mensaje</label>
                              <textarea
                                  id="mensaje"
                                  name="mensaje"
                                  value={formData.mensaje}
                                  onChange={handleFormChange}
                                            rows="4"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                                                formErrors.mensaje ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                  placeholder="Me gustaría obtener más información sobre esta propiedad..."
                              ></textarea>
                                        {formErrors.mensaje && <p className="text-red-500 text-sm mt-1">{formErrors.mensaje}</p>}
                          </div>
                          <button
                              type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                              Enviar Mensaje
                                        </span>
                          </button>
                      </form>
                  )}
                </div>
            </div>
                </div>
            </div>
            </div>
        </LayoutPublic>
    );
}