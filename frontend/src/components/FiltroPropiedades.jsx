import { useState, useEffect } from 'react';
import { Slider, Box, Typography, Button, TextField } from '@mui/material';

export default function FiltroPropiedades({ busqueda, setBusqueda, filtros, setFiltros }) {
    const [rangoPrecio, setRangoPrecio] = useState([0, 500000]);

    useEffect(() => {
        setFiltros(prev => ({
            ...prev,
            precioMin: rangoPrecio[0],
            precioMax: rangoPrecio[1]
        }));
    }, [rangoPrecio]);

    const handleRangoSlider = (_, newValue) => {
        setRangoPrecio(newValue);
    };

    const handleInputChange = (index, value) => {
        const nuevoRango = [...rangoPrecio];
        nuevoRango[index] = Number(value) || 0;
        setRangoPrecio(nuevoRango);
    };

    const handleReset = () => {
        setBusqueda('');
        setFiltros({ estado: '', tipo: '', ciudad: '', precioMin: 0, precioMax: 1000000 });
        setRangoPrecio([0, 500000]);
    };

    return (
        <Box className="bg-white p-4 rounded-md shadow mb-4 space-y-4">
            <div className="grid md:grid-cols-5 gap-3">
                <TextField
                    label="Buscar título"
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                <TextField
                    select
                    label="Estado"
                    size="small"
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                <option value="">Todos</option>
                    <option value="disponible">Disponible</option>
                    <option value="vendida">Vendida</option>
                    <option value="arrendada">Arrendada</option>
                    <option value="reservada">Reservada</option>
                </TextField>

                <TextField
                    select
                    label="Tipo"
                    size="small"
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                    value={filtros.tipo}
                    onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                >
                    <option value="">Todos</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="local_comercial">Local</option>
                    <option value="finca">Finca</option>
                    <option value="quinta">Quinta</option>
                </TextField>

                <TextField
                    label="Ciudad"
                    size="small"
                    variant="outlined"
                    fullWidth
                    value={filtros.ciudad}
                    onChange={(e) => setFiltros({ ...filtros, ciudad: e.target.value })}
                />

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleReset}
                    className="whitespace-nowrap"
                >
                    Limpiar filtros
                </Button>
            </div>

            {/* Precio */}
            <Box className="mt-2">
                <Typography variant="subtitle2" className="text-gray-700 font-medium">
                    Precio (USD)
                </Typography>

                <Box className="flex items-center gap-3 mt-2 ">
                    <TextField
                        size="small"
                        type="number"
                        label="Mínimo"
                        value={rangoPrecio[0]}
                        onChange={(e) => handleInputChange(0, e.target.value)}
                        inputProps={{ min: 0, step: 1000 }}
                    />
                    <span className="text-gray-500">—</span>
                    <TextField
                        size="small"
                        type="number"
                        label="Máximo"
                        value={rangoPrecio[1]}
                        onChange={(e) => handleInputChange(1, e.target.value)}
                        inputProps={{ min: 0, step: 1000 }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
