import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🔧 Fix para el ícono por defecto de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente para actualizar la vista del mapa dinámicamente
function ChangeView({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15); // Zoom un poco más cerca para ver detalle
        }
    }, [center, map]);
    return null;
}

const MapaSoloLectura = ({ lat, lng }) => {
    // Coordenadas por defecto (Ecuador) si no hay datos (aunque el componente padre ya filtra)
    const position = lat && lng ? [lat, lng] : [-1.8312, -78.1834];

    if (!lat || !lng) return null;

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 z-0">
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false} // Desactivar zoom con scroll para no molestar la navegación
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView center={position} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
            </MapContainer>
        </div>
    );
};

export default MapaSoloLectura;
