import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { formatHarga } from '../hooks/UseProperties';
import { calculateMatchScore } from '../lib/Recommend';
import { useFilterStore } from '../store/FilterStore';
import 'leaflet/dist/leaflet.css';

// Fix icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const createCustomIcon = (score) => {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// ChangeView hanya set view sekali saat center berubah, bukan setiap render
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12, { animate: true });
  }, [map, center[0], center[1]]);
  return null;
}

export default function MapView({ properties }) {
  const navigate = useNavigate();
  const { filters } = useFilterStore();
  const jakartaCenter = [-6.2088, 106.8456];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-white/10 relative min-h-[500px]">
      <MapContainer center={jakartaCenter} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {properties.map((item) => {
          const score = calculateMatchScore(item, filters);
          
          // Menggunakan 'lat' dan 'lng' sesuai struktur tabel database
          if (!item.lat || !item.lng) return null;

          return (
            <Marker 
              key={item.id} 
              position={[item.lat, item.lng]} 
              icon={createCustomIcon(score)}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <h4 className="text-xs font-bold text-slate-900">{item.nama}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">{formatHarga(item.harga)}</p>
                  <button 
                    onClick={() => navigate(`/properti/${item.id}`)}
                    className="text-[9px] font-bold text-blue-600 mt-2 block"
                  >
                    Lihat Detail →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <ChangeView center={jakartaCenter} />
      </MapContainer>
    </div>
  );
}