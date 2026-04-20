import { useState, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    DollarSign,
    MapPin,
    Briefcase,
    Building2,
    CheckCircle2,
    ArrowUpDown,
    SlidersHorizontal,
    Maximize,
    BedDouble,
    Bath,
    Car,
    Ruler,
    CalendarDays
} from 'lucide-react';



const FilterChip = ({ label, activeInfo, dropdownKey, activeDropdown, setActiveDropdown, icon: Icon, children }) => {
    const isOpen = activeDropdown === dropdownKey;
    const isActive = activeInfo;

    return (
        <div className="relative inline-block">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(isOpen ? null : dropdownKey);
                }}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap
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
                    className="absolute top-full mt-2 left-0 min-w-[220px] w-max max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-[60] animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default function FiltroPropiedadesAdmin({ filtros, setFiltros, busqueda, setBusqueda }) {
    const [tipos, setTipos] = useState([]);
    const [transacciones, setTransacciones] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const filterRef = useRef(null);

    // Lista de amenidades
    const AMENIDADES = [
        { key: 'tiene_balcon', label: 'Balcón' },
        { key: 'tiene_terraza', label: 'Terraza' },
        { key: 'tiene_patio', label: 'Patio' },
        { key: 'tiene_bodega', label: 'Bodega' },
        { key: 'tiene_area_bbq', label: 'Área BBQ' },
        { key: 'tiene_piscina', label: 'Piscina' },
        { key: 'tiene_ascensor', label: 'Ascensor' },
        { key: 'tiene_seguridad', label: 'Seguridad privada' },
        { key: 'tiene_areas_comunales', label: 'Áreas comunales' },
        { key: 'tiene_gas_centralizado', label: 'Gas centralizado' },
        { key: 'tiene_lavanderia', label: 'Lavandería' },
        { key: 'tiene_cisterna', label: 'Cisterna' },
        { key: 'amoblado', label: 'Amoblado' },
    ];

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // CAMBIO: Usar endpoint específico de metadatos administrativos
                const token = localStorage.getItem('token');
                const resProps = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades/filtros-metadata`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!resProps.ok) throw new Error('Error cargando filtros');

                const { tipos, transacciones, ciudades } = await resProps.json();

                setTipos(tipos);
                setTransacciones(transacciones);
                setCiudades(ciudades);
            } catch (error) {
                console.error("Error cargando filtros:", error);
            }
        };
        cargarDatos();

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
            ubicacion: '',
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
        setShowModal(false);
    };

    const contarFiltrosActivos = () => {
        let count = 0;
        Object.keys(filtros).forEach(key => {
            if (key === 'orden' || key === 'agenteId') return; // Ignoramos orden y agente aqui
            if (filtros[key]) count++;
        });
        return count;
    };

    return (
        <div className="mb-4" ref={filterRef}>
            {/* --- BARRA PRINCIPAL --- */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-2 items-center">

                {/* 1. Buscador Robusto */}
                <div className="flex-1 w-full xl:w-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100/50 bg-transparent transition-all"
                        placeholder="Buscar por titular, código interno, descripción o propietario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="hidden xl:block w-px h-8 bg-gray-200 mx-2"></div>

                {/* 2. Chips Rápidos + Botón Modal */}
                <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto xl:overflow-visible pb-2 xl:pb-0 scrollbar-hide px-1">

                    <FilterChip
                        label={filtros.transaccion || "Operación"}
                        activeInfo={filtros.transaccion}
                        dropdownKey="transaccion"
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
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

                    <FilterChip
                        label={filtros.tipo || "Tipo"}
                        activeInfo={filtros.tipo}
                        dropdownKey="tipo"
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
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

                    <FilterChip
                        label={filtros.estado ? (filtros.estado === '__todas__' ? 'Todas' : filtros.estado.charAt(0).toUpperCase() + filtros.estado.slice(1)) : 'Disponibles'}
                        activeInfo={filtros.estado}
                        dropdownKey="estado"
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        icon={CheckCircle2}
                    >
                        <div className="flex flex-col gap-1">
                            <button onClick={() => { handleChange('estado', ''); setActiveDropdown(null) }} className={`px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg ${filtros.estado === '' ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>Disponibles (defecto)</button>
                            <button onClick={() => { handleChange('estado', '__todas__'); setActiveDropdown(null) }} className={`px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg ${filtros.estado === '__todas__' ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>Todas</button>
                            {[
                                { val: 'disponible', label: 'Disponible' },
                                { val: 'reservada', label: 'Reservada' },
                                { val: 'vendida', label: 'Vendida' },
                                { val: 'arrendada', label: 'Arrendada' },
                                { val: 'inactiva', label: 'Inactiva' }
                            ].map(opt => (
                                <button key={opt.val} onClick={() => { handleChange('estado', opt.val); setActiveDropdown(null) }} className={`px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg ${filtros.estado === opt.val ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </FilterChip>

                    {/* Boton Modal "Filtros de Búsqueda" */}
                    <button
                        onClick={() => setShowModal(true)}
                        className={`
                             whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ml-auto hover:bg-gray-50
                             ${contarFiltrosActivos() > 0 ? 'border-gray-800 bg-gray-50 text-gray-900 ring-1 ring-gray-200' : 'border-gray-200 bg-white text-gray-600'}
                        `}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filtros Globales {contarFiltrosActivos() > 0 && `(${contarFiltrosActivos()})`}</span>
                    </button>

                    {contarFiltrosActivos() > 0 && (
                        <button onClick={limpiarFiltros} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* --- MODAL "YOUTUBE STYLE" --- */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
                        onClick={(e) => e.stopPropagation()} // Evitar cerrar al clickear dentro
                    >
                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <SlidersHorizontal className="w-6 h-6" />
                                Filtros de Búsqueda
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 space-y-8">

                            {/* Seccion 1: Ubicación y Precio */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">Ubicación y Precio</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Location Search Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Ubicación</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Provincia, Ciudad, Sector, Dirección..."
                                                value={filtros.ubicacion || ''}
                                                onChange={(e) => handleChange('ubicacion', e.target.value)}
                                                className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Rango de Precio */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Rango de Precio</label>
                                        <div className="flex gap-2">
                                            <FilterChip label="Min" activeInfo={filtros.precioMin ? `$${filtros.precioMin}` : null} dropdownKey="precioMin" activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} icon={DollarSign}>
                                                <input type="number" placeholder="Min" value={filtros.precioMin} onChange={(e) => handleChange('precioMin', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
                                            </FilterChip>
                                            <span className="text-gray-400 flex items-center">-</span>
                                            <FilterChip label="Max" activeInfo={filtros.precioMax ? `$${filtros.precioMax}` : null} dropdownKey="precioMax" activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown} icon={DollarSign}>
                                                <input type="number" placeholder="Max" value={filtros.precioMax} onChange={(e) => handleChange('precioMax', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
                                            </FilterChip>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Seccion 2: Distribución y Áreas */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">Características del Inmueble</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Habitaciones */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> Habitaciones</label>
                                        <input type="number" placeholder="Min" value={filtros.habitaciones} onChange={(e) => handleChange('habitaciones', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                    {/* Baños */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> Baños</label>
                                        <input type="number" placeholder="Min" value={filtros.banos} onChange={(e) => handleChange('banos', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                    {/* Garajes */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Garajes</label>
                                        <input type="number" placeholder="Min" value={filtros.parqueaderos} onChange={(e) => handleChange('parqueaderos', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                    {/* Año */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                            <CalendarDays className="w-3.5 h-3.5" /> Año Const. (desde)
                                        </label>
                                        <input type="number" placeholder="Ej. 2010" value={filtros.anioMin} onChange={(e) => handleChange('anioMin', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    {/* Area Construccion */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> Área Construcción (m²)</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Min" value={filtros.areaConstruccionMin} onChange={(e) => handleChange('areaConstruccionMin', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                            <input type="number" placeholder="Max" value={filtros.areaConstruccionMax} onChange={(e) => handleChange('areaConstruccionMax', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>
                                    {/* Area Terreno */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Área Terreno (m²)</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Min" value={filtros.areaTerrenoMin} onChange={(e) => handleChange('areaTerrenoMin', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                            <input type="number" placeholder="Max" value={filtros.areaTerrenoMax} onChange={(e) => handleChange('areaTerrenoMax', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Seccion 3: Amenidades */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">Amenidades</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {AMENIDADES.map((amenidad) => (
                                        <div
                                            key={amenidad.key}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 group select-none ${filtros[amenidad.key] ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
                                            onClick={() => toggleAmenidad(amenidad.key)}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${filtros[amenidad.key] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                                {filtros[amenidad.key] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                            <span className={`text-sm font-medium ${filtros[amenidad.key] ? 'text-blue-700' : 'text-gray-600'}`}>
                                                {amenidad.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white z-10 rounded-b-2xl">
                            <button
                                onClick={limpiarFiltros}
                                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Limpiar todo
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-transform active:scale-95 shadow-lg shadow-gray-200"
                            >
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
        </div >
    );
}
