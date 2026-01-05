import { useState, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    MapPin,
    Home,
    DollarSign,
    Briefcase,
    Building2,
    CheckCircle2,
    ArrowUpDown,
    SlidersHorizontal
} from 'lucide-react';

export default function FiltroPropiedadesAdmin({ filtros, setFiltros, busqueda, setBusqueda }) {
    const [ciudades, setCiudades] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [transacciones, setTransacciones] = useState([]);
    const [agentes, setAgentes] = useState([]);

    // Estado para controlar qué "Chip" está abierto
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Refs para click outside
    const filterRef = useRef(null);

    // Lista de amenidades
    const AMENIDADES = [
        { key: 'tiene_piscina', label: 'Piscina' },
        { key: 'tiene_seguridad', label: 'Seguridad' },
        { key: 'tiene_ascensor', label: 'Ascensor' },
        { key: 'tiene_area_bbq', label: 'Area BBQ' },
        { key: 'tiene_terraza', label: 'Terraza' },
        { key: 'tiene_balcon', label: 'Balcón' },
        { key: 'tiene_patio', label: 'Patio' },
        { key: 'tiene_bodega', label: 'Bodega' },
        { key: 'tiene_areas_comunales', label: 'Áreas Comunales' },
        { key: 'tiene_gas_centralizado', label: 'Gas Centralizado' },
        { key: 'tiene_cisterna', label: 'Cisterna' },
        { key: 'tiene_lavanderia', label: 'Lavandería' },
        { key: 'amoblado', label: 'Amoblado' }
    ];

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resProps = await fetch('http://localhost:3000/api/propiedades/publicas');
                const propsData = await resProps.json();

                setCiudades([...new Set(propsData.map(p => p.ciudad))].sort());
                setTipos([...new Set(propsData.map(p => p.tipo_propiedad))].sort());
                setTransacciones([...new Set(propsData.map(p => p.transaccion))].sort());

                const resAgentes = await fetch('http://localhost:3000/api/usuarios');
                if (resAgentes.ok) {
                    const usuariosData = await resAgentes.json();
                    setAgentes(usuariosData.filter(u => u.rol === 'agente'));
                }
            } catch (error) {
                console.error("Error cargando filtros:", error);
            }
        };
        cargarDatos();

        // Click outside handler
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (key, value) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

    const toggleAmenidad = (key) => {
        handleChange(key, !filtros[key]);
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltros({
            estado: '',
            tipo: '',
            transaccion: '',
            ciudad: '',
            precioMin: '',
            precioMax: '',
            agenteId: '',
            orden: 'recientes',
            nro_habitaciones: '',
            nro_banos: '',
            nro_parqueaderos: '',
            areaMin: '',
            areaMax: '',
            anioMin: '',
            areaTerrenoMin: '',
            areaTerrenoMax: ''
        });
        setShowAdvanced(false);
    };

    const contarFiltrosActivos = () => {
        let count = 0;
        Object.keys(filtros).forEach(key => {
            if (key === 'orden') return;
            if (filtros[key]) count++;
        });
        return count;
    };

    // Componente Dropdown Button (Chip)
    const FilterChip = ({ label, activeInfo, dropdownKey, icon: Icon, children }) => {
        const isOpen = activeDropdown === dropdownKey;
        const isActive = activeInfo; // Si hay filtro aplicado en este chip

        return (
            <div className="relative inline-block"> {/* Changed to inline-block/relative for positioning */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Stop propagation to prevent immediate close if bubbling
                        setActiveDropdown(isOpen ? null : dropdownKey);
                    }}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
                        ${isActive
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : isOpen
                                ? 'bg-gray-100 border-gray-300 text-gray-900'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                    `}
                >
                    {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
                    <span>{label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </button>

                {isOpen && (
                    <div
                        className="absolute top-full mt-2 left-0 min-w-[200px] w-max max-w-xs bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it if bubbling reaches a listener
                    >
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mb-8" ref={filterRef}>
            {/* --- BARRA PRINCIPAL ESTILO "GOOGLE SEARCH" --- */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-2">

                {/* 1. Buscador */}
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100/50 bg-transparent"
                        placeholder="Buscar propiedades, códigos, clientes..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Separador Vertical */}
                <div className="hidden md:block w-px bg-gray-200 my-2"></div>

                {/* 2. Chips de Filtros Rápidos */}
                <div className="flex flex-wrap items-center gap-2 px-2">

                    {/* Chip: Operación */}
                    <FilterChip
                        label={filtros.transaccion ? filtros.transaccion : "Operación"}
                        activeInfo={filtros.transaccion}
                        dropdownKey="transaccion"
                        icon={Briefcase}
                    >
                        <div className="flex flex-col gap-1">
                            <button onClick={() => { handleChange('transaccion', ''); setActiveDropdown(null) }} className="px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg">Cualquiera</button>
                            {transacciones.map(t => (
                                <button key={t} onClick={() => { handleChange('transaccion', t); setActiveDropdown(null) }} className={`px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg ${filtros.transaccion === t ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </FilterChip>

                    {/* Chip: Tipo */}
                    <FilterChip
                        label={filtros.tipo ? filtros.tipo : "Tipo"}
                        activeInfo={filtros.tipo}
                        dropdownKey="tipo"
                        icon={Building2}
                    >
                        <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                            <button onClick={() => { handleChange('tipo', ''); setActiveDropdown(null) }} className="px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg">Todos</button>
                            {tipos.map(t => (
                                <button key={t} onClick={() => { handleChange('tipo', t); setActiveDropdown(null) }} className={`px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg ${filtros.tipo === t ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </FilterChip>

                    {/* Chip: Precio */}
                    <FilterChip
                        label={filtros.precioMin || filtros.precioMax ? "Precio" : "Precio"}
                        activeInfo={filtros.precioMin || filtros.precioMax}
                        dropdownKey="precio"
                        icon={DollarSign}
                    >
                        <div className="p-3">
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Rango de Precio</label>
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filtros.precioMin}
                                    onChange={(e) => handleChange('precioMin', e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filtros.precioMax}
                                    onChange={(e) => handleChange('precioMax', e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => setActiveDropdown(null)} className="text-xs text-blue-600 font-medium hover:underline">Aplicar</button>
                            </div>
                        </div>
                    </FilterChip>

                    {/* Chip: Estado */}
                    <FilterChip
                        label={filtros.estado ? filtros.estado : "Estado"}
                        activeInfo={filtros.estado}
                        dropdownKey="estado"
                        icon={CheckCircle2}
                    >
                        <div className="flex flex-col gap-1">
                            <button onClick={() => { handleChange('estado', ''); setActiveDropdown(null) }} className="px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg">Cualquiera</button>
                            {[
                                { val: 'disponible', label: 'Disponible' },
                                { val: 'reservada', label: 'Reservada' },
                                { val: 'vendida', label: 'Vendida' },
                                { val: 'alquilada', label: 'Alquilada' },
                                { val: 'inactiva', label: 'Inactiva' }
                            ].map(opt => (
                                <button key={opt.val} onClick={() => { handleChange('estado', opt.val); setActiveDropdown(null) }} className={`px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg ${filtros.estado === opt.val ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </FilterChip>

                    {/* Botón Más Filtros */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`
                             whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ml-auto hover:bg-gray-50
                             ${showAdvanced || contarFiltrosActivos() > (filtros.transaccion ? 1 : 0) + (filtros.tipo ? 1 : 0) + (filtros.precioMin || filtros.precioMax ? 1 : 0) + (filtros.estado ? 1 : 0) // Lógica aproximada para highlight
                                ? 'border-gray-400 bg-gray-50 text-gray-900'
                                : 'border-gray-200 bg-white text-gray-600'}
                        `}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filtros Globales</span>
                    </button>

                    {contarFiltrosActivos() > 0 && (
                        <button onClick={limpiarFiltros} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* --- PANEL LATERAL AVANZADO (Drawer Like) --- */}
            {showAdvanced && (
                <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" />
                            Filtros Avanzados
                        </h3>
                        <button onClick={() => setShowAdvanced(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Columna 1: Ubicación y Agente */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Ubicación y Responsable</label>

                            <div className="space-y-2">
                                <span className="text-xs text-gray-500 uppercase">Ciudad</span>
                                <select value={filtros.ciudad} onChange={(e) => handleChange('ciudad', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 outline-none">
                                    <option value="">Todas</option>
                                    {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-gray-500 uppercase">Agente Asignado</span>
                                <select value={filtros.agenteId || ''} onChange={(e) => handleChange('agenteId', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 outline-none">
                                    <option value="">Todos</option>
                                    {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Columna 2: Distribución */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Distribución</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-gray-500 uppercase block mb-1">Habitaciones</span>
                                    <input type="number" placeholder="Min" value={filtros.nro_habitaciones} onChange={(e) => handleChange('nro_habitaciones', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase block mb-1">Baños</span>
                                    <input type="number" placeholder="Min" value={filtros.nro_banos} onChange={(e) => handleChange('nro_banos', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase block mb-1">Garajes</span>
                                    <input type="number" placeholder="Min" value={filtros.nro_parqueaderos} onChange={(e) => handleChange('nro_parqueaderos', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Columna 3: Detalles Físicos */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Dimensiones y Año</label>
                            <div className="space-y-2">
                                <span className="text-xs text-gray-500 uppercase">Año Construcción</span>
                                <input type="number" placeholder="Ej: 2015" value={filtros.anioMin} onChange={(e) => handleChange('anioMin', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs text-gray-500 uppercase">Área Construcción (m²)</span>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" value={filtros.areaMin} onChange={(e) => handleChange('areaMin', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                    <input type="number" placeholder="Max" value={filtros.areaMax} onChange={(e) => handleChange('areaMax', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Columna 4: Ordenar */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">Visualización</label>
                            <div className="space-y-2">
                                <span className="text-xs text-gray-500 uppercase">Ordenar por</span>
                                <select value={filtros.orden || 'recientes'} onChange={(e) => handleChange('orden', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 outline-none">
                                    <option value="recientes">Más recientes primero</option>
                                    <option value="antiguas">Más antiguas primero</option>
                                    <option value="precio_asc">Precio: Bajo a Alto</option>
                                    <option value="precio_desc">Precio: Alto a Bajo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Amenidades */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-4">Amenidades y Características</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {AMENIDADES.map((amenidad) => (
                                <label
                                    key={amenidad.key}
                                    className={`
                                        flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all select-none
                                        ${filtros[amenidad.key]
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                                    `}
                                >
                                    <div className={`
                                        w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0
                                        ${filtros[amenidad.key] ? 'border-white bg-transparent' : 'border-gray-300 bg-white'}
                                    `}>
                                        {filtros[amenidad.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!filtros[amenidad.key]}
                                        onChange={() => toggleAmenidad(amenidad.key)}
                                        className="hidden"
                                    />
                                    <span className="text-xs font-medium truncate">{amenidad.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
