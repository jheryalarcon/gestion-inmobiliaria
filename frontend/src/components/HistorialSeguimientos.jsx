import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import Spinner, { ButtonSpinner } from './Spinner';

const HistorialSeguimientos = ({ negociacion, usuario, onSeguimientoCreado }) => {
    const [seguimientos, setSeguimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nuevoSeguimiento, setNuevoSeguimiento] = useState({
        comentario: '',
        tipo: 'otro'
    });
    const [submitting, setSubmitting] = useState(false);

    // Tipos de seguimiento disponibles
    const tiposSeguimiento = [
        { value: 'llamada', label: '📞 Llamada', icon: '📞' },
        { value: 'visita', label: '🏠 Visita', icon: '🏠' },
        { value: 'mensaje', label: '💬 Mensaje', icon: '💬' },
        { value: 'email', label: '📧 Email', icon: '📧' },
        { value: 'reunion', label: '🤝 Reunión', icon: '🤝' },
        { value: 'documento', label: '📄 Documento', icon: '📄' },
        { value: 'otro', label: '📝 Otro', icon: '📝' }
    ];

    // Cargar seguimientos al montar el componente
    useEffect(() => {
        if (negociacion?.id) {
            cargarSeguimientos();
        }
    }, [negociacion?.id]);

    const cargarSeguimientos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:3000/api/seguimientos/${negociacion.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSeguimientos(response.data.seguimientos);
        } catch (error) {
            console.error('Error al cargar seguimientos:', error);
            toast.error('Error al cargar el historial de seguimientos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nuevoSeguimiento.comentario.trim()) {
            toast.error('Por favor ingresa un comentario');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:3000/api/seguimientos/${negociacion.id}`,
                nuevoSeguimiento,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Seguimiento registrado correctamente');

            // Limpiar formulario
            setNuevoSeguimiento({ comentario: '', tipo: 'otro' });
            setShowForm(false);

            // Recargar seguimientos
            await cargarSeguimientos();

            // Notificar al componente padre
            if (onSeguimientoCreado) {
                onSeguimientoCreado(response.data.seguimiento);
            }
        } catch (error) {
            console.error('Error al crear seguimiento:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('Error al registrar el seguimiento');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const canCreateSeguimiento = () => {
        // Permitir si es Admin
        if (usuario?.rol === 'admin') return true;

        // Permitir si es Agente
        if (usuario?.rol === 'agente') {
            // Caso 1: Soy el Agente Comprador (Dueño de la negociación)
            if (negociacion?.agenteId === usuario?.id) return true;

            // Caso 2: Soy el Agente Captador (Dueño de la propiedad)
            // Necesitamos verificar negociacion.propiedad.agenteId
            // NOTA: El objeto negociacion debe incluir la propiedad poblada
            if (negociacion?.propiedad?.agenteId === usuario?.id) return true;
        }

        return false;
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTipoIcon = (tipo) => {
        const tipoEncontrado = tiposSeguimiento.find(t => t.value === tipo);
        return tipoEncontrado ? tipoEncontrado.icon : '📝';
    };

    const getTipoLabel = (tipo) => {
        const tipoEncontrado = tiposSeguimiento.find(t => t.value === tipo);
        return tipoEncontrado ? tipoEncontrado.label : 'Otro';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner size="md" text="Cargando seguimientos..." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            📋 Historial de Seguimientos
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {seguimientos.length} seguimiento{seguimientos.length !== 1 ? 's' : ''} registrado{seguimientos.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Botón para agregar seguimiento */}
                    {canCreateSeguimiento() && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {showForm ? '❌ Cancelar' : '➕ Agregar Seguimiento'}
                        </button>
                    )}
                </div>
            </div>

            {/* Formulario para nuevo seguimiento */}
            {showForm && canCreateSeguimiento() && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Seguimiento
                            </label>
                            <select
                                value={nuevoSeguimiento.tipo}
                                onChange={(e) => setNuevoSeguimiento({
                                    ...nuevoSeguimiento,
                                    tipo: e.target.value
                                })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                {tiposSeguimiento.map(tipo => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comentario <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={nuevoSeguimiento.comentario}
                                onChange={(e) => setNuevoSeguimiento({
                                    ...nuevoSeguimiento,
                                    comentario: e.target.value
                                })}
                                rows={3}
                                maxLength={1000}
                                placeholder="Describe la interacción o acción realizada..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {nuevoSeguimiento.comentario.length}/1000 caracteres
                            </div>

                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2 flex gap-2 items-start">
                                <span className="text-amber-600 mt-0.5 text-xs">⚠️</span>
                                <p className="text-xs text-amber-800">
                                    <strong>Importante:</strong> Este registro será <u>permanente y visible</u> para todo el equipo involucrado.
                                    No podrás editarlo ni eliminarlo después de guardar.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setNuevoSeguimiento({ comentario: '', tipo: 'otro' });
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !nuevoSeguimiento.comentario.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {submitting ? (
                                    <span className="flex items-center">
                                        <ButtonSpinner size="sm" color="white" />
                                        <span className="ml-2">Guardando...</span>
                                    </span>
                                ) : (
                                    '💾 Guardar Seguimiento'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de seguimientos */}
            <div className="divide-y divide-gray-200">
                {seguimientos.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No hay seguimientos registrados
                        </h4>
                        <p className="text-gray-500">
                            {canCreateSeguimiento()
                                ? 'Comienza registrando el primer seguimiento de esta negociación.'
                                : 'El agente responsable aún no ha registrado seguimientos.'
                            }
                        </p>
                    </div>
                ) : (
                    seguimientos.map((seguimiento) => (
                        <div key={seguimiento.id} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                                {/* Icono del tipo */}
                                <div className="text-2xl mt-1">
                                    {getTipoIcon(seguimiento.tipo)}
                                </div>

                                {/* Contenido del seguimiento */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {seguimiento.agente.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatearFecha(seguimiento.fecha)}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {getTipoLabel(seguimiento.tipo)}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {seguimiento.comentario}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


        </div>
    );
};

export default HistorialSeguimientos;
