import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalActualizarEtapaNegociacion from './ModalActualizarEtapaNegociacion';

const CardNegociacion = ({ negociacion, usuario, onActualizarNegociacion }) => {
    const [mostrarModal, setMostrarModal] = useState(false);

    // Función para obtener el color y estilo de la etapa
    const obtenerEstiloEtapa = (etapa) => {
        switch (etapa) {
            case 'interes':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'negociacion':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'oferta':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'aceptada':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cerrada':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'cancelada':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Función para obtener el label de la etapa
    const obtenerLabelEtapa = (etapa) => {
        const labels = {
            'interes': 'Interés',
            'negociacion': 'Negociación',
            'oferta': 'Oferta',
            'aceptada': 'Aceptada',
            'cerrada': 'Cerrada',
            'cancelada': 'Cancelada'
        };
        return labels[etapa] || etapa;
    };

    // Verificar si el usuario puede editar la negociación
    const puedeEditar = usuario?.rol === 'agente' && negociacion.agenteId === usuario?.id;

    // Verificar si el usuario puede ver la negociación
    const puedeVer = usuario?.rol === 'admin' || puedeEditar;

    if (!puedeVer) {
        return null; // No mostrar si no tiene permisos
    }

    return (
        <>
            <div className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition-shadow">
                {/* Header con etapa */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                            {negociacion.cliente?.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {negociacion.cliente?.email} • {negociacion.cliente?.telefono}
                        </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${obtenerEstiloEtapa(negociacion.etapa)}`}>
                        {obtenerLabelEtapa(negociacion.etapa)}
                    </span>
                </div>

                {/* Información de la propiedad */}
                <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-1">
                        {negociacion.propiedad?.titulo}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>{negociacion.propiedad?.direccion}, {negociacion.propiedad?.ciudad}</p>
                        <p className="font-medium text-green-700">
                            ${negociacion.propiedad?.precio}
                        </p>
                    </div>
                </div>

                {/* Información del agente */}
                <div className="mb-3 text-xs text-gray-500">
                    <p><strong>Agente:</strong> {negociacion.agente?.name}</p>
                    <p><strong>Fecha inicio:</strong> {new Date(negociacion.fecha_inicio).toLocaleDateString()}</p>
                    {negociacion.fecha_cambio_etapa && (
                        <p><strong>Último cambio:</strong> {new Date(negociacion.fecha_cambio_etapa).toLocaleDateString()}</p>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 items-center">
                    {/* Ver detalles */}
                    <Link
                        to={`/negociacion/${negociacion.id}`}
                        className="text-blue-700 hover:text-blue-900 text-xs border border-blue-500 px-3 py-1 rounded hover:shadow-sm transition"
                    >
                        👁 Ver
                    </Link>

                    {/* Actualizar etapa - solo para agentes responsables */}
                    {puedeEditar && (
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="text-indigo-700 hover:text-indigo-900 text-xs border border-indigo-500 px-3 py-1 rounded hover:shadow-sm transition cursor-pointer"
                            title="Actualizar etapa de la negociación"
                        >
                            🔄 Etapa
                        </button>
                    )}

                    {/* Indicador de solo lectura para admin */}
                    {usuario?.rol === 'admin' && (
                        <span className="text-xs text-gray-500 italic">
                            Solo visualización
                        </span>
                    )}
                </div>
            </div>

            {/* Modal para actualizar etapa */}
            <ModalActualizarEtapaNegociacion
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                onSuccess={onActualizarNegociacion}
                negociacion={negociacion}
                usuario={usuario}
            />
        </>
    );
};

export default CardNegociacion;
