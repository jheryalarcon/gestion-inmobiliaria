import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import LayoutPublic from '../components/LayoutPublic';
import CardPropiedadPublica from '../components/CardPropiedadPublica';
import FiltrosPropiedades from '../components/FiltrosPropiedades';
import Spinner from '../components/Spinner';
import Recomendaciones from '../components/Recomendaciones';

export default function Propiedades() {
    const location = useLocation();
    const [propiedades, setPropiedades] = useState([]);
    const [propiedadesFiltradas, setPropiedadesFiltradas] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [filtros, setFiltros] = useState({
        tipo_propiedad: '',
        ciudad: '',
        minPrecio: '',
        maxPrecio: '',
        nro_habitaciones: '',
        nro_banos: '',
        transaccion: ''
    });
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarPropiedades();
        cargarFavoritos();
    }, []);

    // Efecto para aplicar filtros cuando cambie la búsqueda
    useEffect(() => {
        aplicarFiltros(filtros);
    }, [busqueda, filtros, propiedades]);

    // Efecto para scroll al inicio cuando se navega a esta página
    useEffect(() => {
        if (location.hash === '#top') {
            window.scrollTo(0, 0);
        }
    }, [location]);

    const cargarPropiedades = async () => {
        try {
            setCargando(true);
            
            const response = await axios.get('http://localhost:3000/api/propiedades/publicas');
            
            setPropiedades(response.data);
            setPropiedadesFiltradas(response.data);
        } catch (error) {
            setError('Error al cargar las propiedades. Por favor, intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const aplicarFiltros = (nuevosFiltros) => {
        let propiedadesFiltradas = [...propiedades];

        // Filtrar por búsqueda (título)
        if (busqueda.trim()) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => p.titulo.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        // Filtrar por tipo de propiedad
        if (nuevosFiltros.tipo_propiedad) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => p.tipo_propiedad === nuevosFiltros.tipo_propiedad
            );
        }

        // Filtrar por ciudad
        if (nuevosFiltros.ciudad) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => p.ciudad.toLowerCase().includes(nuevosFiltros.ciudad.toLowerCase())
            );
        }

        // Filtrar por transacción
        if (nuevosFiltros.transaccion) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => p.transaccion === nuevosFiltros.transaccion
            );
        }

        // Filtrar por precio mínimo
        if (nuevosFiltros.minPrecio) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => Number(p.precio) >= Number(nuevosFiltros.minPrecio)
            );
        }

        // Filtrar por precio máximo
        if (nuevosFiltros.maxPrecio) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => Number(p.precio) <= Number(nuevosFiltros.maxPrecio)
            );
        }

        // Filtrar por número de habitaciones
        if (nuevosFiltros.nro_habitaciones) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => p.nro_habitaciones && p.nro_habitaciones >= Number(nuevosFiltros.nro_habitaciones)
            );
        }

        // Filtrar por número de baños
        if (nuevosFiltros.nro_banos) {
            propiedadesFiltradas = propiedadesFiltradas.filter(
                p => p.nro_banos && p.nro_banos >= Number(nuevosFiltros.nro_banos)
            );
        }

        setPropiedadesFiltradas(propiedadesFiltradas);
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

    return (
        <LayoutPublic>
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <section id="top" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Propiedades disponibles
                        </h1>
                        <p className="text-xl text-blue-100">
                            Encuentra tu inmueble ideal con nuestros filtros avanzados
                        </p>
                    </div>
                </section>

            {/* Propiedades Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Filtros horizontales con búsqueda integrada */}
                    <FiltrosPropiedades 
                        filtros={filtros}
                        setFiltros={setFiltros}
                        onFiltrar={aplicarFiltros}
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                    />

                    {/* Resultados */}
                    <div className="mb-6 flex justify-between items-center">
                        <p className="text-gray-600">
                            {propiedadesFiltradas.length} propiedad{propiedadesFiltradas.length !== 1 ? 'es' : ''} encontrada{propiedadesFiltradas.length !== 1 ? 's' : ''}
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
                    ) : propiedadesFiltradas.length === 0 ? (
                            <div className="text-center py-20">
                            <p className="text-gray-500 text-lg mb-4">
                                No se encontraron propiedades con los filtros seleccionados.
                            </p>
                            <button 
                                onClick={() => {
                                    setFiltros({
                                        tipo_propiedad: '',
                                        ciudad: '',
                                        minPrecio: '',
                                        maxPrecio: '',
                                        nro_habitaciones: '',
                                        nro_banos: '',
                                        transaccion: ''
                                    });
                                    setBusqueda('');
                                    setPropiedadesFiltradas(propiedades);
                                    window.scrollTo(0, 0); // Scroll al inicio
                                }}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Ver todas las propiedades
                            </button>
                            </div>
                        ) : (
                        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {propiedadesFiltradas.map((prop) => (
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
