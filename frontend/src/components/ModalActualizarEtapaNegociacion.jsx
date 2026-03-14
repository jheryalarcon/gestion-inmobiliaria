import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ButtonSpinner } from './Spinner';

const ModalActualizarEtapaNegociacion = ({
    isOpen,
    onClose,
    onSuccess,
    negociacion,
    usuario
}) => {
    const [etapa, setEtapa] = useState(negociacion?.etapa || 'interes');
    const [loading, setLoading] = useState(false);

    // Etapas válidas según el esquema del backend
    const etapasValidas = [
        { value: 'interes', label: 'Interés', description: 'Cliente interesado en la propiedad' },
        { value: 'negociacion', label: 'Negociación', description: 'En proceso de negociación' },
        { value: 'cierre', label: 'Cierre', description: 'Acuerdo verbal, redactando contratos' },
        { value: 'finalizada', label: 'Finalizada', description: 'Operación exitosa y completada' },
        { value: 'cancelada', label: 'Cancelada', description: 'Negociación cancelada' }
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
                `${import.meta.env.VITE_BACKEND_URL}/api/negociaciones/${negociacion.id}`,
                { etapa },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(response.data.mensaje);
            onSuccess(response.data.negociacion);
            onClose();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                        <span className="text-2xl">🔄</span>
                        Actualizar Etapa
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
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
                            <p><strong>Cliente:</strong> {negociacion?.cliente?.nombre}</p>
                            <p><strong>Propiedad:</strong> {negociacion?.propiedad?.titulo}</p>
                            <p><strong>Etapa actual:</strong>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {etapasValidas.find(e => e.value === negociacion?.etapa)?.label}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Formulario */}
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
                                {etapasValidas.map(etapaOption => {
                                    // 🔒 LOGICA DE PERMISOS VISUALES
                                    // Si NO es Admin Y NO es el Agente Captador (Dueño de la Propiedad)
                                    // Entonces NO puede seleccionar 'cierre' ni 'finalizada'
                                    const esAdmin = usuario?.rol === 'admin';
                                    const esCaptador = negociacion?.propiedad?.agenteId === usuario?.id;
                                    const esEtapaRestringida = ['cierre', 'finalizada'].includes(etapaOption.value);

                                    const opcionDeshabilitada = esEtapaRestringida && !esAdmin && !esCaptador;

                                    return (
                                        <option
                                            key={etapaOption.value}
                                            value={etapaOption.value}
                                            disabled={etapaOption.value === negociacion?.etapa || opcionDeshabilitada}
                                            className={opcionDeshabilitada ? 'text-gray-400 bg-gray-100' : ''}
                                        >
                                            {etapaOption.label}
                                            {opcionDeshabilitada ? ' (Solo Agente Captador)' : ` - ${etapaOption.description}`}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Mensaje de Restricción */}
                            {usuario?.rol !== 'admin' && negociacion?.propiedad?.agenteId !== usuario?.id && (
                                <div className="mt-2 text-xs bg-orange-50 text-orange-800 p-2 rounded border border-orange-200">
                                    <p>⛔ <strong>Solo Agente Captador o Admin</strong> pueden Cerrar/Finalizar. Contáctalos para completar este paso.</p>
                                </div>
                            )}
                        </div>

                        {/* Etapa seleccionada */}
                        {etapa && etapa !== negociacion?.etapa && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Nueva etapa:</strong> {etapasValidas.find(e => e.value === etapa)?.label}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {etapasValidas.find(e => e.value === etapa)?.description}
                                </p>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
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
                                        <ButtonSpinner />
                                        Actualizando...
                                    </span>
                                ) : (
                                    'Actualizar Etapa'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalActualizarEtapaNegociacion;
