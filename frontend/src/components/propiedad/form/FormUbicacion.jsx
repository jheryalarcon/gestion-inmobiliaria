import SelectProvincia from '../../SelectProvincia';
import MapaUbicacion from '../../MapaUbicacion';

// Solo permite caracteres validos para coordenadas: digitos, signo negativo al inicio y punto decimal
const handleCoordChange = (name, value, handleChange) => {
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
        handleChange({ target: { name, value } });
    }
};

export default function FormUbicacion({ datos, handleChange, errores, mapCenter, handleMapChange }) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                    Ubicacion Geografica
                </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PROVINCIA */}
                <div data-field="provincia">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Provincia <span className="text-red-500">*</span></label>
                    <SelectProvincia
                        value={datos.provincia}
                        onChange={(e) => handleChange({ target: { name: 'provincia', value: e.target.value } })}
                        error={errores.provincia}
                    />
                </div>

                {/* CIUDAD */}
                <div data-field="ciudad">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Ciudad <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="ciudad"
                        value={datos.ciudad ?? ''}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.ciudad ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="Ej: Santo Domingo"
                    />
                    {errores.ciudad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.ciudad}</p>}
                </div>

                {/* SECTOR / BARRIO */}
                <div data-field="sector">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Sector / Barrio <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="sector"
                        value={datos.sector ?? ''}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.sector ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="Ej: Urb. Ciudad Verde"
                    />
                    {errores.sector && <p className="text-red-600 text-sm mt-1 font-medium">{errores.sector}</p>}
                </div>

                {/* DIRECCION */}
                <div className="md:col-span-2" data-field="direccion">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Direccion exacta <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="direccion"
                        value={datos.direccion ?? ''}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.direccion ? 'border-red-400' : 'border-gray-300'}`}
                        placeholder="Ej: Calle Rio Toachi y Av. Tsachila, Mz B - Villa 12"
                    />
                    {errores.direccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.direccion}</p>}
                </div>

                {/* REFERENCIA */}
                <div className="md:col-span-2">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Referencia</label>
                    <input
                        type="text"
                        name="referencia"
                        value={datos.referencia ?? ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition border-gray-300"
                        placeholder="Ej: A 3 minutos del redondel del Colorado, frente al parque del sector"
                    />
                </div>

                {/* LATITUD */}
                <div data-field="latitud">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Latitud</label>
                    <input
                        type="text"
                        name="latitud"
                        value={datos.latitud ?? ''}
                        onChange={(e) => handleCoordChange('latitud', e.target.value, handleChange)}
                        inputMode="decimal"
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.latitud ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'}`}
                        placeholder="Ej: -0.252834"
                    />
                    <p className="text-xs text-gray-400 mt-1">Entre -90 y 90. Solo numeros decimales.</p>
                    {errores.latitud && <p className="text-red-600 text-sm mt-1 font-medium">{errores.latitud}</p>}
                </div>

                {/* LONGITUD */}
                <div data-field="longitud">
                    <label className="block text-base font-semibold text-gray-800 mb-1">Longitud</label>
                    <input
                        type="text"
                        name="longitud"
                        value={datos.longitud ?? ''}
                        onChange={(e) => handleCoordChange('longitud', e.target.value, handleChange)}
                        inputMode="decimal"
                        className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.longitud ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'}`}
                        placeholder="Ej: -79.169418"
                    />
                    <p className="text-xs text-gray-400 mt-1">Entre -180 y 180. Solo numeros decimales.</p>
                    {errores.longitud && <p className="text-red-600 text-sm mt-1 font-medium">{errores.longitud}</p>}
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