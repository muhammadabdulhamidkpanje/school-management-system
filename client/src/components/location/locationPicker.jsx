import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function LocationMarker({ onLocationChange }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange({ latitude: lat, longitude: lng });
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }) {
  const defaultCenter = [latitude || 9.083, longitude || 7.533]; // fallback (Abuja)

  return (
    <div className="h-[300px] w-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <LocationMarker onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
