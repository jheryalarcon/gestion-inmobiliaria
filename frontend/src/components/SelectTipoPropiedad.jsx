export default function SelectTipoPropiedad({ value, onChange }) {
    const tipos = [
        'casa',
        'departamento',
        'terreno',
        'local_comercial',
        'finca',
        'quinta'
    ];

    return (
        <select
            name="tipo_propiedad"
            value={value}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            required
        >
            <option value="" disabled hidden>Selecciona tipo de propiedad</option>
            {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                </option>
            ))}
        </select>
    );
}
