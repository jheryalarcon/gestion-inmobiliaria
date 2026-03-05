import { useState } from 'react';
import axios from 'axios';

export default function ModalConfirmarEliminar({ propiedadId, onClose, onSuccess }) {
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const token = localStorage.getItem('token');

    const handleEliminar = async () => {
        setCargando(true);
        setMensaje('');
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/propiedades/${propiedadId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMensaje('Propiedad eliminada correctamente.');
            setTimeout(() => {
                onSuccess(); // actualizar lista
                onClose();   // cerrar modal
            }, 1000);
        } catch (error) {
            console.error('Error al eliminar:', error);
            setMensaje(error.response?.data?.mensaje || 'Error al eliminar la propiedad');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-100/60 to-pink-100/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 transition-all duration-300">
                <h3 className="text-xl font-bold text-center text-red-700 mb-4 flex items-center justify-center gap-2">
                    <span className="text-2xl">🗑️</span> ¿Eliminar esta propiedad?
                </h3>

                <p className="text-sm text-gray-600 text-center mb-4">
                    Esta acción marcará la propiedad como <strong>inactiva</strong> y no se mostrará más en los listados.
                </p>

                {mensaje && (
                    <p className={`text-sm text-center mb-3 font-medium ${mensaje.includes('correctamente') ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {mensaje}
                    </p>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        disabled={cargando}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleEliminar}
                        disabled={cargando}
                        className={`bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition ${cargando ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {cargando ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
