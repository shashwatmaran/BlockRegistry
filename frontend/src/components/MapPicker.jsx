import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
// delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map clicks
function LocationMarker({ position, setPosition, onLocationSelect }) {
    useMapEvents({
        click(e) {
            const newPos = {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            };
            setPosition(newPos);

            // Reverse geocoding using Nominatim API (free)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
                .then(response => response.json())
                .then(data => {
                    const address = data.display_name || `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;

                    // Extract structured address details
                    const addressData = data.address || {};

                    onLocationSelect({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        address: address,
                        // Extract location details from Nominatim response
                        country: addressData.country || '',
                        state: addressData.state || addressData.province || addressData.region || '',
                        city: addressData.city || addressData.town || addressData.village || addressData.municipality || '',
                        postcode: addressData.postcode || '',
                    });
                })
                .catch(error => {
                    console.error('Geocoding error:', error);
                    onLocationSelect({
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        address: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`,
                        country: '',
                        state: '',
                        city: '',
                        postcode: '',
                    });
                });
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export const MapPicker = ({ onLocationSelect, initialPosition = null }) => {
    const [position, setPosition] = useState(initialPosition || { lat: 20.5937, lng: 78.9629 }); // Default: India center
    const mapRef = useRef(null);

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
            {/* Instructions overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-border">
                <p className="text-sm font-medium text-center">
                    Click on the map to select property location
                </p>
            </div>

            <MapContainer
                center={[position.lat, position.lng]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                {/* OpenStreetMap tiles - completely free */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>

            {/* Selected coordinates display */}
            {position && (
                <div className="absolute bottom-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border">
                    <p className="text-xs font-mono text-muted-foreground">
                        {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
};
