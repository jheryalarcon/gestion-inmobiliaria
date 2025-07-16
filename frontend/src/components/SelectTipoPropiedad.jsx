export default function SelectTipoPropiedad({ value, onChange, error }) {
    const tipos = [
        'casa',
        'departamento',
        'terreno',
        'local_comercial',
        'finca',
        'quinta'
    ];

    return (
        <>
            <select
                name="tipo_propiedad"
                value={value}
                onChange={onChange}
                className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${error ? 'border-red-400' : 'border-blue-100'}`}
            >
                <option value="" disabled hidden>Selecciona tipo de propiedad</option>
                {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>}
        </>
    );
}
