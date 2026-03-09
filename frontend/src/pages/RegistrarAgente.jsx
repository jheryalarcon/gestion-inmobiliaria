import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { PageSpinner } from '../components/Spinner';
import DocumentManager from '../components/DocumentManager';
import { UserPlus, Save, X, FileText, User, Phone, Mail, Lock, Eye, EyeOff, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

export default function RegistrarAgente() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estados del formulario
    const [datos, setDatos] = useState({
        name: '',
        email: '',
        telefono: '',
        cedula: '',     // Nuevo campo
        direccion: '',  // Nuevo campo
        password: '',
        confirmPassword: ''
    });

    const [errores, setErrores] = useState({});

    // Visibilidad de contraseñas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Documentos
    const [documentos, setDocumentos] = useState({
        identificacion: [],
        contrato: [],
        hoja_vida: [],
        certificado: [],
        otro: []
    });

    // Referencia para comparación de cambios
    const initialDatos = {
        name: '',
        email: '',
        telefono: '',
        cedula: '',
        direccion: '',
        password: '',
        confirmPassword: ''
    };

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
        } catch (error) {
            console.error('Error al decodificar token:', error);
            localStorage.removeItem('token');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Protección ante recarga/cierre de pestaña
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hayCambios()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatos(prev => ({ ...prev, [name]: value }));

        // Limpieza de errores en tiempo real
        if (errores[name]) {
            setErrores(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleUpload = (e, categoria) => {
        const files = Array.from(e.target.files);
        setDocumentos(prev => ({
            ...prev,
            [categoria]: [...prev[categoria], ...files]
        }));
    };

    const handleDelete = (categoria, index) => {
        setDocumentos(prev => ({
            ...prev,
            [categoria]: prev[categoria].filter((_, i) => i !== index)
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!datos.name.trim()) nuevosErrores.name = 'El nombre es obligatorio';
        else if (datos.name.trim().length < 2) nuevosErrores.name = 'El nombre es obligatorio';

        if (!datos.email.trim()) {
            nuevosErrores.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
            nuevosErrores.email = 'Formato de email inválido';
        }

        if (!datos.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else if (!/^[0-9]{10}$/.test(datos.telefono.replace(/\s/g, ''))) {
            nuevosErrores.telefono = 'El teléfono debe tener 10 dígitos';
        }

        // Validación Cédula (Obligatoria)
        if (!datos.cedula.trim()) {
            nuevosErrores.cedula = 'La cédula es obligatoria';
        } else if (!/^\d{10,13}$/.test(datos.cedula)) {
            nuevosErrores.cedula = 'La cédula debe tener 10-13 dígitos numéricos';
        }

        if (!datos.password) {
            nuevosErrores.password = 'La contraseña es obligatoria';
        } else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(datos.password)) {
            nuevosErrores.password = 'Debe tener 8 caracteres, al menos una mayúscula y un número';
        }

        if (datos.password !== datos.confirmPassword) {
            nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!documentos.identificacion || documentos.identificacion.length === 0) {
            nuevosErrores.identificacion = 'El documento de Cédula / Pasaporte es obligatorio';
        }

        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nuevosErrores = validarFormulario();
        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            toast.error('Por favor, corrige los errores del formulario');

            // UX: Enfocar el primer error
            const primerCampo = Object.keys(nuevosErrores)[0];
            const elemento = document.querySelector(`[name="${primerCampo}"]`);
            if (elemento) {
                elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                elemento.focus();
            }
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // 1. Crear Agente
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agentes/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: datos.name.trim(),
                    email: datos.email.trim().toLowerCase(),
                    telefono: datos.telefono.trim(),
                    cedula: datos.cedula.trim(),
                    direccion: datos.direccion.trim(),
                    password: datos.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                const agenteId = data.agente.id;

                // 2. Subir Documentos
                const uploadPromises = [];
                for (const [key, files] of Object.entries(documentos)) {
                    if (files.length > 0) {
                        const formData = new FormData();
                        let tipoBackend = 'OTRO';
                        if (key === 'identificacion') tipoBackend = 'IDENTIFICACION';
                        if (key === 'contrato') tipoBackend = 'CONTRATO';
                        if (key === 'hoja_vida') tipoBackend = 'HOJA_VIDA';
                        if (key === 'certificado') tipoBackend = 'CERTIFICADO';

                        formData.append('tipo', tipoBackend);
                        files.forEach(file => formData.append('documentos', file));

                        uploadPromises.push(
                            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documentos/agente/${agenteId}`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                            })
                        );
                    }
                }

                if (uploadPromises.length > 0) {
                    toast.info('Subiendo documentos...');
                    await Promise.all(uploadPromises);
                }

                toast.success('Agente creado exitosamente', {
                    duration: 6000,
                    description: `Credenciales: ${datos.email} / ${datos.password}`,
                    action: {
                        label: 'Copiar',
                        onClick: () => {
                            navigator.clipboard.writeText(`Email: ${datos.email}\nPass: ${datos.password}`);
                            toast.success('Copiado al portapapeles');
                        }
                    }
                });

                // Reset y Redirección
                setDatos(initialDatos);
                setDocumentos({ identificacion: [], contrato: [], hoja_vida: [], certificado: [], otro: [] });

                setTimeout(() => navigate('/admin/panel-agentes'), 2000);

            } else {
                // Manejo de errores de duplicados
                if (data.error && data.error.includes('email')) {
                    setErrores(prev => ({ ...prev, email: data.error }));
                } else if (data.error && data.error.includes('cédula')) {
                    setErrores(prev => ({ ...prev, cedula: data.error }));
                }
                toast.error(data.error || 'Error al crear el agente');
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        } finally {
            setSubmitting(false);
        }
    };

    const hayCambios = () => {
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        for (const key in documentos) {
            if (documentos[key].length > 0) return true;
        }
        return false;
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hayCambios() && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => navigate('/admin/panel-agentes');

    if (loading) return <PageSpinner text="Cargando formulario..." />;

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">

                {/* Header (Estilo Cliente pero Azul) */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 border-t-4 border-blue-600 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            Registrar Nuevo Agente
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm ml-14">
                            Alta de personal inmobiliario con acceso al sistema
                        </p>
                    </div>
                    <div className="text-xs text-gray-400">
                        <span className="text-red-500 font-bold">*</span> Campos obligatorios
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* SECCIÓN 1: DATOS PERSONALES */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                                <User className="w-5 h-5 text-blue-500" />
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre Completo <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={datos.name}
                                        onChange={handleChange}
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.name ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                        placeholder="Ej: Laura Martínez"
                                    />
                                    {errores.name && <p className="text-red-500 text-xs mt-1 font-medium">{errores.name}</p>}
                                </div>

                                {/* Cédula */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cédula / DNI <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="cedula"
                                            maxLength="13"
                                            value={datos.cedula}
                                            onChange={(e) => {
                                                if (/^\d*$/.test(e.target.value)) handleChange(e);
                                            }}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.cedula ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Ej: 1712345678"
                                        />
                                    </div>
                                    {errores.cedula && <p className="text-red-500 text-xs mt-1 font-medium">{errores.cedula}</p>}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            maxLength="10"
                                            value={datos.telefono}
                                            onChange={(e) => {
                                                if (/^\d*$/.test(e.target.value)) handleChange(e);
                                            }}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.telefono ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Ej: 0991234567"
                                        />
                                    </div>
                                    {errores.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errores.telefono}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={datos.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.email ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Ej: laura.martinez@email.com"
                                        />
                                    </div>
                                    {errores.email && <p className="text-red-500 text-xs mt-1 font-medium">{errores.email}</p>}
                                </div>

                                {/* Dirección (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección Domiciliaria</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={datos.direccion}
                                            onChange={handleChange}
                                            className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 focus:border-blue-500 transition-colors"
                                            placeholder="Ej: Av. Amazonas N24-03"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 2: SEGURIDAD Y ACCESO */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                Credenciales de Acceso
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={datos.password}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.password ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="8+ caracteres, 1 mayúscula, 1 número"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errores.password && <p className="text-red-500 text-xs mt-1 font-medium">{errores.password}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Contraseña <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={datos.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Repite la contraseña"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errores.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errores.confirmPassword}</p>}
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 3: DOCUMENTACIÓN - Estilo similar a RegistrarCliente */}
                        <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Documentación (RRHH)
                            </h3>
                            <div className="w-full">
                                <DocumentManager
                                    mode="agente"
                                    documentos={documentos}
                                    onUpload={handleUpload}
                                    onDelete={handleDelete}
                                    errores={errores}
                                />
                            </div>
                            {errores.identificacion && (
                                <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                                    ⚠️ {errores.identificacion}
                                </p>
                            )}
                        </section>

                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {submitting ? 'Guardando...' : 'Guardar Agente'}
                            </button>
                        </div>

                    </form>
                </div>

                {/* MODAL DE CAMBIOS SIN GUARDAR (Igual a RegistrarCliente) */}
                {blocker.state === 'blocked' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="text-center mb-6">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Cambios sin guardar</h3>
                                <p className="text-sm text-gray-500 mt-2">Tienes información pendiente. ¿Deseas salir?</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => blocker.reset()}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    onClick={() => blocker.proceed()}
                                    className="flex-1 bg-yellow-600 text-white font-medium py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                                >
                                    Salir sin guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
