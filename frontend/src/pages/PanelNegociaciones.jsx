import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Briefcase, Search, Filter, RotateCw, Info, History, FileText, RefreshCw, Trash2 } from 'lucide-react';
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

        // No cargamos aquí, el useEffect de filtros se encargará
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
        if (filtros.clienteId) params.clienteId = filtros.clienteId; // Nuevo
        if (filtros.propiedadId) params.propiedadId = filtros.propiedadId; // Nuevo
        if (filtros.page > 1) params.page = filtros.page;
        setSearchParams(params);

        cargarNegociaciones();
    }, [filtros]);

    const cargarNegociaciones = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                search: filtros.search,
                etapa: filtros.etapa,
                clienteId: filtros.clienteId, // Enviar al backend
                propiedadId: filtros.propiedadId, // Enviar al backend
                page: filtros.page
            });

            const response = await axios.get(
                `http://localhost:3000/api/negociaciones?${params}`,
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
        setFiltros({
            ...filtros,
            [e.target.name]: e.target.value,
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
            page: 1
        });
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
                `http://localhost:3000/api/negociaciones/${negociacionSeleccionada.id}/desactivar`,
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

    const handleEtapaActualizada = (negociacionActualizada) => {
        // Actualizar la negociación en el estado local
        setNegociaciones(prev =>
            prev.map(n =>
                n.id === negociacionActualizada.id ? negociacionActualizada : n
            )
        );
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
                                    placeholder="Cliente o propiedad..."
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
                                className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition duration-200 flex items-center justify-center gap-2"
                            >
                                <Info className="w-4 h-4" />
                                Info Etapas
                            </button>
                        </div>

                        {/* Botón limpiar */}
                        <div className="flex items-end">
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
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Agente
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {negociaciones.map((negociacion) => (
                                    <tr key={negociacion.id} className={`hover:bg-gray-50 ${negociacion.esConfidencial ? 'bg-gray-50/50 italic' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className={`text-sm font-medium ${negociacion.esConfidencial ? 'text-gray-500' : 'text-gray-900'}`}>
                                                    {negociacion.cliente.nombre}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {negociacion.cliente.email}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {negociacion.cliente.tipo_cliente}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {negociacion.propiedad.titulo}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatearPrecio(negociacion.propiedad.precio)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {negociacion.propiedad.ciudad}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtapaColor(negociacion.etapa)}`}>
                                                {getEtapaText(negociacion.etapa)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearFecha(negociacion.fecha_inicio)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {negociacion.agente.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {negociacion.agente.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {/* Solo permitir acciones si NO es confidencial (es mi negociación o soy admin) */}
                                                {!negociacion.esConfidencial ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerHistorial(negociacion)}
                                                            className="text-green-600 hover:text-green-900 transition duration-200 flex items-center gap-1"
                                                            title="Ver historial de seguimientos"
                                                        >
                                                            <History className="w-4 h-4" />
                                                            Historial
                                                        </button>

                                                        {(usuario?.rol === 'admin' || (usuario?.rol === 'agente' && negociacion.agenteId === usuario?.id)) && (
                                                            <button
                                                                onClick={() => handleVerArchivos(negociacion)}
                                                                className="text-purple-600 hover:text-purple-900 transition duration-200 flex items-center gap-1"
                                                                title="Ver archivos adjuntos"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                Archivos
                                                            </button>
                                                        )}

                                                        {(usuario?.rol === 'agente') && (
                                                            <button
                                                                onClick={() => handleVerNotasPrivadas(negociacion)}
                                                                className="text-amber-600 hover:text-amber-900 transition duration-200 flex items-center gap-1"
                                                                title="Ver mis notas privadas"
                                                            >
                                                                <span className="text-lg">🔒</span>
                                                                Notas
                                                            </button>
                                                        )}

                                                        {(usuario?.rol === 'admin' || (usuario?.rol === 'agente' && negociacion.agenteId === usuario?.id)) && (
                                                            negociacion.propiedad.estado_publicacion === 'disponible' ||
                                                                (negociacion.propiedad.estado_publicacion === 'reservada' && negociacion.etapa === 'cierre') || usuario?.rol === 'admin' ? (
                                                                <button
                                                                    onClick={() => handleActualizarEtapa(negociacion)}
                                                                    className="text-indigo-600 hover:text-indigo-900 transition duration-200 flex items-center gap-1"
                                                                    title="Actualizar etapa de la negociación"
                                                                >
                                                                    <RefreshCw className="w-4 h-4" />
                                                                    Etapa
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400 cursor-not-allowed text-sm py-1" title={`Propiedad no disponible (${negociacion.propiedad.estado_publicacion})`}>
                                                                    ⏸️ Pausada
                                                                </span>
                                                            )
                                                        )}

                                                        <button
                                                            onClick={() => handleDesactivar(negociacion)}
                                                            className="text-red-600 hover:text-red-900 transition duration-200 flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Desactivar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        Confidencial
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-purple-50">
                            <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                <span>🔒</span> Mis Notas Privadas
                            </h3>
                            <button
                                onClick={() => {
                                    setShowNotasPrivadasModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
                                <span className="text-2xl">↻</span>
                                Actualizar Etapa
                            </h3>
                            <button
                                onClick={() => {
                                    setShowActualizarEtapaModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6">
                            {/* Información de la negociación */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Negociación</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><strong>Cliente:</strong> {negociacionSeleccionada.cliente?.nombre}</p>
                                    <p><strong>Propiedad:</strong> {negociacionSeleccionada.propiedad?.titulo}</p>
                                    <p><strong>Etapa actual:</strong>
                                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {getEtapaText(negociacionSeleccionada.etapa)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Formulario de actualización */}
                            <ActualizarEtapaForm
                                negociacion={negociacionSeleccionada}
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] border border-gray-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                                    <span className="text-2xl">📄</span>
                                    Historial de Seguimientos
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {negociacionSeleccionada.cliente?.nombre} - {negociacionSeleccionada.propiedad?.titulo}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowHistorialModal(false);
                                    setNegociacionSeleccionada(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                                <span className="text-2xl">i</span>
                                Etapas de Negociación
                            </h3>
                            <button
                                onClick={() => setShowEtapasInfo(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Contenido - Scrollable */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                {/* Etapa: Interés */}
                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                                        Interés
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Etapa de Interés</h4>
                                        <p className="text-sm text-gray-600">
                                            El cliente ha mostrado interés inicial en la propiedad. Se ha establecido contacto y se están recopilando los primeros datos del cliente.
                                        </p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <strong>Acciones típicas:</strong> Contacto inicial, recopilación de datos, presentación de la propiedad
                                        </div>
                                    </div>
                                </div>

                                {/* Etapa: Negociación */}
                                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 flex-shrink-0">
                                        Negociación
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Etapa de Negociación</h4>
                                        <p className="text-sm text-gray-600">
                                            Se están discutiendo los términos de la transacción. Incluye negociación de precio, condiciones de pago, y otros aspectos del acuerdo.
                                        </p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <strong>Acciones típicas:</strong> Negociación de precio, condiciones, visitas adicionales, documentación
                                        </div>
                                    </div>
                                </div>

                                {/* Etapa: Cierre */}
                                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800 flex-shrink-0">
                                        Cierre
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Etapa de Cierre</h4>
                                        <p className="text-sm text-gray-600">
                                            Se han acordado los términos finales y se está procediendo con la documentación legal y los trámites necesarios para completar la transacción.
                                        </p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <strong>Acciones típicas:</strong> Documentación legal, firmas, trámites bancarios, notarización
                                        </div>
                                    </div>
                                </div>

                                {/* Etapa: Finalizada */}
                                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0">
                                        Finalizada
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Negociación Finalizada</h4>
                                        <p className="text-sm text-gray-600">
                                            La transacción se ha completado exitosamente. Todos los documentos han sido firmados y la propiedad ha sido transferida.
                                        </p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <strong>Acciones típicas:</strong> Entrega de llaves, registro de propiedad, seguimiento post-venta
                                        </div>
                                    </div>
                                </div>

                                {/* Etapa: Cancelada */}
                                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 flex-shrink-0">
                                        Cancelada
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 mb-1">Negociación Cancelada</h4>
                                        <p className="text-sm text-gray-600">
                                            La negociación ha sido cancelada por alguna razón. Puede ser por decisión del cliente, problemas con la propiedad, o cualquier otra circunstancia.
                                        </p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            <strong>Acciones típicas:</strong> Documentación de cancelación, devolución de documentos, seguimiento de razones
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
