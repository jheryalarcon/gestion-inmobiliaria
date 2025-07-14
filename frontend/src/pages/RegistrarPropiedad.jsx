import {jwtDecode} from 'jwt-decode'; // npm install jwt-decode
import {useEffect, useState} from 'react';
import axios from 'axios';
import SelectProvincia from '../components/SelectProvincia';
import SelectTipoPropiedad from '../components/SelectTipoPropiedad';
import {useNavigate} from 'react-router-dom';
import { toast } from 'sonner';


export default function RegistrarPropiedad() {
    const navigate = useNavigate();
    const [imagenes, setImagenes] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
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
        } else {
            navigate('/login');
        }
    }, []);

    const [vistaPrevia, setVistaPrevia] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [datos, setDatos] = useState({
        titulo: '',
        descripcion: '',
        tipo_propiedad: '',
        estado_propiedad: 'nueva',
        transaccion: 'venta',
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
        agenteId: '' // solo para admin, opcional
    });

    const handleChange = (e) => {
        setDatos({...datos, [e.target.name]: e.target.value});
    };

    const handleImagenes = (e) => {
        const files = Array.from(e.target.files);
        setImagenes(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setVistaPrevia(previews);
    };

    const token = localStorage.getItem('token');

    if (!token) {
        setMensaje('Tu sesión ha expirado. Inicia sesión nuevamente.');
        navigate('/');
        return;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Asegurar que los campos numéricos lleguen como string de números o se omitan si vacíos
        const camposNumericos = [
            'precio',
            'latitud',
            'longitud',
            'area_terreno',
            'area_construccion',
            'nro_habitaciones',
            'nro_banos',
            'nro_parqueaderos',
            'nro_pisos',
            'anio_construccion'
        ];

        for (const key in datos) {
            const value = datos[key];

            if (value !== '' && value !== null && value !== undefined) {
                if (camposNumericos.includes(key)) {
                    const parsed = Number(value);
                    if (!isNaN(parsed)) {
                        formData.append(key, parsed.toString());
                    }
                } else {
                    formData.append(key, value);
                }
            }
        }

        // Adjuntar imágenes válidas
        imagenes.forEach((img) => {
            if (img instanceof File && img.size > 0) {
                formData.append('imagenes', img);
            }
        });

        try {
            const token = localStorage.getItem('token');
            console.log([...formData]); // <-- puedes ver en consola antes de enviar
            await axios.post('http://localhost:3000/api/propiedades', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Propiedad registrada correctamente');

            setTimeout(() => {
                if (usuario?.rol === 'admin') navigate('/admin/panel-propiedades');
                else if (usuario?.rol === 'agente') navigate('/agente/panel-propiedades');
                else navigate('/inicio');
            }, 1500);
        } catch (error) {
            console.error(error);
            if (error.response?.data?.errores) {
                error.response.data.errores.forEach(err => toast.error(`❌ ${err}`));
            } else {
                toast.error(error.response?.data?.mensaje || '❌ Error al registrar');
            }
        }

    };

    if (loading) return null; // o un spinner si prefieres

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Registrar Propiedad</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                <span className="text-red-500 font-bold">*</span> Campos obligatorios
            </p>

            {mensaje && <p className="text-center text-red-600 font-medium mb-4">{mensaje}</p>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* TÍTULO */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Título"
                        required
                        value={datos.titulo}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* DESCRIPCIÓN */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="descripcion"
                        placeholder="Descripción larga de la propiedad..."
                        rows="4"
                        value={datos.descripcion}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 resize-none"
                    ></textarea>
                </div>

                {/* TIPO PROPIEDAD */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de propiedad <span className="text-red-500">*</span>
                    </label>
                    <SelectTipoPropiedad
                        value={datos.tipo_propiedad}
                        onChange={(e) => setDatos({ ...datos, tipo_propiedad: e.target.value })}
                    />
                </div>

                {/* ESTADO FÍSICO */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado físico <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="estado_propiedad"
                        value={datos.estado_propiedad}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="nueva">Nueva</option>
                        <option value="usada">Usada</option>
                        <option value="en_construccion">En construcción</option>
                    </select>
                </div>

                {/* TRANSACCIÓN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transacción <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="transaccion"
                        value={datos.transaccion}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                    </select>
                </div>

                {/* PRECIO */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="precio"
                        value={datos.precio}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* DIRECCIÓN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="direccion"
                        value={datos.direccion}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* CIUDAD */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ciudad"
                        value={datos.ciudad}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* PROVINCIA */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia <span className="text-red-500">*</span>
                    </label>
                    <SelectProvincia
                        value={datos.provincia}
                        onChange={(e) => setDatos({ ...datos, provincia: e.target.value })}
                    />
                </div>

                {/* CAMPOS ADICIONALES */}
                {[
                    ['Área del terreno (m²)', 'area_terreno'],
                    ['Área de construcción (m²)', 'area_construccion'],
                    ['Habitaciones', 'nro_habitaciones'],
                    ['Baños', 'nro_banos'],
                    ['Parqueaderos', 'nro_parqueaderos'],
                    ['Nº de pisos', 'nro_pisos']
                ].map(([label, name]) => (
                    <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {label} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name={name}
                            value={datos[name]}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                ))}

                {/* AÑO CONSTRUCCIÓN (opcional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año de construcción</label>
                    <input
                        type="number"
                        name="anio_construccion"
                        value={datos.anio_construccion}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* AGENTE (solo admin) */}
                {usuario?.rol === 'admin' && (
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Asignar agente <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="agenteId"
                            className="w-full border rounded px-3 py-2"
                            value={datos.agenteId}
                            onChange={handleChange}
                        >
                            <option value="" disabled hidden>Selecciona un agente</option>
                            {agentes.map((agente) => (
                                <option key={agente.id} value={agente.id}>
                                    {agente.name} ({agente.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* IMÁGENES */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes (máx. 5)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagenes}
                        className="w-full border rounded px-3 py-2"
                    />
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                        {vistaPrevia.map((src, idx) => (
                            <img key={idx} src={src} alt={`preview-${idx}`} className="h-24 rounded shadow" />
                        ))}
                    </div>
                </div>

                {/* BOTÓN */}
                <div className="col-span-2 text-center mt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition"
                    >
                        Guardar propiedad
                    </button>
                </div>
            </form>
        </div>

    );

}
