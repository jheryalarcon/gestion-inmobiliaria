export default function SelectTipoPropiedad({ value, onChange, error }) {
    const tipos = [
        { value: 'casa', label: 'Casa' },
        { value: 'departamento', label: 'Departamento' },
        { value: 'suite', label: 'Suite' },
        { value: 'local_comercial', label: 'Local Comercial' },
        { value: 'oficina', label: 'Oficina' },
        { value: 'bodega_galpon', label: 'Bodega / Galpón' },
        { value: 'edificio', label: 'Edificio' },
        { value: 'terreno', label: 'Terreno' },
        { value: 'finca', label: 'Finca' },
        { value: 'quinta', label: 'Quinta' }
    ];

    return (
        <>
            <select
                name="tipo_propiedad"
                value={value}
                onChange={onChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${error ? 'border-red-400' : 'border-gray-300'}`}
            >
                <option value="" disabled hidden>Selecciona tipo de propiedad</option>
                {tipos.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>}
        </>
    );
}
