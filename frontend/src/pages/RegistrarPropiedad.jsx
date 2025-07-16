import {useEffect, useState, useRef} from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import {useNavigate} from 'react-router-dom';
import SelectProvincia from '../components/SelectProvincia';
import SelectTipoPropiedad from '../components/SelectTipoPropiedad';
import {toast} from 'sonner';

export default function RegistrarPropiedad() {
    const navigate = useNavigate();
    const [imagenes, setImagenes] = useState([]);
    const [vistaPrevia, setVistaPrevia] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [datos, setDatos] = useState({
        titulo: '',
        descripcion: '',
        tipo_propiedad: '',
        estado_propiedad: '',
        transaccion: '',
        precio: '',
        moneda: 'USD',
        direccion: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        latitud: '',
        longitud: '',
        area_terreno: '',
        area_construccion: '',
        nro_habitaciones: '',
        nro_banos: '',
        nro_parqueaderos: '',
        nro_pisos: '',
        anio_construccion: '',
        estado_publicacion: 'disponible',
        agenteId: ''
    });

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const cancelarRef = useRef(null);

    const initialDatos = {
        titulo: '',
        descripcion: '',
        tipo_propiedad: '',
        estado_propiedad: '',
        transaccion: '',
        precio: '',
        moneda: 'USD',
        direccion: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        latitud: '',
        longitud: '',
        area_terreno: '',
        area_construccion: '',
        nro_habitaciones: '',
        nro_banos: '',
        nro_parqueaderos: '',
        nro_pisos: '',
        anio_construccion: '',
        estado_publicacion: 'disponible',
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
                headers: {Authorization: `Bearer ${token}`}
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
            titulo: 'El título es obligatorio',
            tipo_propiedad: 'Selecciona un tipo de propiedad',
            estado_propiedad: 'Selecciona un estado físico',
            transaccion: 'Selecciona una transacción',
            precio: 'Ingrese un precio válido',
            direccion: 'La dirección es obligatoria',
            ciudad: 'La ciudad es obligatoria',
            provincia: 'Selecciona una provincia'
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
            if ([
                'titulo', 'tipo_propiedad', 'estado_propiedad', 'transaccion', 'precio', 'direccion', 'ciudad', 'provincia'
            ].includes(name)) {
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

            // Validación numérica específica para precio
            if (name === 'precio') {
                if (isNaN(Number(value)) || Number(value) <= 0) {
                    nuevos.precio = 'Ingrese un precio válido';
                } else {
                    delete nuevos.precio;
                }
            }

            // Validación de áreas
            if (name === 'area_terreno') {
                if (!value || Number(value) <= 0) {
                    nuevos.area_terreno = 'Ingrese un área válida';
                } else {
                    delete nuevos.area_terreno;
                }
            }

            return nuevos;
        });
    };



    const handleImagenes = (e) => {
        const files = Array.from(e.target.files);
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const erroresImagenes = [];

        const archivosValidos = files.filter((file) => {
            if (file.size > maxSizeBytes) {
                erroresImagenes.push(`❌ "${file.name}" supera los ${maxSizeMB} MB`);
                return false;
            }
            return true;
        });

        if (erroresImagenes.length > 0) {
            toast.error('Algunas imágenes son demasiado pesadas:\n' + erroresImagenes.join('\n'), {
                duration: 4000,
            });
        }

        setImagenes(archivosValidos);
        setVistaPrevia(archivosValidos.map(file => URL.createObjectURL(file)));

        // Limpiar errores si el usuario ya subió válidas
        setErrores((prev) => {
            const nuevos = { ...prev };
            if (archivosValidos.length > 0) delete nuevos.imagenes;
            else nuevos.imagenes = 'Debe subir al menos una imagen válida';
            return nuevos;
        });
    };


    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!datos.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio';
        if (!datos.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria';
        if (!datos.tipo_propiedad) nuevosErrores.tipo_propiedad = 'Selecciona un tipo de propiedad';
        if (!datos.estado_propiedad) nuevosErrores.estado_propiedad = 'Selecciona un estado físico';
        if (!datos.transaccion) nuevosErrores.transaccion = 'Selecciona una transacción';
        if (!datos.precio || isNaN(Number(datos.precio)) || Number(datos.precio) <= 0) nuevosErrores.precio = 'Precio inválido';
        if (!datos.direccion.trim()) nuevosErrores.direccion = 'La dirección es obligatoria';
        if (!datos.ciudad.trim()) nuevosErrores.ciudad = 'La ciudad es obligatoria';
        if (!datos.provincia) nuevosErrores.provincia = 'Selecciona una provincia';
        if (!datos.area_terreno || Number(datos.area_terreno) <= 0) nuevosErrores.area_terreno = 'Área de terreno inválida';
        if (!datos.area_construccion || Number(datos.area_construccion) < 0) nuevosErrores.area_construccion = 'Área de construcción inválida';
        if (!datos.nro_habitaciones || Number(datos.nro_habitaciones) < 0) nuevosErrores.nro_habitaciones = 'Número de habitaciones inválido';
        if (!datos.nro_banos || Number(datos.nro_banos) < 0) nuevosErrores.nro_banos = 'Número de baños inválido';
        if (!datos.nro_parqueaderos || Number(datos.nro_parqueaderos) < 0) nuevosErrores.nro_parqueaderos = 'Número de parqueaderos inválido';
        if (!datos.nro_pisos || Number(datos.nro_pisos) <= 0) nuevosErrores.nro_pisos = 'Número de pisos inválido';
        if (usuario?.rol === 'admin' && !datos.agenteId) nuevosErrores.agenteId = 'Debe seleccionar un agente';
        if (imagenes.length === 0) nuevosErrores.imagenes = 'Debe subir al menos una imagen';
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        const nuevosErrores = {};

        // Validaciones mínimas requeridas por schema.prisma
        if (!datos.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio';
        if (!datos.tipo_propiedad) nuevosErrores.tipo_propiedad = 'Seleccione un tipo de propiedad';
        if (!datos.estado_propiedad) nuevosErrores.estado_propiedad = 'Seleccione el estado de la propiedad';
        if (!datos.transaccion) nuevosErrores.transaccion = 'Seleccione el tipo de transacción';
        if (!datos.precio || isNaN(Number(datos.precio)) || Number(datos.precio) <= 0) {
            nuevosErrores.precio = 'Ingrese un precio válido';
        }

        if (!datos.direccion.trim()) nuevosErrores.direccion = 'La dirección es obligatoria';
        if (!datos.ciudad.trim()) nuevosErrores.ciudad = 'La ciudad es obligatoria';
        if (!datos.provincia) nuevosErrores.provincia = 'Seleccione una provincia';
        if (!datos.area_terreno || isNaN(Number(datos.area_terreno)) || Number(datos.area_terreno) <= 0) {
            nuevosErrores.area_terreno = 'Ingrese un área válida';
        }

        if (usuario?.rol === 'admin' && !datos.agenteId) {
            nuevosErrores.agenteId = 'Seleccione un agente';
        }

        if (!imagenes.length) {
            nuevosErrores.imagenes = 'Debe subir al menos una imagen';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            toast.error('Por favor, corrige los errores en el formulario.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            Object.entries(datos).forEach(([key, val]) => {
                if (val !== '' && val !== null) formData.append(key, val);
            });

            imagenes.forEach(img => formData.append('imagenes', img));

            await axios.post('http://localhost:3000/api/propiedades', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('🏠 Propiedad registrada correctamente', {
                duration: 1000,
            });

            setTimeout(() => {
                navigate(
                    usuario.rol === 'admin' ? '/admin/panel-propiedades' : '/agente/panel-propiedades'
                );
            }, 1000);
        } catch (error) {
            console.error(error);

            if (error.response?.data?.errores?.length) {
                error.response.data.errores.forEach(err =>
                    toast.error(`❌ ${err}`, { duration: 3000 })
                );
            } else {
                toast.error('Ocurrió un error al registrar la propiedad.');
            }
        }

    };

    const hayCambios = () => {
        // Compara datos actuales con los iniciales
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        if (imagenes.length > 0) return true;
        return false;
    };

    const handleCancel = () => {
        if (hayCambios()) {
            setShowConfirmModal(true);
        } else {
            if (usuario?.rol === 'admin') {
                navigate('/admin/panel-propiedades');
            } else {
                navigate('/agente/panel-propiedades');
            }
        }
    };

    const confirmarSalida = () => {
        setShowConfirmModal(false);
        if (usuario?.rol === 'admin') {
            navigate('/admin/panel-propiedades');
        } else {
            navigate('/agente/panel-propiedades');
        }
    };

    if (loading) return null;
    return (
        <div className="max-w-3xl mx-auto mt-10 p-4 md:p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Registrar Propiedad</h2>
            <p className="text-center text-gray-600 mb-8">Completa los datos para publicar una nueva propiedad</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* DATOS GENERALES */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Datos Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* TÍTULO */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Título <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="titulo"
                                value={datos.titulo}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.titulo ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: Casa moderna en Quito"
                            />
                            {errores.titulo && <p className="text-red-600 text-sm mt-1 font-medium">{errores.titulo}</p>}
                        </div>
                        {/* TIPO DE PROPIEDAD */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Tipo de propiedad <span className="text-red-500">*</span></label>
                            <SelectTipoPropiedad
                                value={datos.tipo_propiedad}
                                onChange={(e) => handleChange({ target: { name: 'tipo_propiedad', value: e.target.value } })}
                                error={errores.tipo_propiedad}
                            />
                        </div>
                        {/* ESTADO FÍSICO */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Estado físico <span className="text-red-500">*</span></label>
                            <select
                                name="estado_propiedad"
                                value={datos.estado_propiedad}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.estado_propiedad ? 'border-red-400' : 'border-blue-100'}`}
                            >
                                <option value="" disabled hidden>Seleccione estado físico de la propiedad</option>
                                <option value="nueva">Nueva</option>
                                <option value="usada">Usada</option>
                                <option value="en_construccion">En construcción</option>
                            </select>
                            {errores.estado_propiedad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.estado_propiedad}</p>}
                        </div>
                        {/* TRANSACCIÓN */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Transacción <span className="text-red-500">*</span></label>
                            <select
                                name="transaccion"
                                value={datos.transaccion}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.transaccion ? 'border-red-400' : 'border-blue-100'}`}
                            >
                                <option value="" disabled hidden>Seleccione tipo de transacción</option>
                                <option value="venta">Venta</option>
                                <option value="alquiler">Alquiler</option>
                            </select>
                            {errores.transaccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.transaccion}</p>}
                        </div>
                        {/* PRECIO */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Precio <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="precio"
                                value={datos.precio}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.precio ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 120000"
                            />
                            {errores.precio && <p className="text-red-600 text-sm mt-1 font-medium">{errores.precio}</p>}
                        </div>
                        {/* DESCRIPCIÓN */}
                        <div className="md:col-span-2">
                            <label className="block text-base font-semibold text-blue-800 mb-1">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={datos.descripcion}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.descripcion ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Agrega una descripción detallada..."
                            ></textarea>
                            {errores.descripcion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.descripcion}</p>}
                        </div>
                    </div>
                </section>
                {/* UBICACIÓN */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Ubicación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* DIRECCIÓN */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Dirección <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="direccion"
                                value={datos.direccion}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.direccion ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: Av. Amazonas N34-56"
                            />
                            {errores.direccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.direccion}</p>}
                        </div>
                        {/* CIUDAD */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Ciudad <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="ciudad"
                                value={datos.ciudad}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.ciudad ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: Quito"
                            />
                            {errores.ciudad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.ciudad}</p>}
                        </div>
                        {/* PROVINCIA */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Provincia <span className="text-red-500">*</span></label>
                            <SelectProvincia
                                value={datos.provincia}
                                onChange={(e) => handleChange({ target: { name: 'provincia', value: e.target.value } })}
                                error={errores.provincia}
                            />
                        </div>
                    </div>
                </section>
                {/* CARACTERÍSTICAS */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Características</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ÁREA TERRENO */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Área terreno (m²) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="area_terreno"
                                value={datos.area_terreno}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.area_terreno ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 200"
                            />
                            {errores.area_terreno && <p className="text-red-600 text-sm mt-1 font-medium">{errores.area_terreno}</p>}
                        </div>
                        {/* CONSTRUCCIÓN */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Área construcción (m²)</label>
                            <input
                                type="number"
                                name="area_construccion"
                                value={datos.area_construccion}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.area_construccion ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 150"
                            />
                            {errores.area_construccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.area_construccion}</p>}
                        </div>
                        {/* HABITACIONES */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Habitaciones</label>
                            <input
                                type="number"
                                name="nro_habitaciones"
                                value={datos.nro_habitaciones}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.nro_habitaciones ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 3"
                            />
                            {errores.nro_habitaciones && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_habitaciones}</p>}
                        </div>
                        {/* BAÑOS */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Baños</label>
                            <input
                                type="number"
                                name="nro_banos"
                                value={datos.nro_banos}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.nro_banos ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 2"
                            />
                            {errores.nro_banos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_banos}</p>}
                        </div>
                        {/* PARQUEADEROS */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Parqueaderos</label>
                            <input
                                type="number"
                                name="nro_parqueaderos"
                                value={datos.nro_parqueaderos}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.nro_parqueaderos ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 1"
                            />
                            {errores.nro_parqueaderos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_parqueaderos}</p>}
                        </div>
                        {/* PISOS */}
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">Número de pisos</label>
                            <input
                                type="number"
                                name="nro_pisos"
                                value={datos.nro_pisos}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.nro_pisos ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 2"
                            />
                            {errores.nro_pisos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_pisos}</p>}
                        </div>
                    </div>
                </section>
                {/* ASIGNACIÓN DE AGENTE (solo admin) */}
                {usuario?.rol === 'admin' && (
                    <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">Asignar agente</h3>
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">
                                Agente responsable <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="agenteId"
                                value={datos.agenteId}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.agenteId ? 'border-red-400' : 'border-blue-100'}`}
                            >
                                <option value="" disabled hidden>
                                    Selecciona un agente
                                </option>
                                {agentes.map((agente) => (
                                    <option key={agente.id} value={agente.id}>
                                        {agente.name} ({agente.email})
                                    </option>
                                ))}
                            </select>
                            {errores.agenteId && (
                                <p className="text-red-600 text-sm mt-1 font-medium">{errores.agenteId}</p>
                            )}
                        </div>
                    </section>
                )}
                {/* IMÁGENES */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Imágenes</h3>
                    <div>
                        <label
                            htmlFor="imagenes"
                            className="block w-full cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg border-2 border-indigo-200 shadow-sm transition text-center"
                        >
                            Seleccione imágenes de la propiedad
                        </label>
                        <input
                            id="imagenes"
                            name="imagenes"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImagenes}
                        />
                        {imagenes && imagenes.length > 0 && (
                            <p className="mt-2 text-sm text-gray-600">
                                {imagenes.length} imagen{imagenes.length > 1 ? 'es' : ''} seleccionada{imagenes.length > 1 ? 's' : ''}
                            </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {vistaPrevia.map((src, idx) => (
                                <img key={idx} src={src} alt={`preview-${idx}`} className="h-24 w-24 object-cover rounded shadow border" />
                            ))}
                        </div>
                    </div>
                </section>
                {/* BOTÓN */}
                <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                    <button
                        type="button"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-10 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onClick={handleCancel}
                        ref={cancelarRef}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Registrar propiedad
                    </button>
                </div>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                            <h3 className="text-xl font-bold text-center text-yellow-700 mb-4 flex items-center justify-center gap-2">
                                <span className="text-2xl">⚠️</span> Cambios sin guardar
                            </h3>
                            <p className="text-gray-700 text-center mb-6">Tienes cambios sin guardar. ¿Seguro que quieres salir?</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
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
            </form>
        </div>
    );
}
