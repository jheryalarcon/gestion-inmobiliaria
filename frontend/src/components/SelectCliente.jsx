import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SelectCliente({ value, onChange, error }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const token = localStorage.getItem('token');
                // Fetch only active clients
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clientes?estado=activo`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Ajustar segun la estructura de respuesta (paginada vs array directo)
                const listaClientes = data.clientes || data;
                setClientes(Array.isArray(listaClientes) ? listaClientes : []);
            } catch (error) {
                console.error("Error cargando clientes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientes();
    }, []);

    const filteredClientes = clientes.filter(cliente => {
        const searchLower = searchTerm.toLowerCase();
        return (
            cliente.nombre.toLowerCase().includes(searchLower) ||
            cliente.email.toLowerCase().includes(searchLower) ||
            cliente.telefono.includes(searchTerm)
        );
    });

    return (
        <div className="relative">
            {/* Buscador simple integrado */}
            <input
                type="text"
                placeholder="Buscar cliente (nombre, email...)"
                className="w-full mb-2 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
                name="propietarioId"
                value={value}
                onChange={onChange}
                className={`w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${error ? 'border-red-400' : 'border-blue-100'}`}
                disabled={loading}
            >
                <option value="">Seleccione un propietario</option>
                {loading ? (
                    <option>Cargando clientes...</option>
                ) : (
                    filteredClientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} - {cliente.email}
                        </option>
                    ))
                )}
            </select>
            {/* Mensaje si no hay resultados */}
            {!loading && searchTerm && filteredClientes.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">No se encontraron clientes con ese criterio.</p>
            )}
        </div>
    );
}
