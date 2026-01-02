import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import LayoutPublic from '../components/LayoutPublic';
import CardPropiedadPublica from '../components/CardPropiedadPublica';
import Spinner from '../components/Spinner';
import Recomendaciones from '../components/Recomendaciones';

export default function MisFavoritos() {
    const navigate = useNavigate();
    const [favoritos, setFavoritos] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [ordenarPor, setOrdenarPor] = useState('fecha');
    const [orden, setOrden] = useState('desc');

    // Verificar autenticación
    const token = localStorage.getItem('token');
    const usuario = token ? JSON.parse(localStorage.getItem('usuario')) : null;

    useEffect(() => {
        // Verificar autenticación
        if (!token || !usuario || usuario.rol !== 'cliente') {
            toast.error('Debes iniciar sesión para ver tus favoritos');
            navigate('/login');
            return;
        }
        // Cargar favoritos si está autenticado
        cargarFavoritos();
    }, []); // Solo ejecutar una vez al montar

    const cargarFavoritos = async () => {
        try {
            setError('');

            const response = await axios.get('http://localhost:3000/api/favoritos', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Extraer las propiedades de los favoritos y verificar que existan
            const propiedadesFavoritas = response.data
                .filter(fav => fav.propiedad)
                .map(fav => fav.propiedad);

            setFavoritos(response.data);
            setPropiedades(propiedadesFavoritas);
        } catch (error) {
            setError('Error al cargar tus favoritos. Por favor, intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const handleFavoritoToggle = (propiedadId, isFavorito) => {
        if (!isFavorito) {
            setFavoritos(prev => prev.filter(fav => fav.propiedadId !== propiedadId));
            setPropiedades(prev => prev.filter(prop => prop.id !== propiedadId));
        }
    };

    const ordenarPropiedades = (propiedades) => {
        return [...propiedades].sort((a, b) => {
            let valorA, valorB;

            switch (ordenarPor) {
                case 'precio':
                    valorA = Number(a.precio);
                    valorB = Number(b.precio);
                    break;
                case 'titulo':
                    valorA = a.titulo.toLowerCase();
                    valorB = b.titulo.toLowerCase();
                    break;
                case 'fecha':
                default:
                    valorA = new Date(a.createdAt);
                    valorB = new Date(b.createdAt);
                    break;
            }

            if (orden === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });
    };

    const propiedadesOrdenadas = ordenarPropiedades(propiedades);

    return (
        <LayoutPublic>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section con diseño mejorado */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                                <svg className="h-12 w-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Mis Favoritos
                        </h1>
                        <div className="flex justify-center items-center space-x-4 text-gray-300">
                            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Acceso rápido a tus propiedades preferidas</span>
                        </div>
                    </div>
                </div>

                {/* Favoritos Section */}
                <section className="py-4">
                    <div className="max-w-7xl mx-auto px-4">
                        {cargando ? (
                            <div className="flex flex-col justify-center items-center py-20">
                                <Spinner size="lg" text="Cargando tus favoritos..." />
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <div className="mb-6">
                                    <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <p className="text-red-600 text-lg mb-4">{error}</p>
                                <button
                                    onClick={cargarFavoritos}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition shadow-lg font-medium"
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        ) : propiedades.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="mb-6">
                                    <div className="relative mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                                        <svg className="h-10 w-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    No tienes favoritos aún
                                </h3>
                                <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto">
                                    Guarda propiedades que te interesen haciendo clic en el corazón.
                                </p>
                                <button
                                    onClick={() => navigate('/propiedades')}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 transition shadow-lg font-semibold flex items-center gap-2 mx-auto"
                                >
                                    Ver Propiedades
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Header con estadísticas y ordenamiento */}
                                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="mb-4 md:mb-0">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                Tus Propiedades Favoritas
                                            </h2>
                                            <div className="flex items-center space-x-4 text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                    </svg>
                                                    <span className="font-semibold">{propiedades.length} propiedad{propiedades.length !== 1 ? 'es' : ''}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Guardadas recientemente</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Controles de ordenamiento */}
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                                                <select
                                                    value={ordenarPor}
                                                    onChange={(e) => setOrdenarPor(e.target.value)}
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                >
                                                    <option value="fecha">Fecha</option>
                                                    <option value="precio">Precio</option>
                                                    <option value="titulo">Título</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                                                title={orden === 'asc' ? 'Orden descendente' : 'Orden ascendente'}
                                            >
                                                <svg className={`w-5 h-5 text-gray-600 transition-transform ${orden === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid de propiedades favoritas */}
                                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {propiedadesOrdenadas.map((propiedad) => (
                                        <CardPropiedadPublica
                                            key={propiedad.id}
                                            propiedad={propiedad}
                                            favoritos={favoritos}
                                            onFavoritoToggle={handleFavoritoToggle}
                                        />
                                    ))}
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
