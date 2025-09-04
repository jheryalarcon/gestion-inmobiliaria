import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CrearNegociacion = ({ isOpen, onClose, onSuccess, usuario }) => {
    const [formData, setFormData] = useState({
        clienteId: '',
        propiedadId: ''
    });
    const [clientes, setClientes] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [propiedadesCompletas, setPropiedadesCompletas] = useState([]); // Todas las propiedades disponibles
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [mostrarSoloPropias, setMostrarSoloPropias] = useState(false);
    const [textoBusqueda, setTextoBusqueda] = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarDatos();
        }
    }, [isOpen, usuario]);

    const cargarDatos = async () => {
        setLoadingData(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Cargar clientes del agente
            const clientesResponse = await axios.get(
                `http://localhost:3000/api/clientes?estado=activo`,
                { headers }
            );

            // 🏠 Cargar SOLO propiedades DISPONIBLES para negociaciones
            // Esta ruta permite a admin y agente ver todas las propiedades disponibles del sistema
            const propiedadesResponse = await axios.get(
                `http://localhost:3000/api/propiedades/negociaciones/disponibles?includeAgente=true`,
                { headers }
            );

            // Filtrar clientes según el rol del usuario
            let clientesFiltrados = clientesResponse.data?.clientes || [];
            if (usuario?.rol === 'agente' && Array.isArray(clientesFiltrados)) {
                clientesFiltrados = clientesFiltrados.filter(
                    cliente => cliente.agenteId === usuario.id
                );
            }

            // 🏠 Filtrar propiedades según la preferencia del usuario
            let propiedadesFiltradas = propiedadesResponse.data || [];
            
            // ✅ Para AGENTES: Si marca "Mostrar solo mis propiedades", filtrar por sus propiedades
            if (usuario?.rol === 'agente' && mostrarSoloPropias && Array.isArray(propiedadesFiltradas)) {
                propiedadesFiltradas = propiedadesFiltradas.filter(
                    propiedad => propiedad.agente?.id === usuario.id
                );
            }
            // ✅ Para ADMIN: Siempre ve todas las propiedades disponibles del sistema
            // No se aplica filtro adicional

            setClientes(clientesFiltrados);
            setPropiedades(propiedadesFiltradas);
            setPropiedadesCompletas(propiedadesResponse.data || []); // Guardar todas las propiedades
            

        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos necesarios');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.clienteId || !formData.propiedadId) {
            toast.error('Por favor selecciona un cliente y una propiedad');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3000/api/negociaciones',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(response.data.mensaje);
            setFormData({ clienteId: '', propiedadId: '' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al crear negociación:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('Error al crear la negociación');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 🏠 Función para aplicar filtros combinados (checkbox + búsqueda)
    const aplicarFiltrosCombinados = (soloPropias, busqueda) => {
        let propiedadesFiltradas = propiedadesCompletas.filter(propiedad => {
            // Filtro de búsqueda
            const texto = `${propiedad.titulo} ${propiedad.ciudad} ${propiedad.tipo_propiedad}`.toLowerCase();
            const coincideBusqueda = busqueda.trim() === '' || texto.includes(busqueda);
            
            // Filtro de "solo mis propiedades" si está activo
            const coincideFiltro = !soloPropias || usuario?.rol !== 'agente' || propiedad.agente?.id === usuario.id;
            
            return coincideBusqueda && coincideFiltro;
        });
        
        setPropiedades(propiedadesFiltradas);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 transition-all duration-300 max-h-[90vh] flex flex-col">
                {/* Header fijo */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                        <span className="text-2xl">🤝</span>
                        Crear Nueva Negociación
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-6">

                {loadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Cargando datos...</span>
                    </div>
                ) : (
                    <form id="form-negociacion" onSubmit={handleSubmit} className="space-y-6">
                        {/* Selección de Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cliente <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="clienteId"
                                value={formData.clienteId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={!clientes || clientes.length === 0}
                            >
                                <option value="">Selecciona un cliente</option>
                                {Array.isArray(clientes) && clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre} - {cliente.email} ({cliente.tipo_cliente})
                                    </option>
                                ))}
                            </select>
                            {(!clientes || clientes.length === 0) && (
                                <p className="text-sm text-orange-600 mt-1">
                                    No hay clientes disponibles para crear negociaciones
                                </p>
                            )}
                        </div>

                        {/* Selección de Propiedad */}
                        <div>
                            {/* Toggle para filtrar propiedades (solo para agentes) */}
                            {usuario?.rol === 'agente' && (
                                <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={mostrarSoloPropias}
                                            onChange={(e) => {
                                                const nuevoValor = e.target.checked;
                                                setMostrarSoloPropias(nuevoValor);
                                                setFormData({ ...formData, propiedadId: '' }); // Limpiar selección

                                                // 🏠 Aplicar filtros combinados (checkbox + búsqueda)
                                                aplicarFiltrosCombinados(nuevoValor, textoBusqueda);
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Mostrar solo mis propiedades
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-600 mt-1 ml-6">
                                        {mostrarSoloPropias 
                                            ? 'Mostrando solo propiedades que creaste'
                                            : 'Mostrando todas las propiedades disponibles del sistema'
                                        }
                                    </p>
                                </div>
                            )}
                            
                            {/* Información del número de propiedades */}
                            <div className="mb-2 flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                Propiedad <span className="text-red-500">*</span>
                            </label>
                                <span className="text-xs text-gray-500">
                                    {Array.isArray(propiedades) ? (
                                        textoBusqueda || mostrarSoloPropias ? (
                                            <span>
                                                Mostrando {propiedades.length} de {propiedadesCompletas.length} propiedad(es)
                                                {textoBusqueda && <span className="text-blue-600"> • Búsqueda: "{textoBusqueda}"</span>}
                                                {mostrarSoloPropias && <span className="text-green-600"> • Solo mis propiedades</span>}
                                            </span>
                                        ) : (
                                            `${propiedades.length} propiedad(es) disponible(s)`
                                        )
                                    ) : 'Cargando...'}
                                </span>
                            </div>
                            
                            {/* 🔍 Campo de búsqueda para propiedades */}
                            {Array.isArray(propiedadesCompletas) && propiedadesCompletas.length > 5 && (
                                <div className="mb-3 relative">
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar propiedad por título, ciudad o tipo..."
                                        value={textoBusqueda}
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onChange={(e) => {
                                            const busqueda = e.target.value.toLowerCase();
                                            setTextoBusqueda(busqueda);
                                            
                                            // Aplicar filtros combinados
                                            aplicarFiltrosCombinados(mostrarSoloPropias, busqueda);
                                        }}
                                    />
                                    {textoBusqueda && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTextoBusqueda('');
                                                aplicarFiltrosCombinados(mostrarSoloPropias, '');
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Limpiar búsqueda"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            )}
                            <select
                                name="propiedadId"
                                value={formData.propiedadId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={!propiedades || propiedades.length === 0}
                            >
                                <option value="">Selecciona una propiedad</option>
                                {Array.isArray(propiedades) && propiedades.map(propiedad => {
                                    const esPropia = propiedad.agente?.id === usuario?.id;
                                    const agenteInfo = esPropia ? '🏠 MÍA' : `🤝 ${propiedad.agente?.name}`;
                                    
                                    return (
                                    <option key={propiedad.id} value={propiedad.id}>
                                            {propiedad.titulo} | ${propiedad.precio} | {propiedad.ciudad} | {propiedad.tipo_propiedad} | {agenteInfo}
                                    </option>
                                    );
                                })}
                            </select>
                            {(!propiedades || propiedades.length === 0) && (
                                <p className="text-sm text-orange-600 mt-1">
                                    No hay propiedades disponibles para crear negociaciones
                                </p>
                            )}
                            
                            {/* Información detallada de la propiedad seleccionada */}
                            {formData.propiedadId && Array.isArray(propiedades) && (
                                (() => {
                                    const propiedadSeleccionada = propiedades.find(p => p.id == formData.propiedadId);
                                    if (propiedadSeleccionada) {
                                        const esPropia = propiedadSeleccionada.agente?.id === usuario?.id;
                                        

                                        
                                        return (
                                            <div className={`mt-3 p-4 rounded-lg border-2 ${
                                                esPropia 
                                                    ? 'bg-green-50 border-green-300 text-green-800' 
                                                    : 'bg-blue-50 border-blue-300 text-blue-800'
                                            }`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">
                                                        {esPropia ? '🏠' : '🤝'}
                                                    </span>
                                                    <h4 className="font-bold text-lg">
                                                        {esPropia ? 'Propiedad Propia' : 'Propiedad de Otro Agente'}
                                                    </h4>
                                                </div>
                                                
                                                {/* Layout de dos columnas: Imagen + Información */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Columna 1: Imagen */}
                                                    <div className="md:col-span-1">
                                                        {propiedadSeleccionada.imagenes && propiedadSeleccionada.imagenes.length > 0 ? (
                                                            <img 
                                                                src={propiedadSeleccionada.imagenes[0].url} 
                                                                alt={propiedadSeleccionada.titulo}
                                                                className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                                onLoad={(e) => {
                                                                    console.log('✅ Imagen cargada exitosamente:', e.target.src);
                                                                }}
                                                                onError={(e) => {
                                                                    console.error('❌ Error al cargar imagen:', e.target.src);
                                                                    // Mostrar fallback en caso de error
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = `
                                                                        <div class="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500">
                                                                            <div class="text-center">
                                                                                <div class="text-3xl mb-1">🏠</div>
                                                                                <p class="text-sm">Sin imagen</p>
                                                                            </div>
                                                                        </div>
                                                                    `;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500">
                                                                <div className="text-center">
                                                                    <div className="text-3xl mb-1">🏠</div>
                                                                    <p className="text-sm">Sin imagen</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Columna 2: Información de la propiedad */}
                                                    <div className="md:col-span-2">
                                                        {/* Información principal de la propiedad */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Título</p>
                                                                <p className="font-medium">{propiedadSeleccionada.titulo}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Precio</p>
                                                                <p className="font-medium">${propiedadSeleccionada.precio}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ubicación</p>
                                                                <p className="font-medium">{propiedadSeleccionada.ciudad}, {propiedadSeleccionada.provincia}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tipo</p>
                                                                <p className="font-medium capitalize">{propiedadSeleccionada.tipo_propiedad?.replace('_', ' ')}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Información del agente */}
                                                        <div className={`p-2 rounded ${
                                                            esPropia ? 'bg-green-100' : 'bg-blue-100'
                                                        }`}>
                                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                                                {esPropia ? 'Tu Propiedad' : 'Agente Responsable'}
                                                            </p>
                                                <p className="font-medium">
                                                    {esPropia 
                                                        ? 'Esta es tu propiedad, puedes gestionarla completamente.'
                                                                    : `${propiedadSeleccionada.agente?.name} (${propiedadSeleccionada.agente?.email})`
                                                    }
                                                </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()
                            )}
                        </div>

                        {/* Información adicional */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Información</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• La negociación se creará con etapa "Interés"</li>
                                <li>• Solo puedes vincular clientes que te pertenezcan</li>
                                <li>• Puedes seleccionar cualquier propiedad disponible del sistema</li>
                                <li>• Las propiedades pueden ser de otros agentes (se indica en el selector)</li>
                                <li>• Usa el toggle para filtrar solo tus propiedades si lo prefieres</li>
                                <li>• No se pueden crear negociaciones duplicadas</li>
                                <li>• Podrás actualizar la etapa de la negociación después</li>
                            </ul>
                        </div>
                    </form>
                )}
                        </div>

                {/* Footer fijo con botones */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                            form="form-negociacion"
                                disabled={loading || !formData.clienteId || !formData.propiedadId}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando...
                                    </span>
                                ) : (
                                    'Crear Negociación'
                                )}
                            </button>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default CrearNegociacion;
