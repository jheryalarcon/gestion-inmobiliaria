import { Link } from 'react-router-dom';
import { useState } from 'react';
import ModalActualizarEstado from './ModalActualizarEstado';
import ModalConfirmarEliminar from './ModalConfirmarEliminar';
import { obtenerUsuario } from '../utils/tokenUtils';

export default function CardPropiedad({ propiedad, onActualizarPropiedad }) {
    const img = propiedad.imagenes?.[0]?.url
        ? `http://localhost:3000${propiedad.imagenes[0].url}`
        : 'https://via.placeholder.com/300x200?text=Sin+Imagen';

    const usuario = obtenerUsuario();
    const puedeEditar = usuario?.rol === 'admin' || usuario?.id === propiedad.agenteId;

    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarEliminar, setMostrarEliminar] = useState(false);

    const obtenerEstiloEstado = (estado) => {
        switch (estado) {
            case 'disponible':
                return 'bg-green-100 text-green-800';
            case 'vendida':
                return 'bg-red-100 text-red-800';
            case 'arrendada':
                return 'bg-blue-100 text-blue-800';
            case 'reservada':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="border rounded shadow p-4 bg-white hover:shadow-lg transition relative">
            <img
                src={img}
                alt={propiedad.titulo}
                className="h-48 w-full object-cover rounded mb-3"
            />

            <h3 className="text-lg font-semibold">{propiedad.titulo}</h3>
            <p className="text-sm text-gray-500">
                {propiedad.tipo_propiedad} - {propiedad.ciudad}
            </p>
            <p className="text-sm mt-1 font-medium text-green-700">
                {Number(propiedad.precio).toLocaleString('es-EC', {
                    style: 'currency',
                    currency: 'USD',
                })}
            </p>

            <div className="mt-3 flex justify-between items-center flex-wrap gap-2">
        <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${obtenerEstiloEstado(
                propiedad.estado_publicacion
            )}`}
        >
          {propiedad.estado_publicacion}
        </span>

                <div className="flex gap-2 items-center">
                    <Link
                        to={`/propiedad/${propiedad.id}`}
                        className="text-gray-700 hover:text-black text-xs border px-3 py-1 rounded shadow-sm hover:shadow transition"
                    >
                        👁
                    </Link>

                    {puedeEditar && (
                        <>
                            <Link
                                to={`/editar-propiedad/${propiedad.id}`}
                                className="text-blue-700 hover:text-blue-900 text-xs border border-blue-500 px-3 py-1 rounded shadow-sm hover:shadow transition"
                            >
                                ✏️
                            </Link>

                            <button
                                onClick={() => setMostrarModal(true)}
                                className="text-indigo-700 hover:text-indigo-900 text-xs border border-indigo-500 px-3 py-1 rounded shadow-sm hover:shadow transition cursor-pointer"
                            >
                                🌀
                            </button>
                        </>
                    )}

                    {usuario?.rol === 'admin' && (
                        <button
                            onClick={() => setMostrarEliminar(true)}
                            className="text-red-700 hover:text-red-900 text-xs border border-red-500 px-3 py-1 rounded shadow-sm hover:shadow transition cursor-pointer"
                        >
                            🗑
                        </button>
                    )}

                    {mostrarEliminar && (
                        <ModalConfirmarEliminar
                            propiedadId={propiedad.id}
                            onClose={() => setMostrarEliminar(false)}
                            onSuccess={() => window.location.reload()}
                        />
                    )}
                </div>
            </div>

            {mostrarModal && (
                <ModalActualizarEstado
                    propiedadId={propiedad.id}
                    estadoActual={propiedad.estado_publicacion}
                    onClose={() => setMostrarModal(false)}
                    onSuccess={(nuevoEstado) => {
                        console.log('Estado actualizado exitosamente:', nuevoEstado);
                        onActualizarPropiedad({ ...propiedad, estado_publicacion: nuevoEstado });
                        setMostrarModal(false);
                    }}
                />
            )}
        </div>
    );
}
