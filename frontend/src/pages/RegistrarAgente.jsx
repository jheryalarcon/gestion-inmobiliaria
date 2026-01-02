import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { PageSpinner } from '../components/Spinner';
import DocumentManager from '../components/DocumentManager';
import { Eye, EyeOff } from 'lucide-react';

export default function RegistrarAgente() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [datos, setDatos] = useState({
        name: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: ''
    });
    const [errores, setErrores] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Estados para visibilidad de contraseña
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const cancelarRef = useRef(null);

    const initialDatos = {
        name: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: ''
    };

    const [documentos, setDocumentos] = useState({
        identificacion: [],
        contrato: [],
        hoja_vida: [],
        certificado: [],
        otro: []
    });

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.rol !== 'admin') {
                toast.error('No tienes permisos para acceder a esta página', { duration: 3000 });
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

    const obtenerMensajeErrorCampo = (campo) => {
        const mensajes = {
            name: 'El nombre es obligatorio',
            email: 'El correo electrónico es obligatorio',
            password: 'La contraseña es obligatoria',
            confirmPassword: 'Confirma la contraseña'
        };
        return mensajes[campo] || 'Campo obligatorio';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDatos(prev => ({
            ...prev,
            [name]: value
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

        // Validar contraseña
        if (!datos.password) {
            nuevosErrores.password = 'La contraseña es obligatoria';
        } else if (datos.password.length < 6) {
            nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Validar confirmación de contraseña
        if (!datos.confirmPassword) {
            nuevosErrores.confirmPassword = 'Confirma la contraseña';
        } else if (datos.password !== datos.confirmPassword) {
            nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/agentes/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: datos.name.trim(),
                    email: datos.email.trim().toLowerCase(),


                    telefono: datos.telefono.trim(),
                    password: datos.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.mensaje, { duration: 3000 });

                // Subir documentos si existen
                const agenteId = data.agente.id;
                const uploadPromises = [];

                for (const [key, files] of Object.entries(documentos)) {
                    if (files.length > 0) {
                        const formData = new FormData();
                        // Mapear claves de frontend a tipos de backend (enum)
                        let tipoBackend = 'OTRO';
                        if (key === 'identificacion') tipoBackend = 'IDENTIFICACION';
                        if (key === 'contrato') tipoBackend = 'CONTRATO';
                        if (key === 'hoja_vida') tipoBackend = 'HOJA_VIDA';
                        if (key === 'certificado') tipoBackend = 'CERTIFICADO';

                        formData.append('tipo', tipoBackend);
                        files.forEach(file => formData.append('documentos', file));

                        uploadPromises.push(
                            fetch(`http://localhost:3000/api/documentos/agente/${agenteId}`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: formData
                            })
                        );
                    }
                }

                await Promise.all(uploadPromises);

                // Mostrar credenciales del agente creado
                toast.success('Agente creado exitosamente', {
                    duration: 6000,
                    description: `Email: ${datos.email} | Contraseña: ${datos.password}`,
                    action: {
                        label: 'Copiar',
                        onClick: () => {
                            navigator.clipboard.writeText(`Email: ${datos.email}\nContraseña: ${datos.password}`);
                            toast.success('Credenciales copiadas', { duration: 2000 });
                        }
                    }
                });

                // Limpiar formulario
                setDatos({
                    name: '',
                    email: '',
                    telefono: '',
                    password: '',
                    confirmPassword: ''
                });
                setErrores({});

                // Redirigir al panel de agentes después de 2 segundos
                setTimeout(() => {
                    navigate('/admin/panel-agentes');
                }, 2000);
            } else {
                toast.error(data.error || 'Error al crear el agente', { duration: 4000 });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión al crear el agente', { duration: 4000 });
        } finally {
            setSubmitting(false);
        }
    };

    const hayCambios = () => {
        // Compara datos actuales con los iniciales
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        return false;
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hayCambios() && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => {
        navigate('/admin/panel-agentes');
    };

    if (loading) {
        return <PageSpinner text="Cargando formulario..." />;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 md:p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Registrar Agente</h2>
            <p className="text-center text-gray-600 mb-8">Completa los datos para crear una nueva cuenta de agente inmobiliario</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* DATOS PERSONALES */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Datos Personales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NOMBRE */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Nombre completo <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={datos.name}
                                onChange={handleInputChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.name ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: Juan Pérez"
                            />
                            {errores.name && <p className="text-red-600 text-sm mt-1 font-medium">{errores.name}</p>}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={datos.email}
                                onChange={handleInputChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.email ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: juan.perez@email.com"
                            />
                            {errores.email && <p className="text-red-600 text-sm mt-1 font-medium">{errores.email}</p>}
                        </div>

                        {/* TELÉFONO */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Teléfono <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="telefono"
                                value={datos.telefono}
                                onChange={handleInputChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.telefono ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 0991234567"
                            />
                            {errores.telefono && <p className="text-red-600 text-sm mt-1 font-medium">{errores.telefono}</p>}
                            <p className="text-sm text-gray-500 mt-1">Solo números, entre 7 y 15 dígitos</p>
                        </div>
                    </div>
                </section>

                {/* CREDENCIALES DE ACCESO */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Credenciales de Acceso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CONTRASEÑA */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Contraseña <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={datos.password}
                                    onChange={handleInputChange}
                                    className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.password ? 'border-red-400' : 'border-blue-100'}`}
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errores.password && <p className="text-red-600 text-sm mt-1 font-medium">{errores.password}</p>}
                            <p className="text-sm text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
                        </div>

                        {/* CONFIRMAR CONTRASEÑA */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={datos.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.confirmPassword ? 'border-red-400' : 'border-blue-100'}`}
                                    placeholder="Repite la contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errores.confirmPassword && <p className="text-red-600 text-sm mt-1 font-medium">{errores.confirmPassword}</p>}
                        </div>
                    </div>
                </section>

                {/* DOCUMENTOS (RRHH) */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Documentación (RRHH)</h3>
                    <DocumentManager
                        mode="agente"
                        documentos={documentos}
                        onUpload={handleUpload}
                        onDelete={handleDelete}
                    />
                </section>

                {/* INFORMACIÓN IMPORTANTE */}
                <section className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">ℹ️ Información Importante</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-blue-700">• El agente será creado con rol "agente" automáticamente</p>
                        <p className="text-sm text-blue-700">• La cuenta estará activa inmediatamente</p>
                        <p className="text-sm text-blue-700">• Las credenciales se mostrarán después de la creación</p>
                        <p className="text-sm text-blue-700">• El agente podrá cambiar su contraseña desde su perfil</p>
                    </div>
                </section>

                {/* BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? '⏳ Creando Agente...' : 'Guardar Agente'}
                    </button>
                </div>
            </form>

            {/* Modal de confirmación */}
            {blocker.state === 'blocked' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-yellow-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">⚠️</span> Cambios sin guardar
                        </h3>
                        <p className="text-gray-700 text-center mb-6">Tienes cambios sin guardar. ¿Seguro que quieres salir?</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => blocker.reset()}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => blocker.proceed()}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition"
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
