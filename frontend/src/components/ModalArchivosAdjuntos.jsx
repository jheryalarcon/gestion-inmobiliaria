import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
    Paperclip,
    X,
    UploadCloud,
    FileText,
    Image as ImageIcon,
    File,
    Download,
    Trash2,
    FileBadge,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import Spinner, { ButtonSpinner } from './Spinner';

const ModalArchivosAdjuntos = ({
    isOpen,
    onClose,
    negociacion,
    esAgenteResponsable,
    esAdmin
}) => {
    const [archivos, setArchivos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [tipoArchivo, setTipoArchivo] = useState('otros');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Obtener token
    const getToken = () => localStorage.getItem('token');

    // Cargar archivos
    const cargarArchivos = async () => {
        try {
            setCargando(true);
            const token = getToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/archivos-negociacion/negociacion/${negociacion.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setArchivos(data.archivos);
            } else {
                toast.error('Error al cargar los archivos');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar los archivos');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isOpen && negociacion) {
            cargarArchivos();
        }
    }, [isOpen, negociacion]);

    // Manejar Drag & Drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validarYSetearArchivo(e.dataTransfer.files[0]);
        }
    };

    const handleArchivoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validarYSetearArchivo(e.target.files[0]);
        }
    };

    const validarYSetearArchivo = (archivo) => {
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!tiposPermitidos.includes(archivo.type)) {
            toast.error('Formato no válido. Solo PDF, JPG y PNG');
            return;
        }
        if (archivo.size > 5 * 1024 * 1024) {
            toast.error('El archivo excede el límite de 5MB');
            return;
        }
        setArchivoSeleccionado(archivo);
    };

    // Subir archivo
    const confirmarSubida = async () => {
        if (!archivoSeleccionado) return;

        try {
            setSubiendo(true);
            const token = getToken();
            const formData = new FormData();
            formData.append('archivo', archivoSeleccionado);
            formData.append('negociacionId', negociacion.id);
            formData.append('tipo', tipoArchivo);

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/archivos-negociacion/subir`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                toast.success('Archivo subido correctamente');
                setArchivoSeleccionado(null);
                setTipoArchivo('otros');
                setMostrarFormulario(false); // Cerrar formulario tras éxito
                cargarArchivos();
            } else {
                const errorData = await response.json();
                toast.error(errorData.mensaje || 'Error al subir');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión al subir');
        } finally {
            setSubiendo(false);
        }
    };

    // Descargar
    const descargarArchivo = async (archivo) => {
        toast.promise(
            async () => {
                const token = getToken();
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/archivos-negociacion/descargar/${archivo.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Error descarga');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = archivo.nombre_archivo;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            {
                loading: 'Descargando...',
                success: 'Archivo descargado',
                error: 'Error al descargar el archivo'
            }
        );
    };

    // Helpers
    const formatearTamano = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
    };

    const getIconoArchivo = (tipo, mime) => {
        // Tipos específicos
        if (tipo === 'reserva') return <FileBadge className="w-6 h-6 text-purple-600" />;
        if (tipo === 'promesa') return <FileText className="w-6 h-6 text-blue-600" />;
        if (tipo === 'minuta') return <FileText className="w-6 h-6 text-emerald-600" />;
        if (tipo === 'pago') return <FileBadge className="w-6 h-6 text-amber-500" />;

        // Fallback por extensión
        if (mime?.includes('image')) return <ImageIcon className="w-6 h-6 text-gray-500" />;
        if (mime?.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
        return <File className="w-6 h-6 text-gray-400" />;
    };

    const getBadgeStyle = (tipo) => {
        switch (tipo) {
            case 'reserva': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'promesa': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'minuta': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pago': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                {/* Header Limpio */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Paperclip className="w-5 h-5" />
                            </span>
                            Gestión de Archivos
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 pl-9">
                            {negociacion?.cliente?.nombre} • {negociacion?.propiedad?.titulo}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    {/* Sección de Subida (Solo agentes/admin) */}
                    {(esAgenteResponsable || esAdmin) && (
                        <div className="mb-8">
                            {!mostrarFormulario ? (
                                <button
                                    onClick={() => setMostrarFormulario(true)}
                                    className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 text-indigo-600 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Subir nuevo documento
                                </button>
                            ) : (
                                <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <UploadCloud className="w-5 h-5 text-indigo-600" />
                                            Subir Nuevo Archivo
                                        </h4>
                                        <button onClick={() => setMostrarFormulario(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                                    </div>

                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleArchivoChange}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />

                                        {!archivoSeleccionado ? (
                                            <div className="space-y-3 pointer-events-none">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Argumenta o suelta tu archivo aquí</p>
                                                    <p className="text-xs text-gray-500 mt-1">Soporta PDF, JPG, PNG (Max 5MB)</p>
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="pointer-events-auto text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1.5 rounded border border-indigo-200 shadow-sm"
                                                >
                                                    Explorar Archivos
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 bg-indigo-50 p-3 rounded-lg text-left">
                                                <div className="p-2 bg-white rounded-md shadow-sm">
                                                    {getIconoArchivo('other', archivoSeleccionado.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{archivoSeleccionado.name}</p>
                                                    <p className="text-xs text-gray-500">{formatearTamano(archivoSeleccionado.size)}</p>
                                                </div>
                                                <button onClick={() => setArchivoSeleccionado(null)} className="text-gray-400 hover:text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {archivoSeleccionado && (
                                        <div className="mt-4 flex items-end gap-3 animate-in fade-in">
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Tipo de Documento</label>
                                                <select
                                                    value={tipoArchivo}
                                                    onChange={(e) => setTipoArchivo(e.target.value)}
                                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                                >
                                                    <option value="otros">📂 Otros Documentos</option>
                                                    <option value="reserva">🎟️ Contrato de Reserva</option>
                                                    <option value="promesa">🤝 Promesa Compraventa</option>
                                                    <option value="minuta">⚖️ Minuta / Escritura</option>
                                                    <option value="pago">💰 Comprobante de Pago</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={confirmarSubida}
                                                disabled={subiendo}
                                                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                                            >
                                                {subiendo ? <ButtonSpinner size="sm" color="white" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Confirmar Subida
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lista de Archivos */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Archivos Adjuntos ({archivos.length})
                            </h4>
                        </div>

                        {cargando ? (
                            <div className="py-12 flex justify-center">
                                <Spinner size="md" color="indigo" />
                            </div>
                        ) : archivos.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                    <File className="w-8 h-8" />
                                </div>
                                <h3 className="text-gray-900 font-medium text-sm">Sin documentos</h3>
                                <p className="text-xs text-gray-500 mt-1">Esta negociación aún no tiene archivos adjuntos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {archivos.map((archivo) => (
                                    <div key={archivo.id} className="group flex items-center p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all">
                                        {/* Icono */}
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                                            {getIconoArchivo(archivo.tipo, 'pdf')} {/* Simplificado para demo, idealmente usar mime real */}
                                        </div>

                                        {/* Info */}
                                        <div className="ml-4 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h5 className="text-sm font-semibold text-gray-900 truncate">
                                                    {archivo.nombre_archivo}
                                                </h5>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getBadgeStyle(archivo.tipo)}`}>
                                                    {archivo.tipo}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>{formatearTamano(archivo.tamano)}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>Subido por {archivo.agente?.name || 'Sistema'}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span>{new Date(archivo.fecha_subida).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-2 px-2">
                                            <button
                                                onClick={() => descargarArchivo(archivo)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Descargar"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalArchivosAdjuntos;
