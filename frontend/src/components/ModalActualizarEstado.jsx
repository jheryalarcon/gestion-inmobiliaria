import { useState } from 'react';
import axios from 'axios';
import { verificarToken } from '../utils/tokenUtils';

export default function ModalActualizarEstado({
                                                  propiedadId,
                                                  estadoActual,
                                                  onClose,
                                                  onSuccess
                                              }) {
    const [nuevoEstado, setNuevoEstado] = useState(estadoActual);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const tokenInfo = verificarToken();
    
    if (!tokenInfo.valido) {
        setMensaje(`Error de autenticación: ${tokenInfo.mensaje}`);
        return;
    }
    
    const token = localStorage.getItem('token');

    const estadosPermitidos = ['disponible', 'vendida', 'arrendada', 'reservada', 'inactiva'];

    const handleActualizar = async () => {
        console.log('Intentando actualizar estado:', { propiedadId, nuevoEstado, token: token ? 'Presente' : 'Ausente' });
        
        if (!estadosPermitidos.includes(nuevoEstado)) {
            setMensaje('Estado no válido.');
            return;
        }

        setCargando(true);
        try {
            console.log('Enviando petición a:', `http://localhost:3000/api/propiedades/${propiedadId}/estado`);
            console.log('Datos enviados:', { nuevoEstado });
            console.log('Headers:', { Authorization: `Bearer ${token}` });
            
            const response = await axios.patch(
                `http://localhost:3000/api/propiedades/${propiedadId}/estado`,
                { nuevoEstado },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Respuesta del servidor:', response.data);
            setMensaje('Estado actualizado correctamente');
            onSuccess(nuevoEstado);
            setTimeout(onClose, 1000); // autocierra el modal después de 1 segundo
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Status del error:', error.response?.status);
            console.error('Respuesta del error:', error.response?.data);
            console.error('Headers del error:', error.response?.headers);
            setMensaje(error.response?.data?.mensaje || 'Error al actualizar estado');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-100/60 to-blue-100/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                <h3 className="text-xl font-bold text-center text-indigo-700 mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">🌀</span> Cambiar estado de la propiedad
                </h3>

                <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg px-3 py-2 mb-4 shadow-sm text-sm cursor-pointer"
                >
                    {estadosPermitidos.map((estado) => (
                        <option key={estado} value={estado}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                    ))}
                </select>

                {mensaje && (
                    <p className={`text-sm text-center mb-3 font-medium ${
                        mensaje.includes('correctamente') ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {mensaje}
                    </p>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
                        disabled={cargando}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleActualizar}
                        disabled={cargando}
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition ${
                            cargando ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {cargando ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
