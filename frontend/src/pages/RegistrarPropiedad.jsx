import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useBlocker } from 'react-router-dom';
import DocumentManager from '../components/DocumentManager';
import { toast } from 'sonner';

// Importar Sub-componentes del Formulario
import FormIdentificacion from '../components/propiedad/form/FormIdentificacion';
import FormUbicacion from '../components/propiedad/form/FormUbicacion';
import FormCaracteristicas from '../components/propiedad/form/FormCaracteristicas';
import FormNegocio from '../components/propiedad/form/FormNegocio';
import FormImagenes from '../components/propiedad/form/FormImagenes';
import { FolderCheck } from 'lucide-react';


const initialDocumentos = {
    escritura: [],
    gravamenes: [],
    predial: [],
    datos_generales: [],
    autorizacion_venta: [],
    contrato_exclusividad: [],
    planos: [],
    ficha_catastral: [],
    uso_suelo: [],
    reglamento_ph: [],
    certificado_expensas: [],
    certificado_alicuota: [],
    planilla_luz: [],
    planilla_agua: [],
    planilla_alicuota: [],
    otros: []
};

const initialDatos = {
    titulo: '',
    descripcion: '',
    tipo_propiedad: '',
    uso_propiedad: '',
    estado_propiedad: '',
    transaccion: '',
    precio: '',
    moneda: 'USD',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigo_postal: '',
    sector: '',
    referencia: '',
    latitud: '',
    longitud: '',
    area_terreno: '',
    unidad_area_terreno: 'm2',
    area_construccion: '',
    unidad_area_construccion: 'm2',
    nro_habitaciones: '',
    nro_banos: '',
    nro_parqueaderos: '',
    nro_pisos: '',
    anio_construccion: '',
    estado_publicacion: 'disponible',
    agenteId: '',
    propietarioId: '',
    propietarios: [],
    fecha_captacion: '',
    comision: '',
    tipo_comision: 'porcentaje',
    precio_minimo: '',
    valor_garantia: '',
    tipo_contrato: '',
    fecha_fin_contrato: '',
    orientacion: '',
    tiene_balcon: false,
    tiene_terraza: false,
    tiene_patio: false,
    tiene_bodega: false,
    tiene_area_bbq: false,
    tiene_piscina: false,
    tiene_ascensor: false,
    tiene_seguridad: false,
    tiene_areas_comunales: false,
    tiene_gas_centralizado: false,
    tiene_lavanderia: false,
    tiene_cisterna: false,
    amoblado: false
};

export default function RegistrarPropiedad() {
    const navigate = useNavigate();
    const [imagenes, setImagenes] = useState([]);
    const [documentos, setDocumentos] = useState(initialDocumentos);

    const [usuario, setUsuario] = useState(null);
    const [agentes, setAgentes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [busquedaCliente, setBusquedaCliente] = useState('');

    // --- WIZARD STATE ---
    const [currentStep, setCurrentStep] = useState(1);

    // ... existing steps ...

    // ... existing datos state ...

    // ... existing other references ...

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

        // Cargar Agentes y Clientes
        const promises = [];

        if (decoded.rol === 'admin') {
            promises.push(axios.get('http://localhost:3000/api/usuarios/agentes', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setAgentes(res.data)));
        }

        // Cargar clientes para todos (admin y agentes) para poder asignar propietarios
        promises.push(axios.get('http://localhost:3000/api/clientes?limit=1000', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setClientes(res.data.clientes || [])));

        Promise.all(promises)
            .catch(err => console.error("Error cargando datos iniciales:", err))
            .finally(() => setLoading(false));

    }, []);

    const steps = [
        {
            id: 1,
            title: 'Identificación',
            path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
        },
        {
            id: 2,
            title: 'Ubicación',
            path: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
        },
        {
            id: 3,
            title: 'Características',
            path: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        },
        {
            id: 4,
            title: 'Multimedia',
            path: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
        },
        {
            id: 5,
            title: 'Negocio',
            path: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        }
    ];

    const [datos, setDatos] = useState(initialDatos);

    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const [codigoPreview, setCodigoPreview] = useState('');
    const [mapCenter, setMapCenter] = useState(null);
    const cancelarRef = useRef(null);
    const ignoreMapUpdate = useRef(false);
    const topRef = useRef(null); // Referencia para scroll top
    const isSaved = useRef(false); // Ref para bypassear el bloqueo al guardar

    const coordenadasProvincias = {
        'Azuay': { lat: -2.9001, lng: -79.0059 },
        'Bolivar': { lat: -1.6056, lng: -79.0306 },
        'Canar': { lat: -2.7303, lng: -78.8456 },
        'Carchi': { lat: 0.8119, lng: -77.9333 },
        'Chimborazo': { lat: -1.6635, lng: -78.6546 },
        'Cotopaxi': { lat: -0.9328, lng: -78.6144 },
        'El_Oro': { lat: -3.2646, lng: -79.9525 },
        'Esmeraldas': { lat: 0.9632, lng: -79.6517 },
        'Galapagos': { lat: -0.9538, lng: -90.9656 },
        'Guayas': { lat: -2.1894, lng: -79.8891 },
        'Imbabura': { lat: 0.3541, lng: -78.1189 },
        'Loja': { lat: -3.9931, lng: -79.2042 },
        'Los_Rios': { lat: -1.8022, lng: -79.5342 },
        'Manabi': { lat: -1.0546, lng: -80.4545 },
        'Morona_Santiago': { lat: -2.3025, lng: -78.1192 },
        'Napo': { lat: -0.9938, lng: -77.8129 },
        'Orellana': { lat: -0.4667, lng: -76.9833 },
        'Pastaza': { lat: -1.4939, lng: -77.8860 },
        'Pichincha': { lat: -0.1807, lng: -78.4678 },
        'Santa_Elena': { lat: -2.2272, lng: -80.8594 },
        'Santo_Domingo': { lat: -0.2530, lng: -79.1754 },
        'Sucumbios': { lat: 0.0847, lng: -76.8828 },
        'Tungurahua': { lat: -1.2491, lng: -78.6168 },
        'Zamora_Chinchipe': { lat: -4.0692, lng: -78.9567 },
    };



    // Protección ante recarga/cierre de pestaña
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hayCambios() && !isSaved.current) {
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
        const { name, value, type, checked } = e.target;

        setDatos((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error al escribir
        if (errores[name]) {
            setErrores(prev => {
                const nuevos = { ...prev };
                delete nuevos[name];
                return nuevos;
            });
        }
    };

    const handleMapChange = ({ lat, lng }) => {
        ignoreMapUpdate.current = true;
        setDatos(prev => ({ ...prev, latitud: lat, longitud: lng }));
    };

    useEffect(() => {
        if (datos.provincia && coordenadasProvincias[datos.provincia]) {
            setMapCenter(coordenadasProvincias[datos.provincia]);
        }
    }, [datos.provincia]);

    useEffect(() => {
        if (ignoreMapUpdate.current) {
            ignoreMapUpdate.current = false;
            return;
        }
        const lat = parseFloat(datos.latitud);
        const lng = parseFloat(datos.longitud);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                setMapCenter({ lat, lng });
            }
        }
    }, [datos.latitud, datos.longitud]);



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

    useEffect(() => {
        const fetchCodigoPreview = async () => {
            if (datos.tipo_propiedad) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const { data } = await axios.get(`http://localhost:3000/api/propiedades/preview-codigo?tipo=${datos.tipo_propiedad}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCodigoPreview(data.codigo);
                } catch (error) {
                    console.error("Error al obtener preview de código", error);
                }
            } else {
                setCodigoPreview('');
            }
        };
        fetchCodigoPreview();
    }, [datos.tipo_propiedad]);

    const filtrarClientes = () => {
        if (!busquedaCliente) return [];
        return clientes.filter(c =>
            c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
            c.email.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
            c.cedula?.includes(busquedaCliente)
        ).slice(0, 5);
    };

    const agregarPropietario = (cliente) => {
        if (datos.propietarios.some(p => p.clienteId === cliente.id.toString() || p.clienteId === cliente.id)) {
            toast.warning('Este propietario ya está agregado');
            return;
        }

        setDatos(prev => {
            const nuevosPropietarios = [...prev.propietarios, {
                clienteId: cliente.id.toString(),
                nombre: cliente.nombre,
                email: cliente.email,
                cedula: cliente.cedula,
                porcentaje: 0,
                es_principal: prev.propietarios.length === 0
            }];

            // Recalcular porcentajes automáticamente
            const total = nuevosPropietarios.length;
            const porcentajeBase = Math.floor((100 / total) * 100) / 100; // 2 decimales truncados
            const resto = 100 - (porcentajeBase * total);

            nuevosPropietarios.forEach((p, i) => {
                // Al primero le sumamos el resto de decimales para cuadrar 100% exacto
                p.porcentaje = (i === 0 ? (porcentajeBase + resto).toFixed(2) : porcentajeBase.toFixed(2));
            });

            return { ...prev, propietarios: nuevosPropietarios };
        });
        setBusquedaCliente('');
        setErrores(prev => {
            const newErrores = { ...prev };
            delete newErrores.propietarios;
            return newErrores;
        });
    };

    const handleRemovePropietario = (index) => {
        setDatos(prev => {
            const nuevos = [...prev.propietarios];
            nuevos.splice(index, 1);

            if (nuevos.length > 0) {
                // Asegurar principal
                if (!nuevos.some(p => p.es_principal)) {
                    nuevos[0].es_principal = true;
                }

                // Recalcular porcentajes automáticamente
                const total = nuevos.length;
                const porcentajeBase = Math.floor((100 / total) * 100) / 100;
                const resto = 100 - (porcentajeBase * total);

                nuevos.forEach((p, i) => {
                    p.porcentaje = (i === 0 ? (porcentajeBase + resto).toFixed(2) : porcentajeBase.toFixed(2));
                });
            }

            return { ...prev, propietarios: nuevos };
        });
    };

    const handlePropietarioChange = (index, field, value) => {
        setDatos(prev => {
            const nuevos = [...prev.propietarios];
            if (field === 'es_principal') {
                if (value) nuevos.forEach((p, i) => p.es_principal = i === index);
                // No permitimos desmarcar si es el único, pero el radio button lo maneja
            } else {
                nuevos[index][field] = value;
            }
            return { ...prev, propietarios: nuevos };
        });
    };

    // --- WIZARD NAVIGATION & VALIDATION ---
    const validarPaso = (step) => {
        const nuevosErrores = {};

        if (step === 1) { // Identificación
            if (!datos.tipo_propiedad) nuevosErrores.tipo_propiedad = 'Seleccione un tipo de propiedad';
            if (!datos.transaccion) nuevosErrores.transaccion = 'Seleccione el tipo de transacción';
            if (!datos.uso_propiedad) nuevosErrores.uso_propiedad = 'Seleccione el uso de la propiedad';
        }

        if (step === 2) { // Ubicación
            if (!datos.provincia) nuevosErrores.provincia = 'Seleccione una provincia';
            if (!datos.ciudad.trim()) nuevosErrores.ciudad = 'La ciudad es obligatoria';
            if (!datos.sector || !datos.sector.trim()) nuevosErrores.sector = 'El sector es obligatorio';
            if (!datos.direccion.trim()) nuevosErrores.direccion = 'La dirección es obligatoria';
        }

        if (step === 3) { // Características
            if (!datos.estado_propiedad) nuevosErrores.estado_propiedad = 'Seleccione el estado de la propiedad';
            if (!datos.area_terreno || isNaN(Number(datos.area_terreno)) || Number(datos.area_terreno) <= 0) nuevosErrores.area_terreno = 'Ingrese un área válida';
        }

        if (step === 4) { // Multimedia (Fotos + Título Web)
            if (!datos.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio';
            if (!imagenes.length) nuevosErrores.imagenes = 'Debe subir al menos una imagen';
        }

        if (step === 5) { // Negocio
            if (!datos.precio || isNaN(Number(datos.precio)) || Number(datos.precio) <= 0) nuevosErrores.precio = 'Ingrese un precio válido';
            if (!datos.comision || isNaN(Number(datos.comision)) || Number(datos.comision) < 0) nuevosErrores.comision = 'Ingrese la comisión';

            if (!datos.tipo_contrato) nuevosErrores.tipo_contrato = 'Seleccione el tipo de contrato';
            if (!datos.fecha_captacion) nuevosErrores.fecha_captacion = 'Fecha de captación obligatoria';

            if (usuario?.rol === 'admin' && !datos.agenteId) nuevosErrores.agenteId = 'Seleccione un agente';

            // Validación de Garantía en Arriendos
            if (datos.transaccion === 'alquiler') {
                if (!datos.valor_garantia || isNaN(Number(datos.valor_garantia)) || Number(datos.valor_garantia) < 0) {
                    nuevosErrores.valor_garantia = 'Ingrese el valor de garantía';
                }
            }

            // Validación de Documentos Obligatorios (Regla #2)
            if (datos.tipo_contrato === 'exclusividad') {
                if (!documentos.contrato_exclusividad || documentos.contrato_exclusividad.length === 0) {
                    // Usamos toast directos para documentos ya que no tienen inputs asociados con estado de error visual simple
                    toast.error('Falta: Contrato de Exclusividad');
                    nuevosErrores.documentos = 'Falta Contrato de Exclusividad';
                }
            } else {
                if (!documentos.autorizacion_venta || documentos.autorizacion_venta.length === 0) {
                    toast.error('Falta: Autorización de Venta');
                    nuevosErrores.documentos = 'Falta Autorización de Venta';
                }
            }

            // Validación de Propietarios
            if (!datos.propietarios || datos.propietarios.length === 0) {
                nuevosErrores.propietarios = 'Debe agregar al menos un propietario';
                toast.error('Debe agregar al menos un propietario');
            } else {
                const sumaPorcentajes = datos.propietarios.reduce((acc, curr) => acc + parseFloat(curr.porcentaje || 0), 0);
                if (Math.abs(sumaPorcentajes - 100) > 0.1) { // Tolerancia pequeña por decimales
                    nuevosErrores.propietarios = `La suma de porcentajes debe ser 100% (Actual: ${sumaPorcentajes}%)`;
                    toast.error(`La suma de porcentajes debe ser 100% (Actual: ${sumaPorcentajes}%)`);
                }
                if (!datos.propietarios.some(p => p.es_principal)) {
                    nuevosErrores.propietarios = 'Debe marcar un propietario como principal';
                    toast.error('Debe marcar un propietario como principal');
                }
            }

            // Validación de Contrato
            if (datos.tipo_contrato && !datos.fecha_fin_contrato) {
                nuevosErrores.fecha_fin_contrato = 'La fecha fin es obligatoria para el contrato seleccionado';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleNext = (e) => {
        if (e) e.preventDefault();
        if (validarPaso(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error('Por favor completa todos los campos obligatorios del paso actual.');
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarPaso(5)) {
            toast.error('Por favor, corrige los errores antes de registrar.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            Object.entries(datos).forEach(([key, val]) => {
                // Skip manually handled fields
                if (key === 'propietarios' || key === 'imagenes') return;

                if (val !== '' && val !== null) formData.append(key, val);
            });

            if (datos.propietarios && datos.propietarios.length > 0) {
                formData.append('propietarios', JSON.stringify(datos.propietarios));
            } else if (datos.propietarioId) {
                const unicoPropietario = [{ clienteId: datos.propietarioId, porcentaje: 100, es_principal: true }];
                formData.append('propietarios', JSON.stringify(unicoPropietario));
            }

            imagenes.forEach(img => formData.append('imagenes', img));

            await axios.post('http://localhost:3000/api/propiedades', formData, {
                headers: { Authorization: `Bearer ${token}` }, // Axios sets Content-Type automatically with boundary
            }).then(async (response) => {
                const propiedadId = response.data.propiedad.id;
                const uploadPromises = [];
                const processUpload = (files, tipo, categoria) => {
                    if (files.length === 0) return;
                    const fd = new FormData();
                    files.forEach(f => fd.append('documentos', f));
                    fd.append('tipo', tipo);
                    fd.append('categoria', categoria);
                    uploadPromises.push(
                        axios.post(`http://localhost:3000/api/documentos/propiedad/${propiedadId}`, fd, {
                            headers: { Authorization: `Bearer ${token}` } // Axios sets Content-Type automatically with boundary
                        })
                    );
                };

                processUpload(documentos.escritura, 'ESCRITURA', 'LEGAL');
                processUpload(documentos.gravamenes, 'CERTIFICADO_GRAVAMEN', 'LEGAL');
                processUpload(documentos.predial, 'PAGO_PREDIAL', 'LEGAL');

                // Subir solo el documento correspondiente al tipo de contrato seleccionado
                if (datos.tipo_contrato === 'exclusividad') {
                    processUpload(documentos.contrato_exclusividad, 'CONTRATO_EXCLUSIVIDAD', 'COMERCIAL');
                } else {
                    processUpload(documentos.autorizacion_venta, 'AUTORIZACION_VENTA', 'COMERCIAL');
                }

                processUpload(documentos.planos, 'PLANO', 'TECNICO');
                processUpload(documentos.ficha_catastral, 'FICHA_CATASTRAL', 'TECNICO');
                processUpload(documentos.uso_suelo, 'CERTIFICADO_USO_SUELO', 'TECNICO');
                processUpload(documentos.reglamento_ph, 'REGLAMENTO_PH', 'PH');
                processUpload(documentos.certificado_expensas, 'CERTIFICADO_EXPENSAS', 'PH'); // ADDED
                processUpload(documentos.certificado_alicuota, 'CERTIFICADO_ALICUOTA', 'PH');
                processUpload(documentos.planilla_luz, 'PLANILLA_LUZ', 'SERVICIOS');
                processUpload(documentos.planilla_agua, 'PLANILLA_AGUA', 'SERVICIOS');
                processUpload(documentos.planilla_alicuota, 'PLANILLA_ALICUOTA', 'SERVICIOS');
                processUpload(documentos.otros, 'OTRO', 'OTROS');

                if (uploadPromises.length > 0) {
                    toast.info('Subiendo documentos...');
                    await Promise.all(uploadPromises);
                }

                toast.success('Propiedad y documentos registrados correctamente', { duration: 2000 });
                isSaved.current = true; // Marcar como guardado para permitir navegación
                setTimeout(() => {
                    navigate(usuario.rol === 'admin' ? '/admin/panel-propiedades' : '/agente/panel-propiedades');
                }, 1500);
            });

        } catch (error) {
            console.error(error);
            if (error.response?.data?.errores?.length) {
                error.response.data.errores.forEach(err => toast.error(`${err}`, { duration: 3000 }));
            } else if (error.response?.data?.mensaje) {
                toast.error(`${error.response.data.mensaje}: ${error.response.data.error || ''}`);
            } else {
                toast.error('Ocurrió un error al registrar la propiedad.');
            }
        }
    };

    const hayCambios = () => {
        for (const key in initialDatos) {
            if (key === 'propietarios') {
                if (datos.propietarios.length > 0) return true;
            } else {
                if (datos[key] !== initialDatos[key]) return true;
            }
        }
        if (imagenes.length > 0) return true;
        for (const key in initialDocumentos) {
            if (documentos[key].length > 0) return true;
        }
        return false;
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hayCambios() && !isSaved.current && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => {
        if (usuario?.rol === 'admin') {
            navigate('/admin/panel-propiedades');
        } else {
            navigate('/agente/panel-propiedades');
        }
    };

    if (loading) return null;
    return (
        <div ref={topRef} className="max-w-4xl mx-auto mt-6 px-4 md:px-0 mb-20">
            {/* ENCABEZADO */}
            <div className="bg-white shadow-sm rounded-xl p-6 mb-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Registrar Propiedad</h2>
                <div className="flex justify-center flex-wrap gap-2 text-sm text-gray-500 mb-2">
                    <span>Paso {currentStep} de {steps.length}:</span>
                    <span className="font-semibold text-orange-600">{steps[currentStep - 1].title}</span>
                </div>
                <p className="text-xs text-gray-400 text-center"><span className="text-red-500 font-bold">*</span> Campos obligatorios</p>
            </div>

            {/* STEPPER PROGRESS BAR */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
                    <div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-orange-600 -z-10 rounded transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center cursor-default group">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${step.id === currentStep
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg scale-110'
                                    : step.id < currentStep
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                            >
                                {step.id < currentStep ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.path} />
                                    </svg>
                                )}
                            </div>
                            <span className={`text-xs mt-2 font-medium hidden sm:block transition-colors duration-300 ${step.id === currentStep ? 'text-gray-900 font-bold' : step.id < currentStep ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* FORMULARIO STEP-BY-STEP */}
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6 md:p-8 min-h-[400px]">
                {/* INSTRUCCIONES INDICATIVAS */}
                <div className="flex justify-end mb-4">
                    <p className="text-sm text-gray-500 italic">
                        Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
                    </p>
                </div>

                {/* 1. IDENTIFICACIÓN */}
                {currentStep === 1 && (
                    <div className="animate-fadeIn">
                        <FormIdentificacion
                            datos={datos}
                            handleChange={handleChange}
                            errores={errores}
                            codigoPreview={codigoPreview}
                        />
                    </div>
                )}

                {/* 2. UBICACIÓN */}
                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <FormUbicacion
                            datos={datos}
                            handleChange={handleChange}
                            errores={errores}
                            mapCenter={mapCenter}
                            handleMapChange={handleMapChange}
                        />
                    </div>
                )}

                {/* 3. CARACTERÍSTICAS */}
                {currentStep === 3 && (
                    <div className="animate-fadeIn">
                        <FormCaracteristicas
                            datos={datos}
                            handleChange={handleChange}
                            errores={errores}
                        />
                    </div>
                )}

                {/* 4. IMÁGENES Y DATOS PÚBLICOS */}
                {currentStep === 4 && (
                    <div className="animate-fadeIn">
                        <FormImagenes
                            datos={datos}
                            handleChange={handleChange}
                            errores={errores}
                            imagenes={imagenes}
                            setImagenes={(newImages) => {
                                setImagenes(newImages);
                                if (errores.imagenes && newImages.length > 0) {
                                    setErrores(prev => {
                                        const nuevos = { ...prev };
                                        delete nuevos.imagenes;
                                        return nuevos;
                                    });
                                }
                            }}
                        />
                    </div>
                )}

                {/* 5. NEGOCIO (PRIVADO) */}
                {currentStep === 5 && (
                    <div className="animate-fadeIn">
                        <FormNegocio
                            datos={datos}
                            handleChange={handleChange}
                            errores={errores}
                            usuario={usuario}
                            agentes={agentes}
                            clientes={clientes}
                            busquedaCliente={busquedaCliente}
                            setBusquedaCliente={setBusquedaCliente}
                            filtrarClientes={filtrarClientes}
                            agregarPropietario={agregarPropietario}
                            handleRemovePropietario={handleRemovePropietario}
                            handlePropietarioChange={handlePropietarioChange}
                        />
                        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FolderCheck className="w-6 h-6 text-orange-600" />
                                Documentación Legal y Técnica <span className="text-sm font-normal text-gray-500">(Privado)</span>
                            </h3>
                            <div className="w-full">
                                <DocumentManager
                                    documentos={documentos}
                                    onUpload={handleDocumentos}
                                    onDelete={eliminarDocumento}
                                    tipoContrato={datos.tipo_contrato}
                                    errores={errores}
                                />
                            </div>
                        </section>
                    </div>
                )}

                {/* BOTONES DE NAVEGACIÓN */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                    {/* BOTÓN CANCELAR O ANTERIOR */}
                    {currentStep === 1 ? (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium px-4 py-2 transition"
                        >
                            ← Anterior
                        </button>
                    )}

                    {/* BOTÓN SIGUIENTE O REGISTRAR */}
                    {currentStep < 5 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-lg shadow-md transition transform hover:scale-105 flex items-center gap-2"
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="bg-gray-900 hover:bg-black text-white font-bold px-8 py-3 rounded-lg shadow-md transition transform hover:scale-105 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Registrar Propiedad
                        </button>
                    )}
                </div>
            </form>

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
    );
}
