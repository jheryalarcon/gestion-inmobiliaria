import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Briefcase, X, Building2, User, Search, Handshake, Info, MapPin, Check } from 'lucide-react';
import Spinner, { ButtonSpinner } from './Spinner';

const CrearNegociacion = ({ isOpen, onClose, onSuccess, usuario }) => {
    const [formData, setFormData] = useState({
        clienteId: '',
        propiedadId: '',
        agenteId: '' // Para uso de ADMIN: Asignar manualmente
    });
    const [clientes, setClientes] = useState([]);
    const [propiedades, setPropiedades] = useState([]);
    const [propiedadesCompletas, setPropiedadesCompletas] = useState([]); // Todas las propiedades disponibles
    const [agentes, setAgentes] = useState([]); // Lista de agentes (solo admin)
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [mostrarSoloPropias, setMostrarSoloPropias] = useState(false);

    // Estados para búsquedas estilo "Autocomplete"
    const [busquedaPropiedad, setBusquedaPropiedad] = useState('');
    const [mostrarPropiedadesDropdown, setMostrarPropiedadesDropdown] = useState(false);

    const [busquedaCliente, setBusquedaCliente] = useState('');
    const [mostrarClientesDropdown, setMostrarClientesDropdown] = useState(false);

    const propiedadRef = useRef(null);
    const clienteRef = useRef(null);

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

            setClientes(clientesFiltrados);
            setPropiedades(propiedadesFiltradas);
            setPropiedadesCompletas(propiedadesResponse.data || []); // Guardar todas las propiedades

            // 👮‍♂️ Cargar Agentes SOLO SI ES ADMIN
            if (usuario?.rol === 'admin') {
                const agentesResponse = await axios.get(
                    `http://localhost:3000/api/agentes?limit=100`, // Traer todos (límite alto)
                    { headers }
                );
                // Filtrar solo usuarios con rol 'agente' o 'admin' activos
                const listaAgentes = agentesResponse.data?.agentes || [];
                setAgentes(listaAgentes.filter(a => a.activo));
            }

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
            toast.error('Por favor selecciona un cliente y una propiedad', { id: 'warn-campos-negociacion' });
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

            toast.success(response.data.mensaje, { id: 'success-crear-negociacion' });
            // Resetear formulario completo
            setFormData({ clienteId: '', propiedadId: '', agenteId: '' });
            setBusquedaCliente('');
            setBusquedaPropiedad('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al crear negociación:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje, { id: 'error-crear-negociacion' });
            } else {
                toast.error('Error al crear la negociación', { id: 'error-crear-negociacion' });
            }
        } finally {
            setLoading(false);
        }
    };

    // Click Outside Listeners
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Cliente Search
            if (clienteRef.current && !clienteRef.current.contains(event.target)) {
                setMostrarClientesDropdown(false);
                // Si cierra sin seleccionar y había texto, limpiar búsqueda para mostrar el seleccionado real (o vacío)
                if (!formData.clienteId) {
                    setBusquedaCliente('');
                } else {
                    const selected = clientes.find(c => c.id === parseInt(formData.clienteId));
                    setBusquedaCliente(selected ? selected.nombre : '');
                }
            }
            // Propiedad Search
            if (propiedadRef.current && !propiedadRef.current.contains(event.target)) {
                setMostrarPropiedadesDropdown(false);
                if (!formData.propiedadId) {
                    setBusquedaPropiedad('');
                } else {
                    const selected = propiedadesCompletas.find(p => p.id === parseInt(formData.propiedadId));
                    setBusquedaPropiedad(selected ? selected.titulo : '');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [formData.clienteId, formData.propiedadId, clientes, propiedadesCompletas]);

    // Filtrado de Clientes
    const clientesFiltrados = clientes.filter(cliente => {
        const term = busquedaCliente.toLowerCase();
        return (
            cliente.nombre.toLowerCase().includes(term) ||
            (cliente.email && cliente.email.toLowerCase().includes(term)) ||
            (cliente.cedula && cliente.cedula.includes(term))
        );
    });

    // Filtrado de Propiedades
    const propiedadesFiltradas = propiedadesCompletas.filter(propiedad => {
        // 1. Filtro de Texto
        const term = busquedaPropiedad.toLowerCase();
        const textoComp = `${propiedad.titulo} ${propiedad.ciudad} ${propiedad.tipo_propiedad}`.toLowerCase();
        const coincideBusqueda = term === '' || textoComp.includes(term);

        // 2. Filtro de "Solo mis propiedades"
        const coincidePropias = !mostrarSoloPropias || usuario?.rol !== 'agente' || propiedad.agente?.id === usuario.id;

        return coincideBusqueda && coincidePropias;
    }).slice(0, 50); // Limitar resultados para rendimiento

    const handleSelectCliente = (cliente) => {
        setFormData({ ...formData, clienteId: cliente.id });
        setBusquedaCliente(cliente.nombre);
        setMostrarClientesDropdown(false);
    };

    const handleSelectPropiedad = (propiedad) => {
        setFormData({ ...formData, propiedadId: propiedad.id });
        setBusquedaPropiedad(propiedad.titulo);
        setMostrarPropiedadesDropdown(false);
    };

    const limpiarCliente = () => {
        setFormData({ ...formData, clienteId: '' });
        setBusquedaCliente('');
    };

    const limpiarPropiedad = () => {
        setFormData({ ...formData, propiedadId: '' });
        setBusquedaPropiedad('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 transition-all duration-300 max-h-[90vh] flex flex-col">
                {/* Header fijo */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Briefcase className="w-6 h-6 text-orange-600" />
                        </div>
                        Crear Nueva Negociación
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-6">

                    {loadingData ? (
                        <div className="flex justify-center items-center py-8">
                            <Spinner size="md" text="Cargando datos..." />
                        </div>
                    ) : (
                        <form id="form-negociacion" onSubmit={handleSubmit} className="space-y-6">
                            {/* Selección de Cliente con Autocomplete */}
                            <div ref={clienteRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cliente <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="🔍 Buscar cliente por nombre, email o cédula..."
                                            value={busquedaCliente}
                                            onChange={(e) => {
                                                setBusquedaCliente(e.target.value);
                                                setMostrarClientesDropdown(true);
                                                // Si edita, reseteamos la selección real
                                                if (formData.clienteId) setFormData(prev => ({ ...prev, clienteId: '' }));
                                            }}
                                            onClick={() => setMostrarClientesDropdown(true)}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm ${formData.clienteId ? 'border-orange-500 bg-orange-50/30' : 'border-gray-300'
                                                }`}
                                        />
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />

                                        {formData.clienteId ? (
                                            <button
                                                type="button"
                                                onClick={limpiarCliente}
                                                className="absolute right-3 top-3 text-orange-500 hover:text-orange-700 p-0.5 rounded-full hover:bg-orange-100 transition-colors"
                                                title="Limpiar selección"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            busquedaCliente && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBusquedaCliente('');
                                                        setMostrarClientesDropdown(true);
                                                    }}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                                                    title="Borrar texto"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {/* Dropdown de Resultados Clientes */}
                                    {mostrarClientesDropdown && (
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                            {clientesFiltrados.length > 0 ? (
                                                clientesFiltrados.map(cliente => (
                                                    <div
                                                        key={cliente.id}
                                                        onClick={() => handleSelectCliente(cliente)}
                                                        className={`px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 group transition-colors flex justify-between items-center ${formData.clienteId === cliente.id ? 'bg-orange-50' : ''
                                                            }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className={`font-semibold text-sm ${formData.clienteId === cliente.id ? 'text-orange-700' : 'text-gray-800'}`}>
                                                                    {cliente.nombre}
                                                                </p>
                                                                {formData.clienteId === cliente.id && <Check className="w-3 h-3 text-orange-600" />}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                                <span>{cliente.email || 'Sin email'}</span>
                                                                <span className="bg-gray-100 px-1.5 rounded text-[10px] uppercase border border-gray-200">
                                                                    {cliente.tipo_cliente}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        {cliente.cedula && (
                                                            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                                                                {cliente.cedula}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-gray-400 text-sm flex flex-col items-center">
                                                    <User className="w-8 h-8 mb-2 opacity-20" />
                                                    <p>No se encontraron clientes</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {(!clientes || clientes.length === 0) && (
                                    <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        No hay clientes disponibles
                                    </p>
                                )}
                            </div>

                            {/* Selección de Propiedad con Autocomplete */}
                            <div ref={propiedadRef}>
                                {/* Toggle para filtrar propiedades (solo para agentes) */}
                                {usuario?.rol === 'agente' && (
                                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={mostrarSoloPropias}
                                                onChange={(e) => {
                                                    setMostrarSoloPropias(e.target.checked);
                                                    setFormData(prev => ({ ...prev, propiedadId: '' }));
                                                    setBusquedaPropiedad('');
                                                }}
                                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Mostrar solo mis propiedades
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Propiedad <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="🔍 Buscar propiedad por título, ciudad o tipo..."
                                            value={busquedaPropiedad}
                                            onChange={(e) => {
                                                setBusquedaPropiedad(e.target.value);
                                                setMostrarPropiedadesDropdown(true);
                                                if (formData.propiedadId) setFormData(prev => ({ ...prev, propiedadId: '' }));
                                            }}
                                            onClick={() => setMostrarPropiedadesDropdown(true)}
                                            className={`w-full pl-10 pr-10 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm ${formData.propiedadId ? 'border-orange-500 bg-orange-50/30' : 'border-gray-300'
                                                }`}
                                        />
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />

                                        {formData.propiedadId ? (
                                            <button
                                                type="button"
                                                onClick={limpiarPropiedad}
                                                className="absolute right-3 top-3 text-orange-500 hover:text-orange-700 p-0.5 rounded-full hover:bg-orange-100 transition-colors"
                                                title="Limpiar selección"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            busquedaPropiedad && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBusquedaPropiedad('');
                                                        setMostrarPropiedadesDropdown(true);
                                                    }}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                                                    title="Borrar texto"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {/* Dropdown de Resultados Propiedades */}
                                    {mostrarPropiedadesDropdown && (
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                            {propiedadesFiltradas.length > 0 ? (
                                                propiedadesFiltradas.map(propiedad => {
                                                    const esPropia = propiedad.agente?.id === usuario?.id;
                                                    return (
                                                        <div
                                                            key={propiedad.id}
                                                            onClick={() => handleSelectPropiedad(propiedad)}
                                                            className={`px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 group transition-colors ${formData.propiedadId === propiedad.id ? 'bg-orange-50' : ''
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-semibold text-gray-800 text-sm">{propiedad.titulo}</p>
                                                                        {esPropia && (
                                                                            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded border border-green-200 uppercase font-bold">Mía</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                                        <span className="font-medium text-orange-600">${propiedad.precio}</span>
                                                                        <span className="text-gray-300">|</span>
                                                                        <span>{propiedad.ciudad}</span>
                                                                        <span className="text-gray-300">|</span>
                                                                        <span className="capitalize">{propiedad.tipo_propiedad?.replace('_', ' ')}</span>
                                                                    </p>
                                                                </div>
                                                                {!esPropia && propiedad.agente && (
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Agente</p>
                                                                        <p className="text-xs text-gray-600 font-medium">{propiedad.agente.name}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-4 py-8 text-center text-gray-400 text-sm flex flex-col items-center">
                                                    <Building2 className="w-8 h-8 mb-2 opacity-20" />
                                                    <p>No se encontraron propiedades</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {(!propiedades || propiedades.length === 0) && (
                                    <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        No hay propiedades disponibles
                                    </p>
                                )}
                            </div>

                            {/* 👮‍♂️ Selector de Agente Responsable (Solo Admin) */}
                            {usuario?.rol === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Asignar Agente Responsable <span className="text-gray-400 font-normal">(Opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.agenteId}
                                            onChange={(e) => setFormData({ ...formData, agenteId: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white font-medium text-gray-700"
                                        >
                                            <option value="">-- Asignar a {formData.clienteId ? 'quien gestiona al cliente' : 'mí mismo'} --</option>
                                            {agentes.map(agente => (
                                                <option key={agente.id} value={agente.id}>
                                                    {agente.name} — {agente.email}
                                                </option>
                                            ))}
                                        </select>
                                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                        <div className="absolute right-3 top-3.5 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-1">
                                        Si se deja vacío, la negociación se asignará automáticamente.
                                    </p>
                                </div>
                            )}

                            {/* Información detallada de la propiedad seleccionada */}
                            {formData.propiedadId && Array.isArray(propiedades) && (
                                (() => {
                                    const propiedadSeleccionada = propiedades.find(p => p.id == formData.propiedadId);
                                    if (propiedadSeleccionada) {
                                        const esPropia = propiedadSeleccionada.agente?.id === usuario?.id;

                                        return (
                                            <div className={`mt-3 p-4 rounded-lg border-2 ${esPropia
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
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.parentElement.innerHTML = `
                                                                        <div class="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500">
                                                                            <div class="text-center">
                                                                                <div class="text-center text-gray-400">
                                                                                    {/* SVG placeholder manual since innerHTML doesn't render React components */}
                                                                                    <svg class="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                                    </svg>
                                                                                    <p class="text-sm">Sin imagen</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    `;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500">
                                                                <div className="text-center text-gray-400">
                                                                    <Building2 className="w-8 h-8 mx-auto mb-1" />
                                                                    <p className="text-sm">Sin imagen</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Columna 2: Información de la propiedad */}
                                                    <div className="md:col-span-2">
                                                        {/* Información principal */}
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
                                                        <div className={`p-2 rounded mt-2 ${esPropia ? 'bg-green-100/50' : 'bg-orange-100/50'
                                                            }`}>
                                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {esPropia ? 'Gestionada por ti' : 'Agente Responsable'}
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

                            {/* Información adicional */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Información
                                </h4>
                                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside ml-1">
                                    <li>La negociación se creará con etapa "Interés".</li>
                                    <li>Puedes asignar a otro agente para que gestione esta negociación (Solo Admin).</li>
                                    <li>Las propiedades pueden ser de otros agentes (Cross-selling).</li>
                                    <li>Verifica que la propiedad seleccionada esté disponible.</li>
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
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <ButtonSpinner size="sm" color="white" />
                                    <span className="ml-2">Creando...</span>
                                </span>
                            ) : (
                                <>
                                    <Briefcase className="w-4 h-4" />
                                    Crear Negociación
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearNegociacion;
