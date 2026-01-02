import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Spinner from './Spinner';

const ArchivosAdjuntos = ({ negociacionId, esAgenteResponsable, esAdmin }) => {
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
            const response = await fetch(`http://localhost:3000/api/archivos-negociacion/negociacion/${negociacionId}`, {
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
        cargarArchivos();
    }, [negociacionId]);

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
            formData.append('negociacionId', negociacionId);
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
                const error = await response.json();
                toast.error(error.error || 'Error al subir el archivo');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al subir el archivo');
        } finally {
            setSubiendo(false);
        }
    };

    // Descargar archivo
    const descargarArchivo = async (archivoId, nombreArchivo) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3000/api/archivos-negociacion/descargar/${archivoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = nombreArchivo;
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

    // Formatear tamaño de archivo
    const formatearTamano = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    // Obtener icono según tipo de archivo
    const obtenerIcono = (tipo) => {
        switch (tipo) {
            case 'contrato': return '📄';
            case 'cedula': return '🆔';
            default: return '📎';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    📎 Archivos Adjuntos por Negociación
                </h3>
                {esAgenteResponsable && (
                    <button
                        onClick={() => setMostrarFormulario(!mostrarFormulario)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {mostrarFormulario ? '❌ Cancelar' : '📤 Subir Archivo'}
                    </button>
                )}
            </div>

            {/* Información de permisos */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-blue-800 text-sm">
                    📌 Solo visibles para el agente responsable y el administrador
                </p>
            </div>

            {/* Formulario de subida */}
            {mostrarFormulario && esAgenteResponsable && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">📤 Subir nuevo archivo:</h4>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                📁 Seleccionar archivo:
                            </label>
                            <input
                                type="file"
                                onChange={handleArchivoChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                📌 Tipo de archivo:
                            </label>
                            <select
                                value={tipoArchivo}
                                onChange={(e) => setTipoArchivo(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="contrato">Contrato</option>
                                <option value="cedula">Cédula</option>
                                <option value="otros">Otros</option>
                            </select>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleSubirClick}
                                disabled={!archivoSeleccionado || subiendo}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {subiendo ? '⏳ Subiendo...' : '💾 Subir archivo'}
                            </button>
                            <button
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setArchivoSeleccionado(null);
                                    setTipoArchivo('otros');
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de archivos */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800">📂 Archivos subidos:</h4>

                {cargando ? (
                    <div className="text-center py-8">
                        <Spinner color="blue" />
                        <p className="text-gray-600 mt-2">Cargando archivos...</p>
                    </div>
                ) : archivos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay archivos adjuntos aún</p>
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
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tamaño
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {archivos.map((archivo) => (
                                    <tr key={archivo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">
                                                    {obtenerIcono(archivo.tipo)}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {archivo.nombre_archivo}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {archivo.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearFecha(archivo.fecha_subida)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatearTamano(archivo.tamano)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => descargarArchivo(archivo.id, archivo.nombre_archivo)}
                                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                            >
                                                ⬇️ Descargar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de confirmación */}
            {mostrarConfirmacion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            📝 ¿Estás seguro de subir este archivo?
                        </h3>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Nombre:</strong> {archivoSeleccionado?.name}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Tipo:</strong> {tipoArchivo}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Tamaño:</strong> {formatearTamano(archivoSeleccionado?.size)}
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-yellow-800 text-sm">
                                ⚠️ Recuerda: Una vez subido, este archivo no podrá ser editado ni eliminado.
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={confirmarSubida}
                                disabled={subiendo}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {subiendo ? '⏳ Subiendo...' : '✅ Confirmar y subir'}
                            </button>
                            <button
                                onClick={() => setMostrarConfirmacion(false)}
                                disabled={subiendo}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchivosAdjuntos;
