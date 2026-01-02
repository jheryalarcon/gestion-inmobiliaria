export default function FormCaracteristicas({ datos, handleChange, errores }) {
    const amenities = [
        { name: 'tiene_balcon', label: 'Balcón' },
        { name: 'tiene_terraza', label: 'Terraza' },
        { name: 'tiene_patio', label: 'Patio' },
        { name: 'tiene_bodega', label: 'Bodega' },
        { name: 'tiene_area_bbq', label: 'Área BBQ' },
        { name: 'tiene_piscina', label: 'Piscina' },
        { name: 'tiene_ascensor', label: 'Ascensor' },
        { name: 'tiene_seguridad', label: 'Seguridad privada' },
        { name: 'tiene_areas_comunales', label: 'Áreas comunales' },
        { name: 'tiene_gas_centralizado', label: 'Gas centralizado' },
        { name: 'tiene_lavanderia', label: 'Lavandería' },
        { name: 'tiene_cisterna', label: 'Cisterna' },
        { name: 'amoblado', label: 'Amoblado' },
    ];

    return (
        <>
            {/* CARACTERÍSTICAS FÍSICAS */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                        Características Físicas
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ESTADO FÍSICO */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Estado Físico <span className="text-red-500">*</span></label>
                        <select
                            name="estado_propiedad"
                            value={datos.estado_propiedad}
                            onChange={handleChange}
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.estado_propiedad ? 'border-red-400' : 'border-gray-300'}`}
                        >
                            <option value="" disabled hidden>Seleccione...</option>
                            <option value="nueva">Nueva / A estrenar</option>
                            <option value="bueno">Buena</option>
                            <option value="regular">Regular</option>
                            <option value="por_remodelar">A remodelar</option>
                            <option value="en_construccion">En construcción</option>
                        </select>
                        {errores.estado_propiedad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.estado_propiedad}</p>}
                    </div>
                    {/* ÁREA TERRENO */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Área terreno <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="area_terreno"
                                value={datos.area_terreno}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.area_terreno ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Ej: 200"
                            />
                            <select
                                name="unidad_area_terreno"
                                value={datos.unidad_area_terreno}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm text-sm"
                            >
                                <option value="m2">m²</option>
                                <option value="ha">Ha</option>
                            </select>
                        </div>
                        {errores.area_terreno && <p className="text-red-600 text-sm mt-1 font-medium">{errores.area_terreno}</p>}
                    </div>

                    {/* CONSTRUCCIÓN */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Área construcción</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="area_construccion"
                                value={datos.area_construccion}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.area_construccion ? 'border-red-400' : 'border-gray-300'}`}
                                placeholder="Ej: 150"
                            />
                            <select
                                name="unidad_area_construccion"
                                value={datos.unidad_area_construccion}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm text-sm"
                            >
                                <option value="m2">m²</option>
                                <option value="ha">Ha</option>
                            </select>
                        </div>
                        {errores.area_construccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.area_construccion}</p>}
                    </div>
                    {/* HABITACIONES */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Número de habitaciones</label>
                        <input
                            type="number"
                            name="nro_habitaciones"
                            value={datos.nro_habitaciones}
                            onChange={handleChange}
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.nro_habitaciones ? 'border-red-400' : 'border-gray-300'}`}
                            placeholder="Ej: 3"
                        />
                        {errores.nro_habitaciones && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_habitaciones}</p>}
                    </div>
                    {/* BAÑOS */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Número de baños</label>
                        <input
                            type="number"
                            name="nro_banos"
                            value={datos.nro_banos}
                            onChange={handleChange}
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.nro_banos ? 'border-red-400' : 'border-gray-300'}`}
                            placeholder="Ej: 2"
                        />
                        {errores.nro_banos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_banos}</p>}
                    </div>
                    {/* PARQUEADEROS */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Número de parqueaderos</label>
                        <input
                            type="number"
                            name="nro_parqueaderos"
                            value={datos.nro_parqueaderos}
                            onChange={handleChange}
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.nro_parqueaderos ? 'border-red-400' : 'border-gray-300'}`}
                            placeholder="Ej: 1"
                        />
                        {errores.nro_parqueaderos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_parqueaderos}</p>}
                    </div>
                    {/* PISOS */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-1">Número de pisos</label>
                        <input
                            type="number"
                            name="nro_pisos"
                            value={datos.nro_pisos}
                            onChange={handleChange}
                            className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.nro_pisos ? 'border-red-400' : 'border-gray-300'}`}
                            placeholder="Ej: 2"
                        />
                        {errores.nro_pisos && <p className="text-red-600 text-sm mt-1 font-medium">{errores.nro_pisos}</p>}
                    </div>
                </div>
                {/* ORIENTACIÓN */}
                <div className="p-6 pt-0">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Orientación</label>
                    <input
                        type="text"
                        name="orientacion"
                        value={datos.orientacion}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition border-gray-300"
                        placeholder="Ej: Norte, Sur, Este..."
                    />
                </div>
            </section>

            {/* AMENITIES / CARACTERÍSTICAS ADICIONALES */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                        Amenities y Características
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {amenities.map((amenity) => (
                        <label key={amenity.name} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition">
                            <input
                                type="checkbox"
                                name={amenity.name}
                                checked={datos[amenity.name]}
                                onChange={handleChange}
                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-gray-700 font-medium">{amenity.label}</span>
                        </label>
                    ))}
                </div>
            </section>
        </>
    );
}
