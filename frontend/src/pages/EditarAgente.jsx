import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { PageSpinner } from '../components/Spinner';

export default function EditarAgente() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [datos, setDatos] = useState({
        name: '',
        email: '',
        telefono: ''
    });
    const [errores, setErrores] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const cancelarRef = useRef(null);
    const initialDatos = useRef({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.rol !== 'admin') {
                toast.error('No tienes permisos para acceder a esta página');
                navigate('/admin');
                return;
            }
            setUsuario(decoded);
            cargarAgente();
        } catch (error) {
            console.error('Error al decodificar token:', error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate, id]);

    // Prevenir salida si hay cambios sin guardar
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const hasChanges = JSON.stringify(datos) !== JSON.stringify(initialDatos.current);
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [datos]);

    const cargarAgente = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/agentes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const agente = data.agente;
                setDatos({
                    name: agente.name,
                    email: agente.email,
                    telefono: agente.telefono || '0000000000'
                });
                initialDatos.current = {
                    name: agente.name,
                    email: agente.email,
                    telefono: agente.telefono || '0000000000'
                };
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Error al cargar el agente');
                navigate('/admin/panel-agentes');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar el agente');
            navigate('/admin/panel-agentes');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setDatos(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar nombre
        if (!datos.name.trim()) {
            nuevosErrores.name = 'El nombre es obligatorio';
        } else if (datos.name.trim().length < 2) {
            nuevosErrores.name = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validar email
        if (!datos.email.trim()) {
            nuevosErrores.email = 'El email es obligatorio';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datos.email)) {
                nuevosErrores.email = 'Formato de email inválido';
            }
        }

        // Validar teléfono
        if (!datos.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else {
            const telefonoRegex = /^[0-9]{7,15}$/;
            if (!telefonoRegex.test(datos.telefono)) {
                nuevosErrores.telefono = 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            toast.error('Por favor corrige los errores en el formulario');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/agentes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.mensaje);
                navigate('/admin/panel-agentes');
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Error al actualizar el agente');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al actualizar el agente');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        const hasChanges = JSON.stringify(datos) !== JSON.stringify(initialDatos.current);
        if (hasChanges) {
            setShowConfirmModal(true);
        } else {
            navigate('/admin/panel-agentes');
        }
    };

    const confirmarCancelar = () => {
        setShowConfirmModal(false);
        navigate('/admin/panel-agentes');
    };

    if (loading) {
        return <PageSpinner text="Cargando datos del agente..." />;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 md:p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Editar Agente</h2>
            <p className="text-center text-gray-600 mb-8">Modifica la información del agente inmobiliario</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Datos Personales */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Datos Personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">
                                Nombre completo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={datos.name}
                                onChange={handleInputChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${
                                    errores.name ? 'border-red-400' : 'border-blue-100'
                                }`}
                                placeholder="Ej: Juan Pérez"
                            />
                            {errores.name && (
                                <p className="text-red-600 text-sm mt-1 font-medium">{errores.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">
                                Correo electrónico <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={datos.email}
                                onChange={handleInputChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${
                                    errores.email ? 'border-red-400' : 'border-blue-100'
                                }`}
                                placeholder="Ej: juan.perez@email.com"
                            />
                            {errores.email && (
                                <p className="text-red-600 text-sm mt-1 font-medium">{errores.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={datos.telefono}
                                onChange={handleInputChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${
                                    errores.telefono ? 'border-red-400' : 'border-blue-100'
                                }`}
                                placeholder="Ej: 0991234567"
                            />
                            {errores.telefono && (
                                <p className="text-red-600 text-sm mt-1 font-medium">{errores.telefono}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Solo números, entre 7 y 15 dígitos</p>
                        </div>
                    </div>
                </section>


                {/* Información Importante */}
                <section className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">ℹ️ Información Importante</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-blue-700">• Solo se pueden editar el nombre, email y teléfono del agente</p>
                        <p className="text-sm text-blue-700">• El rol no se puede modificar desde esta vista</p>
                        <p className="text-sm text-blue-700">• La contraseña se maneja en un módulo separado</p>
                        <p className="text-sm text-blue-700">• El email debe ser único en el sistema</p>
                    </div>
                </section>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={handleCancel}
                        ref={cancelarRef}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? '⏳ Guardando...' : '✅ Guardar Cambios'}
                    </button>
                </div>
            </form>

            {/* Modal de confirmación para cancelar */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-orange-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">⚠️</span> Cambios sin guardar
                        </h3>
                        <p className="text-gray-700 text-center mb-6">
                            Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?
                        </p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Continuar editando
                            </button>
                            <button
                                onClick={confirmarCancelar}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition"
                            >
                                Salir sin guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
