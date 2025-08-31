import { useState, useEffect } from 'react';

export default function FiltrosPropiedades({ filtros, setFiltros, onFiltrar, busqueda, setBusqueda }) {
    const [ciudades, setCiudades] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [transacciones, setTransacciones] = useState([]);

    // Cargar opciones de filtros desde la API
    useEffect(() => {
        cargarOpcionesFiltros();
    }, []);

    const cargarOpcionesFiltros = async () => {
        try {
            // Obtener todas las propiedades para extraer opciones únicas
            const response = await fetch('http://localhost:3000/api/propiedades/publicas');
            const propiedades = await response.json();

            // Extraer ciudades únicas
            const ciudadesUnicas = [...new Set(propiedades.map(p => p.ciudad))].sort();
            setCiudades(ciudadesUnicas);

            // Tipos de propiedad
            const tiposUnicos = [...new Set(propiedades.map(p => p.tipo_propiedad))].sort();
            setTipos(tiposUnicos);

            // Transacciones
            const transaccionesUnicas = [...new Set(propiedades.map(p => p.transaccion))].sort();
            setTransacciones(transaccionesUnicas);
        } catch (error) {
            // Error silencioso para filtros
        }
    };

    const handleFiltroChange = (campo, valor) => {
        const nuevosFiltros = {
            ...filtros,
            [campo]: valor
        };
        setFiltros(nuevosFiltros);
        // No llamamos onFiltrar aquí porque se maneja en el useEffect de Propiedades.jsx
    };

    const limpiarFiltros = () => {
        const filtrosLimpios = {
            tipo_propiedad: '',
            ciudad: '',
            minPrecio: '',
            maxPrecio: '',
            nro_habitaciones: '',
            nro_banos: '',
            transaccion: ''
        };
        setFiltros(filtrosLimpios);
        setBusqueda(''); // Limpiar también la búsqueda
        // No llamamos onFiltrar aquí porque se maneja en el useEffect de Propiedades.jsx
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            {/* Barra de búsqueda integrada */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por título de propiedad..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                {/* Tipo de propiedad */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de propiedad
                    </label>
                    <select
                        value={filtros.tipo_propiedad}
                        onChange={(e) => handleFiltroChange('tipo_propiedad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los tipos</option>
                        {tipos.map(tipo => (
                            <option key={tipo} value={tipo}>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ciudad */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                    </label>
                    <select
                        value={filtros.ciudad}
                        onChange={(e) => handleFiltroChange('ciudad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las ciudades</option>
                        {ciudades.map(ciudad => (
                            <option key={ciudad} value={ciudad}>{ciudad}</option>
                        ))}
                    </select>
                </div>

                {/* Transacción */}
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transacción
                    </label>
                    <select
                        value={filtros.transaccion}
                        onChange={(e) => handleFiltroChange('transaccion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas</option>
                        {transacciones.map(trans => (
                            <option key={trans} value={trans}>
                                {trans.charAt(0).toUpperCase() + trans.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Precio mínimo */}
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio mínimo
                    </label>
                    <input
                        type="number"
                        placeholder="USD"
                        value={filtros.minPrecio}
                        onChange={(e) => handleFiltroChange('minPrecio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Precio máximo */}
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio máximo
                    </label>
                    <input
                        type="number"
                        placeholder="USD"
                        value={filtros.maxPrecio}
                        onChange={(e) => handleFiltroChange('maxPrecio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Habitaciones */}
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Habitaciones
                    </label>
                    <select
                        value={filtros.nro_habitaciones}
                        onChange={(e) => handleFiltroChange('nro_habitaciones', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Baños
                    </label>
                    <select
                        value={filtros.nro_banos}
                        onChange={(e) => handleFiltroChange('nro_banos', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Cualquiera</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                </div>

                {/* Botón limpiar filtros */}
                <div className="min-w-[120px]">
                    <button
                        onClick={limpiarFiltros}
                        className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    );
}
