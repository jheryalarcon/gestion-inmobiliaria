import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { Search, UserPlus, Filter, Briefcase, Edit, Trash2, RotateCw, ArrowUpDown, ArrowUp, ArrowDown, Info } from 'lucide-react';
import SelectTipoCliente from '../components/SelectTipoCliente';
import { PageSpinner } from '../components/Spinner';

export default function PanelClientes() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);
    const [searchInput, setSearchInput] = useState(''); // Input local para debounce
    const [filtros, setFiltros] = useState({
        search: '',
        tipo_cliente: '',
        estado: 'activo',
        search: '', // Aseguramos que search esté presente si no lo estaba
        sortBy: 'createdAt',
        order: 'desc',
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
    const debounceTimer = useRef(null);

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
                search: filtros.search,
                tipo_cliente: filtros.tipo_cliente,
                estado: filtros.estado,
                sortBy: filtros.sortBy,
                order: filtros.order
            });

            const response = await axios.get(`http://localhost:3000/api/clientes?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setClientes(response.data.clientes);
            setPaginacion(response.data.paginacion);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            toast.error('Error al cargar los clientes', { id: 'error-cargar-clientes' });
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

    const handleSort = (columna) => {
        setFiltros(prev => ({
            ...prev,
            sortBy: columna,
            order: prev.sortBy === columna && prev.order === 'asc' ? 'desc' : 'asc',
            page: 1
        }));
    };

    const SortIcon = ({ columna }) => {
        if (filtros.sortBy !== columna) return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-50" />;
        return filtros.order === 'asc'
            ? <ArrowUp className="w-4 h-4 text-orange-600" />
            : <ArrowDown className="w-4 h-4 text-orange-600" />;
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

            toast.success('Cliente desactivado correctamente', { id: 'desactivar-cliente' });
            setShowDesactivarModal(false);
            setClienteSeleccionado(null);
            cargarClientes();
        } catch (error) {
            console.error('Error al desactivar cliente:', error);
            if (error.response?.status === 403) {
                toast.error('No puedes desactivar un cliente que no te pertenece', { id: 'error-desactivar' });
            } else if (error.response?.status === 400) {
                // Mostrar el mensaje específico del backend (ej: tiene negociaciones activas)
                toast.error(error.response.data.mensaje || 'El cliente ya está inactivo', {
                    id: 'error-desactivar',
                    duration: 5000 // Durar un poco más para que lean
                });
            } else {
                toast.error('Error al desactivar el cliente', { id: 'error-desactivar' });
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

            toast.success('🔁 Cliente reactivado exitosamente', { id: 'reactivar-cliente' });
            setShowReactivarModal(false);
            setClienteSeleccionado(null);
            cargarClientes();
        } catch (error) {
            console.error('Error al reactivar cliente:', error);
            if (error.response?.status === 403) {
                toast.error('Solo los administradores pueden reactivar clientes', { id: 'error-reactivar' });
            } else if (error.response?.status === 400) {
                toast.error('El cliente ya está activo', { id: 'error-reactivar' });
            } else {
                toast.error('Error al reactivar el cliente', { id: 'error-reactivar' });
            }
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-EC', {
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
            inversionista: 'Inversionista',
            consultor: 'Colega Inmobiliario',
            prospecto: 'Prospecto'
        };
        return tipos[tipo] || tipo;
    };

    if (loading) {
        return <PageSpinner text="Cargando clientes..." />;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* HEADER */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
                        <p className="text-gray-600 mt-2">
                            Administra los clientes registrados ({paginacion.total} en total)
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/registrar-cliente')}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200 flex items-center gap-2 shadow-sm"
                    >
                        <UserPlus className="w-5 h-5" />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* FILTROS */}
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
                                placeholder="Nombre, ci, telf..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    {/* Tipo de cliente */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                            Tipo
                        </label>
                        <SelectTipoCliente
                            value={filtros.tipo_cliente}
                            onChange={(e) => handleFiltroChange({ target: { name: 'tipo_cliente', value: e.target.value } })}
                        />
                    </div>

                    {/* Estado del cliente */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={filtros.estado}
                            onChange={handleFiltroChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="activo">Activos</option>
                            <option value="inactivo">Inactivos</option>
                            {usuario?.rol === 'admin' && <option value="todos">Todos</option>}
                        </select>
                    </div>

                    {/* Botón limpiar */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchInput('');
                                setFiltros({ search: '', tipo_cliente: '', estado: 'activo', sortBy: 'createdAt', order: 'desc', page: 1 });
                            }}
                            className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition duration-200 flex items-center justify-center gap-2"
                        >
                            <RotateCw className="w-4 h-4" />
                            Limpiar
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
                                <th
                                    onClick={() => handleSort('nombre')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-1">
                                        Cliente
                                        <SortIcon columna="nombre" />
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('email')} // Usamos email como proxy de contacto
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-1">
                                        Contacto
                                        <SortIcon columna="email" />
                                    </div>
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
                                <th
                                    onClick={() => handleSort('ultima_interaccion')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-1">
                                        Última Interacción
                                        <div title="Fecha de actualización de la última negociación o fecha de registro" className="cursor-help">
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                        </div>
                                        <SortIcon columna="ultima_interaccion" />
                                    </div>
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
                                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                                <Search className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">No se encontraron clientes</p>
                                            <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-orange-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-lg mr-3">
                                                    {cliente.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {cliente.nombre}
                                                    </div>
                                                    {cliente.cedula && (
                                                        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5" title="Cédula / RUC">
                                                            CI: {cliente.cedula}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{cliente.email}</div>
                                            <a
                                                href={`https://wa.me/593${cliente.telefono.replace(/^0/, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1 mt-1 font-medium hover:underline"
                                            >
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-4 h-4" />
                                                {cliente.telefono}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {obtenerTipoClienteLabel(cliente.tipo_cliente)}
                                            </span>
                                        </td>
                                        {usuario?.rol === 'admin' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {cliente.agente ? (
                                                    <div>
                                                        <div className="text-sm text-gray-900">{cliente.agente.name}</div>
                                                        <div className="text-xs text-gray-500">{cliente.agente.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${cliente.activo
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-red-50 text-red-700 border border-red-100'
                                                }`}>
                                                {cliente.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                            {!cliente.activo && cliente.usuario_desactivador && (
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    Por: {cliente.usuario_desactivador.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearFecha(cliente.negociaciones?.[0]?.updatedAt || cliente.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-negociaciones?clienteId=${cliente.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Ver historial de negociaciones"
                                                >
                                                    <Briefcase className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/editar-cliente/${cliente.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar cliente"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {cliente.activo ? (
                                                    <button
                                                        onClick={() => handleDesactivar(cliente)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Desactivar cliente"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivar(cliente)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Reactivar cliente"
                                                    >
                                                        <RotateCw className="w-4 h-4" />
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
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === paginacion.pagina
                                                ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
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
