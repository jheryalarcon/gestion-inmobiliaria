import SelectTipoPropiedad from '../../SelectTipoPropiedad';

export default function FormIdentificacion({ datos, handleChange, errores, codigoPreview, tipoPropiedadOriginal }) {
    const tipoCambio = tipoPropiedadOriginal && datos.tipo_propiedad && tipoPropiedadOriginal !== datos.tipo_propiedad;
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
                    Identificacion de la Propiedad
                </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CODIGO INTERNO (Autogenerado) */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Codigo Interno</label>
                    <input
                        type="text"
                        disabled
                        value={codigoPreview || "Se generara automaticamente"}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 font-mono shadow-sm cursor-not-allowed font-bold"
                        placeholder="Se generara automaticamente"
                    />
                    {tipoCambio ? (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                            El codigo se recalculara al guardar con el prefijo correcto para el nuevo tipo.
                        </p>
                    ) : !codigoPreview && (
                        <p className="text-xs text-gray-400 mt-1">Este codigo es una estimacion. Se confirmara al guardar.</p>
                    )}
                </div>

                {/* TIPO DE OPERACION (Transaccion) */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Tipo de Operacion <span className="text-red-500">*</span></label>
                    <select
                        name="transaccion"
                        value={datos.transaccion}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.transaccion ? 'border-red-400' : 'border-gray-300'}`}
                    >
                        <option value="" disabled hidden>Seleccione operacion</option>
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                    </select>
                    {errores.transaccion && <p className="text-red-600 text-sm mt-1 font-medium">{errores.transaccion}</p>}
                </div>

                {/* TIPO DE PROPIEDAD */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Tipo de Propiedad <span className="text-red-500">*</span></label>
                    <SelectTipoPropiedad
                        value={datos.tipo_propiedad}
                        onChange={(e) => handleChange({ target: { name: 'tipo_propiedad', value: e.target.value } })}
                        error={errores.tipo_propiedad}
                    />
                </div>

                {/* USO DE PROPIEDAD */}
                <div>
                    <label className="block text-base font-semibold text-gray-800 mb-1">Uso de Propiedad <span className="text-red-500">*</span></label>
                    <select
                        name="uso_propiedad"
                        value={datos.uso_propiedad}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${errores.uso_propiedad ? 'border-red-400' : 'border-gray-300'}`}
                    >
                        <option value="" disabled hidden>Seleccione uso...</option>
                        <option value="residencial">Residencial</option>
                        <option value="comercial">Comercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="agricola">Agricola</option>
                        <option value="turistico">Turistico</option>
                        <option value="mixto">Mixto</option>
                    </select>
                    {errores.uso_propiedad && <p className="text-red-600 text-sm mt-1 font-medium">{errores.uso_propiedad}</p>}
                </div>
            </div>
        </section>
    );
}