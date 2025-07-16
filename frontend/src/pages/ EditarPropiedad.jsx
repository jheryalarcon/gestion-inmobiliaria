import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SelectProvincia from '../components/SelectProvincia';
import SelectTipoPropiedad from '../components/SelectTipoPropiedad';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

export default function EditarPropiedad() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [imagenesActuales, setImagenesActuales] = useState([]);
    const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
    const [imagenesNuevas, setImagenesNuevas] = useState([]);
    const [vistaPrevia, setVistaPrevia] = useState([]);
    const [agentes, setAgentes] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const cancelarRef = useRef(null);
    const [initialDatos, setInitialDatos] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return navigate('/login');
        const user = jwtDecode(token);
        setUsuario(user);

        axios.get(`http://localhost:3000/api/propiedades/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setDatos(res.data);
            setInitialDatos(res.data); // Guardar estado inicial para comparación
            setImagenesActuales(res.data.imagenes || []);
            setLoading(false);
        }).catch((error) => {
            if (error.response?.status === 403) {
                toast.error('Acceso denegado', { duration: 1500 });
                setTimeout(() => {
                    navigate('/agente');
                }, 1500);
            } else {
                toast.error('No se pudo cargar la propiedad.');
            }
            setLoading(false);
        });

        if (user.rol === 'admin') {
            axios.get('http://localhost:3000/api/usuarios/agentes', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setAgentes(res.data));
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

    const hayCambios = () => {
        if (!initialDatos || !datos) return false;
        for (const key in initialDatos) {
            if (datos[key] !== initialDatos[key]) return true;
        }
        if (imagenesNuevas.length > 0) return true;
        if (imagenesAEliminar.length > 0) return true;
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

    const obtenerMensajeErrorCampo = (campo) => {
        const mensajes = {
            titulo: 'El título es obligatorio',
            tipo_propiedad: 'Selecciona un tipo de propiedad',
            estado_propiedad: 'Selecciona un estado físico',
            transaccion: 'Selecciona una transacción',
            precio: 'Ingrese un precio válido',
            direccion: 'La dirección es obligatoria',
            ciudad: 'La ciudad es obligatoria',
            provincia: 'Selecciona una provincia',
            area_terreno: 'Área de terreno inválida',
            agenteId: 'Debe seleccionar un agente',
            imagenes: 'Debe subir al menos una imagen válida',
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
            // Solo los campos obligatorios de RegistrarPropiedad.jsx
            if ([
                'titulo', 'tipo_propiedad', 'estado_propiedad', 'transaccion', 'precio', 'direccion', 'ciudad', 'provincia', 'area_terreno'
            ].includes(name)) {
                if (value.trim() === '' || value === '') {
                    nuevos[name] = obtenerMensajeErrorCampo(name);
                } else {
                    delete nuevos[name];
                }
            }
            // Validación numérica específica para precio y área_terreno
            if (name === 'precio') {
                if (isNaN(Number(value)) || Number(value) <= 0) {
                    nuevos.precio = 'Ingrese un precio válido';
                } else {
                    delete nuevos.precio;
                }
            }
            if (name === 'area_terreno') {
                if (!value || Number(value) <= 0) {
                    nuevos.area_terreno = 'Área de terreno inválida';
                } else {
                    delete nuevos.area_terreno;
                }
            }
            return nuevos;
        });
    };

    const handleImagenesNuevas = (e) => {
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
        setImagenesNuevas(archivosValidos);
        setVistaPrevia(archivosValidos.map(file => URL.createObjectURL(file)));
        setErrores((prev) => {
            const nuevos = { ...prev };
            if (archivosValidos.length > 0) delete nuevos.imagenes;
            else nuevos.imagenes = 'Debe subir al menos una imagen válida';
            return nuevos;
        });
    };

    const eliminarImagenActual = (index) => {
        const nuevas = [...imagenesActuales];
        const eliminada = nuevas.splice(index, 1)[0];
        if (eliminada?.id) {
            setImagenesAEliminar([...imagenesAEliminar, eliminada.id]);
        }
        setImagenesActuales(nuevas);
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!datos.titulo?.trim()) nuevosErrores.titulo = 'El título es obligatorio';
        if (!datos.tipo_propiedad) nuevosErrores.tipo_propiedad = 'Selecciona un tipo de propiedad';
        if (!datos.estado_propiedad) nuevosErrores.estado_propiedad = 'Selecciona un estado físico';
        if (!datos.transaccion) nuevosErrores.transaccion = 'Selecciona una transacción';
        if (!datos.precio || isNaN(Number(datos.precio)) || Number(datos.precio) <= 0) nuevosErrores.precio = 'Precio inválido';
        if (!datos.direccion?.trim()) nuevosErrores.direccion = 'La dirección es obligatoria';
        if (!datos.ciudad?.trim()) nuevosErrores.ciudad = 'La ciudad es obligatoria';
        if (!datos.provincia) nuevosErrores.provincia = 'Selecciona una provincia';
        if (!datos.area_terreno || Number(datos.area_terreno) <= 0) nuevosErrores.area_terreno = 'Área de terreno inválida';
        if (usuario?.rol === 'admin' && !datos.agenteId) nuevosErrores.agenteId = 'Debe seleccionar un agente';
        if (imagenesActuales.length + imagenesNuevas.length === 0) nuevosErrores.imagenes = 'Debe subir al menos una imagen';
        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        if (!datos) return;
        const nuevosErrores = validarFormulario();
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            toast.error('Por favor, corrige los errores en el formulario.');
                return;
        }
        const formData = new FormData();
        for (const key in datos) {
            const valor = datos[key];
            if (valor !== '' && valor !== null && valor !== undefined) {
                formData.append(key, valor);
            }
        }
        imagenesNuevas.forEach(img => formData.append('imagenes', img));
        imagenesAEliminar.forEach((id) => {
            formData.append('imagenesAEliminar[]', id);
        });
        try {
            await axios.put(`http://localhost:3000/api/propiedades/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('🏠 Propiedad actualizada correctamente', {
                duration: 1000,
            });
            setTimeout(() => {
                navigate(
                    usuario.rol === 'admin' ? '/admin/panel-propiedades' : '/agente/panel-propiedades'
                );
            }, 1000);
        } catch (error) {
            console.error('Error al actualizar propiedad:', error.response?.data);
            // Mostrar toast por cada error de campo que venga del backend
            if (error.response?.data?.errores?.length) {
                const nuevosErrores = {};
                error.response.data.errores.forEach(err => {
                    // Intentar extraer el nombre del campo del mensaje del backend
                    const match = err.match(/"(\w+)"/);
                    if (match && match[1]) {
                        nuevosErrores[match[1]] = err;
                    }
                    // Mostrar toast para cada error
                    toast.error(err);
                });
                setErrores(nuevosErrores);
            } else {
                toast.error(error.response?.data?.mensaje || 'Error al actualizar');
            }
        }
    };

    if (!loading && usuario?.rol === 'agente' && datos && usuario.id !== datos.agenteId) {
      return (
        <>
          <Navbar />
          <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow text-center border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso denegado</h2>
            <p className="text-gray-700">No tienes permisos para editar esta propiedad.</p>
            <button
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
              onClick={() => navigate(-1)}
            >
              ← Volver
            </button>
          </div>
        </>
      );
    }

    if (loading || !datos) return null;
    return (
        <>
        <Navbar/>
        <div className="max-w-3xl mx-auto mt-10 p-4 md:p-8 bg-white shadow-lg rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-900 tracking-tight">Editar Propiedad</h2>
            <p className="text-center text-gray-600 mb-8">Modifica los datos de la propiedad y guarda los cambios</p>
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
                                onChange={e => handleChange({ target: { name: 'tipo_propiedad', value: e.target.value } })}
                                error={errores.tipo_propiedad}
                            />
                            {errores.tipo_propiedad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.tipo_propiedad}</p>}
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
                        placeholder="Ej: 100000"
                    />
                    {errores.precio && <p className="text-red-600 text-sm mt-1 font-medium">{errores.precio}</p>}
                </div>
                </div>
                    {/* DESCRIPCIÓN */}
                    <div className="mt-6">
                        <label className="block text-base font-semibold text-blue-800 mb-1">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={datos.descripcion || ''}
                        onChange={handleChange}
                            rows={3}
                            className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.descripcion ? 'border-red-400' : 'border-blue-100'}`}
                        placeholder="Agrega una descripción detallada..."
                        ></textarea>
                        {errores.descripcion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.descripcion}</p>}
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
                                onChange={e => handleChange({ target: { name: 'provincia', value: e.target.value } })}
                                error={errores.provincia}
                            />
                            {errores.provincia && <p className="text-red-600 text-sm mt-1 font-medium">{errores.provincia}</p>}
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
                                value={datos.area_construccion || ''}
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
                                value={datos.nro_habitaciones || ''}
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
                                value={datos.nro_banos || ''}
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
                                value={datos.nro_parqueaderos || ''}
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
                                value={datos.nro_pisos || ''}
                                onChange={handleChange}
                                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${errores.nro_pisos ? 'border-red-400' : 'border-blue-100'}`}
                                placeholder="Ej: 2"
                            />
                            {errores.nro_pisos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_pisos}</p>}
                </div>
                </div>
                </section>
                {/* ASIGNACIÓN DE AGENTE (solo admin) */}
                {usuario?.rol === 'admin' && datos.agente && (
                    <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">Agente responsable</h3>
                        <div>
                            <label className="block text-base font-semibold text-blue-800 mb-1">
                                Agente asignado
                            </label>
                            <div className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 shadow-sm">
                                {datos.agente?.name} ({datos.agente?.email})
                            </div>
                        </div>
                    </section>
                )}
                {/* IMÁGENES */}
                <section className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">Imágenes</h3>
                <div>
                        <label className="block text-base font-semibold text-blue-800 mb-1">Sube imágenes <span className="text-red-500">*</span></label>
                        {/* Imágenes actuales */}
                        <div className="mb-2">
                            <span className="font-semibold">Imágenes actuales:</span>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {imagenesActuales.length === 0 && (
                                    <span className="text-gray-500 text-sm">No hay imágenes actuales.</span>
                                )}
                        {imagenesActuales.map((img, idx) => (
                                    <div key={img.id || idx} className="relative group">
                                        <img
                                            src={
                                                img.url
                                                    ? img.url.startsWith('http')
                                                        ? img.url
                                                        : `http://localhost:3000${img.url}`
                                                    : (typeof img === 'string' ? img : '')
                                            }
                                    alt={`img-${idx}`}
                                            className="h-24 w-24 object-cover rounded shadow border"
                                />
                                        <button
                                            type="button"
                                        onClick={() => eliminarImagenActual(idx)}
                                            className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full opacity-80 hover:opacity-100 transition"
                                            title="Eliminar imagen"
                                        >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                        {/* Nuevas imágenes */}
                        <div className="mb-2">
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
    onChange={handleImagenesNuevas}
  />
  {imagenesNuevas && imagenesNuevas.length > 0 && (
    <p className="mt-2 text-sm text-gray-600">
      {imagenesNuevas.length} imagen{imagenesNuevas.length > 1 ? 'es' : ''} seleccionada{imagenesNuevas.length > 1 ? 's' : ''}
    </p>
  )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {vistaPrevia.length === 0 && (
                                    <span className="text-gray-500 text-sm">No hay nuevas imágenes seleccionadas.</span>
                                )}
                        {vistaPrevia.map((src, idx) => (
                                    <img key={idx} src={src} alt={`preview-${idx}`} className="h-24 w-24 object-cover rounded shadow border" />
                        ))}
                    </div>
                            {errores.imagenes && <p className="text-red-600 text-sm mt-1 font-medium">{errores.imagenes}</p>}
                </div>
                    </div>
                </section>
                {/* BOTONES */}
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
                        Guardar cambios
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
        </>
    );
}
