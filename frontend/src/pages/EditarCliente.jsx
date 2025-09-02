import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import SelectTipoCliente from '../components/SelectTipoCliente';
import { toast } from 'sonner';

export default function EditarCliente() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [datos, setDatos] = useState({
        nombre: '',
        telefono: '',
        email: '',
        tipo_cliente: '',
        observaciones: '',
        agenteId: ''
    });

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const cancelarRef = useRef(null);

    const initialDatos = {
        nombre: '',
        telefono: '',
        email: '',
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

        // Cargar datos del cliente
        cargarCliente(token);
        
        // Cargar agentes si es admin
        if (decoded.rol === 'admin') {
            cargarAgentes(token);
        }
    }, [id]);

    const cargarCliente = async (token) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/clientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const clienteData = response.data.cliente;
            setCliente(clienteData);
            
            setDatos({
                nombre: clienteData.nombre || '',
                telefono: clienteData.telefono || '',
                email: clienteData.email || '',
                tipo_cliente: clienteData.tipo_cliente || '',
                observaciones: clienteData.observaciones || '',
                agenteId: clienteData.agenteId?.toString() || ''
            });

            // Guardar datos iniciales para comparación
            initialDatos.nombre = clienteData.nombre || '';
            initialDatos.telefono = clienteData.telefono || '';
            initialDatos.email = clienteData.email || '';
            initialDatos.tipo_cliente = clienteData.tipo_cliente || '';
            initialDatos.observaciones = clienteData.observaciones || '';
            initialDatos.agenteId = clienteData.agenteId?.toString() || '';
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
            const response = await axios.get('http://localhost:3000/api/usuarios/agentes', {
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
            if (['nombre', 'telefono', 'email', 'tipo_cliente'].includes(name)) {
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
        if (!datos.tipo_cliente) nuevosErrores.tipo_cliente = 'Selecciona un tipo de cliente';
        
        // Validación de formato de email
        if (datos.email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(datos.email)) {
            nuevosErrores.email = 'Formato de correo electrónico inválido';
        }
        
        // Validación de teléfono
        if (datos.telefono.trim() && !/^[\d\s\-\+\(\)]+$/.test(datos.telefono)) {
            nuevosErrores.telefono = 'Formato de teléfono inválido';
        }
        
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Verificar si el cliente está inactivo
        if (!cliente.activo) {
            toast.error('No se puede editar un cliente inactivo. Solo un administrador puede reactivarlo.');
            return;
        }

        setErrores({});
        const nuevosErrores = validarFormulario();

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            toast.error('Por favor, corrige los errores en el formulario.');
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const datosEnviar = { ...datos };

            // No enviar agenteId ya que no se puede cambiar
            delete datosEnviar.agenteId;

            await axios.put(`http://localhost:3000/api/clientes/${id}`, datosEnviar, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            toast.success('👤 Cliente actualizado correctamente', {
                duration: 1000,
            });

            setTimeout(() => {
                navigate(
                    usuario.rol === 'admin' ? '/admin/panel-clientes' : '/agente/panel-clientes'
                );
            }, 1000);
        } catch (error) {
            console.error(error);

            if (error.response?.data?.errores?.length) {
                error.response.data.errores.forEach(err =>
                    toast.error(`❌ ${err}`, { duration: 3000 })
                );
            } else if (error.response?.status === 403) {
                toast.error('No tienes permisos para editar este cliente');
            } else if (error.response?.status === 404) {
                toast.error('Cliente no encontrado');
            } else {
                toast.error('Ocurrió un error al actualizar el cliente.');
            }
        } finally {
            setSaving(false);
        }
    };

    const hayCambios = () => {
        // Compara datos actuales con los iniciales
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        return false;
    };

    const handleCancel = () => {
        if (hayCambios()) {
            setShowConfirmModal(true);
        } else {
            if (usuario?.rol === 'admin') {
                navigate('/admin/panel-clientes');
            } else {
                navigate('/agente/panel-clientes');
            }
        }
    };

    const confirmarSalida = () => {
        setShowConfirmModal(false);
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
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!cliente) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 md:p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Editar Cliente</h2>
            <p className="text-center text-gray-600 mb-8">Modifica los datos del cliente y guarda los cambios</p>
            
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

                        {/* AGENTE ASIGNADO (solo lectura) */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Agente asignado</label>
                            <div className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-600">
                                {cliente.agente ? `${cliente.agente.name} (${cliente.agente.email})` : 'Sin asignar'}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">El agente asignado no se puede cambiar desde este formulario</p>
                        </div>

                        {/* INFORMACIÓN DE AUDITORÍA (solo si está inactivo) */}
                        {!cliente.activo && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-red-800 mb-2">⚠️ Cliente Inactivo</h4>
                                <div className="text-sm text-red-700 space-y-1">
                                    {cliente.fecha_desactivacion && (
                                        <p><strong>Desactivado el:</strong> {formatearFecha(cliente.fecha_desactivacion)}</p>
                                    )}
                                    {cliente.usuario_desactivador && (
                                        <p><strong>Desactivado por:</strong> {cliente.usuario_desactivador.name} ({cliente.usuario_desactivador.email})</p>
                                    )}
                                    <p className="text-xs text-red-600 mt-2">
                                        Este cliente está inactivo y no puede ser editado. 
                                        Solo un administrador puede reactivarlo.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* BOTONES */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving || !cliente.activo}
                        className={`px-6 py-3 rounded-lg font-semibold transition duration-200 flex items-center gap-2 ${
                            cliente.activo 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        } ${saving ? 'opacity-50' : ''}`}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            cliente.activo ? 'Guardar Cambios' : 'Cliente Inactivo'
                        )}
                    </button>
                </div>
            </form>

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                        <h3 className="text-xl font-bold text-center text-yellow-700 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">⚠️</span> Cambios sin guardar
                        </h3>
                        <p className="text-gray-700 text-center mb-6">Tienes cambios sin guardar. ¿Seguro que quieres salir?</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                ref={cancelarRef}
                                onClick={() => setShowConfirmModal(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarSalida}
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
