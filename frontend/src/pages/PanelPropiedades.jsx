import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import FiltroPropiedades from '../components/FiltroPropiedades';
import CardPropiedad from '../components/CardPropiedad';
import ModalConfirmarEliminar from '../components/ModalConfirmarEliminar';

export default function PanelPropiedades() {
    const [usuario, setUsuario] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [propiedades, setPropiedades] = useState([]);
    const [agentes, setAgentes] = useState([]);

    // Inicializar estado desde URL
    const [busqueda, setBusqueda] = useState(searchParams.get('search') || '');
    const [filtros, setFiltros] = useState(() => ({
        estado: searchParams.get('estado') || '',
        transaccion: searchParams.get('transaccion') || '',
        tipo: searchParams.get('tipo') || '',
        ciudad: searchParams.get('ciudad') || '',
        precioMin: searchParams.get('precioMin') || '',
        precioMax: searchParams.get('precioMax') || '',
        habitaciones: searchParams.get('habitaciones') || '',
        banos: searchParams.get('banos') || '',
        areaConstruccionMin: searchParams.get('areaConstruccionMin') || '',
        areaConstruccionMax: searchParams.get('areaConstruccionMax') || '',
        areaTerrenoMin: searchParams.get('areaTerrenoMin') || '',
        areaTerrenoMax: searchParams.get('areaTerrenoMax') || '',
        parqueaderos: searchParams.get('parqueaderos') || '',
        pisos: searchParams.get('pisos') || '',
        anioMin: searchParams.get('anioMin') || '',
        estadoFisico: searchParams.get('estadoFisico') || '',
        sector: searchParams.get('sector') || '',
        orden: searchParams.get('orden') || 'recientes',
        // Filtros de Amenidades
        tiene_piscina: searchParams.get('tiene_piscina') === 'true',
        tiene_seguridad: searchParams.get('tiene_seguridad') === 'true',
        tiene_ascensor: searchParams.get('tiene_ascensor') === 'true',
        tiene_area_bbq: searchParams.get('tiene_area_bbq') === 'true',
        tiene_terraza: searchParams.get('tiene_terraza') === 'true',
        tiene_balcon: searchParams.get('tiene_balcon') === 'true',
        tiene_patio: searchParams.get('tiene_patio') === 'true',
        tiene_bodega: searchParams.get('tiene_bodega') === 'true',
        tiene_areas_comunales: searchParams.get('tiene_areas_comunales') === 'true',
        tiene_gas_centralizado: searchParams.get('tiene_gas_centralizado') === 'true',
        tiene_cisterna: searchParams.get('tiene_cisterna') === 'true',
        tiene_lavanderia: searchParams.get('tiene_lavanderia') === 'true',
        amoblado: searchParams.get('amoblado') === 'true',
        // Filtros de Fecha
        fechaDesde: searchParams.get('fechaDesde') || '',
        fechaHasta: searchParams.get('fechaHasta') || ''
    }));
    const [viewMode, setViewMode] = useState('all'); // 'all' | 'mine'
    const [selectedAgent, setSelectedAgent] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Estado de Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);

    const [viewType, setViewType] = useState('grid'); // 'grid' | 'list'
    const [propiedadAEliminar, setPropiedadAEliminar] = useState(null);

    // Reiniciar página al cambiar filtros principales o tipo de vista
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode, selectedAgent, viewType, busqueda, filtros]);

    // Sincronizar URL con filtros (Silent Update)
    useEffect(() => {
        const params = {};
        if (busqueda) params.search = busqueda;

        Object.entries(filtros).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'recientes') {
                params[key] = value;
            } else if (key === 'orden' && value !== 'recientes') {
                params[key] = value;
            }
        });

        setSearchParams(params, { replace: true });
    }, [busqueda, filtros, setSearchParams]);

    // Efecto separado para cargar agentes (Solo Admin, run once)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            if (decoded.rol === 'admin') {
                axios.get('http://localhost:3000/api/usuarios/agentes', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                    .then(res => setAgentes(res.data))
                    .catch(err => console.error('Error al cargar agentes:', err));
            }
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUsuario(decoded);
            setMensaje('Cargando propiedades...');

            // Debounce simple para búsquedas de texto
            const timeoutId = setTimeout(() => {
                // Preparar parámetros de paginación y filtrado backend
                const params = {
                    page: currentPage,
                    limit: 9, // tarjetas por página
                    includeAgente: true,
                    // Filtros globales
                    ...(busqueda && { search: busqueda }),
                    ...(filtros.estado && { estado: filtros.estado }),
                    ...(filtros.transaccion && { transaccion: filtros.transaccion }),
                    ...(filtros.tipo && { tipo: filtros.tipo }),
                    ...(filtros.ciudad && { ciudad: filtros.ciudad }),
                    ...(filtros.precioMin && { precioMin: filtros.precioMin }),
                    ...(filtros.precioMax && { precioMax: filtros.precioMax }),
                    ...(filtros.habitaciones && { habitaciones: filtros.habitaciones }),
                    ...(filtros.banos && { banos: filtros.banos }),
                    ...(filtros.areaConstruccionMin && { areaConstruccionMin: filtros.areaConstruccionMin }),
                    ...(filtros.areaConstruccionMax && { areaConstruccionMax: filtros.areaConstruccionMax }),
                    ...(filtros.areaTerrenoMin && { areaTerrenoMin: filtros.areaTerrenoMin }),
                    ...(filtros.areaTerrenoMax && { areaTerrenoMax: filtros.areaTerrenoMax }),
                    ...(filtros.parqueaderos && { parqueaderos: filtros.parqueaderos }),
                    ...(filtros.pisos && { pisos: filtros.pisos }),
                    ...(filtros.anioMin && { anioMin: filtros.anioMin }),
                    ...(filtros.estadoFisico && { estadoFisico: filtros.estadoFisico }),
                    ...(filtros.sector && { sector: filtros.sector }),
                    ...(filtros.orden && { orden: filtros.orden }),
                    // Amenidades
                    ...(filtros.tiene_piscina && { tiene_piscina: filtros.tiene_piscina }),
                    ...(filtros.tiene_seguridad && { tiene_seguridad: filtros.tiene_seguridad }),
                    ...(filtros.tiene_ascensor && { tiene_ascensor: filtros.tiene_ascensor }),
                    ...(filtros.tiene_area_bbq && { tiene_area_bbq: filtros.tiene_area_bbq }),
                    ...(filtros.tiene_terraza && { tiene_terraza: filtros.tiene_terraza }),
                    ...(filtros.tiene_balcon && { tiene_balcon: filtros.tiene_balcon }),
                    ...(filtros.tiene_patio && { tiene_patio: filtros.tiene_patio }),
                    ...(filtros.tiene_bodega && { tiene_bodega: filtros.tiene_bodega }),
                    ...(filtros.tiene_areas_comunales && { tiene_areas_comunales: filtros.tiene_areas_comunales }),
                    ...(filtros.tiene_gas_centralizado && { tiene_gas_centralizado: filtros.tiene_gas_centralizado }),
                    ...(filtros.tiene_cisterna && { tiene_cisterna: filtros.tiene_cisterna }),
                    ...(filtros.tiene_lavanderia && { tiene_lavanderia: filtros.tiene_lavanderia }),
                    ...(filtros.amoblado && { amoblado: filtros.amoblado }),
                    // Fechas
                    ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
                    ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta })
                };

                // Lógica de filtro por agente (Backend)
                if (decoded.rol === 'admin') {
                    if (selectedAgent) params.agenteId = selectedAgent;
                } else {
                    if (viewMode === 'mine') params.agenteId = decoded.id;
                }

                axios.get('http://localhost:3000/api/propiedades', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: params // Axios serializa esto como query string
                })
                    .then(res => {
                        // Adaptar a nueva respuesta { data, meta }
                        if (res.data.data) {
                            setPropiedades(res.data.data);
                            setTotalPages(res.data.meta.lastPage);
                            setTotalProperties(res.data.meta.total);
                            if (res.data.data.length === 0) setMensaje('No se encontraron propiedades con los filtros seleccionados.');
                        } else {
                            // Fallback por si la API antigua responde (aunque ya la cambiamos)
                            setPropiedades([]);
                            setMensaje('Formato de respuesta inválido.');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        setPropiedades([]);
                        setMensaje('Error al cargar las propiedades.');
                    });
            }, 300); // 300ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [currentPage, viewMode, selectedAgent, busqueda, filtros]); // Dependencias de efecto

    // NOTA: ELIMINADA función filtrar() cliente-side. 
    // Ahora 'propiedades' ya viene filtrado del servidor.
    const propiedadesFiltradas = propiedades;

    const actualizarPropiedadLocal = (propiedadActualizada) => {
        console.log('Actualizando propiedad local:', propiedadActualizada);
        setPropiedades(prev => {
            const nuevasPropiedades = prev.map(p => p.id === propiedadActualizada.id ? propiedadActualizada : p);
            console.log('Propiedades actualizadas:', nuevasPropiedades.length);
            return nuevasPropiedades;
        });
    };

    // Título dinámico
    const obtenerTitulo = () => {
        if (usuario?.rol === 'admin') return 'Gestión de Propiedades';
        return viewMode === 'mine' ? 'Mis Propiedades' : 'Todas las Propiedades';
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

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {obtenerTitulo()}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gestiona el inventario de propiedades ({totalProperties} en total)
                        </p>
                    </div>
                    <Link
                        to={usuario?.rol === 'admin' ? '/admin/registrar-propiedad' : '/agente/registrar-propiedad'}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200 flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nueva Propiedad
                    </Link>
                </div>
            </div>

            {/* FILTROS Y CONTROLES */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h2>

                    <div className="flex flex-wrap gap-4 items-center">
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                            <button
                                onClick={() => setViewType('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewType === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Vista Cuadrícula"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewType('list')}
                                className={`p-1.5 rounded-md transition-all ${viewType === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Vista Lista"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        {/* UI para AGENTES: Toggle Mías / Todas */}
                        {usuario?.rol !== 'admin' && (
                            <div className="bg-gray-100 p-1 rounded-lg flex items-center shadow-inner">
                                <button
                                    onClick={() => setViewMode('all')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'all'
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setViewMode('mine')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'mine'
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Mis Propiedades
                                </button>
                            </div>
                        )}

                        {/* UI para ADMIN: Dropdown Unificado */}
                        {usuario?.rol === 'admin' && (
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[200px]"
                                >
                                    <option value="">🌐 Todas las propiedades</option>
                                    {agentes.map(agente => (
                                        <option key={agente.id} value={agente.id}>
                                            👤 {agente.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <FiltroPropiedades
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    filtros={filtros}
                    setFiltros={setFiltros}
                />
            </div>

            {/* CONTENIDO PRINCIPAL */}
            {propiedadesFiltradas.length > 0 ? (
                <>
                    {viewType === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {propiedadesFiltradas.map((prop) => (
                                <CardPropiedad
                                    key={prop.id}
                                    propiedad={prop}
                                    onActualizarPropiedad={actualizarPropiedadLocal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Características</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negociaciones</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {propiedadesFiltradas.map((prop) => {
                                            const img = prop.imagenes?.[0]?.url
                                                ? prop.imagenes[0].url.startsWith('http')
                                                    ? prop.imagenes[0].url
                                                    : `http://localhost:3000${prop.imagenes[0].url}`
                                                : 'https://via.placeholder.com/50';

                                            // Reutilizamos lógica de permisos de CardPropiedad
                                            const puedeEditar = usuario?.rol === 'admin' || usuario?.id === prop.agenteId;

                                            return (
                                                <tr
                                                    key={prop.id}
                                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={(e) => {
                                                        // Solo navegar si no se hizo clic en un botón de acción
                                                        if (!e.target.closest('a') && !e.target.closest('button')) {
                                                            window.location.href = `${usuario?.rol === 'admin' ? '/admin' : '/agente'}/propiedad/${prop.id}`;
                                                        }
                                                    }}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-12">
                                                                <img className="h-12 w-12 rounded-lg object-cover shadow-sm" src={img} alt="" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={prop.titulo}>{prop.titulo}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {prop.tipo_propiedad?.replace(/_/g, ' ')}
                                                                    {prop.codigo_interno && (
                                                                        <span className="ml-2 text-orange-600 font-mono">#{prop.codigo_interno}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {prop.propietarios && prop.propietarios.length > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {prop.propietarios[0].cliente.nombre}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">Propietario</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Sin propietario</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3 text-sm text-gray-700">
                                                            {prop.nro_habitaciones && (
                                                                <div className="flex items-center gap-1" title="Habitaciones">
                                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10v9h2v-2h14v2h2v-9a2 2 0 00-2-2H5a2 2 0 00-2 2zM5 8a2 2 0 012-2h4a2 2 0 012 2v2H5V8z" />
                                                                    </svg>
                                                                    <span>{prop.nro_habitaciones}</span>
                                                                </div>
                                                            )}
                                                            {prop.nro_banos && (
                                                                <div className="flex items-center gap-1" title="Baños">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 14h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5zM6 14V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                                                                    </svg>
                                                                    <span>{prop.nro_banos}</span>
                                                                </div>
                                                            )}
                                                            {prop.area_terreno && Number(prop.area_terreno) > 0 && (
                                                                <div className="flex items-center gap-1" title="Área de Terreno">
                                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                                    </svg>
                                                                    <span className="text-xs">{Number(prop.area_terreno).toFixed(0)}m² T</span>
                                                                </div>
                                                            )}
                                                            {prop.area_construccion && Number(prop.area_construccion) > 0 && (
                                                                <div className="flex items-center gap-1" title="Área de Construcción">
                                                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                                    </svg>
                                                                    <span className="text-xs">{Number(prop.area_construccion).toFixed(0)}m²</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{prop.ciudad}</div>
                                                        <div className="text-xs text-gray-500">{prop.provincia}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {Number(prop.precio).toLocaleString('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                                                        </div>
                                                        <span className={`inline-flex mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wide ${prop.transaccion === 'venta' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                                                            {prop.transaccion === 'venta' ? 'Venta' : 'Alquiler'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(prop.estado_publicacion)}`}>
                                                            {prop.estado_publicacion}
                                                        </span>
                                                        {prop.agente && (
                                                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                                {prop.agente.name}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td
                                                        className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-orange-50 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (prop.negociaciones && prop.negociaciones.length > 0) {
                                                                window.location.href = `${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-negociaciones?propiedadId=${prop.id}`;
                                                            }
                                                        }}
                                                        title={prop.negociaciones && prop.negociaciones.length > 0 ? 'Click para ver negociaciones' : ''}
                                                    >
                                                        {prop.negociaciones && prop.negociaciones.length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                    {prop.negociaciones.length} {prop.negociaciones.length === 1 ? 'negociación' : 'negociaciones'}
                                                                </span>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {prop.negociaciones.slice(0, 3).map((neg, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className={`text-xs px-1.5 py-0.5 rounded ${neg.etapa === 'interes' ? 'bg-blue-50 text-blue-700' :
                                                                                neg.etapa === 'negociacion' ? 'bg-yellow-50 text-yellow-700' :
                                                                                    neg.etapa === 'cierre' ? 'bg-green-50 text-green-700' :
                                                                                        neg.etapa === 'finalizada' ? 'bg-gray-50 text-gray-700' :
                                                                                            'bg-red-50 text-red-700'
                                                                                }`}
                                                                            title={neg.etapa}
                                                                        >
                                                                            {neg.etapa === 'interes' ? '👁️' :
                                                                                neg.etapa === 'negociacion' ? '💬' :
                                                                                    neg.etapa === 'cierre' ? '🤝' :
                                                                                        neg.etapa === 'finalizada' ? '✅' : '❌'}
                                                                        </span>
                                                                    ))}
                                                                    {prop.negociaciones.length > 3 && (
                                                                        <span className="text-xs text-gray-400">+{prop.negociaciones.length - 3}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {prop.fecha_captacion ? (
                                                            <div className="text-sm text-gray-700">
                                                                {new Date(prop.fecha_captacion).toLocaleDateString('es-EC', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-700">
                                                                {new Date(prop.createdAt).toLocaleDateString('es-EC', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-400">
                                                            {prop.fecha_captacion ? 'Captación' : 'Registro'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Link
                                                                to={`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/propiedad/${prop.id}`}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                                                title="Ver Detalle"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </Link>
                                                            {puedeEditar && (
                                                                <Link
                                                                    to={`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/editar-propiedad/${prop.id}`}
                                                                    className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-all"
                                                                    title="Editar"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </Link>
                                                            )}
                                                            {usuario?.rol === 'admin' && (
                                                                <button
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                                    title="Eliminar"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setPropiedadAEliminar(prop.id);
                                                                    }}
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200 mt-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron propiedades</h3>
                    <p className="mt-1 text-sm text-gray-500">{mensaje || 'Intenta ajustar los filtros de búsqueda.'}</p>
                </div>
            )}

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm border">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Siguiente
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Mostrando página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Anterior</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {/* Implementación simple de paginación numérica */}
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Siguiente</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {propiedadAEliminar && (
                <ModalConfirmarEliminar
                    propiedadId={propiedadAEliminar}
                    onClose={() => setPropiedadAEliminar(null)}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
}
