import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BotonLogout from '../components/BotonLogout';
import { PageSpinner } from '../components/Spinner';

function PanelAgente() {
    const [usuario, setUsuario] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        totalPropiedades: 0,
        propiedadesDisponibles: 0,
        propiedadesVendidas: 0,
        propiedadesAlquiladas: 0
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
                cargarEstadisticas(token, usuarioCompleto);
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                setUsuario(null);
            }
        }
    }, []);

    const cargarEstadisticas = async (token, usuarioData) => {
        try {
            // Cargar solo las propiedades del agente actual (pedir todas para estadísticas)
            const propiedadesRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 10000 }
            });

            const propiedadesData = propiedadesRes.data.data || [];

            // Filtrar solo las propiedades del agente actual
            const propiedadesDelAgente = propiedadesData.filter(p => p.agenteId === usuarioData.id);
            const totalPropiedades = propiedadesDelAgente.length;
            const propiedadesDisponibles = propiedadesDelAgente.filter(p => p.estado_publicacion === 'disponible').length;
            const propiedadesVendidas = propiedadesDelAgente.filter(p => p.estado_publicacion === 'vendida').length;
            const propiedadesAlquiladas = propiedadesDelAgente.filter(p => p.estado_publicacion === 'alquilada').length;

            setEstadisticas({
                totalPropiedades,
                propiedadesDisponibles,
                propiedadesVendidas,
                propiedadesAlquiladas
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // En caso de error, mostrar datos en 0
            setEstadisticas({
                totalPropiedades: 0,
                propiedadesDisponibles: 0,
                propiedadesVendidas: 0,
                propiedadesAlquiladas: 0
            });
        } finally {
            setCargando(false);
        }
    };

    if (cargando) {
        return <PageSpinner text="Cargando panel..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel del Agente</h1>
                    <p className="text-gray-600 mt-2">Bienvenido, {usuario?.name || usuario?.email}</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-50 rounded-full">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Propiedades</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalPropiedades}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-50 rounded-full">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Disponibles</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.propiedadesDisponibles}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-slate-100 rounded-full">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Vendidas</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.propiedadesVendidas}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-slate-100 rounded-full">
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Alquiladas</p>
                                <p className="text-2xl font-bold text-gray-900">{estadisticas.propiedadesAlquiladas}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/agente/registrar-propiedad"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Registrar Propiedad</h3>
                                <p className="text-gray-500 text-sm">Agregar nueva propiedad</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/agente/panel-propiedades"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-slate-700 transition-colors">Mis Propiedades</h3>
                                <p className="text-gray-500 text-sm">Gestionar mis propiedades</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/agente/registrar-cliente"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Registrar Cliente</h3>
                                <p className="text-gray-500 text-sm">Agregar nuevo cliente</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/agente/panel-clientes"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-slate-700 transition-colors">Mis Clientes</h3>
                                <p className="text-gray-500 text-sm">Gestionar mis clientes</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/agente/panel-negociaciones"
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-orange-200 group"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-slate-700 transition-colors">Mis Negociaciones</h3>
                                <p className="text-gray-500 text-sm">Gestionar negociaciones</p>
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

export default PanelAgente;
