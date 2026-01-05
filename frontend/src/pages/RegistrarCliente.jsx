import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useBlocker } from 'react-router-dom';
import SelectTipoCliente from '../components/SelectTipoCliente';
import DocumentManager from '../components/DocumentManager';
import { toast } from 'sonner';
import { UserPlus, Save, X, FileText, User, Phone, Mail, CreditCard, AlignLeft } from 'lucide-react'; // Import icons

export default function RegistrarCliente() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [datos, setDatos] = useState({
        nombre: '',
        telefono: '',
        email: '',
        cedula: '',
        tipo_cliente: '',
        agenteId: ''
    });

    const [documentos, setDocumentos] = useState({
        cedula: [],
        papeleta_votacion: [],
        poder: [],
        otro: []
    });

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const cancelarRef = useRef(null);

    const initialDatos = {
        nombre: '',
        telefono: '',
        email: '',
        cedula: '',
        tipo_cliente: '',
        agenteId: ''
    };

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

        if (decoded.rol === 'admin') {
            axios.get('http://localhost:3000/api/usuarios/agentes', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setAgentes(res.data))
                .catch(() => setAgentes([]))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

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
            tipo_cliente: 'Selecciona un tipo de cliente',
            agenteId: 'Debe seleccionar un agente'
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

            // Validación para agenteId (en tiempo real)
            if (name === 'agenteId') {
                if (value === '') {
                    nuevos.agenteId = 'Debe seleccionar un agente';
                } else {
                    delete nuevos.agenteId;
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

            // Validación de teléfono (Permitir + y espacios)
            if (name === 'telefono' && value.trim() !== '') {
                const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
                if (!telefonoRegex.test(value)) {
                    nuevos.telefono = 'Formato de teléfono inválido (solo números, espacios, +, -)';
                } else {
                    delete nuevos.telefono;
                }
            }

            // Validación de Cédula/RUC (Solo números y max 13)
            if (name === 'cedula' && value.trim() !== '') {
                const cedulaRegex = /^\d+$/;
                if (!cedulaRegex.test(value)) {
                    nuevos.cedula = 'La cédula/RUC debe contener solo números';
                } else if (value.length > 13) {
                    nuevos.cedula = 'La cédula/RUC no debe superar los 13 dígitos';
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

        // Validación de Cédula
        if (datos.cedula.trim()) {
            if (!/^\d+$/.test(datos.cedula)) {
                nuevosErrores.cedula = 'La cédula/RUC debe contener solo números';
            } else if (datos.cedula.length > 13) {
                nuevosErrores.cedula = 'Máximo 13 dígitos';
            }
        }

        // Validación de teléfono
        if (datos.telefono.trim() && !/^[\d\s\-\+\(\)]+$/.test(datos.telefono)) {
            nuevosErrores.telefono = 'Formato de teléfono inválido';
        }

        if (usuario?.rol === 'admin' && !datos.agenteId) {
            nuevosErrores.agenteId = 'Debe seleccionar un agente';
        }

        return nuevosErrores;
    };

    const handleDocumentos = (e, tipoKey) => {
        const files = Array.from(e.target.files);
        const maxSizeMB = 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const archivosValidos = files.filter(file => {
            if (file.size > maxSizeBytes) {
                toast.error(`El archivo "${file.name}" supera los ${maxSizeMB} MB`);
                return false;
            }
            return true;
        });

        if (archivosValidos.length > 0) {
            setDocumentos(prev => ({
                ...prev,
                [tipoKey]: [...prev[tipoKey], ...archivosValidos]
            }));
        }
    };

    const eliminarDocumento = (tipoKey, index) => {
        setDocumentos(prev => {
            const nuevos = [...prev[tipoKey]];
            nuevos.splice(index, 1);
            return { ...prev, [tipoKey]: nuevos };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        const nuevosErrores = validarFormulario();

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            toast.error('Por favor, corrige los errores en el formulario.', {
                duration: 3000,
                id: 'errores-validacion' // Evita duplicados
            });

            // Scroll al primer error
            setTimeout(() => {
                const primerCampoConError = Object.keys(nuevosErrores)[0];
                if (primerCampoConError) {
                    const selector = `[name="${primerCampoConError}"]`;
                    // Intentar encontrar el input o el select
                    const elemento = document.querySelector(selector) ||
                        document.querySelector(`${selector} select`) ||
                        document.querySelector(`${selector} input`);

                    if (elemento) {
                        elemento.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        elemento.focus();
                    }
                }
            }, 100);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const datosEnviar = { ...datos };

            // Solo enviar agenteId si es admin y está seleccionado
            if (usuario.rol !== 'admin' || !datosEnviar.agenteId) {
                delete datosEnviar.agenteId;
            }

            await axios.post('http://localhost:3000/api/clientes', datosEnviar, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }).then(async (response) => {
                const clienteId = response.data.cliente.id;

                // Subida de documentos
                const uploadPromises = [];
                const processUpload = (files, tipo) => {
                    if (files.length === 0) return;
                    const fd = new FormData();
                    files.forEach(f => fd.append('documentos', f));
                    fd.append('tipo', tipo);

                    uploadPromises.push(
                        axios.post(`http://localhost:3000/api/documentos/cliente/${clienteId}`, fd, {
                            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                        })
                    );
                };

                processUpload(documentos.cedula, 'CEDULA');
                processUpload(documentos.papeleta_votacion, 'PAPELETA_VOTACION');
                processUpload(documentos.poder, 'PODER');
                processUpload(documentos.otro, 'OTRO');

                if (uploadPromises.length > 0) {
                    toast.info('Subiendo documentos del cliente...');
                    await Promise.all(uploadPromises);
                }

                toast.success('Cliente y documentos registrados correctamente', { duration: 3000 });

                // Resetear el estado para evitar el modal de "cambios sin guardar"
                setDatos({ ...initialDatos });
                setDocumentos({
                    cedula: [],
                    papeleta_votacion: [],
                    poder: [],
                    otro: []
                });

                setTimeout(() => {
                    navigate(usuario.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes');
                }, 1500);
            });

        } catch (error) {
            console.error(error);

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
            } else {
                toast.error(error.response?.data?.mensaje || 'Ocurrió un error al registrar el cliente.', { duration: 4000 });
            }
        }
    };

    const hayCambios = () => {
        // Compara datos actuales con los iniciales
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        // Verificar si hay documentos cargados
        for (const key in documentos) {
            if (documentos[key].length > 0) return true;
        }
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

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 border-t-4 border-orange-500 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-orange-100">
                                <UserPlus className="w-6 h-6 text-orange-600" />
                            </div>
                            Registrar Nuevo Cliente
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm ml-14">Completa la información para dar de alta un nuevo cliente</p>
                    </div>
                    <div className="text-xs text-gray-400">
                        <span className="text-red-500 font-bold">*</span> Campos obligatorios
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
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
                                        placeholder="Ej: Juan David Pérez García"
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
                                            maxLength="13"
                                            value={datos.cedula}
                                            onChange={(e) => {
                                                // Prevent entering non-numeric chars
                                                const val = e.target.value;
                                                if (/^\d*$/.test(val)) {
                                                    handleChange(e);
                                                }
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
                                    {errores.observaciones && <p className="text-red-500 text-xs mt-1 font-medium">{errores.observaciones}</p>}
                                </div>

                                {/* AGENTE RESPONSABLE (solo para admin) */}
                                {usuario?.rol === 'admin' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Agente responsable <span className="text-red-500">*</span></label>

                                        <div className="relative" ref={agentRef}>
                                            <input
                                                type="text"
                                                placeholder="Buscar agente..."
                                                value={getAgenteInputValue()}
                                                onChange={(e) => {
                                                    setBusquedaAgente(e.target.value);
                                                    setMostrarAgentes(true);
                                                }}
                                                onClick={() => {
                                                    setMostrarAgentes(true);
                                                    // Si ya hay uno seleccionado, permitir buscar:
                                                    if (datos.agenteId) {
                                                        const selected = agentes.find(a => a.id === parseInt(datos.agenteId));
                                                        setBusquedaAgente(selected ? selected.name : '');
                                                    }
                                                }}
                                                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-gray-50/50 transition-colors ${errores.agenteId ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-orange-500'}`}
                                            />
                                            {errores.agenteId && <p className="text-red-500 text-xs mt-1 font-medium">{errores.agenteId}</p>}

                                            {mostrarAgentes && (
                                                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                                                    {agentesFiltrados.length > 0 ? (
                                                        agentesFiltrados.map(agente => (
                                                            <div
                                                                key={agente.id}
                                                                onClick={() => {
                                                                    handleChange({ target: { name: 'agenteId', value: agente.id } });
                                                                    setMostrarAgentes(false);
                                                                    setBusquedaAgente('');
                                                                }}
                                                                className={`px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 group transition-colors ${parseInt(datos.agenteId) === agente.id ? 'bg-orange-50' : ''}`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <p className={`font-semibold text-sm ${usuario?.id === agente.id ? 'text-orange-700' : 'text-gray-800'}`}>
                                                                        {agente.name}
                                                                        {usuario?.id === agente.id && <span className="ml-1 text-xs font-normal text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">(Tú)</span>}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-0.5">{agente.email}</p>
                                                                <div className="flex gap-1 mt-1">
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${usuario?.id === agente.id ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                        {agente.rol}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-gray-500 text-sm text-center">No se encontraron agentes</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* DOCUMENTACIÓN (Modo Cliente) */}
                        <section className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                            <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Documentación del Cliente
                            </h3>
                            <div className="w-full">
                                <DocumentManager
                                    documentos={documentos}
                                    onUpload={handleDocumentos}
                                    onDelete={eliminarDocumento}
                                    mode="cliente"
                                />
                            </div>
                        </section>

                        {/* BOTONES */}
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
                                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Guardar Cliente
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
