import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import FiltroPropiedades from '../components/FiltroPropiedades';
import CardPropiedad from '../components/CardPropiedad';

export default function PanelPropiedades() {
    const [usuario, setUsuario] = useState(null);
    const [propiedades, setPropiedades] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtros, setFiltros] = useState({ estado: '', tipo: '', ciudad: '' });
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUsuario(decoded);

            axios.get('http://localhost:3000/api/propiedades', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(res => {
                    setPropiedades(res.data);
                    if (res.data.length === 0) setMensaje('No hay propiedades disponibles para mostrar.');
                })
                .catch(() => {
                    setMensaje('Error al cargar las propiedades.');
                });
        }
    }, []);

    const filtrar = (prop) => {
        const coincideBusqueda = prop.titulo.toLowerCase().includes(busqueda.toLowerCase());
        const coincideEstado = filtros.estado ? prop.estado_publicacion === filtros.estado : true;
        const coincideTipo = filtros.tipo ? prop.tipo_propiedad === filtros.tipo : true;
        const coincideCiudad = filtros.ciudad ? prop.ciudad.toLowerCase().includes(filtros.ciudad.toLowerCase()) : true;
        const coincidePrecio =
            (!filtros.precioMin || Number(prop.precio) >= filtros.precioMin) &&
            (!filtros.precioMax || Number(prop.precio) <= filtros.precioMax);

        return coincideBusqueda && coincideEstado && coincideTipo && coincideCiudad && coincidePrecio;
    };


    const propiedadesFiltradas = propiedades.filter(filtrar);

    const actualizarPropiedadLocal = (propiedadActualizada) => {
        console.log('Actualizando propiedad local:', propiedadActualizada);
        setPropiedades(prev => {
            const nuevasPropiedades = prev.map(p => p.id === propiedadActualizada.id ? propiedadActualizada : p);
            console.log('Propiedades actualizadas:', nuevasPropiedades.length);
            return nuevasPropiedades;
        });
    };


    return (
        <div className="max-w-6xl mx-auto mt-8 p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Mis Propiedades</h2>

            <FiltroPropiedades
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                filtros={filtros}
                setFiltros={setFiltros}
            />

            {mensaje && <p className="text-center text-red-600">{mensaje}</p>}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {propiedadesFiltradas.map((prop) => (
                    <CardPropiedad
                        key={prop.id}
                        propiedad={prop}
                        onActualizarPropiedad={actualizarPropiedadLocal}
                    />
                ))}
            </div>
        </div>
    );
}
