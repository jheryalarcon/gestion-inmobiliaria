import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Spinner from './Spinner';

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
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    // Obtener token del localStorage
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Cargar archivos existentes
    const cargarArchivos = async () => {
        try {
            setCargando(true);
            const token = getToken();
            const response = await fetch(`http://localhost:3000/api/archivos-negociacion/negociacion/${negociacion.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    // Manejar selección de archivo
    const handleArchivoChange = (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            // Validar tipo de archivo
            const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!tiposPermitidos.includes(archivo.type)) {
                toast.error('Solo se permiten archivos PDF, JPG y PNG');
                return;
            }

            // Validar tamaño (5MB)
            if (archivo.size > 5 * 1024 * 1024) {
                toast.error('El archivo no puede superar los 5MB');
                return;
            }

            setArchivoSeleccionado(archivo);
        }
    };

    // Mostrar confirmación antes de subir
    const handleSubirClick = () => {
        if (!archivoSeleccionado) {
            toast.error('Por favor selecciona un archivo');
            return;
        }
        setMostrarConfirmacion(true);
    };

    // Subir archivo confirmado
    const confirmarSubida = async () => {
        try {
            setSubiendo(true);
            const token = getToken();
            const formData = new FormData();
            formData.append('archivo', archivoSeleccionado);
            formData.append('negociacionId', negociacion.id);
            formData.append('tipo', tipoArchivo);

            const response = await fetch('http://localhost:3000/api/archivos-negociacion/subir', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                toast.success('Archivo subido correctamente');
                setArchivoSeleccionado(null);
                setTipoArchivo('otros');
                setMostrarFormulario(false);
                setMostrarConfirmacion(false);
                cargarArchivos(); // Recargar lista
            } else {
                const errorData = await response.json();
                toast.error(errorData.mensaje || 'Error al subir el archivo');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al subir el archivo');
        } finally {
            setSubiendo(false);
        }
    };

    // Descargar archivo
    const descargarArchivo = async (archivo) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3000/api/archivos-negociacion/descargar/${archivo.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = archivo.nombre_archivo;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                toast.error('Error al descargar el archivo');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al descargar el archivo');
        }
    };

    // Funciones auxiliares
    const formatearTamano = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    const getIconoArchivo = (tipo) => {
        switch (tipo) {
            case 'contrato': return '📄';
            case 'cedula': return '🆔';
            case 'otros': return '📎';
            default: return '📎';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                            <span className="text-2xl">📎</span>
                            Archivos Adjuntos
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {negociacion?.cliente?.nombre} - {negociacion?.propiedad?.titulo}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Botón para mostrar formulario de subida */}
                    {(esAgenteResponsable || esAdmin) && (
                        <div className="mb-6">
                            <button
                                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                                {mostrarFormulario ? '❌ Cancelar Subida' : '📤 Subir Nuevo Archivo'}
                            </button>
                        </div>
                    )}

                    {/* Formulario de subida */}
                    {mostrarFormulario && (esAgenteResponsable || esAdmin) && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                            <h4 className="font-semibold text-indigo-800 mb-3">Subir Nuevo Archivo</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seleccionar Archivo
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleArchivoChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Solo PDF, JPG, PNG. Máximo 5MB
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Archivo
                                    </label>
                                    <select
                                        value={tipoArchivo}
                                        onChange={(e) => setTipoArchivo(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="otros">Otros</option>
                                        <option value="contrato">Contrato</option>
                                        <option value="cedula">Cédula</option>
                                    </select>
                                </div>
                            </div>

                            {archivoSeleccionado && (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-gray-700">
                                        <strong>Archivo seleccionado:</strong> {archivoSeleccionado.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Tamaño: {formatearTamano(archivoSeleccionado.size)}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSubirClick}
                                disabled={!archivoSeleccionado || subiendo}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition duration-200 disabled:cursor-not-allowed"
                            >
                                {subiendo ? '⏳ Subiendo...' : '✅ Subir Archivo'}
                            </button>
                        </div>
                    )}

                    {/* Lista de archivos */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800">
                                Archivos Adjuntos ({archivos.length})
                            </h4>
                        </div>

                        {cargando ? (
                            <div className="p-8 text-center">
                                <Spinner size="md" text="Cargando archivos..." color="purple" />
                            </div>
                        ) : archivos.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No hay archivos adjuntos aún</p>
                                {(esAgenteResponsable || esAdmin) && (
                                    <p className="text-sm mt-2">Haz clic en "Subir Nuevo Archivo" para comenzar</p>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Archivo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tamaño
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {archivos.map((archivo) => (
                                            <tr key={archivo.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-2xl mr-3">
                                                            {getIconoArchivo(archivo.tipo)}
                                                        </span>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {archivo.nombre_archivo}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Subido por: {archivo.agente?.name || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoArchivoColor(archivo.tipo)}`}>
                                                        {getTipoArchivoText(archivo.tipo)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatearTamano(archivo.tamano)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatearFecha(archivo.fecha_subida)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => descargarArchivo(archivo)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition duration-200"
                                                        title="Descargar archivo"
                                                    >
                                                        📥 Descargar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de confirmación */}
                {mostrarConfirmacion && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                            <h3 className="text-xl font-bold text-center text-yellow-700 mb-4 flex items-center justify-center gap-2">
                                <span className="text-2xl">⚠️</span> Confirmar Subida
                            </h3>
                            <div className="text-gray-700 text-center mb-6">
                                <p className="mb-2"><strong>Importante:</strong> Una vez subido, el archivo no podrá ser editado ni eliminado.</p>
                                <p>¿Estás seguro de que quieres subir este archivo?</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setMostrarConfirmacion(false)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarSubida}
                                    disabled={subiendo}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition disabled:bg-gray-400"
                                >
                                    {subiendo ? 'Subiendo...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Funciones auxiliares
const getEtapaColor = (etapa) => {
    switch (etapa) {
        case 'interes': return 'bg-blue-100 text-blue-800';
        case 'negociacion': return 'bg-yellow-100 text-yellow-800';
        case 'cierre': return 'bg-orange-100 text-orange-800';
        case 'finalizada': return 'bg-green-100 text-green-800';
        case 'cancelada': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getEtapaText = (etapa) => {
    switch (etapa) {
        case 'interes': return 'Interés';
        case 'negociacion': return 'Negociación';
        case 'cierre': return 'Cierre';
        case 'finalizada': return 'Finalizada';
        case 'cancelada': return 'Cancelada';
        default: return etapa;
    }
};

const getTipoArchivoColor = (tipo) => {
    switch (tipo) {
        case 'contrato': return 'bg-emerald-100 text-emerald-800';
        case 'cedula': return 'bg-blue-100 text-blue-800';
        case 'otros': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getTipoArchivoText = (tipo) => {
    switch (tipo) {
        case 'contrato': return 'Contrato';
        case 'cedula': return 'Cédula';
        case 'otros': return 'Otros';
        default: return 'Otros';
    }
};

export default ModalArchivosAdjuntos;
