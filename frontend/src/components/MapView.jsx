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
export const MapView = ({ lat, lng, address, zoom = 14, className = 'h-64 w-full', existingLands = [] }) => {
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
                <Marker position={[lat, lng]} zIndexOffset={1000}>
                    {address && (
                        <Popup maxWidth={250}>
                            <p className="text-xs font-bold text-primary mb-1">Pending Registration</p>
                            <p className="text-xs">{address}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {lat.toFixed(6)}, {lng.toFixed(6)}
                            </p>
                        </Popup>
                    )}
                </Marker>
                {existingLands.map((eland) => (
                    eland.location && eland.location.lat && eland.location.lng ? (
                        <Marker 
                            key={eland.id} 
                            position={[eland.location.lat, eland.location.lng]}
                            opacity={0.6}
                        >
                            <Popup maxWidth={250}>
                                <div className="p-1">
                                    <p className="text-xs font-bold text-destructive mb-1">Existing Verified Land</p>
                                    <p className="text-sm font-medium">{eland.title}</p>
                                    <p className="text-xs font-mono mt-1 w-full truncate border-t pt-1">PID: {eland.property_id || 'N/A'}</p>
                                    <a 
                                        href={`/explorer`} 
                                        className="text-primary hover:underline mt-2 block text-xs"
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        View details ↗
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
