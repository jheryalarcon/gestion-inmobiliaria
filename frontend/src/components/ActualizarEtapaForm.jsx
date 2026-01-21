import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { ButtonSpinner } from './Spinner';
import {
    Sparkles,
    MessageSquare,
    FileSignature,
    CheckCircle2,
    XCircle,
    ArrowRight
} from 'lucide-react';

const ActualizarEtapaForm = ({ negociacion, onSuccess, onCancel, usuario }) => {
    const [etapa, setEtapa] = useState(negociacion?.etapa || 'interes');
    const [loading, setLoading] = useState(false);

    // Configuración completa de las etapas
    const etapasValidas = [
        {
            value: 'interes',
            label: 'Interés',
            icon: Sparkles,
            color: 'blue',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
            description: 'El cliente muestra interés inicial.',
            acciones: 'Contactar y agendar visita.'
        },
        {
            value: 'negociacion',
            label: 'Negociación',
            icon: MessageSquare,
            color: 'orange',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-700',
            description: 'Conversaciones activas, visitas o contraofertas.',
            acciones: 'Seguimiento constante.'
        },
        {
            value: 'cierre',
            label: 'Cierre',
            icon: FileSignature,
            color: 'purple',
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-700',
            description: 'Acuerdo verbal, redactando contratos.',
            acciones: 'Trámites legales y firma.'
        },
        {
            value: 'finalizada',
            label: 'Finalizada',
            icon: CheckCircle2,
            color: 'emerald',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-700',
            description: 'Operación exitosa y completada.',
            acciones: 'Cobro de comisión y entrega.'
        },
        {
            value: 'cancelada',
            label: 'Cancelada',
            icon: XCircle,
            color: 'red',
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
            description: 'La operación no se concretó.',
            acciones: 'Cierre administrativo.'
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

    const EtapaSeleccionada = etapasValidas.find(e => e.value === etapa);
    const getButtonClass = () => {
        if (!EtapaSeleccionada) return 'bg-gray-800 hover:bg-gray-900';

        switch (EtapaSeleccionada.value) {
            case 'interes': return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
            case 'negociacion': return 'bg-orange-600 hover:bg-orange-700 shadow-orange-200';
            case 'cierre': return 'bg-purple-600 hover:bg-purple-700 shadow-purple-200';
            case 'finalizada': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
            case 'cancelada': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
            default: return 'bg-gray-800 hover:bg-gray-900';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto px-1">
                {/* Header Compacto */}
                <div className="mb-4 pb-3 border-b border-gray-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-gray-900 leading-tight">
                            {negociacion?.cliente?.nombre}
                        </span>
                        <span className="text-xs text-gray-500 leading-tight">
                            {negociacion?.propiedad?.titulo}
                        </span>
                    </div>
                </div>

                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Nuevo Estado</p>

                {/* Grid de Selección */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {etapasValidas.map((item) => {
                        const isSelected = etapa === item.value;
                        const isCurrent = negociacion?.etapa === item.value;
                        const Icon = item.icon;
                        const isFullWidth = item.value === 'cancelada';

                        // 🔒 LOGICA DE PERMISOS
                        const esAdmin = usuario?.rol === 'admin';
                        const esCaptador = negociacion?.propiedad?.agenteId === usuario?.id;
                        const esEtapaRestringida = ['cierre', 'finalizada'].includes(item.value);
                        const opcionDeshabilitada = esEtapaRestringida && !esAdmin && !esCaptador;

                        return (
                            <button
                                type="button"
                                key={item.value}
                                onClick={() => !loading && !isCurrent && !opcionDeshabilitada && setEtapa(item.value)}
                                disabled={isCurrent || loading || opcionDeshabilitada}
                                className={`relative group p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${isFullWidth ? 'col-span-2' : ''
                                    } ${isSelected
                                        ? `${item.border} ${item.bg} ring-1 ring-offset-1 ${item.text.replace('text-', 'ring-')}`
                                        : (isCurrent || opcionDeshabilitada)
                                            ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                            : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                                    }`}
                                title={opcionDeshabilitada ? 'Solo Agente Captador' : ''}
                            >
                                <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-white/80 shadow-sm' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                    <Icon className={`w-5 h-5 ${isSelected ? item.text : 'text-gray-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {item.label}
                                        </h4>
                                        {isSelected && !isCurrent && <CheckCircle2 className={`w-4 h-4 ml-2 ${item.text}`} />}
                                        {opcionDeshabilitada && <span className="text-[10px] text-gray-400 font-medium ml-1">(🔒)</span>}
                                    </div>
                                    {isCurrent && <span className="text-[10px] uppercase font-bold text-gray-400">Actual</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Mensaje de Restricción */}
                {usuario?.rol !== 'admin' && negociacion?.propiedad?.agenteId !== usuario?.id && (
                    <div className="mb-4 text-xs bg-orange-50 text-orange-800 p-2 rounded border border-orange-200">
                        <p>⛔ <strong>Solo Agente Captador ({negociacion?.propiedad?.agente?.name || 'Desconocido'}) o Admin</strong> pueden Cerrar/Finalizar. Contáctalos para completar este paso.</p>
                    </div>
                )}

                {/* Panel de Información del Estado Seleccionado */}
                {EtapaSeleccionada && (
                    <div className={`p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300 ${EtapaSeleccionada.bg} ${EtapaSeleccionada.border}`}>
                        <h4 className={`text-sm font-bold mb-1 flex items-center gap-2 ${EtapaSeleccionada.text}`}>
                            <EtapaSeleccionada.icon className="w-4 h-4" />
                            {EtapaSeleccionada.label}
                        </h4>
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                            {EtapaSeleccionada.description}
                        </p>
                        <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/50 p-2 rounded-lg">
                            <span className="font-semibold uppercase tracking-wider text-[10px] mt-0.5">Acciones:</span>
                            {EtapaSeleccionada.acciones}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer de Acciones */}
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors hover:bg-gray-50 rounded-lg"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || !etapa || etapa === negociacion?.etapa}
                    className={`flex-1 px-6 py-2.5 text-white rounded-lg font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${getButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                    {loading ? (
                        <>
                            <ButtonSpinner size="sm" color="white" />
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <>
                            <span>Confirmar Cambio</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ActualizarEtapaForm;
