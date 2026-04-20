import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import SelectTipoCliente from '../components/SelectTipoCliente';
import DocumentManager from '../components/DocumentManager';
import { toast } from 'sonner';
import { PageSpinner, ButtonSpinner } from '../components/Spinner';
import { UserCheck, Save, X, FileText, User, Phone, Mail, AlertTriangle, CreditCard, AlignLeft } from 'lucide-react';

export default function EditarCliente() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [agentes, setAgentes] = useState([]);

    // Estado para documentos
    const [documentos, setDocumentos] = useState({
        cedula: [],
        papeleta_votacion: [],
        poder: [],
        otro: []
    });

    const [datos, setDatos] = useState({
        nombre: '',
        telefono: '',
        email: '',
        cedula: '',
        tipo_cliente: '',
        agenteId: '',
        observaciones: ''
    });

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const cancelarRef = useRef(null);

    const initialDatos = useRef({
        nombre: '',
        telefono: '',
        email: '',
        cedula: '',
        tipo_cliente: '',
        agenteId: '',
        observaciones: ''
    });

    // Rastrear si hubo cambios en documentos (subidas/eliminaciones)
    const [documentosCambiados, setDocumentosCambiados] = useState(false);

    // --- AGENT SEARCH STATE --- (Updated)
    const [mostrarAgentes, setMostrarAgentes] = useState(false);
    const [busquedaAgente, setBusquedaAgente] = useState('');
    const agentRef = useRef(null);

    // Derived state for Agent Search
    const getAgenteInputValue = () => {
        if (mostrarAgentes) return busquedaAgente; // Mientras busca/escribe
        if (datos.agenteId) {
            const selected = agentes.find(a => a.id === parseInt(datos.agenteId));
            return selected ? (selected.name || selected.email) : '';
        }
        return '';
    };

    const agentesFiltrados = agentes.filter(agente => {
        const term = busquedaAgente.toLowerCase();
        const name = (agente.name || '').toLowerCase();
        const email = (agente.email || '').toLowerCase();
        return name.includes(term) || email.includes(term);
    });

    // Click Outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Agente Search
            if (agentRef.current && !agentRef.current.contains(event.target)) {
                setMostrarAgentes(false);
                setBusquedaAgente('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper para mapear tipos de BD a claves de estado
    const mapDocTypeToKey = (tipo) => {
        const mapping = {
            'CEDULA': 'cedula',
            'PAPELETA_VOTACION': 'papeleta_votacion',
            'PODER': 'poder',
            'OTRO': 'otro'
        };
        return mapping[tipo] || 'otro';
    };

    const mapKeyToDocType = (key) => {
        const mapping = {
            'cedula': 'CEDULA',
            'papeleta_votacion': 'PAPELETA_VOTACION',
            'poder': 'PODER',
            'otro': 'OTRO'
        };
        return mapping[key] || 'OTRO';
    };

    const organizeDocuments = (docs) => {
        const organized = {
            cedula: [],
            papeleta_votacion: [],
            poder: [],
            otro: []
        };

        if (Array.isArray(docs)) {
            docs.forEach(doc => {
                const key = mapDocTypeToKey(doc.tipo);
                if (organized[key]) {
                    // Asegurar que el nombre tenga extensión
                    let finalName = doc.nombre;
                    if (doc.url) {
                        const extension = doc.url.split('.').pop();
                        const nameHasExtension = doc.nombre.toLowerCase().endsWith('.' + extension.toLowerCase());
                        if (!nameHasExtension && extension) {
                            finalName = `${doc.nombre}.${extension}`;
                        }
                    }

                    organized[key].push({
                        ...doc,
                        name: finalName // Normalizar propiedad name para DocumentManager
                    });
                }
            });
        }
        return organized;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const decoded = jwtDecode(token);
        setUsuario(decoded);

        if (decoded.rol === 'cliente') {
            navigate('/inicio');
            return;
        }

        // Cargar datos del cliente
        cargarCliente(token);

        // Cargar agentes si es admin
        if (decoded.rol === 'admin') {
            cargarAgentes(token);
        }
    }, [id]);

    const cargarCliente = async (token) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const clienteData = response.data.cliente;

            // Bloquear acceso al formulario si el cliente está inactivo
            if (!clienteData.activo) {
                toast.error('Este cliente está inactivo. Reactívalo primero para poder editarlo.', { duration: 5000 });
                const decoded = jwtDecode(localStorage.getItem('token'));
                navigate(decoded.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes');
                return;
            }

            setCliente(clienteData);

            setDatos({
                nombre: clienteData.nombre || '',
                telefono: clienteData.telefono || '',
                email: clienteData.email || '',
                cedula: clienteData.cedula || '',
                tipo_cliente: clienteData.tipo_cliente || '',
                agenteId: clienteData.agenteId?.toString() || '',
                observaciones: clienteData.observaciones || ''
            });

            // Cargar documentos
            if (clienteData.documentos) {
                setDocumentos(organizeDocuments(clienteData.documentos));
            }

            // Guardar datos iniciales para comparación
            initialDatos.current.nombre = clienteData.nombre || '';
            initialDatos.current.telefono = clienteData.telefono || '';
            initialDatos.current.email = clienteData.email || '';
            initialDatos.current.cedula = clienteData.cedula || '';
            initialDatos.current.tipo_cliente = clienteData.tipo_cliente || '';
            initialDatos.current.agenteId = clienteData.agenteId?.toString() || '';
            initialDatos.current.observaciones = clienteData.observaciones || '';
        } catch (error) {
            console.error('Error al cargar cliente:', error);
            if (error.response?.status === 403) {
                toast.error('No tienes permisos para editar este cliente');
                navigate(usuario?.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes');
            } else if (error.response?.status === 404) {
                toast.error('Cliente no encontrado');
                navigate(usuario?.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes');
            } else {
                toast.error('Error al cargar el cliente');
                navigate(usuario?.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes');
            }
        } finally {
            setLoading(false);
        }
    };

    const cargarAgentes = async (token) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/usuarios/agentes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAgentes(response.data);
        } catch (error) {
            console.error('Error al cargar agentes:', error);
            setAgentes([]);
        }
    };

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
            nombre: 'El nombre es obligatorio',
            telefono: 'El teléfono es obligatorio',
            email: 'El correo electrónico es obligatorio',
            cedula: 'La cédula/RUC es obligatoria',
            tipo_cliente: 'Selecciona un tipo de cliente'
        };
        return mensajes[campo] || 'Campo obligatorio';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setDatos((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrores((prev) => {
            const nuevos = { ...prev };

            // Regla para campos obligatorios generales
            // Si es prospecto, Email y Cédula NO son obligatorios
            const esProspecto = datos.tipo_cliente === 'prospecto';
            const camposObligatorios = ['nombre', 'telefono', 'tipo_cliente'];

            if (!esProspecto) {
                camposObligatorios.push('email', 'cedula');
            }

            if (camposObligatorios.includes(name)) {
                if (value.trim() === '' || value === '') {
                    nuevos[name] = obtenerMensajeErrorCampo(name);
                } else {
                    delete nuevos[name];
                }
            }

            // Validación de formato de email
            if (name === 'email' && value.trim() !== '') {
                const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
                if (!emailRegex.test(value)) {
                    nuevos.email = 'Formato de correo electrónico inválido';
                } else {
                    delete nuevos.email;
                }
            }

            // Validación de teléfono: formato ecuatoriano 10 dígitos
            if (name === 'telefono' && value.trim() !== '') {
                const soloDigitos = value.replace(/\s/g, '');
                const telefonoRegex = /^(09\d{8}|0[2-7]\d{7})$/;
                if (!/^[\d\s]+$/.test(value)) {
                    nuevos.telefono = 'El teléfono solo debe contener números';
                } else if (!telefonoRegex.test(soloDigitos)) {
                    nuevos.telefono = 'Ingresa un número ecuatoriano válido de 10 dígitos (ej: 0991234567)';
                } else {
                    delete nuevos.telefono;
                }
            }

            // Validación de Cédula: exactamente 10 dígitos (Ecuador)
            if (name === 'cedula' && value.trim() !== '') {
                const cedulaRegex = /^\d+$/;
                if (!cedulaRegex.test(value)) {
                    nuevos.cedula = 'La cédula debe contener solo números';
                } else if (value.length !== 10) {
                    nuevos.cedula = 'La cédula debe tener exactamente 10 dígitos';
                } else {
                    delete nuevos.cedula;
                }
            }

            return nuevos;
        });
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        const esProspecto = datos.tipo_cliente === 'prospecto';

        if (!datos.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
        if (!datos.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio';

        if (!esProspecto) {
            if (!datos.email.trim()) nuevosErrores.email = 'El correo electrónico es obligatorio';
            if (!datos.cedula.trim()) nuevosErrores.cedula = 'La cédula/RUC es obligatoria';
        }

        if (!datos.tipo_cliente) nuevosErrores.tipo_cliente = 'Selecciona un tipo de cliente';

        // Validación de formato de email
        if (datos.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(datos.email)) {
            nuevosErrores.email = 'Formato de correo electrónico inválido';
        }

        // Validación de Cédula: exactamente 10 dígitos
        if (datos.cedula.trim()) {
            if (!/^\d+$/.test(datos.cedula)) {
                nuevosErrores.cedula = 'La cédula debe contener solo números';
            } else if (datos.cedula.length !== 10) {
                nuevosErrores.cedula = 'La cédula debe tener exactamente 10 dígitos';
            }
        }

        // Validación de teléfono: formato ecuatoriano 10 dígitos
        if (datos.telefono.trim()) {
            const soloDigitos = datos.telefono.replace(/\s/g, '');
            const telefonoRegex = /^(09\d{8}|0[2-7]\d{7})$/;
            if (!telefonoRegex.test(soloDigitos)) {
                nuevosErrores.telefono = 'Ingresa un número ecuatoriano válido de 10 dígitos (ej: 0991234567)';
            }
        }

        return nuevosErrores;
    };

    const handleUploadDocumento = async (e, key) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const uploadPromise = async () => {
            const formData = new FormData();
            files.forEach(file => formData.append('documentos', file));
            formData.append('tipo', mapKeyToDocType(key));

            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/documentos/cliente/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.documentos;
        };

        toast.promise(uploadPromise(), {
            loading: 'Subiendo documentos...',
            success: (newDocs) => {
                setDocumentos(prev => ({
                    ...prev,
                    [key]: [...prev[key], ...newDocs]
                }));
                setDocumentosCambiados(true); // Marcar cambio de documentos
                return 'Documentos subidos correctamente';
            },
            error: 'Error al subir documentos'
        });
    };

    const handleDeleteDocumento = async (key, index) => {
        const docToDelete = documentos[key][index];
        if (!docToDelete?.id) return;

        const deletePromise = async () => {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/documentos/cliente/doc/${docToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        };

        toast.promise(deletePromise(), {
            loading: 'Eliminando documento...',
            success: () => {
                setDocumentos(prev => ({
                    ...prev,
                    [key]: prev[key].filter((_, i) => i !== index)
                }));
                setDocumentosCambiados(true); // Marcar cambio de documentos
                return 'Documento eliminado';
            },
            error: 'Error al eliminar documento'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        setSaving(true);

        // 1. Validación local (campos obligatorios y formatos)
        const erroresLocales = validarFormulario();

        // 2. Verificaciones asíncronas de duplicados (excluye al cliente actual)
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_BACKEND_URL;
        const headers = { Authorization: `Bearer ${token}` };
        const checks = [];

        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (datos.email?.trim() && emailRegex.test(datos.email.trim())) {
            checks.push(
                fetch(`${baseUrl}/api/clientes/verificar/email?email=${encodeURIComponent(datos.email.trim())}&clienteId=${id}`, { headers })
                    .then(r => r.json())
                    .then(d => !d.disponible ? { campo: 'email', mensaje: d.mensaje } : null)
                    .catch(() => null)
            );
        }

        if (datos.cedula?.trim() && /^\d{10}$/.test(datos.cedula.trim())) {
            checks.push(
                fetch(`${baseUrl}/api/clientes/verificar/cedula?cedula=${encodeURIComponent(datos.cedula.trim())}&clienteId=${id}`, { headers })
                    .then(r => r.json())
                    .then(d => !d.disponible ? { campo: 'cedula', mensaje: d.mensaje } : null)
                    .catch(() => null)
            );
        }

        const resultadosChecks = await Promise.all(checks);
        const erroresDuplicados = {};
        resultadosChecks.forEach(r => { if (r) erroresDuplicados[r.campo] = r.mensaje; });

        // 3. Fusionar todos los errores
        const todosLosErrores = { ...erroresLocales, ...erroresDuplicados };

        if (Object.keys(todosLosErrores).length > 0) {
            setErrores(todosLosErrores);
            setSaving(false);
            toast.error('Por favor, corrige los errores en el formulario.', {
                id: 'errores-validacion'
            });
            setTimeout(() => {
                const primerCampo = Object.keys(todosLosErrores)[0];
                if (primerCampo) {
                    const selector = `[name="${primerCampo}"]`;
                    const elemento = document.querySelector(selector) ||
                        document.querySelector(`${selector} select`) ||
                        document.querySelector(`${selector} input`) ||
                        document.querySelector(`${selector} textarea`);
                    if (elemento) {
                        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        elemento.focus();
                    }
                }
            }, 100);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const datosEnviar = { ...datos };

            // lógica de envío condicional de agenteId
            if (usuario.rol !== 'admin') {
                delete datosEnviar.agenteId; // Agentes no pueden reasignar
            }
            // Si es admin, SE MANTIENE el agenteId que viene del state

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`, datosEnviar, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            toast.success('Cliente actualizado correctamente', {
                duration: 2000,
            });

            // Actualizar referencia de datos iniciales y limpiar flag de documentos para evitar el blocker
            initialDatos.current = {
                nombre: datos.nombre,
                telefono: datos.telefono,
                email: datos.email,
                cedula: datos.cedula,
                tipo_cliente: datos.tipo_cliente,
                agenteId: datos.agenteId,
                observaciones: datos.observaciones
            };
            setDocumentosCambiados(false);
            
            // Navegar automáticamente después de guardar
            setTimeout(() => {
                if (usuario?.rol === 'admin') {
                    navigate('/admin/panel-clientes');
                } else {
                    navigate('/agente/panel-clientes');
                }
            }, 1000);
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            setSaving(false);

            if (error.response?.data?.errores?.length) {
                const erroresBackend = error.response.data.errores;

                // 1. Toast general (uno solo)
                toast.error(
                    `Se ${erroresBackend.length === 1 ? 'encontró 1 error' : `encontraron ${erroresBackend.length} errores`} en el formulario. Revisa los campos marcados.`,
                    {
                        duration: 4000,
                        id: 'errores-backend' // Evita duplicados
                    }
                );

                // 2. Mapear errores a campos específicos
                const nuevosErrores = {};

                erroresBackend.forEach(err => {
                    const errorLower = err.toLowerCase();

                    if (errorLower.includes('email') || errorLower.includes('correo')) {
                        nuevosErrores.email = err;
                    } else if (errorLower.includes('cédula') || errorLower.includes('ruc')) {
                        nuevosErrores.cedula = err;
                    } else if (errorLower.includes('teléfono') || errorLower.includes('telefono')) {
                        nuevosErrores.telefono = err;
                    } else if (errorLower.includes('nombre')) {
                        nuevosErrores.nombre = err;
                    } else if (errorLower.includes('agente')) {
                        nuevosErrores.agenteId = err;
                    } else if (errorLower.includes('tipo')) {
                        nuevosErrores.tipo_cliente = err;
                    }
                });

                setErrores(nuevosErrores);

                // 3. Scroll al primer campo con error
                setTimeout(() => {
                    const primerCampoConError = Object.keys(nuevosErrores)[0];
                    if (primerCampoConError) {
                        const elemento = document.querySelector(`[name="${primerCampoConError}"]`);
                        elemento?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        elemento?.focus();
                    }
                }, 100);
            } else if (error.response?.status === 403) {
                toast.error('No tienes permisos para editar este cliente', { duration: 4000 });
            } else if (error.response?.status === 404) {
                toast.error('Cliente no encontrado', { duration: 4000 });
            } else {
                toast.error(error.response?.data?.mensaje || 'Error al actualizar el cliente', { duration: 4000 });
            }
        } finally {
            setSaving(false);
        }
    };

    const hayCambios = () => {
        // Compara datos de formulario con los datos iniciales
        for (const key in initialDatos.current) {
            if (datos[key] !== initialDatos.current[key]) return true;
        }
        // También detectar si se subieron/eliminaron documentos
        if (documentosCambiados) return true;
        return false;
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hayCambios() && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => {
        if (usuario?.rol === 'admin') {
            navigate('/admin/panel-clientes');
        } else {
            navigate('/agente/panel-clientes');
        }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <PageSpinner text="Cargando datos del cliente..." />;
    }

    if (!cliente) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 border-t-4 border-orange-500 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                                <UserCheck className="w-6 h-6 text-orange-600" />
                            </div>
                            Editar Cliente
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm ml-14">Modifica la información y documentación del cliente</p>
                    </div>
                    <div className="text-xs text-gray-400">
                        <span className="text-red-500 font-bold">*</span> Campos obligatorios
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} noValidate className="space-y-8">
                        {/* ALERTA DE CONVERSIÓN DE PROSPECTO */}
                        {datos.tipo_cliente !== 'prospecto' && cliente?.tipo_cliente === 'prospecto' && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong className="font-bold">⚠️ Conversión de Prospecto:</strong> Estás cambiando el tipo de cliente.
                                            Debes completar <strong>Email</strong> y <strong>Cédula/RUC</strong> antes de guardar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* DATOS PERSONALES */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                                <User className="w-5 h-5 text-orange-500" />
                                Información Personal
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* NOMBRE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombres completos <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={datos.nombre}
                                        onChange={handleChange}
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-gray-50/50 transition-colors ${errores.nombre ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-orange-500'}`}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                    {errores.nombre && <p className="text-red-500 text-xs mt-1 font-medium">{errores.nombre}</p>}
                                </div>

                                {/* CÉDULA / RUC */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cédula / RUC {datos.tipo_cliente !== 'prospecto' && <span className="text-red-500">*</span>}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="cedula"
                                            maxLength="10"
                                            value={datos.cedula}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) handleChange(e);
                                            }}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-gray-50/50 transition-colors ${errores.cedula ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-orange-500'}`}
                                            placeholder={datos.tipo_cliente === 'prospecto' ? "Opcional para prospectos" : "Ej: 1712345678"}
                                        />
                                    </div>
                                    {errores.cedula && <p className="text-red-500 text-xs mt-1 font-medium">{errores.cedula}</p>}
                                </div>

                                {/* TELÉFONO */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={datos.telefono}
                                            onChange={handleChange}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-gray-50/50 transition-colors ${errores.telefono ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-orange-500'}`}
                                            placeholder="Ej: 0991234567"
                                        />
                                    </div>
                                    {errores.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errores.telefono}</p>}
                                </div>

                                {/* EMAIL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico {datos.tipo_cliente !== 'prospecto' && <span className="text-red-500">*</span>}</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={datos.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition-colors ${errores.email ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 bg-gray-50/50'}`}
                                            placeholder={datos.tipo_cliente === 'prospecto' ? "Opcional para prospectos" : "ejemplo@correo.com"}
                                        />
                                    </div>
                                    {errores.email && <p className="text-red-500 text-xs mt-1 font-medium">{errores.email}</p>}
                                </div>

                                {/* TIPO DE CLIENTE */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de cliente <span className="text-red-500">*</span></label>
                                    <SelectTipoCliente
                                        value={datos.tipo_cliente}
                                        onChange={(e) => {
                                            const nuevoTipo = e.target.value;
                                            handleChange({ target: { name: 'tipo_cliente', value: nuevoTipo } });

                                            // Si cambia a prospecto, limpiar errores de campos opcionales
                                            if (nuevoTipo === 'prospecto') {
                                                setErrores(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.email;
                                                    delete newErrors.cedula;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        error={errores.tipo_cliente}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* INFORMACIÓN ADICIONAL */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                                <AlignLeft className="w-5 h-5 text-orange-500" />
                                Información Adicional
                            </h3>
                            <div className="space-y-6">
                                {/* OBSERVACIONES */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={datos.observaciones}
                                        onChange={handleChange}
                                        rows="4"
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-gray-50/50 transition-colors ${errores.observaciones ? 'border-red-400' : 'border-gray-300 focus:border-orange-500'}`}
                                        placeholder="Agrega notas importantes, preferencias o detalles adicionales..."
                                    ></textarea>
                                </div>

                                {/* AGENTE ASIGNADO - VISIBLE SOLO PARA ADMIN */}
                                {usuario?.rol === 'admin' && (
                                    <div ref={agentRef}>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Agente Responsable
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                                                placeholder="Buscar agente por nombre o correo..."
                                                value={getAgenteInputValue()}
                                                onChange={(e) => {
                                                    setBusquedaAgente(e.target.value);
                                                    setMostrarAgentes(true);
                                                    // Si borra todo, limpiar selección
                                                    if (e.target.value === '') {
                                                        handleChange({ target: { name: 'agenteId', value: '' } });
                                                    }
                                                }}
                                                onFocus={() => setMostrarAgentes(true)}
                                            />
                                            {datos.agenteId && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleChange({ target: { name: 'agenteId', value: '' } });
                                                        setBusquedaAgente('');
                                                    }}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}

                                            {mostrarAgentes && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {agentesFiltrados.length > 0 ? (
                                                        agentesFiltrados.map((agente) => (
                                                            <div
                                                                key={agente.id}
                                                                className="px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                                                onClick={() => {
                                                                    handleChange({ target: { name: 'agenteId', value: agente.id } });
                                                                    setMostrarAgentes(false);
                                                                    setBusquedaAgente('');
                                                                }}
                                                            >
                                                                <div className="font-medium text-gray-800">{agente.name}</div>
                                                                <div className="text-xs text-gray-500">{agente.email}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                            No se encontraron agentes
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5 ml-1">
                                            {usuario?.rol === 'admin'
                                                ? 'Como administrador, puedes reasignar este cliente.'
                                                : 'Puedes reasignar este cliente mientras sea un Prospecto.'}
                                        </p>
                                    </div>
                                )}


                                {/* INFORMACIÓN DE AUDITORÍA (solo si está inactivo) */}
                                {!cliente.activo && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-800 mb-1">Cliente Inactivo</h4>
                                            <div className="text-sm text-red-700 space-y-1">
                                                {cliente.fecha_desactivacion && (
                                                    <p><strong>Desactivado el:</strong> {formatearFecha(cliente.fecha_desactivacion)}</p>
                                                )}
                                                {cliente.usuario_desactivador && (
                                                    <p><strong>Desactivado por:</strong> {cliente.usuario_desactivador.name}</p>
                                                )}
                                                <p className="text-xs text-red-600 mt-2 font-medium">
                                                    Este cliente está inactivo y no puede ser editado.
                                                    Contacta a un administrador para reactivarlo.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* DOCUMENTACIÓN (Modo Cliente) */}
                        <section className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                            <h3 className="text-lg font-bold text-orange-800 mb-1 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Documentación del Cliente
                            </h3>
                            <p className="text-xs text-orange-600 mb-4">
                                Formatos aceptados: <strong>PDF, JPG, PNG</strong> · Peso máximo por archivo: <strong>10 MB</strong>
                            </p>
                            <div className="w-full">
                                <DocumentManager
                                    mode="cliente"
                                    documentos={documentos}
                                    onUpload={handleUploadDocumento}
                                    onDelete={handleDeleteDocumento}
                                />
                            </div>
                        </section>

                        {/* BOTONES */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !cliente.activo}
                                className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${cliente.activo
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                    } ${saving ? 'opacity-75' : ''}`}
                            >
                                {saving ? (
                                    <>
                                        <ButtonSpinner />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        {cliente.activo ? <Save className="w-4 h-4" /> : null}
                                        <span>{cliente.activo ? 'Guardar Cambios' : 'Cliente Inactivo'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Modal de confirmación */}
                {blocker.state === 'blocked' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="text-center mb-6">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Cambios sin guardar</h3>
                                <p className="text-sm text-gray-500 mt-2">Tienes cambios pendientes. ¿Estás seguro que deseas salir sin guardar?</p>
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
