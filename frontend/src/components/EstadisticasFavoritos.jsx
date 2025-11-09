import React from 'react';

export default function EstadisticasFavoritos({ propiedades }) {
    if (!propiedades || propiedades.length === 0) {
        return null;
    }

    // Calcular estadísticas
    const totalPropiedades = propiedades.length;
    const tiposUnicos = [...new Set(propiedades.map(p => p.tipo_propiedad))];
    const ciudadesUnicas = [...new Set(propiedades.map(p => p.ciudad))];
    
    const precios = propiedades.map(p => Number(p.precio));
    const precioMinimo = Math.min(...precios);
    const precioMaximo = Math.max(...precios);
    const precioPromedio = precios.reduce((a, b) => a + b, 0) / precios.length;
    
    const tiposCount = {};
    propiedades.forEach(p => {
        tiposCount[p.tipo_propiedad] = (tiposCount[p.tipo_propiedad] || 0) + 1;
    });
    
    const tipoMasComun = Object.keys(tiposCount).reduce((a, b) => 
        tiposCount[a] > tiposCount[b] ? a : b
    );

    const formatearPrecio = (precio) => {
        return Number(precio).toLocaleString('es-EC', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Estadísticas de tus Favoritos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total de propiedades */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{totalPropiedades}</div>
                    <div className="text-sm text-blue-700 font-medium">Propiedades</div>
                    <div className="text-xs text-blue-600 mt-1">en favoritos</div>
                </div>

                {/* Tipos únicos */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">{tiposUnicos.length}</div>
                    <div className="text-sm text-green-700 font-medium">Tipos</div>
                    <div className="text-xs text-green-600 mt-1">diferentes</div>
                </div>

                {/* Ciudades únicas */}
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{ciudadesUnicas.length}</div>
                    <div className="text-sm text-purple-700 font-medium">Ciudades</div>
                    <div className="text-xs text-purple-600 mt-1">diferentes</div>
                </div>

                {/* Precio promedio */}
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                        {formatearPrecio(precioPromedio)}
                    </div>
                    <div className="text-sm text-orange-700 font-medium">Precio</div>
                    <div className="text-xs text-orange-600 mt-1">promedio</div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rango de precios */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Rango de Precios
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Mínimo:</span>
                            <span className="font-medium text-green-600">{formatearPrecio(precioMinimo)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Máximo:</span>
                            <span className="font-medium text-red-600">{formatearPrecio(precioMaximo)}</span>
                        </div>
                    </div>
                </div>

                {/* Tipo más común */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tipo Más Común
                    </h4>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{tipoMasComun}</span>
                        <span className="text-sm font-medium text-blue-600">
                            {tiposCount[tipoMasComun]} propiedades
                        </span>
                    </div>
                </div>
            </div>

            {/* Distribución por tipo */}
            {tiposUnicos.length > 1 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Distribución por Tipo</h4>
                    <div className="space-y-2">
                        {Object.entries(tiposCount).map(([tipo, cantidad]) => {
                            const porcentaje = ((cantidad / totalPropiedades) * 100).toFixed(1);
                            return (
                                <div key={tipo} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                        <span className="text-sm text-gray-700">{tipo}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full" 
                                                style={{ width: `${porcentaje}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 w-12 text-right">
                                            {cantidad} ({porcentaje}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}



















