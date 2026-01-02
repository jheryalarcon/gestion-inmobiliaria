import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useBlocker } from 'react-router-dom';
import SelectTipoCliente from '../components/SelectTipoCliente';
import DocumentManager from '../components/DocumentManager';
import { toast } from 'sonner';

export default function RegistrarCliente() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [datos, setDatos] = useState({
        nombre: '',
        telefono: '',
        email: '',
        cedula: '',
        estado_civil: '',
        tipo_cliente: '',
        observaciones: '',
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
        estado_civil: '',
        tipo_cliente: '',
        observaciones: '',
        agenteId: ''
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
            estado_civil: 'Estado civil es requerido',
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
            if (['nombre', 'telefono', 'email', 'tipo_cliente', 'cedula'].includes(name)) {
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

            // Validación de teléfono
            if (name === 'telefono' && value.trim() !== '') {
                const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
                if (!telefonoRegex.test(value)) {
                    nuevos.telefono = 'Formato de teléfono inválido';
                } else {
                    delete nuevos.telefono;
                }
            }

            return nuevos;
        });
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!datos.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
        if (!datos.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio';
        if (!datos.email.trim()) nuevosErrores.email = 'El correo electrónico es obligatorio';
        if (!datos.cedula.trim()) nuevosErrores.cedula = 'La cédula/RUC es obligatoria';
        if (!datos.tipo_cliente) nuevosErrores.tipo_cliente = 'Selecciona un tipo de cliente';

        // Validación de formato de email
        if (datos.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(datos.email)) {
            nuevosErrores.email = 'Formato de correo electrónico inválido';
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
                toast.error(`❌ El archivo "${file.name}" supera los ${maxSizeMB} MB`);
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
            toast.error('Por favor, corrige los errores en el formulario.', { duration: 3000 });
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
                setTimeout(() => {
                    navigate(usuario.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes');
                }, 1500);
            });

        } catch (error) {
            console.error(error);

            if (error.response?.data?.errores?.length) {
                error.response.data.errores.forEach(err =>
                    toast.error(err, { duration: 3000 })
                );
            } else {
                toast.error('Ocurrió un error al registrar el cliente.', { duration: 4000 });
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
        <div className="max-w-3xl mx-auto mt-10 p-4 md:p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Registrar Cliente</h2>
            <p className="text-center text-gray-600 mb-8">Completa los datos para registrar un nuevo cliente</p>

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
                                name="nombre"
                                value={datos.nombre}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.nombre ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: Juan Pérez"
                            />
                            {errores.nombre && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nombre}</p>}
                        </div>

                        {/* CÉDULA / RUC */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Cédula / RUC <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="cedula"
                                value={datos.cedula}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.cedula ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 1712345678"
                            />
                            {errores.cedula && <p className="text-red-600 text-sm mt-1 font-medium">{errores.cedula}</p>}
                        </div>

                        {/* ESTADO CIVIL */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Estado Civil</label>
                            <select
                                name="estado_civil"
                                value={datos.estado_civil}
                                onChange={handleChange}
                                className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition"
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="SOLTERO">Soltero/a</option>
                                <option value="CASADO">Casado/a</option>
                                <option value="DIVORCIADO">Divorciado/a</option>
                                <option value="VIUDO">Viudo/a</option>
                                <option value="UNION_DE_HECHO">Unión de Hecho</option>
                            </select>
                        </div>

                        {/* TELÉFONO */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Teléfono <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="telefono"
                                value={datos.telefono}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.telefono ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 0991234567"
                            />
                            {errores.telefono && <p className="text-red-600 text-sm mt-1 font-medium">{errores.telefono}</p>}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={datos.email}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.email ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: juan.perez@email.com"
                            />
                            {errores.email && <p className="text-red-600 text-sm mt-1 font-medium">{errores.email}</p>}
                        </div>

                        {/* TIPO DE CLIENTE */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Tipo de cliente <span className="text-red-500">*</span></label>
                            <SelectTipoCliente
                                value={datos.tipo_cliente}
                                onChange={(e) => handleChange({ target: { name: 'tipo_cliente', value: e.target.value } })}
                                error={errores.tipo_cliente}
                            />
                        </div>
                    </div>
                </section>

                {/* INFORMACIÓN ADICIONAL */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Información Adicional</h3>
                    <div className="space-y-6">
                        {/* OBSERVACIONES */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={datos.observaciones}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.observaciones ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Agrega observaciones adicionales sobre el cliente..."
                            ></textarea>
                            {errores.observaciones && <p className="text-red-600 text-sm mt-1 font-medium">{errores.observaciones}</p>}
                        </div>

                        {/* AGENTE RESPONSABLE (solo para admin) */}
                        {usuario?.rol === 'admin' && (
                            <div>
                                <label className="block text-base font-semibold text-blue-800 mb-1">Agente responsable <span className="text-red-500">*</span></label>
                                <select
                                    name="agenteId"
                                    value={datos.agenteId}
                                    onChange={handleChange}
                                    className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.agenteId ? 'border-red-400' : 'border-blue-100'}`}
                                >
                                    <option value="">Selecciona un agente</option>
                                    {agentes.map((agente) => (
                                        <option key={agente.id} value={agente.id}>
                                            {agente.name} - {agente.email}
                                        </option>
                                    ))}
                                </select>
                                {errores.agenteId && <p className="text-red-600 text-sm mt-1 font-medium">{errores.agenteId}</p>}
                            </div>
                        )}
                    </div>
                </section>

                {/* DOCUMENTACIÓN (Modo Cliente) */}
                <section className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200 mt-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                        📄 Documentación del Cliente
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
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                    >
                        Guardar Cliente
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
