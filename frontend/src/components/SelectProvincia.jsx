const provincias = [
    { label: 'Azuay', value: 'Azuay' },
    { label: 'Bolívar', value: 'Bolivar' },
    { label: 'Cañar', value: 'Canar' },
    { label: 'Carchi', value: 'Carchi' },
    { label: 'Chimborazo', value: 'Chimborazo' },
    { label: 'Cotopaxi', value: 'Cotopaxi' },
    { label: 'El Oro', value: 'El_Oro' },
    { label: 'Esmeraldas', value: 'Esmeraldas' },
    { label: 'Galápagos', value: 'Galapagos' },
    { label: 'Guayas', value: 'Guayas' },
    { label: 'Imbabura', value: 'Imbabura' },
    { label: 'Loja', value: 'Loja' },
    { label: 'Los Ríos', value: 'Los_Rios' },
    { label: 'Manabí', value: 'Manabi' },
    { label: 'Morona Santiago', value: 'Morona_Santiago' },
    { label: 'Napo', value: 'Napo' },
    { label: 'Orellana', value: 'Orellana' },
    { label: 'Pastaza', value: 'Pastaza' },
    { label: 'Pichincha', value: 'Pichincha' },
    { label: 'Santa Elena', value: 'Santa_Elena' },
    { label: 'Santo Domingo', value: 'Santo_Domingo' },
    { label: 'Sucumbíos', value: 'Sucumbios' },
    { label: 'Tungurahua', value: 'Tungurahua' },
    { label: 'Zamora Chinchipe', value: 'Zamora_Chinchipe' },
];

export default function SelectProvincia({ value, onChange, error }) {
    return (
        <>
            <select
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm transition ${error ? 'border-red-400' : 'border-gray-300'}`}
                value={value}
                onChange={onChange}
            >
                <option value="" disabled hidden>Seleccione una provincia</option>
                {provincias.map((prov) => (
                    <option key={prov.value} value={prov.value}>
                        {prov.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>}
        </>
    );
}
