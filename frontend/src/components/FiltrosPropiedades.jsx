import { useState, useEffect } from 'react';

export default function FiltrosPropiedades({ filtros, setFiltros, onFiltrar, busqueda, setBusqueda }) {
    const [ciudades, setCiudades] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
    const [mostrarAmenidades, setMostrarAmenidades] = useState(false);

    // Precios sugeridos para los selects
    const PRECIOS_OPCIONES = [
        { value: 50000, label: '$50,000' },
        { value: 100000, label: '$100,000' },
        { value: 150000, label: '$150,000' },
        { value: 200000, label: '$200,000' },
        { value: 300000, label: '$300,000' },
        { value: 500000, label: '$500,000' },
        { value: 1000000, label: '$1M+' }
    ];

    // Cargar opciones de filtros desde la API
    useEffect(() => {
        cargarOpcionesFiltros();
    }, []);

    const cargarOpcionesFiltros = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/propiedades/publicas');
            const propiedades = await response.json();

            // Extraer ciudades únicas
            const ciudadesUnicas = [...new Set(propiedades.map(p => p.ciudad))].sort();
            setCiudades(ciudadesUnicas);

            // Tipos de propiedad
            const tiposUnicos = [...new Set(propiedades.map(p => p.tipo_propiedad))].sort();
            setTipos(tiposUnicos);

        } catch (error) {
            // Error silencioso
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros({
            ...filtros,
            [campo]: valor
        });
    };

    const handleTransaccionChange = (tipo) => {
        handleFiltroChange('transaccion', tipo);
    };

    const limpiarFiltros = () => {
        const filtrosLimpios = {
            tipo_propiedad: '',
            ciudad: '',
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
            areaTerrenoMax: '',
            estadoFisico: '',
            anioMin: '',
            tiene_piscina: false,
            tiene_seguridad: false,
            tiene_ascensor: false,
            tiene_area_bbq: false,
            tiene_terraza: false,
            unidadTerreno: 'm2'
        };
        setFiltros(filtrosLimpios);
        setBusqueda('');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 relative z-20">
            {/* 1. TABS DE OPERACIÓN (Venta / Alquiler) */}
            <div className="flex justify-center mb-4">
                <div className="inline-flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <button
                        onClick={() => handleTransaccionChange('')}
                        className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${!filtros.transaccion ? 'bg-white text-slate-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => handleTransaccionChange('venta')}
                        className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${filtros.transaccion === 'venta' ? 'bg-white text-green-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Comprar
                    </button>
                    <button
                        onClick={() => handleTransaccionChange('alquiler')}
                        className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${filtros.transaccion === 'alquiler' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Alquilar
                    </button>
                </div>
            </div>

            {/* Fila Principal de Filtros */}
            <div className="flex flex-col lg:flex-row gap-4 items-end">
                {/* Búsqueda */}
                <div className="w-full lg:flex-[2]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Ubicación o Palabra Clave</label>
                    <div className="relative group">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Título, Ubicación, Código o Descripción..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        />
                    </div>
                </div>

                {/* Tipo de Propiedad */}
                <div className="w-full lg:w-48">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Tipo</label>
                    <div className="relative">
                        <select
                            value={filtros.tipo_propiedad}
                            onChange={(e) => handleFiltroChange('tipo_propiedad', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none font-medium"
                        >
                            <option value="">Todos</option>
                            {tipos.map(tipo => (
                                <option key={tipo} value={tipo}>
                                    {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Ciudad */}
                <div className="w-full lg:w-48">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Ciudad</label>
                    <div className="relative">
                        <select
                            value={filtros.ciudad}
                            onChange={(e) => handleFiltroChange('ciudad', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none font-medium"
                        >
                            <option value="">Todas</option>
                            {ciudades.map(ciudad => (
                                <option key={ciudad} value={ciudad}>{ciudad}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* 2. RANGO DE PRECIO CON SELECTS */}
                <div className="w-full lg:w-36">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Precio Mín</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <select
                            value={filtros.minPrecio}
                            onChange={(e) => handleFiltroChange('minPrecio', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-6 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none font-medium"
                        >
                            <option value="">0</option>
                            {PRECIOS_OPCIONES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="w-full lg:w-36">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Precio Máx</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <select
                            value={filtros.maxPrecio}
                            onChange={(e) => handleFiltroChange('maxPrecio', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-6 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none font-medium"
                        >
                            <option value="">Max</option>
                            {PRECIOS_OPCIONES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ordenar Por */}
                <div className="w-full lg:w-auto min-w-[140px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Ordenar</label>
                    <div className="flex items-center gap-1">
                        <select
                            value={
                                filtros.orden?.includes('precio') ? 'precio' :
                                    filtros.orden?.includes('titulo') ? 'titulo' :
                                        'fecha'
                            }
                            onChange={(e) => {
                                const campo = e.target.value;
                                const actualOrden = filtros.orden || 'recientes';
                                let direccion = 'desc';
                                if (actualOrden.includes('asc') || actualOrden === 'antiguas') direccion = 'asc';

                                let nuevoOrden = 'recientes';
                                if (campo === 'fecha') {
                                    nuevoOrden = direccion === 'asc' ? 'antiguas' : 'recientes';
                                } else if (campo === 'precio') {
                                    nuevoOrden = direccion === 'asc' ? 'precio_asc' : 'precio_desc';
                                } else if (campo === 'titulo') {
                                    nuevoOrden = direccion === 'asc' ? 'titulo_asc' : 'titulo_desc';
                                }
                                handleFiltroChange('orden', nuevoOrden);
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none font-medium"
                        >
                            <option value="precio">Precio</option>
                            <option value="fecha">Reciente</option>
                            <option value="titulo">A-Z</option>
                        </select>
                        <button
                            onClick={() => {
                                const actualOrden = filtros.orden || 'recientes';
                                let nuevoOrden = actualOrden;

                                if (actualOrden === 'recientes') nuevoOrden = 'antiguas';
                                else if (actualOrden === 'antiguas') nuevoOrden = 'recientes';
                                else if (actualOrden === 'precio_asc') nuevoOrden = 'precio_desc';
                                else if (actualOrden === 'precio_desc') nuevoOrden = 'precio_asc';
                                else if (actualOrden === 'titulo_asc') nuevoOrden = 'titulo_desc';
                                else if (actualOrden === 'titulo_desc') nuevoOrden = 'titulo_asc';

                                handleFiltroChange('orden', nuevoOrden);
                            }}
                            className="h-[38px] w-[38px] flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
                            title="Cambiar dirección"
                        >
                            <svg className={`w-4 h-4 transition-transform ${(filtros.orden === 'antiguas' || filtros.orden?.includes('_asc')) ? 'rotate-180' : ''
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Toggle Avanzados */}
                <button
                    onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
                    className={`h-[38px] w-[38px] rounded-lg flex items-center justify-center transition-all ${mostrarAvanzados ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600'}`}
                    title="Más filtros"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </button>
            </div>

            {/* Panel Avanzado Simplificado */}
            {mostrarAvanzados && (
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-fade-in">

                    {/* Fila 1: Características Básicas */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Habitaciones</label>
                        <select
                            value={filtros.nro_habitaciones}
                            onChange={(e) => handleFiltroChange('nro_habitaciones', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Todas</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Baños</label>
                        <select
                            value={filtros.nro_banos}
                            onChange={(e) => handleFiltroChange('nro_banos', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Todos</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Parqueaderos</label>
                        <select
                            value={filtros.parqueaderos}
                            onChange={(e) => handleFiltroChange('parqueaderos', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Todos</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Estado</label>
                        <select
                            value={filtros.estadoFisico || ''}
                            onChange={(e) => handleFiltroChange('estadoFisico', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Todos</option>
                            <option value="nueva">Nueva</option>
                            <option value="usada">Usada</option>
                            <option value="en_construccion">En Construcción</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Pisos</label>
                        <select
                            value={filtros.nro_pisos}
                            onChange={(e) => handleFiltroChange('nro_pisos', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Todos</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>

                    {/* 3. ÁREAS DINÁMICAS */}
                    {/* Lógica:
                        - Terreno/Lote -> Solo Área Terreno
                        - Dep/Oficina -> Solo Área Construcción
                        - Casa/Vacio -> Ambos
                    */}
                    {
                        (!filtros.tipo_propiedad ||
                            ['casa', 'departamento', 'oficina', 'local', 'bodega', 'edificio'].includes(filtros.tipo_propiedad.toLowerCase())
                        ) && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                                    {['terreno', 'lote'].includes(filtros.tipo_propiedad?.toLowerCase()) ? 'Área T. (Min)' : 'Área Const. (Min)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="m²"
                                        value={filtros.areaConstruccionMin || ''}
                                        onChange={(e) => handleFiltroChange('areaConstruccionMin', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">m²</span>
                                </div>
                            </div>
                        )
                    }

                    {/* Area Terreno (Solo visible para Casas, Terrenos, Fincas o Busqueda General) */}
                    {
                        (!filtros.tipo_propiedad ||
                            ['casa', 'terreno', 'lote', 'finca', 'quinta'].includes(filtros.tipo_propiedad.toLowerCase())
                        ) && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Área Terreno (Min)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder={filtros.unidadTerreno === 'ha' ? "Hectáreas" : "Metros cuadrados"}
                                        value={filtros.areaTerrenoMin || ''}
                                        onChange={(e) => handleFiltroChange('areaTerrenoMin', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-3 pr-16 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                                        <select
                                            value={filtros.unidadTerreno || 'm2'}
                                            onChange={(e) => handleFiltroChange('unidadTerreno', e.target.value)}
                                            className="bg-transparent border-none text-xs text-gray-500 font-semibold focus:ring-0 cursor-pointer pr-6 py-1"
                                        >
                                            <option value="m2">m²</option>
                                            <option value="ha">Ha</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )
                    }



                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Año Const. (Min)</label>
                        <input
                            type="number"
                            placeholder="Ej. 2015"
                            value={filtros.anioMin || ''}
                            onChange={(e) => handleFiltroChange('anioMin', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* 4. AMENIDADES (Dropdown Menu - Opción B) */}
                    <div className="space-y-1 relative">
                        <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Extras</label>
                        <button
                            onClick={() => setMostrarAmenidades(!mostrarAmenidades)}
                            className={`w-full border rounded-lg px-3 py-2 text-sm flex justify-between items-center transition-all ${mostrarAmenidades ? 'border-orange-500 ring-1 ring-orange-500 bg-white' : 'bg-gray-50 border-gray-100 text-gray-600'
                                }`}
                        >
                            <span className="truncate">
                                {[
                                    filtros.tiene_piscina,
                                    filtros.tiene_seguridad,
                                    filtros.tiene_ascensor,
                                    filtros.tiene_area_bbq,
                                    filtros.tiene_terraza,
                                    filtros.tiene_balcon,
                                    filtros.tiene_patio,
                                    filtros.tiene_bodega,
                                    filtros.tiene_areas_comunales,
                                    filtros.tiene_gas_centralizado,
                                    filtros.tiene_cisterna,
                                    filtros.tiene_lavanderia,
                                    filtros.amoblado
                                ].filter(Boolean).length > 0
                                    ? `${[
                                        filtros.tiene_piscina,
                                        filtros.tiene_seguridad,
                                        filtros.tiene_ascensor,
                                        filtros.tiene_area_bbq,
                                        filtros.tiene_terraza,
                                        filtros.tiene_balcon,
                                        filtros.tiene_patio,
                                        filtros.tiene_bodega,
                                        filtros.tiene_areas_comunales,
                                        filtros.tiene_gas_centralizado,
                                        filtros.tiene_cisterna,
                                        filtros.tiene_lavanderia,
                                        filtros.amoblado
                                    ].filter(Boolean).length} Seleccionados`
                                    : 'Amenidades'}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${mostrarAmenidades ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {/* Menú Flotante */}
                        {mostrarAmenidades && (
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-fade-in-down">
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {[
                                        { key: 'tiene_piscina', label: 'Piscina' },
                                        { key: 'tiene_seguridad', label: 'Seguridad' },
                                        { key: 'tiene_ascensor', label: 'Ascensor' },
                                        { key: 'tiene_area_bbq', label: 'BBQ' },
                                        { key: 'tiene_terraza', label: 'Terraza' },
                                        { key: 'tiene_balcon', label: 'Balcón' },
                                        { key: 'tiene_patio', label: 'Patio' },
                                        { key: 'tiene_bodega', label: 'Bodega' },
                                        { key: 'tiene_areas_comunales', label: 'Áreas Com.' },
                                        { key: 'tiene_gas_centralizado', label: 'Gas Cent.' },
                                        { key: 'tiene_cisterna', label: 'Cisterna' },
                                        { key: 'tiene_lavanderia', label: 'Lavandería' },
                                        { key: 'amoblado', label: 'Amoblado' }
                                    ].map((amenidad) => (
                                        <label key={amenidad.key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filtros[amenidad.key] ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                                {filtros[amenidad.key] && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={!!filtros[amenidad.key]}
                                                onChange={() => handleFiltroChange(amenidad.key, !filtros[amenidad.key])}
                                                className="hidden"
                                            />
                                            <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                                                {amenidad.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Botón Limpiar */}
                    <div className="flex items-end col-span-2 md:col-span-1 md:col-start-4 lg:col-auto">
                        <button
                            onClick={limpiarFiltros}
                            className="w-full bg-white text-gray-500 hover:bg-gray-50 hover:text-red-500 border border-gray-200 hover:border-red-200 font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Borrar Filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
