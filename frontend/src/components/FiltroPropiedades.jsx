import { useState, useEffect } from 'react';

export default function FiltroPropiedades({ busqueda, setBusqueda, filtros, setFiltros }) {
    const [precioMinLocal, setPrecioMinLocal] = useState(filtros.precioMin || '');
    const [precioMaxLocal, setPrecioMaxLocal] = useState(filtros.precioMax || '');
    const [mostrarAvanzados, setMostrarAvanzados] = useState(false);
    const [mostrarAmenidades, setMostrarAmenidades] = useState(false);

    useEffect(() => {
        setPrecioMinLocal(filtros.precioMin || '');
        setPrecioMaxLocal(filtros.precioMax || '');
    }, [filtros.precioMin, filtros.precioMax]);

    const handlePrecioChange = (tipo, valor) => {
        const val = valor === '' ? '' : Number(valor);
        if (tipo === 'min') {
            setPrecioMinLocal(valor);
            setFiltros(prev => ({ ...prev, precioMin: val }));
        } else {
            setPrecioMaxLocal(valor);
            setFiltros(prev => ({ ...prev, precioMax: val }));
        }
    };

    const handleReset = () => {
        setBusqueda('');
        setFiltros({
            estado: '', transaccion: '', tipo: '', ciudad: '',
            precioMin: 0, precioMax: 0,
            habitaciones: '', banos: '',
            areaConstruccionMin: '', areaConstruccionMax: '',
            areaTerrenoMin: '', areaTerrenoMax: '',
            parqueaderos: '', pisos: '',
            anioMin: '', estadoFisico: '',
            orden: 'recientes',
            tiene_piscina: false, tiene_seguridad: false,
            tiene_ascensor: false, tiene_area_bbq: false,
            tiene_terraza: false, tiene_balcon: false,
            tiene_patio: false, tiene_bodega: false,
            tiene_areas_comunales: false, tiene_gas_centralizado: false,
            tiene_cisterna: false, tiene_lavanderia: false,
            amoblado: false,
            fechaDesde: '', fechaHasta: ''
        });
        setPrecioMinLocal('');
        setPrecioMaxLocal('');
    };

    const toggleAmenidad = (key) => {
        setFiltros(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-4 border border-gray-200 mb-6 w-full">
            {/* Fila 1: Búsqueda y Filtros Principales */}
            {/* Fila 1: Búsqueda y Filtros Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* Búsqueda (3 cols) */}
                <div className="lg:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Buscar Propiedad</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Título, Código, Propietario..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Transacción (2 cols) */}
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transacción</label>
                    <select
                        value={filtros.transaccion || ''}
                        onChange={(e) => setFiltros({ ...filtros, transaccion: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Todas</option>
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                    </select>
                </div>

                {/* Tipo (2 cols) */}
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo</label>
                    <select
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Todos</option>
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="suite">Suite</option>
                        <option value="local_comercial">Local</option>
                        <option value="oficina">Oficina</option>
                        <option value="bodega_galpon">Bodega</option>
                        <option value="edificio">Edificio</option>
                        <option value="terreno">Terreno</option>
                        <option value="finca">Finca</option>
                        <option value="quinta">Quinta</option>
                    </select>
                </div>

                {/* Ciudad (3 cols) */}
                <div className="lg:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ubicación</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={filtros.ciudad}
                            onChange={(e) => setFiltros({ ...filtros, ciudad: e.target.value })}
                            placeholder="Ciudad"
                            className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                        <input
                            type="text"
                            value={filtros.sector || ''}
                            onChange={(e) => setFiltros({ ...filtros, sector: e.target.value })}
                            placeholder="Sector"
                            className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                    </div>
                </div>

                {/* Estado (2 cols) */}
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</label>
                    <select
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Cualquiera</option>
                        <option value="disponible">Disponible</option>
                        <option value="vendida">Vendida</option>
                        <option value="arrendada">Arrendada</option>
                        <option value="reservada">Reservada</option>
                    </select>
                </div>
            </div>

            {/* Fila Secundaria: Precios y Botones */}
            <div className={`mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-end justify-between ${mostrarAvanzados ? 'mb-4' : ''}`}>
                {/* Rango de Precios */}
                <div className="w-full md:max-w-sm">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Presupuesto</label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2 text-gray-400 text-xs">$</span>
                            <input
                                type="number"
                                value={precioMinLocal}
                                onChange={(e) => handlePrecioChange('min', e.target.value)}
                                placeholder="Min"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all"
                            />
                        </div>
                        <span className="text-gray-300 font-medium">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2 text-gray-400 text-xs">$</span>
                            <input
                                type="number"
                                value={precioMaxLocal}
                                onChange={(e) => handlePrecioChange('max', e.target.value)}
                                placeholder="Max"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones y Avanzados (7 cols) */}
                {/* Ordenar Por */}
                {/* Ordenar Por */}
                <div className="w-full md:w-auto">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ordenar por</label>
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
                                // Determinar dirección actual basada en el valor actual
                                let direccion = 'desc'; // Default para fecha/titulo? No, default general
                                if (actualOrden.includes('asc') || actualOrden === 'antiguas') direccion = 'asc';

                                // Construir nuevo valor
                                let nuevoOrden = 'recientes';
                                if (campo === 'fecha') {
                                    nuevoOrden = direccion === 'asc' ? 'antiguas' : 'recientes';
                                } else if (campo === 'precio') {
                                    nuevoOrden = direccion === 'asc' ? 'precio_asc' : 'precio_desc';
                                } else if (campo === 'titulo') {
                                    nuevoOrden = direccion === 'asc' ? 'titulo_asc' : 'titulo_desc';
                                }
                                setFiltros({ ...filtros, orden: nuevoOrden });
                            }}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500 transition-all appearance-none cursor-pointer min-w-[120px]"
                        >
                            <option value="fecha">Fecha</option>
                            <option value="precio">Precio</option>
                            <option value="titulo">Título</option>
                        </select>
                        <button
                            onClick={() => {
                                const actualOrden = filtros.orden || 'recientes';
                                let nuevoOrden = actualOrden;

                                // Lógica de inversión
                                if (actualOrden === 'recientes') nuevoOrden = 'antiguas';
                                else if (actualOrden === 'antiguas') nuevoOrden = 'recientes';
                                else if (actualOrden === 'precio_asc') nuevoOrden = 'precio_desc';
                                else if (actualOrden === 'precio_desc') nuevoOrden = 'precio_asc';
                                else if (actualOrden === 'titulo_asc') nuevoOrden = 'titulo_desc';
                                else if (actualOrden === 'titulo_desc') nuevoOrden = 'titulo_asc';

                                setFiltros({ ...filtros, orden: nuevoOrden });
                            }}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-gray-600"
                            title="Cambiar dirección"
                        >
                            <svg className={`w-5 h-5 transition-transform ${(filtros.orden === 'antiguas' || filtros.orden?.includes('_asc')) ? 'rotate-180' : ''
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex items-end gap-3">
                    <button
                        onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors flex items-center px-3 py-2.5 bg-orange-50 rounded-lg border border-orange-100"
                    >
                        {mostrarAvanzados ? 'Menos filtros' : 'Más filtros'}
                        <svg className={`w-3 h-3 ml-1 transition-transform ${mostrarAvanzados ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={handleReset}
                        className="bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 text-xs font-semibold h-[38px]"
                        title="Limpiar filtros"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Limpiar
                    </button>
                </div>
            </div>
            {
                mostrarAvanzados && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in-down">
                        {/* Grid Principal de Avanzados */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                            {/* Habitaciones */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Habitaciones</label>
                                <select
                                    value={filtros.habitaciones || ''}
                                    onChange={(e) => setFiltros({ ...filtros, habitaciones: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Cualquiera</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                    <option value="3">3+</option>
                                    <option value="4">4+</option>
                                    <option value="5">5+</option>
                                </select>
                            </div>

                            {/* Baños */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Baños</label>
                                <select
                                    value={filtros.banos || ''}
                                    onChange={(e) => setFiltros({ ...filtros, banos: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Cualquiera</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                    <option value="3">3+</option>
                                </select>
                            </div>

                            {/* Parqueaderos */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Parqueaderos</label>
                                <select
                                    value={filtros.parqueaderos || ''}
                                    onChange={(e) => setFiltros({ ...filtros, parqueaderos: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Cualquiera</option>
                                    <option value="1">1+</option>
                                    <option value="2">2+</option>
                                </select>
                            </div>

                            {/* Pisos */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pisos</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ej. 2"
                                    value={filtros.pisos || ''}
                                    onChange={(e) => setFiltros({ ...filtros, pisos: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Área Construcción */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Área Const. (m²)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filtros.areaConstruccionMin || ''}
                                        onChange={(e) => setFiltros({ ...filtros, areaConstruccionMin: e.target.value })}
                                        className="w-1/2 bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filtros.areaConstruccionMax || ''}
                                        onChange={(e) => setFiltros({ ...filtros, areaConstruccionMax: e.target.value })}
                                        className="w-1/2 bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Área Terreno */}
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Área Terreno (m²)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filtros.areaTerrenoMin || ''}
                                        onChange={(e) => setFiltros({ ...filtros, areaTerrenoMin: e.target.value })}
                                        className="w-1/2 bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filtros.areaTerrenoMax || ''}
                                        onChange={(e) => setFiltros({ ...filtros, areaTerrenoMax: e.target.value })}
                                        className="w-1/2 bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Año Construcción */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Año (Mínimo)</label>
                                <input
                                    type="number"
                                    placeholder="Ej. 2015"
                                    value={filtros.anioMin || ''}
                                    onChange={(e) => setFiltros({ ...filtros, anioMin: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Estado Físico */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estado Físico</label>
                                <select
                                    value={filtros.estadoFisico || ''}
                                    onChange={(e) => setFiltros({ ...filtros, estadoFisico: e.target.value })}
                                    className="w-full bg-gray-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Cualquiera</option>
                                    <option value="nueva">Nueva</option>
                                    <option value="usada">Usada</option>
                                    <option value="en_construccion">En Construcción</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid Secundario: Fechas y Amenidades */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                            {/* Fechas (Captación) */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fecha de Captación</label>
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Desde</label>
                                        <input
                                            type="date"
                                            value={filtros.fechaDesde || ''}
                                            onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hasta</label>
                                        <input
                                            type="date"
                                            value={filtros.fechaHasta || ''}
                                            onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-1 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Amenidades (Dropdown con Checkboxes) */}
                        <div className="relative mt-2 lg:mt-0">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Extras</label>
                            <button
                                onClick={() => setMostrarAmenidades(!mostrarAmenidades)}
                                className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm flex justify-between items-center transition-all ${mostrarAmenidades ? 'border-orange-500 ring-1 ring-orange-500' : 'border-gray-200 text-gray-700'}`}
                            >
                                <span className="truncate">
                                    {[
                                        filtros.tiene_piscina, filtros.tiene_seguridad,
                                        filtros.tiene_ascensor, filtros.tiene_area_bbq, filtros.tiene_terraza,
                                        filtros.tiene_balcon, filtros.tiene_patio, filtros.tiene_bodega,
                                        filtros.tiene_areas_comunales, filtros.tiene_gas_centralizado,
                                        filtros.tiene_cisterna, filtros.tiene_lavanderia, filtros.amoblado
                                    ].filter(Boolean).length > 0
                                        ? `${[
                                            filtros.tiene_piscina, filtros.tiene_seguridad,
                                            filtros.tiene_ascensor, filtros.tiene_area_bbq, filtros.tiene_terraza,
                                            filtros.tiene_balcon, filtros.tiene_patio, filtros.tiene_bodega,
                                            filtros.tiene_areas_comunales, filtros.tiene_gas_centralizado,
                                            filtros.tiene_cisterna, filtros.tiene_lavanderia, filtros.amoblado
                                        ].filter(Boolean).length} Seleccionados`
                                        : 'Seleccionar...'}
                                </span>
                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${mostrarAmenidades ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Menú Flotante Amenidades */}
                            {mostrarAmenidades && (
                                <div className="absolute bottom-full right-0 mb-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50">
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {[
                                            { key: 'tiene_piscina', label: 'Piscina' },
                                            { key: 'tiene_seguridad', label: 'Seguridad' },
                                            { key: 'tiene_ascensor', label: 'Ascensor' },
                                            { key: 'tiene_area_bbq', label: 'BBQ' },
                                            { key: 'tiene_terraza', label: 'Terraza' },
                                            { key: 'tiene_balcon', label: 'Balcón' },
                                            { key: 'tiene_patio', label: 'Patio' },
                                            { key: 'tiene_bodega', label: 'Bodega' },
                                            { key: 'tiene_areas_comunales', label: 'Áreas Comunales' },
                                            { key: 'tiene_gas_centralizado', label: 'Gas Centralizado' },
                                            { key: 'tiene_cisterna', label: 'Cisterna' },
                                            { key: 'tiene_lavanderia', label: 'Lavandería' },
                                            { key: 'amoblado', label: 'Amoblado' }
                                        ].map((amenidad) => (
                                            <label key={amenidad.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={!!filtros[amenidad.key]}
                                                    onChange={() => toggleAmenidad(amenidad.key)}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-sm text-gray-700">{amenidad.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
