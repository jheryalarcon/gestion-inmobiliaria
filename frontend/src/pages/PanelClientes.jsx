import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import SelectTipoCliente from '../components/SelectTipoCliente';

export default function PanelClientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);
    const [filtros, setFiltros] = useState({
        search: '',
        tipo_cliente: '',
        estado: 'activo',
        page: 1
    });
    const [paginacion, setPaginacion] = useState({
        pagina: 1,
        limite: 10,
        total: 0,
        paginas: 0
    });
    const [showDesactivarModal, setShowDesactivarModal] = useState(false);
    const [showReactivarModal, setShowReactivarModal] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const decoded = jwtDecode(token);
        setUsuario(decoded);

        if (decoded.rol === 'cliente') {
            navigate('/inicio');
            return;
        }

        cargarClientes();
    }, [filtros]);

    const cargarClientes = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: filtros.page,
                limit: 10,
                search: filtros.search,
                tipo_cliente: filtros.tipo_cliente,
                estado: filtros.estado
            });

            const response = await axios.get(`http://localhost:3000/api/clientes?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setClientes(response.data.clientes);
            setPaginacion(response.data.paginacion);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            toast.error('Error al cargar los clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Resetear a la primera página al cambiar filtros
        }));
    };

    const handlePageChange = (nuevaPagina) => {
        setFiltros(prev => ({
            ...prev,
            page: nuevaPagina
        }));
    };



    const handleDesactivar = (cliente) => {
        setClienteSeleccionado(cliente);
        setShowDesactivarModal(true);
    };

    const confirmarDesactivar = async () => {
        if (!clienteSeleccionado) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/clientes/${clienteSeleccionado.id}/desactivar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('✅ Cliente desactivado correctamente');
            setShowDesactivarModal(false);
            setClienteSeleccionado(null);
            cargarClientes();
        } catch (error) {
            console.error('Error al desactivar cliente:', error);
            if (error.response?.status === 403) {
                toast.error('⚠️ No puedes desactivar un cliente que no te pertenece');
            } else if (error.response?.status === 400) {
                toast.error('El cliente ya está inactivo');
            } else {
                toast.error('Error al desactivar el cliente');
            }
        }
    };

    const handleReactivar = (cliente) => {
        setClienteSeleccionado(cliente);
        setShowReactivarModal(true);
    };

    const confirmarReactivar = async () => {
        if (!clienteSeleccionado) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/clientes/${clienteSeleccionado.id}/reactivar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('🔁 Cliente reactivado exitosamente');
            setShowReactivarModal(false);
            setClienteSeleccionado(null);
            cargarClientes();
        } catch (error) {
            console.error('Error al reactivar cliente:', error);
            if (error.response?.status === 403) {
                toast.error('⚠️ Solo los administradores pueden reactivar clientes');
            } else if (error.response?.status === 400) {
                toast.error('El cliente ya está activo');
            } else {
                toast.error('Error al reactivar el cliente');
            }
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const obtenerTipoClienteLabel = (tipo) => {
        const tipos = {
            comprador: 'Comprador',
            arrendatario: 'Arrendatario',
            propietario: 'Propietario',
            vendedor: 'Vendedor',
            inversionista: 'Inversionista',
            consultor: 'Consultor'
        };
        return tipos[tipo] || tipo;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
                        <p className="text-gray-600 mt-2">
                            Administra los clientes registrados en la inmobiliaria
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/registrar-cliente')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros de búsqueda</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            placeholder="Nombre, email o teléfono..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Tipo de cliente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de cliente
                        </label>
                        <SelectTipoCliente
                            value={filtros.tipo_cliente}
                            onChange={(e) => handleFiltroChange({ target: { name: 'tipo_cliente', value: e.target.value } })}
                        />
                    </div>

                    {/* Estado del cliente */}
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
                            {usuario?.rol === 'admin' && <option value="todos">Todos</option>}
                        </select>
                    </div>

                    {/* Botón limpiar */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setFiltros({ search: '', tipo_cliente: '', estado: 'activo', page: 1 })}
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
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                {usuario?.rol === 'admin' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Agente
                                    </th>
                                )}
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
                            {clientes.length === 0 ? (
                                <tr>
                                    <td colSpan={usuario?.rol === 'admin' ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-lg font-medium">No se encontraron clientes</p>
                                            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {cliente.nombre}
                                                </div>
                                                {cliente.observaciones && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {cliente.observaciones}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{cliente.email}</div>
                                            <div className="text-sm text-gray-500">{cliente.telefono}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {obtenerTipoClienteLabel(cliente.tipo_cliente)}
                                            </span>
                                        </td>
                                        {usuario?.rol === 'admin' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {cliente.agente ? cliente.agente.name : 'Sin asignar'}
                                                </div>
                                                {cliente.agente && (
                                                    <div className="text-sm text-gray-500">
                                                        {cliente.agente.email}
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                cliente.activo 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {cliente.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                            {!cliente.activo && cliente.usuario_desactivador && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Desactivado por: {cliente.usuario_desactivador.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearFecha(cliente.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/editar-cliente/${cliente.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 transition duration-200"
                                                >
                                                    Editar
                                                </button>
                                                {cliente.activo ? (
                                                    <button
                                                        onClick={() => handleDesactivar(cliente)}
                                                        className="text-orange-600 hover:text-orange-900 transition duration-200"
                                                    >
                                                        Desactivar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivar(cliente)}
                                                        className="text-green-600 hover:text-green-900 transition duration-200"
                                                    >
                                                        Reactivar
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

                {/* PAGINACIÓN */}
                {paginacion.paginas > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(paginacion.pagina - 1)}
                                disabled={paginacion.pagina === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => handlePageChange(paginacion.pagina + 1)}
                                disabled={paginacion.pagina === paginacion.paginas}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando{' '}
                                    <span className="font-medium">
                                        {((paginacion.pagina - 1) * paginacion.limite) + 1}
                                    </span>{' '}
                                    a{' '}
                                    <span className="font-medium">
                                        {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium">{paginacion.total}</span>{' '}
                                    resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handlePageChange(paginacion.pagina - 1)}
                                        disabled={paginacion.pagina === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Anterior</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {Array.from({ length: paginacion.paginas }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === paginacion.pagina
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => handlePageChange(paginacion.pagina + 1)}
                                        disabled={paginacion.pagina === paginacion.paginas}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmación para desactivar */}
            {showDesactivarModal && clienteSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-orange-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">⚠️</span> Desactivar Cliente
                        </h3>
                        <div className="text-gray-700 text-center mb-6">
                            <p className="mb-3">
                                ¿Estás seguro que deseas desactivar a <strong>"{clienteSeleccionado.nombre}"</strong>?
                            </p>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                                <p className="text-orange-800">
                                    Esta acción ocultará al cliente de tu vista y no podrás gestionarlo 
                                    a menos que sea reactivado por un administrador.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setShowDesactivarModal(false);
                                    setClienteSeleccionado(null);
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarDesactivar}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition"
                            >
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para reactivar */}
            {showReactivarModal && clienteSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-green-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">🔁</span> Reactivar Cliente
                        </h3>
                        <div className="text-gray-700 text-center mb-6">
                            <p className="mb-3">
                                ¿Estás seguro que deseas reactivar a <strong>"{clienteSeleccionado.nombre}"</strong>?
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                <p className="text-green-800">
                                    El cliente volverá a estar activo y visible para su agente responsable.
                                </p>
                                {usuario?.rol === 'agente' && (
                                    <p className="text-orange-700 mt-2 font-medium">
                                        ⚠️ Solo un administrador puede reactivar clientes.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setShowReactivarModal(false);
                                    setClienteSeleccionado(null);
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarReactivar}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition"
                            >
                                Reactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
