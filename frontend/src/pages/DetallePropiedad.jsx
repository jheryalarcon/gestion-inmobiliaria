import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DetallePropiedad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [error, setError] = useState('');
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:3000/api/propiedades/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => setPropiedad(res.data))
            .catch(err => {
                setError(err.response?.data?.mensaje || 'Error al cargar la propiedad');
            });
    }, [id]);

    if (error) return <p className="text-center text-red-600 mt-6 text-lg">{error}</p>;
    if (!propiedad) return <p className="text-center mt-6 text-lg">Cargando propiedad...</p>;

    const badgeColor = {
        disponible: 'bg-green-100 text-green-800',
        vendida: 'bg-red-100 text-red-800',
        arrendada: 'bg-blue-100 text-blue-800',
        reservada: 'bg-yellow-100 text-yellow-800',
        inactiva: 'bg-gray-300 text-gray-700',
    };

    const imagenesSinPrincipal = propiedad.imagenes.filter((_, idx) => idx !== imagenSeleccionada);

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-xl rounded-xl">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{propiedad.titulo}</h1>
                <span className={`px-3 py-1 text-base font-semibold rounded-full shadow-sm ${badgeColor[propiedad.estado_publicacion]}`}>
          {propiedad.estado_publicacion}
        </span>
            </div>

            <PhotoProvider>
                <div className="mb-8">
                    <PhotoView src={`http://localhost:3000${propiedad.imagenes[imagenSeleccionada]?.url}`}>
                        <img
                            src={`http://localhost:3000${propiedad.imagenes[imagenSeleccionada]?.url}`}
                            alt="principal"
                            className="w-full h-72 object-contain rounded-lg cursor-zoom-in shadow-md"
                        />
                    </PhotoView>

                    <div className="flex gap-3 justify-center flex-wrap mt-4">
                        {imagenesSinPrincipal.map((img, index) => {
                            const actualIndex = propiedad.imagenes.findIndex(i => i.url === img.url);
                            return (
                                <PhotoView key={img.url} src={`http://localhost:3000${img.url}`}>
                                    <img
                                        src={`http://localhost:3000${img.url}`}
                                        alt={`thumb-${actualIndex}`}
                                        onClick={() => setImagenSeleccionada(actualIndex)}
                                        className={`h-16 w-24 object-cover rounded-md border-2 cursor-pointer transition hover:scale-105 ${
                                            imagenSeleccionada === actualIndex ? 'border-blue-500' : 'border-transparent'
                                        }`}
                                    />
                                </PhotoView>
                            );
                        })}
                    </div>
                </div>
            </PhotoProvider>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-base text-gray-800 leading-relaxed">
                <div>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-1">📌 Información general</h2>
                    <p><strong>Tipo:</strong> {propiedad.tipo_propiedad}</p>
                    <p><strong>Estado físico:</strong> {propiedad.estado_propiedad}</p>
                    <p><strong>Transacción:</strong> {propiedad.transaccion}</p>
                    <p><strong>Precio:</strong> {Number(propiedad.precio).toLocaleString('es-EC', {
                        style: 'currency',
                        currency: propiedad.moneda || 'USD'
                    })}</p>
                    {propiedad.descripcion && (
                        <p className="mt-2 whitespace-pre-wrap"><strong>Descripción:</strong> {propiedad.descripcion}</p>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-1">🗺 Ubicación</h2>
                    <p><strong>Dirección:</strong> {propiedad.direccion}</p>
                    <p><strong>Ciudad:</strong> {propiedad.ciudad}</p>
                    <p><strong>Provincia:</strong> {propiedad.provincia}</p>
                    <p><strong>País:</strong> {propiedad.pais}</p>
                    {propiedad.codigo_postal && <p><strong>Código postal:</strong> {propiedad.codigo_postal}</p>}
                    {propiedad.latitud && <p><strong>Latitud:</strong> {propiedad.latitud}</p>}
                    {propiedad.longitud && <p><strong>Longitud:</strong> {propiedad.longitud}</p>}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-1">🏠 Características</h2>
                    <p><strong>Habitaciones:</strong> {propiedad.nro_habitaciones}</p>
                    <p><strong>Baños:</strong> {propiedad.nro_banos}</p>
                    <p><strong>Parqueaderos:</strong> {propiedad.nro_parqueaderos}</p>
                    <p><strong>Número de pisos:</strong> {propiedad.nro_pisos}</p>
                    {propiedad.anio_construccion && <p><strong>Año construcción:</strong> {propiedad.anio_construccion}</p>}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3 border-b pb-1">📐 Dimensiones</h2>
                    <p><strong>Área terreno:</strong> {propiedad.area_terreno} m²</p>
                    <p><strong>Área construcción:</strong> {propiedad.area_construccion} m²</p>
                </div>
            </div>

            {propiedad.agente && (
                <div className="mt-10 border-t pt-5 text-base text-gray-700">
                    <h2 className="text-xl font-semibold mb-1">👤 Agente inmobiliario responsable:</h2>
                    <p>{propiedad.agente.name} — {propiedad.agente.email}</p>
                </div>
            )}

            <div className="mt-10 text-center">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-indigo-100 text-indigo-700 font-semibold px-6 py-2 rounded-md shadow hover:bg-indigo-200 transition"
                >
                    ← Volver
                </button>
            </div>
        </div>
    );
}
