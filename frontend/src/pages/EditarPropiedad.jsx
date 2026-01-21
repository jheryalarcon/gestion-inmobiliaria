import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import axios from 'axios';
import SelectProvincia from '../components/SelectProvincia';
import SelectTipoPropiedad from '../components/SelectTipoPropiedad';
import DocumentManager from '../components/DocumentManager'; // Import DocumentManager
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { Trash2, FolderCheck, Building2 } from 'lucide-react';
import FormIdentificacion from '../components/propiedad/form/FormIdentificacion';
import FormUbicacion from '../components/propiedad/form/FormUbicacion';
import FormCaracteristicas from '../components/propiedad/form/FormCaracteristicas';
import FormNegocio from '../components/propiedad/form/FormNegocio';
import FormImagenes from '../components/propiedad/form/FormImagenes';

// Helper para mapear categorías
const obtenerCategoriaPorTipo = (tipo) => {
    const mapping = {
        escritura: 'LEGAL',
        gravamenes: 'LEGAL',
        predial: 'LEGAL',
        planos: 'TECNICO',
        ficha_catastral: 'TECNICO',
        uso_suelo: 'TECNICO',
        reglamento_ph: 'PH',
        certificado_alicuota: 'PH',
        certificado_expensas: 'PH',
        planilla_luz: 'SERVICIOS',
        planilla_agua: 'SERVICIOS',
        planilla_alicuota: 'SERVICIOS',
        contrato_exclusividad: 'COMERCIAL',
        autorizacion_venta: 'COMERCIAL',
        otros: 'OTROS'
    };
    return mapping[tipo] || 'OTROS';
};

export default function EditarPropiedad() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [imagenesActuales, setImagenesActuales] = useState([]);
    const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
    const [docsAEliminar, setDocsAEliminar] = useState([]); // ADDED for Batch Delete
    const [imagenesNuevas, setImagenesNuevas] = useState([]);
    const [vistaPrevia, setVistaPrevia] = useState([]);
    const [agentes, setAgentes] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(true);
    const cancelarRef = useRef(null);
    const isSavedRef = useRef(false);
    const [initialDatos, setInitialDatos] = useState(null);

    // Multi-Propietario State
    const [propietarios, setPropietarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [busquedaCliente, setBusquedaCliente] = useState('');

    // Documentos State
    const [documentos, setDocumentos] = useState({
        escritura: [],
        gravamenes: [],
        predial: [],
        planos: [],
        ficha_catastral: [],
        uso_suelo: [],
        reglamento_ph: [],
        certificado_alicuota: [],
        certificado_expensas: [], // ADDED
        planilla_luz: [],
        planilla_agua: [],
        planilla_alicuota: [],
        contrato_exclusividad: [],
        autorizacion_venta: []
    });

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

            // Mapear propietarios existentes
            console.log('👤 Propietarios recibidos:', res.data.propietarios);
            if (res.data.propietarios && res.data.propietarios.length > 0) {
                setPropietarios(res.data.propietarios.map(p => ({
                    clienteId: p.clienteId.toString(),
                    nombre: p.cliente?.nombre || 'Desconocido', // Safely access cliente
                    email: p.cliente?.email || '',
                    porcentaje: p.porcentaje,
                    es_principal: p.es_principal
                })));
            } else {
                console.warn('⚠️ No se encontraron propietarios en la relación. Verificando fallback...');
                // Fallback Legacy: Si hay ID pero no relación, buscamos al cliente manualmente
                if (res.data.propietarioId) {
                    console.log('🔄 Cargando propietario legacy ID:', res.data.propietarioId);
                    axios.get(`http://localhost:3000/api/clientes/${res.data.propietarioId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(clienteRes => {
                        const cliente = clienteRes.data;
                        setPropietarios([{
                            clienteId: cliente.id.toString(),
                            nombre: cliente.nombre,
                            email: cliente.email,
                            porcentaje: 100,
                            es_principal: true
                        }]);
                        console.log('✅ Propietario legacy cargado:', cliente.nombre);
                    }).catch(err => {
                        console.error('Error cargando propietario legacy:', err);
                    });
                }
            }

            // Mapear documentos existentes
            if (res.data.documentos && res.data.documentos.length > 0) {
                // Normalizar claves a minúsculas para coincidir con el estado
                const docsMap = { ...documentos }; // Start with empty state structure
                res.data.documentos.forEach(doc => {
                    const keyOriginal = doc.tipo.toLowerCase();
                    console.log('📄 Procesando documento:', doc.id, doc.tipo, keyOriginal);

                    // Mapa de normalización de claves de backend a frontend
                    const keyMap = {
                        'escritura_publica': 'escritura',
                        'escritura': 'escritura',
                        // Gravamenes
                        'cert_gravamenes': 'gravamenes',
                        'gravamenes': 'gravamenes',
                        'cert_gravamen': 'gravamenes',
                        'certificado_gravamen': 'gravamenes', // ACTUAL KEY sent by Registrar
                        // Predial
                        'predial': 'predial',
                        'impuesto_predial': 'predial',
                        'pago_predial': 'predial', // ACTUAL KEY sent by Registrar
                        // Planos
                        'planos': 'planos',
                        'plano': 'planos', // ACTUAL KEY sent by Registrar
                        // Ficha
                        'ficha_catastral': 'ficha_catastral',
                        // Uso Suelo
                        'uso_suelo': 'uso_suelo',
                        'certificado_uso_suelo': 'uso_suelo', // ACTUAL KEY sent by Registrar
                        // PH
                        'reglamento_ph': 'reglamento_ph',
                        'cert_alicuota': 'certificado_alicuota',
                        'certificado_alicuota': 'certificado_alicuota',
                        'certificado_expensas': 'certificado_expensas', // ADDED
                        // Servicios
                        'planilla_luz': 'planilla_luz',
                        'luz': 'planilla_luz',
                        'planilla_agua': 'planilla_agua',
                        'agua': 'planilla_agua',
                        'planilla_alicuota': 'planilla_alicuota',
                        'alicuota': 'planilla_alicuota',
                        // Comercial
                        'contrato_exclusividad': 'contrato_exclusividad',
                        'autorizacion_venta': 'autorizacion_venta',
                        'otro': 'otros',
                        'otros': 'otros'
                    };

                    const stateKey = keyMap[keyOriginal];

                    if (stateKey && docsMap[stateKey] !== undefined) {
                        // Es un array conocido, pusheamos
                        docsMap[stateKey] = [
                            ...(docsMap[stateKey] || []),
                            {
                                id: doc.id,
                                name: doc.nombre,
                                url: doc.url,
                                type: 'application/pdf'
                            }
                        ];
                    } else {
                        console.warn('⚠️ Documento con tipo desconocido o no mapeado:', doc.tipo);
                    }
                });
                console.log('📂 Mapa de documentos final:', docsMap);
                setDocumentos(docsMap);
            }
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

        if (user.rol === 'admin' || user.rol === 'agente') {
            axios.get('http://localhost:3000/api/usuarios/agentes', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setAgentes(res.data));

            // Cargar clientes para buscador
            axios.get('http://localhost:3000/api/clientes?limit=1000', {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => setClientes(res.data.clientes || []));
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

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !isSavedRef.current && hayCambios() && currentLocation.pathname !== nextLocation.pathname
    );

    const handleCancel = () => {
        if (usuario?.rol === 'admin') {
            navigate('/admin/panel-propiedades');
        } else {
            navigate('/agente/panel-propiedades');
        }
    };

    const obtenerMensajeErrorCampo = (campo) => {
        const mensajes = {
            titulo: 'El título de la propiedad es obligatorio',
            tipo_propiedad: 'Debe seleccionar un tipo de propiedad (Casa, Departamento, etc.)',
            estado_propiedad: 'Debe seleccionar el estado físico de la propiedad',
            transaccion: 'Debe especificar si es Venta o Alquiler',
            precio: 'El precio debe ser un número mayor a $0',
            direccion: 'La dirección completa es obligatoria',
            ciudad: 'Debe especificar la ciudad',
            provincia: 'Debe seleccionar una provincia',
            sector: 'El sector o barrio es obligatorio',
            area_terreno: 'El área de terreno debe ser un número mayor a 0',
            uso_propiedad: 'Debe seleccionar el uso (Residencial, Comercial, etc.)',
            agenteId: 'Debe asignar un agente responsable',
            imagenes: 'Debe subir al menos una imagen de la propiedad',
            comision: 'La comisión pactada es obligatoria (puede ser 0)',
            fecha_captacion: 'La fecha de captación es obligatoria',
            tipo_contrato: 'Debe seleccionar el tipo de contrato (Exclusividad o Abierta)',
            valor_garantia: 'El valor de garantía es obligatorio para alquileres'
        };
        return mensajes[campo] || 'Este campo es obligatorio';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Fix para Checkboxes (Amenities)
        const val = type === 'checkbox' ? checked : value;

        setDatos((prev) => {
            const nuevosDatos = { ...prev, [name]: val };

            // Limpiar valor_garantia si la transacción cambia a Venta
            if (name === 'transaccion' && val !== 'alquiler') {
                nuevosDatos.valor_garantia = '';
            }

            return nuevosDatos;
        });

        setErrores((prev) => {
            const nuevos = { ...prev };
            // Solo los campos obligatorios de RegistrarPropiedad.jsx
            if ([
                'titulo', 'tipo_propiedad', 'estado_propiedad', 'transaccion', 'precio', 'direccion', 'ciudad', 'provincia', 'area_terreno',
                'sector', 'uso_propiedad', 'comision', 'fecha_captacion', 'tipo_contrato', 'valor_garantia'
            ].includes(name)) { // Added valor_garantia check logic in render or separate check
                // Logic simplified below
                if (String(val).trim() === '' || val === '') {
                    nuevos[name] = obtenerMensajeErrorCampo(name);
                } else {
                    delete nuevos[name];
                }
            }
            // Specific validations
            if (name === 'precio') {
                if (isNaN(Number(val)) || Number(val) <= 0) {
                    nuevos.precio = 'Ingrese un precio válido';
                } else {
                    delete nuevos.precio;
                }
            }
            if (name === 'area_terreno') {
                if (!val || Number(val) <= 0) {
                    nuevos.area_terreno = 'Área de terreno inválida';
                } else {
                    delete nuevos.area_terreno;
                }
            }
            // Special case: Clear guarantee error if transaction changes
            if (name === 'transaccion' && val !== 'alquiler') {
                delete nuevos.valor_garantia;
            }

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

    // HANDLERS MULTI-PROPIETARIO
    const agregarPropietario = (cliente) => {
        if (propietarios.some(p => p.clienteId === cliente.id.toString())) {
            toast.warning('Este propietario ya está agregado');
            return;
        }
        const nuevosPropietarios = [...propietarios, {
            clienteId: cliente.id.toString(),
            nombre: cliente.nombre,
            email: cliente.email,
            porcentaje: 0,
            es_principal: propietarios.length === 0 // Primero es principal por defecto
        }];

        // Recalcular porcentajes automáticamente (Auto-Distribución)
        const total = nuevosPropietarios.length;
        const porcentajeBase = Math.floor((100 / total) * 100) / 100;
        const resto = 100 - (porcentajeBase * total);

        nuevosPropietarios.forEach((p, i) => {
            p.porcentaje = (i === 0 ? (porcentajeBase + resto).toFixed(2) : porcentajeBase.toFixed(2));
        });

        setPropietarios(nuevosPropietarios);
        setBusquedaCliente('');
        // Limpiar error al agregar
        setErrores(prev => {
            const nuevos = { ...prev };
            delete nuevos.propietarios;
            return nuevos;
        });
    };

    const eliminarPropietario = (index) => {
        const nuevos = [...propietarios];
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

        setPropietarios(nuevos);

        // Validar si quedó vacío
        if (nuevos.length === 0) {
            setErrores(prev => ({
                ...prev,
                propietarios: 'Debe haber al menos un propietario asignado'
            }));
        }
    };

    const handlePropietarioChange = (index, field, value) => {
        // Validación en tiempo real de porcentaje
        if (field === 'porcentaje') {
            const num = parseFloat(value);
            if (value !== '' && (isNaN(num) || num < 0 || num > 100)) {
                toast.error('El porcentaje debe estar entre 0 y 100', {
                    id: 'porcentaje-invalido',
                    duration: 2000
                });
                return; // No actualizar si es inválido
            }
        }

        setPropietarios(prev => {
            const nuevos = [...prev];
            if (field === 'es_principal') {
                if (value) nuevos.forEach((p, i) => p.es_principal = i === index);
            } else {
                nuevos[index][field] = value;
            }
            return nuevos;
        });
    };

    const filtrarClientes = () => {
        if (!busquedaCliente) return [];
        return clientes.filter(c =>
            c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
            c.email.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
            c.cedula?.includes(busquedaCliente)
        ).slice(0, 5);
    };

    // HANDLERS DOCUMENTOS (Refactored for Batch Save)
    const handleUploadDocumento = (e, tipo) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newDocs = files.map(file => ({
            file, // Store actual file object
            name: file.name,
            url: URL.createObjectURL(file), // Preview
            type: file.type,
            isNew: true
        }));

        setDocumentos(prev => ({
            ...prev,
            [tipo]: [...prev[tipo], ...newDocs]
        }));
    };

    const eliminarDocumento = (tipo, index) => {
        const docToDelete = documentos[tipo][index];

        // If it's an existing document (has ID), mark for deletion
        if (docToDelete.id) {
            setDocsAEliminar(prev => [...prev, docToDelete.id]);
        }

        // If it's a new document,revoke object URL to avoid leaks
        if (docToDelete.isNew && docToDelete.url) {
            URL.revokeObjectURL(docToDelete.url);
        }

        // Remove from UI state
        setDocumentos(prev => {
            const newByType = [...prev[tipo]];
            newByType.splice(index, 1);
            return { ...prev, [tipo]: newByType };
        });
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!datos.titulo?.trim()) nuevosErrores.titulo = obtenerMensajeErrorCampo('titulo');
        if (!datos.tipo_propiedad) nuevosErrores.tipo_propiedad = obtenerMensajeErrorCampo('tipo_propiedad');
        if (!datos.estado_propiedad) nuevosErrores.estado_propiedad = obtenerMensajeErrorCampo('estado_propiedad');
        if (!datos.transaccion) nuevosErrores.transaccion = obtenerMensajeErrorCampo('transaccion');
        if (!datos.precio || isNaN(Number(datos.precio)) || Number(datos.precio) <= 0) nuevosErrores.precio = obtenerMensajeErrorCampo('precio');
        if (!datos.direccion?.trim()) nuevosErrores.direccion = obtenerMensajeErrorCampo('direccion');
        if (!datos.ciudad?.trim()) nuevosErrores.ciudad = obtenerMensajeErrorCampo('ciudad');
        if (!datos.sector?.trim()) nuevosErrores.sector = obtenerMensajeErrorCampo('sector');
        if (!datos.provincia) nuevosErrores.provincia = obtenerMensajeErrorCampo('provincia');
        if (!datos.uso_propiedad) nuevosErrores.uso_propiedad = obtenerMensajeErrorCampo('uso_propiedad');
        if (!datos.area_terreno || Number(datos.area_terreno) <= 0) nuevosErrores.area_terreno = obtenerMensajeErrorCampo('area_terreno');
        if (usuario?.rol === 'admin' && !datos.agenteId) nuevosErrores.agenteId = obtenerMensajeErrorCampo('agenteId');
        if (imagenesActuales.length + imagenesNuevas.length === 0) nuevosErrores.imagenes = obtenerMensajeErrorCampo('imagenes');

        // Negocio Check
        if (!datos.comision || isNaN(Number(datos.comision)) || Number(datos.comision) < 0) nuevosErrores.comision = obtenerMensajeErrorCampo('comision');
        if (!datos.tipo_contrato) nuevosErrores.tipo_contrato = obtenerMensajeErrorCampo('tipo_contrato');
        if (!datos.fecha_captacion) nuevosErrores.fecha_captacion = obtenerMensajeErrorCampo('fecha_captacion');

        // Garantía (Alquiler) - Validación condicional mejorada
        if (datos.transaccion === 'alquiler') {
            if (!datos.valor_garantia || isNaN(Number(datos.valor_garantia)) || Number(datos.valor_garantia) < 0) {
                nuevosErrores.valor_garantia = obtenerMensajeErrorCampo('valor_garantia');
            }
        }

        // Validación de Propietarios
        if (propietarios.length === 0) {
            nuevosErrores.propietarios = 'Debe haber al menos un propietario asignado';
            toast.error('Debes asignar al menos un propietario', { id: 'error-propietarios' });
        } else {
            // Validar porcentajes individuales
            let hayPorcentajeInvalido = false;
            propietarios.forEach((prop, idx) => {
                const porcentaje = parseFloat(prop.porcentaje);
                if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
                    nuevosErrores.propietarios = `El porcentaje del propietario ${idx + 1} debe estar entre 0 y 100`;
                    toast.error(`Porcentaje inválido en propietario ${idx + 1}`, { id: 'error-propietarios' });
                    hayPorcentajeInvalido = true;
                }
            });

            if (!hayPorcentajeInvalido) {
                const sumaPorcentajes = propietarios.reduce((acc, curr) => acc + parseFloat(curr.porcentaje || 0), 0);
                if (Math.abs(sumaPorcentajes - 100) > 0.1) {
                    nuevosErrores.propietarios = `La suma de porcentajes debe ser exactamente 100% (Actual: ${sumaPorcentajes.toFixed(2)}%)`;
                    toast.error(`La suma de porcentajes debe ser 100% (Actual: ${sumaPorcentajes.toFixed(2)}%)`, { id: 'error-propietarios' });
                }
            }

            if (!propietarios.some(p => p.es_principal)) {
                nuevosErrores.propietarios = 'Debe marcar al menos un propietario como principal';
                toast.error('Debe marcar un propietario como principal', { id: 'error-propietarios' });
            }
        }

        // 🛡️ Validación de Documentos Obligatorios
        if (datos.tipo_contrato === 'exclusividad') {
            if (!documentos.contrato_exclusividad || documentos.contrato_exclusividad.length === 0) {
                nuevosErrores.documentos = 'El Contrato de Exclusividad es obligatorio para este tipo de contrato';
                toast.error('Debes subir el Contrato de Exclusividad', { id: 'error-documentos' });
            }
        } else {
            if (!documentos.autorizacion_venta || documentos.autorizacion_venta.length === 0) {
                nuevosErrores.documentos = 'La Autorización de Venta es obligatoria para contratos abiertos';
                toast.error('Debes subir la Autorización de Venta', { id: 'error-documentos' });
            }
        }

        return nuevosErrores;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        if (!datos) return;
        const nuevosErrores = validarFormulario();
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            toast.error('Por favor, corrige los errores en el formulario.', { id: 'error-validacion' });

            // Scroll automático al primer campo con error
            setTimeout(() => {
                const firstErrorField = document.querySelector('.border-red-500, [class*="border-red"]');
                if (firstErrorField) {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorField.focus();
                }
            }, 100);
            return;
        }
        const formData = new FormData();
        for (const key in datos) {
            // Excluir campos complejos que se manejan aparte
            if (['propietarios', 'imagenes', 'documentos', 'imagenesAEliminar'].includes(key)) continue;

            const valor = datos[key];
            if (valor !== '' && valor !== null && valor !== undefined) {
                formData.append(key, valor);
            }
        }
        imagenesNuevas.forEach(img => formData.append('imagenes', img));
        formData.append('propietarios', JSON.stringify(propietarios));
        imagenesAEliminar.forEach((id) => {
            formData.append('imagenesAEliminar[]', id);
        });

        try {
            // 1. Actualizar datos de la propiedad
            await axios.put(`http://localhost:3000/api/propiedades/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 2. Procesar ELIMINACIÓN de documentos en lote
            const deletePromises = docsAEliminar.map(docId =>
                axios.delete(`http://localhost:3000/api/documentos/propiedad/${docId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            // 3. Procesar SUBIDA de documentos nuevos en lote
            const uploadPromises = [];

            // Recorrer el estado 'documentos' buscando los que tienen isNew: true
            // Mapa de Claves de Estado -> Enum Backend
            const stateToEnum = {
                escritura: 'ESCRITURA',
                gravamenes: 'CERTIFICADO_GRAVAMEN',
                predial: 'PAGO_PREDIAL',
                planos: 'PLANO',
                ficha_catastral: 'FICHA_CATASTRAL',
                uso_suelo: 'CERTIFICADO_USO_SUELO',
                reglamento_ph: 'REGLAMENTO_PH',
                certificado_alicuota: 'CERTIFICADO_ALICUOTA',
                certificado_expensas: 'CERTIFICADO_EXPENSAS',
                planilla_luz: 'PLANILLA_LUZ',
                planilla_agua: 'PLANILLA_AGUA',
                planilla_alicuota: 'PLANILLA_ALICUOTA',
                contrato_exclusividad: 'CONTRATO_EXCLUSIVIDAD',
                autorizacion_venta: 'AUTORIZACION_VENTA',
                otros: 'OTRO',
                papeleta_votacion: 'PAPELETA_VOTACION',
                poder: 'PODER',
                hoja_vida: 'HOJA_VIDA',
                contrato: 'CONTRATO'
            };
            Object.entries(documentos).forEach(([tipoKey, docsArray]) => {
                const newFiles = docsArray.filter(d => d.isNew && d.file);
                if (newFiles.length > 0) {
                    const fd = new FormData();
                    newFiles.forEach(d => fd.append('documentos', d.file));

                    const tipoEnum = stateToEnum[tipoKey] || tipoKey.toUpperCase();
                    fd.append('tipo', tipoEnum);
                    fd.append('propiedadId', id);
                    // Mapping de categorías (simplificado, idealmente debería venir de un objeto config)
                    const categoria = obtenerCategoriaPorTipo(tipoKey);
                    fd.append('categoria', categoria);

                    uploadPromises.push(
                        axios.post(`http://localhost:3000/api/documentos/propiedad/${id}`, fd, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${token}`
                            }
                        })
                    );
                }
            });

            if (deletePromises.length > 0 || uploadPromises.length > 0) {
                toast.info('Sincronizando documentos...', { duration: 2000 });
                await Promise.all([...deletePromises, ...uploadPromises]);
            }

            toast.success('Propiedad actualizada correctamente');

            // Actualizar estado inicial para evitar alertas de cambios no guardados
            setInitialDatos(datos);
            isSavedRef.current = true;

            setTimeout(() => {
                navigate(usuario?.rol === 'admin' ? '/admin/panel-propiedades' : '/agente/panel-propiedades');
            }, 1000);
        } catch (error) {
            console.error('Error al actualizar propiedad:', error.response?.data);
            // Mostrar UN SOLO toast con resumen de errores del backend
            if (error.response?.data?.errores?.length) {
                const erroresBackend = error.response.data.errores;
                const nuevosErrores = {};

                erroresBackend.forEach(err => {
                    // Intentar extraer el nombre del campo del mensaje del backend
                    const match = err.match(/"(\w+)"/);
                    if (match && match[1]) {
                        nuevosErrores[match[1]] = err;
                    }
                });

                setErrores(nuevosErrores);

                // Toast único con resumen
                toast.error(
                    `Se ${erroresBackend.length === 1 ? 'encontró 1 error' : `encontraron ${erroresBackend.length} errores`} en el formulario. Revisa los campos marcados.`,
                    {
                        duration: 4000,
                        id: 'error-backend'
                    }
                );
            } else {
                toast.error(error.response?.data?.mensaje || 'Error al actualizar', { id: 'error-backend' });
            }
        }
    };

    if (!loading && usuario?.rol === 'agente' && datos && usuario.id !== datos.agenteId) {
        return (
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
        );
    }

    if (loading || !datos) return null;
    return (
        <div className="max-w-4xl mx-auto mt-10 mb-20">
            {/* Header Card */}
            {/* Header Card Premium */}
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden mb-8 border border-gray-100">
                <div className="px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                            <Building2 className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Editar Propiedad
                            </h2>
                            <p className="text-gray-500 mt-1 text-sm flex items-center gap-2">
                                <FolderCheck className="w-4 h-4" />
                                Gestión integral del inmueble
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:block text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-xs text-green-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Edición Activa
                        </div>
                        <p className="text-xs text-gray-400 mt-2">* Campos obligatorios marcados</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                <FormIdentificacion
                    datos={datos}
                    handleChange={handleChange}
                    errores={errores}
                    codigoPreview={datos.codigo_interno}
                />

                <FormUbicacion
                    datos={datos}
                    handleChange={handleChange}
                    errores={errores}
                    // Pass current location as mapCenter if it exists, so map centers on it
                    mapCenter={datos.latitud && datos.longitud ? { lat: Number(datos.latitud), lng: Number(datos.longitud) } : null}
                    handleMapChange={({ lat, lng }) => setDatos(prev => ({ ...prev, latitud: lat, longitud: lng }))}
                />

                <FormCaracteristicas
                    datos={datos}
                    handleChange={handleChange}
                    errores={errores}
                />

                <FormImagenes
                    datos={datos}
                    handleChange={handleChange}
                    errores={errores}
                    imagenes={imagenesNuevas}
                    setImagenes={(newImages) => {
                        setImagenesNuevas(newImages);
                        // Limpiar error si ya hay imágenes (nuevas o actuales)
                        if (errores.imagenes && (newImages.length + imagenesActuales.length) > 0) {
                            setErrores(prev => {
                                const nuevos = { ...prev };
                                delete nuevos.imagenes;
                                return nuevos;
                            });
                        }
                    }}
                    imagenesExistentes={imagenesActuales}
                    onDeleteExistente={eliminarImagenActual}
                />

                <FormNegocio
                    datos={{ ...datos, propietarios }} // FormNegocio espera propietarios dentro de datos
                    handleChange={handleChange}
                    errores={errores}
                    usuario={usuario}
                    agentes={agentes}
                    clientes={clientes}
                    busquedaCliente={busquedaCliente}
                    setBusquedaCliente={setBusquedaCliente}
                    filtrarClientes={filtrarClientes}
                    agregarPropietario={agregarPropietario}
                    handleRemovePropietario={eliminarPropietario}
                    handlePropietarioChange={handlePropietarioChange}
                />

                {/* DOCUMENTOS EN SU CAJA ESTILO REGISTRO */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FolderCheck className="w-6 h-6 text-orange-600" />
                        Documentación Legal y Técnica <span className="text-sm font-normal text-gray-500">(Privado)</span>
                    </h3>
                    <div className="w-full">
                        <DocumentManager
                            documentos={documentos}
                            onUpload={(e, tipo) => handleUploadDocumento(e, tipo)} // Adaptar firma
                            onDelete={eliminarDocumento}
                            tipoContrato={datos.tipo_contrato}
                            errores={errores}
                        />
                    </div>
                </section>


                <div className="flex flex-col md:flex-row gap-4 justify-center mt-12 pb-12">
                    <button
                        type="button"
                        className="px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold shadow-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleCancel}
                        ref={cancelarRef}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-12 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-700 hover:to-orange-600 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        <span>Guardar cambios</span>
                    </button>
                </div>
                {
                    blocker.state === 'blocked' && (
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
                    )
                }
            </form >
        </div >
    );
}
