import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarPublica from '../components/NavbarPublica';
import { toast } from 'sonner';

export default function DetallePropiedad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [propiedad, setPropiedad] = useState(null);
    const [error, setError] = useState('');
    const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        mensaje: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        // Usar endpoint público sin autenticación
        axios.get(`http://localhost:3000/api/propiedades/publica/${id}`)
            .then(res => setPropiedad(res.data))
            .catch(err => {
                setError(err.response?.data?.mensaje || 'Error al cargar la propiedad');
            });
    }, [id]);

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
        if (!formData.email.trim()) {
            errors.email = 'El email es obligatorio';
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            errors.email = 'Formato de email inválido';
        }
        if (!formData.mensaje.trim()) errors.mensaje = 'El mensaje es obligatorio';
        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Por favor, corrige los errores en el formulario.');
            return;
        }

        setFormErrors({});
        // Simular envío de formulario
        console.log('Datos del formulario de contacto:', formData);
        toast.success('¡Mensaje enviado con éxito! El agente se pondrá en contacto contigo pronto.');
        setFormSubmitted(true);
        setFormData({
            nombre: '',
            email: '',
            mensaje: '',
        });
    };

    if (error) return (
        <>
            <NavbarPublica />
            <div className="text-center py-20">
                <p className="text-red-600 text-lg">{error}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Volver al inicio
                </button>
            </div>
        </>
    );
    
    if (!propiedad) return (
        <>
            <NavbarPublica />
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg">Cargando propiedad...</p>
            </div>
        </>
    );

    const badgeColor = {
        disponible: 'bg-green-500/90 text-white',
        vendida: 'bg-red-500/90 text-white',
        arrendada: 'bg-blue-500/90 text-white',
        reservada: 'bg-yellow-400/90 text-gray-900',
        inactiva: 'bg-gray-400/90 text-white',
    };
    const badgeIcon = {
        disponible: '🏡',
        vendida: '🔴',
        arrendada: '🔵',
        reservada: '🟡',
        inactiva: '⏸️',
    };

    // Función para avanzar/retroceder imagen principal
    const handleMainImageClick = (e) => {
        if (e.type === 'click' && e.button === 0) {
            // Click izquierdo: siguiente imagen
            setImagenSeleccionada((prev) => (prev + 1) % propiedad.imagenes.length);
        } else if (e.type === 'contextmenu') {
            // Click derecho: imagen anterior
            e.preventDefault();
            setImagenSeleccionada((prev) => (prev - 1 + propiedad.imagenes.length) % propiedad.imagenes.length);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100">
            <NavbarPublica />
            <div className="py-8">
                <div className="flex justify-center items-start w-full">
            {/* Botón volver fuera del card, alineado con el card */}
            <button
              onClick={() => navigate(-1)}
              className="mr-4 mb-2 mt-2 w-fit flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow border border-indigo-700 transition z-30"
              style={{ boxShadow: '0 2px 8px 0 rgba(80, 80, 180, 0.10)' }}
            >
              <span className="text-xl">←</span> <span className="text-base font-medium">Volver</span>
            </button>
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden border border-gray-100 relative">
              {/* Sidebar de imagen */}
              <div className="md:w-2/5 w-full flex flex-col items-center bg-gradient-to-b from-indigo-50 to-white p-4 relative">
                {/* Imagen principal sin PhotoView */}
                        <img
                            src={propiedad.imagenes[imagenSeleccionada]?.url.startsWith('http') 
                    ? propiedad.imagenes[imagenSeleccionada].url 
                    : `http://localhost:3000${propiedad.imagenes[imagenSeleccionada]?.url}`}
                            alt="principal"
                  className="w-full h-60 md:h-96 object-cover rounded-xl shadow-md border-2 border-indigo-100 cursor-pointer select-none"
                  onClick={handleMainImageClick}
                  onContextMenu={handleMainImageClick}
                />
                {/* Miniaturas con PhotoView */}
                <div className="flex md:flex-col flex-row gap-2 mt-4 md:mt-6 overflow-x-auto md:overflow-x-visible">
                  <PhotoProvider>
                    {propiedad.imagenes.map((img, idx) => (
                                <PhotoView key={img.url} src={`http://localhost:3000${img.url}`}>
                                    <img
                                        src={`http://localhost:3000${img.url}`}
                          alt={`thumb-${idx}`}
                          onClick={() => setImagenSeleccionada(idx)}
                          className={`h-12 w-20 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-indigo-400 ${imagenSeleccionada === idx ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-white'}`}
                                    />
                                </PhotoView>
                    ))}
                  </PhotoProvider>
                </div>
                {/* Badge de estado */}
                <span className={`absolute top-6 left-6 px-3 py-1 rounded-full text-base font-semibold shadow ${badgeColor[propiedad.estado_publicacion]}`}
                  style={{zIndex: 10}}
                >
                  {badgeIcon[propiedad.estado_publicacion]} {propiedad.estado_publicacion.charAt(0).toUpperCase() + propiedad.estado_publicacion.slice(1)}
                </span>
                {/* Botón ver todas las imágenes */}
                {propiedad.imagenes.length > 4 && (
                  <button
                    className="mt-4 text-indigo-600 hover:underline text-sm font-semibold"
                    onClick={() => setImagenSeleccionada(0)}
                  >
                    Ver todas las imágenes
                  </button>
                )}
              </div>

            {/* Detalle de la propiedad */}
            <div className="md:w-1/2 w-full p-4 flex flex-col gap-5 max-w-2xl mx-auto text-[#222]">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#222] mb-2 tracking-tight">{propiedad.titulo}</h1>
              {/* Información general */}
              <section>
                <h2 className="text-base font-bold text-[#222] mb-2 flex items-center gap-2 tracking-tight">📌 Información general</h2>
                <ul className="space-y-1 text-sm text-[#444]">
                  <li><span className="font-semibold text-[#222]">Tipo:</span> {propiedad.tipo_propiedad}</li>
                  <li><span className="font-semibold text-[#222]">Estado físico:</span> {propiedad.estado_propiedad}</li>
                  <li><span className="font-semibold text-[#222]">Transacción:</span> {propiedad.transaccion}</li>
                  <li>
                    <span className="font-semibold text-[#222]">Precio:</span>{' '}
                    <span className="text-[#222] font-bold">
                      {Number(propiedad.precio).toLocaleString('es-EC', {
                        style: 'currency',
                        currency: propiedad.moneda || 'USD'
                      })}
                    </span>
                  </li>
                    {propiedad.descripcion && (
                    <li className="mt-2 whitespace-pre-wrap"><span className="font-semibold text-[#222]">Descripción:</span> {propiedad.descripcion}</li>
                    )}
                </ul>
              </section>
              {/* Ubicación */}
              <section>
                <h2 className="text-base font-bold text-[#222] mb-2 flex items-center gap-2 tracking-tight">🗺 Ubicación</h2>
                <ul className="space-y-1 text-sm text-[#444]">
                  <li><span className="font-semibold text-[#222]">Dirección:</span> {propiedad.direccion}</li>
                  <li><span className="font-semibold text-[#222]">Ciudad:</span> {propiedad.ciudad}</li>
                  <li><span className="font-semibold text-[#222]">Provincia:</span> {propiedad.provincia}</li>
                  <li><span className="font-semibold text-[#222]">País:</span> {propiedad.pais}</li>
                  {propiedad.codigo_postal && <li><span className="font-semibold text-[#222]">Código postal:</span> {propiedad.codigo_postal}</li>}
                  {propiedad.latitud && <li><span className="font-semibold text-[#222]">Latitud:</span> {propiedad.latitud}</li>}
                  {propiedad.longitud && <li><span className="font-semibold text-[#222]">Longitud:</span> {propiedad.longitud}</li>}
                </ul>
              </section>
              {/* Características */}
              <section>
                <h2 className="text-base font-bold text-[#222] mb-2 flex items-center gap-2 tracking-tight">🏠 Características</h2>
                <ul className="space-y-1 text-sm text-[#444]">
                  <li><span className="font-semibold text-[#222]">Habitaciones:</span> {propiedad.nro_habitaciones}</li>
                  <li><span className="font-semibold text-[#222]">Baños:</span> {propiedad.nro_banos}</li>
                  <li><span className="font-semibold text-[#222]">Parqueaderos:</span> {propiedad.nro_parqueaderos}</li>
                  <li><span className="font-semibold text-[#222]">Número de pisos:</span> {propiedad.nro_pisos}</li>
                  {propiedad.anio_construccion && <li><span className="font-semibold text-[#222]">Año construcción:</span> {propiedad.anio_construccion}</li>}
                </ul>
              </section>
              {/* Dimensiones */}
              <section>
                <h2 className="text-base font-bold text-[#222] mb-2 flex items-center gap-2 tracking-tight">📐 Dimensiones</h2>
                <ul className="space-y-1 text-sm text-[#444]">
                  <li><span className="font-semibold text-[#222]">Área terreno:</span> {propiedad.area_terreno} m²</li>
                  <li><span className="font-semibold text-[#222]">Área construcción:</span> {propiedad.area_construccion} m²</li>
                </ul>
              </section>
              {/* Agente */}
              {propiedad.agente && (
                <section className="mt-4 flex items-center gap-3 bg-gradient-to-r from-indigo-100 via-white to-blue-100 rounded-lg shadow p-3 border border-indigo-100">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-[#222] shadow border-2 border-white">
                      {propiedad.agente.name?.charAt(0) || 'A'}
                </div>
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#222] mb-0 flex items-center gap-2 tracking-tight">👤 Agente responsable</h2>
                    <p className="text-sm text-[#222] font-semibold">{propiedad.agente.name}</p>
                    <p className="text-xs text-[#444]">{propiedad.agente.email}</p>
                </div>
                </section>
              )}

              {/* Formulario de Contacto */}
              <section className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Contactar al Agente</h2>
                  {formSubmitted ? (
                      <p className="text-green-600 font-semibold">¡Gracias por tu mensaje! El agente se pondrá en contacto contigo pronto.</p>
                  ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                          <div>
                              <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Tu Nombre</label>
                              <input
                                  type="text"
                                  id="nombre"
                                  name="nombre"
                                  value={formData.nombre}
                                  onChange={handleFormChange}
                                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.nombre ? 'border-red-500' : ''}`}
                                  placeholder="Tu nombre completo"
                              />
                              {formErrors.nombre && <p className="text-red-500 text-xs italic mt-1">{formErrors.nombre}</p>}
                          </div>
                          <div>
                              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Tu Email</label>
                              <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleFormChange}
                                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.email ? 'border-red-500' : ''}`}
                                  placeholder="tu@ejemplo.com"
                              />
                              {formErrors.email && <p className="text-red-500 text-xs italic mt-1">{formErrors.email}</p>}
                          </div>
                          <div>
                              <label htmlFor="mensaje" className="block text-gray-700 text-sm font-bold mb-2">Mensaje</label>
                              <textarea
                                  id="mensaje"
                                  name="mensaje"
                                  value={formData.mensaje}
                                  onChange={handleFormChange}
                                  rows="5"
                                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.mensaje ? 'border-red-500' : ''}`}
                                  placeholder="Me gustaría obtener más información sobre esta propiedad..."
                              ></textarea>
                              {formErrors.mensaje && <p className="text-red-500 text-xs italic mt-1">{formErrors.mensaje}</p>}
                          </div>
                          <button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                          >
                              Enviar Mensaje
                          </button>
                      </form>
                  )}
              </section>

                </div>
            </div>
                </div>
            </div>
        </div>
    );
}