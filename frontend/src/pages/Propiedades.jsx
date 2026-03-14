import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LayoutPublic from '../components/LayoutPublic';
import CardPropiedadPublica from '../components/CardPropiedadPublica';
import FiltrosPropiedades from '../components/FiltrosPropiedades';
import Spinner from '../components/Spinner';
import Recomendaciones from '../components/Recomendaciones';

export default function Propiedades() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [propiedades, setPropiedades] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtros, setFiltros] = useState({
        tipo_propiedad: '',
        ciudad: searchParams.get('ubicacion') || '',
        minPrecio: '',
        maxPrecio: '',
        nro_habitaciones: '',
        nro_banos: '',
        transaccion: '',
        parqueaderos: '',
        nro_pisos: '',
        areaConstruccionMin: '',
        areaConstruccionMax: '',
        areaTerrenoMin: '',
        areaTerrenoMax: '',
        estadoFisico: '',
        anioMin: '',
        orden: 'recientes'
    });
    const [busqueda, setBusqueda] = useState('');

    const hayFiltros = !!(busqueda || filtros.tipo_propiedad || filtros.ciudad ||
        filtros.transaccion || filtros.minPrecio || filtros.maxPrecio ||
        filtros.nro_habitaciones || filtros.nro_banos || filtros.parqueaderos ||
        filtros.nro_pisos || filtros.areaConstruccionMin || filtros.areaTerrenoMin ||
        filtros.estadoFisico || filtros.anioMin);

    useEffect(() => {
        // Cargar favoritos al inicio
        cargarFavoritos();
        // Cargar propiedades se maneja en el otro useEffect
    }, []);

    // Efecto para aplicar filtros cuando cambie la búsqueda o los filtros

    // Efecto para scroll al inicio cuando se navega a esta página
    useEffect(() => {
        if (location.hash === '#top') {
            window.scrollTo(0, 0);
        }
    }, [location]);

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            cargarPropiedades();
        }, 500); // Esperar 500ms después de que el usuario deje de escribir/filtrar

        return () => clearTimeout(timer);
    }, [busqueda, filtros]); // Se ejecuta cuando cambian búsqueda o filtros

    const cargarPropiedades = async () => {
        try {
            setCargando(true);
            setError('');

            // Mapear filtros a snake_case para el backend y limpiar vacíos
            const params = {};
            if (busqueda) params.search = busqueda;
            if (filtros.tipo_propiedad) params.tipo_propiedad = filtros.tipo_propiedad;
            if (filtros.ciudad) params.ciudad = filtros.ciudad;
            if (filtros.transaccion) params.transaccion = filtros.transaccion;
            if (filtros.minPrecio) params.minPrecio = filtros.minPrecio;
            if (filtros.maxPrecio) params.maxPrecio = filtros.maxPrecio;
            if (filtros.nro_habitaciones) params.nro_habitaciones = filtros.nro_habitaciones;
            if (filtros.nro_banos) params.nro_banos = filtros.nro_banos;
            if (filtros.parqueaderos) params.parqueaderos = filtros.parqueaderos;
            if (filtros.nro_pisos) params.nro_pisos = filtros.nro_pisos;
            if (filtros.areaConstruccionMin) params.area_construccion_min = filtros.areaConstruccionMin;
            if (filtros.areaConstruccionMax) params.area_construccion_max = filtros.areaConstruccionMax;
            if (filtros.anioMin) params.anioMin = filtros.anioMin;
            if (filtros.estadoFisico) params.estadoFisico = filtros.estadoFisico;

            // Área terreno con conversión de unidades si es necesario
            if (filtros.areaTerrenoMin) {
                const factor = filtros.unidadTerreno === 'ha' ? 10000 : 1;
                params.area_terreno_min = Number(filtros.areaTerrenoMin) * factor;
            }
            if (filtros.areaTerrenoMax) {
                const factor = filtros.unidadTerreno === 'ha' ? 10000 : 1;
                params.area_terreno_max = Number(filtros.areaTerrenoMax) * factor;
            }

            // Amenidades
            const amenidades = [
                'tiene_piscina', 'tiene_seguridad', 'tiene_ascensor', 'tiene_area_bbq',
                'tiene_terraza', 'tiene_balcon', 'tiene_patio', 'tiene_bodega',
                'tiene_areas_comunales', 'tiene_gas_centralizado', 'tiene_cisterna',
                'tiene_lavanderia', 'amoblado'
            ];
            amenidades.forEach(am => {
                if (filtros[am]) params[am] = true;
            });

            // Ordenamiento
            if (filtros.orden) {
                // Mapear el formato del frontend al backend
                if (filtros.orden === 'recientes') {
                    params.sortBy = 'createdAt';
                    params.sortOrder = 'desc';
                } else if (filtros.orden === 'antiguas') {
                    params.sortBy = 'createdAt';
                    params.sortOrder = 'asc';
                } else if (filtros.orden === 'precio_asc') {
                    params.sortBy = 'precio';
                    params.sortOrder = 'asc';
                } else if (filtros.orden === 'precio_desc') {
                    params.sortBy = 'precio';
                    params.sortOrder = 'desc';
                } else if (filtros.orden === 'titulo_asc') {
                    params.sortBy = 'titulo';
                    params.sortOrder = 'asc';
                } else if (filtros.orden === 'titulo_desc') {
                    params.sortBy = 'titulo';
                    params.sortOrder = 'desc';
                }
            }

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades/publicas`, { params });

            setPropiedades(response.data);
        } catch (error) {
            console.error(error);
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
            // Agregar a favoritos
            setFavoritos(prev => [...prev, { propiedadId }]);
        } else {
            // Remover de favoritos
            setFavoritos(prev => prev.filter(fav => fav.propiedadId !== propiedadId));
        }
    };

    return (
        <LayoutPublic>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <section id="top" className="bg-white pt-24 pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="text-orange-600 font-bold tracking-wider uppercase text-xs mb-3 block">
                                Catálogo Exclusivo
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                                Encuentra tu próximo hogar
                            </h1>
                            <p className="text-lg text-gray-500 font-light leading-relaxed">
                                Explora nuestra selección de propiedades premium. Utiliza los filtros para encontrar exactamente lo que buscas.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Propiedades Section */}
                <section className="pb-20 pt-4">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Filtros horizontales con búsqueda integrada */}
                        <FiltrosPropiedades
                            filtros={filtros}
                            setFiltros={setFiltros}
                            onFiltrar={() => { }} // Ya no es necesario, lo maneja el useEffect
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                        />

                        {/* Resultados */}
                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-gray-600">
                                {propiedades.length} propiedad{propiedades.length !== 1 ? 'es' : ''} encontrada{propiedades.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {cargando ? (
                            <div className="flex justify-center items-center py-20">
                                <Spinner size="md" text="Cargando propiedades..." />
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
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mx-auto max-w-2xl">
                                <div className="mb-6 flex justify-center">
                                    <div className="bg-gray-50 p-4 rounded-full">
                                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {hayFiltros ? 'No encontramos coincidencias' : 'Aún no hay propiedades disponibles'}
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    {hayFiltros
                                        ? 'Intenta ajustar los filtros o buscar términos más generales.'
                                        : 'Pronto publicaremos nuevas propiedades. ¡Vuelve a visitarnos!'}
                                </p>
                                {hayFiltros && (
                                    <button
                                        onClick={() => {
                                            setFiltros({
                                                tipo_propiedad: '', ciudad: '', minPrecio: '', maxPrecio: '',
                                                nro_habitaciones: '', nro_banos: '', transaccion: '',
                                                parqueaderos: '', nro_pisos: '', areaConstruccionMin: '',
                                                areaConstruccionMax: '', areaTerrenoMin: '', areaTerrenoMax: '',
                                                estadoFisico: '', anioMin: '', tiene_piscina: false,
                                                tiene_seguridad: false, tiene_ascensor: false,
                                                tiene_area_bbq: false, tiene_terraza: false, unidadTerreno: 'm2'
                                            });
                                            setBusqueda('');
                                            window.scrollTo(0, 0);
                                        }}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        Ver todas las propiedades
                                    </button>
                                )}
                            </div>
                        ) : (
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
