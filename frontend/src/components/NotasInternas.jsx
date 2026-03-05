import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Lock,
    Shield,
    FileText,
    Plus,
    X,
    Save,
    Clock,
    ShieldAlert,
    EyeOff
} from 'lucide-react';
import Spinner, { ButtonSpinner } from './Spinner';

const NotasInternas = ({ negociacion, usuario, onNotaCreada }) => {
    const [notasInternas, setNotasInternas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nuevaNota, setNuevaNota] = useState({ contenido: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Cargar notas internas al montar el componente
    useEffect(() => {
        if (negociacion?.id && canViewNotas()) {
            cargarNotasInternas();
        } else if (negociacion?.id) {
            setLoading(false);
        }
    }, [negociacion?.id, usuario?.id, negociacion?.agenteId]);

    const cargarNotasInternas = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/notas-internas/${negociacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
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
                `${import.meta.env.VITE_BACKEND_URL}/api/notas-internas/${negociacion.id}`,
                nuevaNota,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Nota interna guardada correctamente');
            setNuevaNota({ contenido: '' });
            setShowForm(false);
            await cargarNotasInternas();

            if (onNotaCreada) {
                onNotaCreada(response.data.notaInterna);
            }
        } catch (error) {
            console.error('Error al crear nota interna:', error);
            const msg = error.response?.data?.mensaje || 'Error al guardar la nota interna';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const canAccessNotas = () => usuario?.rol === 'agente' && negociacion?.agenteId === usuario?.id;
    const canViewNotas = () => usuario?.rol === 'agente' && negociacion?.agenteId === usuario?.id;

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="md" color="indigo" text="Cifrando notas..." />
            </div>
        );
    }

    // Acceso restringido (Error o Admin)
    if (error || !canViewNotas()) {
        const isAdmin = usuario?.rol === 'admin';
        return (
            <div className={`rounded-xl border p-6 flex items-start gap-4 ${isAdmin
                ? 'bg-slate-50 border-slate-200'
                : 'bg-red-50 border-red-200'
                }`}>
                <div className={`p-2 rounded-full ${isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-500'}`}>
                    {isAdmin ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                    <h4 className={`font-bold text-lg mb-1 ${isAdmin ? 'text-slate-800' : 'text-red-800'}`}>
                        {isAdmin ? 'Contenido Privado del Agente' : 'Acceso Restringido'}
                    </h4>
                    <p className={`text-sm mb-3 ${isAdmin ? 'text-slate-600' : 'text-red-700'}`}>
                        {isAdmin
                            ? 'Por políticas de privacidad, las notas internas son exclusivas del agente responsable y no son visibles para administradores.'
                            : (error || 'Solo el agente responsable puede acceder a estas notas.')
                        }
                    </p>
                    {isAdmin && (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-lg w-fit">
                            <Lock className="w-3 h-3" />
                            Privacidad End-to-End simulada
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
            {/* Toolbar - Sin título redundante */}
            <div className="px-6 py-3 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <p className="text-xs text-indigo-600 font-medium">
                        {notasInternas.length} nota{notasInternas.length !== 1 ? 's' : ''} registrada{notasInternas.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 ${showForm
                            ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                        }`}
                >
                    {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {showForm ? 'Cancelar' : 'Nueva Nota'}
                </button>
            </div>

            {/* Formulario */}
            {showForm && (
                <div className="p-6 bg-indigo-50/50 border-b border-indigo-100 animate-fadeIn">
                    <form onSubmit={handleSubmit}>
                        <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Contenido Confidencial
                        </label>
                        <div className="bg-white p-1 rounded-xl border border-indigo-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                            <textarea
                                value={nuevaNota.contenido}
                                onChange={(e) => setNuevaNota({ ...nuevaNota, contenido: e.target.value })}
                                rows={4}
                                maxLength={2000}
                                placeholder="Escribe aquí estrategias, percepciones o datos sensibles del cliente..."
                                className="w-full border-0 focus:ring-0 text-gray-700 resize-none p-3 rounded-lg placeholder:text-gray-400"
                                required
                            />
                            <div className="px-3 pb-2 flex justify-between items-center border-t border-gray-50 pt-2">
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {nuevaNota.contenido.length}/2000
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitting || !nuevaNota.contenido.trim()}
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                >
                                    {submitting ? <ButtonSpinner size="sm" color="white" /> : <Save className="w-3 h-3" />}
                                    Guardar Nota
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Notas */}
            <div className="p-6 bg-slate-50 min-h-[200px]">
                {notasInternas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                        <Shield className="w-12 h-12 text-indigo-300 mb-3" />
                        <h4 className="text-gray-900 font-medium">Área Segura y Privada</h4>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                            Este espacio es exclusivo para tus apuntes personales. Nadie más tiene acceso.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notasInternas.map((nota) => (
                            <div key={nota.id} className="group relative bg-white rounded-lg border-l-4 border-l-indigo-500 border-y border-r border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md">
                                            <FileText className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Nota Interna</span>
                                    </div>
                                    <time className="text-[10px] text-gray-400 font-medium flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        {formatearFecha(nota.fecha)}
                                    </time>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap pl-1">
                                    {nota.contenido}
                                </p>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Lock className="w-3 h-3 text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer de Privacidad */}
            <div className="bg-indigo-900 px-6 py-3 flex items-center justify-center gap-2 text-indigo-100 text-xs">
                <Shield className="w-3 h-3" />
                <span>Información encriptada visualmente para tu seguridad. Solo visible por ti.</span>
            </div>
        </div>
    );
};

export default NotasInternas;
