import React from 'react';

const SelectTipoCliente = ({ value, onChange, error }) => {
    const tiposCliente = [
        { value: 'propietario', label: 'Propietario' },
        { value: 'comprador', label: 'Comprador' },
        { value: 'arrendatario', label: 'Arrendatario' },
        { value: 'inversionista', label: 'Inversionista' },
        { value: 'colega_inmobiliario', label: 'Colega Inmobiliario' },
        { value: 'prospecto', label: 'Prospecto (Lead)' }
    ];

    return (
        <div>
            <select
                value={value}
                onChange={onChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition ${error ? 'border-red-400' : 'border-gray-300'
                    }`}
            >
                <option value="">Selecciona un tipo de cliente</option>
                {tiposCliente.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
        </div>
    );
};

export default SelectTipoCliente;
