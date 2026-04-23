import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Briefcase, Search, Filter, RotateCw, Info, History, FileText, RefreshCw, Trash2, Lock, X, RotateCcw } from 'lucide-react';
import CrearNegociacion from '../components/CrearNegociacion';
import ActualizarEtapaForm from '../components/ActualizarEtapaForm';
import HistorialSeguimientos from '../components/HistorialSeguimientos';
import ModalArchivosAdjuntos from '../components/ModalArchivosAdjuntos';
import NotasInternas from '../components/NotasInternas';
import { PageSpinner } from '../components/Spinner';

const PanelNegociaciones = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams(); // Hook para leer URL params
    const [usuario, setUsuario] = useState(null);
    const [negociaciones, setNegociaciones] = useState([]);
    const [agentes, setAgentes] = useState([]); // 🆕 Lista de agentes
    const [loading, setLoading] = useState(true);
    const [showCrearModal, setShowCrearModal] = useState(false);
    const [showDesactivarModal, setShowDesactivarModal] = useState(false);
    const [showActualizarEtapaModal, setShowActualizarEtapaModal] = useState(false);
    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [showArchivosModal, setShowArchivosModal] = useState(false);
    const [showNotasPrivadasModal, setShowNotasPrivadasModal] = useState(false);
    const [showEtapasInfo, setShowEtapasInfo] = useState(false);
    const [negociacionSeleccionada, setNegociacionSeleccionada] = useState(null);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || ''); // Input local para debounce
    const debounceTimer = useRef(null);

    // Inicializar filtros desde la URL si existen
    const [filtros, setFiltros] = useState({
        search: searchParams.get('search') || '',
        etapa: searchParams.get('etapa') || '',
        clienteId: searchParams.get('clienteId') || '',
        propiedadId: searchParams.get('propiedadId') || '',
        incluirInactivas: false,
        agenteId: '', // 🆕 Filtro por agente
        page: parseInt(searchParams.get('page')) || 1
    });

    const [paginacion, setPaginacion] = useState({
        pagina: 1,
        limite: 10,
        total: 0,
        paginas: 0
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUsuario(decodedToken);

        // 🆕 Cargar agentes si es admin
        if (decodedToken.rol === 'admin') {
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios/agentes`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setAgentes(res.data))
                .catch(err => console.error('Error al cargar agentes:', err));
        }
    }, [navigate]);

    // Debounce para búsqueda
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setFiltros(prev => ({
                ...prev,
                search: searchInput,
                page: 1
            }));
        }, 400); // 400ms de espera

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchInput]);

    useEffect(() => {
        // Sincronizar URL con estado de filtros (opcional, pero buena práctica)
        const params = {};
        if (filtros.search) params.search = filtros.search;
        if (filtros.etapa) params.etapa = filtros.etapa;
        if (filtros.clienteId) params.clienteId = filtros.clienteId;
        if (filtros.propiedadId) params.propiedadId = filtros.propiedadId;
        if (filtros.page > 1) params.page = filtros.page;
        // No solemos poner toggles booleanos en URL a menos que sea necesario, lo omitimos para limpieza o lo ponemos string
        setSearchParams(params, { replace: true });

        cargarNegociaciones();
    }, [filtros]);

    const cargarNegociaciones = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                search: filtros.search,
                etapa: filtros.etapa,
                clienteId: filtros.clienteId,
                propiedadId: filtros.propiedadId,
                incluirInactivas: filtros.incluirInactivas,
                agenteId: filtros.agenteId, // 🆕 Enviar filtro
                page: filtros.page
            });

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/negociaciones?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setNegociaciones(response.data.negociaciones);
            setPaginacion(response.data.paginacion);
        } catch (error) {
            console.error('Error al cargar negociaciones:', error);
            toast.error('Error al cargar las negociaciones', { id: 'error-cargar-negociaciones' });
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFiltros({
            ...filtros,
            [e.target.name]: value,
            page: 1
        });
    };

    const limpiarFiltros = () => {
        setSearchInput(''); // Limpiar también el input local
        setFiltros({
            search: '',
            etapa: '',
            clienteId: '',
            propiedadId: '',
            incluirInactivas: false,
            agenteId: '', // 🆕 Resetear
            page: 1
        });
    };

    // Restaurar negociación (Admin)
    const handleRestaurar = async (negociacion) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/negociaciones/${negociacion.id}/restaurar`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(response.data.mensaje);
            cargarNegociaciones(); // Recargar lista
        } catch (error) {
            console.error('Error al restaurar:', error);
            toast.error(error.response?.data?.mensaje || 'Error al restaurar la negociación');
        }
    };

    const handleDesactivar = (negociacion) => {
        setNegociacionSeleccionada(negociacion);
        setShowDesactivarModal(true);
    };

    const handleActualizarEtapa = (negociacion) => {
        setNegociacionSeleccionada(negociacion);
        setShowActualizarEtapaModal(true);
    };

    const handleVerHistorial = (negociacion) => {
        setNegociacionSeleccionada(negociacion);
        setShowHistorialModal(true);
    };

    const handleVerArchivos = (negociacion) => {
        setNegociacionSeleccionada(negociacion);
        setShowArchivosModal(true);
    };

    const handleVerNotasPrivadas = (negociacion) => {
        setNegociacionSeleccionada(negociacion);
        setShowNotasPrivadasModal(true);
    };

    const confirmarDesactivar = async () => {
        if (!negociacionSeleccionada) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/negociaciones/${negociacionSeleccionada.id}/desactivar`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Negociación desactivada correctamente', { id: 'desactivar-negociacion' });
            setShowDesactivarModal(false);
            setNegociacionSeleccionada(null);
            cargarNegociaciones();
        } catch (error) {
            console.error('Error al desactivar negociación:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje, { id: 'error-desactivar' });
            } else {
                toast.error('Error al desactivar la negociación', { id: 'error-desactivar' });
            }
        }
    };

    const handleEtapaActualizada = () => {
        // Recargamos desde el backend para que los datos (privacidad, estado propiedad) sean correctos
        cargarNegociaciones();
        setShowActualizarEtapaModal(false);
        setNegociacionSeleccionada(null);
        toast.success('Etapa de negociación actualizada correctamente', { id: 'etapa-actualizada' });
    };

    const getEtapaColor = (etapa) => {
        const colores = {
            interes: 'bg-blue-100 text-blue-800',
            negociacion: 'bg-yellow-100 text-yellow-800',
            cierre: 'bg-purple-100 text-purple-800',
            finalizada: 'bg-green-100 text-green-800',
            cancelada: 'bg-red-100 text-red-800'
        };
        return colores[etapa] || 'bg-gray-100 text-gray-800';
    };

    const getEtapaText = (etapa) => {
        const textos = {
            interes: 'Interés',
            negociacion: 'Negociación',
            cierre: 'Cierre',
            finalizada: 'Finalizada',
            cancelada: 'Cancelada'
        };
        return textos[etapa] || etapa;
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(precio);
    };

    if (loading && negociaciones.length === 0) {
        return <PageSpinner text="Cargando negociaciones..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Negociaciones</h1>
                            <p className="text-gray-600 mt-2">
                                Administra las negociaciones entre clientes y propiedades ({paginacion.total} en total)
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCrearModal(true)}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200 flex items-center gap-2 shadow-sm"
                        >
                            <Briefcase className="w-5 h-5" />
                            Nueva Negociación
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <h2>Filtros de búsqueda</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Búsqueda */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                                Buscar
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Nombre, correo, cédula, código o título..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        {/* Etapa */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                                Etapa
                            </label>
                            <select
                                name="etapa"
                                value={filtros.etapa}
                                onChange={handleFiltroChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="">Todas las etapas</option>
                                <option value="interes">Interés</option>
                                <option value="negociacion">Negociación</option>
                                <option value="cierre">Cierre</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>

                        {/* Info Etapas */}
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => setShowEtapasInfo(true)}
                                className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition duration-200 flex items-center justify-center gap-2 h-[42px]"
                            >
                                <Info className="w-4 h-4" />
                                Info Etapas
                            </button>
                        </div>

                        {/* Filtro Agente (Solo Admin) */}
                        {usuario?.rol === 'admin' && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                                    Negociador
                                </label>
                                <select
                                    name="agenteId"
                                    value={filtros.agenteId}
                                    onChange={handleFiltroChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    {agentes.map(agente => (
                                        <option key={agente.id} value={agente.id}>
                                            {agente.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Botón limpiar y Checkbox */}
                        <div className="flex flex-col justify-end gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer p-1 rounded hover:bg-gray-100 select-none">
                                <input
                                    type="checkbox"
                                    name="incluirInactivas"
                                    checked={filtros.incluirInactivas}
                                    onChange={handleFiltroChange}
                                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 border-gray-300"
                                />
                                <span>Mostrar Inactivas</span>
                            </label>

                            <button
                                type="button"
                                onClick={limpiarFiltros}
                                className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2"
                            >
                                <RotateCw className="w-4 h-4" />
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner de Filtro Activo */}
                {(filtros.propiedadId || filtros.clienteId) && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex justify-between items-center rounded-r-lg shadow-sm">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    {filtros.propiedadId && <span>Filtrado por <strong>Propiedad</strong> </span>}
                                    {filtros.clienteId && <span>Filtrado por <strong>Cliente</strong></span>}
                                    {/* Podríamos mostrar el nombre aquí si el backend lo devolviera en metadatos, por ahora es genérico */}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={limpiarFiltros}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                        >
                            Ver todas las negociaciones
                        </button>
                    </div>
                )}

                {/* Tabla de Negociaciones */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Propiedad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Etapa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actualizado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Agentes
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {negociaciones.map((negociacion) => {
                                    const esInactiva = negociacion.propiedad.estado_publicacion === 'inactiva';
                                    const esEliminada = !negociacion.activo;
                                    const estadoProp = negociacion.propiedad.estado_publicacion;
                                    const etapaNeg = negociacion.etapa;

                                    // La negociación que provocó el cambio de estado de la propiedad
                                    const esNegGanadora =
                                        (estadoProp === 'reservada' && etapaNeg === 'cierre') ||
                                        ((estadoProp === 'vendida' || estadoProp === 'arrendada') && etapaNeg === 'finalizada');

                                    // Botón activo si:
                                    // 1. Propiedad disponible (operación normal para todos)
                                    // 2. Es la negociación ganadora (todos pueden actuar sobre ella)
                                    // 3. Es Admin (puede intervenir siempre: limpiar perdedoras, revertir, etc.)
                                    // Las negociaciones perdedoras con propiedad bloqueada solo son accesibles por Admin
                                    const botonActivo =
                                        estadoProp === 'disponible' ||
                                        esNegGanadora ||
                                        usuario?.rol === 'admin';
                                    return (
                                        <tr
                                            key={negociacion.id}
                                            className={`hover:bg-gray-50 
                                                ${negociacion.esConfidencial ? 'bg-gray-50/50 italic' : ''} 
                                                ${esInactiva ? 'bg-gray-100 opacity-75' : ''}
                                                ${esEliminada ? 'bg-red-50 opacity-60' : ''}`
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className={`text-sm font-medium ${negociacion.esConfidencial ? 'text-gray-500' : 'text-gray-900'} ${esEliminada ? 'line-through decoration-red-400' : ''}`}>
                                                        {negociacion.cliente.nombre}
                                                        {esEliminada && <span className="ml-2 text-[10px] text-red-600 font-bold no-underline">(ELIMINADA)</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {negociacion.cliente.email}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        C.I: {negociacion.cliente.cedula || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        {negociacion.propiedad.titulo}
                                                        {esInactiva && (
                                                            <span className="ml-2 text-[10px] font-bold text-white bg-gray-500 px-1.5 py-0.5 rounded" title="Propiedad desactivada">
                                                                INACTIVA
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatearPrecio(negociacion.propiedad.precio)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Cód: {negociacion.propiedad.codigo_interno || 'S/N'} | {negociacion.propiedad.ciudad}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtapaColor(negociacion.etapa)}`}>
                                                    {getEtapaText(negociacion.etapa)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatearFecha(negociacion.updatedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded mr-1">NEG</span>
                                                        <span className="text-sm text-gray-900 font-medium">{negociacion.agente.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-500 uppercase bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded mr-1">CAP</span>
                                                        <span className="text-sm text-gray-600">{negociacion.propiedad.agente?.name || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2 items-center">
                                                    {esEliminada ? (
                                                        // 🗑️ ACCIONES PARA NEGOCIACIONES ELIMINADAS
                                                        usuario?.rol === 'admin' ? (
                                                            <button
                                                                onClick={() => handleRestaurar(negociacion)}
                                                                className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all shadow-sm flex items-center gap-1"
                                                                title="Restaurar Negociación"
                                                            >
                                                                <RotateCcw className="w-4 h-4" />
                                                                <span className="text-xs font-bold pr-1">Restaurar</span>
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-gray-400 opacity-50 cursor-not-allowed px-2" title="Solo admins pueden restaurar">
                                                                <Lock className="w-3 h-3" />
                                                            </div>
                                                        )
                                                    ) : (
                                                        // ✨ ACCIONES NORMALES (Activas)
                                                        <>
                                                            {/* SI ES CONFIDENCIAL: Mostrar badge indicativo */}
                                                            {negociacion.esConfidencial && (
                                                                <span className="text-gray-400 text-[10px] uppercase font-bold mr-2 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                                                                    Confidencial
                                                                </span>
                                                            )}

                                                            {/* ACCIONES: Historial, Archivos, Notas (Solo si NO es confidencial) */}
                                                            {!negociacion.esConfidencial && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleVerHistorial(negociacion)}
                                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                        title="Ver historial de seguimientos"
                                                                    >
                                                                        <History className="w-4 h-4" />
                                                                    </button>

                                                                    {(usuario?.rol === 'admin' || (usuario?.rol === 'agente' && negociacion.agenteId === usuario?.id)) && (
                                                                        <button
                                                                            onClick={() => handleVerArchivos(negociacion)}
                                                                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                                            title="Ver archivos adjuntos"
                                                                        >
                                                                            <FileText className="w-4 h-4" />
                                                                        </button>
                                                                    )}

                                                                    {(usuario?.rol === 'agente') && (
                                                                        <button
                                                                            onClick={() => handleVerNotasPrivadas(negociacion)}
                                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                                            title="Ver notas privadas"
                                                                        >
                                                                            <Lock className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}

                                                            {/* ACTUALIZAR ETAPA */}
                                                            {
                                                                botonActivo ? (
                                                                    <button
                                                                        onClick={() => handleActualizarEtapa(negociacion)}
                                                                        className={`p-1.5 rounded-lg transition-all ${negociacion.esConfidencial
                                                                            ? 'text-orange-500 bg-orange-50 hover:bg-orange-100 ring-1 ring-orange-200'
                                                                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                                            }`}
                                                                        title={negociacion.esConfidencial ? "Gestionar Etapa (Captador)" : "Actualizar etapa"}
                                                                    >
                                                                        <RefreshCw className="w-4 h-4" />
                                                                    </button>
                                                                ) : (
                                                                    <div
                                                                        className="p-1.5 cursor-not-allowed opacity-30"
                                                                        title={`Propiedad ${estadoProp} por otra negociación. Cuando vuelva a estar disponible podrás gestionar esta negociación.`}
                                                                    >
                                                                        <RefreshCw className="w-4 h-4 text-gray-300" />
                                                                    </div>
                                                                )
                                                            }

                                                            {/* ELIMINAR/DESACTIVAR: No visible en etapas bloqueadas por el backend (cierre/finalizada) */}
                                                            {!negociacion.esConfidencial && etapaNeg !== 'cierre' && etapaNeg !== 'finalizada' && (
                                                                <button
                                                                    onClick={() => handleDesactivar(negociacion)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Desactivar negociación"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {paginacion.paginas > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setFiltros({ ...filtros, page: filtros.page - 1 })}
                                    disabled={filtros.page <= 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setFiltros({ ...filtros, page: filtros.page + 1 })}
                                    disabled={filtros.page >= paginacion.paginas}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{((filtros.page - 1) * paginacion.limite) + 1}</span> a{' '}
                                        <span className="font-medium">
                                            {Math.min(filtros.page * paginacion.limite, paginacion.total)}
                                        </span>{' '}
                                        de <span className="font-medium">{paginacion.total}</span> resultados
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {Array.from({ length: paginacion.paginas }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setFiltros({ ...filtros, page })}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === filtros.page
                                                    ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mensaje cuando no hay negociaciones */}
                {negociaciones.length === 0 && !loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">No se encontraron negociaciones</p>
                            <p className="text-gray-500 mb-6 mt-2">
                                Comienza creando tu primera negociación entre un cliente y una propiedad.
                            </p>
                            <button
                                onClick={() => setShowCrearModal(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2"
                            >
                                <Briefcase className="w-5 h-5" />
                                Crear Primera Negociación
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Crear Negociación */}
            <CrearNegociacion
                isOpen={showCrearModal}
                onClose={() => setShowCrearModal(false)}
                onSuccess={cargarNegociaciones}
                usuario={usuario}
            />

            {/* Modal de Notas Internas Privadas */}
            {showNotasPrivadasModal && negociacionSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Lock className="w-5 h-5" />
                                </span>
                                Notas Privadas
                            </h3>
                            <button
                                onClick={() => {
                                    setShowNotasPrivadasModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <NotasInternas
                                negociacion={negociacionSeleccionada}
                                usuario={usuario}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para desactivar */}
            {showDesactivarModal && negociacionSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-red-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">!</span> Desactivar Negociación
                        </h3>
                        <div className="text-gray-700 text-center mb-6">
                            <p className="mb-3">
                                ¿Estás seguro que deseas desactivar la negociación entre{' '}
                                <strong>"{negociacionSeleccionada.cliente.nombre}"</strong> y{' '}
                                <strong>"{negociacionSeleccionada.propiedad.titulo}"</strong>?
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                                <p className="text-red-800">
                                    Esta acción desactivará la negociación y ya no aparecerá en la lista activa.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setShowDesactivarModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarDesactivar}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition"
                            >
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Actualizar Etapa de Negociación */}
            {showActualizarEtapaModal && negociacionSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 rounded-lg">
                                    <RefreshCw className="w-5 h-5 text-blue-600" />
                                </span>
                                Actualizar Etapa
                            </h3>
                            <button
                                onClick={() => {
                                    setShowActualizarEtapaModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">


                            {/* Formulario de actualización */}
                            <ActualizarEtapaForm
                                negociacion={negociacionSeleccionada}
                                usuario={usuario}
                                onSuccess={handleEtapaActualizada}
                                onCancel={() => {
                                    setShowActualizarEtapaModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Historial de Seguimientos */}
            {showHistorialModal && negociacionSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] border border-gray-200 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                        <History className="w-5 h-5" />
                                    </span>
                                    Historial de Seguimientos
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 pl-9">
                                    {negociacionSeleccionada.cliente?.nombre} • {negociacionSeleccionada.propiedad?.titulo}
                                    {negociacionSeleccionada.propiedad?.codigo_interno && (
                                        <span className="ml-1.5 text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                            {negociacionSeleccionada.propiedad.codigo_interno}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowHistorialModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <HistorialSeguimientos
                                negociacion={negociacionSeleccionada}
                                usuario={usuario}
                                onSeguimientoCreado={(seguimiento) => {
                                    // Opcional: mostrar notificación o actualizar algo
                                    console.log('Nuevo seguimiento creado:', seguimiento);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Archivos Adjuntos */}
            {showArchivosModal && negociacionSeleccionada && (
                <ModalArchivosAdjuntos
                    isOpen={showArchivosModal}
                    onClose={() => {
                        setShowArchivosModal(false);
                        setNegociacionSeleccionada(null);
                    }}
                    negociacion={negociacionSeleccionada}
                    esAgenteResponsable={usuario?.rol === 'agente' && negociacionSeleccionada?.agenteId === usuario?.id}
                    esAdmin={usuario?.rol === 'admin'}
                />
            )}

            {/* Modal de Información de Etapas */}
            {showEtapasInfo && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-gray-200 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                            <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <Info className="w-5 h-5" />
                                </span>
                                Guía de Etapas
                            </h3>
                            <button
                                onClick={() => setShowEtapasInfo(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenido - Scrollable */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                            <div className="grid gap-4">
                                {/* Interés */}
                                <div className="flex gap-4 p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl h-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M3 9h4" /><path d="M3 5h4" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Interés</h4>
                                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                            El cliente ha mostrado interés inicial en la propiedad. Estamos en fase de visitas, consultas preliminares y perfilamiento del prospecto. Aún no existe una oferta formal.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Registro de cliente</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Perfilamiento</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Negociación */}
                                <div className="flex gap-4 p-4 bg-white rounded-xl border border-orange-100 shadow-sm">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl h-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Negociación</h4>
                                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                            Comenzó el diálogo comercial. El cliente ha enviado una oferta y nos encontramos debatiendo términos, montos y formas de pago. Fase crítica de seguimiento.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Visitas</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Contraofertas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cierre */}
                                <div className="flex gap-4 p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl h-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-signature"><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V20l-2-2h-3.5" /><polyline points="14 2 14 8 20 8" /><path d="M18.42 9.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 13.43-13.44Z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Cierre / Trámites</h4>
                                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                            ¡Hay un acuerdo de palabra o promesa firmada! La propiedad se encuentra reservada. Nos encontramos cursando papeleos, gestión notarial o revisión de créditos hipotecarios.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Promesa de compraventa</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Burocracia</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Finalizada */}
                                <div className="flex gap-4 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl h-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Finalizada</h4>
                                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                            ¡Operación exitosa! Los contratos definitivos han sido firmados, los fondos liquidados y las llaves entregadas a su nuevo dueño/arrendatario.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Cobro de comisión</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Entrega</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cancelada */}
                                <div className="flex gap-4 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl h-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Cancelada</h4>
                                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                                            La gestión no prosperó. Vínculo finalizado debido a falta de financiamiento, desacuerdos comerciales o desistimiento del cliente. La propiedad vuelve a estar disponible.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Cierre administrativo</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">Devolución</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Información adicional */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Consejos para el seguimiento</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Actualiza la etapa cuando haya cambios significativos en la negociación</li>
                                    <li>• Registra todos los seguimientos y comunicaciones importantes</li>
                                    <li>• Mantén los archivos y documentos organizados</li>
                                    <li>• Comunica claramente el estado a todas las partes involucradas</li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0 bg-white">
                            <button
                                onClick={() => setShowEtapasInfo(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelNegociaciones;
