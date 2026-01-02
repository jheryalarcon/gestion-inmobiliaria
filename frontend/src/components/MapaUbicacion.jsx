import { useState, useEffect } from 'react';
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

// Componente interno para manejar clics en el mapa
function LocationMarker({ position, setPosition, onChange }) {
    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            // Formatear a 6 decimales para limpieza
            onChange({
                lat: parseFloat(newPos.lat.toFixed(6)),
                lng: parseFloat(newPos.lng.toFixed(6))
            });

        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Componente para actualizar la vista del mapa dinámicamente
function ChangeView({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
}

const MapaUbicacion = ({ lat, lng, onChange, externalCenter }) => {
    // Coordenadas por defecto (Quito, Ecuador)
    const defaultCenter = { lat: -0.180653, lng: -78.467834 };

    // Estado local para el marcador
    const [position, setPosition] = useState(null);
    const [center, setCenter] = useState(defaultCenter);

    // Sincronizar props con estado interno (marcador)
    useEffect(() => {
        if (lat && lng) {
            const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
            setPosition(newPos);
        }
    }, [lat, lng]);

    // Efecto para escuchar cambios externos de centro (ej: filtro ciudad/provincia)
    useEffect(() => {
        if (externalCenter) {
            setCenter(externalCenter);
        }
    }, [externalCenter]);

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border-2 border-blue-100 z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onChange={onChange}
                />
            </MapContainer>
        </div>
    );
};

export default MapaUbicacion;
