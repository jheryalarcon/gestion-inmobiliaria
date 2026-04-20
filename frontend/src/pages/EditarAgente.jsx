import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { PageSpinner } from '../components/Spinner';
import DocumentManager from '../components/DocumentManager';
import { Lock, Eye, EyeOff, User, Mail, Phone, CreditCard, MapPin, Save, X } from 'lucide-react';

export default function EditarAgente() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [datos, setDatos] = useState({
        name: '',
        email: '',
        telefono: '',
        cedula: '',
        direccion: ''
    });
    const [documentos, setDocumentos] = useState({
        identificacion: [],
        contrato: [],
        hoja_vida: [],
        certificado: [],
        otro: []
    });
    const [errores, setErrores] = useState({});

    // Estados para cambio de contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [submittingPassword, setSubmittingPassword] = useState(false);

    const cancelarRef = useRef(null);
    const initialDatos = useRef({});
    const guardadoExitoso = useRef(false);

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

    const cargarAgente = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agentes/${id}`, {
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
                    telefono: agente.telefono || '',
                    cedula: agente.cedula || '',
                    direccion: agente.direccion || ''
                });

                // Procesar documentos existentes
                const docsProcesados = {
                    identificacion: [],
                    contrato: [],
                    hoja_vida: [],
                    certificado: [],
                    otro: []
                };

                if (agente.documentos && Array.isArray(agente.documentos)) {
                    agente.documentos.forEach(doc => {
                        const docFormat = {
                            id: doc.id,
                            name: doc.nombre,
                            url: doc.url,
                            type: 'application/pdf' // Tipo genérico para visualización
                        };

                        if (doc.tipo === 'IDENTIFICACION') docsProcesados.identificacion.push(docFormat);
                        else if (doc.tipo === 'CONTRATO') docsProcesados.contrato.push(docFormat);
                        else if (doc.tipo === 'HOJA_VIDA') docsProcesados.hoja_vida.push(docFormat);
                        else if (doc.tipo === 'CERTIFICADO') docsProcesados.certificado.push(docFormat);
                        else docsProcesados.otro.push(docFormat);
                    });
                }
                setDocumentos(docsProcesados);

                initialDatos.current = {
                    name: agente.name,
                    email: agente.email,
                    telefono: agente.telefono || '',
                    cedula: agente.cedula || '',
                    direccion: agente.direccion || ''
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

    const handleUploadDocumento = async (e, tipo) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('documentos', file));

        let tipoBackend = 'OTRO';
        if (tipo === 'identificacion') tipoBackend = 'IDENTIFICACION';
        if (tipo === 'contrato') tipoBackend = 'CONTRATO';
        if (tipo === 'hoja_vida') tipoBackend = 'HOJA_VIDA';
        if (tipo === 'certificado') tipoBackend = 'CERTIFICADO';

        formData.append('tipo', tipoBackend);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documentos/agente/${id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const newDocs = data.documentos.map(doc => ({
                    id: doc.id,
                    name: doc.nombre,
                    url: doc.url,
                    type: 'application/pdf'
                }));

                setDocumentos(prev => ({
                    ...prev,
                    [tipo]: [...prev[tipo], ...newDocs]
                }));
                toast.success('Documentos subidos correctamente');
            } else {
                toast.error('Error al subir documentos');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión al subir documentos');
        }
    };

    const eliminarDocumento = async (tipo, index) => {
        const docToDelete = documentos[tipo][index];
        if (!docToDelete.id) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documentos/agente/${docToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setDocumentos(prev => {
                    const newByType = [...prev[tipo]];
                    newByType.splice(index, 1);
                    return { ...prev, [tipo]: newByType };
                });
                toast.success('Documento eliminado');
            } else {
                toast.error('Error al eliminar documento');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar documento');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setDatos(prev => ({ ...prev, [name]: newValue }));
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Validar contraseña con política estricta
        if (!passwordData.newPassword) {
            toast.error('La contraseña es obligatoria');
            return;
        }
        if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwordData.newPassword)) {
            toast.error('Debe tener 8 caracteres, al menos una mayúscula y un número');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setSubmittingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agentes/${id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: passwordData.newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.mensaje);
                setShowPasswordModal(false);
                setPasswordData({ newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión al cambiar contraseña');
        } finally {
            setSubmittingPassword(false);
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar nombre
        if (!datos.name.trim()) {
            nuevosErrores.name = 'El nombre es obligatorio';
        } else if (datos.name.trim().length < 2) {
            nuevosErrores.name = 'El nombre es obligatorio';
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

        // Validar teléfono (10 dígitos exactos)
        if (!datos.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else if (!/^[0-9]{10}$/.test(datos.telefono.replace(/\s/g, ''))) {
            nuevosErrores.telefono = 'El teléfono debe tener 10 dígitos';
        }

        // Validar Cédula (Obligatoria)
        if (!datos.cedula.trim()) {
            nuevosErrores.cedula = 'La cédula es obligatoria';
        } else if (!/^\d{10,13}$/.test(datos.cedula)) {
            nuevosErrores.cedula = 'La cédula debe tener 10-13 dígitos numéricos';
        }

        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nuevosErrores = validarFormulario();
        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            toast.error('Por favor, corrige los errores del formulario');
            // Auto-focus en el primer campo con error
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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/agentes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                const data = await response.json();
                guardadoExitoso.current = true; // Marcar como guardado exitoso
                toast.success(data.mensaje);
                navigate('/admin/panel-agentes');
            } else {
                const errorData = await response.json();

                // Manejo de errores de duplicados para mostrar en los inputs
                if (errorData.error) {
                    if (errorData.error.includes('email')) {
                        setErrores(prev => ({ ...prev, email: errorData.error }));
                    } else if (errorData.error.includes('cédula')) {
                        setErrores(prev => ({ ...prev, cedula: errorData.error }));
                    }
                }

                toast.error(errorData.error || 'Error al actualizar el agente');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al actualizar el agente');
        } finally {
            setSubmitting(false);
        }
    };

    const hayCambios = () => {
        return JSON.stringify(datos) !== JSON.stringify(initialDatos.current);
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !guardadoExitoso.current && hayCambios() && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => {
        navigate('/admin/panel-agentes');
    };

    if (loading) {
        return <PageSpinner text="Cargando datos del agente..." />;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 border-t-4 border-blue-600 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            Editar Agente
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm ml-14">
                            Modifica la información del agente inmobiliario
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
                                        onChange={handleInputChange}
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.name ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                        placeholder="Ej: Laura Martínez"
                                    />
                                    {errores.name && <p className="text-red-500 text-xs mt-1 font-medium">{errores.name}</p>}
                                </div>

                                {/* Cédula */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cédula<span className="text-red-500">*</span></label>
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
                                                if (/^\d*$/.test(e.target.value)) handleInputChange(e);
                                            }}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.cedula ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Ej: 1712345678"
                                        />
                                    </div>
                                    {errores.cedula && <p className="text-red-500 text-xs mt-1 font-medium">{errores.cedula}</p>}
                                    {!errores.cedula && <p className="text-xs text-gray-500 mt-1">Debe ser única en el sistema</p>}
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
                                                if (/^\d*$/.test(e.target.value)) handleInputChange(e);
                                            }}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.telefono ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Ej: 0991234567"
                                        />
                                    </div>
                                    {errores.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errores.telefono}</p>}
                                    {!errores.telefono && <p className="text-xs text-gray-500 mt-1">Exactamente 10 dígitos</p>}
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
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors ${errores.email ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-500'}`}
                                            placeholder="Ej: laura.martinez@email.com"
                                        />
                                    </div>
                                    {errores.email && <p className="text-red-500 text-xs mt-1 font-medium">{errores.email}</p>}
                                    {!errores.email && <p className="text-xs text-gray-500 mt-1">Debe ser único en el sistema</p>}
                                </div>

                                {/* Dirección */}
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
                                            onChange={handleInputChange}
                                            className="w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-colors border-gray-300 focus:border-blue-500"
                                            placeholder="Ej: Av. Amazonas N24-03"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>


                        {/* Documentación (RRHH) */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                                <Lock className="w-5 h-5 text-blue-500" />
                                Documentación (RRHH)
                            </h3>
                            <DocumentManager
                                mode="agente"
                                documentos={documentos}
                                onUpload={handleUploadDocumento}
                                onDelete={eliminarDocumento}
                            />
                        </section>

                        {/* Información y Seguridad */}
                        <section className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-blue-500" />
                                    Seguridad
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                    <Lock size={16} />
                                    Cambiar Contraseña
                                </button>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p>• Solo se pueden editar los datos personales del agente</p>
                                <p>• El email y cédula deben ser únicos en el sistema</p>
                                <p>• El agente puede recuperar su contraseña desde la página de inicio de sesión</p>
                            </div>
                        </section>

                        {/* Botones */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                ref={cancelarRef}
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
                                {submitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>

                    {/* Modal de Cambio de Contraseña */}
                    {showPasswordModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Lock className="text-blue-600" /> Cambiar Contraseña
                                </h3>
                                <p className="text-gray-600 mb-6 text-sm">Ingresa la nueva contraseña para el agente.</p>

                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="8+ caracteres, 1 mayúscula, 1 número"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600"
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmNewPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Repite la contraseña"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600"
                                            >
                                                {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPasswordModal(false);
                                                setPasswordData({ newPassword: '', confirmPassword: '' });
                                            }}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingPassword}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            {submittingPassword ? 'Guardando...' : 'Actualizar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal de confirmación para cancelar */}
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
        </div>
    );
}
