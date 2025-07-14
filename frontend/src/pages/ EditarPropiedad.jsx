import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import SelectProvincia from '../components/SelectProvincia';
import SelectTipoPropiedad from '../components/SelectTipoPropiedad';
import {jwtDecode} from 'jwt-decode';

export default function EditarPropiedad() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [imagenesActuales, setImagenesActuales] = useState([]);
    const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
    const [imagenesNuevas, setImagenesNuevas] = useState([]);
    const [vistaPrevia, setVistaPrevia] = useState([]);
    const [agentes, setAgentes] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [usuario, setUsuario] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastError, setToastError] = useState('');



    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return navigate('/login');
        const user = jwtDecode(token);
        setUsuario(user);

        axios.get(`http://localhost:3000/api/propiedades/${id}`, {
            headers: {Authorization: `Bearer ${token}`}
        }).then(res => {
            setDatos(res.data);
            setImagenesActuales(res.data.imagenes || []);
        }).catch(() => {
            setMensaje('No se pudo cargar la propiedad.');
        });

        if (user.rol === 'admin') {
            axios.get('http://localhost:3000/api/usuarios/agentes', {
                headers: {Authorization: `Bearer ${token}`}
            }).then(res => setAgentes(res.data));
        }
    }, []);

    const handleChange = (e) => {
        setDatos({...datos, [e.target.name]: e.target.value});
    };

    const handleImagenesNuevas = (e) => {
        const files = Array.from(e.target.files);
        setImagenesNuevas(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setVistaPrevia(previews);
    };

    const eliminarImagenActual = (index) => {
        const nuevas = [...imagenesActuales];
        const eliminada = nuevas.splice(index, 1)[0];

        // Guardar ID de la imagen eliminada
        if (eliminada?.id) {
            setImagenesAEliminar([...imagenesAEliminar, eliminada.id]);
        }

        setImagenesActuales(nuevas);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!datos) return;
        setMensaje('');

        const camposEnteros = ['nro_habitaciones', 'nro_banos', 'nro_parqueaderos', 'nro_pisos'];
        for (let campo of camposEnteros) {
            const valor = parseInt(datos[campo]);
            if (isNaN(valor)) {
                setMensaje(`El campo "${campo.replace('_', ' ')}" debe ser un número válido`);
                return;
            }
        }

        const formData = new FormData();
        for (const key in datos) {
            const valor = datos[key];
            if (valor !== '' && valor !== null && valor !== undefined) {
                formData.append(key, valor);
            }
        }

        // Adjuntar nuevas imágenes
        imagenesNuevas.forEach(file => formData.append('imagenes', file));

        // Adjuntar IDs de imágenes a eliminar
        // Agrega al formData los IDs de imágenes eliminadas
        imagenesAEliminar.forEach((id) => {
            formData.append('imagenesAEliminar[]', id); // usa array
        });

        try {
            await axios.put(`http://localhost:3000/api/propiedades/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMensaje('Propiedad actualizada con éxito.');
            setToastVisible(true);
            setTimeout(() => {
                setToastVisible(false);
                navigate(usuario.rol === 'admin' ? '/admin/panel-propiedades' : '/agente/panel-propiedades');
            }, 1500);


        } catch (error) {
            console.error('Error al actualizar propiedad:', error.response?.data);
            const msg = error.response?.data?.mensaje || 'Error al actualizar';
            setToastError(msg);
            setTimeout(() => setToastError(''), 4000);

            if (error.response?.data?.errores) {
                error.response.data.errores.forEach(err => console.warn('❗', err));
            }
        }
    };

    if (!datos) {
        return <p className="text-center mt-10">Cargando propiedad...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-semibold mb-4 text-center">Editar Propiedad</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos Generales */}
                <div className="col-span-full">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2 border-b pb-1">Datos Generales</h3>
                </div>

                <div>
                    <label className="text-sm font-medium">Título</label>
                    <input type="text" name="titulo" value={datos.titulo} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1" required/>
                </div>

                <div>
                    <label className="text-sm font-medium">Tipo de propiedad</label>
                    <select
                        name="tipo_propiedad"
                        value={datos.tipo_propiedad}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 mt-1"
                        required
                    >
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="terreno">Terreno</option>
                        <option value="local_comercial">Local comercial</option>
                        <option value="finca">Finca</option>
                        <option value="quinta">Quinta</option>
                    </select>
                </div>


                <div>
                    <label className="text-sm font-medium">Estado físico</label>
                    <select name="estado_propiedad" value={datos.estado_propiedad} onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mt-1">
                        <option value="nueva">Nueva</option>
                        <option value="usada">Usada</option>
                        <option value="en_construccion">En construcción</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium">Transacción</label>
                    <select name="transaccion" value={datos.transaccion} onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mt-1">
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium">Precio</label>
                    <input type="number" step="0.01" name="precio" value={datos.precio} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={datos.descripcion || ''}
                        onChange={handleChange}
                        rows={5}
                        className="w-full border rounded px-3 py-2 mt-1 resize-y"
                        placeholder="Agrega una descripción detallada..."
                    />
                </div>

                {/* Ubicación */}
                <div className="col-span-full">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2 border-b pb-1 mt-6">Ubicación</h3>
                </div>

                <div>
                    <label className="text-sm font-medium">Dirección</label>
                    <input type="text" name="direccion" value={datos.direccion} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Ciudad</label>
                    <input type="text" name="ciudad" value={datos.ciudad} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Provincia</label>
                    <SelectProvincia value={datos.provincia}
                                     onChange={e => setDatos({...datos, provincia: e.target.value})}/>
                </div>

                <div>
                    <label className="text-sm font-medium">Código postal</label>
                    <input type="text" name="codigo_postal" value={datos.codigo_postal || ''} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Latitud</label>
                    <input type="number" name="latitud" value={datos.latitud || ''} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Longitud</label>
                    <input type="number" name="longitud" value={datos.longitud || ''} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                {/* Características */}
                <div className="col-span-full">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2 border-b pb-1 mt-6">Características</h3>
                </div>

                <div>
                    <label className="text-sm font-medium">Área terreno (m²)</label>
                    <input type="number" name="area_terreno" value={datos.area_terreno} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Área construcción (m²)</label>
                    <input type="number" name="area_construccion" value={datos.area_construccion}
                           onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Habitaciones</label>
                    <input type="number" name="nro_habitaciones" value={datos.nro_habitaciones} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Baños</label>
                    <input type="number" name="nro_banos" value={datos.nro_banos} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Parqueaderos</label>
                    <input type="number" name="nro_parqueaderos" value={datos.nro_parqueaderos} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">N° de pisos</label>
                    <input type="number" name="nro_pisos" value={datos.nro_pisos} onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                <div>
                    <label className="text-sm font-medium">Año de construcción</label>
                    <input type="number" name="anio_construccion" value={datos.anio_construccion || ''}
                           onChange={handleChange}
                           className="w-full border rounded px-3 py-2 mt-1"/>
                </div>

                {/* Imagenes */}
                <div className="col-span-full">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-2 border-b pb-1 mt-6">Imágenes</h3>
                </div>

                <div className="col-span-full">
                    <label className="text-sm font-medium mb-1">Imágenes actuales</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {imagenesActuales.map((img, idx) => (
                            <div key={idx} className="relative group">
                                <img
                                    src={`http://localhost:3000${img.url}`}
                                    alt={`img-${idx}`}
                                    className="h-20 rounded shadow object-cover"
                                />
                                <button type="button"
                                        onClick={() => eliminarImagenActual(idx)}
                                        className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-full">
                    <label className="text-sm font-medium">Subir nuevas imágenes</label>
                    <input type="file" multiple accept="image/*" onChange={handleImagenesNuevas}
                           className="w-full border rounded px-3 py-2 mt-2"/>
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                        {vistaPrevia.map((src, idx) => (
                            <img key={idx} src={src} alt={`preview-${idx}`} className="h-24 rounded shadow"/>
                        ))}
                    </div>
                </div>

                {/* Asignar agente (solo admin) */}
                {usuario?.rol === 'admin' && (
                    <div className="col-span-full">
                        <label className="text-sm font-medium">Asignar agente</label>
                        <select
                            name="agenteId"
                            value={datos.agenteId}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 mt-1"
                            required
                        >
                            {agentes.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name} ({a.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}


                {/* Botones */}
                <div className="col-span-full flex justify-between mt-6">
                    <button type="button"
                            onClick={() => navigate(usuario?.rol === 'admin' ? '/admin/panel-propiedades' : '/agente/panel-propiedades')}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded shadow-sm">
                        Cancelar
                    </button>
                    <button type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md">
                        Guardar cambios
                    </button>
                </div>
            </form>
            {toastVisible && (
                <div
                    className="fixed top-6 right-6 z-50 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg shadow-md transition-all duration-300 animate-fade-in">
                    ✅ Cambios guardados con éxito
                </div>
            )}

            {toastError && (
                <div className="fixed top-6 right-6 z-50 bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded-lg shadow-md transition-all duration-300 animate-fade-in">
                    ❌ {toastError}
                </div>
            )}


        </div>
    );
}
