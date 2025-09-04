import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const NotasInternas = ({ negociacion, usuario, onNotaCreada }) => {
    const [notasInternas, setNotasInternas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nuevaNota, setNuevaNota] = useState({
        contenido: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Cargar notas internas al montar el componente
    useEffect(() => {
        if (negociacion?.id && canViewNotas()) {
            cargarNotasInternas();
        } else if (negociacion?.id) {
            // Si no puede ver las notas, no cargar nada
            setLoading(false);
        }
    }, [negociacion?.id, usuario?.id, negociacion?.agenteId]);

    const cargarNotasInternas = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:3000/api/notas-internas/${negociacion.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setNotasInternas(response.data.notasInternas);
        } catch (error) {
            console.error('Error al cargar notas internas:', error);
            
            if (error.response?.status === 403) {
                setError('No tienes acceso a las notas internas de esta negociación');
            } else {
                setError('Error al cargar las notas internas');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!nuevaNota.contenido.trim()) {
            toast.error('Por favor ingresa el contenido de la nota');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:3000/api/notas-internas/${negociacion.id}`,
                nuevaNota,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('✅ Nota interna guardada correctamente');
            
            // Limpiar formulario
            setNuevaNota({ contenido: '' });
            setShowForm(false);
            
            // Recargar notas internas
            await cargarNotasInternas();
            
            // Notificar al componente padre
            if (onNotaCreada) {
                onNotaCreada(response.data.notaInterna);
            }
        } catch (error) {
            console.error('Error al crear nota interna:', error);
            if (error.response?.data?.mensaje) {
                toast.error(error.response.data.mensaje);
            } else {
                toast.error('Error al guardar la nota interna');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const canAccessNotas = () => {
        // Solo el agente responsable puede acceder a las notas internas
        return usuario?.rol === 'agente' && 
               negociacion?.agenteId === usuario?.id;
    };

    const canViewNotas = () => {
        // Solo el agente responsable puede ver las notas internas
        return usuario?.rol === 'agente' && 
               negociacion?.agenteId === usuario?.id;
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

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Si hay error de acceso, mostrar mensaje
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">🔒</div>
                    <div>
                        <h4 className="font-semibold text-red-800 mb-1">
                            Acceso Restringido
                        </h4>
                        <p className="text-red-700 text-sm">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Si no puede acceder, mostrar mensaje apropiado según el rol
    if (!canViewNotas()) {
        if (usuario?.rol === 'admin') {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">🔒</div>
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-1">
                                Notas Internas Privadas
                            </h4>
                            <p className="text-blue-700 text-sm mb-2">
                                Como administrador, no puedes acceder a las notas internas de los agentes.
                            </p>
                            <p className="text-blue-600 text-xs">
                                💡 <strong>Política de Privacidad:</strong> Las notas internas son completamente privadas 
                                y solo visibles para el agente responsable de cada negociación.
                            </p>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                                Notas Internas Privadas
                            </h4>
                            <p className="text-gray-600 text-sm">
                                Solo el agente responsable de esta negociación puede acceder a las notas internas.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-purple-800">
                            🔒 Notas Internas Privadas
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {notasInternas.length} nota{notasInternas.length !== 1 ? 's' : ''} privada{notasInternas.length !== 1 ? 's' : ''} registrada{notasInternas.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                            Solo tú puedes ver estas notas. No son visibles para otros usuarios.
                        </p>
                    </div>
                    
                    {/* Botón para agregar nota */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {showForm ? '❌ Cancelar' : '➕ Nueva Nota'}
                    </button>
                </div>
            </div>

            {/* Formulario para nueva nota */}
            {showForm && (
                <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-purple-800 mb-2">
                                Contenido de la Nota <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={nuevaNota.contenido}
                                onChange={(e) => setNuevaNota({
                                    ...nuevaNota,
                                    contenido: e.target.value
                                })}
                                rows={4}
                                maxLength={2000}
                                placeholder="Escribe tus observaciones personales, estrategias, objeciones del cliente, señales de compra, etc. Esta información es completamente privada y solo tú puedes verla."
                                className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                                required
                            />
                            <div className="text-xs text-purple-600 mt-1 text-right">
                                {nuevaNota.contenido.length}/2000 caracteres
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setNuevaNota({ contenido: '' });
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !nuevaNota.contenido.trim()}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                {submitting ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </span>
                                ) : (
                                    '💾 Guardar Nota Privada'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de notas internas */}
            <div className="divide-y divide-gray-200">
                {notasInternas.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No hay notas internas registradas
                        </h4>
                        <p className="text-gray-500 mb-4">
                            Comienza registrando tus primeras observaciones privadas sobre esta negociación.
                        </p>
                        <p className="text-xs text-purple-600">
                            💡 <strong>Tip:</strong> Usa las notas internas para recordar objeciones del cliente, 
                            estrategias de venta, o cualquier detalle que te ayude en futuras interacciones.
                        </p>
                    </div>
                ) : (
                    notasInternas.map((nota) => (
                        <div key={nota.id} className="px-6 py-4 hover:bg-purple-50">
                            <div className="flex items-start gap-3">
                                {/* Icono de nota privada */}
                                <div className="text-2xl mt-1 text-purple-600">
                                    🔒
                                </div>
                                
                                {/* Contenido de la nota */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                            Nota Privada
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatearFecha(nota.fecha)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {nota.contenido}
                                    </p>
                                    
                                    <div className="mt-2 text-xs text-gray-400">
                                        <span>📝 Nota personal - No editable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Información de privacidad */}
            <div className="px-6 py-4 bg-purple-50 border-t border-purple-200">
                <div className="flex items-center gap-2 text-purple-800 text-sm">
                    <span className="text-lg">🔒</span>
                    <span>
                        <strong>Privacidad Garantizada:</strong> Estas notas son completamente privadas. 
                        Solo tú puedes verlas y no se comparten con clientes, administradores ni otros agentes.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NotasInternas;
