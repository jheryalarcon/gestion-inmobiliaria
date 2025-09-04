import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import CrearNegociacion from '../components/CrearNegociacion';
import ActualizarEtapaForm from '../components/ActualizarEtapaForm';
import HistorialSeguimientos from '../components/HistorialSeguimientos';
import ModalArchivosAdjuntos from '../components/ModalArchivosAdjuntos';

const PanelNegociaciones = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [negociaciones, setNegociaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCrearModal, setShowCrearModal] = useState(false);
    const [showDesactivarModal, setShowDesactivarModal] = useState(false);
    const [showActualizarEtapaModal, setShowActualizarEtapaModal] = useState(false);
    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [showArchivosModal, setShowArchivosModal] = useState(false);
    const [negociacionSeleccionada, setNegociacionSeleccionada] = useState(null);
    const [filtros, setFiltros] = useState({
        search: '',
        etapa: '',
        page: 1
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
        cargarNegociaciones();
    }, [navigate]);

    useEffect(() => {
        cargarNegociaciones();
    }, [filtros]);

    const cargarNegociaciones = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                search: filtros.search,
                etapa: filtros.etapa,
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
            toast.error('Error al cargar las negociaciones');
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
        setFiltros({
            search: '',
            etapa: '',
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

            toast.success('✅ Negociación desactivada correctamente');
            setShowDesactivarModal(false);
            setNegociacionSeleccionada(null);
            cargarNegociaciones();
        } catch (error) {
            console.error('Error al desactivar negociación:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('Error al desactivar la negociación');
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
        toast.success('Etapa de negociación actualizada correctamente');
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
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Panel de Negociaciones
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Gestiona las negociaciones entre clientes y propiedades
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCrearModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            🤝 Crear Negociación
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input
                                type="text"
                                name="search"
                                value={filtros.search}
                                onChange={handleFiltroChange}
                                placeholder="Cliente o propiedad..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Etapa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                            <select
                                name="etapa"
                                value={filtros.etapa}
                                onChange={handleFiltroChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Todas las etapas</option>
                                <option value="interes">Interés</option>
                                <option value="negociacion">Negociación</option>
                                <option value="cierre">Cierre</option>
                                <option value="finalizada">Finalizada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>

                        {/* Botón limpiar */}
                        <div className="flex items-end">
                            <button
                                onClick={limpiarFiltros}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

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
                                        Fecha Inicio
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
                                    <tr key={negociacion.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
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
                                                {/* Botón Ver Historial - para todos */}
                                                <button
                                                    onClick={() => handleVerHistorial(negociacion)}
                                                    className="text-green-600 hover:text-green-900 transition duration-200"
                                                    title="Ver historial de seguimientos"
                                                >
                                                    📋 Historial
                                                </button>
                                                
                                                {/* Botón Ver Archivos - solo para agentes responsables y admin */}
                                                {(usuario?.rol === 'admin' || (usuario?.rol === 'agente' && negociacion.agenteId === usuario?.id)) && (
                                                    <button
                                                        onClick={() => handleVerArchivos(negociacion)}
                                                        className="text-purple-600 hover:text-purple-900 transition duration-200"
                                                        title="Ver archivos adjuntos"
                                                    >
                                                        📎 Archivos
                                                    </button>
                                                )}
                                                
                                                {/* Botón Actualizar Etapa - solo para agentes responsables */}
                                                {usuario?.rol === 'agente' && negociacion.agenteId === usuario?.id && (
                                                    <button
                                                        onClick={() => handleActualizarEtapa(negociacion)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition duration-200"
                                                        title="Actualizar etapa de la negociación"
                                                    >
                                                        🔄 Etapa
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => navigate(`/editar-negociacion/${negociacion.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 transition duration-200"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDesactivar(negociacion)}
                                                    className="text-red-600 hover:text-red-900 transition duration-200"
                                                >
                                                    Desactivar
                                                </button>
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    page === filtros.page
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🤝</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay negociaciones
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Comienza creando tu primera negociación entre un cliente y una propiedad.
                        </p>
                        <button
                            onClick={() => setShowCrearModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200"
                        >
                            Crear Primera Negociación
                        </button>
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

            {/* Modal de confirmación para desactivar */}
            {showDesactivarModal && negociacionSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-red-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">⚠️</span> Desactivar Negociación
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
                                <span className="text-2xl">🔄</span>
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
                                    <span className="text-2xl">📋</span>
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
        </div>
    );
};

export default PanelNegociaciones;
