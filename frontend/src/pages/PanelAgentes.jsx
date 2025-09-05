import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

export default function PanelAgentes() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filtros, setFiltros] = useState({
        search: '',
        estado: 'activo',
        page: 1
    });
    const [paginacion, setPaginacion] = useState({
        pagina: 1,
        total: 0,
        totalPaginas: 0,
        limite: 10
    });
    const [showDesactivarModal, setShowDesactivarModal] = useState(false);
    const [showReactivarModal, setShowReactivarModal] = useState(false);
    const [agenteSeleccionado, setAgenteSeleccionado] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token encontrado en localStorage:', token ? 'SÍ' : 'NO');
        
        if (!token) {
            console.log('No hay token, redirigiendo a login');
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            console.log('Token decodificado:', decoded);
            
            if (decoded.rol !== 'admin') {
                console.log('Usuario no es admin, redirigiendo');
                toast.error('No tienes permisos para acceder a esta página');
                navigate('/admin');
                return;
            }
            
            setUsuario(decoded);
            console.log('Usuario autenticado como admin');
        } catch (error) {
            console.error('Error al decodificar token:', error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    // Cargar agentes cuando se autentique el usuario
    useEffect(() => {
        if (usuario) {
            console.log('Usuario autenticado, cargando agentes iniciales...');
            cargarAgentes();
        }
    }, [usuario]);

    // Cargar agentes cuando cambien los filtros de búsqueda (instantáneo)
    useEffect(() => {
        if (usuario && !loading) {
            console.log('Filtros de búsqueda cambiados, recargando agentes...', { search: filtros.search, estado: filtros.estado });
            // Resetear a la primera página al cambiar filtros de búsqueda
            if (filtros.page !== 1) {
                setFiltros(prev => ({ ...prev, page: 1 }));
            } else {
                cargarAgentes(false); // Sin loading para filtros
            }
        }
    }, [filtros.search, filtros.estado]);

    // Cargar agentes cuando cambie la página
    useEffect(() => {
        if (usuario && !loading) {
            console.log('Página cambiada, recargando agentes...', filtros.page);
            cargarAgentes(true); // Con loading para cambio de página
        }
    }, [filtros.page]);

    const cargarAgentes = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            setError(null);
        }
        
        try {
            console.log('Iniciando carga de agentes...', { filtros });
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('No hay token disponible');
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const queryParams = new URLSearchParams({
                page: filtros.page,
                limit: 10,
                search: filtros.search,
                estado: filtros.estado
            });

            const url = `http://localhost:3000/api/agentes?${queryParams}`;
            console.log('URL de la petición:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('Datos recibidos:', data);
                setAgentes(data.agentes || []);
                setPaginacion(data.paginacion || {
                    pagina: 1,
                    total: 0,
                    totalPaginas: 0,
                    limite: 10
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error del servidor:', errorData);
                setError(errorData.error || `Error ${response.status}: ${response.statusText}`);
                setAgentes([]);
                setPaginacion({
                    pagina: 1,
                    total: 0,
                    totalPaginas: 0,
                    limite: 10
                });
            }
        } catch (error) {
            console.error('Error al cargar agentes:', error);
            setError('Error de conexión al cargar los agentes');
            setAgentes([]);
            setPaginacion({
                pagina: 1,
                total: 0,
                totalPaginas: 0,
                limite: 10
            });
        } finally {
            console.log('Finalizando carga de agentes');
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        console.log('Cambio de filtro:', name, value);
        setFiltros(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Resetear a la primera página al cambiar filtros
        }));
    };

    const handlePageChange = (nuevaPagina) => {
        console.log('Cambio de página:', nuevaPagina);
        setFiltros(prev => ({
            ...prev,
            page: nuevaPagina
        }));
    };

    const handleDesactivar = (agente) => {
        setAgenteSeleccionado(agente);
        setShowDesactivarModal(true);
    };

    const confirmarDesactivar = async () => {
        if (!agenteSeleccionado) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/agentes/${agenteSeleccionado.id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activo: false })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.mensaje);
                setShowDesactivarModal(false);
                setAgenteSeleccionado(null);
                cargarAgentes();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Error al desactivar el agente');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al desactivar el agente');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReactivar = (agente) => {
        setAgenteSeleccionado(agente);
        setShowReactivarModal(true);
    };

    const confirmarReactivar = async () => {
        if (!agenteSeleccionado) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/agentes/${agenteSeleccionado.id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ activo: true })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.mensaje);
                setShowDesactivarModal(false);
                setAgenteSeleccionado(null);
                cargarAgentes();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Error al reactivar el agente');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al reactivar el agente');
        } finally {
            setSubmitting(false);
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Mostrar error si existe
    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar agentes</h2>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button 
                        onClick={() => {
                            setError(null);
                            cargarAgentes();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando agentes...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Agentes</h1>
                        <p className="text-gray-600 mt-2">
                            Administra los agentes inmobiliarios del sistema
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/registrar-agente')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo Agente
                    </button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros de búsqueda</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar
                        </label>
                        <input
                            type="text"
                            name="search"
                            value={filtros.search}
                            onChange={handleFiltroChange}
                            placeholder="Nombre o email..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Estado del agente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={filtros.estado}
                            onChange={handleFiltroChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="activo">Activos</option>
                            <option value="inactivo">Inactivos</option>
                            <option value="todos">Todos</option>
                        </select>
                    </div>

                    {/* Botón limpiar */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setFiltros({ search: '', estado: 'activo', page: 1 })}
                            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition duration-200"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Agente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Teléfono
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Propiedades
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Clientes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Negociaciones
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha registro
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {agentes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                            <p className="text-lg font-medium">No se encontraron agentes</p>
                                            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                agentes.map((agente) => (
                                    <tr key={agente.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold text-lg">
                                                            {agente.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {agente.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {agente.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {agente.telefono && agente.telefono !== '0000000000' ? (
                                                <span className="text-gray-600">{agente.telefono}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">Sin teléfono</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {agente._count?.propiedades || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {agente._count?.clientes || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {agente._count?.negociaciones || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                agente.activo 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {agente.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearFecha(agente.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/editar-agente/${agente.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 transition duration-200"
                                                    title="Editar agente"
                                                >
                                                    📝 Editar
                                                </button>
                                                {agente.activo ? (
                                                    <button
                                                        onClick={() => handleDesactivar(agente)}
                                                        disabled={submitting}
                                                        className="text-red-600 hover:text-red-900 transition duration-200 disabled:opacity-50"
                                                        title="Desactivar agente"
                                                    >
                                                        🚫 Desactivar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivar(agente)}
                                                        disabled={submitting}
                                                        className="text-green-600 hover:text-green-900 transition duration-200 disabled:opacity-50"
                                                        title="Activar agente"
                                                    >
                                                        ✅ Activar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {paginacion.totalPaginas > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(filtros.page - 1)}
                                disabled={filtros.page <= 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(filtros.page + 1)}
                                disabled={filtros.page >= paginacion.totalPaginas}
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
                                    {Array.from({ length: paginacion.totalPaginas }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
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

            {/* Modal de confirmación para desactivar */}
            {showDesactivarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-red-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">⚠️</span> Desactivar Agente
                        </h3>
                        <p className="text-gray-700 text-center mb-6">
                            ¿Estás seguro de que quieres desactivar al agente <strong>{agenteSeleccionado?.name}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">No podrá acceder al sistema hasta que sea reactivado.</span>
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowDesactivarModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarDesactivar}
                                disabled={submitting}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
                            >
                                {submitting ? 'Desactivando...' : 'Desactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para reactivar */}
            {showReactivarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-green-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">✅</span> Reactivar Agente
                        </h3>
                        <p className="text-gray-700 text-center mb-6">
                            ¿Estás seguro de que quieres reactivar al agente <strong>{agenteSeleccionado?.name}</strong>?
                            <br />
                            <span className="text-sm text-gray-500">Podrá acceder al sistema nuevamente.</span>
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowReactivarModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarReactivar}
                                disabled={submitting}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
                            >
                                {submitting ? 'Reactivando...' : 'Reactivar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

