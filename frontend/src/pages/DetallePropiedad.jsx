import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutPublic from '../components/LayoutPublic';
import CardPropiedadPublica from '../components/CardPropiedadPublica';
import Recomendaciones from '../components/Recomendaciones';
import FavoritoIcon from '../components/FavoritoIcon';
import { toast } from 'sonner';
import { PageSpinner } from '../components/Spinner';
import { BedDouble, Bath, Car, Ruler, Maximize2, Home, Wind, Sun, Trees, Waves, Package, Utensils, ArrowUpDown, ShieldCheck, Users, Flame, Droplet, Shirt, Sofa } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function DetallePropiedad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [error, setError] = useState('');
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
    const [favoritos, setFavoritos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [propiedadesSimilares, setPropiedadesSimilares] = useState([]);

    useEffect(() => {
        // Usar endpoint público sin autenticación
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades/publica/${id}`)
            .then(res => {
                setPropiedad(res.data);
                // Pre-rellenar el mensaje del formulario
                // Pre-rellenar datos si el usuario está logueado
                const usuarioGuardado = localStorage.getItem('usuario');
                let datosUsuario = {};

                if (usuarioGuardado) {
                    try {
                        const usuario = JSON.parse(usuarioGuardado);
                        datosUsuario = {
                            nombre: usuario.nombre || usuario.name || '',
                            email: usuario.email || '',
                            telefono: usuario.telefono || ''
                        };
                    } catch (e) {
                        console.error('Error al leer datos de usuario:', e);
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    ...datosUsuario,
                    mensaje: `Hola, estoy interesado en obtener más información sobre la propiedad: ${res.data.titulo}`
                }));
                // Cargar propiedades similares después de obtener la propiedad actual
                cargarPropiedadesSimilares(res.data);
            })
            .catch(err => {
                setError(err.response?.data?.mensaje || 'Error al cargar la propiedad');
            });

        // Cargar favoritos si el usuario está logueado
        cargarFavoritos();
    }, [id]);

    const cargarPropiedadesSimilares = async (propiedadActual) => {
        try {
            // Calcular rango de precio (±50% para tener más resultados)
            const precioMin = Number(propiedadActual.precio) * 0.5;
            const precioMax = Number(propiedadActual.precio) * 1.5;

            console.log('Buscando propiedades similares:', {
                tipo: propiedadActual.tipo_propiedad,
                ciudad: propiedadActual.ciudad,
                precioMin,
                precioMax
            });

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades/publicas`, {
                params: {
                    tipo_propiedad: propiedadActual.tipo_propiedad,
                    ciudad: propiedadActual.ciudad,
                    precio_min: precioMin,
                    precio_max: precioMax,
                    limit: 5 // Pedimos 5 para tener margen
                }
            });

            console.log('Respuesta completa:', response.data);

            // El endpoint puede devolver un array directamente o en response.data.propiedades
            const propiedades = Array.isArray(response.data) ? response.data : (response.data.propiedades || []);

            console.log('Propiedades encontradas:', propiedades.length);

            // Filtrar la propiedad actual y tomar solo 4
            const similares = propiedades
                .filter(p => p.id !== propiedadActual.id)
                .slice(0, 4);

            console.log('Propiedades similares después de filtrar:', similares.length);
            setPropiedadesSimilares(similares);
        } catch (error) {
            console.error('Error cargando propiedades similares:', error);
        }
    };



    const cargarFavoritos = async () => {
        const token = localStorage.getItem('token');
        const usuario = token ? JSON.parse(localStorage.getItem('usuario')) : null;

        if (token && usuario && usuario.rol === 'cliente') {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/favoritos`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFavoritos(response.data);
            } catch (error) {
                // Error silencioso para favoritos
            }
        }
    };

    const handleFavoritoToggle = (propiedadId, isFavorito) => {
        if (isFavorito) {
            setFavoritos(prev => [...prev, { propiedadId }]);
        } else {
            setFavoritos(prev => prev.filter(fav => fav.propiedadId !== propiedadId));
        }
    };

    const handleInputChange = (e) => {
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

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/clientes/contacto-publico`, {
                ...formData,
                propiedadId: propiedad.id
            });

            toast.success('¡Mensaje enviado con éxito! Un agente te contactará pronto.');
            setFormSubmitted(true);
            setFormData({
                nombre: '',
                email: '',
                telefono: '',
                mensaje: '',
            });
        } catch (error) {
            console.error('Error enviando formulario:', error);
            toast.error(error.response?.data?.mensaje || 'Error al enviar el mensaje. Intenta de nuevo.');
        }
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
            <PageSpinner text="Cargando propiedad..." />
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
            <Helmet>
                <title>{propiedad.titulo} | PropTech Hub</title>
                <meta name="description" content={propiedad.descripcion ? propiedad.descripcion.substring(0, 150) + '...' : `Propiedad en ${propiedad.ciudad} - ${propiedad.tipo_propiedad}`} />

                {/* Facebook / Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content={propiedad.titulo} />
                <meta property="og:description" content={propiedad.descripcion ? propiedad.descripcion.substring(0, 150) + '...' : `Detalles de la propiedad en ${propiedad.direccion}`} />
                <meta property="og:image" content={propiedad.imagenes?.[0]?.url.startsWith('http') ? propiedad.imagenes[0].url : `${import.meta.env.VITE_BACKEND_URL}${propiedad.imagenes[0]?.url}`} />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={window.location.href} />
                <meta property="twitter:title" content={propiedad.titulo} />
                <meta property="twitter:description" content={propiedad.descripcion ? propiedad.descripcion.substring(0, 150) + '...' : `Propiedad en venta/alquiler`} />
                <meta property="twitter:image" content={propiedad.imagenes?.[0]?.url.startsWith('http') ? propiedad.imagenes[0].url : `${import.meta.env.VITE_BACKEND_URL}${propiedad.imagenes[0]?.url}`} />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 mb-6 border border-white/20"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Volver
                                </button>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                                    {propiedad.titulo}
                                </h1>

                                {/* Share Buttons */}
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="text-sm text-gray-300 mr-2">Compartir:</span>

{/* WhatsApp compartir - COMENTADO
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`¡Mira esta propiedad! ${propiedad.titulo} - ${window.location.href}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white/10 hover:bg-green-500 backdrop-blur-sm p-2 rounded-lg transition-all border border-white/20 hover:border-green-400"
                                        title="Compartir por WhatsApp"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </a>
                                    */}

                                    {/* Facebook */}
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white/10 hover:bg-blue-600 backdrop-blur-sm p-2 rounded-lg transition-all border border-white/20 hover:border-blue-400"
                                        title="Compartir en Facebook"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>

                                    {/* Email */}
                                    <a
                                        href={`mailto:?subject=${encodeURIComponent(propiedad.titulo)}&body=${encodeURIComponent(`Te comparto esta propiedad: ${window.location.href}`)}`}
                                        className="bg-white/10 hover:bg-slate-600 backdrop-blur-sm p-2 rounded-lg transition-all border border-white/20 hover:border-slate-400"
                                        title="Compartir por Email"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </a>

                                    {/* Copy Link */}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success('¡Enlace copiado al portapapeles!');
                                        }}
                                        className="bg-white/10 hover:bg-orange-500 backdrop-blur-sm p-2 rounded-lg transition-all border border-white/20 hover:border-orange-400"
                                        title="Copiar enlace"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="hidden lg:block text-right">
                                <div className="text-4xl md:text-5xl font-bold mb-2 text-orange-400 drop-shadow-lg">
                                    {Number(propiedad.precio).toLocaleString('es-EC', {
                                        style: 'currency',
                                        currency: propiedad.moneda || 'USD'
                                    })}
                                </div>
                                <p className="text-gray-300">Precio de {propiedad.transaccion}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Single Column Layout */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* 1. IMAGE GALLERY - Full Width */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="relative">
                            {/* Botón de favoritos */}
                            <div className="absolute top-3 right-3 z-10">
                                <FavoritoIcon
                                    propiedadId={propiedad.id}
                                    isFavorito={favoritos.some(fav => fav.propiedadId === propiedad.id)}
                                    onToggle={handleFavoritoToggle}
                                />
                            </div>

                            <img
                                src={propiedad.imagenes[imagenSeleccionada]?.url.startsWith('http')
                                    ? propiedad.imagenes[imagenSeleccionada].url
                                    : `${import.meta.env.VITE_BACKEND_URL}${propiedad.imagenes[imagenSeleccionada]?.url}`}
                                alt="principal"
                                className="w-full h-80 md:h-96 object-cover cursor-pointer select-none"
                                onClick={handleMainImageClick}
                                onContextMenu={handleMainImageClick}
                            />

                            {/* Thumbnails */}
                            <div className="p-4 bg-gray-50">
                                <PhotoProvider>
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                        {propiedad.imagenes.map((img, idx) => (
                                            <PhotoView
                                                key={idx}
                                                src={img.url.startsWith('http')
                                                    ? img.url
                                                    : `${import.meta.env.VITE_BACKEND_URL}${img.url}`}
                                            >
                                                <img
                                                    src={img.url.startsWith('http')
                                                        ? img.url
                                                        : `${import.meta.env.VITE_BACKEND_URL}${img.url}`}
                                                    alt={`thumbnail-${idx}`}
                                                    className={`w-full h-16 object-cover rounded-lg cursor-pointer transition-all ${imagenSeleccionada === idx
                                                        ? 'ring-2 ring-orange-500 scale-105'
                                                        : 'hover:ring-2 hover:ring-gray-300'
                                                        }`}
                                                    onClick={() => setImagenSeleccionada(idx)}
                                                />
                                            </PhotoView>
                                        ))}
                                    </div>
                                </PhotoProvider>
                            </div>
                        </div>
                    </div>

                    {/* 2. QUICK FEATURES BAR - Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        {propiedad.nro_habitaciones && (
                            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <BedDouble className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mb-1">{propiedad.nro_habitaciones}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Habitaciones</div>
                            </div>
                        )}
                        {propiedad.nro_banos && (
                            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Bath className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mb-1">{propiedad.nro_banos}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Baños</div>
                            </div>
                        )}
                        {propiedad.nro_parqueaderos && (
                            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Car className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mb-1">{propiedad.nro_parqueaderos}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Parqueaderos</div>
                            </div>
                        )}
                        {propiedad.area_construccion && (
                            <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Home className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mb-1">{Number(propiedad.area_construccion).toLocaleString('es-EC')}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                    {propiedad.unidad_area_construccion === 'ha' ? 'ha de Construcción' : 'm² de Construcción'}
                                </div>
                            </div>
                        )}
                        <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Maximize2 className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="text-3xl font-extrabold text-gray-900 mb-1">{Number(propiedad.area_terreno).toLocaleString('es-EC')}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                {propiedad.unidad_area_terreno === 'ha' ? 'ha de Terreno' : 'm² de Terreno'}
                            </div>
                        </div>
                    </div>

                    {/* 3. DESCRIPTION - Full Width */}
                    {propiedad.descripcion && (
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-orange-500">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descripción
                            </h3>
                            <div className="prose prose-base max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{propiedad.descripcion}</p>
                            </div>
                        </div>
                    )}

                    {/* 4. DETAILS + LOCATION GRID - 2 Columns on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Property Details */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Detalles de la Propiedad
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700 text-sm font-bold">Tipo:</span>
                                    <span className="font-normal text-gray-900 text-base">
                                        {propiedad.tipo_propiedad.replace(/_/g, ' ').charAt(0).toUpperCase() + propiedad.tipo_propiedad.replace(/_/g, ' ').slice(1)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700 text-sm font-bold">Estado:</span>
                                    <span className="font-normal text-gray-900 text-base">
                                        {propiedad.estado_propiedad.replace(/_/g, ' ').charAt(0).toUpperCase() + propiedad.estado_propiedad.replace(/_/g, ' ').slice(1)}
                                    </span>
                                </div>
                                {propiedad.anio_construccion && (
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-700 text-sm font-bold">Año:</span>
                                        <span className="font-normal text-gray-900 text-base">{propiedad.anio_construccion}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700 text-sm font-bold">Transacción:</span>
                                    <span className="font-normal text-gray-900 text-base">
                                        {propiedad.transaccion.charAt(0).toUpperCase() + propiedad.transaccion.slice(1)}
                                    </span>
                                </div>
                                {propiedad.codigo_interno && (
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-700 text-sm font-bold">Código:</span>
                                        <span className="font-normal text-gray-900 text-base">{propiedad.codigo_interno}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Ubicación
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700 text-sm font-bold">Provincia:</span>
                                    <span className="font-normal text-gray-900 text-base">{propiedad.provincia.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-700 text-sm font-bold">Ciudad:</span>
                                    <span className="font-normal text-gray-900 text-base">{propiedad.ciudad}</span>
                                </div>
                                <div className="flex justify-between items-start py-3 border-b border-gray-100">
                                    <span className="text-gray-700 text-sm font-bold">Dirección:</span>
                                    <span className="font-normal text-gray-900 text-base text-right max-w-[60%]">{propiedad.direccion}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. AMENITIES - Grid */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-orange-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Amenidades
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {propiedad.tiene_balcon && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Wind className="w-6 h-6 text-orange-500" />
                                    <span className="text-sm font-medium text-gray-700">Balcón</span>
                                </div>
                            )}
                            {propiedad.tiene_terraza && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Sun className="w-6 h-6 text-orange-500" />
                                    <span className="text-sm font-medium text-gray-700">Terraza</span>
                                </div>
                            )}
                            {propiedad.tiene_patio && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Trees className="w-6 h-6 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Patio</span>
                                </div>
                            )}
                            {propiedad.tiene_piscina && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Waves className="w-6 h-6 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">Piscina</span>
                                </div>
                            )}
                            {propiedad.tiene_bodega && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Package className="w-6 h-6 text-slate-600" />
                                    <span className="text-sm font-medium text-gray-700">Bodega</span>
                                </div>
                            )}
                            {propiedad.tiene_area_bbq && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Utensils className="w-6 h-6 text-red-500" />
                                    <span className="text-sm font-medium text-gray-700">Área BBQ</span>
                                </div>
                            )}
                            {propiedad.tiene_ascensor && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <ArrowUpDown className="w-6 h-6 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">Ascensor</span>
                                </div>
                            )}
                            {propiedad.tiene_seguridad && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                    <span className="text-sm font-medium text-gray-700">Seguridad 24/7</span>
                                </div>
                            )}
                            {propiedad.tiene_areas_comunales && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Users className="w-6 h-6 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">Áreas Comunales</span>
                                </div>
                            )}
                            {propiedad.tiene_gas_centralizado && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Flame className="w-6 h-6 text-amber-500" />
                                    <span className="text-sm font-medium text-gray-700">Gas Centralizado</span>
                                </div>
                            )}
                            {propiedad.tiene_cisterna && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Droplet className="w-6 h-6 text-cyan-600" />
                                    <span className="text-sm font-medium text-gray-700">Cisterna</span>
                                </div>
                            )}
                            {propiedad.tiene_lavanderia && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Shirt className="w-6 h-6 text-teal-600" />
                                    <span className="text-sm font-medium text-gray-700">Lavandería</span>
                                </div>
                            )}
                            {propiedad.amoblado && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                                    <Sofa className="w-6 h-6 text-amber-700" />
                                    <span className="text-sm font-medium text-gray-700">Amoblado</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6. CONTACT SECTION - Prominent, Full Width */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-orange-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            ¿Interesado en esta propiedad?
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/* WhatsApp Button formulario de contacto - COMENTADO
                            <div className="flex flex-col justify-center">
                                <a
                                    href={`https://wa.me/593981231304?text=${encodeURIComponent(`Hola, estoy interesado en la propiedad: ${propiedad.titulo} - ${window.location.href}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-6 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-100 group animate-pulse hover:animate-none"
                                >
                                    <svg className="w-8 h-8 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    <span className="text-lg">Contactar por WhatsApp</span>
                                </a>
                                <p className="text-center text-sm text-gray-600 mt-3">Respuesta inmediata</p>
                            </div>
                            */}

                            {/* Contact Form */}
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h4 className="font-semibold text-gray-900 mb-4">O envía un mensaje:</h4>
                                <form onSubmit={handleFormSubmit} className="space-y-3">
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombre completo"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        name="telefono"
                                        placeholder="Teléfono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                        required
                                    />
                                    <textarea
                                        name="mensaje"
                                        placeholder="Mensaje"
                                        value={formData.mensaje}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
                                        required
                                    ></textarea>
                                    <button
                                        type="submit"
                                        disabled={formSubmitted}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-gray-400 text-sm"
                                    >
                                        {formSubmitted ? 'Enviado ✓' : 'Enviar Mensaje'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Sección de Propiedades Similares - COMENTADO
                {propiedadesSimilares.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Propiedades Similares</h2>
                            <p className="text-gray-600">Otras opciones que podrían interesarte</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {propiedadesSimilares.map((prop) => (
                                <CardPropiedadPublica
                                    key={prop.id}
                                    propiedad={prop}
                                    isFavorito={favoritos.some(fav => fav.propiedadId === prop.id)}
                                    onFavoritoToggle={handleFavoritoToggle}
                                />
                            ))}
                        </div>
                    </div>
                )}
                */}

                {/* Sección de Recomendaciones Personalizadas */}
                <Recomendaciones
                    favoritos={favoritos}
                    onFavoritoToggle={handleFavoritoToggle}
                />

                {/* Sticky Mobile Price Bar - Only visible on mobile */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        {/* Price */}
                        <div>
                            <div className="text-xs text-gray-500">Precio</div>
                            <div className="text-xl font-bold text-gray-900">
                                {Number(propiedad.precio).toLocaleString('es-EC', {
                                    style: 'currency',
                                    currency: propiedad.moneda || 'USD',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                })}
                            </div>
                        </div>

{/* WhatsApp Button barra móvil sticky - COMENTADO
                        <a
                            href={`https://wa.me/593981231304?text=${encodeURIComponent(`Hola, estoy interesado en la propiedad: ${propiedad.titulo} - ${window.location.href}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Contactar
                        </a>
                        */}
                    </div>
                </div>
            </div>
        </LayoutPublic>
    );
}