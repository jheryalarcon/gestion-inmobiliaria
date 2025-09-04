import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const ActualizarEtapaForm = ({ negociacion, onSuccess, onCancel }) => {
    const [etapa, setEtapa] = useState(negociacion?.etapa || 'interes');
    const [loading, setLoading] = useState(false);

    // Etapas válidas según el esquema
    const etapasValidas = [
        { 
            value: 'interes', 
            label: 'Interés', 
            description: 'El cliente ha mostrado interés por una propiedad, pero aún no se ha tomado acción concreta.',
            acciones: 'El agente crea la negociación. Se espera contactar al cliente o agendar una visita.'
        },
        { 
            value: 'negociacion', 
            label: 'Negociación', 
            description: 'El cliente ha visto la propiedad o ha solicitado más información. Ya se está en contacto activo.',
            acciones: 'Visitas programadas, contraofertas, revisión de condiciones.'
        },
        { 
            value: 'cierre', 
            label: 'Cierre', 
            description: 'Las condiciones están casi acordadas. Se está gestionando la documentación o contrato.',
            acciones: 'Firma de promesa de compraventa, validación legal o financiera.'
        },
        { 
            value: 'finalizada', 
            label: 'Finalizada', 
            description: 'La operación terminó satisfactoriamente (venta o arriendo realizado).',
            acciones: 'Se puede cerrar la negociación con éxito.'
        },
        { 
            value: 'cancelada', 
            label: 'Cancelada', 
            description: 'El cliente desistió, no está interesado, o no se concretó la operación por otros motivos.',
            acciones: 'El agente cierra la negociación manualmente.'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!etapa || etapa === negociacion?.etapa) {
            toast.error('Por favor selecciona una etapa diferente');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:3000/api/negociaciones/${negociacion.id}`,
                { etapa },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(response.data.mensaje);
            onSuccess(response.data.negociacion);
        } catch (error) {
            console.error('Error al actualizar etapa:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('Error al actualizar la etapa de la negociación');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Etapa <span className="text-red-500">*</span>
                </label>
                <select
                    value={etapa}
                    onChange={(e) => setEtapa(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                >
                    <option value="">Selecciona una nueva etapa</option>
                    {etapasValidas.map(etapaOption => (
                        <option 
                            key={etapaOption.value} 
                            value={etapaOption.value}
                            disabled={etapaOption.value === negociacion?.etapa}
                        >
                            {etapaOption.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Etapa seleccionada */}
            {etapa && etapa !== negociacion?.etapa && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🔄</div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-blue-800 mb-2">
                                Nueva etapa: {etapasValidas.find(e => e.value === etapa)?.label}
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="font-medium text-blue-700 mb-1">¿Qué significa?</p>
                                    <p className="text-blue-600">
                                        {etapasValidas.find(e => e.value === etapa)?.description}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-blue-700 mb-1">¿Qué acciones suelen ocurrir?</p>
                                    <p className="text-blue-600">
                                        {etapasValidas.find(e => e.value === etapa)?.acciones}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || !etapa || etapa === negociacion?.etapa}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {loading ? (
                        <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Actualizando...
                        </span>
                    ) : (
                        'Actualizar Etapa'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ActualizarEtapaForm;
