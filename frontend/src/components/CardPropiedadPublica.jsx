import { Link } from 'react-router-dom';
import FavoritoIcon from './FavoritoIcon';

export default function CardPropiedadPublica({ propiedad, className = '', favoritos = [], onFavoritoToggle }) {
    const img = propiedad.imagenes?.[0]?.url
        ? `http://localhost:3000${propiedad.imagenes[0].url}`
        : 'https://via.placeholder.com/300x200?text=Sin+Imagen';

    // Verificar si la propiedad está en favoritos
    const isFavorito = favoritos.some(fav => fav.propiedadId === propiedad.id);

    return (
        <div className={`${className} relative block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105 group`}>
            {/* Icono de favorito */}
            <FavoritoIcon 
                propiedadId={propiedad.id}
                isFavorito={isFavorito}
                onToggle={onFavoritoToggle}
            />

            <Link to={`/propiedad/${propiedad.id}`} className="block">
                {/* Imagen */}
                <div className="relative overflow-hidden">
                    <img
                        src={img}
                        alt={propiedad.titulo}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay sutil al hacer hover */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    {/* Badge de tipo de propiedad */}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {propiedad.tipo_propiedad}
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {propiedad.titulo}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                        📍 {propiedad.ciudad}
                    </p>
                    
                    <p className="text-xl font-bold text-green-600 mb-3">
                        {Number(propiedad.precio).toLocaleString('es-EC', {
                            style: 'currency',
                            currency: 'USD',
                        })}
                    </p>

                    {/* Información adicional */}
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                        <span>Agente: {propiedad.agente?.name || 'No especificado'}</span>
                        <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                            Ver detalles →
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
