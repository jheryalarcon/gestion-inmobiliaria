import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    Phone,
    Home,
    MessageSquare,
    Mail,
    Users,
    FileText,
    ClipboardList,
    Plus,
    X,
    Clock,
    AlertCircle,
    Save
} from 'lucide-react';

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

    // Configuración de tipos con Iconos Lucide
    const tiposSeguimiento = [
        { value: 'llamada', label: 'Llamada', icon: Phone, color: 'text-blue-500', bg: 'bg-blue-50' },
        { value: 'visita', label: 'Visita', icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { value: 'mensaje', label: 'Mensaje', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { value: 'email', label: 'Email', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' },
        { value: 'reunion', label: 'Reunión', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
        { value: 'documento', label: 'Documento', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50' },
        { value: 'otro', label: 'Otro', icon: ClipboardList, color: 'text-gray-500', bg: 'bg-gray-50' }
    ];

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
                `${import.meta.env.VITE_BACKEND_URL}/api/seguimientos/${negociacion.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
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
                `${import.meta.env.VITE_BACKEND_URL}/api/seguimientos/${negociacion.id}`,
                nuevoSeguimiento,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Seguimiento registrado correctamente');
            setNuevoSeguimiento({ comentario: '', tipo: 'otro' });
            setShowForm(false);
            await cargarSeguimientos();

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
        if (usuario?.rol === 'admin') return true;
        if (usuario?.rol === 'agente') {
            if (negociacion?.agenteId === usuario?.id) return true;
            if (negociacion?.propiedad?.agenteId === usuario?.id) return true;
        }
        return false;
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getTipoConfig = (tipo) => {
        return tiposSeguimiento.find(t => t.value === tipo) || tiposSeguimiento[tiposSeguimiento.length - 1];
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="md" text="Cargando historial..." />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar - Sin título redundante */}
            <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 p-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                        {seguimientos.length} evento{seguimientos.length !== 1 ? 's' : ''} registrado{seguimientos.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {canCreateSeguimiento() && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 ${showForm
                            ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'bg-orange-600 text-white hover:bg-orange-700 hover:-translate-y-0.5'
                            }`}
                    >
                        {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {showForm ? 'Cancelar' : 'Nuevo Evento'}
                    </button>
                )}
            </div>

            {/* Formulario */}
            {showForm && (
                <div className="p-6 bg-orange-50/30 border-b border-orange-100 animate-fadeIn">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Tipo de Evento
                                </label>
                                <div className="space-y-2">
                                    {tiposSeguimiento.map((tipo) => {
                                        const Icon = tipo.icon;
                                        const isSelected = nuevoSeguimiento.tipo === tipo.value;
                                        return (
                                            <button
                                                key={tipo.value}
                                                type="button"
                                                onClick={() => setNuevoSeguimiento({ ...nuevoSeguimiento, tipo: tipo.value })}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isSelected
                                                    ? 'bg-white shadow-md ring-1 ring-orange-200 text-gray-800 font-semibold'
                                                    : 'hover:bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-md ${tipo.bg} ${tipo.color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                {tipo.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Detalles del Seguimiento
                                </label>
                                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                                    <textarea
                                        value={nuevoSeguimiento.comentario}
                                        onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, comentario: e.target.value })}
                                        rows={6}
                                        maxLength={1000}
                                        placeholder="Escribe los detalles importantes de la interacción aquí..."
                                        className="w-full border-0 focus:ring-0 text-sm text-gray-700 resize-none p-3 rounded-lg"
                                        required
                                    />
                                    <div className="px-3 pb-2 flex justify-between items-center border-t border-gray-50 pt-2">
                                        <span className="text-[10px] text-gray-400">
                                            {nuevoSeguimiento.comentario.length}/1000
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={submitting || !nuevoSeguimiento.comentario.trim()}
                                            className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {submitting ? <ButtonSpinner size="sm" color="white" /> : <Save className="w-3 h-3" />}
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Este registro será permanente y visible para todo el equipo asignado.</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Timeline */}
            <div className="p-6 bg-gray-50 min-h-[300px]">
                {seguimientos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <ClipboardList className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-medium">Sin historial registrado</h4>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                            {canCreateSeguimiento()
                                ? 'Sé el primero en registrar una interacción para esta negociación.'
                                : 'Aún no hay actividad registrada en esta negociación.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 relative pl-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent">
                        {seguimientos.map((seguimiento) => {
                            const config = getTipoConfig(seguimiento.tipo);
                            const Icon = config.icon;

                            return (
                                <div key={seguimiento.id} className="relative">
                                    {/* Icono Lateral */}
                                    <div className="absolute -left-[2.1rem] top-0 flex items-center justify-center w-8 h-8 rounded-full border-4 border-gray-50 bg-white shadow-sm z-10">
                                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                    </div>

                                    {/* Tarjeta de Contenido */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color} border border-opacity-20`}>
                                                {config.label}
                                            </span>
                                            <time className="text-[10px] text-gray-400 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-full">
                                                <Clock className="w-3 h-3" />
                                                {formatearFecha(seguimiento.fecha)}
                                            </time>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                            {seguimiento.comentario}
                                        </p>
                                        <div className="pt-2 border-t border-gray-50 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                {seguimiento.agente.name.charAt(0)}
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {seguimiento.agente.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialSeguimientos;
