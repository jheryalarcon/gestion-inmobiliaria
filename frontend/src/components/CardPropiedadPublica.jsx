import { Link } from 'react-router-dom';
import FavoritoIcon from './FavoritoIcon';

export default function CardPropiedadPublica({ propiedad, className = '', favoritos = [], onFavoritoToggle }) {
    const img = propiedad.imagenes?.[0]?.url
        ? propiedad.imagenes[0].url.startsWith('http')
            ? propiedad.imagenes[0].url
            : `http://localhost:3000${propiedad.imagenes[0].url}`
        : 'https://via.placeholder.com/300x200?text=Sin+Imagen';

    // Segunda imagen para efecto hover
    const img2 = propiedad.imagenes?.[1]?.url
        ? propiedad.imagenes[1].url.startsWith('http')
            ? propiedad.imagenes[1].url
            : `http://localhost:3000${propiedad.imagenes[1].url}`
        : null;

    // Verificar si la propiedad está en favoritos
    const isFavorito = favoritos.some(fav => fav.propiedadId === propiedad.id);

    // Función para ir al inicio de la página
    const handleCardClick = () => {
        window.scrollTo(0, 0);
    };

    // Calcular si la propiedad es reciente (menos de 7 días)
    const isRecent = propiedad.createdAt
        ? (new Date() - new Date(propiedad.createdAt)) / (1000 * 60 * 60 * 24) < 7
        : false;

    return (
        <div className={`${className} relative block bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group border border-gray-100 h-full flex flex-col`}>
            {/* Icono de favorito */}
            <div className="absolute top-3 right-3 z-20">
                <FavoritoIcon
                    propiedadId={propiedad.id}
                    isFavorito={isFavorito}
                    onToggle={onFavoritoToggle}
                />
            </div>

            <Link to={`/propiedad/${propiedad.id}`} className="block flex-grow flex flex-col" onClick={handleCardClick}>
                {/* Imagen - Altura reducida */}
                <div className="relative overflow-hidden bg-gray-100 h-48">
                    {/* Imagen Principal */}
                    <img
                        src={img}
                        alt={propiedad.titulo}
                        className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${img2 ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x264/4F46E5/FFFFFF?text=Sin+Imagen'; }}
                    />

                    {/* Segunda Imagen (Hover) */}
                    {img2 && (
                        <img
                            src={img2}
                            alt={`${propiedad.titulo} - Vista 2`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out scale-105"
                            style={{ objectFit: 'cover' }}
                        />
                    )}

                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"></div>

                    {/* Badge de Transacción - Más pequeño */}
                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md tracking-wider uppercase text-white ${propiedad.transaccion === 'venta' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}>
                        {propiedad.transaccion === 'venta' ? 'Venta' : 'Alquiler'}
                    </div>

                    {/* Badge de Recién Listado (Nuevo) */}
                    {isRecent && (
                        <div className="absolute top-3 left-[4.5rem] bg-orange-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md tracking-wider uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Reciente
                        </div>
                    )}

                    {/* Badge de Estado Físico (Si es nueva) */}
                    {propiedad.estado_fisico === 'nueva' && !isRecent && (
                        <div className="absolute top-3 left-[4.5rem] bg-blue-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md tracking-wider uppercase">
                            Nueva
                        </div>
                    )}

                    {/* Tipo de Propiedad - Badge compacto inferior */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-800 shadow-sm uppercase">
                        {propiedad.tipo_propiedad.replace('_', ' ')}
                    </div>
                </div>

                {/* Contenido Principal - Padding reducido */}
                <div className="p-4 flex flex-col flex-grow">
                    {/* Precio Principal - Texto ajustado y más grande */}
                    <div className="mb-1">
                        <p className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                            {Number(propiedad.precio).toLocaleString('es-EC', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}
                        </p>
                    </div>

                    {/* Título - Menos altura mínima */}
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug min-h-[3.5rem]">
                        {propiedad.titulo}
                    </h3>

                    {/* Ubicación: Sector + Ciudad */}
                    <div className="flex items-center mb-3 text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1 truncate font-medium">
                            {propiedad.sector ? `${propiedad.sector}, ` : ''}{propiedad.ciudad}, {propiedad.provincia?.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Características (Style Admin - Compacto) */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 px-1">
                        {/* Habitaciones */}
                        {propiedad.nro_habitaciones > 0 && (
                            <div className="flex items-center gap-1" title="Habitaciones">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10v9h2v-2h14v2h2v-9a2 2 0 00-2-2H5a2 2 0 00-2 2zM5 8a2 2 0 012-2h4a2 2 0 012 2v2H5V8z" />
                                </svg>
                                <span className="font-semibold">{propiedad.nro_habitaciones}</span>
                            </div>
                        )}

                        {/* Baños */}
                        {propiedad.nro_banos > 0 && (
                            <div className="flex items-center gap-1" title="Baños">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 14h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5zM6 14V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                                </svg>
                                <span className="font-semibold">{propiedad.nro_banos}</span>
                            </div>
                        )}

                        {/* Área */}
                        {((propiedad.area_construccion && Number(propiedad.area_construccion) > 0) || (propiedad.area_terreno && Number(propiedad.area_terreno) > 0)) && (
                            <div className="flex items-center gap-1" title="Área">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                <span className="font-semibold">
                                    {(propiedad.area_construccion && Number(propiedad.area_construccion) > 0)
                                        ? `${Number(propiedad.area_construccion).toLocaleString('es-EC')}m²`
                                        : `${Number(propiedad.area_terreno).toLocaleString('es-EC')}m²`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Footer: Botones de Acción - FUERA del Link para evitar <a> anidados */}
            <div className="mt-auto flex justify-between items-center pt-3 px-4 pb-4 border-t border-gray-100">
                {/* Botón WhatsApp */}
                <a
                    href={`https://wa.me/593981231304?text=${encodeURIComponent(`Hola, estoy interesado en información sobre la propiedad: ${propiedad.titulo}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Consultar por WhatsApp"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-xs font-bold">Info</span>
                </a>

                {/* Botón Ver Detalles */}
                <Link
                    to={`/propiedad/${propiedad.id}`}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-sm"
                >
                    Ver detalles
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
