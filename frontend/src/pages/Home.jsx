import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LayoutPublic from '../components/LayoutPublic';
import CardPropiedadPublica from '../components/CardPropiedadPublica';
import Recomendaciones from '../components/Recomendaciones';

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
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        {usuarioCargando ? (
                            <>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                    Cargando...
                                </h1>
                                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                                    Preparando tu experiencia personalizada
                                </p>
                            </>
                        ) : usuario ? (
                            <>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                    ¡Bienvenido, {usuario.name || usuario.email || 'Usuario'}!
                                </h1>
                                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                                    Explora las mejores propiedades y guarda tus favoritos
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                    Encuentra tu hogar ideal
                                </h1>
                                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                                    Las mejores propiedades en las ubicaciones más exclusivas
                                </p>
                            </>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => {
                                    navigate('/propiedades');
                                    scrollToTop();
                                }}
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                            >
                                Ver todas las propiedades
                            </button>
                            {usuario ? (
                                <button 
                                    onClick={() => {
                                        navigate('/favoritos');
                                        scrollToTop();
                                    }}
                                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
                                >
                                    Mis Favoritos
                                </button>
                            ) : (
                                <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                                    Contactar
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

            {/* Últimas Propiedades Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Propiedades destacadas
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Descubre nuestras propiedades más recientes
                        </p>
                    </div>

                    {cargando ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 text-lg mb-4">{error}</p>
                            <button 
                                onClick={cargarPropiedades}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
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
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Ver todas las propiedades
                            </button>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section - Solo para usuarios no logueados */}
            {!usuario && (
                <section className="bg-gray-100 py-16">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            ¿Buscas algo específico?
                        </h3>
                        <p className="text-gray-600 mb-8">
                            Regístrate para guardar tus propiedades favoritas y recibir notificaciones de nuevas ofertas
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/registro" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                                Registrarse
                            </Link>
                            <Link to="/login" className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition">
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Sección de Recomendaciones */}
            <Recomendaciones 
                favoritos={favoritos}
                onFavoritoToggle={handleFavoritoToggle}
            />
            </div>
        </LayoutPublic>
    );
}