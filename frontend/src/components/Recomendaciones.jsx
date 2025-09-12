import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CardPropiedadPublica from './CardPropiedadPublica';
import { toast } from 'sonner';

export default function Recomendaciones({ favoritos, onFavoritoToggle }) {
    const [recomendaciones, setRecomendaciones] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [tieneFavoritos, setTieneFavoritos] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        cargarRecomendaciones();
    }, []);

    // Actualizar recomendaciones cuando cambien los favoritos
    useEffect(() => {
        if (favoritos.length > 0) {
            cargarRecomendaciones();
        }
    }, [favoritos.length]);

    // Ajustar número de elementos por vista según el tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerView(1); // Mobile: 1 elemento
            } else if (window.innerWidth < 1024) {
                setItemsPerView(2); // Tablet: 2 elementos
            } else {
                setItemsPerView(3); // Desktop: 3 elementos
            }
        };

        handleResize(); // Establecer valor inicial
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const cargarRecomendaciones = async () => {
        const token = localStorage.getItem('token');
        const usuario = token ? JSON.parse(localStorage.getItem('usuario')) : null;
        
        if (!token || !usuario || usuario.rol !== 'cliente') {
            return; // Solo mostrar recomendaciones a clientes logueados
        }

        try {
            setCargando(true);
            const response = await axios.get('http://localhost:3000/api/propiedades/recomendaciones?limit=6&k=3', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // La nueva respuesta incluye recomendaciones, mensaje y metadatos
            setRecomendaciones(response.data.recomendaciones || []);
            setMensaje(response.data.mensaje || '');
            setTieneFavoritos(response.data.tieneFavoritos || false);
            
            // Mostrar mensaje informativo si no hay recomendaciones
            if (response.data.mensaje && response.data.recomendaciones.length === 0) {
                toast.info(response.data.mensaje);
            }
        } catch (error) {
            console.error('Error al cargar recomendaciones:', error);
            toast.error('Error al cargar recomendaciones');
        } finally {
            setCargando(false);
        }
    };

    // Funciones de navegación del carrusel
    const maxSlides = Math.max(0, recomendaciones.length - itemsPerView);
    
    const nextSlide = () => {
        setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
    };

    // Resetear slide cuando cambien las recomendaciones
    useEffect(() => {
        setCurrentSlide(0);
    }, [recomendaciones.length]);

    // Funciones para manejar drag/touch
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX;
        const walk = (x - startX) * 2; // Velocidad del scroll
        
        // Determinar si debe cambiar de slide
        if (walk > 50 && currentSlide > 0) {
            prevSlide();
            setIsDragging(false);
        } else if (walk < -50 && currentSlide < maxSlides) {
            nextSlide();
            setIsDragging(false);
        }
    };

    // Touch events para dispositivos móviles
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX;
        const walk = (x - startX) * 2;
        
        if (walk > 50 && currentSlide > 0) {
            prevSlide();
            setIsDragging(false);
        } else if (walk < -50 && currentSlide < maxSlides) {
            nextSlide();
            setIsDragging(false);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Navegación con teclado
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' && currentSlide > 0) {
            prevSlide();
        } else if (e.key === 'ArrowRight' && currentSlide < maxSlides) {
            nextSlide();
        }
    };

    // Efecto para navegación con teclado
    useEffect(() => {
        if (recomendaciones.length > 0) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [currentSlide, maxSlides]);

    // No mostrar nada si no hay token o no es cliente
    const token = localStorage.getItem('token');
    const usuario = token ? JSON.parse(localStorage.getItem('usuario')) : null;
    
    if (!token || !usuario || usuario.rol !== 'cliente') {
        return null;
    }

    if (cargando) {
        return (
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Recomendaciones para ti
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Analizando tus favoritos con algoritmo KNN...
                        </p>
                    </div>
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </section>
        );
    }

    // Si no tiene favoritos, mostrar mensaje informativo
    if (!tieneFavoritos) {
        return (
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Recomendaciones personalizadas
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                            {mensaje || "Aún no podemos recomendarte propiedades. Guarda algunas favoritas primero"}
                        </p>
                        <button 
                            onClick={() => navigate('/propiedades')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Explorar propiedades
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Si tiene favoritos pero no hay recomendaciones
    if (recomendaciones.length === 0) {
        return (
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            No encontramos recomendaciones
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                            {mensaje || "No encontramos propiedades similares a tus favoritas"}
                        </p>
                        <button 
                            onClick={() => navigate('/propiedades')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Ver todas las propiedades
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Recomendaciones para ti
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Basado en tus propiedades favoritas, creemos que estas opciones te pueden interesar
                    </p>
                </div>

                {/* Carrusel de recomendaciones */}
                <div 
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    tabIndex={0}
                    role="region"
                    aria-label="Carrusel de recomendaciones"
                >
                    {/* Sombra izquierda cuando no está en el primer slide */}
                    {currentSlide > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none"></div>
                    )}
                    
                    {/* Sombra derecha cuando no está en el último slide */}
                    {currentSlide < maxSlides && (
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none"></div>
                    )}
                    
                    <div className="overflow-hidden">
                        <div 
                            className={`flex gap-6 transition-transform duration-300 ease-in-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{ transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)` }}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {recomendaciones.map((propiedad) => (
                                <div key={propiedad.id} className="flex-shrink-0" style={{ width: `${100 / itemsPerView}%` }}>
                                    <CardPropiedadPublica 
                                        propiedad={propiedad}
                                        favoritos={favoritos}
                                        onFavoritoToggle={onFavoritoToggle}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botones de navegación mejorados */}
                    {recomendaciones.length > itemsPerView && (
                        <>
                            <button
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 hover:text-blue-600 disabled:text-gray-400 w-14 h-14 rounded-full shadow-xl border border-gray-200 hover:border-blue-300 disabled:border-gray-200 flex items-center justify-center transition-all duration-300 z-20 group"
                                aria-label="Anterior"
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSlide}
                                disabled={currentSlide >= maxSlides}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 hover:text-blue-600 disabled:text-gray-400 w-14 h-14 rounded-full shadow-xl border border-gray-200 hover:border-blue-300 disabled:border-gray-200 flex items-center justify-center transition-all duration-300 z-20 group"
                                aria-label="Siguiente"
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Indicadores de puntos mejorados */}
                    {recomendaciones.length > itemsPerView && (
                        <div className="flex justify-center mt-10 space-x-3">
                            {Array.from({ length: maxSlides + 1 }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        currentSlide === index 
                                            ? 'bg-blue-600 scale-125 shadow-lg' 
                                            : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                                    }`}
                                    aria-label={`Ir al slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
