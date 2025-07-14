const provincias = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
    'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
    'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
    'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua',
    'Zamora Chinchipe'
];

export default function SelectProvincia({ value, onChange }) {
    return (
        <select
            className="w-full border rounded px-3 py-2"
            value={value}
            onChange={onChange}
            required
        >
            <option value="">Selecciona una provincia</option>
            {provincias.map((prov) => (
                <option key={prov} value={prov.replace(/ /g, '_')}>
                    {prov}
                </option>
            ))}
        </select>
    );
}
