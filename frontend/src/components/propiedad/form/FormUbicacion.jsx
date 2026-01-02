import SelectProvincia from '../../SelectProvincia';
import MapaUbicacion from '../../MapaUbicacion';

export default function FormUbicacion({ datos, handleChange, errores, mapCenter, handleMapChange }) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                    Ubicación Geográfica
                </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PROVINCIA */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Provincia <span className="text-red-500">*</span></label>
                    <SelectProvincia
                        value={datos.provincia}
                        onChange={(e) => handleChange({ target: { name: 'provincia', value: e.target.value } })}
                        error={errores.provincia}
                    />
                </div>

                {/* CIUDAD */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Ciudad <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="ciudad"
                        value={datos.ciudad}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.ciudad ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="Ej: Santo Domingo"
                    />
                    {errores.ciudad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.ciudad}</p>}
                </div>

                {/* SECTOR / BARRIO */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Sector / Barrio <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="sector"
                        value={datos.sector}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.sector ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="Ej: Urb. Ciudad Verde"
                    />
                    {errores.sector && <p className="text-red-600 text-sm mt-1 font-medium">{errores.sector}</p>}
                </div>

                {/* DIRECCIÓN */}
                <div className="md:col-span-2">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Dirección exacta <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="direccion"
                        value={datos.direccion}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.direccion ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="Ej: Calle Río Toachi y Av. Tsáchila, Mz B – Villa 12"
                    />
                    {errores.direccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.direccion}</p>}
                </div>

                {/* REFERENCIA */}
                <div className="md:col-span-2">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Referencia</label>
                    <input
                        type="text"
                        name="referencia"
                        value={datos.referencia}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition border-gray-300"
                        placeholder="Ej: A 3 minutos del redondel del Colorado, frente al parque del sector"
                    />
                </div>

                {/* LATITUD */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Latitud</label>
                    <input
                        type="text"
                        name="latitud"
                        value={datos.latitud}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition border-gray-300"
                        placeholder="Ej: -0.252834"
                    />
                </div>
                {/* LONGITUD */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Longitud</label>
                    <input
                        type="text"
                        name="longitud"
                        value={datos.longitud}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition border-gray-300"
                        placeholder="Ej: -79.169418"
                    />
                </div>
            </div>
            {/* MAPA INTERACTIVO */}
            <div className="p-6 pt-0">
                <label className="block text-base font-semibold text-gray-800 mb-2">
                    Seleccionar en mapa
                    <span className="text-sm font-normal text-gray-500 ml-2">(Haz click en el mapa para ubicar la propiedad)</span>
                </label>
                <div className="rounded-lg overflow-hidden border border-gray-300">
                    <MapaUbicacion
                        lat={datos.latitud}
                        lng={datos.longitud}
                        onChange={handleMapChange}
                        externalCenter={mapCenter}
                    />
                </div>
            </div>
        </section>
    );
}
