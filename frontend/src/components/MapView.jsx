import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * A read-only map that displays a pin at a given lat/lng.
 * Props:
 *   lat       - latitude
 *   lng       - longitude
 *   address   - optional label for the popup
 *   zoom      - initial zoom level (default 14)
 *   className - optional height/width classes (default: h-64 w-full)
 */
export const MapView = ({ lat, lng, address, zoom = 14, className = 'h-64 w-full' }) => {
    if (!lat || !lng) {
        return (
            <div className={`${className} rounded-lg border border-border bg-muted flex items-center justify-center`}>
                <p className="text-sm text-muted-foreground">No coordinates available</p>
            </div>
        );
    }

    return (
        <div className={`${className} rounded-lg overflow-hidden border border-border`}>
            <MapContainer
                center={[lat, lng]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                dragging={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    {address && (
                        <Popup maxWidth={250}>
                            <p className="text-xs">{address}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {lat.toFixed(6)}, {lng.toFixed(6)}
                            </p>
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapView;
