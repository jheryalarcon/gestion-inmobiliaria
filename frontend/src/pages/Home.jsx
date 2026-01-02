import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LayoutPublic from '../components/LayoutPublic';
import CardPropiedadPublica from '../components/CardPropiedadPublica';
import Recomendaciones from '../components/Recomendaciones';
import Spinner from '../components/Spinner';

export default function Home() {
    const navigate = useNavigate();
    const [propiedades, setPropiedades] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [usuarioCargando, setUsuarioCargando] = useState(true);


    useEffect(() => {
        cargarPropiedades();
        cargarFavoritos();
        cargarUsuario();

        // Escuchar cambios de autenticación
        const handleAuthChange = () => {
            setUsuarioCargando(true);
            cargarUsuario();
            cargarFavoritos();
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const cargarUsuario = () => {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');

        if (token && usuarioData) {
            try {
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
                console.error('Error al cargar usuario:', error);
                setUsuario(null);
            }
        } else {
            setUsuario(null);
        }
        setUsuarioCargando(false);
    };

    const cargarPropiedades = async () => {
        try {
            setCargando(true);

            // Cargar solo las últimas 6 propiedades para la página principal
            const response = await axios.get('http://localhost:3000/api/propiedades/publicas?limit=6');

            setPropiedades(response.data);
        } catch (error) {
            setError('Error al cargar las propiedades. Por favor, intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const cargarFavoritos = async () => {
        const token = localStorage.getItem('token');
        const usuario = token ? JSON.parse(localStorage.getItem('usuario')) : null;

        if (token && usuario && usuario.rol === 'cliente') {
            try {
                const response = await axios.get('http://localhost:3000/api/favoritos', {
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
            // Agregar a favoritos
            setFavoritos(prev => [...prev, { propiedadId }]);
        } else {
            // Remover de favoritos
            setFavoritos(prev => prev.filter(fav => fav.propiedadId !== propiedadId));
        }
    };

    // Función para ir al inicio de la página
    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    return (
        <LayoutPublic>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section - Split Layout */}
                <section className="relative bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[550px]">
                            {/* Left Content */}
                            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10 lg:py-16 order-2 lg:order-1 relative z-10">
                                <div className="max-w-xl">
                                    {usuario ? (
                                        <div className="mb-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 uppercase tracking-wider">
                                                👋 Bienvenido de vuelta
                                            </span>
                                            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                                                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">{usuario.name || 'Usuario'}</span>
                                            </h1>
                                            <p className="mt-4 text-lg text-gray-500">
                                                Continúa explorando propiedades exclusivas seleccionadas para ti.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mb-8">

                                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-none mb-6">
                                                Encuentra tu <br />
                                                <span className="text-slate-900 relative">
                                                    Hogar Ideal
                                                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-500 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7501 2.49994 132.5 -2.50004 198 3.99996" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                                                </span>
                                            </h1>
                                            <p className="text-lg text-gray-500 leading-relaxed max-w-lg mb-12">
                                                Descubre una colección exclusiva de propiedades en las zonas más prestigiosas. Tu próximo capítulo comienza aquí.
                                            </p>
                                        </div>
                                    )}



                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => {
                                                navigate('/propiedades');
                                                scrollToTop();
                                            }}
                                            className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 flex items-center"
                                        >
                                            Explorar Propiedades
                                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </button>
                                        {!usuario && (
                                            <Link
                                                to="/registro"
                                                className="px-6 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center"
                                            >
                                                Crear Cuenta
                                            </Link>
                                        )}
                                    </div>

                                    {/* Stats / Trust */}

                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="relative h-[400px] lg:h-auto order-1 lg:order-2">
                                <div className="absolute inset-0 bg-orange-100 overflow-hidden"> {/* Placeholder background */}
                                    <img
                                        src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2600&auto=format&fit=crop"
                                        alt="Modern Home Interior"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Gradient overlay for better blend on mobile */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 lg:bg-gradient-to-l lg:from-transparent lg:to-white/5"></div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-xs animate-fade-in-up">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Estado del Mercado</p>
                                            <p className="font-bold text-gray-900">Alta Demanda</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="py-20 bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <div className="text-center mb-12">
                            <span className="text-orange-600 font-bold tracking-wider uppercase text-xs mb-2 block">Nuestros Valores</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">¿Por qué elegirnos?</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
                                Experiencia, confianza y la mejor tecnología al servicio de tu inversión inmobiliaria.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                                    title: "Propiedades Verificadas",
                                    desc: "Cada propiedad es inspeccionada rigurosamente para garantir tu seguridad y tranquilidad."
                                },
                                {
                                    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z",
                                    title: "Agentes Expertos",
                                    desc: "Nuestro equipo de profesionales certificados te acompañará en cada paso del proceso."
                                },
                                {
                                    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                                    title: "Precio Justo",
                                    desc: "Valoraciones precisas basadas en datos del mercado actual para garantizar la mejor oferta."
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group text-center border border-slate-100 shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Últimas Propiedades Section */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
                            <div className="text-center md:text-left">
                                <span className="text-orange-600 font-bold tracking-wider uppercase text-xs mb-2 block">Catálogo Exclusivo</span>
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                    Propiedades Destacadas
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    navigate('/propiedades');
                                    scrollToTop();
                                }}
                                className="hidden md:flex items-center text-slate-600 font-semibold hover:text-orange-600 transition-colors group pb-1"
                            >
                                Ver todas las propiedades
                                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>

                        {cargando ? (
                            <div className="flex justify-center items-center py-20">
                                <Spinner size="lg" color="orange" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-600 text-lg mb-4">{error}</p>
                                <button
                                    onClick={cargarPropiedades}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : propiedades.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg">No hay propiedades disponibles en este momento.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {propiedades.map((prop) => (
                                        <CardPropiedadPublica
                                            key={prop.id}
                                            propiedad={prop}
                                            favoritos={favoritos}
                                            onFavoritoToggle={handleFavoritoToggle}
                                        />
                                    ))}
                                </div>

                                {/* Ver más propiedades */}
                                <div className="text-center mt-12">
                                    <button
                                        onClick={() => {
                                            navigate('/propiedades');
                                            scrollToTop();
                                        }}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition shadow-lg hover:shadow-xl"
                                    >
                                        Ver todas las propiedades
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>



                {/* Sección de Recomendaciones */}
                <Recomendaciones
                    favoritos={favoritos}
                    onFavoritoToggle={handleFavoritoToggle}
                />
            </div>
        </LayoutPublic>
    );
}