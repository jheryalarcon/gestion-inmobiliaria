import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BotonLogout from '../components/BotonLogout';

function PanelAdmin() {
    const [usuario, setUsuario] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        totalPropiedades: 0,
        propiedadesDisponibles: 0,
        totalAgentes: 0,
        totalClientes: 0
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioData = localStorage.getItem('usuario');
        
        if (token && usuarioData) {
            try {
                const usuarioCompleto = JSON.parse(usuarioData);
                
                // Corregir datos antiguos: si tiene 'nombre' en lugar de 'name'
                if (usuarioCompleto.nombre && !usuarioCompleto.name) {
                    usuarioCompleto.name = usuarioCompleto.nombre;
                    delete usuarioCompleto.nombre;
                    
                    // Actualizar localStorage con los datos corregidos
                    localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
                }
                
                setUsuario(usuarioCompleto);
                cargarEstadisticas(token);
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                setUsuario(null);
            }
        }
    }, []);

    const cargarEstadisticas = async (token) => {
        try {
            // Cargar propiedades
            const propiedadesRes = await axios.get('http://localhost:3000/api/propiedades', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const totalPropiedades = propiedadesRes.data.length;
            const propiedadesDisponibles = propiedadesRes.data.filter(p => p.estado_publicacion === 'disponible').length;

            // Cargar agentes
            const agentesRes = await axios.get('http://localhost:3000/api/agentes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const totalAgentes = agentesRes.data.paginacion ? agentesRes.data.paginacion.total : 0;

            // Cargar clientes
            const clientesRes = await axios.get('http://localhost:3000/api/clientes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const totalClientes = clientesRes.data.paginacion ? clientesRes.data.paginacion.total : 0;

            setEstadisticas({
                totalPropiedades,
                propiedadesDisponibles,
                totalAgentes,
                totalClientes
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // En caso de error, mostrar datos en 0
            setEstadisticas({
                totalPropiedades: 0,
                propiedadesDisponibles: 0,
                totalAgentes: 0,
                totalClientes: 0
            });
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
                    <p className="text-gray-600 mt-2">Bienvenido, {usuario?.name || usuario?.email}</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
                                <p className="text-2xl font-semibold text-gray-900">{estadisticas.totalPropiedades}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                                <p className="text-2xl font-semibold text-gray-900">{estadisticas.propiedadesDisponibles}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Agentes</p>
                                <p className="text-2xl font-semibold text-gray-900">{estadisticas.totalAgentes}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Clientes</p>
                                <p className="text-2xl font-semibold text-gray-900">{estadisticas.totalClientes}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Link 
                        to="/admin/registrar-propiedad"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Registrar Propiedad</h3>
                                <p className="text-gray-600">Agregar nueva propiedad al sistema</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/panel-propiedades"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Gestionar Propiedades</h3>
                                <p className="text-gray-600">Ver y editar todas las propiedades</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/registrar-cliente"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Registrar Cliente</h3>
                                <p className="text-gray-600">Agregar nuevo cliente al sistema</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/panel-clientes"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Gestionar Clientes</h3>
                                <p className="text-gray-600">Ver y administrar todos los clientes</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/panel-negociaciones"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Negociaciones</h3>
                                <p className="text-gray-600">Gestionar negociaciones entre clientes y propiedades</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/registrar-agente"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-teal-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-teal-100 rounded-lg">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Registrar Agente</h3>
                                <p className="text-gray-600">Crear nueva cuenta de agente inmobiliario</p>
                            </div>
                        </div>
                    </Link>

                    <Link 
                        to="/admin/panel-agentes"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-cyan-500"
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">Gestionar Agentes</h3>
                                <p className="text-gray-600">Ver y administrar todos los agentes del sistema</p>
                            </div>
                        </div>
                    </Link>
                </div>


                {/* Botón de Logout */}
                <div className="mt-8 flex justify-end">
            <BotonLogout />
                </div>
            </div>
        </div>
    );
}

export default PanelAdmin;
