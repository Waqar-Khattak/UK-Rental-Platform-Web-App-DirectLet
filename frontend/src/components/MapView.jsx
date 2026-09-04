// Map View Component - Display properties on OpenStreetMap using Leaflet

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapView({ properties }) {
  // Default center: London
  const defaultCenter = [51.505, -0.09];
  const validProperties = properties.filter(p => p.latitude && p.longitude);

  const center = validProperties.length > 0
    ? [validProperties[0].latitude, validProperties[0].longitude]
    : defaultCenter;

  return (
    <div className="map-view-container">
      <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%', borderRadius: '1rem' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validProperties.map((property) => (
          <Marker key={property.id} position={[property.latitude, property.longitude]}>
            <Popup>
              <div className="map-popup">
                <strong>{property.title}</strong>
                <p>£{property.rent}/month · {property.bedrooms} bed</p>
                <Link to={`/property/${property.id}`}>View Details</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {validProperties.length === 0 && (
        <p className="text-center text-muted mt-3">No properties with location data to display on map</p>
      )}
    </div>
  );
}

export default MapView;
