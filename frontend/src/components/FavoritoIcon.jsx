import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export default function FavoritoIcon({ propiedadId, isFavorito = false, onToggle }) {
    const [favorito, setFavorito] = useState(isFavorito);
    const [pendiente, setPendiente] = useState(false); // evita doble-click, sin spinner
    const navigate = useNavigate();

    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token');
    const usuario = token ? JSON.parse(localStorage.getItem('usuario')) : null;

    useEffect(() => {
        setFavorito(isFavorito);
    }, [isFavorito]);

    const toggleFavorito = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Si no está autenticado, redirigir a login
        if (!token || !usuario) {
            toast.error('Debes iniciar sesión para guardar favoritos', { duration: 3000 });
            navigate('/login');
            return;
        }

        // Solo clientes pueden usar favoritos
        if (usuario.rol !== 'cliente') {
            toast.error('Solo los clientes pueden guardar favoritos', { duration: 3000 });
            return;
        }

        if (pendiente) return; // evitar doble-click
        setPendiente(true);

        // Actualización optimista: cambiar estado inmediatamente
        const nuevoEstado = !favorito;
        setFavorito(nuevoEstado);
        if (onToggle) onToggle(propiedadId, nuevoEstado);

        try {
            if (!nuevoEstado) {
                // Quitar de favoritos
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/favoritos`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { propiedadId }
                });
                toast.success('Propiedad removida de favoritos', { duration: 2000 });
            } else {
                // Agregar a favoritos
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/favoritos`,
                    { propiedadId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Propiedad agregada a favoritos', { duration: 2000 });
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error);
            // Revertir el estado optimista si falló
            setFavorito(!nuevoEstado);
            if (onToggle) onToggle(propiedadId, !nuevoEstado);
            toast.error('Error al manejar favorito. Intenta de nuevo.', { duration: 4000 });
        } finally {
            setPendiente(false);
        }
    };

    // Si no está autenticado, mostrar icono gris
    if (!token || !usuario || usuario.rol !== 'cliente') {
        return (
            <button
                onClick={toggleFavorito}
                className={`p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 z-10 ${onToggle ? '' : 'absolute top-3 right-3'}`} // Fallback position if not customized
                title="Inicia sesión para guardar favoritos"
            >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={toggleFavorito}
            disabled={pendiente}
            className={`p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
                favorito ? 'bg-red-500 hover:bg-red-600' : 'bg-white/80 backdrop-blur-sm hover:bg-white'
            } ${pendiente ? 'scale-90' : 'scale-100'} ${onToggle ? '' : 'absolute top-3 right-3'}`}
            title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
            <svg
                className={`w-5 h-5 transition-all duration-150 ${favorito ? 'text-white' : 'text-gray-600'}`}
                fill={favorito ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
    );
}
