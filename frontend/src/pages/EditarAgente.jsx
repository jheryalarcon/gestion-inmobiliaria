import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { PageSpinner } from '../components/Spinner';
import DocumentManager from '../components/DocumentManager';
import { Lock, Eye, EyeOff } from 'lucide-react';

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
            const response = await fetch(`http://localhost:3000/api/documentos/agente/${id}`, {
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
            const response = await fetch(`http://localhost:3000/api/documentos/agente/${docToDelete.id}`, {
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
        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setSubmittingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/agentes/${id}/password`, {
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

    const hayCambios = () => {
        return JSON.stringify(datos) !== JSON.stringify(initialDatos.current);
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hayCambios() && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => {
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
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.name ? 'border-red-400' : 'border-blue-100'
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
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.email ? 'border-red-400' : 'border-blue-100'
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
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.telefono ? 'border-red-400' : 'border-blue-100'
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


                {/* Documentación (RRHH) */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Documentación (RRHH)</h3>
                    <DocumentManager
                        mode="agente"
                        documentos={documentos}
                        onUpload={handleUploadDocumento}
                        onDelete={eliminarDocumento}
                    />
                </section>

                {/* Información Importante y Seguridad */}
                <section className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200 space-y-4">
                    <div className='flex justify-between items-center'>
                        <h3 className="text-xl font-bold text-blue-800">ℹ️ Información y Seguridad</h3>
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Lock size={16} />
                            Cambiar Contraseña
                        </button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-blue-700">• Solo se pueden editar el nombre, email y teléfono del agente</p>
                        <p className="text-sm text-blue-700">• El rol no se puede modificar desde esta vista</p>
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
                                        placeholder="Mínimo 6 caracteres"
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
