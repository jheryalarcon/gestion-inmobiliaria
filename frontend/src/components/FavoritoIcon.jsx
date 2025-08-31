import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

export default function FavoritoIcon({ propiedadId, isFavorito = false, onToggle }) {
    const [favorito, setFavorito] = useState(isFavorito);
    const [cargando, setCargando] = useState(false);
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
            toast.error('Debes iniciar sesión para guardar favoritos');
            navigate('/login');
            return;
        }

        // Solo clientes pueden usar favoritos
        if (usuario.rol !== 'cliente') {
            toast.error('Solo los clientes pueden guardar favoritos');
            return;
        }

        setCargando(true);

        try {
            if (favorito) {
                // Quitar de favoritos
                await axios.delete('http://localhost:3000/api/favoritos', {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { propiedadId }
                });
                setFavorito(false);
                toast.success('Propiedad removida de favoritos');
            } else {
                // Agregar a favoritos
                await axios.post('http://localhost:3000/api/favoritos', 
                    { propiedadId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFavorito(true);
                toast.success('Propiedad agregada a favoritos');
            }

            // Notificar al componente padre
            if (onToggle) {
                onToggle(propiedadId, !favorito);
            }
        } catch (error) {
            console.error('Error al manejar favorito:', error);
            
            if (error.response?.status === 200 && error.response?.data?.message === 'Ya está en favoritos.') {
                toast.info('Esta propiedad ya está en tus favoritos');
                setFavorito(true);
            } else {
                toast.error('Error al manejar favorito. Intenta de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    };

    // Si no está autenticado, mostrar icono gris
    if (!token || !usuario || usuario.rol !== 'cliente') {
        return (
            <button
                onClick={toggleFavorito}
                className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 z-10"
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
            disabled={cargando}
            className={`absolute top-3 left-3 p-2 rounded-full shadow-md transition-all duration-200 z-10 ${
                favorito 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white'
            } ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
            {cargando ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            ) : (
                <svg 
                    className={`w-5 h-5 ${favorito ? 'text-white' : 'text-gray-600'}`} 
                    fill={favorito ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )}
        </button>
    );
}
