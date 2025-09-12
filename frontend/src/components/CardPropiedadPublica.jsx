import { Link } from 'react-router-dom';
import FavoritoIcon from './FavoritoIcon';

export default function CardPropiedadPublica({ propiedad, className = '', favoritos = [], onFavoritoToggle }) {
    const img = propiedad.imagenes?.[0]?.url
        ? propiedad.imagenes[0].url.startsWith('http') 
        ? propiedad.imagenes[0].url 
        : `http://localhost:3000${propiedad.imagenes[0].url}`
        : 'https://via.placeholder.com/300x200?text=Sin+Imagen';

    // Verificar si la propiedad está en favoritos
    const isFavorito = favoritos.some(fav => fav.propiedadId === propiedad.id);

    return (
        <div className={`${className} relative block bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-gray-200 h-full flex flex-col`}>
            {/* Icono de favorito */}
            <FavoritoIcon 
                propiedadId={propiedad.id}
                isFavorito={isFavorito}
                onToggle={onFavoritoToggle}
            />

            <Link to={`/propiedad/${propiedad.id}`} className="block">
                {/* Imagen con tamaño fijo */}
                <div className="relative overflow-hidden bg-gray-100">
                    <div className="w-full h-56 flex items-center justify-center">
                        <img
                            src={img}
                            alt={propiedad.titulo}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            style={{ 
                                minHeight: '224px',
                                maxHeight: '224px',
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x224/4F46E5/FFFFFF?text=Sin+Imagen';
                            }}
                        />
                    </div>
                    {/* Overlay sutil al hacer hover */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    {/* Badge de tipo de propiedad */}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-lg">
                        {propiedad.tipo_propiedad}
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
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

                    {/* Información adicional - se mantiene al final */}
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3 mt-auto">
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
