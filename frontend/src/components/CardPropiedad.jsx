import { Link } from 'react-router-dom';
import { useState } from 'react';
import ModalActualizarEstado from './ModalActualizarEstado';
import ModalConfirmarEliminar from './ModalConfirmarEliminar';
import { obtenerUsuario } from '../utils/tokenUtils';

export default function CardPropiedad({ propiedad, onActualizarPropiedad }) {
    const img = propiedad.imagenes?.[0]?.url
        ? propiedad.imagenes[0].url.startsWith('http')
            ? propiedad.imagenes[0].url
            : `http://localhost:3000${propiedad.imagenes[0].url}`
        : 'https://via.placeholder.com/300x200?text=Sin+Imagen';

    const usuario = obtenerUsuario();
    const puedeEditar = usuario?.rol === 'admin' || usuario?.id === propiedad.agenteId;

    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarEliminar, setMostrarEliminar] = useState(false);
    const [imgError, setImgError] = useState(false);

    const obtenerEstiloEstado = (estado) => {
        switch (estado) {
            case 'disponible':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'vendida':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'arrendada':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'reservada':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            {/* Imagen Principal */}
            {/* Imagen Principal - Clickeable */}
            <Link
                to={`${usuario?.rol === 'admin' ? '/admin' : usuario?.rol === 'agente' ? '/agente' : ''}/propiedad/${propiedad.id}`}
                className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center block cursor-pointer"
            >
                {!imgError && img !== 'https://via.placeholder.com/300x200?text=Sin+Imagen' ? (
                    <img
                        src={img}
                        alt={propiedad.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="text-gray-300 flex flex-col items-center">
                        <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs font-medium text-gray-400">Sin Imagen</span>
                    </div>
                )}

                {/* Badge de Estado Superpuesto */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${obtenerEstiloEstado(propiedad.estado_publicacion)} uppercase tracking-wide`}>
                        {propiedad.estado_publicacion}
                    </span>
                </div>

                {/* Código Interno Superpuesto (Top Left) */}
                {propiedad.codigo_interno && (
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-blue-900 rounded-lg shadow-sm border border-blue-800">
                            #{propiedad.codigo_interno}
                        </span>
                    </div>
                )}
            </Link>

            {/* Contenido */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Precio */}
                {/* Precio y Tipo Transacción */}
                <div className="mb-2 flex justify-between items-center">
                    <p className="text-xl font-bold text-orange-600">
                        {Number(propiedad.precio).toLocaleString('es-EC', { style: 'currency', currency: 'USD' })}
                    </p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${propiedad.transaccion === 'venta' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                        {propiedad.transaccion === 'venta' ? 'Venta' : 'Alquiler'}
                    </span>
                </div>

                {/* Título y Detalles */}
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2" title={propiedad.titulo}>
                        {propiedad.titulo}
                    </h3>

                    {/* Características Clave - Hide if 0 */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        {/* Habitaciones */}
                        {propiedad.nro_habitaciones > 0 && (
                            <div className="flex items-center gap-1" title="Habitaciones">
                                {/* Icono Cama Simple */}
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10v9h2v-2h14v2h2v-9a2 2 0 00-2-2H5a2 2 0 00-2 2zM5 8a2 2 0 012-2h4a2 2 0 012 2v2H5V8z" />
                                </svg>
                                <span className="font-medium">{propiedad.nro_habitaciones}</span>
                            </div>
                        )}

                        {/* Baños */}
                        {propiedad.nro_banos > 0 && (
                            <div className="flex items-center gap-1" title="Baños">
                                {/* Icono Tina/Bañera Corregido */}
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 14h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5zM6 14V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                                </svg>
                                <span className="font-medium">{propiedad.nro_banos}</span>
                            </div>
                        )}

                        {/* Área de Terreno */}
                        {propiedad.area_terreno && Number(propiedad.area_terreno) > 0 && (
                            <div className="flex items-center gap-1" title="Área de Terreno">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span className="font-medium text-xs">
                                    {Number(propiedad.area_terreno).toLocaleString('es-EC')}m² T
                                </span>
                            </div>
                        )}

                        {/* Área de Construcción */}
                        {propiedad.area_construccion && Number(propiedad.area_construccion) > 0 && (
                            <div className="flex items-center gap-1" title="Área de Construcción">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="font-medium text-xs">
                                    {Number(propiedad.area_construccion).toLocaleString('es-EC')}m²
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {propiedad.ciudad} • {propiedad.tipo_propiedad}
                    </p>
                </div>

                <hr className="my-3 border-gray-100" />

                {/* Footer: Agente y Acciones */}
                <div className="flex justify-between items-center mt-auto">
                    {/* Información del Agente */}
                    <div className="flex items-center gap-2 max-w-[50%] min-w-0">
                        {propiedad.agente && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 truncate" title={`Agente: ${propiedad.agente.name || propiedad.agente.email}`}>
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="truncate font-medium">{propiedad.agente.name || 'Agente'}</span>
                            </div>
                        )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-0.5 sm:gap-1">
                        {(usuario?.rol === 'admin' || usuario?.rol === 'agente') && (
                            <Link
                                to={`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/panel-negociaciones?propiedadId=${propiedad.id}`}
                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-orange-700 rounded-lg transition-colors"
                                title="Ver Negociaciones"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </Link>
                        )}

                        {puedeEditar && (
                            <>
                                <Link
                                    to={`${usuario?.rol === 'admin' ? '/admin' : '/agente'}/editar-propiedad/${propiedad.id}`}
                                    className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Editar Propiedad"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </Link>

                                <button
                                    onClick={() => setMostrarModal(true)}
                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Cambiar Estado"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {usuario?.rol === 'admin' && (
                            <button
                                onClick={() => setMostrarEliminar(true)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar Propiedad"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales (Sin cambios visuales mayores) */}
            {mostrarEliminar && (
                <ModalConfirmarEliminar
                    propiedadId={propiedad.id}
                    onClose={() => setMostrarEliminar(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}

            {mostrarModal && (
                <ModalActualizarEstado
                    propiedadId={propiedad.id}
                    estadoActual={propiedad.estado_publicacion}
                    onClose={() => setMostrarModal(false)}
                    onSuccess={(nuevoEstado) => {
                        console.log('Estado actualizado exitosamente:', nuevoEstado);
                        onActualizarPropiedad({ ...propiedad, estado_publicacion: nuevoEstado });
                        setMostrarModal(false);
                    }}
                />
            )}
        </div>
    );
}
