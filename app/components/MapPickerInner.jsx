import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const eventHandlers = {
    dragend(e) {
      const marker = e.target;
      if (marker != null) {
        setPosition(marker.getLatLng());
      }
    },
  };

  return position === null ? null : (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
    ></Marker>
  );
}

// Separate component to handle centering only when props change externally
function MapController({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom());
    }
  }, [lat, lng]);
  return null;
}

export default function MapPickerInner({ lat, lng, onChange }) {
  const [position, setPosition] = useState(lat && lng ? { lat, lng } : null);

  // Sync local position to parent
  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position]);

  // Sync parent props to local position (only if different)
  useEffect(() => {
    if (lat && lng) {
      const pLat = parseFloat(lat);
      const pLng = parseFloat(lng);
      if (!position || Math.abs(position.lat - pLat) > 0.00001 || Math.abs(position.lng - pLng) > 0.00001) {
        setPosition({ lat: pLat, lng: pLng });
      }
    }
  }, [lat, lng]);

  const initialCenter = position || { lat: -6.200000, lng: 106.816666 };

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner z-0">
      <MapContainer 
        center={initialCenter} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <MapController lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
