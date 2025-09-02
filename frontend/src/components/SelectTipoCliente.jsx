import React from 'react';

const SelectTipoCliente = ({ value, onChange, error }) => {
    const tiposCliente = [
        { value: 'comprador', label: 'Comprador' },
        { value: 'arrendatario', label: 'Arrendatario' },
        { value: 'propietario', label: 'Propietario' },
        { value: 'vendedor', label: 'Vendedor' },
        { value: 'inversionista', label: 'Inversionista' },
        { value: 'consultor', label: 'Consultor' }
    ];

    return (
        <div>
            <select
                value={value}
                onChange={onChange}
                className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow-sm transition ${
                    error ? 'border-red-400' : 'border-blue-100'
                }`}
            >
                <option value="">Selecciona un tipo de cliente</option>
                {tiposCliente.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>}
        </div>
    );
};

export default SelectTipoCliente;
